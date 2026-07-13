// Validates every ```mermaid code block in the research tree by running it through
// mermaid's own parser (the same library the viewer uses at runtime, pinned to
// the same version). A broken diagram renders as "Syntax error in text" in the
// browser, so catching it here keeps the published site free of broken figures.
//
// mermaid.parse needs a DOM, so we set up jsdom globals before importing it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.Node = dom.window.Node;
globalThis.Element = dom.window.Element;

const { default: mermaid } = await import("mermaid");
mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.resolve(process.argv[2] ?? path.join(HERE, "..", "..", "research"));

const BLOCK_RE = /```mermaid\r?\n([\s\S]*?)```/g;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function extractBlocks(md) {
  const blocks = [];
  let m;
  while ((m = BLOCK_RE.exec(md))) {
    blocks.push({ code: m[1], line: md.slice(0, m.index).split("\n").length });
  }
  return blocks;
}

const files = walk(DOCS_ROOT);
const failures = [];
let total = 0;

for (const file of files) {
  const md = fs.readFileSync(file, "utf8");
  for (const block of extractBlocks(md)) {
    total++;
    try {
      await mermaid.parse(block.code);
    } catch (err) {
      const msg = (err instanceof Error ? err.message : String(err))
        .split("\n")
        .slice(0, 4)
        .join("\n    ");
      failures.push({ file: path.relative(DOCS_ROOT, file), line: block.line, msg });
    }
  }
}

const rel = path.relative(process.cwd(), DOCS_ROOT) || ".";
console.log(`Checked ${total} mermaid block(s) across ${files.length} markdown file(s) in ${rel}`);

if (failures.length > 0) {
  console.error(`\n✖ ${failures.length} mermaid block(s) failed to parse:\n`);
  for (const f of failures) {
    console.error(`  ${f.file}:${f.line}\n    ${f.msg}\n`);
  }
  process.exit(1);
}

console.log("✓ All mermaid blocks parsed successfully");
