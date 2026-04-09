"""CSV management for daily research pipeline."""

from __future__ import annotations

import csv
import logging
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

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
class ResearchItem:
    """A single research target from CSV."""

    title: str
    url: str
    authors: str
    year: str
    venue: str
    summary: str
    status: str
    added_at: str
    kind: str
    row_index: int


def get_csv_files(domain_dir: Path) -> list[Path]:
    """Return all CSV files under ``<domain_dir>/list/``."""
    list_dir = domain_dir / "list"
    if not list_dir.exists():
        return []
    return sorted(list_dir.glob("*.csv"))


def _row_to_item(row: dict[str, str], row_index: int) -> ResearchItem:
    return ResearchItem(
        title=row.get("title", ""),
        url=row.get("url", ""),
        authors=row.get("authors", ""),
        year=row.get("year", ""),
        venue=row.get("venue", ""),
        summary=row.get("summary", ""),
        status=row.get("status", "").strip().lower(),
        added_at=row.get("added_at", ""),
        kind=row.get("kind", ""),
        row_index=row_index,
    )


def get_next_pending(csv_path: Path) -> ResearchItem | None:
    """Return the first row with status=pending, or None if all done."""
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if row.get("status", "").strip().lower() == "pending":
                return _row_to_item(row, i)
    return None


def get_next_pending_across_files(
    csv_paths: list[Path],
) -> tuple[Path, ResearchItem] | None:
    """Return the single highest-priority pending item across multiple CSVs.

    Priority rule: ``added_at`` descending (newest first). Ties are broken by
    CSV path (sorted) then row index (ascending). Rows with an empty or
    malformed ``added_at`` are ranked lowest so they only run when nothing
    newer is pending.
    """
    candidates: list[tuple[Path, ResearchItem]] = []
    for csv_path in sorted(csv_paths):
        with open(csv_path, encoding="utf-8", newline="") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if row.get("status", "").strip().lower() != "pending":
                    continue
                candidates.append((csv_path, _row_to_item(row, i)))

    if not candidates:
        return None

    # added_at desc を優先、同率は path asc / row_index asc を維持したい。
    # 2段ソート: 安定ソートなので、低優先度キー（path, row_index）を先に昇順
    # で並べてから、高優先度キー（added_at 降順, 空は最後）で並べ直す。
    candidates.sort(key=lambda e: (str(e[0]), e[1].row_index))
    candidates.sort(
        key=lambda e: (1 if e[1].added_at else 0, e[1].added_at),
        reverse=True,
    )
    return candidates[0]


def mark_done(csv_path: Path, row_index: int) -> None:
    """Update the status of the given row to 'done' and rewrite the CSV."""
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or CSV_FIELDNAMES
        rows = list(reader)

    if row_index < 0 or row_index >= len(rows):
        raise IndexError(f"Row index {row_index} out of range (total rows: {len(rows)})")

    rows[row_index]["status"] = "done"

    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    logger.info("Marked row %d as done in %s", row_index, csv_path)
