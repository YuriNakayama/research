---
name: daily-add
description: Append one or more URLs (papers, patents, or articles) to the daily auto-research queue at `docs/daily/<domain>/list/inbox.csv`. Use this skill whenever the user wants to add candidate research targets to the daily pipeline — phrases like "daily に追加", "daily-add", "inbox に入れて", "この論文を daily で調べて", "これを調査対象に追加", "URL を daily のリストに追加", or when the user pastes one or more URLs alongside a daily domain name. Handles metadata extraction (title, authors, year, venue, summary, kind) via WebFetch and appends the rows safely without touching `docs/research/**`.
---

# Daily Add

Append candidate URLs to the daily research pipeline's input queue so that the next scheduled run will pick one of them up.

## What this skill does

Given a **domain name** and **one or more URLs**, this skill:

1. Appends skeleton rows to `docs/daily/<domain>/list/inbox.csv` via the `backend/scripts/daily_add.py` CLI.
2. Fetches each URL with `WebFetch` and extracts `title`, `authors`, `year`, `venue`, `summary` (1–2 sentence Japanese summary), and `kind` (`paper` / `patent` / `site`).
3. Overwrites the freshly appended rows with those LLM-extracted values by editing `inbox.csv`.
4. Reports what was added and what was skipped (duplicates) in Japanese.

The script handles URL normalization, duplicate detection, and the `added_at` / `status=pending` fields — you only need to provide the metadata.

## Hard rules

These rules preserve the append-only invariant of `inbox.csv` and the separation between the auto pipeline and the manual research area:

- **NEVER** edit any file under `docs/research/**`. This skill operates exclusively under `docs/daily/**`.
- **NEVER** modify or delete existing rows in `inbox.csv`. Only the rows you just appended (returned by the CLI's JSON output) may be edited, and even then only to fill in empty `title` / `authors` / `year` / `venue` / `summary` cells.
- **NEVER** change `status`, `added_at`, `url`, or `kind` of any row via `Edit`. Those are set by the CLI and must be preserved verbatim.
- If the user did not specify a domain, ask them before running anything. Do not guess.

## Workflow

### Step 1: Collect inputs

You need two things from the user (or from conversation context):

- **domain**: e.g. `data_analysis_agent`. This must correspond to an existing directory under `docs/daily/`.
- **urls**: one or more URLs. Accept a newline-separated list, a bulleted list, or inline text — extract cleanly before proceeding.

If the domain is missing, ask the user which daily domain to add to. You can list existing domains with `Glob: docs/daily/*/list/inbox.csv` to help them choose.

### Step 2: Fetch and extract metadata

For each URL, call `WebFetch` and extract:

| Field | Notes |
|---|---|
| `title` | Original paper/article title. Preserve the source language. |
| `authors` | Comma-separated. Use "et al." for papers with >3 authors. Empty string if not applicable (e.g. blog posts). |
| `year` | 4-digit publication year. Empty if unknown. |
| `venue` | Conference/journal name for papers (e.g. `arXiv`, `NeurIPS`, `ACL`), publication for articles, empty for generic sites. |
| `summary` | **1–2 sentences in Japanese** describing what the work is about and why it is interesting. Keep under ~120 characters. |
| `kind` | `paper` / `patent` / `site` — usually the CLI infers this correctly from the URL, but override if you see a clear mismatch. |

If a fetch fails, note the URL in your final report and skip metadata extraction for that row (the skeleton row will still exist with just the URL and `kind`).

### Step 3: Append skeleton rows via the CLI

Run the Python CLI via Bash:

```bash
printf '%s\n' "<url1>" "<url2>" "<url3>" \
  | uv run --project backend python backend/scripts/daily_add.py \
      --domain <domain> \
      --stdin
```

The CLI writes JSON to stdout like:

```json
{
  "csv_path": "/abs/path/docs/daily/<domain>/list/inbox.csv",
  "added": [
    {"row_index": 5, "url": "https://arxiv.org/abs/1", "kind": "paper"},
    {"row_index": 6, "url": "https://example.com/a", "kind": "site"}
  ],
  "skipped": [
    {"url": "https://dup.example", "reason": "already in csv"}
  ]
}
```

Parse this JSON. Note:

- `row_index` is **0-based over the data rows** (not the raw file line number — row 0 is the first CSV row after the header).
- `skipped` entries are already-present URLs you should NOT try to "fix" by editing.

### Step 4: Overwrite metadata in the appended rows

For each entry in `added`:

1. Use `Read` on `csv_path` to see the current state.
2. Identify the row by **matching on the `url` field** (safer than relying on index in case of concurrent edits).
3. Use `Edit` to replace the single line containing that URL with the fully populated row, preserving the CSV format:
   ```
   "<title>",<url>,"<authors>",<year>,"<venue>","<summary>",pending,<added_at>,<kind>
   ```
   - Keep `status`, `added_at`, `url`, and `kind` exactly as the CLI wrote them.
   - Always quote `title`, `authors`, `venue`, `summary` (CSV-escape any embedded `"` as `""`).

Do **not** use `Write` to rewrite the whole CSV — use targeted `Edit` calls per row so existing rows cannot possibly be touched.

### Step 5: Report to the user

Report in **Japanese** with this structure:

```
docs/daily/<domain>/list/inbox.csv に N 件追加しました。

追加:
  1. <title>
     URL: <url>
     概要: <summary>
  2. ...

スキップ: M 件（重複）
  - <url>
```

If any fetches failed, list them separately so the user can retry manually.

## Example

**User input:**
```
/daily-add data_analysis_agent
https://arxiv.org/abs/2410.12345
https://patents.google.com/patent/US11000000
```

**Skill behavior:**

1. Runs the CLI with both URLs → CLI appends 2 rows with `kind=paper` and `kind=patent` respectively and returns their indices/URLs.
2. `WebFetch` both URLs, extracts title/authors/year/venue/summary.
3. `Edit` each of the two new rows to fill in the metadata.
4. Reports:

```
docs/daily/data_analysis_agent/list/inbox.csv に 2 件追加しました。

追加:
  1. Multi-Agent Reasoning for Data Analysis
     URL: https://arxiv.org/abs/2410.12345
     概要: LLM マルチエージェントによるデータ分析タスクの推論フレームワーク。SQL生成と可視化を統合。
  2. System and method for automated data pipeline orchestration
     URL: https://patents.google.com/patent/US11000000
     概要: データパイプラインの自動編成に関する米国特許。依存関係推論と再試行ロジックを含む。

スキップ: 0 件
```

## Notes on the CLI

- Located at `backend/scripts/daily_add.py`. It is pure Python (no LLM calls) and is fully unit-tested in `backend/tests/test_daily_add.py`.
- URL normalization strips `utm_*` params, trailing slashes, and fragments before duplicate detection.
- `kind` inference: arXiv / aclanthology / openreview → `paper`; Google Patents / patentscope / espacenet → `patent`; else `site`.
- The CLI will create the CSV with a header row if it doesn't exist yet.
