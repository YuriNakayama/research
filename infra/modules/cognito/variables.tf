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

variable "e2e_test_user_password" {
  description = <<-EOT
    Fixed password for the E2E test user. Leave empty (the default) to have
    Terraform generate a strong random password instead. A fixed value is only
    intended for non-production environments where a known credential makes
    local manual login convenient; production/staging should leave this empty
    so the password stays random and never appears in tfvars.
  EOT
  type        = string
  default     = ""
  sensitive   = true
}
