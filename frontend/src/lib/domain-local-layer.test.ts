import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// The human-authored layer under `domains/<d>/` (studies/, discussions/) is read
// as real files, next to the virtual views derived from `runs/`. These tests
// build a throwaway research tree and point the modules at it via process.cwd(),
// which both modules read once at import time.

type DomainView = typeof import("./domain-view");
type ContentIndex = typeof import("./content-index");

let tmpRoot: string;
let domainView: DomainView;
let contentIndex: ContentIndex;

function write(relative: string, content: string): void {
  const full = path.join(tmpRoot, "research", relative);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

beforeAll(async () => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "research-layer-"));
  write("runs/demo/clustering/20260101/index.md", "# Clustering\n");
  write("runs/demo/retrieval/20260101/all/01-paper.md", "# Paper\n");
  write("domains/demo/README.md", "# Demo\n");
  write("domains/demo/studies/20260201-playbook/index.md", "# Playbook\n");
  write("domains/demo/discussions/20260301-paper-review.md", "# Review\n");
  // `latest*` is an alias name only in runs/; here it is an ordinary file name.
  write("domains/demo/studies/20260201-playbook/latest_benchmark.md", "# Benchmark\n");
  // A symlink view, as dev/sync-domain-links would create it.
  fs.symlinkSync(
    "../../runs/demo/clustering/20260101",
    path.join(tmpRoot, "research/domains/demo/clustering"),
  );

  vi.spyOn(process, "cwd").mockReturnValue(tmpRoot);
  vi.resetModules();
  domainView = await import("./domain-view");
  contentIndex = await import("./content-index");
});

afterAll(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("domain view listing", () => {
  it("lists virtual views, then real directories, then real Markdown files", () => {
    const names = domainView
      .listDomainViewEntries(["domains", "demo"])
      ?.map((e) => `${e.name}:${e.isDirectory ? "dir" : "file"}`);
    expect(names).toEqual([
      "clustering:dir",
      "reports:dir",
      "discussions:dir",
      "studies:dir",
      "README:file",
    ]);
  });

  it("treats human-authored directories as real directories", () => {
    expect(domainView.isDomainViewDirectory(["domains", "demo", "studies"])).toBe(true);
    expect(
      domainView.isDomainViewDirectory(["domains", "demo", "studies", "20260201-playbook"]),
    ).toBe(true);
    expect(domainView.isDomainViewDirectory(["domains", "demo", "missing"])).toBe(false);
  });

  it("does not redirect human-authored paths into runs/", () => {
    expect(domainView.resolveDomainSlug(["domains", "demo", "studies", "x"])).toBeNull();
    expect(domainView.listDomainViewEntries(["domains", "demo", "discussions"])).toBeNull();
  });
});

describe("content index", () => {
  it("indexes studies and discussions with their phase and date", () => {
    const byHref = new Map(
      contentIndex.getContentEntries().map((e) => [e.href, e] as const),
    );

    const study = byHref.get("/research/domains/demo/studies/20260201-playbook/index");
    expect(study).toMatchObject({ domain: "demo", phase: "studies", runDate: "20260201" });
    expect(study?.cluster).toBeUndefined();

    const discussion = byHref.get("/research/domains/demo/discussions/20260301-paper-review");
    expect(discussion).toMatchObject({
      domain: "demo",
      phase: "discussions",
      runDate: "20260301",
    });
  });

  it("indexes latest*-named files in the human-authored layer", () => {
    const hrefs = contentIndex.getContentEntries().map((e) => e.href);
    expect(hrefs).toContain(
      "/research/domains/demo/studies/20260201-playbook/latest_benchmark",
    );
  });

  it("does not index the symlink views or domain-level README", () => {
    const hrefs = contentIndex.getContentEntries().map((e) => e.href);
    expect(hrefs.filter((h) => h.startsWith("/research/domains/demo/clustering"))).toEqual([]);
    expect(hrefs).not.toContain("/research/domains/demo/README");
  });

  it("counts the human-authored layers in the domain summary", () => {
    const summary = contentIndex.getDomainSummaries().find((s) => s.domain === "demo");
    expect(summary?.phaseCounts).toEqual({
      gather: 0,
      retrieval: 1,
      clustering: 1,
      studies: 2,
      discussions: 1,
    });
    expect(summary?.latestRunDate).toBe("20260301");
  });
});
