# Markdown Pages — 実装ステップ

## 実装順序

Backend-first（コンテンツ処理 → UI → インフラ）の順序で進める。

---

## Step 1: コンテンツ処理ライブラリ作成

**ターゲット**: frontend (lib)
**依存**: なし

### 概要
`docs/` 配下のMarkdownファイルを再帰的にスキャンし、ツリー構造・slug一覧・コンテンツ取得を行うライブラリを新規作成する。

### 作業項目
- [ ] `src/lib/docs-content.ts` を新規作成
- [ ] `getDocsTree(basePath)` — ディレクトリツリー構造を再帰生成
- [ ] `getAllDocsSlugs(basePath)` — 全Markdownのslug配列リストを返却 (generateStaticParams用)
- [ ] `getDocContent(slug)` — slugからMarkdown本文+メタデータ取得
- [ ] `getBreadcrumbs(slug)` — パンくずデータ生成
- [ ] `isDirectory(slug)` — ディレクトリ判定
- [ ] `TreeNode` 型定義 (`name`, `path`, `children`, `isDirectory`, `isMarkdown`)

### 対象ファイル
- `frontend/src/lib/docs-content.ts` (新規)

### 完了条件
- docs/research/ と docs/daily/ 両方のディレクトリを正しくスキャンできる
- 深いネスト構造（例: `docs/research/cate/metalearner/metalearner.md`）に対応
- Markdownファイルのメタデータ（タイトル、著者等）を抽出できる
- ユニットテストが通る

---

## Step 2: catch-allルーティング + ページコンポーネント

**ターゲット**: frontend (app)
**依存**: Step 1

### 概要
`[[...slug]]` catch-allルートを作成し、Markdownページとディレクトリインデックスページの両方を表示する。

### 作業項目
- [ ] `src/app/(authenticated)/docs/[[...slug]]/page.tsx` を新規作成
- [ ] `generateStaticParams()` で全slugを生成
- [ ] `generateMetadata()` でページタイトルを動的設定
- [ ] slugがディレクトリの場合 → `DirectoryIndex` コンポーネント表示
- [ ] slugがMarkdownの場合 → `MarkdownRenderer` + ToC表示
- [ ] slugが空（`/docs/`）の場合 → トップページ（research/daily のルートインデックス）

### 対象ファイル
- `frontend/src/app/(authenticated)/docs/[[...slug]]/page.tsx` (新規)

### 完了条件
- `/docs/` でトップページが表示される
- `/docs/research/cate/metalearner` でMarkdownが正しくレンダリングされる
- `/docs/daily/legal_tech` でファイル一覧が表示される
- 存在しないパスで404が返る

---

## Step 3: サイドバーツリーナビゲーション

**ターゲット**: frontend (components)
**依存**: Step 1

### 概要
ディレクトリ構造をツリー形式で表示するサイドバーコンポーネントを作成する。

### 作業項目
- [ ] `src/components/docs/directory-tree.tsx` を新規作成
  - 展開/折りたたみ操作
  - 現在のページをハイライト
  - Markdownファイルはリンクとして表示
  - ディレクトリはフォルダアイコン付きで展開可能
- [ ] `src/components/docs/mobile-nav.tsx` を新規作成
  - モバイル用ドロワーナビゲーション
  - ハンバーガーメニューまたはFABからオープン

### 対象ファイル
- `frontend/src/components/docs/directory-tree.tsx` (新規)
- `frontend/src/components/docs/mobile-nav.tsx` (新規)

### 完了条件
- ツリーが正しく展開/折りたたみできる
- 現在ページがハイライトされる
- モバイルでドロワーナビが動作する

---

## Step 4: パンくずリスト + レイアウト統合

**ターゲット**: frontend (components)
**依存**: Step 2, Step 3

### 概要
パンくずナビゲーションと3カラムレイアウトを作成し、全体を統合する。

### 作業項目
- [ ] `src/components/docs/breadcrumbs.tsx` を新規作成
  - slugからパンくず要素を生成
  - 各要素がリンクとして機能
  - 最後の要素は現在ページ（リンクなし）
- [ ] `src/components/docs/docs-layout.tsx` を新規作成
  - 左: サイドバーツリー (240px, sticky)
  - 中: メインコンテンツ (flex-1)
  - 右: ToC (200px, sticky, Markdownページのみ表示)
  - モバイル: 1カラム + FABでナビ/ToC切替
- [ ] `src/components/docs/directory-index.tsx` を新規作成
  - ディレクトリ内のファイル・サブディレクトリをカード形式で一覧

### 対象ファイル
- `frontend/src/components/docs/breadcrumbs.tsx` (新規)
- `frontend/src/components/docs/docs-layout.tsx` (新規)
- `frontend/src/components/docs/directory-index.tsx` (新規)

### 完了条件
- 3カラムレイアウトが正しく表示される
- パンくずの各要素がクリックで遷移する
- ディレクトリインデックスがファイル一覧を正しく表示する
- レスポンシブ対応（モバイルで1カラム化）

