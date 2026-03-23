"""Tests for email notifier."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

from src.email_notifier import _markdown_to_pdf, notify_failure, notify_success


class TestNotifySuccess:
    @patch("src.email_notifier._get_ses_client")
    def test_sends_success_email_without_attachments(self, mock_client_factory: MagicMock) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        notify_success(
            pr_url="https://github.com/owner/repo/pull/42",
            output_files=["report.md"],
            sender="sender@example.com",
            recipients=["user1@example.com", "user2@example.com"],
        )

        mock_client.send_email.assert_called_once()
        call_kwargs = mock_client.send_email.call_args[1]
        assert call_kwargs["Source"] == "sender@example.com"
        assert call_kwargs["Destination"]["ToAddresses"] == ["user1@example.com", "user2@example.com"]
        assert "pull/42" in call_kwargs["Message"]["Body"]["Text"]["Data"]
        assert "report.md" in call_kwargs["Message"]["Body"]["Text"]["Data"]

    @patch("src.email_notifier._get_ses_client")
    def test_sends_success_email_with_pdf_attachment(self, mock_client_factory: MagicMock, tmp_path: Path) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        md_file = tmp_path / "report.md"
        md_file.write_text("# Test Report\n\nHello world\n", encoding="utf-8")

        notify_success(
            pr_url="https://github.com/owner/repo/pull/42",
            output_files=["report.md"],
            sender="sender@example.com",
            recipients=["user@example.com"],
            work_dir=tmp_path,
        )

        mock_client.send_raw_email.assert_called_once()
        call_kwargs = mock_client.send_raw_email.call_args[1]
        assert call_kwargs["Source"] == "sender@example.com"
        assert call_kwargs["Destinations"] == ["user@example.com"]
        assert "report.pdf" in call_kwargs["RawMessage"]["Data"]

    @patch("src.email_notifier._get_ses_client")
    def test_falls_back_to_plain_when_pdf_fails(self, mock_client_factory: MagicMock, tmp_path: Path) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        notify_success(
            pr_url="https://github.com/owner/repo/pull/42",
            output_files=["nonexistent.md"],
            sender="sender@example.com",
            recipients=["user@example.com"],
            work_dir=tmp_path,
        )

        mock_client.send_email.assert_called_once()

    def test_skips_when_no_sender(self) -> None:
        notify_success(
            pr_url="https://github.com/owner/repo/pull/42",
            output_files=["report.md"],
            sender="",
            recipients=["user@example.com"],
        )


class TestNotifyFailure:
    @patch("src.email_notifier._get_ses_client")
    def test_sends_failure_email(self, mock_client_factory: MagicMock) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        notify_failure(
            error="Claude CLI timeout",
            sender="sender@example.com",
            recipients=["user@example.com"],
        )

        mock_client.send_email.assert_called_once()
        call_kwargs = mock_client.send_email.call_args[1]
        assert "failed" in call_kwargs["Message"]["Subject"]["Data"].lower()
        assert "Claude CLI timeout" in call_kwargs["Message"]["Body"]["Text"]["Data"]


class TestMarkdownToPdf:
    def test_converts_markdown_to_pdf(self, tmp_path: Path) -> None:
        md_file = tmp_path / "test.md"
        md_file.write_text("# Hello\n\nThis is a test.\n", encoding="utf-8")

        pdf_bytes = _markdown_to_pdf(md_file)

        assert len(pdf_bytes) > 0
        assert pdf_bytes[:5] == b"%PDF-"

    def test_converts_table_markdown(self, tmp_path: Path) -> None:
        md_file = tmp_path / "table.md"
        md_file.write_text(
            "# Report\n\n| Col1 | Col2 |\n|------|------|\n| A | B |\n",
            encoding="utf-8",
        )

        pdf_bytes = _markdown_to_pdf(md_file)

        assert pdf_bytes[:5] == b"%PDF-"
