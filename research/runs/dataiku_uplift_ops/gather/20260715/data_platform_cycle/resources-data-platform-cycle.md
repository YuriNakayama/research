# Resources: data_platform_cycle

Dataiku を用いたマーケ施策 ML パイプライン（DB 抽出 → 特徴量管理 → 学習/推論 → 評価）を、**不定期・イベント駆動のキャンペーンサイクル**で回すための基盤リソース。

## 1. DB 接続と SQL プッシュダウン

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **Concept \| Where computation happens** | https://knowledge.dataiku.com/latest/data-preparation/pipelines/concept-where-compute-happens.html | 公式KB | **起点**。Dataiku を「接続先エンジンのオーケストレータ」と位置づける設計思想 |
| 2 | **Execution engines** | https://doc.dataiku.com/dss/latest/preparation/engines.html | 公式ドキュメント | エンジン選択の正典。DSS / In-database (SQL) / Spark / K8s の適用条件 |
| 3 | Concept \| Computation engines | https://knowledge.dataiku.com/latest/data-preparation/pipelines/concept-computation-engine.html | 公式KB | エンジン概念の入門版 |
| 4 | **SQL recipes** | https://doc.dataiku.com/dss/latest/code_recipes/sql.html | 公式ドキュメント | **入力が全て同一接続の SQL テーブルの時のみ** `INSERT INTO … SELECT` へ書き換えて完全 in-DB 実行。**それ以外は DSS 経由でストリーム＝性能崖の発生点** |
| 5 | Concept \| SQL code recipes | https://knowledge.dataiku.com/latest/code/sql/concept-sql-code-recipes.html | 公式KB | SQL recipe の種別（query / script） |
| 6 | **Performing SQL queries（partial recipe / SQLExecutor2）** | https://developer.dataiku.com/latest/concepts-and-examples/sql.html | 公式Developer | **partial recipe の正典**。Python で SQL を動的生成し `exec_recipe_fragment()` で DSS に実行させる。**「複雑な分岐は Python、計算は DB」を両立する中核パターン** |
| 7 | API for performing SQL queries like the recipes（partial） | https://doc.dataiku.com/dss/7.0/python-api/partial.html | 公式ドキュメント | partial recipe の旧版専用ページ。概念説明が最も明示的 |
| 8 | Leveraging SQL in Python & R | https://developer.dataiku.com/latest/tutorials/data-engineering/sql-in-code/index.html | 公式Developer | SQLExecutor2 のチュートリアル |
| 9 | Using SQL pipelines | https://doc.dataiku.com/dss/7.0/sql/pipelines/sql_pipelines.html | 公式ドキュメント | 複数 SQL recipe を単一クエリに融合し中間テーブル書き出しを回避 |
| 10 | Containerized DSS engine | https://doc.dataiku.com/dss/latest/containers/containerized-dss-engine.html | 公式ドキュメント | DSS エンジンを K8s で実行 |
| 11 | Tip \| Using Spark | https://knowledge.dataiku.com/latest/cloud-quotas-compute/tip-using-spark.html | 公式KB | Spark を使うべき／使うべきでない判断基準 |
| 12 | SQLExecutor2 exec_recipe_fragment: multiple statements | https://community.dataiku.com/t5/Using-Dataiku/SQLExecutor2-exec-recipe-fragment-multiple-statements-and/td-p/3534 | Community | `pre_queries` で一時テーブルを準備する実践知 |

## 2. DWH 別の具体

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 13 | **Snowflake connection** | https://doc.dataiku.com/dss/latest/connecting/snowflake.html | 公式ドキュメント | fast-write、recipe 単位の Virtual Warehouse 選択、Snowpark 設定 |
| 14 | **Dataiku and Snowflake: Snowpark New Capabilities** | https://blog.dataiku.com/dataiku-snowflake-snowpark-new-capabilities | Blog | Snowpark 統合（DW 内実行）の公式解説 |
| 15 | **Snowflake, Dataiku, Java UDFs & Snowpark** | https://blog.dataiku.com/snowflake-dataiku-java-udfs-snowpark | Blog | **Java UDF プッシュダウンの正典的解説**。visual recipe とスコアリングを Snowflake 内に押し込む |
| 16 | Google BigQuery connection | https://doc.dataiku.com/dss/latest/connecting/bigquery.html | 公式ドキュメント | JDBC 4.2 ドライバ導入手順 |
| 17 | Amazon Redshift connection | https://doc.dataiku.com/dss/latest/connecting/redshift.html | 公式ドキュメント | 専用ドライバが必要な条件（Spectrum、20億件超） |
| 18 | PostgreSQL connection | https://doc.dataiku.com/dss/latest/connecting/sql/postgresql.html | 公式ドキュメント | ドライバ同梱で追加導入不要 |
| 19 | SQL databases: Introduction | https://doc.dataiku.com/dss/latest/connecting/sql/introduction.html | 公式ドキュメント | 対応 DB 一覧と共通概念 |
| 20 | Best Practices for Leveraging Dataiku and Snowflake | https://www.snowfoxdata.com/resources/blog/best-practices-for-leveraging-dataiku-and-snowflake-part-one | Blog | Snowflake × Dataiku の実務ベストプラクティス |

