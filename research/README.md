# Research Directory Layout

このディレクトリは research 系 skill (`research-clustering` / `research-gather` / `research-retrieval`) の出力先であり、skill のフローに乗らない人手の調査・議論の置き場でもあります。viewer（`/research`）が配信する表示用リサーチ成果物領域です。**skill とユーザーは出力先を決める前に必ず本ファイルを読んでください**。

## 設計原則

1. **`runs/` は append-only** — 実行のたびに新しいディレクトリを追加し、過去のものは書き換えません。これが source of truth です。例外は「整理」（後述）だけで、`dev/research-admin` 経由に限り、実行結果の**置き場所**の移動と、移動で壊れる内部リンクの書き換えを行えます。実行結果の中身そのものは整理でも書き換えません。
2. **`domains/` は最新ビュー + 人手の層** — `runs/` の最新版を指すシンボリックリンク（`clustering` / `resources/` / `reports/`）と、人が書く実ファイル（`domain.yaml` / `README.md` / `studies/` / `discussions/`）で構成します。
3. **同一ドメインで `clustering` は複数回実行され得る** — 再クラスタリングで構造が変わった場合も過去の run は残し、`latest` ポインタだけを更新します。
4. **skill の phase は3種固定**: `clustering` / `gather` / `retrieval`（`runs/` 配下）
5. **skill 外の成果物は `domains/<domain>/` に実ファイルで置く** — skill のフローに乗らない調査は `studies/`、論文・レビューへの議論は `discussions/`。`runs/` には書きません。
6. **最上位は分類しない。タグで横断する** — 調査は任意の観点で始まるため、ドメインを上位分類の木に収めることはしません。各ドメインに `domain.yaml` の `tags` を付け、タグの付け直し・ドメインの改名・統合・分離は「整理」で随時行います。

## ディレクトリ構成

すべての phase (`clustering` / `gather` / `retrieval`) で、run ディレクトリは
**日付単位 (`<YYYYMMDD>/`)** に統一します。`gather` / `retrieval` はその日付ディレクトリの
直下に **クラスタごとのサブディレクトリ (`<cluster>/`)** を置きます。`latest` は
phase ごとに **1本** で、最新の日付ディレクトリを指します。

```
research/
├── README.md                                # このファイル（構成の単一情報源）
│
├── _meta/                                   # 【整理の管理情報】dev/research-admin が更新する
│   ├── tags.yaml                            # タグ辞書
│   ├── redirects.yaml                       # 転送表（旧パス → 新パス）
│   └── changes/                             # 変更記録（構造・タグ id の変更 1 回 = 1 ファイル）
│       └── <YYYYMMDD>-<op>-<target>.yaml
│
├── domains/                                 # 【最新ビュー + 人手の層】ドメイン中心
│   └── <domain>/
│       ├── domain.yaml                      # ドメインメタ（必須。タグもここに書く）
│       ├── README.md                        # ドメインの概要（任意）
│       ├── clustering -> ../../runs/<domain>/clustering/latest      # symlink
│       ├── resources/                       # symlink: 各クラスタの最新リソース一覧
│       │   └── <cluster> -> ../../../runs/<domain>/gather/<YYYYMMDD>/<cluster>
│       ├── reports/                         # symlink: 各クラスタの最新詳細レポート
│       │   └── <cluster> -> ../../../runs/<domain>/retrieval/<YYYYMMDD>/<cluster>
│       ├── studies/                         # 実ファイル: skill 外の調査
│       │   └── <YYYYMMDD>-<slug>/
│       │       ├── index.md
│       │       └── *.md
│       └── discussions/                     # 実ファイル: 論文・レビューへの議論
│           └── <YYYYMMDD>-<slug>.md
│
└── runs/                                    # 【実行履歴】append-only
    └── <domain>/
        ├── clustering/
        │   ├── <YYYYMMDD>/                  # 1回ごとの clustering 結果
        │   │   ├── index.md
        │   │   ├── cluster-01-*.md
        │   │   └── ...
        │   └── latest -> <YYYYMMDD>         # 最新版へのシンボリックリンク
        ├── gather/
        │   ├── <YYYYMMDD>/                  # 実行日ごとの gather 結果
        │   │   └── <cluster>/               # cluster 単位 or domain 全体 (`all`)
        │   │       └── resources-*.md
        │   └── latest -> <YYYYMMDD>         # 最新の日付ディレクトリへのリンク
        └── retrieval/
            ├── <YYYYMMDD>/                  # 実行日ごとの retrieval 結果
            │   └── <cluster>/               # 詳細レポート群
            │       ├── index.md
            │       ├── 01-*.md
            │       └── ...
            └── latest -> <YYYYMMDD>         # 最新の日付ディレクトリへのリンク
```

