"""Tests for CSV manager."""

from __future__ import annotations

from pathlib import Path

import pytest

from src.csv_manager import (
    get_csv_files,
    get_next_pending,
    get_next_pending_across_files,
    mark_done,
)

SAMPLE_CSV = """\
title,url,authors,year,venue,summary,status,added_at,kind
"Legal AI","https://arxiv.org/abs/1","Smith et al.",2024,"arXiv","Survey",pending,2026-04-01,paper
"NLP Legal","https://arxiv.org/abs/2","Johnson",2024,"ACL","Analysis",pending,2026-04-03,paper
"Patent ML","https://arxiv.org/abs/3","Tanaka",2023,"EMNLP","Classification",done,2026-03-20,paper
"""

ALL_DONE_CSV = """\
title,url,authors,year,venue,summary,status,added_at,kind
"Paper A","https://example.com/a","Author A",2024,"arXiv","Summary A",done,2026-03-01,paper
"Paper B","https://example.com/b","Author B",2024,"arXiv","Summary B",done,2026-03-02,paper
"""

HEADER_ONLY_CSV = """\
title,url,authors,year,venue,summary,status,added_at,kind
"""


@pytest.fixture
def csv_file(tmp_path: Path) -> Path:
    p = tmp_path / "resources.csv"
    p.write_text(SAMPLE_CSV, encoding="utf-8")
    return p


@pytest.fixture
def domain_dir(tmp_path: Path) -> Path:
    domain = tmp_path / "data_analysis_agent"
    list_dir = domain / "list"
    list_dir.mkdir(parents=True)
    (list_dir / "inbox.csv").write_text(SAMPLE_CSV, encoding="utf-8")
    (list_dir / "extra.csv").write_text(ALL_DONE_CSV, encoding="utf-8")
    return domain


class TestGetNextPending:
    def test_returns_first_pending(self, csv_file: Path) -> None:
        item = get_next_pending(csv_file)

        assert item is not None
        assert item.title == "Legal AI"
        assert item.url == "https://arxiv.org/abs/1"
        assert item.authors == "Smith et al."
        assert item.year == "2024"
        assert item.status == "pending"
        assert item.added_at == "2026-04-01"
        assert item.kind == "paper"
        assert item.row_index == 0

    def test_skips_done_rows(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "test.csv"
        csv_path.write_text(
            "title,url,authors,year,venue,summary,status,added_at,kind\n"
            '"A","http://a","Auth",2024,"V","S",done,2026-03-01,paper\n'
            '"B","http://b","Auth",2024,"V","S",pending,2026-03-02,paper\n',
            encoding="utf-8",
        )

        item = get_next_pending(csv_path)

        assert item is not None
        assert item.title == "B"
        assert item.row_index == 1

    def test_all_done_returns_none(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "done.csv"
        csv_path.write_text(ALL_DONE_CSV, encoding="utf-8")

        assert get_next_pending(csv_path) is None

    def test_empty_csv_returns_none(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "empty.csv"
        csv_path.write_text(HEADER_ONLY_CSV, encoding="utf-8")

        assert get_next_pending(csv_path) is None

    def test_missing_optional_columns_are_empty(self, tmp_path: Path) -> None:
        """Legacy CSVs without added_at/kind should still be readable."""
        csv_path = tmp_path / "legacy.csv"
        csv_path.write_text(
            'title,url,authors,year,venue,summary,status\n"Legacy","http://legacy","Auth",2024,"V","S",pending\n',
            encoding="utf-8",
        )

        item = get_next_pending(csv_path)

        assert item is not None
        assert item.title == "Legacy"
        assert item.added_at == ""
        assert item.kind == ""


class TestGetNextPendingAcrossFiles:
    def test_picks_newest_added_at(self, tmp_path: Path) -> None:
        csv_a = tmp_path / "a.csv"
        csv_b = tmp_path / "b.csv"
        csv_a.write_text(
            "title,url,authors,year,venue,summary,status,added_at,kind\n"
            '"Old","http://old","A",2024,"V","S",pending,2026-04-01,paper\n',
            encoding="utf-8",
        )
        csv_b.write_text(
            "title,url,authors,year,venue,summary,status,added_at,kind\n"
            '"New","http://new","A",2024,"V","S",pending,2026-04-05,paper\n',
            encoding="utf-8",
        )

        result = get_next_pending_across_files([csv_a, csv_b])

        assert result is not None
        chosen_path, item = result
        assert chosen_path == csv_b
        assert item.title == "New"

    def test_ties_broken_by_path_then_row(self, tmp_path: Path) -> None:
        csv_a = tmp_path / "a.csv"
        csv_b = tmp_path / "b.csv"
        csv_a.write_text(
            "title,url,authors,year,venue,summary,status,added_at,kind\n"
            '"A1","http://a1","A",2024,"V","S",pending,2026-04-05,paper\n'
            '"A2","http://a2","A",2024,"V","S",pending,2026-04-05,paper\n',
            encoding="utf-8",
        )
        csv_b.write_text(
            "title,url,authors,year,venue,summary,status,added_at,kind\n"
            '"B1","http://b1","A",2024,"V","S",pending,2026-04-05,paper\n',
            encoding="utf-8",
        )

        result = get_next_pending_across_files([csv_b, csv_a])

        assert result is not None
        chosen_path, item = result
        assert chosen_path == csv_a
        assert item.title == "A1"

    def test_rows_without_added_at_rank_last(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "mixed.csv"
        csv_path.write_text(
            "title,url,authors,year,venue,summary,status,added_at,kind\n"
            '"NoDate","http://x","A",2024,"V","S",pending,,paper\n'
            '"WithDate","http://y","A",2024,"V","S",pending,2026-04-01,paper\n',
            encoding="utf-8",
        )

        result = get_next_pending_across_files([csv_path])

        assert result is not None
        _, item = result
        assert item.title == "WithDate"

    def test_no_pending_returns_none(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "done.csv"
        csv_path.write_text(ALL_DONE_CSV, encoding="utf-8")

        assert get_next_pending_across_files([csv_path]) is None

    def test_empty_list_returns_none(self) -> None:
        assert get_next_pending_across_files([]) is None


class TestMarkDone:
    def test_updates_status(self, csv_file: Path) -> None:
        mark_done(csv_file, 0)

        item = get_next_pending(csv_file)
        assert item is not None
        assert item.title == "NLP Legal"
        assert item.row_index == 1

    def test_preserves_other_rows(self, csv_file: Path) -> None:
        mark_done(csv_file, 0)

        content = csv_file.read_text(encoding="utf-8")
        assert "NLP Legal" in content
        assert "Patent ML" in content
        assert "pending" in content  # row 1 still pending

    def test_invalid_index_raises(self, csv_file: Path) -> None:
        with pytest.raises(IndexError):
            mark_done(csv_file, 99)


class TestGetCsvFiles:
    def test_finds_csv_files(self, domain_dir: Path) -> None:
        files = get_csv_files(domain_dir)

        assert len(files) == 2
        names = [f.name for f in files]
        assert "inbox.csv" in names
        assert "extra.csv" in names

    def test_empty_dir(self, tmp_path: Path) -> None:
        domain = tmp_path / "empty_domain"
        domain.mkdir()

        assert get_csv_files(domain) == []

    def test_no_list_dir(self, tmp_path: Path) -> None:
        domain = tmp_path / "no_list"
        domain.mkdir()

        assert get_csv_files(domain) == []
