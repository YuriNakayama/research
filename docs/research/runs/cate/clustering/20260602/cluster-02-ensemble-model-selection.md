# Cluster 2: アンサンブル・モデル選択・CATE 専用バリデーション

## Overview

CATE 推定の最大の実務的困難は **「真の処置効果（ground truth）が観測できない」** ため、どの推定器・ハイパーパラメータが最良かを通常の交差検証で選べない点にある。本クラスタは、(1) 複数 CATE 推定器を組み合わせる **アンサンブル/スタッキング**、(2) ground-truth 無しで推定器を選ぶ **モデル選択手法**、(3) Tau-risk / AUTOC など **CATE 専用のバリデーション指標** を扱う。「正しい推定器を選ぶ」こと自体が精度向上の独立した研究軸になっている。

## Keywords

`CATE model selection`, `Tau-risk`, `R-loss validation`, `AUTOC`, `policy risk`, `causal forest ensemble`, `causal rule ensemble`, `model-based forests`, `stacking CATE estimators`, `cross-fitted weighted test statistic`, `pseudo-outcome validation`, `plug-in vs pseudo-outcome metric`, `ground-truth-free selection`

## Research Strategy

- **検索クエリ**:
  - `CATE estimator model selection ground truth free validation 2024 2025`
  - `Tau-risk R-loss heterogeneous treatment effect validation metric`
  - `AUTOC area under TOC heterogeneity model selection`
  - `causal forest ensemble stacking uplift`
- **着目すべき論点**:
  - どの validation メトリクスが実際に推定器の順位付けに有効か（「単純な Tau-T score が平均的に優秀」という知見の検証）
  - pseudo-outcome ベース vs plug-in ベースの指標の優劣
  - アンサンブルが単一推定器を上回る条件
  - cross-fitted exponentially weighted test statistic による信頼性の高い選択
- **主要研究グループ**: Athey & Wager (grf, AUTOC), Schuler et al. (model selection comparison), Hothorn (model-based forests), Mahajan et al. (empirical model selection)

## Representative Resources

| Title | Type | Year | Summary |
|-------|------|------|---------|
| Empirical Analysis of Model Selection for Heterogeneous Causal Effect Estimation | Paper | 2022 | CATE モデル選択の大規模実証比較。指標の有効性を体系化 (arXiv:2211.01939) |
| Reliable Selection of Heterogeneous Treatment Effect Estimators | Paper | 2025 | cross-fitted weighted test statistic による信頼性の高い推定器選択 (arXiv:2511.18464) |
| Causal rule ensemble method for estimating HTE with prognostic effects | Paper | 2024 | RuleFit 系の因果ルールアンサンブル (Hiraishi et al.) |
| HTE estimation for observational data using model-based forests | Paper | 2024 | 観測データ向け model-based forest（交絡対処付き） (Dandl, Bender, Hothorn) |
| Unveiling the Potential of Robustness in Selecting CATE Estimators | Paper | 2024 | 頑健性を選択基準に取り込む（DRM 関連） (arXiv:2402.18392) |
