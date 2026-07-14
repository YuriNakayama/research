# C2 詳細レポート索引: 施策間の知識転移・メタ学習CATE

- **Cluster**: C2 — Transfer / Meta-learning CATE
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **上流**: `gather/20260714_c2/resources-transfer-meta-cate.md`

## テーマ

旧施策で学習したCATEモデルを新施策へ転移する（「別施策の活用」）。転移元選択と negative transfer 回避を含む詳細。

## レポート一覧

| # | ファイル | タイトル | 一言 |
|---|---------|---------|------|
| 1 | [01-heterogeneous-feature-transfer.md](01-heterogeneous-feature-transfer.md) | Transfer Learning on Heterogeneous Feature Spaces | 旧・新施策で顧客特徴が異なる場合の転移を共有層＋私的層のマルチタスク表現学習で実現 |
| 2 | [02-cita-task-affinity.md](02-cita-task-affinity.md) | Transfer Learning for ITE (CITA) | CITA指標で「複数の旧施策のうちどれを転移元にするか」を定量選択、negative transfer回避。最大95%データ削減 |
| 3 | [03-combining-obs-randomized.md](03-combining-obs-randomized.md) | Combining Observational and Randomized Data | 旧施策の大量ログ（交絡あり）で共通表現、新施策の少量A/B（不偏）で補正するCorNet。融合の是非を判定する理論付き |
| 4 | [04-meta-learning-closed-form.md](04-meta-learning-closed-form.md) | Meta-learning for HTE with Closed-form Solvers | 多数の旧施策をタスクとしてメタ学習し新施策は閉形式ソルバで少数データから即CATE推定 |

## ユーザー課題への総括

C1の「同時pool」が難しい（施策が時間的に離れる・特徴が違う）場合の非対称な転移経路。実務手順は (1) レポート2のCITAで**近い旧施策を客観選択**（negative transfer回避）→ (2) 特徴空間が違えばレポート1、潤沢ログ＋少量RCTならレポート3、多数の旧施策を一括活用ならレポート4を適用。C3（情報0予測）への橋渡しでもある。
