# Cluster 4: uplift ランキング指標の直接最適化

## Overview

マーケティング実務では CATE の絶対値より **「効果が高い順にユーザーをランク付けできるか」**（AUUC / Qini / uplift@k）が重要。本クラスタは、推定誤差を最小化する代わりに **ランキング指標そのものを直接最適化する損失設計**（AUUC-max, learning-to-rank for uplift など）を扱う。既存ドメインの README で定義された評価指標（uplift@k / AUUC）に直結し、実務 KPI を直接押し上げる精度向上アプローチ。

## Keywords

`AUUC`, `Qini coefficient`, `uplift@k`, `AUUC-max`, `learning-to-rank for uplift`, `direct uplift loss`, `uplift generalization bound`, `weighted doubly robust uplift`, `cost-aware uplift optimization`, `graph-based uplift (GNN)`, `knowledge distillation uplift`

## Research Strategy

- **検索クエリ**:
  - `AUUC-max direct optimization uplift modeling generalization bound`
  - `learning to rank uplift modeling Qini`
  - `uplift modeling deep learning loss function 2024 2025`
  - `weighted doubly robust uplift mixed treatments`
- **着目すべき論点**:
  - ランキング指標の直接最適化 vs CATE 推定 → 事後ランク付け、どちらが AUUC を高めるか
  - AUUC に対する汎化 bound と過学習リスク
  - 多施策（multiple treatments）・コスト制約下での最適化
  - GNN / knowledge distillation など新規アーキテクチャの uplift への適用
- **主要研究グループ**: Devriendt & Verbeke (learning-to-rank uplift), Betlei et al. (uplift generalization), Zhao et al. (multiple treatments cost optimization), Criteo Research (大規模 uplift ベンチマーク)

## Representative Resources

| Title | Type | Year | Summary |
|-------|------|------|---------|
| Uplift Modeling with Generalization Guarantees (AUUC-max) | Paper | 2021 | AUUC 上界を直接最適化する学習目的を定式化 (KDD) |
| Learning to Rank for Uplift Modeling | Paper | 2021→ | ランキング学習を uplift に適用 (Devriendt et al.) |
| Weighted Doubly Robust Learning for Mixed Treatments' Effect | Paper | 2023 | 重み付き DR による uplift（AUUC 0.590 達成） |
| Uplift Modeling for Multiple Treatments with Cost Optimization | Paper | 2019→ | 多施策・コスト最適化 uplift (arXiv:1908.05372) |
| A Large-Scale Benchmark for Uplift Modeling (Criteo) | Dataset/Paper | — | uplift モデル比較の標準ベンチマーク |
