# DAgger — Dataset Aggregation (Ross et al. 2011)

## 基本情報

- **論文**: Ross, Gordon, Bagnell, "A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning", AISTATS 2011
- **PDF**: https://www.cs.cmu.edu/~sross1/publications/Ross-AIStats11-NoRegret.pdf
- **実装**: https://imitation.readthedocs.io/en/latest/algorithms/dagger.html (HumanCompatibleAI/imitation)

## 背景: BC の問題

Behavioral Cloning (BC) は **(state, action)** ペアに対して supervised learning するだけなので、

- 学習分布は **expert の state 分布**
- 推論時は **学習した policy の state 分布**（BC 自身がミスして到達した状態を含む）

という **covariate shift**（分布ズレ）が起きる。1 ステップのミスが次ステップの分布を変え、誤差が累積的に爆発する（compound error）。

## DAgger アルゴリズム

```
D ← {}  # aggregated dataset
π_1 ← BC(expert trajectories)

for i = 1, 2, ..., N:
    # 1. 現方策で rollout してデータを集める
    trajectories ← rollout(π_i)
    # 2. 各状態で expert にクエリして "正解行動" を得る
    labels ← expert(trajectories.states)
    # 3. データセットに追加
    D ← D ∪ {(s, expert_a) for s in trajectories}
    # 4. 全データで再学習
    π_{i+1} ← supervised_train(D)

return best π_i
```

**キーポイント**: 学習方策で rollout することで、その方策が **実際に訪れる state 分布**を学習データに混ぜる → covariate shift を自動補正。

## 理論保証

- BC: ホライズン $T$ に対して誤差が $O(T^2 \epsilon)$ で累積
- DAgger: no-regret online learning reduction により $O(T \epsilon)$ に改善

## Orbit Wars への適用

### Expert の調達

Kaggle Simulation コンペでは生身の人間 expert を query することが現実的に不可能。DAgger の「expert」は以下で代替：

1. **強めのヒューリスティック bot**（orbital intercept 計算付きルールベース）
2. **自分の手元に置いた先行 BC policy + MCTS**（計算時間許容 ≫ 提出時）
3. **LB 上位 bot のリプレイから近傍検索**（k-NN で同様状態の expert action を再利用）

### 推奨ワークフロー

```
Day 1-5:  BC (cluster-04 / Halite IV 型 segmentation) で baseline
Day 6-10: DAgger で自 rollout → 強めの heuristic が推奨する action でラベル付け → BC 再訓練
          (2-3 iter で compound error が大きく減る実績)
Day 11+:  RL (PPO / HandyRL) で fine-tune、もしくは MCTS で補強
```

### 実務上の落とし穴

- **expert の質が天井**: DAgger の最終性能は expert を超えない。強いヒューリスティックを用意できるかが決定的
- **計算コスト**: iter 回すたびに rollout + 再学習が必要。iter 数は 3–5 で打ち切るのが現実的
- **オンライン DAgger vs バッチ DAgger**: Kaggle では提出時は完全に事前学習方策なので、DAgger は学習時のみ

## 発展形

- **DADAgger** (2023): 不確実性駆動でクエリを選択しコスト削減 — https://arxiv.org/abs/2301.01348
- **GAIL** (Ho & Ermon 2016): 敵対的識別器で expert 分布を学ぶ → expert action へのクエリ不要
- **SQIL / SoftQ Imitation**: Q 関数ベースで BC の stability を向上（MineRL で採用）

## 参考文献

- Ross et al. 2011: https://www.cs.cmu.edu/~sross1/publications/Ross-AIStats11-NoRegret.pdf
- imitation library docs: https://imitation.readthedocs.io/en/latest/algorithms/dagger.html
- DADAgger paper: https://arxiv.org/abs/2301.01348
