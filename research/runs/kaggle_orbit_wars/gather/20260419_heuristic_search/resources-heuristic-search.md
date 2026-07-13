# Resources: heuristic_search

RL 非依存（あるいはハイブリッド）な **探索アルゴリズム・ヒューリスティック・軌道計算** リソース。
1 手 1 秒という厳しい actTimeout 下で現実的なベースライン・併走戦略を構築するためのクラスタ。

## MCTS / UCT 基礎

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **A Survey of MCTS Methods** | http://www.incompleteideas.net/609%20dropbox/other%20readings%20and%20resources/MCTS-survey.pdf | Survey | 2012 年の MCTS 総説、UCT / PUCT / rollout 設計 |
| 2 | MCTS: review of recent modifications (2022) | https://link.springer.com/article/10.1007/s10462-022-10228-y | Springer | 最新改良手法レビュー |
| 3 | Encyclopedia MCTS (Winands) | https://dke.maastrichtuniversity.nl/m.winands/documents/Encyclopedia_MCTS.pdf | Encyclopedia | コンパクトな項目解説 |
| 4 | Monte Carlo Tree Search (Wikipedia) | https://en.wikipedia.org/wiki/Monte_Carlo_tree_search | Wiki | 入門 |

## RTS 向け MCTS（巨大分岐因子対策）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 5 | **Combinatorial Multi-armed Bandits for RTS (JAIR)** | https://arxiv.org/abs/1710.04805 | 論文 | NaïveMCTS、分岐が巨大なほど従来 UCT を上回る |
| 6 | Combinatorial MAB AAAI PDF | https://ojs.aaai.org/index.php/AIIDE/article/download/12681/12529/16198 | 論文 | 同概要 |
| 7 | Parametric Action Pre-Selection for MCTS in RTS | https://ceur-ws.org/Vol-2719/paper11.pdf | 論文 | 行動の事前絞り込みで分岐削減 |
| 8 | MCTS Planning for continuous action and state spaces | https://ceur-ws.org/Vol-3417/short6.pdf | 論文 | Action Progressive Widening (APW) |

## Rolling Horizon Evolution（MCTS の代替）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 9 | **Rolling horizon evolution vs tree search (GECCO 2013)** | https://dl.acm.org/doi/10.1145/2463372.2463413 | 論文 | RHEA と MCTS の比較、リアルタイムゲームで競合 |
| 10 | Rolling Horizon Coevolutionary Planning (2P) | https://ar5iv.labs.arxiv.org/html/1607.01730 | 論文 | 2 プレイヤーに拡張 |
| 11 | Enhancing RHEA with Policy and Value Networks (IEEE 2019) | https://ieeexplore.ieee.org/document/8848041/ | 論文 | NN とのハイブリッド |
| 12 | Enhanced RHEA with Opponent Model Learning | https://www.researchgate.net/publication/344759679 | 論文 | 相手モデル学習併用 |
| 13 | Continual Online Evolutionary Planning (Justesen 2017) | https://sebastianrisi.com/wp-content/uploads/justesen_gecco17.pdf | 論文 | オンライン進化 |
| 14 | RHEA — GAIG project | https://gaigresearch.github.io/projects/rhea | Project | 実装・ベンチ |

## Planet Wars に直結（再掲）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 15 | Game AI Research with Fast Planet Wars Variants (arXiv:1806.08544) | https://arxiv.org/abs/1806.08544 | 論文 | MCTS / RHEA で Planet Wars を解く |
| 16 | melisgl/planet-wars (Melis 2010 優勝解) | https://github.com/melisgl/planet-wars | GitHub | 評価関数 + multi-planet synced attack |
| 17 | Optimizing Planet Wars bot using immune algorithm | https://www.researchgate.net/publication/331854022 | 論文 | 進化計算でのパラメータ最適化 |

