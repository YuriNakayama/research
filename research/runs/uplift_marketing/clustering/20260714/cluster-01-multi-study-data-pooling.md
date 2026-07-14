# Cluster 1: 多施策データ統合・エビデンス統合（Multi-study / Data Pooling）

## Overview

複数の異質な実験（＝施策）を統合して単一施策では得られない統計的強度を確保する領域。「施策をグルーピングして擬似的にデータ量を増やす」というユーザーの核心アイデアに、最も直接的な理論的裏付けを与える。施策ごとに対象ユーザー・訴求内容・クーポン額が異なる（＝study間で分布・効果が異質）ことを、pooling / partial pooling / shrinkage によって明示的に扱う。

## Keywords

`multi-study R-learner`, `data pooling`, `random-effects meta-analysis`, `hierarchical Bayesian model`, `individual patient data (IPD) meta-analysis`, `combining multiple RCTs`, `partial pooling`, `study heterogeneity`, `shrinkage estimation`, `empirical Bayes`, `federated causal inference`, `cross-study CATE`, `borrowing strength`, `fixed vs random effects`

## Research Strategy

- **起点サーベイ**: Brantner et al. 2024（Statistics in Medicine）— 複数RCT結合手法の比較。pooling手法の分類を最初に把握する。
- **中核手法**: multi-study R-learner — 施策間で propensity/outcome mechanism が異なる前提を緩和。ユーザーの「施策ごとに条件が違う」状況に直接対応。
- **接続**: テック企業の「多数の弱い実験を跨いだ empirical Bayes / shrinkage」は C4 と接続。partial pooling は「完全に別扱い」と「全部まとめる」の中間で、施策グルーピングの数学的表現そのもの。
- **検証ポイント**: pooling が妥当となる identification 条件（CATE が study間で共有される仮定）を必ず確認。異質すぎる施策を pool すると bias を招く → C5 のグルーピング品質と表裏一体。

### 推奨クエリ

```
"multi-study CATE estimation"
"combining multiple experiments heterogeneous treatment effect"
"partial pooling treatment effect shrinkage"
"empirical Bayes many experiments treatment effect"
"federated heterogeneous treatment effect"
```

## Seed Resources

| Title | Year | Type | Link |
|-------|------|------|------|
| Comparison of methods that combine multiple RCTs to estimate HTE | 2024 | Survey | https://arxiv.org/pdf/2303.16299 |
| Multi-study R-learner for estimating HTE across studies | 2024 | Paper | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12713001/ |
| Comparison of methods (journal version) | 2024 | Paper | https://onlinelibrary.wiley.com/doi/10.1002/sim.9955 |

## ユーザー課題への適用

「数ヶ月に1度の疎な施策」を独立に分析する代わりに、対象・訴求が近い施策群を **partial pooling** で束ね、施策固有の効果を random effect として残しつつ共通成分を借りる。これが「擬似的にデータ間隔を短縮しデータ量を増やす」の統計的実装形になる。
