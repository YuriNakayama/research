# =============================================================================
# CloudWatch Log Group
# =============================================================================
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project}_${var.environment}"
  retention_in_days = 30

  tags = {
    Name = "${var.project}_${var.environment}_log_group"
  }
}
