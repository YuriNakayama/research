# Cluster 2: 施策間の知識転移・メタ学習CATE（Transfer / Meta-learning CATE）

## Overview

ある施策（source）で学習した効果推定モデルを、別の施策（target）へ転移する領域。「別施策の活用」に直結する。施策間で特徴空間や対象母集団が異なる場合の転移（異質特徴空間）、少数サンプルしかない新施策への few-shot 適応、複数タスクを跨いだメタ学習が含まれる。C1が「同時に pool する」対称な統合であるのに対し、C2は「先行施策の知識を後続施策へ移す」**非対称な転移**である点で区別される。

## Keywords

`transfer learning for CATE`, `meta-learning treatment effect`, `heterogeneous feature spaces transfer`, `few-shot CATE`, `domain adaptation causal`, `task-shared / task-specific parameters`, `closed-form meta-learner`, `representation transfer`, `source-target treatment effect`, `MAML for causal inference`, `covariate shift`, `negative transfer`, `multi-task causal learning`

## Research Strategy

- **異質特徴空間**: Transfer Learning on Heterogeneous Feature Spaces (arXiv:2210.06183) — 施策ごとに取得できる特徴量が違う実務状況（あるキャンペーンは閲覧ログ有、別は購買のみ等）に対応。shared/private layer の multi-task 構造。
- **few-shot 適応**: Meta-learning with closed-form solvers (arXiv:2305.11353) — 少数データの新施策へ task-specific パラメータを閉形式で適応。
- **リスク管理**: **negative transfer**（似ていない施策からの転移がむしろ精度を落とす）の診断・回避を必ず調査。転移元選択は C5 のグルーピング品質に依存。
- **選択問題**: Selecting Treatment Effects Models for Domain Adaptation Using Causal Knowledge — どのモデル/source を選ぶかを因果知識で決める。

### 推奨クエリ

```
"transfer learning conditional average treatment effect"
"meta-learning heterogeneous treatment effect few-shot"
"treatment effect estimation heterogeneous feature spaces"
"negative transfer causal inference"
"domain adaptation treatment effect model selection"
```

## Seed Resources

| Title | Year | Type | Link |
|-------|------|------|------|
| Transfer Learning on Heterogeneous Feature Spaces for Treatment Effects Estimation | 2022 | Paper | https://arxiv.org/pdf/2210.06183 |
| Meta-learning for HTE estimation with closed-form solvers | 2024 | Paper | https://arxiv.org/abs/2305.11353 |
| Selecting Treatment Effects Models for Domain Adaptation Using Causal Knowledge | 2023 | Paper | https://dl.acm.org/doi/10.1145/3587695 |

## ユーザー課題への適用

過去の類似施策で学習したモデルを新施策の初期モデルとして転移し、新施策の少数データで微調整する。C1 の「同時 pool」が難しい（施策が時間的に離れている・特徴が違う）場合の代替経路であり、C3（情報0予測）への橋渡しでもある。
