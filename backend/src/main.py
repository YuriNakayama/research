"""Main entry point for the auto-research pipeline."""

from __future__ import annotations

import logging
import os
import sys
import tempfile
from pathlib import Path

from src.config import load_config
from src.git_manager import clone_repo, commit_and_push, configure_git, create_branch
from src.github_auth import get_github_token
from src.pr_creator import create_pr
from src.research_runner import run_research
from src.email_notifier import notify_failure, notify_success

logger = logging.getLogger(__name__)


def main() -> int:
    """Run the full research pipeline."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    config_path = os.environ.get("CONFIG_PATH", "config/research-config.yaml")
    logger.info("Loading config from %s", config_path)

    try:
        config = load_config(config_path)
    except Exception:
        logger.exception("Failed to load configuration")
        return 1

    try:
        token = get_github_token(
            region=config.aws_region,
            environment=config.environment,
        )
        os.environ["GH_TOKEN"] = token
    except Exception:
        logger.exception("Failed to get GitHub token")
        return 1

    work_dir = Path(tempfile.mkdtemp(prefix="auto-research-"))
    repo_url = f"https://github.com/{config.github.repo}"

    try:
        # Clone repository
        logger.info("Cloning %s", repo_url)
        clone_repo(repo_url, work_dir, token=token)
        configure_git(work_dir)

        # Create feature branch
        branch_name = create_branch(work_dir, prefix=config.research.branch_prefix)

        # Run research
        logger.info("Running research with prompt: %s", config.research.prompt_path)
        output_file = run_research(
            prompt_path=config.research.prompt_path,
            output_dir=config.research.output_dir,
            work_dir=work_dir,
            claude_options=config.research.claude_options,
        )
        output_relative = str(output_file.relative_to(work_dir))

        # Commit and push
        commit_and_push(work_dir, branch_name)

        # Create PR
        pr_url = create_pr(
            work_dir=work_dir,
            branch_name=branch_name,
            base_branch=config.github.base_branch,
            output_files=[output_relative],
            prompt_path=config.research.prompt_path,
        )

        # Notify success
        logger.info("Pipeline completed successfully. PR: %s", pr_url)
        try:
            notify_success(
                pr_url=pr_url,
                output_files=[output_relative],
                region=config.aws_region,
                sender=config.email.sender,
                recipients=config.email.recipients,
            )
        except Exception:
            logger.exception("Failed to send email notification (non-fatal)")

        return 0

    except Exception as e:
        logger.exception("Pipeline failed")
        try:
            notify_failure(
                error=str(e),
                region=config.aws_region,
                sender=config.email.sender,
                recipients=config.email.recipients,
            )
        except Exception:
            logger.exception("Failed to send failure notification")
        return 1


if __name__ == "__main__":
    sys.exit(main())
