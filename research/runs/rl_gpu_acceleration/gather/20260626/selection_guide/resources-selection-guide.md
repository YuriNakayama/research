# 実装・選定実践ガイド — リソース収集結果

GPU 高速化強化学習（RL）における **実装の実務知見・フレームワーク選定・再現性・ベンチマーク・スケーリング** に焦点を当てた、方法論／比較系のリソース収集結果。クラスタ ID: `selection_guide`（実装・選定実践ガイド）。

## 収集パラメータ

| 項目 | 値 |
|------|----|
| ドメイン | `rl_gpu_acceleration`（強化学習の GPU 高速化技術） |
| クラスタ | `selection_guide`（実装・選定実践ガイド） |
| フォーカス | PyTorch vs JAX、RL ライブラリ比較、再現性、ベンチマーク、ハードウェア選定、スケーリング則、分散 RL、実装ディテール |
| 対象期間 | 2017–2026（方法論基礎論文として 2017–2020 を含む） |
| リソース種別 | 学術論文（arXiv 優先）8–10 件、特許 2–4 件 |
| 収集日 | 2026-06-26 |
| 検証方法 | WebSearch で URL を取得 → WebFetch で arXiv abstract / 特許ページを照合 |
| 出力言語 | 日本語 |

## 収集サマリ

| 種別 | 収集数 | URL検証済 | 備考 |
|------|--------|-----------|------|
| 学術論文 | 12 | 12 | 全件 arXiv abstract / JMLR / ICLR Blog Track ページで照合済 |
| 特許 | 3 | 3 | Google Patents ページで assignee・出願年・タイトルを照合済 |
| **合計** | **15** | **15** | 未検証エントリは全て破棄 |

学術論文は当初目標（8–10 件）をやや上回る 12 件を採用。いずれも「実装ディテール／再現性／ライブラリ比較／スケーリング則／物理エンジン比較」のいずれかに該当し、本クラスタの方法論・比較志向に合致するため残した。特許は「分散 RL 学習」「RL ニューラルネット学習」「シミュレーション・オーケストレーション」の 3 系統で genuine hit のみ採用（水増しなし）。

## URL検証結果

全エントリを WebFetch で個別照合し、タイトル・著者・年が一致したもののみを採用。タイトル不一致・到達不能の URL は 0 件（破棄なし）。

| # | 種別 | エントリ | 検証 URL | 結果 |
|---|------|----------|----------|------|
| 1 | 論文 | CleanRL (2111.08819) | arxiv.org/abs/2111.08819 | OK（タイトル・著者一致） |
| 2 | 論文 | What Matters in On-Policy RL (2006.05990) | arxiv.org/abs/2006.05990 | OK |
| 3 | 論文 | The 37 Implementation Details of PPO | iclr-blog-track.github.io/2022/03/25/... | OK（ICLR 2022 Blog Track 確認） |
| 4 | 論文 | Deep RL that Matters (1709.06560) | arxiv.org/abs/1709.06560 | OK |
| 5 | 論文 | Podracer / Anakin・Sebulba (2104.06272) | arxiv.org/abs/2104.06272 | OK |
| 6 | 論文 | EnvPool (2206.10558) | arxiv.org/abs/2206.10558 | OK |
| 7 | 論文 | Sample Factory (2006.11751) | arxiv.org/abs/2006.11751 | OK |
| 8 | 論文 | RLlib (1712.09381) | arxiv.org/abs/1712.09381 | OK |
| 9 | 論文 | Stable-Baselines3 (JMLR v22) | jmlr.org/papers/v22/20-1364.html | OK |
| 10 | 論文 | TorchRL (2306.00577) | arxiv.org/abs/2306.00577 | OK |
| 11 | 論文 | Value-Based Deep RL Scales Predictably (2502.04327) | arxiv.org/abs/2502.04327 | OK |
| 12 | 論文 | Compute-Optimal Scaling for Value-Based Deep RL (2508.14881) | arxiv.org/abs/2508.14881 | OK |
| 13 | 論文 | A Review of Nine Physics Engines (2407.08590) | arxiv.org/abs/2407.08590 | OK |
| 14 | 論文 | Brax (2106.13281) | arxiv.org/abs/2106.13281 | OK |
| 15 | 論文 | Gymnasium (2407.17032) | arxiv.org/abs/2407.17032 | OK |
| 16 | 特許 | Distributed training of RL systems (US10445641B2) | patents.google.com/patent/US10445641B2/en | OK（Google/DeepMind） |
| 17 | 特許 | Training RL neural networks (US20170076201A1) | patents.google.com/patent/US20170076201A1/en | OK（Google/DeepMind） |
| 18 | 特許 | Simulation orchestration for RL training (US11429762B2) | patents.google.com/patent/US11429762B2/en | OK（Amazon） |

