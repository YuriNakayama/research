# Markdownウェブビューア — コードベース調査

## 深層コードベース分析

### リサーチ出力構造

- **ファイル分析**: `docs/research/<domain>/report/`, `docs/daily/<domain>/report/`
- **現行実装**: リサーチパイプラインが Claude CLI の `/research-retrieval` スキルを実行し、マークダウンファイルを生成
- **出力形式**: 日本語を含む技術文書（30-35KB/レポート）。H1-H3ヘッダー、テーブル、数式（$equation$）、脚注引用 [n] を含む
- **CSVメタデータ**: `docs/daily/<domain>/list/YYYYMMDD.csv` — title, url, authors, year, venue, summary, status
- **キーインターフェース**: `DomainResult(domain_name, success, output_file, item_title, error)` — frozen dataclass

### パイプラインフロー（backend/src/main.py）

- **データフロー**: CSV(pending) → research_runner.py(Claude CLI) → report MD → git commit/push → PR作成 → Email通知
- **ブランチ戦略**: `daily/auto/YYYYMMDD-HHMMSS` 形式
- **コミットメッセージ**: `[Auto Research] YYYY-MM-DD`
- **PR**: `gh` CLI で作成、タイトル `[Daily Research] YYYY-MM-DD`
- **メール通知**: Amazon SES、Markdown + PDF添付

### インフラストラクチャ（infra/）

- **リージョン**: ap-northeast-1（東京）
- **コンピュート**: ECS Fargate（プライベートサブネット）
- **ストレージ**: EFS（Claude CLI認証永続化）
- **コンテナ**: ECR（auto_research-dev-task）
- **スケジューリング**: EventBridge Scheduler
- **シークレット**: AWS Secrets Manager（GitHub App キー）
- **ログ**: CloudWatch（/ecs/auto_research_dev）
- **CI/CD**: GitHub Actions OIDC → ECR push → ECS実行
- **Terraform State**: S3 + DynamoDB ロッキング

### フロントエンド

- **現状**: フロントエンドコードは一切存在しない
- **ウェブフレームワーク**: なし（FastAPI, Next.js 等）
- **ホスティング**: なし（CloudFront, S3, Amplify 等）
- **認証**: なし

## 技術的制約

1. **リサーチ結果はGitリポジトリにのみ保存** — 検索可能なDBなし
2. **On-Demand ISR は Amplify で未サポート** — 時間ベースの revalidate で代替必要
3. **マークダウン内に数式表記あり** — KaTeX/MathJax レンダリングが必要
4. **日本語コンテンツが主体** — 日本語タイポグラフィ最適化が必須
5. **レポートサイズが30-35KB** — ビルド時パースが実用的

## 主要な発見事項

- パイプラインは完全にCLI/Email/PR駆動であり、ウェブUIは新規構築
- マークダウンファイルはGitリポジトリ内に構造化されて保存済み
- CSVメタデータを活用すればレポートの一覧・フィルタリングが可能
- 既存のCI/CDパイプライン（GitHub Actions）を拡張してフロントエンドのビルド・デプロイが可能
- ECSタスク完了時にAmplifyビルドをトリガーする仕組みが必要
