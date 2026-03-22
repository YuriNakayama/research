# 自動リサーチパイプライン — アーキテクチャ設計

## 全体構成図

```
┌──────────────────────────────────────────────────────────────────┐
│                        AWS Account                               │
│                                                                  │
│  ┌─────────────────┐     ┌──────────────────────────────────┐   │
│  │ EventBridge      │     │          VPC                      │   │
│  │ Scheduler        │     │                                   │   │
│  │ (cron 0 0 * * ?) ├────►│  ┌────────────────────────────┐  │   │
│  └─────────────────┘     │  │   Private Subnet             │  │   │
│                          │  │                              │  │   │
│                          │  │  ┌────────────────────────┐  │  │   │
│                          │  │  │  ECS Fargate Task       │  │  │   │
│                          │  │  │                        │  │  │   │
│                          │  │  │  ┌──────────────────┐  │  │  │   │
│                          │  │  │  │ Container        │  │  │  │   │
│                          │  │  │  │                  │  │  │  │   │
│                          │  │  │  │ 1. git clone     │  │  │  │   │
│                          │  │  │  │ 2. claude -p     │  │  │  │   │
│                          │  │  │  │ 3. git push      │  │  │  │   │
│                          │  │  │  │ 4. gh pr create  │  │  │  │   │
│                          │  │  │  │ 5. slack notify  │  │  │  │   │
│                          │  │  │  └──────┬───────────┘  │  │  │   │
│                          │  │  │         │ mount        │  │  │   │
│                          │  │  └─────────┼──────────────┘  │  │   │
│                          │  │            │                 │  │   │
│                          │  │  ┌─────────▼──────────────┐  │  │   │
│                          │  │  │  EFS                    │  │  │   │
│                          │  │  │  /claude-config/        │  │  │   │
│                          │  │  │    └── .claude/         │  │  │   │
│                          │  │  └────────────────────────┘  │  │   │
│                          │  └────────────────────────────┘  │   │
│                          │                                   │   │
│                          │  ┌────────────────────────────┐  │   │
│                          │  │  Public Subnet              │  │   │
│                          │  │    NAT Gateway               │  │   │
│                          │  └────────────────────────────┘  │   │
│                          └──────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ Secrets Manager  │  │ ECR              │  │ CloudWatch     │  │
│  │                  │  │                  │  │ Logs           │  │
│  │ - GitHub App Key │  │ - claude-task    │  │ - /ecs/claude  │  │
│  │ - GitHub App ID  │  │   :latest        │  │                │  │
│  │ - Slack Webhook  │  │                  │  │                │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
         │                        │
         │                        │
    ┌────▼────────┐        ┌─────▼──────┐
    │  GitHub      │        │  Slack     │
    │  - push      │        │  - 通知    │
    │  - PR作成    │        │            │
    └─────────────┘        └────────────┘
```

## フォルダ構成

```
backend/
├── Dockerfile                    # Fargateタスク用Dockerイメージ
├── pyproject.toml                # Python依存関係（UV管理）
├── src/
│   ├── __init__.py
│   ├── main.py                   # エントリーポイント
│   ├── config.py                 # 設定読み込み（環境変数、設定ファイル）
│   ├── research_runner.py        # Claude CLI実行ロジック
│   ├── git_manager.py            # git clone/branch/commit/push操作
│   ├── github_auth.py            # GitHub App認証（JWT→トークン生成）
│   ├── pr_creator.py             # gh CLIによるPR作成
│   └── slack_notifier.py         # Slack Webhook通知
├── config/
│   └── research-config.yaml      # リサーチ設定ファイル（プロンプトパス等）
├── scripts/
│   └── entrypoint.sh             # コンテナエントリーポイント
└── tests/
    ├── __init__.py
    ├── test_config.py
    ├── test_research_runner.py
    ├── test_git_manager.py
    ├── test_github_auth.py
    ├── test_pr_creator.py
    └── test_slack_notifier.py

infra/
├── main.tf                       # ルートモジュール（プロバイダ、バックエンド）
├── variables.tf                  # 入力変数定義
├── outputs.tf                    # 出力値定義
├── terraform.tfvars.example      # tfvarsのサンプル
├── modules/
│   ├── networking/               # VPC、サブネット、NATゲートウェイ
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── efs/                      # EFSファイルシステム、アクセスポイント
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ecr/                      # ECRリポジトリ
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── ecs/                      # ECSクラスタ、タスク定義
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── scheduler/                # EventBridge Scheduler
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── secrets/                  # Secrets Manager
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── monitoring/               # CloudWatch Logs、アラーム
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
└── scripts/
    └── init-efs.sh               # EFS初期セットアップ（Claude CLIログイン）
```

## Backend 設計

### エントリーポイント（main.py）

```
main()
  ├── config.load_config()              # 設定ファイル + 環境変数の読み込み
  ├── github_auth.get_token()           # GitHub Appインストールトークン取得
  ├── git_manager.clone_repo()          # リポジトリをclone
  ├── research_runner.run()             # Claude CLIでリサーチ実行
  │     ├── プロンプトファイル読み込み
  │     ├── claude -p でプロンプト実行
  │     └── 出力ファイルの検証
  ├── git_manager.create_branch()       # featureブランチ作成
  ├── git_manager.commit_and_push()     # 変更をcommit & push
  ├── pr_creator.create_pr()            # gh pr create でPR作成
  ├── slack_notifier.notify()           # Slack通知（成功/失敗）
  └── sys.exit(0 or 1)                  # 終了コード
```

### 設定ファイル（research-config.yaml）

