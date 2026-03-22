# =============================================================================
# ECR Repository
# =============================================================================
resource "aws_ecr_repository" "task" {
  name                 = "${var.project}-${var.environment}-task"
  image_tag_mutability = "MUTABLE"
  force_delete         = false

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project}_${var.environment}_ecr"
  }
}

# =============================================================================
# Lifecycle Policy (keep latest 5 images)
# =============================================================================
resource "aws_ecr_lifecycle_policy" "task" {
  repository = aws_ecr_repository.task.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 5 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 5
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