## 全体の傾向

- **「実装が結果を決める」系の方法論論文が本クラスタの中核**: "What Matters in On-Policy RL"（50+ の設計選択を 25 万エージェントで検証）、"The 37 Implementation Details of PPO"、"Deep RL that Matters"（再現性）は、フレームワーク選定・実装方針を立てる際の必読基盤。GPU 高速化そのものより「何を正しく実装すべきか」を扱う。
- **ライブラリ／フレームワークの比較軸が明確に分岐**: CleanRL（single-file・教育/再現性）、Stable-Baselines3（信頼性重視 PyTorch）、TorchRL（TensorDict ベースの汎用 PyTorch）、RLlib（Ray ベースの分散）という選定の四象限が見える。高速化系としては EnvPool（C++ 並列環境、3M FPS）、Sample Factory（単一マシン 10万 FPS 非同期）、Brax（JAX・アクセラレータ上で env+学習を同居）が代表。
- **スケーリング則が 2025 年に成熟**: "Value-Based Deep RL Scales Predictably"（ICML 2025）と "Compute-Optimal Scaling for Value-Based Deep RL"（2025）は、UTD 比・モデル容量・データ/計算配分を Pareto frontier として定式化し、ハードウェア/計算予算の選定に定量根拠を与える新しい潮流。
- **ハードウェア／シミュレータ選定の参照**: "A Review of Nine Physics Engines"（MuJoCo・Brax・PhysX 等の比較）と Podracer（TPU Pod 向け Anakin/Sebulba）が、GPU vs TPU・物理エンジン選定の比較材料を提供。Gymnasium は env インターフェース標準化（再現性・相互運用性）の基盤。
- **特許は「分散 RL 学習基盤」に集中**: Google/DeepMind の分散学習（actor-learner-replay の並列化）と Amazon のシミュレーション・オーケストレーション（クラウドで simulation node と training node を分離）が genuine hit。RL に特化した「ハードウェア選定」「ハイパラ最適化」の純粋な特許は希少で、無理な水増しは行わなかった。

## 学術論文

