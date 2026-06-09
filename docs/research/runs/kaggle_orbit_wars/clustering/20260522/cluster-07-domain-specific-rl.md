# Cluster 7: ドメイン固有 RL (軌道力学 / 微分ゲーム / 類似ゲーム / POMDP)

## 概要

Orbit Wars 固有の制約 **(連続2D 軌道力学, fleet pursuit-evasion, fog of war, hidden rules)** に直接効く専門領域。**軌道力学 + RL** は Springer / ScienceDirect 中心に近年活発 (中国系研究者が支配的)、**微分ゲーム + HJI Nash** は古典制御理論との接続、**Generals.io RL (2025)** は fog of war RTS の最近接事例、**DreamerV3 (Nature 2025)** は POMDP world model の SOTA。これらは cluster-01〜05 が「**手法軸**」だったのに対し、「**問題構造軸**」の知見を提供する。Orbit Wars の sim 設計、観測表現、reward 関数の選択にこれらが直結する。

## キーワード

`orbital pursuit-evasion`, `Clohessy-Wiltshire (CW) equations`, `Lawden equations`, `LVLH frame`, `impulse maneuver`, `Hamilton-Jacobi-Isaacs (HJI)`, `differential game`, `Nash equilibrium`, `bang-bang control`, `Generals.io`, `Tower Defense RL`, `DreamerV3`, `RSSM`, `GHP-MDP`, `belief state`, `opponent modeling`

## 主要論文 (代表リソース)

### 7-A. 軌道力学 + RL (spacecraft pursuit-evasion)

