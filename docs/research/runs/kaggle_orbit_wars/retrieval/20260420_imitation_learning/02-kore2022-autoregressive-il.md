# Kore 2022 — Autoregressive Transformer Imitation Learning

## 基本情報

- **コンペ**: [Kaggle Kore 2022](https://www.kaggle.com/competitions/kore-2022)
- **リポジトリ**: https://github.com/khanhvu207/kore2022
- **アプローチ**: マルチモーダル Transformer による **ship plan の autoregressive BC**
- **データ規模**: **約 2 億 tuple** (observation × ship plan) をトップ 5 チームの提出 bot から抽出

## アーキテクチャ

ゲーム状態を「ship plan」（船の行動系列を表す文字列）に翻訳する **encoder-decoder Transformer**。

### Encoder（3 モーダル）

| モーダル | 入力 | 処理 |
|---------|------|------|
| 空間 | 18 チャネルの 2D tensor（船位置、貨物、kore 資源量 等） | 12 層 ResNet + GroupNorm |
| スカラー | チームスコア、資源量、残りターン数 など | MLP |
| 既存 ship plans | 文字列（`N 10 W 5` 等）の文字埋め込み | 文字 embedding (256-dim) + 位置埋め込み, bag-of-words で軽量化 |

### Decoder

- **行動表現**: `"N 10 W 5"` のような文字列 → 文字単位の autoregressive decoding
- **Vocabulary**: 方向文字 (N/S/E/W/C) + 数字 + 終端トークン
- 1 隻ずつ plan を生成する構造（複数艦の順序は fixed ordering）

## 学習設定

- **Optimizer**: AdamW, weight decay 0.01
- **学習率**: 4e-3, CosineAnnealing scheduler
- **Grad clip**: 0.5
- **Epochs**: 20
- **Batch size**: 64
- **ハードウェア**: 2× A100
- **Data augmentation**: **盤面ピクセルの 60% をランダムに欠損させる**（過学習対策 + covariate shift 緩和）

## 要所

1. **action を「言語化」して autoregressive に生成**する発想は、多ユニット RTS における行動空間の組合せ爆発を抑える強力な解決策。Orbit Wars のように「艦隊を◯隻、惑星 A→B へ送る」という計画型行動にも直接応用可。
2. **トップ 5 チームからのデータ混合** は、単一 bot 模倣による bias を軽減する実践的テクニック。
3. **60% pixel dropout** という強めの augmentation は、BC の robustness を上げる簡易で効果的な手段。

## Orbit Wars への示唆（設計案）

```
Observation:
  - 2D spatial tensor (惑星位置, 所有者, 駐留艦隊数, 太陽引力場, 軌道予測) — 12–20ch
  - Scalar: 自スコア, 敵スコア, 残り時間, 総艦隊数
  - Past actions: 過去 N ターンの発射記録 (文字列化: "P3->P7 fleet=20 angle=45")

Action decoder:
  - 1 action = (source_planet, target_planet, fleet_size, launch_tick) を
    トークン列で autoregressive 生成
  - vocabulary = planet IDs ∪ integer bins ∪ special tokens
```

この方式なら 1 forward pass で複数艦指令を出せるため、Kaggle のターン時間制限にも収まりやすい。

## 参考文献

- khanhvu207, "kore2022" (GitHub): https://github.com/khanhvu207/kore2022
- Kore 2022 overview: https://www.kaggle.com/competitions/kore-2022
- (関連) Decision Transformer: Chen et al., NeurIPS 2021（action 列生成の思想的ルーツ）
