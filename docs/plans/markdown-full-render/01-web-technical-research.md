# Markdownフルレンダリング — Web技術リサーチ

> 調査日: 2026-04-01
> 現行スタック: react-markdown v9.0.3 + remark-gfm + remark-math + rehype-katex + rehype-sanitize
> 対象環境: Next.js 15 (App Router, static export) + React 19

---

## 1. Markdownレンダリングライブラリ比較

### 比較対象

| ライブラリ | 最新バージョン | 週間DL数 | React 19対応 | SSR/RSC対応 |
|-----------|-------------|---------|-------------|------------|
| **react-markdown** | v10.0.0 (2025-02) | ~4M | `react: ">=18"` (対応済、v9.0.2でReact 19型修正) | CSRコンポーネント |
| **@mdx-js/mdx** | v3.x | ~3M | Next.js 15公式サポート | RSC対応 |
| **markdown-it** | v14.x | ~7.7M | Reactラッパー必要 | パーサーのみ(フレームワーク非依存) |
| **unified/remark直接利用** | remark v15+ | - | フレームワーク非依存 | サーバーサイドで完結可能 |

### 詳細比較

#### react-markdown（現行）
- **長所**:
  - シンプルなAPI (`<ReactMarkdown>{content}</ReactMarkdown>`)
  - remark/rehypeプラグインエコシステム全体を利用可能
  - カスタムコンポーネントマッピングが容易
  - v10.0.0でAPI簡素化（className prop廃止）
- **短所**:
  - クライアントコンポーネント必須（`"use client"`）
  - ランタイムでのパース処理（ビルド時ではない）
  - JSX/インタラクティブコンテンツ不可
- **推奨度**: ★★★★☆（現行システムの継続利用に最適）

#### MDX (@mdx-js/mdx + @next/mdx)
- **長所**:
  - Next.js 15公式サポート（App Router対応）
  - Server Components（RSC）で動作
  - ビルド時コンパイル → ランタイムコスト0
  - JSXコンポーネント埋め込み可能
- **短所**:
  - `.mdx`ファイル形式が必要（既存`.md`ファイルの変換コスト）
  - リモート/動的コンテンツには`next-mdx-remote`が必要
  - セキュリティ：MDXはJSXを実行するため、信頼できないコンテンツには不適
- **推奨度**: ★★★☆☆（既存コンテンツが`.md`形式のため移行コスト大）

#### markdown-it + Reactラッパー
- **長所**:
  - 最大のDL数、成熟したエコシステム
  - CommonMark仕様の完全準拠
  - プラグインが豊富
- **短所**:
  - HTML文字列を出力 → `dangerouslySetInnerHTML`必須
  - Reactコンポーネントマッピングが困難
  - XSSリスクが高い（サニタイズが別途必要）
- **推奨度**: ★★☆☆☆（Reactとの統合が不自然）

#### unified/remark直接利用（サーバーサイドHTML変換）
- **長所**:
  - サーバーサイドでMarkdown→HTML変換完了
  - クライアントバンドルサイズ最小
  - 最大の柔軟性
- **短所**:
  - `dangerouslySetInnerHTML`必須
  - カスタムReactコンポーネントの利用不可
  - 実装コストが高い
- **推奨度**: ★★★☆☆（パフォーマンス重視の場合）

### 結論
**react-markdown v10の継続利用を推奨**。既存の`.md`コンテンツとの互換性、remark/rehypeプラグインエコシステムとの統合、シンプルなAPIが最適。将来的にMDX移行を検討する場合は`next-mdx-remote`経由で段階的に移行可能。

---

## 2. シンタックスハイライト比較

### 比較対象

| ライブラリ | ベースエンジン | ビルド時処理 | テーマ数 | 言語数 | バンドルサイズ |
|-----------|------------|-----------|---------|-------|-------------|
| **rehype-pretty-code** | Shiki | ビルド時(推奨) + ランタイム | VS Codeテーマ全対応 | 200+ | ~0KB(ビルド時)※ |
| **@shikijs/rehype** | Shiki | ビルド時 + ランタイム | 同上 | 200+ | ~0KB(ビルド時)※ |
| **rehype-highlight** | highlight.js (lowlight) | ランタイム | 37テーマ | 37(デフォルト)/190+ | ~280KB gz(フル) |
| **Prism.js** | 独自 | ランタイム | 多数 | 290+ | ~20KB(コア) |

※ Shikiベースはビルド時実行の場合、クライアントにJSを送信しない。動的ハイライトの場合: フルバンドル~1.2MB gz、fine-grained~200KB gz。

