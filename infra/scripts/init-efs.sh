#!/bin/bash
# =============================================================================
# EFS Initial Setup: Claude CLI Authentication
#
# This script launches a temporary Fargate task to log in to Claude CLI
# and persist the credentials on EFS.
#
# Prerequisites:
#   - Terraform infrastructure deployed (Step 1-4)
#   - Docker image pushed to ECR (Step 8)
#   - AWS CLI configured with appropriate permissions
#
# Usage:
#   ./init-efs.sh <cluster-name> <task-definition> <subnet-id> <security-group-id>
#
# Example:
#   ./init-efs.sh auto_research_dev auto_research_dev_task subnet-xxx sg-xxx
# =============================================================================
set -euo pipefail

CLUSTER="${1:?Usage: $0 <cluster> <task-def> <subnet> <sg>}"
TASK_DEF="${2:?Usage: $0 <cluster> <task-def> <subnet> <sg>}"
SUBNET="${3:?Usage: $0 <cluster> <task-def> <subnet> <sg>}"
SG="${4:?Usage: $0 <cluster> <task-def> <subnet> <sg>}"

echo "=== EFS Initial Setup ==="
echo "Cluster: $CLUSTER"
echo "Task Definition: $TASK_DEF"
echo ""
echo "This will launch a Fargate task with an interactive shell."
echo "You need to run 'claude login' inside the container to set up credentials."
echo ""

# Launch interactive task using ECS Exec
echo "Starting Fargate task..."
TASK_ARN=$(aws ecs run-task \
    --cluster "$CLUSTER" \
    --task-definition "$TASK_DEF" \
    --launch-type FARGATE \
    --enable-execute-command \
    --network-configuration "awsvpcConfiguration={subnets=[$SUBNET],securityGroups=[$SG],assignPublicIp=DISABLED}" \
    --overrides '{"containerOverrides":[{"name":"claude-task","command":["sleep","3600"]}]}' \
    --query 'tasks[0].taskArn' \
    --output text)

echo "Task started: $TASK_ARN"
echo "Waiting for task to be running..."

aws ecs wait tasks-running --cluster "$CLUSTER" --tasks "$TASK_ARN"

echo ""
echo "Task is running. Connecting via ECS Exec..."
echo "Once connected, run the following commands:"
echo "  1. ln -sfn /claude-config/.claude \$HOME/.claude"
echo "  2. claude login"
echo "  3. Verify: ls -la /claude-config/.claude/"
echo "  4. exit"
echo ""

aws ecs execute-command \
    --cluster "$CLUSTER" \
    --task "$TASK_ARN" \
    --container "claude-task" \
    --interactive \
    --command "/bin/bash"

echo ""
echo "Stopping task..."
aws ecs stop-task --cluster "$CLUSTER" --task "$TASK_ARN" > /dev/null

echo "=== Setup complete ==="
echo "Claude credentials should now be stored on EFS at /claude-config/.claude/"
