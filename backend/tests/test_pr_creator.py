"""Tests for PR creator."""

from __future__ import annotations

from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import MagicMock, patch

from src.email_notifier import DomainResult
from src.pr_creator import create_pr


class TestCreatePR:
    @patch("src.pr_creator.subprocess.run")
    def test_creates_pr(self, mock_run: MagicMock, tmp_path: Path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="https://github.com/owner/repo/pull/42\n",
            stderr="",
        )

        results = [
            DomainResult(
                domain_name="legal_tech",
                success=True,
                output_file=Path("docs/daily/legal_tech/report/20260329.md"),
                item_title="Test Paper",
            ),
        ]

        pr_url = create_pr(
            work_dir=tmp_path,
            branch_name="daily/auto/20260329",
            base_branch="main",
            results=results,
        )

        assert pr_url == "https://github.com/owner/repo/pull/42"

        cmd = mock_run.call_args[0][0]
        assert "gh" in cmd
        assert "pr" in cmd
        assert "create" in cmd
        assert "[Daily Research]" in cmd[cmd.index("--title") + 1]

    @patch("src.pr_creator.subprocess.run")
    def test_pr_body_contains_domain_info(self, mock_run: MagicMock, tmp_path: Path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="https://github.com/owner/repo/pull/1\n",
            stderr="",
        )

        results = [
            DomainResult(
                domain_name="legal_tech",
                success=True,
                output_file=Path("docs/daily/legal_tech/report/20260329.md"),
                item_title="Paper A",
            ),
            DomainResult(
                domain_name="ai_reg",
                success=False,
                error="Timeout",
            ),
        ]

        create_pr(
            work_dir=tmp_path,
            branch_name="daily/auto/20260329",
            results=results,
        )

        cmd = mock_run.call_args[0][0]
        body = cmd[cmd.index("--body") + 1]
        assert "legal_tech" in body
        assert "Paper A" in body
        assert "ai_reg" in body
        assert "Timeout" in body
