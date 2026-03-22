"""Email notification via Amazon SES."""

from __future__ import annotations

import logging
import os

import boto3

logger = logging.getLogger(__name__)


def _get_ses_client(region: str) -> boto3.client:
    """Create SES client."""
    return boto3.client("ses", region_name=region)


def _get_recipients(config_recipients: list[str] | None = None) -> list[str]:
    """Get recipient list from environment or config."""
    env_recipients = os.environ.get("EMAIL_RECIPIENTS")
    if env_recipients:
        return [r.strip() for r in env_recipients.split(",") if r.strip()]
    return config_recipients or []


def _get_sender(config_sender: str = "") -> str:
    """Get sender email from environment or config."""
    return os.environ.get("EMAIL_SENDER", config_sender)


def notify_success(
    pr_url: str,
    output_files: list[str],
    region: str = "ap-northeast-1",
    sender: str = "",
    recipients: list[str] | None = None,
) -> None:
    """Send a success notification email."""
    sender = _get_sender(sender)
    recipients = _get_recipients(recipients)
    if not sender or not recipients:
        logger.warning("Email sender or recipients not configured, skipping notification")
        return

    files_text = "\n".join(f"  - {f}" for f in output_files)
    subject = "[Auto Research] Report generated successfully"
    body = (
        "Auto Research Pipeline completed successfully.\n\n"
        f"PR: {pr_url}\n\n"
        f"Output files:\n{files_text}\n"
    )

    _send(region, sender, recipients, subject, body)
    logger.info("Success notification sent to %d recipients", len(recipients))


def notify_failure(
    error: str,
    region: str = "ap-northeast-1",
    sender: str = "",
    recipients: list[str] | None = None,
) -> None:
    """Send a failure notification email."""
    sender = _get_sender(sender)
    recipients = _get_recipients(recipients)
    if not sender or not recipients:
        logger.warning("Email sender or recipients not configured, skipping notification")
        return

    subject = "[Auto Research] Pipeline failed"
    body = (
        "Auto Research Pipeline failed.\n\n"
        f"Error: {error}\n\n"
        "Check CloudWatch Logs for details.\n"
    )

    _send(region, sender, recipients, subject, body)
    logger.info("Failure notification sent to %d recipients", len(recipients))


def _send(region: str, sender: str, recipients: list[str], subject: str, body: str) -> None:
    """Send an email via SES."""
    client = _get_ses_client(region)
    client.send_email(
        Source=sender,
        Destination={"ToAddresses": recipients},
        Message={
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body": {"Text": {"Data": body, "Charset": "UTF-8"}},
        },
    )
