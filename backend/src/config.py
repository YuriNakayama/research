"""Configuration loader for research pipeline."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml


@dataclass(frozen=True)
class DailyDomainConfig:
    name: str


@dataclass(frozen=True)
class DailyConfig:
    domains: list[DailyDomainConfig] = field(default_factory=list)
    branch_prefix: str = "daily"
    claude_options: str = ""
    site_base_url: str = "https://owl.avifauna.click"


@dataclass(frozen=True)
class GitHubConfig:
    repo: str
    base_branch: str = "main"


@dataclass(frozen=True)
class EmailConfig:
    sender: str = ""
    recipients: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class AppConfig:
    daily: DailyConfig
    github: GitHubConfig
    email: EmailConfig
    environment: str = "dev"
    aws_region: str = "ap-northeast-1"


def load_config(config_path: str | Path | None = None) -> AppConfig:
    """Load configuration from YAML file with environment variable overrides."""
    if config_path is None:
        config_path = os.environ.get("CONFIG_PATH", "config/research-config.yaml")

    config_path = Path(config_path)
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found: {config_path}")

    with open(config_path) as f:
        raw = yaml.safe_load(f)

    daily_raw = raw.get("daily", {})
    github_raw = raw.get("github", {})
    email_raw = raw.get("email", {})

    domains_raw = daily_raw.get("domains", [])
    domains = [DailyDomainConfig(name=d["name"]) for d in domains_raw]

    daily = DailyConfig(
        domains=domains,
        branch_prefix=os.environ.get("DAILY_BRANCH_PREFIX", daily_raw.get("branch_prefix", "daily")),
        claude_options=os.environ.get("DAILY_CLAUDE_OPTIONS", daily_raw.get("claude_options", "")),
        site_base_url=os.environ.get(
            "DAILY_SITE_BASE_URL",
            daily_raw.get("site_base_url", "https://owl.avifauna.click"),
        ),
    )

    github = GitHubConfig(
        repo=os.environ.get("GITHUB_REPO", github_raw.get("repo", "")),
        base_branch=os.environ.get("GITHUB_BASE_BRANCH", github_raw.get("base_branch", "main")),
    )

    env_recipients = os.environ.get("EMAIL_RECIPIENTS")
    recipients = (
        [r.strip() for r in env_recipients.split(",") if r.strip()]
        if env_recipients
        else email_raw.get("recipients", [])
    )
    email = EmailConfig(
        sender=os.environ.get("EMAIL_SENDER", email_raw.get("sender", "")),
        recipients=recipients,
    )

    return AppConfig(
        daily=daily,
        github=github,
        email=email,
        environment=os.environ.get("ENVIRONMENT", "dev"),
        aws_region=os.environ.get("AWS_REGION", "ap-northeast-1"),
    )
