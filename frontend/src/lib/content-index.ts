import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

// Shared content-index basis for the Research Viewer.
//
// This module performs a SINGLE recursive scan of `research/**` and produces
// normalized, immutable data consumed by three features:
//   - cross-domain search (search-index.ts)
//   - the dashboard / landing (domain summaries)
//   - resource metadata cards (per-report structured metadata)
//
// Keeping the scan and normalization in one place avoids each feature
// re-reading and re-parsing Markdown frontmatter independently (DRY).

const RESEARCH_ROOT = path.join(process.cwd(), "research");
const DOMAINS_DIR = path.join(RESEARCH_ROOT, "domains");
const RUNS_DIR = path.join(RESEARCH_ROOT, "runs");

const IGNORED_NAMES = new Set(["node_modules", ".git", ".DS_Store"]);

// Known research phases. Anything else is left `undefined` so the UI can
// degrade gracefully rather than mislabel an unexpected directory.
const PHASES = ["gather", "retrieval", "clustering"] as const;
type Phase = (typeof PHASES)[number];

// Resource types as written in report headers (`- **Type**: ...`).
const RESOURCE_TYPES = [
  "Academic Paper",
  "Patent",
  "Web",
  "Business Case",
] as const;
type ResourceType = (typeof RESOURCE_TYPES)[number];

export type ContentEntry = {
  slug: string[];
  href: string;
  domain: string;
  title: string;
  type?: ResourceType;
  year?: string;
  venue?: string;
  authors?: string[];
  link?: string;
  phase?: Phase;
  runDate?: string;
  cluster?: string;
  headings: string[];
};

export type DomainSummary = {
  domain: string;
  displayName: string;
  description?: string;
  href: string;
  clusterCount: number;
  reportCount: number;
  latestRunDate?: string;
  phaseCounts: Record<Phase, number>;
};

// `domain.yaml` shape. Only the fields the viewer consumes are modeled; unknown
// keys are ignored so append-only content additions never break parsing.
const DomainYamlSchema = z.object({
  domain: z.string().optional(),
  display_name: z.string().optional(),
  description: z.string().optional(),
  clusters: z.array(z.unknown()).optional(),
});

function shouldInclude(name: string): boolean {
  return !IGNORED_NAMES.has(name) && !name.startsWith(".");
}

// `latest[_<cluster>]` run directories are symlink aliases of a dated run
// (per research directory rules). The build-time `cp -r` dereferences those
// symlinks into real directory copies, so realpath dedup alone can't collapse
// them. Skipping the alias by name keeps the dated run as the canonical URL and
// prevents every report from being indexed twice.
function isLatestAlias(name: string): boolean {
  return name === "latest" || name.startsWith("latest_");
}

function isMarkdownFile(name: string): boolean {
  return name.endsWith(".md");
}

function toResourceType(value: string | undefined): ResourceType | undefined {
  return RESOURCE_TYPES.find((t) => t === value);
}

// Split a comma-separated author string into a trimmed, non-empty list.
function parseAuthors(value: string | undefined): string[] | undefined {
  if (!value) return undefined;
  const list = value
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
  return list.length > 0 ? list : undefined;
}

// Extract `- **Key**: value` metadata lines from the head of a report, stopping
// once a `## ` section begins after a Link was seen. Mirrors the historical
// behavior in docs-content.ts so both share one convention.
function extractHeaderMetadata(lines: string[]): Record<string, string> {
  const metadata: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/);
    if (match) {
      metadata[match[1].toLowerCase()] = match[2].trim();
    }
    if (metadata["link"] && line.startsWith("## ")) break;
  }
  return metadata;
}

function extractTitle(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) return match[1].trim();
  }
  return "Untitled";
}

// Collect `##`+ heading text for search matching (the top-level `#` is title).
function extractHeadings(lines: string[]): string[] {
  const headings: string[] = [];
  for (const line of lines) {
    const match = line.match(/^#{2,6}\s+(.+)$/);
    if (match) headings.push(match[1].trim());
  }
  return headings;
}

// Parse `runs/<domain>/<phase>/<date>[_<cluster>]/...` from a slug relative to
// `research/`. Returns best-effort fields; unknown positions stay undefined.
function parseRunContext(slug: string[]): {
  domain: string;
  phase?: Phase;
  runDate?: string;
  cluster?: string;
} {
  // slug[0] is "runs" or "domains"; slug[1] is the domain.
  const domain = slug[1] ?? "unknown";
  const phase = PHASES.find((p) => p === slug[2]);

  let runDate: string | undefined;
  let cluster: string | undefined;
  const runSegment = slug[3];
  if (runSegment) {
    const dateMatch = runSegment.match(/^(\d{8})(?:_(.+))?$/);
    if (dateMatch) {
      runDate = dateMatch[1];
      cluster = dateMatch[2];
    }
  }
  return { domain, phase, runDate, cluster };
}

// Recursively collect Markdown files under a directory, resolving symlinked
// dirs (e.g. `latest_*`) but recording each file once by its real path so
// symlink aliases don't produce duplicate entries.
function collectMarkdownFiles(
  dir: string,
  seenRealPaths: Set<string>,
): string[] {
  let dirents: fs.Dirent[];
  try {
    dirents = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const dirent of dirents) {
    if (!shouldInclude(dirent.name)) continue;
    if (isLatestAlias(dirent.name)) continue;
    const full = path.join(dir, dirent.name);

    // Resolve so symlinked directories are traversed and dedup is by real path.
    let stat: fs.Stats;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      files.push(...collectMarkdownFiles(full, seenRealPaths));
    } else if (stat.isFile() && isMarkdownFile(dirent.name)) {
      const real = fs.realpathSync(full);
      if (seenRealPaths.has(real)) continue;
      seenRealPaths.add(real);
      files.push(full);
    }
  }
  return files;
}

