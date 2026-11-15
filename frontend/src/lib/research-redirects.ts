import fs from "node:fs";
import path from "node:path";
import { metaPath, readRedirectsSafe } from "./research-admin/meta";
import { isSafeResearchPath, previousPaths, resolveRedirect, type Redirect } from "./research-admin/redirects";

// Viewer side of research/_meta/redirects.yaml: paths that housekeeping moved
// (domain rename / merge / split) keep working, and personal notes written under
// an earlier path stay visible.

const RESEARCH_ROOT = path.join(process.cwd(), "research");

// The table only changes on deploy; re-read it when the file changes rather
// than on every 404 and every notes request.
let cached: { mtimeMs: number; redirects: Redirect[] } | null = null;

function loadRedirects(): Redirect[] {
  let mtimeMs: number;
  try {
    mtimeMs = fs.statSync(metaPath(RESEARCH_ROOT, "redirects.yaml")).mtimeMs;
  } catch {
    return [];
  }
  if (cached?.mtimeMs !== mtimeMs) cached = { mtimeMs, redirects: readRedirectsSafe(RESEARCH_ROOT) };
  return cached.redirects;
}

/** New research path for a moved one, or null when `slug` never moved. */
export function findRedirect(slug: readonly string[]): string | null {
  // Each URL segment is decoded separately, so one may contain "/" or "\\".
  if (slug.some((s) => s.includes("/"))) return null;
  const p = slug.join("/");
  if (!isSafeResearchPath(p)) return null;
  try {
    return resolveRedirect(p, loadRedirects());
  } catch {
    // A cyclic table is reported by `dev/research-admin check`; never loop here.
    return null;
  }
}

/** Earlier paths of a document, for looking up notes keyed by path. */
export function findPreviousPaths(slug: string): string[] {
  return previousPaths(slug, loadRedirects());
}
