# =============================================================================
# DynamoDB — Personal notes
# =============================================================================
# Per-document personal notes. Ownership is enforced by the partition key
# (`pk = USER#<cognito_sub>`); a user can only ever read/write items under
# their own partition. The application (Next.js Route Handler) sets the pk
# from the verified Cognito session, never from client input.
#
# Key design:
#   pk = "USER#<cognito_sub>"
#   sk = "DOC#<slug>#<note_id>"   -> begins_with(sk, "DOC#<slug>#") lists a
#                                    single document's notes for one user.

resource "aws_dynamodb_table" "notes" {
  name         = "${var.project}_${var.environment}_notes"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "pk"
  range_key    = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  server_side_encryption {
    enabled = true
  }

  tags = {
    Name = "${var.project}_${var.environment}_notes"
    Role = "PersonalNotes"
  }
}

# =============================================================================
# IAM — Amplify SSR compute role
# =============================================================================
# The Next.js WEB_COMPUTE runtime assumes this role at request time. It is
# distinct from the Amplify *service* role (which handles builds/deploys).
# Scope is least-privilege: only the notes table, only the item operations the
# Route Handler performs.

resource "aws_iam_role" "amplify_compute" {
  name = "${var.project}_${var.environment}_amplify_compute_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "amplify.amazonaws.com"
      }
    }]
  })

  tags = {
    Name = "${var.project}_${var.environment}_amplify_compute_role"
  }
}

resource "aws_iam_role_policy" "notes_access" {
  name = "${var.project}_${var.environment}_notes_access"
  role = aws_iam_role.amplify_compute.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
      ]
      Resource = aws_dynamodb_table.notes.arn
    }]
  })
}
