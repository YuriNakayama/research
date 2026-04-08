import type { NextConfig } from "next";

// Safety valve: E2E_BYPASS_TOKEN is only meant to exist during Playwright runs
// against a local dev server. If it leaks into a production build the entire
// middleware auth check can be bypassed with a single header, so we refuse to
// build in that case.
if (
  process.env.NODE_ENV === "production" &&
  process.env.E2E_BYPASS_TOKEN &&
  process.env.ALLOW_E2E_BYPASS_IN_PROD !== "true"
) {
  throw new Error(
    "E2E_BYPASS_TOKEN must not be set in production builds. " +
      "If this is intentional (e.g. a staging smoke test), set ALLOW_E2E_BYPASS_IN_PROD=true.",
  );
}

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "arxiv.org",
      },
    ],
  },
};

export default nextConfig;
