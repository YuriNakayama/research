# Research Viewer UI/UX ビジュアル改善 実装計画

> このドキュメントは `/plan` セッションで確定した方針・決定事項・影響範囲・Phase 構成・リスクを記録したもの。
> 以降の実装は worktree 上でこの Markdown を正として進める。
>
> - 作成日: 2026-07-14
> - 対象ブランチ (worktree): `feature/frontend-visual-refresh`
> - 対象領域: `frontend/`（Next.js App Router / docs 閲覧 UI）
> - ステータス: **計画確定 / 実装未着手**

---

## 1. 背景と目的

`frontend/` の docs 閲覧 UI（現在は "Kinetic Brutalism" デザインシステム）を、
ビジュアル観点で改善する。ユーザー要望は以下の 3 点。

1. **ビジュアル観点での UI/UX 改善**（Vercel Web Interface Guidelines に準拠）
2. **各ページで、カラーパレットを元に 3〜5 色を使用**する配色システムへの刷新
3. **テーブルの各列の横幅をユーザーが Web 上でドラッグ変更**できるようにする

---

## 2. 確定した決定事項

| 項目 | 決定 |
|------|------|
| 配色の方針 | **ブルータリズムの骨格（radius 0・太ボーダー・ハードシャドウ）は維持したまま、色だけ 3〜5 色に増やす** |
| 配色トークン | 各パレットが単一 `--accent-bg` ではなく `surface / accent / accent-2 / muted` 等 **3〜5 色の役割トークン**を駆動する |
| `dark-teal`（デフォルト）| 現状 CSS 定義が欠落 → 追加する |
| 列幅リサイズの永続化 | **ページ単位で localStorage 保存**（リロードしても維持） |
| 変更範囲 | **`frontend/` 配下に限定**。`docs/research/**`・`docs/daily/**` は一切触らない（CLAUDE.md ルール遵守） |

### 決定に至った Q&A（要約）

1. **配色の方向性**: 「ソフト全面刷新」でも「提案書のみ」でもなく、**骨格維持で色だけ増やす**（推奨案）。
2. **列幅の永続化スコープ**: 「非永続」でも「URL クエリ」でもなく、**ページ単位で localStorage 保存**（推奨案）。

---

## 3. 現状分析（調査結果スナップショット）

### 配色システムの不整合（要件 2 の核心）

- `frontend/src/lib/palette.ts` は各パレットに **4 色のスウォッチ**（例: `dark-teal = #222831 / #393E46 / #00ADB5 / #EEEEEE`）と
  `dark-teal` をデフォルトとして定義している。
- しかし `frontend/src/styles/globals.css` は各 `[data-palette="..."]` ブロックで
  **単一の `--accent-bg`（＋派生の active/subtle/shadow）しか差し替えていない**。
- さらに **`dark-teal` の CSS 定義そのものが存在しない**（デフォルト＝素の brutalist 黄アクセント `#E6FF3D` が表示される）。
- 結論: 「4 色パレット」は選択 UI のスウォッチ表示だけで、**実際のページ配色には反映されていない**。
  → 要件 2 の実体は、この不整合を解消し、スウォッチの 3〜5 色を実配色トークンに接続すること。

### テーブル

- `globals.css` の `.prose table` は `display:block; overflow-x:auto` の固定レイアウト。列幅リサイズ機能は無い。
- Markdown はビルド時に `react-markdown`（`markdown-renderer.tsx`）でレンダリング。
  `table` コンポーネントは現状ラッパ `div.overflow-x-auto` を被せているだけ。
  → リサイズ実装には client component 化と `table-layout:fixed` + `<colgroup>` が必要。

### ガイドライン観点（既に良い点 / 改善余地）

- 良い点: `focus-visible` の太アウトライン、`prefers-reduced-motion`、icon ボタンの `aria-label` は概ね対応済み。
- 改善余地（Phase 3 で対応）:
  - 見出しに `text-wrap: balance` / 本文に `text-pretty` 未適用
  - 数値テーブルに `font-variant-numeric: tabular-nums` 未適用
  - 省略記号・引用符の typographic 化（`…` / カーリークォート）
  - `ImageWithCaption` に明示的 `width`/`height`・`loading="lazy"` 未指定（CLS リスク）
  - 見出しアンカーに `scroll-margin-top`（sticky ヘッダー 3.5rem 分）未指定
  - `<html>` に `color-scheme`、`<meta name="theme-color">` 未同期
  - モバイルナビ/ドロワーに `overscroll-behavior: contain`・`touch-action: manipulation` 未指定
  - `login/page.tsx` の `new Date().getFullYear()` はハイドレーション不一致リスク

---

## 4. Phase 構成

### Phase 1: 配色システム刷新（3〜5 色トークン化）

- `globals.css` の各 `[data-palette="..."]`（light/dark）を、accent だけでなく
  **`surface-secondary` / `accent-subtle` / `border-active` / 第 2 アクセント**まで駆動する
  3〜5 色の役割トークンセットに拡張する。
