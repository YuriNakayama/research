"""Pull Request creation via gh CLI."""

from __future__ import annotations

import logging
import subprocess
from datetime import UTC, datetime
from pathlib import Path

logger = logging.getLogger(__name__)


def create_pr(
    work_dir: str | Path,
    branch_name: str,
    base_branch: str = "main",
    output_files: list[str] | None = None,
    prompt_path: str = "",
) -> str:
    """Create a Pull Request using gh CLI.

    Returns:
        The PR URL.
    """
    work_dir = Path(work_dir)
    today = datetime.now(tz=UTC).strftime("%Y-%m-%d")

    title = f"[Auto Research] {today}"

    body_parts = [
        "## Auto Research Report",
        "",
        f"- **Date**: {today}",
        f"- **Branch**: `{branch_name}`",
    ]

    if prompt_path:
        body_parts.append(f"- **Prompt**: `{prompt_path}`")

    if output_files:
        body_parts.append("")
        body_parts.append("### Output Files")
        for f in output_files:
            body_parts.append(f"- `{f}`")

    body_parts.extend(
        [
            "",
            "---",
            "Generated automatically by Auto Research Pipeline",
        ]
    )

    body = "\n".join(body_parts)

    cmd = [
        "gh",
        "pr",
        "create",
        "--title",
        title,
        "--body",
        body,
        "--base",
        base_branch,
        "--head",
        branch_name,
    ]

    logger.info("Creating PR: %s", title)
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        cwd=str(work_dir),
        check=True,
    )

    pr_url = result.stdout.strip()
    logger.info("PR created: %s", pr_url)
    return pr_url
