"""Local pipeline integration test.

Runs the daily research pipeline locally without git/GitHub operations.
Tests: CSV read → research-retrieval skill execution → report save → email send.

Usage:
    cd backend
    uv run python scripts/test_pipeline_local.py
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import DailyDomainConfig
from src.csv_manager import get_csv_files, get_next_pending, mark_done
from src.email_notifier import DomainResult, notify_research_results
from src.research_runner import run_research

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# --- Configuration ---
REPO_ROOT = Path(__file__).resolve().parent.parent.parent  # project root
DOMAIN = DailyDomainConfig(name="legal_tech")
SENDER = "yuri620620@gmail.com"
RECIPIENTS = ["yuri620620@gmail.com"]
AWS_REGION = "ap-northeast-1"


def main() -> int:
    logger.info("=== Local Pipeline Integration Test ===")
    logger.info("Repo root: %s", REPO_ROOT)

    # Step 1: CSV read
    domain_dir = REPO_ROOT / "docs" / "daily" / DOMAIN.name
    csv_files = get_csv_files(domain_dir)
    if not csv_files:
        logger.error("No CSV files found in %s/list/", domain_dir)
        return 1

    logger.info("Found %d CSV file(s)", len(csv_files))

    item = None
    csv_path = None
    for csv_file in csv_files:
        item = get_next_pending(csv_file)
        if item:
            csv_path = csv_file
            break

    if item is None or csv_path is None:
        logger.error("No pending items found")
        return 1

    logger.info("Next pending: %s (row %d)", item.title, item.row_index)
    logger.info("URL: %s", item.url)

    # Step 2: Run research-retrieval skill
    output_dir = domain_dir / "report"

    logger.info("Running research-retrieval skill... (this may take several minutes)")
    try:
        report_files = run_research(
            url=item.url,
            output_dir=output_dir,
            work_dir=REPO_ROOT,
            timeout=600,  # 10 minutes for test
        )
    except Exception:
        logger.exception("Research-retrieval skill failed")
        result = DomainResult(domain_name=DOMAIN.name, success=False, error="Skill execution failed")
        notify_research_results(
            results=[result],
            region=AWS_REGION,
            sender=SENDER,
            recipients=RECIPIENTS,
        )
        return 1

    logger.info("Generated %d report file(s)", len(report_files))
    for f in report_files:
        logger.info("  - %s (%d bytes)", f.name, f.stat().st_size)

    # Step 3: Mark done in CSV
    mark_done(csv_path, item.row_index)
    logger.info("CSV updated: row %d marked as done", item.row_index)

    # Step 4: Send email
    first_report = report_files[0]
    output_relative = first_report.relative_to(REPO_ROOT)
    result = DomainResult(
        domain_name=DOMAIN.name,
        success=True,
        output_file=output_relative,
        item_title=item.title,
    )

    logger.info("Sending email to %s", RECIPIENTS)
    notify_research_results(
        results=[result],
        region=AWS_REGION,
        sender=SENDER,
        recipients=RECIPIENTS,
        work_dir=REPO_ROOT,
    )

    logger.info("=== Pipeline test completed successfully ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
