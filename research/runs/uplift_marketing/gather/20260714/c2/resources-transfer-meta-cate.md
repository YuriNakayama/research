# C2 リソース一覧: 施策間の知識転移・メタ学習CATE

- **Cluster**: C2 — Transfer / Meta-learning CATE
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **対象**: source施策で学習したCATEモデルをtarget施策へ転移（「別施策の活用」）。異質特徴空間・few-shot・domain adaptation・negative transfer。

## 概要

ある施策（source）の treatment-effect モデルを別施策（target）へ移す文脈。transfer learning for CATE、tasks横断のmeta-learning、few-shot/limited-data CATE、covariate shift、negative-transfer の注意、multi-task/multi-study borrowing、domain shift下のモデル選択をカバー。

## リソース

| # | Title | Year | Venue | URL | Relevance |
|---|-------|------|-------|-----|-----------|
| 1 | Transfer Learning on Heterogeneous Feature Spaces for Treatment Effects Estimation | 2022 | NeurIPS / arXiv:2210.06183 | https://arxiv.org/abs/2210.06183 | **seed**。shared/private multi-task層でsource-targetの特徴空間が異なる場合にCATEを転移。「異なる共変量を持つ新施策で旧モデルを再利用」に直結。 |
| 2 | Meta-learning for HTE Estimation with Closed-form Solvers | 2023/2024 | arXiv:2305.11353 / ML (Springer) | https://arxiv.org/abs/2305.11353 | **seed**。多タスクをメタ学習し未知タスク（新施策）を少数サンプルでCATE推定。task-shared+specific、閉形式内側solver。 |
| 3 | Selecting Treatment Effects Models for Domain Adaptation Using Causal Knowledge | 2021/2023 | arXiv:2102.06271 / ACM THealth | https://dl.acm.org/doi/10.1145/3587695 | **seed**。unlabeled targetのみで、どのsourceモデルを信頼するか不変因果構造で選ぶ。「どの旧モデルが最も転移するか」に回答。 |
| 4 | Transfer Learning for Individual Treatment Effect Estimation (CITA) | 2023 | UAI / arXiv:2210.00380 | https://arxiv.org/abs/2210.00380 | Causal Inference Task Affinity で最近接sourceタスクを特定、最大95%データ削減。近い旧施策の選択に直結。 |
| 5 | Transfer Causal Learning (ℓ1-TCL) | 2023 | arXiv:2305.09126 | https://arxiv.org/abs/2305.09126 | 同一特徴空間でnuisance（propensity/outcome）をℓ1転移。転移が効く条件の理論。negative-transferの基礎。 |
| 6 | Transfer Learning of CATE with Kernel Ridge Regression | 2025 | arXiv:2502.11331 | https://arxiv.org/abs/2502.11331 | 激しいcovariate shift・弱overlap下のoverlap-adaptive転移。MSE上界。unlabeled targetのpseudo-outcomeでモデル選択。 |
| 7 | Advantages and Limitations of TL for ITE (TL-TARNet) | 2025 | arXiv:2512.16489 | https://arxiv.org/abs/2512.16489 | 大source→小/異質targetへTARNet転移。共変量分布・propensity・treatment機構が異なる場合を明示議論。negative-transfer/外的妥当性評価。 |
| 8 | Multi-Study R-Learner for Estimating HTE Across Studies | 2023/2025 | arXiv:2306.01086 / Biostatistics | https://arxiv.org/abs/2306.01086 | 複数異質study/施策を跨ぎCATE情報を借りる。旧施策再利用の多source一般化（C1と共有）。 |
| 9 | Combining Observational and Randomized Data for HTE | 2022 | arXiv:2202.12891 | https://arxiv.org/abs/2202.12891 | 2段階表現学習転移: 潤沢source構造を学びscarce target(RCT)で適応。データ潤沢な旧施策で疎な新施策をbootstrap。 |
| 10 | Federated Learning for Estimating HTE | 2024 | arXiv:2402.17705 | https://arxiv.org/abs/2402.17705 | Transformer共有表現+local multi-task head。raw pool無しで分散site/施策横断にCATE学習。 |
| 11 | Multiple Treatments Causal Effects with Task Embeddings & Balanced Representation | 2025 | arXiv:2511.09814 | https://arxiv.org/abs/2511.09814 | task-embeddingで関連treatment「パターン」間のパラメータ共有+balanced表現。関連施策横断転移のマーケ向け定式化。 |
| 12 | Large-Scale Empirical Comparison of Meta-Learners & Causal Forests for Marketing Uplift | 2026 | arXiv:2604.06123 | https://arxiv.org/abs/2604.06123 | S/T/X-learner・causal forestをマーケupliftデータでベンチ。転移/メタ学習議論を実マーケ設定に接地。 |
| 13 | Adversarial Balancing-based Representation Learning (ABCEI) | 2019/2021 | arXiv:1904.13335 / DMKD | https://arxiv.org/abs/1904.13335 | 不均衡共変量下のCATE表現balancing。domain-adaptation/転移手法の基礎ブロック。 |

## retrieval への優先度

- **最優先**: #1 Heterogeneous Feature Spaces, #4 CITA（task affinity＝転移元選択）, #9 Combining Obs+RCT（疎新施策のbootstrap）
- **次点**: #2 Meta-learning closed-form, #7 TL-TARNet（negative transfer評価）, #11 Task Embeddings
- **接地**: #12 Marketing Uplift benchmark
