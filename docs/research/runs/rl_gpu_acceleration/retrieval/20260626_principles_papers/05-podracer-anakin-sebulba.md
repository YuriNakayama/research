# Podracer architectures for scalable Reinforcement Learning（スケーラブルな強化学習のための Podracer アーキテクチャ：Anakin / Sebulba）

## 基本情報

- **著者**: Matteo Hessel, Manuel Kroiss, Aidan Clark, Iurii Kemaev, John Quan, Thomas Keck, Fabio Viola, Hado van Hasselt（DeepMind）
- **年**: 2021
- **venue**: arXiv (cs.LG) テクニカルレポート
- **arXiv ID**: 2104.06272
- **URL**: https://arxiv.org/abs/2104.06272

## 課題・背景（what problem）

TensorFlow / PyTorch / JAX は TPU・GPU を透過的に使えるが、その学習パイプラインは主に**教師あり学習**向けに最適化されている。RL エージェントを**アクセラレータ（特に TPU Pod）上でスケーラブルかつ効率的・再現可能に**学習する方法は未確立だった。本レポートは「TPU は RL に非常に適している」と論じ、**TPU Pod の資源を最大活用する 2 つのアーキテクチャ Anakin と Sebulba** を提示する。principles の **第 5 章「Anakin vs Sebulba」**の一次資料そのもの。

## 提案手法・コア機構（key mechanism）

### Anakin（すべてを TPU 上に）

- **環境ステップを RL 目的関数の forward 計算の一部として TPU 上で実行**し、複数の agent-environment 相互作用すべてを通して微分してパラメータ更新する。
  - 原文: *"The environment is stepped as part of the forward computation of a suitable RL objective, and the objective can then be differentiated all the way through multiple agent-environment interaction to update the parameters."*
- 各 TPU コアが**環境・行動選択・パラメータ更新のすべて**を担う。
  - 原文: *"Each TPU core includes the computation associated with the environment (in green), action selection (in yellow) and the parameter update (in pink)."*
- 決定的特徴: **host-device 転送ゼロ・Python オーバーヘッドゼロ**。
  - 原文: *"There are no host to device transfers, as the environment itself lives on the TPU, and there is no overhead from Python."*
- → principles の「すべてをアクセラレータ上で」「JIT/vmap でロールアウト全体を 1 カーネルに融合」の TPU 版。環境が JAX で書け、TPU 上で動くことが前提。

### Sebulba（TPU Pod 上の分散 actor-learner）

- 8 TPU コアを **A 個の actor コア**と **L = 8 − A 個の learner コア**に分割。
  - 原文: *"The 8 TPU cores attached to a CPU host are split between A actor cores and L=8−A learner cores. Actor cores process batches of observations to select actions."*
- **環境は host CPU 上でステップ**し、TPU コアを actor / learner の 2 集合に分ける。
  - 原文: *"It steps the environments on the host CPU, and splits the available 8 TPU cores (for each host) in two disjoint sets."*
- actor スレッドが固定長の軌跡バッチをデバイス上に蓄積し、バッチ次元で分割して各 learner に直接シャードを送る。
  - 原文: *"Each actor thread accumulates a batch of trajectories of fixed length on device, splits the batch of trajectories along the batch dimension, sends each shard directly to one of the learners."*
- → 環境が TPU 上で動かせない（外部エンジン・重い物理）場合向けの、IMPALA 流 actor-learner 分離を TPU Pod に最適化した形。V-trace 等の off-policy 補正を併用。

## 主要な定量結果（key numbers / verbatim quotes）

Anakin:

- **555 million steps per second** on 8-core free TPU（Colab の無料 TPU で 5.55 億 steps/sec）。
- 複雑なメタ学習タスクで **3 million steps per second on a 16-core TPU**。
- **24 時間**学習で **約 100 ドル**のコスト。

Sebulba:

- V-trace エージェントで **200K frames per second on an 8 core TPU**。
- **200 million frames of Atari** を **約 1 時間 / 2.88 ドル**で。
- フル Pod（2048 TPU コア）で **43 million frames per second**。
- MuZero で **9 時間 / 約 40 ドル**。

> 注: 上記数値は本文/図から取得。abstract には数値は無く、「TPU Pod の資源を最大活用する 2 アーキテクチャを記述する」とのみ記載されている。

## principles クラスタにおける意義（why this matters）

- **「いつ Anakin、いつ Sebulba」**という配置戦略の選択軸を明示した、principles 第 5 章の核となる一次資料。
  - **Anakin** = 環境がアクセラレータ上で表現できる（JAX で書ける軽量環境）→ host 転送ゼロで圧倒的スループット（5.55 億 steps/sec）。これは principles の「すべてをアクセラレータ上で」「ロールアウト全体を 1 カーネルへ融合」の極北。
  - **Sebulba** = 環境が host CPU を要する → IMPALA 流分散だが TPU Pod に最適化。principles の「actor-learner 分離 + off-policy 補正」を TPU でスケールさせた形。
- 「555M steps/sec」「24h / $100」「43M FPS（フル Pod）」は、principles の「**環境を乗せられるなら桁が変わる**」「**コスト効率**」の代表的引用値。Anakin が後の PureJaxRL / Brax / Gymnax といった「end-to-end JAX RL」の設計思想の母体になった。

## 限界・注意点

- **Anakin は環境がアクセラレータ上で動かせることが必須**。任意の既存環境（外部物理エンジン・ゲーム）には適用できず、JAX 等での環境再実装を要する（principles 第 7 章「効かない場合」と整合）。
- TPU Pod という特殊で高価なインフラ前提。GPU 単体ユーザにそのまま当てはまらない部分がある（ただし Anakin の発想は GPU + JAX に移植可能）。
- テクニカルレポートであり、査読付き比較実験というより設計パターンの提示が主眼。報告数値は構成依存。

## 出典（URL）

- https://arxiv.org/abs/2104.06272
- フルテキスト: https://ar5iv.labs.arxiv.org/html/2104.06272
