output "user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "app_client_id" {
  description = "Cognito App Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

output "e2e_test_user_email" {
  description = "Email of the Cognito E2E test user (empty when disabled)"
  value       = var.create_e2e_test_user ? var.e2e_test_user_email : ""
}

output "e2e_test_user_password" {
  description = "Password of the Cognito E2E test user (sensitive, empty when disabled)"
  value       = var.create_e2e_test_user ? random_password.e2e_test_user[0].result : ""
  sensitive   = true
}
