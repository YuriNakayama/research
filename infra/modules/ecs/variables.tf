variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for Fargate tasks"
  type        = list(string)
}

variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
}

variable "efs_file_system_id" {
  description = "EFS file system ID"
  type        = string
}

variable "efs_access_point_id" {
  description = "EFS access point ID"
  type        = string
}

variable "github_app_key_secret_arn" {
  description = "ARN of GitHub App private key secret"
  type        = string
}

variable "github_app_config_secret_arn" {
  description = "ARN of GitHub App config secret"
  type        = string
}

variable "log_group_name" {
  description = "CloudWatch log group name"
  type        = string
}
