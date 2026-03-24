"""Tests for research runner."""

from __future__ import annotations

from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import MagicMock, patch

import pytest

from src.research_runner import run_research


@pytest.fixture
def work_dir(tmp_path: Path) -> Path:
    prompt_dir = tmp_path / "docs" / "research"
    prompt_dir.mkdir(parents=True)
    (prompt_dir / "prompt.md").write_text("Research this topic")
    return tmp_path


class TestRunResearch:
    @patch("src.research_runner.subprocess.run")
    def test_successful_run(self, mock_run: MagicMock, work_dir: Path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="# Research Report\n\nDetailed findings here with enough content.",
            stderr="",
        )

        output = run_research(
            prompt_path="docs/research/prompt.md",
            output_dir="docs/research/output",
            work_dir=work_dir,
        )

        assert output.exists()
        assert output.name.startswith("report-")
        assert output.name.endswith(".md")
        assert "Research Report" in output.read_text()

    def test_prompt_not_found(self, work_dir: Path) -> None:
        with pytest.raises(FileNotFoundError):
            run_research(
                prompt_path="nonexistent/prompt.md",
                output_dir="output",
                work_dir=work_dir,
            )

    @patch("src.research_runner.subprocess.run")
    def test_claude_cli_failure(self, mock_run: MagicMock, work_dir: Path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=1,
            stdout="",
            stderr="Error: authentication failed",
        )

        with pytest.raises(RuntimeError, match="failed with exit code 1"):
            run_research(
                prompt_path="docs/research/prompt.md",
                output_dir="output",
                work_dir=work_dir,
            )

    @patch("src.research_runner.subprocess.run")
    def test_strips_preamble_before_heading(self, mock_run: MagicMock, work_dir: Path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="ファイル書き込みの許可が必要です。レポートの内容を以下に表示します。\n\n---\n\n# Research Report\n\nFindings here.",
            stderr="",
        )

        output = run_research(
            prompt_path="docs/research/prompt.md",
            output_dir="docs/research/output",
            work_dir=work_dir,
        )

        content = output.read_text()
        assert content.startswith("# Research Report")
        assert "ファイル書き込みの許可" not in content

    @patch("src.research_runner.subprocess.run")
    def test_empty_output(self, mock_run: MagicMock, work_dir: Path) -> None:
        mock_run.return_value = CompletedProcess(
            args=[],
            returncode=0,
            stdout="short",
            stderr="",
        )

        with pytest.raises(RuntimeError, match="empty or too short"):
            run_research(
                prompt_path="docs/research/prompt.md",
                output_dir="output",
                work_dir=work_dir,
            )
