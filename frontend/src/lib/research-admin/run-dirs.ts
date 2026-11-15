// Naming rules for dated run directories under `runs/<domain>/<phase>/`.
//
// A run directory is `<YYYYMMDD>`, or `<YYYYMMDD>-<n>` (n >= 2) when a merge
// moved a second run onto a date the destination domain already had. Within one
// date a larger n is newer. Pure helpers only: shared by the viewer and the
// housekeeping CLI so both agree on what "newest" means.

export const RUN_DIR_PATTERN = /^(\d{8})(?:-(\d+))?$/;

type ParsedRunDir = {
  date: string;
  seq: number;
};

export function parseRunDir(name: string): ParsedRunDir | null {
  const match = name.match(RUN_DIR_PATTERN);
  if (!match) return null;
  return { date: match[1], seq: match[2] ? Number(match[2]) : 1 };
}

export function isRunDir(name: string): boolean {
  return RUN_DIR_PATTERN.test(name);
}

/** The `YYYYMMDD` part of a run directory name, or null when it is not one. */
export function runDirDate(name: string): string | null {
  return parseRunDir(name)?.date ?? null;
}

/** Ascending order: older first. Non-run names sort before run names. */
export function compareRunDirs(a: string, b: string): number {
  const pa = parseRunDir(a);
  const pb = parseRunDir(b);
  if (!pa || !pb) return pa ? 1 : pb ? -1 : a.localeCompare(b);
  if (pa.date !== pb.date) return pa.date.localeCompare(pb.date);
  return pa.seq - pb.seq;
}

/** Newest first. */
export function sortRunDirsDesc(names: readonly string[]): string[] {
  return [...names].sort((a, b) => compareRunDirs(b, a));
}

/** `name` if free, otherwise the first `<date>-<n>` not in `taken`. */
export function nextFreeRunDir(name: string, taken: ReadonlySet<string>): string {
  if (!taken.has(name)) return name;
  const parsed = parseRunDir(name);
  const date = parsed?.date ?? name;
  for (let n = 2; ; n++) {
    const candidate = `${date}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}
