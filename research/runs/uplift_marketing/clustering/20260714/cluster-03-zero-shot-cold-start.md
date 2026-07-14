# Cluster 3: 情報0施策のゼロショット効果予測（Zero-shot / Cold-start Causal）

> **本リサーチの最重要クラスタ**。ユーザーの「実施実績のない情報0の施策についての予測」という明示要望に唯一直接答える領域。

## Overview

実施実績が全くない（情報0の）新規施策について、施策そのものを特徴量（クーポン額・訴求文言カテゴリ・対象条件・チャネル等）で表現し、過去の多数施策から学習したメタモデルで効果を**ゼロショット予測**する領域。CaML（Zero-shot causal learning, NeurIPS 2023）が金字塔で、「各介入を1タスクとしてサンプリングし、単一メタモデルを多数タスクで学習」する定式化が、ユーザー課題の設計図になる。加えて極端なデータ疎・不均衡下での cold-start 因果推論（ColdNet）を含む。

## Keywords

`zero-shot causal learning`, `CaML`, `novel intervention effect prediction`, `intervention as features`, `cold-start treatment effect`, `ColdNet`, `causal meta-learning across interventions`, `treatment/action attributes`, `unseen treatment arm`, `meta-model over tasks`, `generalization to new treatments`, `feature-based effect extrapolation`

## Research Strategy

- **中核**: CaML（arXiv:2301.12292）を精読。介入情報（施策の属性）＋個人特徴の両方を使い、学習時に存在しなかった介入の個別効果を予測。「test介入で直接学習した強baselineをも上回る」結果は、施策設計段階での効果予測の実現可能性を示す。
- **実務的cold-start**: ColdNet（Amazon Science）— treatment率0.4%・outcome 97.6%ゼロ・profile 99.2%不完全という極端条件。実マーケデータの疎・不均衡に近い。cluster-based cold-start enhancement で類似サンプルから予測を転移。
- **鍵となる設計**: 施策の特徴量設計（クーポン額を連続値で、訴求カテゴリを埋め込みで等）が予測性能を決定 → C5 の action representation と不可分。
- **検証**: ゼロショット予測の妥当性を保証する仮定（介入特徴が効果を十分に説明する）を明確化。

### 推奨クエリ

```
"zero-shot causal learning novel intervention"
"predict effect of new treatment from features"
"cold-start treatment effect estimation neural"
"causal meta-learning unseen intervention"
"intervention attributes effect generalization"
```

## Seed Resources

| Title | Year | Type | Link |
|-------|------|------|------|
| Zero-shot causal learning (CaML) | 2023 | Paper | https://arxiv.org/abs/2301.12292 |
| ColdNet: Treatment effect estimation with cold-start, imbalance, zero-inflated outcomes | 2025 | Paper | https://www.amazon.science/publications/coldnet-treatment-effect-estimation-with-cold-start-imbalance-and-zero-inflated-outcomes |
| Causal machine learning for predicting treatment outcomes | 2024 | Survey | https://arxiv.org/html/2410.08770v1 |

## ユーザー課題への適用

新しいクーポン施策（例: これまで配ったことのない金額×新セグメント）の効果を、配布前に予測する。過去の全施策を「施策特徴＋対象ユーザー特徴 → 効果」のタスク集合としてメタ学習しておけば、情報0の新施策も特徴量さえ与えれば効果推定できる。**施策の実施前スクリーニング／予算配分の意思決定**に直結する、最もインパクトの大きい方向性。
