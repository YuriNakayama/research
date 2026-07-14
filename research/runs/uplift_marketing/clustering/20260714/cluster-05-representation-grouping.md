# Cluster 5: 施策・ユーザー表現とグルーピング基盤（Representation & Grouping Foundation）

## Overview

「どの施策・どのユーザーが近いか」を定量化し、C1–C3 のグルーピング/転移/予測を支える基盤技術。施策（action）を埋め込みベクトルで表現する action representation、効果の似たユーザーを見つける causal clustering、ある母集団の効果を別母集団へ一般化する transportability が中心。ユーザーの「行動傾向や対象ユーザーの近い施策をグルーピング」という発想を、恣意的でなく**データ駆動で正当化**する手段を提供する。C1–C3の妥当性ゲート（似ていない施策を束ねない）でもある。

## Keywords

`action embedding`, `learning action representation`, `causal clustering`, `subgroup discovery`, `transportability`, `generalizability of causal effects`, `covariate shift adaptation`, `customer representation learning`, `RFM segmentation`, `mixture-of-experts consumers`, `policy as mixture over context-action`, `effect-based similarity`

## Research Strategy

- **施策の埋め込み**: Learning Action Embeddings for OPE（arXiv:2305.03954）— 施策をログデータから埋め込む。施策の近さ＝埋め込み距離として定義でき、グルーピングの客観的基準になる。関連: OPE in Embedded Spaces（arXiv:2203.02807）。
- **効果ベースのクラスタリング**: causal clustering / subgroup discovery 系で「効果が似たユーザー群」を発見。ユーザーの行動傾向グルーピングと突き合わせ、効果の観点で妥当か検証。
- **transportability**: 効果を別母集団へ一般化する identification 条件を押さえ、グルーピング/転移が効果推定を歪めない前提を明確化。
- **多施策の action 表現**: Offline Multi-Action Policy Learning（arXiv:1810.04778）— multi-action への一般化。

### 推奨クエリ

```
"learning action embeddings off-policy evaluation"
"causal clustering treatment effect subgroup"
"transportability causal effect covariate shift"
"effect-based customer segmentation representation"
"policy as mixture context action components"
```

## Seed Resources

| Title | Year | Type | Link |
|-------|------|------|------|
| Learning Action Embeddings for Off-Policy Evaluation | 2023 | Paper | https://arxiv.org/abs/2305.03954 |
| Offline Multi-Action Policy Learning: Generalization and Optimization | 2018 | Paper | https://arxiv.org/pdf/1810.04778 |
| Off-Policy Evaluation in Embedded Spaces | 2022 | Paper | https://arxiv.org/pdf/2203.02807 |

## ユーザー課題への適用

「施策をグルーピングする」判断を主観でなく、施策埋め込み距離＋効果ベース類似度で行う。これにより C1 の pooling / C2 の転移元選択 / C3 の施策特徴量設計すべてに、客観的な「近さ」の定義を供給する。グルーピングの品質が下流の統計的強度の借り合いの妥当性を決めるため、**基盤として最初に固めるべき**クラスタ。
