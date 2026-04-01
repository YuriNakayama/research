export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function extractTocItems(content: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = content.split("\n");
  const idCounts = new Map<string, number>();

  for (const line of lines) {
    const match = line.match(/^(#{2,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`]/g, "");
      let id = text
        .toLowerCase()
        .replace(/[^\w\u3000-\u9fff\uff00-\uffef]+/g, "-")
        .replace(/^-|-$/g, "");

      const count = idCounts.get(id) ?? 0;
      idCounts.set(id, count + 1);
      if (count > 0) {
        id = `${id}-${count}`;
      }

      items.push({ id, text, level });
    }
  }

  return items;
}
