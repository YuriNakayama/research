# Resources: python_api_testing

Dataiku Python API の運用品質（テスト・モック・CI/CD）に関するリソース。**GitHub 一次情報の実地検証を含む**（調査日 2026-07-15、GitHub REST API / raw ファイル取得による）。

## GitHub 実地検証で判明した重要事実（要約）

| 検証対象 | 結果 |
|---------|------|
| `dataiku-api-client-python` に `tests/` は存在するか | **存在しない**。公式クライアントにテストコードは一切無い |
| `.travis.yml` の状態 | 全5行で `nosetests` を指定するが**対象テストが無く、対象 Python は 2.7 / 3.4**。実質的に死んだ設定 |
| `dataiku-plugin-tests-utils` のリリース | **0件**。README は `@releases/tag/<VERSION>` でのインストールを指示するが**タグが無く手順が機能しない** |
| `dataiku` の OSS モックライブラリ | **存在する**（telia-oss/birgitta）。ただし PySpark 専用・2023年で停止 |
| 公式が示すテストの型 | **モックを使わない**。`PYTHONPATH=python-lib` でロジックを分離し純粋関数のみ単体テスト |

## 1. 公式 Python API リファレンス

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **Python APIs（起点）** | https://doc.dataiku.com/dss/latest/python-api/index.html | 公式ドキュメント | `dataiku`（DSS 内）と `dataikuapi`（外部 REST）の二層構造。テスト戦略の前提 |
| 2 | The REST API client | https://doc.dataiku.com/dss/latest/python-api/rest-api-client/index.html | 公式ドキュメント | `dataikuapi` の入口。CI から DSS を外部操作する基盤 |
| 3 | Datasets | https://doc.dataiku.com/dss/latest/python-api/datasets.html | 公式ドキュメント | `dataiku.Dataset`。`get_dataframe()` は内部 API にしか無く、モック困難の根源 |
| 4 | Managed folders | https://doc.dataiku.com/dss/latest/python-api/managed_folders.html | 公式ドキュメント | `dataiku.Folder`。学習済みモデル成果物の保存先 |
| 5 | Machine learning | https://doc.dataiku.com/dss/latest/python-api/ml.html | 公式ドキュメント | 学習・Saved Model の制御 |
| 6 | Scenarios (in a scenario) | https://doc.dataiku.com/dss/latest/python-api/scenarios-inside.html | 公式ドキュメント | `dataiku.scenario.Scenario` |
| 7 | Reference API documentation of `dataiku` | https://doc.dataiku.com/dss/latest/python-api/dataiku-reference.html | 公式ドキュメント | `dataiku` 全クラス参照 |
| 8 | Reference API documentation of `dataikuapi` | https://doc.dataiku.com/dss/latest/python-api/dataikuapi-reference.html | 公式ドキュメント | `dataikuapi` 全クラス参照 |

## 2. 公式 Developer Guide

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 9 | **Running unit tests on project libraries** | https://developer.dataiku.com/latest/tutorials/devtools/project-libs-unit-tests/index.html | 公式Developer | **最重要**。pytest 公式チュートリアル。ただし**純粋 pandas 関数しかテストしない**（`dataiku` に触れない）点が設計思想の露呈 |
| 10 | The Dataiku Python APIs | https://developer.dataiku.com/latest/getting-started/dataiku-python-apis/index.html | 公式Developer | 2パッケージの使い分け |
| 11 | Using Dataiku's Python packages | https://developer.dataiku.com/latest/getting-started/dataiku-python-apis/python-client/index.html | 公式Developer | ローカル導入・認証・疎通確認 |
| 12 | Developer tools | https://developer.dataiku.com/latest/tutorials/devtools/index.html | 公式Developer | devtools ハブ |
| 13 | The main API client | https://developer.dataiku.com/latest/api-reference/python/client.html | 公式Developer | `DSSClient` の認証 |
| 14 | Project Deployer (API reference) | https://developer.dataiku.com/latest/api-reference/python/project-deployer.html | 公式Developer | `export_bundle` → `publish_bundle` → `start_update` |
| 15 | Index of the `dataiku` package | https://developer.dataiku.com/latest/api-reference/python/dataiku-index.html | 公式Developer | 全要素索引 |
| 16 | Using the API to interact with git | https://developer.dataiku.com/latest/tutorials/devtools/using-api-with-git-project/index.html | 公式Developer | Git 操作のプログラム制御 |

