# Daily Research Pipeline — 実装ステップ

## Step 1: 設定構造の変更（config.py + research-config.yaml）

**対象**: backend
**依存**: なし

### 概要
AppConfigのデータ構造をdaily方式に変更し、複数ドメイン対応の設定を読み込めるようにする。

### 作業項目
- [ ] `ResearchConfig`を削除し、`DailyDomainConfig`と`DailyConfig`を新規定義
- [ ] `AppConfig.research` → `AppConfig.daily`に置換
- [ ] `load_config()`のYAMLパース処理を新構造に対応
- [ ] 環境変数オーバーライドを新構造に合わせて更新
- [ ] `research-config.yaml`を新構造に書き換え
- [ ] `test_config.py`を新構造に合わせて全面更新

### 対象ファイル
- `backend/src/config.py`
- `backend/config/research-config.yaml`
- `backend/tests/test_config.py`

### 受入条件
- `load_config()`が新YAML構造を正しくパースし`AppConfig`を返す
- 環境変数でのオーバーライドが動作する
- 既存テストが新構造で全てパスする

---

## Step 2: CSVマネージャーの実装（csv_manager.py）

**対象**: backend
**依存**: なし

### 概要
CSVファイルの読み取り、次のpendingアイテム取得、done更新を行うモジュールを新規作成する。

### 作業項目
- [ ] `ResearchItem`データクラスの定義
- [ ] `get_next_pending(csv_path)` — pending先頭行を返す
- [ ] `mark_done(csv_path, row_index)` — status列をdoneに更新
- [ ] `get_csv_files(domain_dir)` — `list/*.csv`ファイル一覧を返す
- [ ] `test_csv_manager.py`の作成（正常系・異常系・エッジケース）

### 対象ファイル
- `backend/src/csv_manager.py`（新規）
- `backend/tests/test_csv_manager.py`（新規）

### 受入条件
- pendingの先頭行を正しく取得できる
- mark_done後にCSVファイルが正しく更新される
- 全行done時にNoneを返す
- 空ファイル・不正フォーマットでエラーハンドリングされる

---

## Step 3: プロンプトビルダーの実装（prompt_builder.py）

**対象**: backend
**依存**: なし

### 概要
テンプレートファイルとCSVデータからプロンプト文字列を生成するモジュールを新規作成する。

### 作業項目
- [ ] `build_prompt(template_path, item)` — テンプレート展開関数
- [ ] テンプレート内の`{title}`, `{url}`等をCSVデータで置換
- [ ] `test_prompt_builder.py`の作成

### 対象ファイル
- `backend/src/prompt_builder.py`（新規）
- `backend/tests/test_prompt_builder.py`（新規）

### 受入条件
- テンプレート内の全プレースホルダーが正しく展開される
- テンプレートファイルが存在しない場合にFileNotFoundError
- 未定義キーがある場合にKeyError

---

## Step 4: プロンプトテンプレートの作成

**対象**: docs
**依存**: なし

### 概要
daily方式で使用する共通プロンプトテンプレートを作成する。

### 作業項目
- [ ] `docs/daily/prompt_template.md`を作成
- [ ] プレースホルダー: `{title}`, `{url}`, `{authors}`, `{year}`, `{venue}`, `{summary}`

### 対象ファイル
- `docs/daily/prompt_template.md`（新規）

### 受入条件
- テンプレートが全CSVフィールドを活用している
- Claude CLIで実行して有意なレポートが生成される品質

---

## Step 5: research_runner.pyの変更

**対象**: backend
**依存**: なし（他ステップと並行可能）

### 概要
プロンプトをファイルパスではなく文字列で受け取り、出力先を完全パスで指定できるように変更する。

### 作業項目
- [ ] `prompt_path: str` → `prompt: str`（プロンプト文字列直接）に変更
- [ ] `output_dir: str` → `output_path: Path`（完全ファイルパス）に変更
- [ ] ファイル名生成ロジック（`report-YYYYMMDD.md`）を削除
- [ ] プロンプトファイル読み込みロジックを削除
- [ ] `test_research_runner.py`を新インターフェースに合わせて更新

### 対象ファイル
- `backend/src/research_runner.py`
- `backend/tests/test_research_runner.py`

### 受入条件
- プロンプト文字列を直接Claude CLIに渡して実行できる
- 指定された`output_path`にレポートが保存される
- 既存のプリアンブル除去・バリデーションロジックが維持される

---

## Step 6: メール通知の変更（email_notifier.py）

**対象**: backend
**依存**: なし（他ステップと並行可能）

### 概要
複数ドメインの結果を1通にまとめて通知する新関数を実装し、旧関数を置き換える。

### 作業項目
- [ ] `DomainResult`データクラスの定義（main.pyまたは別モジュール）
- [ ] `notify_research_results(results, ...)`関数の実装
- [ ] メール本文テンプレート（実行サマリ + 各ドメイン結果）
- [ ] 件名: `[Daily Research] YYYY-MM-DD (N domains)`
- [ ] 各ドメインのMarkdown + PDF添付
- [ ] 旧`notify_success()` / `notify_failure()`を削除
- [ ] `test_email_notifier.py`を新関数に合わせて更新

