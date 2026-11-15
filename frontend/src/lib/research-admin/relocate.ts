import fs from "node:fs";
import path from "node:path";
import type { Issue } from "./check";
import { rewriteLinks } from "./links";
import {
  DOMAIN_NAME_PATTERN,
  readDomainYaml,
  readRedirects,
  updateDomainYaml,
  writeChange,
  writeRedirects,
} from "./meta";
import type { Plan, Step } from "./plan";
import type { Redirect } from "./redirects";
import { isRunDir, nextFreeRunDir, sortRunDirsDesc } from "./run-dirs";
import {
  SKILL_PHASES,
  allMarkdownFiles,
  fromResearchPath,
  listDomains,
  listLocalDirs,
  listRunDirs,
  clusterRunDir,
  readLatest,
  resolveAliasPath,
  toResearchPath,
  type SkillPhase,
} from "./tree";

// rename / merge / split: everything that changes where content lives.
//
// The plan is computed against the current tree in one pass:
//   1. decide every move (`from` -> `to`, research paths)
//   2. compute the rewritten content of every Markdown file whose links (or
//      own location) change, reading the tree as it is *before* the move
//   3. emit steps: move, delete view links, write rewritten files, update
//      domain.yaml, relink `latest`, append redirects and a change record
// Run contents are never edited except for those link rewrites.

export type RelocateOp = "rename" | "merge" | "split";

export type RelocateInput = {
  root: string;
  op: RelocateOp;
  sources: string[];
  dest: string;
  /** split only: research paths to move (run dirs, clusters, entries of domains/<d>/<dir>/). */
  paths?: string[];
  today: string;
  reason?: string;
  /** Suffix for a gather/retrieval cluster that already exists at the destination. */
  clusterSuffix?: string;
  /** display_name for a destination created by split / rename (default: keep). */
  title?: string;
};

type Move = { from: string; to: string };

const VIEW_LINK_DIRS = new Set(["clustering", "resources", "reports"]);
function seg(p: string): string[] {
  return p.split("/").filter((s) => s.length > 0);
}

function lexists(abs: string): boolean {
  try {
    fs.lstatSync(abs);
    return true;
  } catch {
    return false;
  }
}

/** Every entry, dotfiles included (a `.gitkeep` keeps a directory alive). */
function rawReaddir(abs: string): fs.Dirent[] {
  try {
    return fs.readdirSync(abs, { withFileTypes: true });
  } catch {
    return [];
  }
}

function readdir(abs: string): fs.Dirent[] {
  try {
    return fs.readdirSync(abs, { withFileTypes: true }).filter((e) => !e.name.startsWith("."));
  } catch {
    return [];
  }
}

function compact(today: string): string {
  return today.replace(/-/g, "");
}

class Planner {
  readonly moves: Move[] = [];
  readonly deletions: string[] = [];
  readonly conflicts: string[] = [];
  private readonly planned = new Set<string>();

  constructor(private readonly input: RelocateInput) {}

  private get root(): string {
    return this.input.root;
  }

  private occupied(p: string): boolean {
    return this.planned.has(p) || lexists(fromResearchPath(this.root, p));
  }

  private move(from: string, to: string): void {
    if (this.occupied(to)) {
      this.conflicts.push(`${to} already exists (moving ${from})`);
      return;
    }
    this.moves.push({ from, to });
    this.planned.add(to);
  }

  private takenRunDirs(phase: SkillPhase): Set<string> {
    const names = new Set(listRunDirs(this.root, this.input.dest, phase));
    for (const p of this.planned) {
      const s = seg(p);
      if (s[0] === "runs" && s[1] === this.input.dest && s[2] === phase && s.length === 4) names.add(s[3]);
    }
    return names;
  }

