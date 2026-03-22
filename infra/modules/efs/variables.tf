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
  description = "Private subnet IDs for mount targets"
  type        = list(string)
}

variable "fargate_sg_id" {
  description = "Security group ID of Fargate tasks (for NFS ingress)"
  type        = string
}