## 軌道・迎撃計算（Orbit Wars 固有）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 18 | **Intercept prediction in 2D game (Unity)** | https://discussions.unity.com/t/intercept-prediction-in-a-2d-game-and-teh-maths/612337 | Forum | 2D 直線発射の迎撃角度算出公式 |
| 19 | Interception of Two Moving Objects in 2D Space | https://www.codeproject.com/articles/Interception-of-Two-Moving-Objects-in-D-Space | Article | 二次方程式による厳密解 |
| 20 | 2D Circle Projectile Trajectory + collider radius | https://discussions.unity.com/t/2d-circle-projectile-trajectory-prediction-taking-collider-radius-into-account/151868 | Forum | 惑星半径を考慮した発射角 |
| 21 | Simulating Orbital Gravity Prediction (JVM Gaming) | https://jvm-gaming.org/t/simulating-orbital-gravity-with-a-prediction-of-trajectory-multiple-attractors/58267 | Forum | 軌道シミュレーション（Orbit Wars は明示軌道だが参考） |

## 軌道 Pursuit-Evasion（高度な発展）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 22 | Delta-V Cooperative Strategies (2-Pursuer 1-Evader) | https://spj.science.org/doi/10.34133/space.0222 | 論文 | 2 対 1 軌道追撃 |
| 23 | Near-optimal Intercept via Deep RL (2023) | https://www.sciencedirect.com/science/article/abs/pii/S0094576522002764 | 論文 | DRL ベース軌道迎撃 |
| 24 | Spacecraft Intelligent Orbital Game (review 2025) | https://www.sciencedirect.com/science/article/pii/S100093612500086X | Review | 軌道ゲーム全般レビュー |
| 25 | Game Tree Search for Impulsive Orbital Pursuit-Evasion | https://spj.science.org/doi/10.34133/space.0087 | 論文 | 離散化軌道ゲーム探索 |
| 26 | Orbital Interception for Random Evasion DRL | https://spj.science.org/doi/10.34133/space.0086 | 論文 | ランダム回避対応 |
| 27 | RL Pursuit-Evasion in Elliptical Orbits | https://www.sciencedirect.com/science/article/abs/pii/S0967066124002314 | 論文 | 楕円軌道（コメット類似） |

## ルールベース / Imitation 基盤

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 28 | Planet Wars strategy (satirist.org) | http://satirist.org/ai/planetwars/strategy.html | Blog | 古典ルール群（expand first, attack rush, defensive 等） |
| 29 | Playing styles of Planet Wars bots | http://satirist.org/ai/planetwars/playing-styles.html | Blog | style taxonomy |
| 30 | Halite 1st place — rule-based core | https://github.com/ttvand/Halite | GitHub | rule-based と ML のハイブリッド実例 |
| 31 | Imitation Learning via Semantic Segmentation (KhaVo) | https://voanhkha.github.io/2020/09/15/halite/ | Blog | BC 実装例 |
| 32 | A More Useful Negamax Opponent (ConnectX) | https://www.kaggle.com/code/hubcity/a-more-useful-negamax-opponent-connectx | Notebook | Negamax の軽量実装 |

## Orbit Wars 向けの具体手法マッピング

| ゲーム要素 | 推奨ベース手法 |
|-----------|--------------|
| 1手 1秒、最大数十艦隊 × 全惑星 × 角度 | 行動候補を **ルールで数十に絞ってから MCTS/RHEA** |
| 軌道惑星への攻撃 | `angular_velocity` 使用した **閉形式 intercept 計算** |
| コメット出現予測 | `comets.paths/path_index` から **完全決定的** に計算、価値関数に組込み |
| 多艦派遣の tie 全滅 | 対戦相手モデル + 少量サンプリングで応答予測 |
| 500 turn ゲーム | RHEA の horizon 5-15、または PUCT rollout length 20-50 |
| 2P vs 4P | 2P は MCTS が直接適用可、4P は自己視点 + 対称近似 |

## 戦略的含意（メモ）

- **軌道 intercept は Orbit Wars 固有の数値計算要素**。`P(t) = (cx + r·cos(θ₀ + ωt), cy + r·sin(θ₀ + ωt))` と艦隊の直線運動の交差を事前に解析解で求めるライブラリを最初に実装すべき
- **1秒 MCTS は現実的**（Melis 2010 も 1秒で 200 turn）、ただしルールによる **action pruning** が必須
- **RHEA** は MCTS より実装が軽く、Orbit Wars のような連続行動に相性が良い。最初のベースラインに有力
- **Imitation warmup** — RL と組み合わせる前に、ルールベースの強 bot（expand + snipe-aware）を自動生成し、その self-play ログで BC しておけば収束が速い
