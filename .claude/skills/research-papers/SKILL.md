---
name: research-papers
description: Takes a Markdown file containing a list of academic papers as input, researches each paper in detail, and generates a directory of individual Markdown files plus an index file. Use this skill for paper surveys, literature reviews, research paper deep-dives, and whenever the user says things like "research these papers", "survey this paper list", "create detailed summaries for each paper", or asks to investigate a list of academic papers. Also triggers on Japanese equivalents like "この論文リストを詳しく調べて", "各論文の詳細をまとめて", "サーベイして".
---

# Research Papers - Paper List Detail Generator

Takes a paper list (Markdown file) as input, researches detailed information for each paper, and outputs individual Markdown files + an index file.

## Workflow

### Step 1: Parse the input file

Read the Markdown file specified by the user and extract:

- Paper titles
- Links (arXiv, OpenReview, DOI, etc.)
- Classification categories (if present)
- Existing summaries (if present)

### Step 2: Collect detailed information for each paper

Use `WebFetch` to retrieve information from each paper's link. For arXiv papers, fetch the abstract page at `https://arxiv.org/abs/XXXX.XXXXX`. If only a PDF URL is available, convert it to the abstract page URL first (e.g., `arxiv.org/pdf/2401.11263v1.pdf` → `arxiv.org/abs/2401.11263`).

If fetching fails, fall back to combining existing information from the input file with `WebSearch` results.

### Step 3: User hearing (confirm output format)

After information collection is complete and before creating files, use the `AskUserQuestion` tool to confirm the user's preferences. All interactions with the user must use AskUserQuestion in selection format — do not ask free-text questions.

#### Hearing 1: Priority sections

First, confirm which sections the user wants to emphasize in each paper file.

```
AskUserQuestion:
  question: "各論文ファイルでどのセクションを重視しますか？（複数選択可）"
  header: "セクション"
  multiSelect: true
  options:
    - label: "提案手法の詳細"
      description: "アルゴリズムのステップ、数式、既存手法との差分を詳しく記述"
    - label: "実験・評価結果"
      description: "実験設定、ベースライン比較、定量的な結果を詳しく記述"
    - label: "課題と動機"
      description: "論文が解決する課題、研究の動機・背景を詳しく記述"
    - label: "実務への応用"
      description: "実務での活用方法、適用条件、実装上の注意点を記述"
    - label: "疑似コードによるアルゴリズム解説"
      description: "提案手法のアルゴリズムを疑似コード形式で記述し、各ステップを解説"
```

> **Note**: AskUserQuestion options are limited to a maximum of 4. Select the 4 most relevant options from the 5 above based on the input file content. For example, for a theory-heavy paper list, prioritize "疑似コードによるアルゴリズム解説" over "実務への応用".

#### Hearing 2: Detail level

Next, confirm the desired volume and detail level for each paper file.

```
AskUserQuestion:
  question: "各論文ファイルの詳細度はどのレベルにしますか？"
  header: "詳細度"
  multiSelect: false
  options:
    - label: "概要レベル（推奨）"
      description: "1論文あたり100〜200行。要点を簡潔にまとめる"
    - label: "詳細レベル"
      description: "1論文あたり200〜400行。手法の数式やアルゴリズムも含めて詳述"
    - label: "簡潔レベル"
      description: "1論文あたり50〜100行。Abstract・概要・手法名のみの最小構成"
```

#### Hearing 3: Additional options

Finally, confirm additional output options.

```
AskUserQuestion:
  question: "追加で含めたい要素はありますか？（複数選択可）"
  header: "追加要素"
  multiSelect: true
  options:
    - label: "論文間の関連性マップ"
      description: "index.mdに論文間の引用関係や手法の発展関係を記載"
    - label: "比較表"
      description: "index.mdに手法の特徴比較表（前提条件、対象、強み等）を追加"
    - label: "今後の調査候補"
      description: "各論文の参考文献から、追加調査すべき論文候補をリストアップ"
    - label: "特になし"
      description: "基本構成のみで出力"
```

Adjust the template section structure and detail level based on hearing results before proceeding to Step 4.

### Step 4: Create detailed Markdown files for each paper

Create 1 file per paper. Use the input file's ID (A1, B2, etc.) as a prefix if available, followed by a kebab-case short name of the paper.

Example: `A1-orthogonal-prediction.md`, `B1-b-learner.md`

#### Paper file template

