# 自動リサーチパイプライン — 実装ステップ

## 概要

全12ステップ。infra → backend → 結合の順で進める。

```
Step 1-2: インフラ基盤（VPC, EFS, ECR, Secrets）
Step 3-4: ECSタスク定義、EventBridge Scheduler
Step 5-7: Backendアプリケーション（Python）
Step 8:   Dockerfile作成・ECR push
Step 9:   結合テスト（手動実行）
Step 10:  Slack通知実装
Step 11:  スケジュール実行の有効化・動作確認
Step 12:  ドキュメント整備
```

---

## Step 1: Terraformプロジェクト初期化 + ネットワーク基盤

**対象**: infra
**依存**: なし

### 概要
Terraformプロジェクトのルート構成と、VPC・サブネット・NATゲートウェイを作成する。

### 作業項目
- [ ] `infra/main.tf` — プロバイダ設定、backend設定（S3 + DynamoDB）
- [ ] `infra/variables.tf` — 共通変数（region, environment, project_name）
- [ ] `infra/outputs.tf` — ルート出力
- [ ] `infra/terraform.tfvars.example` — サンプル変数ファイル
- [ ] `infra/modules/networking/main.tf` — VPC, パブリック/プライベートサブネット(2AZ), IGW, NATゲートウェイ, ルートテーブル
- [ ] `infra/modules/networking/variables.tf` — vpc_cidr, az, 環境名
- [ ] `infra/modules/networking/outputs.tf` — vpc_id, subnet_ids
- [ ] `terraform fmt && terraform validate && terraform plan` で検証

### 対象ファイル
- `infra/main.tf`
- `infra/variables.tf`
- `infra/outputs.tf`
- `infra/terraform.tfvars.example`
- `infra/modules/networking/*.tf`

### 完了条件
- `terraform plan`が成功し、VPC・サブネット・NATゲートウェイのリソースが表示される
- infra.mdの規約（命名規則、タグ管理、暗号化）に準拠している

---

## Step 2: EFS + ECR + Secrets Manager

**対象**: infra
**依存**: Step 1

### 概要
Claude認証情報の永続化用EFS、Dockerイメージ用ECR、シークレット管理用Secrets Managerを作成する。

### 作業項目
- [ ] `infra/modules/efs/main.tf` — EFSファイルシステム（暗号化有効）、マウントターゲット、アクセスポイント（UID/GID=1000, path=/claude-config）、セキュリティグループ
- [ ] `infra/modules/ecr/main.tf` — ECRリポジトリ、ライフサイクルポリシー（最新5イメージ保持）、イメージスキャン有効
- [ ] `infra/modules/secrets/main.tf` — Secrets Manager（github-app-private-key, github-app-config, slack-webhook-url）のシークレット定義（値は手動設定）
- [ ] 各モジュールの`variables.tf`, `outputs.tf`
- [ ] `infra/main.tf`にモジュール呼び出し追加

### 対象ファイル
- `infra/modules/efs/*.tf`
- `infra/modules/ecr/*.tf`
- `infra/modules/secrets/*.tf`
- `infra/main.tf`（モジュール参照追加）

### 完了条件
- `terraform plan`でEFS、ECR、Secrets Managerリソースが表示される
- EFSセキュリティグループがNFS(2049)ポートのみ許可
- ECRにライフサイクルポリシーが設定されている

---

## Step 3: ECSクラスタ + タスク定義 + IAMロール

**対象**: infra
**依存**: Step 1, Step 2

### 概要
ECSクラスタ、Fargateタスク定義、必要なIAMロール（タスク実行ロール、タスクロール）を作成する。

### 作業項目
- [ ] `infra/modules/ecs/main.tf`:
  - ECSクラスタ
  - タスク定義（Fargate, CPU=1024, Memory=2048）
  - コンテナ定義（ECRイメージ、EFSマウント、ログ設定、環境変数）
  - タスク実行ロール（ECR pull, CloudWatch Logs, Secrets Manager）
  - タスクロール（EFS ClientMount/ClientWrite, Secrets Manager）
- [ ] `infra/modules/ecs/variables.tf` — ecr_repo_url, efs_id, access_point_id, subnet_ids, security_group_ids
- [ ] `infra/modules/ecs/outputs.tf` — cluster_arn, task_definition_arn, task_role_arn, execution_role_arn
- [ ] Fargateタスク用セキュリティグループ（アウトバウンド全許可）

### 対象ファイル
- `infra/modules/ecs/*.tf`
- `infra/main.tf`（モジュール参照追加）

### 完了条件
- `terraform plan`でECSクラスタ、タスク定義、IAMロールが表示される
- タスク定義にEFSボリュームマウントが含まれる
- IAMロールが最小権限の原則に従っている

---

## Step 4: EventBridge Scheduler + CloudWatch Logs

**対象**: infra
**依存**: Step 3

### 概要
日次スケジュール（JST 09:00）とログ基盤を作成する。初期状態ではスケジュールを無効化し、Step 11で有効化する。

