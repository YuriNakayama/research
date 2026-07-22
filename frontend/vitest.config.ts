import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests cover the DOM-independent note-anchoring logic. Component and
// flow coverage lives in the Playwright suite under e2e/.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
