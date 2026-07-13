# =============================================================================
# GitHub Actions OIDC IAM Role
# =============================================================================
# Federated role assumed by GitHub Actions (via OIDC) so the frontend CI
# (Playwright) can read the Cognito E2E test user credentials from Secrets
# Manager. No container/registry permissions — the backend pipeline has been
# retired, leaving only the viewer (Amplify) and its E2E test flow.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_role" "github_actions" {
  name = "${var.project}_${var.environment}_github_actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
          }
        }
      }
    ]
  })

  tags = {
    Name = "${var.project}_${var.environment}_github_actions_role"
  }
}

# =============================================================================
# GitHub Actions — E2E Secret Read
# =============================================================================
# Allows the GitHub Actions OIDC role to read the Cognito E2E test user
# credentials during Playwright runs in CI. Scoped to the single secret ARN;
# absent when the E2E test user is not provisioned.

resource "aws_iam_role_policy" "github_actions_e2e_secret" {
  count = var.grant_e2e_secret_read ? 1 : 0
  name  = "e2e_test_user_read"
  role  = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = var.e2e_test_user_secret_arn
      }
    ]
  })
}
