"""Tests for configuration loader."""

from __future__ import annotations

import os
from pathlib import Path
from unittest.mock import patch

import pytest

from src.config import AppConfig, load_config


@pytest.fixture
def config_file(tmp_path: Path) -> Path:
    config = tmp_path / "research-config.yaml"
    config.write_text("""
research:
  prompt_path: "docs/research/prompt.md"
  output_dir: "docs/research/output"
  branch_prefix: "research/auto"
  claude_options: "--verbose"
  skill: ""

github:
  repo: "owner/repo"
  base_branch: "main"

email:
  sender: "test@example.com"
  recipients:
    - "user1@example.com"
    - "user2@example.com"
""")
    return config


def test_load_config_from_file(config_file: Path) -> None:
    config = load_config(config_file)

    assert isinstance(config, AppConfig)
    assert config.research.prompt_path == "docs/research/prompt.md"
    assert config.research.output_dir == "docs/research/output"
    assert config.research.branch_prefix == "research/auto"
    assert config.research.claude_options == "--verbose"
    assert config.github.repo == "owner/repo"
    assert config.github.base_branch == "main"
    assert config.email.sender == "test@example.com"
    assert config.email.recipients == ["user1@example.com", "user2@example.com"]


def test_load_config_file_not_found() -> None:
    with pytest.raises(FileNotFoundError):
        load_config("/nonexistent/config.yaml")


def test_env_var_overrides(config_file: Path) -> None:
    env_overrides = {
        "RESEARCH_PROMPT_PATH": "override/prompt.md",
        "GITHUB_REPO": "other/repo",
        "EMAIL_SENDER": "override@example.com",
        "EMAIL_RECIPIENTS": "a@example.com, b@example.com",
        "ENVIRONMENT": "prod",
    }
    with patch.dict(os.environ, env_overrides, clear=False):
        config = load_config(config_file)

    assert config.research.prompt_path == "override/prompt.md"
    assert config.github.repo == "other/repo"
    assert config.email.sender == "override@example.com"
    assert config.email.recipients == ["a@example.com", "b@example.com"]
    assert config.environment == "prod"


def test_default_values(tmp_path: Path) -> None:
    config = tmp_path / "minimal.yaml"
    config.write_text("""
research:
  prompt_path: "prompt.md"
  output_dir: "output"

github:
  repo: "owner/repo"
""")
    result = load_config(config)

    assert result.research.branch_prefix == "research/auto"
    assert result.github.base_branch == "main"
    assert result.email.sender == ""
    assert result.email.recipients == []
    assert result.environment == "dev"
