# C1 リソース一覧: 多施策データ統合・エビデンス統合

- **Cluster**: C1 — Multi-study / Data Pooling
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **対象**: 複数実験（施策）を pool して CATE を強化。施策グルーピング＝擬似的データ拡張の理論基盤。

## 概要

単一の小規模実験は heterogeneity 推定が高分散になるため、**施策を跨いで統計的強度を借りる（borrowing strength）**一方で **施策間の異質性（母集団・時期・介入機構の差）** を尊重する手法群。5系統に整理: (1) multi-study meta-learner（R-learner / causal forest）、(2) random-effects / IPD meta-analysis、(3) 階層ベイズ partial pooling、(4) 多数実験の empirical Bayes、(5) federated / data-fusion。

## リソース

| # | Title | Year | Venue | URL | Relevance |
|---|-------|------|-------|-----|-----------|
| 1 | Multi-Study R-Learner for Estimating HTE Across Studies | 2023/2025 | arXiv:2306.01086 / Biostatistics | https://arxiv.org/abs/2306.01086 | **中核**。R-learner を多施策へ一般化。study-specific 効果を membership 確率で連結し情報を借りる。「複数施策を1つのCATEモデルへpool」の直系。 |
| 2 | Comparison of Methods that Combine Multiple RCTs to Estimate HTE (Brantner et al.) | 2023/2024 | arXiv:2303.16299 / Stat. in Med. | https://arxiv.org/abs/2303.16299 | **seed**。complete-pooling vs 異質性考慮の系統比較。異質性を明示する手法が naive pooling を上回る。施策グルーピングの意思決定ガイド。 |
| 3 | Multi-Study Causal Forest (MCF) | 2025 | arXiv:2502.02110 | https://arxiv.org/abs/2502.02110 | causal forest を多施策へ拡張。within/between-study 異質性を同時にモデル化。RCT・観測・混合に対応。 |
| 4 | Empirical Bayes Estimation of Treatment Effects with Many A/B Tests (Coey & Cunningham) | 2019 | AEA P&P | https://www.aeaweb.org/articles?id=10.1257/pandp.20191003 | 多数実験の基礎。大量A/Bの効果推定を shrinkage し各実験を改善。「多数施策で強度を借りる」の正典。 |
| 5 | Empirical Bayes for Large-scale Randomized Experiments: a Spectral Approach | 2020 | arXiv:2002.02564 | https://arxiv.org/abs/2002.02564 | 大量ランダム化実験を同時分析する nonparametric EB。cross-experiment 効果分布を推定。疎な施策列の統合に。 |
| 6 | Optimizing Returns from Experimentation Programs | 2024 | arXiv:2412.05508 / ACM EC 2025 | https://arxiv.org/abs/2412.05508 | A/Bポートフォリオの EB 分析。実験プログラムを pool 資産として制約付き最適化。反復的な施策プログラムに直結。 |
| 7 | Bayesian Partial Pooling to Improve Inference Across A/B Tests | 2018 | NSF/EDM | https://par.nsf.gov/servlets/purl/10095372 | 複数A/B間の階層 partial pooling / shrinkage の具体例。施策の partial pooling テンプレ。 |
| 8 | Hierarchical Bayesian Bootstrap for HTE Estimation | 2020 | arXiv:2009.10839 | https://arxiv.org/abs/2009.10839 | group/strata を跨ぐ nonparametric 階層ベイズ bootstrap。パラメトリック仮定なしの partial pooling。施策規模が異なる場合に有用。 |
| 9 | Identifying TEH in Dose-Finding Trials Using Bayesian Hierarchical Models | 2018 | arXiv:1811.10488 | https://arxiv.org/abs/1811.10488 | 交換可能性/shrinkage を用いた階層ベイズ異質性モデル。pool した施策間の異質性モデル化へ転用可。 |
| 10 | IPD Meta-Analysis for Treatment-Covariate Interactions: Statistical Recommendations (Riley et al.) | 2020 | Stat. in Med. / PMC7401032 | https://pmc.ncbi.nlm.nih.gov/articles/PMC7401032/ | study横断の CATE 推定の権威的ガイド。within-study 情報で ecological bias を回避。個人レベル施策データ pool の厳密レシピ。 |
| 11 | One-Stage vs Two-Stage IPD Meta-Analysis Methods (Simulation) | 2018 | Res. Syn. Methods / PMC6175226 | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6175226/ | 1段階（pooled mixed model）vs 2段階（per-study→meta）の pooling 設計比較。統合の根本設計選択。 |
| 12 | Federated Causal Inference in Heterogeneous Observational Data (Xiong et al.) | 2021/2023 | arXiv:2107.11732 / Stat. in Med. | https://arxiv.org/abs/2107.11732 | site-level summary のみ共有して効果を統合。異質性を考慮した重み付け。データ中央集約不可時の pooling。 |
| 13 | Data Fusion for HTE Estimation with Multi-Task Gaussian Processes | 2024 | arXiv:2405.20957 | https://arxiv.org/abs/2405.20957 | 複数データ源（RCT+観測）を融合し HTE を鋭敏化。source固有構造もモデル化。異質施策融合の柔軟枠組み。 |

## retrieval への優先度

- **最優先**: #1 Multi-Study R-Learner, #2 Comparison of Methods, #4 Empirical Bayes Many A/B（ユーザーの「多数の疎な施策」に直結）
- **次点**: #6 Optimizing Returns（施策プログラム最適化）, #7 Partial Pooling A/B, #3 MCF
- **条件付き**: #12 Federated（データ中央集約不可時）
