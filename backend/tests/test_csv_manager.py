"""Tests for CSV manager."""

from __future__ import annotations

from pathlib import Path

import pytest

from src.csv_manager import get_csv_files, get_next_pending, mark_done

SAMPLE_CSV = """\
title,url,authors,year,venue,summary,status
"Legal AI","https://arxiv.org/abs/1","Smith et al.",2024,"arXiv","Survey",pending
"NLP Legal","https://arxiv.org/abs/2","Johnson",2024,"ACL","Analysis",pending
"Patent ML","https://arxiv.org/abs/3","Tanaka",2023,"EMNLP","Classification",done
"""

ALL_DONE_CSV = """\
title,url,authors,year,venue,summary,status
"Paper A","https://example.com/a","Author A",2024,"arXiv","Summary A",done
"Paper B","https://example.com/b","Author B",2024,"arXiv","Summary B",done
"""

HEADER_ONLY_CSV = """\
title,url,authors,year,venue,summary,status
"""


@pytest.fixture
def csv_file(tmp_path: Path) -> Path:
    p = tmp_path / "resources.csv"
    p.write_text(SAMPLE_CSV, encoding="utf-8")
    return p


@pytest.fixture
def domain_dir(tmp_path: Path) -> Path:
    list_dir = tmp_path / "legal_tech" / "list"
    list_dir.mkdir(parents=True)
    (list_dir / "resources.csv").write_text(SAMPLE_CSV, encoding="utf-8")
    (list_dir / "extra.csv").write_text(ALL_DONE_CSV, encoding="utf-8")
    return tmp_path / "legal_tech"


class TestGetNextPending:
    def test_returns_first_pending(self, csv_file: Path) -> None:
        item = get_next_pending(csv_file)

        assert item is not None
        assert item.title == "Legal AI"
        assert item.url == "https://arxiv.org/abs/1"
        assert item.authors == "Smith et al."
        assert item.year == "2024"
        assert item.status == "pending"
        assert item.row_index == 0

    def test_skips_done_rows(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "test.csv"
        csv_path.write_text(
            "title,url,authors,year,venue,summary,status\n"
            '"A","http://a","Auth",2024,"V","S",done\n'
            '"B","http://b","Auth",2024,"V","S",pending\n',
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

    def test_japanese_content(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "jp.csv"
        csv_path.write_text(
            "title,url,authors,year,venue,summary,status\n"
            '"法律AIの調査","http://example.com","田中太郎",2024,"arXiv","概要テキスト",pending\n',
            encoding="utf-8",
        )

        item = get_next_pending(csv_path)

        assert item is not None
        assert item.title == "法律AIの調査"
        assert item.authors == "田中太郎"

    def test_fields_with_commas(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "commas.csv"
        csv_path.write_text(
            "title,url,authors,year,venue,summary,status\n"
            '"Title, with comma","http://a","A, B, and C",2024,"V","S, more",pending\n',
            encoding="utf-8",
        )

        item = get_next_pending(csv_path)

        assert item is not None
        assert item.title == "Title, with comma"
        assert item.authors == "A, B, and C"


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
        assert "extra.csv" in names
        assert "resources.csv" in names

    def test_empty_dir(self, tmp_path: Path) -> None:
        domain = tmp_path / "empty_domain"
        domain.mkdir()

        assert get_csv_files(domain) == []

    def test_no_list_dir(self, tmp_path: Path) -> None:
        domain = tmp_path / "no_list"
        domain.mkdir()

        assert get_csv_files(domain) == []
