# 自動リサーチパイプライン — 技術リサーチ

## Deep Codebase Analysis

### 1. 既存のDockerfile（.devcontainer/Dockerfile）

- **ファイル**: `.devcontainer/Dockerfile`（56行）
- **ベースイメージ**: `node:20-bookworm-slim`
- **インストール済みツール**:
  - Claude Code CLI: `npm install -g @anthropic-ai/claude-code`（行38-39）
  - AWS CLI v2: x86_64版（行31-34）
  - UV + Python 3.13（行25-28）
  - pnpm（行36）
  - git, curl, openssh-client（行14-20）
- **ユーザー設定**: `node` ユーザー（UID=1000）で実行
- **再利用可能なパターン**: Claude CLIのnpmインストール、UVによるPython管理、非rootユーザー実行

**Fargateタスク用Dockerfileへの応用**:
既存のDevcontainerをベースに、Fargateタスク専用のDockerfileを作成可能。不要なツール（pnpm等）を除き、gh CLIとjqを追加する。

### 2. 既存のインフラ規約（.claude/rules/infra.md）

- **ファイル**: `.claude/rules/infra.md`（222行）
- **モジュール構造**: foundation / platform / applications の3層構造
  - `foundation/`: networking, dns, security
  - `platform/`: cognito, container, database, monitoring, waf
  - `applications/`: backend, frontend_web
- **命名規則**: `snake_case`、環境名プレフィックス、リソース型を名前に含めない
- **タグ管理**: `default_tags`で共通タグ、PascalCaseのタグキー
- **State管理**: S3 + DynamoDB でリモートstate、暗号化必須
- **Secrets管理**: tfvarsはGit外、`TF_VAR_*`環境変数、Secrets Manager活用

**本機能への適用**:
新規の`infra/`ディレクトリは本リポジトリ独立の構成となるが、命名規則・タグ管理・Secrets管理等の規約はそのまま準拠する。モジュール構造も同様の思想で整理する。

### 3. 既存のGitHub Actions（.github/workflows/ci-backend.yml）

- **ファイル**: `.github/workflows/ci-backend.yml`（54行）
- **トリガー**: Pull Request、workflow_dispatch
- **ランナー**: ubuntu-latest、timeout 10分
- **ステップ**: UVキャッシュ → uv sync → ruff format/check
- **参考パターン**: UVのキャッシュ戦略、workflow_dispatchによる手動実行

### 4. docs/research/の構造

- **配置場所**: `docs/research/cate/metalearner/`
- **命名規則**: `papers-YYYYMMDD.md`（日付付きリスト）、`papers-YYYYMMDD/`（詳細ディレクトリ）
- **構造**: テーマ別のサブディレクトリ → プロンプト/レポート/画像

**Fargateタスクからの参照**:
タスク起動時にリポジトリをcloneし、`docs/research/`配下のプロンプトファイルを読み込む。出力も同ディレクトリに配置してPR化する。

### 5. Claude Code設定（.claude/）

- **settings.json**: gh CLI許可済み（`Bash(gh:*)`）、各種hooks設定
- **スキル**: research-papers（論文詳細調査）、research-prompt-builder（調査プロンプト生成）
- **エージェント**: 14種類のサブエージェント定義

**Fargateタスクでの活用**:
`.claude/`ディレクトリをリポジトリごとcloneすることで、スキルやsettingsがそのまま使える。将来的に`claude -p`でスキルを指定して実行可能。

---

## 外部リサーチ

### ECS Fargate + EFS 統合

**プラットフォーム要件**:
- Fargate プラットフォームバージョン **1.4.0以降**（Linux）でEFSサポート
- 内部で`aws-fargate-supervisor`コンテナが生成され、タスクメモリ・CPUを少量消費

**EFS Volume設定パラメータ**:

| パラメータ | 必須 | 説明 |
|---|---|---|
| `fileSystemId` | Yes | EFS ファイルシステム ID |
| `rootDirectory` | No | アクセスポイント使用時は`/`または省略 |
| `transitEncryption` | No | IAM認可使用時は`ENABLED`必須 |
| `authorizationConfig.accessPointId` | No | アクセスポイントID |
| `authorizationConfig.iam` | No | タスクIAMロールでの認証 |

**セキュリティグループ設計**:
- Fargate SG → EFS SG: NFS ポート2049のみ許可
- EFS SG: Fargate SGからのインバウンドのみ
- Fargate SG: アウトバウンド全許可（インターネットアクセスに必要）

**アクセスポイント設計**:
- POSIX UID/GID = 1000（nodeユーザーと一致）
- ルートディレクトリ: `/claude-config`（Claude認証情報用）

**Terraform主要リソース**:
- `aws_efs_file_system`: 暗号化有効
- `aws_efs_mount_target`: プライベートサブネットごとに1つ
- `aws_efs_access_point`: POSIX UID/GID指定
- タスク定義の`volume`ブロックで`efs_volume_configuration`を指定

### Claude CLI のDocker コンテナ化

**インストール方法**: 2パターン確認

| 方法 | コマンド | 出典 |
|---|---|---|
| npm グローバル | `npm install -g @anthropic-ai/claude-code` | claudebox, 既存Devcontainer |
| ネイティブインストーラ | `curl -fsSL https://claude.ai/install.sh \| bash` | yury-egorenkov/claude-code-docker |