  /** Move one cluster dir of a gather/retrieval run, suffixing on collision. */
  private moveCluster(from: string, dateDirTo: string, cluster: string): void {
    let to = `${dateDirTo}/${cluster}`;
    if (this.occupied(to) && this.input.clusterSuffix) {
      to = `${dateDirTo}/${cluster}-${this.input.clusterSuffix}`;
    }
    if (this.occupied(to)) {
      this.conflicts.push(`${to} already exists; pass --cluster-suffix to keep both (moving ${from})`);
      return;
    }
    this.move(from, to);
  }

  /** Move `runs/<src>/<phase>/<dir>` into the destination domain. */
  planRunDir(src: string, phase: SkillPhase, dir: string): void {
    const from = `runs/${src}/${phase}/${dir}`;
    const destPhase = `runs/${this.input.dest}/${phase}`;
    if (phase === "clustering" && isRunDir(dir)) {
      const name = nextFreeRunDir(dir, this.takenRunDirs(phase));
      this.move(from, `${destPhase}/${name}`);
      return;
    }
    const to = `${destPhase}/${dir}`;
    if (!this.occupied(to)) {
      this.move(from, to);
      return;
    }
    if (phase === "clustering") {
      this.conflicts.push(`${to} already exists (moving ${from})`);
      return;
    }
    for (const child of readdir(fromResearchPath(this.root, from))) {
      this.moveCluster(`${from}/${child.name}`, to, child.name);
    }
  }

  /** Everything under runs/<src>/ (all phases), for rename and merge. */
  planWholeRuns(src: string): void {
    for (const e of readdir(fromResearchPath(this.root, `runs/${src}`))) {
      const phase = SKILL_PHASES.find((p) => p === e.name);
      if (!phase || !e.isDirectory()) {
        this.move(`runs/${src}/${e.name}`, `runs/${this.input.dest}/${e.name}`);
        continue;
      }
      const entries = readdir(fromResearchPath(this.root, `runs/${src}/${phase}`));
      // Oldest first so a collision suffix (-2, -3) follows chronology.
      const names = sortRunDirsDesc(entries.filter((x) => !x.isSymbolicLink()).map((x) => x.name)).reverse();
      for (const name of names) this.planRunDir(src, phase, name);
      for (const x of entries) if (x.isSymbolicLink()) this.deletions.push(`runs/${src}/${phase}/${x.name}`);
    }
  }

  /** The human layer of domains/<src>/ (everything except domain.yaml). */
  planDomainLocal(src: string): void {
    const base = `domains/${src}`;
    for (const e of readdir(fromResearchPath(this.root, base))) {
      const p = `${base}/${e.name}`;
      if (e.isSymbolicLink()) {
        this.deletions.push(p);
      } else if (VIEW_LINK_DIRS.has(e.name) && e.isDirectory()) {
        const children = readdir(fromResearchPath(this.root, p));
        if (children.every((c) => c.isSymbolicLink())) this.deletions.push(p);
        else this.conflicts.push(`${p} contains real files; only symlinks are expected there`);
      } else if (e.name === "domain.yaml") {
        continue;
      } else if (e.isDirectory()) {
        // A hand-written directory: merge it entry by entry so both sides keep theirs.
        for (const child of readdir(fromResearchPath(this.root, p))) {
          this.move(`${p}/${child.name}`, `domains/${this.input.dest}/${e.name}/${child.name}`);
        }
      } else {
        this.move(p, `domains/${this.input.dest}/${e.name}`);
      }
    }
  }

