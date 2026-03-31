import fs from "node:fs";
import path from "node:path";

const DOCS_ROOT = path.join(process.cwd(), "docs");

const SCAN_DIRS = ["research", "daily"] as const;

const IGNORED_NAMES = new Set(["node_modules", ".git", ".DS_Store"]);

export type TreeNode = {
  name: string;
  path: string;
  isDirectory: boolean;
  children: TreeNode[];
};

export type Breadcrumb = {
  label: string;
  href: string;
};

export type DocContent = {
  content: string;
  title: string;
  metadata: Record<string, string>;
};

function validateSlug(slug: string[]): void {
  for (const segment of slug) {
    if (
      segment === ".." ||
      segment === "." ||
      segment.includes("/") ||
      segment.includes("\\") ||
      segment.includes("\0")
    ) {
      throw new Error(`Invalid slug segment: ${segment}`);
    }
  }
}

function resolveDocsPath(slug: string[]): string {
  validateSlug(slug);
  const resolved = path.resolve(DOCS_ROOT, ...slug);
  if (!resolved.startsWith(DOCS_ROOT + path.sep) && resolved !== DOCS_ROOT) {
    throw new Error("Path traversal detected");
  }
  return resolved;
}

function stripMdExtension(name: string): string {
  return name.replace(/\.md$/, "");
}

function isMarkdownFile(name: string): boolean {
  return name.endsWith(".md");
}

function shouldInclude(name: string): boolean {
  return !IGNORED_NAMES.has(name) && !name.startsWith(".");
}

export function getRootEntries(): { name: string; isDirectory: boolean; slug: string[] }[] {
  return SCAN_DIRS.filter((dir) => fs.existsSync(path.join(DOCS_ROOT, dir))).map(
    (dir) => ({ name: dir, isDirectory: true, slug: [dir] }),
  );
}

export function getDocsTree(): TreeNode[] {
  return SCAN_DIRS.filter((dir) => fs.existsSync(path.join(DOCS_ROOT, dir))).map(
    (dir) => buildTree(path.join(DOCS_ROOT, dir), dir, `/docs/${dir}`),
  );
}

function buildTree(fullPath: string, name: string, urlPath: string): TreeNode {
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  const children: TreeNode[] = [];

  const sorted = entries
    .filter((e) => shouldInclude(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (const entry of sorted) {
    if (entry.isDirectory()) {
      children.push(
        buildTree(
          path.join(fullPath, entry.name),
          entry.name,
          `${urlPath}/${entry.name}`,
        ),
      );
    } else if (isMarkdownFile(entry.name)) {
      const slug = stripMdExtension(entry.name);
      children.push({
        name: slug,
        path: `${urlPath}/${slug}`,
        isDirectory: false,
        children: [],
      });
    }
  }

  return { name, path: urlPath, isDirectory: true, children };
}

export function getAllDocsSlugs(): string[][] {
  const slugs: string[][] = [];

  for (const dir of SCAN_DIRS) {
    const dirPath = path.join(DOCS_ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;
    collectSlugs(dirPath, [dir], slugs);
  }

  return slugs;
}

function collectSlugs(dirPath: string, prefix: string[], slugs: string[][]): void {
  // Add directory itself as a slug (for index pages)
  slugs.push([...prefix]);

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!shouldInclude(entry.name)) continue;

    if (entry.isDirectory()) {
      collectSlugs(path.join(dirPath, entry.name), [...prefix, entry.name], slugs);
    } else if (isMarkdownFile(entry.name)) {
      slugs.push([...prefix, stripMdExtension(entry.name)]);
    }
  }
}

export function getDocContent(slug: string[]): DocContent | null {
  const mdPath = resolveDocsPath([...slug.slice(0, -1), `${slug[slug.length - 1]}.md`]);

  if (!fs.existsSync(mdPath) || !fs.statSync(mdPath).isFile()) {
    return null;
  }

  const content = fs.readFileSync(mdPath, "utf-8");
  const title = extractTitle(content);
  const metadata = extractMetadata(content);

  return { content, title, metadata };
}

export function isDirectory(slug: string[]): boolean {
  const fullPath = resolveDocsPath(slug);
  return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
}

export function getDirectoryEntries(
  slug: string[],
): { name: string; isDirectory: boolean; slug: string[] }[] {
  const fullPath = resolveDocsPath(slug);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) return [];

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  return entries
    .filter((e) => shouldInclude(e.name))
    .filter((e) => e.isDirectory() || isMarkdownFile(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    })
    .map((e) => ({
      name: e.isDirectory() ? e.name : stripMdExtension(e.name),
      isDirectory: e.isDirectory(),
      slug: [...slug, e.isDirectory() ? e.name : stripMdExtension(e.name)],
    }));
}

export function getBreadcrumbs(slug: string[]): Breadcrumb[] {
  const crumbs: Breadcrumb[] = [{ label: "Docs", href: "/docs" }];

  for (let i = 0; i < slug.length; i++) {
    crumbs.push({
      label: slug[i],
      href: `/docs/${slug.slice(0, i + 1).join("/")}`,
    });
  }

  return crumbs;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "Untitled";
}

function extractMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/);
    if (match) {
      metadata[match[1].toLowerCase()] = match[2].trim();
    }
    if (metadata["link"] && line.startsWith("## ")) break;
  }

  return metadata;
}