function readDomainYaml(domain: string): z.infer<typeof DomainYamlSchema> | null {
  const yamlPath = path.join(DOMAINS_DIR, domain, "domain.yaml");
  if (!fs.existsSync(yamlPath)) return null;
  try {
    const raw = parseYaml(fs.readFileSync(yamlPath, "utf-8"));
    const parsed = DomainYamlSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function buildEntry(fullPath: string): ContentEntry | null {
  let content: string;
  try {
    content = fs.readFileSync(fullPath, "utf-8");
  } catch {
    return null;
  }

  const relative = path.relative(RESEARCH_ROOT, fullPath);
  const slugWithExt = relative.split(path.sep);
  const slug = [
    ...slugWithExt.slice(0, -1),
    slugWithExt[slugWithExt.length - 1].replace(/\.md$/, ""),
  ];

  const lines = content.split("\n");
  const metadata = extractHeaderMetadata(lines);
  const { domain, phase, runDate, cluster } = parseRunContext(slug);

  return {
    slug,
    href: `/research/${slug.join("/")}`,
    domain,
    title: extractTitle(lines),
    type: toResourceType(metadata["type"]),
    year: metadata["year"],
    venue: metadata["venue"],
    authors: parseAuthors(metadata["authors"]),
    link: metadata["link"],
    phase,
    runDate,
    cluster,
    headings: extractHeadings(lines),
  };
}

// Scan every Markdown report under `research/runs/**`, deduped by real path.
export function getContentEntries(): ContentEntry[] {
  const seen = new Set<string>();
  const files = collectMarkdownFiles(RUNS_DIR, seen);
  const entries: ContentEntry[] = [];
  for (const file of files) {
    const entry = buildEntry(file);
    if (entry) entries.push(entry);
  }
  return entries.sort((a, b) => a.href.localeCompare(b.href));
}

// Aggregate per-domain summaries for the dashboard, preferring `domain.yaml`
// metadata (display_name/description/clusters) when present.
export function getDomainSummaries(): DomainSummary[] {
  const entries = getContentEntries();

  const byDomain = new Map<string, ContentEntry[]>();
  for (const entry of entries) {
    const list = byDomain.get(entry.domain);
    if (list) list.push(entry);
    else byDomain.set(entry.domain, [entry]);
  }

  const domains = listDomains();
  const summaries: DomainSummary[] = [];

  for (const domain of domains) {
    const domainEntries = byDomain.get(domain) ?? [];
    const yaml = readDomainYaml(domain);

    const phaseCounts: Record<Phase, number> = {
      gather: 0,
      retrieval: 0,
      clustering: 0,
    };
    let latestRunDate: string | undefined;
    for (const entry of domainEntries) {
      if (entry.phase) phaseCounts[entry.phase] += 1;
      if (entry.runDate && (!latestRunDate || entry.runDate > latestRunDate)) {
        latestRunDate = entry.runDate;
      }
    }

    summaries.push({
      domain,
      displayName: yaml?.display_name ?? domain,
      description: yaml?.description,
      href: `/research/domains/${domain}`,
      clusterCount: yaml?.clusters?.length ?? 0,
      reportCount: domainEntries.length,
      latestRunDate,
      phaseCounts,
    });
  }

  // Most-recently-updated domains first so active work surfaces at the top of
  // the dashboard; fall back to name for stable ordering when dates tie.
  return summaries.sort((a, b) => {
    const dateA = a.latestRunDate ?? "";
    const dateB = b.latestRunDate ?? "";
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return a.displayName.localeCompare(b.displayName);
  });
}

// List domain directories from `runs/` and `domains/` (union), so domains
// without a `domain.yaml` still surface.
function listDomains(): string[] {
  const names = new Set<string>();
  for (const base of [RUNS_DIR, DOMAINS_DIR]) {
    try {
      for (const dirent of fs.readdirSync(base, { withFileTypes: true })) {
        if (dirent.isDirectory() && shouldInclude(dirent.name)) {
          names.add(dirent.name);
        }
      }
    } catch {
      // Missing base directory: skip.
    }
  }
  return [...names];
}
