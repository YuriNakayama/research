# 06. 「射出量 0〜N」の予測戦略

## なぜ Amount 予測が難しいか

Orbit Wars の amount は:
- 範囲: `0 〜 source_planet.ships`（典型 0〜500）
- **state-dependent な上限**（source の ships 数で動的に変わる）
- **離散的だが大きな域**（500 通りの softmax は非効率）
- **multi-modal**（「0 か 100% かの二択」が多く、中間値は少ない）

ナイーブに「[0, 500] の整数を 501-class softmax」では:
- 学習が散在（neighboring class の意味的類似性を活かせない）
- 推論時に意味のない値（503）を出す可能性

## 5 つの戦略と比較

### 戦略 1: Fraction (% of source ships) を 5-bin 離散化（**推奨**）

```python
amount_bins = [0.0, 0.25, 0.5, 0.75, 1.0]   # 5 classes
amount_logits = self.amount_head(h)         # [B, 5]
predicted_ratio = bins[argmax(amount_logits)]
predicted_amount = int(predicted_ratio * source.ships)
```

**メリット**:
- 5-class softmax で安定学習
- state-dependent 上限 (source.ships) を自動考慮
- AlphaStar / Kore 2022 系で採用される標準的方式
- 「半分送る」「全部送る」のような離散的人間判断と整合

**デメリット**:
- 25% 刻みで戦略の細かい量調整ができない（が、Orbit Wars では十分）

**論文上の根拠**: 
- Action Space Shaping (Kanervisto): action discretization は performance を大きく改善
- AlphaStar の queued/repeat も離散値

### 戦略 2: 細かい離散化（10-bin or log-scale）

```python
# 10-bin uniform
amount_bins = [0.0, 0.1, 0.2, ..., 1.0]   # 11 classes
# or log-scale
amount_bins = [0, 1, 2, 5, 10, 25, 50, 100, 250, 500]  # 10 classes
```

**いつ使うか**: 5-bin で性能不足 (e.g., agent が「半分」を機械的に出して負ける) と判明したら。最初は 5-bin で OK。

### 戦略 3: 連続回帰 (Regression)

```python
amount_pred = sigmoid(self.amount_head(h))  # [0, 1]
amount = amount_pred * source.ships
loss = (amount_pred - gold_ratio) ** 2     # MSE
```

**メリット**: シンプル、出力次元 1
**デメリット**: 
- **Multi-modal expert の場合に致命的**（「0% か 100%」を学習するときに平均 50% を出す）
- 損失の scale が他 head (cross entropy) と合わせにくい
- AlphaStar / Kore 2022 のいずれも regression は採用していない

**結論**: **避ける**

### 戦略 4: Pointer over fleet sizes（実用性低い）

「expert が過去に送った ships 数の集合」を candidate にして pointer:
```python
candidates = [10, 25, 50, 100, 250]   # past expert amounts
pointer over candidates conditioned on source/target
```

**問題**: candidate の選定が ad-hoc、新しい状況に generalize しない。

### 戦略 5: Token decoder (Kore 2022 方式)

amount を 3 桁数字として 1 桁ずつ decode:
```python
"042" → predict "0", "4", "2" sequentially
```

**メリット**: 任意精度、AlphaStar と同じ autoregressive 哲学
**デメリット**: Orbit Wars には過剰、推論コスト 3 倍

## State-dependent Mask の実装

amount 予測は **`source.ships` 以下** に制限する必要がある。Fraction 方式なら自動的に満たすが、絶対値方式なら mask が必要:

```python
# 絶対値方式の場合
amount_logits = self.amount_head(h)   # [B, 501]
mask = torch.arange(501).unsqueeze(0) <= source.ships.unsqueeze(1)
amount_logits = amount_logits.masked_fill(~mask, -1e9)
```

→ Fraction 方式ならこの問題が消えるので、もう一つの推奨理由。

## Multi-modal な amount 分布の扱い

expert の (target, amount) ペアを分析すると、しばしば **bimodal**:
- Mode 1: **Probe (1-5 ships)** — 偵察・占領用
- Mode 2: **Heavy (100% ships)** — 決定的攻撃

5-bin 離散化はこの両方を表現可能だが、**fraction 0% 付近の解像度が必要**:

```python
amount_bins = [0.0, 0.05, 0.25, 0.50, 0.75, 1.0]   # probe (5%) を別 bin に
```

または特殊扱い:
```python
amount_logits = self.amount_head(h)   # [B, 6]
# bin 0 = NOOP-like (0 ships), bin 5 = all-in
```

ただしこれは action_type=NOOP と冗長になる。**「ATTACK + amount=0」は禁止し、必ず正の amount を予測** とするほうが整理される。

## ラベル平滑化 (Label Smoothing) の効果

BC では離散 head の overconfidence が compounding error を増幅する。Label smoothing で抑制:

```python
loss = F.cross_entropy(amount_logits, gold_amount, label_smoothing=0.1)
```

特に amount のような「neighboring class が意味的に近い」場合、smoothing は強く効く（`gold=50%` のとき `25% / 75%` にも少し確率を乗せる）。

**さらに発展**: Soft label として隣接 bin に確率を分配:
```python
# gold = 50% (bin 2) なら: [0.05, 0.15, 0.6, 0.15, 0.05]
soft_label = make_soft_label(gold_bin, sigma=1.0)
loss = F.kl_div(amount_logits.log_softmax(-1), soft_label)
```

## 数式まとめ: amount loss

```python
def amount_loss(amount_logits, gold_ratio, action_type_mask, label_smoothing=0.1):
    """
    amount_logits: [B, 5]
    gold_ratio: [B] in {0, 1, 2, 3, 4} for {0%, 25%, 50%, 75%, 100%}
    action_type_mask: [B] True if action == ATTACK
    """
    loss_per_sample = F.cross_entropy(
        amount_logits, gold_ratio,
        reduction="none", label_smoothing=label_smoothing
    )
    return (loss_per_sample * action_type_mask.float()).sum() / (action_type_mask.sum() + 1e-8)
```

## Orbit Wars 推奨: Fraction 5-bin + Label Smoothing 0.1

```python
N_AMOUNT_BINS = 5
AMOUNT_RATIOS = torch.tensor([0.0, 0.25, 0.5, 0.75, 1.0])

class AmountHead(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.fc = nn.Linear(d_model, N_AMOUNT_BINS)

    def forward(self, h):
        return self.fc(h)   # [B, 5]

    def to_amount(self, logits, source_ships):
        ratio_idx = logits.argmax(-1)
        return (AMOUNT_RATIOS[ratio_idx] * source_ships).long()
```

## まとめ表

| 戦略 | Orbit Wars 推奨度 | 理由 |
|------|----------------|------|
| Fraction 5-bin discretization | **★★★★★** | AlphaStar / Kore 2022 で実証、安定 |
| 細かい離散化 (10-bin, log-scale) | ★★★ | 5-bin で不足なら検討 |
| Continuous regression | ☆ | Multi-modal expert で破綻 |
| Pointer over candidates | ☆☆ | Ad-hoc、generalize しない |
| Token decoder | ★★ | 過剰、推論コスト |

**最終推奨**: Fraction 5-bin + label_smoothing=0.1 + ATTACK の場合のみ loss 適用 (mask)
