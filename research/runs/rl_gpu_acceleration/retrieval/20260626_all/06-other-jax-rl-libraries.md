# 06. その他の JAX RL ライブラリ・環境

Star 数は GitHub REST API ライブ取得（2026-06-26）。ベンチマークは各出典に明記。検証できなかった主張はフラグ。

## 1. Stoix（Edan Toledo）

- **GitHub**: https://github.com/EdanToledo/Stoix
- **Star**: 412（fork 46）— GitHub API, 2026-06-26
- **最新リリース/状態**: タグ付き GitHub リリース無し。Zenodo DOI **10.5281/zenodo.10916257**（2024-04）でバージョン管理。活発（最終 push 2026-03-18）。出典: https://github.com/EdanToledo/Stoix/blob/main/README.md , https://zenodo.org/records/17144514
- **用途**: 単一エージェント RL の高速実験向けリサーチコードベース。end-to-end JIT、**Anakin** podracer アーキテクチャ実装（非 JAX 環境向けに **Sebulba** も）。
- **主要ベンチマーク**: ドキュメントは「PureJaxRL と同等の性能」と主張し「PPO の 5e5 ステップ」のスケーリング図を提示。⚠️ 明示的な FPS/steps-per-second 数値は README に未掲載（比較訓練時間プロットのみ）。~28 アルゴリズム実装（DQN 系、PPO、SAC、TD3、MPO、AlphaZero、MuZero、IMPALA、R2D2、PQN ほか）。出典: https://github.com/EdanToledo/Stoix/blob/main/README.md

## 2. rejax（Jarek Liesen / keraJLi）

- **GitHub**: https://github.com/keraJLi/rejax
- **Star**: 269（fork 20）— GitHub API, 2026-06-26
- **最新リリース**: **v0.1.3**「Buffer bug fixes」（2026-06-10）。出典: https://github.com/keraJLi/rejax/releases
- **用途**: 純 JAX・完全 jittable な RL アルゴリズムの軽量ライブラリ。訓練実行全体を `jit`/`vmap`/`pmap` で包み、並列ハイパラスイープ・マルチシード評価・メタ進化を可能にする。
- **主要ベンチマーク**: README に Hopper/Breakout での「cleanRL 比高速化」グラフ（A100 80G + Intel Xeon 4215R）。`jax.vmap` で「300 エージェント」を並列訓練可能。⚠️ 数値高速化係数は README のグラフのみでスカラ抽出不可。実装 6 アルゴリズム: PPO、SAC、DQN（+DDQN/Dueling）、PQN、IQN、TD3。著者: Jarek Liesen, Chris Lu, Robert Lange。出典: https://github.com/keraJLi/rejax

## 3. Mava（InstaDeep）

- **GitHub**: https://github.com/instadeepai/Mava
- **Star**: 916（fork 121）— GitHub API, 2026-06-26
- **最新リリース/状態**: 直近のタグ付きリリースは特記なし。`develop` ブランチで活発（最終 push 2026-05-26）。
- **用途**: マルチエージェント RL（MARL）の高速実験向けリサーチコードベース（JAX）。**Anakin**（JAX 環境、end-to-end JIT）と **Sebulba**（非 JAX 環境、アクセラレータ + 多数 CPU コア）の両方を実装。
- **主要ベンチマーク**: 他の主要 MARL フレームワーク比 **10–100x 高速化**を性能維持しつつ主張。IL、CTDE、heterogeneous-agent パラダイム対応。出典: https://github.com/instadeepai/Mava , arXiv 2107.01460（https://arxiv.org/html/2107.01460v2 ）

## 4. Jumanji（InstaDeep）

