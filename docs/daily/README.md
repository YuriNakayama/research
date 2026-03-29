# Daily Research Pipeline

リサーチ領域ごとにCSVリストを管理し、毎日1件ずつ自動リサーチを実行するパイプライン。

## ディレクトリ構造

```
docs/daily/
├── README.md                 # 本ファイル
├── prompt_template.md        # 共通プロンプトテンプレート
└── <domain>/                 # リサーチ領域（例: legal_tech）
    ├── list/
    │   └── YYYYMMDD.csv      # リサーチ対象リスト（日付名）
    └── report/
        └── YYYYMMDD.md       # 日次レポート（自動生成）
```

## CSVフォーマット

`list/` 配下のCSVファイルは以下のカラム構成:

```csv
title,url,authors,year,venue,summary,status
```

| カラム | 説明 |
|--------|------|
| title | リサーチ対象タイトル |
| url | リソースURL |
| authors | 著者 |
| year | 発表年 |
| venue | 掲載先（arXiv, ACL等） |
| summary | 概要 |
| status | `pending`（未実行）/ `done`（実行済み） |

CSVは `research-gather` スキルの出力を変換して作成する。
ファイル名は作成日の `YYYYMMDD.csv` 形式とする。

## パイプライン動作

1. 各ドメインの `list/*.csv` から `status=pending` の先頭行を1件取得
2. `prompt_template.md` にCSVデータを埋め込みプロンプト生成
3. Claude CLIでリサーチ実行
4. `report/YYYYMMDD.md` にレポート保存
5. CSVの該当行を `done` に更新
6. 全ドメインのレポートを1通のメールにまとめて通知

## 領域の追加方法

1. `docs/daily/<新ドメイン名>/list/` ディレクトリを作成
2. CSVファイルを配置
3. `backend/config/research-config.yaml` の `daily.domains` に追加:

```yaml
daily:
  domains:
    - name: "<新ドメイン名>"
      prompt_template: "docs/daily/prompt_template.md"
```

## プロンプトテンプレート

`prompt_template.md` 内で使用可能なプレースホルダー:

- `{title}` — タイトル
- `{url}` — URL
- `{authors}` — 著者
- `{year}` — 発表年
- `{venue}` — 掲載先
- `{summary}` — 概要

ドメイン固有のテンプレートが必要な場合は、別ファイルを作成して `prompt_template` フィールドで指定可能。
