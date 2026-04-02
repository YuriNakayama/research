import { test, expect } from "@playwright/test";

test.describe("Home page (docs root)", () => {
  test("redirects to /docs and displays document listing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/docs");
    await expect(
      page.getByRole("heading", { name: "ドキュメント" })
    ).toBeVisible();
  });

  test("displays root directory entries", async ({ page }) => {
    await page.goto("/docs");
    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: "research", exact: true })
    ).toBeVisible();
    await expect(
      main.getByRole("link", { name: "daily", exact: true })
    ).toBeVisible();
  });

  test("navigates to directory on folder card click", async ({ page }) => {
    await page.goto("/docs");
    await page.locator("main").getByRole("link", { name: "daily" }).click();
    await expect(page).toHaveURL("/docs/daily");
  });
});
