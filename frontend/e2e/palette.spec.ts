import { test, expect } from "@playwright/test";

test.describe("Palette selector", () => {
  test("opens palette dropdown and shows all palettes", async ({ page }) => {
    await page.goto("/docs");
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
    await page.goto("/docs");
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
    await page.goto("/docs");
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Forest").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "forest"
    );
    // Navigate to another page
    await page.getByRole("link", { name: "daily" }).click();
    await expect(page).toHaveURL("/docs/daily");
    // Palette should persist
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "forest"
    );
  });

  test("closes dropdown on escape key", async ({ page }) => {
    await page.goto("/docs");
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
    await page.goto("/docs");
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
