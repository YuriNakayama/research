import { defineConfig, devices } from "@playwright/test";
import { STORAGE_STATE } from "./e2e/auth-state";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  maxFailures: process.env.CI ? 5 : undefined,
  workers: process.env.CI ? 2 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    // 認証済み storageState を生成するセットアッププロジェクト。
    { name: "setup", testMatch: /auth\.setup\.ts/ },

    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"], storageState: STORAGE_STATE },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    // In CI we expect `next build` to have run already, so start the prod
    // server (much faster page loads than `next dev`). Locally fall back to
    // the dev server for the usual iteration workflow.
    command: process.env.CI
      ? "npx next start --port 3000"
      : "npm run dev -- --port 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // 認証は実 Cognito を通すため、dev/prod サーバに Cognito 設定を渡す。
    env: {
      NEXT_PUBLIC_COGNITO_USER_POOL_ID:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
      NEXT_PUBLIC_COGNITO_APP_CLIENT_ID:
        process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID ?? "",
    },
  },
});
