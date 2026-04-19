# Entity Transformer for Orbit Wars Observation

## ソース

- AlphaStar 観測エンコーディング: Decipher blog
- Do We Need Transformers to Play FPS (arXiv:2504.17891)
- Transformer in Video Games: https://tsmatz.wordpress.com/2021/11/11/reinforcement-learning-visual-attention-in-minecraft/

## なぜ Entity Transformer か

Orbit Wars の観測は可変個の:
- **Planets** (5-40 個)
- **Fleets** (0-100 個)
- **Comets** (0-20 個)

従来の CNN (画像), MLP (固定 size) は直接適用困難。Transformer なら:
- 入力長可変 (padding + mask)
- Entity 間の相互作用 (attention)
- 対称性の扱い容易

## AlphaStar の設計（Nature 2019）

### 観測カテゴリ別エンコーダ

```
scalar features  → MLP → scalar_embed
entity features  → Transformer → entity_embeds
spatial features → CNN → spatial_embed

全て concat → LSTM (temporal) → policy / value heads
```

Orbit Wars には spatial feature がないので 2 つ目と 3 つ目を融合可能。

### Entity Transformer 構造

```
入力: N x d_entity
  N: 最大 entity 数 (例: 100)
  d_entity: per-entity feature dim (例: 16)

Layer 1: Linear(d_entity, d_model=128)
Layer 2-5: Multi-head Attention (4 head) + FFN
  - 各層後に LayerNorm

出力: N x d_model

Pooling: mean / sum / transformer [CLS]
```

## Orbit Wars 向けエンティティ定義

### Planet Entity

```python
def encode_planet(p, my_id, comet_ids, step, max_step):
    return [
        p.id / 100,                        # normalized id
        1 if p.owner == my_id else 0,      # is_mine
        1 if p.owner == -1 else 0,         # is_neutral
        1 if (p.owner != my_id and p.owner != -1) else 0,  # is_enemy
        p.x / 100,
        p.y / 100,
        p.radius / 3,
        p.ships / 500,
        p.production / 5,
        1 if p.id in comet_ids else 0,     # is_comet
        (max_step - step) / max_step,      # remaining game progress
    ]
# 11 dim
```

### Fleet Entity

```python
def encode_fleet(f, my_id, obs):
    return [
        1 if f.owner == my_id else 0,
        f.x / 100,
        f.y / 100,
        math.cos(f.angle),   # 角度は sin/cos で
        math.sin(f.angle),
        f.ships / 500,
        estimate_eta(f, obs) / 100,   # remaining travel time
        f.target_planet_id / 100 if hasattr(f, 'target_planet_id') else 0,
    ]
# 8 dim
```

### Global Scalar Features

```python
def encode_global(obs, my_id):
    my_planets = [p for p in obs["planets"] if p[1] == my_id]
    enemy_planets = [p for p in obs["planets"] if p[1] != my_id and p[1] != -1]
    return [
        obs["step"] / 500,
        len(my_planets) / 40,
        len(enemy_planets) / 40,
        sum(p.ships for p in my_planets) / 5000,
        sum(p.ships for p in enemy_planets) / 5000,
        obs["angular_velocity"] / 0.05,
    ]
# 6 dim
```

## 実装

### 基本版 (PPO 用 value/policy)

```python
import torch
import torch.nn as nn

class EntityTransformer(nn.Module):
    def __init__(self, planet_dim=11, fleet_dim=8, global_dim=6, d_model=128, n_heads=4, n_layers=3):
        super().__init__()
        self.planet_proj = nn.Linear(planet_dim, d_model)
        self.fleet_proj = nn.Linear(fleet_dim, d_model)
        self.global_proj = nn.Linear(global_dim, d_model)

        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(d_model, n_heads, batch_first=True),
            num_layers=n_layers
        )
        self.d_model = d_model

    def forward(self, planets, planet_mask, fleets, fleet_mask, globals_):
        # planets: [B, P, planet_dim], mask: [B, P] (True=valid)
        p_emb = self.planet_proj(planets)
        f_emb = self.fleet_proj(fleets)
        g_emb = self.global_proj(globals_).unsqueeze(1)  # [B, 1, d_model]

        # Global として前置
        tokens = torch.cat([g_emb, p_emb, f_emb], dim=1)
        # Mask: global 常に valid
        full_mask = torch.cat([
            torch.ones(planets.size(0), 1, dtype=torch.bool, device=planets.device),
            planet_mask,
            fleet_mask,
        ], dim=1)
        # Transformer は False で attention (convention 注意)
        attn_mask = ~full_mask
        out = self.transformer(tokens, src_key_padding_mask=attn_mask)
        # Pooling: masked mean
        mask_float = full_mask.unsqueeze(-1).float()
        pooled = (out * mask_float).sum(dim=1) / mask_float.sum(dim=1)
        return pooled
```

