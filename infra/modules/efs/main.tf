# =============================================================================
# EFS File System
# =============================================================================
resource "aws_efs_file_system" "claude_config" {
  encrypted = true

  tags = {
    Name = "${var.project}_${var.environment}_efs"
  }
}

# =============================================================================
# EFS Mount Targets (one per private subnet)
# =============================================================================
resource "aws_efs_mount_target" "main" {
  count = length(var.private_subnet_ids)

  file_system_id  = aws_efs_file_system.claude_config.id
  subnet_id       = var.private_subnet_ids[count.index]
  security_groups = [aws_security_group.efs.id]
}

# =============================================================================
# EFS Access Point (POSIX UID/GID = 1000 for claude user)
# =============================================================================
resource "aws_efs_access_point" "claude_config" {
  file_system_id = aws_efs_file_system.claude_config.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/claude-config"

    creation_info {
      owner_uid   = 1000
      owner_gid   = 1000
      permissions = "755"
    }
  }

  tags = {
    Name = "${var.project}_${var.environment}_claude_config_ap"
  }
}

# =============================================================================
# Security Group (NFS port 2049 only from Fargate SG)
# =============================================================================
resource "aws_security_group" "efs" {
  name_prefix = "${var.project}_${var.environment}_efs_"
  description = "Allow NFS access from Fargate tasks"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.project}_${var.environment}_efs_sg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_vpc_security_group_ingress_rule" "efs_nfs" {
  security_group_id            = aws_security_group.efs.id
  referenced_security_group_id = var.fargate_sg_id
  from_port                    = 2049
  to_port                      = 2049
  ip_protocol                  = "tcp"
  description                  = "NFS from Fargate tasks"
}
