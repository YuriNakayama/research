# 行動セグメンテーション × 効果の転移可能性 — 詳細レポート（C5）

## Parameters

- **Resources analyzed**: 14 論文（全て arXiv 中心）
- **Resource types**: Academic Paper
- **Generated on**: 2026-07-12
- **Input source**: `clustering/20260712/cluster-05` + `gather/20260712_all`（C5 セクション）
- **Detail level**: 詳細（各 200〜400 行、図表・数式・擬似コード・本テーマへの適用可能性込み）
- **本テーマ**: ユーザー/施策を行動で束ねる単位を作り、ある施策で学習した効果を似たクラスタへ転移する。その妥当性（転移可能性・外的妥当性）を担保する

## Big Picture

C5 は「**どのユーザー/施策を束ねてよいか**」（束ねる単位の作り方＝行動セグメンテーション）と「**束ねた効果を別施策へ転用してよいか**」（転移可能性・外的妥当性）の2側面。14本は3系統。**(a) 転移可能性の理論・手法**（統一枠組み #1、主因果効果 #2、一段階重み付け #3、multi-accurate CATE #4、multisite ミニマックス #5）— ある母集団の効果を共変量シフト下の別母集団へ移送。**(b) 処置効果ベースのサブグループ発見**（#6〜#11）— 効果が均質/高い部分集団を見つけて束ねる。**(c) 行動セグメンテーション/顧客埋め込み**（#12 CASPR、#13 MoE、#14 RFM）— 施策間・ユーザー間の「似ている」を潜在空間で定義。(c) で束ね、(b) で効果別に切り、(a) で転移の妥当性を保証、という流れが本テーマの土台。

## Report List

### (a) 転移可能性・外的妥当性

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 1 | Unified Framework for Transportability of Causal Measures | 2025 | NeurIPS 2025 | RD/RR/OR/NNT 等の因果測度を共変量シフト下で移送する統一枠組み（one-step/EE 半パラ効率） | [詳細](01-transportability-unified-framework.md) |
| 2 | Transportability of Principal Causal Effects | 2024 | arXiv | 主成層を移送設定へ拡張、complier 層への効果を EIF ベース DR 推定（Bias0.002/RMSE0.087/被覆94.9%） | [詳細](02-transportability-principal-effects.md) |
| 3 | One-Step Weighting to Generalize & Transport | 2022 | arXiv | ターゲット共変量プロファイルへ直接バランスさせる凸最適化で最小分散重みを一段階構成（RMSE 最大 -86%） | [詳細](03-one-step-weighting-generalize.md) |
| 4 | Multi-CATE: Multi-Accurate CATE under Covariate Shift | 2024 | arXiv | multi-accuracy/multicalibration を CATE に導入、MCBoost 後処理で未知シフト先のバイアスを 2α に抑制 | [詳細](04-multi-cate-covariate-shift.md) |
| 5 | Minimax Regret for Multisite HTE Generalization | 2024 | arXiv | ターゲット CATE をサイト固有 CATE の凸結合とみなし worst-case regret を最小化（閉形式・通信効率的） | [詳細](05-minimax-regret-multisite.md) |

### (b) 処置効果ベースのサブグループ発見

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 6 | Interpretable Subgroups with Elevated Effects | 2025 | arXiv | support×効果量の乗法型目的を simulated annealing で最適化、解釈可能 rule set を Pareto frontier で発見 | [詳細](06-interpretable-subgroups-elevated.md) |
| 7 | Causal Subgroup Discovery in Survival Outcomes | 2024 | arXiv | meta-learner+IPCW+CTree+Lasso で生存 CATE 推定と疎な解釈可能サブグループ発見を同時（外部検証で再現） | [詳細](07-causal-subgroup-survival.md) |
| 8 | Distilling HTE: Causal Distillation Trees | 2025 | arXiv | 任意 meta-learner で脱ノイズした CATE を決定木に蒸留、安定・解釈可能な効果別サブグループ（一致性保証） | [詳細](08-distilling-hte-stable-subgroups.md) |
| 9 | Causal Clustering for CATE | 2025 | IEEE BHI 2025 | causal forest カーネルで CATE 類似度に基づき個体をクラスタリング、効果が均質な部分集団を発見 | [詳細](09-causal-clustering-cate.md) |
| 10 | Aggregation Trees | 2024 | arXiv (Econometric Rev.) | 推定 CATE を回帰木で集約し入れ子グルーピング系列、honesty+DR で各群 GATE 推論（RMSE 17-121%改善） | [詳細](10-aggregation-trees.md) |
| 11 | SubgroupTE | 2024 | ACM TIST | 処置効果空間で個体をサブグループにクラスタリングし効果を再推定する EM 反復型 deep TEE（PEHE 0.056） | [詳細](11-subgroupte.md) |