> **クラスタを区別しない場合** は `<cluster>` を `all` とし、`<YYYYMMDD>/all/` に出力します。

## 出力先決定フロー（skill 用）

skill は次の手順で出力先を決定します。

1. **ドメイン名 `<domain>` を特定**
   - 入力ファイルパスから推定 (`research/runs/<domain>/...` / `research/domains/<domain>/...`)
   - 推定不能ならユーザーに確認、または会話文脈から `snake_case` のドメイン名を生成
2. **`research/domains/<domain>/domain.yaml` が存在すれば読む** — `output_paths` テンプレが定義されていればそれに従う
3. **存在しない場合は下表の既定パスを使用**
4. **`<date>` は実行日 (`YYYYMMDD`)、`<cluster>` は対象クラスタ ID (`snake_case` or `kebab-case`)**
5. **完了後、phase ごとの `latest` ポインタと `domains/` ビューを更新**（skill / 人手）
6. **新規ドメインの場合は `domains/<domain>/domain.yaml` を作成**（`domain` / `display_name` と、空の `tags: []`）。タグは整理で付けます。

### phase 別の既定出力先

| phase       | skill                | 既定出力先                                                   |
|-------------|----------------------|--------------------------------------------------------------|
| clustering  | `research-clustering`| `research/runs/<domain>/clustering/<YYYYMMDD>/`              |
| gather      | `research-gather`    | `research/runs/<domain>/gather/<YYYYMMDD>/<cluster>/`        |
| retrieval   | `research-retrieval` | `research/runs/<domain>/retrieval/<YYYYMMDD>/<cluster>/`     |

クラスタ単位ではなくドメイン全体を対象にする場合は `<cluster>` を `all` とします。

### latest ポインタの規約

`latest` は phase ごとに **1本** で、最新の**日付ディレクトリ**を指します。クラスタごとの
`latest_<cluster>` は廃止しました（クラスタは日付ディレクトリ配下のサブディレクトリで表現します）。

- `runs/<domain>/clustering/latest` → 最新の clustering run（`<YYYYMMDD>`）
- `runs/<domain>/gather/latest` → 最新の gather 日付ディレクトリ（`<YYYYMMDD>`）
- `runs/<domain>/retrieval/latest` → 最新の retrieval 日付ディレクトリ（`<YYYYMMDD>`）
- `domains/<domain>/clustering` は `clustering/latest` を指すシンボリックリンク
- `domains/<domain>/resources/<cluster>` / `reports/<cluster>` は、そのクラスタを含む
  **最新の日付ディレクトリ**配下の該当クラスタ (`.../<YYYYMMDD>/<cluster>`) を指す
  シンボリックリンク。あるクラスタが最新日付に存在しない場合は、そのクラスタを含む直近の
  日付ディレクトリを指す（クラスタ単位の最新ビューを維持するため）

シンボリックリンクは手で張らず、**`dev/sync-domain-links` で再生成**します。上記の規則を
そのまま実装したスクリプトで、`runs/` の実状から全ドメイン分を冪等に張り直します。

```bash
dev/sync-domain-links           # 再生成
dev/sync-domain-links --check   # 差分があれば exit 1（CI 向け）
```

### `domains/` のシンボリックリンクは表示の正しさに関与しない

viewer は `domains/` のシンボリックリンクを**読みません**（実ファイルの `studies/` / `discussions/` / `domain.yaml` / `README.md` はそのまま読みます）。`/research/domains/...` の内容は
リクエスト時に `runs/` から同じ規則で導出されます（`frontend/src/lib/domain-view.ts`）。

理由は 2 つあります。

1. `readdirSync` はシンボリックリンクをファイルともディレクトリとも判定しないため
   （`Dirent.isDirectory()` が false）、リンクだけで構成されたディレクトリを走査すると
   一覧が空になる
2. 表示の正しさを、更新を忘れうる手動リンクに依存させたくない

したがって `domains/` のリンクが古くても・壊れていても・存在しなくても、**公開される
表示内容は常に正しい**。リンクは git やファイラで人がドメインを辿るための便宜であり、
ずれた場合は `dev/sync-domain-links` で直せます。