  /** split: one selected path. */
  planSelected(src: string, p: string): void {
    const s = seg(p);
    const inRuns = s[0] === "runs" && s[1] === src;
    const inLocal = s[0] === "domains" && s[1] === src && listLocalDirs(this.root, src).includes(s[2]);
    // `..` would be normalized by path.join and move a whole domain; `latest`
    // is an alias, not content.
    if (p.split("/").some((x) => x === "" || x === "." || x === ".." || x === "latest")) {
      this.conflicts.push(`${p}: paths must name a real run, cluster, study or discussion (no "", ".", "..", "latest")`);
      return;
    }
    if (!fs.existsSync(fromResearchPath(this.root, p))) {
      this.conflicts.push(`${p} does not exist`);
      return;
    }
    if (inRuns && s.length === 4 && SKILL_PHASES.some((x) => x === s[2])) {
      this.planRunDir(src, s[2] as SkillPhase, s[3]);
    } else if (inRuns && s.length === 5 && s[2] !== "clustering") {
      this.moveCluster(p, `runs/${this.input.dest}/${s[2]}/${s[3]}`, s[4]);
    } else if (inLocal && s.length === 4) {
      this.move(p, ["domains", this.input.dest, ...s.slice(2)].join("/"));
    } else {
      this.conflicts.push(
        `${p}: split takes runs/${src}/<phase>/<date>, runs/${src}/<gather|retrieval>/<date>/<cluster>, ` +
          `or domains/${src}/<dir>/<name>`,
      );
    }
  }
}

function longestMove(p: string, moves: readonly Move[]): Move | undefined {
  const s = seg(p);
  let best: Move | undefined;
  let bestLen = -1;
  for (const m of moves) {
    const f = seg(m.from);
    if (f.length > bestLen && f.length <= s.length && f.every((x, i) => s[i] === x)) {
      best = m;
      bestLen = f.length;
    }
  }
  return best;
}

function viaMoves(p: string, moves: readonly Move[]): string | null {
  const m = longestMove(p, moves);
  if (!m) return null;
  return [...seg(m.to), ...seg(p).slice(seg(m.from).length)].join("/");
}

/**
 * Build the mapping old research path -> new research path.
 *
 * For merge and split, `latest` and domains/ view paths of every domain
 * involved (sources AND destination) are first pinned to the concrete run they
 * resolve to today: moving runs in changes which run is newest, so an alias
 * would otherwise silently point at different content. Rename keeps aliases,
 * since the domain's runs and their order are unchanged.
 */
function makeMapper(input: RelocateInput, moves: readonly Move[]) {
  const { root, op, sources, dest } = input;
  const wholeDomain = op === "rename" || op === "merge";
  const pinned = new Set([...sources, dest]);

  const pin = (p: string): string => {
    if (op === "rename") return p;
    const s = seg(p);
    if ((s[0] === "runs" || s[0] === "domains") && pinned.has(s[1])) return resolveAliasPath(root, p);
    return p;
  };

  const domainLevel = (p: string): string => {
    const s = seg(p);
    if (wholeDomain && (s[0] === "runs" || s[0] === "domains") && sources.includes(s[1])) {
      return [s[0], dest, ...s.slice(2)].join("/");
    }
    return p;
  };

  const mapFile = (p: string): string => viaMoves(p, moves) ?? p;
  const mapTarget = (p: string): string => {
    const concrete = pin(p);
    return viaMoves(concrete, moves) ?? domainLevel(concrete);
  };
  return { mapFile, mapTarget, domainLevel };
}

function validateInput(input: RelocateInput): string[] {
  const conflicts: string[] = [];
  const domains = listDomains(input.root);
  for (const s of input.sources) {
    if (!domains.includes(s)) conflicts.push(`unknown domain "${s}"`);
    if (s === input.dest) conflicts.push(`source and destination are the same ("${s}")`);
  }
  if (!DOMAIN_NAME_PATTERN.test(input.dest)) conflicts.push(`"${input.dest}" is not snake_case`);
  const destExists = domains.includes(input.dest);
  if (input.op === "rename" && destExists) conflicts.push(`"${input.dest}" already exists (use merge)`);
  if (input.op === "merge" && !destExists) conflicts.push(`merge target "${input.dest}" does not exist (use rename)`);
  if (input.op === "split" && input.sources.length !== 1) conflicts.push("split takes exactly one source");
  if (input.op === "split" && (input.paths ?? []).length === 0) conflicts.push("split needs --paths");
  return conflicts;
}

