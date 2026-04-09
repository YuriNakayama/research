"""Tests for email notifier."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

from src.email_notifier import (
    DomainResult,
    _markdown_to_pdf,
    notify_research_results,
)


def _make_result(
    domain: str = "legal_tech",
    success: bool = True,
    output_file: Path | None = None,
    title: str = "Test Paper",
    summary: str = "",
    report_url: str = "",
    error: str = "",
) -> DomainResult:
    return DomainResult(
        domain_name=domain,
        success=success,
        output_file=output_file,
        item_title=title,
        item_summary=summary,
        report_url=report_url,
        error=error,
    )


class TestNotifyResearchResults:
    @patch("src.email_notifier._get_ses_client")
    def test_sends_email_without_attachments(self, mock_client_factory: MagicMock) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        results = [_make_result()]
        notify_research_results(
            results=results,
            sender="sender@example.com",
            recipients=["user@example.com"],
        )

        mock_client.send_email.assert_called_once()
        call_kwargs = mock_client.send_email.call_args[1]
        assert "[Daily Research]" in call_kwargs["Message"]["Subject"]["Data"]
        assert "1/1 domains" in call_kwargs["Message"]["Subject"]["Data"]
        body = call_kwargs["Message"]["Body"]["Text"]["Data"]
        assert "legal_tech" in body
        assert "Test Paper" in body

    @patch("src.email_notifier._get_ses_client")
    def test_sends_email_with_attachments(self, mock_client_factory: MagicMock, tmp_path: Path) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        md_file = tmp_path / "20260329.md"
        md_file.write_text("# Test Report\n\nHello world\n", encoding="utf-8")

        results = [_make_result(output_file=md_file)]
        notify_research_results(
            results=results,
            sender="sender@example.com",
            recipients=["user@example.com"],
            work_dir=tmp_path,
        )

        mock_client.send_raw_email.assert_called_once()
        raw_data = mock_client.send_raw_email.call_args[1]["RawMessage"]["Data"]
        assert "legal_tech_20260329.md" in raw_data
        assert "legal_tech_20260329.pdf" in raw_data

    @patch("src.email_notifier._get_ses_client")
    def test_body_contains_summary_and_report_url(self, mock_client_factory: MagicMock) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        results = [
            _make_result(
                title="Multi-Agent Survey",
                summary="LLM マルチエージェント研究のサーベイ論文。",
                report_url="https://owl.avifauna.click/docs/daily/data_analysis_agent/2026-04-08",
            )
        ]
        notify_research_results(
            results=results,
            sender="sender@example.com",
            recipients=["user@example.com"],
        )

        call_kwargs = mock_client.send_email.call_args[1]
        body = call_kwargs["Message"]["Body"]["Text"]["Data"]
        assert "Multi-Agent Survey" in body
        assert "LLM マルチエージェント研究のサーベイ論文。" in body
        assert "https://owl.avifauna.click/docs/daily/data_analysis_agent/2026-04-08" in body

    @patch("src.email_notifier._get_ses_client")
    def test_mixed_success_and_failure(self, mock_client_factory: MagicMock) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        results = [
            _make_result(domain="legal_tech", success=True),
            _make_result(domain="ai_reg", success=False, error="Timeout"),
        ]
        notify_research_results(
            results=results,
            sender="sender@example.com",
            recipients=["user@example.com"],
        )

        call_kwargs = mock_client.send_email.call_args[1]
        assert "1/2 domains" in call_kwargs["Message"]["Subject"]["Data"]
        body = call_kwargs["Message"]["Body"]["Text"]["Data"]
        assert "■ legal_tech" in body
        assert "✗ ai_reg" in body
        assert "Timeout" in body

    @patch("src.email_notifier._get_ses_client")
    def test_all_failed(self, mock_client_factory: MagicMock) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        results = [_make_result(success=False, error="Failed")]
        notify_research_results(
            results=results,
            sender="sender@example.com",
            recipients=["user@example.com"],
        )

        call_kwargs = mock_client.send_email.call_args[1]
        assert "0/1 domains" in call_kwargs["Message"]["Subject"]["Data"]

    @patch("src.email_notifier._get_ses_client")
    def test_includes_pr_url(self, mock_client_factory: MagicMock) -> None:
        mock_client = MagicMock()
        mock_client_factory.return_value = mock_client

        results = [_make_result()]
        notify_research_results(
            results=results,
            pr_url="https://github.com/owner/repo/pull/42",
            sender="sender@example.com",
            recipients=["user@example.com"],
        )

        body = mock_client.send_email.call_args[1]["Message"]["Body"]["Text"]["Data"]
        assert "pull/42" in body

    def test_skips_when_no_sender(self) -> None:
        notify_research_results(
            results=[_make_result()],
            sender="",
            recipients=["user@example.com"],
        )


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
