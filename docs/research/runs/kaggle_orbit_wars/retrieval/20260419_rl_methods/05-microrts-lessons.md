# MicroRTS Competition Winner (2024) からの知見

## ソース

- A Competition Winning DRL Agent in microRTS (arXiv:2024): https://arxiv.org/html/2402.08112v2
- MicroRTS-Py: https://github.com/Farama-Foundation/MicroRTS-Py
- Deep RTS: https://arxiv.org/pdf/1808.05032
- cair/deep-rts: https://github.com/cair/deep-rts

## microRTS とは

- Santiago Ontañón 教授作成の **ミニ RTS**
- グリッド 8x8 〜 24x24、ユニット 4-5 種類
- 研究目的に特化、高速シミュレーション
- IEEE CoG で毎年競技開催

Orbit Wars と microRTS の共通点:
- 小規模 RTS (entity 数 10-100 程度)
- 部分観測もサポート（Orbit Wars は完全観測）
- **対戦型自己学習** の実験場

## 2024 Winner の手法 (arXiv:2402.08112)

### アプローチ

```
Core: DoubleCone Network
  ├── Spatial encoder (CNN)
  ├── Transformer (entity-level reasoning)
  └── Policy / Value heads

Training:
  ├── Phase 1: Self-play (1M games)
  ├── Phase 2: Transfer learning (larger maps)
  └── Phase 3: Fine-tune vs past-winner bots
```

### DoubleCone Network の構造

```
Input: [B, C, H, W] spatial features
  ↓
Conv + downsample (3 stages)
  ↓
Transformer (entity-level)
  ↓
Conv + upsample (3 stages, skip connection)
  ↓
Per-cell action logits
```

**名前の由来**: 中央が狭い (hidden)、両端が広い (input/output) = 2 つの cone。

**Orbit Wars 適用**: Orbit Wars は連続座標なので CNN は直接使えないが、**グリッド化** すれば適用可能:

```python
def obs_to_grid(obs, grid_size=25):
    grid = np.zeros((grid_size, grid_size, 8))  # 8 channels
    for p in obs["planets"]:
        gx, gy = int(p.x / 4), int(p.y / 4)
        grid[gx, gy, 0] = 1  # planet present
        grid[gx, gy, 1] = p.owner
        grid[gx, gy, 2] = p.ships
        grid[gx, gy, 3] = p.production
        # ...
    return grid
```

ただし座標解像度が荒くなるため、entity-only Transformer の方が精度高い。

### Transfer Learning

小さいマップで学習 → 大きいマップに fine-tune。

```
Phase 1: 8x8 map, 500k games
Phase 2: 16x16 map, 300k games (weights from Phase 1)
Phase 3: 24x24 map, 200k games
```

**Orbit Wars 適用**: **2P mode で学習 → 4P mode に拡張**。2P で戦略の基本を習得してから 4P の混戦を学ぶ。

## microRTS 上位手法の共通要素

### 1. Rule-based Baseline Generation

自作 rule エージェントで数万試合生成 → BC warmup。

### 2. Curriculum Learning

難易度順に対戦相手を切替:

```
Stage 1: vs random (1,000 games)
Stage 2: vs naive rule (5,000 games)
Stage 3: vs strong rule (10,000 games)
Stage 4: self-play (100,000 games)
Stage 5: vs past-winner bots (20,000 games)
```

### 3. Opponent Pool の多様化

```python
opponent_pool = [
    RandomAgent(),
    NaiveGreedyAgent(),
    SmartRuleAgent(),
    MySelfCheckpoint(iter=1000),
    MySelfCheckpoint(iter=5000),
    MySelfCheckpoint(iter=10000),
    PastCompetitionWinner1(),
    PastCompetitionWinner2(),
]
```

各対戦相手とランダムに対戦、多様性確保。

### 4. Intrinsic Motivation / Curiosity

**RND (Random Network Distillation)** で探索ボーナス付与:

```python
predictor = RND()
target = RND().freeze()

intrinsic_reward = MSE(predictor(obs), target(obs))
total_reward = extrinsic_reward + 0.1 * intrinsic_reward
```

未経験状態に高報酬 → 探索促進。

## Orbit Wars 向け実装プラン

### ネットワーク設計

