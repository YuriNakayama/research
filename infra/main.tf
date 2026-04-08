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
  env_file = { for line in compact(split("\n", file("${path.module}/.env"))) :
    split("=", line)[0] => join("=", slice(split("=", line), 1, length(split("=", line))))
    if !startswith(trimspace(line), "#") && length(trimspace(line)) > 0
  }
}

# =============================================================================
# Networking
# =============================================================================
module "networking" {
  source = "./modules/networking"

  environment = var.environment
  project     = var.project
}

# =============================================================================
# EFS (Claude CLI credentials persistence)
# =============================================================================
module "efs" {
  source = "./modules/efs"

  environment        = var.environment
  project            = var.project
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  fargate_sg_id      = module.ecs.fargate_sg_id
}

# =============================================================================
# ECR (Docker image repository)
# =============================================================================
module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
  project     = var.project
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
# ECS (Fargate cluster and task definition)
# =============================================================================
module "ecs" {
  source = "./modules/ecs"

  environment                  = var.environment
  project                      = var.project
  vpc_id                       = module.networking.vpc_id
  private_subnet_ids           = module.networking.private_subnet_ids
  ecr_repository_url           = module.ecr.repository_url
  efs_file_system_id           = module.efs.file_system_id
  efs_access_point_id          = module.efs.access_point_id
  github_app_key_secret_arn    = module.secrets.github_app_key_arn
  github_app_config_secret_arn = module.secrets.github_app_config_arn
  log_group_name               = module.monitoring.log_group_name
}

# =============================================================================
# EventBridge Scheduler
# =============================================================================
module "scheduler" {
  source = "./modules/scheduler"

  environment             = var.environment
  project                 = var.project
  ecs_cluster_arn         = module.ecs.cluster_arn
  task_definition_arn     = module.ecs.task_definition_arn
  public_subnet_ids       = module.networking.public_subnet_ids
  fargate_sg_id           = module.ecs.fargate_sg_id
  task_execution_role_arn = module.ecs.task_execution_role_arn
  task_role_arn           = module.ecs.task_role_arn
  schedule_enabled        = var.schedule_enabled
}

# =============================================================================
# Monitoring (CloudWatch)
# =============================================================================
module "monitoring" {
  source = "./modules/monitoring"

  environment = var.environment
  project     = var.project
}

# =============================================================================
# Cognito (User authentication)
# =============================================================================
module "cognito" {
  source = "./modules/cognito"

  environment          = var.environment
  project              = var.project
  create_e2e_test_user = var.create_e2e_test_user
  e2e_test_user_email  = var.e2e_test_user_email
}

# =============================================================================
# Amplify (Next.js hosting)
# =============================================================================
module "amplify" {
  source = "./modules/amplify"

  environment           = var.environment
  project               = var.project
  github_repo           = var.github_repo
  github_token          = local.env_file["GITHUB_ACCESS_TOKEN"]
  cognito_user_pool_id  = module.cognito.user_pool_id
  cognito_app_client_id = module.cognito.app_client_id
  domain_name           = var.domain_name
  subdomain_prefix      = var.subdomain_prefix
  enable_custom_domain  = var.enable_custom_domain
}

# =============================================================================
# CI/CD (GitHub Actions OIDC role for ECR push)
# =============================================================================
module "cicd" {
  source = "./modules/cicd"

  environment              = var.environment
  project                  = var.project
  github_repo              = var.github_repo
  ecr_repository_arn       = module.ecr.repository_arn
  ecs_cluster_arn          = module.ecs.cluster_arn
  task_definition_arn      = module.ecs.task_definition_arn
  task_execution_role_arn  = module.ecs.task_execution_role_arn
  task_role_arn            = module.ecs.task_role_arn
  log_group_name           = module.monitoring.log_group_name
  e2e_test_user_secret_arn = module.secrets.e2e_test_user_secret_arn
  grant_e2e_secret_read    = var.create_e2e_test_user
}
