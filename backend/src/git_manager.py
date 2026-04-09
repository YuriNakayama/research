"""Git operations: clone, branch, commit, push."""

from __future__ import annotations

import logging
import subprocess
from datetime import UTC, datetime
from pathlib import Path

logger = logging.getLogger(__name__)


def _run_git(args: list[str], cwd: str | Path | None = None) -> subprocess.CompletedProcess[str]:
    """Run a git command and return the result."""
    cmd = ["git"] + args
    logger.info("Running: %s", " ".join(cmd))
    result = subprocess.run(cmd, check=True, capture_output=True, text=True, cwd=cwd)
    if result.stdout.strip():
        logger.debug("stdout: %s", result.stdout.strip())
    return result


def clone_repo(repo_url: str, dest: str | Path, token: str | None = None, branch: str | None = None) -> Path:
    """Clone a repository. If token is provided, embed it in the URL."""
    dest = Path(dest)
    if token:
        repo_url = repo_url.replace("https://", f"https://x-access-token:{token}@")
    cmd = ["clone"]
    if branch:
        cmd.extend(["--branch", branch])
    cmd.extend([repo_url, str(dest)])
    _run_git(cmd)
    logger.info("Cloned repository to %s (branch: %s)", dest, branch or "default")
    return dest


def configure_git(
    work_dir: str | Path, name: str = "Auto Research Bot", email: str = "auto-research@noreply.github.com"
) -> None:
    """Configure git user name and email."""
    _run_git(["config", "user.name", name], cwd=work_dir)
    _run_git(["config", "user.email", email], cwd=work_dir)


def create_branch(work_dir: str | Path, prefix: str = "daily") -> str:
    """Create and checkout a new feature branch with today's date and time."""
    today = datetime.now(tz=UTC).strftime("%Y%m%d-%H%M%S")
    branch_name = f"{prefix}/{today}"
    _run_git(["checkout", "-b", branch_name], cwd=work_dir)
    logger.info("Created branch: %s", branch_name)
    return branch_name


def has_changes(work_dir: str | Path) -> bool:
    """Check if there are uncommitted changes."""
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True,
        text=True,
        cwd=work_dir,
    )
    return bool(result.stdout.strip())


def commit_and_push(work_dir: str | Path, branch_name: str, message: str | None = None) -> None:
    """Add all changes, commit, and push to remote."""
    if not has_changes(work_dir):
        logger.warning("No changes to commit")
        return

    today = datetime.now(tz=UTC).strftime("%Y-%m-%d")
    if message is None:
        message = f"[Auto Research] {today}"

    _run_git(["add", "."], cwd=work_dir)
    _run_git(["commit", "-m", message], cwd=work_dir)
    _run_git(["push", "-u", "origin", branch_name], cwd=work_dir)
    logger.info("Pushed changes to %s", branch_name)
