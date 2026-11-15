import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findBrokenLinks, runCheck } from "./check";
import { readDomainYaml, readRedirects, readTags } from "./meta";
import { applyPlan } from "./plan";
import { previousPaths, resolveRedirect } from "./redirects";
import { planRelocate } from "./relocate";
import { buildReport } from "./report";
import { compareRunDirs, nextFreeRunDir, sortRunDirsDesc } from "./run-dirs";
import { planTagMerge, planTagRename, planTagSet, planTitle } from "./tag-ops";
import { readLatest } from "./tree";

const TODAY = "2026-11-16";
let root: string;

function write(rel: string, content: string): void {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

function link(rel: string, target: string): void {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.symlinkSync(target, abs);
}

function read(rel: string): string {
  return fs.readFileSync(path.join(root, rel), "utf-8");
}

function exists(rel: string): boolean {
  return fs.existsSync(path.join(root, rel));
}

// Two domains that both ran clustering on the same date, with cross-links
// through `latest`, a concrete date, an absolute /research URL (from a
// hand-written README.md) and a link from another domain's run.
function seed(): void {
  write("_meta/tags.yaml", "- id: games\n  label: Games\n- id: rl\n  label: RL\n- id: ml\n  label: ML\n");
  write("domains/a/domain.yaml", "domain: a\ndisplay_name: Domain A\ntags: [games]\ntags_reviewed: 2026-01-05\n");
  write("domains/b/domain.yaml", "# keep me\ndomain: b\ndisplay_name: Domain B\ntags: [rl]\nclusters:\n  - id: c2\n");
  write("runs/a/clustering/20260101/index.md", "# A map\n");
  link("runs/a/clustering/latest", "20260101");
  write(
    "runs/a/gather/20260101/c1/resources.md",
    "# R\n\n[latest](../../../clustering/latest/index.md) [dated](../../../clustering/20260101/index.md#top) https://arxiv.org/abs/2401.00001\n",
  );
  link("runs/a/gather/latest", "20260101");
  write("runs/b/clustering/20260101/index.md", "# B map\n");
  link("runs/b/clustering/latest", "20260101");
  write("runs/b/gather/20260101/c2/r.md", "# R2 https://arxiv.org/pdf/2401.00001v2\n");
  link("runs/b/gather/latest", "20260101");
  write("domains/a/README.md", "# About A\n\n[res](/research/runs/a/gather/20260101/c1/resources)\n");
  write("runs/b/gather/20260101/c2/see-a.md", "# D\n\n[map](../../../../a/clustering/20260101/index.md)\n");
  link("domains/a/clustering", "../../runs/a/clustering/latest");
  fs.mkdirSync(path.join(root, "domains/a/resources"), { recursive: true });
  link("domains/a/resources/c1", "../../../runs/a/gather/20260101/c1");
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "ra-test-"));
  seed();
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("run-dirs", () => {
  it("orders by date then sequence", () => {
    expect(sortRunDirsDesc(["20260101", "20260101-10", "20260101-2", "20251231"])).toEqual([
      "20260101-10",
      "20260101-2",
      "20260101",
      "20251231",
    ]);
    expect(compareRunDirs("20260101", "20260101-2")).toBeLessThan(0);
    expect(nextFreeRunDir("20260101", new Set(["20260101", "20260101-2"]))).toBe("20260101-3");
  });
});

