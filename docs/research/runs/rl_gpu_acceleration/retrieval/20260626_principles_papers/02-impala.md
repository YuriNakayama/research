# IMPALA — Scalable Distributed Deep-RL with Importance Weighted Actor-Learner Architectures（重要度重み付き Actor-Learner アーキテクチャによるスケーラブルな分散深層 RL）

## 基本情報

- **著者**: Lasse Espeholt, Hubert Soyer, Remi Munos, Karen Simonyan, Volodymir Mnih, Tom Ward, Yotam Doron, Vlad Firoiu, Tim Harley, Iain Dunning, Shane Legg, Koray Kavukcuoglu（DeepMind）
- **年**: 2018（初版 2018-02-05）
- **venue**: ICML 2018
- **arXiv ID**: 1802.01561
- **URL**: https://arxiv.org/abs/1802.01561

## 課題・背景（what problem）

単一エージェント・単一パラメータセットで**多数のタスクを同時に解く**には、膨大なロールアウトデータと長い学習時間を扱う必要がある。A3C 系の非同期手法は数百〜数千マシンへスケールしにくく、スケールさせると**データ効率・資源利用効率が犠牲**になりがちだった。IMPALA はこれを「**acting と learning の分離**」＋「**off-policy 補正**」で解決し、スループットとデータ効率を両立させることを狙う。

## 提案手法・コア機構（key mechanism）

- **decoupled actor-learner アーキテクチャ**: 多数の **actor** が経験の軌跡（状態・行動・報酬の系列）を中央の **learner** に送る。
  - 原文: *"actors communicate trajectories of experience (sequences of states, actions, and rewards) to a centralised learner."*
- **learner 側の大バッチ化**: learner は時間次元をバッチ次元に畳み込み、全入力に畳み込みネットを並列適用する。
  - 原文: *"IMPALA learner applies the convolutional network to all inputs in parallel by folding the time dimension into batch dimension ... increases the effective batch size to thousands."*
  - → 実効バッチを**数千**まで拡大し、GPU を高占有で回す。これが GA3C の「バッチ化」を分散規模に押し上げたもの。
- **V-trace off-policy 補正**: actor がデータを集めた時点のポリシー μ と、learner の現在ポリシー π がずれる（policy-lag）。このずれを原理的に補正するのが V-trace。
  - 原文: *"we introduce the V-trace off-policy actor-critic algorithm to correct for this harmful discrepancy."*
  - 切り捨て重要度重み: *"ρt=min(ρ̄, π(at|xt)/μ(at|xt)) and ci=min(c̄, π(ai|xi)/μ(ai|xi))"*。ρ̄ が固定点（価値関数のバイアス）を、c̄ が収束速度を制御する。

## 主要な定量結果（key numbers / verbatim quotes）

スループット:

- *"IMPALA achieves a throughput rate of 250,000 frames/sec or 21 billion frames/day."*
  - → **毎秒 25 万フレーム（= 1 日 210 億フレーム）**。
- *"making it over 30 times faster than single-machine A3C."*（**単一マシン A3C の 30 倍以上**）
- 構成別（Table 1 系）: 単一マシン IMPALA 17K–24K FPS、分散 A3C 46K–50K FPS、IMPALA 分散 80K FPS、**最適化バッチ128で 250K FPS**。

学習到達時間:

- *"IMPALA with 1 learner takes only around 10 hours to reach the same performance that A3C approaches after 7.5 days."*
  - → **A3C が 7.5 日かかる性能に IMPALA は約 10 時間**で到達。

マルチタスク性能（汎化）:

- **DMLab-30**: *"IMPALA, deep, PBT achieved 49.4% mean capped human normalised score"*（A3C deep の 23.8% を大きく上回る）。
- **Atari-57**: *"IMPALA, deep, multi-task ... reaches 59.7% median human normalised score"*（専門家別 A3C shallow の 54.9% を上回る）。タスク間の**正の転移**を確認。

## principles クラスタにおける意義（why this matters）

- GA3C の「バッチ化で GPU を埋める」を**分散スケール**へ拡張し、「actor は経験を集めるだけ、learner は大バッチで GPU を回す」という現代的な **actor-learner 分離パターン**を確立した。これは principles の「actor-learner 同期がボトルネック」「大バッチで GPU 稼働率を上げる」議論の中心事例。
- V-trace は「**非同期化でスループットを稼ぐと必ず policy-lag（off-policy 性）が生じる**」という原理的代償を、**バイアスを抑えつつ補正する数学的枠組み**として提示した。後続の Sample Factory・Podracer(Sebulba) も同型の off-policy 補正に依存しており、principles の「スループット ≠ ただ速いだけ／off-policy 補正が要る」という論点の起点。
- 「250,000 frames/sec」「30× faster」「A3C 7.5 日 → 10 時間」は、principles レポートの **steps/sec と収束までの実時間を区別する**算数（第 8 章）の代表的引用値。

## 限界・注意点

- IMPALA の高スループットは**多数マシン（分散）前提**。Sample Factory はこれを批判的に捉え「単一マシンでも同等以上を出せる」ことを示した（→ 03）。
- 環境ステップは依然 **CPU 上の actor** にあり、CPU シミュレーション律速・host-device 転送は残る。「すべてをアクセラレータ上に」乗せる JAX/Podracer-Anakin 流のパラダイムには至っていない。
- V-trace は off-policy 補正でバイアスを抑えるが、policy-lag が大きいと収束は劣化しうる（ρ̄, c̄ のチューニング依存）。

## 出典（URL）

- https://arxiv.org/abs/1802.01561
- フルテキスト: https://ar5iv.labs.arxiv.org/html/1802.01561
