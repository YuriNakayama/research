import { test, expect } from "@playwright/test";

test.describe("Report detail page", () => {
  test("displays report title and metadata", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    await expect(
      page.getByRole("heading", {
        name: "Natural Language Processing for the Legal Domain",
      })
    ).toBeVisible();
    await expect(page.getByText("Ferraro et al.", { exact: true })).toBeVisible();
    await expect(page.getByText("arXiv", { exact: true })).toBeVisible();
  });

  test("renders markdown content with headings", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    await expect(
      page.getByRole("heading", { name: "Introduction" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Legal NLP Tasks" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Conclusion" })
    ).toBeVisible();
  });

  test("shows breadcrumb navigation", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    const breadcrumb = page.locator("nav[aria-label='パンくずリスト']");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("ホーム")).toBeVisible();
    await expect(breadcrumb.getByRole("link", { name: "Legal Tech" })).toBeVisible();
  });

  test("breadcrumb links navigate correctly", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    const breadcrumb = page.locator("nav[aria-label='パンくずリスト']");
    await expect(breadcrumb).toBeVisible();
    const link = breadcrumb.getByRole("link", { name: "Legal Tech" });
    await link.click();
    await expect(page).toHaveURL("/legal_tech", { timeout: 15_000 });
  });
});

test.describe("Report detail page — desktop TOC", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("displays table of contents sidebar", async ({ page }) => {
    await page.goto("/legal_tech/20260329");
    const toc = page.locator("aside");
    await expect(toc).toBeVisible();
    await expect(toc.getByText("Introduction")).toBeVisible();
    await expect(toc.getByText("Legal NLP Tasks")).toBeVisible();
    await expect(toc.getByText("Conclusion")).toBeVisible();
  });
});
