# Resources: custom_python_path

ネイティブ Causal Prediction の制約を回避する「CausalML/EconML → MLflow pyfunc → Dataiku Saved Model → MES」経路のリソース。全 URL は 2026-07-15 時点で到達確認済み。

## 0. 前提となる制約の一次ソース

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **Introduction — Causal Prediction** | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/introduction.html | 公式ドキュメント | **本クラスタの出発点**。逐語: "Causal prediction is incompatible with the following: MLflow models, Models ensembling, Model export, Model Evaluation Stores, Model Document Generator" |
| 2 | Causal Prediction Settings | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/settings.html | 公式ドキュメント | 逐語: "Causal prediction does not support K-Fold cross-test."。**#1 のリストとは別ページに別記**されている点に注意 |
| 3 | Causal Prediction Algorithms | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/causal-prediction-algorithms.html | 公式ドキュメント | 内部で EconML/CausalML を使っているかは**非公開** |
| 4 | Tutorial \| Causal prediction | https://knowledge.dataiku.com/latest/ml-analytics/causal-prediction/tutorial-causal-prediction.html | 公式KB | ⚠️ **独立した制約列挙**を持ち、#1 にない **`custom models`・`SQL/Spark scoring` 非対応**を含む。KB と本体ドキュメントで記述が食い違う |

## 1. MLflow モデルの Dataiku 取り込み

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 5 | **Importing MLflow models** | https://doc.dataiku.com/dss/latest/mlops/mlflow-models/importing.html | 公式ドキュメント | **中核**。`create_mlflow_pyfunc_model` → `import_mlflow_version_from_path` / `..._from_managed_folder` → `set_core_metadata` → `evaluate` の4ステップ完全コード例 |
| 6 | **Limitations and supported versions** | https://doc.dataiku.com/dss/latest/mlops/mlflow-models/limitations.html | 公式ドキュメント | **予測タイプ制約の一次ソース**。MLflow 2.0.0 未満は非サポート、R/Spark MLflow モデルは非対応 |
| 7 | MLflow Models（概念） | https://doc.dataiku.com/dss/latest/mlops/mlflow-models/index.html | 公式ドキュメント | スコアリング / API node / 評価 / ドリフト / ガバナンスが可能。一方「MLflow imposes extremely few constraints on models」ため**全機能の動作保証はない**と注意書き |
| 8 | Using MLflow models in DSS | https://doc.dataiku.com/dss/latest/mlops/mlflow-models/using.html | 公式ドキュメント | Scoring recipe の2モード。MES / Model Comparison との連携 |
| 9 | Training MLflow models | https://doc.dataiku.com/dss/latest/mlops/mlflow-models/training.html | 公式ドキュメント | `mlflow.<framework>.save_model()` → managed folder 経由 import |
| 10 | Deploying MLflow models (Experiment Tracking) | https://doc.dataiku.com/dss/latest/mlops/experiment-tracking/deploying.html | 公式ドキュメント | 配備3経路。**prediction type を "Other" にすれば評価をバイパス可能** |
| 11 | **Projects — Python API ref** | https://developer.dataiku.com/latest/api-reference/python/projects.html | 公式Developer | **`create_mlflow_pyfunc_model(name, prediction_type=None)` の正式リファレンス**。`prediction_type` は `BINARY_CLASSIFICATION` / `MULTICLASS` / `REGRESSION` / `None`。None では**performance analysis と explainability が利用不可** |
| 12 | **dataikuapi/dss/savedmodel.py** | https://github.com/dataiku/dataiku-api-client-python/blob/master/dataikuapi/dss/savedmodel.py | GitHub | **`set_core_metadata` / `evaluate` の実署名が取れる唯一の情報源**（後述の文書化ギャップ参照） |
| 13 | Importing serialized scikit-learn pipelines as Saved Models | https://developer.dataiku.com/latest/tutorials/machine-learning/model-import/scikit-pipeline/index.html | 公式Developer | pickle → MLflow → Saved Model の実践例。**pyfunc 経路に最も近い公式チュートリアル** |
| 14 | ⚠️ Machine learning — Python API ref | https://developer.dataiku.com/latest/api-reference/python/ml.html | 公式Developer | **要注意**。`DSSMLTask` 系のみで、`set_core_metadata` / `MLflowVersionHandler` / `import_mlflow_version_from_path` は**いずれも存在しない**。旧 `saved_models.html` はここへ 301 |

