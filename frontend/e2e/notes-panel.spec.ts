import { test, expect } from "@playwright/test";

// The notes panel talks to DynamoDB, which is not provisioned in CI. These
// tests therefore assert only the always-deterministic UI contract: the panel
// renders on a document page, exposes the input affordances, and disables
// submit for empty input. The successful create/list/delete round-trip is
// covered where a real table is available, not here.
const REPORT_URL = "/research/_e2e_fixture/legal_tech/report/20260329";

test.describe("Personal notes panel", () => {
  test("renders on a document page with input affordances", async ({
    page,
  }) => {
    await page.goto(REPORT_URL);

    const panel = page.getByRole("region").filter({ hasText: "個人メモ" });
    await expect(panel).toBeVisible();
    await expect(
      panel.getByText("このメモはあなただけに表示されます。"),
    ).toBeVisible();
    await expect(
      panel.getByPlaceholder("このドキュメントへのメモを書く…"),
    ).toBeVisible();
  });

  test("disables the add button until text is entered", async ({ page }) => {
    await page.goto(REPORT_URL);

    const panel = page.getByRole("region").filter({ hasText: "個人メモ" });
    const addButton = panel.getByRole("button", { name: "追加" });
    await expect(addButton).toBeDisabled();

    await panel
      .getByPlaceholder("このドキュメントへのメモを書く…")
      .fill("テストメモ");
    await expect(addButton).toBeEnabled();
  });
});
