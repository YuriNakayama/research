# 認証バイパスの一本化 — 調査結果と実装方針

> ブランチ: `fix/auth-storagestate-unify` / 対象: `frontend/`
> 目的: ローカル動作確認と E2E テストの認証まわりを、ドキュメント記載のベストプラクティス（Playwright 公式 storageState）に一本化し、カスタムな個別最適（`x-e2e-bypass` ヘッダー機構）を撤廃する。

## 背景 — なぜこの改修に至ったか

`owl.avifauna.click`（Amplify）で公開している docs ビューア `research-viewer` は、Next.js (App Router) + AWS Amplify/Cognito + middleware 認証で保護されている。ローカルで表示を目視レビューしようとした際、以下が判明した。

- middleware が全リクエストで Cognito セッションを検証し、未認証は `/login` へリダイレクトする。
- そのため素の `next dev` では docs を閲覧できない。
- 認証を通さず閲覧する唯一の経路が、既存のカスタム機構 **E2E バイパス**（`x-e2e-bypass` ヘッダー）だった。

「ローカルで適当な ID/PW でログインしたい」という要望が出たが、方針として **「ドキュメント記載のベストプラクティスを優先し、個別最適な方法は避け、できるだけシンプルに一本化する」** ことを決定した。

## 現状の実装（改修前）

| 要素 | 内容 | 評価 |
|------|------|------|
| `src/middleware.ts` | 全リクエストで `fetchAuthSession()`。`isE2EBypassAllowed()` が `x-e2e-bypass` ヘッダーと `E2E_BYPASS_TOKEN`（サーバ専用 env）の一致でバイパス | カスタム機構 |
| `next.config.ts` | 本番ビルドで `E2E_BYPASS_TOKEN` が設定されていたらビルドを止める安全弁 | 良い前例 |
| `playwright.config.ts` | 実行ごとに `randomBytes` でトークン生成 → `extraHTTPHeaders` と `webServer.env` に注入。全 spec が既定でバイパス | カスタム機構 |
| `e2e/login.spec.ts` | `test.use({ extraHTTPHeaders: {} })` でバイパスを外し、`E2E_TEST_USER_EMAIL/PASSWORD` で **実 Cognito ログインをテスト** | 既にベストプラクティス寄り |

ポイント: **実 Cognito にログインする手順は既に `login.spec.ts` に存在する**。storageState 化に必要な素材は揃っている。

## 調査結果（一次情報ベース）

> 詳細レポート（Artifact）: https://claude.ai/code/artifact/d6903b96-c276-420f-b283-cb64a00af6f0

1. **middleware 認証と本番安全性** — Next.js の CVE-2025-29927（`x-middleware-subrequest` による middleware 認可バイパス）が存在。影響は 15.0–15.2.2 等。本プロジェクトは **15.5.14 でパッチ済みのため直接の影響なし**。ただし「middleware を唯一の認可防御にしない（多層防御）」という教訓は有効。

2. **E2E での Cognito の扱い** — Playwright 公式推奨は **「実 Cognito に(UI or API)ログイン → `storageState`（cookie + localStorage）を全テストで再利用」**。バイパストークンは認証フロー自体を検証できないため**補助**に留めるべき。

3. **ダミーログイン vs E2E バイパスの両立** — 目的は違う（人間のレビュー用 / 機械のテスト用）が、**別々に2つの穴を開けるのではなく「1つのバイパス機構・入口2つ」に統合**するのが管理上ベター。OWASP 系の "test-backdoor" 論も、環境ゲートされた単一の裏口を推奨。

4. **`NEXT_PUBLIC_` で認証を切る危険性** — アンチパターン。クライアント JS バンドルに露出し改竄可能。認証判定はサーバ専用 env で行い、ビルド時ガードで本番混入を止める（既存 `E2E_BYPASS_TOKEN` の型が正解）。

5. **Playwright 公式パターン** — **setup project（project dependencies）+ storageState**。状態ファイルは `playwright/.auth/` に置き `.gitignore`（コミット厳禁）。

