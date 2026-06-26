# Podracer — スケーラブル RL のためのアーキテクチャ（Anakin / Sebulba）

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem` / retrieval（個別 deep-dive）

## 基本情報

| 項目 | 内容 |
|------|------|
| タイトル | Podracer architectures for scalable Reinforcement Learning |
| 著者 | Matteo Hessel, Manuel Kroiss, Aidan Clark, Iurii Kemaev, John Quan, Thomas Keck, Fabio Viola, Hado van Hasselt |
| 年 | 2021（投稿日: 2021-04-13） |
| venue | arXiv 技術報告（DeepMind technical report） |
| arXiv ID | 2104.06272 |
| URL | https://arxiv.org/abs/2104.06272 |
| 所属 | DeepMind |

## 課題・背景

RL エージェントを大規模に学習する最良の方法は未確立で、TensorFlow / PyTorch / JAX は TPU・GPU を透過的に使えるが、深層学習の標準パイプラインは（教師あり/自己教師あり学習を前提に設計され）RL の actor-learner 構造には最適化されていない。本報告は **TPU Pod（低レイテンシ相互接続された複数 TPU デバイス）が RL 学習に特に適している**と主張し、TPU Pod のリソースを最大活用する2つのアーキテクチャ「Anakin」「Sebulba」を提示する。

要旨 VERBATIM（抜粋）: *"we argue that TPUs are particularly well suited for training RL agents in a scalable, efficient and reproducible way. Specifically we describe two architectures designed to make the best use of the resources available on a TPU Pod"*

## 提案手法・コア機構

### Anakin アーキテクチャ（everything-on-accelerator）

- **環境・行動選択・パラメータ更新のすべてを TPU 上で実行**。CPU ホストは計算のスケジューリングのみを担う。各 TPU コアが環境・action selection・parameter update を含む（本文: *"Each TPU core includes the computation associated with the environment, action selection and the parameter update."*）。
- **JAX 機構の使われ方**（本文 verbatim）:
  - 最小計算単位を **`vmap`** でバッチ方向にベクトル化し、1 TPU コアを十分に使い切るバッチサイズを確保する。
  - ベクトル化済み関数を **`pmap`** で TPU の **8 コア**に複製・分散する（*"the vectorized function is distributed across the 8 cores of a TPU, by using the pmap primitive to replicate the program across all cores."*）。
  - 環境ステップを RL 目的関数の forward 計算の一部として進め、agent-environment interaction を通して微分してパラメータ更新する（環境を計算グラフに組み込む。`lax.scan` 的なロールアウト融合と組み合わせる）。
  - **`psum`/`pmean`** でコア間のパラメータ更新を平均化する collective を使用。
- 用途: online learning（環境がアクセラレータ上で動かせる軽量・並列可能なケース、grid-world・メタ学習など）。

### Sebulba アーキテクチャ（actor-learner 分離）

- **8 TPU コアを A 個の actor コアと L = 8 − A 個の learner コアに分割**（*"The 8 TPU cores attached to a CPU host are split between A actor cores and L=8−A learner cores."*）。環境計算は CPU ホスト側で実行し、推論（action selection）と学習を TPU 上で行う。
- データフロー: 各 actor スレッドが固定長軌跡のバッチを device 上に蓄積→バッチ次元で分割→device-to-device の高速通信で各 learner に shard を直接送る。learner スレッドが **`pmap`** で更新を実行し、**`pmean`/`psum`** で learner コア間のパラメータを平均化。
- 用途: 環境がアクセラレータに載らない（CPU でしか動かない）従来型エージェント、V-trace/IMPALA・MuZero など decomposed actor-learner エージェント。

## 主要な定量結果（VERBATIM 引用・条件付き）

ar5iv 本文より verbatim。**条件を必ず併記**すること。

### Anakin
- *"555 million steps per second"* — 条件: 小規模ネットワーク・grid-world を**無料 Colab TPU 上**で実行した場合。
- *"333 million steps per second"* — 条件: メタ学習を **16 コア TPU・60K 環境**で実行した場合。
- 学習時間/コスト: *"approximately 24 hours"* かつ *"approximately 100 dollars"*（上記メタ学習設定の到達コスト）。

### Sebulba（V-trace / IMPALA）
- *"200 million frames"* の学習が **8 コア TPU**上で *"just ∼1 hour"*、コスト *"approximately 2.88 dollars"*。
- actor バッチサイズを 32→128 に増やすと *"200K frames per second"* に到達。
- **フル Pod（2048 コア）**では *"43 million frames per second"*（Pong を 1 分未満で解く）。

### Sebulba（MuZero）
- *"200M Atari frames takes 9 hours on a 16-core TPU"*、コスト *"∼40 $"*。

（注: 二次情報の SyncedReview 記事は「grid-world で five million steps per second」「16-core TPU で over 3 million steps per second」「200M フレームの Atari を 1 時間」等の概数を伝えるが、上記の本文 verbatim 数値を一次根拠とする。）

## JAX エコシステムにおける位置づけ

- **JAX RL の分散アーキテクチャの原典**。Anakin（全部アクセラレータ上）と Sebulba（actor-learner 分離）は、その後の PureJaxRL 系（単一 GPU 上で `jit`+`vmap`+`lax.scan` を回す Anakin 流）と、InstaDeep の Sebulba 実装（Cloud TPU スケーリング）に直接継承された。
- 本クラスタの他論文（JaxMARL, Stoix, Mava）は Anakin/Sebulba パターンを前提に設計されている。「end-to-end をアクセラレータでコンパイルする」という共通設計思想の源流。

## 限界・注意点

- 主張は **TPU Pod 前提**。GPU 単一機での数値ではないため、`pytorch_native` クラスタや GPU ベース比較に直接持ち込むときは「TPU・Pod 構成」という条件を必ず明示する。
- Anakin は環境がアクセラレータ上で書ける（並列・JAX 化可能な）ケースに限る。CPU 専用環境では Sebulba を要する。
- コスト数値は 2021 年時点の Google Cloud TPU 課金前提。

## 出典

- arXiv abstract page: https://arxiv.org/abs/2104.06272 （WebFetch でタイトル・著者・要旨・venue を照合）
- ar5iv 本文: https://ar5iv.labs.arxiv.org/html/2104.06272 （Anakin/Sebulba 機構・定量数値を verbatim 抽出、2026-06-26）
- 二次情報（概数の裏取り）: SyncedReview, "DeepMind 'Podracer' TPU-Based RL Frameworks..." 2021-04-19
