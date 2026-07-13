# 高速化の技術原理 — リソース収集結果

## 収集パラメータ (対象リソース: 学術論文+特許, 対象期間: 2022–2026 + 基礎文献, 収集日: 2026-06-26, 入力元: clustering結果 cluster-01-principles)

- 対象ドメイン: `rl_gpu_acceleration`
- 対象クラスタ: `principles`（高速化の技術原理 — なぜ GPU で RL が速くなるのか）
- フォーカス: host-device transfer, vectorized env, SIMT, JIT/XLA fusion, lax.scan/vmap, Anakin/Sebulba, mixed precision, CUDA graphs, warp divergence, sim-bound vs learner-bound, sample efficiency, Amdahl's law, large batch RL, asynchronous RL, IMPALA/V-trace
- 検索エンジン: WebSearch（arXiv 優先）+ Google Patents
- 検証方針: 検索結果に逐語で現れた URL のみ採用し、各エントリは WebFetch でタイトル一致を確認。不一致・到達不能は除外。

## 収集サマリ

| 領域 | 論文 | 特許 | 合計 |
|------|------|------|------|
| 高速化の技術原理 (principles) | 13 | 5 | 18 |

## URL検証結果

| 区分 | 収集 | 検証済み | 不一致除外 | アクセス不可除外 |
|------|------|----------|------------|------------------|
| 学術論文 | 13 | 13 | 0 | 0 |
| 特許 | 6 | 5 | 1 (US20230117499A1: GPU/並列言及なくクラスタ非該当のため除外) | 0 |
| 合計 | 19 | 18 | 1 | 0 |

注: Madrona 関連は SIGGRAPH 論文 ACM ページ (HTTP 403) は除外し、検証可能な Stanford Digital Repository の博士論文 (Shacklett 2025) を採用した。

## 全体の傾向

このクラスタの一次資料は「アクセラレータ上に環境とポリシーを閉じ込めると host↔device 転送が原理的に消える」という単一原理を、世代ごとに異なる角度から定量化している。第一世代 (GA3C 2016 / CuLE 2019) は CPU sim + GPU policy の直列構成での GPU 遊休と CPU-GPU 帯域ボトルネックを実測し、IMPALA 2018 / Sample Factory 2020 は actor-learner 分離・policy-lag・V-trace による非同期スループット最大化の系譜を確立した。第二世代 (Brax / Isaac Gym 2021, Podracer 2021) は「everything on accelerator」パラダイムと Anakin/Sebulba という配置戦略を定義し、JAX/XLA の jit+scan+vmap による融合カーネル化を実装レベルで示す。2022年以降 (EnvPool, Pgx, JaxMARL, PufferLib, MuJoCo Playground) はベクトル化 env をボードゲーム・MARL・ロボティクスへ横展開し、Staggered Resets 2025 は「大バッチ・短ロールアウトが収束を律速する」という FPS≠実時間の限界論を実証した。特許側は理論寄りのため数は少ないが、非同期並列 RL ワーカー (DeepMind/Google, RBC)、RL 専用 SIMD/SIMT プロセッサ (Alphaics)、マルチ GPU 学習 (IBM) という核心メカニズムを押さえる出願が存在する。総じて、論文は「原理の確立と限界の定量化」、特許は「並列ワーカー/専用ハードウェアの権利化」に分かれており、両者を併読すると sim-bound から learner-bound への遷移という本質が浮かび上がる。

