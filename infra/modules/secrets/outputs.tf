output "github_app_key_arn" {
  description = "GitHub App private key secret ARN"
  value       = aws_secretsmanager_secret.github_app_key.arn
}

output "github_app_config_arn" {
  description = "GitHub App config secret ARN"
  value       = aws_secretsmanager_secret.github_app_config.arn
}

output "e2e_test_user_secret_arn" {
  description = "E2E test user credentials secret ARN (empty when disabled)"
  value       = var.create_e2e_test_user_secret ? aws_secretsmanager_secret.e2e_test_user[0].arn : ""
}

