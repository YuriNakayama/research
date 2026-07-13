# docs ディレクトリ整理 実装計画

> このドキュメントは `/plan` セッションで確定した方針・決定事項・影響範囲・Phase 構成・リスクを記録したもの。
> 以降の実装は worktree 上でこの Markdown を正として進める。
>
> - 作成日: 2026-07-14
> - 対象ブランチ (worktree): `chore/docs-reorganization`
> - ステータス: **計画確定 / 実装未着手**

---

## 1. 背景と目的

リポジトリの `docs/` に「開発時ドキュメント (dev-time)」と「表示用ドキュメント (リサーチ成果物)」が混在している。
責務境界を明確化するため、以下の再編を行う。

- **`docs/` は開発用ディレクトリにする**（`plans/` などの開発時ドキュメント置き場）。
- **リポジトリルートに新規 `research/` を作成**し、表示用 Markdown（現 `docs/research/**`）を移動する。
- **`docs/daily/` および daily 機能を全廃止**する。
- **viewer の公開 URL を `/docs` → `/research` に刷新**する。

---

## 2. 確定した決定事項

| 項目 | 決定 |
|------|------|
| `docs/research/**`（585 ファイル） | ルート新規 **`research/`** へ `git mv`（表示用） |
| `docs/`（`plans/` 等 33 ファイル） | **開発用ディレクトリとして存続** |
| `docs/daily/**`（5 ファイル） | **削除** |
| daily 機能 | **全廃止**（ディレクトリ + backend 経路 + skill/CLI + infra scheduler） |
| viewer 公開 URL | **`/docs` → `/research` に刷新**（URL も刷新する A-2 案） |
| backend の表示用パス参照 | `research/` 追従に修正 |
| backend パイプライン | Phase 0 で全数調査し、必要なら修正 |

### 決定に至った Q&A（要約）

1. **分離の向き**: dev-time を外に出すのではなく、**表示用を外の `research/` へ移し `docs/` を開発用に明け渡す**。
2. **daily の扱い**: 削除。さらに **daily 機能そのものを全廃止**。
3. **viewer URL**: `/docs` のまま維持ではなく **`/research` へ刷新**。
4. **backend 影響**: 調査して必要なら修正。

---

## 3. 現状分析（調査結果スナップショット）

`docs/` 直下（調査時点）:

| ディレクトリ | 種別 | ファイル数 | viewer 表示 |
|------|------|-----------|-------------|
| `docs/plans/` | 開発用（機能設計プラン 5 件） | 33 | ❌ 非表示 |
| `docs/research/` | 表示用（手動リサーチ成果物） | 585 | ✅ 表示 |
| `docs/daily/` | 表示用（自動パイプライン出力・legacy 指定済み） | 5 | ✅ 表示 |

重要な発見:

- フロント viewer の表示対象はコード上で `frontend/src/lib/docs-content.ts` の
  `DOCS_ROOT = process.cwd()/docs`、`SCAN_DIRS = ["research", "daily"]` で限定されている。
  → `docs/plans/` は **既に viewer 非対象**。
- `docs/research/domains/*` は research.md のルール（symlink 構成）に反し **実ディレクトリ**。
  中の `clustering` 等一部のみ `../../runs/...` への相対 symlink。
- `docs/research/legal_tech/`（空の bare dir・禁止配置の残骸）、`docs/.DS_Store` が存在。

---

## 4. 確定した影響範囲（全数）

### 4.1 表示用の移動

- `docs/research/**` → `research/**`。
- symlink（`domains/*/clustering → ../../runs/...`）の **移動後の解決を要検証**。

### 4.2 フロント刷新（`/docs` → `/research`）

- URL `/docs` 参照: **10 ファイル / 13 箇所**
  - `frontend/src/app/(authenticated)/page.tsx`
  - `frontend/src/app/(authenticated)/docs/[[...slug]]/page.tsx`
  - `frontend/src/components/markdown/markdown-renderer.tsx`
  - `frontend/src/components/layout/header.tsx`
  - `frontend/src/components/docs/docs-layout.tsx`
  - `frontend/src/components/docs/directory-index.tsx`
  - `frontend/src/components/docs/directory-tree.tsx`
  - `frontend/src/components/docs/breadcrumbs.tsx`
  - `frontend/src/components/docs/mobile-nav.tsx`
  - `frontend/src/lib/docs-content.ts`
- ルーティングディレクトリ: `app/(authenticated)/docs/` → `app/(authenticated)/research/` へリネーム。
- アセット API: `app/api/docs-assets/[...path]/route.ts` → `research-assets/`（または据え置き + 内部パス修正）。
- `docs-content.ts`: `DOCS_ROOT` を `research` に、`SCAN_DIRS` 撤廃、URL 生成 `/docs` → `/research`。
- `next.config.ts` / `.github/workflows/ci-frontend.yml` / `infra/modules/amplify/main.tf` の `docs` パス前提を確認。

