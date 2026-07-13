import type { NextConfig } from "next";

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
