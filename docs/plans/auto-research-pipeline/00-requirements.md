# 自動リサーチパイプライン — 要件定義

## 背景と目的

研究調査（論文サーベイ等）を毎日自動実行し、調査結果をGitHubのPull Requestとして蓄積する仕組みを構築する。Claude Max（CLI）を用いてリサーチプロンプトを実行し、レポートを生成する。

Claude MaxはAPIではなくログインセッションで動作するため、Lambda等の完全サーバレスでは実行不可。ECS FargateとEFSを組み合わせ、認証情報を永続化した「サーバレスに近い」構成を採用する。

## ユーザーストーリー

- 研究者として、毎朝自動でリサーチレポートが生成されPRとして届くことで、手動調査の時間を削減したい
- 研究者として、リサーチ対象のプロンプトをリポジトリ内で管理し、バージョン管理したい
- 研究者として、PR作成とSlack通知により、チームメンバーにも調査結果を共有したい
- 研究者として、将来的にスキル（research-papers等）を活用した高度な調査に切り替えたい

## 機能要件

### 1. ECS Fargate タスク
- Claude CLI をインストールしたDockerコンテナを実行
- EFS上の認証情報（~/.config/claude）をマウントしてログイン状態を維持
- リポジトリをgit cloneし、指定されたプロンプトファイルをclaude CLIに渡して実行
- 生成されたレポートをfeatureブランチとしてpush

### 2. PR作成・Slack通知（Fargateタスク内）
- gh CLIを使ってPull Requestを作成
- Slack Incoming Webhookでチャンネルに通知（PR URL、レポート概要）

### 3. スケジュール実行
- EventBridge Schedulerで毎日09:00 JSTにFargateタスクを起動

### 4. 認証情報管理
- Claude CLIの認証情報をEFSに永続化
- GitHub AppのインストールトークンをSecrets Managerに格納
- Slack Webhook URLをSecrets Managerに格納

### 5. プロンプト管理
- リポジトリ内（docs/research/配下）にプロンプトファイルを配置
- 設定ファイルで実行するプロンプトのパスを指定可能に（将来的にスキル切り替え対応）

## 非機能要件

- **コスト**: Fargateは実行時のみ課金。タスク実行時間は想定30分以内
- **可用性**: 日次バッチのため高可用性は不要。失敗時はSlack通知で検知
- **セキュリティ**: 認証情報はSecrets Manager/EFSで管理。IAMロールは最小権限
- **拡張性**: プロンプト/スキルの切り替えを設定ファイルで可能に

## スコープ外

- Claude CLIの初回ログイン自動化（手動で1回ログインしEFSに保存する前提）
- 複数プロンプトの並列実行（初期は1プロンプト/1タスク）
- レポートの品質評価・自動レビュー
- 既存のAI Receptionシステムとの統合

## 用語集

| 用語 | 説明 |
|------|------|
| Claude Max | AnthropicのCLIツール。ログインセッションベースで動作 |
| EFS | Elastic File System。Fargateタスク間でファイルを永続化 |
| EventBridge Scheduler | AWSのスケジュール実行サービス |
| GitHub App | GitHub APIアクセス用のアプリケーション。インストールトークンで認証 |

## フォルダ構成（新規作成）

```
backend/           # Python実行スクリプト
infra/             # Terraformファイル
```
