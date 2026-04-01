# Markdownフルレンダリング — アーキテクチャ設計

## 全体構成図

```
[domain]/[slug]/page.tsx (Server Component)
  ├── getReportContent() → Markdown全文読み込み
  ├── extractTitle() → H1タイトル抽出
  ├── extractMetadata() → メタデータ抽出
  ├── extractTocItems() → TOC抽出 (H2-H6に拡張)
  │
  ├── <ReportHeader /> → タイトル・メタデータ表示
  ├── <MarkdownRenderer /> (Client Component)
  │     ├── ReactMarkdown
  │     │   ├── remarkPlugins: [remarkMath, remarkGfm]
  │     │   ├── rehypePlugins: [rehypeKatex, rehypePrettyCode]  ← sanitize撤去, pretty-code追加
  │     │   └── components: { pre, code, table, img, figure }   ← カスタムコンポーネント
  │     │
  │     ├── <CodeBlock />     ← 新規: コピーボタン・言語ラベル
  │     ├── <MermaidBlock />  ← 新規: mermaid.js遅延ロード
  │     └── <ImageWithCaption /> ← 新規: figcaption対応
  │
  ├── <Toc />       → 拡張: H4-H6対応、階層インデント
  └── <MobileToc /> → 既存活用（Toc拡張が自動反映）
```

## フロントエンド設計

### 1. MarkdownRenderer リファクタリング

**ファイル**: `frontend/src/components/markdown/markdown-renderer.tsx`

#### 変更点
- `rehype-sanitize`を完全に撤去（import、sanitizeSchema、rehypePlugins配列から削除）
- `rehype-pretty-code`をrehypePluginsに追加（shikiのgithub-dark/github-lightテーマ設定）
- カスタムコンポーネントマッピングの拡張

#### 新しいプラグイン構成

```typescript
// 変更前
remarkPlugins={[remarkMath, remarkGfm]}
rehypePlugins={[rehypeKatex, [rehypeSanitize, sanitizeSchema]]}

// 変更後
remarkPlugins={[remarkMath, remarkGfm]}
rehypePlugins={[
  rehypeKatex,
  [rehypePrettyCode, {
    theme: { dark: "github-dark", light: "github-light" },
    keepBackground: true,
  }],
]}
```

#### カスタムコンポーネントマッピング拡張

```typescript
components={{
  pre: CodeBlock,         // 新規コンポーネント
  code: InlineCode,       // インラインコードとブロックコードの分離
  table: ResponsiveTable, // 既存ラッパー維持
  img: ImageWithCaption,  // 新規: figcaption対応
  figure: Figure,         // 新規: figure要素対応
}}
```

### 2. 新規コンポーネント

#### CodeBlock (`frontend/src/components/markdown/code-block.tsx`)

```
┌──────────────────────────────────────┐
│ python                     [Copy]    │  ← 言語ラベル + コピーボタン
├──────────────────────────────────────┤
│ def hello():                         │
│     print("Hello, World!")           │  ← Shikiによるシンタックスハイライト
│                                      │
└──────────────────────────────────────┘
```

- rehype-pretty-codeが生成する`<pre>`要素をラップ
- `data-language`属性から言語名を取得して表示
- コピーボタン（クリップボードAPI）
- ダーク/ライトテーマ自動切り替え
- オーバーフロー時の横スクロール

#### MermaidBlock (`frontend/src/components/markdown/mermaid-block.tsx`)

```
┌──────────────────────────────────────┐
│  ┌───────┐    ┌───────┐             │
│  │ Start │───▶│ End   │             │  ← mermaid.js SVG出力
│  └───────┘    └───────┘             │
│                                      │
└──────────────────────────────────────┘
```

- `"use client"`コンポーネント
- `code`要素のclassName/data-languageが`mermaid`の場合に検出
- `mermaid`パッケージを`dynamic import`で遅延ロード
- `securityLevel: 'strict'`設定
- `useTheme()`フックでダークモード連動（`theme: 'dark'`/`'default'`）
- レンダリング前のローディングスケルトン表示
- `useEffect`内でSVGレンダリング実行

#### ImageWithCaption (`frontend/src/components/markdown/image-with-caption.tsx`)

```
┌──────────────────────────────────────┐
│                                      │
│            [画像]                     │  ← lazy loading
│                                      │
├──────────────────────────────────────┤
│  図1: システム構成図                   │  ← alt属性をキャプションとして表示
└──────────────────────────────────────┘
```

- `alt`テキストが存在する場合、`<figure>` + `<figcaption>`でラップ
- 既存の`lazy loading`、`max-w-full`、`rounded`を維持

### 3. TOC拡張

**ファイル**: `frontend/src/lib/toc.ts`

#### 変更点

```typescript
// 変更前: H2/H3のみ
const match = line.match(/^(#{2,3})\s+(.+)$/);

// 変更後: H2-H6
const match = line.match(/^(#{2,6})\s+(.+)$/);
```

**ファイル**: `frontend/src/components/report/toc.tsx`

#### 変更点
- IntersectionObserverのクエリセレクタを`h2[id], h3[id], h4[id], h5[id], h6[id]`に拡張
- インデントを`(item.level - 2) * 12px`から、H4以下は追加インデント
- H4以下のフォントサイズをやや小さく（`text-xs`）

### 4. CSS拡張

**ファイル**: `frontend/src/styles/globals.css`

追加するスタイル:

