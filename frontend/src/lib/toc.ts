export interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Slugify a heading's text into an anchor id. This is the single source of
// truth for heading ids: both the TOC (extractTocItems) and the rendered
// headings (MarkdownRenderer) must use it so `href="#id"` targets exist.
export function slugify(text: string): string {
  return text
    .replace(/[*_`]/g, "")
    .toLowerCase()
    .replace(/[^\w\u3000-\u9fff\uff00-\uffef]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Track how many times each base slug has been seen so repeated headings get
// unique ids (`slug`, `slug-1`, `slug-2`, \u2026). Mirrors the disambiguation the
// TOC and the renderer both need. Callers share one instance per document.
export function createSlugger(): (text: string) => string {
  const counts = new Map<string, number>();
  return (text: string) => {
    const base = slugify(text);
    const count = counts.get(base) ?? 0;
    counts.set(base, count + 1);
    return count > 0 ? `${base}-${count}` : base;
  };
}

export function extractTocItems(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split("\n");
  const slugger = createSlugger();

  for (const line of lines) {
    const match = line.match(/^(#{2,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, "");
      const id = slugger(text);
      items.push({ id, text, level });
    }
  }

  return items;
}