## 3. pandas インメモリの性能崖と逃げ道

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 21 | **Python recipes** | https://doc.dataiku.com/dss/latest/code_recipes/python.html | 公式ドキュメント | `get_dataframe()` は**データセット全体が DSS サーバの RAM に載る必要がある**と明記＝**性能崖の一次ソース** |
| 22 | **Datasets (reading and writing data)** | https://developer.dataiku.com/latest/concepts-and-examples/datasets/datasets-data.html | 公式Developer | **逃げ道の正典**。`iter_dataframes(chunksize=...)`、`get_writer()`、row-by-row streaming |
| 23 | Datasets API reference | https://developer.dataiku.com/latest/api-reference/python/datasets.html | 公式Developer | `iter_dataframes` / `write_schema_from_dataframe` の仕様 |
| 24 | Writing df on chunks with built-in Dataiku functionality | https://community.dataiku.com/discussion/13327/writing-df-on-chunks-with-buillt-in-dataiku-functionality | Community | チャンク書き出し時に `write_with_schema()` が使えず先に schema 設定が必要という罠 |

> **逃げ道の優先順位**: ①そもそも SQL/partial recipe で DB に押し込む（#4, #6）→ ②パーティション単位に分割 → ③`iter_dataframes` でチャンク化（#22）→ ④コンテナ化して RAM を増やす（#10）。

## 4. パーティショニング

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 25 | **Working with partitions** | https://doc.dataiku.com/dss/latest/partitions/index.html | 公式ドキュメント | 正典。時間次元と離散次元の区別 |
| 26 | Partitioning files-based datasets | https://doc.dataiku.com/dss/latest/partitions/fs_datasets.html | 公式ドキュメント | **ディスク上のレイアウトで決まりデータ中身は使わない**。分割列がスキーマから消える落とし穴 |
| 27 | **Partitioned SQL datasets** | https://doc.dataiku.com/dss/latest/partitions/sql_datasets.html | 公式ドキュメント | カラムベース分割。**DB 由来のデータでは実質こちら** |
| 28 | **Partitioning variables substitutions** | https://doc.dataiku.com/dss/latest/partitions/variables.html | 公式ドキュメント | `$DKU_DST_<dim>` / `$DKU_SRC_<dim>` の正典 |
| 29 | **Partitioned SQL recipes** | https://doc.dataiku.com/dss/latest/partitions/sql_recipes.html | 公式ドキュメント | **冪等性の一次ソース**。「スクリプトを複数回実行しても1回と同じ出力になることの保証は**ユーザ責任**」 |
| 30 | **Specifying partition dependencies** | https://doc.dataiku.com/dss/latest/partitions/dependencies.html | 公式ドキュメント | equals / time range / all available / latest available。**all available と latest available は既存パーティションしか返せず新規生成は不可** |
| 31 | Recipes for partitioned datasets | https://doc.dataiku.com/dss/latest/partitions/recipes.html | 公式ドキュメント | パーティション対応 recipe の一般則 |
| 32 | Partitioned Hive recipes | https://doc.dataiku.com/dss/latest/partitions/hive.html | 公式ドキュメント | `INSERT OVERWRITE TABLE … PARTITION (date='$DKU_DST_date')` の自動変換。SQL 側の冪等性実装の参考形 |
| 33 | Tutorial \| Column-based partitioning | https://knowledge.dataiku.com/latest/automation/partitioning/tutorial-column-based.html | 公式KB | **DB データならここから** |
| 34 | Tutorial \| File-based partitioning | https://knowledge.dataiku.com/latest/automate-tasks/partitioning/tutorial-file-based.html | 公式KB | ファイルベース分割のハンズオン |
| 35 | How to ignore missing partitions when using time range dependency | https://community.dataiku.com/discussion/36194/how-to-ignore-missing-partitions-when-using-time-range-dependency | Community | **不定期キャンペーンで欠損期間が出る場合の実務回避策**。本件に直結 |