### 詳細比較

#### rehype-pretty-code（推奨）
- **長所**:
  - VS Codeテーマエコシステムをそのまま利用（Dracula、One Dark Pro等）
  - ビルド時ハイライト → クライアントJS追加0
  - 行ハイライト、単語ハイライト、行番号、差分表示対応
  - Next.js 15との統合が公式ドキュメントで説明済み
  - **現行プロジェクトに`rehype-pretty-code` v0.14.0と`shiki` v3.0.0が既にインストール済み**
- **短所**:
  - CSSは自分で定義する必要あり（unstyled）
  - ビルド時間が増加する可能性
- **パフォーマンス**: ビルド時実行のため、ランタイムコスト0。Shiki自体は初期化が遅い(highlight.jsの約47倍)が、ビルド時なら問題なし

#### rehype-highlight
- **長所**:
  - デフォルト37言語でバンドル小さい
  - highlight.jsの安定性
  - 設定が簡単
- **短所**:
  - VS Codeテーマ非対応
  - ランタイム処理（クライアントJSが必要）
  - 行ハイライト等の高度な機能なし
- **パフォーマンス**: highlight.jsはShikiの44倍高速だが、ビルド時処理では無関係

#### Prism.js
- **長所**:
  - 軽量コア (~20KB)
  - 言語プラグインが豊富
- **短所**:
  - rehypeプラグインとしての統合が弱い
  - メンテナンスが停滞気味
  - React 19/Next.js 15対応が不明確

#### Shiki直接利用（@shikijs/rehype）
- rehype-pretty-codeとほぼ同等だが、行ハイライト等の高レベル機能はrehype-pretty-codeに任せる方が効率的

### Shikiバンドル最適化戦略
Shikiのベストプラクティス:
1. **ハイライターインスタンスのキャッシュ**: シングルトンパターンで再利用
2. **Fine-grained Bundle**: `shiki/core` + 必要な言語/テーマのみインポート
3. **JavaScript Engine使用**: WebAssembly版よりバンドル小・起動速
4. **Shorthand関数**: 必要な言語/テーマを遅延ロード

### 結論
**rehype-pretty-codeの有効化を推奨**。既にプロジェクトにインストール済みであり、ビルド時処理でクライアントバンドルへの影響0、VS Codeテーマによる高品質なハイライトが実現可能。

---

## 3. Mermaidダイアグラムレンダリング比較

### 比較対象

| ライブラリ | レンダリング方式 | SSR対応 | ダークモード | 依存 |
|-----------|--------------|--------|-----------|-----|
| **mermaid.js (クライアント)** | CSR | 不可 | 対応 | mermaid (~遅延ロード) |
| **rehype-mermaid** | SSR (4戦略) | 対応 | 一部対応 | Playwright (サーバー) |
| **remark-mermaidjs** | SSR | 対応 | 不明 | Playwright (サーバー) |

### 詳細比較

#### mermaid.jsクライアントサイドレンダリング
- **長所**:
  - 実装がシンプル（`<pre class="mermaid">`をクライアントで変換）
  - Playwrightが不要
  - インタラクティブ機能（ズーム等）可能
  - ダークモード対応が容易
- **短所**:
  - クライアントバンドルサイズ増加（mermaidは大きい、ただし遅延ロード可能）
  - 初期表示でレイアウトシフト発生
  - Static Export (`output: 'export'`) との相性は良い（CSRのため）

#### rehype-mermaid（推奨）
- **長所**:
  - 4つの戦略から選択可能:
    - `inline-svg`: インラインSVG埋め込み（デフォルト）
    - `img-svg`: SVGをdata URIとして`<img>`に埋め込み（ダークモード対応）
    - `img-png`: PNGをbase64で`<img>`に埋め込み（ダークモード対応）
    - `pre-mermaid`: クライアントサイドレンダリング用マークアップ出力
  - ビルド時SVG生成でクライアントJS不要（`inline-svg`/`img-*`戦略）
  - Node.js 18+対応
- **短所**:
  - ビルド環境にPlaywright + ブラウザが必要
  - ビルド時間増加
  - `pre-mermaid`戦略以外はビルド環境の制約あり
  - **Static Export環境でのビルド時Playwright実行は環境構築が複雑**

#### remark-mermaidjs
- 公式READMEが「rehype-mermaidを使うべき」と推奨
- 非推奨

