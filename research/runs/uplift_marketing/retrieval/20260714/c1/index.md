# C1 詳細レポート索引: 多施策データ統合・エビデンス統合

- **Cluster**: C1 — Multi-study / Data Pooling
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **上流**: `gather/20260714_c1/resources-multi-study-pooling.md`

## テーマ

複数の疎な実験（施策）を pool して CATE を強化し、施策グルーピングによる擬似的データ拡張を正当化する手法群の詳細。

## レポート一覧

| # | ファイル | タイトル | 一言 |
|---|---------|---------|------|
| 1 | [01-multi-study-r-learner.md](01-multi-study-r-learner.md) | Multi-Study R-Learner | R-learnerを多研究へ拡張。membership確率で類似研究を自動グルーピングし施策固有CATEを partial pooling |
| 2 | [02-combining-rcts-comparison.md](02-combining-rcts-comparison.md) | Comparison of Methods Combining Multiple RCTs | 複数RCT統合手法のシミュレーション比較。試験間異質性を明示する手法が優位という実務指針 |
| 3 | [03-empirical-bayes-many-ab.md](03-empirical-bayes-many-ab.md) | Empirical Bayes with Many A/B Tests | 多数A/Bを横断し経験ベイズで縮小推定、勝者の呪いを補正。施策優先順位付けの基盤 |
| 4 | [04-optimizing-experimentation-programs.md](04-optimizing-experimentation-programs.md) | Optimizing Returns from Experimentation Programs | 実験を制約付き最適化として捉え「多数・小型施策」をポートフォリオ最適化で正当化 |

> **注記**: レポート3の指定URL/DOI（10.1257/pandp.20191003）は実際には Azevedo, Deng, Montiel Olea & Weyl (2019) の論文を指す。Coey & Cunningham の "Improving Treatment Effect Estimators Through Experiment Splitting"（WWW 2019）とは別文献。詳細はファイル冒頭の注記参照。

## ユーザー課題への総括

各疎な施策を1つの study とみなし、**partial pooling / shrinkage** で共通CATE成分を借りつつ施策固有成分を random effect として残すのが中核戦略。異質性を無視した complete pooling は bias を招くため、レポート2の指針に従い異質性考慮手法を選ぶ。多数施策があるならレポート3・4の empirical Bayes / program 最適化が「疎な施策プログラム」全体の意思決定を支える。