## 5. シナリオとトリガー（不定期・イベント駆動に直結）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 36 | **Launching a scenario（triggers）** | https://doc.dataiku.com/dss/latest/scenarios/triggers.html | 公式ドキュメント | **本クラスタ最重要**。time-based / dataset change / **SQL query change** / custom Python / manual(API)、scenario-following、grace delay + re-check |
| 37 | **Scenarios (in a scenario) — get_trigger_params** | https://developer.dataiku.com/latest/api-reference/python/scenarios-inside.html | 公式Developer | **`get_trigger_params()` の正典**。トリガが設定したパラメータを dict で取得＝**パーティションと接続する機構** |
| 38 | Scenarios（Developer Guide / 外部起動） | https://developer.dataiku.com/latest/concepts-and-examples/scenarios.html | 公式Developer | **手動/API 起動は内部的に「manual トリガ」として扱われパラメータを渡せる → イベント駆動の本命** |
| 39 | Managing scenarios (REST API client) | https://doc.dataiku.com/dss/latest/python-api/rest-api-client/scenarios.html | 公式ドキュメント | `run()` / `run_and_wait()`。外部システムからの発火 |
| 40 | Scenario steps | https://doc.dataiku.com/dss/latest/scenarios/steps.html | 公式ドキュメント | ステップ種別 |
| 41 | Scenario SQL query change trigger | https://community.dataiku.com/discussion/13943/scenario-sql-query-change-trigger | Community | 行数だけでなく値の変化でも発火 |
| 42 | Retrieve the result of a scenario's SQL query change trigger | https://community.dataiku.com/discussion/11320/retrieve-the-result-of-a-scenario-s-sql-query-change-trigger | Community | ⚠️ **重要な注意**: SQL トリガ結果が `get_trigger_params()` で常に取れるとは限らず **DB 種別に依存**という報告 |
| 43 | Assistance Needed with Custom Python Triggers | https://community.dataiku.com/discussion/42920/assistance-needed-with-custom-python-triggers-in-dataiku | Community | custom Python トリガの `t.fire()` 実装例 |
| 44 | Triggering custom python: run every / grace delay | https://community.dataiku.com/discussion/38698/triggering-custom-python-how-to-properly-set-run-every-seconds-and-grace-delay-seconds | Community | grace delay の意味論（変化が続く限り遅延がリセットされ安定後に実行） |
| 45 | Triggering scenario after another scenario | https://community.dataiku.com/discussion/20583/triggering-scenario-after-another-scenario | Community | scenario-following は同時実行を防げる点で安全 |

## 6. Feature Store（point-in-time は要注意）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 46 | **Feature Store** | https://doc.dataiku.com/dss/latest/mlops/feature-store/ | 公式ドキュメント | 正典。Feature Group = 横断共有される curated dataset。offline = Join recipe、online = Dataset Lookup。⚠️ **point-in-time / as-of join / timestamp key への言及は皆無**（一次ソース確認済み） |
| 47 | Tutorial \| Building your feature store in Dataiku | https://knowledge.dataiku.com/latest/kb/o16n/feature-store/features-store-overview.html | 公式KB | ハンズオン。ここでも as-of join は登場しない |
| 48 | **Setting up Your Feature Store With Dataiku** | https://blog.dataiku.com/set-up-feature-store-with-dataiku | Blog | **論点の核心**。point-in-time correctness を「取引日と特徴量生成日を**結合キーに加えることで実現する**」と記述＝**製品機能ではなく利用者が手で組む設計パターン** |
| 49 | Building a Feature Store for Quicker and More Accurate ML Models | https://blog.dataiku.com/building-a-feature-store | Blog | 課題は認識しているが Dataiku 側の実装機構は示さず |
| 50 | *（対照）* Point-in-time feature joins — Databricks | https://docs.databricks.com/aws/en/machine-learning/feature-store/time-series | Blog | **比較対照**。Databricks は timestamp key を宣言し `AS OF` join をエンジンが実行。**機能差を示す基準線** |

