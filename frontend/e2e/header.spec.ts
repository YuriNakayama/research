import { test, expect } from "@playwright/test";

test.describe("Header", () => {
  test("shows logo and navigation links", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header.getByText("Research Viewer")).toBeVisible();
    await expect(header.getByText("ログアウト")).toBeVisible();
  });

  test("theme toggle button is present", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "テーマ切替" })
    ).toBeVisible();
  });

  test("logo navigates to home", async ({ page }) => {
    await page.goto("/legal_tech");
    await page.locator("header").getByRole("link", { name: "Research Viewer" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("Header — mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows hamburger menu and opens mobile nav", async ({ page }) => {
    await page.goto("/");
    const menuButton = page.getByRole("button", { name: "メニューを開く" });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    // Mobile nav is the border-t nav that appears after hamburger click
    await expect(page.locator("header nav.border-t").getByText("Legal Tech")).toBeVisible();
  });
});
