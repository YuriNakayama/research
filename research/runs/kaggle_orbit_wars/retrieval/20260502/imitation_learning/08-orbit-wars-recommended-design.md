# 08. Orbit Wars 模倣学習モデル — 推奨設計と段階的実装プラン

## TL;DR

**推奨アーキテクチャ**: Entity Transformer Encoder + Per-Planet Autoregressive Decoder (3-head: action_type → target → amount)

```
observation (planets, fleets, comets, scalars)
   ↓ Entity Transformer (3-layer, d_model=128)
per-planet contextualized embeddings
   ↓ for each my_planet p: planet_embed[p] as query
   ↓ Autoregressive 3-head decoder
   ├─ Head 1: action_type ∈ {NOOP, ATTACK}      (2-class)
   ├─ Head 2: target planet (Pointer over all planets given source+at)
   └─ Head 3: amount fraction ∈ {0%, 25%, 50%, 75%, 100%} (5-class)
```

**Loss**: Per-head cross entropy with class weighting & action_type masking
**Training**: Self-play replays from strong rule-based bot (10K games, 50M tuples)
**Hardware**: 1x A100 数十時間 / 1x T4 数日 で完結

## 1. アーキテクチャ詳細

### 1.1 Encoder

`docs/research/runs/kaggle_orbit_wars/retrieval/latest_rl_methods/04-entity-transformer-for-rts.md` の `EntityTransformer` をそのまま流用。

```python
class EntityTransformer(nn.Module):
    """既存実装を流用。3 modality をトークン化して Transformer encoder。"""
    def __init__(self, planet_dim=11, fleet_dim=8, global_dim=6, d_model=128, n_heads=4, n_layers=3):
        ...

    def forward(self, planets, planet_mask, fleets, fleet_mask, globals_):
        # Returns: tokens [B, 1+P+F, d_model], full_mask [B, 1+P+F]
        ...
```

**Orbit Wars 固有の追加**: 
- 4 重対称 augmentation を training pipeline に組み込み
- Comet の future position (3, 5, 10 step 先) を planet feature に追加

### 1.2 Per-Planet Autoregressive Decoder

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

AMOUNT_RATIOS = torch.tensor([0.0, 0.25, 0.5, 0.75, 1.0])
N_AMOUNT_BINS = 5
N_ACTION_TYPES = 2   # NOOP, ATTACK

