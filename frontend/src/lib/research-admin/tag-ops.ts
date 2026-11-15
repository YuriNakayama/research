import {
  TAG_ID_PATTERN,
  readDomainYaml,
  readTags,
  updateDomainYaml,
  writeChange,
  writeTags,
  type Tag,
} from "./meta";
import type { Plan, Step } from "./plan";
import { listDomains } from "./tree";

// Tag operations and display-name edits. None of them moves files.

function uniq(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function domainsUsing(root: string, ids: readonly string[]): string[] {
  return listDomains(root).filter((d) => {
    const tags = readDomainYaml(root, d)?.tags ?? [];
    return tags.some((t) => ids.includes(t));
  });
}

export function planTagAdd(root: string, tag: Tag): Plan {
  const conflicts: string[] = [];
  const tags = readTags(root);
  if (!TAG_ID_PATTERN.test(tag.id)) conflicts.push(`"${tag.id}" is not snake_case`);
  if (tags.some((t) => t.id === tag.id)) conflicts.push(`tag "${tag.id}" already exists`);
  return {
    title: `tags add ${tag.id}`,
    conflicts,
    steps: [
      {
        describe: `add "${tag.id}" (${tag.label}) to _meta/tags.yaml`,
        run: () => writeTags(root, [...readTags(root), tag]),
      },
    ],
  };
}

export function planTagSet(root: string, domain: string, ids: readonly string[], today: string): Plan {
  const conflicts: string[] = [];
  const known = new Set(readTags(root).map((t) => t.id));
  if (!listDomains(root).includes(domain)) conflicts.push(`unknown domain "${domain}"`);
  for (const id of ids) {
    if (!known.has(id)) conflicts.push(`tag "${id}" is not in _meta/tags.yaml (add it first)`);
  }
  const next = uniq(ids);
  return {
    title: `tags set ${domain}`,
    conflicts,
    steps: [
      {
        describe: `domains/${domain}/domain.yaml: tags = [${next.join(", ")}], tags_reviewed = ${today}`,
        run: () => updateDomainYaml(root, domain, { tags: next, tags_reviewed: today }),
      },
    ],
  };
}

/** Rename or merge tag ids. `sources` collapse into `target`. */
function planTagReplace(
  root: string,
  op: "tags-rename" | "tags-merge",
  sources: readonly string[],
  target: string,
  today: string,
  reason: string | undefined,
): Plan {
  const conflicts: string[] = [];
  const tags = readTags(root);
  const byId = new Map(tags.map((t) => [t.id, t]));
  for (const s of sources) if (!byId.has(s)) conflicts.push(`tag "${s}" does not exist`);
  if (!TAG_ID_PATTERN.test(target)) conflicts.push(`"${target}" is not snake_case`);
  if (op === "tags-rename" && byId.has(target)) conflicts.push(`tag "${target}" already exists (use tags merge)`);
  if (op === "tags-merge" && !byId.has(target)) conflicts.push(`merge target "${target}" does not exist`);

  const affected = domainsUsing(root, sources);
  const steps: Step[] = [
    {
      describe: `_meta/tags.yaml: ${sources.join(", ")} -> ${target}`,
      run: () => {
        const current = readTags(root);
        const removed = current.filter((t) => sources.includes(t.id));
        const base = current.find((t) => t.id === target) ?? { ...removed[0], id: target };
        const aliases = uniq([
          ...(base.aliases ?? []),
          ...removed.flatMap((t) => [t.label, ...(t.aliases ?? [])]),
        ]).filter((a) => a !== base.label);
        const merged: Tag = { ...base, aliases: aliases.length > 0 ? aliases : undefined };
        const rest = current.filter((t) => !sources.includes(t.id) && t.id !== target);
        writeTags(root, [...rest, merged]);
      },
    },
    ...affected.map((d) => ({
      describe: `domains/${d}/domain.yaml: replace ${sources.join(", ")} with ${target}`,
      run: () => {
        const tags = readDomainYaml(root, d)?.tags ?? [];
        updateDomainYaml(root, d, {
          tags: uniq(tags.map((t) => (sources.includes(t) ? target : t))),
        });
      },
    })),
    {
      describe: `_meta/changes/${today.replace(/-/g, "")}-${op}-${target}.yaml`,
      run: () =>
        writeChange(root, `${today.replace(/-/g, "")}-${op}-${target}`, {
          op,
          date: today,
          reason,
          args: { from: [...sources], into: target, domains: affected },
        }),
    },
  ];
  return { title: `${op} ${sources.join(",")} -> ${target}`, conflicts, steps };
}

export function planTagRename(root: string, from: string, to: string, today: string, reason?: string): Plan {
  return planTagReplace(root, "tags-rename", [from], to, today, reason);
}

export function planTagMerge(
  root: string,
  sources: readonly string[],
  into: string,
  today: string,
  reason?: string,
): Plan {
  return planTagReplace(root, "tags-merge", sources.filter((s) => s !== into), into, today, reason);
}

export function planTitle(root: string, domain: string, title: string): Plan {
  const conflicts = listDomains(root).includes(domain) ? [] : [`unknown domain "${domain}"`];
  return {
    title: `title ${domain}`,
    conflicts,
    steps: [
      {
        describe: `domains/${domain}/domain.yaml: display_name = "${title}"`,
        run: () => updateDomainYaml(root, domain, { display_name: title }),
      },
    ],
  };
}
