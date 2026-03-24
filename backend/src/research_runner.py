"""Claude CLI execution for research tasks."""

from __future__ import annotations

import logging
import subprocess
from datetime import UTC
from pathlib import Path

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT_SECONDS = 30 * 60  # 30 minutes


def run_research(
    prompt_path: str,
    output_dir: str,
    work_dir: str | Path,
    claude_options: str = "",
    timeout: int = DEFAULT_TIMEOUT_SECONDS,
) -> Path:
    """Execute Claude CLI with a research prompt and save output.

    Args:
        prompt_path: Path to prompt file (relative to work_dir).
        output_dir: Directory to save output (relative to work_dir).
        work_dir: Repository root directory.
        claude_options: Additional Claude CLI options.
        timeout: Timeout in seconds.

    Returns:
        Path to the output file.
    """
    work_dir = Path(work_dir)
    prompt_file = work_dir / prompt_path
    output_directory = work_dir / output_dir

    if not prompt_file.exists():
        raise FileNotFoundError(f"Prompt file not found: {prompt_file}")

    output_directory.mkdir(parents=True, exist_ok=True)

    prompt_content = prompt_file.read_text(encoding="utf-8")
    logger.info("Loaded prompt from %s (%d chars)", prompt_path, len(prompt_content))

    cmd = ["claude", "-p", prompt_content, "--allowedTools", "WebSearch", "WebFetch"]
    if claude_options:
        cmd.extend(claude_options.split())

    logger.info("Running Claude CLI (timeout: %ds)", timeout)
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(work_dir),
        timeout=timeout,
    )

    if result.returncode != 0:
        logger.error("Claude CLI failed (exit code %d): %s", result.returncode, result.stderr)
        raise RuntimeError(f"Claude CLI failed with exit code {result.returncode}: {result.stderr}")

    output = result.stdout
    # Claude CLI may prepend permission-related messages when it cannot
    # write files in non-interactive mode. Strip everything before the
    # first Markdown heading so only the report remains.
    heading_pos = output.find("\n# ")
    if heading_pos != -1 and not output.lstrip().startswith("#"):
        logger.warning("Stripped %d chars of preamble from Claude CLI output", heading_pos)
        output = output[heading_pos + 1 :]

    if not output or len(output.strip()) < 10:
        raise RuntimeError("Claude CLI produced empty or too short output")

    from datetime import datetime

    today = datetime.now(tz=UTC).strftime("%Y%m%d")
    output_file = output_directory / f"report-{today}.md"
    output_file.write_text(output, encoding="utf-8")
    logger.info("Saved output to %s (%d chars)", output_file, len(output))

    return output_file
