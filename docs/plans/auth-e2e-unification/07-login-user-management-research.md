# E2E / ローカルテストのログインユーザー管理ベストプラクティス調査

Playwright 公式ドキュメントを中心に、認証必須アプリの E2E / ローカルテストにおける
「ログインユーザー管理」のベストプラクティスを調査した結果と、本プロジェクト
（Next.js + AWS Cognito/Amplify）への適用方針をまとめる。

## エグゼクティブサマリ

1. **「1 回だけ認証して storageState を全テストで再利用」が公式推奨**。setup プロジェクト
   依存で実現する。今回の実装（`auth.setup.ts` + project dependency）はこの標準形に一致。
2. **storageState ファイルは機密**（セッションを乗っ取れる）。**必ず `.gitignore`**。
   今回 `frontend/.gitignore` に `e2e/.auth/` を追加済み ✔。
3. **資格情報はコードに埋め込まず環境変数 / CI シークレット**から。今回は Secrets Manager
   → CI env → `E2E_TEST_USER_EMAIL/PASSWORD` の経路で満たしている ✔。
4. **UI ログインは 1 本の専用テストに留め、残りは API/プログラム的ログインで高速化**するのが
   スケール時の定石（UI 2〜5 秒 → API 0.3〜0.5 秒）。本プロジェクトへの**次の改善候補**。
5. **並列 worker ごとにアカウントを分ける**のは「サーバ状態を書き換えるテスト」の話。
   本プロジェクトは閲覧専用（docs ビューア）なので**共有アカウント 1 つで十分**。

## 調査で得られた原則（出典付き）

### A. コアパターン: storageState + setup プロジェクト

Playwright 公式が第一に推す構成。setup プロジェクトで一度ログイン → `storageState` を
JSON 保存 → 各テストプロジェクトが `dependencies: ['setup']` と `storageState` で再利用する。

```typescript
// playwright.config.ts（公式パターン）
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'] },
]
```

- **globalSetup より project dependency が優れる**: setup がレポートに出て trace/screenshot が
  残る（TestDino）。→ 今回この構成を採用済み。
- **100+ テストでスイート実行時間を 40〜60% 削減**しうる（"authenticate once, reuse everywhere"）。

### B. storageState は機密 — 必ず gitignore

> "The browser state file may contain sensitive cookies and headers that could be used to
> impersonate you or your test account. We strongly discourage checking them into
> repositories." — Playwright 公式

- 2025 Verizon DBIR: **漏洩した CI/CD シークレットの 50% が GitLab トークン**、GitHub 上の
  漏洩シークレットの**修復までの中央値は 94 日**。有効なセッショントークン入りの
  storageState をコミットしてしまうのは SOC2 / GDPR 上の報告対象インシデントになりうる。
- 対策: `.gitignore` に auth ディレクトリを追加。**永続不要なら `testProject.outputDir` 配下に
  書けば毎回自動クリーンされる**。

### C. 資格情報の管理

- **コードに埋め込まない。環境変数 / CI シークレット（GitHub Secrets 等）から注入**。
- **アカウントはユニークに**: 「複数メンバーが同時にテストを走らせても干渉しないよう
  アカウントは一意に」（公式）。共有アカウントを並列 worker で使い回すのはアンチパターン。

### D. UI ログイン vs プログラム的（API）ログイン

| 方式 | 速度 | 用途 |
|------|------|------|
| UI ログイン（フォーム操作） | 2〜5 秒 | **ログイン機能自体の検証（1 本の専用テスト）** |
| API / SDK ログイン | 0.3〜0.5 秒 | **それ以外の全テストの認証状態準備（setup）** |

> "If your web application supports authenticating via API that is easier/faster than the UI,
> send the API request with APIRequestContext and save authenticated state as usual." — 公式

- **推奨戦略**: UI ログインは 1 本だけ残し、setup は API/SDK で高速化。両者を同一スイートに混在。

### E. 複数ロール（admin / user 等）

- ロールごとに setup を分け、別々の JSON に保存 → テストで
  `test.use({ storageState: 'playwright/.auth/admin.json' })`。
- 1 テスト内で複数ロールを同時に使うなら `browser.newContext({ storageState })` を
  ロールごとに開く。
- **本プロジェクトは単一ロール**（閲覧ユーザー）なので現状は不要。

### F. 並列と worker スコープ認証

- **サーバ状態を書き換えるテスト**は worker ごとにアカウントを分離する
  （`test.info().parallelIndex` でユニークアカウント割当、worker スコープ fixture で
  storageState を上書き）。
- **本プロジェクトは読み取り専用（docs ビューア）**なので共有アカウント 1 つで
  並列実行しても干渉しない → 現状の共有 storageState で問題なし。

### G. セッション/トークンの失効と flakiness 対策

- **リダイレクト完了前に storageState を保存しない**（Cookie が乗る前に保存すると認証が欠落）。
  → 最終 URL への到達か認証後 UI 要素の可視化を待つ。今回の `auth.setup.ts` は
  `await expect(page).toHaveURL(/\/(docs)?$/)` で待機済み ✔。
- **CI では project dependency により毎回 setup が走る**ので失効しにくい。ローカルの
  UI モードは高速化のため setup を毎回は走らせない → 失効時は手動で `auth.setup.ts` 再実行。
- **未認証パスのテストは storageState を空に**して検証:
  `test.use({ storageState: { cookies: [], origins: [] } })`。今回 `login.spec.ts` で採用済み ✔。

