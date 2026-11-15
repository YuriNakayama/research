import { test, expect } from "@playwright/test";

// Housekeeping (dev/research-admin) keeps domains tagged and records moved
// paths in research/_meta/redirects.yaml. These specs rely on the first real
// housekeeping run: kaggle_ptcg_ai_battle was merged into kaggle_ptcg and its
// clustering run renumbered to 20260626-2.
test.describe("Research housekeeping", () => {
  test("browses domains by tag on the home page", async ({ page }) => {
    await page.goto("/research");
    const browser = page.getByTestId("tag-browser");
    await expect(browser).toBeVisible();

    const list = page.getByTestId("tag-browser-domains");
    const all = await list.locator("li").count();

    await browser.locator('button[data-tag="kaggle"]').click();
    await expect(browser.locator('button[data-tag="kaggle"]')).toHaveAttribute("aria-pressed", "true");
    await expect(list.locator("li")).not.toHaveCount(all);
    await expect(list.getByRole("link", { name: /Pokémon TCG/ })).toBeVisible();

    await browser.locator('button[data-tag="kaggle"]').click();
    await expect(list.locator("li")).toHaveCount(all);
  });

  test("redirects a document of a merged domain to its new path", async ({ page }) => {
    await page.goto("/research/runs/kaggle_ptcg_ai_battle/clustering/20260626/index");
    await expect(page).toHaveURL("/research/runs/kaggle_ptcg/clustering/20260626-2/index");
    await expect(page.locator("main")).toBeVisible();
  });

  test("redirects a cluster report of a merged domain", async ({ page }) => {
    await page.goto("/research/runs/kaggle_ptcg_ai_battle/retrieval/20260626/llm_agents/01-pokechamp-minimax-language-agent");
    await expect(page).toHaveURL("/research/runs/kaggle_ptcg/retrieval/20260626/llm_agents/01-pokechamp-minimax-language-agent");
  });
});
