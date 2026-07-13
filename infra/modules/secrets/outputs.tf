output "e2e_test_user_secret_arn" {
  description = "E2E test user credentials secret ARN (empty when disabled)"
  value       = var.create_e2e_test_user_secret ? aws_secretsmanager_secret.e2e_test_user[0].arn : ""
}

