import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { z } from "zod";
import type { Redirect } from "./redirects";

// Schemas and file I/O for the housekeeping metadata:
//   research/_meta/tags.yaml       tag dictionary
//   research/_meta/redirects.yaml  old path -> new path
//   research/_meta/changes/*.yaml  one record per housekeeping operation
//   research/domains/<d>/domain.yaml  per-domain metadata (display name, tags)
//
// Every function takes the research root explicitly so tests can run against a
// temporary tree and the viewer can pass its own staged copy.

export const META_DIR = "_meta";
export const TAG_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const DOMAIN_NAME_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export const TagSchema = z.object({
  id: z.string().regex(TAG_ID_PATTERN, "tag id must be snake_case"),
  label: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  description: z.string().optional(),
});
export type Tag = z.infer<typeof TagSchema>;

const TagsFileSchema = z.array(TagSchema);

const RedirectSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  change: z.string().min(1),
});
const RedirectsFileSchema = z.array(RedirectSchema);

// Only the fields housekeeping reads are modeled; other keys (clusters,
// output_paths, target_competition, ...) pass through untouched because edits
// go through the YAML document API, never through this parsed shape.
export const DomainYamlSchema = z
  .object({
    domain: z.string().optional(),
    display_name: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    tags_reviewed: z.union([z.string(), z.date()]).optional(),
    clusters: z.array(z.unknown()).optional(),
  })
  .passthrough();
export type DomainYaml = z.infer<typeof DomainYamlSchema>;

export type ChangeRecord = {
  op: string;
  date: string;
  reason?: string;
  /** Operation-specific arguments (from / into / tags ...). */
  args: Record<string, unknown>;
  /** `old -> new` for every path that moved. */
  moved?: string[];
};

export function metaPath(root: string, ...parts: string[]): string {
  return path.join(root, META_DIR, ...parts);
}

export function domainYamlPath(root: string, domain: string): string {
  return path.join(root, "domains", domain, "domain.yaml");
}

function readYamlFile(file: string): unknown {
  if (!fs.existsSync(file)) return undefined;
  return parseYaml(fs.readFileSync(file, "utf-8"));
}

export function readTags(root: string): Tag[] {
  const raw = readYamlFile(metaPath(root, "tags.yaml"));
  if (raw === undefined || raw === null) return [];
  return TagsFileSchema.parse(raw);
}

/** Lenient variant for the viewer: a broken file must not take pages down. */
export function readTagsSafe(root: string): Tag[] {
  try {
    return readTags(root);
  } catch {
    return [];
  }
}

export function readRedirects(root: string): Redirect[] {
  const raw = readYamlFile(metaPath(root, "redirects.yaml"));
  if (raw === undefined || raw === null) return [];
  return RedirectsFileSchema.parse(raw);
}

export function readRedirectsSafe(root: string): Redirect[] {
  try {
    return readRedirects(root);
  } catch {
    return [];
  }
}

export function readDomainYaml(root: string, domain: string): DomainYaml | null {
  const raw = readYamlFile(domainYamlPath(root, domain));
  if (raw === undefined) return null;
  return DomainYamlSchema.parse(raw ?? {});
}

/** `tags_reviewed` normalized to `YYYY-MM-DD` (YAML may parse it as a Date). */
export function reviewedDate(yaml: DomainYaml | null): string | null {
  const value = yaml?.tags_reviewed;
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

const HEADER: Record<string, string> = {
  "tags.yaml":
    "# Tag dictionary. Edit label / aliases / description freely; change ids with\n" +
    "# `dev/research-admin tags rename|merge` (see research/README.md).\n",
  "redirects.yaml":
    "# Written by dev/research-admin only. Old path -> new path, longest prefix wins.\n",
};

function writeYamlFile(file: string, value: unknown, header = ""): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, header + stringifyYaml(value, { lineWidth: 0 }));
}

export function writeTags(root: string, tags: readonly Tag[]): void {
  const sorted = [...tags].sort((a, b) => a.id.localeCompare(b.id));
  writeYamlFile(metaPath(root, "tags.yaml"), sorted, HEADER["tags.yaml"]);
}

export function writeRedirects(root: string, redirects: readonly Redirect[]): void {
  writeYamlFile(metaPath(root, "redirects.yaml"), redirects, HEADER["redirects.yaml"]);
}

export function writeChange(root: string, name: string, record: ChangeRecord): string {
  const file = metaPath(root, "changes", `${name}.yaml`);
  if (fs.existsSync(file)) throw new Error(`change record already exists: ${file}`);
  writeYamlFile(file, record);
  return file;
}

function formatScalar(value: string): string {
  return stringifyYaml(value, { lineWidth: 0 }).trimEnd();
}

/** One-line YAML for the values housekeeping writes, or null if not one-line. */
function formatInline(value: unknown): string | null {
  if (typeof value === "string") {
    const out = formatScalar(value);
    return out.includes("\n") ? null : out;
  }
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return `[${value.map((v) => formatScalar(v)).join(", ")}]`;
  }
  return null;
}

/** [start, end) line range of a top-level key and its indented continuation. */
function keyRange(lines: readonly string[], key: string): [number, number] | null {
  const start = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (start === -1) return null;
  let end = start + 1;
  while (end < lines.length && (lines[end].trim() === "" || /^\s/.test(lines[end]))) end++;
  // Trailing blank lines belong to whatever follows.
  while (end > start + 1 && lines[end - 1].trim() === "") end--;
  return [start, end];
}

/**
 * Update top-level keys of a domain.yaml by editing only their lines, so
 * comments, folded descriptions and every other key stay byte-identical.
 * `undefined` deletes a key. Creates the file (with `domain` and an empty
 * `tags` list, the two keys `check` requires) when it does not exist.
 */
export function updateDomainYaml(
  root: string,
  domain: string,
  updates: Record<string, unknown>,
): void {
  const file = domainYamlPath(root, domain);
  const original = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
  let lines = original.length > 0 ? original.replace(/\n$/, "").split("\n") : [];
  if (keyRange(lines, "domain") === null) lines = [`domain: ${formatScalar(domain)}`, ...lines];

  for (const [key, value] of Object.entries(updates)) {
    const range = keyRange(lines, key);
    if (value === undefined) {
      if (range) lines = [...lines.slice(0, range[0]), ...lines.slice(range[1])];
      continue;
    }
    const inline = formatInline(value);
    const replacement = inline !== null
      ? [`${key}: ${inline}`]
      : stringifyYaml({ [key]: value }, { lineWidth: 0 }).trimEnd().split("\n");
    lines = range
      ? [...lines.slice(0, range[0]), ...replacement, ...lines.slice(range[1])]
      : [...lines, ...replacement];
  }

  if (keyRange(lines, "tags") === null) lines = [...lines, "tags: []"];

  const text = `${lines.join("\n")}\n`;
  // Guard against a malformed edit: the result must parse and carry the values.
  const parsed = DomainYamlSchema.parse(parseYaml(text) ?? {});
  for (const [key, value] of Object.entries(updates)) {
    const actual = (parsed as Record<string, unknown>)[key];
    const expected = value === undefined ? undefined : JSON.stringify(value);
    const got = actual instanceof Date ? JSON.stringify(actual.toISOString().slice(0, 10)) : actual === undefined ? undefined : JSON.stringify(actual);
    if (got !== expected) throw new Error(`domain.yaml edit of "${key}" did not round-trip in ${file}`);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}