function relinkLatest(root: string, domain: string): void {
  for (const phase of SKILL_PHASES) {
    const dir = fromResearchPath(root, `runs/${domain}/${phase}`);
    if (!fs.existsSync(dir)) continue;
    const link = path.join(dir, "latest");
    const newest = listRunDirs(root, domain, phase)[0];
    if (lexists(link)) fs.rmSync(link, { force: true });
    if (newest) fs.symlinkSync(newest, link);
  }
}

/**
 * After a split, remove directories the moves left empty (a run dir whose
 * only cluster moved, then a phase dir holding nothing but `latest`), walking
 * up from each moved path but never above runs/<domain> or domains/<domain>.
 */
function pruneEmptyParents(root: string, moved: readonly string[]): void {
  const parents = [...new Set(moved.map((p) => path.posix.dirname(p)))];
  for (const start of parents) {
    let current = start;
    while (seg(current).length > 2) {
      const abs = fromResearchPath(root, current);
      const rest = rawReaddir(abs).filter(
        (e) => e.name !== ".DS_Store" && !(e.name === "latest" && e.isSymbolicLink()),
      );
      if (!fs.existsSync(abs) || rest.length > 0) break;
      fs.rmSync(abs, { recursive: true, force: true });
      current = path.posix.dirname(current);
    }
  }
}

/** Remove a directory tree that holds only (empty) directories. */
function removeEmptyTree(abs: string): void {
  if (!fs.existsSync(abs)) return;
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    if (e.name === ".DS_Store") fs.rmSync(path.join(abs, e.name));
    else if (e.isDirectory()) removeEmptyTree(path.join(abs, e.name));
    else throw new Error(`refusing to delete ${abs}: ${e.name} is still there`);
  }
  fs.rmdirSync(abs);
}

function rewrittenFiles(
  root: string,
  mapFile: (p: string) => string,
  mapTarget: (p: string) => string,
): { path: string; content: string; changed: boolean }[] {
  const out: { path: string; content: string; changed: boolean }[] = [];
  for (const abs of allMarkdownFiles(root)) {
    const oldPath = toResearchPath(root, abs);
    const newPath = mapFile(oldPath);
    const content = fs.readFileSync(abs, "utf-8");
    const next = rewriteLinks(content, oldPath, newPath, mapTarget);
    if (next !== content) out.push({ path: newPath, content: next, changed: true });
  }
  return out;
}

function mergedDomainYaml(input: RelocateInput): Record<string, unknown> {
  const { root, op, sources, dest } = input;
  const destYaml = op === "rename" ? readDomainYaml(root, sources[0]) : readDomainYaml(root, dest);
  const sourceTags = sources.flatMap((s) => readDomainYaml(root, s)?.tags ?? []);
  const tags = [...new Set([...(destYaml?.tags ?? []), ...sourceTags])];
  const displayName =
    input.title ?? destYaml?.display_name ?? (op === "split" ? undefined : readDomainYaml(root, sources[0])?.display_name) ?? dest;
  return {
    domain: dest,
    display_name: displayName,
    tags,
    // Merged or split content changes what the domain covers: review again.
    tags_reviewed: op === "rename" ? destYaml?.tags_reviewed : undefined,
  };
}

/**
 * After a merge, a source's aliases (`runs/<s>/<phase>/latest`, the domains/
 * views) must keep meaning "what they showed before the merge", not "the
 * destination's newest run". Record their concrete targets as of now; the
 * longest-prefix rule makes these win over the domain-level entries.
 */
