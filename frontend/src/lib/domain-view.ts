import fs from "node:fs";
import path from "node:path";

// Virtual `domains/` view resolution.
//
// `research/domains/<domain>/` is a *browsing convenience* made of symlinks into
// `research/runs/**`. The viewer must not depend on those symlinks: `readdirSync`
// reports a symlink as neither file nor directory (`Dirent.isDirectory()` is
// false, `isSymbolicLink()` is true), so any directory listing built from them
// comes back empty. Instead the viewer derives the same view from `runs/`, which
// is the source of truth. The symlinks stay on disk purely so humans can browse
// `domains/` in git or a file manager; if they go stale the rendered site is
// unaffected.
//
// The mapping is:
//   domains/<d>/clustering/...          -> runs/<d>/clustering/<latest>/...
//   domains/<d>/resources/<cluster>/... -> runs/<d>/gather/<latest-for-cluster>/<cluster>/...
//   domains/<d>/reports/<cluster>/...   -> runs/<d>/retrieval/<latest-for-cluster>/<cluster>/...
//
// Note the per-cluster resolution for gather/retrieval: a run does not
// necessarily re-run every cluster, so "newest run directory" is NOT the same as
// "newest version of each cluster". `runs/cate/retrieval/20260602/` only holds
// two clusters while three others were last produced in `20260322`. Resolving
// through the phase-level `latest` pointer alone would make those three vanish.

const RESEARCH_ROOT = path.join(process.cwd(), "research");
const RUNS_DIR = path.join(RESEARCH_ROOT, "runs");
const DOMAINS_DIR = path.join(RESEARCH_ROOT, "domains");

// View directory name -> the run phase that backs it.
const VIEW_TO_PHASE = {
  clustering: "clustering",
  resources: "gather",
  reports: "retrieval",
} as const;

type ViewName = keyof typeof VIEW_TO_PHASE;

const DATE_DIR = /^\d{8}$/;

function isViewName(value: string): value is ViewName {
  return Object.prototype.hasOwnProperty.call(VIEW_TO_PHASE, value);
}

