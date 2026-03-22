"""Tests for PR creator."""

from __future__ import annotations

from subprocess import CompletedProcess
from unittest.mock import MagicMock, patch

from src.pr_creator import create_pr


class TestCreatePR:
    @patch("src.pr_creator.subprocess.run")
    def test_creates_pr(self, mock_run: MagicMock, tmp_path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="https://github.com/owner/repo/pull/42\n",
            stderr="",
        )

        pr_url = create_pr(
            work_dir=tmp_path,
            branch_name="research/auto/20260322",
            base_branch="main",
            output_files=["docs/research/output/report-20260322.md"],
            prompt_path="docs/research/prompt.md",
        )

        assert pr_url == "https://github.com/owner/repo/pull/42"

        call_args = mock_run.call_args[1] if mock_run.call_args[1] else {}
        cmd = mock_run.call_args[0][0]

        assert "gh" in cmd
        assert "pr" in cmd
        assert "create" in cmd
        assert "--title" in cmd
        assert "[Auto Research]" in cmd[cmd.index("--title") + 1]

    @patch("src.pr_creator.subprocess.run")
    def test_pr_body_contains_output_files(self, mock_run: MagicMock, tmp_path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[], returncode=0, stdout="https://github.com/owner/repo/pull/1\n", stderr=""
        )

        create_pr(
            work_dir=tmp_path,
            branch_name="research/auto/20260322",
            output_files=["report.md", "data.csv"],
        )

        cmd = mock_run.call_args[0][0]
        body = cmd[cmd.index("--body") + 1]
        assert "report.md" in body
        assert "data.csv" in body
