output "github_actions_role_arn" {
  description = "IAM role ARN for GitHub Actions"
  value       = module.cicd.github_actions_role_arn
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = module.cognito.user_pool_id
}

output "cognito_app_client_id" {
  description = "Cognito App Client ID"
  value       = module.cognito.app_client_id
}

output "amplify_app_id" {
  description = "Amplify App ID"
  value       = module.amplify.app_id
}

output "amplify_default_domain" {
  description = "Amplify default domain"
  value       = module.amplify.default_domain
}

output "amplify_custom_domain_url" {
  description = "Amplify custom domain URL"
  value       = module.amplify.custom_domain_url
}

output "e2e_test_user_secret_arn" {
  description = "ARN of the Secrets Manager entry holding E2E test user credentials (empty when disabled)"
  value       = module.secrets.e2e_test_user_secret_arn
}
