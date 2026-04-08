#!/usr/bin/env node
// E2E fixture bootstrap.
//
// Playwright specs assert against specific routes (e.g. the `daily/legal_tech`
// directory listing and a known report). The real `docs/` tree has been
// reorganised into `docs/research/runs/<domain>/<phase>/<date>/`, so the
// fixture below reintroduces a deterministic anchor that the specs can rely
// on without having to track the evolving research layout.
//
// Run this BEFORE `next build` so that `generateStaticParams` (which runs at
// build time with `dynamicParams = false`) sees the fixture routes.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_ROOT = path.join(__dirname, "..", "docs");
const REPORT_DIR = path.join(DOCS_ROOT, "daily", "legal_tech", "report");
const REPORT_PATH = path.join(REPORT_DIR, "20260329.md");

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

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, FIXTURE_REPORT, "utf-8");
console.log(`[e2e-fixtures] wrote ${path.relative(process.cwd(), REPORT_PATH)}`);
