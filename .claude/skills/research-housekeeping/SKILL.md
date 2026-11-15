---
name: research-housekeeping
description: Tidy the research/ tree of the research viewer repository — re-tag domains from all of their files, rename a domain's folder or display name, merge overlapping domains, split a domain, and rename or merge tags — by proposing changes for approval and applying them with dev/research-admin. Use when the user says "調査テーマを整理して", "ドメインを整理して", "タグを付け直して", "タグを見直して", "このドメインを統合して", "ドメインを分けて", "ドメイン名を変えて", "表示名を変えて", "housekeeping", "tidy the research domains", or after new research runs were added and tags may be stale. Runs only when the user invokes it; it never schedules itself.
---

# research-housekeeping — 調査テーマのタグ付けと整理

`research/` の調査テーマ（domain）を見直す skill。**判断は Claude、実行は `dev/research-admin`、承認はユーザー**という分担で動く。仕様の正本は `research/README.md` の「整理」節。

## 用語

| 用語 | 意味 |
|---|---|
| ドメイン | `research/runs/<name>/` と `research/domains/<name>/`。フォルダ名がドメイン名 |
| タグ | ドメイン単位のキーワード。`domains/<name>/domain.yaml` の `tags` に、`research/_meta/tags.yaml` の `id` を書く |
| 整理操作 | タグの付け直し / タグ id の改名・統合 / 表示名の変更 / ドメインの改名・統合・分離 |

## 守ること

- ファイルを手で移動・改名しない。`git mv` も使わない。必ず `dev/research-admin` を通す（リンク書き換え・転送表・変更記録・`latest` がまとめて更新される）。
- 適用（`--apply`）は、ユーザーが承認した操作だけ。承認前は dry-run（`--apply` なし）で影響を見せる。
- `runs/` の中身を書き換えない。`dev/research-admin` が行うリンク書き換えだけが例外。
- `_meta/redirects.yaml` と `_meta/changes/` は手で書かない。`_meta/tags.yaml` は新しいタグの追加と `label` / `aliases` / `description` の修正だけ手で書いてよいが、追加は `dev/research-admin tags add` を使う。

## 手順

### 1. 範囲を決める

ユーザーの指示から対象を決める。例:「タグだけ」→ 手順 3 だけ、「ptcg 周り」→ そのドメインと統合候補だけ。指定がなければ全ドメインで手順 2〜5 を行う。

### 2. 現状を見る

```bash
dev/research-admin check
dev/research-admin report          # 機械向けは --json
```

- `check` の error は先に直す（`domain.yaml` が無いドメインは手順 3 でタグと一緒に作る）。
- `report` の見どころ:
  - `[tags stale]`: タグ未設定、または `tags_reviewed` より新しい run がある → 手順 3 の対象
  - `Overlap candidates`: gather で集めた URL やタグが重なるペア → 統合の候補
  - `Tags`: 1 ドメインにしか付いていないタグ、半分以上に付いているタグ → タグ辞書の見直し候補

### 3. タグを決める（ドメイン単位・全ファイルを総合）

対象ドメインごとに、**全 phase・全日付の index と、`domains/<d>/` の実ファイル**（`README.md` など）を読む。最低限:

- `runs/<d>/clustering/*/index.md`（全日付）
- `runs/<d>/gather/*/*/` と `runs/<d>/retrieval/*/*/index.md`
- `domains/<d>/README.md` と、`domains/<d>/` にあるそのほかの実ファイル

そのうえで:

1. `research/_meta/tags.yaml` の既存タグから当てはまるものを選ぶ（`aliases` も手がかりにする）。
2. 既存に無い概念だけ新しいタグを提案する。id は `snake_case`、`label` は画面に出す日本語か英語の短い名前。
3. 1 ドメインあたり 3〜6 個を目安にする。特定のドメインにしか付かないタグばかりにしない（横断できることが目的）。

### 4. 構造の変更を判断する

| 操作 | 判断の目安 |
|---|---|
| 統合（merge） | 同じ対象（同じコンペ・同じ製品・同じ問い）を別の観点で調べている。URL の重複が多い |
| 分離（split） | 1 ドメインの中に、互いにほとんど関係しない run がある |
| 改名（rename） | フォルダ名が中身を表していない。表示名だけで足りるなら `title` を使う |
| タグ id の改名・統合 | 同義のタグがある、粒度がそろっていない |

統合では、統合先は内容が広いほう・既存リンクが多いほうにする。統合元と統合先の両方に `README.md` があるなどの衝突は dry-run が conflicts として出すので、解消案もあわせて提案する。

### 5. 提案して承認を得る

提案を 1 つの表にまとめ、操作ごとに承認・却下を選べるようにする（AskUserQuestion の multiSelect）。各行に「操作 / 対象 / 理由 / dry-run で分かった影響（移動数・リンク書き換え数・衝突・`relink latest: ... a -> b` で示される latest の切り替わり）」を載せる。latest が統合元の run に切り替わる場合は、それでよいかを明示して確認する。

dry-run の例:

```bash
dev/research-admin tags add imperfect_info "不完全情報ゲーム"
dev/research-admin tags set kaggle_ptcg game_ai imperfect_info kaggle
dev/research-admin merge kaggle_ptcg_ai_battle --into kaggle_ptcg --reason "同一コンペ"
dev/research-admin split cate --to cate_metrics --paths runs/cate/retrieval/20260322 --title "uplift 評価指標"
dev/research-admin rename legal_tech legal_ai --reason "対象を明確化"
dev/research-admin title dataiku "Dataiku 活用事例"
dev/research-admin tags merge rl reinforcement_learning --into reinforcement_learning
```

### 6. 適用する

承認された操作だけ、同じコマンドに `--apply` を付けて順に実行する。順序は「タグ辞書の追加 → 構造の変更（merge / split / rename）→ タグの付け直し（tags set）」。構造を変えると統合先の `tags_reviewed` が消えるので、最後に付け直す。

- 失敗した操作は自動で元に戻る（`not applied: ...`）。表示された問題を直してから再実行する。
- 構造の変更の後は `dev/sync-domain-links` が自動で走る。

### 7. 確認して報告する

```bash
dev/research-admin check
```

error が 0 であることを確認し、変えた内容（タグ・移動・転送の追加）と、却下・保留にしたものを報告する。コミットや PR はユーザーに言われたときだけ作る。
