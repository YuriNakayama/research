import fs from "node:fs";
import path from "node:path";
import { extractLinks } from "./links";
import {
  DOMAIN_NAME_PATTERN,
  readDomainYaml,
  readRedirects,
  readTags,
  type Tag,
} from "./meta";
import { resolveRedirect, type Redirect } from "./redirects";
import { isRunDir } from "./run-dirs";
import {
  SKILL_PHASES,
  allMarkdownFiles,
  fromResearchPath,
  listDomains,
  listPhaseEntries,
  listRunDirs,
  readLatest,
  resolveAliasPath,
  toResearchPath,
} from "./tree";

// `dev/research-admin check`: integrity of the research tree and _meta/.
// Errors fail CI; warnings are printed but do not.

export type Issue = {
  level: "error" | "warning";
  code: string;
  message: string;
};

function err(code: string, message: string): Issue {
  return { level: "error", code, message };
}

function warn(code: string, message: string): Issue {
  return { level: "warning", code, message };
}

function loadOrIssue<T>(load: () => T, code: string, fallback: T, issues: Issue[]): T {
  try {
    return load();
  } catch (e) {
    issues.push(err(code, e instanceof Error ? e.message : String(e)));
    return fallback;
  }
}

function checkTagDictionary(tags: readonly Tag[]): Issue[] {
  const issues: Issue[] = [];
  const seen = new Set<string>();
  for (const t of tags) {
    if (seen.has(t.id)) issues.push(err("tag-duplicate", `tags.yaml: duplicate id "${t.id}"`));
    seen.add(t.id);
  }
  return issues;
}

function checkDomains(root: string, tags: readonly Tag[]): Issue[] {
  const issues: Issue[] = [];
  const known = new Set(tags.map((t) => t.id));
  const used = new Set<string>();

  for (const domain of listDomains(root)) {
    if (!DOMAIN_NAME_PATTERN.test(domain)) {
      issues.push(err("domain-name", `${domain}: domain name must be snake_case`));
    }
    let yaml;
    try {
      yaml = readDomainYaml(root, domain);
    } catch (e) {
      issues.push(err("domain-yaml-invalid", `${domain}: ${e instanceof Error ? e.message : e}`));
      continue;
    }
    if (!yaml) {
      issues.push(err("domain-yaml-missing", `${domain}: domains/${domain}/domain.yaml is missing`));
      continue;
    }
    if (yaml.domain !== domain) {
      issues.push(err("domain-yaml-name", `${domain}: domain.yaml "domain" is "${yaml.domain ?? ""}"`));
    }
    if (!yaml.display_name) {
      issues.push(err("domain-yaml-title", `${domain}: domain.yaml has no display_name`));
    }
    if (!Array.isArray(yaml.tags)) {
      issues.push(err("domain-yaml-tags", `${domain}: domain.yaml has no tags list`));
      continue;
    }
    // Pre-2026 layout `<date>_<cluster>`; skills would write the wrong place.
    if (JSON.stringify(yaml.output_paths ?? "").includes("{date}_")) {
      issues.push(warn("domain-yaml-output-paths", `${domain}: output_paths uses the legacy {date}_{cluster} layout`));
    }
    for (const tag of yaml.tags) {
      used.add(tag);
      if (!known.has(tag)) issues.push(err("tag-unknown", `${domain}: tag "${tag}" is not in _meta/tags.yaml`));
    }
  }

  for (const t of tags) {
    if (!used.has(t.id)) issues.push(warn("tag-unused", `tag "${t.id}" is not used by any domain`));
  }
  return issues;
}

/**
 * Newest date among a phase's dated directories, counting the legacy
 * `<YYYYMMDD>_<label>` names too (older content uses them; it is append-only
 * and is not renamed).
 */
function newestDatedDir(root: string, domain: string, phase: (typeof SKILL_PHASES)[number]): string | null {
  const dates = listPhaseEntries(root, domain, phase)
    .filter((e) => e.isDirectory())
    .map((e) => e.name.match(/^(\d{8})(?:[-_]|$)/)?.[1])
    .filter((d): d is string => Boolean(d));
  return dates.sort().at(-1) ?? null;
}

