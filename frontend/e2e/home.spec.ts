import { test, expect } from "@playwright/test";

test.describe("Home page (research root)", () => {
  test("redirects to /research and displays the dashboard", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/research");
    await expect(page.getByRole("heading", { name: "RESEARCH" })).toBeVisible();
  });

  test("displays domain cards", async ({ page }) => {
    await page.goto("/research");
    const main = page.locator("main");
    // The root now shows a domain dashboard: each card links to
    // /research/domains/<domain>. Assert at least one such card is present.
    await expect(
      main.locator('a[href^="/research/domains/"]').first(),
    ).toBeVisible();
  });

  test("navigates to a domain on card click", async ({ page }) => {
    await page.goto("/research");
    const firstCard = page
      .locator('main a[href^="/research/domains/"]')
      .first();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();
    await expect(page).toHaveURL(href!);
  });
});
