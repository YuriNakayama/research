variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  type        = string
}

variable "task_definition_arn" {
  description = "ECS task definition ARN"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs"
  type        = list(string)
}

variable "fargate_sg_id" {
  description = "Fargate security group ID"
  type        = string
}

variable "task_execution_role_arn" {
  description = "Task execution role ARN (for PassRole)"
  type        = string
}

variable "task_role_arn" {
  description = "Task role ARN (for PassRole)"
  type        = string
}

variable "schedule_enabled" {
  description = "Whether the schedule is enabled"
  type        = bool
  default     = false
}