```markdown
# {Paper title}

- **Link**: {URL}
- **Authors**: {Author list}
- **Year**: {Publication year}
- **Venue**: {Journal/Conference name}

## Abstract

{Original English abstract text}

## Abstract (Japanese translation)

{Japanese translation of the abstract. Preserve the original meaning accurately while writing natural Japanese}

## Overview

{Overview in Japanese. If the input file has an existing summary, use it as a base and enhance with fetched information. This should not be a mere repetition of the Abstract — organize and present the key points of the entire paper}

## Problem

{Problems the paper aims to solve, in list format}

- **{Problem name}**: {Description}

## Proposed Method

**{Method name}**

{Description of the method, organized from these perspectives:}

- Core idea of the method
- Main algorithm steps
- Differences from existing methods

**Features**:

- {Feature 1}
- {Feature 2}
- ...

## Algorithm (Pseudocode)

{Include only if "Pseudocode algorithm walkthrough" was selected in the hearing.
Present the algorithm from the paper in pseudocode format using Markdown code blocks, with Japanese explanations for each step}

```
Algorithm: {Method name}
Input: {Input}
Output: {Output}

1. {Step 1}    // {Explanation}
2. {Step 2}    // {Explanation}
...
```

## Figures & Tables

{This section is mandatory. Always include at least one visual representation per paper.
If images are obtainable from HTML versions of the paper, reference them as `![Figure description](image/{filename})`.
If images are not obtainable (which is common), create visualizations from the paper's content using:
- Markdown tables for comparison results, performance metrics, experimental data
- ASCII diagrams for architecture overviews, method workflows, conceptual relationships
- Code-block diagrams for algorithm flow, data pipelines, model structures
Aim to convey the key insights of the paper visually — e.g., how the proposed method compares to baselines, the overall architecture, or the relationship between components}

## Experiments & Evaluation

{Summarize experimental setup, comparison methods, and main results. Describe within the scope of information obtained}

## Notes

{Additional notable points, references to related work, practical usage tips, etc.}
```

Not all sections need to be filled. Describe within the scope of obtained information and omit sections where information is insufficient. However, the following sections are mandatory: Abstract (both English original + Japanese translation), Overview, Proposed Method, and Figures & Tables. The Figures & Tables section must always contain at least one visualization (Markdown table, ASCII diagram, or image reference). The Algorithm (Pseudocode) section should only be included when selected in the hearing.

### Step 5: Create the index file

Create `index.md` in the output directory. Respect the classification structure from the input file, and include links and concise summaries for all papers.

#### Index file template

```markdown
# {Research theme name}

## Scope

{Transcribe scope information from the input file if present}

## Paper List

### {Category A name}

| ID | Title | Year | Summary | File |
|----|-------|------|---------|------|
| A1 | {Title} | {Year} | {One-line summary} | [Details](A1-xxx.md) |

### {Category B name}

| ID | Title | Year | Summary | File |
|----|-------|------|---------|------|
| B1 | {Title} | {Year} | {One-line summary} | [Details](B1-xxx.md) |

...
```

### Step 6: Output confirmation

Present the list of created files to the user, then confirm via `AskUserQuestion`.

```
AskUserQuestion:
  question: "出力結果を確認してください。どうしますか？"
  header: "確認"
  multiSelect: false
  options:
    - label: "問題なし・完了"
      description: "現在の出力内容で確定する"
    - label: "特定の論文を修正"
      description: "指定した論文ファイルの内容を修正・補強する"
    - label: "全体の構成を変更"
      description: "セクション構成や詳細度を変更して再生成する"
    - label: "論文を追加調査"
      description: "参考文献等から追加の論文を調査してリストに加える"
```

If "特定の論文を修正" is selected, present a follow-up `AskUserQuestion` with paper titles dynamically listed as options.

## Output directory placement

Create the output directory in the same directory as the input file. Use the input filename (without extension) as the directory name.

Example: if input is `docs/research/cate/metalearner/papers-20260322.md`
→ output goes to `docs/research/cate/metalearner/papers-20260322/`

## Parallel processing

When there are many papers, use the Agent tool to fetch and create multiple papers in parallel. Be mindful of WebFetch rate limits and batch appropriately.

## Language

- All user-facing interactions (AskUserQuestion labels, descriptions, messages) must be in Japanese
- Output file content in Japanese
- Include both the original English abstract and Japanese translation
- Keep method names and proper nouns in their original language