## 2. MLflow pyfunc のオーサリング

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 15 | **mlflow.pyfunc（API reference）** | https://mlflow.org/docs/latest/api_reference/python_api/mlflow.pyfunc.html | MLflow公式 | `PythonModel`・`load_context`・`predict(context, model_input, params=None)`・`save_model`/`log_model` の全引数 |
| 16 | **MLflow PythonModel Guide** | https://mlflow.org/docs/latest/ml/model/python_model/ | MLflow公式 | `PythonModel` のサブクラス化。型ヒントによるスキーマ推論は 2.20.0+ |
| 17 | **Models From Code** | https://mlflow.org/docs/latest/ml/model/models-from-code/ | MLflow公式 | **pyfunc 記述の新推奨方式**。シリアライズでなく可読な Python スクリプトとして保存。**CausalML の Cython 依存を考えると重要**（2.12.2+） |
| 18 | Model Signatures and Input Examples | https://mlflow.org/docs/latest/ml/model/signatures/ | MLflow公式 | `infer_signature` / enforcement。uplift の多出力を通す際の要 |
| 19 | ML Models（概念） | https://mlflow.org/docs/latest/ml/model/ | MLflow公式 | フレーバー規約と `MLmodel` ファイル構造 |
| 20 | Understanding PyFunc in MLflow（tutorial part2） | https://mlflow.org/docs/latest/ml/traditional-ml/tutorials/creating-custom-pyfunc/part2-pyfunc-components/ | MLflow公式 | `load_context` による初期化、`predict` のラップ |
| 21 | ML Model Evaluation | https://mlflow.org/docs/latest/ml/evaluation/ | MLflow公式 | `mlflow.models.evaluate()`。※Dataiku 側 evaluate とは別系統 |

## 3. Visual ML のカスタムモデル / プラグインアルゴリズム

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 22 | **In-memory Python —「Custom Models」節** | https://doc.dataiku.com/dss/latest/machine-learning/algorithms/in-memory-python.html | 公式ドキュメント | **`clf` 契約の実体ページ**。`sklearn.base.clone()` でクローン可能、`__init__` は明示キーワード引数、分類器は `classes_` 必須。**「クラスはコードウィンドウで直接宣言できず、ライブラリに packaging して import する」必須要件あり** |
| 23 | Writing custom models | https://doc.dataiku.com/dss/latest/machine-learning/custom-models.html | 公式ドキュメント | ハブページ。実仕様は #22 へ誘導 |
| 24 | Concept \| Custom modeling within the visual ML tool | https://knowledge.dataiku.com/latest/courses/advanced-code/custom-models/custom-modeling-visual-ml-concept-summary.html | 公式KB | scikit-learn 互換要件 |
| 25 | **Component: Prediction algorithm** | https://doc.dataiku.com/dss/latest/plugins/reference/prediction-algorithms.html | 公式ドキュメント | `BaseCustomPredictionAlgorithm` のリファレンス。**「Plugin algorithms cannot utilize the plugin code environment」**という重大制約。対応は二値/多クラス/回帰のみ＝**causal はプラグイン拡張不可** |
| 26 | Creating a plugin Prediction Algorithm component | https://developer.dataiku.com/latest/tutorials/plugins/prediction-algorithm/ml-algo/index.html | 公式Developer | algo.json + algo.py の2ファイル構成 |