| # | タイトル | 著者 | 年 | 媒体 | arXiv ID / DOI | URL | 概要（日本語） |
|---|----------|------|----|------|----------------|-----|----------------|
| 1 | CleanRL: High-quality Single-file Implementations of Deep Reinforcement Learning Algorithms | Shengyi Huang, Rousslan F. J. Dossa, Chang Ye, Jeff Braga | 2021 | arXiv / JMLR v23 | arXiv:2111.08819 | https://arxiv.org/abs/2111.08819 | 各アルゴリズムを 1 ファイルに収め、性能に効く実装ディテールを可視化した single-file RL ライブラリ。再現性と実験トラッキング、2000+ マシンへのスケール運用を両立する選定候補。 |
| 2 | What Matters In On-Policy Reinforcement Learning? A Large-Scale Empirical Study | Marcin Andrychowicz, Anton Raichuk, Piotr Stańczyk, Manu Orsini, ほか12名 | 2020 | arXiv / ICLR 2021 | arXiv:2006.05990 | https://arxiv.org/abs/2006.05990 | 50 超の低/高レベル設計選択を統一フレームワークで実装し、5 つの連続制御環境で約 25 万エージェントを学習して影響を定量化。on-policy RL の実装方針に対する実践的推奨を提示。 |
| 3 | The 37 Implementation Details of Proximal Policy Optimization | Shengyi Huang, Rousslan F. J. Dossa, Antonin Raffin, Anssi Kanervisto, Weixun Wang | 2022 | ICLR 2022 Blog Track | （arXiv なし） | https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/ | PPO の論文記述と実装の乖離を 37 個の実装ディテールとして整理・カタログ化した定番資料。ベクトル化環境による高速化やソフトウェア工学上の落とし穴にも言及。 |
| 4 | Deep Reinforcement Learning that Matters | Peter Henderson, Riashat Islam, Philip Bachman, Joelle Pineau, Doina Precup, David Meger | 2017 | arXiv / AAAI 2018 | arXiv:1709.06560 | https://arxiv.org/abs/1709.06560 | ハイパラ・乱数シード・実装コードベース・環境差が方策勾配法の結果を大きく左右することを系統的に示し、RL の再現性向上のための報告手法を提言した基礎論文。 |
| 5 | Podracer architectures for scalable Reinforcement Learning | Matteo Hessel, Manuel Kroiss, Aidan Clark, Iurii Kemaev, John Quan, Thomas Keck, Fabio Viola, Hado van Hasselt | 2021 | arXiv（DeepMind tech report） | arXiv:2104.06272 | https://arxiv.org/abs/2104.06272 | TPU Pod の資源を最大活用する 2 つの RL アーキテクチャ Anakin（env も JAX）と Sebulba（任意 env を acting/learning 同居）を提示。アクセラレータ上の分散 RL 設計の参照。 |
| 6 | EnvPool: A Highly Parallel Reinforcement Learning Environment Execution Engine | Jiayi Weng, Min Lin, Shengyi Huang, Bo Liu, ほか8名 | 2022 | arXiv / NeurIPS 2022 | arXiv:2206.10558 | https://arxiv.org/abs/2206.10558 | RL のボトルネックである並列環境実行を C++ スレッドプールで高速化し、Atari で 100万 FPS・MuJoCo で 300万 FPS を達成。CleanRL/rl_games/Acme と互換の環境エンジン。 |
| 7 | Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning | Aleksei Petrenko, Zhehui Huang, Tushar Kumar, Gaurav Sukhatme, Vladlen Koltun | 2020 | arXiv / ICML 2020 | arXiv:2006.11751 | https://arxiv.org/abs/2006.11751 | 単一マシン向けに GPU ベースの非同期サンプラと off-policy 補正を組み合わせ、3D 制御で 10万 FPS 超を達成した高スループット APPO 学習システム。 |
| 8 | RLlib: Abstractions for Distributed Reinforcement Learning | Eric Liang, Richard Liaw, Philipp Moritz, Robert Nishihara, Roy Fox, Ken Goldberg, Joseph E. Gonzalez, Michael I. Jordan, Ion Stoica | 2018 | arXiv / ICML 2018 | arXiv:1712.09381 | https://arxiv.org/abs/1712.09381 | RL の不規則な並列計算をトップダウン階層制御として合成可能に抽象化し、Ray 上でスケーラブルな分散 RL プリミティブを提供するライブラリ。分散 RL 選定の標準候補。 |
| 9 | Stable-Baselines3: Reliable Reinforcement Learning Implementations | Antonin Raffin, Ashley Hill, Adam Gleave, Anssi Kanervisto, Maximilian Ernestus, Noah Dormann | 2021 | JMLR vol.22(268) | （JMLR） | https://www.jmlr.org/papers/v22/20-1364.html | リファレンス実装に対しベンチマークし、95% をユニットテストでカバーした信頼性重視の PyTorch 製 model-free RL ライブラリ。一貫した API と充実したドキュメントが特徴。 |
| 10 | TorchRL: A data-driven decision-making library for PyTorch | Albert Bou, Matteo Bettini, Sebastian Dittert, Vikash Kumar, Shagun Sodhani, Xiaomeng Yang, Gianni De Fabritiis, Vincent Moens | 2023 | arXiv / NeurIPS 2023 | arXiv:2306.00577 | https://arxiv.org/abs/2306.00577 | TensorDict プリミティブを核に、replay buffer・データコレクタ・環境・目的関数をモジュール結合できる PyTorch 製の汎用制御ライブラリ。PyTorch 系高速化（torch.compile 等）の土台。 |
| 11 | Value-Based Deep RL Scales Predictably | Oleh Rybkin, Michal Nauman, Preston Fu, Charlie Snell, Pieter Abbeel, Sergey Levine, Aviral Kumar | 2025 | arXiv / ICML 2025 | arXiv:2502.04327 | https://arxiv.org/abs/2502.04327 | value-based off-policy RL のデータ/計算要求量が UTD 比で制御される Pareto frontier に乗ることを示し、計算予算からの性能・ハイパラ外挿を可能にしたスケーリング則研究。 |
| 12 | Compute-Optimal Scaling for Value-Based Deep RL | Preston Fu, Oleh Rybkin, Zhiyuan Zhou, Michal Nauman, Pieter Abbeel, Sergey Levine, Aviral Kumar | 2025 | arXiv | arXiv:2508.14881 | https://arxiv.org/abs/2508.14881 | モデル容量と UTD 比のトレードオフを分析し、TD-overfitting 現象（小モデルで大バッチが Q 精度を悪化）を同定。固定計算予算を最大性能へ変換する compute-optimal な配分指針を提示。 |
| 13 | A Review of Nine Physics Engines for Reinforcement Learning Research | Michael Kaup, Cornelius Wolff, Hyerim Hwang, Julius Mayer, Elia Bruni | 2024 | arXiv | arXiv:2407.08590 | https://arxiv.org/abs/2407.08590 | Brax・Chrono・Gazebo・MuJoCo・ODE・PhysX・PyBullet・Webots・Unity の 9 物理エンジンを性能/機能/使いやすさ/RL 適性で比較。MuJoCo を最有力と評価したシミュレータ選定の参照。 |
| 14 | Brax — A Differentiable Physics Engine for Large Scale Rigid Body Simulation | C. Daniel Freeman, Erik Frey, Anton Raichuk, Sertan Girgin, Igor Mordatch, Olivier Bachem | 2021 | arXiv / NeurIPS 2021 | arXiv:2106.13281 | https://arxiv.org/abs/2106.13281 | JAX 製でアクセラレータ上の並列剛体シミュレーションに特化し、PPO/SAC/ES 等を env と同居コンパイル。単一 GPU/TPU 上で env と学習を完結させる JAX 系高速化の基盤。 |
| 15 | Gymnasium: A Standard Interface for Reinforcement Learning Environments | Mark Towers, Ariel Kwiatkowski, Jordan Terry, John U. Balis, ほか12名 | 2024 | arXiv | arXiv:2407.17032 | https://arxiv.org/abs/2407.17032 | env と学習アルゴリズムの広い相互運用性を実現する抽象化を備えた RL 環境の標準 API（旧 Gym 後継）。再現性・堅牢性のためのツール群を提供する選定前提のインフラ。 |

