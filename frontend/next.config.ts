import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Research pages and the research-assets route read Markdown/images from
  // `research/` at request time (see src/lib/docs-content.ts and the
  // research-assets route). Since pages are rendered on demand rather than
  // statically pre-generated, the standalone server must ship the `research/`
  // tree. Next.js file tracing does not pick up these dynamic `fs` reads, so
  // include them explicitly.
  outputFileTracingIncludes: {
    "/research/[[...slug]]": ["./research/**/*"],
    "/api/research-assets/[...path]": ["./research/**/*"],
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
