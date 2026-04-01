import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const DOCS_ROOT = path.join(process.cwd(), "docs");

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

  const filePath = path.resolve(DOCS_ROOT, ...segments);

  // Ensure resolved path is within DOCS_ROOT
  if (!filePath.startsWith(DOCS_ROOT + path.sep)) {
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