## 人手の層（`studies/` / `discussions/`）

`domains/<domain>/` 配下の実ファイルとして置く、skill の出力ではない成果物です。`dev/sync-domain-links` は `clustering` / `resources/` / `reports/` のシンボリックリンクしか操作しないため、これらに影響しません（studies 内に置いた symlink も含む）。

| 種別 | 置き場所 | 用途 | 更新 |
|---|---|---|---|
| studies | `domains/<domain>/studies/<YYYYMMDD>-<slug>/` | skill のフローに乗らない調査（プレイブック、手作業の文献整理、実験、仕様整理、メモなど） | 新しい調査は新しいディレクトリで追加。既存ディレクトリの加筆修正は可 |
| discussions | `domains/<domain>/discussions/<YYYYMMDD>-<slug>.md` | 論文・レビュー（`runs/` の成果物や studies）に対する議論 | 書き換え可 |

- **studies** の入口は `index.md`。冒頭のメタデータ行に `- **Type**: playbook | survey | experiment | spec | memo` を書きます。
- **discussions** は冒頭で対象を `/research/...` リンクで示します（例: `/research/runs/<domain>/retrieval/<YYYYMMDD>/<cluster>/01-foo`）。
- `<YYYYMMDD>` は作成日。ホームの新着はこの日付で並びます（`studies/` / `discussions/` の一覧とサイドバーは名前順）。
- skill の run が存在しないドメインでも、`domains/<domain>/` を作って studies / discussions だけを置けます。

## ドメインメタファイル `domain.yaml`（必須）

すべてのドメインに置きます。viewer は表示名とタグを、skill はクラスタ定義と出力先テンプレをここから読みます。

```yaml
domain: cate                      # フォルダ名と一致させる（必須）
display_name: CATE (Conditional Average Treatment Effect)   # 画面に出す名前（必須）
description: CATE 推定の精度向上手法の調査                   # 任意
tags: [causal_inference, uplift_modeling]   # _meta/tags.yaml の id のみ（必須。空配列可）
tags_reviewed: 2026-11-15         # ドメイン内の全ファイルからタグを見直した日（任意）
clusters:                         # 任意
  - id: metalearner
    keywords: [S-learner, T-learner, X-learner, DR-learner]
output_paths:                     # 任意。書く場合は下記の現行形式に限る
  clustering: runs/{domain}/clustering/{date}/
  gather:     runs/{domain}/gather/{date}/{cluster}/
  retrieval:  runs/{domain}/retrieval/{date}/{cluster}/
```

- **タグはドメイン単位**です。`runs/` の全 phase・全日付と `studies/` / `discussions/` を総合して付けます。
- `tags_reviewed` より新しい実行結果や study / discussion が増えると、整理の診断で「タグが古い」と判定されます。
- 表示名を変えたいだけなら `display_name` を書き換えます。フォルダ名は変わりません。

## 整理（タグ・改名・統合・分離）

ドメインの構成は随時見直します。何を変えるかは整理 skill（`research-housekeeping`）が中身を読んで提案し、承認された操作を管理スクリプト（`dev/research-admin`）が実行します。手でファイルを移動しないでください。

| 操作 | コマンド | 変わるもの |
|---|---|---|
| タグの付け直し | `tags set <domain> <id...>` | その `domain.yaml` の `tags` / `tags_reviewed` |
| タグの改名・統合 | `tags rename <old> <new>` / `tags merge <id...> --into <id>` | `_meta/tags.yaml` と該当する全 `domain.yaml` |
| 表示名の変更 | `title <domain> "<表示名>"` | `display_name` のみ |
| ドメインの改名 | `rename <old> <new>` | フォルダ名（`runs/` と `domains/` の両方） |
| ドメインの統合 | `merge <domain...> --into <domain>` | 統合元の全実行結果と `domains/<domain>/` の実ファイル（`studies/` / `discussions/` を含む）を統合先へ移動 |
| ドメインの分離 | `split <domain> --to <new> --paths <path...>` | 指定した実行結果（日付ディレクトリまたはクラスタ）や study / discussion だけを新ドメインへ移動 |
| 検証 | `check` | 何も変えない（CI でも実行） |
| 診断 | `report` | 何も変えない（整理 skill が使う） |

