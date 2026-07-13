import { test as setup, expect } from "@playwright/test";
import { STORAGE_STATE } from "./auth-state";

const email = process.env.E2E_TEST_USER_EMAIL;
const password = process.env.E2E_TEST_USER_PASSWORD;

setup("authenticate via Cognito", async ({ page }) => {
  // 資格情報が無い環境では認証済み state を作れない。ここを skip すると、この
  // setup に依存する全プロジェクトも自動的に skip される。CI では資格情報が
  // Secrets Manager から供給されるため常に実行される。
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

  // Cookie(Amplify ssr) と localStorage を含む認証済み状態を保存する。
  await page.context().storageState({ path: STORAGE_STATE });
});
