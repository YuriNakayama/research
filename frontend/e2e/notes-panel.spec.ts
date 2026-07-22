import { test, expect } from "@playwright/test";

// The notes widget talks to DynamoDB, which is not provisioned in CI. These
// tests therefore assert only the always-deterministic UI contract: the
// floating button is present, expands into a panel, and the panel's input
// affordances behave. The successful create/list/delete round-trip is covered
// where a real table is available, not here.
const REPORT_URL = "/research/_e2e_fixture/legal_tech/report/20260329";

test.describe("Personal notes floating widget", () => {
  test("shows a collapsed floating button by default", async ({ page }) => {
    await page.goto(REPORT_URL);
    const fab = page.getByRole("button", { name: /個人メモを開く/ });
    await expect(fab).toBeVisible();
    // Collapsed: the panel dialog is not mounted until opened.
    await expect(page.getByRole("dialog", { name: "個人メモ" })).toHaveCount(0);
  });

  test("expands into a panel with input affordances and collapses again", async ({
    page,
  }) => {
    await page.goto(REPORT_URL);
    await page.getByRole("button", { name: /個人メモを開く/ }).click();

    const dialog = page.getByRole("dialog", { name: "個人メモ" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByPlaceholder("このドキュメントへのメモを書く…"),
    ).toBeVisible();

    // The add button is disabled until text is entered.
    const addButton = dialog.getByRole("button", { name: "追加" });
    await expect(addButton).toBeDisabled();
    await dialog
      .getByPlaceholder("このドキュメントへのメモを書く…")
      .fill("テストメモ");
    await expect(addButton).toBeEnabled();

    // Collapsing hides the dialog and restores the button.
    await dialog.getByRole("button", { name: "個人メモを閉じる" }).click();
    await expect(page.getByRole("dialog", { name: "個人メモ" })).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /個人メモを開く/ }),
    ).toBeVisible();
  });

  // Regression: the FAB used to be drag-positioned and could drift on top of
  // the other floating buttons after a viewport resize.
  test("stays clear of the other floating buttons on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(REPORT_URL);

    const notesBox = await page
      .getByRole("button", { name: /個人メモを開く/ })
      .boundingBox();
    expect(notesBox).not.toBeNull();

    for (const name of [/目次/, /ナビゲーション/]) {
      const other = page.getByRole("button", { name });
      if ((await other.count()) === 0) {
        continue;
      }
      const otherBox = await other.first().boundingBox();
      if (!otherBox || !notesBox) {
        continue;
      }
      const overlaps =
        notesBox.x < otherBox.x + otherBox.width &&
        otherBox.x < notesBox.x + notesBox.width &&
        notesBox.y < otherBox.y + otherBox.height &&
        otherBox.y < notesBox.y + notesBox.height;
      expect(overlaps).toBe(false);
    }
  });

  // Regression: the expanded card must never grow past the top of the
  // viewport, or its header (and close button) become unreachable.
  test("keeps the panel header on screen on a short viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 560 });
    await page.goto(REPORT_URL);
    await page.getByRole("button", { name: /個人メモを開く/ }).click();

    const dialog = page.getByRole("dialog", { name: "個人メモ" });
    await expect(dialog).toBeVisible();

    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);

    // The close button must be visible and actually usable.
    const close = dialog.getByRole("button", { name: "個人メモを閉じる" });
    await expect(close).toBeVisible();
    await close.click();
    await expect(page.getByRole("dialog", { name: "個人メモ" })).toHaveCount(0);
  });

  // Regression: a failed save used to be silent — the API redirected to /login,
  // fetch followed it, and the resulting parse error never reached the user.
  test("surfaces an error when the save request fails", async ({ page }) => {
    await page.goto(REPORT_URL);
    await page.route("**/api/notes", async (route) => {
      if (route.request().method() !== "POST") {
        return route.continue();
      }
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Unauthorized" }),
      });
    });

    await page.getByRole("button", { name: /個人メモを開く/ }).click();
    const dialog = page.getByRole("dialog", { name: "個人メモ" });
    await dialog
      .getByPlaceholder("このドキュメントへのメモを書く…")
      .fill("テストメモ");
    await dialog.getByRole("button", { name: "追加" }).click();

    await expect(dialog.getByRole("alert")).toBeVisible();
    // The draft is preserved so the text is not lost on failure.
    await expect(
      dialog.getByPlaceholder("このドキュメントへのメモを書く…"),
    ).toHaveValue("テストメモ");
  });
});