## 特許

| # | タイトル | 特許番号 | 出願人（Assignee） | 出願年 | 庁 | URL | 概要（日本語） |
|---|----------|----------|--------------------|--------|----|-----|----------------|
| 1 | Distributed training of reinforcement learning systems | US10445641B2 | Google LLC（原出願 DeepMind Technologies Ltd） | 2016（出願）／2019（登録） | USPTO | https://patents.google.com/patent/US10445641B2/en | 複数の actor・learner・replay memory を bundle/分離構成で並列化し、parameter server を介して非同期に勾配を集約することで RL 学習を高速化する分散学習アーキテクチャ。 |
| 2 | Training reinforcement learning neural networks | US20170076201A1（登録 US10733504B2） | Google LLC（後に DeepMind Technologies Ltd） | 2016（出願）／2017（公開） | USPTO | https://patents.google.com/patent/US20170076201A1/en | Q ネットワークと target ネットワークを分離して報酬の過大評価誤差を抑制しつつ RL エージェントの行動選択用 Q ネットを学習する手法。 |
| 3 | Simulation orchestration for training reinforcement learning models | US11429762B2 | Amazon Technologies Inc | 2018（出願）／2022（登録） | USPTO | https://patents.google.com/patent/US11429762B2/en | simulation workflow manager がシミュレーション実行ノードと RL 学習ノードを別々に構成・統括し、生成データを学習側へ供給して反復的にモデルを改善するクラウド型オーケストレーション。 |

## 次のステップ

1. **retrieval フェーズへの引き継ぎ**: 上記 15 件のうち優先度の高い方法論基盤（#1 CleanRL, #2 What Matters, #3 37 Details, #4 Deep RL that Matters）と、選定の中核となる比較資料（#9 SB3, #10 TorchRL, #8 RLlib, #13 Nine Physics Engines, #11/#12 スケーリング則）を `retrieval/20260626_selection_guide/` で詳細レポート化する。
2. **クロスクラスタ整合**: #5 Podracer・#6 EnvPool・#7 Sample Factory・#14 Brax は `principles` / `jax_ecosystem` / `pytorch_native` クラスタと重複する可能性が高いため、retrieval 段で重複を排し、本クラスタでは「選定観点（いつ選ぶか）」に絞った要約を行う。
3. **選定マトリクスの作成**: PyTorch vs JAX、single-file vs framework、単一マシン vs 分散、consumer GPU vs TPU Pod の決定木を、収集した一次資料のベンチマーク数値に基づいて構築する。
4. **特許の追補調査（任意）**: RL 特化のハイパラ最適化・ハードウェア選定に関する純粋特許は本収集では希少だった。必要なら CN/EP/JP 庁や 2023–2025 出願の新規特許を追加探索する（無理な水増しは避ける）。
