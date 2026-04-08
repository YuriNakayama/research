variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "project" {
  description = "Project name used for resource naming"
  type        = string
}

variable "create_e2e_test_user" {
  description = "Whether to create a Cognito user for E2E login tests"
  type        = bool
  default     = false
}

variable "e2e_test_user_email" {
  description = "Email/username for the E2E test user"
  type        = string
  default     = "e2e-test@example.com"
}
