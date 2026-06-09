# 01. 組み合わせ行動空間の設計パターン分類

## ソース

- Action Space Shaping in Deep RL (Kanervisto et al., 2020): https://arxiv.org/abs/2004.00980
- An Overview of Action Space for Deep RL (ACM): https://dl.acm.org/doi/fullHtml/10.1145/3508546.3508598
- Deep RL in Large Discrete Action Spaces (Dulac-Arnold et al. 2015): https://arxiv.org/pdf/1512.07679
- Pointer Networks (Vinyals et al. 2015): https://arxiv.org/abs/1506.03134

## Orbit Wars の行動空間サイズ

- Source planet: 自所有 planet（最大 ~20）
- Target planet: 全 planet（最大 ~40）
- Amount: 0 〜 ships(source)（典型的に 0〜500）

ナイーブに直積を取ると `20 × 40 × 500 = 400,000` 通り/planet/turn。1 ターンに複数 planet が同時に行動するため、ターン全体では指数的。**直接 softmax は不可能**。

## 5 つの設計パターン

| # | パターン | 出力構造 | 代表事例 | 学習可能性 | Orbit Wars 適合度 |
|---|---------|---------|---------|----------|------------------|
| A | **独立 multi-head** | `P(source) ⊥ P(target) ⊥ P(amount)` 同時独立 softmax | OpenAI Five 初期版, MicroRTS 簡易 bot | × source/target の相関を学べない | 低 |
| B | **Autoregressive heads** | `P(source) → P(target\|source) → P(amount\|source,target)` を順に sampling、前段の embedding を次段に流す | AlphaStar, AlphaStar Unplugged | ◎ 相関を完全に表現可能 | **最高（推奨）** |
| C | **Pointer network** | entity embedding に対する attention で planet を選ぶ。可変個数に対応 | AlphaStar 内部の selected_units / target_unit head | ◎ planet 数可変への対応 | 高（B と組み合わせて使う） |
| D | **Parameterized action (PADDPG / P-DQN)** | 「action type」（離散）+「continuous parameters」を 2 ヘッドで | RoboCup Soccer, KOG | △ continuous の出力次元が action type 数 × params で爆発 | 中 |
| E | **Seq2seq token decoder** | 「N 10 W 5」のような plan を文字列として 1 トークンずつ生成 | Kore 2022 1st (khanhvu207) | ○ 柔軟だが推論コスト高 | 中（Orbit Wars には過剰） |

## A: 独立 multi-head（**選んではいけない**）

```python
# Anti-pattern
class IndependentPolicy(nn.Module):
    def forward(self, h):
        return (
            self.source_head(h),   # [B, n_planets]
            self.target_head(h),   # [B, n_planets]
            self.amount_head(h),   # [B, n_bins]
        )

# Loss
loss = ce(source_logits, source_label) \
     + ce(target_logits, target_label) \
     + ce(amount_logits, amount_label)
```

**問題点**: `P(source, target, amount) = P(source) P(target) P(amount)` という独立分解を仮定する。実際には強い相関がある:

- 「強力な enemy planet には大量の ships を送る」→ target=enemy_strong と amount=large が相関
- 「自分の弱い planet からは送らない」→ source=mine_weak と amount=small が相関

独立 head は学習時の正解 label からは平均的な分布を学習するが、推論時に独立 sampling すると実在しない組み合わせ（弱い source × 大量 amount）を高確率で出す。これは ML 文献では「**chain rule violation**」または「**multi-modal output collapse**」として知られ、行動の質が大幅に低下する。

## B: Autoregressive heads（**推奨**）

```python
# AlphaStar style
class AutoregressivePolicy(nn.Module):
    def forward(self, h_global, planet_embeds, my_planet_mask, all_planet_mask):
        # Step 1: source
        source_logits = self.source_pointer(h_global, planet_embeds, my_planet_mask)
        source_idx = sample(source_logits)
        source_emb = planet_embeds[:, source_idx]
        h1 = h_global + self.source_proj(source_emb)  # autoregressive embedding

        # Step 2: target | source
        target_logits = self.target_pointer(h1, planet_embeds, all_planet_mask)
        target_idx = sample(target_logits)
        target_emb = planet_embeds[:, target_idx]
        h2 = h1 + self.target_proj(target_emb)

        # Step 3: amount | source, target
        amount_logits = self.amount_head(h2)
        amount = sample(amount_logits)

        return source_idx, target_idx, amount
```