### (c) 行動セグメンテーション / 顧客埋め込み

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 12 | CASPR: Customer Activity Sequence Representation | 2022 | NeurIPS 2022 WS | 顧客活動系列を Transformer で自己教師あり学習し汎用顧客埋め込み（KKBox AUROC 0.89→0.91） | [詳細](12-caspr-customer-representation.md) |
| 13 | Mixture of Experts for Consumer Choice | 2025 | arXiv | softmax gating で消費者を複数 MNL expert へソフト割当、4セグメントと弾力性を発見（精度78.9%/AUC0.91） | [詳細](13-mixture-of-experts-consumers.md) |
| 14 | UK Retail RFM × 5 Clustering | 2023 | Analytics (MDPI) | UCI Online Retail(54万件)を RFM 化し K-means/GMM/DBSCAN/BIRCH/agglo を比較（GMM+PCA が Silhouette 0.80） | [詳細](14-uk-retail-rfm-clustering.md) |

## Cross-Resource Insights

- **「似ている」の定義が全ての起点**: (c) の顧客埋め込み（#12 CASPR、#13 MoE、#14 RFM）で施策対象層・ユーザーの類似度を潜在空間に落とすことが、C3 の転移（CITA タスク親和性）や C4 の近傍プーリング（DTW 近傍）の入力になる。
- **効果別に束ねる vs 行動で束ねる**: (b) は「効果が似た」サブグループ、(c) は「行動が似た」セグメント。両者は一致するとは限らず、#9 causal clustering や #10 aggregation trees は「効果空間」で束ねる点が uplift に直結。
- **転移の妥当性チェック**: (a) は「束ねた効果を別施策へ流用してよいか」を保証。特に #4 Multi-CATE（未知シフトに頑健）と #5 minimax multisite（複数施策横断汎化）が、C3/C4 で束ねた効果を新施策へ転移する際のガードレール。
- **プライバシー/通信効率**: #5 は閉形式・集約のみで済み、C3 の federated 系（#16/#17）と設計思想が揃う。

## Comparison Table

| 系統 | 手法 (#) | 束ねる/移送する軸 | 主な保証・効果（出典値） |
|------|---------|-----------------|----------------------|
| (a) 移送 | One-Step Weighting (#3) | 共変量プロファイル | multiply robust・半パラ効率、RMSE 最大 -86% |
| (a) 移送 | Multi-CATE (#4) | 尤度比クラス内の未知シフト | 未知シフト先バイアス ≤ 2α |
| (a) 移送 | Minimax Multisite (#5) | サイト（=施策）の凸結合 | worst-case regret 最小・閉形式 |
| (b) サブグループ | Aggregation Trees (#10) | 効果の入れ子グルーピング | RMSE 17-121%改善、95%CI 被覆 0.92-0.94 |
| (b) サブグループ | Causal Clustering (#9) | CATE 類似度カーネル | 効果均質な部分集団を安定発見 |
| (c) セグメント | CASPR (#12) | 行動系列の埋め込み | KKBox AUROC 0.89→0.91、Instacart MAP 0.21→0.46 |
| (c) セグメント | RFM×GMM (#14) | RFM 空間 | Silhouette 0.80（top/high/medium/low/lost） |

## Further Investigation Candidates

- gather C5 未収録：Deep Learning of Continuous/Structured Policies for Aggregated HTE (2507.05511)、Customer2Vec (2012.11876)。
- C3 との重複を跨ぐ設計：#4 Multi-CATE / #5 multisite は C3（跨施策 HTE）でも中核。統合サマリで両クラスタを接続する余地。

## 次のステップ

- **統合設計書**: (c)→(b)→(a) を「施策・ユーザーの束ね方＋転移ガードレール」として C3/C4 と結合。
- **行動埋め込みの実装**: CASPR/RFM で施策間類似度を定義し、C3 の CITA・C4 の近傍プーリングに接続。
