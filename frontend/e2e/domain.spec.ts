import { test, expect } from "@playwright/test";

test.describe("Domain page (directory listing)", () => {
  test("displays directory entries for daily/legal_tech", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech");
    await expect(
      page.getByRole("heading", { name: "legal_tech" })
    ).toBeVisible();
    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: "report", exact: true })
    ).toBeVisible();
  });

  test("navigates to report directory", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech");
    await page
      .locator("main")
      .getByRole("link", { name: "report", exact: true })
      .click();
    await expect(page).toHaveURL("/docs/daily/legal_tech/report");
  });

  test("report directory shows report files", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech/report");
    const main = page.locator("main");
    await expect(
      main.getByRole("link", { name: "20260329", exact: true })
    ).toBeVisible();
  });

  test("clicking report file navigates to report detail", async ({ page }) => {
    await page.goto("/docs/daily/legal_tech/report");
    await page
      .locator("main")
      .getByRole("link", { name: "20260329", exact: true })
      .click();
    await expect(page).toHaveURL(
      "/docs/daily/legal_tech/report/20260329"
    );
  });
});
