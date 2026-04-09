"""Append URL skeleton rows to ``docs/daily/<domain>/list/inbox.csv``.

This is a purely mechanical CSV appender used by the ``/daily-add`` skill.
It performs **no LLM calls**: the skill is responsible for fetching the URL
content and overwriting the title / authors / year / venue / summary cells
with LLM-extracted values after this script finishes.

Responsibilities:
  * Parse URLs from ``--urls-file`` or stdin (``--stdin``).
  * Normalize URLs (strip ``utm_*`` query params, drop trailing slash).
  * Skip URLs already present in the target CSV (append-only invariant
    for existing rows).
  * Infer ``kind`` from the URL (``paper`` / ``patent`` / ``site``).
  * Append new rows with ``status=pending`` and ``added_at=<today>``.
  * Emit a JSON report on stdout: added rows (with row index) and
    skipped duplicates.

Never touches ``docs/research/**``.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

CSV_FIELDNAMES = [
    "title",
    "url",
    "authors",
    "year",
    "venue",
    "summary",
    "status",
    "added_at",
    "kind",
]


@dataclass(frozen=True)
class AppendResult:
    added: list[dict[str, str | int]]
    skipped: list[dict[str, str]]
    csv_path: str

    def to_dict(self) -> dict[str, object]:
        return {
            "csv_path": self.csv_path,
            "added": self.added,
            "skipped": self.skipped,
        }


def normalize_url(url: str) -> str:
    """Normalize a URL for duplicate detection.

    * Lowercases scheme and host.
    * Removes ``utm_*`` query parameters.
    * Drops a single trailing slash from the path (but keeps ``/`` root).
    * Removes fragments.
    """
    parsed = urlparse(url.strip())
    if not parsed.scheme or not parsed.netloc:
        return url.strip()

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()

    path = parsed.path
    if len(path) > 1 and path.endswith("/"):
        path = path[:-1]

    query_pairs = [
        (k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True) if not k.lower().startswith("utm_")
    ]
    query = urlencode(query_pairs)

    return urlunparse((scheme, netloc, path, parsed.params, query, ""))


def infer_kind(url: str) -> str:
    """Infer ``kind`` from a URL.

    ``paper`` for arXiv / aclanthology / openreview,
    ``patent`` for Google Patents / patentscope / espacenet,
    ``site`` otherwise.
    """
    host = urlparse(url).netloc.lower()

    paper_hosts = ("arxiv.org", "aclanthology.org", "openreview.net")
    patent_hosts = ("patents.google.com", "patentscope.wipo.int", "worldwide.espacenet.com")

    if any(h in host for h in paper_hosts):
        return "paper"
    if any(h in host for h in patent_hosts):
        return "patent"
    return "site"


def _read_existing(csv_path: Path) -> tuple[list[dict[str, str]], set[str]]:
    """Return existing rows and the set of normalized URLs already present."""
    if not csv_path.exists():
        return [], set()
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    existing_norm = {normalize_url(r.get("url", "")) for r in rows if r.get("url")}
    return rows, existing_norm


def _write_rows(csv_path: Path, rows: list[dict[str, str]]) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


def append_urls(
    csv_path: Path,
    urls: list[str],
    today: str | None = None,
) -> AppendResult:
    """Append new URL rows to ``csv_path`` and return the result."""
    today = today or datetime.now(tz=UTC).strftime("%Y-%m-%d")

    existing_rows, existing_norm = _read_existing(csv_path)
    added: list[dict[str, str | int]] = []
    skipped: list[dict[str, str]] = []
    seen_in_batch: set[str] = set()

    next_index = len(existing_rows)

    for raw_url in urls:
        url = raw_url.strip()
        if not url:
            continue
        norm = normalize_url(url)
        if norm in existing_norm:
            skipped.append({"url": url, "reason": "already in csv"})
            continue
        if norm in seen_in_batch:
            skipped.append({"url": url, "reason": "duplicate in batch"})
            continue
        seen_in_batch.add(norm)

        row = {
            "title": "",
            "url": norm,
            "authors": "",
            "year": "",
            "venue": "",
            "summary": "",
            "status": "pending",
            "added_at": today,
            "kind": infer_kind(norm),
        }
        existing_rows.append(row)
        added.append({"row_index": next_index, "url": norm, "kind": row["kind"]})
        next_index += 1

    _write_rows(csv_path, existing_rows)

    return AppendResult(added=added, skipped=skipped, csv_path=str(csv_path))


def _read_urls_from_args(args: argparse.Namespace) -> list[str]:
    if args.stdin:
        return [line for line in sys.stdin.read().splitlines() if line.strip()]
    if args.urls_file:
        return [line for line in Path(args.urls_file).read_text(encoding="utf-8").splitlines() if line.strip()]
    raise SystemExit("error: must provide --stdin or --urls-file")


def _resolve_csv_path(domain: str, base_dir: Path | None, csv_file: str) -> Path:
    if base_dir is None:
        # Default: <repo root>/docs/daily/<domain>/list/<csv_file>
        # repo root is parent of backend/ (this script lives in backend/scripts/)
        repo_root = Path(__file__).resolve().parents[2]
        base_dir = repo_root / "docs" / "daily"
    return base_dir / domain / "list" / csv_file


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--domain", required=True, help="daily domain name (e.g. data_analysis_agent)")
    parser.add_argument("--urls-file", help="file containing newline-separated URLs")
    parser.add_argument("--stdin", action="store_true", help="read newline-separated URLs from stdin")
    parser.add_argument("--csv-file", default="inbox.csv", help="CSV filename under list/ (default: inbox.csv)")
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=None,
        help="override base dir for docs/daily (default: <repo_root>/docs/daily)",
    )
    parser.add_argument("--today", default=None, help="override today's date (YYYY-MM-DD) for tests")
    args = parser.parse_args(argv)

    urls = _read_urls_from_args(args)
    csv_path = _resolve_csv_path(args.domain, args.base_dir, args.csv_file)
    result = append_urls(csv_path, urls, today=args.today)

    json.dump(result.to_dict(), sys.stdout, ensure_ascii=False, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