```css
/* rehype-pretty-code テーマ */
[data-rehype-pretty-code-figure] pre {
  overflow-x: auto;
  border-radius: 0.5rem;
  padding: 1rem;
}

[data-rehype-pretty-code-figure] code {
  display: grid;
}

[data-rehype-pretty-code-figure] [data-line] {
  padding: 0 1rem;
}

/* コードブロック ヘッダー */
[data-rehype-pretty-code-title] {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-bottom: 1px solid;
  border-color: var(--color-code-border);
}

/* ダーク/ライト テーマ切り替え */
html[class~="dark"] [data-rehype-pretty-code-figure] pre {
  /* github-dark テーマ */
}
html:not([class~="dark"]) [data-rehype-pretty-code-figure] pre {
  /* github-light テーマ */
}

/* KaTeX 改善 */
.prose .katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.75rem 0;
  margin: 1rem 0;
}

.prose .katex-display > .katex {
  white-space: nowrap;
}

@media (max-width: 767px) {
  .prose .katex-display {
    font-size: 0.85em;
  }
}

/* Mermaid */
.mermaid-container {
  overflow-x: auto;
  text-align: center;
  margin: 1.5rem 0;
}

.mermaid-container svg {
  max-width: 100%;
  height: auto;
}

/* 脚注 */
.prose section[data-footnotes] {
  border-top: 1px solid;
  margin-top: 2rem;
  padding-top: 1rem;
  font-size: 0.875em;
}
```

### 5. レイアウト全面リデザイン

**ファイル**: `frontend/src/app/(authenticated)/[domain]/[slug]/page.tsx`

```
┌──────────────────────────────────────────────────┐
│  Header (sticky)                                  │
├──────────────────────────────────────────────────┤
│  パンくず: ホーム / ドメイン / タイトル             │
├──────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────┐ ┌────────────────┐  │
│  │  ReportHeader            │ │ TOC (sticky)   │  │
│  │  ──────────────────────  │ │ ・ 見出し2     │  │
│  │                          │ │   ・ 見出し3   │  │
│  │  Markdown Content        │ │     ・ 見出し4 │  │
│  │  ├ 数式 (KaTeX)          │ │ ・ 見出し2     │  │
│  │  ├ コード (Shiki)        │ │   ・ 見出し3   │  │
│  │  ├ Mermaid図表           │ │                │  │
│  │  ├ テーブル              │ │                │  │
│  │  ├ 画像+キャプション      │ │                │  │
│  │  └ 脚注                  │ │                │  │
│  │                          │ │                │  │
│  └──────────────────────────┘ └────────────────┘  │
│                                                    │
└──────────────────────────────────────────────────┘
```

- メインコンテンツ領域の幅を拡張（`max-w-5xl` → `max-w-6xl`）
- TOCサイドバーの幅を`220px` → `260px`に拡張（H4以下の階層表示に対応）
- グリッド比率: `lg:grid-cols-[1fr_260px]`

## データモデル

### TocItem（既存の型を拡張不要）

```typescript
// 型は変更なし。levelの範囲が2-3から2-6に拡張
type TocItem = {
  id: string;
  text: string;
  level: number; // 2-6
};
```

### データフロー（変更なし）

```
docs/*.md → fs.readFileSync → content (string)
  → extractTitle() → title
  → extractMetadata() → metadata
  → extractTocItems() → tocItems (H2-H6に拡張)
  → bodyContent → MarkdownRenderer → ReactMarkdown → HTML
```

## ファイル構成（変更後）

```
frontend/src/
├── components/
│   ├── markdown/
│   │   ├── markdown-renderer.tsx  # 変更: sanitize撤去、pretty-code追加、コンポーネントマッピング
│   │   ├── code-block.tsx         # 新規: コピーボタン・言語ラベル付きコードブロック
│   │   ├── mermaid-block.tsx      # 新規: mermaid.js遅延ロードレンダリング
│   │   └── image-with-caption.tsx # 新規: figcaption対応画像
│   ├── report/
│   │   ├── report-card.tsx        # 変更なし
│   │   ├── report-header.tsx      # 変更なし
│   │   ├── toc.tsx                # 変更: H4-H6対応、IntersectionObserver拡張
│   │   └── mobile-toc.tsx         # 変更なし（Toc拡張が自動反映）
│   ├── layout/
│   │   └── header.tsx             # 変更なし
│   └── auth/
│       ├── auth-provider.tsx      # 変更なし
│       └── auth-guard.tsx         # 変更なし
├── lib/
│   ├── content.ts                 # 変更なし
│   ├── toc.ts                     # 変更: H2-H6抽出に拡張
│   ├── metadata.ts                # 変更なし
│   └── utils.ts                   # 変更なし
├── styles/
│   └── globals.css                # 変更: コードテーマ、数式、Mermaid、脚注CSS追加
└── app/
    └── (authenticated)/
        ├── layout.tsx             # 変更: max-w-6xl化（検討）
        └── [domain]/
            └── [slug]/
                └── page.tsx       # 変更: TOCサイドバー幅拡張
```

## 外部依存関係

### 既存（変更なし）
- `react-markdown` ^9.0.3
- `remark-gfm` ^4.0.0
- `remark-math` ^6.0.0
- `rehype-katex` ^7.0.1
- `katex` ^0.16.21

### 既存（有効化）
- `rehype-pretty-code` ^0.14.0 → MarkdownRendererに組み込み
- `shiki` ^3.0.0 → rehype-pretty-codeの依存として使用

### 撤去
- `rehype-sanitize` ^6.0.0 → rehypePluginsから削除（package.jsonからも削除可能）

### 新規追加
- `mermaid` ^11.x → Mermaidダイアグラムのクライアントサイドレンダリング

## セキュリティ考慮事項

- **rehype-sanitize撤去のリスク**: コンテンツはClaude CLIが生成するため、XSSリスクは低い。ユーザーが直接Markdownを編集・投稿する機能はない
- **Mermaid XSS対策**: `securityLevel: 'strict'`を明示的に設定
- **CSPメタタグ**: 補助的な防御として将来的に追加を検討（今回のスコープ外）
