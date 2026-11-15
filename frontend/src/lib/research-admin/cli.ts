import path from "node:path";
import { runCheck } from "./check";
import { applyPlan, formatPlan, type Plan } from "./plan";
import { planRelocate, type RelocateOp } from "./relocate";
import { buildReport, formatReport } from "./report";
import { planTagAdd, planTagMerge, planTagRename, planTagSet, planTitle } from "./tag-ops";

// Entry point of `dev/research-admin`. See research/README.md「整理」.

const USAGE = `usage: dev/research-admin <command> [args] [--apply] [--root <research dir>]

read-only:
  check [--strict-links]                 integrity check (exit 1 on errors)
  report [--json]                        diagnostics for housekeeping

changes (dry-run unless --apply):
  tags add <id> <label> [--description <text>]
  tags set <domain> <id...>              replace a domain's tags, stamp tags_reviewed
  tags rename <old> <new> [--reason <text>]
  tags merge <id...> --into <id> [--reason <text>]
  title <domain> <display name>
  rename <old> <new> [--title <name>] [--reason <text>]
  merge <domain...> --into <domain> [--cluster-suffix <s>] [--reason <text>]
  split <domain> --to <new> --paths <path...> [--title <name>] [--cluster-suffix <s>] [--reason <text>]

options:
  --date <YYYY-MM-DD>   override today's date (tests)
`;

type Args = {
  positional: string[];
  flags: Map<string, string[]>;
};

const BOOLEAN_FLAGS = new Set(["apply", "json", "strict-links", "help"]);

function parseArgs(argv: readonly string[]): Args {
  const positional: string[] = [];
  const flags = new Map<string, string[]>();
  let current: string | null = null;
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const name = arg.slice(2);
      flags.set(name, flags.get(name) ?? []);
      current = BOOLEAN_FLAGS.has(name) ? null : name;
      continue;
    }
    if (current) {
      const values = flags.get(current) ?? [];
      flags.set(current, [...values, arg]);
      // Only --paths and --into (merge targets are single) take many values.
      if (current !== "paths") current = null;
      continue;
    }
    positional.push(arg);
  }
  return { positional, flags };
}

function flag(args: Args, name: string): string | undefined {
  return args.flags.get(name)?.[0];
}

function today(args: Args): string {
  const override = flag(args, "date");
  if (override) return override;
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fail(message: string): never {
  process.stderr.write(`${message}\n\n${USAGE}`);
  process.exit(2);
}

function need(value: string | undefined, what: string): string {
  if (!value) fail(`missing ${what}`);
  return value;
}

function buildPlan(root: string, args: Args): { plan: Plan; remap?: Parameters<typeof applyPlan>[2] } {
  const [command, sub, ...rest] = args.positional;
  const date = today(args);
  const reason = flag(args, "reason");

  if (command === "tags") {
    if (sub === "add") {
      return {
        plan: planTagAdd(root, {
          id: need(rest[0], "tag id"),
          label: need(rest[1], "label"),
          description: flag(args, "description"),
        }),
      };
    }
    if (sub === "set") return { plan: planTagSet(root, need(rest[0], "domain"), rest.slice(1), date) };
    if (sub === "rename") {
      return { plan: planTagRename(root, need(rest[0], "old id"), need(rest[1], "new id"), date, reason) };
    }
    if (sub === "merge") {
      return { plan: planTagMerge(root, rest, need(flag(args, "into"), "--into"), date, reason) };
    }
    fail(`unknown tags subcommand "${sub ?? ""}"`);
  }
  if (command === "title") {
    return { plan: planTitle(root, need(sub, "domain"), need(rest.join(" ") || undefined, "display name")) };
  }

  const relocate = (op: RelocateOp, sources: string[], dest: string) => {
    const plan = planRelocate({
      root,
      op,
      sources,
      dest,
      paths: args.flags.get("paths"),
      today: date,
      reason,
      clusterSuffix: flag(args, "cluster-suffix"),
      title: flag(args, "title"),
    });
    return { plan, remap: plan.remap };
  };
  if (command === "rename") return relocate("rename", [need(sub, "old name")], need(rest[0], "new name"));
  if (command === "merge") {
    return relocate("merge", [need(sub, "domain"), ...rest], need(flag(args, "into"), "--into"));
  }
  if (command === "split") return relocate("split", [need(sub, "domain")], need(flag(args, "to"), "--to"));
  fail(`unknown command "${command ?? ""}"`);
}

function main(argv: readonly string[]): number {
  const args = parseArgs(argv);
  const root = path.resolve(flag(args, "root") ?? "research");
  const command = args.positional[0];
  if (!command || args.flags.has("help")) {
    process.stdout.write(USAGE);
    return command ? 0 : 2;
  }

  if (command === "check") {
    const issues = runCheck(root, { strictLinks: args.flags.has("strict-links") });
    for (const i of issues) process.stdout.write(`${i.level === "error" ? "ERROR" : "warn "} ${i.code}: ${i.message}\n`);
    const errors = issues.filter((i) => i.level === "error").length;
    process.stdout.write(`\n${errors} error(s), ${issues.length - errors} warning(s)\n`);
    return errors > 0 ? 1 : 0;
  }
  if (command === "report") {
    const report = buildReport(root);
    process.stdout.write(args.flags.has("json") ? `${JSON.stringify(report, null, 2)}\n` : `${formatReport(report)}\n`);
    return 0;
  }

  const { plan, remap } = buildPlan(root, args);
  process.stdout.write(`${formatPlan(plan)}\n`);
  if (plan.conflicts.length > 0) return 1;
  if (!args.flags.has("apply")) {
    process.stdout.write("\n(dry-run: nothing changed. Re-run with --apply.)\n");
    return 0;
  }
  const result = applyPlan(root, plan, remap);
  for (const i of result.newIssues) process.stdout.write(`${i.level} ${i.code}: ${i.message}\n`);
  if (!result.ok) {
    process.stderr.write(`\nnot applied: ${result.error ?? "unknown error"}\n`);
    return 1;
  }
  process.stdout.write("\napplied.\n");
  return 0;
}

process.exit(main(process.argv.slice(2)));
