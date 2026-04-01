# Markdownフルレンダリング — 要件定義

## 背景と目的

本プロジェクトのWebサービスでは、Claude CLIが生成したリサーチ文書（Markdownファイル）を表示しているが、現在以下の問題がある：

1. **rehype-sanitize**がKaTeX生成HTML・コードブロックのクラス属性・脚注要素などを除去し、Markdownの一部情報が表示されない
2. **シンタックスハイライト**が未実装（rehype-pretty-code + shikiはインストール済みだが未使用）
3. **Mermaidダイアグラム**が非対応
4. **TOC（目次）**がH2/H3のみでH4以下の見出しが欠落
5. **数式表示**のレスポンシブ対応・スタイリングが不十分

これらを解決し、Markdownの全情報をWebサービスで確認可能にする。

## ユーザーストーリー

- データサイエンティストとして、数式（LaTeX）を含むリサーチ文書をモバイルでも正しく読みたい
- ソフトウェアエンジニアとして、コードブロックのシンタックスハイライトで言語ごとの色分けを確認したい
- リサーチャーとして、Mermaidダイアグラムを含む文書をブラウザで確認したい
- ユーザーとして、長い文書でも目次（TOC）から素早く目的のセクションに移動したい
- ユーザーとして、ダークモードでもコードブロック・数式・図表が見やすく表示されてほしい

## 機能要件

### FR-1: rehype-sanitize撤去
- rehype-sanitizeプラグインを完全に撤去する
- コンテンツはClaude CLI生成のため、XSSリスクは低い
- 撤去により、KaTeX出力・コードブロッククラス・脚注要素・HTML要素などの全てが正常に表示される

### FR-2: シンタックスハイライト有効化
- 既存のrehype-pretty-code v0.14.0 + shiki v3.0.0を有効化
- 対応言語: python, javascript, typescript, json, yaml, hcl, css, bash, math（docs/内で使用されている言語）
- VS Codeテーマによるカラースキーム（ダーク/ライト両対応）
- 行番号表示
- コードブロックの言語ラベル表示

### FR-3: Mermaidダイアグラムサポート
- mermaid.jsをクライアントサイドで遅延ロード
- `\`\`\`mermaid`コードブロックを検出し、SVGダイアグラムとしてレンダリング
- ダークモード対応（テーマ自動切り替え）
- レンダリング中のローディング表示

### FR-4: TOC拡張
- H2/H3に加えてH4-H6も目次に含める
- 階層構造を視覚的にインデントで表現
- H4以下はオプションで折りたたみ可能

### FR-5: 数式表示改善
- KaTeX継続利用（remark-math + rehype-katex）
- 長い数式のオーバーフロー処理改善（横スクロール対応）
- モバイルでの数式表示最適化
- ダークモード対応のスタイリング

### FR-6: コンポーネント分割
- MarkdownRendererのカスタムコンポーネントを独立したReactコンポーネントとして分割
  - `MermaidBlock`: Mermaidダイアグラムレンダリング
  - `CodeBlock`: シンタックスハイライト付きコードブロック（rehype-pretty-codeがpre/code生成）
  - `MathBlock`: 数式表示（KaTeX）
  - 必要に応じて`TableBlock`, `ImageBlock`等

### FR-7: UI/UX改善
- コードブロック: コピーボタン、言語ラベル表示
- テーブル: レスポンシブ対応（横スクロール維持）
- 画像: キャプションサポート（figcaption）
- 脚注: GFM脚注の正常表示
- 全体: ダークモードでの各要素の見やすさ向上

## 非機能要件

- **パフォーマンス**: Mermaid以外はビルド時処理。Mermaidは遅延ロードで初期表示に影響しない
- **バンドルサイズ**: rehype-pretty-codeはビルド時処理のためクライアントJS追加0。Mermaidは動的importで必要時のみロード
- **後方互換性**: 既存のMarkdownファイルを一切変更しない。フロントエンドのみの変更で対応
- **アクセシビリティ**: コードブロックのaria属性、数式のaria-label維持
- **ブラウザ対応**: Chrome, Firefox, Safari, Edge最新版

## スコープ外

- Markdownファイルの形式変更（.md → .mdx移行など）
- バックエンド（Python/ECSタスク）の変更
- インフラ（Terraform）の変更
- 認証・認可の変更
- DynamoDB関連の変更

## 用語集

| 用語 | 説明 |
|------|------|
| rehype-pretty-code | Shikiベースのrehypeプラグイン。ビルド時にコードブロックをハイライト |
| Shiki | VS Codeと同じTextMateグラマーを使用するシンタックスハイライター |
| KaTeX | 高速な数式レンダリングライブラリ |
| Mermaid | テキストからダイアグラム（フローチャート、シーケンス図等）を生成するJSライブラリ |
| remark/rehype | Markdownを処理するunifiedエコシステムのプラグイン群 |
| TOC | Table of Contents（目次） |
| GFM | GitHub Flavored Markdown |
