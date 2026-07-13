# Step 1: `auth.setup.ts` の新設

## 目的

実 Cognito ログインを 1 度だけ実行し、認証済み状態を `e2e/.auth/user.json` に保存する
Playwright セットアップテストを作る。以降の authenticated spec はこれを再利用する。

## 前提の確認

- Amplify は `{ ssr: true }` で構成されている（`src/lib/amplify.ts`）。
  → 認証トークンは**Cookie**に保存され、`middleware.ts` の `fetchAuthSession` が
  Cookie から復元する。`storageState` は Cookie と localStorage の両方を保存するため
  この経路がそのまま機能する。
- ログイン成功時、`PostLogin` が `router.replace("/")` する（`login.spec.ts` の既存挙動）。
- Amplify UI の入力名は `username` / `password`（既存 login.spec 準拠）。

## 追加ファイル: `frontend/e2e/auth-state.ts`（storageState パス定数）

`STORAGE_STATE` を `auth.setup.ts` から export して config が import すると、
config ロード時に `setup(...)` 呼び出しが評価され Playwright が
`test() を config で呼ぶな` エラーを出す。**test() を含まない別モジュール**に定数を切り出す。

```typescript
import path from "node:path";

// 認証済み storageState の保存先。auth.setup.ts が書き込み、
// playwright.config.ts / 各プロジェクトが読み込む。test() を含まないため
// config から安全に import できる。
export const STORAGE_STATE = path.join(__dirname, ".auth/user.json");
```

## 追加ファイル: `frontend/e2e/auth.setup.ts`

```typescript
import { test as setup, expect } from "@playwright/test";
import { STORAGE_STATE } from "./auth-state";

const email = process.env.E2E_TEST_USER_EMAIL;
const password = process.env.E2E_TEST_USER_PASSWORD;

setup("authenticate via Cognito", async ({ page }) => {
  // 資格情報が無い環境（ローカルの手早い実行など）では認証済み state を作れない。
  // ここを skip すると、この setup に依存する全プロジェクトも自動的に skip される。
  setup.skip(
    !email || !password,
    "Set E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD to run authenticated specs. In CI these come from Secrets Manager.",
  );

  await page.goto("/login");

  // Amplify UI が name="username"/"password" を描画する。
  await page.fill('input[name="username"]', email!);
  await page.fill('input[name="password"]', password!);
  await page.getByRole("button", { name: /sign in|ログイン/i }).click();

  // PostLogin が router.replace("/") → 最終 URL は "/" または "/docs"。
  await expect(page).toHaveURL(/\/(docs)?$/, { timeout: 15_000 });

  // Cookie/localStorage を含む認証済み状態を保存。
  await page.context().storageState({ path: STORAGE_STATE });
});
```

## 注意

- `e2e/.auth/` は生成物なので **`.gitignore`** に追加する（Step 2 で config と同時に対応）。
  - `frontend/.gitignore` に `e2e/.auth/` を追記。
- `login.spec.ts` の既存「successful login redirects to home」テストと重複するが、
  auth.setup はあくまで**状態生成**が目的。login.spec 側は認証フロー UI の検証として残す
  （Step 3 で整理）。

## 完了条件

- [ ] `frontend/e2e/auth.setup.ts` が存在する
- [ ] `STORAGE_STATE` を export しており config から import 可能
- [ ] 資格情報未設定時に `setup.skip` する
