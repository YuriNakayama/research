# Auto Research Pipeline

Claude CLI を用いた日次リサーチを ECS Fargate で自動実行し、結果を GitHub Pull Request として届けるパイプライン。生成物は併設の Next.js フロントエンドで閲覧できる。

## 構成

```
backend/   Python 3.12 / ECS Fargate タスク本体（パイプライン）
frontend/  Next.js (App Router, TypeScript) / レポート閲覧 UI
infra/     Terraform（AWS: ECS/EFS/ECR/EventBridge/Cognito/Amplify ほか）
docs/      研究成果 (runs/<domain>/<phase>/...) と plans
dev/       開発用スクリプト（setup / format / lint / test-backend / create-worktree）
```

詳しいアーキテクチャ・フォルダ構成・ルールは [`.claude/CLAUDE.md`](./.claude/CLAUDE.md) を参照。

## Daily パイプラインの運用

- 調査候補の URL を `docs/daily/<domain>/list/inbox.csv` に追記すると、次回の日次実行（JST 09:00）でそのうち 1 件が処理される。
- 追記は手動で CSV を編集するか、Claude Code から `/daily-add` skill を呼び出すと半自動で行える。
- 実行順は `added_at` 降順（新しく追加したものから処理）。
- 生成レポートは `docs/daily/<domain>/reports/<YYYY-MM-DD>/<slug>.md` に保存され、`daily/<timestamp>` ブランチの PR として作成されたあと auto-merge される。
- マージ後、タイトル・概要・`https://owl.avifauna.click/docs/daily/<domain>/reports/<YYYY-MM-DD>/<slug>` を含むメールが配信される。

## セットアップ

```bash
# UV のインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# 依存関係のインストール（backend/）
dev/setup
```

## よく使うコマンド

```bash
dev/format           # ruff format
dev/lint             # ruff check + mypy
dev/test-backend     # format check → lint → type check → pytest
dev/create-worktree  # .env コピー済み git worktree を作成
```

## リモートに存在しないローカルブランチの掃除

```bash
git fetch --prune && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -d
```
