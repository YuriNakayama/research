import { test, expect } from "@playwright/test";

const REPORT_URL = "/docs/daily/legal_tech/report/20260329";

test.describe("Mobile TOC", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("shows floating TOC button on report page", async ({ page }) => {
    await page.goto(REPORT_URL);
    const tocButton = page.getByRole("button", { name: "目次を開く" });
    await expect(tocButton).toBeVisible();
  });

  test("opens TOC drawer and shows headings", async ({ page }) => {
    await page.goto(REPORT_URL);
    await page.getByRole("button", { name: "目次を開く" }).click({ force: true });
    await expect(
      page.getByRole("button", { name: "目次を閉じる" })
    ).toBeVisible();
    const drawer = page.locator(".fixed.inset-0");
    await expect(drawer.getByText("Introduction")).toBeVisible();
    await expect(drawer.getByText("Legal NLP Tasks")).toBeVisible();
    await expect(drawer.getByText("Conclusion")).toBeVisible();
  });

  test("closes TOC drawer with close button", async ({ page }) => {
    await page.goto(REPORT_URL);
    await page.getByRole("button", { name: "目次を開く" }).click({ force: true });
    await expect(
      page.getByRole("button", { name: "目次を閉じる" })
    ).toBeVisible();
    await page.getByRole("button", { name: "目次を閉じる" }).click({ force: true });
    await expect(
      page.getByRole("button", { name: "目次を閉じる" })
    ).not.toBeVisible();
  });
});