### H. 公式・記事が挙げるアンチパターン

1. 資格情報をバージョン管理にハードコード
2. リダイレクト連鎖の完了前に storageState を保存（Cookie 欠落）
3. 同一アカウントを並列 worker で共用
4. auth JSON をコミット
5. 未認証パスのテストを省略
6. テスト用バイパス経路の保護不備（**"A leaked bypass route is a critical security
   vulnerability"** — まさに今回撤去した `x-e2e-bypass` が該当）

## 本プロジェクトの現状評価

| ベストプラクティス | 現状 | 判定 |
|--------------------|------|------|
| storageState + setup プロジェクト依存 | `auth.setup.ts` + `dependencies:['setup']` | ✅ 準拠 |
| auth 状態を gitignore | `frontend/.gitignore` に `e2e/.auth/` | ✅ 準拠 |
| 資格情報を env/シークレットから | Secrets Manager → CI env | ✅ 準拠 |
| 未認証テストは空 storageState | `login.spec.ts` で `{cookies:[],origins:[]}` | ✅ 準拠 |
| リダイレクト完了を待って保存 | `toHaveURL` 待機後に `storageState()` | ✅ 準拠 |
| バイパス経路を残さない | `x-e2e-bypass` を撤去 | ✅ 準拠 |
| UI ログインは 1 本、他は高速ログイン | **現状 setup も UI ログイン（Amplify フォーム操作）** | ⚠ 改善余地 |
| 並列 worker ごとアカウント分離 | 閲覧専用のため不要 | — 該当せず |

## 推奨する次の改善: Cognito プログラム的ログインで setup を高速化

現状 `auth.setup.ts` は Amplify UI のフォームを実操作している（UI ログイン）。
公式・各記事は **UI ログインは 1 本の専用テストに留め、setup は API/SDK ログインで
高速化**することを推奨している。AWS Cognito では 2 通り:

### 方式 1: Amplify Auth `signIn` を Node 上で直接呼ぶ

```typescript
// auth.setup.ts（イメージ）
import { signIn, fetchAuthSession } from "aws-amplify/auth";
// Amplify を Node コンテキストで configure した上で
await signIn({ username, password });
const session = await fetchAuthSession();
// トークンを storageState として書き出す
```

- **効果**: 記事では 8 ユーザーのログインが「1 分超 → 9 秒」に短縮。
- **重要な注意**: トークンの**格納先（localStorage か Cookie か）とキー名**がアプリ実装に
  依存する。本プロジェクトは `Amplify.configure(..., { ssr: true })` のため、認証は
  **Cookie ベース**（`middleware.ts` の `fetchAuthSession` が Cookie から復元）。
  記事の多くは localStorage 前提なので、**そのままでは middleware が認識しない可能性**があり、
  Cookie に正しいキーで書き込む変換が必要。ここが実装の肝。

### 方式 2: Cognito `InitiateAuth`（USER_PASSWORD_AUTH）で SRP を回避

- `@aws-sdk/client-cognito-identity-provider` の `InitiateAuth` で ID/Access/Refresh トークンを
  取得し、Amplify の Cookie キー形式に整形して storageState に注入。
- User Pool App Client で **`USER_PASSWORD_AUTH` フローの有効化**が前提。

### 判断

- **現状の UI ログイン setup でも公式準拠**であり、テスト数が少ない今は実害が小さい。
- テストが増える / setup 時間が問題化した段階で、上記いずれかへ移行する価値がある。
- ssr Cookie ベースゆえ変換が非自明なので、**移行時は別 PR で「1 ユーザーで Cookie 形式を
  実験→ middleware が通ることを確認」してから**入れるのが安全。

## 結論

今回の `storageState + setup プロジェクト + バイパス撤去` は、Playwright 公式および
主要記事のベストプラクティスに**そのまま合致**している。特に「バイパス経路を残さない」は
セキュリティ観点で公式がアンチパターンとして挙げる項目を解消できている。
唯一の伸びしろは **setup の UI ログイン → Cognito プログラム的ログインへの高速化**で、
これはテスト規模が拡大した際の任意最適化（ssr Cookie 形式への変換が要点）。

## 出典

- [Authentication | Playwright 公式](https://playwright.dev/docs/auth)
- [Playwright Authentication: 5 Patterns Every QA Must Know | TestDino](https://testdino.com/blog/playwright-authentication)
- [How to Manage Authentication in Playwright | Checkly](https://www.checklyhq.com/docs/learn/playwright/authentication/)
- [Testing Authentication with Playwright: The Complete Guide | Currents.dev](https://currents.dev/posts/testing-authentication-with-playwright-the-complete-guide)
- [Playwright: Using Cognito to Log In for Your E2E Tests | DEV Community](https://dev.to/r0nunes/playwright-using-cognito-to-log-in-for-your-e2e-tests-3ap7)
- [Preserve authenticated AWS Cognito state in Playwright | Medium](https://medium.com/@dadamschi/preserve-authenticated-aws-cognito-state-in-playwright-822d01817989)
- [Simplifying E2E testing in MFA-enabled environments with Playwright's auth sessions | Elio Struyf](https://www.eliostruyf.com/e2e-testing-mfa-environment-playwright-auth-session/)
- [Using Playwright's storageState | BrowserStack](https://www.browserstack.com/guide/playwright-storage-state)
