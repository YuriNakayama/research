# Markdownウェブビューア — 実装ステップ

## 実装方針

- **優先順序**: インフラ → フロントエンド → 統合
- **粒度**: 中粒度（10ステップ）
- **横断的関心事**: 各ステップのACにセキュリティ・アクセシビリティを含める
- **並列化可能**: Step 1-3（Terraformモジュール群）、Step 5とStep 6（UIとMarkdown）、Step 8とStep 9（バックエンドとCI/CD）

## 依存関係図

```
Step 1 (DynamoDB) ──┐
Step 2 (Cognito) ───┤──▶ Step 3 (Amplify) ──▶ Step 4 (Next.js初期化)
                    │                              ↓
                    │                         Step 5 (認証) ──▶ Step 6 (レイアウト+一覧)
                    │                                                ↓
                    │                              ┌─── Step 7 (Markdownレンダリング)
                    │                              │        ↓
                    │                              │    Step 8 (モバイル最適化+ダークモード)
                    │                              │        ↓
                    └──────────────────────────────▶ Step 9 (DynamoDB同期+API)
                                                        ↓
                                                   Step 10 (CI/CD)
```

---

## Step 1: Terraform DynamoDBモジュール

**ターゲット**: infra
**依存関係**: なし

### 概要
レポートメタデータを格納するDynamoDBテーブルをTerraformモジュールとして作成する。

### 作業項目
- [ ] `infra/modules/dynamodb/main.tf` 作成（テーブル + GSI定義）
- [ ] `infra/modules/dynamodb/variables.tf` 作成（environment, project）
- [ ] `infra/modules/dynamodb/outputs.tf` 作成（table_name, table_arn）
- [ ] `infra/main.tf` にモジュール呼び出しを追加
- [ ] `infra/outputs.tf` にDynamoDB出力を追加

### 対象ファイル（想定）
- `infra/modules/dynamodb/main.tf`
- `infra/modules/dynamodb/variables.tf`
- `infra/modules/dynamodb/outputs.tf`
- `infra/main.tf`
- `infra/outputs.tf`

### 受け入れ基準
- `terraform plan` が成功し、DynamoDBテーブルとGSIが作成される
- PAY_PER_REQUEST課金モデルが設定されている
- 既存モジュールの命名規則（`{project}_{environment}_reports`）に従っている
- default_tagsが適用される

---

## Step 2: Terraform Cognitoモジュール

**ターゲット**: infra
**依存関係**: なし（Step 1と並列可能）

### 概要
認証用のCognito User PoolとApp ClientをTerraformモジュールとして作成する。

### 作業項目
- [ ] `infra/modules/cognito/main.tf` 作成（User Pool, App Client）
- [ ] `infra/modules/cognito/variables.tf` 作成（environment, project）
- [ ] `infra/modules/cognito/outputs.tf` 作成（user_pool_id, app_client_id）
- [ ] `infra/main.tf` にモジュール呼び出しを追加
- [ ] `infra/outputs.tf` にCognito出力を追加

### 対象ファイル（想定）
- `infra/modules/cognito/main.tf`
- `infra/modules/cognito/variables.tf`
- `infra/modules/cognito/outputs.tf`
- `infra/main.tf`
- `infra/outputs.tf`

### 受け入れ基準
- `terraform plan` が成功し、User PoolとApp Clientが作成される
- 招待制（`allow_admin_create_user_only = true`）が設定されている
- パスワードポリシーが適用されている（8文字以上、大小文字+数字）
- SRP認証フローが有効になっている

---

## Step 3: Terraform Amplifyモジュール

**ターゲット**: infra
**依存関係**: Step 1, Step 2

### 概要
AmplifyアプリケーションをTerraformモジュールとして作成し、DynamoDBアクセス権限を持つIAMロールを設定する。

### 作業項目
- [ ] `infra/modules/amplify/main.tf` 作成（App, Branch, IAMロール, IAMポリシー）
- [ ] `infra/modules/amplify/amplify-build-spec.yml` 作成（ビルド設定）
- [ ] `infra/modules/amplify/variables.tf` 作成（environment, project, github_repo, cognito/dynamodb変数）
- [ ] `infra/modules/amplify/outputs.tf` 作成（app_id, default_domain）
- [ ] `infra/main.tf` にモジュール呼び出しを追加（cognito, dynamodb出力を渡す）
- [ ] `infra/outputs.tf` にAmplify出力を追加

### 対象ファイル（想定）
- `infra/modules/amplify/main.tf`
- `infra/modules/amplify/amplify-build-spec.yml`
- `infra/modules/amplify/variables.tf`
- `infra/modules/amplify/outputs.tf`
- `infra/main.tf`
- `infra/outputs.tf`

