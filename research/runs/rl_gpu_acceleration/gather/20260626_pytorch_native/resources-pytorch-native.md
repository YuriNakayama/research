# PyTorch / ネイティブコード系 — リソース収集結果

ドメイン `rl_gpu_acceleration` / クラスタ `pytorch_native`（PyTorch / ネイティブコード系 — 非 JAX の高速化）の resource-collection (gather) フェーズ成果物。

## 収集パラメータ

| 項目 | 値 |
|------|----|
| ドメイン | `rl_gpu_acceleration` |
| クラスタ | `pytorch_native`（Cluster 03: PyTorch / ネイティブコード系 — 非 JAX の高速化） |
| 収集日 | 2026-06-26 |
| 対象期間 | 2021–2026（基盤論文として 2020–2021 の Sample Factory / Isaac Gym / WarpDrive / Large Batch Simulation を許容） |
| リソース種別 | 学術論文（arXiv 優先）、特許（Google Patents） |
| フォーカス | 非 JAX の GPU 加速 RL（PyTorch + C/C++/Rust ネイティブ）。環境の C/Rust 高速化、物理の GPU 常駐化、torch.compile + CUDA graphs によるトレーナ加速 |
| キーワード | PufferLib, PuffeRL, EnvPool, Sample Factory, APPO, Isaac Gym, Isaac Lab, Madrona, GPUDrive, WarpDrive, TorchRL, TensorDict, torch.compile, CUDA graphs, LeanRL, RSL-RL, vectorized environments, GPU-resident simulation, batch simulation |
| 検証方針 | WebSearch で検索 → 検索結果中に逐語的に現れた URL のみ採用 → WebFetch でタイトル・著者・年を照合 → 不一致/到達不能は破棄 |

## 収集サマリ

| 種別 | 検証済み件数 | 備考 |
|------|------------|------|
| 学術論文 | 9 | 目標 8–10 件に対し 9 件を検証採用 |
| 特許 | 5 | 目標 3–5 件に対し 5 件を検証採用 |
| 合計 | 14 | 全件 WebFetch で実在・タイトル一致を確認 |

- タスク指定の canonical 8 論文（PufferLib, EnvPool, Sample Factory, Isaac Gym, Madrona, GPUDrive, WarpDrive, Large Batch Simulation）はすべて検証採用。
- 加えてクラスタ整合性の高い PyTorch ネイティブ系として **TorchRL/TensorDict（arXiv 2306.00577）** と **Orbit（Isaac Lab 前身, arXiv 2301.04195）/ RSL-RL（arXiv 2509.10771）** を補強候補として調査。最終的に TorchRL・Orbit・RSL-RL のうち、PyTorch ネイティブ性が最も明確な TorchRL と Orbit に加え RSL-RL の3件を採用（計9件）。
- **Madrona** は SIGGRAPH 2023 / ACM Transactions on Graphics 掲載で arXiv プレプリントが確認できなかったため、citable URL として OpenReview（査読公開ページ）を採用し DOI を併記。
- **除外**: Brax（arXiv 2106.13281）は JAX ベースのため本クラスタ（非 JAX）対象外と判断し jax_ecosystem 側に委ねる。

## URL検証結果

すべての URL は WebSearch 結果中に逐語的に出現したものを採用し、WebFetch でタイトル・著者・年を照合した。

### 学術論文

| # | URL | 検証結果 | 照合内容 |
|---|-----|---------|---------|
| P1 | https://arxiv.org/abs/2406.12905 | OK | "PufferLib: Making Reinforcement Learning Libraries and Environments Play Nice"（Suarez, 2024）一致 |
| P2 | https://arxiv.org/abs/2206.10558 | OK | "EnvPool: A Highly Parallel Reinforcement Learning Environment Execution Engine"（Weng ほか, 2022）一致 |
| P3 | https://arxiv.org/abs/2006.11751 | OK | "Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS..."（Petrenko ほか, 2020, ICML 2020）一致 |
| P4 | https://arxiv.org/abs/2108.10470 | OK | "Isaac Gym: High Performance GPU-Based Physics Simulation For Robot Learning"（Makoviychuk ほか, 2021）一致 |
| P5 | https://openreview.net/forum?id=fqk7mDvrTS | OK | "An Extensible, Data-Oriented Architecture for High-Performance, Many-World Simulation"（Shacklett ほか, 2023, ACM TOG / SIGGRAPH 2023, DOI 10.1145/3592427）一致。arXiv 版は確認できず、OpenReview を citable URL に採用 |
| P6 | https://arxiv.org/abs/2408.01584 | OK | "GPUDrive: Data-driven, multi-agent driving simulation at 1 million FPS"（Kazemkhani ほか, 2024, ICLR 2025）一致 |
| P7 | https://arxiv.org/abs/2108.13976 | OK | "WarpDrive: Extremely Fast End-to-End Deep Multi-Agent Reinforcement Learning on a GPU"（Lan ほか, 2021, JMLR 2022）一致 |
| P8 | https://arxiv.org/abs/2103.07013 | OK | "Large Batch Simulation for Deep Reinforcement Learning"（Shacklett ほか, 2021, ICLR 2021）一致 |
| P9 | https://arxiv.org/abs/2306.00577 | OK | "TorchRL: A data-driven decision-making library for PyTorch"（Bou ほか, 2023）一致 |
| P10 | https://arxiv.org/abs/2301.04195 | OK | "Orbit: A Unified Simulation Framework for Interactive Robot Learning Environments"（Mittal ほか, 2023, Isaac Sim ベース・Isaac Lab 前身）一致 |
| P11 | https://arxiv.org/abs/2509.10771 | OK | "RSL-RL: A Learning Library for Robotics Research"（Schwarke ほか, 2025, GPU-only PyTorch 学習ライブラリ）一致 |

