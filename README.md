# Research Viewer

手動リサーチ成果物（Markdown）を Next.js の閲覧 UI で配信するリポジトリ。表示用コンテンツは `research/`、開発時ドキュメントは `docs/`。フロントエンドは AWS Amplify Hosting で配信し、Cognito で認証する。

## 構成

```
research/  表示用リサーチ成果物（runs/<domain>/<phase>/..., append-only）
frontend/  Next.js (App Router, TypeScript) / レポート閲覧 UI（/research 配下で配信）
infra/     Terraform（AWS: Cognito / Amplify / Secrets Manager / GitHub Actions OIDC）
docs/      開発用ドキュメント（plans ほか）
dev/       開発用スクリプト（setup / format / lint / create-worktree）
```

詳しいアーキテクチャ・フォルダ構成・ルールは [`.claude/CLAUDE.md`](./.claude/CLAUDE.md) を参照。

## リサーチ成果物の追加

- research 系 skill (`research-clustering` / `research-gather` / `research-retrieval`) の出力先は `research/runs/<domain>/<phase>/...`。配置ルールは [`research/README.md`](./research/README.md) を参照。
- `research/**` は append-only。ファイル配置がそのまま viewer の公開 URL（`/research/...`）構造になる。

## セットアップ

```bash
# 依存関係のインストール（frontend/）
dev/setup
```

## よく使うコマンド

```bash
dev/format           # frontend format
dev/lint             # frontend lint
dev/create-worktree  # .env コピー済み git worktree を作成
```

フロントエンドの検証は `frontend/` で `npx tsc --noEmit` / `npx next lint` / `npx next build` / `npx playwright test`。

## リモートに存在しないローカルブランチの掃除

```bash
git fetch --prune && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -d
```
