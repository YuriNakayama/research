# Cluster 5: データ効率・hidden confounding・分布シフト頑健性

## Overview

実データでの CATE 精度を支配するのは推定器の洗練さよりも **データの質・量・前提の崩れ** であることが多い。本クラスタは、(1) 少データでも精度を出す **データ効率化**（RCT + 観測データの統合、data borrowing）、(2) **hidden confounding**（観測されない交絡）への頑健化・感度分析・bound、(3) **分布シフト/covariate shift** 下での汎化、を扱う。実務適用における精度の「天井」を引き上げる軸。

## Keywords

`hidden confounding`, `sensitivity analysis`, `B-learner (quasi-oracle bounds)`, `RCT + observational data integration`, `data borrowing`, `double calibration`, `covariate shift robustness`, `distributionally robust CATE`, `multi-accurate CATE`, `progressive confounder generation (ProCI)`, `partial initialization`, `transfer learning CATE`, `differentially private CATE`

## Research Strategy

- **検索クエリ**:
  - `CATE hidden confounding sensitivity bounds B-learner 2024 2025`
  - `RCT observational data integration CATE efficiency data borrowing`
  - `distributionally robust CATE estimator covariate shift selection`
  - `multi-accurate CATE covariate shift`
- **着目すべき論点**:
  - hidden confounding 下での点推定 → bound（部分識別）への切り替え
  - 小規模 RCT を大規模観測データで補強し精度を上げる枠組み（R-OSCAR は RCT 必要サンプルを最大75%削減）
  - 分布シフトに頑健な推定器選択（DRM: Distributionally Robust Metric）
  - hidden confounding による過学習を抑える初期化戦略（partial initialization）
- **主要研究グループ**: Oprescu et al. (B-learner), Kallus & team (multi-accurate, robust), Frauen/Feuerriegel (sensitivity), ProCI authors

## Representative Resources

| Title | Type | Year | Summary |
|-------|------|------|---------|
| B-Learner: Quasi-Oracle Bounds on HTE Under Hidden Confounding | Paper | 2023 | 隠れ交絡下の CATE bound を quasi-oracle 精度で推定 (arXiv:2304.10577) |
| Improving Precision of RCT-Based CATE using Data Borrowing with Double Calibration | Paper | 2023→ | 観測データ借用 + 二重キャリブレーションで RCT 精度向上 (arXiv:2306.17478) |
| Multi-Accurate CATE is Robust to Unknown Covariate Shifts | Paper | 2024 | multi-accurate 後処理で covariate shift に頑健化 (arXiv:2405.18206) |
| Mitigating Hidden Confounding by Progressive Confounder Imputation (ProCI) | Paper | 2025 | 段階的交絡生成で安定した CATE 推定 (arXiv:2507.02928) |
| A Partial Initialization Strategy to Mitigate Overfitting in CATE with Hidden Confounding | Paper | 2025 | hidden confounding 下の過学習を初期化で緩和 (arXiv:2501.08888) |
| Unveiling Robustness in Selecting CATE Estimators (DRM) | Paper | 2024 | 分布頑健メトリクスで推定器選択 (arXiv:2402.18392) |