## 4. カスタム評価メトリック

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 27 | **Evaluating Dataiku Prediction models** | https://doc.dataiku.com/dss/latest/mlops/model-evaluations/dss-models.html | 公式ドキュメント | **経路 B の根拠 + Custom Evaluation Metrics の一次ソース**。「Visual ML と**インポートされた MLflow モデルの両方**に適用」。「you must define a 'score' function that returns a single float」。**MES 出力時は reference dataframe も score 関数に渡される**ため Qini/AUUC を書ける余地がある。⚠️ 「The model must be a **non-partitioned** ...」も明記 |
| 28 | Prediction settings（最適化メトリック） | https://doc.dataiku.com/dss/latest/machine-learning/supervised/settings.html | 公式ドキュメント | カスタムスコア関数は sklearn scorer プロトコル準拠必須。**"Python in-memory" 学習エンジン限定** |

## 5. MES / ドリフト / モデル比較

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 29 | **Evaluating other models（Standalone Evaluation Recipe）** | https://doc.dataiku.com/dss/latest/mlops/model-evaluations/external-models.html | 公式ドキュメント | **SER は存在する**。DSS Visual ML / MLflow 外のモデル評価用。入力=評価データセット（予測値カラム必須）、出力=MES。**pyfunc import が難航した場合の最有力フォールバック** |
| 30 | Models evaluations（index） | https://doc.dataiku.com/dss/latest/mlops/model-evaluations/index.html | 公式ドキュメント | MES セクション index |
| 31 | Concept \| Model evaluation stores | https://knowledge.dataiku.com/latest/mlops-o16n/model-monitoring/concept-model-evaluation-stores.html | 公式KB | 実行ごとの性能を蓄積し推移を可視化 |
| 32 | **Model Evaluation Stores — Developer Guide** | https://developer.dataiku.com/latest/concepts-and-examples/model-evaluation-stores.html | 公式Developer | MES の Python API。Data Drift は「学習時テストセットと評価データセットの行を識別するモデルの accuracy」と定義 |
| 33 | Input Data Drift | https://doc.dataiku.com/dss/latest/mlops/drift-analysis/input-data-drift.html | 公式ドキュメント | 特徴量分布の分析。**ground truth 不要** |
| 34 | Prediction Drift | https://doc.dataiku.com/dss/latest/mlops/drift-analysis/prediction-drift.html | 公式ドキュメント | 予測値分布の変化。uplift スコア分布の監視に転用可能 |
| 35 | Model Comparisons | https://doc.dataiku.com/dss/latest/mlops/model-comparisons/index.html | 公式ドキュメント | **除外: partitioned / ensemble / clustering / non-tabular MLflow**。同一 prediction type のみ比較可 |

## 6. API node

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 36 | **Exposing a Python prediction model** | https://doc.dataiku.com/dss/latest/apinode/endpoint-python-prediction.html | 公式ドキュメント | **`custom_keys` の一次情報源**。`ClassificationPredictor`/`RegressionPredictor` を継承し `predict(self, features_df)` を実装。戻り値 `(prediction_series, probas_df, custom_keys_list)`。**CATE/uplift スコアを予測に添えて返す本命の器** |
| 37 | Exposing a MLflow model | https://doc.dataiku.com/dss/latest/apinode/endpoint-mlflow.html | 公式ドキュメント | MLflow モデルの API node 配備。出力は Raw data / Restructured の2択 |
| 38 | Exposing a Python function | https://doc.dataiku.com/dss/latest/apinode/endpoint-python-function.html | 公式ドキュメント | 任意関数を REST 化 |
| 39 | Types of Endpoints | https://doc.dataiku.com/dss/latest/apinode/endpoints.html | 公式ドキュメント | 8種一覧 |
| 40 | **Logging and auditing** | https://doc.dataiku.com/dss/latest/apinode/operations/logging-audit.html | 公式ドキュメント | **MES 代替の監視経路**。query log が JSON で出力され入力特徴量・予測・タイミングを含む。Event Server 送出で feedback loop 化 |

