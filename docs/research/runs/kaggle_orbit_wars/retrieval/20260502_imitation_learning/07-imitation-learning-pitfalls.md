# 07. 模倣学習の落とし穴と対策

## ソース

- DAgger (Ross, Gordon, Bagnell 2011): Reduction of Imitation Learning to No-Regret Online Learning
- Imitation Learning in Continuous Action Spaces (mitigating compounding error): https://arxiv.org/html/2507.09061v1
- Diffusion Policy (Chi et al. 2023): https://diffusion-policy.cs.columbia.edu/
- BAGAIL (multi-modal IL from imbalanced demos): https://www.sciencedirect.com/science/article/abs/pii/S0893608024001758
- AlphaStar Unplugged: https://arxiv.org/abs/2308.03526
- BeClone (BC + RL): https://ceur-ws.org/Vol-3217/paper27.pdf

## 模倣学習 (Behavior Cloning) の典型的な失敗 5 種

### 1. Compounding Error (累積誤差)

**問題**: BC は「expert と同じ state で expert と同じ action」を学習。推論時に少しでも state が expert 分布から外れると、不慣れな state での予測が誤り、誤った action がさらに state を外れさせる。誤差が **累積的に発散**。

**理論**: Ross & Bagnell (2011) — BC の expected error は horizon T に対して **O(T²) で増大**（一方で DAgger は O(T)）。

**Orbit Wars 影響**: 1 ゲーム 500 ターンと長い → expert 分布外に行く確率が高い

**対策**:
- **DAgger**: agent の rollout で訪れた state に対して expert にラベリングしてもらい、データセットに追加して再学習。Orbit Wars では「強い rule-based bot」を expert にすればクエリは安価
- **データ多様化**: self-play で expert 同士を対戦させ、敗れた expert の苦境状態も学習データに入れる
- **Action chunking**: 1-step ではなく数 step 先の action 列を予測（Diffusion Policy 系）

### 2. Multi-modal Expert → Mode Collapse

**問題**: 異なる戦略の expert を混ぜて BC すると、policy は **平均的な action** を学習し、どの戦略にも整合しない弱い bot になる（mode averaging）。

**例**: Aggressive expert と Defensive expert を混ぜると、policy は中途半端な攻撃量を出して両戦略の利点を失う。

**対策**:
- **Expert ID conditioning (z-statistic)**: AlphaStar の手法。expert ID を policy の入力に加え、推論時は 1 つに固定
- **Diffusion Policy / GMM head**: amount 等の連続値出力を multi-modal 分布で表現
- **Top-1 expert のみ学習**: シンプルだが、データ量犠牲
- **Mixture of Experts (MoE)**: 各 expert ID に対応する head を持つ

**Orbit Wars 推奨**:
1. 最初は **top-1 strong rule-based bot** で完全模倣（mode 単一）
2. 性能向上後、複数戦略 expert を導入する場合は z-conditioning

### 3. Distribution Shift (Train/Test Gap)

**問題**: 学習時は expert state、推論時は agent state。state distribution が異なる。

**対策**:
- **Data augmentation**: 
  - 90°/180°/270° rotation（Orbit Wars は対称）
  - Random noise on planet ships (±10%)
  - Random masking of fleet info (10-20%)
  - **Kore 2022 で 60% pixel mask が劇的に効いた**
- **強い正則化**: weight decay 0.01、AlphaStar Unplugged は dropout より effective と報告

### 4. Class Imbalance (NOOP が大半)

**問題**: 多くのターンで多くの planet が **何もしない (NOOP)**。`P(NOOP) = 0.95, P(ATTACK) = 0.05` なら policy は常に NOOP と予測すれば 95% 精度を出すが、ゲームに負ける。

**対策**:
- **Class weight in cross entropy**:
  ```python
  weight = torch.tensor([1.0, 19.0])   # NOOP=1, ATTACK=19
  loss = F.cross_entropy(at_logits, gold_at, weight=weight)
  ```
