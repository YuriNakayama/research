import fs from "node:fs";
import path from "node:path";
import { readDomainYaml, readTags, reviewedDate } from "./meta";
import {
  SKILL_PHASES,
  domainMarkdownFiles,
  listDomains,
  listLocalDirs,
  listRunDirs,
  newestContentDate,
  walkFiles,
  isMarkdown,
} from "./tree";

// `dev/research-admin report`: diagnostics the housekeeping skill reads before
// proposing changes. Nothing here decides anything; it only surfaces signals.

export type DomainDigest = {
  domain: string;
  displayName: string | null;
  tags: string[];
  tagsReviewed: string | null;
  newestContent: string | null;
  /** Tags were never reviewed, or content newer than the review exists. */
  tagsStale: boolean;
  fileCount: number;
  runs: Record<(typeof SKILL_PHASES)[number], string[]>;
  /** Hand-written entries under domains/<d>/<dir>/, as `<dir>/<name>`. */
  local: string[];
};

export type OverlapCandidate = {
  a: string;
  b: string;
  /** Jaccard similarity of URLs cited under gather/. */
  urlJaccard: number;
  sharedUrls: number;
  /** Jaccard similarity of tags. */
  tagJaccard: number;
};

export type TagStat = {
  id: string;
  count: number;
};

export type Report = {
  domains: DomainDigest[];
  overlaps: OverlapCandidate[];
  tagStats: TagStat[];
  singletonTags: string[];
  broadTags: string[];
  unknownTags: string[];
};

const URL_PATTERN = /https?:\/\/[^\s)<>\]"'`]+/g;

function normalizeUrl(url: string): string {
  return url
    .replace(/[.,;:]+$/, "")
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "")
    .replace(/(arxiv\.org\/)(abs|pdf|html)\/(\d{4}\.\d{4,5})(v\d+)?(\.pdf)?/, "$1$3");
}

function gatherUrls(root: string, domain: string): Set<string> {
  const urls = new Set<string>();
  const dir = path.join(root, "runs", domain, "gather");
  for (const file of walkFiles(dir, isMarkdown)) {
    for (const m of fs.readFileSync(file, "utf-8").matchAll(URL_PATTERN)) {
      urls.add(normalizeUrl(m[0]));
    }
  }
  return urls;
}

function jaccard<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): { score: number; shared: number } {
  if (a.size === 0 && b.size === 0) return { score: 0, shared: 0 };
  let shared = 0;
  for (const x of a) if (b.has(x)) shared++;
  return { score: shared / (a.size + b.size - shared), shared };
}

function localEntries(root: string, domain: string): string[] {
  return listLocalDirs(root, domain).flatMap((dir) => {
    try {
      return fs
        .readdirSync(path.join(root, "domains", domain, dir))
        .filter((n) => !n.startsWith("."))
        .sort()
        .map((n) => `${dir}/${n}`);
    } catch {
      return [];
    }
  });
}

function digest(root: string, domain: string): DomainDigest {
  const yaml = readDomainYaml(root, domain);
  const tagsReviewed = reviewedDate(yaml);
  const newest = newestContentDate(root, domain);
  const reviewedCompact = tagsReviewed?.replace(/-/g, "") ?? null;
  return {
    domain,
    displayName: yaml?.display_name ?? null,
    tags: yaml?.tags ?? [],
    tagsReviewed,
    newestContent: newest,
    tagsStale: !reviewedCompact || (newest !== null && newest > reviewedCompact),
    fileCount: domainMarkdownFiles(root, domain).length,
    runs: {
      clustering: listRunDirs(root, domain, "clustering"),
      gather: listRunDirs(root, domain, "gather"),
      retrieval: listRunDirs(root, domain, "retrieval"),
    },
    local: localEntries(root, domain),
  };
}

export type ReportOptions = {
  /** Minimum URL or tag Jaccard for a pair to be listed. */
  overlapThreshold?: number;
};

export function buildReport(root: string, options: ReportOptions = {}): Report {
  const threshold = options.overlapThreshold ?? 0.1;
  const domains = listDomains(root).map((d) => digest(root, d));

  const urls = new Map(domains.map((d) => [d.domain, gatherUrls(root, d.domain)]));
  const overlaps: OverlapCandidate[] = [];
  for (let i = 0; i < domains.length; i++) {
    for (let j = i + 1; j < domains.length; j++) {
      const a = domains[i];
      const b = domains[j];
      const u = jaccard(urls.get(a.domain) ?? new Set(), urls.get(b.domain) ?? new Set());
      const t = jaccard(new Set(a.tags), new Set(b.tags));
      if (u.score >= threshold || t.score >= 0.5) {
        overlaps.push({
          a: a.domain,
          b: b.domain,
          urlJaccard: Number(u.score.toFixed(3)),
          sharedUrls: u.shared,
          tagJaccard: Number(t.score.toFixed(3)),
        });
      }
    }
  }
  overlaps.sort((x, y) => y.urlJaccard - x.urlJaccard || y.tagJaccard - x.tagJaccard);

  const counts = new Map<string, number>();
  for (const d of domains) for (const t of d.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  let dictionary: string[] = [];
  try {
    dictionary = readTags(root).map((t) => t.id);
  } catch {
    dictionary = [];
  }
  for (const id of dictionary) if (!counts.has(id)) counts.set(id, 0);
  const tagStats = [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  const known = new Set(dictionary);
  return {
    domains,
    overlaps,
    tagStats,
    singletonTags: tagStats.filter((t) => t.count === 1).map((t) => t.id),
    broadTags: tagStats.filter((t) => domains.length >= 4 && t.count > domains.length / 2).map((t) => t.id),
    unknownTags: tagStats.filter((t) => !known.has(t.id)).map((t) => t.id),
  };
}

export function formatReport(report: Report): string {
  const lines: string[] = [];
  lines.push("# Domains");
  for (const d of report.domains) {
    const flag = d.tagsStale ? " [tags stale]" : "";
    lines.push(
      `- ${d.domain} (${d.displayName ?? "no display_name"})${flag}`,
      `    tags: [${d.tags.join(", ")}] reviewed: ${d.tagsReviewed ?? "never"} newest: ${d.newestContent ?? "-"}`,
      `    files: ${d.fileCount} clustering: ${d.runs.clustering.join(",") || "-"} gather: ${d.runs.gather.join(",") || "-"} retrieval: ${d.runs.retrieval.join(",") || "-"}`,
    );
    if (d.local.length > 0) lines.push(`    domains/ entries: ${d.local.join(", ")}`);
  }
  lines.push("", "# Overlap candidates (merge?)");
  if (report.overlaps.length === 0) lines.push("- none");
  for (const o of report.overlaps) {
    lines.push(`- ${o.a} <-> ${o.b}: url ${o.urlJaccard} (${o.sharedUrls} shared), tags ${o.tagJaccard}`);
  }
  lines.push("", "# Tags");
  lines.push(`- usage: ${report.tagStats.map((t) => `${t.id}=${t.count}`).join(", ") || "none"}`);
  lines.push(`- used by one domain: ${report.singletonTags.join(", ") || "none"}`);
  lines.push(`- used by more than half: ${report.broadTags.join(", ") || "none"}`);
  lines.push(`- not in dictionary: ${report.unknownTags.join(", ") || "none"}`);
  return lines.join("\n");
}