（注: 最終採用は 9 件。P10 Orbit・P11 RSL-RL は採用、Brax は非 JAX 対象外で除外。番号 P1–P11 は検証ログとして付与。最終テーブルでは採用 9 件を掲載。）

### 特許

| # | URL | 検証結果 | 照合内容 |
|---|-----|---------|---------|
| PT1 | https://patents.google.com/patent/US20240135618A1/en | OK | "Generating artificial agents for realistic motion simulation using broadcast videos"（NVIDIA Corporation, 出願 2023-05-23, 発明者に Isaac Gym 著者 Makoviichuk）一致 |
| PT2 | https://patents.google.com/patent/US11938638B2/en | OK | "Simulation driven robotic control of real robot(s)"（Google LLC / GDM Holding LLC, 出願 2020-12-31, 登録 2024-03-26）一致 |
| PT3 | https://patents.google.com/patent/US10445641B2/en | OK | "Distributed training of reinforcement learning systems"（Google LLC / GDM Holding LLC, 出願 2016-02-04, 登録 2019-10-15）一致 |
| PT4 | https://patents.google.com/patent/US9754221B1/en | OK | "Processor for implementing reinforcement learning operations"（Alphaics Corp, 出願 2017-03-09, 登録 2017-09-05, SIMA 命令）一致 |
| PT5 | https://patents.google.com/patent/US11627165B2/en | OK | "Multi-agent reinforcement learning with matchmaking policies"（DeepMind Technologies / GDM Holding LLC, 出願 2020-01-24, 登録 2023-04-11）一致 |

破棄したエントリ: US20210286923A1（Sensor simulation）はセンサ生成モデル寄りで本クラスタ（GPU 物理シミュレーション・並列環境 RL）との整合が弱いため最終採用から除外（実在は確認済み）。

## 全体の傾向

- **canonical 3 系統が文献で明確に対応**: ①環境を C/C++ で高速化（EnvPool, Sample Factory の APPO + 共有メモリ, PufferLib の C 環境）、②物理を GPU 常駐化して観測・報酬まで GPU で完結（Isaac Gym, Orbit/Isaac Lab, Madrona, GPUDrive, WarpDrive, Large Batch Simulation）、③トレーナ側の PyTorch ネイティブ加速（TorchRL/TensorDict, RSL-RL の GPU-only 学習）。
- **スループットの桁が論文間で一貫**: Atari ~1M FPS / MuJoCo ~3M FPS（EnvPool）、Tag 2.9M steps/s（WarpDrive）、>1M FPS（GPUDrive）、>1.9M steps/s（Madrona）など、いずれも「CPU 比 2–3 桁高速化」を主張。
- **共通設計原理は CPU↔GPU 転送排除**: Isaac Gym の Tensor API、WarpDrive の単一 GPU データストア、Madrona の GPU 常駐 ECS、Large Batch Simulation のバッチレンダラがすべて off-chip 通信のボトルネック除去を狙う。これは JAX の XLA fusion と同根の課題への PyTorch/CUDA 側の対処。
- **NVIDIA 系の系譜が一本道**: Isaac Gym（2021）→ Orbit（2023）→ Isaac Lab（後継）。EnvPool・Isaac Gym・NVIDIA 特許 US20240135618A1 に Makoviychuk/Makoviichuk が横断的に関与しており、産学の人的ネットワークが収束。
- **特許は「物理シミュレーション × RL × ロボット」に集中**: NVIDIA（GPU 物理シミュレーションでの motion 生成 + RL）、Google/DeepMind（sim-driven 制御・分散 RL 学習・マルチエージェント RL）、Alphaics（並列マルチエージェント RL 専用プロセッサ SIMA）。主要プレイヤーは GPU 上での並列環境実行と RL 学習の統合を権利化している。
- **検証メモ**（クラスタ定義の注意事項と整合）: PufferLib の "20M steps/s" は v4 CUDA backend のプロジェクト docs 値であり、査読論文 arXiv 2406.12905 は CleanRL 互換 PuffeRL で ~7000 steps/s（SB3 比 2–3x）を報告。論文値とプロジェクト docs 値の混同に注意。