- **GitHub**: https://github.com/instadeepai/jumanji
- **Star**: 843（fork 98）— GitHub API, 2026-06-26
- **最新リリース**: **v1.1.1**（2025-06-18）。出典: https://github.com/instadeepai/jumanji/releases
- **用途**: 単純ゲームから NP 困難な組合せ最適化・産業問題までをカバーする、GPU/TPU 上で直接走る JAX ネイティブ環境スイート。
- **主要ベンチマーク/スケール**: **22 環境**を 4 カテゴリで提供 — Logic（Game2048, RubiksCube, Sudoku ほか）、Packing（BinPack, **Knapsack**, Tetris, JobShop, FlatPack）、Routing（**TSP**, CVRP, Connector, RobotWarehouse, Maze, Snake ほか）、Swarms（SearchAndRescue）。出典: https://github.com/instadeepai/jumanji , 論文 arXiv 2306.09884（https://arxiv.org/html/2306.09884v2 ）

## 5. evosax（Robert Lange）

- **GitHub**: https://github.com/RobertTLange/evosax
- **Star**: 769（fork 62）— GitHub API, 2026-06-26
- **最新リリース**: **v0.2.0**「Major refactor, optax support, bug fixes」（2025-03-11）。出典: https://github.com/RobertTLange/evosax/releases
- **用途**: 進化戦略の JAX ライブラリ（ask–eval–tell API）。`jit`/`vmap`/`lax.scan` 完全対応。RL と組合せて neuroevolution・進化的最適化に使う。
- **主要ベンチマーク/スケール**: **30+ 進化戦略**実装（README は「30+」、詳細表は ~40 アルゴリズム）。CMA-ES, OpenES, PSO, ARS, ClipUp, Differential Evolution, Diffusion Evolution など。論文 arXiv 2212.04180（https://arxiv.org/pdf/2212.04180 ）。⚠️ 「30+」vs「~40」: 見出しは 30+、正確な数は変種の数え方次第。出典: https://github.com/RobertTLange/evosax

## 6. Craftax（Michael Matthews / Oxford）

- **GitHub**: https://github.com/MichaelTMatthews/Craftax
- **Star**: 417（fork 50）— GitHub API, 2026-06-26
- **最新リリース**: **v1.6.1**「Lazily load textures」（2026-06-20、活発）。リポジトリ説明は **ICML 2024 Spotlight**。出典: https://github.com/MichaelTMatthews/Craftax
- **用途**: Crafter + NetHack のメカニクスの JAX 再実装 — 高速・オープンエンド RL ベンチマーク。
- **主要ベンチマーク**: PureJaxRL PPO 実行時、**Craftax-Classic は 257x、フル Craftax は 169x、オリジナル Crafter より高速**。PPO で **10 億環境インタラクションが GPU 1 枚・1 時間未満**で完了、最適報酬の ~90% を平均達成。アブストラクトは「最大 250x」を見出しに。出典: 論文 arXiv 2402.16801（https://arxiv.org/abs/2402.16801 ）

## 7. XLand-MiniGrid（corl-team / dunnolab）

- **GitHub**: https://github.com/corl-team/xland-minigrid（正規名は `dunnolab/xland-minigrid` に解決）
- **Star**: 342（fork 27）— GitHub API, 2026-06-26
- **最新リリース**: **v0.9.2**（2025-12-16、最終 push も同日）。出典: https://github.com/corl-team/xland-minigrid/releases（PyPI: `xminigrid`）
- **用途**: XLand と MiniGrid に着想を得た、JAX フルスクラッチで高スケーラブルなメタ RL / in-context RL グリッドワールド環境。
- **主要ベンチマーク/スケール**: 「GPU 1 枚で毎秒数百万ステップ」。マルチ GPU PPO ベースラインは **2 日未満で 1 兆環境ステップ**に到達。プリサンプル済みベンチマークは **最大 ~300 万のユニークタスク**を含む。コンパニオンの **XLand-100B** データセットは最大の in-context RL データセット（1000 億遷移、25 億エピソード、3 万タスク）。NeurIPS 2024（Datasets & Benchmarks）。出典: https://github.com/corl-team/xland-minigrid/blob/main/README.md , 論文 arXiv 2312.12044（https://arxiv.org/pdf/2312.12044 ）

