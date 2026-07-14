# C5 詳細レポート索引: 施策・ユーザー表現とグルーピング基盤

- **Cluster**: C5 — Representation & Grouping Foundation
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **上流**: `gather/20260714_c5/resources-representation-grouping.md`

## テーマ

「どの施策/ユーザーが近いか」を客観的に測りグルーピングを正当化。C1–C3の妥当性ゲート。

## レポート一覧

| # | ファイル | タイトル | 一言 |
|---|---------|---------|------|
| 1 | [01-learning-action-embeddings.md](01-learning-action-embeddings.md) | Learning Action Embeddings for OPE | 報酬モデルから行動埋め込みを自動学習しMIPSの分散を抑制。施策を効果ベース埋め込み空間に写して客観的にグルーピング |
| 2 | [02-iterative-causal-segmentation.md](02-iterative-causal-segmentation.md) | Iterative Causal Segmentation | AstraZeneca。treatmentと交絡共変量が密結合する状況の反復uplift セグメンテーション。効果ベース分割を正当化するマーケ実装 |
| 3 | [03-causal-clustering-cate.md](03-causal-clustering-cate.md) | Causal Clustering for CATE | Robinson分解でdebiasしたCATEからカーネル行列を作り効果類似度でサブグループ発見。反応の近さを陽にカーネル化 |
| 4 | [04-generalizability-transportability-review.md](04-generalizability-transportability-review.md) | Generalizability & Transportability Review | 効果を別集団へtransportする理論の統一レビュー。分布シフト診断＋二重頑健補正（Annual Review） |

## ユーザー課題への総括

グルーピング判断を主観でなくデータ駆動で正当化する土台。(1) 施策の近さはレポート1のaction embedding距離で定義 → C1のpooling対象・C2の転移元選択に供給。(2) ユーザーの近さは生共変量でなく**効果ベース**でレポート2/3のcausal clustering/segmentationにより群化。(3) ある母集団の効果を別ユーザー基盤へ移す妥当性はレポート4のtransportabilityで診断（グルーピングが効果推定を歪めないことを保証）。**基盤として最初に固めるべき**クラスタ。
