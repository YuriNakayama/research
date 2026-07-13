import { test, expect } from "@playwright/test";

// The login flow must be exercised from an unauthenticated state, so override
// the project-level storageState with an empty one. Every other spec inherits
// the authenticated storageState produced by auth.setup.ts.
test.use({ storageState: { cookies: [], origins: [] } });

const testUserEmail = process.env.E2E_TEST_USER_EMAIL;
const testUserPassword = process.env.E2E_TEST_USER_PASSWORD;
const hasCredentials = Boolean(testUserEmail && testUserPassword);

test.describe("Login page", () => {
  test("unauthenticated request to a protected page redirects to /login", async ({
    page,
  }) => {
    const response = await page.goto("/");
    // Final URL is /login regardless of how many hops the redirect took.
    await expect(page).toHaveURL(/\/login$/);
    // Sanity: the landing page visibly renders as the login form.
    await expect(page.getByRole("heading", { name: /RESEARCH/ })).toBeVisible();
    expect(response?.ok()).toBeTruthy();
  });

  test("displays login form with heading and logo", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /RESEARCH/ })).toBeVisible();
    await expect(page.getByText("アクセスにはログインが必要です。")).toBeVisible();
  });

  test.describe("real Cognito login", () => {
    test.skip(
      !hasCredentials,
      "Set E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD to run the live login test. In CI these come from Secrets Manager.",
    );

    test("successful login redirects to home", async ({ page }) => {
      await page.goto("/login");

      // Amplify UI renders input name attributes `username` and `password`.
      await page.fill('input[name="username"]', testUserEmail!);
      await page.fill('input[name="password"]', testUserPassword!);
      await page.getByRole("button", { name: /sign in|ログイン/i }).click();

      // PostLogin component pushes router.replace("/") on success.
      await expect(page).toHaveURL(/\/(docs)?$/, { timeout: 15_000 });
    });

    test("wrong password shows an error and stays on /login", async ({
      page,
    }) => {
      await page.goto("/login");
      await page.fill('input[name="username"]', testUserEmail!);
      await page.fill('input[name="password"]', "obviously-wrong-password-xyz");
      await page.getByRole("button", { name: /sign in|ログイン/i }).click();

      // Amplify surfaces the error via an alert role; accept any non-empty text.
      await expect(page.getByRole("alert")).toBeVisible({ timeout: 10_000 });
      await expect(page).toHaveURL(/\/login$/);
    });
  });
});
