# 03. Kore 2022 1位 (khanhvu207) — Autoregressive Imitation Learning 深掘り

## ソース

- GitHub: https://github.com/khanhvu207/kore2022
- Kaggle 1st place writeup: https://www.kaggle.com/competitions/kore-2022/discussion/340035
- W&B 学習ログ: https://wandb.ai/kaggle-kvu/kore2022

## なぜ Orbit Wars 設計の最重要参考か

**Kore 2022 と Orbit Wars はゲーム構造がほぼ同一**:

| 項目 | Kore 2022 | Orbit Wars |
|------|-----------|------------|
| 形態 | ターン制 simulation | リアルタイムターン制 |
| 単位 | 自軍の shipyard 群 | 自軍の planet 群 |
| 行動 | 各 shipyard が "ship plan" (経路命令) を発行 | 各 planet が target + amount を発行 |
| 行動空間 | 文字列「N 10 W 5 C」（北 10 → 西 5 → 変換）| (target_planet, ships) |
| 公開 replay | あり（Kaggle 提出データ） | なし（self-play で生成必要） |
| 評価 | 最終 kore 量 | 残存 ships / planet |

→ **Kore 2022 1位の手法は Orbit Wars にほぼそのまま転用可能**。

## 1位解法の全体像

### データ
- **200M tuples** of (single time-step observation, ship plan)
- 上位 5 提出からの replay を expert として使用（multi-expert BC）

### モデル: Multi-modal Transformer + Autoregressive Decoder

```
========== Encoder ==========
[Spatial 18-channel 2D map] 
  → 12-layer ResNet w/ GroupNorm
[Scalar features (turn, score, resources)] 
  → MLP
[Other ships' plans (BoW)] 
  → learnable char embed + positional embed → sum
   ↓ (concat)
Multi-modal Transformer Encoder
   ↓
encoded representation

========== Decoder ==========
[BOS, char_1, char_2, ...] 
  → Transformer Decoder (causal mask)
  → next char prediction (vocabulary: ~30 chars)
[CLS] token output → MLP → action_type prediction
```

### 訓練設定
- Optimizer: AdamW (weight decay 0.01)
- LR: 4e-3 with CosineAnnealing + 5% warmup
- Batch: 64
- Epochs: 20
- Hardware: 2x A100 (80GB)
- Augmentation: **board pixel の 60% を randomly mask**（強烈な augment）
- Gradient clip: 0.5（ResNet 部分のみ）

## 「N 10 W 5」の autoregressive デコードが革新的な理由

従来の RTS bot では「方向 × 距離」を multi-discrete output として扱う:
```python
direction = sample(direction_logits)  # 4 choices
distance = sample(distance_logits)    # 0-20
```

これは distance が direction に依存しない（独立）と仮定するが、**実際は強く相関**:
- 「北は近距離（5 マス）、東は遠距離（15 マス）」のような戦略パターン
- 独立 sampling では実在しない組み合わせが出る

khanhvu207 の解法は **plan を文字列として token-by-token decode** することで、`P(plan) = ∏ P(char_t | char_{<t}, observation)` を厳密に表現。各 char が前の char に依存。

これは **完全な autoregressive 模倣学習** であり、AlphaStar の 7-head autoregressive を「文字列レベルに展開した」極端版。

## Orbit Wars への転用 — 2 案

### 案 A: 完全 seq2seq (Kore 2022 そのまま)

```
plan vocab = {"T", "0"-"9", " ", "S", "0"-"9"}  # T=target T7 S=ships 42 → "T7 S42"
```

各 planet の plan を文字列で生成。

**メリット**: 任意長 multi-step plan に拡張可能
**デメリット**: 推論コスト高（character-level decode を全 planet で並列に）

### 案 B: 簡略化した 3-head autoregressive (推奨)

Orbit Wars は 1 turn 1 命令/planet で plan が固定長 → **文字列化はオーバーキル**。AlphaStar 風の 3-head autoregressive で十分。

```python
# Orbit Wars の per-planet 命令
action = {
    "type": "ATTACK" | "NOOP",   # head 1
    "target": int (planet id),    # head 2 (only if ATTACK)
    "ratio": int (0-4 → 0%, 25%, 50%, 75%, 100%),  # head 3 (only if ATTACK)
}
```