**認証・設定ディレクトリ**:
- Claude Maxのセッション情報: `~/.claude/`
- EFSの`/claude-config`にマウントし永続化
- `CLAUDE_CONFIG_DIR`環境変数でカスタムパスを指定可能

**非対話実行**:
```bash
claude -p "プロンプト内容"          # 標準的な非対話実行
claude -p "$(cat prompt.md)"       # ファイルからプロンプトを読み込み
```

**コンテナ環境での注意点**:
- git設定（user.name, user.email）が必要（commit/push用）
- `gh auth login --with-token`でGitHub認証
- ネットワークアクセスが必要（Claude API, GitHub API, arXiv等）

### EventBridge Scheduler + ECS Fargate

**Terraform構成**:
- `aws_scheduler_schedule`: cron式でスケジュール定義
- `ecs_parameters`ブロックでタスク定義、ネットワーク構成を指定
- `input`でcontainerOverrides（コマンド、環境変数）を渡せる

**IAMロール要件**:
- Schedulerロール（Principal: `scheduler.amazonaws.com`）: `ecs:RunTask`, `iam:PassRole`
- タスク実行ロール: ECR pull, CloudWatch Logs, Secrets Manager
- タスクロール: EFS アクセス、Secrets Manager

**cron式（JST 09:00 = UTC 00:00）**:
```
cron(0 0 * * ? *)
```

### GitHub App 認証

**認証フロー**:
1. Secrets Managerから秘密鍵を取得
2. PyJWTでJWT生成（App ID + 秘密鍵、有効期限10分）
3. `POST /app/installations/{id}/access_tokens`でインストールトークン取得（有効期限1時間）
4. `GH_TOKEN`環境変数にセットしてgh CLIで操作

**必要な権限（GitHub App）**:
- `contents: write`（push）
- `pull_requests: write`（PR作成）

**AWS Secrets Manager に格納するもの**:
- GitHub App秘密鍵（PEM形式）
- GitHub App ID
- GitHub Installation ID
- Slack Webhook URL

### 類似OSSプロジェクト分析

| リポジトリ | 特徴 | 参考ポイント |
|---|---|---|
| RchGrav/claudebox | 最も完成度の高いClaude Code Docker環境 | Debianベース、プロファイル対応、ファイアウォール分離 |
| yury-egorenkov/claude-code-docker | 軽量Docker環境 | ネイティブインストーラ使用、`--dangerously-skip-permissions` |
| GenesisClawbot/claude-code-cicd-hardening | CI/CDハードニングガイド | GitHub Action + Claude Codeの統合パターン |

**所見**: ECS Fargate上でClaude CLIをスケジュール実行する完全なテンプレートは見つからなかった。Docker化のパターン（上記）とTerraformのECS+EFS構成を組み合わせて構築する必要がある。

---

## パターン比較

| 観点 | 本プロジェクト（採用案） | Lambda + Layer | EC2常時起動 |
|---|---|---|---|
| Claude Max対応 | ○（EFSでセッション永続化） | ×（セッション維持不可） | ○（常時ログイン） |
| コスト | 実行時のみ課金 | 最安だが利用不可 | 高い（常時課金） |
| スケーラビリティ | タスク単位でスケール | - | 手動 |
| 起動時間 | 30-60秒 | - | 即時 |
| 運用負荷 | 低い（Fargate管理） | - | 高い（OS管理） |

---

## 技術的制約

1. **Claude Maxセッションの有効期限**: セッションが無期限かどうか未確認。定期的な再ログインが必要になる可能性あり → EFSに保存した認証情報の有効期限を監視する仕組みが必要かもしれない
2. **Fargateタスクのタイムアウト**: Claude CLIのリサーチ実行時間が長い場合、Fargateのタイムアウト（デフォルトなし、EventBridge側で設定可能）に注意
3. **GitHub Appトークンの有効期限**: 1時間。タスク実行が1時間を超える場合はトークンの再取得が必要
4. **EFSのパフォーマンス**: Burstingモードでは大量I/Oで性能低下の可能性。本ユースケースでは軽微
5. **NATゲートウェイのコスト**: プライベートサブネットからのインターネットアクセスにNATゲートウェイが必要。月額約$30-50

---

## リサーチまとめ

### 採用するアーキテクチャパターン

- **Docker**: 既存Devcontainerのnpmインストールパターンを踏襲、gh CLI・jqを追加
- **EFS**: アクセスポイント + IAM認可 + transit暗号化でClaude認証情報を永続化
- **EventBridge Scheduler**: cron式でFargate RunTaskを起動
- **GitHub App**: Secrets Managerに秘密鍵格納、タスク内でインストールトークン生成
- **Terraform**: 既存のinfra.md規約に準拠、モジュール構造で整理

### 外部リサーチから採用する要素

- claudebox/yury-egorenkovのDockerfileパターン（Claude CLIインストール、非rootユーザー）
- EFS Volume Configurationの公式パラメータ（transitEncryption, accessPointId, iam）
- EventBridge SchedulerのTerraform構成（aws_scheduler_schedule + ecs_parameters）
- GitHub Appのトークン生成スクリプトパターン（JWT → インストールトークン）
