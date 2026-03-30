import { test, expect } from "@playwright/test";

test.describe("Domain page", () => {
  test("displays report cards for legal_tech domain", async ({ page }) => {
    await page.goto("/legal_tech");
    await expect(page.getByRole("heading", { name: "Legal Tech" })).toBeVisible();
    // Report card from fixture markdown + CSV metadata
    await expect(
      page.getByText("Natural Language Processing for the Legal Domain")
    ).toBeVisible();
  });

  test("report card shows metadata", async ({ page }) => {
    await page.goto("/legal_tech");
    await expect(page.getByText("Ferraro et al.")).toBeVisible();
    await expect(page.getByText("2024")).toBeVisible();
  });

  test("clicking report card navigates to report detail", async ({ page }) => {
    await page.goto("/legal_tech");
    await page
      .getByRole("link", { name: /Natural Language Processing/ })
      .click();
    await expect(page).toHaveURL(/\/legal_tech\/20260329/);
  });
});
