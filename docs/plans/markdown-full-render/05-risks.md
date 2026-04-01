# Markdownフルレンダリング — リスクと依存関係

## リスク一覧

| # | リスク | 影響 | 確率 | 緩和策 |
|---|--------|------|------|--------|
| 1 | rehype-sanitize撤去後のXSSリスク | 中 | 低 | コンテンツはClaude CLI生成のため低リスク。将来ユーザー入力機能を追加する場合はrehype-sanitizeの再導入またはDOMPurifyの導入を検討 |
| 2 | Mermaid XSS脆弱性（CVE-2025-54881等） | 中 | 低 | `securityLevel: 'strict'`を明示的に設定。mermaidバージョンを定期的に更新。コンテンツは信頼できるソース（Claude生成）のみ |
| 3 | mermaid.jsバンドルサイズによるパフォーマンス低下 | 低 | 中 | 動的import（`import("mermaid")`）で遅延ロード。Mermaidコードブロックが存在するページでのみロード |
| 4 | rehype-pretty-code（Shiki）によるビルド時間増加 | 低 | 中 | Shikiのfine-grained bundleで使用言語のみロード。ハイライターインスタンスのキャッシュ |
| 5 | rehype-pretty-codeとreact-markdownの互換性問題 | 中 | 低 | 両方とも既にpackage.jsonに存在しバージョン互換性は確認済み。rehype-pretty-codeのreactMarkdown向けドキュメントに従う |
| 6 | ダークモード切り替え時のMermaidダイアグラム再レンダリング | 低 | 中 | useThemeの変更を監視し、テーマ変更時にmermaidを再初期化 |
| 7 | KaTeX数式とrehype-pretty-codeの競合 | 中 | 低 | `\`\`\`math`コードブロックの処理順序に注意。remark-mathがrehype-pretty-codeより先に処理されるようプラグイン順序を制御 |

## 外部依存関係

| 依存 | バージョン | 用途 | リスク |
|------|-----------|------|--------|
| `mermaid` | ^11.x | ダイアグラムレンダリング | XSS脆弱性の定期的な確認が必要 |
| `rehype-pretty-code` | ^0.14.0 (既存) | シンタックスハイライト | Shikiバージョンアップ時の互換性 |
| `shiki` | ^3.0.0 (既存) | ハイライトエンジン | WebAssembly版との選択（JS版を使用） |
| `react-markdown` | ^9.0.3 (既存) | Markdownレンダリング | v10へのアップグレードは将来の検討事項 |

## 技術的負債

| 項目 | 説明 | 対応時期 |
|------|------|---------|
| react-markdown v10移行 | v10でAPI簡素化（className prop廃止等）。現在v9.0.3で問題なし | 次回メジャーアップデート時 |
| CSP メタタグ追加 | rehype-sanitize撤去の補助防御として、CSPメタタグの追加を検討 | セキュリティレビュー時 |
| Mermaid SSR化 | 現在CSRだが、将来的にrehype-mermaid（SSR）への移行でパフォーマンス改善可能 | パフォーマンス要件が厳しくなった場合 |
| テスト網羅性の向上 | 主要フローのE2Eカバーのみ。コンポーネント単体テストの追加が望ましい | テスト基盤整備時 |

## 未決定事項

| 項目 | 説明 | 決定期限 |
|------|------|---------|
| max-wの拡張 | layout.tsxの`max-w-5xl`→`max-w-6xl`への変更。実際の表示を見て判断 | Step 8実装時 |
| Shiki言語バンドル | 全言語ロード vs 使用言語のみロード。ビルド時間を計測して判断 | Step 1実装後 |
| TOC折りたたみ | H4以下の折りたたみUIの必要性。実際のドキュメントのH4使用頻度による | Step 7実装時 |