## 3. シナリオ / 自動テスト

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 17 | **Testing a project** | https://doc.dataiku.com/dss/latest/scenarios/test_scenarios.html | 公式ドキュメント | **Test Dashboard、JUnitXML / HTML 出力**。CI 連携の実務的な継ぎ目 |
| 18 | Scenario steps | https://doc.dataiku.com/dss/latest/scenarios/steps.html | 公式ドキュメント | Execute Python unit test（pytest セレクタ）/ Run integration test / WebApp test |
| 19 | Tutorial \| Test scenarios | https://knowledge.dataiku.com/latest/automate-tasks/scenarios/tutorial-test-scenarios.html | 公式KB | Design で作成 → QA Automation ノードで実行 → レポート出力 |
| 20 | Automation scenarios | https://doc.dataiku.com/dss/latest/scenarios/index.html | 公式ドキュメント | シナリオ全体像 |
| 21 | Variables in scenarios | https://doc.dataiku.com/dss/latest/scenarios/variables.html | 公式ドキュメント | `stepOutput_*` によるステップ出力の受け渡し |

## 4. GitHub（一次情報・実地検証済）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 22 | **dataiku/dataiku-api-client-python** | https://github.com/dataiku/dataiku-api-client-python | GitHub | 公式 REST クライアント。★43 / **commits 1,524** / open issues 32 / 最終 push 2026-07-13（活発）。**`tests/` ディレクトリ無し** |
| 23 | **dataiku/dss-plugin-template** | https://github.com/dataiku/dss-plugin-template | GitHub | **公式が示す唯一の実働テスト雛形**。★12 / commits 85 / 最終 push 2025-09-23。unit/integration 分離 |
| 24 | **dss-plugin-template / Makefile** | https://github.com/dataiku/dss-plugin-template/blob/main/Makefile | GitHub | **公式パターンの核心**。`export PYTHONPATH=$(PWD)/python-lib` でロジックを `dataiku` 非依存に分離＝モックを不要にする設計 |
| 25 | dss-plugin-template / test_dummy_module.py | https://github.com/dataiku/dss-plugin-template/blob/main/tests/python/unit/test_dummy_module.py | GitHub | 公式単体テスト実例。**`dataiku` を一切 import しない**。依存は pytest と allure-pytest のみで `mock` すら無い |
| 26 | dss-plugin-template / test_dummy_scenario.py | https://github.com/dataiku/dss-plugin-template/blob/main/tests/python/integration/test_dummy_scenario.py | GitHub | `dss_scenario.run` による結合テスト実例 |
| 27 | dss-plugin-template / Jenkinsfile | https://github.com/dataiku/dss-plugin-template/blob/main/Jenkinsfile | GitHub | 公式プラグイン CI の Jenkins 定義 |
| 28 | **dataiku/dataiku-plugin-tests-utils** | https://github.com/dataiku/dataiku-plugin-tests-utils | GitHub | 結合テスト用 pytest プラグイン。★0 / **commits 19** / **リリース 0件** / 最終 2025-07-23。**モック機能は無い** |
| 29 | dataiku-plugin-tests-utils / dss_scenario | https://github.com/dataiku/dataiku-plugin-tests-utils/tree/master/dku_plugin_test_utils/dss_scenario | GitHub | `dss_scenario.run` 実装本体。実 DSS のシナリオを起動し成否を待つだけ |
| 30 | **telia-oss/birgitta** | https://github.com/telia-oss/birgitta | GitHub | **`dataiku` を実際にモックする唯一の OSS**。MIT / ★16 / commits 55 / 最終 push 2023-11-09（停止） |
| 31 | **birgitta / script_prepend.py** | https://github.com/telia-oss/birgitta/blob/master/birgitta/recipetest/localtest/script_prepend.py | GitHub | **`sys.modules['dataiku'] = mock.MagicMock()`** の実コード。モック手法の具体的参照点 |
| 32 | birgitta / dataiku/platform/`__init__.py` | https://github.com/telia-oss/birgitta/blob/master/birgitta/dataiku/platform/__init__.py | GitHub | `default_project_key` / `dss_settings` の有無で実 DSS かモックかを判定する実行環境検出 |
| 33 | true-north-partners/dss-provisioner | https://github.com/true-north-partners/dss-provisioner | GitHub | `unittest.mock.MagicMock` で `dataikuapi` ハンドラを単体テストする現代的実例。Apache-2.0 / 2026-02 更新（現役） |
| 34 | dataiku/dss-integration-vscode | https://github.com/dataiku/dss-integration-vscode | GitHub | VS Code 拡張。★4 / **open issues 28** / 最終 2025-10-27（v1.3.1）。低メンテナンス |
| 35 | dataiku/dss-integration-pycharm | https://github.com/dataiku/dss-integration-pycharm | GitHub | PyCharm プラグイン。★2 / open issues 0 / 最終 2025-10-14 |

