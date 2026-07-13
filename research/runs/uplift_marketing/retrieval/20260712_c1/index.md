# Uplift / CATE モデリング（複数処置対応）— 詳細レポート（C1）

## Parameters

- **Resources analyzed**: 15 論文（全て arXiv 中心）
- **Resource types**: Academic Paper
- **Generated on**: 2026-07-12
- **Input source**: `clustering/20260712/cluster-01` + `gather/20260712_all`（C1 セクション）
- **Detail level**: 詳細（各 200〜400 行、図表・数式・擬似コード・本テーマへの適用可能性込み）
- **本テーマ**: 各施策内で個人単位の増分効果（uplift/CATE）を推定する「土台」。C3/C4 が跨施策で共有・プールする対象の base estimator を提供する

## Big Picture

C1 は本テーマの **base estimator 層**。15本は3系統。**(a) 深層 uplift アーキテクチャ**（DragonNet/EFIN/DESCN/M³TN/TSCAN）— 傾向スコアヘッド・全空間モデリング・attention・二段階学習で交絡と選択バイアスを抑える。**(b) 複数値・連続処置**（Multi-treatment Adaptation/多値 meta-learner/連続 predict-then-optimize/GCF/ranking meta-learner）— クーポン額など多値・連続の処置を扱い、予算制約下の割当まで解く。**(c) 収益指向・評価・ベンチマーク**（Rankability/VALOR/IPC/Deep Uplift Benchmark/Criteo 比較）— zero-inflated な収益を直接扱い、Qini/AUUC で評価。重要な現実：**ベンチマーク #14 は「深層の優位は限定的、安定 SOTA は存在せず」、大規模比較 #15 は「S-Learner が最良」** と報告しており、複雑な深層より頑健な meta-learner が土台として有力なことがある。

## Report List

### (a) 深層 uplift アーキテクチャ

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 1 | DragonNet | 2019 | NeurIPS 2019 | 傾向スコアの十分性を使う three-headed ネット＋targeted regularization で ATE/CATE 推定 | [詳細](01-dragonnet.md) |
| 2 | EFIN | 2023 | KDD 2023 | treatment 特徴を明示埋め込み、self/treatment-aware attention＋intervention constraint で非ランダム介入補正 | [詳細](02-efin.md) |
| 3 | DESCN | 2022 | KDD 2022 | propensity を明示した Entire Space モデリング＋擬似処置効果の logit 空間クロス再構成で treatment bias と不均衡を緩和 | [詳細](03-descn.md) |
| 4 | M³TN | 2024 | ICASSP 2024 | 多値処置を MMoE で効率化＋対照反応+uplift の加法分解、小モデルで高 Qini/Kendall | [詳細](04-m3tn.md) |
| 5 | TSCAN | 2025 | arXiv | バイアス抑制正則化(Stage1)＋isotonic 直接 uplift(Stage2)の二段階＋Context-Aware Attention（実A/Bで注文+0.76%） | [詳細](05-tscan.md) |

### (b) 複数値・連続処置

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 6 | Multi-Treatment Adaptation (OFA) | 2025 | arXiv | 既存適応を Structure/Feature 2類型に整理＋Legendre 直交多項式で処置を連続展開する OFA を提案 | [詳細](06-multi-treatment-adaptation.md) |
| 7 | Multi-valued Meta-learners | 2023 | ICML 2023 | 多値処置での T/S/X/M/DR/R-learner の誤差上界を処置数 K の関数で理論解析（X-learner が観測設定で最良） | [詳細](07-multivalued-metalearners.md) |
| 8 | Continuous Treatment Predict-then-Optimize | 2024 | arXiv | 連続処置の CADR を因果ML で推定し予算/公平性制約下の用量割当を ILP で解く2段 | [詳細](08-continuous-treatment-predict-optimize.md) |
| 9 | GCF (Generalized Causal Forest) | 2022 | arXiv | causal forest をカーネル DR＋距離ベース分割で連続処置に一般化（本番A/Bで完了注文+15.1〜25.2%） | [詳細](09-gcf-generalized-causal-forest.md) |
| 10 | Metalearners for Ranking TE | 2024 | arXiv | 効果推定(MSE)と予算割当のミスアライメントを learning-to-rank で解決（AUQC=NDCG、O(n) スケール） | [詳細](10-metalearners-ranking-te.md) |

