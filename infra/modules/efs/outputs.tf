output "file_system_id" {
  description = "EFS file system ID"
  value       = aws_efs_file_system.claude_config.id
}

output "access_point_id" {
  description = "EFS access point ID for Claude config"
  value       = aws_efs_access_point.claude_config.id
}

output "security_group_id" {
  description = "EFS security group ID"
  value       = aws_security_group.efs.id
}