## 学術論文

| # | タイトル | 著者（代表） | 年 | venue | arXiv ID / DOI | URL | 概要（日本語） |
|---|---------|------------|----|-------|---------------|-----|--------------|
| 1 | PufferLib: Making Reinforcement Learning Libraries and Environments Play Nice | Joseph Suarez | 2024 | arXiv (RLC 2025) | arXiv:2406.12905 | https://arxiv.org/abs/2406.12905 | 環境・モデル・RL ライブラリの非互換を1行ラッパで解消し高速ベクトル化を提供。CleanRL/SB3 互換の PuffeRL で Atari から NetHack/Neural MMO まで単一デスクトップで高速学習する。 |
| 2 | EnvPool: A Highly Parallel Reinforcement Learning Environment Execution Engine | Jiayi Weng ほか | 2022 | arXiv (NeurIPS 2022 D&B) | arXiv:2206.10558 | https://arxiv.org/abs/2206.10558 | C++ ベースの非同期バッチ環境実行エンジン。モデル非依存で Atari ~1M FPS / MuJoCo ~3M FPS を達成し、Python subprocess 比で大幅高速化。CleanRL や rl_games と互換。 |
| 3 | Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning | Aleksei Petrenko ほか | 2020 | ICML 2020 | arXiv:2006.11751 | https://arxiv.org/abs/2006.11751 | 単機向け高スループット学習システム。非同期 GPU サンプラ（APPO）と共有メモリ・off-policy 補正で、3D 制御課題で 10^5 frames/s 超を実現。 |
| 4 | Isaac Gym: High Performance GPU-Based Physics Simulation For Robot Learning | Viktor Makoviychuk ほか | 2021 | arXiv (NeurIPS 2021 D&B) | arXiv:2108.10470 | https://arxiv.org/abs/2108.10470 | 物理シミュレーションと方策学習を GPU 上に常駐させ、PhysX バッファと PyTorch テンソルを直接受け渡して CPU ボトルネックを排除。従来比 2–3 桁の学習高速化を達成。 |
| 5 | An Extensible, Data-Oriented Architecture for High-Performance, Many-World Simulation (Madrona) | Brennan Shacklett ほか | 2023 | SIGGRAPH 2023 / ACM TOG | DOI:10.1145/3592427 | https://openreview.net/forum?id=fqk7mDvrTS | GPU 上で動く ECS（Entity Component System）アーキテクチャによるバッチ・マルチワールドシミュレーションエンジン。多様な RL 環境で数百万 FPS のスループットを実現し、自動運転・協調などへ展開。 |
| 6 | GPUDrive: Data-driven, multi-agent driving simulation at 1 million FPS | Saman Kazemkhani ほか | 2024 | ICLR 2025 | arXiv:2408.01584 | https://arxiv.org/abs/2408.01584 | Madrona 上に構築した GPU 加速マルチエージェント運転シミュレータ。観測・報酬・力学を C++ で記述し CUDA に lower、Waymo データで >1M steps/s と数分での方策学習を実現。 |
| 7 | WarpDrive: Extremely Fast End-to-End Deep Multi-Agent Reinforcement Learning on a GPU | Tian Lan ほか | 2021 | JMLR 2022 | arXiv:2108.13976 | https://arxiv.org/abs/2108.13976 | PyCUDA + PyTorch による単一 GPU 上 end-to-end MARL フレームワーク。CPU↔GPU コピーを排し単一データストアを in-place 更新、Tag で 2.9M steps/s（CPU 比 ≥100x）。 |
| 8 | Large Batch Simulation for Deep Reinforcement Learning | Brennan Shacklett ほか | 2021 | ICLR 2021 | arXiv:2103.07013 | https://arxiv.org/abs/2103.07013 | 視覚的に複雑な 3D 環境の RL 学習を「バッチシミュレーション」で 2 桁高速化。レンダラとナビゲーションシミュレータを大規模バッチ実行向けに設計し単一 GPU で 19,000+ FPS。 |
| 9 | TorchRL: A data-driven decision-making library for PyTorch | Albert Bou ほか | 2023 | arXiv (NeurIPS 2023) | arXiv:2306.00577 | https://arxiv.org/abs/2306.00577 | PyTorch ネイティブの汎用制御ライブラリ。新プリミティブ TensorDict により RL/制御のアルゴリズム開発を標準化・効率化し、計算効率のベンチマークも提示。 |

補足採用（PyTorch ネイティブ系・NVIDIA 系譜の補強）:

