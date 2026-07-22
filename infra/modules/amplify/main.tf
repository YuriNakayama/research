# =============================================================================
# Amplify — Next.js Hosting
# =============================================================================

data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

resource "aws_amplify_app" "main" {
  name         = "${var.project}-${var.environment}-viewer"
  repository   = "https://github.com/${var.github_repo}"
  platform     = "WEB_COMPUTE"
  access_token = var.github_token

  iam_service_role_arn = aws_iam_role.amplify.arn

  # IAM role assumed by the SSR (WEB_COMPUTE) runtime for DynamoDB access.
  # Distinct from iam_service_role_arn (build/deploy). Empty => unset.
  compute_role_arn = var.compute_role_arn != "" ? var.compute_role_arn : null

  build_spec = <<-YAML
    version: 1
    applications:
      - appRoot: frontend
        frontend:
          phases:
            preBuild:
              commands:
                - cp -r ../research ./research
                - curl -fsSL https://bun.sh/install | bash
                - export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH"
                - bun install --frozen-lockfile
            build:
              commands:
                - export PATH="$HOME/.bun/bin:$PATH"
                - bunx next build
          artifacts:
            baseDirectory: .next
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
              - .next/cache/**/*
              - $HOME/.bun/install/cache/**/*
  YAML

  environment_variables = {
    NEXT_PUBLIC_AWS_REGION            = data.aws_region.current.name
    NEXT_PUBLIC_COGNITO_USER_POOL_ID  = var.cognito_user_pool_id
    NEXT_PUBLIC_COGNITO_APP_CLIENT_ID = var.cognito_app_client_id
    AMPLIFY_MONOREPO_APP_ROOT         = "frontend"
    NOTES_TABLE_NAME                  = var.notes_table_name
  }

  tags = {
    Name = "${var.project}_${var.environment}_amplify_app"
  }
}

# Variables the SSR (WEB_COMPUTE) runtime reads from process.env at request
# time. App-level environment_variables are supplied to the BUILD only —
# NEXT_PUBLIC_* survive because Next.js inlines them into the bundle at build
# time, but a plain server-side lookup like process.env.NOTES_TABLE_NAME finds
# nothing unless the variable is also set on the branch. Without this the notes
# API fails every write with "NOTES_TABLE_NAME is not configured".
locals {
  runtime_environment_variables = {
    NODE_ENV         = "production"
    NOTES_TABLE_NAME = var.notes_table_name
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = "main"
  stage       = "PRODUCTION"
  framework   = "Next.js - SSR"

  environment_variables = local.runtime_environment_variables
}

# Non-production preview branches (feature branches). Inherit the app-level
# environment variables (Cognito config etc.) for the build; runtime values
# must be repeated here for the same reason as above.
resource "aws_amplify_branch" "preview" {
  for_each = toset(var.preview_branches)

  app_id      = aws_amplify_app.main.id
  branch_name = each.value
  stage       = "DEVELOPMENT"
  framework   = "Next.js - SSR"

  environment_variables = local.runtime_environment_variables
}

# =============================================================================
# IAM Role for Amplify
# =============================================================================

resource "aws_iam_role" "amplify" {
  name = "${var.project}_${var.environment}_amplify_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "amplify.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.project}_${var.environment}_amplify_role"
  }
}

resource "aws_iam_role_policy_attachment" "amplify_managed" {
  role       = aws_iam_role.amplify.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}

# =============================================================================
# Custom Domain
# =============================================================================

resource "aws_amplify_domain_association" "main" {
  count = var.enable_custom_domain ? 1 : 0

  app_id      = aws_amplify_app.main.id
  domain_name = var.domain_name

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = var.subdomain_prefix
  }

  wait_for_verification = true
}
