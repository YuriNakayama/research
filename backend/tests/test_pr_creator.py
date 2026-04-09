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
                output_file=Path("docs/research/runs/legal_tech/retrieval/20260329_all/20260329.md"),
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

        # First subprocess call should be `gh pr create`.
        create_cmd = mock_run.call_args_list[0][0][0]
        assert "gh" in create_cmd
        assert "pr" in create_cmd
        assert "create" in create_cmd
        assert "[Daily Research]" in create_cmd[create_cmd.index("--title") + 1]

        # Second subprocess call should enable auto-merge on the PR.
        merge_cmd = mock_run.call_args_list[1][0][0]
        assert merge_cmd[:4] == ["gh", "pr", "merge", pr_url]
        assert "--auto" in merge_cmd
        assert "--squash" in merge_cmd

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
                output_file=Path("docs/research/runs/legal_tech/retrieval/20260329_all/20260329.md"),
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

        create_cmd = mock_run.call_args_list[0][0][0]
        body = create_cmd[create_cmd.index("--body") + 1]
        assert "legal_tech" in body
        assert "Paper A" in body
        assert "ai_reg" in body
        assert "Timeout" in body
