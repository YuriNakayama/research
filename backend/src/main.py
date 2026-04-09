"""Main entry point for the daily research pipeline."""

from __future__ import annotations

import logging
import os
import re
import sys
import tempfile
from datetime import UTC, datetime
from pathlib import Path

from src.config import DailyDomainConfig, load_config
from src.csv_manager import get_csv_files, get_next_pending_across_files, mark_done
from src.email_notifier import DomainResult, notify_research_results
from src.git_manager import clone_repo, commit_and_push, configure_git, create_branch
from src.github_auth import get_github_token
from src.pr_creator import create_pr
from src.research_runner import run_research

logger = logging.getLogger(__name__)

_SLUG_SAFE_RE = re.compile(r"[^a-z0-9]+")


def _slugify(text: str, max_len: int = 40) -> str:
    """Produce a filesystem-safe slug from arbitrary text."""
    lowered = text.lower()
    slug = _SLUG_SAFE_RE.sub("-", lowered).strip("-")
    if not slug:
        slug = "report"
    return slug[:max_len].rstrip("-") or "report"


def _build_report_url(site_base_url: str, output_relative: Path) -> str:
    """Build the public report URL served by the frontend.

    The frontend's ``/docs/[[...slug]]`` route mirrors the docs directory
    structure, so a report at ``docs/daily/<domain>/reports/<date>/<slug>.md``
    is served at ``<base>/docs/daily/<domain>/reports/<date>/<slug>``.
    """
    base = site_base_url.rstrip("/")
    parts = list(output_relative.with_suffix("").parts)
    # output_relative starts with "docs/..."; map directly under the site.
    return f"{base}/" + "/".join(parts)


def _process_domain(
    domain: DailyDomainConfig,
    work_dir: Path,
    claude_options: str,
    site_base_url: str,
    today: str,
) -> DomainResult:
    """Process a single domain: pick next pending item, run research-retrieval skill.

    Writes only under ``docs/daily/<domain>/`` — never touches ``docs/research/``.
    """
    domain_dir = work_dir / "docs" / "daily" / domain.name
    csv_files = get_csv_files(domain_dir)
    if not csv_files:
        return DomainResult(domain_name=domain.name, success=False, error="No CSV files found")

    picked = get_next_pending_across_files(csv_files)
    if picked is None:
        return DomainResult(domain_name=domain.name, success=False, error="No pending items")
    csv_path, item = picked

    reports_dir = domain_dir / "reports"
    reports_dir.mkdir(parents=True, exist_ok=True)

    # Use a per-day subdirectory so the frontend URL
    # /docs/daily/<domain>/<YYYY-MM-DD> resolves to an index page.
    output_dir = reports_dir / today
    report_files = run_research(
        url=item.url,
        output_dir=output_dir,
        work_dir=work_dir,
        claude_options=claude_options,
    )

    mark_done(csv_path, item.row_index)

    # Rename the first generated file to a slug-based name so multiple runs
    # within the same day remain distinguishable.
    first_report = report_files[0]
    target_name = f"{_slugify(item.title)}.md"
    final_path = first_report.with_name(target_name)
    if final_path != first_report:
        if final_path.exists():
            final_path = first_report.with_name(f"{_slugify(item.title)}-{first_report.stem}.md")
        first_report.rename(final_path)

    output_relative = final_path.relative_to(work_dir)
    report_url = _build_report_url(site_base_url, output_relative)

    return DomainResult(
        domain_name=domain.name,
        success=True,
        output_file=output_relative,
        item_title=item.title,
        item_summary=item.summary,
        report_url=report_url,
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
    today = datetime.now(tz=UTC).strftime("%Y-%m-%d")

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
                result = _process_domain(
                    domain,
                    work_dir,
                    config.daily.claude_options,
                    config.daily.site_base_url,
                    today,
                )
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