describe("redirects", () => {
  const redirects = [
    { from: "runs/a", to: "runs/b", change: "c1" },
    { from: "runs/a/clustering/20260101", to: "runs/b/clustering/20260101-2", change: "c1" },
    { from: "runs/b", to: "runs/c", change: "c2" },
  ];

  it("uses the longest prefix and follows chains", () => {
    expect(resolveRedirect("runs/a/gather/x", redirects)).toBe("runs/c/gather/x");
    expect(resolveRedirect("runs/a/clustering/20260101/index", redirects)).toBe("runs/c/clustering/20260101-2/index");
    expect(resolveRedirect("runs/ab/x", redirects)).toBeNull();
  });

  it("finds earlier paths of a document", () => {
    const prev = previousPaths("runs/c/clustering/20260101-2/index", redirects);
    expect(prev).toContain("runs/b/clustering/20260101-2/index");
    expect(prev).toContain("runs/a/clustering/20260101/index");
  });

  it("detects cycles", () => {
    const cyclic = [
      { from: "x", to: "y", change: "c" },
      { from: "y", to: "x", change: "c" },
    ];
    expect(() => resolveRedirect("x/1", cyclic)).toThrow();
  });
});

describe("merge", () => {
  it("moves runs and the human layer, renumbers colliding dates and rewrites links", () => {
    const plan = planRelocate({ root, op: "merge", sources: ["a"], dest: "b", today: TODAY, reason: "same topic" });
    expect(plan.conflicts).toEqual([]);
    const result = applyPlan(root, plan, plan.remap);
    expect(result.error).toBeUndefined();
    expect(result.ok).toBe(true);

    expect(exists("runs/a")).toBe(false);
    expect(exists("domains/a")).toBe(false);
    expect(read("runs/b/clustering/20260101-2/index.md")).toBe("# A map\n");
    expect(readLatest(root, "b", "clustering")).toBe("20260101-2");

    // `latest` is pinned to the run it meant, then moved.
    const res = read("runs/b/gather/20260101/c1/resources.md");
    expect(res).toContain("](../../../clustering/20260101-2/index.md)");
    expect(res).toContain("](../../../clustering/20260101-2/index.md#top)");

    expect(read("domains/b/README.md")).toContain("](/research/runs/b/gather/20260101/c1/resources)");
    expect(read("runs/b/gather/20260101/c2/see-a.md")).toContain("](../../../clustering/20260101-2/index.md)");

    const yaml = readDomainYaml(root, "b");
    expect(yaml?.tags).toEqual(["rl", "games"]);
    expect(yaml?.tags_reviewed).toBeUndefined();
    expect(read("domains/b/domain.yaml")).toContain("# keep me");

    const redirects = readRedirects(root);
    expect(resolveRedirect("runs/a/clustering/20260101/index", redirects)).toBe("runs/b/clustering/20260101-2/index");
    expect(resolveRedirect("domains/a/README", redirects)).toBe("domains/b/README");
    expect(exists("_meta/changes/20261116-merge-b.yaml")).toBe(true);
    expect(findBrokenLinks(root)).toEqual([]);
    expect(runCheck(root).filter((i) => i.level === "error")).toEqual([]);
  });

  it("reports colliding human-layer files as conflicts", () => {
    write("domains/b/README.md", "# other\n");
    const plan = planRelocate({ root, op: "merge", sources: ["a"], dest: "b", today: TODAY });
    expect(plan.conflicts.join("\n")).toContain("domains/b/README.md already exists");
    expect(applyPlan(root, plan).ok).toBe(false);
    expect(exists("runs/a")).toBe(true);
  });
});

describe("rename", () => {
  it("moves the whole domain and keeps latest links as latest", () => {
    const plan = planRelocate({ root, op: "rename", sources: ["a"], dest: "c", today: TODAY });
    expect(plan.conflicts).toEqual([]);
    expect(applyPlan(root, plan, plan.remap).ok).toBe(true);

    expect(read("runs/c/gather/20260101/c1/resources.md")).toContain("](../../../clustering/latest/index.md)");
    expect(read("domains/c/README.md")).toContain("/research/runs/c/gather/20260101/c1/resources");
    expect(readDomainYaml(root, "c")).toMatchObject({ domain: "c", display_name: "Domain A", tags: ["games"] });
    expect(resolveRedirect("domains/a/reports/c1", readRedirects(root))).toBe("domains/c/reports/c1");
    expect(runCheck(root).filter((i) => i.level === "error")).toEqual([]);
  });
});

