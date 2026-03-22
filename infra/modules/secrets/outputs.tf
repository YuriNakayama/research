output "github_app_key_arn" {
  description = "GitHub App private key secret ARN"
  value       = aws_secretsmanager_secret.github_app_key.arn
}

output "github_app_config_arn" {
  description = "GitHub App config secret ARN"
  value       = aws_secretsmanager_secret.github_app_config.arn
}