**学習時**:
```python
# Teacher forcing: 正解の source/target を context に流す
h1_teacher = h_global + self.source_proj(planet_embeds[:, gold_source])
h2_teacher = h1_teacher + self.target_proj(planet_embeds[:, gold_target])

loss = ce(source_logits, gold_source) \
     + ce(target_logits_given_source, gold_target) \
     + ce(amount_logits_given_both, gold_amount)
```

**メリット**: 
- 連鎖則 `P(s,t,a) = P(s) P(t|s) P(a|s,t)` を厳密に表現
- 各 head は前段の選択を見て条件付き分布を学習
- AlphaStar が 7 ヘッドでこれをやって StarCraft Grandmaster 達成

**実装上の注意**: 
- 学習は teacher forcing で並列化可能（推論はシーケンシャル）
- 推論時 1 turn あたり 3 forward が必要（後述: per-planet を batch 化すれば実用速度）

## C: Pointer Network（B と組合わせて使う）

可変個数の planet/fleet から 1 個を選ぶ際、**固定次元 softmax は使えない**（planet 数が試合ごとに変わる）。Pointer Network は entity embedding に attention で得点をつけて選ぶ:

```python
class PointerHead(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)

    def forward(self, query_h, entity_embeds, entity_mask):
        # query_h: [B, d_model], entity_embeds: [B, N, d_model], mask: [B, N]
        q = self.q_proj(query_h).unsqueeze(1)         # [B, 1, d_model]
        k = self.k_proj(entity_embeds)                # [B, N, d_model]
        scores = (q * k).sum(-1) / math.sqrt(self.d_model)  # [B, N]
        scores = scores.masked_fill(~entity_mask, -1e9)
        return scores  # softmax over entities
```

**Orbit Wars での適用**:
- Source: `entity_mask = (planet.owner == my_id)` で自分の planet のみ
- Target: `entity_mask = all_valid_planets`（自陣含む援護も可能）

**論文上の根拠**: Pointer Networks (Vinyals 2015) → AlphaStar の selected_units head / target_unit head で実装 → DeepMind の standard architecture。

## D: Parameterized Action Space（PADDPG / P-DQN）

Hausknecht & Stone (2015) の RoboCup Soccer 設定がオリジナル。`action = (discrete_type, continuous_params)`:

```python
# PADDPG actor output
discrete_logits = self.discrete_head(h)        # [B, K] K=action types
all_continuous = self.continuous_head(h)       # [B, K * P_max]
# discrete を選ぶと、対応する continuous スロットが採用される
```

**Orbit Wars との相性**: 
- 「射出する/しない」を discrete、「target_planet_id（連続埋め込み）+ ratio」を continuous とする変種が考えられる
- ただし `target_planet_id` は本来離散なので、PADDPG は不自然
- **現在では autoregressive (B) のほうが汎用性高い**（PADDPG は連続 dynamics の制御が中心）

## E: Seq2seq token decoder（Kore 2022 1位）

khanhvu207 が Kore 2022 で使った方式。各 ship の plan を「N 10 W 5」のような文字列とみなし、Transformer decoder で **1 文字ずつ autoregressive にデコード**:

```python
# Transformer decoder (machine translation 同様)
encoded = encoder(observation)  # ResNet + scalar MLP + ship plan BoW
y_t = decoder(encoded, prev_tokens=[BOS, "N", "1", "0", " ", "W", "5"])
# Loss: cross entropy on next character
```

**メリット**: 
- 任意長の plan を表現可能（Kore は最大 16 命令ぐらい）
- Action space が「文字種 × 系列長」でコンパクト

**Orbit Wars でのオーバーキル度**: 
- Orbit Wars の action は per-planet で 3 値（target, amount）固定なので、可変長 decoder は不要
- ただし将来 multi-step planning（複数ターン先まで指示）に拡張するなら検討余地あり

## まとめ: Orbit Wars が採るべきパターン

**主軸**: B (Autoregressive heads) + C (Pointer network for source/target)

```
observation
  → Entity Transformer (encoder)
  → per-planet token (CLS or each-planet query)
  → autoregressive decode:
       (1) action_type {NOOP, ATTACK} pointer over my_planets
       (2) target pointer over all_planets given source emb
       (3) amount fraction (5-bin) given source+target emb
```

`docs/research/runs/kaggle_orbit_wars/retrieval/latest_rl_methods/04-entity-transformer-for-rts.md` の Pointer + Fraction 設計を **autoregressive 化** する、というのが本ランの中核提案。