- **`dark-teal`（デフォルト）の CSS 定義を追加**する。
- `lib/palette.ts` の 4 色スウォッチと、実際に適用される CSS トークンを一致させる。
- 各ページ要素（サイドバー active / ToC / リンクホバー / コードヘッダー / blockquote /
  テーブルヘッダー）で **役割ごとに 3〜5 色が一貫して現れる**ようマッピングする。
- ブルータリズムの制約（radius 0・太ボーダー・ハードシャドウ）は**維持**する。
- light × dark × 全パレットで **AA コントラスト比を検証**し、`palette.ts` に検証コメントを残す。

**主なファイル**: `frontend/src/styles/globals.css`, `frontend/src/lib/palette.ts`

### Phase 2: テーブル列幅リサイズ

- 新規クライアントコンポーネント `frontend/src/components/markdown/resizable-table.tsx` を作成。
  - `table-layout: fixed` + `<colgroup>` の `col` 幅を state 管理（`useRef`/`useState`、mutation 回避）。
  - 各 `<th>` 右端にドラッグハンドルを配置し、pointer イベントで幅更新。
  - アクセシビリティ: ハンドルは `role="separator"` `aria-orientation="vertical"` `aria-label` 付与、
    キーボード（←→）でも幅調整可。
  - `touch-action: none`（ドラッグ中）、`prefers-reduced-motion` 尊重。
  - モバイルは横スクロール維持（ハンドルは md 以上で表示）。
- **列幅をページ単位で localStorage に永続化**するカスタムフック（例: `useColumnWidths(storageKey)`）。
  storageKey は現在の docs slug（ページ）＋テーブル index を用いる。
- `markdown-renderer.tsx` の `table` コンポーネントを `ResizableTable` に差し替える。

**主なファイル**: `frontend/src/components/markdown/resizable-table.tsx`（新規）,
`frontend/src/components/markdown/markdown-renderer.tsx`

### Phase 3: ガイドライン準拠のビジュアル改善

- タイポグラフィ: 見出し `text-wrap: balance`、本文 `text-pretty`、`…`/カーリークォート化。
- テーブル: `.prose td, .prose th` に `font-variant-numeric: tabular-nums`。
- 画像: `ImageWithCaption` に `width`/`height`、below-fold は `loading="lazy"`。
- 見出しアンカー: `scroll-margin-top` を sticky ヘッダー高さ分付与。
- テーマ: `<html>` に `color-scheme`、`<meta name="theme-color">` をヘッダー背景と同期。
- スクロール/タッチ: モバイルナビ/ドロワーに `overscroll-behavior: contain`・`touch-action: manipulation`。
- ハイドレーション: `login/page.tsx` の年表示を `suppressHydrationWarning` 等で安全化。

**主なファイル**: `frontend/src/styles/globals.css`,
`frontend/src/components/markdown/image-with-caption.tsx`,
`frontend/src/app/layout.tsx`, `frontend/src/app/login/page.tsx`

### Phase 4: 検証

- `npm run type-check` / `npm run lint`。
- Playwright E2E（既存 `frontend/e2e/`）にパレット切替・列幅リサイズのスモークを追加。
- agent-browser で各パレット × light/dark のスクリーンショット確認。

---

## 5. 影響ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `frontend/src/styles/globals.css` | パレット 3〜5 色トークン化、`dark-teal` 定義、タイポ/テーブル/スクロール改善 |
| `frontend/src/lib/palette.ts` | スウォッチと CSS トークンの整合、AA 検証コメント |
| `frontend/src/components/markdown/resizable-table.tsx` | **新規** リサイズ可能テーブル |
| `frontend/src/components/markdown/markdown-renderer.tsx` | table コンポーネント差し替え、curly quotes 前処理 |
| `frontend/src/components/markdown/image-with-caption.tsx` | width/height/lazy |
| `frontend/src/app/layout.tsx` | color-scheme, theme-color |
| `frontend/src/app/login/page.tsx` | ハイドレーション安全化 |
| `frontend/e2e/` | パレット切替・列幅リサイズのスモークテスト |

---

## 6. リスク

| レベル | 内容 |
|--------|------|
| MEDIUM | 3〜5 色化により、light × dark × 全パレットで AA コントラストを担保する検証コストが高い |
| MEDIUM | `react-markdown` はビルド時レンダリング → リサイズは client component 化が必要。列数不定の Markdown テーブルへの汎用対応が要る |
| LOW | localStorage の storageKey 設計（ページ＋テーブル index の一意性）|

**複雑度: MEDIUM〜HIGH**（目安 8〜14h）。Phase 1 → 2 → 3 → 4 の順で進め、各 Phase 完了時に確認可能。

---

## 7. 制約（遵守事項）

- 変更は **`frontend/` 配下に限定**。`docs/research/**`・`docs/daily/**` は読み取りのみ、書き換え禁止（CLAUDE.md）。
- ブルータリズムの骨格（radius 0・太ボーダー・ハードシャドウ・mono ラベル）は維持する。
- フロントエンド規約（`.claude/rules/frontend.md`）遵守: 型明示、immutable state、`any` 禁止、`React.FC` 不使用。