### 作業項目
- [ ] `infra/modules/scheduler/main.tf`:
  - EventBridge Scheduler（`cron(0 0 * * ? *)`、state=DISABLED）
  - Schedulerロール（ecs:RunTask, iam:PassRole）
  - リトライポリシー（最大2回）
- [ ] `infra/modules/monitoring/main.tf`:
  - CloudWatch Logsロググループ（/ecs/auto-research, 保持30日）
- [ ] 各モジュールの`variables.tf`, `outputs.tf`

### 対象ファイル
- `infra/modules/scheduler/*.tf`
- `infra/modules/monitoring/*.tf`
- `infra/main.tf`（モジュール参照追加）

### 完了条件
- `terraform plan`でEventBridge Schedule、CloudWatch Logsが表示される
- スケジュールのstateがDISABLEDになっている
- Schedulerロールの権限が最小限

---

## Step 5: Pythonプロジェクト初期化 + 設定管理

**対象**: backend
**依存**: なし（infra並行可能）

### 概要
backendのPythonプロジェクトを初期化し、設定ファイルの読み込みモジュールを実装する。

### 作業項目
- [ ] `backend/pyproject.toml` — プロジェクト定義（Python >=3.12, 依存: pyyaml, pyjwt, requests, cryptography）
- [ ] `backend/src/__init__.py`
- [ ] `backend/src/config.py` — YAML設定ファイル + 環境変数の読み込み・バリデーション
- [ ] `backend/config/research-config.yaml` — デフォルト設定
- [ ] `backend/tests/test_config.py` — 設定読み込みのテスト

### 対象ファイル
- `backend/pyproject.toml`
- `backend/src/__init__.py`
- `backend/src/config.py`
- `backend/config/research-config.yaml`
- `backend/tests/test_config.py`

### 完了条件
- `uv sync`で依存関係がインストールできる
- 設定ファイルとデフォルト値の読み込みが正しく動作する
- テストが通る

---

## Step 6: GitHub認証 + Git操作モジュール

**対象**: backend
**依存**: Step 5

### 概要
GitHub App認証（JWT→インストールトークン）とgit操作（clone, branch, commit, push）を実装する。

### 作業項目
- [ ] `backend/src/github_auth.py`:
  - Secrets Managerから秘密鍵取得（boto3またはAWS CLI）
  - PyJWTでJWT生成（App ID + 秘密鍵、有効期限10分）
  - REST APIでインストールトークン取得（有効期限1時間）
  - ローカル実行用のPAT fallback
- [ ] `backend/src/git_manager.py`:
  - `clone_repo()` — git clone（tokenベース認証URL）
  - `create_branch()` — featureブランチ作成（`research/auto/YYYYMMDD`）
  - `commit_and_push()` — add, commit（日付入りメッセージ）, push
- [ ] `backend/tests/test_github_auth.py` — JWT生成ロジックのユニットテスト（モック使用）
- [ ] `backend/tests/test_git_manager.py` — git操作のテスト（subprocess呼び出しのモック）

### 対象ファイル
- `backend/src/github_auth.py`
- `backend/src/git_manager.py`
- `backend/tests/test_github_auth.py`
- `backend/tests/test_git_manager.py`

### 完了条件
- GitHub App認証フローが正しくトークンを返す（モックテスト）
- git操作が正しいコマンドを発行する（モックテスト）
- ローカルでのPAT fallbackが動作する

---

## Step 7: Claude CLI実行 + PR作成モジュール

**対象**: backend
**依存**: Step 5, Step 6

### 概要
Claude CLIの実行ロジックとgh CLIによるPR作成を実装する。

### 作業項目
- [ ] `backend/src/research_runner.py`:
  - プロンプトファイル読み込み
  - `claude -p "$(cat prompt.md)"` のsubprocess実行
  - 出力先ディレクトリへの保存
  - タイムアウト制御（デフォルト30分）
  - 実行ログ出力
- [ ] `backend/src/pr_creator.py`:
  - `gh pr create --title --body` の実行
  - PRタイトル: `[Auto Research] YYYY-MM-DD {テーマ}`
  - PRボディ: 実行プロンプトの概要 + 出力ファイル一覧
- [ ] `backend/src/main.py` — 全モジュールの統合エントリーポイント
- [ ] `backend/tests/test_research_runner.py`
- [ ] `backend/tests/test_pr_creator.py`

### 対象ファイル
- `backend/src/research_runner.py`
- `backend/src/pr_creator.py`
- `backend/src/main.py`
- `backend/tests/test_research_runner.py`
- `backend/tests/test_pr_creator.py`

### 完了条件
- Claude CLI呼び出しが正しいコマンドを発行する（モックテスト）
- PR作成が正しいgh CLIコマンドを発行する（モックテスト）
- main.pyでフルフローが順序通り実行される

---

## Step 8: Dockerfile + ECR push

**対象**: backend / infra
**依存**: Step 2（ECR）, Step 7（アプリケーション）

### 概要
Fargateタスク用Dockerfileを作成し、ECRにpushする。

