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

# TODO: ai-reception VPCへの依存を解消後、この変数を削除し専用VPCを作成する
variable "vpc_id" {
  description = "Existing VPC ID to use (currently shared with ai-reception-dev)"
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
  default     = true
}
