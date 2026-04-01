#!/bin/bash
# .env の値を TF_VAR_ 環境変数に変換して terraform を実行する
# Usage: ./scripts/tfenv.sh plan|apply|destroy [options...]
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$INFRA_DIR/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found" >&2
  exit 1
fi

# .env を読み込み
set -a
source "$ENV_FILE"
set +a

# .env キー → TF_VAR_ マッピング
export TF_VAR_github_token="${GITHUB_ACCESS_TOKEN:-}"

cd "$INFRA_DIR"
exec terraform "$@"
