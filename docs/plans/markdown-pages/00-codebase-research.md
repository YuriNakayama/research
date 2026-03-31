# Markdown Pages — コードベース調査

## Deep Codebase Analysis

### docs/ ディレクトリ構造

- **対象ファイル**: `docs/research/` と `docs/daily/` 配下の約50件のMarkdownファイル
- **構造**:
  - `docs/daily/{domain}/report/{YYYYMMDD}.md` — 日次自動生成レポート
  - `docs/daily/{domain}/list/{YYYYMMDD}.csv` — メタデータCSV
  - `docs/research/{topic}/{subtopic}/{YYYYMMDD}/{file}.md` — 深掘りリサーチ（ネスト深い）
- **コンテンツフォーマット**: メタデータヘッダ（`- **Key**: Value`形式）、GFMテーブル、LaTeX数式、Mermaid図、コードブロック、画像参照

### フロントエンド (`frontend/`)

- **フレームワーク**: Next.js 15.3.0 (App Router, TypeScript, React 19)
- **ルーティング**: `src/app/(authenticated)/[domain]/[slug]/page.tsx` — 2階層固定構造
- **Markdown処理**: `react-markdown` + `remark-gfm` + `remark-math` + `rehype-katex` + `rehype-pretty-code` + `rehype-sanitize`
- **コンテンツ取得**: `src/lib/content.ts` — `getDomains()`, `getReportFiles()`, `getReportContent()` でファイルシステムからサーバーサイドで取得
- **メタデータ**: `src/lib/metadata.ts` — CSV + Markdownからメタデータ抽出、DynamoDB同期
- **ToC**: `src/lib/toc.ts` — H2/H3見出しからスラグ生成（日本語対応）、Intersection Observerでアクティブ追跡
- **認証**: AWS Cognito + Amplify Auth（AuthGuard でログイン必須）
- **テーマ**: next-themes でダークモード対応
- **静的生成**: `generateStaticParams()` でビルド時にパス生成

#### コンテンツ取得の限界
- `getReportFiles()` は `docs/daily/{domain}/report/` と `docs/research/{domain}/report/` の2箇所のみスキャン
- **docs/researchの深いネスト構造（例: `cate/metalearner/metalearner.md`）に対応していない**
- ドメインリスト `getDomains()` は `docs/daily/` ディレクトリのみ参照

### インフラ (`infra/`)

- **Amplify**: `infra/modules/amplify/main.tf` — WEB_COMPUTE プラットフォーム、mainブランチ自動デプロイ
  - ビルドスペック: `npm ci` → `npx tsx scripts/sync-dynamodb.ts` → `npx next build`
  - `appRoot: frontend`
- **DynamoDB**: `{project}_{env}_reports` テーブル、PK: `DOMAIN#{domain}`, SK: `REPORT#{date}#{slug}`
- **Cognito**: 管理者のみユーザー作成、メール自動検証

### CI/CD

- **フロントエンドCI**: `.github/workflows/ci-frontend.yml` — PR時にtsc + lint + build
- **Amplifyデプロイ**: mainブランチpushで自動トリガー（Amplify側設定）
- **フロントエンド専用のデプロイワークフローは不在** — Amplifyが自動処理

## 技術的制約

1. **ルーティング制約**: 現在の `[domain]/[slug]` は2階層固定。`docs/research/` の深い階層に対応不可
2. **Amplify appRoot**: `frontend` 設定のため、`docs/` の変更がビルドトリガーになるかは `AMPLIFY_DIFF_DEPLOY` 設定次第
3. **認証必須**: AuthGuardで全ページにCognito認証が必要（公開ドキュメントにするか要確認）
4. **DynamoDB依存**: 現在のメタデータ管理はDynamoDB同期が前提
5. **Mermaid未対応**: 現在のMarkdown処理パイプラインでMermaid図はレンダリングされない
6. **`output: 'standalone'`**: 現在のNext.js設定はコンテナ向け。Amplifyとの整合性に注意

## 重要な発見

- **Markdown処理パイプラインは成熟**: react-markdown + remark/rehypeエコシステムが既に構築済み
- **再利用可能なコンポーネント群**: `MarkdownRenderer`, `ReportHeader`, `Toc`, `MobileToc` が利用可能
- **ギャップ**: catch-allルーティング、ディレクトリツリーナビゲーション、Mermaidレンダリングが未実装
- **ゼロコード変更の実現**: `generateStaticParams` がビルド時にファイルシステムスキャンするため、Markdownの追加・変更のみでコンテンツが自動反映される仕組みは実現可能
