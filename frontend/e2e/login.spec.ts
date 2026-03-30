import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("displays login form with heading", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Research Viewer")).toBeVisible();
    await expect(page.getByText("ログインしてください")).toBeVisible();
  });
});
