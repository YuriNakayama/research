# Cluster 4: ネットワーク・観測表現アーキテクチャ

## 概要

Orbit Wars の観測は **(a) 連続2D 位置の可変数 fleet ユニット**, **(b) グリッド化されたマップ (惑星, 軌道帯)**, **(c) グローバル特徴 (スコア, 既知ルール, ステップ番号)** という異種混合構造。これを神経網にどう入力し、どう policy/value heads を構成するかが性能の上限を決める。Kaggle 上位は **CNN (ResNet + Squeeze-Excitation) が依然主流**だが、AlphaStar (2019) 以来の **Entity Transformer** や 2024 年の **RoPE-ViT** が論文側で台頭。Flat Neurons (Lux S3 1位) は **ResNet + ConvLSTM + Transformer の三段重ね**、Frog Parade は **CNN+SE** で銀。**permutation invariance** を Set-Transformer や Deep Sets で確保するのが新しい潮流で、可変数 fleet の自然な表現として有力。

## キーワード

`CNN`, `ResNet`, `Squeeze-Excitation (SE)`, `ConvLSTM`, `Transformer`, `Entity Transformer`, `Set Transformer`, `Deep Sets`, `Perceiver IO`, `RoPE`, `2D RoPE`, `Vision Transformer (ViT)`, `Decision Transformer`, `GNN (graph neural network)`

## 主要論文・実装 (代表リソース)