## 7. Partitioned models / MES 代替

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 41 | **Partitioned Models** | https://doc.dataiku.com/dss/latest/machine-learning/partitioned.html | 公式ドキュメント | 制約リストの一次ソース。Python backend の Visual ML のみ / prediction のみ / **ensembling 不可** / PMML export 不可 / **「Only top-level (overall model) metrics and checks are available」** |
| 42 | Concept \| Partitioned models | https://knowledge.dataiku.com/latest/ml-analytics/partitioned-models/concept-partitioned-models.html | 公式KB | 全体 R² は合算の近似値表示 |
| 43 | Metrics, checks and Data Quality（index） | https://doc.dataiku.com/dss/latest/metrics-check-data-quality/index.html | 公式ドキュメント | metrics は saved models / MES にも適用可 |
| 44 | **Custom probes and checks** | https://doc.dataiku.com/dss/latest/metrics-check-data-quality/custom_metrics_and_checks.html | 公式ドキュメント | **MES 代替の中核**。カスタム check は「the folder, **saved model, model evaluation store** or dataset」を引数に取れる。⚠️ ただし**コード例はデータセット限定** |
| 45 | ⚠️ Data Quality Rules | https://doc.dataiku.com/dss/latest/metrics-check-data-quality/data-quality-rules.html | 公式ドキュメント | 12.6.0 導入。**「Other flow objects (managed folders, saved models, model evaluation store) still use checks」＝ DQ Rules はデータセット専用** |

## 8. CausalML / EconML

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 46 | **uber/causalml（GitHub）** | https://github.com/uber/causalml | GitHub | ★5.9k、Apache 2.0、Python 69.3% / **Cython 30.7%**（＝pyfunc 化時のビルド依存に直結）。最新 v0.17.0（2026-07-04） |
| 47 | **causalml · PyPI** | https://pypi.org/project/causalml/ | PyPI | **v0.17.0 / Requires-Python `>=3.11`（実測確認済み）**。⚠️ **`>=3.11` は 0.16.0（2026-02-06）で導入された新制約**で、**0.15.5（2025-07-09）が最後の `>=3.9` 系** |
| 48 | Installation（CausalML） | https://causalml.readthedocs.io/en/latest/installation.html | 公式ドキュメント | 「Python 3.11 or later is required」と明記 |
| 49 | **causalml/metrics/`__init__`.py** | https://github.com/uber/causalml/blob/master/causalml/metrics/__init__.py | GitHub | **metrics の正式エクスポート一覧の一次ソース**（専用 API ページが 404 のため実質的な正典） |
| 50 | Source code for causalml.metrics.visualize | https://causalml.readthedocs.io/en/latest/_modules/causalml/metrics/visualize.html | 公式ドキュメント | `auuc_score` / `qini_score` / `get_cumgain` / `get_qini` の定義 |
| 51 | Validation（CausalML） | https://causalml.readthedocs.io/en/latest/validation.html | 公式ドキュメント | Multiple Estimates / Synthetic Data / Uplift Curve (AUUC) / Sensitivity Analysis |
| 52 | Uplift Curves with TMLE Example | https://causalml.readthedocs.io/en/latest/examples/validation_with_tmle.html | 公式ドキュメント | 真の処置効果が未知だと uplift curve が lift を検出できない問題と TMLE 代理 |
| 53 | **CausalML: Python Package for Causal Machine Learning** | https://arxiv.org/abs/2002.11631 | 論文 | パッケージ原典（Chen, Harinen, Lee, Yung, Zhao 2020） |
| 54 | **py-why/EconML（GitHub）** | https://github.com/py-why/EconML | GitHub | ★4.7k。最新 **v0.16.0（2025-07-14）** |
| 55 | econml · PyPI | https://pypi.org/project/econml/ | PyPI | **v0.16.0 / Requires-Python `>=3.9`（実測確認済み）**。Python 3.9-3.13 |
| 56 | Welcome to econml's documentation! | https://www.pywhy.org/EconML/ | 公式ドキュメント | ⚠️ `econml.azurewebsites.net` は 301 でここへ恒久移転 |
| 57 | **econml.policy.DRPolicyTree** | https://www.pywhy.org/EconML/_autosummary/econml.policy.DRPolicyTree.html | 公式ドキュメント | 二重頑健補正で選択バイアスを調整し決定木で最適処置割当を学習 |
| 58 | econml.score.RScorer | https://www.pywhy.org/EconML/_autosummary/econml.score.RScorer.html | 公式ドキュメント | ⚠️ **`econml.score` にあるのは `RScorer` と `EnsembleCateEstimator` のみ**（`DRScorer` は存在しない） |

