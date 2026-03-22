#!/bin/bash
# コンテナ初回作成時に実行されるセットアップスクリプト
# 依存関係のインストールと Claude Code のセットアップを行う

set -e

echo "== Codespace 初期セットアップ =="

# dev/setup に委譲
bash dev/setup

# ============================================
# Claude Code セットアップ
# ============================================
if [ -f ".devcontainer/scripts/claude-auto-login.sh" ]; then
    bash .devcontainer/scripts/claude-auto-login.sh
fi

echo ""
echo "== セットアップ完了 =="
echo "起動コマンド:"
echo "  dev/start-frontend  # フロントエンド (port 3000)"
echo "  dev/start-backend   # バックエンド   (port 8000)"
echo ""