class PointerHead(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.scale = d_model ** 0.5

    def forward(self, query, keys, mask):
        q = self.q_proj(query).unsqueeze(1)            # [B, 1, d]
        k = self.k_proj(keys)                           # [B, N, d]
        scores = (q * k).sum(-1) / self.scale          # [B, N]
        return scores.masked_fill(~mask, -1e9)


class PerPlanetAutoregressiveDecoder(nn.Module):
    def __init__(self, d_model=128):
        super().__init__()
        # Head 1
        self.action_type_head = nn.Sequential(
            nn.Linear(d_model, d_model), nn.ReLU(), nn.Linear(d_model, N_ACTION_TYPES)
        )
        self.action_type_emb = nn.Embedding(N_ACTION_TYPES, d_model)
        # Head 2
        self.target_pointer = PointerHead(d_model)
        self.target_proj = nn.Linear(d_model, d_model)
        # Head 3
        self.amount_head = nn.Sequential(
            nn.Linear(d_model, d_model), nn.ReLU(), nn.Linear(d_model, N_AMOUNT_BINS)
        )

    def forward(self, planet_embeds, all_planet_mask, my_planet_mask,
                gold_action_type=None, gold_target=None):
        """
        planet_embeds: [B, P, d_model]   per-planet contextualized embedding (encoder output)
        all_planet_mask: [B, P]           True where planet exists
        my_planet_mask: [B, P]            True where planet is mine
        gold_*: teacher forcing labels (training only); None at inference
        Returns dict of logits per planet:
            'action_type': [B, P, 2]
            'target':      [B, P, P]
            'amount':      [B, P, 5]
        Only positions in my_planet_mask are valid.
        """
        B, P, D = planet_embeds.shape

        # === Head 1: action_type ===
        h1 = planet_embeds                                  # [B, P, D]
        at_logits = self.action_type_head(h1)               # [B, P, 2]

        # Choose action_type for autoregressive context
        if gold_action_type is not None:
            at_choice = gold_action_type                    # [B, P]
        else:
            at_choice = at_logits.argmax(-1)                # [B, P]

        # === Head 2: target (only if ATTACK; we still compute logits for gradient) ===
        h2 = h1 + self.action_type_emb(at_choice)           # [B, P, D]
        # Pointer per-planet: query = h2[b, p], keys = planet_embeds[b]
        # Reshape: treat each (b, p) as independent query
        h2_flat = h2.view(B * P, D)                         # [B*P, D]
        keys_expanded = planet_embeds.unsqueeze(1).expand(B, P, P, D).reshape(B * P, P, D)
        mask_expanded = all_planet_mask.unsqueeze(1).expand(B, P, P).reshape(B * P, P)
        target_logits = self.target_pointer(h2_flat, keys_expanded, mask_expanded)  # [B*P, P]
        target_logits = target_logits.view(B, P, P)

        # Choose target for autoregressive context
        if gold_target is not None:
            tgt_choice = gold_target                        # [B, P]
        else:
            tgt_choice = target_logits.argmax(-1)           # [B, P]

        # Gather chosen target embeddings
        tgt_emb = planet_embeds.gather(
            1, tgt_choice.unsqueeze(-1).expand(-1, -1, D)
        )                                                   # [B, P, D]

        # === Head 3: amount ===
        h3 = h2 + self.target_proj(tgt_emb)                 # [B, P, D]
        amount_logits = self.amount_head(h3)                # [B, P, 5]

        return {
            "action_type": at_logits,
            "target": target_logits,
            "amount": amount_logits,
        }
```

**ポイント**:
- 全 my_planet を **batch 化して 1 forward** で処理（per-planet ループなし）
- Pointer は `[B*P, P]` の形に reshape して並列化
- 学習時は `gold_*` で teacher forcing、推論時は argmax (or sampling)

### 1.3 Loss 関数

```python
class OrbitWarsBCLoss(nn.Module):
    def __init__(self, action_type_weights=(1.0, 8.0), label_smoothing=0.1,
                 weight_at=1.0, weight_tgt=1.0, weight_amt=0.5,
                 weight_decay_lambda=1e-4):
        super().__init__()
        self.register_buffer("at_weight", torch.tensor(action_type_weights))
        self.label_smoothing = label_smoothing
        self.weight_at = weight_at
        self.weight_tgt = weight_tgt
        self.weight_amt = weight_amt
        self.wd_lambda = weight_decay_lambda

    def forward(self, logits, gold, my_planet_mask, model_params=None):
        """
        logits: dict from decoder forward
        gold: dict with keys 'action_type' [B,P], 'target' [B,P], 'amount' [B,P]
        my_planet_mask: [B, P]
        """
        # Flatten valid (my-planet) positions
        valid = my_planet_mask                              # [B, P]
        at_l   = logits["action_type"][valid]               # [N, 2]
        tgt_l  = logits["target"][valid]                    # [N, P]
        amt_l  = logits["amount"][valid]                    # [N, 5]
        gold_at  = gold["action_type"][valid]               # [N]
        gold_tgt = gold["target"][valid]                    # [N]
        gold_amt = gold["amount"][valid]                    # [N]

        # Action type loss (with class weight for imbalance)
        loss_at = F.cross_entropy(
            at_l, gold_at, weight=self.at_weight,
            label_smoothing=self.label_smoothing,
        )

        # Target & Amount: only ATTACK actions count
        attack_mask = (gold_at == 1)
        if attack_mask.any():
            loss_tgt = F.cross_entropy(
                tgt_l[attack_mask], gold_tgt[attack_mask],
                label_smoothing=self.label_smoothing,
            )
            loss_amt = F.cross_entropy(
                amt_l[attack_mask], gold_amt[attack_mask],
                label_smoothing=self.label_smoothing,
            )
        else:
            loss_tgt = torch.zeros((), device=at_l.device)
            loss_amt = torch.zeros((), device=at_l.device)

        loss = (
            self.weight_at  * loss_at +
            self.weight_tgt * loss_tgt +
            self.weight_amt * loss_amt
        )

        # Weight decay
        if model_params is not None:
            wd = sum(p.pow(2).sum() for p in model_params)
            loss = loss + self.wd_lambda * wd

        return loss, {"loss_at": loss_at.item(),
                      "loss_tgt": loss_tgt.item(),
                      "loss_amt": loss_amt.item()}
```

**設計判断**:
- `at_weight = (1.0, 8.0)` で NOOP/ATTACK の不均衡を補正（ATTACK が ~10% 想定）
- `label_smoothing=0.1` で overconfidence 抑制
- `weight_amt=0.5` (amount は誤差に robust)
- Target/Amount の loss は **ATTACK 時のみ** 計算

### 1.4 推論

```python
@torch.no_grad()
def infer_action(model, observation, temperature=0.8):
    encoded, full_mask = model.encoder(...)            # [B, 1+P+F, D]
    # planet 部分だけ取り出す
    planet_embeds = encoded[:, 1:1+P]                  # [B, P, D]
    
    logits = model.decoder(planet_embeds, all_mask, my_mask)
    
    # Sample with temperature
    at_probs = (logits["action_type"] / temperature).softmax(-1)
    at = torch.distributions.Categorical(at_probs).sample()
    
    # Re-run decoder with chosen at to get target
    # (or use the same pass since gold_action_type was None)
    # ... target sampling, amount sampling ...
    
    actions = []
    for b in range(B):
        for p in range(P):
            if not my_mask[b, p]:
                continue
            if at[b, p] == 0:    # NOOP
                continue
            target_p = sampled_target[b, p].item()
            ratio = AMOUNT_RATIOS[sampled_amount[b, p]].item()
            ships = int(ratio * planets[b, p].ships)
            if ships > 0:
                actions.append((p, target_p, ships))
    return actions
```

**Note**: 厳密な autoregressive sampling では action_type sample 後に再 forward で target_logits を計算する必要があるが、簡略実装としては argmax or top-k で代用可能。

## 2. データ収集

### 2.1 Expert: Strong Rule-based Bot

`docs/research/runs/kaggle_orbit_wars/retrieval/latest_heuristic_search/` の探索系 bot を expert 化:

```python
def expert_action(observation):
    """強い rule-based bot: 2 sec で MCTS or 評価関数で最善手を選ぶ"""
    return run_mcts(observation, time_limit=2.0)
```

### 2.2 Self-play パイプライン

```python
def collect_replay(n_games=10000):
    dataset = []
    for game_idx in range(n_games):
        env = make_env()
        obs = env.reset()
        while not done:
            action_p1 = expert_action(obs)
            action_p2 = expert_action(obs)   # 同じ expert の self-play (or 別 expert)
            
            # Record (obs, action) for player 1's perspective
            for p in my_planets:
                dataset.append({
                    "obs": obs.copy(),
                    "planet_id": p.id,
                    "action_type": action_p1[p].type,
                    "target": action_p1[p].target,
                    "amount_ratio": discretize_amount(action_p1[p].ships, p.ships),
                })
            
            obs, _, done, _ = env.step([action_p1, action_p2])
    return dataset
```

**目標規模**: 10,000 games × 500 turns × 10 my_planets ≈ 50M tuples

### 2.3 Augmentation（必須）

```python
def augment_obs(obs, k=None):
    """4 重対称 rotation で 4 倍データ"""
    if k is None:
        k = np.random.randint(0, 4)
    rotated = rotate_observation(obs, k * 90)
    return rotated

# Optional: random ships noise (±10%)
def add_ships_noise(obs, sigma=0.1):
    for p in obs.planets:
        p.ships *= np.random.normal(1.0, sigma)
        p.ships = max(0, int(p.ships))
    return obs
```

## 3. 段階的実装プラン

### Phase 1: Minimum Viable BC (2 週間)

- [ ] Entity Transformer encoder（既存設計流用）
- [ ] Per-Planet 3-head decoder（**autoregressive ではなく独立 head から始める**で OK、A/B 比較用 baseline）
- [ ] Self-play で 1,000 games の replay 収集
- [ ] Loss + train loop
- [ ] Submit して Kaggle leaderboard で baseline 評価

→ **expected**: rule-based bot より弱い可能性あり、しかし学習基盤を確立

### Phase 2: Autoregressive Decoder + Augmentation (1-2 週間)

- [ ] 独立 head → autoregressive head に切り替え
- [ ] 4 重対称 augmentation
- [ ] Class weight & label smoothing 導入
- [ ] Self-play replay を 10,000 games まで拡大

→ **expected**: rule-based bot と互角〜上回る

### Phase 3: 改良 (継続)

- [ ] Multi-expert データ + z-conditioning
- [ ] DAgger による distribution shift 緩和
- [ ] Hyperparameter tuning (W&B sweep)
- [ ] PPO fine-tuning（Phase 2 で BC 学習を初期化）

### 評価指標

各 phase で:
1. **Train/Val accuracy** (per-head): 学習が正しく進んでいるか
2. **vs rule-based bot win rate** (100 games): 実戦性能
3. **vs Kaggle leaderboard top-K** : 競技順位

## 4. 各設計判断の根拠（一覧）

| 判断 | 根拠 | 出典 |
|------|------|------|
| Entity Transformer encoder | StarCraft 等で実証 | AlphaStar |
| Autoregressive 3-head | source/target/amount の相関を学べる | AlphaStar Unplugged |
| Pointer for source/target | 可変 planet 数対応 | AlphaStar / Vinyals 2015 |
| Amount 5-bin fraction | Multi-modal 安定 + state-dep 上限自動考慮 | Kore 2022 / AlphaStar |
| Per-head CE loss | Argument 独立で gradient 計算可能 | AlphaStar Unplugged |
| Class weight (NOOP vs ATTACK) | 不均衡データ対策 | Action Space Shaping |
| Label smoothing 0.1 | Overconfidence 抑制 | Standard practice |
| Weight decay 1e-4 (dropout なし) | BC で dropout より効果的 | AlphaStar Unplugged |
| 4 重対称 augmentation | Map 対称性活用 | Kore 2022 (60% pixel mask) |
| Top-1 expert で開始 | Mode collapse 回避 | BC pitfalls |
| BC + 後で PPO | Sample efficiency | BeClone |

## 5. 参考: 完全な loss + decoder の動作確認スニペット

```python
# Smoke test
model = nn.ModuleDict({
    "encoder": EntityTransformer(),
    "decoder": PerPlanetAutoregressiveDecoder(d_model=128),
})
loss_fn = OrbitWarsBCLoss()

batch_size, P, F = 2, 15, 30
planets = torch.randn(batch_size, P, 11)
planet_mask = torch.ones(batch_size, P, dtype=torch.bool)
fleets = torch.randn(batch_size, F, 8)
fleet_mask = torch.ones(batch_size, F, dtype=torch.bool)
globals_ = torch.randn(batch_size, 6)
my_mask = torch.tensor([[True]*5 + [False]*10] * batch_size)

# Forward
encoded, full_mask = model["encoder"](planets, planet_mask, fleets, fleet_mask, globals_)
planet_embeds = encoded[:, 1:1+P]   # skip global token

# Teacher forcing labels
gold = {
    "action_type": torch.randint(0, 2, (batch_size, P)),
    "target": torch.randint(0, P, (batch_size, P)),
    "amount": torch.randint(0, 5, (batch_size, P)),
}
logits = model["decoder"](
    planet_embeds, planet_mask, my_mask,
    gold_action_type=gold["action_type"],
    gold_target=gold["target"],
)

loss, metrics = loss_fn(logits, gold, my_mask, model.parameters())
loss.backward()
print("loss:", loss.item(), metrics)
```

## 6. リスクと緩和策

| リスク | 確率 | 影響 | 緩和策 |
|-------|------|------|--------|
| BC が rule-based bot を超えない | 中 | 高 | Phase 3 で PPO fine-tune |
| Overfit (train>>val) | 高 | 中 | Augmentation 強化、weight decay 増 |
| 推論が actTimeout 1s 超過 | 低 | 高 | d_model 縮小、ONNX 化、CPU 最適化 |
| Mode collapse (常に NOOP) | 中 | 高 | Class weight, focal loss |
| 学習データ収集に時間がかかる | 中 | 中 | Expert を高速化（MCTS playout 削減） |

## 結論

**Orbit Wars の模倣学習モデルは、AlphaStar Unplugged 系の Entity Transformer + Per-Planet Autoregressive Decoder（3-head: action_type → target → amount）が最適**。

- Source 選択は per-planet decoding ループで暗黙的に行われる（各 my_planet を query にする）
- Target は pointer over all_planets
- Amount は 5-bin fraction discretization

実装は既存の `04-entity-transformer-for-rts.md` の構造をベースにし、policy head を **independent → autoregressive** に置換するだけで主要な改良は完了する。
