output "app_id" {
  description = "Amplify App ID"
  value       = aws_amplify_app.main.id
}

output "default_domain" {
  description = "Amplify default domain"
  value       = aws_amplify_app.main.default_domain
}

output "amplify_role_arn" {
  description = "Amplify IAM role ARN"
  value       = aws_iam_role.amplify.arn
}