function aliasRedirects(
  input: RelocateInput,
  mapTarget: (p: string) => string,
  change: string,
): Redirect[] {
  if (input.op !== "merge") return [];
  const { root } = input;
  const out: Redirect[] = [];
  const add = (from: string): void => {
    const concrete = resolveAliasPath(root, from);
    if (concrete !== from) out.push({ from, to: mapTarget(concrete), change });
  };
  for (const s of input.sources) {
    for (const phase of SKILL_PHASES) {
      if (readLatest(root, s, phase)) add(`runs/${s}/${phase}/latest`);
    }
    add(`domains/${s}/clustering`);
    for (const [view, phase] of [["resources", "gather"], ["reports", "retrieval"]] as const) {
      const clusters = new Set(
        listRunDirs(root, s, phase).flatMap((d) =>
          readdir(fromResearchPath(root, `runs/${s}/${phase}/${d}`)).filter((e) => e.isDirectory()).map((e) => e.name),
        ),
      );
      for (const c of clusters) if (clusterRunDir(root, s, phase, c)) add(`domains/${s}/${view}/${c}`);
    }
  }
  return out;
}

function redirectsFor(
  input: RelocateInput,
  moves: readonly Move[],
  domainLevel: (p: string) => string,
  mapTarget: (p: string) => string,
  change: string,
): Redirect[] {
  const out: Redirect[] = [...aliasRedirects(input, mapTarget, change)];
  if (input.op !== "split") {
    for (const s of input.sources) {
      out.push({ from: `runs/${s}`, to: `runs/${input.dest}`, change });
      out.push({ from: `domains/${s}`, to: `domains/${input.dest}`, change });
    }
  }
  for (const m of moves) {
    if (input.op === "split" || domainLevel(m.from) !== m.to) out.push({ from: m.from, to: m.to, change });
  }
  return out;
}

/** `runs/<d>/<phase>/latest a -> b` for every latest the moves will change. */
function predictLatestChanges(root: string, domains: readonly string[], moves: readonly Move[]): string[] {
  const out: string[] = [];
  for (const d of domains) {
    for (const phase of SKILL_PHASES) {
      const prefix = `runs/${d}/${phase}/`;
      const gone = new Set(moves.filter((m) => m.from.startsWith(prefix) && seg(m.from).length === 4).map((m) => seg(m.from)[3]));
      const arriving = moves.filter((m) => m.to.startsWith(prefix) && seg(m.to).length === 4).map((m) => seg(m.to)[3]);
      const after = sortRunDirsDesc([...listRunDirs(root, d, phase).filter((x) => !gone.has(x)), ...arriving])[0];
      const before = readLatest(root, d, phase);
      if ((after ?? null) !== before) out.push(`${prefix}latest ${before ?? "(none)"} -> ${after ?? "(none)"}`);
    }
  }
  return out;
}

export type RelocatePlan = Plan & {
  /** Translate a pre-run issue into its post-run wording (see applyPlan). */
  remap: (issue: Issue) => Issue;
};