### 受け入れ基準
- `terraform plan` が成功し、Amplifyアプリ・ブランチ・IAMロールが作成される
- IAMロールにDynamoDBのGetItem/PutItem/Query/Scan/UpdateItem権限がある
- 環境変数にCognito User Pool ID, Client ID, DynamoDBテーブル名が設定される
- `AMPLIFY_MONOREPO_APP_ROOT = "frontend"` が設定されている
- ビルドスペックにDynamoDB同期スクリプトの実行が含まれている

---

## Step 4: Next.jsプロジェクト初期化

**ターゲット**: frontend
**依存関係**: なし（Step 1-3と並列可能だが、Amplifyデプロイ確認にはStep 3が必要）

### 概要
`frontend/` ディレクトリにNext.js App Routerプロジェクトを作成し、Tailwind CSS + shadcn/uiをセットアップする。

### 作業項目
- [ ] `frontend/` にNext.js 15プロジェクトを初期化（App Router, TypeScript）
- [ ] Tailwind CSS v4 + `@tailwindcss/typography` を設定
- [ ] shadcn/ui を初期化し、必要なコンポーネントを追加（Sheet, Card, NavigationMenu, ScrollArea, Button）
- [ ] Noto Sans JPフォントのセットアップ（`@fontsource/noto-sans-jp`）
- [ ] `globals.css` に日本語タイポグラフィ設定を追加
- [ ] `next-themes` でダークモード対応の基盤を設定
- [ ] `amplify.yml` をfrontend/に作成
- [ ] ローカルで `npm run dev` と `npm run build` が成功することを確認

