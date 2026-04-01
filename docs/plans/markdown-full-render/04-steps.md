# Markdownフルレンダリング — 実装ステップ

## 実装順序の方針

**コア→コンポーネント→UI**の順序で、中粒度（ファイル単位）で実装する。

```
Phase 1: コア基盤
  Step 1: rehype-sanitize撤去 + rehype-pretty-code有効化
  Step 2: globals.css拡張（コードテーマ・数式・脚注CSS）

Phase 2: コンポーネント（並列可能）
  Step 3: CodeBlockコンポーネント新規作成     ┐
  Step 4: MermaidBlockコンポーネント新規作成   ┘ 並列可能
  Step 5: ImageWithCaptionコンポーネント新規作成

Phase 3: 統合・ナビゲーション（並列可能）
  Step 6: MarkdownRenderer統合（コンポーネントマッピング） ┐
  Step 7: TOC拡張（H4-H6対応）                            ┘ 並列可能

Phase 4: レイアウト・仕上げ
  Step 8: レイアウトリデザイン + 最終調整
```

---

## Step 1: rehype-sanitize撤去 + rehype-pretty-code有効化

**ターゲット**: frontend
**依存関係**: なし

### 概要
MarkdownRendererの基盤を変更する。rehype-sanitizeを撤去してMarkdownの全要素を表示可能にし、rehype-pretty-codeを有効化してシンタックスハイライトを実現する。

### 作業項目
- [ ] `markdown-renderer.tsx`から`rehype-sanitize`関連のimport・sanitizeSchema・rehypePlugins設定を全て削除
- [ ] `rehype-pretty-code`のimportを追加
- [ ] rehypePluginsに`[rehypePrettyCode, { theme: { dark: "github-dark", light: "github-light" }, keepBackground: true }]`を追加
- [ ] `"use client"`ディレクティブの維持確認（react-markdownがクライアントコンポーネント必須のため）
- [ ] `package.json`から`rehype-sanitize`を削除（`npm uninstall rehype-sanitize`）

### 対象ファイル
- `frontend/src/components/markdown/markdown-renderer.tsx` （変更）
- `frontend/package.json` （変更: rehype-sanitize削除）

### 受け入れ条件
- rehype-sanitizeが完全に撤去されている
- rehype-pretty-codeが有効になり、コードブロックにシンタックスハイライトが適用される
- KaTeX数式が正常にレンダリングされる（sanitize撤去により改善）
- 脚注（GFM footnotes）が正常に表示される
- ビルドが成功する

---

## Step 2: globals.css拡張

**ターゲット**: frontend
**依存関係**: Step 1（rehype-pretty-codeのHTML出力構造に依存）

### 概要
rehype-pretty-code、KaTeX、Mermaid、脚注のためのCSSスタイルを追加する。

### 作業項目
- [ ] rehype-pretty-code用CSS追加（`[data-rehype-pretty-code-figure]`セレクタ）
- [ ] コードブロックのダーク/ライトテーマ切り替えCSS
- [ ] KaTeX数式のレスポンシブCSS改善（モバイル対応、overflow処理）
- [ ] 脚注セクションのスタイリング（`section[data-footnotes]`）
- [ ] Mermaidダイアグラム用のコンテナCSS（`.mermaid-container`）
- [ ] figcaptionのスタイリング

### 対象ファイル
- `frontend/src/styles/globals.css` （変更）

### 受け入れ条件
- コードブロックがダーク/ライトモードで適切な配色で表示される
- 長い数式がモバイルで横スクロール可能
- 脚注セクションが視覚的に本文と区別される
- コードブロック内のテキストが読みやすいフォントサイズ・行間で表示される

---

## Step 3: CodeBlockコンポーネント新規作成

**ターゲット**: frontend
**依存関係**: Step 1（rehype-pretty-codeの出力するHTML構造に依存）
**並列可能**: Step 4と並列

### 概要
rehype-pretty-codeが生成する`<pre>`要素をラップし、言語ラベル表示とコピーボタンを追加するコンポーネントを作成する。

