# =============================================================================
# GitHub App Private Key
# =============================================================================
resource "aws_secretsmanager_secret" "github_app_key" {
  name        = "${var.project}/${var.environment}/github-app-private-key"
  description = "GitHub App private key (PEM format)"

  tags = {
    Name = "${var.project}_${var.environment}_github_app_key"
  }
}

# =============================================================================
# GitHub App Config (App ID, Installation ID)
# =============================================================================
resource "aws_secretsmanager_secret" "github_app_config" {
  name        = "${var.project}/${var.environment}/github-app-config"
  description = "GitHub App configuration (app_id, installation_id)"

  tags = {
    Name = "${var.project}_${var.environment}_github_app_config"
  }
}

