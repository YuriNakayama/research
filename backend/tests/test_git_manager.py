"""Tests for git operations."""

from __future__ import annotations

from subprocess import CompletedProcess
from unittest.mock import MagicMock, patch

from src.git_manager import clone_repo, commit_and_push, create_branch, has_changes


class TestCloneRepo:
    @patch("src.git_manager.subprocess.run")
    def test_clone_without_token(self, mock_run: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        clone_repo("https://github.com/owner/repo", "/tmp/work")
        mock_run.assert_called_once_with(
            ["git", "clone", "https://github.com/owner/repo", "/tmp/work"],
            check=True,
            capture_output=True,
            text=True,
            cwd=None,
        )

    @patch("src.git_manager.subprocess.run")
    def test_clone_with_token(self, mock_run: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        clone_repo("https://github.com/owner/repo", "/tmp/work", token="ghp_token")
        args = mock_run.call_args[0][0]
        assert "x-access-token:ghp_token@" in args[2]

    @patch("src.git_manager.subprocess.run")
    def test_clone_with_branch(self, mock_run: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        clone_repo("https://github.com/owner/repo", "/tmp/work", branch="feature/test")
        args = mock_run.call_args[0][0]
        assert "--branch" in args
        assert "feature/test" in args

    @patch("src.git_manager.subprocess.run")
    def test_clone_without_branch(self, mock_run: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        clone_repo("https://github.com/owner/repo", "/tmp/work")
        args = mock_run.call_args[0][0]
        assert "--branch" not in args


class TestCreateBranch:
    @patch("src.git_manager.subprocess.run")
    def test_creates_dated_branch(self, mock_run: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        branch = create_branch("/tmp/work", prefix="daily")
        assert branch.startswith("daily/")
        assert len(branch.split("/")) == 2


class TestHasChanges:
    @patch("src.git_manager.subprocess.run")
    def test_no_changes(self, mock_run: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        assert has_changes("/tmp/work") is False

    @patch("src.git_manager.subprocess.run")
    def test_has_changes(self, mock_run: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="M file.txt\n", stderr="")
        assert has_changes("/tmp/work") is True


class TestCommitAndPush:
    @patch("src.git_manager.has_changes", return_value=True)
    @patch("src.git_manager.subprocess.run")
    def test_commit_and_push(self, mock_run: MagicMock, mock_changes: MagicMock) -> None:
        mock_run.return_value = CompletedProcess(args=[], returncode=0, stdout="", stderr="")
        commit_and_push("/tmp/work", "research/auto/20260322", message="test commit")

        git_commands = [c[0][0] for c in mock_run.call_args_list]
        assert ["git", "add", "."] in git_commands
        assert ["git", "commit", "-m", "test commit"] in git_commands
        assert ["git", "push", "-u", "origin", "research/auto/20260322"] in git_commands

    @patch("src.git_manager.has_changes", return_value=False)
    @patch("src.git_manager.subprocess.run")
    def test_no_commit_when_no_changes(self, mock_run: MagicMock, mock_changes: MagicMock) -> None:
        commit_and_push("/tmp/work", "research/auto/20260322")
        mock_run.assert_not_called()
