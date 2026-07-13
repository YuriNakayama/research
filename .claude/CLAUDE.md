# Research Viewer

手動リサーチ成果物（Markdown）を Next.js の閲覧 UI で配信するリポジトリ。表示用コンテンツは `research/`、開発時ドキュメント（プラン等）は `docs/` に置く。フロントエンドは AWS Amplify Hosting で配信し、Cognito で認証する。

## Architecture

```
research/**（表示用 Markdown: runs / domains / _schema）
  ↓ build-time copy (cp -r research frontend/research)
Next.js (App Router) — /research 配下でオンデマンド描画
  ├── /research/[[...slug]]          ディレクトリ一覧 / Markdown 表示
  └── /api/research-assets/[...path] 画像等アセット配信
  ↓ deploy
AWS Amplify Hosting（Next.js standalone）
  └── Cognito User Pool — 認証

External:
  Secrets Manager — Cognito E2E テストユーザ資格情報
  GitHub Actions OIDC role — CI(Playwright) が上記 secret を読む
```

## Technology Stack

- **Frontend**: Next.js (App Router) + TypeScript, AWS Amplify (Auth/Hosting), Playwright (E2E)
- **Infrastructure**: AWS (Cognito, Amplify Hosting, Secrets Manager, GitHub Actions OIDC), Terraform
- **CI/CD**: GitHub Actions (ci-frontend.yml, ci-infra.yml)
- **Content**: 手動リサーチ成果物 Markdown（`research/**`, append-only）

## Folder Structure

```
research/                    表示用リサーチ成果物（append-only）
  runs/<domain>/<phase>/<date>[_<cluster>]/   実体の出力
  domains/<domain>/          runs への symlink 構成
  _schema/                   スキーマ定義
frontend/                    Next.js (App Router, TypeScript) レポート閲覧 UI
  src/
    app/                     ルーティング（(authenticated)/research, login, api/research-assets）
    components/              layout / docs / markdown / report / auth
    lib/                     amplify, docs-content, palette, toc, utils
  e2e/                       Playwright テスト
  scripts/
    setup-e2e-fixtures.mjs   E2E 用の決定的フィクスチャ生成
    check-mermaid.mjs        research 内 mermaid 図のパース検証
infra/
  main.tf                    Root module (provider, backend)
  variables.tf               Input variables
  outputs.tf                 Output values
  terraform.tfvars.example   Sample tfvars
  modules/
    cognito/                 Cognito User Pool（フロントエンド認証）
    amplify/                 Amplify Hosting（フロントエンド配信）
    secrets/                 Secrets Manager（E2E テストユーザ資格情報）
    cicd/                    GitHub Actions OIDC role（E2E secret 読み取り）
docs/                        開発用ドキュメント
  plans/                     Feature plans
dev/                         Development scripts
  setup                      Install dependencies (frontend: pnpm install)
  format                     Code formatting (frontend)
  lint                       Static analysis (frontend)
  create-worktree            Create git worktree with .env copy
```

## Commands

```bash
dev/setup            # Install dependencies (frontend: pnpm install)
dev/format           # Code formatting (frontend)
dev/lint             # Static analysis (frontend)
dev/create-worktree  # Create git worktree with .env copy
```

フロントエンドの検証は `frontend/` で `npx tsc --noEmit` / `npx next lint` / `npx next build` / `npx playwright test`。research コンテンツの検証は `npm run check:docs`（markdownlint + mermaid parse）。

## 表示用コンテンツと viewer の境界

- **`research/**` が唯一の表示用領域**。ビルド時に `frontend/research` へコピーされ、`/research` 配下で描画される。
- `research/**` は append-only。既存 run の中身は改変せず、新規は `runs/<domain>/<phase>/<date>[_<cluster>]/` に追加する（詳細は `.claude/rules/research.md`）。
- `docs/**` は開発用。viewer の表示対象ではない。
- viewer のアセット参照は `/api/research-assets/<path>`、内部 Markdown リンクは `/research/<slug>` に解決される。

## Glossary

| Term | Description |
|------|-------------|
| Research Content | `research/**` に置く手動リサーチ成果物 Markdown（append-only） |
| Viewer | `research/**` を `/research` 配下で描画する Next.js UI |
| research-assets | viewer が画像等を配信する API ルート（`/api/research-assets/<path>`） |
| Cognito | viewer の認証を担う AWS User Pool |
| E2E fixture | Playwright が参照する決定的アンカー（`research/_e2e_fixture/...`、ビルド時生成） |

## Rules

| Rule file | Auto-loaded for | When to read manually |
|-----------|----------------|----------------------|
| `.claude/rules/infra.md` | `infra/**` | Terraform changes, AWS resource design, module structure decisions |
| `.claude/rules/frontend.md` | `frontend/**` | Next.js (TypeScript) フロントエンド（`frontend/` 配下）の編集、UI コンポーネント追加、ESLint/Playwright 設定変更時 |
| `.claude/rules/research.md` | `research/**` | Research output directory layout, phase-specific output paths, domain/cluster naming, latest pointer rules |
| `.claude/rules/security.md` | Always loaded | Commits, secret handling, IAM design, network security, CI/CD pipeline changes |

## Response Language

- Internal reasoning should be in English
- All user-facing output must be in Japanese(全てのユーザー向けの出力は日本語で行うこと)