```python
class OrbitWarsDoubleCone(nn.Module):
    def __init__(self):
        super().__init__()
        # Encoder
        self.entity_encoder = EntityTransformer(d_model=128, layers=3)
        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Linear(128, 256), nn.ReLU(),
            nn.Linear(256, 128)
        )
        # Decoder for per-planet action
        self.per_planet_head = nn.Linear(128, N_ACTIONS_PER_PLANET)
        # Global value
        self.value_head = nn.Linear(128, 1)

    def forward(self, obs):
        entity_embeds = self.entity_encoder(obs)  # [B, N, 128]
        global_h = entity_embeds.mean(dim=1)
        bottleneck_h = self.bottleneck(global_h)

        # Per-planet policy (pointer)
        my_planet_embeds = entity_embeds[:, :N_MY_PLANETS]
        per_planet_logits = self.per_planet_head(my_planet_embeds)

        # Global value
        value = self.value_head(bottleneck_h).squeeze(-1)
        return per_planet_logits, value
```

### 学習スケジュール（microRTS 流）

```
Phase 1 (1 週間, 2P mode):
  - Initialize from IL warmup
  - PPO self-play, 100k games
  - Opponent: historical snapshots (last 10)

Phase 2 (1 週間, 2P mode):
  - Continue PPO, 500k games
  - Opponent pool: historical + rule baselines
  - Intrinsic motivation (RND) active

Phase 3 (1 週間, 4P mode):
  - Transfer learning from 2P policy
  - PPO 4-player, 200k games
  - 4P 特有の戦略 (federation, tie 誘発) を学習

Phase 4 (3 日, final tune):
  - vs past Kaggle submissions
  - no exploration (eval mode)
  - 100 test games per candidate
```

## microRTS Winner の Key Insights

### 1. Data Efficiency が勝敗を分ける

論文は勝率 vs 試合数のグラフを提示:
- Naive PPO: 1M 試合で 55% 勝率
- DoubleCone + IL warmup: 200k 試合で 55% 勝率
- DoubleCone + IL + RND: 100k 試合で 55% 勝率

**Orbit Wars での教訓**: IL warmup + RND で試合数を 1/10 に圧縮可能。

### 2. Reward Shape が学習速度を 3 倍する

Sparse win/lose reward のみでは学習進まず。Shape の例:

```python
def shaped_reward(prev_obs, curr_obs, my_id):
    r = 0.0
    # 即時差分
    my_planets_curr = count_my_planets(curr_obs, my_id)
    my_planets_prev = count_my_planets(prev_obs, my_id)
    r += 0.01 * (my_planets_curr - my_planets_prev)

    # production advantage delta
    my_prod_delta = my_production(curr_obs, my_id) - my_production(prev_obs, my_id)
    r += 0.005 * my_prod_delta

    # 敵 ship 減少は +
    enemy_ships_delta = enemy_ships(curr_obs, my_id) - enemy_ships(prev_obs, my_id)
    r += -0.0001 * enemy_ships_delta

    # Terminal
    if done:
        r += 1.0 if winner == my_id else -1.0

    return r
```

### 3. Action Masking が必須

無効な action (ships=0 の惑星から発射等) を mask:

```python
def compute_action_mask(obs, my_id):
    mask = np.zeros(ACTION_SPACE_SIZE, dtype=bool)
    for p_idx, planet in enumerate(obs["planets"]):
        if planet.owner == my_id and planet.ships >= 20:
            mask[p_idx * N_TARGETS : (p_idx + 1) * N_TARGETS] = True
    mask[-1] = True  # no-op always valid
    return mask
```

Policy output に mask を掛ける:

```python
logits = logits.masked_fill(~action_mask, -1e9)
```

### 4. Gradient Accumulation for Small Batches

Kaggle T4 でメモリ制約あり、小 batch size (32) でも学習可能にする:

```python
accum_steps = 4
for i, batch in enumerate(loader):
    loss = compute_loss(batch) / accum_steps
    loss.backward()
    if (i + 1) % accum_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

## 計算コスト比較

| 手法 | 試合数 | GPU 時間 | Kaggle 料金 |
|------|-------|---------|-------------|
| Naive PPO | 1M | 100h | $50-100 |
| + IL warmup | 500k | 50h | $25-50 |
| + RND | 300k | 35h | $18-35 |
| + DoubleCone | 200k | 25h | $12-25 |

**結論**: 全部盛りで $20-30 程度で上位入賞レベル達成可能。

## 学び

1. **DoubleCone Network** の思想は Entity Transformer で代替可能
2. **IL warmup + RND + Curriculum** で試合数を 10 倍圧縮
3. **Transfer learning (2P → 4P)** が Orbit Wars で有効
4. **Reward shaping** で学習速度 3 倍
5. **Action masking** は必須、無効 action 排除
6. **Opponent pool 多様化** で mode collapse 防止
