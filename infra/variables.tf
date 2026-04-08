variable "region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project" {
  description = "Project name used for resource naming"
  type        = string
  default     = "auto_research"
}

variable "github_repo" {
  description = "GitHub repository (owner/repo) for OIDC trust"
  type        = string
  default     = "YuriNakayama/research"
}

variable "github_token" {
  description = "GitHub Personal Access Token for Amplify"
  type        = string
  sensitive   = true
  default     = ""
}

variable "schedule_enabled" {
  description = "Whether EventBridge schedule is enabled"
  type        = bool
  default     = true
}

variable "domain_name" {
  description = "Custom domain name for Amplify app (e.g. avifauna.click)"
  type        = string
  default     = "avifauna.click"
}

variable "subdomain_prefix" {
  description = "Subdomain prefix for Amplify app (e.g. owl -> owl.avifauna.click)"
  type        = string
  default     = "owl"
}

variable "enable_custom_domain" {
  description = "Whether to enable custom domain for Amplify app"
  type        = bool
  default     = true
}

variable "create_e2e_test_user" {
  description = "Whether to create a Cognito user + Secrets Manager entry for E2E login tests"
  type        = bool
  default     = false
}

variable "e2e_test_user_email" {
  description = "Email/username for the Cognito E2E test user"
  type        = string
  default     = "e2e-test@example.com"
}