### `causalml.metrics` 実在関数一覧（#49 で確定）

| サブモジュール | エクスポート |
|--------------|------------|
| `visualize` | plot, **plot_gain**, plot_lift, **plot_qini**, plot_tmlegain, plot_tmleqini, **get_cumgain**, get_cumlift, **get_qini**, get_tmlegain, get_tmleqini, **auuc_score**, **qini_score** |
| `rate` | **get_toc**, **rate_score**, **plot_toc** |
| `cate_scoring` | compute_dr_pseudo_outcomes, **dr_score**, **plug_in_t_score**, **rlearner_score** |
| `sensitivity` | Sensitivity, SensitivityPlaceboTreatment, SensitivityRandomCause, SensitivityRandomReplace, SensitivitySubsetData, SensitivitySelectionBias |

⚠️ **訂正**: `tmle_score` / `TMLELearner` は `causalml.metrics` に**存在しない**。TMLE 系は `plot_tmlegain` / `get_tmlegain` および `auuc_score(..., tmle=True)` の**引数フラグ**として提供される。

## 9. ラッピング / サービングの先行事例

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 59 | **MLflow and Databricks for CausalOps** | https://awadrahman.medium.com/mlflow-and-databricks-for-causalops-6b11d8b07c0e | Blog | **因果モデルの pyfunc ラップを実際に示す唯一の記事**（2024-11）。**「固定 signature と因果モデルの可変 I/O の不一致」を課題として明示**（uplift 化でも同じ壁）。ただし CATE ではなく因果探索 |
| 60 | **causal-incentive（Databricks Solution Accelerator）** | https://github.com/databricks-industry-solutions/causal-incentive | GitHub | PyWhy（DoWhy + EconML）+ Double ML で顧客別インセンティブ推薦、MLflow でモデル管理。**因果 ML 運用化に最も近い実コード** |
| 61 | **Causal Inference and Uplift Modelling: A Review of the Literature** | https://proceedings.mlr.press/v67/gutierrez17a.html | 論文 | Gutierrez & Gérardy, PAPIs 2016。**両著者とも Dataiku 所属**＝Dataiku 因果機能の理論的系譜 |
| 62 | Using control groups to target on predicted lift | https://www.semanticscholar.org/paper/147b32f3d56566c8654a9999c5477dded233328e | 論文 | Radcliffe (2007)。**Qini 係数の原典** |

## 未解決・要検証の論点

### A. 本経路の成立可否そのもの（最重要）

1. **pyfunc uplift モデルが Evaluate recipe で本当にエンドツーエンドで動くか — 未確認**。#7 が「全機能の動作保証はない」と明記。uplift の予測は「CATE（連続値）」であり、`BINARY_CLASSIFICATION` / `MULTICLASS` / `REGRESSION` のいずれにも意味的に収まらない。`REGRESSION` として import して `set_core_metadata(target_column_name=...)` に**何を渡すのか**（実測値 Y か、観測不能な真の uplift か）が原理的に未解決。**本クラスタ最大のリスク**。
2. **`prediction_type=None` の場合の到達範囲**。#11 は「performance analysis と explainability が利用不可」と述べるが、**その状態で MES に載るか否かは明記なし**。載らないなら #29 の SER 経由が唯一の道になる。
3. **`set_core_metadata` の必須性のニュアンス**。原文は "Optional, only for regression or classification models" だが "mandatory to have access to the saved model performance tab"。＝*import には不要、performance タブには必須*。
4. **CausalML の Cython 依存（30.7%）を pyfunc アーティファクトに含めた場合の可搬性**。スコアリング code env で再ビルドが要るか未確認。#17（Models From Code）が緩和策になり得るが前例なし。

### B. Python バージョンゲート