export function planRelocate(input: RelocateInput): RelocatePlan {
  const { root, op, sources, dest, today } = input;
  const conflicts = validateInput(input);
  const title = `${op} ${sources.join(",")} -> ${dest}`;
  if (conflicts.length > 0) return { title, conflicts, steps: [], remap: (i) => i };

  const planner = new Planner(input);
  if (op === "split") {
    for (const p of input.paths ?? []) planner.planSelected(sources[0], p.replace(/\/$/, ""));
  } else {
    for (const s of sources) {
      planner.planWholeRuns(s);
      planner.planDomainLocal(s);
    }
  }
  const { moves, deletions } = planner;
  const { mapFile, mapTarget, domainLevel } = makeMapper(input, moves);
  const rewrites = rewrittenFiles(root, mapFile, mapTarget);
  const changeName = `${compact(today)}-${op}-${dest}`;
  const redirects = redirectsFor(input, moves, domainLevel, mapTarget, changeName);
  const latestChanges = predictLatestChanges(root, [dest, ...(op === "split" ? sources : [])], moves);
  const destYaml = mergedDomainYaml(input);
  // Keep what the removed domain.yaml said (description, competitions, ...)
  // in the change record, since merge only carries tags over.
  const sourceMeta = op === "merge" ? Object.fromEntries(sources.map((s) => [s, readDomainYaml(root, s)])) : undefined;

  const steps: Step[] = [
    ...moves.map((m) => ({
      describe: `move ${m.from} -> ${m.to}`,
      run: () => {
        const to = fromResearchPath(root, m.to);
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.renameSync(fromResearchPath(root, m.from), to);
      },
    })),
    ...deletions.map((d) => ({
      describe: `delete view link ${d}`,
      run: () => fs.rmSync(fromResearchPath(root, d), { recursive: true, force: true }),
    })),
    ...rewrites.map((r) => ({
      describe: `rewrite links in ${r.path}`,
      run: () => fs.writeFileSync(fromResearchPath(root, r.path), r.content),
    })),
    {
      describe: `domains/${dest}/domain.yaml: domain=${dest}, tags=[${(destYaml.tags as string[]).join(", ")}]`,
      run: () => {
        if (op === "rename") {
          const from = fromResearchPath(root, `domains/${sources[0]}/domain.yaml`);
          const to = fromResearchPath(root, `domains/${dest}/domain.yaml`);
          if (fs.existsSync(from)) {
            fs.mkdirSync(path.dirname(to), { recursive: true });
            fs.renameSync(from, to);
          }
        }
        updateDomainYaml(root, dest, destYaml);
      },
    },
  ];

  if (op === "split") {
    steps.push({
      describe: `domains/${sources[0]}/domain.yaml: clear tags_reviewed; prune emptied directories`,
      run: () => {
        updateDomainYaml(root, sources[0], { tags_reviewed: undefined });
        pruneEmptyParents(root, moves.map((m) => m.from));
      },
    });
  } else {
    steps.push({
      describe: `remove ${sources.map((s) => `runs/${s}, domains/${s}`).join(", ")}`,
      run: () => {
        for (const s of sources) {
          fs.rmSync(fromResearchPath(root, `domains/${s}/domain.yaml`), { force: true });
          removeEmptyTree(fromResearchPath(root, `runs/${s}`));
          removeEmptyTree(fromResearchPath(root, `domains/${s}`));
        }
      },
    });
  }

  steps.push(
    {
      describe:
        latestChanges.length > 0
          ? `relink latest: ${latestChanges.join("; ")}`
          : `relink latest in ${[dest, ...(op === "split" ? sources : [])].map((d) => `runs/${d}`).join(", ")} (unchanged)`,
      run: () => {
        relinkLatest(root, dest);
        if (op === "split") relinkLatest(root, sources[0]);
      },
    },
    {
      describe: `_meta/redirects.yaml: add ${redirects.length} entr${redirects.length === 1 ? "y" : "ies"}`,
      run: () => writeRedirects(root, [...readRedirects(root), ...redirects]),
    },
    {
      describe: `_meta/changes/${changeName}.yaml`,
      run: () =>
        writeChange(root, changeName, {
          op,
          date: today,
          reason: input.reason,
          args: {
            from: sources,
            into: dest,
            ...(op === "split" ? { paths: input.paths } : {}),
            ...(sourceMeta ? { source_domain_yaml: sourceMeta } : {}),
          },
          moved: moves.map((m) => `${m.from} -> ${m.to}`),
        }),
    },
  );

  const remap = (issue: Issue): Issue => {
    let message = issue.message.replace(/^(.+?\.md):/, (_, f: string) => `${mapFile(f)}:`);
    message = message.replace(/link to "([^"]+)"/, (_, t: string) => `link to "${mapTarget(t)}"`);
    if (op !== "split") {
      for (const s of sources) message = message.replace(new RegExp(`^${s}:`), `${dest}:`);
    }
    return { ...issue, message };
  };

  return { title, conflicts: planner.conflicts, steps, remap };
}
