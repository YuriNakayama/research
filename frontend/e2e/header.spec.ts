import { test, expect } from "@playwright/test";

test.describe("Header", () => {
  test("shows logo and navigation controls", async ({ page }) => {
    await page.goto("/docs");
    const header = page.locator("header");
    await expect(header.getByText("RESEARCH/VIEWER")).toBeVisible();
    await expect(header.getByText("LOGOUT")).toBeVisible();
  });

  test("theme toggle button is present", async ({ page }) => {
    await page.goto("/docs");
    await expect(
      page.getByRole("button", { name: "テーマ切替" })
    ).toBeVisible();
  });

  test("palette selector button is present", async ({ page }) => {
    await page.goto("/docs");
    await expect(
      page.getByRole("button", { name: "カラーパレット切替" })
    ).toBeVisible();
  });

  test("logo navigates to docs root", async ({ page }) => {
    await page.goto("/docs/daily");
    await page
      .locator("header")
      .getByRole("link", { name: "RESEARCH/VIEWER" })
      .click();
    await expect(page).toHaveURL("/docs");
  });
});

test.describe("Header — mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows hamburger menu and opens mobile nav", async ({ page }) => {
    await page.goto("/docs");
    const menuButton = page.getByRole("button", { name: "メニューを開く" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    // Mobile nav renders "> DOCS" as a link.
    await expect(
      page.locator("header nav").getByRole("link", { name: /DOCS/ })
    ).toBeVisible();
  });
});
