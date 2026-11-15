import { test, expect } from "@playwright/test";

// The home page is a "work resumption point": a recent-report feed as the
// primary content, a prominent search entry point, and a compact active-domain
// strip. Assertions here are structural rather than content-based on purpose —
// the feed is built from the real research content (`runs/` plus the
// human-authored `domains/<d>/{studies,discussions}`), so its individual titles
// are not deterministic. The `domains/_e2e_fixture` anchors are dated 2000-01-01
// and never reach the top of the feed.
// Feed rows link to a document either under runs/ (skill output) or under the
// human-authored domains/<d>/{studies,discussions}. Which kind tops the feed
// depends on the newest real content, so accept both.
const FEED_ROW =
  'a[href^="/research/runs/"], a[href^="/research/domains/"][href*="/studies/"], a[href^="/research/domains/"][href*="/discussions/"]';

test.describe("Home page (research root)", () => {
  test("redirects to /research and displays the home view", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/research");
    await expect(page.getByRole("heading", { name: "RESEARCH" })).toBeVisible();
  });

  test("displays the recent reports feed linking to report pages", async ({
    page,
  }) => {
    await page.goto("/research");
    const feed = page.getByTestId("recent-reports");
    await expect(feed).toBeVisible();
    // Every feed row points at an actual document, not another index.
    await expect(feed.locator(FEED_ROW).first()).toBeVisible();
  });

  test("navigates to a report on feed row click", async ({ page }) => {
    await page.goto("/research");
    const firstRow = page
      .getByTestId("recent-reports")
      .locator(FEED_ROW)
      .first();
    const href = await firstRow.getAttribute("href");
    await firstRow.click();
    await expect(page).toHaveURL(href!);
    // The destination is a rendered document, not a directory listing.
    await expect(page.locator("main")).toBeVisible();
  });

  test("opens the command palette from the central search box", async ({
    page,
  }) => {
    await page.goto("/research");
    await page.getByTestId("home-search").click();
    await expect(
      page.getByRole("dialog", { name: "リサーチ横断検索" }),
    ).toBeVisible();
  });

  test("displays active domains and navigates on click", async ({ page }) => {
    await page.goto("/research");
    const domains = page.getByTestId("active-domains");
    await expect(domains).toBeVisible();

    const firstDomain = domains
      .locator('a[href^="/research/domains/"]')
      .first();
    const href = await firstDomain.getAttribute("href");
    await firstDomain.click();
    await expect(page).toHaveURL(href!);
  });
});