### Policy / Value Heads

```python
class PolicyHead(nn.Module):
    def __init__(self, d_model=128, n_planets=15, n_targets=15, n_frac=5):
        super().__init__()
        self.planet_head = nn.Linear(d_model, n_planets + 1)   # +1 no-op
        self.target_head = nn.Linear(d_model, n_targets)
        self.frac_head = nn.Linear(d_model, n_frac)

    def forward(self, h):
        return (
            self.planet_head(h),
            self.target_head(h),
            self.frac_head(h),
        )

class ValueHead(nn.Module):
    def __init__(self, d_model=128):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(d_model, d_model), nn.ReLU(), nn.Linear(d_model, 1)
        )
    def forward(self, h):
        return self.fc(h).squeeze(-1)
```

### 統合

```python
class OrbitWarsAgent(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = EntityTransformer()
        self.policy = PolicyHead()
        self.value = ValueHead()

    def forward(self, obs_batch):
        h = self.encoder(**obs_batch)
        policy_logits = self.policy(h)
        value = self.value(h)
        return policy_logits, value
```

## AlphaStar 式 Pointer Network (高度な action)

Action = 特定の entity を選ぶ場合、Pointer Network を使用。

```python
class PointerHead(nn.Module):
    """entity embedding から 1 個を選ぶ"""
    def __init__(self, d_model=128):
        super().__init__()
        self.query = nn.Linear(d_model, d_model)
        self.key = nn.Linear(d_model, d_model)

    def forward(self, global_h, entity_embeddings, entity_mask):
        q = self.query(global_h).unsqueeze(1)  # [B, 1, d_model]
        k = self.key(entity_embeddings)        # [B, N, d_model]
        scores = (q * k).sum(-1)              # [B, N]
        scores = scores.masked_fill(~entity_mask, -1e9)
        return scores  # attention logits over entities
```

Orbit Wars での用法: planet/target の選択を 1200 次元 softmax ではなく、**entity embedding から pointer で選ぶ**。
→ action space が全惑星数に比例、変動に対応。

### Pointer-based Action Space

```python
# Step 1: 発射元 planet を pointer で選択
source_logits = pointer_head(global_h, planet_embeds, my_planet_mask)
source_idx = sample(source_logits)

# Step 2: target planet を pointer で選択
target_logits = pointer_head(global_h, planet_embeds, all_planet_mask)
target_idx = sample(target_logits)

# Step 3: ships 割合は固定 5 段階
frac_logits = fraction_head(global_h)
frac = sample(frac_logits)
```

## 計算量

- 惑星 15 + 艦隊 50 = 65 entities
- d_model = 128, n_layers = 3
- 1 forward: O(n² × d_model) = 65² × 128 ≈ 540k FLOPs × 3 layers ≈ 1.6M FLOPs
- GPU (T4) なら 1ms 以下
- CPU (Kaggle kernel) なら 5-20ms

**actTimeout 1s に対して余裕あり**。MCTS simulation 20 回なら 20ms × 20 = 400ms。

## Orbit Wars 固有の注意

### 1. Observation の完全性

Orbit Wars は全情報公開なので fog of war 処理不要。AlphaStar は partial observable なので LSTM で temporal encoding 必要、Orbit Wars は 1 turn の情報で十分。

### 2. 対称性の活用

Map は 4 重対称 (map_gen クラスタ参照)。学習データを 4 回転で augment できる:

```python
def rotate_obs(obs, k=1):
    """90° × k 回転"""
    for p in obs["planets"]:
        p.x, p.y = rotate_90(p.x, p.y, k)
    for f in obs["fleets"]:
        f.x, f.y = rotate_90(f.x, f.y, k)
        f.angle += k * math.pi / 2
    return obs

# Training: rotate with random k ∈ {0,1,2,3}
```

4 倍データ、同じ学習コストで 4 倍のデータ量。

### 3. Comet の特殊扱い

Comet は経路既知、path_index で先読み可能。Entity feature に「将来位置」を 3-5 step 分追加:

```python
def encode_comet(c, obs):
    base = encode_planet(c, ...)
    future = [orbital_position(c.initial, obs["omega"], obs["step"] + dt) for dt in [3, 5, 10]]
    future_flat = [coord for pos in future for coord in pos]
    return base + future_flat
```

## 学び

1. **Entity Transformer** は Orbit Wars の観測に最適
2. **Pointer Network** で可変 entity 数に対応
3. **Masked attention** で padding 正しく処理
4. **4 重対称 augmentation** で data efficiency 4 倍
5. **Comet の future feature** を observation に含める工夫
6. Kaggle kernel CPU で 5-20ms/forward、MCTS と両立可能
