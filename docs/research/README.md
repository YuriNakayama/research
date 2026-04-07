# Research Directory Layout

このディレクトリは Auto Research Pipeline と research 系 skill (`research-clustering` / `research-gather` / `research-retrieval`) の出力先です。**skill とユーザーは出力先を決める前に必ず本ファイルを読んでください**。

## 設計原則

1. **`runs/` は append-only** — 実行のたびに新しいディレクトリを追加し、過去のものは書き換えません。これが source of truth です。
2. **`domains/` は最新ビュー** — 各ドメインの最新成果物を見やすく整理した参照用レイヤー。`runs/` 内の最新版を指すシンボリックリンクで構成します。
3. **同一ドメインで `clustering` は複数回実行され得る** — 再クラスタリングで構造が変わった場合も過去の run は残し、`latest` ポインタだけを更新します。
4. **phase は3種固定**: `clustering` / `gather` / `retrieval`

## ディレクトリ構成

```
docs/research/
├── README.md                                # このファイル（構成の単一情報源）
│
├── domains/                                 # 【最新ビュー】ドメイン中心
│   └── <domain>/
│       ├── domain.yaml                      # ドメインメタ（任意・存在すれば skill が読む）
│       ├── clustering -> ../../runs/<domain>/clustering/latest
│       ├── resources/                       # 各クラスタの最新リソース一覧
│       │   └── <cluster>/
│       └── reports/                         # 各クラスタの最新詳細レポート
│           └── <cluster>/
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
        │   ├── <YYYYMMDD>_<cluster>/        # cluster 単位 or domain 全体 (`_all`)
        │   │   └── resources-*.md
        │   └── latest_<cluster> -> ...
        └── retrieval/
            ├── <YYYYMMDD>_<cluster>/        # 詳細レポート群
            │   ├── index.md
            │   ├── 01-*.md
            │   └── ...
            └── latest_<cluster> -> ...
```

## 出力先決定フロー（skill 用）

skill は次の手順で出力先を決定します。

1. **ドメイン名 `<domain>` を特定**
   - 入力ファイルパスから推定 (`docs/research/runs/<domain>/...` / `docs/research/domains/<domain>/...`)
   - 推定不能ならユーザーに確認、または会話文脈から `snake_case` のドメイン名を生成
2. **`docs/research/domains/<domain>/domain.yaml` が存在すれば読む** — `output_paths` テンプレが定義されていればそれに従う
3. **存在しない場合は下表の既定パスを使用**
4. **`<date>` は実行日 (`YYYYMMDD`)、`<cluster>` は対象クラスタ ID (`snake_case` or `kebab-case`)**
5. **完了後、`domains/<domain>/<phase>` 配下の `latest` ポインタを更新**（pipeline / 人手）

### phase 別の既定出力先

| phase       | skill                | 既定出力先                                                   |
|-------------|----------------------|--------------------------------------------------------------|
| clustering  | `research-clustering`| `docs/research/runs/<domain>/clustering/<YYYYMMDD>/`         |
| gather      | `research-gather`    | `docs/research/runs/<domain>/gather/<YYYYMMDD>_<cluster>/`   |
| retrieval   | `research-retrieval` | `docs/research/runs/<domain>/retrieval/<YYYYMMDD>_<cluster>/`|

クラスタ単位ではなくドメイン全体を対象にする場合は `<cluster>` を `all` とします。

### latest ポインタの規約

- `runs/<domain>/clustering/latest` → 最新の clustering run
- `runs/<domain>/gather/latest_<cluster>` → cluster ごとの最新 gather run
- `runs/<domain>/retrieval/latest_<cluster>` → cluster ごとの最新 retrieval run
- `domains/<domain>/clustering` / `resources/<cluster>` / `reports/<cluster>` は上記 latest を指すシンボリックリンク

シンボリックリンク作成例:

```bash
ln -snf ../../runs/cate/clustering/latest docs/research/domains/cate/clustering
ln -snf ../../../runs/cate/retrieval/latest_metalearner docs/research/domains/cate/reports/metalearner
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
  gather:     runs/{domain}/gather/{date}_{cluster}/
  retrieval:  runs/{domain}/retrieval/{date}_{cluster}/
```

## 命名規約

| 項目          | 規則                                                       | 例                          |
|---------------|------------------------------------------------------------|-----------------------------|
| ドメイン名    | `snake_case`                                               | `data_analysis_agent`       |
| クラスタ ID   | `snake_case` または `kebab-case`（ドメイン内で統一）       | `metalearner`, `nl2sql-nl2code` |
| run ディレクトリ | `YYYYMMDD` / `YYYYMMDD_<cluster>`                       | `20260330_metalearner`      |
| レポートファイル | `NN-kebab-case.md`（NN = 0埋め連番）                     | `01-causal-forest.md`       |
| index ファイル | `index.md`                                                | -                           |

## phase 定義

| phase      | 役割                                       | 入力                       | 出力                                |
|------------|--------------------------------------------|----------------------------|-------------------------------------|
| clustering | ドメインをサブクラスタに分割               | キーワード / テーマ        | `index.md` + `cluster-NN-*.md`      |
| gather     | クラスタ単位でリソース一覧化               | clustering 出力 / キーワード | `resources-<topic>.md`              |
| retrieval  | リソースごとの詳細レポート生成             | gather 出力 / URL / PDF    | `index.md` + `NN-*.md`              |

## 既存の `daily/` について

`docs/daily/` は legacy 配置です。今後は `domains/<domain>/` に統合してください（移行は別タスク）。
