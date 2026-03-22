output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

output "ecs_cluster_arn" {
  description = "ECS cluster ARN"
  value       = module.ecs.cluster_arn
}

output "efs_file_system_id" {
  description = "EFS file system ID"
  value       = module.efs.file_system_id
}

output "log_group_name" {
  description = "CloudWatch log group name"
  value       = module.monitoring.log_group_name
}

output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions"
  value       = module.cicd.github_actions_role_arn
}