### 4.3 daily 全廃止の依存

- backend: `main.py`, `config.py`, `csv_manager.py`（削除）, `git_manager.py`, `email_notifier.py`
- config: `backend/config/research-config.yaml` の `daily:` ブロック
- infra: `infra/modules/scheduler`（EventBridge `daily_research`）
- skill/CLI: `.claude/skills/daily-add`、`backend/scripts/daily_add.py`
- docs: `.claude/CLAUDE.md`（daily 12 言及 + 「Daily Pipeline」節）
- 特記: `backend/src/main.py:38-73` の site URL 生成が `docs/daily/...` → `/docs/daily/...` を直書きマッピングしている。

---

## 5. Phase 構成

### Phase 0 — 調査確定（先行必須）
- daily 依存の完全な呼び出しグラフを確定（scheduler が daily 専用か research 実行と共用か）。
- symlink（`domains/*/clustering` 等）の移動後解決を検証。
- daily 廃止後にパイプラインに残る経路を確定。

### Phase 1 — 表示用の移動
- `git mv docs/research research`。
- symlink 解決確認。`docs/` に `plans/` のみ残る状態にする。

### Phase 2 — フロント刷新
- 配信元を `docs/` → `research/` に変更。
- ルーティング `app/(authenticated)/docs/` → `research/` リネーム、アセット API リネーム。
- `docs-content.ts` 全面修正（`DOCS_ROOT`/`SCAN_DIRS`/URL 生成）。
- 10 ファイルの `/docs` → `/research` 置換。
- `next.config.ts`/`ci-frontend.yml`/`amplify` のパス確認。
- フロントビルド green 化。

### Phase 3 — daily 全廃止
- `git rm -r docs/daily`。
- `csv_manager.py`・`daily_add.py`・`.claude/skills/daily-add` 削除。
- `main.py`/`config.py`/`git_manager.py`/`email_notifier.py` から daily 経路除去。
- `research-config.yaml` の `daily:` ブロック削除。
- infra scheduler の daily リソース整理（scheduler が daily 専用なら削除、共用なら分岐整理）。

### Phase 4 — backend 表示用パス修正
- `main.py` の site URL マッピングを `/research` に追従。

### Phase 5 — ドキュメント / ルール更新
- `.claude/CLAUDE.md`（Daily 節撤去、`docs/` = 開発用 / `research/` = 表示用を明記）。
- `.claude/rules/research.md`（`docs/research/**` → `research/**` 前提に更新）。
- `research/README.md` を新パス前提に更新。

### Phase 6 — 回帰確認
- `dev/test-backend`、フロントビルド、E2E（Playwright）。

---

## 6. リスク

| 重大度 | リスク | 対応 |
|--------|--------|------|
| HIGH | daily 廃止で backend 共通経路（`git_manager`/`email_notifier`/`config`）を壊す | Phase 0 で research 実行系と daily 系の分岐を正確に切る |
| HIGH | infra scheduler が daily 専用か research と共用かの誤判断で自動実行停止 | Phase 0 で scheduler の対象タスクを確定 |
| HIGH | `main.py` の site URL マッピングが daily 前提直書き。修正漏れで PR 内リンク破損 | Phase 4 で `/research` に追従 |
| MEDIUM | `/docs` → `/research` URL 刷新の漏れ（内部リンク解決・アセット API） | Phase 2 で 13 箇所を全数置換・ビルド確認 |
| MEDIUM | symlink 相対パスの階層移動後の解決 | Phase 0/1 で検証 |
| MEDIUM | Amplify/CI が `docs/` パス前提でないか | Phase 2 で確認 |

---

## 7. 複雑度見積もり

**HIGH（合計 6〜8 時間程度）**

- フロント刷新: 2〜3h
- daily 全廃止（backend 5 モジュール + infra + skill/CLI）: 2〜3h
- ドキュメント / ルール更新: 1h
- 回帰確認: 1h

daily が backend 中核（`main.py`/`config.py`/`csv_manager.py`/`git_manager.py`/`email_notifier.py`）に食い込んでいるため、Phase 3 が最もリスキー。

---

## 8. 実装の進め方（worktree 運用）

- 本ドキュメントを正として、worktree `chore/docs-reorganization` 上で Phase 0 から順に進める。
- 各 Phase 完了時に本ファイルのステータス欄・チェックを更新する。
- `docs/research/**`（移動後 `research/**`）の append-only ルールは維持し、過去 run の中身は改変しない（`git mv` によるディレクトリ移動は中身を変えないため趣旨に反しない）。

### Phase チェックリスト

- [ ] Phase 0 — 調査確定
- [ ] Phase 1 — 表示用の移動
- [ ] Phase 2 — フロント刷新
- [ ] Phase 3 — daily 全廃止
- [ ] Phase 4 — backend 表示用パス修正
- [ ] Phase 5 — ドキュメント / ルール更新
- [ ] Phase 6 — 回帰確認
