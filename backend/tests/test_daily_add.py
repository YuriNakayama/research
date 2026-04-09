"""Tests for scripts/daily_add.py — the CSV appender used by /daily-add."""

from __future__ import annotations

import csv
import importlib.util
import sys
from pathlib import Path

import pytest

# Load scripts/daily_add.py as a module (it lives outside the src/ package).
_SCRIPT_PATH = Path(__file__).resolve().parents[1] / "scripts" / "daily_add.py"
_spec = importlib.util.spec_from_file_location("daily_add", _SCRIPT_PATH)
assert _spec and _spec.loader
daily_add = importlib.util.module_from_spec(_spec)
sys.modules["daily_add"] = daily_add
_spec.loader.exec_module(daily_add)  # type: ignore[union-attr]


class TestNormalizeUrl:
    def test_strips_trailing_slash(self) -> None:
        assert daily_add.normalize_url("https://example.com/foo/") == "https://example.com/foo"

    def test_keeps_root_slash(self) -> None:
        assert daily_add.normalize_url("https://example.com/") == "https://example.com/"

    def test_removes_utm_params(self) -> None:
        assert daily_add.normalize_url("https://a.com/x?utm_source=x&id=1") == "https://a.com/x?id=1"

    def test_lowercases_host(self) -> None:
        assert daily_add.normalize_url("https://EXAMPLE.com/A") == "https://example.com/A"

    def test_drops_fragment(self) -> None:
        assert daily_add.normalize_url("https://a.com/b#section") == "https://a.com/b"


class TestInferKind:
    def test_arxiv_is_paper(self) -> None:
        assert daily_add.infer_kind("https://arxiv.org/abs/2401.00001") == "paper"

    def test_google_patents_is_patent(self) -> None:
        assert daily_add.infer_kind("https://patents.google.com/patent/US123") == "patent"

    def test_other_is_site(self) -> None:
        assert daily_add.infer_kind("https://example.com/blog/post") == "site"


class TestAppendUrls:
    def test_appends_to_empty_csv(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "inbox.csv"
        urls = ["https://arxiv.org/abs/1", "https://example.com/a"]

        result = daily_add.append_urls(csv_path, urls, today="2026-04-08")

        assert len(result.added) == 2
        assert result.added[0]["row_index"] == 0
        assert result.added[0]["kind"] == "paper"
        assert result.added[1]["kind"] == "site"

        with open(csv_path, encoding="utf-8", newline="") as f:
            rows = list(csv.DictReader(f))
        assert len(rows) == 2
        assert rows[0]["url"] == "https://arxiv.org/abs/1"
        assert rows[0]["status"] == "pending"
        assert rows[0]["added_at"] == "2026-04-08"
        assert rows[0]["kind"] == "paper"

    def test_skips_duplicate_url_already_in_csv(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "inbox.csv"
        daily_add.append_urls(csv_path, ["https://a.com/x"], today="2026-04-01")

        result = daily_add.append_urls(
            csv_path,
            ["https://a.com/x/", "https://a.com/y"],  # trailing slash → same
            today="2026-04-08",
        )

        assert len(result.added) == 1
        assert result.added[0]["url"] == "https://a.com/y"
        assert len(result.skipped) == 1
        assert result.skipped[0]["reason"] == "already in csv"

    def test_skips_duplicate_within_batch(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "inbox.csv"

        result = daily_add.append_urls(
            csv_path,
            ["https://a.com/x", "https://a.com/x?utm_source=x"],  # normalized equal
            today="2026-04-08",
        )

        assert len(result.added) == 1
        assert len(result.skipped) == 1
        assert result.skipped[0]["reason"] == "duplicate in batch"

    def test_preserves_existing_rows(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "inbox.csv"
        # Pre-populate with a done row
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=daily_add.CSV_FIELDNAMES)
            writer.writeheader()
            writer.writerow(
                {
                    "title": "Old Paper",
                    "url": "https://old.example/1",
                    "authors": "Someone",
                    "year": "2023",
                    "venue": "NeurIPS",
                    "summary": "Old work",
                    "status": "done",
                    "added_at": "2026-01-01",
                    "kind": "paper",
                }
            )

        daily_add.append_urls(csv_path, ["https://new.example/1"], today="2026-04-08")

        with open(csv_path, encoding="utf-8", newline="") as f:
            rows = list(csv.DictReader(f))
        assert len(rows) == 2
        assert rows[0]["title"] == "Old Paper"
        assert rows[0]["status"] == "done"
        assert rows[0]["summary"] == "Old work"  # untouched
        assert rows[1]["url"] == "https://new.example/1"
        assert rows[1]["status"] == "pending"

    def test_empty_input_is_noop(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "inbox.csv"
        result = daily_add.append_urls(csv_path, [], today="2026-04-08")

        assert result.added == []
        assert result.skipped == []
        with open(csv_path, encoding="utf-8", newline="") as f:
            rows = list(csv.DictReader(f))
        assert rows == []

    def test_blank_lines_are_ignored(self, tmp_path: Path) -> None:
        csv_path = tmp_path / "inbox.csv"
        result = daily_add.append_urls(csv_path, ["https://a.com/x", "   ", ""], today="2026-04-08")
        assert len(result.added) == 1


class TestMainCli:
    def test_reads_from_urls_file_and_writes_json(self, tmp_path: Path, capsys: pytest.CaptureFixture[str]) -> None:
        urls_file = tmp_path / "urls.txt"
        urls_file.write_text("https://arxiv.org/abs/1\nhttps://example.com/a\n", encoding="utf-8")
        base_dir = tmp_path / "docs" / "daily"

        rc = daily_add.main(
            [
                "--domain",
                "data_analysis_agent",
                "--urls-file",
                str(urls_file),
                "--base-dir",
                str(base_dir),
                "--today",
                "2026-04-08",
            ]
        )

        assert rc == 0
        captured = capsys.readouterr().out
        import json

        payload = json.loads(captured)
        assert len(payload["added"]) == 2
        assert payload["csv_path"].endswith("data_analysis_agent/list/inbox.csv")

        csv_path = base_dir / "data_analysis_agent" / "list" / "inbox.csv"
        assert csv_path.exists()
