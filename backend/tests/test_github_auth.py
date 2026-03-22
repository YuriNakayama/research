"""Tests for GitHub App authentication."""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

from src.github_auth import _generate_jwt, _get_installation_token, get_github_token


class TestGenerateJWT:
    def test_generates_valid_jwt(self) -> None:
        # RSA key pair for testing
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization

        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode()

        token = _generate_jwt("12345", pem)
        assert isinstance(token, str)
        assert len(token.split(".")) == 3  # JWT has 3 parts


class TestGetInstallationToken:
    @patch("src.github_auth.requests.post")
    def test_returns_token(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.json.return_value = {"token": "ghs_test_token_123"}
        mock_response.raise_for_status = MagicMock()
        mock_post.return_value = mock_response

        token = _get_installation_token("jwt_token", "123456")
        assert token == "ghs_test_token_123"
        mock_post.assert_called_once()

    @patch("src.github_auth.requests.post")
    def test_raises_on_failure(self, mock_post: MagicMock) -> None:
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = Exception("401 Unauthorized")
        mock_post.return_value = mock_response

        with pytest.raises(Exception, match="401"):
            _get_installation_token("bad_jwt", "123456")


class TestGetGithubToken:
    @patch.dict("os.environ", {"GH_TOKEN": "ghp_pat_token"}, clear=False)
    def test_uses_pat_from_env(self) -> None:
        token = get_github_token()
        assert token == "ghp_pat_token"

    @patch("src.github_auth._get_installation_token", return_value="ghs_app_token")
    @patch("src.github_auth._generate_jwt", return_value="jwt_token")
    @patch("src.github_auth._get_secret")
    @patch.dict("os.environ", {}, clear=False)
    def test_uses_app_auth(
        self,
        mock_secret: MagicMock,
        mock_jwt: MagicMock,
        mock_install: MagicMock,
    ) -> None:
        # Remove any existing token env vars
        import os

        os.environ.pop("GH_TOKEN", None)
        os.environ.pop("GITHUB_TOKEN", None)

        mock_secret.side_effect = [
            "-----BEGIN RSA PRIVATE KEY-----\nfake\n-----END RSA PRIVATE KEY-----",
            json.dumps({"app_id": "12345", "installation_id": "67890"}),
        ]

        token = get_github_token()
        assert token == "ghs_app_token"
        assert mock_secret.call_count == 2
