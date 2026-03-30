# Markdownウェブビューア — アーキテクチャ設計

## 全体構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Cloud (ap-northeast-1)                 │
│                                                                 │
│  ┌──────────────┐     ┌──────────────────────────────────────┐  │
│  │ ECS Fargate   │     │ AWS Amplify                          │  │
│  │ (既存パイプライン)│     │                                      │  │
│  │               │     │  ┌──────────┐    ┌───────────────┐  │  │
│  │ Claude CLI    │     │  │ Next.js  │    │ CloudFront    │  │  │
│  │ → MD生成      │     │  │ SSG Build│───▶│ CDN配信       │  │  │
│  │ → git push    │─┐   │  └────┬─────┘    └───────┬───────┘  │  │
│  │               │ │   │       │                  │          │  │
│  └───────────────┘ │   │  ┌────▼─────┐  ┌────────▼───────┐  │  │
│                    │   │  │ API Route │  │ Cognito Auth   │  │  │
│                    │   │  │(Lambda@Edge)│  │                │  │  │
│                    │   │  └────┬─────┘  └────────────────┘  │  │
│                    │   └───────┼──────────────────────────────┘  │
│                    │           │                                  │
│  ┌──────────────┐ │   ┌───────▼──────┐                          │
│  │ GitHub Repo   │ │   │ DynamoDB     │                          │
│  │ (main branch) │ │   │ (metadata)   │                          │
│  │               │─┘   │              │                          │
│  │ docs/daily/   │     └──────────────┘                          │
│  │ docs/research/│       ▲                                       │
│  └───────────────┘       │                                       │
│          │               │                                       │
│          └── Amplifyビルド時にCSV/MDを読み込みDynamoDBへ同期 ─────┘  │
│                                                                 │
│  git push ──▶ Amplify自動ビルド ──▶ SSGページ生成 + DynamoDB同期   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

        ┌────────────┐     ┌────────────┐
        │ スマホ      │     │ PC         │
        │ (モバイル    │     │ (デスクトップ │
        │  ブラウザ)   │     │  ブラウザ)   │
        └────────────┘     └────────────┘
```

## データフロー

```
パイプライン実行（既存・変更なし）
  ↓