### 作業項目
- [ ] `code-block.tsx`を新規作成
- [ ] rehype-pretty-codeが付与する`data-language`属性から言語名を取得・表示
- [ ] クリップボードAPIを使用したコピーボタン実装（`navigator.clipboard.writeText`）
- [ ] コピー成功時のフィードバック表示（チェックマークアイコン + 一定時間後に元に戻る）
- [ ] `"use client"`ディレクティブ（クリップボードAPI使用のため）
- [ ] 横スクロール対応（`overflow-x: auto`）

### 対象ファイル
- `frontend/src/components/markdown/code-block.tsx` （新規作成）

### 受け入れ条件
- コードブロック上部に言語名が表示される
- コピーボタンクリックでコードがクリップボードにコピーされる
- コピー成功のフィードバックが表示される
- ダーク/ライトモードで適切にスタイリングされる
- 長いコードが横スクロール可能

---

## Step 4: MermaidBlockコンポーネント新規作成

**ターゲット**: frontend
**依存関係**: Step 1
**並列可能**: Step 3と並列

### 概要
mermaid.jsを遅延ロードしてMermaidコードブロックをSVGダイアグラムとしてレンダリングするクライアントコンポーネントを作成する。

### 作業項目
- [ ] `mermaid`パッケージをインストール（`npm install mermaid`）
- [ ] `mermaid-block.tsx`を新規作成
- [ ] `"use client"`ディレクティブ
- [ ] `mermaid`パッケージの動的import（`import("mermaid")`）
- [ ] `useEffect`内でmermaid初期化とSVGレンダリング
- [ ] `securityLevel: 'strict'`設定
- [ ] `useTheme()`フック（next-themes）でダークモード連動
- [ ] レンダリング前のローディングスケルトン表示
- [ ] エラー時のフォールバック表示（元のコードをフォールバックとして表示）
- [ ] コンポーネントのunmount時のクリーンアップ

### 対象ファイル
- `frontend/src/components/markdown/mermaid-block.tsx` （新規作成）
- `frontend/package.json` （変更: mermaid追加）

### 受け入れ条件
- `\`\`\`mermaid`コードブロックがSVGダイアグラムとして表示される
- ダークモードでダイアグラムの色が適切に変わる
- ダイアグラムはレスポンシブ（maxWidth: 100%）
- mermaid.jsは初回表示時にのみロードされる（遅延ロード）
- エラー時に元のコードがフォールバックとして表示される

---

## Step 5: ImageWithCaptionコンポーネント新規作成

**ターゲット**: frontend
**依存関係**: なし

### 概要
Markdown画像にキャプション（figcaption）サポートを追加するコンポーネントを作成する。

### 作業項目
- [ ] `image-with-caption.tsx`を新規作成
- [ ] `alt`テキストが存在する場合、`<figure>` + `<figcaption>`でラップ
- [ ] `alt`テキストが空の場合は通常の`<img>`として表示
- [ ] 既存のlazy loading、max-w-full、roundedスタイルを維持
- [ ] figcaptionのスタイリング（中央揃え、テキストカラー）

### 対象ファイル
- `frontend/src/components/markdown/image-with-caption.tsx` （新規作成）

### 受け入れ条件
- `alt`テキストのある画像がfigure + figcaptionでラップされる
- `alt`テキストが空の画像は通常表示
- 画像はlazy loadingが維持される
- キャプションが中央揃えで適切なスタイルで表示される

---

## Step 6: MarkdownRenderer統合

**ターゲット**: frontend
**依存関係**: Step 1, Step 3, Step 4, Step 5
**並列可能**: Step 7と並列（ただし最終結合はStep 6完了後）

### 概要
新規作成したコンポーネント（CodeBlock、MermaidBlock、ImageWithCaption）をMarkdownRendererのカスタムコンポーネントマッピングに統合する。

### 作業項目
- [ ] CodeBlock、MermaidBlock、ImageWithCaptionをimport
- [ ] `components`プロパティでマッピング設定
  - `pre`: rehype-pretty-codeの出力を検出してCodeBlockに、mermaidの場合はMermaidBlockに振り分け
  - `code`: インラインコード用のスタイリング（ブロックコードとの分離）
  - `img`: ImageWithCaptionに変更
  - `table`: 既存のレスポンシブテーブルラッパー維持
- [ ] Mermaidコードブロックの検出ロジック実装（`data-language="mermaid"`または`className`に`language-mermaid`を含む場合）
- [ ] 不要になった既存のインライン`pre`/`img`コンポーネント定義を削除

