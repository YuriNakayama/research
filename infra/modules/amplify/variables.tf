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

variable "github_token" {
  description = "GitHub Personal Access Token for Amplify"
  type        = string
  sensitive   = true
  default     = ""
}

variable "domain_name" {
  description = "Custom domain name for Amplify app (e.g. avifauna.click)"
  type        = string
  default     = ""
}

variable "subdomain_prefix" {
  description = "Subdomain prefix for Amplify app (e.g. owl -> owl.avifauna.click)"
  type        = string
  default     = ""
}

variable "enable_custom_domain" {
  description = "Whether to enable custom domain for Amplify app"
  type        = bool
  default     = false
}

variable "preview_branches" {
  description = "Additional (non-production) git branches to host on Amplify, e.g. feature branches. Each gets its own Amplify branch + build."
  type        = list(string)
  default     = []
}

variable "compute_role_arn" {
  description = "IAM role ARN assumed by the Next.js SSR (WEB_COMPUTE) runtime for DynamoDB access. Empty disables the runtime role."
  type        = string
  default     = ""
}

variable "notes_table_name" {
  description = "DynamoDB table name for personal notes, exposed to the SSR runtime as NOTES_TABLE_NAME."
  type        = string
  default     = ""
}
