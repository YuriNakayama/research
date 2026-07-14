output "table_name" {
  description = "Name of the personal notes DynamoDB table"
  value       = aws_dynamodb_table.notes.name
}

output "table_arn" {
  description = "ARN of the personal notes DynamoDB table"
  value       = aws_dynamodb_table.notes.arn
}

output "compute_role_arn" {
  description = "IAM role ARN assumed by the Amplify SSR (WEB_COMPUTE) runtime"
  value       = aws_iam_role.amplify_compute.arn
}
