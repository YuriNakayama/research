import path from "node:path";

// Path to the authenticated storageState produced by auth.setup.ts and consumed
// by the authenticated Playwright projects. Kept in its own module (no test()
// calls) so playwright.config.ts can import it without triggering test
// registration at config-load time.
export const STORAGE_STATE = path.join(__dirname, ".auth/user.json");
