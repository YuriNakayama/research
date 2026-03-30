import fs from "node:fs";
import path from "node:path";

const DOCS_ROOT = path.join(process.cwd(), "..", "docs");

export interface CsvReportItem {
  title: string;
  url: string;
  authors: string;
  year: string;
  venue: string;
  summary: string;
  status: string;
}

export function parseCsvFile(filePath: string): CsvReportItem[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const items: CsvReportItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < headers.length) continue;

    const item: Record<string, string> = {};
    headers.forEach((header, idx) => {
      item[header] = values[idx] ?? "";
    });

    items.push({
      title: item.title ?? "",
      url: item.url ?? "",
      authors: item.authors ?? "",
      year: item.year ?? "",
      venue: item.venue ?? "",
      summary: item.summary ?? "",
      status: item.status ?? "",
    });
  }

  return items;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

export function getCsvFiles(domain: string): string[] {
  const listDir = path.join(DOCS_ROOT, "daily", domain, "list");
  if (!fs.existsSync(listDir)) return [];
  return fs
    .readdirSync(listDir)
    .filter((f) => f.endsWith(".csv"))
    .sort()
    .reverse()
    .map((f) => path.join(listDir, f));
}

export function getAllReportMetadata(
  domain: string,
): (CsvReportItem & { date: string })[] {
  const csvFiles = getCsvFiles(domain);
  const allItems: (CsvReportItem & { date: string })[] = [];

  for (const csvFile of csvFiles) {
    const date = path.basename(csvFile, ".csv");
    const items = parseCsvFile(csvFile);
    for (const item of items) {
      if (item.status === "done") {
        allItems.push({ ...item, date });
      }
    }
  }

  return allItems;
}
