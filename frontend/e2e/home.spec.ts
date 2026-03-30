import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("displays Research Viewer heading and domain cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main").getByRole("heading", { name: "Research Viewer" })).toBeVisible();
    await expect(page.locator("main").getByText("Legal Tech")).toBeVisible();
    await expect(page.getByText("法律・リーガルテック分野のリサーチ")).toBeVisible();
  });

  test("navigates to domain page on card click", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: "Legal Tech 法律・リーガルテック分野のリサーチ" })
      .click();
    await expect(page).toHaveURL("/legal_tech");
    await expect(page.getByRole("heading", { name: "Legal Tech" })).toBeVisible();
  });
});
