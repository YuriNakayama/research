/**
 * DynamoDB sync script — run during Amplify build.
 * Reads CSV metadata and report files, then upserts to DynamoDB.
 */

import fs from "node:fs";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const DOCS_ROOT = path.join(process.cwd(), "..", "docs");
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const REGION = process.env.NEXT_PUBLIC_AWS_REGION ?? "ap-northeast-1";

if (!TABLE_NAME) {
  console.log("DYNAMODB_TABLE_NAME not set, skipping sync");
  process.exit(0);
}

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

interface CsvRow {
  title: string;
  url: string;
  authors: string;
  year: string;
  venue: string;
  summary: string;
  status: string;
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

function parseCsvFile(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));
    return row as unknown as CsvRow;
  });
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u3000-\u9fff\uff00-\uffef]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

async function syncDomain(domain: string): Promise<number> {
  const listDir = path.join(DOCS_ROOT, "daily", domain, "list");
  if (!fs.existsSync(listDir)) return 0;

  const csvFiles = fs
    .readdirSync(listDir)
    .filter((f) => f.endsWith(".csv"))
    .sort();

  let synced = 0;

  for (const csvFile of csvFiles) {
    const date = csvFile.replace(".csv", "");
    const rows = parseCsvFile(path.join(listDir, csvFile));

    for (const row of rows) {
      if (row.status !== "done" || !row.title) continue;

      const slug = slugify(row.title);
      const now = new Date().toISOString();

      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            pk: `DOMAIN#${domain}`,
            sk: `REPORT#${date}#${slug}`,
            title: row.title,
            url: row.url,
            authors: row.authors,
            year: row.year,
            venue: row.venue,
            summary: row.summary,
            report_path: `docs/daily/${domain}/report/${date}.md`,
            report_type: "daily",
            created_at: `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}T00:00:00Z`,
            updated_at: now,
          },
        }),
      );
      synced++;
    }
  }

  return synced;
}

async function main() {
  console.log("Starting DynamoDB sync...");
  const dailyDir = path.join(DOCS_ROOT, "daily");

  if (!fs.existsSync(dailyDir)) {
    console.log("No daily directory found, skipping");
    return;
  }

  const domains = fs
    .readdirSync(dailyDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let total = 0;
  for (const domain of domains) {
    const count = await syncDomain(domain);
    console.log(`  ${domain}: ${count} reports synced`);
    total += count;
  }

  console.log(`Sync complete: ${total} total reports`);
}

main().catch((err) => {
  console.error("DynamoDB sync failed:", err);
  console.log("Continuing build without sync (fallback to filesystem)");
});