- **Focal loss**: minority class により注力
  ```python
  loss = focal_loss(at_logits, gold_at, gamma=2.0, alpha=0.75)
  ```
- **ATTACK のみサンプリング**: NOOP データの一部だけ学習に使う
- **2-stage policy**: action_type は別 small model、ATTACK と判定された時だけ大 model で source/target/amount

### 5. Causal Confusion

**問題**: BC は spurious correlation を学習する。例えば「expert は damaged planet から ships を引き上げる」という挙動を BC が「damaged → withdraw」として学習するが、本当の因果は「敵接近 → withdraw」で damaged は副次的。テスト時に damaged でない damaged-looking 状況で誤動作。

**対策**:
- **Feature ablation**: 不要な feature を入れない
- **Causal-aware BC**: 専用論文あり (de Haan et al. 2019)
- 実用的には: **input feature を慎重に選ぶ + 強い正則化**

## DAgger (Dataset Aggregation) の Orbit Wars 適用

```
1. Initial dataset D_0 = {(s, π*(s)) | s ~ π* rollout}    # Expert rollout
2. Train π_1 on D_0 (BC)
3. Run π_1 in game, collect states s ~ π_1
4. Query expert: (s, π*(s)) for all s
5. D_1 = D_0 ∪ {(s, π*(s)) | s ~ π_1 rollout}
6. Retrain π_2 on D_1
7. Repeat
```

**Orbit Wars 利点**: 
- Expert = 強い rule-based bot なので、agent state を入力するだけで expert の action が即座に得られる（人間ラベリング不要）
- Self-play 環境で完全自動

**実装コスト**: 中（data pipeline と rule-based bot を準備すれば自動）

## Diffusion Policy (代替案)

Diffusion model で multi-modal action distribution を表現:
```
a = denoise(noisy_a, observation)
```

**メリット**: 
- Multi-modal expert に robust
- amount のような連続値も自然

**デメリット**:
- 推論コスト高（複数 denoising step）
- Orbit Wars の actTimeout 1s には厳しい
- discrete head との混在が複雑

→ **第 1 ラウンドでは採用せず、autoregressive softmax で十分**。性能不足時に検討。

## BC + RL fine-tuning (BeClone 系)

Phase 1: BC で base policy を学習（safe な初期化）
Phase 2: A2C / PPO で self-play fine-tune

**メリット**: BC 単独より強い、純 RL より sample efficient
**デメリット**: 実装複雑度 2 倍、reward shaping が必要

**Orbit Wars 段階的計画**:
1. **Phase A**: BC のみで実装（最初の 2-4 週間）
2. **Phase B**: BC ベースで PPO fine-tune（性能向上が頭打ちになったら）
3. AlphaStar Unplugged は Phase A だけで AlphaStar BC 越えを達成 → Phase A で十分強い可能性大

## Action Chunking の検討

Diffusion Policy で人気。1 step ずつではなく **k-step 先まで予測**:
```python
# π(a_t, a_{t+1}, ..., a_{t+k} | s_t)
```

**Orbit Wars 適合度**: 
- 観測がフルゲーム情報なので、複数 step 先を予測する強い動機が薄い
- 各ターン observation を完全に再評価するほうが軌道力学（comet 動き）に追従できる
- → **採用しない**（少なくとも初期は）

## まとめ表: Orbit Wars 向け対策プラン

| 落とし穴 | 第 1 段階対策 | 第 2 段階 |
|---------|------------|---------|
| Compounding error | Self-play data の多様化 | DAgger 導入 |
| Mode collapse | Top-1 expert で BC | z-conditioning または MoE |
| Distribution shift | 4 重対称 augmentation + weight decay | データ規模 ↑ |
| Class imbalance | Focal loss or class weight on action_type | 2-stage policy |
| Causal confusion | Feature 慎重選択 | Causal-aware BC 検討 |

**第 1 段階で外せない 3 つ**:
1. 4 重対称 data augmentation
2. action_type の class weight (NOOP vs ATTACK)
3. Top-1 strong rule-based bot で expert データ生成（multi-expert は後回し）
