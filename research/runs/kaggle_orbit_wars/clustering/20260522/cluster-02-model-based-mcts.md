# Cluster 2: モデルベース RL & MCTS (MuZero / EfficientZero 系)

## 概要

MuZero (DeepMind 2019) を起点とする **学習世界モデル + MCTS** 路線。EfficientZero (2021) が Atari100k で人間越え、EfficientZero V2 (2024) が連続行動を統一サポート、UniZero (TMLR 2025) が Transformer 世界モデルで long-horizon を解いた。**sample efficiency が桁違いに高い** (PPO の 1/10–1/100 の経験で同等性能) のが最大の強みで、Kaggle のような「計算リソース限定 + 環境 sim が重い」設定に理論的にフィット。一方で **MCTS 推論コスト** (Orbit Wars の 100ms 制約に対し 50 simulations で数 ms × n_units の積算) と **stochastic environment への対応** (Stochastic MuZero / Sampled MuZero が必須) が実装面の鬼門。submission file size 100MB との両立も dynamics / prediction / representation 3 ネット分の容量配分要検討。

## キーワード

`MuZero`, `EfficientZero`, `EfficientZero V2`, `Sampled MuZero`, `Stochastic MuZero`, `Gumbel MuZero`, `UniZero`, `ReZero`, `LightZero`, `MCTS`, `world model`, `DreamerV3`, `RSSM`

## 主要論文・実装 (代表リソース)

| Title | Type | Year | Summary |
|-------|------|------|---------|
| [Mastering Atari, Go, chess and shogi by planning with a learned model (MuZero)](https://arxiv.org/abs/1911.08265) | Paper | 2019 | Schrittwieser et al., DeepMind。Nature 掲載。representation/dynamics/prediction の 3 ネット |
| [Mastering Atari Games with Limited Data (EfficientZero)](https://arxiv.org/abs/2111.00210) | Paper | 2021 | Ye et al. (THU)。Atari100k で人間越え、self-supervised consistency loss |
| [EfficientZero V2 (EZ-V2)](https://arxiv.org/abs/2403.00564) | Paper | 2024 | 連続・離散行動を統一、DreamerV3 越え on Atari100k / DMControl / MiniGrid |
| [Sampled MuZero](https://arxiv.org/abs/2104.06303) | Paper | 2021 | Hubert et al., DeepMind。大規模/連続行動空間で MCTS をサンプル化 |
| [Stochastic MuZero](https://openreview.net/forum?id=X6D9bAHhBQ1) | Paper | 2022 | 確率的環境への対応、afterstate を導入 |
| [Gumbel MuZero](https://openreview.net/forum?id=bERaNdoegnO) | Paper | 2022 | sample-efficient policy improvement、少数 simulation で動く |
| [UniZero: Generalized and Efficient Planning with Scalable Latent World Models](https://arxiv.org/abs/2406.10667) | Paper | TMLR 2025 | Transformer ベース世界モデル、共有 latent、long-horizon タスクで頭一つ抜けた |
| [ReZero: Boosting MCTS-based Algorithms by Backward-view and Entire-buffer Reanalyze](https://arxiv.org/abs/2404.16364) | Paper | 2024 | wall-clock 2–4 倍高速化、buffer 全体を reanalyze |
| [LightZero (NeurIPS 2023)](https://github.com/opendilab/LightZero) | OSS | 2023– | MuZero/EZ/Sampled/Stochastic/Gumbel/UniZero を統合した MCTS+RL benchmark |
| [DreamerV3 — Mastering diverse domains through world models](https://www.nature.com/articles/s41586-025-08744-2) | Paper | Nature 2025 | RSSM + symlog/free-bits/percentile return 正規化。POMDP の world model 本命 |

## Orbit Wars 適用時の調査戦略

1. **LightZero をベンチマーク基盤として採用** (`pip install lightzero`)。Atari/DMControl の例から Orbit Wars 環境への移植テンプレを把握
2. **Sampled MuZero または EZ-V2** を第一選択。離散化した行動空間 (cluster-01 参照) と相性が良い
3. **推論時 simulation 数を 50→20→10 と段階的に削減**して 100ms 制約を満たすバランスを探る。Gumbel MuZero は少数 sim でも policy improvement を保証
4. **世界モデルの fog-of-war 対応** は RSSM (DreamerV3) のアプローチを参照。observed/unobserved の混在を latent で吸収
5. **submission サイズ対策**: representation/dynamics/prediction 各ネットを ~10–20MB 程度に圧縮 (distillation / INT8 量子化)。LightZero の `model_size_efficient` 設定を起点に
6. **stochastic environment** (Orbit Wars の hidden parameter / 敵の確率的行動) は Stochastic MuZero の afterstate を採用

## 注目研究グループ

- **DeepMind**: MuZero / Sampled / Stochastic / Gumbel すべて本家
- **清華大 Ye et al.**: EfficientZero V1/V2 シリーズ
- **OpenDILab (上海AI Lab)**: LightZero / UniZero / ReZero の中心、OSS が極めて活発
- **Hafner et al. (Google DeepMind)**: Dreamer V1/V2/V3、POMDP world model の権威

## 推奨読み順

1. MuZero 原論文 (Nature 版、3 ネット構造の直感)
2. EfficientZero 原論文 (sample efficiency の鍵)
3. EZ-V2 (連続行動拡張、最新)
4. Sampled MuZero (大規模行動空間)
5. Stochastic MuZero (確率環境)
6. UniZero (long-horizon, Transformer)
7. DreamerV3 Nature 版 (POMDP/世界モデルの最終形)

## 注意事項

- **MCTS 推論時間は per-action なので、ユニット数 N が増えると線形に増加**。16 隻 × per-ship 10ms = 160ms で時間切れの可能性。**centralized MCTS で全 unit 同時 plan** か、heuristic + 重要 ship のみ MCTS のハイブリッドを検討
- **batched inference に厳しい制約**: MCTS は逐次展開なので vectorize しにくい。最終的に PPO ベースよりレイテンシが厳しくなりがち
- **3 ネット分のメモリ**: training 時に dynamics + representation + prediction の同時保持で GPU memory 圧迫。**LightZero の memory_efficient_mode** や勾配チェックポイントが必須

## Orbit Wars 向け推奨パス

- **第 1 期 (baseline 確立後)**: LightZero の Sampled EfficientZero を Orbit Wars env で動かし、PPO baseline と勝率対決
- **第 2 期 (高度化)**: UniZero 風 Transformer world model + Stochastic MuZero で hidden rule を latent に吸収
- **保険**: 推論時間で詰まれば MCTS は捨て、世界モデルのみ補助タスクとして PPO に組み込む (DreamerV3 のように)
