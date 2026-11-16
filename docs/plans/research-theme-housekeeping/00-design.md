# 調査テーマのタグ付けと整理 — 設計

## 0. 用語

| 用語 | 意味 |
|---|---|
| 調査テーマ | `research/runs/<テーマ名>/` の 1 ディレクトリ。テーマ名はフォルダ名そのもの |
| 実行結果 | ある段階（clustering / gather / retrieval）を 1 回実行した結果。`runs/<テーマ名>/<段階>/<日付>/` |
| 表示名 | 画面に出す調査テーマの名前。`domain.yaml` の `display_name`。フォルダ名とは別 |
| タグ | 調査テーマに付けるキーワード。1 テーマに複数付く |
| タグ辞書 | 使ってよいタグの一覧ファイル（後述 `tags.yaml`） |
| 転送表 | 古いパスから新しいパスへの対応表（後述 `redirects.yaml`）。改名・統合・分離のたびに追記する |
| 変更記録 | 整理操作 1 回ごとに残す記録ファイル（後述 `changes/`） |
| 整理操作 | 次の 6 種類。タグの付け直し / タグの改名・統合 / 表示名の変更 / テーマの改名 / テーマの統合 / テーマの分離 |
| 管理スクリプト | 整理操作を機械的に実行するスクリプト `dev/research-admin`（新規） |
| 整理 skill | どの整理操作をするかを Claude が判断・提案する skill `research-housekeeping`（新規） |

## 1. 要件

1. タグは調査テーマ単位で付ける。テーマ内の全ファイル（全段階・全実行結果）を総合して決める。
2. タグの変更、表示名・フォルダ名の変更、テーマの統合・分離を、ユーザーが好きなタイミングで skill を起動して行える。
3. 変更が容易であること。1 回の操作がコマンド 1 つで終わり、壊れたら検出できること。

## 2. 設計の基本方針

**判断は skill、実行はスクリプト、検証は CI に分ける。**

- 何を変えるか（どのタグを付けるか、どれを統合するか）は Claude が中身を読んで判断する。→ 整理 skill
- ファイル移動、リンク書き換え、転送表・変更記録の追記は毎回同じ手順なので、スクリプトにする。→ 管理スクリプト
- 整合性は毎回機械でチェックする。→ `dev/research-admin check` を CI に入れる

こうすると、skill は「提案して、承認されたらコマンドを呼ぶ」だけになり、操作の正しさはスクリプトとテストで保証できる。

**追記のみ規約を次のように改める。**

- 実行結果の**中身**は今までどおり書き換えない。
- 実行結果の**置き場所**（どのテーマのフォルダにあるか）は、管理スクリプト経由に限って変えてよい。変えたら必ず転送表と変更記録に残す。
- 例外として、改名・統合で壊れる内部リンクの書き換えだけは、管理スクリプトが中身に対して行ってよい。

## 3. ファイル構成

```
research/
├── _meta/                         # 新規（research.md の禁止事項に追加で許可する）
│   ├── tags.yaml                  # タグ辞書
│   ├── redirects.yaml             # 転送表
│   └── changes/                   # 変更記録
│       └── 20261115-merge-kaggle_ptcg.yaml
├── runs/<テーマ名>/...             # 既存
└── domains/<テーマ名>/domain.yaml  # 既存。tags 等を追加。全テーマに必須化
```

`_meta/` は viewer の一覧・検索から除外する（`IGNORED_NAMES` に追加）。

### 3.1 `domain.yaml`（追加項目）

```yaml
domain: kaggle_ptcg              # フォルダ名と一致必須（check で検証）
display_name: Pokémon TCG AI Battle Challenge
tags: [game_ai, imperfect_info, kaggle]   # タグ辞書の id のみ
tags_reviewed: 2026-11-15        # タグをテーマ全体から見直した日
```

- 現在 `domain.yaml` があるテーマは 11 中 4。残りは初回整理で作る。
- 古い `output_paths`（`{date}_{cluster}` 形式）は初回整理で削除する。

### 3.2 `tags.yaml`（タグ辞書）

```yaml
- id: imperfect_info             # domain.yaml から参照するキー
  label: 不完全情報ゲーム          # 画面表示。自由に変えてよい（domain.yaml は触らない）
  aliases: [imperfect information]   # 同義語。skill がタグを選ぶ時の手がかり
  description: 相手の情報が隠れたゲームの AI
```

- 画面に出る名前の変更は `label` を書き換えるだけで済む。
- `id` 自体の改名・統合は管理スクリプトで全 `domain.yaml` を一括で書き換える。

