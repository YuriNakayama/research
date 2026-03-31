# Markdown Pages — Web技術調査

## 公式ドキュメント調査

### Next.js App Router: catch-all ルート
- `app/docs/[...slug]/page.tsx` で任意の深さのパスに対応可能
- `[[...slug]]` (optional catch-all) を使えばルート `/docs/` 自体もキャッチ（ディレクトリインデックスに有用）
- `generateStaticParams` で `{ slug: ['research', 'topic', 'subtopic'] }` 形式で返却
- `dynamicParams = false` で生成されていないパスは404を返す（完全静的）
- Next.js 15 では `params` は `Promise<{ slug: string[] }>` 型（awaitが必要）

Sources: [Next.js generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params), [Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)

### AWS Amplify 自動デプロイ
- mainブランチpushで自動ビルド・デプロイ
- `AMPLIFY_DIFF_DEPLOY=true` で差分ベースビルド可能（変更なしでスキップ）
- `appRoot: frontend` 設定時、`docs/` の変更でもビルドがトリガーされることを確認する必要あり
- **推奨**: `AMPLIFY_DIFF_DEPLOY` は無効化し、docs変更もコード変更も等しくリビルド
- ビルドスペックで `docs/` をfrontendビルドディレクトリにコピーするスクリプト追加が必要

Sources: [Amplify Build Settings](https://docs.aws.amazon.com/amplify/latest/userguide/edit-build-settings.html)

### 静的生成戦略
- **推奨: 完全静的生成 (Full SSG)**
- `generateStaticParams` で全パスをビルド時生成 + `dynamicParams = false`
- ISR不要（Amplifyがpush毎にリビルドするため）
- ファイル数（数十〜数百）ではビルド時間は問題にならない

## 類似OSSプロジェクト分析

### Nextra — [nextra.site](https://nextra.site/)
- **関連性**: Next.js App Router上で動作するドキュメントサイトジェネレータ
- **アプローチ**: `content/` ディレクトリにMarkdown配置 → `[[...mdxPath]]/page.jsx` catch-allルートで自動ルーティング
- **参考にすべき点**: ファイルパスがURLに直接マッピングされるパターン
- **不採用理由**: MDX前提の設計で既存のreact-markdown構成と競合

### Docusaurus — [docusaurus.io](https://docusaurus.io/)
- **関連性**: ドキュメントサイトの定番、ディレクトリ構造からサイドバー自動生成
- **参考にすべき点**: ディレクトリツリーからナビゲーション構造を自動構築するロジック
- **不採用理由**: React独自のフレームワークで、既存Next.jsプロジェクトに統合不可

### VitePress — [vitepress.dev](https://vitepress.dev/)
- **関連性**: シンプルなファイル→ルートマッピング
- **参考にすべき点**: `_meta.json` やディレクトリ構造からサイドバー定義を自動生成
- **不採用理由**: Vue/Viteベースで技術スタック不一致

### パターン比較

| 観点 | 本プロジェクト | Nextra | Docusaurus |
|------|--------------|--------|------------|
| フレームワーク | Next.js 15 | Next.js 15 | React (独自) |
| Markdown処理 | react-markdown | MDX | MDX |
| ルーティング | catch-all拡張 | catch-all | プラグイン |
| ナビゲーション | ディレクトリツリー自動生成 | _meta.json | sidebars.js |
| 推奨 | 既存構成を拡張 | — | — |

## 追加推奨プラグイン

| プラグイン | 用途 | 優先度 |
|---|---|---|
| `rehype-slug` | 見出しにid属性を自動付与 | 高 |
| `rehype-autolink-headings` | 見出しにアンカーリンク追加 | 高 |
| `rehype-raw` | Markdown内HTMLタグを通す（Mermaid対応に必要） | 高 |

**注意**: 既存の `rehype-sanitize` と `rehype-raw` は競合する。sanitizeスキーマのカスタマイズが必要。

## Mermaid図表レンダリング

**推奨: クライアントサイドレンダリング + dynamic import**

- Mermaid.jsはブラウザAPI依存でSSG/SSRでは動作しない
- `'use client'` コンポーネントで `import('mermaid')` を遅延ロード
- `react-markdown` の `components` propで `language-mermaid` コードブロックを `<Mermaid>` に変換
- バンドルサイズ: mermaid v11.x は約480KB → dynamic importで遅延ロード必須

Sources: [Mermaid + Next.js](https://josedavidbaena.com/blog/mermaid-nextjs-journey/mermaid-nextjs-part-1-build-time-rendering), [Nextra Mermaid](https://nextra.site/docs/advanced/mermaid)

## 調査サマリー

- **ルーティング**: `[[...slug]]` catch-allルートで任意階層対応
- **Amplify**: docs変更で自動リビルド。ビルドスペックでdocsコピー追加
- **生成戦略**: 完全静的生成（ISR不要）
- **プラグイン**: rehype-slug + rehype-autolink-headings追加
- **Mermaid**: クライアントコンポーネント + dynamic import
- **ゼロコード変更**: generateStaticParamsのファイルシステムスキャンにより実現可能