| Title | Type | Year | Summary |
|-------|------|------|---------|
| [Squeeze-and-Excitation Networks](https://arxiv.org/abs/1709.01507) | Paper | 2018 | Hu et al. CNN の channel attention、Frog Parade / Toad Brigade の共通基盤 |
| [Set Transformer](https://arxiv.org/abs/1810.00825) | Paper | 2018/19 | Lee et al. Permutation invariant attention、可変数 entity 処理の本命 |
| [Deep Sets](https://arxiv.org/abs/1703.06114) | Paper | 2017 | Zaheer et al. permutation invariance の理論基盤 |
| [Perceiver IO (DeepMind)](https://arxiv.org/abs/2107.14795) | Paper | 2021 | Cross-attention で異種混合入力を統一処理。AlphaStar への置換実験あり ([HF blog](https://huggingface.co/blog/perceiver)) |
| [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864) | Paper | 2021 | Su et al. RoPE 提案 |
| [Rotary Position Embedding for Vision Transformer (RoPE-ViT)](https://arxiv.org/abs/2403.13298) | Paper | ECCV 2024 | NAVER。2D 軸別 RoPE で解像度外挿が可能、連続 2D 空間と好相性 |
| [Decision Transformer](https://arxiv.org/abs/2106.01345) | Paper | 2021 | Chen et al. RL を conditional sequence modeling として定式化 |
| [PDiT: Perception-Decision Interleaved Transformer](https://arxiv.org/abs/2312.15863) | Paper | 2023 | 知覚 Transformer と意思決定 Transformer を交互配置 |
| [MAGENTA: Multi-game Entity Transformer (DAI 2024)](http://www.adai.ai/dai/2024/dai_papers/DAI2024_paper_19.pdf) | Paper | 2024 | Permutation-invariant entity-encoder/decoder で MA generalist |
| [Frog Parade Lux S3 model architecture](https://github.com/IsaiahPressman/kaggle-lux-2024) | Writeup | 2025 | 8-block 3x3 CNN(256ch) + spatial/global 入力結合 + value head は 1x1 conv→mean |
| [Flat Neurons Lux S3 (ResNet+ConvLSTM+Transformer)](https://www.kaggle.com/competitions/lux-ai-season-3/writeups/flat-neurons-1st-place-approach-by-flat-neurons) | Writeup | 2025 | 三段重ね、200M params。補助 head として「敵存在予測」 |
| [Graph Attention Multi-Agent Fleet Autonomy](https://arxiv.org/abs/2302.07337) | Paper | 2023 | Heterogeneous GNN encoder-decoder。fleet 協調の参考 |
| [PettingZoo](https://github.com/Farama-Foundation/PettingZoo) | OSS | 2025 active | MA 環境統一 API、Orbit Wars wrapper を整える基盤 |

## Orbit Wars 適用時の調査戦略

1. **Frog Parade スタイル CNN+SE を baseline**: 入力 (B, C_spatial + T_hist*C_temporal, H, W) を 8-block 3x3 conv + SE で処理し、value/actor head を分離
2. **可変数 fleet (最大 16 隻) は Set Transformer / Deep Sets で表現**: ship features を element-wise embed → self-attention → policy head に渡す
3. **2D 位置のエンコーディング**: 既存の sinusoidal PE より **RoPE-ViT (2D)** が解像度外挿に強く、Orbit Wars のような可変マップサイズに向く
4. **Entity Transformer (AlphaStar 派生)** で「ship × planet × asteroid」の異種 entity を統一処理
5. **Perceiver IO** で異種混合 (spatial map + global scalars + entity list) を cross-attention で吸収する設計を検討
6. **補助 head** (Flat Neurons 流): 「敵存在確率マップ」「hidden parameter 推定値」「次ステップの自軍位置」を multi-task で予測すると representation が rich になり policy が安定

## 注目研究グループ

- **DeepMind**: AlphaStar / Perceiver IO / Decision Transformer の系譜
- **Google Research / NAVER**: RoPE-ViT, ViT 派生
- **Lee et al. (Oxford / Stanford)**: Set Transformer
- **FAIR**: Decision Transformer / MAGENTA
- **InstaDeep (Mava)**: MA + Transformer の実装で先行

## 推奨読み順

1. Frog Parade / Flat Neurons writeup (実装の現実例)
2. Squeeze-Excitation 論文 (CNN backbone の枯れたベスト)
3. Set Transformer + Deep Sets (可変数 entity)
4. RoPE / RoPE-ViT (位置符号化の最新)
5. Perceiver IO (異種混合入力)
6. Decision Transformer (sequence-as-RL の別路線)
7. AlphaStar architecture (entity transformer の原典)
8. MAGENTA (MA への entity encoder 拡張)

## アーキテクチャ選択フローチャート

```
fleet ユニットを「グリッドセルへ index」できるか?
├─ Yes (Lux S3 のように 24x24 マップ内に ship を埋め込み)
│   → CNN+SE + per-unit MLP head (Frog Parade パターン) を推奨
│       optional: + ConvLSTM (Flat Neurons) で時系列吸収
│
└─ No (連続位置 (x, y) ∈ R^2 で grid 非対応)
    → Entity Transformer or Set Transformer + 2D RoPE
        または Perceiver IO で異種入力をまとめる
```

## 注意事項

- **CNN は厳密には permutation invariance を持たない** (ship を grid cell に固定すれば実質的に permutation の問題が消えるが、同一セルに複数 ship がいる場合は処理を分離)
- **Transformer は learning が遅い**: Frog Parade も ViT 試したが「stabilize できず CNN に戻した」。**小型から段階的に**を推奨
- **submission 100MB 制約**: Transformer は params が増えやすい (200M params の Flat Neurons は INT8 量子化前提)。CNN backbone (10–30M params) の方が現実的
- **連続時間 / 連続行動**: Decision Transformer は trajectory 系列を入力にするため、Orbit Wars のような online RL では適応に工夫が必要

## Orbit Wars 向け推奨パス

- **段階 1 (baseline)**: 8-block 3x3 CNN + SE + spatial/global 結合 (Frog Parade パターン)、10–30M params
- **段階 2 (時系列吸収)**: ConvLSTM 1 段または GRU を core 後ろに追加
- **段階 3 (entity 明示化)**: ship 専用の per-unit head に Set Transformer / Deep Sets を採用
- **段階 4 (高度化)**: 2D RoPE + Entity Transformer (AlphaStar 風) で fleet × planet × asteroid を統一処理
- **段階 5 (補助タスク)**: 敵存在予測 / hidden rule 推定 / 次状態予測の multi-task head で representation richer に
- **段階 6 (実験)**: Perceiver IO で異種入力統合 (難易度高、効果は未知)