### 対象ファイル
- `frontend/src/components/markdown/markdown-renderer.tsx` （変更）

### 受け入れ条件
- コードブロックにCodeBlockコンポーネントが適用される（コピーボタン・言語ラベル表示）
- Mermaidコードブロックが自動検出されてMermaidBlockでレンダリングされる
- 画像にImageWithCaptionが適用される
- テーブルは既存のレスポンシブラッパーが維持される
- 通常のインラインコードが正常にスタイリングされる

---

## Step 7: TOC拡張（H4-H6対応）

**ターゲット**: frontend
**依存関係**: なし
**並列可能**: Step 6と並列

### 概要
目次の見出し抽出をH2-H3からH2-H6に拡張し、UIで階層構造を視覚的に表現する。

### 作業項目
- [ ] `toc.ts`の正規表現を`/^(#{2,3})\s+(.+)$/`から`/^(#{2,6})\s+(.+)$/`に変更
- [ ] `toc.tsx`のIntersectionObserverクエリセレクタを`h2[id], h3[id], h4[id], h5[id], h6[id]`に拡張
- [ ] H4以下のインデントを追加（`(item.level - 2) * 12px`は維持、深い階層の視認性向上）
- [ ] H4以下のフォントサイズを`text-xs`に設定
- [ ] H4以下の項目をやや薄い色で表示（視覚的な階層区別）

### 対象ファイル
- `frontend/src/lib/toc.ts` （変更）
- `frontend/src/components/report/toc.tsx` （変更）

### 受け入れ条件
- H4-H6の見出しがTOCに表示される
- 階層ごとにインデントが増加する
- H4以下は本文中の見出しクリックでTOCの該当項目がアクティブになる
- MobileTocも自動的にH4-H6対応になる（Tocコンポーネントを再利用しているため）

---

## Step 8: レイアウトリデザイン + 最終調整

**ターゲット**: frontend
**依存関係**: Step 1-7全て

### 概要
全体のレイアウトを見直し、全コンポーネントが調和するように最終調整を行う。

### 作業項目
- [ ] `[slug]/page.tsx`のグリッドレイアウト調整（TOCサイドバー幅`220px`→`260px`）
- [ ] `layout.tsx`の`max-w-5xl`→`max-w-6xl`への変更を検討（コンテンツ量に応じて）
- [ ] 各コンポーネントのダークモード表示確認・調整
- [ ] モバイル表示の確認・調整（レスポンシブブレークポイント）
- [ ] 長い数式・長いコードブロック・大きなMermaidダイアグラムの表示確認
- [ ] 脚注のアンカーリンク動作確認
- [ ] パフォーマンス確認（Mermaid遅延ロードの動作）
- [ ] ビルド成功確認（`npm run build`）

### 対象ファイル
- `frontend/src/app/(authenticated)/[domain]/[slug]/page.tsx` （変更）
- `frontend/src/app/(authenticated)/layout.tsx` （変更検討）
- 各コンポーネントの微調整

### 受け入れ条件
- 全てのMarkdown要素（見出し、段落、リスト、テーブル、コードブロック、数式、Mermaid、画像、脚注）が正しく表示される
- ダーク/ライトモードで全要素が見やすく表示される
- モバイルでも全要素が適切にレスポンシブ表示される
- ビルドが成功する
- Lighthouse Performance Scoreが大幅に低下しない

---

## 依存関係ダイアグラム

```
Step 1 (コア基盤)
  ↓
Step 2 (CSS) ←────────────────────┐
  ↓                                │
  ├→ Step 3 (CodeBlock)    ─┐     │
  ├→ Step 4 (MermaidBlock) ─┤     │
  └→ Step 5 (ImageCaption) ─┤     │
                             ↓     │
Step 6 (統合) ←──────────────┘     │
  ↓                                │
  ├→ Step 7 (TOC) ←───── 並列可能 ─┘
  ↓
Step 8 (リデザイン + 最終調整)
```

## パッケージ変更まとめ

| 操作 | パッケージ | バージョン |
|------|-----------|-----------|
| 削除 | `rehype-sanitize` | ^6.0.0 |
| 追加 | `mermaid` | ^11.x |
| 既存有効化 | `rehype-pretty-code` | ^0.14.0 |
| 既存有効化 | `shiki` | ^3.0.0 |