> **結論（事前調査を追認）**: **point-in-time / as-of join のネイティブ機構は文書上存在しない**。公式ブログが「日付を結合キーに追加せよ」と説くこと自体が、宣言的な時点整合機能の不在を裏づける。**train/serve skew は利用者側の Join 設計責任**であり、「数ヶ月おきのキャンペーン時点でのユーザ属性」を再現する必要がある本件では**最大のリスク源**。

## 7. Data Quality Rules と metrics/checks（世代交代）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 51 | **Data Quality Rules** | https://doc.dataiku.com/dss/latest/metrics-check-data-quality/data-quality-rules.html | 公式ドキュメント | **正典（一次確認済み）**。「an improvement introduced in **DSS 12.6.0** over the checks system」「Other flow objects (**managed folders, saved models, model evaluation store) still use checks**」＝**DQ Rules はデータセット専用で確定** |
| 52 | Metrics, checks and Data Quality（索引） | https://doc.dataiku.com/dss/latest/metrics-check-data-quality/index.html | 公式ドキュメント | 両世代の関係を俯瞰 |
| 53 | **Concept \| Data quality rules** | https://knowledge.dataiku.com/latest/data-quality/concept-data-quality.html | 公式KB | metric 作成 → check 適用の2段構えが不要になり直接ルール定義可能 |
| 54 | **Concept \| Metrics & checks (pre-12.6)** | https://knowledge.dataiku.com/latest/data-quality/concept-metrics-checks.html | 公式KB | 旧世代。**データセット以外（MES/saved model/folder）では現役**なので必読 |
| 55 | Concept \| Checks | https://knowledge.dataiku.com/latest/automation/data-quality/concept-checks.html | 公式KB | check の詳細 |
| 56 | Tutorial \| Data quality | https://knowledge.dataiku.com/latest/automation/data-quality/tutorial-data-quality.html | 公式KB | DQ Rules のハンズオン |

> **結論**: **モデル品質のゲート（saved model / MES への条件判定）は依然 metrics & checks 側**。施策サイクルの品質ゲートは**二世代の API を併用する**設計になる。

## 8. ドリフト分析

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 57 | **Drift analysis** | https://doc.dataiku.com/dss/latest/mlops/drift-analysis/index.html | 公式ドキュメント | input data drift / prediction drift / performance drift の3系統 |
| 58 | **Input Data Drift** | https://doc.dataiku.com/dss/latest/mlops/drift-analysis/input-data-drift.html | 公式ドキュメント | **domain classifier 方式の一次ソース**。学習時サンプルと評価データを連結し「どちらの標本か」を予測。**正解ラベル不要＝キャンペーン結果が出る前でも監視可能**（本件に直結） |
| 59 | Prediction Drift | https://doc.dataiku.com/dss/latest/mlops/drift-analysis/prediction-drift.html | 公式ドキュメント | 予測分布の変化。同じくラベル不要 |
| 60 | Performance Drift | https://doc.dataiku.com/dss/latest/mlops/drift-analysis/performance-drift.html | 公式ドキュメント | **ground truth が必要**＝レスポンス回収後のみ。**数ヶ月サイクルでは検知が大きく遅れる** |
| 61 | Automating model evaluations and drift analysis | https://doc.dataiku.com/dss/latest/mlops/model-evaluations/automating.html | 公式ドキュメント | Evaluate recipe + MES + シナリオでの自動化 |
| 62 | A Primer on Data Drift & Drift Detection Techniques | https://pages.dataiku.com/data-drift-detection-techniques | Blog | domain classifier が「変化検知と非典型サンプル特定に強い」理由 |
| 63 | Plugin: Model Drift Monitoring（**非推奨**） | https://www.dataiku.com/product/plugins/model-drift/ | プラグイン | **deprecated**。ネイティブに置換済み。旧記事参照時の注意点 |

> **施策ごとに対象ユーザーが異なる本件では、ドリフトは設計上発生して当然**。素朴なアラートは毎施策で発火して無意味になるため、**「どの特徴量が動いたか」の診断**として使う。

