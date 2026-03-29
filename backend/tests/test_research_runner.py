"""Tests for research runner."""

from __future__ import annotations

from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import MagicMock, patch

import pytest

from src.research_runner import run_research


def _make_side_effect(output_dir: Path, filename: str, content: str = "# Report\n\nContent."):
    """Create a side_effect that writes a file when subprocess.run is called."""

    def side_effect(*args, **kwargs):
        (output_dir / filename).write_text(content, encoding="utf-8")
        return CompletedProcess(args=[], returncode=0, stdout="Done.", stderr="")

    return side_effect


class TestRunResearch:
    @patch("src.research_runner.subprocess.run")
    def test_successful_run_with_file_output(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "report"
        output_dir.mkdir()

        mock_run.side_effect = _make_side_effect(output_dir, "01-test-paper.md")

        result = run_research(
            url="https://arxiv.org/abs/2410.21306",
            output_dir=output_dir,
            work_dir=tmp_path,
        )

        assert len(result) == 1
        assert result[0].name == "01-test-paper.md"
        assert "Report" in result[0].read_text()

    @patch("src.research_runner.subprocess.run")
    def test_fallback_to_stdout(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "report"
        output_dir.mkdir()

        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="# Fallback Report\n\nContent here with enough length.",
            stderr="",
        )

        result = run_research(
            url="https://arxiv.org/abs/2410.21306",
            output_dir=output_dir,
            work_dir=tmp_path,
        )

        assert len(result) == 1
        assert result[0].name == "report.md"
        assert "Fallback Report" in result[0].read_text()

    @patch("src.research_runner.subprocess.run")
    def test_claude_cli_failure(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "report"
        output_dir.mkdir()

        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=1,
            stdout="",
            stderr="Error: authentication failed",
        )

        with pytest.raises(RuntimeError, match="failed with exit code 1"):
            run_research(
                url="https://arxiv.org/abs/2410.21306",
                output_dir=output_dir,
                work_dir=tmp_path,
            )

    @patch("src.research_runner.subprocess.run")
    def test_empty_output(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "report"
        output_dir.mkdir()

        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="short",
            stderr="",
        )

        with pytest.raises(RuntimeError, match="no output files and empty stdout"):
            run_research(
                url="https://arxiv.org/abs/2410.21306",
                output_dir=output_dir,
                work_dir=tmp_path,
            )

    @patch("src.research_runner.subprocess.run")
    def test_passes_claude_options(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "report"
        output_dir.mkdir()

        mock_run.side_effect = _make_side_effect(output_dir, "01-report.md")

        run_research(
            url="https://arxiv.org/abs/2410.21306",
            output_dir=output_dir,
            work_dir=tmp_path,
            claude_options="--verbose",
        )

        cmd = mock_run.call_args[0][0]
        assert "--verbose" in cmd

    @patch("src.research_runner.subprocess.run")
    def test_cwd_is_output_dir(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "report"
        output_dir.mkdir()

        mock_run.side_effect = _make_side_effect(output_dir, "01-report.md")

        run_research(
            url="https://arxiv.org/abs/2410.21306",
            output_dir=output_dir,
            work_dir=tmp_path,
        )

        assert mock_run.call_args[1]["cwd"] == str(output_dir)

    @patch("src.research_runner.subprocess.run")
    def test_creates_output_directory(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "nested" / "dir"

        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="# Report\n\nContent here with enough length.",
            stderr="",
        )

        run_research(
            url="https://arxiv.org/abs/2410.21306",
            output_dir=output_dir,
            work_dir=tmp_path,
        )

        assert output_dir.exists()

    @patch("src.research_runner.subprocess.run")
    def test_prompt_contains_skill_invocation(self, mock_run: MagicMock, tmp_path: Path) -> None:
        output_dir = tmp_path / "report"
        output_dir.mkdir()

        mock_run.side_effect = _make_side_effect(output_dir, "01-report.md")

        run_research(
            url="https://arxiv.org/abs/2410.21306",
            output_dir=output_dir,
            work_dir=tmp_path,
        )

        cmd = mock_run.call_args[0][0]
        prompt = cmd[cmd.index("-p") + 1]
        assert "/research-retrieval" in prompt
        assert "2410.21306" in prompt
