# JAX エコシステム — リソース収集結果

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem`（JAX エコシステム）の resource-collection (gather) フェーズ成果物。
フォーカス: end-to-end の GPU/TPU 強化学習を JAX で実現するライブラリ・環境・手法の基盤論文と関連特許。

## 収集パラメータ

| 項目 | 値 |
|------|-----|
| ドメイン | `rl_gpu_acceleration` |
| クラスタ | `jax_ecosystem`（JAX エコシステム） |
| 実行日 | 2026-06-26 |
| 対象期間 | 2021–2026（JAX RL は新領域。2021 の Brax/Podracer など基盤論文を含む） |
| キーワード | JAX, jit, vmap, pmap, lax.scan, XLA, PureJaxRL, Brax, MJX, gymnax, JaxMARL, Stoix, rejax, Mava, Jumanji, evosax, Craftax, XLand-MiniGrid, Kinetix, Podracer, meta-RL, in-context RL |
| 収集タイプ | 学術論文（arXiv 優先, 目標 8–10 本）/ 特許（Google Patents, 目標 3–5 件） |
| 検索ツール | WebSearch（URL 取得）→ WebFetch（全件検証） |

## 収集サマリ

| カテゴリ | 収集数 | 検証成功 | 破棄 |
|----------|--------|----------|------|
| 学術論文 | 10 | 10 | 0 |
| 特許 | 5 | 5 | 0 |
| 合計 | 15 | 15 | 0 |

- 学術論文は全件 arXiv の `abs/` ページを WebFetch でタイトル・著者・要旨と突き合わせ、本文一致を確認済み。
- 特許は全件 Google Patents ページを WebFetch で番号・出願人・出願年・発明者・内容と突き合わせ、本文一致を確認済み。
- 偽陽性（タイトル不一致・到達不能 URL）は 0 件。アンチハルシネーション方針により ID/番号の推測は一切行っていない。

## URL検証結果

| 種別 | URL | 検証方法 | 結果 |
|------|-----|----------|------|
| 論文 | https://arxiv.org/abs/2106.13281 | WebFetch（abstract 照合） | OK（Brax） |
| 論文 | https://arxiv.org/abs/2104.06272 | WebFetch（abstract 照合） | OK（Podracer） |
| 論文 | https://arxiv.org/abs/2210.05639 | WebFetch（abstract 照合） | OK（Discovered Policy Optimisation） |
| 論文 | https://arxiv.org/abs/2212.04180 | WebFetch（abstract 照合） | OK（evosax） |
| 論文 | https://arxiv.org/abs/2303.17503 | WebFetch（abstract 照合） | OK（Pgx） |
| 論文 | https://arxiv.org/abs/2306.09884 | WebFetch（abstract 照合） | OK（Jumanji） |
| 論文 | https://arxiv.org/abs/2311.10090 | WebFetch（abstract 照合） | OK（JaxMARL） |
| 論文 | https://arxiv.org/abs/2312.12044 | WebFetch（abstract 照合） | OK（XLand-MiniGrid） |
| 論文 | https://arxiv.org/abs/2402.16801 | WebFetch（abstract 照合） | OK（Craftax） |
| 論文 | https://arxiv.org/abs/2410.23208 | WebFetch（abstract 照合） | OK（Kinetix） |
| 特許 | https://patents.google.com/patent/US9754221B1/en | WebFetch（番号・出願人照合） | OK（Alphaics, RL processor） |
| 特許 | https://patents.google.com/patent/US10949743B2/en | WebFetch（番号・出願人照合） | OK（Alphaics, RL agent 実装） |
| 特許 | https://patents.google.com/patent/US10878314B2/en | WebFetch（番号・出願人照合） | OK（Alphaics, SIMA 学習） |
| 特許 | https://patents.google.com/patent/WO2017196693A1/en | WebFetch（番号・出願人照合） | OK（1026 Labs, TPU/ML 加速器） |
| 特許 | https://patents.google.com/patent/US20240135618A1/en | WebFetch（番号・出願人照合） | OK（NVIDIA, 物理 RL エージェント） |

## 全体の傾向

- **基盤レイヤは少数の研究室に集中**: Oxford FLAIR（Foerster ら: JaxMARL, Craftax, Kinetix, Discovered Policy Optimisation, evosax の Lange）、Google/DeepMind（Brax, Podracer）、InstaDeep（Jumanji, Mava）、dunnolab（XLand-MiniGrid）。JAX RL エコシステムは比較的小さなコミュニティが牽引している。
- **「環境 + アルゴリズムを同一アクセラレータ上で end-to-end コンパイル」**が共通設計思想。Podracer(2021) の Anakin/Sebulba が分散アーキテクチャの原典で、その後の PureJaxRL 系（Discovered Policy Optimisation）が `jit`+`vmap`+`lax.scan` による単一 GPU 上の数千倍高速化を実証した。
- **環境ライブラリの多様化**: 物理（Brax, Kinetix/Jax2D）、ボードゲーム（Pgx）、組合せ最適化（Jumanji）、オープンエンド（Craftax）、メタ/in-context RL（XLand-MiniGrid）、マルチエージェント（JaxMARL）、進化戦略（evosax）と、ほぼ全ジャンルが JAX 移植されている。
- **性能訴求が定量的かつ過激**: 「単一 GPU で 1B ステップを 1 時間」「14× / 12500×（vectorize 時）」「10–100×」「250×」など、CPU ベース実装に対するオーダー単位の高速化が各論文の中核主張。
- **特許は RL 特化アクセラレータが主流だが層が薄い**: Alphaics の SIMA（Single Instruction Multiple Agents）系特許群が「複数エージェント×複数環境の並列 RL」を専用ハードでカバー。JAX/XLA を名指しした特許は確認できず、JAX は主にオープンソース論文側で発展している（学術 vs 特許の非対称性が顕著）。NVIDIA は物理シミュレーション×RL のエージェント生成で特許化を進めている。

## 学術論文

| # | タイトル | 著者 | 年 | 発表先 | arXiv ID | URL | 概要（JA） |
|---|---------|------|----|--------|----------|-----|-----------|
| 1 | Brax -- A Differentiable Physics Engine for Large Scale Rigid Body Simulation | C. D. Freeman, E. Frey, A. Raichuk, S. Girgin, I. Mordatch, O. Bachem | 2021 | NeurIPS 2021 Datasets & Benchmarks | 2106.13281 | https://arxiv.org/abs/2106.13281 | JAX 製の微分可能剛体物理エンジン。PPO/SAC/ES 等の RL アルゴリズムを環境と同一アクセラレータ上でコンパイルし、MuJoCo 風タスクを数分で学習する基盤ライブラリ。 |
| 2 | Podracer architectures for scalable Reinforcement Learning | M. Hessel, M. Kroiss, A. Clark, I. Kemaev, J. Quan, T. Keck, F. Viola, H. van Hasselt | 2021 | arXiv（技術報告） | 2104.06272 | https://arxiv.org/abs/2104.06272 | TPU Pod 上で RL をスケールさせる Anakin / Sebulba の2アーキテクチャを提案。JAX による分散計算で TPU を効率・再現性高く活用する原典。 |
| 3 | Discovered Policy Optimisation | C. Lu, J. G. Kuba, A. Letcher, L. Metz, C. Schroeder de Witt, J. Foerster | 2022 | NeurIPS 2022 | 2210.05639 | https://arxiv.org/abs/2210.05639 | Mirror Learning 空間でメタ学習により drift 関数を最適化し（LPO）、そこから閉形式の DPO を導出。PureJaxRL の高速化基盤上で Brax において SOTA を確認した meta-RL 研究。 |
| 4 | evosax: JAX-based Evolution Strategies | R. T. Lange | 2022 | GECCO 2023 Companion | 2212.04180 | https://arxiv.org/abs/2212.04180 | jit・自動 vmap・ハードウェア並列化を活かす JAX 製進化戦略ライブラリ。CMA-ES や OpenAI-ES 等 30 種超を ask-evaluate-tell API で提供し、RL の勾配フリー最適化を支える。 |
| 5 | Pgx: Hardware-Accelerated Parallel Game Simulators for Reinforcement Learning | S. Koyamada, S. Okano, S. Nishimori, Y. Murata, K. Habara, H. Kita, S. Ishii | 2023 | NeurIPS 2023 Datasets & Benchmarks | 2303.17503 | https://arxiv.org/abs/2303.17503 | バックギャモン・チェス・将棋・囲碁等を JAX で実装した GPU/TPU 最適化ボードゲーム環境群。自動 vmap により Python 実装比 10–100× 高速化し、Gumbel AlphaZero 学習を実証。 |
| 6 | Jumanji: a Diverse Suite of Scalable Reinforcement Learning Environments in JAX | C. Bonnet, D. Luo, D. Byrne, S. Surana, A. Laterre, ほか（InstaDeep） | 2024 | ICLR 2024 | 2306.09884 | https://arxiv.org/abs/2306.09884 | ルーティング・パッキング・論理など産業由来の組合せ最適化問題を中心に据えた JAX 製スケーラブル RL 環境スイート。初期状態分布や難易度を高度にカスタマイズ可能。 |
| 7 | JaxMARL: Multi-Agent RL Environments and Algorithms in JAX | A. Rutherford, B. Ellis, M. Gallici, ほか, C. Lu, J. N. Foerster | 2024 | NeurIPS 2024 Datasets & Benchmarks | 2311.10090 | https://arxiv.org/abs/2311.10090 | 主要なマルチエージェント RL 環境・ベースラインを GPU 効率込みで統合した初のライブラリ。SMAX 等を含み、学習パイプラインは既存比 約14×、vectorize 時最大 12500× 高速。 |
| 8 | XLand-MiniGrid: Scalable Meta-Reinforcement Learning Environments in JAX | A. Nikulin, V. Kurenkov, I. Zisman, A. Agarkov, V. Sinii, S. Kolesnikov | 2023 | NeurIPS 2024 Datasets & Benchmarks | 2312.12044 | https://arxiv.org/abs/2312.12044 | XLand の多様性と MiniGrid の簡潔さを統合したメタ RL／in-context RL 向け grid-world 環境群。10^8 規模のユニークタスクを生成し、毎秒数百万ステップの学習を実現。 |
| 9 | Craftax: A Lightning-Fast Benchmark for Open-Ended Reinforcement Learning | M. Matthews, M. Beukman, B. Ellis, M. Samvelyan, M. Jackson, S. Coward, J. Foerster | 2024 | ICML 2024 | 2402.16801 | https://arxiv.org/abs/2402.16801 | Crafter/NetHack に着想したオープンエンド RL ベンチ。Craftax-Classic は原版比 250× 高速で、単一 GPU・1B インタラクションの PPO を 1 時間未満で実行可能。 |
| 10 | Kinetix: Investigating the Training of General Agents through Open-Ended Physics-Based Control Tasks | M. Matthews, M. Beukman, C. Lu, J. Foerster | 2024 | ICLR 2025 (Oral) | 2410.23208 | https://arxiv.org/abs/2410.23208 | JAX 製2D物理エンジン Jax2D 上で数千万の物理タスクを手続き生成し汎用 RL エージェントを学習。未見タスクへのゼロショット汎化と微調整効率の向上を実証。 |

## 特許

| # | タイトル | 特許番号 | 出願人 | 出願年 | 庁 | URL | 概要（JA） |
|---|---------|---------|--------|--------|----|-----|-----------|
| 1 | Processor for implementing reinforcement learning operations | US9754221B1 | Alphaics Corp（発明者: Nagendra Nagaraja） | 2017 | USPTO | https://patents.google.com/patent/US9754221B1/en | 複数 RL エージェント×複数環境を同時実行する SIMA（Single Instruction Multiple Agents）命令セットを備えた RL 専用プロセッサ。GPU より逐次意思決定に適すると主張。 |
| 2 | Method and System for Implementing Reinforcement Learning Agent Using Reinforcement Learning Processor | US10949743B2 | Alphaics Corp（発明者: Nagendra Nagaraja） | 2017 | USPTO | https://patents.google.com/patent/US10949743B2/en | ホストプロセッサが RL エージェント・環境を生成し、専用 RL プロセッサが v/a/q/r の4スレッドを並列実行する SIMA ベースのエージェント実装方式。 |
| 3 | System and method for training artificial intelligence systems using a SIMA based processor | US10878314B2 | Alphaics Corp（発明者: Nagendra Nagaraja） | 2017 | USPTO | https://patents.google.com/patent/US10878314B2/en | SIMA 命令で複数エージェントが環境コピー上を異なるポリシーで並列学習し最適解をマージする AI 学習手法。A3C 比で学習を高速化すると主張する RL 専用アクセラレータ特許。 |
| 4 | An apparatus for hardware accelerated machine learning | WO2017196693A1 | 1026 Labs Inc（発明者: J. Bruestle, C. Ng） | 2016（優先日）/ 2017（出願） | WIPO (PCT) | https://patents.google.com/patent/WO2017196693A1/en | テンソル縮約に最適化した多メモリバンク・Benes 多重キャスト網を備える TPU 型 ML 加速器。JAX/XLA が依存するアクセラレータ命令・データフロー層に関連。 |
| 5 | Generating artificial agents for realistic motion simulation using broadcast videos | US20240135618A1 | NVIDIA Corporation（発明者: H. Zhang, Y. Yuan, J. Peng, V. Makoviichuk, S. Fidler） | 2023 | USPTO | https://patents.google.com/patent/US20240135618A1/en | 放送映像から運動を抽出し物理制約を課して、強化学習で物理シミュレートされたキャラクタ制御器を学習。物理シミュレーション×RL によるエージェント生成特許。 |

## 次のステップ

1. **retrieval フェーズへの引き継ぎ**: 上記 10 論文を `docs/research/runs/rl_gpu_acceleration/retrieval/20260626_jax_ecosystem/` で個別詳細レポート化する。優先度は Brax / Podracer / Discovered Policy Optimisation（基盤）→ 環境スイート群 → evosax。
2. **クロスクラスタ整合**: 本クラスタは `pytorch_native`（PyTorch/Isaac 系）クラスタと性能ベンチマークが直接比較対象になるため、retrieval 時に「単一 GPU スループット」「vectorize 倍率」の数値を横断比較表に集約する。
3. **追加候補（今回未収集、retrieval 検討対象）**: PureJaxRL の blog（Chris Lu）/ MJX（MuJoCo XLA）/ gymnax（arXiv 論文なし・GitHub のみ）/ Mava (2107.01460) / Stoix・rejax（リポジトリのみ）。論文化されていない実装系はソフトウェアリソースとして別枠で扱う。
4. **特許の継続監視**: JAX/XLA を名指しした RL 特許は現時点で未確認。NVIDIA・Google 系の「accelerator 上の並列シミュレーション RL」関連の新規公開（2024–2026）を定点観測する。
