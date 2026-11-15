import path from "node:path";

// Internal Markdown links in research content.
//
// Two forms are recognized:
//   - relative:  `[x](../../gather/20260420/foo/resources.md#sec)`
//   - absolute:  `[x](/research/runs/<d>/...)` and `/api/research-assets/...`
// External URLs, mail links and pure `#anchor` links are ignored. All paths
// here are research paths (relative to `research/`, `/`-separated).

const LINK_PATTERN = /(\]\(\s*<?)([^)\s>]+)(>?(?:\s+"[^"]*")?\s*\))/g;
const ABSOLUTE_PREFIXES = ["/research/", "/api/research-assets/"] as const;

export type InternalLink = {
  /** The raw target as written, without the `#fragment`. */
  raw: string;
  fragment: string;
  /** Resolved research path, or null when it points outside research/. */
  target: string | null;
  absolutePrefix: (typeof ABSOLUTE_PREFIXES)[number] | null;
};

/**
 * Character ranges that are code, not prose: fenced blocks (``` / ~~~) and
 * inline code spans. Link-looking text inside them (`h[t](phi(x))`) is
 * neither checked nor rewritten.
 */
function codeRanges(content: string): [number, number][] {
  const ranges: [number, number][] = [];
  const fence = /^[ \t]*(`{3,}|~{3,})[^\n]*\n[\s\S]*?(?:^[ \t]*\1[ \t]*$|(?![\s\S]))/gm;
  for (const m of content.matchAll(fence)) ranges.push([m.index, m.index + m[0].length]);
  // Single-line spans only, so one stray backtick cannot mask a whole page.
  const inline = /(`+)[^`\n][^\n]*?\1/g;
  for (const m of content.matchAll(inline)) {
    const start = m.index;
    if (!ranges.some(([a, b]) => start >= a && start < b)) ranges.push([start, start + m[0].length]);
  }
  return ranges;
}

function inRanges(offset: number, ranges: readonly [number, number][]): boolean {
  return ranges.some(([a, b]) => offset >= a && offset < b);
}

function isExternal(target: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#") || target.startsWith("//");
}

function splitFragment(target: string): [string, string] {
  const i = target.indexOf("#");
  return i === -1 ? [target, ""] : [target.slice(0, i), target.slice(i)];
}

function safeDecode(p: string): string {
  try {
    return decodeURI(p);
  } catch {
    return p;
  }
}

/** Interpret a link target written inside `fromFile` (a research path). */
export function parseLinkTarget(fromFile: string, rawTarget: string): InternalLink | null {
  if (isExternal(rawTarget)) return null;
  const [raw, fragment] = splitFragment(rawTarget);
  if (raw.length === 0) return null;

  const prefix = ABSOLUTE_PREFIXES.find((p) => raw.startsWith(p)) ?? null;
  if (raw.startsWith("/") && !prefix) return null;

  const joined = prefix
    ? safeDecode(raw.slice(prefix.length))
    : path.posix.join(path.posix.dirname(fromFile), safeDecode(raw));
  const normalized = path.posix.normalize(joined).replace(/\/$/, "");
  const target = normalized.startsWith("..") || normalized === "." ? null : normalized;
  return { raw, fragment, target, absolutePrefix: prefix };
}

export function extractLinks(fromFile: string, content: string): InternalLink[] {
  const links: InternalLink[] = [];
  const code = codeRanges(content);
  for (const match of content.matchAll(LINK_PATTERN)) {
    if (inRanges(match.index, code)) continue;
    const link = parseLinkTarget(fromFile, match[2]);
    if (link) links.push(link);
  }
  return links;
}

function encodeLikeOriginal(original: string, next: string): string {
  // Keep percent-encoding only if the author used it.
  return original.includes("%") ? encodeURI(next) : next;
}

/**
 * Rewrite internal links of a file that moved from `oldFile` to `newFile`.
 * `mapTarget` maps an old research path to its new location (identity when
 * the target did not move). Links whose text would not change are left as-is,
 * so files without affected links come back byte-identical.
 */
export function rewriteLinks(
  content: string,
  oldFile: string,
  newFile: string,
  mapTarget: (researchPath: string) => string,
): string {
  const code = codeRanges(content);
  return content.replace(LINK_PATTERN, (whole, open: string, rawTarget: string, close: string, offset: number) => {
    if (inRanges(offset, code)) return whole;
    const link = parseLinkTarget(oldFile, rawTarget);
    if (!link || !link.target) return whole;

    const mapped = mapTarget(link.target);
    if (mapped === link.target && oldFile === newFile) return whole;

    let next: string;
    if (link.absolutePrefix) {
      if (mapped === link.target) return whole;
      next = `${link.absolutePrefix}${mapped}`;
    } else {
      const rel = path.posix.relative(path.posix.dirname(newFile), mapped) || ".";
      const keepDotSlash = link.raw.startsWith("./") && !rel.startsWith("..");
      next = keepDotSlash ? `./${rel}` : rel;
      if (link.raw.endsWith("/") && !next.endsWith("/")) next += "/";
    }
    const rebuilt = encodeLikeOriginal(link.raw, next) + link.fragment;
    if (rebuilt === rawTarget) return whole;
    return `${open}${rebuilt}${close}`;
  });
}
