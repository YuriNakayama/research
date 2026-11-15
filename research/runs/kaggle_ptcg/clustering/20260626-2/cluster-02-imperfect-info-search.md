# Cluster 2: 不完全情報ゲーム探索（ISMCTS / 決定化 / CFR）

**Overview**:
相手の手札・山札が見えない不完全情報と、ドロー・コインフリップ等の確率性に対処する **探索系手法** の領域。中心は ISMCTS（Information Set MCTS）で、情報集合（プレイヤー視点で区別できない状態の集合）の木を探索し、各イテレーションをランダムな決定化（determinization）に制限する。決定化に伴う strategy fusion を緩和する手法や、CFR（Counterfactual Regret Minimization）系のゲーム理論的均衡計算も含む。**ポケモンへの ISMCTS 適用は既に先行研究が存在** し、本コンペと親和性が高い。

**Keywords**:
`ISMCTS`, `Information Set MCTS`, `determinization`, `strategy fusion`, `MO-ISMCTS`, `MCTS modifications survey`, `CFR`, `MCCFR`, `Deep CFR`, `Nash equilibrium`, `extensive-form games`, `Student of Games`, `information set`, `hidden information reuse`

**Research Strategy**:
- **最優先**: 「Implementation and Evaluation of ISMCTS for Pokémon」（IEEE）を精読し、ポケモン特有の情報集合設計・決定化方針を把握。
- ISMCTS 基礎論文（Cowling et al. 2012）と「Information capture and reuse strategies in MCTS」で strategy fusion 対策を理解。
- 10分制約下では純粋探索は重いため、**探索＋学習済み評価関数/方策（C3, C4 と統合）** の方向を検討（Student of Games / PUCT 系）。
- CFR 系はオフライン均衡計算用に位置づけ、Deep CFR の大規模行動空間への適用可否を評価。

**Seed Resources**:
| タイトル | 年 | 概要 | リンク |
|---------|----|------|--------|
| Implementation and Evaluation of ISMCTS for Pokémon | 2018 | ポケモンへの ISMCTS 適用・評価（**直接関連**） | https://ieeexplore.ieee.org/document/8616371/ |
| Information Set Monte Carlo Tree Search | 2012 | ISMCTS の基礎（決定化・情報集合木） | https://eprints.whiterose.ac.uk/id/eprint/75048/1/CowlingPowleyWhitehouse2012.pdf |
| Information capture and reuse strategies in MCTS | 2014 | 隠れ情報ゲームでの情報再利用・strategy fusion | https://www.sciencedirect.com/science/article/pii/S0004370214001052 |
| MCTS: a review of recent modifications and applications | 2022 | MCTS 改良の体系レビュー | https://link.springer.com/article/10.1007/s10462-022-10228-y |
| Deep Counterfactual Regret Minimization | 2019 | 抽象化不要の大規模 CFR | https://ai.meta.com/research/publications/deep-counterfactual-regret-minimization/ |
| Student of Games | 2021 | 完全/不完全情報を統一する探索＋学習 | https://arxiv.org/pdf/2112.03178 |