各 source planet ごとに 3-head autoregressive policy を適用。同じ encoder を全 planet で共有し、planet embedding を query にして decoder を回す（per-planet decoding parallelization）。

```python
# Pseudo-code
encoded = encoder(observation)             # [B, n_planets, d_model]
for p in my_planets:
    h_p = encoded[:, p]                     # [B, d_model] this planet as query
    at_logits = action_type_head(h_p)
    at = sample(at_logits)
    if at == ATTACK:
        h1 = h_p + action_type_proj(at)
        tgt_logits = target_pointer(h1, encoded, all_mask)
        tgt = sample(tgt_logits)
        h2 = h1 + target_proj(encoded[:, tgt])
        ratio_logits = ratio_head(h2)
        ratio = sample(ratio_logits)
        amount = int(ratio * planet[p].ships / 4)  # 0%, 25%, 50%, 75%, 100%
```

これは「**planet が自分自身の embedding を query として action を decode**」する Per-Entity Pointer Decoder の構造。AlphaStar の selected_units head を「全 my_planet を順次 query にする」形に変形したもの。

## Multi-modal Transformer Encoder の Orbit Wars 設計

Kore 2022 の 3 modality に倣う:

| Modality | Kore 2022 | Orbit Wars 対応 |
|----------|-----------|----------------|
| Spatial | 18 ch ResNet (船・kore 分布マップ) | **不要**（Orbit Wars は座標 + 半径だけ、map スパース）|
| Scalar | turn, my_score, my_kore, etc. | turn, total_my_ships, total_enemy_ships, time_remaining, omega |
| Sequence | other ships' plans (BoW) | **不要**（前ターン全 plan を知る必要なし）|
| Entity (Orbit Wars 追加) | — | planets, fleets, comets を Entity Transformer で encode |

→ Orbit Wars は **spatial → entity に置換**、それ以外は同様のアーキテクチャ。

## データ Augmentation: 60% Random Pixel Mask の意義

Kore 2022 で「board の 60% pixel を random mask」する理由:
- Spatial CNN が一部の pixel に過剰依存するのを防ぐ
- BC の最大の敵 = **train/test 分布シフト** に対する正則化

**Orbit Wars でも同等の augmentation が効く**:
- 4 重対称回転（90°/180°/270° rotation）→ 4 倍データ
- random masking of comets / fleets info（10-20%）
- planet feature への小さな noise（ships ±10%）

これらは AlphaStar Unplugged にもある「**data augmentation for offline RL**」の標準テクニック。

## 学習可能性 (Sample Efficiency)

Kore 2022: 200M tuples × 20 epochs = 4B updates
- 2x A100 で数日

Orbit Wars 想定:
- self-play で 1 game ≈ 500 turns × 10 planets = 5,000 tuples / game
- 10,000 games で 50M tuples（Kore の 1/4）
- A100 1 枚で 10-20 epoch、数十時間で完結
- **Kaggle kernel (T4 1 枚) でも 100M tuples × 5 epoch ぐらいまで現実的**

## 推論速度

Kore 2022 はリアルタイム制約が緩いが、Orbit Wars は actTimeout 1s/turn。
- Encoder: 1 forward / turn
- Decoder: per-planet 3 heads
- 自分の planet 20 個 × 3 heads = 60 small forward
- d_model=128, 3 layers の Transformer なら CPU でも < 100ms

→ **Kaggle kernel (CPU) で十分間に合う**。

## まとめ: Kore 2022 から学ぶべき 5 点

1. **Autoregressive decoding が IL の本質**: action の構造的依存性を尊重
2. **Multi-modal encoder**: spatial / scalar / entity を分離して処理し最後に融合
3. **Top-N submissions を expert として multi-expert BC**: 1 expert より平均的に強い（mode 平均化のリスクあり）
4. **強い data augmentation（60% pixel mask）が必須**: BC は overfit しやすい
5. **Plan の文字列表現は強力だが Orbit Wars には過剰**: 3-head autoregressive で十分