## 学術論文

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|----|----|------|
| 1 | [Reinforcement Learning through Asynchronous Advantage Actor-Critic on a GPU (GA3C)](https://arxiv.org/abs/1611.06256) | Babaeizadeh ほか | 2016 | ICLR 2017 / arXiv:1611.06256 | A3C の CPU/GPU ハイブリッド実装をキューと動的スケジューリングで解析し、host-device オーバーヘッドと GPU 遊休（推論待ち）を定量化した、ボトルネック論の起点。 |
| 2 | [IMPALA: Scalable Distributed Deep-RL with Importance Weighted Actor-Learner Architectures](https://arxiv.org/abs/1802.01561) | Espeholt ほか | 2018 | ICML 2018 / arXiv:1802.01561 | acting と learning を分離した分散アーキテクチャと off-policy 補正 V-trace を提案し、policy-lag を許容しつつ 250K FPS を達成した非同期 RL の基礎文献。 |
| 3 | [Accelerating Reinforcement Learning through GPU Atari Emulation (CuLE)](https://arxiv.org/abs/1907.08467) | Dalton ほか | 2019 | NeurIPS 2020 / arXiv:1907.08467 | ALE を CUDA 移植し数千ゲームを GPU 上で並列実行・直接レンダリングすることで CPU-GPU 帯域ボトルネックを排し、単一 GPU で最大 155M frames/h を実現。 |
| 4 | [Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning](https://arxiv.org/abs/2006.11751) | Petrenko ほか | 2020 | ICML 2020 / arXiv:2006.11751 | 単一マシンに最適化した非同期 GPU サンプラーと off-policy 補正で 10^5 FPS 超を達成し、同期 RL の資源利用効率の低さ（double-buffered sampling）を批判。 |
| 5 | [Large Batch Simulation for Deep Reinforcement Learning](https://arxiv.org/abs/2103.07013) | Shacklett ほか | 2021 | ICLR 2021 / arXiv:2103.07013 | 「batch simulation」原理（数千リクエストを同時実行しメモリ・描画・同期コストを償却）により視覚的 3D 環境の学習を 2 桁高速化し、単一 GPU で 19,000+ FPS を実現。 |
| 6 | [Podracer architectures for scalable Reinforcement Learning](https://arxiv.org/abs/2104.06272) | Hessel ほか | 2021 | arXiv:2104.06272 | TPU Pod 向け 2 配置戦略 Anakin（env も JAX でデバイス上）と Sebulba（env は CPU ホスト）を定義し、環境の実行場所が高速化を決めるという原理を明示。 |
| 7 | [Brax — A Differentiable Physics Engine for Large Scale Rigid Body Simulation](https://arxiv.org/abs/2106.13281) | Freeman ほか | 2021 | NeurIPS 2021 (D&B) / arXiv:2106.13281 | JAX で書かれた剛体シミュレータで env と学習器を同一アクセラレータ上にコンパイルし、単一デバイスで数百万 steps/sec を達成する everything-on-device の代表例。 |
| 8 | [Isaac Gym: High Performance GPU-Based Physics Simulation For Robot Learning](https://arxiv.org/abs/2108.10470) | Makoviychuk ほか | 2021 | NeurIPS 2021 (D&B) / arXiv:2108.10470 | 物理シミュレーションとポリシー学習の双方を GPU 上に置き、physics buffer から PyTorch tensor へ直接データを渡すことで CPU ボトルネックを排し、学習時間を 2–3 桁短縮。 |
| 9 | [EnvPool: A Highly Parallel Reinforcement Learning Environment Execution Engine](https://arxiv.org/abs/2206.10558) | Weng ほか | 2022 | NeurIPS 2022 (D&B) / arXiv:2206.10558 | C++ スレッドプールと非同期実行モデルで env 並列実行を高速化し、Atari 1M FPS・MuJoCo 3M FPS を達成。CPU subprocess 方式（pickle/IPC/GIL）の限界を実証。 |
| 10 | [Pgx: Hardware-Accelerated Parallel Game Simulators for Reinforcement Learning](https://arxiv.org/abs/2303.17503) | Koyamada ほか | 2023 | NeurIPS 2023 (D&B) / arXiv:2303.17503 | JAX の auto-vectorization/parallelization でボードゲーム env をアクセラレータ上に実装し、Python 実装比 10–100x 高速化。ベクトル化原理の board game 横展開。 |
| 11 | [JaxMARL: Multi-Agent RL Environments and Algorithms in JAX](https://arxiv.org/abs/2311.10090) | Rutherford ほか | 2023 | NeurIPS 2024 (D&B) / arXiv:2311.10090 | GPU 効率と多数の MARL env を両立する初の JAX ライブラリで、wall-clock で約 14x、複数 run のベクトル化で最大 12,500x の高速化を報告。 |
| 12 | [Acceleration for Deep Reinforcement Learning using Parallel and Distributed Computing: A Survey](https://arxiv.org/abs/2411.05614) | Liu ほか | 2024 | ACM Computing Surveys / arXiv:2411.05614 | 学習系アーキテクチャ・simulation parallelism・computing parallelism・分散同期・進化的 RL を横断的に整理した網羅的サーベイ。原理の全体地図として機能。 |
| 13 | [Staggered Environment Resets Improve Massively Parallel On-Policy Reinforcement Learning](https://arxiv.org/abs/2511.21011) | Bharthulwar ほか | 2025 | arXiv:2511.21011 | 大規模 GPU 並列・短ロールアウト下で同期リセットが有害な非定常性を生むことを示し、staggered reset で sample efficiency と wall-clock 収束を改善。FPS≠実時間の限界論の実証。 |

補足: MuJoCo Playground (Zakka ほか, 2025, [arXiv:2502.08844](https://arxiv.org/abs/2502.08844))、PufferLib (Suarez, 2024, [arXiv:2406.12905](https://arxiv.org/abs/2406.12905))、Madrona バッチワールド・シミュレーション博士論文 (Shacklett, 2025, [Stanford Digital Repository](https://purl.stanford.edu/js274bf0548)) も検証済みの関連一次資料。MJX/単一 GPU 学習・C 実装による 1M sps・GPU バッチ世界シミュレーション engine という実装観点を補強するが、上表 13 件で原理被覆が十分なため本文は確認済み参照として併記する。

## 特許

| # | タイトル | 番号 | 出願人 | 年 | 特許庁 | 概要 |
|---|---------|------|--------|----|--------|------|
| 1 | [Asynchronous deep reinforcement learning](https://patents.google.com/patent/US20210166127A1/en) | US20210166127A1 | Google LLC（旧 DeepMind Technologies） | 2015（優先日） | USPTO | 複数のワーカーが単一マシン上で独立に env レプリカと相互作用し、共有 NN パラメータを非同期更新することで分散マルチマシン方式より通信・メモリコストを削減する非同期深層 RL の中核出願。 |
| 2 | [System and method for deep reinforcement learning](https://patents.google.com/patent/US20200143206A1/en) | US20200143206A1 | Royal Bank of Canada | 2018（優先日） | USPTO | 複数のハードウェアプロセッサ/スレッドをワーカーエージェントとして並列化非同期 RL（A3C 拡張）を実装し、各ワーカーが target 環境と同時に相互作用してグローバルパラメータを協調更新する方式。 |
| 3 | [Processor for implementing reinforcement learning operations](https://patents.google.com/patent/US9754221B1/en) | US9754221B1 | Alphaics Corp | 2017 | USPTO | RL 専用命令セット (ASI) を備えた専用プロセッサと "Single Instruction Multiple Agents (SIMA)" を提案。汎用 SIMD/SIMT (GPU) を逐次意思決定タスクに不適とする論点を明示しており SIMT 原理の比較対象。 |
| 4 | [Multi-GPU deep learning using CPUs](https://patents.google.com/patent/US11164079B2/en) | US11164079B2 | International Business Machines Corp | 2017 | USPTO | 複数 GPU の NN 学習を、同一ホストの遊休 CPU で勾配集約・同期を担わせ backward 計算とオーバーラップさせることで通信コストを削減するマルチ GPU 並列学習（all-reduce 系論点）の出願。 |
| 5 | [Efficient parallel training of a network model on multiple graphics processing units](https://patents.google.com/patent/US20180121806A1/en) | US20180121806A1 | International Business Machines Corp | 2016–2017 | USPTO | CPU が複数 GPU から勾配を収集・集約しつつ GPU が後続レイヤ処理を継続する重畳手法で、マルチ GPU 並列学習の勾配集約・通信オーバーヘッドを削減。 |

## 次のステップ

1. **retrieval フェーズ**: 上記の検証済み一次資料について `docs/research/runs/rl_gpu_acceleration/retrieval/20260626_principles/` に章別詳細レポート（逐語引用付き）を作成する。最優先は原理を定量化した GA3C / IMPALA / Sample Factory / Podracer / Brax / Isaac Gym / Large Batch Simulation / Staggered Resets。
2. **数値の逐語確認**: clustering で言及された「GA3C 108ms/10%/GPU 稼働率 56%」「IMPALA 250K FPS」「Brax 数百万 steps/sec」などを各 PDF の本文から逐語引用で確認・固定する。
3. **限界論の補強**: warp divergence・large batch の sample efficiency 劣化・Amdahl 的直列部分について、Staggered Resets と Survey (2411.05614) を軸に sim-bound→learner-bound 遷移の根拠を整理する。
4. **クラスタ間連携**: JIT/XLA fusion・lax.scan・vmap のメカニズム詳細は `jax_ecosystem` クラスタ、PyTorch/Isaac の tensor API は `pytorch_native` クラスタと重複するため、原理レイヤとツールレイヤの引用関係を retrieval 時に明示する。
