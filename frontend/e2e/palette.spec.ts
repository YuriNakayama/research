import { test, expect } from "@playwright/test";

test.describe("Palette selector", () => {
  test("opens palette dropdown and shows all palettes", async ({ page }) => {
    await page.goto("/research");
    const button = page.getByRole("button", { name: "カラーパレット切替" });
    await expect(button).toBeVisible();
    await button.click();
    await expect(page.getByText("Dark Teal")).toBeVisible();
    await expect(page.getByText("Sunset")).toBeVisible();
    await expect(page.getByText("Coral")).toBeVisible();
    await expect(page.getByText("Aqua Sky")).toBeVisible();
    await expect(page.getByText("Vivid Pop")).toBeVisible();
    await expect(page.getByText("Mono Red")).toBeVisible();
    await expect(page.getByText("Espresso")).toBeVisible();
    await expect(page.getByText("Ocean Coral")).toBeVisible();
  });

  test("switches palette and applies data attribute", async ({ page }) => {
    await page.goto("/research");
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Sunset").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "sunset"
    );
  });

  test("persists palette selection across navigation", async ({ page }) => {
    await page.goto("/research");
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Espresso").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "espresso"
    );
    // Navigate to another page. The root is now a domain dashboard that does
    // not list _e2e_fixture, so go to the deterministic fixture report directly.
    await page.goto("/research/_e2e_fixture");
    await expect(page).toHaveURL("/research/_e2e_fixture");
    // Palette should persist
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "espresso"
    );
  });


  test("closes dropdown on escape key", async ({ page }) => {
    await page.goto("/research");
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await expect(page.getByText("Ocean Coral")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByText("Ocean Coral")).not.toBeVisible();
  });

  test("default palette also sets the data attribute", async ({ page }) => {
    await page.goto("/research");
    // Switch to a non-default palette first
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Coral").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "coral"
    );
    // Switch back to the default (Dark Teal). Every palette — including the
    // default — now carries its own full scheme via data-palette, so the
    // attribute must be present (not removed).
    await page
      .getByRole("button", { name: "カラーパレット切替" })
      .click();
    await page.getByText("Dark Teal").click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-palette",
      "dark-teal"
    );
  });
});
