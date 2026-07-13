import { test, expect } from "@playwright/test";

test.describe("Palette selector", () => {
  test("opens palette dropdown and shows all palettes", async ({ page }) => {
    await page.goto("/research");
    const button = page.getByRole("button", { name: "カラーパレット切替" });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.getByText("Dark Teal")).toBeVisible();
    await expect(page.getByText("Pastel Mint")).toBeVisible();
    await expect(page.getByText("Pop Blue")).toBeVisible();
    await expect(page.getByText("Forest")).toBeVisible();
    await expect(page.getByText("Sunset")).toBeVisible();
    await expect(page.getByText("Coral")).toBeVisible();
  });

  test("switches palette and applies data attribute", async ({ page }) => {
    await page.goto("/research");
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Pastel Mint").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "pastel-mint"
    );
  });

  test("persists palette selection across navigation", async ({ page }) => {
    await page.goto("/research");
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Forest").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "forest"
    );
    // Navigate to another page (match by href since cards include extra labels)
    await page.locator('main a[href="/research/_e2e_fixture"]').first().click();
    await expect(page).toHaveURL("/research/_e2e_fixture");
    // Palette should persist
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "forest"
    );
  });

  test("drives multi-color role tokens per palette", async ({ page }) => {
    await page.goto("/docs");

    const readTokens = () =>
      page.evaluate(() => {
        const s = getComputedStyle(document.documentElement);
        return {
          accent: s.getPropertyValue("--accent-bg").trim(),
          accent2: s.getPropertyValue("--accent-2-bg").trim(),
          tint: s.getPropertyValue("--surface-tint").trim(),
        };
      });

    // Default (dark-teal) exposes all three role tokens.
    const dflt = await readTokens();
    expect(dflt.accent).not.toBe("");
    expect(dflt.accent2).not.toBe("");
    expect(dflt.tint).not.toBe("");

    // Switching palette changes the secondary accent + surface tint, proving the
    // 3–5 color role tokens (not just the single accent) are wired up.
    await page.getByRole("button", { name: "カラーパレット切替" }).click();
    await page.getByText("Coral").click();
    await expect(page.locator("html")).toHaveAttribute("data-palette", "coral");

    const coral = await readTokens();
    expect(coral.accent2).not.toBe(dflt.accent2);
    expect(coral.tint).not.toBe(dflt.tint);
  });

  test("closes dropdown on escape key", async ({ page }) => {
    await page.goto("/research");
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await expect(page.getByText("Dark Teal")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Pastel Mint")).not.toBeVisible();
  });

  test("switching back to default removes data attribute", async ({
    page,
  }) => {
    await page.goto("/research");
    // Switch to non-default
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Pop Blue").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "pop-blue"
    );
    // Switch back to default
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Dark Teal").click();
    await expect(page.locator("html")).not.toHaveAttribute("data-palette");
  });
});