---

## Step 5: Mermaidダイアグラム対応

**ターゲット**: frontend (components)
**依存**: Step 2

### 概要
Mermaid記法のコードブロックをダイアグラムとしてブラウザ上でレンダリングする。

### 作業項目
- [ ] `mermaid` パッケージをインストール
- [ ] `src/components/markdown/mermaid-diagram.tsx` を新規作成
  - `'use client'` コンポーネント
  - `useEffect` + dynamic import (`import('mermaid')`)
  - ダークモード対応（テーマ切替追従）
- [ ] `MarkdownRenderer` を更新
  - `components` propに `code` カスタムコンポーネントを追加
  - `language-mermaid` クラスの場合に `<MermaidDiagram>` を描画

### 対象ファイル
- `frontend/src/components/markdown/mermaid-diagram.tsx` (新規)
- `frontend/src/components/markdown/markdown-renderer.tsx` (変更)

### 完了条件
- ````mermaid` コードブロックが図として表示される
- ダークモードでも正しく描画される
- mermaidが遅延ロードされ、初期バンドルサイズに影響しない

---

## Step 6: 既存コード削除・クリーンアップ

**ターゲット**: frontend (cross-cutting)
**依存**: Step 2, Step 3, Step 4, Step 5 (全ステップ完了後)

### 概要
既存のレポートビューアを削除し、新しいMarkdown Pagesに完全に置き換える。

### 作業項目
- [ ] `src/app/(authenticated)/page.tsx` を更新 → `/docs/` へリダイレクトまたはトップページ統合
- [ ] `src/app/(authenticated)/[domain]/` ディレクトリを削除
- [ ] `src/app/api/reports/route.ts` を削除
- [ ] `src/lib/content.ts` を削除 (docs-content.tsに置き換え済み)
- [ ] `src/lib/metadata.ts` を削除 (CSV連携不要)
- [ ] `frontend/scripts/sync-dynamodb.ts` を削除
- [ ] `@aws-sdk/client-dynamodb` パッケージを削除
- [ ] 不要なimport・型定義のクリーンアップ

### 対象ファイル
- 上記削除対象ファイル
- `frontend/package.json` (DynamoDB SDK削除)

### 完了条件
- 既存の `[domain]/[slug]` ルートが完全に削除されている
- DynamoDB関連のコードが全て除去されている
- ビルドが成功する
- 全テストが通る

---

## Step 7: インフラ更新

**ターゲット**: infra
**依存**: Step 6

### 概要
Terraform設定を更新し、不要なインフラリソースを削除する。

### 作業項目
- [ ] `infra/modules/amplify/main.tf` のビルドスペックを更新
  - preBuildに `cp -r ../docs ./docs` を追加
  - `sync-dynamodb.ts` 実行を削除
- [ ] `infra/modules/amplify/main.tf` のAmplify環境変数を整理
  - `DYNAMODB_TABLE_NAME` を削除
- [ ] `infra/modules/dynamodb/` モジュールを削除
- [ ] `infra/main.tf` からDynamoDBモジュール参照を削除
- [ ] `infra/variables.tf` / `infra/outputs.tf` からDynamoDB関連の変数・出力を削除
- [ ] `terraform plan` で差分確認

### 対象ファイル
- `infra/modules/amplify/main.tf` (変更)
- `infra/modules/dynamodb/` (削除)
- `infra/main.tf` (変更)
- `infra/variables.tf` (変更)
- `infra/outputs.tf` (変更)

### 完了条件
- `terraform plan` がクリーンに実行される
- Amplifyビルドスペックにdocsコピーが含まれている
- DynamoDB関連のリソースが全て削除されている
- `terraform validate` が成功する

---

## Step 8: CI/CDパイプライン更新

**ターゲット**: CI/CD
**依存**: Step 6, Step 7

### 概要
GitHub Actionsのフロントエンドビルドがdocs/の存在を前提として動作するよう更新する。

### 作業項目
- [ ] `.github/workflows/ci-frontend.yml` を更新
  - ビルドステップでdocs/をfrontend/にコピーする処理を追加
  - トリガーパスに `docs/**` を追加（docs変更時もCIを実行）
- [ ] ローカルビルド確認用スクリプトを更新

### 対象ファイル
- `.github/workflows/ci-frontend.yml` (変更)

### 完了条件
- docs/の変更を含むPRでフロントエンドCIが実行される
- ビルドが成功する

---

## 並行可能なタスク

```
Step 1 (コンテンツライブラリ)
  ├── Step 2 (ルーティング)      ← Step 1に依存
  │     └── Step 5 (Mermaid)     ← Step 2に依存
  └── Step 3 (サイドバー)        ← Step 1に依存
        └── Step 4 (レイアウト統合) ← Step 2, 3に依存
              └── Step 6 (クリーンアップ) ← 全UIステップに依存
                    ├── Step 7 (インフラ) ← Step 6に依存
                    └── Step 8 (CI/CD)   ← Step 6に依存 (7と並行可)
```