describe("split", () => {
  it("moves selected runs into a new domain", () => {
    const plan = planRelocate({
      root,
      op: "split",
      sources: ["a"],
      dest: "d",
      paths: ["runs/a/gather/20260101/c1"],
      title: "Domain D",
      today: TODAY,
    });
    expect(plan.conflicts).toEqual([]);
    expect(applyPlan(root, plan, plan.remap).ok).toBe(true);

    expect(exists("runs/d/gather/20260101/c1/resources.md")).toBe(true);
    // The moved file now points back into domain a, pinned to the concrete run.
    expect(read("runs/d/gather/20260101/c1/resources.md")).toContain("](../../../../a/clustering/20260101/index.md)");
    expect(read("domains/a/README.md")).toContain("/research/runs/d/gather/20260101/c1/resources");
    expect(readDomainYaml(root, "d")).toMatchObject({ domain: "d", display_name: "Domain D", tags: ["games"] });
    expect(readDomainYaml(root, "a")?.tags_reviewed).toBeUndefined();
    expect(exists("runs/a/gather/latest")).toBe(false);
    expect(runCheck(root).filter((i) => i.level === "error")).toEqual([]);
  });
});

describe("tags", () => {
  it("sets tags and stamps the review date", () => {
    const plan = planTagSet(root, "b", ["rl", "ml"], TODAY);
    expect(applyPlan(root, plan).ok).toBe(true);
    expect(readDomainYaml(root, "b")).toMatchObject({ tags: ["rl", "ml"] });
    expect(read("domains/b/domain.yaml")).toContain("tags_reviewed: 2026-11-16");
  });

  it("rejects unknown tags", () => {
    expect(planTagSet(root, "b", ["nope"], TODAY).conflicts).toHaveLength(1);
  });

  it("renames an id everywhere and keeps the label", () => {
    expect(applyPlan(root, planTagRename(root, "games", "game_ai", TODAY)).ok).toBe(true);
    expect(readTags(root).map((t) => t.id)).toEqual(["game_ai", "ml", "rl"]);
    expect(readDomainYaml(root, "a")?.tags).toEqual(["game_ai"]);
  });

  it("merges ids and records the old labels as aliases", () => {
    expect(applyPlan(root, planTagMerge(root, ["games", "rl"], "ml", TODAY)).ok).toBe(true);
    const ml = readTags(root).find((t) => t.id === "ml");
    expect(ml?.aliases).toEqual(["Games", "RL"]);
    expect(readDomainYaml(root, "a")?.tags).toEqual(["ml"]);
    expect(readDomainYaml(root, "b")?.tags).toEqual(["ml"]);
  });

  it("changes the display name only", () => {
    expect(applyPlan(root, planTitle(root, "a", "New A")).ok).toBe(true);
    expect(readDomainYaml(root, "a")?.display_name).toBe("New A");
    expect(exists("runs/a")).toBe(true);
  });
});

describe("report", () => {
  it("flags stale tags and URL overlap", () => {
    const report = buildReport(root);
    const a = report.domains.find((d) => d.domain === "a");
    const b = report.domains.find((d) => d.domain === "b");
    expect(a?.tagsStale).toBe(false);
    expect(b?.tagsStale).toBe(true);
    expect(report.overlaps[0]).toMatchObject({ a: "a", b: "b", sharedUrls: 1 });
  });
});

