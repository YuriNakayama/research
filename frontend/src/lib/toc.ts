export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractTocItems(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, "");
      const id = text
        .toLowerCase()
        .replace(/[^\w\u3000-\u9fff\uff00-\uffef]+/g, "-")
        .replace(/^-|-$/g, "");
      items.push({ id, text, level });
    }
  }

  return items;
}
