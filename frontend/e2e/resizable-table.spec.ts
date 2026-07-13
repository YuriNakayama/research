import { test, expect } from "@playwright/test";

// This report renders several Markdown tables (arXiv result tables), so it is a
// good target for the resizable-table behaviour.
const REPORT_URL = "/docs/daily/data_analysis_agent/reports/2026-04-09/report";
const STORAGE_KEY_PREFIX = "rt-cols:daily/data_analysis_agent/reports/2026-04-09";

test.describe("Resizable tables", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("renders resize handles on rendered tables", async ({ page }) => {
    await page.goto(REPORT_URL);
    await expect(page.getByRole("heading", { name: /Executable Code/ }).first()).toBeVisible();

    // Handles are added after client hydration + width measurement.
    const handles = page.locator(".resizable-table-handle");
    await expect(handles.first()).toBeVisible({ timeout: 15_000 });
    expect(await handles.count()).toBeGreaterThan(0);
  });

  test("keyboard arrow resizes a column and persists per page", async ({ page }) => {
    await page.goto(REPORT_URL);
    const firstScroll = page.locator("[data-resizable-table]").first();
    const firstCol = firstScroll.locator("colgroup col").first();
    await expect(firstCol).toHaveCount(1, { timeout: 15_000 });

    const before = await firstCol.evaluate((el) => (el as HTMLElement).style.width);

    const handle = firstScroll.locator(".resizable-table-handle").first();
    await handle.focus();
    for (let i = 0; i < 4; i += 1) {
      await handle.press("ArrowRight");
    }

    // Width grew.
    await expect
      .poll(async () => firstCol.evaluate((el) => parseInt((el as HTMLElement).style.width, 10)))
      .toBeGreaterThan(parseInt(before, 10));

    // A per-page storage entry was written (keyed by docs slug + source line).
    const storedKeys = await page.evaluate((prefix) => {
      return Object.keys(localStorage).filter((k) => k.startsWith(prefix));
    }, STORAGE_KEY_PREFIX);
    expect(storedKeys.length).toBeGreaterThan(0);
  });

  test("persisted column widths survive a reload", async ({ page }) => {
    await page.goto(REPORT_URL);
    const firstScroll = page.locator("[data-resizable-table]").first();
    const firstCol = firstScroll.locator("colgroup col").first();
    await expect(firstCol).toHaveCount(1, { timeout: 15_000 });

    const handle = firstScroll.locator(".resizable-table-handle").first();
    await handle.focus();
    for (let i = 0; i < 6; i += 1) {
      await handle.press("ArrowRight");
    }

    const widened = await firstCol.evaluate((el) =>
      parseInt((el as HTMLElement).style.width, 10),
    );

    await page.reload();
    const reloadedCol = page
      .locator("[data-resizable-table]")
      .first()
      .locator("colgroup col")
      .first();
    await expect(reloadedCol).toHaveCount(1, { timeout: 15_000 });

    await expect
      .poll(async () =>
        reloadedCol.evaluate((el) => parseInt((el as HTMLElement).style.width, 10)),
      )
      .toBe(widened);
  });
});
