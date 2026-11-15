import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runCheck, type Issue } from "./check";

// Every housekeeping command builds a Plan first. `--dry-run` (the default)
// prints it; `--apply` runs the steps inside a snapshot so a failed run, or one
// that introduces new check errors or broken links, restores the tree exactly.

export type Step = {
  describe: string;
  run: () => void;
};

export type Plan = {
  title: string;
  steps: Step[];
  /** Blocking problems found while planning; a plan with conflicts never applies. */
  conflicts: string[];
};

export function formatPlan(plan: Plan): string {
  const lines = [`# ${plan.title}`];
  if (plan.conflicts.length > 0) {
    lines.push("", "## Conflicts (resolve before --apply)");
    for (const c of plan.conflicts) lines.push(`- ${c}`);
  }
  lines.push("", "## Steps");
  if (plan.steps.length === 0) lines.push("- (nothing to do)");
  for (const s of plan.steps) lines.push(`- ${s.describe}`);
  return lines.join("\n");
}

function issueKey(i: Issue): string {
  return `${i.code}|${i.message}`;
}

function snapshot(root: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "research-admin-"));
  fs.cpSync(root, path.join(dir, "tree"), { recursive: true, verbatimSymlinks: true });
  return dir;
}

/**
 * Put the snapshot back. The broken tree is first moved aside (not deleted),
 * so a failure half-way through leaves both copies on disk.
 */
function restore(root: string, snap: string): void {
  const aside = `${root}.broken-${Date.now()}`;
  fs.renameSync(root, aside);
  fs.cpSync(path.join(snap, "tree"), root, { recursive: true, verbatimSymlinks: true });
  fs.rmSync(aside, { recursive: true, force: true });
}

export type ApplyResult = {
  ok: boolean;
  /** Issues present after the run that were not present before. */
  newIssues: Issue[];
  error?: string;
};

/**
 * Run a plan. Issues that already existed before the run are tolerated (the
 * tree may predate the rules); only issues the run introduced roll it back.
 * `remap` translates a pre-run issue into how it would read after the run
 * (e.g. a broken link in a file that moved), so moved problems are not new.
 */
export function applyPlan(
  root: string,
  plan: Plan,
  remap: (issue: Issue) => Issue = (i) => i,
): ApplyResult {
  if (plan.conflicts.length > 0) {
    return { ok: false, newIssues: [], error: "plan has conflicts" };
  }
  const before = new Set(runCheck(root).map((i) => issueKey(remap(i))));
  const snap = snapshot(root);
  // The snapshot is the only backup until the run is known good (or restored):
  // it is deleted only on those two paths, never when restoring fails.
  const rollback = (error: string, newIssues: Issue[] = []): ApplyResult => {
    try {
      restore(root, snap);
    } catch (e) {
      const why = e instanceof Error ? e.message : String(e);
      return { ok: false, newIssues, error: `${error}; RESTORE FAILED (${why}). Snapshot kept at ${snap}` };
    }
    fs.rmSync(snap, { recursive: true, force: true });
    return { ok: false, newIssues, error };
  };

  let newIssues: Issue[];
  try {
    for (const step of plan.steps) step.run();
    newIssues = runCheck(root).filter((i) => !before.has(issueKey(i)));
  } catch (e) {
    return rollback(e instanceof Error ? e.message : String(e));
  }
  const blocking = newIssues.filter((i) => i.level === "error" || i.code === "link-broken");
  if (blocking.length > 0) return rollback("the run introduced new problems; rolled back", blocking);
  fs.rmSync(snap, { recursive: true, force: true });
  return { ok: true, newIssues };
}
