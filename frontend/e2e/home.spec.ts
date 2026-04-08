import { test, expect } from "@playwright/test";

test.describe("Home page (docs root)", () => {
  test("redirects to /docs and displays document listing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/docs");
    await expect(page.getByRole("heading", { name: "DOCS" })).toBeVisible();
  });

  test("displays root directory entries", async ({ page }) => {
    await page.goto("/docs");
    const main = page.locator("main");
    // Directory cards include a label like "01 / DIR" alongside the name,
    // so match the link by href instead of accessible name.
    await expect(main.locator('a[href="/docs/research"]')).toBeVisible();
    await expect(main.locator('a[href="/docs/daily"]')).toBeVisible();
  });

  test("navigates to directory on folder card click", async ({ page }) => {
    await page.goto("/docs");
    await page.locator('main a[href="/docs/daily"]').click();
    await expect(page).toHaveURL("/docs/daily");
  });
});
