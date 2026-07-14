import { test, expect } from "@playwright/test";

test.describe("Header", () => {
  test("shows logo and navigation controls", async ({ page }) => {
    await page.goto("/research");
    const header = page.locator("header");
    // The logo shows the full name from `sm` up and a short "R/V" below it, so
    // the visible text differs by viewport; match the logo link by its href.
    await expect(
      header.locator('a[href="/research"]').first(),
    ).toBeVisible();
    // LOGOUT label is hidden on mobile (icon-only button with aria-label).
    await expect(
      header.getByRole("button", { name: "ログアウト" }),
    ).toBeVisible();
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
    // Match the logo link by href since its visible text varies by viewport.
    await page.locator('header a[href="/research"]').first().click();
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