### セキュリティ上の懸念（重要）
mermaid.jsには2025年に複数のXSS脆弱性が報告されている:
- **CVE-2025-54881**: シーケンスダイアグラムラベルへの悪意あるHTML注入
- **CVE-2025-54880**: `@mermaid-js/tiny`のXSS
- DOMPurifyによるサニタイズを内蔵しているが、`securityLevel`設定の上書きリスクあり

**対策**: 
- `securityLevel: 'strict'`の明示的設定
- ユーザー入力を含むダイアグラムの場合は追加サニタイズ
- 信頼できるコンテンツのみレンダリング（本プロジェクトではClaude生成コンテンツのため低リスク）

### 結論
**本プロジェクトの場合、クライアントサイドレンダリング（mermaid.js直接）を推奨**。理由:
1. Static Export (`output: 'export'`) 環境ではビルド時Playwright実行が複雑
2. コンテンツは信頼できるソース（Claude CLI生成）
3. 遅延ロードでバンドル影響を最小化可能
4. ダークモード対応が容易

---

## 4. 数式レンダリング比較

### 比較対象

| ライブラリ | 最新バージョン | バンドルサイズ | 出力形式 | レンダリング速度 |
|-----------|-------------|-------------|---------|--------------|
| **KaTeX** | v0.16.27 | ~347KB (JS+CSS+フォント) | HTML+CSS | 非常に高速（同期） |
| **MathJax** | v4.0 | ~5MB (フル) | HTML/SVG/MathML | 中速（v3で大幅改善） |
| **Temml** | v0.13.02 | ~380KB (フォント含む) | MathML | 最軽量 |

### 詳細比較

#### KaTeX（現行・推奨継続）
- **長所**:
  - 同期レンダリング（ページリフロー不要）
  - フォントロード時間が短い
  - バンドルサイズが適度
  - rehype-katexとの統合が成熟
  - React/Next.jsエコシステムで最も使用されている
- **短所**:
  - `\label`/`\eqref`（方程式相互参照）非対応
  - 一部の高度なLaTeXパッケージ非対応
  - MathML出力不可
- **アクセシビリティ**: aria-label生成対応、スクリーンリーダー対応

#### MathJax v4.0
- **長所**:
  - LaTeX機能カバレッジ最大
  - MathML/AsciiMath入力対応
  - HTML/SVG/MathML出力対応
  - `\label`/`\eqref`対応
  - 優れたアクセシビリティ（MathML出力）
- **短所**:
  - バンドルサイズが大きい（~5MB フル）
  - v3以降パフォーマンス改善されたが、KaTeXより遅い
  - rehypeプラグイン（rehype-mathjax）の成熟度がrehype-katexより低い
- **モバイル**: SVG出力はモバイルでスケーリング良好

#### Temml v0.13.02
- **長所**:
  - KaTeXフォークでMathML出力
  - 最軽量
  - ブラウザネイティブMathMLレンダリング活用
  - TeX機能カバレッジはKaTeX以上（Temml公式比較表より）
- **短所**:
  - MathMLのブラウザ間レンダリング品質が不均一
  - シンボルスケーリング、スペーシングの一貫性に課題
  - rehypeプラグインが未成熟（rehype-temml）
  - エコシステムが小さい（採用事例が少ない）
- **モバイル**: MathMLのモバイルブラウザ対応が進行中だが、まだ不安定な部分あり

### TeX機能カバレッジ比較（Temml公式データ）

| 機能カテゴリ | Temml | MathJax | KaTeX |
|------------|-------|---------|-------|
| 行列罫線 (`\hline`, `\hdashline`) | 対応 | 制限あり | 非対応 |
| テキストモードアクセント | 対応 | 部分対応 | 制限あり |
| 物理記法 (`\odv`, `\pdv`) | 対応 | 拡張必要 | 非対応 |
| 方程式参照 (`\label`, `\eqref`) | 非対応 | 対応 | 非対応 |
| 拡張機能の要否 | 最小限 | 複数(mhchem, physics等) | 最小限 |

### 結論
**KaTeXの継続利用を推奨**。理由:
1. 本プロジェクトのリサーチ文書で使用されるLaTeX機能はKaTeXでカバー可能
2. rehype-katexとの統合が最も成熟
3. 同期レンダリングでUX良好
4. バンドルサイズとパフォーマンスのバランスが最適
5. rehype-sanitizeとの競合問題はプラグイン順序とスキーマ拡張で解決可能

---

## 5. 脚注（Footnotes）サポート

### 調査結果

#### remark-gfm v4の脚注対応状況
**remark-gfm v4は脚注を標準でサポート済み**。別途プラグインは不要。

