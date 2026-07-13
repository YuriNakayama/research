# Cluster 6: Kaggle Simulation 競技勝者解法 (Lux / Halite / Kore / Geese)

## 概要

Orbit Wars に**最も直接的に効く reference データベース**。Kaggle Simulation 系コンペは 2018 以降毎年開催され、Lux AI S1-S3 (2021, 2023, 2024), Halite IV (2020), Kore 2022, Hungry Geese (2021), ConnectX (常設) と豊富な実戦事例がある。**Lux S3 が技術的に最近接** (1v1 best-of-5, 24x24, fog of war, hidden rules) で、Frog Parade (銀)、Flat Neurons (金)、Boey (10位) の writeup は Orbit Wars 設計の必読資料。歴史的に観察できる傾向として、**(a) S1/S3 は RL 上位、S2 は rule-based 1 位**, **(b) imitation learning + RL のハイブリッドが頻出**, **(c) Rust/C/JAX による sim 自作が金メダル常連**, **(d) win/loss-only zero-sum reward が最終的に支配的** の 4 点が普遍。

## キーワード

`Lux AI Season 3`, `Lux AI Season 2`, `Lux AI Season 1`, `Halite IV`, `Kore 2022`, `Hungry Geese`, `ConnectX`, `Frog Parade`, `Flat Neurons`, `Toad Brigade`, `IsaiahPressman`, `Tom Van de Wiele`, `HandyRL`

## 主要解法 (代表リソース)

### Lux AI Season 3 (NeurIPS 2024, 1v1 best-of-5, 24x24, hidden rules)