### 3.3 `redirects.yaml`（転送表）

```yaml
- from: runs/kaggle_ptcg_ai_battle            # パスの先頭一致で置き換える
  to: runs/kaggle_ptcg
  change: 20261115-merge-kaggle_ptcg
- from: runs/kaggle_ptcg_ai_battle/clustering/20260626
  to: runs/kaggle_ptcg/clustering/20260626-2
  change: 20261115-merge-kaggle_ptcg
```

- 一番長く一致する `from` を採用する。
- 転送先がさらに転送されている場合は、たどって最終の転送先にする（check で循環を検出する）。

### 3.4 `changes/<日付>-<操作>-<対象>.yaml`（変更記録）

```yaml
op: merge
date: 2026-11-15
from: [kaggle_ptcg_ai_battle]
into: kaggle_ptcg
reason: 同一コンペの調査。gather の論文 URL の 60% が重複
moved:                           # 管理スクリプトが自動で書く
  - runs/kaggle_ptcg_ai_battle/clustering/20260626 -> runs/kaggle_ptcg/clustering/20260626-2
```

## 4. 整理操作の仕様（管理スクリプト）

すべてのコマンドは**既定で dry-run**（何が変わるかを表示するだけ）。`--apply` で実行する。

| コマンド | 変えるもの |
|---|---|
| `tags set <テーマ> <id...>` | その `domain.yaml` の `tags` と `tags_reviewed` |
| `tags rename <旧id> <新id>` / `tags merge <id...> --into <id>` | `tags.yaml` と、該当する全 `domain.yaml` |
| `title <テーマ> "<表示名>"` | `display_name` だけ。フォルダは動かさない |
| `rename <旧テーマ名> <新テーマ名>` | 下記「移動時の共通処理」 |
| `merge <テーマ...> --into <テーマ>` | 統合元の全実行結果を統合先へ移し、統合元フォルダを消す |
| `split <テーマ> --to <新テーマ> --paths <実行結果...>` | 指定した実行結果だけを新テーマへ移す |
| `check` | 何も変えない。整合性を検証する（5 章） |
| `report` | 何も変えない。整理 skill 用の診断を出す（6 章） |

### 移動時の共通処理（rename / merge / split）

1. `git mv` で `runs/<テーマ>/...` と `domains/<テーマ>/` の実ファイルを移動する。
2. 日付の衝突を解消する（下記）。
3. 各段階の `latest` を、移動後の最新の日付ディレクトリに張り直す。
4. 移動した実行結果を指す内部リンクを、`research/` 全体で書き換える。相対リンクは移動後の位置から計算し直す。
5. `domain.yaml` を更新する。統合では統合元の `tags` を統合先へ合算し、`tags_reviewed` を消して見直し対象にする。
6. `redirects.yaml` と `changes/` に追記する。
7. `dev/sync-domain-links` を実行する。
8. `check` を実行し、失敗したら中止する（作業ツリーは git で戻せる）。

### 日付の衝突

統合では、同じ日付の実行結果が両方のテーマにあり得る。実例として、`kaggle_ptcg` と `kaggle_ptcg_ai_battle` は 3 段階とも `20260626` がある。

- **clustering**：日付ディレクトリ名を `<YYYYMMDD>-<n>`（n = 2, 3, …）にする。viewer の日付判定（`domain-view.ts` の `DATE_DIR`、`content-index.ts`）を `^\d{8}(-\d+)?$` に広げ、同じ日付の中では n の大きいほうを新しいものとして扱う。
- **gather / retrieval**：その下のクラスタ名が重ならなければ、同じ日付ディレクトリにまとめる。重なる場合は dry-run で停止し、`--cluster-suffix` の指定を求める。ptcg の例では重ならない。

## 5. 整合性チェック（`check`、CI で実行）

- すべてのテーマに `domain.yaml` があり、`domain` がフォルダ名と一致している。
- `tags` はタグ辞書の `id` だけを使っている。辞書にあって、どのテーマにも使われていないタグは警告にする。
- `latest` が、その段階の最新の日付ディレクトリを指している。
- 内部リンクがすべて解決できる。
- 転送表の転送先が存在し、循環していない。
- 転送表の `from` に、実在するパスがない（転送元に新しいファイルが作られていない）。

## 6. 診断（`report`）と整理 skill

### 6.1 `report` が出すもの

