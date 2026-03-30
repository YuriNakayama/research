import { test, expect } from "@playwright/test";

test.describe("Mobile TOC", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows floating TOC button on report page", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    const tocButton = page.getByRole("button", { name: "目次を開く" });
    await expect(tocButton).toBeVisible();
  });

  test("opens TOC drawer and shows headings", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    await page.getByRole("button", { name: "目次を開く" }).click();
    // The close button only exists inside the drawer
    await expect(page.getByRole("button", { name: "目次を閉じる" })).toBeVisible();
    // Check headings inside the drawer overlay
    const drawer = page.locator(".fixed.inset-0");
    await expect(drawer.getByText("Introduction")).toBeVisible();
    await expect(drawer.getByText("Legal NLP Tasks")).toBeVisible();
    await expect(drawer.getByText("Conclusion")).toBeVisible();
  });

  test("closes TOC drawer with close button", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    await page.getByRole("button", { name: "目次を開く" }).click();
    await expect(page.getByRole("button", { name: "目次を閉じる" })).toBeVisible();
    await page.getByRole("button", { name: "目次を閉じる" }).click();
    await expect(page.getByRole("button", { name: "目次を閉じる" })).not.toBeVisible();
  });
});
