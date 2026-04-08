import { test, expect } from "@playwright/test";

const REPORT_URL = "/docs/daily/legal_tech/report/20260329";

test.describe("Report detail page", () => {
  test("displays report title and metadata", async ({ page }) => {
    await page.goto(REPORT_URL);
    await expect(
      page
        .getByRole("heading", {
          name: "Natural Language Processing for the Legal Domain",
        })
        .first()
    ).toBeVisible();
    await expect(
      page.getByText("Ferraro et al.", { exact: true })
    ).toBeVisible();
    await expect(page.getByText("arXiv", { exact: true })).toBeVisible();
  });

  test("renders markdown content with headings", async ({ page }) => {
    await page.goto(REPORT_URL);
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
    await page.goto(REPORT_URL);
    const breadcrumb = page.locator("nav[aria-label='パンくずリスト']");
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.getByText("Docs")).toBeVisible();
    await expect(
      breadcrumb.getByRole("link", { name: "daily" })
    ).toBeVisible();
  });

  test("breadcrumb links navigate correctly", async ({ page }) => {
    await page.goto(REPORT_URL);
    const breadcrumb = page.locator("nav[aria-label='パンくずリスト']");
    await expect(breadcrumb).toBeVisible();
    const link = breadcrumb.getByRole("link", { name: "daily" });
    await link.click();
    await expect(page).toHaveURL("/docs/daily", { timeout: 15_000 });
  });

  test("shows external link to paper", async ({ page }) => {
    await page.goto(REPORT_URL);
    await expect(page.getByText("OPEN SOURCE")).toBeVisible();
  });
});

test.describe("Report detail page — desktop TOC", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("displays table of contents sidebar", async ({ page }) => {
    await page.goto(REPORT_URL);
    const toc = page.locator("aside").last();
    await expect(toc.getByText("[003] / TOC")).toBeVisible();
    await expect(toc.getByText("Introduction")).toBeVisible();
    await expect(toc.getByText("Legal NLP Tasks")).toBeVisible();
    await expect(toc.getByText("Conclusion")).toBeVisible();
  });
});
