# AlphaGo — SL Policy Network (3000 万手からの模倣学習)

## 基本情報

- **論文**: Silver et al., "Mastering the game of Go with deep neural networks and tree search", Nature 2016
- **URL**: https://www.nature.com/articles/nature16961
- **関連**: AlphaGo Zero (Silver+ 2017, Nature) — SL phase を捨て self-play only に
- **続編**: AlphaZero (汎用), MuZero (環境モデル学習)

## IL (SL Policy Network) の設計

### 学習データ

- **KGS Go Server から 30,000,000 局面**（人間の上級者対戦棋譜）
- 各局面に対し「人間がどの手を打ったか」を正解ラベルに

### ネットワーク

- **13 層 CNN**（当時は比較的深い）
- 入力: 19×19 の盤面、48 チャネル（石の配置、呼吸点、合法手、着手からのターン数 等の手設計特徴）
- 出力: 19×19 の確率分布（次の手）
- accuracy: 57% of human moves（当時の SOTA）

### Fast Rollout Policy

- 別の軽量 linear softmax policy を並行して学習（MCTS の rollout 用）
- accuracy は低いが 1000 倍高速

## IL→RL の流れ

1. **SL policy** を 3000 万手で学習
2. **RL policy** を SL policy 初期化 + self-play + REINFORCE で強化
3. **Value network** を RL policy の self-play データから学習
4. **MCTS** で SL policy (prior) + RL policy (rollout) + value network (leaf 評価) を統合

## Orbit Wars への示唆

AlphaGo の教訓は **IL→RL→MCTS** の 3 段重ねが極めて有効ということ。

### Kaggle の現実制約下での圧縮版

| 段 | AlphaGo | Orbit Wars 圧縮版 |
|----|---------|------------------|
| IL policy | 3000 万手 | LB 上位 bot リプレイ 数万〜数十万局面 |
| RL policy | self-play + REINFORCE | HandyRL か stable-baselines3 PPO で数日 |
| Value network | 別 net を self-play から | Policy net に value head を共有 (dual head) |
| MCTS | PUCT with SL prior | PUCT with IL prior（提出時推論は浅い展開） |

### 提出推論の工夫

- AlphaGo 本体は分散推論前提、Kaggle は 1 CPU + timeout — MCTS 展開数は極小にする必要
- **BC policy 単体推論 + 小規模 rollout (例: 10 node/ターン) + value head**くらいが現実線

## 参考文献

- Silver et al., Nature 2016: https://www.nature.com/articles/nature16961
- Silver et al., "Mastering the game of Go without human knowledge" (AlphaGo Zero): https://www.nature.com/articles/nature24270
- Jonathan Hui, "AlphaGo: How it works technically?": https://jonathan-hui.medium.com/alphago-how-it-works-technically-26ddcc085319
