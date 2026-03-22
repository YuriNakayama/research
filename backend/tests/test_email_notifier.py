"""Tests for email notifier."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from src.email_notifier import notify_failure, notify_success


class TestNotifySuccess:
    @patch("src.email_notifier._get_ses_client")
    def test_sends_success_email(self, mock_client_factory: MagicMock) -> None:
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
