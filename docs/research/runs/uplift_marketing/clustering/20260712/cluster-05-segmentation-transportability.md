# Cluster 5: 行動セグメンテーション × 効果の転移可能性

> C3/C4 が「束ねて強さを借りる」手法だとすれば、本クラスタは **「どのユーザー/施策を束ねてよいか」という束ねる単位の作り方（行動セグメンテーション）と、束ねた効果を別施策へ転用してよいかの妥当性（転移可能性・外的妥当性）** を担保する土台を提供する。

**Overview**:
本クラスタは、ユーザーの購買・行動傾向による顧客セグメンテーションと、施策（キャンペーン）間で学習した因果効果を転移させるための「転移可能性・外的妥当性」研究を統合したものである。前者は RFM・逐次購買・表現学習に基づく深層クラスタリングと顧客埋め込みが中心で、行動が類似する顧客群やキャンペーン群を潜在空間上で同定する基盤となる。後者は Pearl/Bareinboim の構造的転移可能性理論を起点に、共変量シフト・分布シフト下での CATE 推定、多地点データからの汎化、部分集団発見、分布シフト下の方策学習へと発展している。両者を接続することで、「行動が似た顧客・キャンペーンをクラスタリング → あるキャンペーンで学習した処置効果を類似クラスタへ転移」という設計が理論的に裏づけられる。

**Keywords**:
`transportability`, `external validity`, `generalizability`, `selection diagram`, `do-calculus`, `covariate shift`, `distribution shift`, `CATE`, `heterogeneous treatment effects`, `subgroup discovery`, `policy learning`, `off-policy evaluation`, `behavioral customer segmentation`, `RFM analysis`, `deep embedded clustering`, `customer embeddings (customer2vec)`

**Research Strategy**:
- **(b) 転移可能性の理論**は #1（Pearl-Bareinboim の基礎）→ survey #2（Degtiar-Rose）で一般化可能性 vs 転移可能性の枠組みを固める。
- キャンペーン間の分布差への実務対応は #3（Multi-CATE、C3 と重複）と #4（minimax regret / multisite 汎化）が中核候補。
- 施策方策を別対象層へ移す際の評価は #5（分布ロバストな OPE、C2 と接続）。
- 処置効果ベースで「効きやすい顧客クラスタ」を切り出すなら #6/#7（subgroup discovery）、割当設計は #8（distributional welfare）。
- **(a) 行動セグメンテーション**は #10/#11（RFM＋深層埋め込みクラスタリング）、#13（customer2vec）で「束ねる単位」の潜在表現を作る。survey #12 で手法選定を俯瞰。
- 主要研究者/グループ: Judea Pearl・Elias Bareinboim（転移可能性）、Kosuke Imai・Melody Huang（multisite 汎化）、Angela Zhou（multi-accuracy）。

**Representative Resources**:

### (b) 転移可能性・外的妥当性・部分集団・方策学習

| # | Title | Type | Year | Summary | Link |
|---|-------|------|------|---------|------|
| 1 | External Validity: From Do-Calculus to Transportability Across Populations | Paper | 2014 | 選択ダイアグラムと do-計算で因果知識の再利用条件を形式化。転移理論の出発点 | https://ftp.cs.ucla.edu/pub/stat_ser/r400.pdf |
| 2 | A Review of Generalizability and Transportability [SURVEY] | Survey | 2023 | 一般化可能性と転移可能性を横断整理した必読サーベイ | https://www.annualreviews.org/content/journals/10.1146/annurev-statistics-042522-103837 |
| 3 | Multi-CATE: Multi-Accurate CATE Robust to Unknown Covariate Shifts | Paper | 2024 | multi-accuracy で未知の共変量シフトに頑健化。キャンペーン間の効果転移に直結 | https://arxiv.org/abs/2405.18206 |
| 4 | Minimax Regret Estimation for Generalizing HTE with Multisite Data | Paper | 2024 | 多地点（=複数キャンペーン）データから最悪ケース後悔を最小化しサイト横断で汎化 | https://arxiv.org/abs/2412.11136 |
| 5 | Distributionally Robust Policy Evaluation under Covariate Shift in Contextual Bandits | Paper | 2024 | 共変量シフト下でも頑健に方策を評価する分布ロバスト手法 | https://arxiv.org/pdf/2401.11353 |
| 6 | Two-step pragmatic subgroup discovery for HTE | Paper | 2025 | 効果推定と部分集団発見で別々の共変量集合を使い高異質性サブ集団を同定 | https://link.springer.com/article/10.1007/s10654-025-01215-y |
| 7 | Algorithm for Identifying Interpretable Subgroups With Elevated Treatment Effects | Paper | 2025 | 処置効果が高い解釈可能な部分集団を同定。高反応顧客クラスタ抽出に寄与 | https://arxiv.org/pdf/2507.09494 |
| 8 | Policy Learning with Distributional Welfare | Paper | 2025 | 平均ではなく分布的厚生を最適化する処置割当方策の学習 | https://www.tandfonline.com/doi/full/10.1080/01621459.2025.2552514 |

### (a) 行動セグメンテーション / 顧客埋め込み

| # | Title | Type | Year | Summary | Link |
|---|-------|------|------|---------|------|
| 9 | CATS: Clustering-Aggregated & Time Series for Purchase Intention | Paper | 2025 | 顧客を行動でクラスタリングし注意機構＋時系列で再購買意図を予測 | https://arxiv.org/abs/2505.13558 |
| 10 | Customer Segmentation via Deep Learning, XAI, and RFM (DeepLimeSeg) | Paper | 2023 | RFM・行動・購買履歴を深層学習＋LIME で統合しセグメント化 | https://www.mdpi.com/2227-7390/11/18/3930 |
| 11 | Hybrid Deep Learning for Churn Prediction using RFM & Embedding Clustering | Paper | 2026 | RFM＋Deep Embedded Clustering で行動的に意味あるクラスタへ分割 | https://www.nature.com/articles/s41598-026-53220-0 |
| 12 | A review on customer segmentation methods for personalized targeting in e-commerce [SURVEY] | Survey | 2023 | EC 向け顧客セグメンテーション手法を横断レビュー | https://link.springer.com/article/10.1007/s10257-023-00640-4 |
| 13 | Customer2Vec: Representation learning and AutoML for customer analytics | Blog | 2023 | item2vec/customer2vec による顧客・商品の意味的埋め込み学習 | https://www.griddynamics.com/blog/customer2vec-representation-learning-and-automl-for-customer-analytics-and-personalization |

> 適用の勘所: **#3 Multi-CATE**（未知シフトへの頑健化）と **#4 minimax regret / multisite**（複数キャンペーン横断汎化）が、C3/C4 で束ねた効果を別施策へ転移する際の妥当性を担保する中核。厳密な基礎が必要なら Wager & Athey (2018) と Generalized Random Forests (2019)（C1 に収録）も参照。
