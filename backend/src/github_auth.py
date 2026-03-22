"""GitHub App authentication: JWT generation and installation token retrieval."""

from __future__ import annotations

import json
import logging
import os
import time

import jwt
import requests

logger = logging.getLogger(__name__)


def _get_secret(secret_name: str, region: str) -> str:
    """Retrieve a secret from AWS Secrets Manager."""
    import boto3

    client = boto3.client("secretsmanager", region_name=region)
    response = client.get_secret_value(SecretId=secret_name)
    return response["SecretString"]


def _generate_jwt(app_id: str, private_key: str) -> str:
    """Generate a JWT for GitHub App authentication (valid for 10 minutes)."""
    now = int(time.time())
    payload = {
        "iat": now - 60,
        "exp": now + (10 * 60),
        "iss": app_id,
    }
    return jwt.encode(payload, private_key, algorithm="RS256")


def _get_installation_token(jwt_token: str, installation_id: str) -> str:
    """Exchange JWT for an installation access token (valid for 1 hour)."""
    response = requests.post(
        f"https://api.github.com/app/installations/{installation_id}/access_tokens",
        headers={
            "Authorization": f"Bearer {jwt_token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["token"]


def get_github_token(region: str = "ap-northeast-1", environment: str = "dev", project: str = "auto_research") -> str:
    """Get a GitHub token, using App auth in AWS or PAT locally."""
    pat = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if pat:
        logger.info("Using existing GitHub token from environment")
        return pat

    logger.info("Generating GitHub App installation token")
    secret_prefix = f"{project}/{environment}"

    private_key = _get_secret(f"{secret_prefix}/github-app-private-key", region)
    config_raw = _get_secret(f"{secret_prefix}/github-app-config", region)
    config = json.loads(config_raw)

    app_id = config["app_id"]
    installation_id = config["installation_id"]

    jwt_token = _generate_jwt(app_id, private_key)
    token = _get_installation_token(jwt_token, installation_id)
    logger.info("GitHub installation token obtained successfully")
    return token


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    token = get_github_token(
        region=os.environ.get("AWS_REGION", "ap-northeast-1"),
        environment=os.environ.get("ENVIRONMENT", "dev"),
    )
    print(token)