| 順位 | チーム | 一行サマリ | URL |
|---|---|---|---|
| 1 | **Flat Neurons** | **IMPALA + ResNet + ConvLSTM + Transformer (200M params, 8×H100×3-4日)**, 新旧 self-play 混合, KL/teacher loss, deliberately weakened opponent 注入, reward [-5,+5] 正規化, タイル単位の敵存在/視認確率を補助 head として予測 | [Kaggle writeup](https://www.kaggle.com/competitions/lux-ai-season-3/writeups/flat-neurons-1st-place-approach-by-flat-neurons) |
| 2 (silver, Frog Parade) | **IsaiahPressman + Garrett** | **vanilla PPO + 8-block 3×3 CNN(256ch, 10M params)** + illegal-action mask + entropy/teacher-KL loss + GAE-λ(γ=0.9999-1.0), sap/main の log-prob を unit 横断で総和して joint policy loss, **Rust 自前 sim で 110k step/s**, TTA(回転/反転), energy field の事前計算と対称性利用 | [GitHub](https://github.com/IsaiahPressman/kaggle-lux-2024) / [writeup.md](https://github.com/IsaiahPressman/kaggle-lux-2024/blob/main/write-up.md) |
| 3 (bronze) | **adg4b** | **Imitation Learning のみ** で銅 (RL なし、上位リプレイから模倣) | [Kaggle writeup](https://www.kaggle.com/competitions/lux-ai-season-3/writeups/adg4b-imitation-learning-3rd-place-solution) |
| 10 | **Boey** | **PPO + BPTT + SelfAttention + LSTM + Conv2d** + **Prioritized Fictitious Self-Play (PFSP)** (latest 75% / 過去難敵 25%) AlphaStar 風 | [Zenn writeup](https://zenn.dev/kurupical/articles/61dbeedf89a29d) |
| organizer | Stone Tao, Akarsh Kumar | 公式論文 "Multi-Agent Meta Learning at Scale" — JAX GPU 並列、5 試合 sequence | [OpenReview 7t8kWYbOcj](https://openreview.net/forum?id=7t8kWYbOcj) |

### Lux AI Season 2 (NeurIPS 2023)

| 順位 | チーム | 一行サマリ | URL |
|---|---|---|---|
| 1 | **ry_andy_** | **完全 rule-based + 探索** (Python のみ、`FUTURE_LEN` で先読み深度調整) | [GitHub](https://github.com/ryandy/Lux-S2-public) / [writeup](https://www.kaggle.com/competitions/lux-ai-season-2/writeups/ry-andy-1st-place-solution) |
| baseline | **RoboEden** | **PPO ベースライン** (上位 RL チームが派生) | [GitHub](https://github.com/RoboEden/Luxai-s2-Baseline) |

→ **S2 は rule-based が頂点**。S3 で再び RL が逆転した経緯あり。

### Lux AI Season 1 (Kaggle 2021)

| 順位 | チーム | 一行サマリ | URL |
|---|---|---|---|
| 1 | **Toad Brigade** (IsaiahPressman) | **FAIR IMPALA + UPGO + TD-λ loss + frozen teacher KL** で戦略循環抑止, **24-block ResNet (~20M, SE 層, BN なし)**, 可変マップを 32×32 zero-pad + masked conv, **8→16→24 ブロックの curriculum + reward shaping**, 推論時 180° 回転 TTA, 単一 net が全 worker/cart/city へ同時指令 | [GitHub](https://github.com/IsaiahPressman/Kaggle_Lux_AI_2021) / [writeup](https://www.kaggle.com/competitions/lux-ai-2021/writeups/toad-brigade-toad-brigade-s-approach-deep-reinforc) |
| 3-6 | various | **imitation learning (U-Net 系)** が上位常連 | [shoheiazuma kernel](https://www.kaggle.com/shoheiazuma/lux-ai-with-imitation-learning) |

### Halite IV (Kaggle 2020, 4-player, 21x21)

| 順位 | チーム | 一行サマリ | URL |
|---|---|---|---|
| 1 | **Tom Van de Wiele** (DeepMind) | **Rule-based 11,000 行 + Deep RL 補助** のハイブリッド。Logic / Rule agents / Deep Learning Agents をフォルダ分け、競技中も rule 中心で運用 | [GitHub](https://github.com/ttvand/Halite) |

### Kore 2022 (Kaggle, fleet flight plan)

| 順位 | チーム | 一行サマリ | URL |
|---|---|---|---|
| 1 | **Egrigor** | **rule-based** (支配的) | [Kaggle discussion](https://www.kaggle.com/competitions/kore-2022/discussion/340035) |
| 上位 | **khanhvu207** | **Autoregressive imitation learning** (Multi-modal Transformer): 12-layer ResNet(18ch+GroupNorm) + MLP + 文字 embedding decoder で **flight plan を seq-to-seq 生成**, 200M tuples (top-5 リプレイ), A100×2 | [GitHub](https://github.com/khanhvu207/kore2022) |
| 関連 | **Nebula** | "Fast simulator" による高速 rollout で rule-based 上位 | [Nebula writeup](https://www.kaggle.com/competitions/kore-2022/writeups/nebula-writing-a-fast-simulator) |

### Hungry Geese (Kaggle 2021, 4-player snake)

| 順位 | チーム | 一行サマリ | URL |
|---|---|---|---|
| 1 | **DeNA HandyRL** (Tanaka/Odo) | **HandyRL (IMPALA 風 learner-worker, V-Trace/UPGO 切替)** + 線形評価関数 MCTS + 大型 NN アンサンブル, 完全 self-play | [HandyRL](https://github.com/DeNA/HandyRL) |
| 2 | various | **imitation learning + MCTS** | – |
| 3 | **Maxwell (hoxomaxwell)** | **Behavior Cloning + 改造 MCTS** (forward_steps 12→72→12 ramp), 8 層 46ch ResNet dual-head, 224 試合 0.55 win-rate gating で逐次更新 | [Speaker Deck](https://speakerdeck.com/hoxomaxwell/kaggle-hungry-geese) |

### ConnectX (Kaggle 常設)

| 上位手法 | 一行サマリ |
|---|---|
| **Minimax + α-β + 完全解析** | 古典探索が支配的、深層 RL/AlphaZero は計算制限で上位は古典中心 |
| **AlphaZero 風 MCTS+NN** | 上位 9 位 (225 チーム中) 例あり |

## Orbit Wars 向けに参考にすべき解法 Top 5

1. **Frog Parade (Lux S3 銀)** — シンプルな PPO + entropy/teacher-KL + 自前 Rust シミュレータで 110k step/s。**Orbit Wars も連続軌道力学で sim コストが重いため、Rust/JAX による高速 rollout 環境の自作が直結**。実装スコープが個人で再現可能な現実性が最大の魅力 → [GitHub](https://github.com/IsaiahPressman/kaggle-lux-2024)
2. **Flat Neurons (Lux S3 金)** — 部分観測下での meta-learning + 過去モデル混合 self-play + reward 正規化 + 補助 head (敵存在予測) は、**fog-of-war や hidden rules を持つ艦隊戦**にそのまま応用可能。**ただし 200M params + 8×H100 は個人では非現実的**。アーキテクチャ思想のみ参考に → [Kaggle](https://www.kaggle.com/competitions/lux-ai-season-3/writeups/flat-neurons-1st-place-approach-by-flat-neurons)
3. **Toad Brigade (Lux S1 1位)** — **frozen teacher KL で戦略循環抑止**するテクニックは、艦隊編成・軌道戦術の局所最適を回避するのに有効。**curriculum (8→16→24 block ResNet)** も学習安定化の参考 → [GitHub](https://github.com/IsaiahPressman/Kaggle_Lux_AI_2021)
4. **DeNA HandyRL (Hungry Geese 1位)** — **policy gradient + off-policy correction を distributed self-play で回す learner-worker フレームワーク**は OSS 実装あり ([github.com/DeNA/HandyRL](https://github.com/DeNA/HandyRL))、Orbit Wars 用 env をプラグインすれば即座に動く
5. **khanhvu207 (Kore 2022 上位)** — 艦の **flight plan を文字列として decode** する seq-to-seq 設計は、Orbit Wars の **軌道 burn シーケンス** を文字列/トークン列として出力する場合の直接的な雛形 → [GitHub](https://github.com/khanhvu207/kore2022)

## 普遍的に効くパターン (5 件)

1. **連続/大規模 action は CNN/ResNet + 補助 head + PPO/IMPALA** が王道。S1/S3 ともに踏襲
2. **self-play は naive → teacher KL → PFSP の階段**。各段階で勝率検証
3. **sim の高速化 (Rust/JAX) が桁違いの学習効率**。10–1000x の差
4. **win/loss-only zero-sum reward が最終的に最も汎化**。reward shaping は初期のみ
5. **expert からの imitation warm-start は強力な保険** (adg4b 銅、Maxwell BC+MCTS の事例)

## 注意事項

- **Lux S2 で rule-based が 1 位** という事実は、Orbit Wars でも純 RL が必ず勝つとは限らないことを示唆。**RL と rule-based のハイブリッド** (Halite IV Tom Van de Wiele 流) を保険として常に考慮
- **CodaLab/Kaggle/NeurIPS 関連**: Lux S3 は NeurIPS 2024 competition、$50K 賞金で激戦。Orbit Wars も同等のレベルで競争激化を想定すべき
- **writeup の信憑性**: 上位入賞後の post-hoc 説明は理想化されている可能性あり。コードを必ず確認

## Orbit Wars 向け推奨学習パス

1. **まず Frog Parade writeup を熟読** (PPO + Rust sim の実践的ベスト)
2. **HandyRL を Orbit Wars に移植** (1-2 週で baseline)
3. **PFSP self-play で安定化** (cluster-03 参照)
4. **CNN+SE → Set Transformer に段階移行** (cluster-04 参照)
5. **JAX/PufferLib で throughput 10–100x** (cluster-05 参照)
6. **最終週: TorchScript+INT8 で submission 整形**
