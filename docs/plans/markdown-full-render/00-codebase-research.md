# Markdownフルレンダリング — コードベース調査

## 詳細コードベース分析

### 1. MarkdownRenderer コンポーネント
- **ファイル**: `frontend/src/components/markdown/markdown-renderer.tsx` (94行)
- **現在の実装**:
  - `react-markdown` v9.0.3 をベースに使用
  - remarkプラグイン: `remark-math`（数式パース）、`remark-gfm`（GFMテーブル、取り消し線）
  - rehypeプラグイン: `rehype-katex`（数式レンダリング）、`rehype-sanitize`（セキュリティ）
- **重要な問題**: `rehype-sanitize` が `rehype-katex` の **後に** 実行されるため、KaTeXが生成するHTML要素の一部がサニタイズされて削除される可能性がある。カスタムスキーマで一部のKaTeX要素は許可されているが、全てをカバーしていない可能性がある。
- **未使用の依存**: `rehype-pretty-code` v0.14.0 と `shiki` v3.0.0 が `package.json` にあるが、`MarkdownRenderer` に組み込まれていない → **コードシンタックスハイライトが無効**
- **カスタムコンポーネント**: `table`（横スクロール）、`pre`（横スクロール）、`img`（遅延読み込み）のみ

### 2. レポート表示ページ
- **ファイル**: `frontend/src/app/(authenticated)/[domain]/[slug]/page.tsx` (88行)
- **データフロー**:
  1. `getReportContent(file.filePath)` でMarkdownファイルを読み込み
  2. `extractTitle(content)` で最初のH1見出しを取得
  3. `extractMetadata(content)` でメタデータ（Authors, Year, Venue, Link）を抽出
  4. `extractTocItems(content)` でH2/H3見出しからTOCを生成
  5. `content.replace(/^#\s+.+$/m, "").trim()` でH1を削除
  6. `<MarkdownRenderer content={bodyContent} />` でレンダリング
- **問題点**: H1の除去ロジックは正常だが、メタデータ行（`- **Authors**: ...`形式）は `bodyContent` に残ったままレンダリングされる

### 3. コンテンツ読み込み（lib/content.ts）
- **ファイル**: `frontend/src/lib/content.ts` (81行)
- **ドキュメントルート**: `docs/` ディレクトリ（プロジェクトルートからの相対パス）
- **読み込みパス**:
  - `docs/daily/{domain}/report/*.md`
  - `docs/research/{domain}/report/*.md`
- **`extractMetadata()`** (67-81行): ダッシュ形式（`- **Key**: Value`）のメタデータを抽出。`link`キーが見つかり、次にH2が来たら停止する
- **制限**: ファイル全体を `readFileSync` で読み込むため、大きなファイルでも問題なし

### 4. TOC（目次）
- **ファイル**: `frontend/src/lib/toc.ts` (25行)
- H2/H3見出しのみ抽出（H4以下は非対応）
- ID生成: テキストを小文字化し、非単語文字をハイフンに変換（日本語対応あり）

### 5. スタイリング
- **ファイル**: `frontend/src/styles/globals.css` (73行)
- Tailwind CSS v4.1 + `@tailwindcss/typography` の `prose` クラスを使用
- `.prose` に `max-width: 65ch` 設定あり（ただし `max-w-none` で上書き済み）
- KaTeX数式: `.prose .katex-display` に `overflow-x: auto` のみ
- コードブロック: シンタックスハイライト用CSSなし

### 6. レイアウト（layout.tsx）
- KaTeX CSS (`katex/dist/katex.min.css`) をグローバルにインポート済み
- Noto Sans JP フォントを使用

## 技術的制約

1. **rehype-sanitizeとrehype-katexの競合**: サニタイズがKaTeX出力を削除する可能性 → プラグイン順序の見直しが必要
2. **コードハイライト未実装**: `rehype-pretty-code` + `shiki` が依存関係にあるが未使用
3. **静的生成**: `generateStaticParams` + `standalone` output → ビルド時にMarkdownをレンダリング
4. **セキュリティ**: `rehype-sanitize` は必須だが、許可リストの拡張が必要

## 主要な発見事項

| 問題 | 影響 | 優先度 |
|------|------|--------|
| rehype-sanitizeがKaTeX出力を破壊する可能性 | 数式が正しく表示されない | 高 |
| コードシンタックスハイライトが無効 | コードブロックが読みにくい | 高 |
| メタデータ行がbody内に残る | 冗長な表示 | 中 |
| KaTeX CSSスタイリングが最小限 | 数式の見栄えが悪い | 中 |
| Mermaidダイアグラム非対応 | 図表が表示されない | 低 |
| H4以下の見出しがTOCに含まれない | ナビゲーション不完全 | 低 |