git push (docs/daily/<domain>/report/*.md + list/*.csv)
  ↓
Amplify自動ビルドトリガー
  ↓
Next.jsビルドプロセス:
  1. docs/ のMarkdown + CSVをファイルシステムから読み込み
  2. メタデータをDynamoDBに同期（ビルドスクリプト）
  3. SSGで静的HTMLページを生成
  ↓
CloudFront CDNで配信

ユーザーアクセス時:
  - 一覧ページ: API Route → DynamoDB クエリ（フィルタ・ソート）
  - 詳細ページ: SSG済み静的HTML（CDN配信）
```

## フロントエンド設計（Next.js単体構成）

### ディレクトリ構造

```
frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # ルートレイアウト（認証ガード、テーマ）
│   │   ├── page.tsx                # トップページ（ドメイン一覧）
│   │   ├── login/
│   │   │   └── page.tsx            # ログインページ（Cognito UI）
│   │   ├── [domain]/
│   │   │   ├── page.tsx            # ドメイン別レポート一覧
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # レポート詳細表示
│   │   └── api/
│   │       ├── reports/
│   │       │   └── route.ts        # DynamoDBクエリ（一覧・フィルタ・ソート）
│   │       └── sync/
│   │           └── route.ts        # DynamoDBメタデータ同期（ビルド時呼び出し）
│   ├── components/
│   │   ├── ui/                     # shadcn/ui コンポーネント
│   │   ├── layout/
│   │   │   ├── header.tsx          # ヘッダー（ナビ、テーマ切替、ログアウト）
│   │   │   ├── sidebar.tsx         # PCサイドバー（TOC表示）
│   │   │   ├── mobile-nav.tsx      # モバイルドロワーナビ
│   │   │   └── footer.tsx          # フッター
│   │   ├── report/
│   │   │   ├── report-card.tsx     # レポートカード（一覧用）
│   │   │   ├── report-content.tsx  # レポート本文（Markdownレンダリング）
│   │   │   ├── report-header.tsx   # レポートヘッダー（メタデータ表示）
│   │   │   └── toc.tsx             # 目次コンポーネント
│   │   ├── markdown/
│   │   │   ├── markdown-renderer.tsx # react-markdown ラッパー
│   │   │   ├── math-block.tsx      # KaTeX 数式レンダリング
│   │   │   ├── code-block.tsx      # シンタックスハイライト
│   │   │   └── responsive-table.tsx # テーブル横スクロール対応
│   │   └── auth/
│   │       └── auth-guard.tsx      # Cognito認証ガード
│   ├── lib/
│   │   ├── amplify.ts              # Amplify設定
│   │   ├── dynamodb.ts             # DynamoDB クライアント（サーバーサイド専用）
│   │   ├── content.ts              # Markdownファイル読み込みユーティリティ
│   │   ├── metadata.ts             # CSVメタデータパーサー
│   │   └── sync.ts                 # DynamoDB同期ロジック（ビルド時実行）
│   ├── hooks/
│   │   ├── use-theme.ts            # テーマ切替フック
│   │   └── use-toc.ts              # TOC見出し抽出フック
│   └── styles/
│       └── globals.css             # グローバルCSS（日本語タイポグラフィ）
├── scripts/
│   └── sync-dynamodb.ts            # ビルド後DynamoDB同期スクリプト
├── public/
│   └── fonts/                      # Noto Sans JP（セルフホスト）
├── amplify.yml                     # Amplifyビルド設定
├── next.config.ts                  # Next.js設定
├── tailwind.config.ts              # Tailwind設定
├── package.json
└── tsconfig.json
```

### ページ構成

| ページ | パス | 描画方式 | データソース | 説明 |
|--------|------|----------|-------------|------|
| トップ | `/` | SSG | ファイルシステム | ドメイン一覧カード |
| ログイン | `/login` | SSG | - | Cognito認証UIコンポーネント |
| レポート一覧 | `/[domain]` | SSR | DynamoDB | ドメイン別レポート一覧（フィルタ・ソート対応） |
| レポート詳細 | `/[domain]/[slug]` | SSG + ISR | ファイルシステム | Markdownレンダリング + TOC |

### DynamoDB操作（Next.js サーバーサイド）

**ビルド時同期** — `scripts/sync-dynamodb.ts`:
- `amplify.yml` のビルドコマンドから実行
- `docs/daily/<domain>/list/*.csv` を読み込み、メタデータをDynamoDBに upsert
- `docs/daily/<domain>/report/*.md` と `docs/research/<domain>/report/*.md` のファイル存在を確認
- 新規レポートのみ追加（冪等性確保）

**API Route** — `/api/reports/route.ts`:
- サーバーサイドでDynamoDBをクエリ（`@aws-sdk/lib-dynamodb`）
- ドメインフィルタ、日付ソート、ページネーション対応
- Cognito認証トークンの検証をMiddlewareで実施

**Server Components** — レポート詳細ページ:
- `generateStaticParams` でビルド時にDynamoDBからスラッグ一覧を取得
- Markdownファイルはファイルシステムから直接読み込み（SSG）

### レスポンシブレイアウト

```
モバイル (< 768px):
┌──────────────────┐
│ ☰ ロゴ  🌙 👤    │  ← ハンバーガーメニュー + テーマ切替
├──────────────────┤
│                  │
│  コンテンツ       │  ← フル幅、prose-sm
│                  │
│  テーブル ←→      │  ← 横スクロール
│                  │
├──────────────────┤
│ 📑 目次ボタン     │  ← フローティングボタン → ドロワーTOC
└──────────────────┘

タブレット (768px - 1024px):
┌──────────────────────────┐
│ ロゴ  ナビ    🌙 👤       │
├──────────────────────────┤
│                          │
│    コンテンツ (prose-base) │
│                          │
└──────────────────────────┘

デスクトップ (> 1024px):
┌────────────────────────────────────┐
│ ロゴ   ドメインナビ     🌙 👤       │
├──────────┬─────────────────────────┤
│          │                         │
│  TOC     │    コンテンツ (prose-lg)  │
│  サイド   │                         │
│  バー    │                         │
│          │                         │
└──────────┴─────────────────────────┘
```

### 日本語タイポグラフィ設定

```css
/* globals.css */
:root {
  --font-sans: 'Noto Sans JP', 'Yu Gothic UI', 'Hiragino Sans', sans-serif;
}

/* モバイル */
body {
  font-size: 15px;
  line-height: 1.8;
  letter-spacing: 0.05em;
}

/* デスクトップ */
@media (min-width: 768px) {
  body {
    font-size: 16px;
    line-height: 1.75;
  }
}

/* Markdownコンテンツ */
.prose {
  max-width: 65ch;  /* 日本語で約30文字/行 */
}

/* テーブル横スクロール */
.prose table {
  display: block;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

### Markdownレンダリングパイプライン

```
Markdown Source
  ↓
remark-parse          (Markdown → AST)
  ↓
remark-math           (数式構文抽出)
  ↓
remark-gfm            (GFM テーブル・タスクリスト)
  ↓
remark-rehype         (AST → HTML AST)
  ↓
rehype-katex          (数式 → KaTeX HTML)
  ↓
rehype-pretty-code    (コードブロック → Shikiハイライト)
  ↓
rehype-sanitize       (XSS対策)
  ↓
react-markdown        (React コンポーネント出力)
  ↓
カスタムコンポーネント:
  - responsive-table.tsx  (テーブル横スクロール)
  - math-block.tsx        (KaTeX表示)
  - code-block.tsx        (コピーボタン付きコードブロック)
```

## データモデル設計

### DynamoDB テーブル設計

**テーブル名**: `auto_research_{environment}_reports`

| 属性 | 型 | キー | 説明 |
|------|-----|------|------|
| `pk` | String | Partition Key | `DOMAIN#{domain_name}` |
| `sk` | String | Sort Key | `REPORT#{YYYYMMDD}#{slug}` |
| `title` | String | - | レポートタイトル |
| `url` | String | - | 元論文URL |
| `authors` | String | - | 著者名 |
| `year` | String | - | 発表年 |
| `venue` | String | - | 学会・ジャーナル名 |
| `summary` | String | - | 概要 |
| `report_path` | String | - | Markdownファイルパス（リポジトリ相対） |
| `report_type` | String | - | `daily` or `research` |
| `created_at` | String | - | ISO 8601 作成日時 |
| `updated_at` | String | - | ISO 8601 更新日時 |

**GSI**: `reports-by-date`
- Partition Key: `report_type`
- Sort Key: `created_at`
- 用途: 全ドメインの最新レポート一覧

### DynamoDB同期フロー

```
Amplifyビルド時:
  1. scripts/sync-dynamodb.ts が実行される
  2. docs/daily/<domain>/list/*.csv を全て読み込み
  3. 各CSVの行（status=done）からメタデータを抽出
  4. DynamoDB に PutItem（条件付き書き込みで冪等性確保）
  5. ビルドログに同期結果を出力

amplify.yml:
  build:
    commands:
      - npx tsx scripts/sync-dynamodb.ts   # DynamoDB同期
      - npx next build                     # Next.jsビルド
```

### API Route設計

| エンドポイント | メソッド | 説明 | データソース |
|-------------|---------|------|-------------|
| `/api/reports?domain={domain}` | GET | ドメイン別レポート一覧 | DynamoDB Query (pk) |
| `/api/reports?type={type}&limit={n}` | GET | 最新レポート一覧 | DynamoDB Query (GSI) |

※ レポート本文はSSGでビルド時にファイルシステムから読み込み静的HTML化
※ API RouteはLambda@Edgeで実行され、サーバーサイドでDynamoDBを操作

## インフラストラクチャ設計

### 新規Terraformモジュール

```
infra/modules/
├── amplify/                    # 新規
│   ├── main.tf                 # Amplify App, Branch, Build設定, IAMロール
│   ├── variables.tf            # environment, project, github_repo等
│   └── outputs.tf              # app_id, default_domain等
├── cognito/                    # 新規
│   ├── main.tf                 # User Pool, App Client, Domain
│   ├── variables.tf
│   └── outputs.tf              # user_pool_id, app_client_id等
├── dynamodb/                   # 新規
│   ├── main.tf                 # Reports テーブル, GSI
│   ├── variables.tf
│   └── outputs.tf              # table_name, table_arn
└── (既存モジュール)
```

### Amplify モジュール (main.tf)

```hcl
resource "aws_amplify_app" "main" {
  name         = "${var.project}_${var.environment}_viewer"
  repository   = "https://github.com/${var.github_repo}"
  platform     = "WEB_COMPUTE"

  build_spec = file("${path.module}/amplify-build-spec.yml")

  # Amplify SSR用のIAMロールを設定（DynamoDBアクセス権限を含む）
  iam_service_role_arn = aws_iam_role.amplify.arn

  environment_variables = {
    NEXT_PUBLIC_COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    NEXT_PUBLIC_COGNITO_CLIENT_ID    = var.cognito_app_client_id
    DYNAMODB_TABLE_NAME              = var.dynamodb_table_name
    AWS_REGION                       = var.region
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = "main"
  stage       = "PRODUCTION"

  framework = "Next.js - SSR"

  environment_variables = {
    AMPLIFY_MONOREPO_APP_ROOT = "frontend"
  }
}

# Amplify用IAMロール（DynamoDBへのアクセス権限）
resource "aws_iam_role" "amplify" {
  name = "${var.project}_${var.environment}_amplify_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "amplify.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.project}_${var.environment}_amplify_role"
  }
}

resource "aws_iam_role_policy" "amplify_dynamodb" {
  name = "${var.project}_${var.environment}_amplify_dynamodb"
  role = aws_iam_role.amplify.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:UpdateItem"
      ]
      Resource = [
        var.dynamodb_table_arn,
        "${var.dynamodb_table_arn}/index/*"
      ]
    }]
  })
}
```

### Cognito モジュール (main.tf)

```hcl
resource "aws_cognito_user_pool" "main" {
  name = "${var.project}_${var.environment}_users"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = true  # 招待制
  }

  tags = {
    Name = "${var.project}_${var.environment}_user_pool"
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project}_${var.environment}_web_client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}
```

### DynamoDB モジュール (main.tf)

```hcl
resource "aws_dynamodb_table" "reports" {
  name         = "${var.project}_${var.environment}_reports"
  billing_mode = "PAY_PER_REQUEST"  # コスト最小化
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "report_type"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  global_secondary_index {
    name            = "reports-by-date"
    hash_key        = "report_type"
    range_key       = "created_at"
    projection_type = "ALL"
  }

  tags = {
    Name = "${var.project}_${var.environment}_reports"
  }
}
```

### 依存関係図

```
networking (既存)

cognito (新規) ─────────────────┐
dynamodb (新規) ────────────────┤
    ↓                           ↓
ecs (既存・変更なし)        amplify (新規)
    ↓                       │  ├── IAMロール → DynamoDBアクセス
scheduler (既存)            │  ├── Cognito認証統合
                            │  └── git push → 自動ビルド → SSG + DynamoDB同期
                            ↓
                        CloudFront (Amplify管理)
```

**重要: `backend/` への変更は不要。** パイプラインは既存のままgit pushするだけで、Amplifyビルド時にNext.jsがCSV/MDを読み込みDynamoDBに同期する。

## 外部統合

### 新規依存ライブラリ (frontend のみ)

| ライブラリ | 用途 | バージョン |
|-----------|------|---------|
| next | フレームワーク | 15.x |
| react / react-dom | UIライブラリ | 19.x |
| tailwindcss | CSSフレームワーク | 4.x |
| @tailwindcss/typography | Markdownスタイリング | 0.5.x |
| react-markdown | Markdownレンダリング | 9.x |
| remark-math | 数式構文解析 | 6.x |
| remark-gfm | GFM対応 | 4.x |
| rehype-katex | KaTeX数式レンダリング | 7.x |
| rehype-pretty-code | コードハイライト | 0.14.x |
| rehype-sanitize | XSS対策 | 6.x |
| @aws-amplify/ui-react | Cognito UIコンポーネント | 6.x |
| aws-amplify | Amplify SDK | 6.x |
| @aws-sdk/client-dynamodb | DynamoDB クライアント | 3.x |
| @aws-sdk/lib-dynamodb | DynamoDB Document クライアント | 3.x |
| @fontsource/noto-sans-jp | 日本語フォント | variable |
| next-themes | テーマ切替 | 0.4.x |
| tsx | ビルドスクリプト実行 | 4.x |