### (c) 収益指向・評価・ベンチマーク

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 11 | Rankability-enhanced Revenue Uplift | 2024 | KDD 2024 | ZILN 損失＋listwise uplift ranking で長裾収益を順位最適化（Tencent FiT で検証） | [詳細](11-rankability-revenue-uplift.md) |
| 12 | VALOR (Value-Aware Revenue, B2B) | 2026 | arXiv | Treatment-Gated ゲート＋Cost-Sensitive Focal-ZILN で zero-inflated B2B 収益（Qini 約20%改善、増分収益2.7倍） | [詳細](12-valor-value-aware-revenue.md) |
| 13 | Incremental Profit per Conversion (IPC) | 2023 | KDD 2023 WS | 応答変換でコンバージョン済みデータ・傾向スコア・単一モデルのみで増分利益を推定、zero-inflation 回避 | [詳細](13-incremental-profit-per-conversion.md) |
| 14 | Benchmarking Deep Uplift | 2024 | arXiv | 深層 uplift 13手法を Criteo/Lazada で統一評価（**前処理で順位が入替、安定SOTAなし**） | [詳細](14-benchmarking-deep-uplift.md) |
| 15 | Meta-Learners vs Causal Forest (大規模比較) | 2026 | arXiv | Criteo v2.1(約1398万件)で比較（**S-Learner が Qini 0.376 で最良**、上位20%で増分CV 77.7%捕捉） | [詳細](15-metalearners-causalforest-comparison.md) |

## Cross-Resource Insights

- **「複雑な深層 ≠ 良い土台」**: #14（安定 SOTA なし）と #15（S-Learner 最良）は、跨施策プーリング（C3/C4）の base estimator として**頑健で分散の小さい meta-learner を選ぶべき**ことを示唆。疎なデータほど単純モデルが効く。
- **複数処置＝クーポン額に直結**: #4/#6/#7/#8/#9 は「異なるクーポン額・訴求」を multi-valued/continuous treatment として扱う。C3 の task embedding（#13）と接続すれば「複数処置を跨施策で共有」できる。
- **推定より割当**: #10（ranking meta-learner）と #8（predict-then-optimize）は「効果推定の精度」より「予算制約下の割当の質」を直接最適化。マーケ実務のゴール（限られた予算で増分最大化）に沿う。
- **zero-inflated 収益**: #11/#12/#13 はコンバージョン率が低く収益がゼロ膨張する EC/マーケの現実に対処。value-driven 評価は C1 の締め。

## Comparison Table（base estimator の選択指針）

| 手法 (#) | 処置タイプ | 交絡/バイアス対処 | 疎データ適合 | 定量効果（出典値） |
|---------|-----------|-----------------|------------|-----------------|
| DragonNet (#1) | 二値 | 傾向スコアヘッド+targeted reg | 中 | IHDP/ACIC で既存超え |
| DESCN (#3) | 二値 | Entire space + propensity | 中 | ベンチマーク常連 |
| M³TN (#4) | 多値 | 加法分解 + MMoE | 中〜高（小モデル） | 小モデルで高 Qini |
| OFA (#6) | 多値/連続 | 直交多項式展開 | 高（頑健性最高） | 多様なデータで最頑健 |
| GCF (#9) | 連続 | カーネル DR | 中 | 本番+15.1〜25.2% |
| S-Learner (#15) | 二値/多値 | （単純） | 高 | Qini 0.376 で最良 |
| VALOR (#12) | 二値（収益） | Treatment-Gated | 中 | 増分収益2.7倍 |

## Further Investigation Candidates

- gather C1 未収録：stratified sampling for uplift (2401.14294)、Score Ranking & Calibration (2408.13628)、Structural Biases 評価 (2603.20775)、Short-Video multi-treatment (2511.18997)。
- OSS 実装：EconML / CausalML / scikit-uplift でのベースライン再現。

## 次のステップ

- **統合設計書**: C1（base estimator）→ C3/C4（跨施策で共有・プール）→ C5（束ね方・転移ガードレール）→ C2（OPE で方策評価）の全体アーキテクチャに結合。
- **base estimator の選定検証**: 本ケースのデータで S-Learner / X-Learner / M³TN / OFA を Qini/AUUC 比較し、C3/C4 のプーリング対象を決める。
