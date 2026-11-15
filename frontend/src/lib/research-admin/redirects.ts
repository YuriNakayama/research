// Path redirects recorded by housekeeping (rename / merge / split).
//
// Paths are relative to `research/` and use `/` separators, e.g.
// `runs/kaggle_ptcg/clustering/20260626`. Matching is by whole path segments:
// `runs/a` matches `runs/a/x` but not `runs/ab`. Pure functions only so the
// viewer (URL redirects, notes lookup) and the CLI share one implementation.

export type Redirect = {
  from: string;
  to: string;
  change: string;
};

const MAX_HOPS = 32;

/**
 * Only plain path segments are redirected. Slugs reach here from URLs, and a
 * segment such as `..`, or one carrying a decoded `/` or `\\`, must never be
 * carried over into a redirect target.
 */
export function isSafeResearchPath(p: string): boolean {
  if (p.includes("\\") || p.includes("\0")) return false;
  const segments = p.split("/");
  return segments.length > 0 && segments.every((s) => s.length > 0 && s !== "." && s !== "..");
}

function splitPath(p: string): string[] {
  return p.split("/").filter((s) => s.length > 0);
}

function startsWithSegments(target: string[], prefix: string[]): boolean {
  if (prefix.length > target.length) return false;
  return prefix.every((seg, i) => target[i] === seg);
}

/** Longest `from` that prefixes `segments`, or undefined. */
function findLongestMatch(
  segments: string[],
  redirects: readonly Redirect[],
): Redirect | undefined {
  let best: Redirect | undefined;
  let bestLen = -1;
  for (const r of redirects) {
    const from = splitPath(r.from);
    if (from.length > bestLen && startsWithSegments(segments, from)) {
      best = r;
      bestLen = from.length;
    }
  }
  return best;
}

/**
 * Follow redirects until no entry matches. Returns null when nothing matched
 * (the path was never moved). Throws on a cycle or an over-long chain, which
 * `check` reports as an error before it can reach the viewer.
 */
export function resolveRedirect(p: string, redirects: readonly Redirect[]): string | null {
  if (!isSafeResearchPath(p)) return null;
  let segments = splitPath(p);
  let moved = false;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const match = findLongestMatch(segments, redirects);
    if (!match) return moved ? segments.join("/") : null;
    const rest = segments.slice(splitPath(match.from).length);
    const next = [...splitPath(match.to), ...rest];
    if (next.join("/") === segments.join("/")) return moved ? segments.join("/") : null;
    segments = next;
    moved = true;
  }
  throw new Error(`redirect chain too long or cyclic: ${p}`);
}

/**
 * Earlier paths that may have pointed at `p` before housekeeping moved it.
 * Used to keep personal notes (keyed by document path) visible after a move.
 * The result can contain paths that never existed; callers only use them as
 * lookup keys. Bounded to `limit` entries.
 */
export function previousPaths(
  p: string,
  redirects: readonly Redirect[],
  limit = 16,
): string[] {
  if (!isSafeResearchPath(p)) return [];
  const found: string[] = [];
  const queue: string[][] = [splitPath(p)];
  const seen = new Set<string>([splitPath(p).join("/")]);

  while (queue.length > 0 && found.length < limit) {
    const current = queue.shift() as string[];
    for (const r of redirects) {
      const to = splitPath(r.to);
      if (!startsWithSegments(current, to)) continue;
      const candidate = [...splitPath(r.from), ...current.slice(to.length)];
      const key = candidate.join("/");
      if (seen.has(key)) continue;
      // Only accept a candidate that really resolves back to `p`; a generic
      // domain-level entry can be shadowed by a more specific one.
      let resolved: string | null;
      try {
        resolved = resolveRedirect(key, redirects);
      } catch {
        continue;
      }
      if (resolved !== splitPath(p).join("/")) continue;
      seen.add(key);
      found.push(key);
      queue.push(candidate);
      if (found.length >= limit) break;
    }
  }
  return found;
}