## 5. PyPI

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 36 | **dataiku-api-client (PyPI)** | https://pypi.org/pypi/dataiku-api-client/json | PyPI | **14.7.1（2026-07-13）**。依存は `requests<3` と `python-dateutil` のみ。`requires_python` 未指定。**DSS バージョンに合わせてピン留めすること** |
| 37 | birgitta (PyPI) | https://pypi.org/pypi/birgitta/json | PyPI | 0.1.37（**2020-09-10** が最終）。PyPI 版は5年以上停止 |

## 6. CI/CD・GitOps・デプロイ

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 38 | **Implementing GitOps for Dataiku（app-note v13）** | https://doc.dataiku.com/app-notes/13/implementing-gitops-for-dataiku/ | 公式ドキュメント | **最も完成された GitHub Actions 事例**。`dataiku_gitops_action.py` が **Git と Dataiku の commit SHA を照合**してから進行（Design ノードは Git 外で可変なので実効的な安全弁） |
| 39 | CI/CD Pipelines（ハブ） | https://knowledge.dataiku.com/latest/mlops-o16n/ci-cd/index.html | 公式KB | CI/CD チュートリアル群の入口 |
| 40 | Tutorial \| Getting started with CI/CD | https://knowledge.dataiku.com/latest/deploy/scaling-automation/tutorial-getting-started-ci-cd.html | 公式KB | パッケージング→テスト→デプロイ入門 |
| 41 | Tutorial \| Jenkins pipeline with Project Deployer | https://knowledge.dataiku.com/latest/mlops-o16n/ci-cd/tutorial-jenkins-pipeline-project-deployer.html | 公式KB | Deployer 経由の Jenkins 配備 |
| 42 | Tutorial \| Jenkins pipeline without Project Deployer | https://knowledge.dataiku.com/latest/mlops-o16n/ci-cd/tutorial-jenkins-pipeline.html | 公式KB | Automation ノードへの直接配備 |
| 43 | Tutorial \| Jenkins for API services | https://knowledge.dataiku.com/latest/mlops-o16n/ci-cd/tutorial-jenkins-pipeline-api-services.html | 公式KB | 各ステップが `dataikuapi` で記述される |
| 44 | Tutorial \| Azure pipeline with Project Deployer | https://knowledge.dataiku.com/latest/mlops-o16n/ci-cd/tutorial-azure-pipeline-project-deployer.html | 公式KB | Azure DevOps 版 |
| 45 | Project Deployer（概念） | https://developer.dataiku.com/latest/concepts-and-examples/project-deployer.html | 公式Developer | バンドル publish/deploy の概念と Python 例 |
| 46 | Concept \| Automation node preparation | https://knowledge.dataiku.com/latest/mlops-o16n/project-deployment/concept-automation-node-preparation.html | 公式KB | Git 由来 project library を含むノード準備 |
| 47 | Working with Git | https://doc.dataiku.com/dss/latest/collaboration/git.html | 公式ドキュメント | プロジェクト・ライブラリ・プラグインの Git 連携 |

## 7. コード環境 / IDE 連携

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 48 | Code environments | https://doc.dataiku.com/dss/latest/code-envs/index.html | 公式ドキュメント | **テスト依存（pytest/mock）の導入先**。入れ忘れがテスト失敗の最頻原因 |
| 49 | Code envs (API) | https://developer.dataiku.com/latest/concepts-and-examples/code-envs.html | 公式Developer | コード環境の Python API 管理 |
| 50 | VSCode extension for Dataiku DSS | https://developer.dataiku.com/latest/tutorials/devtools/vscode-extension/index.html | 公式Developer | VS Code 拡張の公式手順 |
| 51 | PyCharm plugin for Dataiku | https://developer.dataiku.com/latest/tutorials/devtools/pycharm-plugin/index.html | 公式Developer | チェックアウト→編集/デバッグ→同期 |

