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

# =============================================================================
# E2E Test User Credentials (Cognito)
# =============================================================================
# Created only when both email and password are supplied (i.e. the cognito
# module's `create_e2e_test_user` flag is on). CI reads this secret at Playwright
# startup to drive the real login test.

resource "aws_secretsmanager_secret" "e2e_test_user" {
  count       = var.create_e2e_test_user_secret ? 1 : 0
  name        = "${var.project}/${var.environment}/e2e-test-user"
  description = "Cognito E2E test user credentials (email + password)"

  tags = {
    Name = "${var.project}_${var.environment}_e2e_test_user"
  }
}

resource "aws_secretsmanager_secret_version" "e2e_test_user" {
  count     = var.create_e2e_test_user_secret ? 1 : 0
  secret_id = aws_secretsmanager_secret.e2e_test_user[0].id
  secret_string = jsonencode({
    email    = var.e2e_test_user_email
    password = var.e2e_test_user_password
  })
}

