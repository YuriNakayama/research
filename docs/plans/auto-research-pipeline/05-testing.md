# 自動リサーチパイプライン — テスト戦略

## テストアプローチ

本機能は外部サービス（Claude CLI, GitHub API, Slack, AWS）との連携が中心のため、以下の戦略を取る：

1. **ユニットテスト**: 各モジュールのロジックをモック使用でテスト
2. **結合テスト**: 手動でFargateタスクを実行し、全体フローを検証
3. **インフラテスト**: `terraform validate` + `terraform plan`で構成の正当性を検証

## ユニットテスト

### Backend: pytest

| テストファイル | テスト対象 | モック対象 | テスト内容 |
|---|---|---|---|
| `test_config.py` | `config.py` | ファイルシステム | YAML読み込み、デフォルト値、環境変数オーバーライド、バリデーションエラー |
| `test_github_auth.py` | `github_auth.py` | boto3, requests | JWT生成ロジック、トークン取得API呼び出し、エラーハンドリング |
| `test_git_manager.py` | `git_manager.py` | subprocess | clone/branch/commit/pushの各コマンド引数、ブランチ名生成（日付フォーマット） |
| `test_research_runner.py` | `research_runner.py` | subprocess | claude CLIコマンド引数、タイムアウト制御、出力ファイル検証 |
| `test_pr_creator.py` | `pr_creator.py` | subprocess | gh CLIコマンド引数、PRタイトル/ボディの生成 |
| `test_slack_notifier.py` | `slack_notifier.py` | requests, boto3 | 成功/失敗通知のペイロード、Webhook送信 |

### テストパターン

```python
# subprocess呼び出しのモックパターン
@patch("subprocess.run")
def test_clone_repo(mock_run):
    mock_run.return_value = CompletedProcess(args=[], returncode=0)
    git_manager.clone_repo("https://github.com/owner/repo", "/tmp/work")
    mock_run.assert_called_once_with(
        ["git", "clone", "https://github.com/owner/repo", "/tmp/work"],
        check=True, capture_output=True, text=True
    )

# Secrets Managerのモックパターン
@patch("boto3.client")
def test_get_github_token(mock_boto):
    mock_sm = MagicMock()
    mock_boto.return_value = mock_sm
    mock_sm.get_secret_value.return_value = {"SecretString": "pem-key-data"}
    # ...
```

## 結合テスト（手動）

Step 9で実施。以下のチェックリストで検証する。

### チェックリスト

- [ ] EFSにClaude認証情報が保存されている
- [ ] Fargateタスクが起動し、EFSをマウントできる
- [ ] Claude CLIがログイン状態で実行できる
- [ ] プロンプトファイルが正しく読み込まれる
- [ ] Claude CLIの出力が指定ディレクトリに保存される
- [ ] featureブランチが作成される（命名: `research/auto/YYYYMMDD`）
- [ ] GitHubにpushが成功する
- [ ] PRが作成される（タイトル、ボディが正しい）
- [ ] Slack通知が届く（成功メッセージ）
- [ ] CloudWatch Logsに全ステップのログが記録される
- [ ] タスク終了コードが0（成功）

### 異常系テスト

- [ ] Claude CLIの認証切れ時にエラー通知が届く
- [ ] プロンプトファイルが存在しない場合にエラー終了する
- [ ] GitHub pushに失敗した場合にエラー通知が届く
- [ ] Claude CLIがタイムアウトした場合に適切に終了する

## インフラテスト

| テスト | コマンド | 検証内容 |
|---|---|---|
| フォーマット | `terraform fmt -check -recursive` | HCLファイルのフォーマット準拠 |
| バリデーション | `terraform validate` | 構成の文法的正当性 |
| プラン | `terraform plan` | リソース作成の妥当性、差分確認 |

## テストデータ

### プロンプトファイル（テスト用）

テスト実行用の軽量プロンプトを用意する（本番プロンプトは時間がかかるため）：

```markdown
# テスト用プロンプト
「テスト」と日本語で出力してください。
```

### 設定ファイル（テスト用）

```yaml
research:
  prompt_path: "tests/fixtures/test-prompt.md"
  output_dir: "tests/fixtures/output"
  branch_prefix: "test/auto"
  claude_options: ""
  skill: ""
```

## カバレッジ目標

| 対象 | 目標 |
|------|------|
| ユニットテスト | 80%以上 |
| 結合テスト | 主要フロー1シナリオ + 異常系4シナリオ |
| インフラ | terraform validate + plan 通過 |
