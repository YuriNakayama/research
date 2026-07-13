# Step 2: `playwright.config.ts` の再構成

## 目的

- `setup` プロジェクトを追加し、`auth.setup.ts` を実行させる。
- `chromium` / `mobile-chrome` を `setup` に依存させ、`storageState` を注入する。
- `x-e2e-bypass` トークン生成と `extraHTTPHeaders` を撤去する。
- `webServer.env` から `E2E_BYPASS_TOKEN` を撤去し、代わりに Cognito 変数を渡す。

## 変更後の `frontend/playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";
// test() を含まない定数モジュールから import する（auth.setup.ts から import すると
// config ロード時に setup() が評価され Playwright がエラーになる）。
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
      // auth.setup.ts は setup プロジェクトでのみ実行する。
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
    command: process.env.CI
      ? "npx next start --port 3000"
      : "npm run dev -- --port 3000",
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // 認証は実 Cognito を通すため、dev/prod サーバに Cognito 設定を渡す。
    // （CI の Playwright ステップが同じ env を export 済みだが、webServer が
    //  別プロセスとして起動される場合に備え明示する。）
    env: {
      NEXT_PUBLIC_COGNITO_USER_POOL_ID:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? "",
      NEXT_PUBLIC_COGNITO_APP_CLIENT_ID:
        process.env.NEXT_PUBLIC_COGNITO_APP_CLIENT_ID ?? "",
    },
  },
});
```

## 撤去された要素

- `import { randomBytes } from "node:crypto";`
- `bypassToken` 生成と `process.env.E2E_BYPASS_TOKEN = ...` の副作用
- `use.extraHTTPHeaders`
- `webServer.env.E2E_BYPASS_TOKEN`

## `.gitignore`

`frontend/.gitignore` に以下を追記（無ければ）:

```
# Playwright auth storage state (generated per run)
e2e/.auth/
```

## 注意 / 検討

- **storageState ファイルが未生成のまま authenticated プロジェクトが走るケース**:
  資格情報が無いと `setup` が skip し `user.json` が生成されない。この場合
  Playwright は `storageState` に指定されたファイルが無いと**エラー**になり得る。
  対策として `auth.setup.ts` 側で「skip 時でも空の storageState を書き出す」か、
  もしくは **未認証プロジェクトを別立て**にして authenticated プロジェクト自体を
  資格情報が無い時に走らせない構成にする（Step 3 で `login.spec` を専用プロジェクト化
  する際に合わせて判断）。
  → 本計画では **`auth.setup.ts` が skip 時に空 state を書き出さない**代わりに、
  資格情報が無い環境では authenticated spec が「storageState 不在」で落ちる。
  これは「CI では常に資格情報あり」を前提とするため許容。ローカルで authenticated
  spec を回したい場合は資格情報を設定する運用とする（README のトレードオフに記載済み）。

## 完了条件

- [ ] `setup` プロジェクトが定義され `auth.setup.ts` を実行
- [ ] `chromium` / `mobile-chrome` が `dependencies: ["setup"]` と `storageState` を持つ
- [ ] config 内に `extraHTTPHeaders` / `E2E_BYPASS_TOKEN` / `randomBytes` が無い
