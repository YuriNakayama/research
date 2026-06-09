# 02. AlphaStar の Autoregressive Action Heads と模倣学習損失

## ソース

- AlphaStar (Vinyals et al., Nature 2019): https://storage.googleapis.com/deepmind-media/research/alphastar/AlphaStar_unformatted.pdf
- AlphaStar Unplugged (Mathieu et al. 2023): https://arxiv.org/abs/2308.03526
- Decipher AlphaStar blog: https://cyk1337.github.io/notes/2019/07/21/RL/DRL/Decipher-AlphaStar-on-StarCraft-II/
- DeepMind alphastar repo: https://github.com/google-deepmind/alphastar
- Standard Architecture (DeepWiki): https://deepwiki.com/google-deepmind/alphastar/3.3-standard-architecture

## なぜ AlphaStar が Orbit Wars 設計の最重要参考か

StarCraft II も Orbit Wars と同型の問題:
- 可変個数の units (≒ planets)
- action = (action_type, unit_selection, target_unit, target_location, ...) の **組み合わせ**
- Replay (人間プロデータ) からの **教師あり学習で Grandmaster 級** に到達

AlphaStar Unplugged では純粋な offline BC が前段で重要な役割を担う。Orbit Wars は public replay がないが、self-play で類似データを生成可能。

## Action の 7 引数構造

AlphaStar の action は次の 7 個の引数の組み合わせ:

| # | Argument | 役割 | Orbit Wars 対応 |
|---|----------|------|----------------|
| 1 | function (action_type) | どの操作 | NOOP / ATTACK / DEFEND |
| 2 | delay | 何 frame 後 | （Orbit Wars にはなし、毎ターン同期） |
| 3 | queued | キュー追加か即実行か | （なし） |
| 4 | repeat | 繰り返し | （なし） |
| 5 | unit_tags (selected_units) | 操作対象の自軍 unit 群 | source planet (1 個) |
| 6 | target_unit_tag | 攻撃対象 unit | target planet |
| 7 | world (target_location) | 地図上座標 | （Orbit Wars は planet ベースなので不要） |

**Orbit Wars に必要なのは {action_type, source, target, amount} の 4 個** → 簡略版。

## Autoregressive embedding の流れ

各 head の出力サンプルを次の head の入力に embed して渡す。

```
LSTM output h0
  ↓
[Action type head] → action_type サンプル
  ↓ + project(action_type)
autoregressive_embedding h1
  ↓
[Delay head] → delay サンプル
  ↓ + project(delay)
h2
  ↓
[Queued head] → queued
  ↓ ...
[Selected units head] → 複数 unit を pointer で選択
  ↓
[Target unit head] → 攻撃対象を pointer
  ↓
[Location head] → 座標を deconv で
```

具体的には Decipher blog より:

> "project the delay to size 1024 1D tensor through 2-layer MLP with ReLUs and add to autoregressive_embedding"

つまり「**前段の選択を MLP で d_model 次元に embed → autoregressive_embedding に加算**」という単純な仕組み。

## Selected Units Head: Pointer Network の典型実装

```
keys = Conv1D(entity_embeddings, 32 channels)            # [N, 32]
query = LSTM_step(autoregressive_embedding) → 32-dim
scores = masked_softmax(keys @ query)                    # [N]
selected_unit = sample(scores)
autoregressive_embedding += embed(selected_unit)
```

複数 unit を選ぶ場合は **LSTM を回して最大 64 unit まで sequential に sampling**。Orbit Wars は 1 source / 1 target なので LSTM は不要。

## Target Unit Head: もう 1 つの Pointer

```
target_unit_logits = pointer(autoregressive_embedding, entity_embeddings, valid_target_mask)
target_unit = sample(target_unit_logits, temperature=0.8)
```

inputs:
- autoregressive_embedding (前段までの選択を反映)
- entity_embeddings (全 unit の表現)
- valid_target_mask (選択した action_type が許可する対象のみ True)

## Action Type Head の特殊構造

```
LSTM output → 16 ResBlocks (256 dim each) → ReLU → GLU(scalar_context) → action_type_logits
```

GLU (Gated Linear Unit) で **scalar context (resource, time 等) によって action 候補をゲート**。Orbit Wars でも「終盤は ATTACK 主体」のような bias を入れるのに有効。

## AlphaStar Unplugged の模倣学習損失

> "Each action is comprised of seven arguments, **there is one loss per argument**."
> "To avoid overfitting during behavior cloning, **a weight decay loss** is also used."

つまり:

```python
loss_total = sum_{arg} ce(logits_arg, label_arg) + λ * ||θ||²

# Sampling temperature: training=1.0, eval=0.8
```

**重要なポイント**:
1. **損失は各引数で独立に計算**（autoregressive 構造は teacher forcing で並列化）
2. **重み付け（loss weighting）は引数ごとに調整可能** — AlphaStar Unplugged は引数による重み付けを言及
3. **Mode collapse 対策で weight decay** — BC では正則化が dropout より効果的
4. **Temperature**: 学習時は 1.0、評価時は 0.8（過度な exploration を抑制）

