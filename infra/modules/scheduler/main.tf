data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# =============================================================================
# EventBridge Scheduler IAM Role
# =============================================================================
resource "aws_iam_role" "scheduler" {
  name = "${var.project}_${var.environment}_scheduler"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "scheduler.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project}_${var.environment}_scheduler_role"
  }
}

resource "aws_iam_role_policy" "scheduler_ecs" {
  name = "ecs_run_task"
  role = aws_iam_role.scheduler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:RunTask"
        ]
        Resource = [
          var.task_definition_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "iam:PassRole"
        ]
        Resource = [
          var.task_execution_role_arn,
          var.task_role_arn
        ]
      }
    ]
  })
}

# =============================================================================
# EventBridge Schedule (daily at JST 09:00 = UTC 00:00)
# =============================================================================
resource "aws_scheduler_schedule" "daily_research" {
  name       = "${var.project}_${var.environment}_daily_research"
  group_name = "default"
  state      = var.schedule_enabled ? "ENABLED" : "DISABLED"

  schedule_expression          = "cron(0 0 * * ? *)"
  schedule_expression_timezone = "Asia/Tokyo"

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = var.ecs_cluster_arn
    role_arn = aws_iam_role.scheduler.arn

    ecs_parameters {
      task_definition_arn = var.task_definition_arn
      launch_type         = "FARGATE"
      task_count          = 1
      platform_version    = "LATEST"

      network_configuration {
        assign_public_ip = false
        subnets          = var.private_subnet_ids
        security_groups  = [var.fargate_sg_id]
      }
    }

    retry_policy {
      maximum_event_age_in_seconds = 3600
      maximum_retry_attempts       = 2
    }
  }
}
