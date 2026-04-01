# Markdown Pages — アーキテクチャ設計

## 全体構成図

```
┌─────────────────────────────────────────────────────┐
│                    AWS Amplify                       │
│  (mainブランチpush → 自動ビルド・デプロイ)            │
│                                                     │
│  ビルド時:                                           │
│    cp -r ../docs ./docs  ← docs/をfrontend内にコピー │
│    npm ci                                            │
│    npx next build        ← SSG (全ページ静的生成)     │
│                                                     │
│  配信:                                               │
│    静的HTML + JS (CloudFront CDN)                    │
└─────────────────────────────────────────────────────┘
         ↑ push                    ↓ HTTPS
┌────────────────┐       ┌────────────────────────┐
│  Git (main)    │       │  ブラウザ               │
│  docs/         │       │  Cognito認証済みユーザー │
│  frontend/     │       └────────────────────────┘
└────────────────┘
```

## ページレイアウト

### デスクトップ (3カラム)

```
┌──────────────────────────────────────────────────────────┐
│ Header: ロゴ + ナビゲーション + テーマ切替                  │
├──────────────────────────────────────────────────────────┤
│ パンくずリスト: docs > research > cate > metalearner       │
├──────────┬──────────────────────────────┬────────────────┤
│ サイドバー │ メインコンテンツ               │ 目次 (ToC)    │
│ ツリーナビ │ Markdownレンダリング           │ H2/H3見出し   │
│ 展開/折畳 │ or ディレクトリインデックス     │ アクティブ追跡 │
│          │                              │               │
│ 240px    │ flex-1 (min 0)               │ 200px         │
│ sticky   │ overflow-y: auto             │ sticky        │
└──────────┴──────────────────────────────┴────────────────┘
```

### モバイル

```
┌────────────────────────┐
│ Header + ☰ メニュー     │
├────────────────────────┤
│ パンくずリスト           │
├────────────────────────┤
│ メインコンテンツ         │
│ Markdownレンダリング     │
│ or ディレクトリ一覧      │
│                        │
│ [📑 目次] ← FAB        │
│ [📂 ナビ] ← FAB        │
└────────────────────────┘
```

## フロントエンド設計

### ルーティング

```
src/app/
├── layout.tsx                           # ルートレイアウト (テーマ, 認証)
├── login/page.tsx                       # ログインページ (既存維持)
└── (authenticated)/
    ├── layout.tsx                        # 認証ガード + ヘッダー
    └── docs/
        └── [[...slug]]/
            └── page.tsx                  # catch-allページ
```

- `[[...slug]]` で `/docs/` (トップ) から `/docs/research/cate/metalearner` (深い階層) まで全対応
- `generateStaticParams()` でビルド時に全パスを生成
- `dynamicParams = false` で未生成パスは404

### 新規コンポーネント

| コンポーネント | ファイル | 説明 |
|---|---|---|
| `DocsLayout` | `src/components/docs/docs-layout.tsx` | 3カラムレイアウト管理 |
| `DirectoryTree` | `src/components/docs/directory-tree.tsx` | サイドバーツリーナビ (展開/折りたたみ) |
| `Breadcrumbs` | `src/components/docs/breadcrumbs.tsx` | パンくずナビゲーション |
| `DirectoryIndex` | `src/components/docs/directory-index.tsx` | ディレクトリ一覧ページ |
| `MermaidDiagram` | `src/components/markdown/mermaid-diagram.tsx` | Mermaid図描画 (`'use client'`) |
| `MobileNav` | `src/components/docs/mobile-nav.tsx` | モバイル用ドロワーナビ |

### 既存コンポーネント (再利用)

| コンポーネント | 変更 |
|---|---|
| `MarkdownRenderer` | Mermaidコードブロック対応を追加 |
| `Toc` / `MobileToc` | そのまま再利用 |
| `ReportHeader` | メタデータ表示用に再利用 |
| `AuthGuard` / `AuthProvider` | そのまま維持 |

### コンテンツ処理 (`src/lib/`)

| ファイル | 説明 |
|---|---|
| `docs-content.ts` (新規) | docs/配下の再帰スキャン、ツリー構造生成、slugマッピング |
| `content.ts` (削除) | 既存のgetDomains/getReportFiles → docs-content.tsに置き換え |
| `metadata.ts` (削除) | CSV連携を削除、Markdownメタデータのみに簡素化 |
| `toc.ts` (維持) | 目次抽出ロジック、変更なし |

### `docs-content.ts` の主要関数

```typescript
// ディレクトリツリー構造を生成
export function getDocsTree(basePath: string): TreeNode[]

// 全Markdownファイルのslugリストを生成 (generateStaticParams用)
export function getAllDocsSlugs(basePath: string): string[][]

// slugからMarkdownコンテンツを取得
export function getDocContent(slug: string[]): { content: string; metadata: Record<string, string> }

// slugからパンくずデータを生成
export function getBreadcrumbs(slug: string[]): Breadcrumb[]

// slugがディレクトリかファイルかを判定
export function isDirectory(slug: string[]): boolean
```

### Mermaid対応

- `mermaid` ライブラリをdynamic importで遅延ロード
- `react-markdown` の `components` propで `language-mermaid` コードブロックを `<MermaidDiagram>` に置き換え
- `'use client'` コンポーネントで `useEffect` 内でレンダリング

## インフラ変更

### Amplifyビルドスペック更新

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cp -r ../docs ./docs    # ← 追加: docs/をfrontend内にコピー
        - npm ci
    build:
      commands:
        - npx next build          # sync-dynamodb.ts を削除
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - 'node_modules/**/*'
      - '.next/cache/**/*'
```

### 削除対象

| リソース | ファイル | 理由 |
|---|---|---|
| DynamoDBテーブル | `infra/modules/dynamodb/` | ファイルシステムのみに切り替え |
| DynamoDB環境変数 | `infra/modules/amplify/main.tf` | DYNAMODB_TABLE_NAME不要 |
| sync-dynamodb.ts | `frontend/scripts/sync-dynamodb.ts` | DynamoDB同期不要 |
| APIルート | `frontend/src/app/api/reports/route.ts` | DynamoDBクエリ不要 |

### 維持

| リソース | 理由 |
|---|---|
| Cognitoモジュール | 認証を維持 |
| Amplifyモジュール | ビルドスペックのみ更新 |
| その他インフラ (ECS, EFS, ECR, Scheduler等) | バックエンドパイプライン用に維持 |

## データフロー

```
ビルド時:
  docs/ (git) → cp → frontend/docs/ → fs.readdirSync
    → getDocsTree()        → サイドバーツリーデータ (JSON)
    → getAllDocsSlugs()     → generateStaticParams
    → getDocContent(slug)  → react-markdown → 静的HTML

配信時:
  ブラウザ → Amplify CDN → 静的HTML (ランタイム処理なし)
    ※ MermaidのみクライアントサイドJSで描画
```
