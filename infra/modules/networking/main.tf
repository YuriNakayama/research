# =============================================================================
# Use existing VPC (shared with ai-reception)
#
# TODO: ai-reception VPCへの依存を解消し、専用VPCに移行する
#   - VPC数の上限緩和申請（現在5/5で上限到達）
#   - 専用VPC + サブネット + NAT Gatewayを作成（月額+$32程度）
#   - EFS マウントターゲット、ECS タスクのサブネット/SGを新VPCに切り替え
#   - 移行後、vpc_id変数のデフォルト値と本ファイルのdata sourceを更新
# =============================================================================
data "aws_vpc" "main" {
  id = var.vpc_id
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }

  tags = {
    Name = "*public*"
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }

  tags = {
    Name = "*private*"
  }
}