describe("review fixes", () => {
  it("pins the destination's own latest links when a merge changes its newest run", () => {
    write("runs/b/clustering/20260101/cluster-01.md", "# B old\n");
    write("runs/b/gather/20260101/c2/notes.md", "[c](../../../clustering/latest/cluster-01.md)\n");
    write("runs/a/clustering/20260201/cluster-01.md", "# A new\n");
    fs.rmSync(path.join(root, "runs/a/clustering/latest"));
    link("runs/a/clustering/latest", "20260201");
    const plan = planRelocate({ root, op: "merge", sources: ["a"], dest: "b", today: TODAY });
    expect(plan.steps.map((s) => s.describe).join("\n")).toContain(
      "runs/b/clustering/latest 20260101 -> 20260201",
    );
    expect(applyPlan(root, plan, plan.remap).ok).toBe(true);
    expect(read("runs/b/gather/20260101/c2/notes.md")).toContain("](../../../clustering/20260101/cluster-01.md)");
  });

  it("records concrete redirects for a merged domain's aliases", () => {
    const plan = planRelocate({ root, op: "merge", sources: ["a"], dest: "b", today: TODAY });
    expect(applyPlan(root, plan, plan.remap).ok).toBe(true);
    const redirects = readRedirects(root);
    expect(resolveRedirect("runs/a/clustering/latest/index", redirects)).toBe("runs/b/clustering/20260101-2/index");
    expect(resolveRedirect("domains/a/clustering/index", redirects)).toBe("runs/b/clustering/20260101-2/index");
    expect(resolveRedirect("domains/a/resources/c1/resources", redirects)).toBe(
      "runs/b/gather/20260101/c1/resources",
    );
    expect(runCheck(root).filter((i) => i.level === "error")).toEqual([]);
  });

  it("renames a domain whose pages link through the domains/ view", () => {
    write("runs/b/gather/20260101/c2/view.md", "[v](/research/domains/a/clustering/index)\n");
    const plan = planRelocate({ root, op: "rename", sources: ["a"], dest: "z", today: TODAY });
    const result = applyPlan(root, plan, plan.remap);
    expect(result.error).toBeUndefined();
    expect(read("runs/b/gather/20260101/c2/view.md")).toContain("](/research/domains/z/clustering/index)");
  });

  it("rewrites percent-encoded absolute links without double encoding", () => {
    write("runs/a/clustering/20260101/日本.md", "# JP\n");
    write("runs/b/gather/20260101/c2/enc.md", "[j](/research/runs/a/clustering/20260101/%E6%97%A5%E6%9C%AC.md)\n");
    const plan = planRelocate({ root, op: "rename", sources: ["a"], dest: "z", today: TODAY });
    expect(applyPlan(root, plan, plan.remap).ok).toBe(true);
    expect(read("runs/b/gather/20260101/c2/enc.md")).toContain(
      "](/research/runs/z/clustering/20260101/%E6%97%A5%E6%9C%AC.md)",
    );
  });

  it("leaves link-like text in code untouched", () => {
    const code = "```\nh[t](phi(x))\n[a](../../../clustering/20260101/index.md)\n```\n`[b](x.md)`\n";
    write("runs/a/gather/20260101/c1/code.md", code);
    expect(findBrokenLinks(root)).toEqual([]);
    const plan = planRelocate({ root, op: "merge", sources: ["a"], dest: "b", today: TODAY });
    expect(applyPlan(root, plan, plan.remap).ok).toBe(true);
    expect(read("runs/b/gather/20260101/c1/code.md")).toBe(code);
  });

  it("rejects split paths with dot segments or latest", () => {
    for (const p of ["runs/a/gather/..", "runs/a/clustering/latest", "runs/a//gather"]) {
      const plan = planRelocate({ root, op: "split", sources: ["a"], dest: "d", paths: [p], today: TODAY });
      expect(plan.conflicts.length).toBeGreaterThan(0);
    }
  });

  it("does not redirect paths with dot segments", () => {
    const redirects = [{ from: "runs/a", to: "runs/b", change: "c" }];
    expect(resolveRedirect("runs/a/../../_meta/redirects.yaml", redirects)).toBeNull();
    expect(resolveRedirect("runs/a/x\\y", redirects)).toBeNull();
    expect(previousPaths("runs/b/../x", redirects)).toEqual([]);
  });
});