## 9. A/B テストと champion/challenger

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 64 | **AB Test Calculator plugin** | https://www.dataiku.com/product/plugins/ab-test-calculator/ | プラグイン | **A/B テストはネイティブ機能ではなくプラグイン**。サンプルサイズ計算 / population split（`dku_ab_group` 列付与）/ Experiment Summary recipe / 結果分析 webapp |
| 65 | dss-plugin-ab-testing（GitHub） | https://github.com/dataiku/dss-plugin-ab-testing/blob/master/README.md | プラグイン | ソース。挙動の一次確認・カスタマイズ時の参照先 |
| 66 | **Tutorial \| A/B testing for event promotion** | https://knowledge.dataiku.com/latest/use-cases/plugins/tutorial-a-b-testing.html | 公式KB | **イベント販促の A/B という本件に最も近いチュートリアル** |
| 67 | **Concept \| Monitoring and feedback in the AI project lifecycle** | https://knowledge.dataiku.com/latest/mlops-o16n/model-monitoring/concept-monitoring-feedback.html | 公式KB | 「shadow scoring (champion/challenger) **setup or with** A/B testing」と**両者を並置＝別物として扱う** |
| 68 | **MLOps: Champion/Challenger Model Evaluation** | https://blog.dataiku.com/mlops-champion-challenger-model-evaluation | Blog | **区別の核心**。challenger は同じリクエストを採点するが**応答を返さない（shadow）**。よって**ユーザ体験に影響を与えず施策効果の因果推論はできない＝A/B テストではない** |
| 69 | Model Comparisons | https://doc.dataiku.com/dss/latest/mlops/model-comparisons/index.html | 公式ドキュメント | champion を challengers と比較 |
| 70 | Automate selecting champion model and challenger model | https://community.dataiku.com/discussion/33215/automate-selecting-champion-model-and-challenger-model | Community | **昇格の自動化にネイティブ機能がなく自作が要る**ことを示す実例 |

## 10. Dataiku Govern

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 71 | **Sign-off Scenario** | https://doc.dataiku.com/dss/latest/governance/sign-off.html | 公式ドキュメント | 正典。sign-off = **Feedback（複数レビュアー）+ Final Approval（最終承認者1名）** |
| 72 | Governance Process Features | https://doc.dataiku.com/dss/latest/governance/governance-features.html | 公式ドキュメント | ガバナンス機能全体 |
| 73 | **Concept \| Sign-offs in workflows of Govern items** | https://knowledge.dataiku.com/latest/mlops-o16n/govern/concept-reviews-signoffs.html | 公式KB | **却下・放棄時はワークフローがロックされデプロイ不可** |
| 74 | How to trigger Scenarios from a Govern node | https://developer.dataiku.com/latest/tutorials/govern/hooks-and-scenarios/index.html | 公式Developer | **承認をシナリオ実行の関門にする**方法。配信前の人手ゲートに直結 |
| 75 | Govern API（Python） | https://developer.dataiku.com/latest/api-reference/python/govern.html | 公式Developer | Govern の自動化 API |

## 11. 日本語ソース

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 76 | **【Dataiku】パーティション機能についてご紹介** | https://blog.truestar.co.jp/dataiku/20250606/63144/ | Blog | 2025/06。**日本語で最もまとまったパーティション解説** |
| 77 | 機械学習 - Dataikuによる予測モデルの維持と改善 | https://qiita.com/Dataiku/items/b0b7bfc0a3bb73195610 | Blog | 公式 Qiita。ドリフト検知 → 通知 or 再学習のシナリオ連携 |
| 78 | **DataikuにおけるData QualityとMetricsを使ったデータの品質監視** | https://www.keywalker.co.jp/blog/dataiku-data-management.html | Blog | 日本語での DQ / Metrics 解説 |
| 79 | 【Dataiku】シナリオから自動で変数を変更する方法 | https://blog.truestar.co.jp/dataiku/20231218/57887/ | Blog | シナリオ × 変数。キャンペーン単位のパラメータ切替に応用可 |
| 80 | プッシュダウン実行と automatic fast-write | https://community.dataiku.com/discussion/41196/ | Community | 日本語で最も技術的に有用な項目 |
| 81 | 自動化（Academy 日本語） | https://academy.dataiku.com/automation-ja | 公式ドキュメント | シナリオ/トリガの日本語コース |

> **日本語の正直な評価**: **薄い**。パーティション（#76）と DQ（#78）はパートナー企業ブログが健闘しているが、**本クラスタの核心である partial recipe、エンジン選択条件、Feature Store、drift の domain classifier、Govern、A/B プラグインの日本語一次資料は事実上存在しない**。**設計判断は英語一次ドキュメントに依拠する前提を置くべき**。

