"""Configuration loader for research pipeline."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

import yaml


@dataclass(frozen=True)
class ResearchConfig:
    prompt_path: str
    output_dir: str
    branch_prefix: str = "research/auto"
    claude_options: str = ""
    skill: str = ""


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
    research: ResearchConfig
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

    research_raw = raw.get("research", {})
    github_raw = raw.get("github", {})
    email_raw = raw.get("email", {})

    research = ResearchConfig(
        prompt_path=os.environ.get("RESEARCH_PROMPT_PATH", research_raw.get("prompt_path", "")),
        output_dir=os.environ.get("RESEARCH_OUTPUT_DIR", research_raw.get("output_dir", "")),
        branch_prefix=os.environ.get("RESEARCH_BRANCH_PREFIX", research_raw.get("branch_prefix", "research/auto")),
        claude_options=os.environ.get("RESEARCH_CLAUDE_OPTIONS", research_raw.get("claude_options", "")),
        skill=os.environ.get("RESEARCH_SKILL", research_raw.get("skill", "")),
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
        research=research,
        github=github,
        email=email,
        environment=os.environ.get("ENVIRONMENT", "dev"),
        aws_region=os.environ.get("AWS_REGION", "ap-northeast-1"),
    )
