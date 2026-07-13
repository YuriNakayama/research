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
  // Docs pages and the docs-assets route read Markdown/images from `docs/` at
  // request time (see src/lib/docs-content.ts and the docs-assets route). Since
  // pages are rendered on demand rather than statically pre-generated, the
  // standalone server must ship the `docs/` tree. Next.js file tracing does not
  // pick up these dynamic `fs` reads, so include them explicitly.
  outputFileTracingIncludes: {
    "/docs/[[...slug]]": ["./docs/**/*"],
    "/api/docs-assets/[...path]": ["./docs/**/*"],
  },
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
