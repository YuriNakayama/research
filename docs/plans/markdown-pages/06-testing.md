# Markdown Pages — テスト戦略

## テスト方針

ファイルシステムベースの静的生成であるため、ユニットテスト（コンテンツ処理ロジック）とE2Eテスト（実際のページ表示）を中心にテストする。

## ユニットテスト

### 対象モジュールとテストケース

#### `src/lib/docs-content.ts`

| テストケース | 説明 |
|---|---|
| `getDocsTree` — 正常系 | docs/配下のツリー構造を正しく返す |
| `getDocsTree` — 空ディレクトリ | 空のツリーを返す |
| `getDocsTree` — ネスト5階層 | 深い階層を正しく再帰処理する |
| `getAllDocsSlugs` — 全slugリスト | 全Markdownのslug配列を返す |
| `getAllDocsSlugs` — .md以外のファイル除外 | CSV, 画像等を除外する |
| `getDocContent` — 正常系 | Markdown本文とメタデータを返す |
| `getDocContent` — 存在しないslug | null/エラーを返す |
| `getBreadcrumbs` — パンくず生成 | slugから正しいパンくず配列を生成 |
| `isDirectory` — ディレクトリ判定 | ディレクトリとファイルを正しく判定 |

#### `src/components/markdown/markdown-renderer.tsx`

| テストケース | 説明 |
|---|---|
| Mermaidコードブロック | `language-mermaid` が `MermaidDiagram` に変換される |
| 通常のコードブロック | `language-mermaid` 以外は通常のコード表示 |

### テストツール

- **Jest** + **React Testing Library** (既存設定を使用)
- テスト用のモックファイルシステム（`docs/` のフィクスチャ）

## E2Eテスト

### Playwright テストシナリオ

| # | シナリオ | 手順 | 期待結果 |
|---|---------|------|----------|
| 1 | トップページ表示 | `/docs/` にアクセス | research, dailyのルートディレクトリが表示される |
| 2 | ディレクトリ遷移 | `/docs/research/cate` にアクセス | cate配下のサブディレクトリ・ファイル一覧が表示される |
| 3 | Markdownレンダリング | `/docs/daily/legal_tech/{date}` にアクセス | Markdownが正しくHTMLレンダリングされる |
| 4 | LaTeX数式表示 | 数式を含むページにアクセス | KaTeX数式が正しくレンダリングされる |
| 5 | Mermaidダイアグラム | Mermaid図を含むページにアクセス | SVGダイアグラムが表示される |
| 6 | サイドバーナビゲーション | ツリーノードをクリック | 正しいページに遷移し、現在ページがハイライト |
| 7 | パンくずナビゲーション | パンくずリンクをクリック | 正しい親ディレクトリに遷移する |
| 8 | 目次 (ToC) | 目次リンクをクリック | 対応する見出しにスクロールする |
| 9 | モバイルナビ | モバイルビューポートでナビを開く | ドロワーが開き、ツリーナビが使える |
| 10 | 404ページ | 存在しないパスにアクセス | 404ページが表示される |

### テストデータ

- テスト用フィクスチャディレクトリ: `frontend/tests/fixtures/docs/`
  - 基本的なMarkdownファイル
  - LaTeX数式を含むMarkdown
  - Mermaid図を含むMarkdown
  - ネストされたディレクトリ構造

## ビルドテスト

| テスト | コマンド | 確認内容 |
|--------|---------|----------|
| 型チェック | `tsc --noEmit` | TypeScriptの型エラーなし |
| リント | `next lint` | ESLintエラーなし |
| ビルド | `npx next build` | SSG成功、全ページ生成 |
| ページ数確認 | ビルドログ | 生成されたページ数がMarkdownファイル数+ディレクトリ数と一致 |

## カバレッジ目標

| レイヤー | 目標 |
|----------|------|
| ユニットテスト（docs-content.ts） | 90%以上 |
| コンポーネントテスト | 主要コンポーネントの基本テスト |
| E2E | 上記10シナリオのカバー |
