variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository (owner/repo)"
  type        = string
}

variable "ecr_repository_arn" {
  description = "ECR repository ARN"
  type        = string
}

variable "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  type        = string
  default     = ""
}

variable "task_definition_arn" {
  description = "ECS task definition ARN (without revision)"
  type        = string
  default     = ""
}

variable "task_execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
  default     = ""
}

variable "task_role_arn" {
  description = "ECS task role ARN"
  type        = string
  default     = ""
}

variable "log_group_name" {
  description = "CloudWatch log group name"
  type        = string
  default     = ""
}

variable "e2e_test_user_secret_arn" {
  description = "Secrets Manager ARN for Cognito E2E test user credentials"
  type        = string
  default     = ""
}

variable "grant_e2e_secret_read" {
  description = "Whether to attach the policy that lets GitHub Actions read the E2E test user secret"
  type        = bool
  default     = false
}
