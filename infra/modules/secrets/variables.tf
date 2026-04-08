variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "create_e2e_test_user_secret" {
  description = "Whether to provision the Secrets Manager entry for the Cognito E2E test user"
  type        = bool
  default     = false
}

variable "e2e_test_user_email" {
  description = "Email of the Cognito E2E test user"
  type        = string
  default     = ""
}

variable "e2e_test_user_password" {
  description = "Password of the Cognito E2E test user"
  type        = string
  default     = ""
  sensitive   = true
}