remark-gfmがサポートするGFM拡張:
1. Autolink literals
2. **Footnotes** (`[^1]` 形式)
3. Strikethrough
4. Tables
5. Tasklists

内部的には`micromark-extension-gfm-footnote` + `mdast-util-gfm-footnote`を使用しているが、remark-gfmが抽象化しているため直接利用する必要はない。

#### remark-footnotes（非推奨）
- remark-gfm v4以前に使用されていた独立プラグイン
- 現在はremark-gfmに統合済み
- **使用する必要なし**

#### 実装上の注意点
- `rehype-sanitize`が脚注のHTML要素（`<section>`, `<sup>`, `<a>`のhref属性 `#fn-*`, `#fnref-*`）を削除する可能性がある
- サニタイズスキーマの拡張が必要:
  ```javascript
  {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      a: [...(defaultSchema.attributes?.a || []), ['className', 'data-footnote-ref', 'data-footnote-backref']],
    },
    tagNames: [...(defaultSchema.tagNames || []), 'section'],
  }
  ```

### 結論
**追加プラグインは不要**。remark-gfm v4で脚注は標準サポート済み。rehype-sanitizeのスキーマ拡張のみ必要。

---

## 6. サニタイゼーション戦略比較

### 比較対象

| 戦略 | XSS防御 | 機能への影響 | 実装コスト | 推奨度 |
|-----|---------|-----------|----------|-------|
| **rehype-sanitize (スキーマ拡張)** | 高 | 中（許可リスト方式） | 低 | ★★★★★ |
| **CSPヘッダーのみ** | 中 | 低 | 中 | ★★☆☆☆ |
| **DOMPurify** | 高 | 低 | 中 | ★★★★☆ |
| **多層防御（推奨）** | 最高 | 調整可能 | 高 | ★★★★★ |

### 詳細比較

#### rehype-sanitize + スキーマ拡張（現行改善・推奨）
- **仕組み**: unified ASTレベルで許可されていないHTML要素/属性を削除
- **長所**:
  - remarkパイプラインに自然に統合
  - GitHub.comと同等のデフォルトスキーマ
  - ASTレベルで動作 → DOM操作不要
  - カスタムスキーマで機能拡張可能
- **短所**:
  - KaTeX/Mermaid等が生成する要素の許可リスト管理が複雑
  - スキーマの過度な拡張はセキュリティリスク
- **現行の問題**: rehype-sanitizeがrehype-katexの後に実行され、KaTeX生成HTMLの一部を削除

**推奨スキーマ拡張例**:
```javascript
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

const customSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // KaTeX用
    div: [...(defaultSchema.attributes?.div || []), ['className', 'math', 'math-display']],
    span: [...(defaultSchema.attributes?.span || []), ['className', /^katex/, 'math-inline']],
    code: [...(defaultSchema.attributes?.code || []), ['className', /^language-/]],
    // 脚注用
    a: [...(defaultSchema.attributes?.a || []), ['className', 'data-footnote-ref', 'data-footnote-backref']],
    // コードハイライト用
    pre: [...(defaultSchema.attributes?.pre || []), ['className'], ['style']],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'section', // 脚注セクション
    'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', // Mermaid SVG
  ],
}
```

#### CSPヘッダーのみ（非推奨）
- **仕組み**: ブラウザ側でスクリプト実行を制限
- **長所**:
  - 機能への影響なし（HTMLはそのまま出力）
  - インラインスタイル/スクリプトの制御が可能
- **短所**:
  - CSPはXSS防御の「最終防衛ライン」であり、単独使用は不十分
  - Static Export (`output: 'export'`) ではCSPヘッダー設定方法が限定的（meta tag）
  - ストアドXSSには対応できない場合がある
- **結論**: 補助的な対策としてのみ使用

#### DOMPurify
- **仕組み**: DOM APIを使用してHTMLをサニタイズ
- **長所**:
  - HTML/MathML/SVGに対応
  - 高速（DOMベース）
  - 設定フック（beforeSanitizeElements等）で柔軟なカスタマイズ
  - MathMLとSVGの許可が容易
- **短所**:
  - クライアントサイドで動作 → SSR/Static Exportとの相性が悪い
  - `jsdom`をサーバーサイドで使えば可能だが追加依存
  - unified/rehypeパイプラインとの統合が不自然
  - **mermaid.js自体がDOMPurifyを内蔵**しており、バンドルの重複リスク

#### 多層防御アプローチ（推奨）
1. **第1層**: rehype-sanitize（ASTレベル、サーバーサイド） — 主防御
2. **第2層**: CSPヘッダー/metaタグ — 補助防御
3. **第3層**: 入力バリデーション — コンテンツ受け入れ時

