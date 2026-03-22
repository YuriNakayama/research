#!/bin/bash
set -euo pipefail

echo "=== Auto Research Pipeline ==="
echo "Starting at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"

# Ensure uv-managed venv is on PATH
export PATH="/app/.venv/bin:$PATH"

# 1. Link Claude config from EFS to home directory
if [ -d "/claude-config/.claude" ]; then
    ln -sfn /claude-config/.claude "$HOME/.claude"
    echo "Linked Claude config from EFS"
else
    echo "WARNING: /claude-config/.claude not found on EFS"
fi

# 2. Get GitHub token via App authentication
echo "Obtaining GitHub token..."
export GH_TOKEN=$(python -m src.github_auth)

# 3. Run the main pipeline
echo "Running research pipeline..."
python -m src.main
exit_code=$?

echo "=== Pipeline finished with exit code $exit_code ==="
exit $exit_code