## 8. Community（モック・PYTHONPATH の一次情報）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 52 | **Running unit tests and dealing with project paths** | https://community.dataiku.com/discussion/24210/running-unit-tests-and-dealing-with-project-paths | Community | **PYTHONPATH トリックの一次情報**。`export PYTHONPATH=$PYTHONPATH:/path/to/<DATADIR>/lib/python` |
| 53 | **Lib dataiku-api-client-python in unit test mock DSSClient** | https://community.dataiku.com/discussion/39164/lib-dataiku-api-client-python-python-in-unit-test-mock-dssclient | Community | **公式ドキュメント欠落の証拠**。`DSSClient` のモック方法を問うが**返信ゼロのまま約2.5年** |
| 54 | Unit Testing: Mock list_users method in Python | https://community.dataiku.com/discussion/35559/unit-testing-mock-list-users-method-in-python | Community | インポート先へのパッチ。「Dataiku の API をテストしているのではない」という整理 |
| 55 | pyunit test for mock patch in dataiku | https://community.dataiku.com/discussion/20495/pyunitt-test-for-mock-patch-in-dataiku | Community（社員回答） | **`mock` を code env の "Packages to Install" に追加**する必要（社員が確認） |
| 56 | How to use "Execute Python unit test" scenario step | https://community.dataiku.com/discussion/44732/how-to-use-execute-python-unit-test-scenario-step | Community | シナリオからの pytest 実行 |
| 57 | How to run integration tests on flows with Python recipes | https://community.dataiku.com/discussion/44854/how-to-run-integration-tests-on-flows-with-python-recipes | Community | データセット差し替えが効く書き方。`get_location_info()` 等 |
| 58 | Python import from Library | https://community.dataiku.com/discussion/29747/python-import-from-library | Community | project library の import パス意味論 |
| 59 | MLOps best practices for Dataiku | https://community.dataiku.com/t5/Using-Dataiku-DSS/MLOps-best-practices-for-Dataiku/m-p/8048 | Community | 「recipe は小さく、project library を厚く」 |

## 9. 日本語リソース（層は薄い）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 60 | DataikuのBasicsチュートリアルをやってみた | https://dev.classmethod.jp/articles/dataiku-basic-tutorial/ | Blog | DevelopersIO による入門 |
| 61 | 【Dataiku】pythonレシピを使って機械学習用のサンプルデータを取得する | https://blog.truestar.co.jp/dataiku/20250211/61988/ | Blog | Python レシピで sklearn データを Flow へ |
| 62 | Dataiku DSS で始める "仮想環境" 入門 ~Code Env の作り方と切り替え方~ | https://blog.since2020.jp/ai/dataiku-code-env/ | Blog | Code Env の日本語解説 |
| 63 | 知って得する！Dataiku DSSの便利機能 4選＋α | https://www.keywalker.co.jp/blog/dataiku-tips-kw01.html | Blog | Libraries による共有 Python コード管理 |
| 64 | クイックスタート：データサイエンティスト | https://academy.dataiku.com/data-scientist-quick-start-ja | 公式ドキュメント | 日本語 Academy |

> **日本語の正直な評価**: **Python API のテスト・モック・CI/CD を主題とする日本語記事は発見できなかった**（Qiita / Zenn / note いずれにも該当なし）。上記は入門・レシピ・Code Env 止まり。本クラスタの中心論点は英語資料に依存する。

## GitHub 調査で判明した事実（詳細）

### dataiku/dataiku-api-client-python

- ★43 / fork 29 / open issues 32 / **commits 1,524** / created 2015-07-31
- 最終 push **2026-07-13**（`Merge branch 'release/14.7'`）＝**活発に保守されている**
- **公開リリースは 0 件**。バージョンはタグのみで管理（最新タグ 14.7.2）
- **決定的な発見: `tests/` ディレクトリが存在しない。** トップレベルは `.gitignore` / `.travis.yml` / `HISTORY.txt` / `LICENSE.txt` / `MANIFEST.in` / `README` / `requirements.txt` / `setup.py` と `dataikuapi` / `meta` / `module_utils` のみ
- `.travis.yml` は全5行で `script: nosetests` を指定するが、**実行対象のテストが存在せず、対象 Python は 2.7 と 3.4**。実質的に死んだ CI 設定
- README は3行のみ。テスト・モック・コントリビューションへの言及は皆無
- ⚠️ ライセンスが GitHub 上 `NOASSERTION` / PyPI 上 Apache-2.0 と**不一致**。理由は不明

> **結論: Dataiku 自身の公式クライアントにはテストが一切存在しない。**「公式のモック参照実装」を期待する仮説は成立しない。

### dataiku/dss-plugin-template — 公式パターンの正体

- ★12 / commits 85 / Apache-2.0 / 最終 push 2025-09-23
- `tests/python/unit/` と `tests/python/integration/` に明確分離。CI は Jenkinsfile と GitHub Actions の二本立て
- **単体テストの実像（全文）**:
  ```python
  from dummy_module import dummy_function
  def test_dummy_function():
      dummy_results = dummy_function()
      assert dummy_results == "foo"
  ```
  **`dataiku` を一切 import していない。** 依存は `pytest~=6.2` と `allure-pytest~=2.8` のみで **`mock` すら入っていない**