## AlphaStar の Loss Weighting（引数別）

AlphaStar Unplugged の実装では、**argument によって loss weight が異なる**ことが知られている。例えば:
- action_type: 大きめの weight（最も重要な階層的決定）
- target_unit: 中程度
- delay/queued: 小さめ（誤って学習しても影響が小）

Orbit Wars に適用すると:

```python
loss = 1.0 * ce(action_type_logits, label_action_type) \
     + 1.0 * ce(source_logits,      label_source) \
     + 1.0 * ce(target_logits,      label_target) \
     + 0.5 * ce(amount_logits,      label_amount)   # amount は誤差に robust
```

amount の重みを下げる根拠: 「100 ships 送るべきところを 80 送る」のは戦略的にほぼ等価だが、「source 選択を誤る」のは致命的。

## Z-statistic（戦略コンディショニング）

AlphaStar では replay 統計（build order, unit count target）を **z** として policy に入力し、「同じ戦略を取る」よう誘導。これにより mode collapse を回避し、多様な戦略を学習できる。

Orbit Wars 適用案:
- z = (expert_id one-hot, 攻撃志向か防御志向か, etc)
- 推論時は z を固定して 1 つの戦略を実行

## Orbit Wars 向けに簡略化したヘッド構造

```python
class OrbitWarsAutoregressivePolicy(nn.Module):
    def __init__(self, d_model=128, n_amount_bins=5):
        super().__init__()
        self.action_type_head = nn.Linear(d_model, 2)   # NOOP / ATTACK
        self.source_pointer = PointerHead(d_model)
        self.target_pointer = PointerHead(d_model)
        self.amount_head = nn.Linear(d_model, n_amount_bins)
        
        self.action_type_proj = nn.Embedding(2, d_model)
        self.source_proj = nn.Linear(d_model, d_model)
        self.target_proj = nn.Linear(d_model, d_model)

    def forward(self, h_global, planet_embeds, my_mask, all_mask,
                gold=None):
        """gold: 学習時は (action_type, source, target, amount) tuple、推論時は None"""
        
        # Head 1: action type
        at_logits = self.action_type_head(h_global)
        at = gold[0] if gold else sample(at_logits)
        h1 = h_global + self.action_type_proj(at)
        
        # Head 2: source (pointer)
        src_logits = self.source_pointer(h1, planet_embeds, my_mask)
        src = gold[1] if gold else sample(src_logits)
        src_emb = planet_embeds.gather(1, src.unsqueeze(-1).expand(-1, -1, planet_embeds.size(-1))).squeeze(1)
        h2 = h1 + self.source_proj(src_emb)
        
        # Head 3: target (pointer)
        tgt_logits = self.target_pointer(h2, planet_embeds, all_mask)
        tgt = gold[2] if gold else sample(tgt_logits)
        tgt_emb = planet_embeds.gather(1, tgt.unsqueeze(-1).expand(-1, -1, planet_embeds.size(-1))).squeeze(1)
        h3 = h2 + self.target_proj(tgt_emb)
        
        # Head 4: amount (fixed bins)
        amt_logits = self.amount_head(h3)
        
        return at_logits, src_logits, tgt_logits, amt_logits

# Loss
def compute_loss(model, batch):
    at_l, src_l, tgt_l, amt_l = model(
        batch.h_global, batch.planet_embeds, batch.my_mask, batch.all_mask,
        gold=(batch.gold_at, batch.gold_src, batch.gold_tgt, batch.gold_amt)
    )
    return (
        1.0 * F.cross_entropy(at_l,  batch.gold_at) +
        1.0 * F.cross_entropy(src_l, batch.gold_src) +
        1.0 * F.cross_entropy(tgt_l, batch.gold_tgt) +
        0.5 * F.cross_entropy(amt_l, batch.gold_amt) +
        1e-4 * sum(p.pow(2).sum() for p in model.parameters())  # weight decay
    )
```

## 参考: AlphaStar Unplugged の主要ベンチマーク数字

- データ: 10M+ replays from 2018-2019 SC2 ladder
- 教師あり BC のみで AlphaStar 元論文の BC agent を **90% win rate** で上回る
- 単純な BC + 改良された損失設計（per-argument loss + weight decay）で十分強くなる

→ **Orbit Wars でも replay (= self-play data) の量と質を確保すれば BC のみで強い bot ができる**。

## 学べる教訓

1. **Autoregressive で因果順を尊重**: action_type → source → target → amount という意味的階層を policy に埋め込む
2. **各 head は独立 cross entropy loss、ただし重み調整**: 重要度に応じて weight
3. **Pointer network が可変 entity 数に必須**: 固定 softmax は競技中に planet 数が変わると破綻
4. **正則化は weight decay 優先、dropout は hurt するケースあり**（AlphaStar Unplugged 報告）
5. **戦略コンディショニング (z) で mode collapse 回避**: multi-expert データを学習する場合は expert ID を context に入れる
