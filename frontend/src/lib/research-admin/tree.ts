import fs from "node:fs";
import path from "node:path";
import { isRunDir, sortRunDirsDesc } from "./run-dirs";

// Read-only helpers for walking a research tree (`<root>/runs`, `<root>/domains`).
// Paths returned as "research paths" are relative to the root with `/`.

export const SKILL_PHASES = ["clustering", "gather", "retrieval"] as const;
export type SkillPhase = (typeof SKILL_PHASES)[number];

/** Names under domains/<d>/ that are symlink views onto runs/ (dev/sync-domain-links). */
export const DOMAIN_VIEW_LINKS = ["clustering", "resources", "reports"] as const;

/** Real (non-view) directories under domains/<d>/, i.e. hand-written content. */
export function listLocalDirs(root: string, domain: string): string[] {
  return safeReaddir(path.join(root, "domains", domain))
    .filter((e) => e.isDirectory() && !e.name.startsWith(".") && !DOMAIN_VIEW_LINKS.some((v) => v === e.name))
    .map((e) => e.name)
    .sort();
}

export function toResearchPath(root: string, absolute: string): string {
  return path.relative(root, absolute).split(path.sep).join("/");
}

export function fromResearchPath(root: string, researchPath: string): string {
  return path.join(root, ...researchPath.split("/"));
}

function safeReaddir(dir: string): fs.Dirent[] {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function isHidden(name: string): boolean {
  return name.startsWith(".") || name.startsWith("_");
}

/** Domain names present under runs/ or domains/ (real directories only). */
export function listDomains(root: string): string[] {
  const names = new Set<string>();
  for (const base of ["runs", "domains"]) {
    for (const e of safeReaddir(path.join(root, base))) {
      if (e.isDirectory() && !isHidden(e.name)) names.add(e.name);
    }
  }
  return [...names].sort();
}

/** Dated run directories of a phase, newest first (the `latest` link excluded). */
export function listRunDirs(root: string, domain: string, phase: SkillPhase): string[] {
  const dir = path.join(root, "runs", domain, phase);
  const names = safeReaddir(dir)
    .filter((e) => e.isDirectory() && isRunDir(e.name))
    .map((e) => e.name);
  return sortRunDirsDesc(names);
}

/** Every run directory name under a phase that is a real directory (any naming). */
export function listPhaseEntries(root: string, domain: string, phase: SkillPhase): fs.Dirent[] {
  return safeReaddir(path.join(root, "runs", domain, phase)).filter(
    (e) => !e.name.startsWith("."),
  );
}

/** Target name of `runs/<d>/<phase>/latest`, or null. */
export function readLatest(root: string, domain: string, phase: SkillPhase): string | null {
  const link = path.join(root, "runs", domain, phase, "latest");
  try {
    if (!fs.lstatSync(link).isSymbolicLink()) return null;
    return fs.readlinkSync(link).replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * Files under `dir`, recursively, without following symlinks (so `latest`
 * aliases and domains/ view links are never visited twice).
 */
export function walkFiles(dir: string, filter: (name: string) => boolean = () => true): string[] {
  const out: string[] = [];
  for (const e of safeReaddir(dir)) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(full, filter));
    else if (e.isFile() && filter(e.name)) out.push(full);
  }
  return out;
}

export function isMarkdown(name: string): boolean {
  return name.endsWith(".md");
}

/** All real Markdown files of a domain: runs/<d>/** and domains/<d>/** (real files). */
export function domainMarkdownFiles(root: string, domain: string): string[] {
  return [
    ...walkFiles(path.join(root, "runs", domain), isMarkdown),
    ...walkFiles(path.join(root, "domains", domain), isMarkdown),
  ];
}

/** All real Markdown files in the tree (runs/ and the human layer of domains/). */
export function allMarkdownFiles(root: string): string[] {
  return listDomains(root).flatMap((d) => domainMarkdownFiles(root, d));
}

/**
 * Newest content date of a domain (`YYYYMMDD`): the newest run directory of
 * any phase, or the `<YYYYMMDD>-` prefix of a hand-written entry under domains/<d>/.
 */
export function newestContentDate(root: string, domain: string): string | null {
  const dates: string[] = [];
  for (const phase of SKILL_PHASES) {
    const newest = listRunDirs(root, domain, phase)[0];
    if (newest) dates.push(newest.slice(0, 8));
  }
  for (const local of listLocalDirs(root, domain)) {
    for (const e of safeReaddir(path.join(root, "domains", domain, local))) {
      const m = e.name.match(/^(\d{8})-/);
      if (m) dates.push(m[1]);
    }
  }
  return dates.sort().at(-1) ?? null;
}

const PHASE_BY_VIEW: Record<string, SkillPhase> = {
  clustering: "clustering",
  resources: "gather",
  reports: "retrieval",
};

/** Newest run dir of `phase` in `domain` that contains `cluster`. */
export function clusterRunDir(root: string, domain: string, phase: SkillPhase, cluster: string): string | null {
  for (const d of listRunDirs(root, domain, phase)) {
    if (fs.existsSync(path.join(root, "runs", domain, phase, d, cluster))) return d;
  }
  return null;
}

/**
 * The concrete `runs/` path behind a research path, using the same rules as
 * the viewer (frontend/src/lib/domain-view.ts):
 *   domains/<d>/clustering/...          -> runs/<d>/clustering/<newest>/...
 *   domains/<d>/{resources,reports}/<c> -> runs/<d>/<phase>/<newest with c>/<c>/...
 *   runs/<d>/<phase>/latest/...         -> runs/<d>/<phase>/<newest>/...
 * Anything else is returned unchanged.
 */
export function resolveAliasPath(root: string, researchPath: string): string {
  const s = researchPath.split("/").filter((x) => x.length > 0);
  if (s[0] === "runs" && s[3] === "latest") {
    const phase = SKILL_PHASES.find((p) => p === s[2]);
    const newest = phase ? listRunDirs(root, s[1], phase)[0] : undefined;
    return newest ? [...s.slice(0, 3), newest, ...s.slice(4)].join("/") : researchPath;
  }
  if (s[0] !== "domains" || s.length < 3) return researchPath;
  const phase = PHASE_BY_VIEW[s[2]];
  if (!phase) return researchPath;
  if (phase === "clustering") {
    const newest = listRunDirs(root, s[1], phase)[0];
    return newest ? ["runs", s[1], phase, newest, ...s.slice(3)].join("/") : researchPath;
  }
  if (s.length < 4) return researchPath;
  const dir = clusterRunDir(root, s[1], phase, s[3]);
  return dir ? ["runs", s[1], phase, dir, ...s.slice(3)].join("/") : researchPath;
}

export function exists(p: string): boolean {
  return fs.existsSync(p);
}
