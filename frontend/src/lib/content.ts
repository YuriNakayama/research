import fs from "node:fs";
import path from "node:path";

const DOCS_ROOT = path.join(process.cwd(), "..", "docs");

export interface ReportFile {
  domain: string;
  slug: string;
  filePath: string;
  fileName: string;
}

export function getDomains(): string[] {
  const dailyDir = path.join(DOCS_ROOT, "daily");
  if (!fs.existsSync(dailyDir)) return [];
  return fs
    .readdirSync(dailyDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "README.md")
    .map((d) => d.name);
}

export function getReportFiles(domain: string): ReportFile[] {
  const reports: ReportFile[] = [];

  // Daily reports
  const dailyReportDir = path.join(DOCS_ROOT, "daily", domain, "report");
  if (fs.existsSync(dailyReportDir)) {
    for (const file of fs.readdirSync(dailyReportDir)) {
      if (file.endsWith(".md")) {
        reports.push({
          domain,
          slug: file.replace(/\.md$/, ""),
          filePath: path.join(dailyReportDir, file),
          fileName: file,
        });
      }
    }
  }

  // Research reports
  const researchReportDir = path.join(DOCS_ROOT, "research", domain, "report");
  if (fs.existsSync(researchReportDir)) {
    for (const file of fs.readdirSync(researchReportDir)) {
      if (file.endsWith(".md")) {
        reports.push({
          domain,
          slug: file.replace(/\.md$/, ""),
          filePath: path.join(researchReportDir, file),
          fileName: file,
        });
      }
    }
  }

  return reports.sort((a, b) => b.slug.localeCompare(a.slug));
}

export function getReportContent(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

export function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : "Untitled";
}

export function extractMetadata(content: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^-\s+\*\*(.+?)\*\*:\s*(.+)$/);
    if (match) {
      metadata[match[1].toLowerCase()] = match[2].trim();
    }
    // Stop after reaching the first heading (past metadata block)
    if (metadata["link"] && line.startsWith("## ")) break;
  }

  return metadata;
}