- **Makefile が核心**: `unit-tests` は `export PYTHONPATH=$(PWD)/python-lib` を設定して `pytest tests/python/unit` を実行。すなわち **`python-lib` に純粋な Python ロジックを置き `dataiku` 依存部と分離することで「モックを不要にする」設計**＝これが Dataiku 公式の暗黙の推奨解
- 単体と結合で venv を分ける理由は README に明記: 同一環境だと tests-utils の pytest fixture が単体テスト側と衝突するため

### dataiku/dataiku-plugin-tests-utils

- **commits 19 件のみ** / ★0 / open issues 2 / Apache-2.0 / created 2021-02-02 / 最終コミット 2025-07-23
- **公開リリース 0 件**。にもかかわらず README は `@releases/tag/<RELEASE_VERSION>` でのインストールを指示しており、**タグが無いため当該手順は実際には機能しない**
- **PyPI 未公開**。導入は `git+git://github.com/...` だが **`git://` プロトコルは GitHub が2021年に廃止済**でこれも失敗する記述
- `dss_scenario.run` の実体は**稼働中の DSS 上のシナリオを起動し成否を待つだけ**。Personal API Key と `PLUGIN_INTEGRATION_TEST_INSTANCE` 環境変数が必須。**モック機能は一切持たない**

### サードパーティのモック実装 — 探索結果

GitHub Code Search（認証済 `gh` CLI）および Repo Search:

| クエリ | 結果 |
|-------|------|
| `sys.modules["dataiku"]`（コード） | **0 件** |
| `patch("dataiku`（コード） | **0 件** |
| `mock dataiku language:Python` | 127 件（大半は無関係） |
| `MagicMock dataiku language:Python` | 10 件 |
| repo search（`dataiku mock` / `dataiku pytest` / `dataiku stub` / `fake dataiku` 等6種） | **全て 0 件** |

`MagicMock dataiku` の10件を個別精査した結果、実質的な該当は **telia-oss/birgitta** と **true-north-partners/dss-provisioner** の2件のみ。

### 判定: `dataiku` の OSS モックライブラリは存在するか

**「存在しない」という事前の見立ては、厳密には反証される。ただし実務的には概ね正しい。**

反証の根拠 — **telia-oss/birgitta** が実在:
- MIT / ★16 / commits 55 / created 2019-09-04
- `birgitta/recipetest/localtest/script_prepend.py` が**まさに `dataiku` をモックする**:
  ```python
  sys.modules['dataiku'] = mock.MagicMock()
  sys.modules['dataiku.spark'] = mock.MagicMock()
  ```
- `localtest/` には `conftest.py` `fixturing.py` `assertion.py` も揃い、単なるスニペットでなく体系的フレームワーク

しかし実用性は限定的:
- **最終 push 2023-11-09、PyPI 最終公開 2020-09-10** — 5年以上更新なし
- **PySpark レシピ専用**であり汎用 `dataiku` モックではない
- Telia の社内発ツールで事実上アーカイブ状態

**総合判定:**
1. **保守された汎用 `dataiku` モックライブラリは存在しない**
2. ただし**先行例が皆無ではない**。birgitta が `sys.modules` 差し替え手法の実装参照として利用可能で、手法自体は検証済み
3. **Dataiku 公式の推奨は「モックしない」こと**（plugin-template の Makefile が示す通り）
4. したがって**「ロジックを `dataiku` 非依存の純粋モジュールへ分離し、I/O 境界のみを結合テストで担保する」設計**が公式パターンに整合し最も現実的

## 検証できなかった事項

- `dataiku` パッケージ本体（DSS 内蔵、`dataiku-api-client` とは別物）は **OSS 公開されておらず**ソース検証不可。モック対象の正確な API 表面は公式ドキュメント経由でしか把握できない
- `dataiku-api-client-python` の GitHub / PyPI 間のライセンス不一致の理由
- **PyPI 最新 14.7.1 に対し git タグには 14.7.2 が存在**（`HISTORY.txt` にも記載）。公開遅延か失敗か判別不能（調査当日のリリースのためタイムラグの可能性が高い）
- Dataiku 社内に非公開のクライアントテストが存在するか否か
- GitHub Code Search はデフォルトブランチのインデックス済リポジトリのみが対象のため、未インデックスの小規模リポジトリに追加のモック実装が存在する可能性は排除できない
