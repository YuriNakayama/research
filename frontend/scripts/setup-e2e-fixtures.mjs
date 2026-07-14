#!/usr/bin/env node
// E2E fixture bootstrap.
//
// Playwright specs assert against specific routes (e.g. the `_e2e_fixture`
// directory listing and a known report). The real `research/` tree evolves as
// `research/runs/<domain>/<phase>/<date>/`, so the fixture below reintroduces a
// deterministic anchor that the specs can rely on without having to track the
// evolving research layout.
//
// Run this BEFORE `next build` so that `generateStaticParams` (which runs at
// build time with `dynamicParams = false`) sees the fixture routes.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_ROOT = path.join(__dirname, "..", "research");
const REPORT_DIR = path.join(RESEARCH_ROOT, "_e2e_fixture", "legal_tech", "report");
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

## Results

Benchmark scores across legal NLP tasks (used by the resizable-table E2E test):

| Model | Summarization | Argument Mining | Retrieval |
|-------|---------------|-----------------|-----------|
| BERT-Legal | 78.2% | 71.5% | 65.9% |
| Longformer | 81.4% | 69.8% | 70.1% |
| GPT-4 | 84.7% | 76.3% | 73.4% |

## Conclusion

This survey highlights the growing importance of NLP in the legal domain.
`;

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(REPORT_PATH, FIXTURE_REPORT, "utf-8");
console.log(`[e2e-fixtures] wrote ${path.relative(process.cwd(), REPORT_PATH)}`);
