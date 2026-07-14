# Research Directory Layout

このディレクトリは research 系 skill (`research-clustering` / `research-gather` / `research-retrieval`) の出力先であり、viewer（`/research`）が配信する表示用リサーチ成果物領域です。**skill とユーザーは出力先を決める前に必ず本ファイルを読んでください**。

## 設計原則

1. **`runs/` は append-only** — 実行のたびに新しいディレクトリを追加し、過去のものは書き換えません。これが source of truth です。
2. **`domains/` は最新ビュー** — 各ドメインの最新成果物を見やすく整理した参照用レイヤー。`runs/` 内の最新版を指すシンボリックリンクで構成します。
3. **同一ドメインで `clustering` は複数回実行され得る** — 再クラスタリングで構造が変わった場合も過去の run は残し、`latest` ポインタだけを更新します。
4. **phase は3種固定**: `clustering` / `gather` / `retrieval`

## ディレクトリ構成

すべての phase (`clustering` / `gather` / `retrieval`) で、run ディレクトリは
**日付単位 (`<YYYYMMDD>/`)** に統一します。`gather` / `retrieval` はその日付ディレクトリの
直下に **クラスタごとのサブディレクトリ (`<cluster>/`)** を置きます。`latest` は
phase ごとに **1本** で、最新の日付ディレクトリを指します。

```
research/
├── README.md                                # このファイル（構成の単一情報源）
│
├── domains/                                 # 【最新ビュー】ドメイン中心
│   └── <domain>/
│       ├── domain.yaml                      # ドメインメタ（任意・存在すれば skill が読む）
│       ├── clustering -> ../../runs/<domain>/clustering/latest
│       ├── resources/                       # 各クラスタの最新リソース一覧
│       │   └── <cluster> -> ../../../runs/<domain>/gather/<YYYYMMDD>/<cluster>
│       └── reports/                         # 各クラスタの最新詳細レポート
│           └── <cluster> -> ../../../runs/<domain>/retrieval/<YYYYMMDD>/<cluster>
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

シンボリックリンク作成例:

```bash
# clustering: phase 単位の latest を指す
ln -snf ../../runs/cate/clustering/latest research/domains/cate/clustering

# gather/retrieval: 日付ディレクトリ配下のクラスタを直接指す
ln -snf ../../../runs/cate/retrieval/20260322/metalearner research/domains/cate/reports/metalearner
ln -snf ../../../runs/cate/gather/20260602/uplift_ranking  research/domains/cate/resources/uplift_ranking
```

## ドメインメタファイル `domain.yaml`（任意）

ドメインごとに固有のクラスタ定義や出力先テンプレを持たせたい場合に作成します。存在しなければ skill は既定値を使います。

```yaml
domain: cate
display_name: CATE (Conditional Average Treatment Effect)
clusters:
  - id: metalearner
    keywords: [S-learner, T-learner, X-learner, DR-learner]
  - id: theory
    keywords: [identification, ignorability]
  - id: deep_learning
    keywords: [TARNet, Dragonnet, BCAUSS]
output_paths:
  clustering: runs/{domain}/clustering/{date}/
  gather:     runs/{domain}/gather/{date}/{cluster}/
  retrieval:  runs/{domain}/retrieval/{date}/{cluster}/
```

## 命名規約

| 項目          | 規則                                                       | 例                          |
|---------------|------------------------------------------------------------|-----------------------------|
| ドメイン名    | `snake_case`                                               | `data_analysis_agent`       |
| クラスタ ID   | `snake_case` または `kebab-case`（ドメイン内で統一）       | `metalearner`, `nl2sql-nl2code` |
| 日付ディレクトリ | `YYYYMMDD`                                             | `20260330`                  |
| クラスタディレクトリ | `<YYYYMMDD>/<cluster>`（gather / retrieval）        | `20260330/metalearner`      |
| レポートファイル | `NN-kebab-case.md`（NN = 0埋め連番）                     | `01-causal-forest.md`       |
| index ファイル | `index.md`                                                | -                           |

## phase 定義

| phase      | 役割                                       | 入力                       | 出力                                |
|------------|--------------------------------------------|----------------------------|-------------------------------------|
| clustering | ドメインをサブクラスタに分割               | キーワード / テーマ        | `index.md` + `cluster-NN-*.md`      |
| gather     | クラスタ単位でリソース一覧化               | clustering 出力 / キーワード | `resources-<topic>.md`              |
| retrieval  | リソースごとの詳細レポート生成             | gather 出力 / URL / PDF    | `index.md` + `NN-*.md`              |
