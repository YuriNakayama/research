# Daily Research Pipeline — テスト戦略

## テスト方針

既存のテストパターン（pytest + unittest.mock、AAA）を踏襲し、新規・変更モジュールごとにユニットテストを作成する。統合テストはローカルでのパイプライン実行で確認する。

## ユニットテスト

### 新規モジュール

#### test_csv_manager.py

| テストケース | 検証内容 |
|-------------|---------|
| `test_get_next_pending_returns_first_pending` | pending行が複数ある場合、先頭を返す |
| `test_get_next_pending_skips_done` | done行をスキップしてpending行を返す |
| `test_get_next_pending_all_done` | 全行doneの場合Noneを返す |
| `test_get_next_pending_empty_csv` | ヘッダーのみのCSVでNoneを返す |
| `test_mark_done_updates_status` | 指定行のstatusがdoneに更新される |
| `test_mark_done_preserves_other_rows` | 他の行が変更されない |
| `test_get_csv_files_finds_csvs` | list/ディレクトリ内のCSVファイルを返す |
| `test_get_csv_files_empty_dir` | CSVがない場合空リストを返す |
| `test_csv_with_japanese_content` | 日本語を含むCSVが正しく処理される |
| `test_csv_with_commas_in_fields` | フィールド内カンマ（引用符囲み）の処理 |

#### test_prompt_builder.py

| テストケース | 検証内容 |
|-------------|---------|
| `test_build_prompt_replaces_placeholders` | 全プレースホルダーが正しく展開される |
| `test_build_prompt_missing_key` | 未定義キーでKeyError |
| `test_build_prompt_template_not_found` | テンプレートファイル不在でFileNotFoundError |
| `test_build_prompt_with_special_chars` | URLや特殊文字を含むデータの展開 |

### 変更モジュール

#### test_config.py（更新）

| テストケース | 検証内容 |
|-------------|---------|
| `test_load_daily_config` | 新YAML構造がパースされる |
| `test_load_multiple_domains` | 複数ドメインが正しくロードされる |
| `test_env_override_daily_fields` | 環境変数オーバーライドが動作する |
| `test_default_values` | branch_prefix等のデフォルト値 |

#### test_research_runner.py（更新）

| テストケース | 検証内容 |
|-------------|---------|
| `test_run_research_with_prompt_string` | プロンプト文字列で実行できる |
| `test_run_research_saves_to_output_path` | 指定パスにファイルが保存される |
| `test_run_research_strips_preamble` | プリアンブル除去が維持される |
| `test_run_research_timeout` | タイムアウト時の例外 |
| `test_run_research_empty_output` | 空出力時の例外 |

#### test_email_notifier.py（更新）

| テストケース | 検証内容 |
|-------------|---------|
| `test_notify_results_multiple_domains` | 複数ドメインの結果が1通にまとまる |
| `test_notify_results_with_failures` | 成功+失敗ドメインの混在 |
| `test_notify_results_all_failed` | 全失敗時のメール内容 |
| `test_notify_results_all_complete` | 全CSV完了時の通知 |
| `test_notify_results_attachments` | 各ドメインのMarkdown+PDF添付 |
| `test_notify_results_pdf_fallback` | PDF変換失敗時のフォールバック |

#### test_pr_creator.py（更新）

| テストケース | 検証内容 |
|-------------|---------|
| `test_create_pr_multiple_domains` | 複数ドメインの情報がPR本文に含まれる |
| `test_create_pr_with_failures` | 失敗ドメインもPR本文に記載される |

## 統合テスト

ローカル環境での手動確認:

- [ ] サンプルCSVを配置し、`main.py`を実行してレポートが生成される
- [ ] CSVのstatus列がdoneに更新される
- [ ] 2回目実行で次のpending行が処理される
- [ ] 全行done時にメールで完了通知が送られる
- [ ] 複数ドメイン設定で全ドメインが順次処理される

## テストデータ

### サンプルCSV（テスト用フィクスチャ）

```csv
title,url,authors,year,venue,summary,status
"Legal AI for Contract Review","https://arxiv.org/abs/2024.12345","Smith et al.",2024,"arXiv","AI contract review survey",pending
"NLP in Legal Domain","https://arxiv.org/abs/2024.67890","Johnson et al.",2024,"ACL","NLP legal domain analysis",pending
"Patent Classification ML","https://arxiv.org/abs/2023.11111","Tanaka et al.",2023,"EMNLP","ML patent classification",done
```

### サンプルプロンプトテンプレート（テスト用フィクスチャ）

```markdown
# {title} の調査
URL: {url}
著者: {authors}
```

## モック戦略

| 対象 | モック方法 | 理由 |
|------|-----------|------|
| Claude CLI | `subprocess.run`をモック | 外部CLI呼び出し |
| AWS SES | `boto3.client`をモック | AWS依存 |
| git操作 | `subprocess.run`をモック | 外部CLI呼び出し |
| gh CLI | `subprocess.run`をモック | 外部CLI呼び出し |
| ファイルI/O | `tmp_path`フィクスチャ | テスト間の独立性 |

## カバレッジ目標

- ユニットテスト: 80%以上
- 新規モジュール（csv_manager, prompt_builder）: 90%以上
- `dev/test-backend`で全テストパス + ruff + mypy クリーン
