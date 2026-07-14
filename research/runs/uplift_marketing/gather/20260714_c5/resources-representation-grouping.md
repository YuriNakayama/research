# C5 リソース一覧: 施策・ユーザー表現とグルーピング基盤

- **Cluster**: C5 — Representation & Grouping Foundation
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **対象**: 「どの施策/ユーザーが近いか」を定量化。action embedding・causal clustering・transportability。C1-C3のグルーピング/転移/予測の基盤・妥当性ゲート。

## 概要

恣意的でないグルーピングを支える3本柱: (1) OPE向けaction/treatment表現（類似施策が強度を共有）、(2) causal/効果ベースのクラスタリング・セグメンテーション（生共変量でなくtreatment反応で群化）、(3) 2母集団の近さを形式化し効果を移す transportability/generalizability。

## リソース

| # | Title | Year | Venue | URL | Relevance |
|---|-------|------|-------|-----|-----------|
| 1 | Learning Action Embeddings for Off-Policy Evaluation | 2023 | ECML-PKDD / arXiv:2305.03954 | https://arxiv.org/abs/2305.03954 | **seed**。action(施策)埋め込みをend-to-end学習しMIPSを強化。大action空間で類似action間の情報共有。学習された「施策の近さ」metric。 |
| 2 | Offline Multi-Action Policy Learning: Generalization and Optimization (Zhou, Athey, Wager) | 2018 | Operations Research / arXiv:1810.04778 | https://arxiv.org/abs/1810.04778 | **seed**。観測データからmulti-action方策を学ぶ基礎理論。予算/方策class制約付き。actionのprincipled poolingを基礎づける。 |
| 3 | Off-Policy Evaluation in Embedded Spaces | 2022 | arXiv:2203.02807 | https://arxiv.org/abs/2203.02807 | **seed**。action埋め込み空間で密度比を計算するfeaturized permutation weighting。非確率的recommenderのpositivity違反を緩和。 |
| 4 | Off-Policy Evaluation for Large Action Spaces via Embeddings (MIPS) | 2022 | ICML / arXiv:2202.06317 | https://arxiv.org/abs/2202.06317 | Marginalized IPSの起源。action埋め込みがactionの因果効果を媒介し類似action間で情報転移・分散削減。埋め込みベースpoolingの理論backbone。 |
| 5 | Context-Action Embedding Learning for OPE (CAEL-MIPS) | 2025 | arXiv:2509.00648 | https://arxiv.org/abs/2509.00648 | MIPS推定量MSE最小化のjoint context-action埋め込みをoffline学習。「ユーザー文脈」と「施策」を共有表現に。 |
| 6 | Causal Clustering for CATE Estimation and Subgroup Discovery | 2025 | arXiv:2509.05775 | https://arxiv.org/abs/2509.05775 | causal-forest kernelでdebiased CATEを群化し潜在的treatment敏感subgroupとcluster-level CATEを発見。principledな効果ベースユーザー群化。 |
| 7 | Causal k-Means Clustering | 2024 | arXiv:2405.03083 | https://arxiv.org/abs/2405.03083 | counterfactual回帰関数へcluster分析を適応。共変量類似でなくtreatment-effect構造でsubgroupを発見。非恣意的セグメンテーション基本要素。 |
| 8 | Hierarchical and Density-based Causal Clustering | 2024 | arXiv:2411.01250 | https://arxiv.org/abs/2411.01250 | causal clusteringを階層/密度ベースへ拡張。cluster数固定なしの柔軟な効果異質性segment構造。 |
| 9 | Iterative Causal Segmentation (AstraZeneca) | 2024 | arXiv:2405.14743 | https://arxiv.org/abs/2405.14743 | segmentationとuplift推定を同時に解きsegmentがpromotion uplift効果を反映。ユーザー群化→施策戦略のマーケネイティブ橋渡し。 |
| 10 | External Validity: From Do-Calculus to Transportability (Pearl, Bareinboim) | 2014 | Statistical Science | https://projecteuclid.org/journals/statistical-science/volume-29/issue-4/External-Validity-From-Do-Calculus-to-Transportability-Across-Populations/10.1214/14-STS486.full | selection diagram/transport formulaで、ある母集団の効果が別母集団へ妥当に移る条件を定義。効果転移の厳密定義。 |
| 11 | A Review of Generalizability and Transportability (Degtiar, Rose) | 2021/2023 | Annu. Rev. Stat. / arXiv:2102.11904 | https://arxiv.org/abs/2102.11904 | weighting/matching/outcome-regression/DRで効果を一般化・移すsurvey+母集団差の検定。transport toolboxの地図。 |
| 12 | One-Step Weighting to Generalize and Transport TE to Target Population | 2022 | arXiv:2203.08701 | https://arxiv.org/abs/2203.08701 | inverse-odds-of-sampling weightingでATEをstudy sampleからtargetへ移す実務レシピ。施策効果を別ユーザー基盤へ転移。 |
| 13 | Estimating Subgroup Effects in Generalizability/Transportability | 2021 | Am. J. Epi. / arXiv:2109.14075 | https://arxiv.org/abs/2109.14075 | 母集団平均でなくsubgroup効果の transport に注力。効果ベースsegmentがnew母集団へ一般化すべき場合の鍵。 |
| 14 | Learning Balanced Representations under Covariate Shift (CFRNET/adversarial line) | 2016/2023 | ICML / arXiv:2312.10570 | https://arxiv.org/abs/2312.10570 | counterfactual推論をdomain adaptationと捉えbalanced共変量表現を学習（MMD/Wasserstein/adversarial）。covariate-shift適応の表現学習橋渡し。 |

## retrieval への優先度

- **最優先**: #1 Learning Action Embeddings（施策の近さmetric）, #9 Iterative Causal Segmentation（マーケ直結）, #6 Causal Clustering CATE
- **次点**: #4 MIPS（理論backbone）, #11 Generalizability/Transportability review, #7 Causal k-Means
- **基礎**: #10 Pearl-Bareinboim transportability
