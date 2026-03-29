"""Pull Request creation via gh CLI."""

from __future__ import annotations

import logging
import subprocess
from datetime import UTC, datetime
from pathlib import Path

from src.email_notifier import DomainResult

logger = logging.getLogger(__name__)


def create_pr(
    work_dir: str | Path,
    branch_name: str,
    base_branch: str = "main",
    results: list[DomainResult] | None = None,
) -> str:
    """Create a Pull Request using gh CLI.

    Returns:
        The PR URL.
    """
    work_dir = Path(work_dir)
    today = datetime.now(tz=UTC).strftime("%Y-%m-%d")

    title = f"[Daily Research] {today}"

    body_parts = [
        "## Daily Research Report",
        "",
        f"- **Date**: {today}",
        f"- **Branch**: `{branch_name}`",
    ]

    if results:
        domains = ", ".join(r.domain_name for r in results if r.success)
        body_parts.append(f"- **Domains**: {domains}")
        body_parts.extend(["", "### Reports"])
        for r in results:
            if r.success and r.output_file:
                body_parts.append(f'- `{r.output_file}` — "{r.item_title}"')
            elif not r.success:
                body_parts.append(f"- ~~{r.domain_name}~~: {r.error}")

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
