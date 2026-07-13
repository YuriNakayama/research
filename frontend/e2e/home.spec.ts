import { test, expect } from "@playwright/test";

test.describe("Home page (research root)", () => {
  test("redirects to /research and displays document listing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/research");
    await expect(page.getByRole("heading", { name: "RESEARCH" })).toBeVisible();
  });

  test("displays root directory entries", async ({ page }) => {
    await page.goto("/research");
    const main = page.locator("main");
    // Directory cards include a label like "01 / DIR" alongside the name,
    // so match the link by href instead of accessible name.
    await expect(main.locator('a[href="/research/runs"]')).toBeVisible();
    await expect(main.locator('a[href="/research/_e2e_fixture"]')).toBeVisible();
  });

  test("navigates to directory on folder card click", async ({ page }) => {
    await page.goto("/research");
    await page.locator('main a[href="/research/_e2e_fixture"]').click();
    await expect(page).toHaveURL("/research/_e2e_fixture");
  });
});
