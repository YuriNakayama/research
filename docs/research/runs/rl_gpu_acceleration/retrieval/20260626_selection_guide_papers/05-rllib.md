# RLlib: 分散強化学習のための抽象化

## 基本情報

- **原題**: RLlib: Abstractions for Distributed Reinforcement Learning
- **著者**: Eric Liang, Richard Liaw, Philipp Moritz, Robert Nishihara, Roy Fox, Ken Goldberg, Joseph E. Gonzalez, Michael I. Jordan, Ion Stoica（UC Berkeley RISELab）
- **掲載**: ICML 2018。arXiv:1712.09381（2017-12-26 投稿、最終版 2018-06-29）
- **基盤**: Ray（分散実行フレームワーク）の上に構築
- **URL**: https://arxiv.org/abs/1712.09381

## 課題・背景

RL アルゴリズムは「高度に不規則な計算パターンの深いネスト」であり、各層に分散計算の機会がある。しかし当時の分散 RL 実装は個別最適化されたモノリスで、再利用・合成が困難だった。RLlib は **トップダウンの階層的制御（hierarchical control）** によって RL コンポーネントを合成可能（composable）にし、並列性とリソース要件を短命な compute task にカプセル化する原則を提案する。

> "We argue for distributing RL components in a composable way by adapting algorithms for top-down hierarchical control, thereby encapsulating parallelism and resource requirements within short-running compute tasks."（Abstract）

## 主要な知見・推奨事項（actionable な設計原則を抽出）

### 1. 中核抽象: Policy Optimizers
分散実行戦略を **policy optimizer クラス** にカプセル化し、アルゴリズム本体（loss/policy）から分離する：
- 非同期勾配計算の Async optimizer
- 同期更新の AllReduce 系 optimizer
- GPU 常駐データ用の Local multi-GPU optimizer
- 高スループット off-policy 用の Ape-X optimizer

→ **同じ policy graph に異なる optimizer を差し替えるだけで分散戦略を切り替えられる**のが設計の肝。

### 2. Policy Evaluators / Policy Graphs
- 開発者は policy model π（観測 + RNN 隠れ状態 → 行動 + 次状態）を定義: "The developer specifies a policy model π that maps the current observation and (optional) RNN hidden state to an action and the next RNN state."
- policy evaluator が rollout 収集を担い、optimizer がそれらを束ねて学習を駆動。

### 3. 論理的中央集権制御（Logically Centralized Control）
- 単一ドライバ + ワーカー群。ワーカーは状態を保持するが、呼ばれるまで計算しない: "a single driver program and worker processes [that] passively hold state but execute no computations until called."
- 完全分散（peer-to-peer）に対し、**ネストした並列計算の合成が容易**。Ray actor 上で階層的にサブタスクを委譲し、中央ボトルネックを避ける。

### 4. 実装アルゴリズム
- Policy gradient: PPO, A3C
- Value-based: DQN, Ape-X DQN
- Model-based、Evolution Strategies（導関数フリー）、マルチエージェント、AlphaGo Zero アーキテクチャ

## 選定・実装への含意

- **大規模分散・マルチアルゴリズム・プロダクション向けの基準**: RLlib は CleanRL（01）の対極。「1 ファイルで透明」ではなく「抽象化で合成・スケール」。受託・商用・クラスタ運用で、複数アルゴリズムを共通基盤で回したいなら第一候補（09 ガイド §3 でも「PyTorch のマルチ GPU 分散 collector」として位置づけ）。
- **PyTorch / TF 両対応・フレームワーク中立**: RLlib は TF/PyTorch の両方をサポートする抽象化レイヤであり、「フレームワーク選定」を policy graph の実装言語の問題に局所化する。JAX end-to-end on-device（PureJaxRL/Anakin）とは設計思想が異なる — RLlib は **env=CPU・学習=分散** の古典構成を効率化する路線。
- **GPU 高速化の位置づけ**: RLlib の強みは「多数の CPU ワーカーで rollout を集め、GPU/param-server で学習」のスケールアウト。これは env が jit 不能（外部シミュレータ・実機）なケースでこそ効く。逆に env が GPU-native（Brax/gymnax）なら、CPU ワーカー前提の RLlib より JAX 系の方が転送オーバーヘッドを消せる。
- **Podracer（Sebulba）との対比**: RLlib の「CPU で sample 収集 → 中央で学習」は Sebulba パターンに近く、Anakin（全 device 上）とは別系統。TPU pod では JAX/Anakin が優位、汎用クラスタ + 任意 env では RLlib が実用的。

## 主要な定量結果（原文ママ）

- **Evolution Strategies**: "With 8192 cores, we achieve a reward of 6000 in a median time of 3.7 minutes, which is over twice as fast as the best published result."（Humanoid-v1, 8192 コアで 3.7 分・既存最良の 2 倍超）
- **Ape-X DQN**: "160k environment frames per second with 256 workers"（256 ワーカーで 16 万 fps、参照実装 ~45k fps を上回る）
- **Policy evaluation スループット**: "Pendulum-CPU reaches over 1.5 million actions/s"（CPU）、"Pong-GPU nears 200k actions/s"（GPU）
- **A3C**: PongDeterministic-v4 を "12 minutes using asynchronous policy optimizer and 9 minutes using sharded param-server optimizer"

## 限界・注意点

- **2018 年・古典分散構成前提**: env=CPU・学習器=分散の構成を最適化したもの。GPU-native env（Brax/Isaac, 2021+）や JAX end-to-end は本論文の射程外。CPU-GPU 転送ボトルネックは構造的に残る。
- **抽象化の学習コスト**: policy optimizer / evaluator / policy graph の概念理解が必要（CleanRL の透明性とは逆のトレードオフ）。
- **スループット数値は当時のハード・参照実装比**: 04 レポート（Deep RL that Matters）の教訓どおり、横断比較は「方向性」として読むべき。
- **現行 RLlib（Ray 2.x）は本論文から大幅進化**: 論文の抽象化（policy graph 等）は最新 API（RLModule / Learner）と名称・構造が異なる。設計思想は有効だが API は要最新ドキュメント参照。

## 出典

- 論文: https://arxiv.org/abs/1712.09381
- HTML: https://ar5iv.labs.arxiv.org/html/1712.09381
- ドキュメント: https://docs.ray.io/en/latest/rllib/