## 8. Kinetix（Michael Matthews / Oxford — FLAIROx）

- **GitHub**: https://github.com/FLAIROx/Kinetix
- **Star**: 259（fork 10）— GitHub API, 2026-06-26。コンパニオン物理エンジン **Jax2D**: https://github.com/MichaelTMatthews/Jax2D（68 star）
- **最新リリース**: **v3.0.0**（2026-05-21、活発）。出典: https://github.com/FLAIROx/Kinetix/releases
- **状態/会議**: **ICLR 2025 Oral**。出典: https://github.com/FLAIROx/Kinetix , https://iclr.cc/virtual/2025/oral/31729
- **用途**: JAX 上の汎用 2D 剛体物理環境での RL。オープンエンド・手続き生成された物理タスクで汎用エージェントを訓練。
- **主要ベンチマーク**: **Jax2D**（ハードウェア高速化 2D 物理エンジン）上に構築され「訓練中に数十億の環境ステップを安価にシミュレート」。訓練された汎用エージェントは未見の人間設計環境を zero-shot で解く。⚠️ アブストラクトは「数十億ステップ」を能力主張として述べるのみで、精密な steps/秒・高速化係数のスカラは抽出不可（フル PDF / kinetix-env.github.io 要参照）。出典: 論文 arXiv 2410.23208（https://arxiv.org/abs/2410.23208 ）

## その他の注目 JAX RL ライブラリ

Star 数は GitHub API（2026-06-26）。

| ライブラリ | GitHub | Star | 状態 | 用途 |
|-----------|--------|------|------|------|
| **SBX / Stable-Baselines-Jax**（A. Raffin） | araffin/sbx | 596 | 活発（push 2026-06-15） | SB3 アルゴリズムの JAX 再実装（DQN, SAC, TD3, PPO, TQC, CrossQ ほか） |
| **flashbax**（InstaDeep） | instadeepai/flashbax | 278 | メンテ中（push 2025-09-22） | 高速・jittable な replay buffer（flat, trajectory, prioritized） |
| **coax** | coax-dev/coax | 185 | **実質休眠**（最終 push 2023-02-01） | モジュラー JAX RL フレームワーク。未メンテの様子 |
| **Dopamine**（Google） | google/dopamine | 10,875 | 活発（push 2026-03-24） | 価値ベース RL リサーチフレームワーク。JAX エージェント（DQN, Rainbow 等）含む |
| **Acme**（DeepMind） | google-deepmind/acme | 4,006 | 活発（push 2026-04-08） | RL コンポーネント/エージェントのライブラリ。JAX（および TF）バックエンド |
| **rljax**（toshikwa） | toshikwa/rljax | （未取得） | — | JAX の RL アルゴリズム集（低プロファイル） |
| **pgx**（sotetsuk） | sotetsuk/pgx | （未取得） | — | JAX でベクトル化されたボードゲーム RL 環境（chess, Go, shogi 等） |

## 検証フラグ

1. **Stoix FPS**: 明示的 steps/秒 なし。PureJaxRL 比の相対訓練時間プロットのみ。
2. **rejax 高速化係数**: README グラフのみ（A100 80G）。スカラ抽出不可。
3. **evosax アルゴリズム数**: 見出し「30+」、詳細表 ~40。数え方依存。
4. **Kinetix スループット**: アブストラクトは「数十億ステップ」を能力として記述、精密 steps/秒 なし。
5. **Craftax 会議**: GitHub/HuggingFace とも ICML 2024 Spotlight で一致。
6. **coax**: 最終コミット 2023。未メンテ扱い。
7. **xland-minigrid org**: `corl-team` と `dunnolab` は同一プロジェクト。GitHub API は `dunnolab/xland-minigrid` を正規名として返す。

Star 数・リリースタグは 2026-06-26 の GitHub REST API ライブ値。ベンチ/スケール数値は上記 arXiv 論文・README に出典あり。