```yaml
# リサーチ実行設定
research:
  # 実行するプロンプトのパス（リポジトリルートからの相対パス）
  prompt_path: "docs/research/cate/metalearner/prompt/search_paper.md"
  # 出力先ディレクトリ（リポジトリルートからの相対パス）
  output_dir: "docs/research/cate/metalearner"
  # ブランチ名プレフィックス
  branch_prefix: "research/auto"
  # Claude CLIの追加オプション
  claude_options: ""
  # 将来的なスキル指定（空の場合はスキルなし）
  skill: ""

github:
  repo: "owner/repo-name"
  base_branch: "main"

slack:
  channel: "#research-updates"
```

### 各モジュールの責務

| モジュール | 責務 | 外部依存 |
|---|---|---|
| `config.py` | YAML設定 + 環境変数の読み込み・バリデーション | PyYAML |
| `research_runner.py` | `claude -p`のsubprocess実行、出力検証 | Claude CLI（外部コマンド） |
| `git_manager.py` | clone, branch作成, add, commit, push | git（外部コマンド） |
| `github_auth.py` | JWT生成→インストールトークン取得 | PyJWT, requests |
| `pr_creator.py` | `gh pr create`の実行 | gh CLI（外部コマンド） |
| `slack_notifier.py` | Webhook POSTで通知送信 | requests |

### Dockerfile

```
FROM node:22-bookworm-slim
  ├── システムパッケージ: git, curl, jq, gh CLI
  ├── Claude CLI: npm install -g @anthropic-ai/claude-code
  ├── UV + Python 3.13
  ├── Python依存関係: uv sync
  ├── ユーザー: claude (uid=1000)
  └── ENTRYPOINT: scripts/entrypoint.sh
```

既存Devcontainer（`.devcontainer/Dockerfile`）のClaude CLI・UV・AWS CLIインストールパターンを踏襲。pnpmは不要のため除外。gh CLIとjqを追加。

### entrypoint.sh のフロー

```bash
#!/bin/bash
set -euo pipefail

# 1. Claude認証情報のシンボリックリンク作成
#    EFS:/claude-config/.claude → ~/.claude
ln -sfn /claude-config/.claude "$HOME/.claude"

# 2. GitHub App認証
#    Secrets Managerから秘密鍵取得 → トークン生成
export GH_TOKEN=$(python -m src.github_auth)

# 3. メインスクリプト実行
python -m src.main

# 4. 終了コードの伝播
exit $?
```

## インフラ設計

### ネットワーク（modules/networking）

| リソース | 設定 |
|---|---|
| VPC | CIDR: 10.0.0.0/16 |
| パブリックサブネット | 2 AZ、NATゲートウェイ配置 |
| プライベートサブネット | 2 AZ、Fargateタスク実行 |
| NATゲートウェイ | 1個（コスト最適化、シングルAZ） |
| インターネットゲートウェイ | パブリックサブネット用 |

### EFS（modules/efs）

| リソース | 設定 |
|---|---|
| ファイルシステム | 暗号化有効、Burstingモード |
| マウントターゲット | プライベートサブネットごとに1つ |
| アクセスポイント | UID/GID=1000、パス=/claude-config |
| セキュリティグループ | FargateタスクSGからNFS(2049)のみ許可 |

### ECR（modules/ecr）

| リソース | 設定 |
|---|---|
| リポジトリ | `auto-research-task`、イメージスキャン有効 |
| ライフサイクルポリシー | 最新5イメージを保持 |

### ECS（modules/ecs）

| リソース | 設定 |
|---|---|
| クラスタ | `auto-research` |
| タスク定義 | Fargate、CPU=1024、メモリ=2048 |
| コンテナ | ECRイメージ、EFSマウント(/claude-config) |
| タスク実行ロール | ECR pull、CloudWatch Logs、Secrets Manager |
| タスクロール | EFS ClientMount/ClientWrite、Secrets Manager |

### EventBridge Scheduler（modules/scheduler）

| リソース | 設定 |
|---|---|
| スケジュール | `cron(0 0 * * ? *)` — UTC 00:00 = JST 09:00 |
| ターゲット | ECS RunTask |
| IAMロール | `ecs:RunTask`, `iam:PassRole` |
| リトライ | 最大2回、最大イベント経過3600秒 |

### Secrets Manager（modules/secrets）

| シークレット | 内容 |
|---|---|
| `auto-research/github-app-private-key` | GitHub App秘密鍵（PEM） |
| `auto-research/github-app-config` | App ID, Installation ID（JSON） |
| `auto-research/slack-webhook-url` | Slack Incoming Webhook URL |

### CloudWatch（modules/monitoring）

| リソース | 設定 |
|---|---|
| ロググループ | `/ecs/auto-research`、保持期間30日 |
| メトリクスフィルター | タスク失敗検知用 |
| アラーム | タスク失敗時にSNS通知（オプション） |

## セキュリティ設計

### IAMロール構成

```
EventBridge Scheduler Role
  └── ecs:RunTask, iam:PassRole

ECS Task Execution Role
  ├── ecr:GetAuthorizationToken
  ├── ecr:BatchGetImage, ecr:GetDownloadUrlForLayer
  ├── logs:CreateLogStream, logs:PutLogEvents
  └── secretsmanager:GetSecretValue (github-app-*, slack-*)

ECS Task Role
  ├── elasticfilesystem:ClientMount
  ├── elasticfilesystem:ClientWrite
  └── secretsmanager:GetSecretValue (github-app-*, slack-*)
```

### ネットワークセキュリティ

- Fargateタスクはプライベートサブネットで実行（パブリックIP無し）
- インターネットアクセスはNATゲートウェイ経由
- EFSへのアクセスはNFS(2049)ポートのみ、FargateタスクSGに限定

### シークレット管理

- すべてのシークレットはSecrets Managerに格納
- タスク定義の`secrets`ブロックまたはタスクロールで取得
- tfvarsファイルはGit管理外
