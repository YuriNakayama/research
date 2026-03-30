variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "project" {
  description = "Project name used for resource naming"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository (owner/repo)"
  type        = string
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  type        = string
}

variable "cognito_app_client_id" {
  description = "Cognito App Client ID"
  type        = string
}

variable "dynamodb_table_name" {
  description = "DynamoDB reports table name"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "DynamoDB reports table ARN"
  type        = string
}

variable "github_token" {
  description = "GitHub Personal Access Token for Amplify"
  type        = string
  sensitive   = true
  default     = ""
}