### 対象ファイル（想定）
- `frontend/package.json`
- `frontend/next.config.ts`
- `frontend/tailwind.config.ts`
- `frontend/tsconfig.json`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/styles/globals.css`
- `frontend/amplify.yml`

### 受け入れ基準
- `npm run build` がエラーなしで完了する
- Tailwind CSSの`prose`クラスが適用される
- ダークモード切替が動作する（next-themes）
- 日本語フォント（Noto Sans JP）が正しく読み込まれる
- Amplifyビルドスペックが正しく設定されている

---

## Step 5: Cognito認証実装

**ターゲット**: frontend
**依存関係**: Step 2（Cognito構築済み）, Step 4

### 概要
Amplify Auth (Cognito) を統合し、認証ガードとログインページを実装する。

### 作業項目
- [ ] `aws-amplify` と `@aws-amplify/ui-react` をインストール
- [ ] `src/lib/amplify.ts` にAmplify設定を作成（Cognito User Pool ID, Client ID）
- [ ] `src/components/auth/auth-guard.tsx` を作成（未認証時はログインページへリダイレクト）
- [ ] `src/app/login/page.tsx` にAmplify Authenticator UIを実装
- [ ] `src/app/layout.tsx` にAuthGuardを組み込み
- [ ] Next.js Middlewareで認証トークン検証（API Route保護）

### 対象ファイル（想定）
- `frontend/src/lib/amplify.ts`
- `frontend/src/components/auth/auth-guard.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/middleware.ts`

### 受け入れ基準
- 未認証ユーザーがアクセスするとログインページにリダイレクトされる
- Cognito認証でログイン・ログアウトが正常に動作する
- API Routeが認証なしで呼び出せない
- ログインUIがモバイルでも使いやすい
- 認証トークンがlocalStorageではなくCookieで管理される（XSS対策）

---

## Step 6: レイアウト・レポート一覧ページ

**ターゲット**: frontend
**依存関係**: Step 4, Step 5

### 概要
共通レイアウト（ヘッダー、モバイルナビ、フッター）とトップページ、レポート一覧ページを実装する。初期段階ではファイルシステムからデータを読み込む。

### 作業項目
- [ ] `src/components/layout/header.tsx` 作成（ロゴ、ドメインナビ、テーマ切替、ユーザーメニュー）
- [ ] `src/components/layout/mobile-nav.tsx` 作成（Sheet使用のドロワーメニュー）
- [ ] `src/components/layout/footer.tsx` 作成
- [ ] `src/app/page.tsx` にドメイン一覧カードを実装
- [ ] `src/components/report/report-card.tsx` 作成（タイトル、著者、日付、概要）
- [ ] `src/app/[domain]/page.tsx` にレポート一覧を実装（ファイルシステムから読み込み）
- [ ] `src/lib/content.ts` にMarkdownファイル一覧取得ユーティリティを作成
- [ ] `src/lib/metadata.ts` にCSVメタデータパーサーを作成
- [ ] キーボードナビゲーション対応（a11y）

### 対象ファイル（想定）
- `frontend/src/components/layout/header.tsx`
- `frontend/src/components/layout/mobile-nav.tsx`
- `frontend/src/components/layout/footer.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/app/[domain]/page.tsx`
- `frontend/src/components/report/report-card.tsx`
- `frontend/src/lib/content.ts`
- `frontend/src/lib/metadata.ts`

### 受け入れ基準
- トップページにドメイン一覧が表示される
- ドメインをクリックするとレポート一覧が表示される
- レポートカードにメタデータ（タイトル、著者、年、概要）が表示される
- モバイルでハンバーガーメニューが動作する
- キーボードでナビゲーション可能
- レスポンシブデザインが3ブレイクポイントで正しく表示される

---

## Step 7: Markdownレンダリング・レポート詳細ページ

**ターゲット**: frontend
**依存関係**: Step 6

### 概要
react-markdown + remark/rehypeパイプラインでMarkdownをレンダリングし、レポート詳細ページを実装する。数式、テーブル、コードブロック、画像を正しく表示する。

### 作業項目
- [ ] `react-markdown`, `remark-math`, `remark-gfm`, `rehype-katex`, `rehype-pretty-code`, `rehype-sanitize` をインストール
- [ ] `src/components/markdown/markdown-renderer.tsx` 作成（remark/rehypeパイプライン設定）
- [ ] `src/components/markdown/math-block.tsx` 作成（KaTeX数式レンダリング）
- [ ] `src/components/markdown/code-block.tsx` 作成（Shikiハイライト + コピーボタン）
- [ ] `src/components/markdown/responsive-table.tsx` 作成（横スクロール対応）
- [ ] `src/components/report/toc.tsx` 作成（見出しから目次生成）
- [ ] `src/hooks/use-toc.ts` 作成（見出し抽出 + スクロール位置追従）
- [ ] `src/components/layout/sidebar.tsx` 作成（PC用TOCサイドバー）
- [ ] `src/app/[domain]/[slug]/page.tsx` 作成（SSG + ISR）
- [ ] `src/components/report/report-header.tsx` 作成（メタデータ表示）
- [ ] `src/components/report/report-content.tsx` 作成（本文 + TOC統合）
- [ ] `generateStaticParams` でビルド時にレポートスラッグを列挙
- [ ] rehype-sanitizeの設定でKaTeXのHTML属性を許可

### 対象ファイル（想定）
- `frontend/src/components/markdown/markdown-renderer.tsx`
- `frontend/src/components/markdown/math-block.tsx`
- `frontend/src/components/markdown/code-block.tsx`
- `frontend/src/components/markdown/responsive-table.tsx`
- `frontend/src/components/report/toc.tsx`
- `frontend/src/components/report/report-header.tsx`
- `frontend/src/components/report/report-content.tsx`
- `frontend/src/components/layout/sidebar.tsx`
- `frontend/src/hooks/use-toc.ts`
- `frontend/src/app/[domain]/[slug]/page.tsx`

### 受け入れ基準
- Markdownが正しくHTMLにレンダリングされる
- 数式（`$...$` インライン、`$$...$$` ブロック）がKaTeXで表示される
- GFMテーブルがレンダリングされる
- コードブロックにシンタックスハイライトとコピーボタンが表示される
- 画像が正しく表示される（外部URL含む）
- 目次が見出しから自動生成される
- PCではサイドバーにTOCが表示される
- スクロール位置に応じてTOCのアクティブ項目がハイライトされる
- XSS対策（rehype-sanitize）が適用されている

---

## Step 8: モバイル最適化・ダークモード

**ターゲット**: frontend
**依存関係**: Step 7

### 概要
モバイルでの閲覧体験を最適化し、ダークモードを完成させる。日本語タイポグラフィの調整、テーブル横スクロール、フローティングTOCボタンを実装する。

### 作業項目
- [ ] モバイル用フローティングTOCボタンを実装（Sheet使用のドロワーTOC）
- [ ] テーブル横スクロールの視覚的ヒント追加（影やスクロールインジケーター）
- [ ] コードブロックのモバイルフォントサイズ調整（85-90%）
- [ ] ダークモード対応（`prose-invert`、カスタムカラー設定）
- [ ] テーマ切替ボタンの実装（ヘッダーに配置）
- [ ] `prefers-color-scheme` によるシステム設定連動
- [ ] 日本語タイポグラフィの微調整（line-height, letter-spacing）
- [ ] 画像のレスポンシブ対応（max-width: 100%）
- [ ] Lighthouse Mobile スコアの確認と改善
- [ ] タッチ操作の最適化（タップターゲット48px以上）

### 対象ファイル（想定）
- `frontend/src/styles/globals.css`
- `frontend/src/hooks/use-theme.ts`
- `frontend/src/components/report/toc.tsx`（モバイル対応追加）
- `frontend/src/components/markdown/responsive-table.tsx`（視覚ヒント追加）
- `frontend/src/components/markdown/code-block.tsx`（モバイル調整）

### 受け入れ基準
- モバイルでフローティングTOCボタンからドロワーTOCが開く
- テーブルが横スクロール可能で、スクロール可能であることが視覚的に分かる
- ダークモード切替が動作し、システム設定にも連動する
- `prose-invert` でダークモード時のMarkdownが読みやすい
- Lighthouse Mobileスコア: Performance 90+, Accessibility 90+
- タッチターゲットが48px以上（WCAG 2.1 AA）
- 日本語テキストが15-35文字/行で表示される

---

## Step 9: DynamoDB同期・API Route実装

**ターゲット**: frontend
**依存関係**: Step 1（DynamoDB構築済み）, Step 6

### 概要
ビルド時にCSV/MDメタデータをDynamoDBに同期するスクリプトと、レポート一覧をDynamoDBからクエリするAPI Routeを実装する。

### 作業項目
- [ ] `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb` をインストール
- [ ] `src/lib/dynamodb.ts` にDynamoDB Documentクライアントを作成（サーバーサイド専用）
- [ ] `scripts/sync-dynamodb.ts` 作成（CSV読み込み → DynamoDB upsert）
- [ ] `src/app/api/reports/route.ts` 作成（ドメイン別クエリ、最新一覧、ページネーション）
- [ ] `src/app/[domain]/page.tsx` をAPI Routeからデータ取得するよう変更
- [ ] `amplify.yml` のビルドコマンドに同期スクリプト実行を追加
- [ ] 冪等性の確保（同じレポートの再同期で上書き）
- [ ] エラーハンドリング（DynamoDB接続エラー時のフォールバック）

### 対象ファイル（想定）
- `frontend/src/lib/dynamodb.ts`
- `frontend/scripts/sync-dynamodb.ts`
- `frontend/src/app/api/reports/route.ts`
- `frontend/src/app/[domain]/page.tsx`（データソース変更）
- `frontend/amplify.yml`

### 受け入れ基準
- ビルド時にCSVメタデータがDynamoDBに正しく同期される
- 新規レポートのみ追加され、既存レポートは更新される（冪等性）
- `/api/reports?domain=legal_tech` でドメイン別レポートが返却される
- `/api/reports?type=daily&limit=10` で最新レポートが返却される
- API RouteがCognito認証を要求する
- DynamoDB接続エラー時にファイルシステムフォールバックが動作する
- 同期ログがAmplifyビルドログに出力される

---

## Step 10: CI/CDパイプライン・最終統合

**ターゲット**: 横断的
**依存関係**: Step 1-9 全て

### 概要
フロントエンド用CI/CDパイプラインを構築し、全体の統合テストとデプロイ確認を行う。

### 作業項目
- [ ] `.github/workflows/ci-frontend.yml` 作成（lint, type check, build check）
- [ ] ESLint + Prettier 設定をfrontend/に追加
- [ ] `dev/test-frontend` スクリプト作成（format check → lint → type check → build）
- [ ] `dev/setup` を更新（frontend/の依存インストールを追加）
- [ ] Amplify本番デプロイの確認（main branchへのマージ → 自動ビルド → 反映）
- [ ] Cognito招待制ユーザー作成の確認
- [ ] モバイル実機での最終確認（iOS Safari, Android Chrome）
- [ ] セキュリティヘッダーの確認（CSP, X-Content-Type-Options, X-Frame-Options）
- [ ] HTTPS強制の確認

### 対象ファイル（想定）
- `.github/workflows/ci-frontend.yml`
- `frontend/.eslintrc.json`
- `frontend/.prettierrc`
- `dev/test-frontend`
- `dev/setup`

### 受け入れ基準
- PR時にCIが自動実行され、lint/type check/buildが通る
- main mergeでAmplifyが自動ビルド・デプロイする
- Cognito招待ユーザーでログイン・レポート閲覧が可能
- モバイル実機で全ページが正しく表示される
- セキュリティヘッダーが適切に設定されている
- HTTPS以外でアクセスした場合にリダイレクトされる
