data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# =============================================================================
# ECS Cluster
# =============================================================================
resource "aws_ecs_cluster" "main" {
  name = "${var.project}_${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${var.project}_${var.environment}_cluster"
  }
}

# =============================================================================
# Fargate Security Group
# =============================================================================
resource "aws_security_group" "fargate" {
  name_prefix = "${var.project}_${var.environment}_fargate_"
  description = "Security group for Fargate tasks"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project}_${var.environment}_fargate_sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_egress_rule" "fargate_all" {
  security_group_id = aws_security_group.fargate.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Allow all outbound traffic"
}

# =============================================================================
# Task Execution Role (ECR pull, CloudWatch Logs, Secrets Manager)
# =============================================================================
resource "aws_iam_role" "task_execution" {
  name = "${var.project}_${var.environment}_task_execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project}_${var.environment}_task_execution_role"
  }
}

resource "aws_iam_role_policy_attachment" "task_execution_managed" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_execution_secrets" {
  name = "secrets_access"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          var.github_app_key_secret_arn,
          var.github_app_config_secret_arn
        ]
      }
    ]
  })
}

# =============================================================================
# Task Role (EFS, Secrets Manager)
# =============================================================================
resource "aws_iam_role" "task" {
  name = "${var.project}_${var.environment}_task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project}_${var.environment}_task_role"
  }
}

resource "aws_iam_role_policy" "task_efs" {
  name = "efs_access"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientWrite"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "elasticfilesystem:AccessPointArn" = "arn:aws:elasticfilesystem:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:access-point/${var.efs_access_point_id}"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "task_secrets" {
  name = "secrets_access"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = [
          var.github_app_key_secret_arn,
          var.github_app_config_secret_arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "task_ses" {
  name = "ses_send"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail"]
        Resource = "*"
      }
    ]
  })
}

# =============================================================================
# Task Definition
# =============================================================================
resource "aws_ecs_task_definition" "claude_task" {
  family                   = "${var.project}_${var.environment}_task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  volume {
    name = "claude-config"

    efs_volume_configuration {
      file_system_id     = var.efs_file_system_id
      transit_encryption = "ENABLED"

      authorization_config {
        access_point_id = var.efs_access_point_id
        iam             = "ENABLED"
      }
    }
  }

  container_definitions = jsonencode([
    {
      name      = "claude-task"
      image     = "${var.ecr_repository_url}:latest"
      essential = true

      mountPoints = [
        {
          sourceVolume  = "claude-config"
          containerPath = "/claude-config"
          readOnly      = false
        }
      ]

      environment = [
        {
          name  = "ENVIRONMENT"
          value = var.environment
        },
        {
          name  = "AWS_REGION"
          value = data.aws_region.current.name
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = var.log_group_name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "task"
        }
      }
    }
  ])

  tags = {
    Name = "${var.project}_${var.environment}_task_definition"
  }
}