5. **CausalML 0.17.0 の `>=3.11` はハードゲートで確定**（PyPI JSON で実測）。回避策として **causalml==0.15.5 へのピン留め**が現実的（ただし RATE/TOC 等の新 API の可否は要確認）。EconML 0.16.0 は `>=3.9` でゲートなし。
6. **DSS 側が提供する Python バージョンの上限が未確認**。#6 は MLflow を **Python 3.10** で検証と記載しており、**DSS の検証済み構成が 3.10 なら CausalML 0.17.0（>=3.11）と正面衝突する**。この 3.10 vs 3.11 の齟齬が**本経路の実務上の最大のブロッカー候補**。

### C. Partitioned model との組み合わせ

7. ⚠️ **「Causal Prediction が Partitioned Models と非互換」は公式ドキュメント上で確認できなかった**。#1 の逐語リストは5項目のみで Partitioned Models を含まない。**非対応と断定する根拠がない**（要確認事項として扱うべき）。
8. **Partitioned model × custom algorithm の互換性は公式に未記載**。#41 は "Visual ML with Python backend" 全体を許可し custom algorithm を除外していないが明示的な許可もない。**消極的な読みしかできない**。
9. **一方、確定している衝突が1つある: Partitioned model は Evaluate recipe で評価不可**。#27 が「The model must be a **non-partitioned** ...」と明記。#35 の Model Comparison からも除外。**＝「パーティション別 uplift モデル」と「MES による監視」は両立しない**。さらに #41 の「Only top-level metrics and checks」によりパーティション単位の metrics/checks も取れず、MES 代替経路も塞がる。

### D. MES 代替経路の限界

10. **Data Quality Rules は saved model / MES に使えない**（#45）。「DQ Rules を MES 代替に」という構想は成立せず、旧来の checks に限定される。
11. **saved model / MES 向けの metrics/checks の実装例が事実上存在しない**。#44 は「引数に取れる」と述べるのみで**コード例はデータセット限定**。API 形状は実機で確かめるしかない。
12. **SER の制約**: reference データがないと Data Drift が計算不可、Model Evaluation は**最大 20000 行のサンプル**。uplift の裾を見たい場合にサンプリングが効く可能性。

### E. API node

13. **`custom_keys` の文書化が非対称**。書き手側（predict の戻り値）は #36 に明記されるが、**読み手側（レスポンス JSON スキーマ）は未記載**。さらに **query log（#40）の JSON フォーマットにも `customKeys` フィールドの記載がない**。→ **「custom_keys で CATE を返し query log で回収して監視する」feedback loop は魅力的だが、ログに載る保証が公式にない。実機検証必須**。
14. **表記揺れ**: Python 側は `custom_keys_list`（snake_case）、実出力キーは `customKeys`（camelCase）。
15. **MLflow endpoint（#37）が custom_keys をサポートするかは記載なし**。しない場合「MLflow で MES、Python prediction endpoint で API」という**二重実装**が必要になる可能性。

### F. ドキュメント自体のギャップ

16. **`MLflowVersionHandler` / `ExternalModelVersionHandler` のブラウズ可能な公式 API リファレンスは事実上存在しない**。**#12（GitHub ソース）が唯一の正典**。
17. **`causalml.metrics` 専用の API ページが存在しない**（404）。#49 の `__init__.py` で代替。
18. ⚠️ **KB と公式ドキュメントで Causal Prediction の制約列挙が食い違う**。#4（KB）は #1 にない `custom models` と `SQL/Spark scoring` 非対応を挙げる。**特に KB 側の「custom models 非対応」は本クラスタの回避策設計に直結するため要確認**。
19. **Dataiku の Causal Prediction が内部で EconML/CausalML を使っているかは非公開**。

### G. 先行事例の不在

20. **「CausalML/EconML を `mlflow.pyfunc.PythonModel` で包む」チュートリアルは事実上存在しない**。3方向から検索してゼロ。最も近い #59 も因果**探索**であり uplift/CATE ではない。**本経路はコミュニティの前例がほぼない領域であり、設計・検証コストを高めに見積もるべき**。
21. **uplift モデルのリアルタイムサービング専門の解説も未発見**。
22. **Microsoft/Azure の EconML + MLflow コンテンツは存在しない**。
