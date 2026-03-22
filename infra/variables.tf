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

variable "vpc_id" {
  description = "Existing VPC ID to use"
  type        = string
  default     = "vpc-0d9cb0c9cd574b7af"
}

variable "github_repo" {
  description = "GitHub repository (owner/repo) for OIDC trust"
  type        = string
  default     = "YuriNakayama/research"
}

variable "schedule_enabled" {
  description = "Whether EventBridge schedule is enabled"
  type        = bool
  default     = false
}