function safeReaddir(dir: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

// Resolve through symlinks: `latest` aliases and any hand-made link should be
// followed rather than skipped.
function isDirectorySync(fullPath: string): boolean {
  try {
    return fs.statSync(fullPath).isDirectory();
  } catch {
    return false;
  }
}

// Dated run directories under `runs/<domain>/<phase>`, newest first. The
// `latest` symlink is deliberately ignored here: it is a convenience alias for
// one of these dates and would otherwise be indistinguishable from a real run.
function listRunDates(domain: string, phase: string): string[] {
  const phaseDir = path.join(RUNS_DIR, domain, phase);
  return safeReaddir(phaseDir)
    .filter((e) => DATE_DIR.test(e.name))
    .filter((e) => isDirectorySync(path.join(phaseDir, e.name)))
    .map((e) => e.name)
    .sort((a, b) => b.localeCompare(a));
}

/** Newest dated run directory for a phase, or null when the phase has no runs. */
export function resolveLatestRunDate(domain: string, phase: string): string | null {
  return listRunDates(domain, phase)[0] ?? null;
}

/**
 * Map each cluster to the newest run date that actually contains it.
 *
 * Clusters are not re-run on every pass, so this is a per-cluster maximum
 * rather than a listing of the newest run directory.
 */
export function resolveClusterDates(domain: string, phase: string): Map<string, string> {
  const phaseDir = path.join(RUNS_DIR, domain, phase);
  const latestByCluster = new Map<string, string>();

  // Dates descend, so the first date to mention a cluster is its newest.
  for (const date of listRunDates(domain, phase)) {
    const dateDir = path.join(phaseDir, date);
    for (const entry of safeReaddir(dateDir)) {
      if (entry.name.startsWith(".")) continue;
      if (latestByCluster.has(entry.name)) continue;
      if (!isDirectorySync(path.join(dateDir, entry.name))) continue;
      latestByCluster.set(entry.name, date);
    }
  }

  return latestByCluster;
}

/** The view directories that have any backing content, in display order. */
export function listDomainViews(domain: string): ViewName[] {
  const views: ViewName[] = [];
  for (const view of ["clustering", "resources", "reports"] as const) {
    const phase = VIEW_TO_PHASE[view];
    if (view === "clustering") {
      if (resolveLatestRunDate(domain, phase)) views.push(view);
    } else if (resolveClusterDates(domain, phase).size > 0) {
      views.push(view);
    }
  }
  return views;
}

/**
 * Translate a `domains/`-rooted slug into the equivalent `runs/`-rooted slug.
 *
 * Returns null when the slug is not a `domains/` path, when it addresses a
 * domain-local real file (`domain.yaml`, `README.md`), or when no run backs it —
 * callers then fall back to reading the path as-is.
 */
export function resolveDomainSlug(slug: string[]): string[] | null {
  if (slug[0] !== "domains" || slug.length < 3) return null;

  const domain = slug[1];
  const view = slug[2];
  if (!isViewName(view)) return null;

  const phase = VIEW_TO_PHASE[view];
  const rest = slug.slice(3);

  // `clustering` is not split by cluster: the whole run directory is the view.
  if (view === "clustering") {
    const date = resolveLatestRunDate(domain, phase);
    if (!date) return null;
    return ["runs", domain, phase, date, ...rest];
  }

  // The view directory itself (`.../reports`) has no single backing directory —
  // it is assembled from several run dates by listDomainViewEntries().
  if (rest.length === 0) return null;

  const cluster = rest[0];
  const date = resolveClusterDates(domain, phase).get(cluster);
  if (!date) return null;

  return ["runs", domain, phase, date, cluster, ...rest.slice(1)];
}

export type DomainViewEntry = {
  name: string;
  isDirectory: boolean;
  slug: string[];
};

/**
 * Directory listing for a `domains/` path, or null when the slug is not a
 * virtual view (the caller should then list the real directory).
 *
 * Listings keep `domains/`-rooted slugs so breadcrumbs and URLs stay inside the
 * domain view; only content lookup is redirected into `runs/`.
 */
export function listDomainViewEntries(slug: string[]): DomainViewEntry[] | null {
  if (slug[0] !== "domains") return null;

  // `domains/<domain>`: the view directories, plus any real files that live
  // alongside them (domain.yaml, README.md).
  if (slug.length === 2) {
    const domain = slug[1];
    const entries: DomainViewEntry[] = listDomainViews(domain).map((view) => ({
      name: view,
      isDirectory: true,
      slug: [...slug, view],
    }));

    for (const entry of safeReaddir(path.join(DOMAINS_DIR, domain))) {
      if (entry.name.startsWith(".")) continue;
      if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
      const name = entry.name.replace(/\.md$/, "");
      entries.push({ name, isDirectory: false, slug: [...slug, name] });
    }

    return entries;
  }

  if (slug.length < 3) return null;

  const domain = slug[1];
  const view = slug[2];
  if (!isViewName(view)) return null;

  const phase = VIEW_TO_PHASE[view];

  // `domains/<domain>/{resources,reports}`: one entry per cluster, each drawn
  // from whichever run last produced it.
  if (view !== "clustering" && slug.length === 3) {
    return [...resolveClusterDates(domain, phase).keys()]
      .sort((a, b) => a.localeCompare(b))
      .map((cluster) => ({
        name: cluster,
        isDirectory: true,
        slug: [...slug, cluster],
      }));
  }

  // Anything deeper is a straight passthrough to the backing run directory.
  const resolved = resolveDomainSlug(slug);
  if (!resolved) return null;

  const target = path.join(RESEARCH_ROOT, ...resolved);
  if (!isDirectorySync(target)) return null;

  return safeReaddir(target)
    .filter((e) => !e.name.startsWith(".") && e.name !== "node_modules")
    .filter((e) => isDirectorySync(path.join(target, e.name)) || e.name.endsWith(".md"))
    .map((e) => {
      const isDir = isDirectorySync(path.join(target, e.name));
      const name = isDir ? e.name : e.name.replace(/\.md$/, "");
      return { name, isDirectory: isDir, slug: [...slug, name] };
    })
    .sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
}

/** True when the slug addresses a virtual view directory. */
export function isDomainViewDirectory(slug: string[]): boolean {
  if (slug[0] !== "domains") return false;
  if (slug.length === 2) return isDirectorySync(path.join(DOMAINS_DIR, slug[1]));
  if (slug.length < 3) return false;

  const view = slug[2];
  if (!isViewName(view)) return false;

  if (view !== "clustering" && slug.length === 3) {
    return resolveClusterDates(slug[1], VIEW_TO_PHASE[view]).size > 0;
  }

  const resolved = resolveDomainSlug(slug);
  return resolved !== null && isDirectorySync(path.join(RESEARCH_ROOT, ...resolved));
}
