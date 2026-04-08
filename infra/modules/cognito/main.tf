# =============================================================================
# Cognito — User Authentication
# =============================================================================

resource "aws_cognito_user_pool" "main" {
  name = "${var.project}_${var.environment}_users"

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  auto_verified_attributes = ["email"]

  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true

    string_attribute_constraints {
      min_length = 1
      max_length = 256
    }
  }

  tags = {
    Name = "${var.project}_${var.environment}_user_pool"
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project}_${var.environment}_web_client"
  user_pool_id = aws_cognito_user_pool.main.id

  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    # Required so Playwright / CI can drive InitiateAuth with plain credentials
    # when verifying the real login flow end-to-end.
    "ALLOW_USER_PASSWORD_AUTH",
  ]

  prevent_user_existence_errors = "ENABLED"
}

# =============================================================================
# E2E test user
# =============================================================================
# Created only when `create_e2e_test_user = true`. The password is generated
# here and surfaced via a sensitive output so the root module can push it into
# Secrets Manager. It is never written to plain .tfvars or logs.

resource "random_password" "e2e_test_user" {
  count   = var.create_e2e_test_user ? 1 : 0
  length  = 24
  special = true
  # Cognito's default password policy forbids certain characters in URL contexts;
  # keep the set conservative.
  override_special = "!@#$%^&*()-_=+"
}

resource "aws_cognito_user" "e2e_test_user" {
  count        = var.create_e2e_test_user ? 1 : 0
  user_pool_id = aws_cognito_user_pool.main.id
  username     = var.e2e_test_user_email

  attributes = {
    email          = var.e2e_test_user_email
    email_verified = "true"
  }

  # Permanent password so the user is in CONFIRMED state and can log in
  # without going through a FORCE_CHANGE_PASSWORD challenge in tests.
  password = random_password.e2e_test_user[0].result

  message_action = "SUPPRESS"

  lifecycle {
    ignore_changes = [password]
  }
}
