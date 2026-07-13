import { test, expect } from "@playwright/test";

test.describe("Header", () => {
  test("shows logo and navigation controls", async ({ page }) => {
    await page.goto("/research");
    const header = page.locator("header");
    await expect(header.getByText("RESEARCH/VIEWER")).toBeVisible();
    await expect(header.getByText("LOGOUT")).toBeVisible();
  });

  test("theme toggle button is present", async ({ page }) => {
    await page.goto("/research");
    await expect(
      page.getByRole("button", { name: "テーマ切替" })
    ).toBeVisible();
  });

  test("palette selector button is present", async ({ page }) => {
    await page.goto("/research");
    await expect(
      page.getByRole("button", { name: "カラーパレット切替" })
    ).toBeVisible();
  });

  test("logo navigates to research root", async ({ page }) => {
    await page.goto("/research/_e2e_fixture");
    await page
      .locator("header")
      .getByRole("link", { name: "RESEARCH/VIEWER" })
      .click();
    await expect(page).toHaveURL("/research");
  });
});

test.describe("Header — mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows hamburger menu and opens mobile nav", async ({ page }) => {
    await page.goto("/research");
    const menuButton = page.getByRole("button", { name: "メニューを開く" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    // Mobile nav renders "> RESEARCH" as a link.
    await expect(
      page.locator("header nav").getByRole("link", { name: /RESEARCH/ })
    ).toBeVisible();
  });
});
