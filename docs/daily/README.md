# Daily Auto Research

自動リサーチパイプライン（ECS Fargate で日次実行）の **入力と出力専用** ディレクトリ。

## ディレクトリ構造

```
docs/daily/
  <domain>/
    list/        入力 CSV（追記可、複数ファイル可）
      inbox.csv  デフォルトの追記先（/daily-add skill が書き込む）
    reports/     自動生成された日次レポート（Markdown）
      <YYYY-MM-DD>_<slug>.md
```

## 運用ルール

### 自動実行パイプラインが書き換えて良い範囲

- `docs/daily/**` のみ
- `docs/research/**` は **絶対に書き換えない**（手動リサーチ領域）

### list CSV のスキーマ

```
title, url, authors, year, venue, summary, status, added_at, kind
```

| 列 | 説明 |
|---|---|
| `title` | 論文・記事のタイトル |
| `url` | 取得元 URL（パイプラインが Claude に渡す） |
| `authors` | 著者（カンマ区切り、任意） |
| `year` | 出版年（任意） |
| `venue` | 会議/ジャーナル/媒体名（任意） |
| `summary` | 1-2 文の日本語要約 |
| `status` | `pending` or `done` |
| `added_at` | 追加日 `YYYY-MM-DD` |
| `kind` | `paper` / `patent` / `site` |

### ターゲット選択ルール

毎日の実行時、各ドメインの `list/*.csv` を全て集約し、**`status=pending` の行を `added_at` 降順**（新しい順）でソートして先頭 1 件を処理します。

### CSV への追記方法

#### 1. 手動追記
エディタで `list/inbox.csv` などを開き、行を追加して commit。

#### 2. `/daily-add` skill（推奨）
Claude Code から `/daily-add` を呼び出し、調査候補の URL を渡すと、Claude がメタ情報を抽出して `inbox.csv` に追記します。

内部的には `backend/scripts/daily_add.py` が CSV を append し、skill がその後メタ情報（title/summary 等）を上書きします。

### レポート出力先

`docs/daily/<domain>/reports/<YYYY-MM-DD>_<slug>.md`

frontend の `/docs` 配下から `https://owl.avifauna.click/docs/daily/<domain>/<YYYY-MM-DD>` として閲覧可能。

## 新しいドメインを追加するには

1. `docs/daily/<new_domain>/list/inbox.csv` を作成（ヘッダーのみで可）
2. `docs/daily/<new_domain>/reports/.gitkeep` を作成
3. `backend/config/research-config.yaml` の `daily.domains` に追加
4. commit & push