- どのコマンドも既定では変更内容を表示するだけで、`--apply` を付けたときだけ実行します。
- 改名・統合・分離では、ファイル移動、`latest` の張り直し、内部リンクの書き換え、`_meta/redirects.yaml` と `_meta/changes/` への追記、`dev/sync-domain-links` の実行までをまとめて行います。
- 古い URL は `_meta/redirects.yaml` によって新しい URL へ転送されます。個人メモも旧パスのものが引き継がれて表示されます。
- 統合・分離で `latest` が別の run に変わる場合は、dry-run に `latest a -> b` と表示されます。このとき、関係するドメインの `latest` や `domains/` ビューを経由したリンクは、その時点で指していた run に固定してから書き換えます。統合元の `latest` とビューの旧 URL も、統合前に表示していた run へ転送します。
- コードブロックとインラインコードの中にあるリンク風の文字列は、検査も書き換えもしません。

### `_meta/tags.yaml`（タグ辞書）

```yaml
- id: imperfect_info              # domain.yaml から参照するキー（snake_case）
  label: 不完全情報ゲーム          # 画面表示。自由に書き換えてよい
  aliases: [imperfect information]   # 同義語（任意）
  description: 相手の情報が隠れたゲームの AI   # 任意
```

画面上のタグ名を変えるときは `label` だけを書き換えます。`id` の改名・統合は `dev/research-admin tags` で行います。

### `_meta/redirects.yaml`（転送表）

```yaml
- from: runs/kaggle_ptcg_ai_battle      # research/ からの相対パス。先頭一致で置き換える
  to: runs/kaggle_ptcg
  change: 20261115-merge-kaggle_ptcg    # 対応する変更記録
```

一番長く一致する `from` を採用し、転送先がさらに転送されていればたどります。`dev/research-admin` だけが追記します。

### `_meta/changes/`（変更記録）

改名・統合・分離と、タグ id の改名・統合のたびに `<YYYYMMDD>-<op>-<target>.yaml` を 1 つ作ります（タグの付け直しと表示名の変更は git の履歴で追えるので作りません）。統合では、消えた `domain.yaml` の中身も `args.source_domain_yaml` に残します。`op`（操作）、`reason`（理由）、`moved`（移動したパスの一覧）を残し、あとから「いつ・なぜ・何を変えたか」を追えるようにします。

### 日付ディレクトリの衝突

統合先に同じ日付の clustering run がある場合、移動する側を `<YYYYMMDD>-<n>`（n = 2, 3, …）にします。同じ日付の中では n が大きいほど新しいものとして扱います。gather / retrieval は、クラスタ名が重ならなければ同じ日付ディレクトリにまとめます。

## 命名規約

| 項目          | 規則                                                       | 例                          |
|---------------|------------------------------------------------------------|-----------------------------|
| ドメイン名    | `snake_case`                                               | `data_analysis_agent`       |
| クラスタ ID   | `snake_case` または `kebab-case`（ドメイン内で統一）       | `metalearner`, `nl2sql-nl2code` |
| 日付ディレクトリ | `YYYYMMDD`（統合で衝突した場合のみ `YYYYMMDD-<n>`）     | `20260330`, `20260626-2`    |
| クラスタディレクトリ | `<YYYYMMDD>/<cluster>`（gather / retrieval）        | `20260330/metalearner`      |
| レポートファイル | `NN-kebab-case.md`（NN = 0埋め連番）                     | `01-causal-forest.md`       |
| index ファイル | `index.md`                                                | -                           |
| study ディレクトリ | `<YYYYMMDD>-<kebab-case>/`（`domains/<domain>/studies/` 配下） | `20261115-deck-playbook/` |
| discussion ファイル | `<YYYYMMDD>-<kebab-case>.md`（`domains/<domain>/discussions/` 配下） | `20261115-causal-forest-review.md` |
| タグ id       | `snake_case`（`_meta/tags.yaml` に定義）                   | `imperfect_info`            |

## phase 定義

| phase      | 役割                                       | 入力                       | 出力                                |
|------------|--------------------------------------------|----------------------------|-------------------------------------|
| clustering | ドメインをサブクラスタに分割               | キーワード / テーマ        | `index.md` + `cluster-NN-*.md`      |
| gather     | クラスタ単位でリソース一覧化               | clustering 出力 / キーワード | `resources-<topic>.md`              |
| retrieval  | リソースごとの詳細レポート生成             | gather 出力 / URL / PDF    | `index.md` + `NN-*.md`              |