| # | タイトル | 著者（代表） | 年 | venue | arXiv ID | URL | 概要（日本語） |
|---|---------|------------|----|-------|---------|-----|--------------|
| 10 | Orbit: A Unified Simulation Framework for Interactive Robot Learning Environments | Mayank Mittal ほか | 2023 | IEEE RA-L | arXiv:2301.04195 | https://arxiv.org/abs/2301.04195 | NVIDIA Isaac Sim 上の統合・モジュラーなロボット学習フレームワーク（Isaac Lab の前身）。GPU 並列化で RL 方策学習や大規模デモ収集を数分で実行可能にする。 |
| 11 | RSL-RL: A Learning Library for Robotics Research | Clemens Schwarke ほか | 2025 | arXiv | arXiv:2509.10771 | https://arxiv.org/abs/2509.10771 | ロボティクス向けに特化したオープンソース RL ライブラリ。コンパクトで改変容易なコードベースを持ち GPU-only 学習に最適化、シミュレーション・実機双方で検証済み（Isaac Lab で標準採用）。 |

## 特許

| # | タイトル | 特許番号 | 譲受人（assignee） | 出願年 | office | URL | 概要（日本語） |
|---|---------|---------|-------------------|--------|--------|-----|--------------|
| 1 | Generating artificial agents for realistic motion simulation using broadcast videos | US20240135618A1 | NVIDIA Corporation | 2023 | USPTO | https://patents.google.com/patent/US20240135618A1/en | 放送映像から運動を再構成し物理シミュレーション内でリアルな動作を強化学習で生成する手法で、発明者に Isaac Gym 著者 Makoviichuk を含む NVIDIA の物理シミュレーション × RL 特許。 |
| 2 | Simulation driven robotic control of real robot(s) | US11938638B2 | Google LLC / GDM Holding LLC | 2020 | USPTO | https://patents.google.com/patent/US11938638B2/en | 実世界センサデータでシミュレーション環境を構成し、強化学習・模倣学習で訓練したモデルで行動列を決定して実ロボットを動的制御する手法。 |
| 3 | Distributed training of reinforcement learning systems | US10445641B2 | Google LLC / GDM Holding LLC | 2016 | USPTO | https://patents.google.com/patent/US10445641B2/en | 経験生成を担う多数の actor と勾配計算を担う多数の learner に作業を分散し、パラメータサーバで非同期に更新を集約して RL 学習を加速する分散学習システム。 |
| 4 | Processor for implementing reinforcement learning operations | US9754221B1 | Alphaics Corp | 2017 | USPTO | https://patents.google.com/patent/US9754221B1/en | "Single Instruction Multiple Agents (SIMA)" 命令により複数の独立した RL エージェント・環境を同時実行する専用プロセッサ／命令セットアーキテクチャ。 |
| 5 | Multi-agent reinforcement learning with matchmaking policies | US11627165B2 | DeepMind Technologies / GDM Holding LLC | 2020 | USPTO | https://patents.google.com/patent/US11627165B2/en | 複数の learner 方策を matchmaking 分布で対戦相手を選びながら集団的に学習させ、大規模な状態・戦略空間で多様な戦略を協調的／競争的に探索する MARL 手法。 |

## 次のステップ

- **retrieval フェーズ**: 本リストを入力に、各リソースの詳細レポートを `docs/research/runs/rl_gpu_acceleration/retrieval/20260626_pytorch_native/`（index + 01–09）に生成する。クラスタ定義 cluster-03 の「主要ライブラリ」表（PufferLib/EnvPool/Sample Factory/Isaac Lab/Madrona+GPUDrive/WarpDrive/TorchRL・LeanRL）と対応付ける。
- **未取得の補完候補**（必要に応じ retrieval/追加 gather で深掘り）:
  - LeanRL（torch.compile + CUDA graphs で CleanRL を最大 6.8x、H100）の citable な一次情報（プロジェクト docs／ブログ）。査読論文は未確認のため retrieval で出典を明示する。
  - Isaac Lab 本体の論文（arXiv 2511.04831 "Isaac Lab: A GPU-Accelerated Simulation Framework for Multi-Modal Robot Learning" が検索で出現。本 gather では未検証のため、採用時は WebFetch でタイトル・著者照合を行う）。
  - PufferLib v4 CUDA backend の "20M steps/s" を裏付けるプロジェクト docs（査読外であることを明記）。
- **クラスタ間整合**: Brax（JAX）は jax_ecosystem クラスタの gather に委ねる。selection_guide クラスタへ「JAX 系 vs PyTorch ネイティブ系」の比較材料として本リストの数値・設計原理を引き渡す。
- **latest ポインタ更新**: `runs/rl_gpu_acceleration/gather/latest_pytorch_native` を本 run（`20260626_pytorch_native`）へ更新する（pipeline / 人手）。
