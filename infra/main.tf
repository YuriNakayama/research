terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "auto-research-terraform-state"
    key            = "auto-research/terraform.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
    dynamodb_table = "terraform-lock"
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "AutoResearch"
      ManagedBy   = "Terraform"
    }
  }
}

# =============================================================================
# Load .env file
# =============================================================================
locals {
  # `.env` is gitignored and only present in developer / apply environments.
  # In CI (terraform validate) the file is absent, so fall back to an empty
  # map. Consumers that require a key should fail loudly via lookup(...) or
  # direct indexing at plan/apply time rather than at validate time.
  env_file_raw = fileexists("${path.module}/.env") ? file("${path.module}/.env") : ""
  env_file = { for line in compact(split("\n", local.env_file_raw)) :
    split("=", line)[0] => join("=", slice(split("=", line), 1, length(split("=", line))))
    if !startswith(trimspace(line), "#") && length(trimspace(line)) > 0
  }
}

# =============================================================================
# Secrets Manager
# =============================================================================
module "secrets" {
  source = "./modules/secrets"

  environment = var.environment
  project     = var.project

  # E2E test user credentials. The flag is the same var the cognito module
  # uses, so the secret and the Cognito user are always created together.
  create_e2e_test_user_secret = var.create_e2e_test_user
  e2e_test_user_email         = module.cognito.e2e_test_user_email
  e2e_test_user_password      = module.cognito.e2e_test_user_password
}

# =============================================================================
# Cognito (User authentication)
# =============================================================================
module "cognito" {
  source = "./modules/cognito"

  environment            = var.environment
  project                = var.project
  create_e2e_test_user   = var.create_e2e_test_user
  e2e_test_user_email    = var.e2e_test_user_email
  e2e_test_user_password = var.e2e_test_user_password
}

# =============================================================================
# Amplify (Next.js hosting)
# =============================================================================
module "amplify" {
  source = "./modules/amplify"

  environment           = var.environment
  project               = var.project
  github_repo           = var.github_repo
  github_token          = lookup(local.env_file, "GITHUB_ACCESS_TOKEN", "")
  cognito_user_pool_id  = module.cognito.user_pool_id
  cognito_app_client_id = module.cognito.app_client_id
  domain_name           = var.domain_name
  subdomain_prefix      = var.subdomain_prefix
  enable_custom_domain  = var.enable_custom_domain
}

# =============================================================================
# CI/CD (GitHub Actions OIDC role for E2E secret read)
# =============================================================================
module "cicd" {
  source = "./modules/cicd"

  environment              = var.environment
  project                  = var.project
  github_repo              = var.github_repo
  e2e_test_user_secret_arn = module.secrets.e2e_test_user_secret_arn
  grant_e2e_secret_read    = var.create_e2e_test_user
}
