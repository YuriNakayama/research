import { test, expect } from "@playwright/test";

test.describe("Domain page (directory listing)", () => {
  test("displays directory entries for daily/legal_tech", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech");
    await expect(
      page.getByRole("heading", { name: "LEGAL_TECH" })
    ).toBeVisible();
    const main = page.locator("main");
    await expect(
      main.locator('a[href="/docs/daily/legal_tech/report"]')
    ).toBeVisible();
  });

  test("navigates to report directory", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech");
    await page
      .locator('main a[href="/docs/daily/legal_tech/report"]')
      .click();
    await expect(page).toHaveURL("/docs/daily/legal_tech/report");
  });

  test("report directory shows report files", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech/report");
    const main = page.locator("main");
    await expect(
      main.locator('a[href="/docs/daily/legal_tech/report/20260329"]')
    ).toBeVisible();
  });

  test("clicking report file navigates to report detail", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech/report");
    await page
      .locator('main a[href="/docs/daily/legal_tech/report/20260329"]')
      .click();
    await expect(page).toHaveURL("/docs/daily/legal_tech/report/20260329");
  });
});
