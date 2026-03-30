# Markdownウェブビューア — Web技術リサーチ

## AWS Amplify Gen 2 + Next.js

- Next.js 12〜15 サポート、Node.js 20/22 必須
- SSR: S3 + CloudFront + Lambda@Edge で自動デプロイ
- ISR サポートあり（On-Demand ISR は未サポート）
- 画像最適化: Next.js 13+ で自動動作（Sharp）
- ビルド出力最大: 220MB
- 無料枠: ビルド1,000分/月、CDN 5GB、転送15GB/月、SSR 500,000リクエスト/月

Sources:
- https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html
- https://aws.amazon.com/amplify/pricing/

## Markdownレンダリングライブラリ

| ライブラリ | 長所 | 短所 | 推奨用途 |
|-----------|------|------|---------|
| **react-markdown v9** | 軽量、純粋Markdown対応 | MDX非対応 | 外部ソースからのMarkdown（推奨） |
| **@next/mdx v3** | Next.js公式、RSC対応 | ローカルファイルのみ | ローカルMDXファイル |
| **Velite v0.2** | Zod型安全、ビルド時パース | 比較的新しい | コンテンツ管理 |
| **Fumadocs v16** | RSC対応、全文検索内蔵 | 学習コスト | ドキュメントサイト |

**推奨パイプライン**: remark-parse → remark-rehype → rehype-sanitize → rehype-stringify
**シンタックスハイライト**: rehype-pretty-code（Shiki ベース）

## モバイルファーストMarkdownスタイリング

**推奨**: @tailwindcss/typography の `prose` クラス
```
className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert"
```

- テーブル: `overflow-x: auto` で水平スクロール
- コードブロック: `overflow-x: auto` + フォントサイズ85-90%
- ブレイクポイント: mobile / tablet(768px) / desktop(1024px)

## 類似OSSプロジェクト

### Nextra 4 — https://nextra.site/
- Next.js App Router専用、MDX 3、Pagefind全文検索
- レスポンシブレイアウト、サイドバー折りたたみ、TOC自動生成
- **参考になるパターン**: ファイルシステムベースのルーティング、ビルド時コンテンツ処理

### Fumadocs 16 — https://www.fumadocs.dev/
- React Server Components、軽量・高速
- **参考になるパターン**: Content Collections、カスタムsource対応

### Outline — https://github.com/outline/outline
- React + Node.js、全文検索、公開共有機能
- **参考になるパターン**: モバイル対応のレスポンシブUI（ただしオーバースペック）

### パターン比較

| 観点 | 本プロジェクト | Nextra | Fumadocs | 推奨 |
|------|-------------|--------|----------|------|
| コンテンツソース | Gitリポジトリ内MD | ローカルMDX | 複数ソース対応 | ビルド時ファイル読み込み |
| レンダリング | react-markdown | MDX 3 | MDX + RSC | react-markdown（シンプル） |
| 検索 | Pagefind | Pagefind | Flexsearch | Pagefind |
| モバイルUI | カスタム | 組み込み | 組み込み | Tailwind CSS + カスタム |

## Gitベースコンテンツソース

| 方式 | 長所 | 短所 | 推奨度 |
|------|------|------|--------|
| **ビルド時ファイル読み込み** | 最速、型安全 | リビルド必要 | 最推奨 |
| **GitHub API** | リアルタイム更新 | レート制限 | 補助的に使用 |
| **Git Submodule** | リポジトリ分離 | CI/CD複雑化 | 不要 |

## 日本語モバイルタイポグラフィ

- **フォント**: Noto Sans JP（Fontsourceセルフホスト）、ウェイト400+700
- **フォールバック**: `'Noto Sans JP', 'Yu Gothic UI', 'Hiragino Sans', sans-serif`
- **本文サイズ**: モバイル15px、デスクトップ16px（ラテン文字比10-15%縮小）
- **行間**: `line-height: 1.8`（CJK推奨値）
- **字間**: `letter-spacing: 0.05em`
- **1行文字数**: 15〜35文字（30文字前後が最適）
- **イタリック体は使用しない** — font-weightや括弧で代替

Sources:
- https://www.aqworks.com/blog/perfect-japanese-typography
- https://fontsource.org/fonts/noto-sans-jp/install

## 推奨技術スタック

| レイヤー | 推奨技術 | バージョン |
|---------|---------|---------|
| フレームワーク | Next.js (App Router) | v15.x |
| ホスティング | AWS Amplify Gen 2 | - |
| Markdownレンダリング | react-markdown + remark/rehype | v9.x |
| シンタックスハイライト | rehype-pretty-code (Shiki) | v0.14.x |
| CSS | Tailwind CSS + @tailwindcss/typography | v4.x |
| 日本語フォント | Noto Sans JP (Fontsource) | variable |
| 全文検索 | Pagefind | v1.x |
| 数式レンダリング | remark-math + rehype-katex | - |
