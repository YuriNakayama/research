"""CSV management for daily research pipeline."""

from __future__ import annotations

import csv
import logging
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

CSV_FIELDNAMES = ["title", "url", "authors", "year", "venue", "summary", "status"]


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
    row_index: int


def get_csv_files(domain_dir: Path) -> list[Path]:
    """Return all CSV files under domain_dir/list/."""
    list_dir = domain_dir / "list"
    if not list_dir.exists():
        return []
    return sorted(list_dir.glob("*.csv"))


def get_next_pending(csv_path: Path) -> ResearchItem | None:
    """Return the first row with status=pending, or None if all done."""
    with open(csv_path, encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if row.get("status", "").strip().lower() == "pending":
                return ResearchItem(
                    title=row.get("title", ""),
                    url=row.get("url", ""),
                    authors=row.get("authors", ""),
                    year=row.get("year", ""),
                    venue=row.get("venue", ""),
                    summary=row.get("summary", ""),
                    status="pending",
                    row_index=i,
                )
    return None


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