6. **Cognito ローカルエミュレータ（cognito-local / moto / LocalStack）** — 本プロジェクトには**過剰**。目的は「docs 表示の目視レビュー」であって認証フロー検証ではないため、導入・維持コストに見合わない。フロントが Node のみで Python 無しのため moto も対象外。

## 決定した方針

**Playwright 公式標準の `storageState` + setup project に一本化する。** カスタムの `x-e2e-bypass` ヘッダー機構（middleware バイパス・トークン生成・ビルドガード）を撤廃し、ドキュメント記載のベストプラクティスのみに揃える。

### 撤廃するもの（カスタム個別最適）

- `src/middleware.ts` の `isE2EBypassAllowed()` と `x-e2e-bypass` 判定
- `next.config.ts` の `E2E_BYPASS_TOKEN` ビルドガード（バイパスが無くなれば不要）
- `playwright.config.ts` の `randomBytes` トークン生成・`extraHTTPHeaders`・`webServer.env` へのトークン注入

### 追加するもの（公式標準）

- `e2e/auth.setup.ts` — 実 Cognito にログインし `playwright/.auth/user.json` に storageState を保存（`login.spec.ts` の実ログイン手順を昇格）
- `playwright.config.ts` — `setup` project を追加し、各テスト project に `storageState` と `dependencies: ['setup']` を設定
- `frontend/.gitignore` — `playwright/.auth/` を追加

### login.spec.ts の扱い

- 「未認証 → /login リダイレクト」「ログイン画面の表示」「誤パスワードでエラー」の各テストは、**認証フロー自体の検証**として残す（storageState を使わない project、または未認証状態を明示して実行）。
- 「正常ログイン → ホーム遷移」は setup project がカバーするため整理。

## 移行手順（実装ステップ）

1. `e2e/auth.setup.ts` を新規作成（実 Cognito ログイン → `storageState()` 保存）。
2. `playwright.config.ts` を storageState + setup project 構成に書き換え。`extraHTTPHeaders` とトークン生成を削除。
3. `src/middleware.ts` から E2E バイパス判定を削除し、純粋な認証ガードにする。
4. `next.config.ts` から E2E ビルドガードを削除。
5. `frontend/.gitignore` に `playwright/.auth/` を追加。
6. `e2e/login.spec.ts` を未認証前提のテストに調整（バイパス外しの記述を storageState 未設定に置換）。
7. CI（`.github/workflows/ci-frontend.yml`）の E2E 実行が Secrets Manager の `E2E_TEST_USER_EMAIL/PASSWORD` を setup project に渡すよう確認・調整。

## リスク・留意点

- **CI が常に実 Cognito 認証情報必須になる**: 従来はバイパスで多くの spec が認証情報なしで動いていた。一本化後は setup project が最初に実ログインするため、`E2E_TEST_USER_EMAIL/PASSWORD` が常に必要。CI は既に Secrets Manager から取得しているので条件は満たす。
- **storageState の失効**: Cognito トークンには期限がある。setup は各実行の冒頭で走るため通常は問題ないが、長時間実行では失効の可能性を考慮。
- **ローカル人間レビューの体験**: 一本化により、素の `next dev` では従来通りログインが必要。人間が拡張なしでレビューしたい場合は、別途（本ドキュメントのスコープ外で）環境ゲート付き dev ログインの追加を検討する余地はあるが、まずは公式標準への一本化を優先する。
- **storageState ファイルは秘密情報**: `playwright/.auth/*.json` は cookie を含みなりすまし可能。必ず `.gitignore` し、コミットしない。

## 参考

- Next.js Security Advisory — Middleware Authorization Bypass (CVE-2025-29927): https://github.com/vercel/next.js/security/advisories/GHSA-f82v-jwr5-mffw
- Playwright — Authentication: https://playwright.dev/docs/auth
- Playwright — Global setup and teardown: https://playwright.dev/docs/test-global-setup-teardown
- OWASP WSTG — Testing for Bypassing Authentication Schema: https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/04-Authentication_Testing/04-Testing_for_Bypassing_Authentication_Schema