## ネイティブ vs 自作の切り分け

| 必要なこと | ネイティブ? | 補足 |
|-----------|-----------|------|
| DB からの抽出を DB 内で完結 | **◯** | 同一接続なら自動で `INSERT INTO … SELECT`。**接続をまたぐと即座に DSS 経由ストリームに落ちる**ため接続設計が性能の分岐点 |
| 複雑な分岐 + DB 内実行の両立 | **◯** | partial recipe。**本件の主力パターン** |
| visual recipe の DB 押し込み | **◯** | Snowflake は Java/Python UDF で範囲が広い。他 DB は SQL 変換可能な処理に限定 |
| pandas メモリ超過の回避 | **△ 半自作** | `iter_dataframes` はネイティブだがチャンク境界・スキーマ設定は自分で書く。**まず SQL に押し込むのが正解** |
| 時間/離散次元での増分計算 | **◯** | パーティション + 依存関数 |
| **パーティション SQL の冪等性** | **✗ 自作** | **公式に「ユーザ責任」と明記**。対象パーティション値限定の DELETE を自分で書く |
| 不定期・イベント駆動の起動 | **◯** | **cron に頼らない手段が揃う**。本命は Public API の manual trigger |
| トリガ由来のパラメータ受け取り | **△ 半自作** | `get_trigger_params()` はネイティブだが、**SQL トリガ結果は DB 種別により取得できない報告あり**。manual/API トリガの方が堅牢 |
| 外部リソース安定待ち | **◯** | grace delay + re-check |
| 特徴量の共有・発見 | **◯** | Feature Store / Feature Group |
| **特徴量の point-in-time 整合** | **✗ 完全自作** | **最大のリスク**。宣言的な as-of join は文書上不在。日付付きスナップショット + 明示的な日付結合を自作 |
| データセットの品質ゲート | **◯** | Data Quality Rules（12.6.0+） |
| モデル/MES の品質ゲート | **△ 旧世代** | **DQ Rules はデータセット専用**。**二世代 API の併用が必要** |
| ラベル無しでのドリフト監視 | **◯** | input data / prediction drift は **ground truth 不要** |
| 実性能の劣化監視 | **△ 条件付き** | performance drift は ground truth 必須。**数ヶ月サイクルでは検知が大きく遅れる** |
| モデル同士の比較 | **◯** | Model Comparison |
| champion/challenger の自動昇格 | **✗ 自作** | 比較機能はあるが昇格の自動化は自作 |
| **施策の A/B テスト** | **✗ プラグイン/自作** | **ネイティブではない**。**champion/challenger は shadow scoring であり代替にならない** |
| 配信前の人手承認 | **◯（Govern 必要）** | sign-off。却下/放棄でデプロイがロック |

## 確認できなかった事項

1. **Feature Store の point-in-time / as-of join** — 一次ドキュメントを直接取得して確認した結果、**いずれの言及も存在しない**。事前調査の所見を**追認**。ただし「文書にない」ことは「実装が絶対にない」ことの証明ではない。**現時点では『無い前提で設計する』が唯一の安全策**。
2. **Feature Group に対する DQ Rules の適用可否** — Feature Group の実体は dataset なので効くと推測されるが明示的な記述はない。Feature Store のドキュメントは「Data monitoring is implemented using **Metrics & Checks**」と**旧世代の表現のまま**。要実機確認。
3. **SQL query change trigger のパラメータ取得可否の DB 別条件** — Community で「DB 種別により取れないことがある」との報告があるが**公式な一覧は発見できず**。SQL トリガに依存する設計を採るなら事前の実機検証が必須。
4. **カラムベースパーティションの DWH 別プッシュダウン効率** — Snowflake の micro-partition や BigQuery のネイティブパーティションと Dataiku のパーティション定義がどう対応づくか（二重管理になるのか）を論じた資料は見つからなかった。
5. **AB Test Calculator プラグインの保守状況** — 最終更新時期・最新 DSS でのサポート状況・非推奨化の可能性を確認できず。**プラグイン依存はサステナビリティのリスク**として扱うべき。
6. **不定期サイクルにおけるドリフト検知の実務的な閾値設定** — Dataiku の文書は**日次/週次のような定常運用を暗黙の前提**としており、**不定期サイクル向けのガイダンスは公式・非公式とも発見できなかった**。
