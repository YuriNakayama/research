# 詳細レポート索引: Dataiku ネイティブ Causal Prediction

- **Cluster**: dataiku_native_causal
- **Domain**: `dataiku_uplift_ops`
- **Generated**: 2026-07-15
- **上流**: `gather/20260715/dataiku_native_causal/resources-dataiku-native-causal.md`

## テーマ

Dataiku DSS が 12.0.0 で導入した **Causal Prediction**（Visual ML の一機能としての uplift / CATE モデリング）について、機能仕様・制約境界・バージョン変遷・統計的仮定・マーケティング表現の5観点から精査する。

本クラスタの調査は、リリースノート全文の grep とドキュメントページ棚卸しという一次情報の網羅によって進めた。その結果、**事前情報の2点（Treatment Analysis の導入バージョン、Partitioned Models 非互換）が誤りであることを訂正**している。訂正の内容と根拠はレポート 02 と 03 に集約した。

## レポート一覧

| # | ファイル | タイトル | 一言 |
|---|---------|---------|------|
| 1 | [01-feature-spec.md](01-feature-spec.md) | 機能仕様の全体像 | S/T/X-learner + Causal Forest、treatment/outcome の型制約、AUUC/Qini/Net uplift、Treatment Analysis と IPW、コード環境プリセット |
| 2 | [02-incompatibility-boundary.md](02-incompatibility-boundary.md) | **非互換の境界線【最重要】** | 公式の非互換5項目（逐語）、K-Fold の別出典、**Partitioned Models 非互換は公式には未記載**という訂正、KB と本体ドキュメントの食い違い |
| 3 | [03-version-history.md](03-version-history.md) | バージョン変遷の考古学 | 12.0.0 導入 → 12.2.0 多値処置 → 12.4.0 IPW、v13 はバグ修正4件、v14 は1件。「成熟か停滞か」を証拠で論じる。推奨は 12.4.0+ |
| 4 | [04-assumptions-and-diagnostics.md](04-assumptions-and-diagnostics.md) | 仮定と診断ツール | ignorability / positivity / SUTVA、Treatment Randomization Test、Positivity Analysis、施策ごとに対象者が変わる運用での意味 |
| 5 | [05-solutions-marketing-claims.md](05-solutions-marketing-claims.md) | ソリューションとマーケ表現の検証 | 3ソリューションの実装実体（製薬のみ uplift、NBO は普通の分類、MMM は Meridian）、定量的主張の不在をどう読むか |

## 読み方の推奨

導入判断を急ぐ場合は **02 → 03** の順に読むと、「何ができないか」と「今後できるようになる見込みがあるか」が最短で分かる。技術的な設計に入る前に **04** で仮定の充足可否を自チームのデータに照らすことを強く推奨する。**05** は社内の期待値調整（特にソリューション名から機能を推測してしまう場面）に使える。

## ユーザー課題への総括

Dataiku の Causal Prediction は、**Visual ML の枠内で uplift を回すには十分に誠実な作り**である。アルゴリズム（S/T/X-learner + Causal Forest with honest framework）と診断（Treatment Randomization Test / Positivity Analysis）は教科書的に妥当で、技術ドキュメントは「反実仮想は観測不能」という限界まで明記する。

しかし制約は硬い。**MLflow models / ensembling / model export / Model Evaluation Stores / Model Document Generator の5つと非互換**であり、これは 12.0.0 から 14.x まで3年間まったく緩和されていない。とりわけ **MES 非互換は MLOps 監視経路を丸ごと塞ぐ**。この壁を越える設計が姉妹クラスタ `custom_python_path` の主題である。

一方で、事前情報にあった「Partitioned Models と非互換」は**公式ドキュメント上に根拠がない**。断定を避け、要検証項目として扱うべきである（詳細は 02）。
