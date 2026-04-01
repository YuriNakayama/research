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

  build_spec = <<-YAML
    version: 1
    applications:
      - appRoot: frontend
        frontend:
          phases:
            preBuild:
              commands:
                - cp -r ../docs ./docs
                - npm ci
            build:
              commands:
                - npx next build
          artifacts:
            baseDirectory: .next
            files:
              - '**/*'
          cache:
            paths:
              - node_modules/**/*
              - .next/cache/**/*
  YAML

  environment_variables = {
    NEXT_PUBLIC_AWS_REGION              = data.aws_region.current.name
    NEXT_PUBLIC_COGNITO_USER_POOL_ID    = var.cognito_user_pool_id
    NEXT_PUBLIC_COGNITO_APP_CLIENT_ID   = var.cognito_app_client_id
    AMPLIFY_MONOREPO_APP_ROOT           = "frontend"
  }

  tags = {
    Name = "${var.project}_${var.environment}_amplify_app"
  }
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.main.id
  branch_name = "main"
  stage       = "PRODUCTION"
  framework   = "Next.js - SSR"

  environment_variables = {
    NODE_ENV = "production"
  }
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
