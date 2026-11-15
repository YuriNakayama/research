# Research Directory Rules

`research/**` 配下のファイルを作成・編集する際は、本ルールに従ってください。`research/**` はリポジトリルート直下の**表示用リサーチ成果物**領域で、viewer（`/research`）が配信します。

## 必読ファイル

何らかの操作を行う前に、必ず **`research/README.md`** を読んでください。構成・出力先決定フロー・命名規約はそこに記載されています。

## 基本ルール

1. **`runs/` は append-only**: 既存の run ディレクトリを書き換えたり削除したりしないでください。新しい結果は必ず新しい日付ディレクトリを作成して追加します。唯一の例外は「整理」で、`dev/research-admin` 経由に限り run の置き場所の移動と内部リンクの書き換えを行えます（ルール 9）。
2. **skill の新規出力は必ず日付ディレクトリ配下に配置**: clustering は `runs/<domain>/clustering/<date>/`、gather / retrieval は `runs/<domain>/<phase>/<date>/<cluster>/` に置きます。skill の出力を `domains/` に直接置かないでください（`domains/<domain>/{clustering,resources,reports}` は `runs/` への symlink です）。
3. **`domains/<domain>/domain.yaml` は全ドメイン必須**: 新規ドメインを作ったら `domain` / `display_name` / `tags: []` を持つ `domain.yaml` を作成します。`output_paths` が定義されていれば、その値を README の既定値より優先します。
4. **clustering は複数回実行され得る**: 同一ドメインで再クラスタリングを行う場合、過去の `runs/<domain>/clustering/<old_date>/` は残し、新しい `<new_date>/` を追加して `latest` symlink を更新します。
5. **完了後の latest 更新**: 新規 run を追加したら、phase ごとに 1 本の `runs/<domain>/<phase>/latest`（最新の日付ディレクトリを指す）を更新し、続いて `dev/sync-domain-links` を実行して `domains/` ビューを再生成します。クラスタごとの `latest_<cluster>` は使いません。
6. **`domains/` の symlink は表示の正しさに関与しない**: viewer は `domains/` の symlink を読まず、`runs/` から同じ規則で導出します（`frontend/src/lib/domain-view.ts`）。symlink は人が git やファイラで辿るための便宜なので、ずれても表示は壊れません。`dev/sync-domain-links --check` で差分を検出できます。
7. **skill 外の成果物は `domains/<domain>/` に実ファイルで置く**: skill のフローに乗らない調査は `domains/<domain>/studies/<YYYYMMDD>-<slug>/`（入口は `index.md`）、論文・レビューへの議論は `domains/<domain>/discussions/<YYYYMMDD>-<slug>.md` に置きます。どちらも `runs/` と違い加筆修正してよい領域です。
8. **タグはドメイン単位**: `domain.yaml` の `tags` には `research/_meta/tags.yaml` に定義された `id` だけを書きます。ドメイン内の全ファイルを総合して付けます。新しいタグが必要なら、先に `tags.yaml` に追加します。
9. **改名・統合・分離・タグ id の変更は `dev/research-admin` で行う**: `git mv` や手作業でドメインのフォルダを動かさないでください。管理スクリプトが移動・リンク書き換え・転送表（`_meta/redirects.yaml`）・変更記録（`_meta/changes/`）をまとめて更新します。何を変えるかの判断は整理 skill（`research-housekeeping`）が行い、ユーザーの承認を得てから実行します。
10. **`_meta/` は手で書き換えない**: 例外は `tags.yaml` の `label` / `aliases` / `description` と新しいタグの追加だけです。`redirects.yaml` と `changes/` は `dev/research-admin` だけが追記します。

## 人手の層の配置

| 種別        | 置き場所                                              | 更新 |
|-------------|-------------------------------------------------------|------|
| studies     | `research/domains/<domain>/studies/<YYYYMMDD>-<slug>/` | 新しい調査は新しいディレクトリで追加。既存の加筆修正は可 |
| discussions | `research/domains/<domain>/discussions/<YYYYMMDD>-<slug>.md` | 書き換え可 |

- studies の `index.md` 冒頭に `- **Type**: playbook | survey | experiment | spec | memo` を書く
- discussions は冒頭で対象を `/research/...` リンクで示す
- `<YYYYMMDD>` は作成日、`<slug>` は `kebab-case`

## phase 別の既定出力先

| phase       | 既定出力先                                              |
|-------------|---------------------------------------------------------|
| clustering  | `research/runs/<domain>/clustering/<YYYYMMDD>/`         |
| gather      | `research/runs/<domain>/gather/<YYYYMMDD>/<cluster>/`   |
| retrieval   | `research/runs/<domain>/retrieval/<YYYYMMDD>/<cluster>/`|

クラスタが特定できない場合は `<cluster>` を `all` とします。

## ドメイン名の決定

1. 入力ファイルのパスから推定: `research/(runs|domains)/<domain>/...`
2. 推定不能ならユーザーに確認、または会話文脈から `snake_case` のドメイン名を生成
3. 既存ドメイン一覧は `ls research/domains/` または `ls research/runs/` で確認

## 禁止事項

- `runs/` 配下の既存ファイルを書き換えること（過去 run の改変。`dev/research-admin` による整理を除く）
- `dev/research-admin` を通さずにドメインのフォルダを改名・統合・分離すること
- `_meta/tags.yaml` に定義されていないタグを `domain.yaml` に書くこと
- `domains/<domain>/{clustering,resources,reports}` に実ファイルを作成すること（symlink のビュー専用）
- `domains/<domain>/` 直下に `domain.yaml` / `README.md` / `studies/` / `discussions/` 以外の実ファイル・ディレクトリを作成すること
- skill 外の調査や議論を `runs/` 配下に置くこと
- `research/` 直下に新規ディレクトリを作成すること（`runs/` `domains/` `_meta/` `_schema/` 以外）

## viewer との境界

- `research/**` はビルド時に `frontend/research` へコピーされ、`/research` 配下で描画される。ファイル配置がそのまま公開 URL 構造になる。
- 開発用ドキュメントは `docs/**`（viewer 非対象）。両者を混同しないこと。
- E2E フィクスチャは `research/_e2e_fixture/...` と `research/domains/_e2e_fixture/{studies,discussions}/...` にビルド時生成される（`frontend/scripts/setup-e2e-fixtures.mjs`）。手動で編集・コミットしない。