### 作業項目
- [ ] `backend/Dockerfile`:
  - ベース: `node:22-bookworm-slim`
  - システムパッケージ: git, curl, jq, gh CLI
  - Claude CLI: `npm install -g @anthropic-ai/claude-code`
  - UV + Python 3.13
  - アプリケーションコード: `COPY . /app`
  - `uv sync --locked`で依存関係インストール
  - ユーザー: claude (uid=1000)
  - ENTRYPOINT: `scripts/entrypoint.sh`
- [ ] `backend/scripts/entrypoint.sh`:
  - EFS→ホームディレクトリのシンボリックリンク
  - GitHub認証トークン取得
  - main.py実行
  - 終了コード伝播
- [ ] `backend/.dockerignore`
- [ ] ローカルビルド確認: `docker build -t auto-research-task .`
- [ ] ECR push: `docker tag && docker push`

### 対象ファイル
- `backend/Dockerfile`
- `backend/scripts/entrypoint.sh`
- `backend/.dockerignore`

### 完了条件
- `docker build`が成功する
- コンテナ内でclaude, gh, git, python, jqコマンドが使える
- ECRにイメージがpushされている

---

## Step 9: EFS初期セットアップ + 手動結合テスト

**対象**: cross-cutting
**依存**: Step 1-4（インフラ全体）, Step 8（Dockerイメージ）

### 概要
EFSにClaude CLIの認証情報をセットアップし、手動でFargateタスクを実行して全体フローを検証する。

### 作業項目
- [ ] `infra/scripts/init-efs.sh` — EFS初期セットアップ手順書:
  - 一時的なEC2/Fargateタスクを起動してEFSにマウント
  - Claude CLIでログイン（`claude login`）
  - 認証情報が`/claude-config/.claude/`に保存されることを確認
- [ ] `terraform apply`でインフラ全体をデプロイ
- [ ] Secrets Managerにシークレット値を手動設定:
  - GitHub App秘密鍵
  - GitHub App ID / Installation ID
  - Slack Webhook URL
- [ ] AWS CLIから手動でFargateタスクを実行:
  ```
  aws ecs run-task --cluster auto-research --task-definition claude-task ...
  ```
- [ ] CloudWatch Logsで実行ログを確認
- [ ] GitHubにfeatureブランチとPRが作成されていることを確認

### 対象ファイル
- `infra/scripts/init-efs.sh`

### 完了条件
- EFSにClaude認証情報が保存されている
- 手動実行でリサーチレポートが生成される
- featureブランチにpush、PRが作成される
- CloudWatch Logsに実行ログが記録される

---

## Step 10: Slack通知実装

**対象**: backend
**依存**: Step 9（結合テスト成功後）

### 概要
タスク完了時のSlack通知を実装する。

### 作業項目
- [ ] `backend/src/slack_notifier.py`:
  - Secrets ManagerからWebhook URL取得
  - 成功時: PR URL、レポート概要、実行時間を通知
  - 失敗時: エラー内容、CloudWatch Logsリンクを通知
  - requests.postでWebhook送信
- [ ] `backend/tests/test_slack_notifier.py`
- [ ] main.pyにtry/exceptとSlack通知の統合
- [ ] ECRに更新イメージをpush
- [ ] 手動実行でSlack通知を確認

### 対象ファイル
- `backend/src/slack_notifier.py`
- `backend/tests/test_slack_notifier.py`
- `backend/src/main.py`（Slack統合追加）

### 完了条件
- 成功時にSlackチャンネルにPR URL付きの通知が届く
- 失敗時にSlackチャンネルにエラー通知が届く

---

## Step 11: スケジュール有効化 + 動作確認

**対象**: infra
**依存**: Step 9, Step 10

### 概要
EventBridge Schedulerを有効化し、日次自動実行の動作を確認する。

### 作業項目
- [ ] `infra/modules/scheduler/main.tf`のstateを`ENABLED`に変更
- [ ] `terraform apply`で反映
- [ ] 翌朝09:00 JSTにタスクが自動実行されることを確認
- [ ] PR作成・Slack通知が正常に行われることを確認
- [ ] CloudWatch Logsで実行ログを確認

### 対象ファイル
- `infra/modules/scheduler/main.tf`（state変更）

### 完了条件
- EventBridge Schedulerが有効化されている
- 自動実行でリサーチレポートPRとSlack通知が届く

---

## Step 12: ドキュメント整備

**対象**: cross-cutting
**依存**: Step 11

### 概要
運用ドキュメントとセットアップ手順を整備する。

### 作業項目
- [ ] `backend/README.md` — ローカル開発・テスト手順、設定ファイルの説明
- [ ] `infra/README.md` — Terraformの初期セットアップ手順、apply手順
- [ ] `infra/scripts/init-efs.sh`のコメント整備
- [ ] プロンプト/スキル切り替え手順の記載

### 対象ファイル
- `backend/README.md`
- `infra/README.md`

### 完了条件
- 新規メンバーがドキュメントだけでセットアップ・運用できる
