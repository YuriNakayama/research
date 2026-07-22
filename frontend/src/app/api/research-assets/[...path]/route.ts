import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { resolveDomainSlug } from "@/lib/domain-view";

const RESEARCH_ROOT = path.join(process.cwd(), "research");

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // Validate segments to prevent path traversal
  for (const segment of segments) {
    if (segment === ".." || segment === "." || segment.includes("\0")) {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  // Assets referenced from a `domains/` page resolve into the backing run
  // directory, since `domains/` is a virtual view (see lib/domain-view.ts).
  const resolved = resolveDomainSlug(segments) ?? segments;
  const filePath = path.resolve(RESEARCH_ROOT, ...resolved);

  // Ensure resolved path is within RESEARCH_ROOT
  if (!filePath.startsWith(RESEARCH_ROOT + path.sep)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Only serve image files
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
