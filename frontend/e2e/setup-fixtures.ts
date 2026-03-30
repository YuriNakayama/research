/**
 * E2E test fixture setup/teardown.
 * Creates temporary markdown report files under docs/ so pages render correctly.
 */
import fs from "node:fs";
import path from "node:path";

const DOCS_ROOT = path.join(__dirname, "..", "..", "docs");
const REPORT_DIR = path.join(DOCS_ROOT, "daily", "legal_tech", "report");

const FIXTURE_REPORT = `# Natural Language Processing for the Legal Domain

- **Authors**: Ferraro et al.
- **Year**: 2024
- **Venue**: arXiv
- **Link**: https://arxiv.org/abs/2410.21306

## Introduction

This survey provides a comprehensive overview of NLP applied to the legal domain.

## Legal NLP Tasks

### Document Summarization

Legal document summarization aims to condense lengthy legal texts into concise summaries.

### Argument Mining

Argument mining in legal texts involves identifying argumentative structures from court decisions.

## Mathematical Formulation

The precision of legal information retrieval can be expressed as:

$$
P = \\frac{TP}{TP + FP}
$$

where $TP$ represents true positives and $FP$ represents false positives.

## Conclusion

This survey highlights the growing importance of NLP in the legal domain.
`;

const createdFiles: string[] = [];

export function setupFixtures(): void {
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const reportPath = path.join(REPORT_DIR, "20260329.md");
  if (!fs.existsSync(reportPath)) {
    fs.writeFileSync(reportPath, FIXTURE_REPORT, "utf-8");
    createdFiles.push(reportPath);
  }
}

export function teardownFixtures(): void {
  for (const file of createdFiles) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  }
}
