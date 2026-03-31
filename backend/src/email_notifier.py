"""Email notification via Amazon SES with PDF attachment support."""

from __future__ import annotations

import logging
import os
import re
from dataclasses import dataclass
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import TYPE_CHECKING

import boto3
import markdown

if TYPE_CHECKING:
    from mypy_boto3_ses import SESClient
from fpdf import FPDF
from fpdf.fonts import FontFace

logger = logging.getLogger(__name__)

_JAPANESE_FONT_CANDIDATES: list[tuple[str, int]] = [
    ("/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc", 0),
    ("/System/Library/Fonts/Hiragino Sans GB.ttc", 0),
    ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc", 0),
    ("/usr/share/fonts/noto-cjk/NotoSansCJKjp-Regular.otf", 0),
    ("/usr/share/fonts/truetype/noto/NotoSansCJKjp-Regular.ttf", 0),
]


@dataclass(frozen=True)
class DomainResult:
    """Result of a single domain's daily research execution."""

    domain_name: str
    success: bool
    output_file: Path | None = None
    item_title: str = ""
    error: str = ""


def _find_japanese_font() -> tuple[str, int] | None:
    """Find an available Japanese font. Returns (path, collection_font_number)."""
    for path, index in _JAPANESE_FONT_CANDIDATES:
        if Path(path).exists():
            return path, index
    return None


class _MarkdownPDF(FPDF):
    """Simple PDF generator from Markdown via HTML with Japanese support."""

    def __init__(self) -> None:
        super().__init__()
        self._jp_font_name: str | None = None
        result = _find_japanese_font()
        if result:
            font_path, font_index = result
            self.add_font("JapaneseFont", "", font_path, collection_font_number=font_index)
            self._jp_font_name = "JapaneseFont"
            logger.info("Using Japanese font: %s (index=%d)", font_path, font_index)

    @property
    def default_font_family(self) -> str:
        return self._jp_font_name or "Helvetica"

    def header(self) -> None:
        pass

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font(self.default_font_family, size=8)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")


def _get_ses_client(region: str) -> SESClient:
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


_STRIP_STYLE_TAGS_RE = re.compile(r"</?(?:strong|em|b|i|code)(?:\s[^>]*)?>")
_TH_TO_TD_RE = re.compile(r"<(/?)th(\s[^>]*)?>", re.IGNORECASE)


def _markdown_to_pdf(md_path: Path) -> bytes:
    """Convert a Markdown file to PDF bytes."""
    md_text = md_path.read_text(encoding="utf-8")
    html_body = markdown.markdown(
        md_text,
        extensions=["tables", "fenced_code"],
    )
    html_body = _STRIP_STYLE_TAGS_RE.sub("", html_body)
    html_body = _TH_TO_TD_RE.sub(r"<\1td>", html_body)

    pdf = _MarkdownPDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    font = pdf.default_font_family
    pdf.set_font(font, size=10)
    tag_styles = {
        "h1": FontFace(family=font, size_pt=20),
        "h2": FontFace(family=font, size_pt=16),
        "h3": FontFace(family=font, size_pt=14),
        "h4": FontFace(family=font, size_pt=12),
        "p": FontFace(family=font, size_pt=10),
        "li": FontFace(family=font, size_pt=10),
        "code": FontFace(family=font, size_pt=9),
        "pre": FontFace(family=font, size_pt=9),
    }
    pdf.write_html(html_body, tag_styles=tag_styles, font_family=font)
    return bytes(pdf.output())


def _build_results_body(results: list[DomainResult], pr_url: str) -> str:
    """Build email body text from domain results."""
    success_count = sum(1 for r in results if r.success)
    total = len(results)

    lines = [
        "Daily Research Report",
        "",
        "■ 実行サマリ",
        f"  成功: {success_count} / {total} ドメイン",
        "",
        "■ レポート",
    ]

    for r in results:
        if r.success:
            lines.append(f'  ✓ {r.domain_name}: "{r.item_title}"')
        else:
            lines.append(f"  ✗ {r.domain_name}: {r.error}")

    if pr_url:
        lines.extend(["", "■ PR", f"  {pr_url}"])

    lines.append("")
    return "\n".join(lines)


def notify_research_results(
    results: list[DomainResult],
    pr_url: str = "",
    region: str = "ap-northeast-1",
    sender: str = "",
    recipients: list[str] | None = None,
    work_dir: str | Path | None = None,
) -> None:
    """Send a single email summarizing all domain results."""
    sender = _get_sender(sender)
    recipients = _get_recipients(recipients)
    if not sender or not recipients:
        logger.warning("Email sender or recipients not configured, skipping notification")
        return

    success_count = sum(1 for r in results if r.success)
    total = len(results)

    from datetime import UTC, datetime

    today = datetime.now(tz=UTC).strftime("%Y-%m-%d")
    subject = f"[Daily Research] {today} ({success_count}/{total} domains)"

    body = _build_results_body(results, pr_url)

    attachments: list[tuple[str, bytes]] = []
    if work_dir:
        work_dir = Path(work_dir)
        for r in results:
            if not r.success or not r.output_file:
                continue
            md_file = r.output_file if r.output_file.is_absolute() else work_dir / r.output_file
            if not md_file.exists():
                continue

            attachment_name = f"{r.domain_name}_{md_file.name}"
            md_bytes = md_file.read_bytes()
            attachments.append((attachment_name, md_bytes))
            logger.info("Attached Markdown: %s (%d bytes)", attachment_name, len(md_bytes))

            try:
                pdf_bytes = _markdown_to_pdf(md_file)
                pdf_name = f"{r.domain_name}_{md_file.stem}.pdf"
                attachments.append((pdf_name, pdf_bytes))
                logger.info("Generated PDF: %s (%d bytes)", pdf_name, len(pdf_bytes))
            except Exception:
                logger.exception("Failed to generate PDF for %s", r.domain_name)

    _send(region, sender, recipients, subject, body, attachments=attachments)
    logger.info("Research results notification sent to %d recipients", len(recipients))


def _send(
    region: str,
    sender: str,
    recipients: list[str],
    subject: str,
    body: str,
    attachments: list[tuple[str, bytes]] | None = None,
) -> None:
    """Send an email via SES, using raw email when attachments are present."""
    client = _get_ses_client(region)

    if not attachments:
        client.send_email(
            Source=sender,
            Destination={"ToAddresses": recipients},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": body, "Charset": "UTF-8"}},
            },
        )
        return

    msg = MIMEMultipart("mixed")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(body, "plain", "utf-8"))

    for filename, data in attachments:
        part = MIMEApplication(data, Name=filename)
        part["Content-Disposition"] = f'attachment; filename="{filename}"'
        msg.attach(part)

    client.send_raw_email(
        Source=sender,
        Destinations=recipients,
        RawMessage={"Data": msg.as_string()},
    )