function checkLatest(root: string): Issue[] {
  const issues: Issue[] = [];
  for (const domain of listDomains(root)) {
    for (const phase of SKILL_PHASES) {
      const newest = listRunDirs(root, domain, phase)[0];
      const latest = readLatest(root, domain, phase);
      const newestDate = newestDatedDir(root, domain, phase);
      if (!newest && !newestDate) continue;
      // A legacy-named latest is fine as long as it is on the newest date.
      const legacyOk =
        latest !== null &&
        !isRunDir(latest) &&
        latest.slice(0, 8) === newestDate &&
        fs.existsSync(path.join(root, "runs", domain, phase, latest));
      if (latest !== newest && !legacyOk) {
        issues.push(
          err("latest", `runs/${domain}/${phase}/latest -> ${latest ?? "(missing)"}, newest is ${newest}`),
        );
      }
    }
  }
  return issues;
}

/**
 * Whether a link target resolves the way the viewer would: domains/ views and
 * `latest` are resolved from runs/ (not from the browsing symlinks, which
 * dev/sync-domain-links may not have regenerated yet), and the `.md` extension
 * is optional.
 */
function targetExists(root: string, researchPath: string): boolean {
  for (const candidate of [researchPath, resolveAliasPath(root, researchPath)]) {
    const abs = fromResearchPath(root, candidate);
    if (fs.existsSync(abs) || fs.existsSync(`${abs}.md`)) return true;
  }
  return false;
}

/** Broken internal links. */
export function findBrokenLinks(root: string): { file: string; target: string }[] {
  const broken: { file: string; target: string }[] = [];
  for (const abs of allMarkdownFiles(root)) {
    const file = toResearchPath(root, abs);
    const content = fs.readFileSync(abs, "utf-8");
    for (const link of extractLinks(file, content)) {
      if (!link.target) continue;
      if (!targetExists(root, link.target)) broken.push({ file, target: link.target });
    }
  }
  return broken;
}

function checkRedirects(root: string, redirects: readonly Redirect[]): Issue[] {
  const issues: Issue[] = [];
  for (const r of redirects) {
    if (fs.existsSync(fromResearchPath(root, r.from))) {
      issues.push(err("redirect-shadowed", `redirect from "${r.from}" exists on disk again`));
    }
    let resolved: string | null;
    try {
      resolved = resolveRedirect(r.from, redirects);
    } catch (e) {
      issues.push(err("redirect-cycle", e instanceof Error ? e.message : String(e)));
      continue;
    }
    if (resolved && !targetExists(root, resolved)) {
      issues.push(err("redirect-target", `redirect "${r.from}" -> "${resolved}" does not exist`));
    }
    if (!fs.existsSync(path.join(root, "_meta", "changes", `${r.change}.yaml`))) {
      issues.push(err("redirect-change", `redirect "${r.from}" refers to unknown change "${r.change}"`));
    }
  }
  return issues;
}

export type CheckOptions = {
  /** Treat broken links as errors (default: warnings, the tree predates the check). */
  strictLinks?: boolean;
};

export function runCheck(root: string, options: CheckOptions = {}): Issue[] {
  const issues: Issue[] = [];
  const tags = loadOrIssue(() => readTags(root), "tags-invalid", [] as Tag[], issues);
  const redirects = loadOrIssue(() => readRedirects(root), "redirects-invalid", [] as Redirect[], issues);

  issues.push(...checkTagDictionary(tags));
  issues.push(...checkDomains(root, tags));
  issues.push(...checkLatest(root));
  issues.push(...checkRedirects(root, redirects));
  for (const b of findBrokenLinks(root)) {
    const make = options.strictLinks ? err : warn;
    issues.push(make("link-broken", `${b.file}: link to "${b.target}" does not resolve`));
  }
  return issues;
}
