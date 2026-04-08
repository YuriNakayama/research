import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";

// Generate a fresh bypass token for every Playwright run. The token is passed
// to the dev server via env var and to the browser via extraHTTPHeaders, so
// only requests originating from this run can skip the middleware auth check.
// It is intentionally NOT prefixed with NEXT_PUBLIC_, so it never reaches the
// client bundle.
const bypassToken =
  process.env.E2E_BYPASS_TOKEN ?? randomBytes(32).toString("hex");
process.env.E2E_BYPASS_TOKEN = bypassToken;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    extraHTTPHeaders: {
      "x-e2e-bypass": bypassToken,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    env: {
      E2E_BYPASS_TOKEN: bypassToken,
    },
  },
});
