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
