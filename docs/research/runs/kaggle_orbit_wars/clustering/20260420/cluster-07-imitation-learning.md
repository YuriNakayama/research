# Cluster 07: 模倣学習 (imitation_learning)

## スコープ

Orbit Wars に **模倣学習 (Imitation Learning; IL) / Behavioral Cloning (BC)** を適用するための調査クラスタ。上位 bot のリプレイや公開エピソードから supervised に policy を学習し、RL を最短で軌道に乗せるブートストラップ、あるいは単体で submission とする戦略を扱う。cluster-05 (rl_methods) / cluster-06 (heuristic_search) と補完関係にあり、Kaggle Simulation 系コンペで複数の上位解法が採用してきた実績がある。

## 調査背景

- Kaggle Simulation では提出 bot の `stdout` ログ経由でのリプレイが **Meta Kaggle Episodes** として公開される。公開 LB 上位 bot のリプレイを取得して supervised に学ぶのが IL 活用の定番パターン。
- Orbit Wars は 2D 連続空間 × 艦隊ディスパッチ型の部分観測 RTS であり、探索空間が広い。RL の scratch 学習は高コストで、IL による warm-start は実装効率的にも大きな意味を持つ。
- AlphaStar / AlphaGo が証明したように、**SL 事前学習 → self-play RL fine-tune** は長期的にも強力な組合せ。

## 主要トピック

| トピック | 調査内容 |
|---------|---------|
| Behavioral Cloning (BC) | obs→action を教師ありで学習する最もシンプルな手法と covariate shift 問題 |
| DAgger | 学習中 policy で rollout → expert を query して分布ズレを補正する反復学習 |
| Meta Kaggle Episodes 活用 | `EpisodeAgents.csv` 等から LB 上位 bot の観測/行動対を抽出するパイプライン |
| Encoder アーキテクチャ | CNN / U-Net (semantic segmentation), Transformer (entity-based), ResNet, 階層化 policy head |
| 行動空間の分割 | 複数ユニットの行動を factorized / autoregressive に学ぶ手法 (Kore 2022 の character 列など) |
| IL → RL ハイブリッド | AlphaStar (SL→MARL league), AlphaGo (SL policy → self-play), MineRL (BC→DQfD) |
| データ拡張 | 盤面の水平/回転対称、ピクセル dropout、時系列サブサンプリング |
| 評価・過学習対策 | LB replay の leak 対策、hold-out 用 bot ペア、多様性確保のため複数チーム混ぜる |

## キーワード

- Behavioral cloning game AI / Kaggle simulation
- Imitation learning from top leaderboard replays
- Meta Kaggle Episodes dataset
- AlphaStar supervised pretraining
- Kore 2022 autoregressive ship plan BC
- Halite IV semantic segmentation IL
- Hungry Geese behavior cloning + MCTS
- DAgger dataset aggregation covariate shift

## 想定リソース種別

- **Kaggle writeup**: Lux AI Season 3 3rd (IL), Hungry Geese 1st, Halite IV 上位
- **GitHub**: khanhvu207/kore2022 (autoregressive Transformer IL), ryandy/Lux-S2-public
- **論文**: AlphaStar (Nature 2019), AlphaGo (Nature 2016), DAgger (Ross+ 2011), Behavior Transformers (NeurIPS 2022)
- **ブログ**: Halite IV semantic segmentation IL 解説、HandyRL フレームワーク解説
- **公開ノートブック**: Meta Kaggle Episodes からリプレイ抽出する Kaggle kernel

## 他クラスタとの関係

- **→ similar_competitions (03)**: 過去 Kaggle Simulation コンペで IL を採用した上位解法の具体事例
- **→ rl_methods (05)**: IL pretrain → self-play RL の 2 段構成や、IL policy を rollout policy として使う AlphaZero 型
- **→ heuristic_search (06)**: BC policy を MCTS の prior / rollout policy として使うハイブリッド (Hungry Geese 1位型)
- **← game_mechanics (02)**: 観測・行動空間の設計が encoder/decoder 構造に直結
- **← competition_spec (01)**: 提出形式・時間制限が IL 推論のモデルサイズ上限を規定

## 優先度

**高**。特に次の理由による。

1. Kaggle Simulation コンペで過去最上位を複数取っている実績ある戦略
2. RL より実装コストが低く、ベースライン構築が数日で可能
3. RL 最終形に向けた warm-start としても流用可能
4. Orbit Wars は上位 bot のリプレイが LB 公開され次第、Meta Kaggle 経由で取得可能な公算が高い

## 想定成果物（retrieval phase）

- 過去コンペの IL 適用事例レポート（Lux S3, Kore 2022, Hungry Geese, Halite IV）
- AlphaStar / AlphaGo の SL pretrain 設計レポート
- DAgger / BC 基礎論文レポート
- Meta Kaggle Episodes からの学習データ整備レシピ
- Orbit Wars への適用設計メモ（encoder 候補・行動表現・IL→RL 移行計画）
