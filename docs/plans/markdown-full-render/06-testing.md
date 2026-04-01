# Markdownフルレンダリング — テスト戦略

## テストアプローチ

**E2Eテスト中心**の戦略を採用する。実際のMarkdownファイルを使った表示確認をPlaywrightで自動化し、主要フローをカバーする。各ステップの完了時にビルド成功を確認し、全体完成後に一括リリースする。

## E2Eテスト（Playwright）

### テスト対象シナリオ

| # | シナリオ | 検証内容 |
|---|---------|---------|
| 1 | コードブロック表示 | シンタックスハイライトが適用されている、言語ラベルが表示される、コピーボタンが機能する |
| 2 | 数式表示 | インライン数式（$...$）とディスプレイ数式（$$...$$）が正常にレンダリングされる |
| 3 | テーブル表示 | テーブルが横スクロール可能、セルの内容が全て表示される |
| 4 | Mermaidダイアグラム | `\`\`\`mermaid`コードブロックがSVGダイアグラムに変換される |
| 5 | TOCナビゲーション | H2-H6の見出しがTOCに表示される、クリックで該当セクションにスクロールする |
| 6 | 画像キャプション | alt属性のある画像にfigcaptionが表示される |
| 7 | 脚注 | 脚注リンクが表示され、クリックで脚注セクションに移動する |
| 8 | ダークモード | 全要素（コード、数式、Mermaid、テーブル）がダークモードで適切に表示される |
| 9 | レスポンシブ | モバイルビューポートで全要素が適切に表示される |

### テストファイル構成

```
frontend/e2e/
└── markdown-rendering.spec.ts   # Markdownレンダリング全体のE2Eテスト
```

### テストデータ

既存のMarkdownファイルを使用する（新規テストデータの作成は不要）:

| ファイル | テスト対象 |
|---------|----------|
| `docs/research/cate/theory/definitions.md` | 数式（inline/display）、テーブル、引用ブロック |
| `docs/research/cate/metalearner/metalearner.md` | 数式（アルゴリズム表示）、画像、リスト |
| `docs/research/dc_hvac_control/*/01-*.md` | テーブル、リスト、リンク |
| `docs/plans/*/03-architecture.md` | コードブロック（複数言語）、ツリー構造 |

### テスト実装例

```typescript
import { test, expect } from "@playwright/test";

test.describe("Markdownフルレンダリング", () => {
  test("コードブロックにシンタックスハイライトが適用される", async ({ page }) => {
    await page.goto("/cate/definitions");
    const codeBlock = page.locator("[data-rehype-pretty-code-figure]").first();
    await expect(codeBlock).toBeVisible();
    // 言語ラベルが表示される
    const langLabel = codeBlock.locator("[data-language]");
    await expect(langLabel).toBeVisible();
  });

  test("KaTeX数式が正常にレンダリングされる", async ({ page }) => {
    await page.goto("/cate/definitions");
    // ディスプレイ数式
    const displayMath = page.locator(".katex-display").first();
    await expect(displayMath).toBeVisible();
    // インライン数式
    const inlineMath = page.locator(".katex:not(.katex-display .katex)").first();
    await expect(inlineMath).toBeVisible();
  });

  test("TOCにH4以下の見出しが含まれる", async ({ page }) => {
    await page.goto("/cate/definitions");
    const toc = page.locator("nav[aria-label='目次']");
    // H4の見出しがTOCに存在する
    const h4Items = toc.locator("li").filter({ has: page.locator("a") });
    const count = await h4Items.count();
    expect(count).toBeGreaterThan(0);
  });

  test("Mermaidダイアグラムがレンダリングされる", async ({ page }) => {
    // Mermaidを含むページに遷移
    await page.goto("/path/to/mermaid-page");
    // SVGが生成される
    const mermaidSvg = page.locator(".mermaid-container svg");
    await expect(mermaidSvg).toBeVisible({ timeout: 10000 }); // 遅延ロードのため長めのタイムアウト
  });

  test("ダークモードで全要素が適切に表示される", async ({ page }) => {
    await page.goto("/cate/definitions");
    // ダークモードに切り替え
    await page.click("[aria-label='テーマ切替']"); // テーマトグルボタン
    // コードブロックの背景色がダークテーマ
    const codeBlock = page.locator("[data-rehype-pretty-code-figure] pre").first();
    const bg = await codeBlock.evaluate((el) => getComputedStyle(el).backgroundColor);
    // ダークテーマの背景色であることを確認（具体的な色値はテーマによる）
    expect(bg).not.toBe("rgb(255, 255, 255)");
  });
});
```

## ビルドテスト

各ステップ完了時に実行:

```bash
cd frontend && npm run build
```

- ビルド成功を確認
- ビルド時間の大幅な増加がないことを確認
- ビルド出力サイズの確認

## 手動テスト（目視確認）

E2Eテストでカバーしきれない視覚的な品質を確認:

- [ ] コードブロックのカラースキームが見やすいか
- [ ] 数式のフォントサイズ・間隔が適切か
- [ ] Mermaidダイアグラムのレイアウトが崩れていないか
- [ ] テーブルの列幅・セル内容が読みやすいか
- [ ] TOCの階層インデントが視覚的に明確か
- [ ] モバイルで各要素が収まっているか
- [ ] ダーク/ライト切り替え時にちらつきがないか

## テストデータ（必要に応じて）

もし既存のMarkdownファイルでカバーできないケースがある場合、テスト用のMarkdownファイルを作成:

```
frontend/e2e/fixtures/
└── test-markdown.md   # 全要素を含むテスト用Markdownファイル
```

含めるべき要素:
- H1-H6見出し
- インライン/ディスプレイ数式
- 複数言語のコードブロック（python, javascript, json, yaml, hcl）
- Mermaidダイアグラム（フローチャート、シーケンス図）
- GFMテーブル
- 脚注
- 画像（alt属性あり/なし）
- ネストされたリスト
- 引用ブロック（数式入り）

## カバレッジ目標

| テスト種別 | 目標 |
|-----------|------|
| E2E | 主要9シナリオの全パス |
| ビルド | 全ステップでビルド成功 |
| 手動テスト | ダーク/ライト × デスクトップ/モバイル の4パターン |
