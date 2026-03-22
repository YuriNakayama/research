output "schedule_arn" {
  description = "EventBridge schedule ARN"
  value       = aws_scheduler_schedule.daily_research.arn
}