### プラグイン順序の重要性

現行の問題: `rehype-katex`の後に`rehype-sanitize`が実行されKaTeX出力が破壊される。

**推奨プラグイン順序**:
```
remark-math → remark-gfm → rehype-sanitize(カスタムスキーマ) → rehype-katex → rehype-pretty-code
```

この順序では:
1. `rehype-sanitize`がraw HTMLをサニタイズ（安全なASTを保証）
2. `rehype-katex`が数式ノードをKaTeX HTMLに変換（サニタイズ済みASTに対して動作）
3. `rehype-pretty-code`がコードブロックをハイライト

**注意**: この場合、`rehype-katex`と`rehype-pretty-code`の出力はサニタイズされないが、これらはプログラムで生成されるため安全。ユーザー入力に由来するHTMLのみをサニタイズ対象にする。

### 結論
**rehype-sanitize（スキーマ拡張）+ プラグイン順序修正を推奨**。多層防御としてCSP metaタグも追加。本プロジェクトではコンテンツがClaude CLI生成のため、サニタイゼーションの緩和リスクは低い。

---

## 総合推奨事項

| カテゴリ | 推奨選択 | 理由 |
|---------|---------|-----|
| Markdownレンダリング | **react-markdown v10継続** | 移行コスト0、プラグインエコシステム活用 |
| シンタックスハイライト | **rehype-pretty-code有効化** | 既にインストール済み、ビルド時処理でJS追加0 |
| Mermaidダイアグラム | **mermaid.js CSR (遅延ロード)** | Static Export環境との相性、実装シンプル |
| 数式レンダリング | **KaTeX継続** | 成熟度、パフォーマンス、バンドルサイズのバランス |
| 脚注 | **remark-gfm v4標準機能** | 追加プラグイン不要 |
| サニタイゼーション | **rehype-sanitize スキーマ拡張 + プラグイン順序修正** | AST統合、最小限の変更で問題解決 |

### 優先実装順序
1. **rehype-sanitizeプラグイン順序修正 + スキーマ拡張**（KaTeX表示修正）— 最優先
2. **rehype-pretty-code有効化**（コードハイライト）— 既存依存利用
3. **脚注対応確認**（rehype-sanitizeスキーマで脚注要素を許可）
4. **Mermaid CSRコンポーネント追加**（遅延ロード）

---

## Sources
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown)
- [react-markdown changelog](https://github.com/remarkjs/react-markdown/blob/main/changelog.md)
- [react-markdown React 19 Issue #871](https://github.com/remarkjs/react-markdown/issues/871)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [MDX公式サイト](https://mdxjs.com/)
- [npm trends: mdx vs markdown-it vs react-markdown](https://npmtrends.com/@mdx-js/mdx-vs-markdown-it-vs-next-mdx-enhanced-vs-react-markdown-vs-remark)
- [Rehype Pretty Code](https://rehype-pretty.pages.dev/)
- [rehype-highlight GitHub](https://github.com/rehypejs/rehype-highlight)
- [@shikijs/rehype](https://shiki.matsu.io/packages/rehype)
- [Shiki Best Performance Practices](https://shiki.style/guide/best-performance)
- [Highlight.js vs Shiki比較](https://dev.to/begin/tale-of-the-tape-highlightjs-vs-shiki-27ce)
- [rehype-mermaid GitHub](https://github.com/remcohaszing/rehype-mermaid)
- [remark-mermaidjs GitHub](https://github.com/remcohaszing/remark-mermaidjs)
- [Mermaid XSS CVE-2025-54881](https://security.snyk.io/vuln/SNYK-JS-MERMAID-12027649)
- [KaTeX vs MathJax比較](https://biggo.com/news/202511040733_KaTeX_MathJax_Web_Rendering_Comparison)
- [Temml TeX Coverage比較表](https://temml.org/docs/en/comparison)
- [remark-gfm GitHub (脚注サポート)](https://github.com/remarkjs/remark-gfm)
- [micromark-extension-gfm-footnote](https://github.com/micromark/micromark-extension-gfm-footnote)
- [rehype-sanitize GitHub](https://github.com/rehypejs/rehype-sanitize)
- [React Markdown Security Guide (Strapi)](https://strapi.io/blog/react-markdown-complete-guide-security-styling)
- [HackerOne: Secure Markdown Rendering in React](https://www.hackerone.com/blog/secure-markdown-rendering-react-balancing-flexibility-and-safety)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
