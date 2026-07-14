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
});