| 項目 | 判定 |
|---|---|
| タグが古いテーマ | `tags_reviewed` より新しい実行結果がある |
| タグ未設定のテーマ | `tags` が空 |
| 統合候補 | 2 テーマ間で、gather の資料 URL の重複率、またはタグの一致率が高い |
| 分離候補 | 1 テーマ内で、実行結果同士の資料 URL・タグがほとんど重ならない |
| タグの偏り | 1 テーマにしか付いていないタグ、全体の半分以上に付いているタグ |

### 6.2 整理 skill（`research-housekeeping`）の手順

1. `dev/research-admin check` と `report` を実行する。
2. タグが古い・未設定のテーマについて、テーマ内の全段階の index と本文を読み、タグ辞書から付けるタグを決める。辞書にない概念は新しいタグとして提案する。
3. 統合・分離・改名の候補について、中身を読んで妥当か判断する。
4. 提案を 1 つの表にまとめて、ユーザーに承認を求める。操作ごとに承認・却下を選べるようにする。
5. 承認された操作だけ、管理スクリプトを dry-run → `--apply` の順で実行する。
6. `check` を通し、コミットして PR を作る。

- 置き場所：ハブの `skills/repos/research/research-housekeeping/`。このリポジトリ専用の skill として配布する。
- 既存の research skill 3 本（ほかのリポジトリとも共有）は変更しない。新しい実行結果を足すと、`report` が自動で「タグが古い」と判定する。
- 起動方法：定期タスクは作らず、ユーザーが好きなタイミングで skill を起動する（例：「調査テーマを整理して」）。起動のたびに手順 1〜6 を通しで行い、手順 4 の承認で止まる。
- 対象の絞り込み：起動時に対象を指定できるようにする（例：「タグだけ見直して」「ptcg 周りだけ」）。指定がなければ全テーマを対象にする。

## 7. viewer の変更

| 変更 | 場所 |
|---|---|
| タグ辞書と各テーマのタグを読み込む。ホームとテーマ一覧でタグ表示・タグ絞り込みを行う | `content-index.ts`、`components/home/*` |
| 見つからないパスを転送表で引き、見つかれば新しいパスへ `redirect()` する。ページとアセット配信の両方 | `research/[[...slug]]/page.tsx`、`api/research-assets` |
| 個人メモ（DynamoDB）は文書のパスをキーにしているので、改名・移動で見えなくなる。読み込み時に、転送表を逆にたどった旧パスのメモもまとめて取得する。更新・削除は、メモに保存されているパスで行う | `lib/notes/dynamo.ts`、`api/notes` |
| 日付ディレクトリの判定を `-<n>` 付きに広げる | `domain-view.ts`、`content-index.ts` |
| `_meta/` を一覧・検索から除外する | `IGNORED_NAMES` |

個人メモの旧パスを新パスに一括で書き換えるスクリプトは、AWS の認証情報が要るので今回は作らない。読み込み時の補完で足りなくなったら追加する。

## 8. 実装の順序

| # | 内容 | 完了条件 |
|---|---|---|
| 1 | `_meta/` の仕様、`domain.yaml` の項目追加、ルール文書の改定（`research/README.md`、`.claude/rules/research.md`、`CLAUDE.md`） | 文書が揃う |
| 2 | 管理スクリプトの `check` と `report`。中身は `frontend/src/lib/research-admin/` に TypeScript で置き、viewer と転送表の解決処理を共有する。`dev/research-admin` から `bunx tsx` で呼ぶ | vitest が通る。CI に `check` を追加 |
| 3 | 管理スクリプトの整理操作（`tags` / `title` / `rename` / `merge` / `split`）。テスト用の小さなテーマ構成で各操作を検証する | 各操作の単体テストが通る |
| 4 | viewer の変更（7 章） | 型チェック・単体テスト・E2E が通る |
| 5 | 整理 skill をハブで作成し、`check-paths` を通して配布する | このリポジトリで skill が起動する |
| 6 | 初回の整理：全 11 テーマに `domain.yaml` とタグを付け、`kaggle_ptcg_ai_battle` を `kaggle_ptcg` に統合する | `check` が通り、旧 URL が新 URL へ転送される |

## 9. 決定事項

1. **studies / discussions との関係**：`domains/<テーマ>/` に `studies/` と `discussions/` を置く変更（#102）とは別の PR（#104）で入れ、両方マージ済み。管理スクリプトは特定のフォルダ名に頼らず、`domains/<テーマ>/` の実ファイル・実ディレクトリ（ビューの symlink 以外）を移動とリンク書き換えの対象にする。タグ付けでは studies / discussions も材料にする。
2. **整理は任意のタイミングで起動する**：定期タスクは作らない。ユーザーが整理 skill を起動したときだけ実行する（6.2 節）。
