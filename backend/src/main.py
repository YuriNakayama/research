"""Main entry point for the daily research pipeline."""

from __future__ import annotations

import logging
import os
import sys
import tempfile
from pathlib import Path

from src.config import DailyDomainConfig, load_config
from src.csv_manager import get_csv_files, get_next_pending, mark_done
from src.email_notifier import DomainResult, notify_research_results
from src.git_manager import clone_repo, commit_and_push, configure_git, create_branch
from src.github_auth import get_github_token
from src.pr_creator import create_pr
from src.research_runner import run_research

logger = logging.getLogger(__name__)


def _process_domain(
    domain: DailyDomainConfig,
    work_dir: Path,
    claude_options: str,
) -> DomainResult:
    """Process a single domain: pick next pending item, run research-retrieval skill."""
    domain_dir = work_dir / "docs" / "daily" / domain.name
    csv_files = get_csv_files(domain_dir)
    if not csv_files:
        return DomainResult(domain_name=domain.name, success=False, error="No CSV files found")

    item = None
    csv_path = None
    for csv_file in csv_files:
        item = get_next_pending(csv_file)
        if item:
            csv_path = csv_file
            break

    if item is None or csv_path is None:
        return DomainResult(domain_name=domain.name, success=False, error="No pending items")

    output_dir = domain_dir / "report"
    report_files = run_research(
        url=item.url,
        output_dir=output_dir,
        work_dir=work_dir,
        claude_options=claude_options,
    )

    mark_done(csv_path, item.row_index)

    first_report = report_files[0]
    output_relative = first_report.relative_to(work_dir)
    return DomainResult(
        domain_name=domain.name,
        success=True,
        output_file=output_relative,
        item_title=item.title,
    )


def main() -> int:
    """Run the daily research pipeline."""
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
        git_branch = os.environ.get("GIT_BRANCH")
        logger.info("Cloning %s (branch: %s)", repo_url, git_branch or "default")
        clone_repo(repo_url, work_dir, token=token, branch=git_branch)
        configure_git(work_dir)
        branch_name = create_branch(work_dir, prefix=config.daily.branch_prefix)

        # Process each domain
        results: list[DomainResult] = []
        for domain in config.daily.domains:
            logger.info("Processing domain: %s", domain.name)
            try:
                result = _process_domain(domain, work_dir, config.daily.claude_options)
                results.append(result)
            except Exception as e:
                logger.exception("Domain %s failed", domain.name)
                results.append(DomainResult(domain_name=domain.name, success=False, error=str(e)))

        # Git operations if any domain succeeded
        pr_url = ""
        if any(r.success for r in results):
            commit_and_push(work_dir, branch_name)
            pr_url = create_pr(
                work_dir=work_dir,
                branch_name=branch_name,
                base_branch=config.github.base_branch,
                results=results,
            )
            logger.info("PR created: %s", pr_url)

        # Send aggregated notification
        try:
            notify_research_results(
                results=results,
                pr_url=pr_url,
                region=config.aws_region,
                sender=config.email.sender,
                recipients=config.email.recipients,
                work_dir=work_dir,
            )
        except Exception:
            logger.exception("Failed to send email notification (non-fatal)")

        return 0 if any(r.success for r in results) else 1

    except Exception as e:
        logger.exception("Pipeline failed")
        try:
            notify_research_results(
                results=[DomainResult(domain_name="pipeline", success=False, error=str(e))],
                region=config.aws_region,
                sender=config.email.sender,
                recipients=config.email.recipients,
            )
        except Exception:
            logger.exception("Failed to send failure notification")
        return 1


if __name__ == "__main__":
    sys.exit(main())