| Title | Year | Summary |
|-------|------|---------|
| [Reinforcement learning-based decision-making for spacecraft pursuit-evasion game in elliptical orbits](https://www.sciencedirect.com/science/article/abs/pii/S0967066124002314) | 2024 | 楕円軌道下の追跡-回避を MDP 化、CW/Lawden 線形化を観測空間に。連続推力ベクトル |
| [Orbital Multi-Player Pursuit-Evasion Game with DRL](https://link.springer.com/article/10.1007/s40295-024-00474-3) | 2024 | 多対多 "encirclement-capture" を離散 Markov game 化、分散型 D4PG。**16隻 fleet に最近接** |
| [Orbital Interception Pursuit Strategy for Random Evasion using DRL](https://spj.science.org/doi/10.34133/space.0086) | 2024 | ランダム回避相手に対する複数インパルス DRL、推力方向・間隔を学習 |
| [Diverse strategy generation for orbital pursuit-evasion via distributed RL](https://www.sciencedirect.com/science/article/pii/S1270963825011150) | 2025 | 分散 RL で**ポリシー多様性**確保、Nash 過適合回避 (league との接続) |
| [Closed-Loop Strategy Synthesis for Real-Time Spacecraft Pursuit-Evasion](https://www.sciencedirect.com/science/article/pii/S2405896325020646) | 2025 | 楕円軌道での閉ループ Nash 解を DRL で近似 |
| [Safe RL: Optimal Formation Control with Collision Avoidance of Multiple Satellite Systems](https://pubmed.ncbi.nlm.nih.gov/40030255/) | 2025 | barrier function 付き安全制約 ADP。**自軍衝突や燃料制約を学習に組み込む参考** |
| [Automating Satellite Collision Avoidance via MARL](https://dl.acm.org/doi/10.1145/3746709.3746927) | 2025 | 通信制約付き MARL、fleet 内 fog 越し情報共有プロトコル設計の参考 |
| [Spacecraft orbital pursuit–evasion games with J2 perturbations and direction-constrained thrust](https://www.sciencedirect.com/science/article/abs/pii/S0094576522005410) | 2022 | J2 摂動考慮の現実的軌道、推力方向制約。Orbit Wars の物理エンジン設計参考 |

### 7-B. 微分ゲーム / HJI と RL

| Title | Year | Summary |
|-------|------|---------|
| [Deep RL for Nash Equilibrium of Differential Games (IEEE TNNLS)](https://pubmed.ncbi.nlm.nih.gov/38261501/) | 2024 | ADP × NN で HJI 偏微分方程式近似、非線形連続時間ゲームの Nash 解 |
| [Transfer RL for multi-agent pursuit-evasion differential game with obstacles](https://onlinelibrary.wiley.com/doi/abs/10.1002/asjc.3328) | 2024 | 障害物付き連続環境で転移 RL、tile レイアウト変動への汎化に応用可 |
| [Slightly Altruistic Nash Equilibrium for MA Pursuit-Evasion](https://arxiv.org/abs/2211.05924) | 2022 | 入力制約付き多者 PE で「やや利他的」な NE 概念、自軍協調の局所均衡解析 |
| [Equilibrium Policy Generalization (cross-graph PE)](https://arxiv.org/abs/2511.00811) | 2025 | DP で純戦略 NE 生成 → グラフ横断 RL でゼロショット汎化 |

**示唆**: bang-bang 制御 (最大推力 on/off) が time-optimal で頻出 → **行動空間を「最大推力方向×8 + noop」など離散化**すると学習が安定する事例多数。Orbit Wars の連続行動を素直に扱うより、軌道力学の理論に沿った離散化が有効。

### 7-C. 類似ゲーム (Generals.io / Planet Wars / Tower Defense)

| Title | Year | Summary |
|-------|------|---------|
| [Artificial Generals Intelligence: Mastering Generals.io with RL](https://arxiv.org/abs/2507.06825) | 2025 | Straka & Schmid。**教師あり事前学習 + self-play で上位 0.003% (H100×36h)**。Gymnasium/PettingZoo 互換、potential-based reward shaping + memory features。**Orbit Wars に最も類似** (fog-of-war + tile/territory 争奪 + リアルタイム戦略) |
| [Generals.io A3C bot](https://github.com/yilundu/generals_a3c) / [Ty4Code generals-io-bot](https://github.com/Ty4Code/generals-io-bot) | 2017– | A3C + Conv ネット、観測のグリッド/チャネル分解 (own/enemy/fog/army count) 設計参考 |
| [RL for High-Level Strategic Control in Tower Defense (CoG 2024)](https://arxiv.org/abs/2406.07980) | 2024 | EA SEED。Plants vs. Zombies で RL × scripted hybrid。**RL を高レベル意思決定者に、低レベルは HAI**。階層方策の参考 |
| [Planet Wars - SimonLucas/planet-wars-rts](https://github.com/SimonLucas/planet-wars-rts) | 2024 | 既存 Planet Wars RTS フレームワーク、軌道なしの離散版。Orbit Wars の単純化された原型 |

### 7-D. 部分観測 / 隠れ規則 / world model

| Title | Year | Summary |
|-------|------|---------|
| [DreamerV3 — Mastering diverse domains through world models (Nature)](https://www.nature.com/articles/s41586-025-08744-2) | 2025 | Hafner et al. RSSM + symlog/free-bits/percentile return 正規化。**POMDP world model の本命** |
| [DreamerNav: Indoor navigation via world models](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12510832/) | 2025 | egocentric obs を RSSM で POMDP 化、構造的空間表現と統合 |
| [Belief States for Cooperative MARL under Partial Observability](https://arxiv.org/abs/2504.08417) | 2025 | 学習 belief を MARL に注入、完全分散学習・実行で性能改善 |
| [Lux AI Season 3 (NeurIPS 2024)](https://openreview.net/forum?id=7t8kWYbOcj) | 2024 | 1v1×5 ゲーム sequence で **隠れパラメータの game-1 探索 → game-2-5 活用**。Orbit Wars に**思想が極めて近い** |
| [Generalized Hidden-Parameter MDPs (GHP-MDPs)](https://arxiv.org/abs/2002.03072) | AAAI 2020 | 潜在 task パラメータ θ で dynamics/reward 分離、Bayesian NN 推論。**hidden rules を θ として明示モデル化** |
| [Recurrent meta-RL (RL² / VariBAD系)](https://arxiv.org/abs/2308.05937) | 2023 | RNN hidden state を task belief として meta-RL |

### 7-E. Opponent modeling / Theory of Mind

| Title | Year | Summary |
|-------|------|---------|
| [AlphaStar Nature paper](https://www.nature.com/articles/s41586-019-1724-z) | 2019 | League training (main/exploiter/league-exploiter) + 統計的 opponent prior。**最大規模 reference** |
| [A Robust and Opponent-Aware League Training for SC II](https://proceedings.neurips.cc/paper_files/paper/2023/file/94796017d01c5a171bdac520c199d9ed-Paper-Conference.pdf) | NeurIPS 2023 | 明示的 opponent modeling、AlphaStar より遥かに低リソース |
| [Applying opponent and environment modelling in decentralised MARL](https://www.sciencedirect.com/science/article/abs/pii/S1389041724001001) | 2024 | 環境モデル + 相手モデル同時学習 |
| [LOLA (2018) / LOQA (2024) / Advantage Alignment (ICLR 2025)](https://arxiv.org/abs/1709.04326) | 2018-2025 | 相手の学習更新を勾配に織り込む opponent shaping。**LOQA 推奨** (4x 高速、ICLR 2025 で Advantage Alignment が最新) |
| [Variational Autoencoders for Opponent Modeling in MAS](https://arxiv.org/abs/2001.10829) | 2020 | VAE で opponent policy 埋め込み。**hidden rule × opponent type を joint latent で推論** |

## Orbit Wars 適用時の調査戦略

### 7-A 軌道力学 + RL を活かす
- **観測表現**: LVLH 座標 (Local Vertical Local Horizontal) + 相対速度を [tanh/symlog] 正規化。Orbit Wars sim でこれを直接抽出可能か確認
- **行動空間**: bang-bang 離散化 (8 方向 × 3 強度 + noop = 25 actions) が time-optimal 制御で SOTA に近い
- **物理整合性**: J2 摂動や太陽の重力勾配など、現実宇宙物理に忠実な sim にすれば transfer 価値も生まれる (将来研究の余地)

### 7-B 微分ゲーム / HJI
- **理論検証用**: 単純化された 2 vs 2 設定で HJI Nash 解を解析的に計算 → DRL 解と比較。学習の正しさを検証
- **bang-bang 行動空間**は HJI 解と一致するので、離散化の正当性も理論的に裏付けられる

### 7-C 類似ゲーム (最重要)
- **Generals.io 論文 (2025) を**完全に**読む**。fog-of-war RTS で上位 0.003% に到達する pipeline (教師あり pretraining → self-play → potential reward shaping) は Orbit Wars にほぼ直接 transfer 可能
- **Tower Defense CoG 2024** の階層方策 (high-level RL + low-level scripted) は、Orbit Wars でも「戦略 (どの tile を狙う) は RL / 軌道 burn は CW 解析解」というハイブリッド設計の参考

### 7-D POMDP / world model
- **DreamerV3 を baseline 候補に**: Atari/Crafter/DMControl で SOTA、Orbit Wars の fog of war にも適用候補
- **Lux S3 公式論文を熟読**: hidden rule 推論をどう構造化したか (Frog Parade の write-up に詳細)
- **GHP-MDP θ-head**: Orbit Wars の hidden parameter を model output として明示的に推論

### 7-E Opponent modeling
- **LOQA / Advantage Alignment**: vanilla self-play が停滞したら opponent shaping を試す
- **AlphaStar-lite league** で main + exploiter + league-exploiter
- **VAE opponent embedding** を policy 条件に注入し、戦術切替を学習

## 全体アーキテクチャ提案 (要約)

1. **Lux S3 風 meta-RL 環境ラッパー**: 試合 sequence + hidden θ ランダム化で hidden rule 推論を学習信号に
2. **RSSM (DreamerV3) または Recurrent PPO + GHP-MDP θ-head**: fog 越し belief & hidden rules を統合
3. **階層方策**: 高レベル (どの tile / どの軌道) は RL、低レベル (推力) は CW/Lawden 解析解
4. **Set-Transformer/GNN による fleet entity 表現**: 16 隻の permutation invariance
5. **League + LOQA** で opponent diversity 確保

## 注目研究グループ

- **清華大 / 北京理工大 / 哈工大 (中国)**: 軌道 pursuit-evasion の中心、ScienceDirect/Springer 経由が多い
- **DeepMind**: DreamerV3, AlphaStar, MuZero の本家
- **EA SEED (Bergdahl, Sestini, Gisslén)**: ゲーム業界 RL 応用の先端
- **Schmid lab**: Generals.io 論文 (2025)、fog of war RTS の RL 専門
- **Foerster lab (Oxford)**: LOLA/LOQA/JaxMARL の中心

## 推奨読み順

1. Lux S3 公式論文 (Orbit Wars との思想的近接性)
2. Generals.io 論文 2025 (実装の現実例)
3. DreamerV3 Nature 版 (POMDP world model SOTA)
4. Orbital Multi-Player Pursuit-Evasion (2024) (fleet pursuit-evasion の最近接)
5. GHP-MDP (hidden parameter の理論基盤)
6. LOQA / Advantage Alignment (opponent shaping 最新)
7. Tower Defense CoG 2024 (階層方策の現実解)

## 注意事項

- **軌道力学論文は paywall が多い**: ScienceDirect / Springer。arXiv 版を探すか大学アクセス推奨
- **中国系研究者の論文は実装公開が少ない**: 査読論文の手法を再実装する必要があり時間コスト高
- **Generals.io 論文の事前学習データは Generals.io 上位プレイヤーのリプレイ**で、Orbit Wars には対応するデータが存在しない可能性。**rule-based 初期 expert を自作して BC** が代替案
- **DreamerV3 は MCTS 不要で submission 制約に優しい** が、world model + actor + critic の総容量は計算要

## Orbit Wars 向け推奨組み合わせ

- **最小構成**: cluster-01 PPO + cluster-04 CNN+SE + cluster-06 Frog Parade パターン
- **中規模**: 上記 + cluster-05 PufferLib (1M FPS) + cluster-03 PFSP
- **大規模**: 上記 + cluster-07-D DreamerV3 world model + cluster-07-E LOQA + cluster-02 EZ-V2 (実験的)
- **学術的最先端**: 上記 + cluster-07-A 軌道力学観測 + cluster-07-B HJI 検証 + cluster-07-C Generals.io reward shaping