### 対象ファイル
- `backend/src/email_notifier.py`
- `backend/tests/test_email_notifier.py`

### 受入条件
- 複数ドメインの結果が1通のメールにまとまる
- 成功ドメインのレポートがMarkdown+PDFで添付される
- 失敗ドメインのエラーが本文に記載される
- 全ドメイン完了（CSV空）時に適切な通知が送られる

---

## Step 7: PR作成の変更（pr_creator.py）

**対象**: backend
**依存**: なし

### 概要
PR本文に複数ドメインのレポート情報を含めるように変更する。

### 作業項目
- [ ] `create_pr()`の引数に`results: list[DomainResult]`を追加
- [ ] PR本文に各ドメインのレポートファイルとリサーチ対象タイトルを記載
- [ ] PRタイトルを`[Daily Research] YYYY-MM-DD`に変更
- [ ] 旧引数（`output_files`, `prompt_path`）を削除
- [ ] `test_pr_creator.py`を更新

### 対象ファイル
- `backend/src/pr_creator.py`
- `backend/tests/test_pr_creator.py`

### 受入条件
- PR本文に全ドメインのレポート情報が含まれる
- 失敗ドメインも本文に記載される

---

## Step 8: メインオーケストレーションの変更（main.py）

**対象**: backend
**依存**: Step 1, 2, 3, 5, 6, 7（全モジュールの完成後）

### 概要
main.pyのパイプラインフローをdaily方式に全面書き換えする。

### 作業項目
- [ ] ドメインループの実装（`config.daily.domains`を順次処理）
- [ ] 各ドメインの処理フロー:
  1. `get_csv_files()` → CSVファイル取得
  2. `get_next_pending()` → 次のリサーチ対象取得
  3. `build_prompt()` → プロンプト生成
  4. `run_research()` → レポート生成
  5. `mark_done()` → CSV更新
- [ ] `DomainResult`の集約
- [ ] 成功ドメインがあれば`commit_and_push()` → `create_pr()`
- [ ] `notify_research_results()`で全結果をまとめてメール送信
- [ ] 部分失敗時のエラーハンドリング
- [ ] 全ドメインCSV完了時のハンドリング

### 対象ファイル
- `backend/src/main.py`
- （`DomainResult`をmain.pyに定義、または別ファイルに切り出し）

### 受入条件
- 複数ドメインが順次処理される
- 1ドメインの失敗が他に影響しない
- 全結果が1通のメールで通知される
- 成功時exit 0、全失敗時exit 1

---

## Step 9: 不要ファイルの削除

**対象**: cross-cutting
**依存**: Step 8（全機能の動作確認後）

### 概要
旧方式のファイル・コードを削除する。

### 作業項目
- [ ] `docs/research/prompt/` ディレクトリの削除
- [ ] `docs/research/cate/prompt/` ディレクトリの削除
- [ ] `docs/research/cate/metalearner/prompt/` ディレクトリの削除
- [ ] config.pyから旧`ResearchConfig`関連のコードが完全に除去されていることを確認
- [ ] 不要なimport文の削除

### 対象ファイル
- `docs/research/prompt/` （削除）
- `docs/research/cate/prompt/` （削除）
- `docs/research/cate/metalearner/prompt/` （削除）

### 受入条件
- 旧方式の設定・プロンプトファイルが全て削除されている
- 残存コードに旧方式への参照がない
- `dev/test-backend`が全てパスする

---

## Step 10: サンプルCSVの作成と統合テスト

**対象**: cross-cutting
**依存**: Step 8

### 概要
legal_techドメインのサンプルCSVを配置し、パイプライン全体の統合テストを行う。

### 作業項目
- [ ] `docs/daily/legal_tech/list/resources.csv`のサンプルデータ作成
- [ ] ローカルでのパイプライン実行テスト（可能な範囲）
- [ ] `dev/test-backend`の全テストパス確認
- [ ] ruff / mypy のチェックパス確認

### 対象ファイル
- `docs/daily/legal_tech/list/resources.csv`（新規）
- `docs/daily/legal_tech/report/`（ディレクトリ作成）

### 受入条件
- サンプルCSVが正しいフォーマットで配置されている
- `dev/test-backend`が全てパスする
- ruff / mypy エラーがない

---

## 並行実行マップ

```
Phase 1（並行可能）:
  Step 1: config.py変更
  Step 2: csv_manager.py新規
  Step 3: prompt_builder.py新規
  Step 4: プロンプトテンプレート作成
  Step 5: research_runner.py変更
  Step 6: email_notifier.py変更
  Step 7: pr_creator.py変更

Phase 2（Phase 1完了後）:
  Step 8: main.py統合

Phase 3（Phase 2完了後）:
  Step 9: 不要ファイル削除
  Step 10: サンプルCSV作成・統合テスト
```
