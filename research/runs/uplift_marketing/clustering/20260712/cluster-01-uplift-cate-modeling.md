# Cluster 1: Uplift / CATE モデリング（複数処置対応）

**Overview**:
アップリフトモデリングは、マーケティング施策の「増分効果」を個人単位で推定する因果推論の応用領域であり、その中核は条件付き平均処置効果（CATE）の推定にある。手法系譜はメタラーナー（S/T/X/DR/R-learner）や因果フォレストといった古典的枠組みから、表現学習に基づく深層モデル（TARNet/CFRNet/DragonNet/DESCN）、さらに複数施策（複数クーポン額・訴求）を同時に扱うマルチトリートメント・マルチタスク型へと発展してきた。評価は Qini/AUUC 曲線が標準だが、近年は収益・利益を直接最適化する value-driven 指標や、構造的バイアス下でのロバスト性評価へと関心が移っている。本クラスタは、後段の C3/C4 が「跨施策で共有・プールする対象」となる推定量そのものを提供する土台である。

**Keywords**:
`uplift modeling`, `CATE (Conditional Average Treatment Effect)`, `meta-learner (S/T/X/DR/R-learner)`, `causal forest / generalized random forest`, `DragonNet`, `TARNet / CFRNet`, `DESCN`, `deep uplift modeling`, `multi-treatment uplift`, `Qini curve`, `AUUC (Area Under Uplift Curve)`, `value-driven / revenue uplift`, `treatment effect heterogeneity`, `propensity score`, `ITE (Individual Treatment Effect)`

**Research Strategy**:
- まず survey #10（Criteo 大規模比較）で S/T/X-Learner・Causal Forest のベースライン性能と Qini/AUUC の読み方を把握。
- 深層手法は #3（DragonNet）→ #5（Benchmarking for Deep Uplift）の順で、「最新手法が必ずしも古典を上回らない・汎化が課題」という現実を押さえる。
- 複数クーポン額・訴求（複数処置）を扱うなら #6/#7/#8 のマルチトリートメント系が直結。実装は OSS の EconML / CausalML / scikit-uplift を併用。
- 評価指標の落とし穴は #11（構造的バイアス下の Qini/AUUC 安定性）で確認。
- 主要研究者/グループ: Susan Athey・Stefan Wager（causal forest）、Mihaela van der Schaar 系（深層 CATE）、Criteo/Tencent 系（産業 uplift）。

**Representative Resources**:

| # | Title | Type | Year | Summary | Link |
|---|-------|------|------|---------|------|
| 1 | Estimation and Inference of HTE using Random Forests | Paper | 2018 | 因果フォレストの理論的基盤（CATE 推定と信頼区間の漸近理論）。foundational | https://www.tandfonline.com/doi/abs/10.1080/01621459.2017.1319839 |
| 2 | Generalized Random Forests | Paper | 2019 | 因果フォレストを局所パラメータ推定へ一般化。grf パッケージの理論的裏付け | https://grf-labs.github.io/grf/reference/causal_forest.html |
| 3 | Adapting Neural Networks for Treatment Effects (DragonNet) | Paper | 2019 | TARNet に傾向スコアヘッド＋targeted regularization を追加した深層 CATE の代表 | https://arxiv.org/pdf/1906.02120 |
| 4 | Uplift modeling with value-driven evaluation metrics | Paper | 2021 | ITE と期待顧客価値を組み込み、Qini を収益指向へ拡張する value-driven 指標 | https://www.sciencedirect.com/science/article/abs/pii/S0167923621001585 |
| 5 | Benchmarking for Deep Uplift Modeling in Online Marketing | Paper | 2024 | 深層 uplift 13手法を産業データで標準ベンチマーク化。汎化の課題を提示 | https://arxiv.org/html/2406.00335 |
| 6 | Multi-Treatment Multi-Task Uplift Modeling for User Growth (MTMT) | Paper | 2024 | 複数処置×複数タスク（エンゲージ・転換・継続）の uplift を同時推定 | https://www.arxiv.org/pdf/2408.12803 |
| 7 | Enhancing Uplift Modeling in Multi-Treatment Campaigns (Score Ranking & Calibration) | Paper | 2024 | メタラーナーのキャリブレーションとスコアランキングでオファー選択を改善 | https://arxiv.org/html/2408.13628v2 |
| 8 | A Comparative Study of Model Adaptation Strategies for Multi-Treatment Uplift | Paper | 2025 | pairwise/K-treatment CATE 等のモデル適応戦略を体系比較 | https://arxiv.org/pdf/2511.01185 |
| 9 | VALOR: Value-Aware Revenue Uplift Modeling (B2B) | Paper | 2026 | treatment-gated 表現学習で収益を直接扱う value-aware uplift。Qini 約20%改善 | https://arxiv.org/html/2604.02472 |
| 10 | Large-Scale Empirical Comparison of Meta-Learners and Causal Forests [SURVEY] | Survey | 2026 | Criteo v2.1（1398万件）で S/T/X・Causal Forest を大規模比較 | https://arxiv.org/abs/2604.06123 |
| 11 | Evaluating Uplift Modeling under Structural Biases | Paper | 2026 | 構造的バイアス下での Qini/AUUC 安定性とモデルのロバスト性を評価 | https://arxiv.org/html/2603.20775v2 |
| 12 | Heterogeneous Multi-treatment Uplift for Short-Video Recommendation | Paper | 2025 | 複数施策のトレードオフ最適化を異質マルチトリートメント uplift で定式化 | https://arxiv.org/html/2511.18997v2 |

> 注: 一部項目は arXiv 本文HTMLから id・年を確認済みだが著者フルネーム未取得のものがある（retrieval 段階で照合推奨）。
