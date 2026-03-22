#!/bin/bash

# Claude Code セットアップスクリプト
# Codespace起動時にClaude Codeの認証を設定します
# エラーが発生してもCodespace起動を妨げないように設計されています

set +e

# ============================================
# カラー定義
# ============================================
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "================================================"
echo "  Claude Code セットアップ"
echo "================================================"
echo ""

# ============================================
# CLI の存在確認
# ============================================
if ! command -v claude &> /dev/null; then
    echo -e "${RED}⚠️  警告${NC}"
    echo "Claude CLI がインストールされていません"
    echo ""
    echo "インストール手順:"
    echo "  npm install -g @anthropic-ai/claude-code"
    echo ""
    echo "================================================"
    exit 0
fi

# ============================================
# 動作確認
# ============================================
CLAUDE_VERSION=$(claude --version 2>&1)
if [ $? -ne 0 ]; then
    echo -e "${RED}⚠️  Claude Code の動作確認に失敗しました${NC}"
    echo "$CLAUDE_VERSION"
    echo "================================================"
    exit 0
fi

echo "   バージョン: ${CLAUDE_VERSION}"
echo ""

# ============================================
# 認証方法の判定
# ============================================
if [ -n "$ANTHROPIC_API_KEY" ]; then
    # API Key 方式: シェルプロファイルに永続化
    if ! grep -q "ANTHROPIC_API_KEY" "$HOME/.bashrc" 2>/dev/null; then
        echo "export ANTHROPIC_API_KEY=\"${ANTHROPIC_API_KEY}\"" >> "$HOME/.bashrc"
    fi
    echo -e "${GREEN}✅ Claude Code セットアップ完了${NC}"
    echo "   認証方式: API Key (ANTHROPIC_API_KEY)"

elif [ -f "$HOME/.claude/.credentials.json" ]; then
    # 既存のOAuth認証情報がある場合
    echo -e "${GREEN}✅ Claude Code セットアップ完了${NC}"
    echo "   認証方式: OAuth (既存の認証情報を使用)"

else
    # 認証情報なし → 両方の方法を案内
    echo -e "${YELLOW}🔑 Claude Code の認証が必要です${NC}"
    echo ""
    echo -e "${BLUE}方法1: Max/Pro/Team プラン (OAuth ログイン)${NC}"
    echo "  ターミナルで 'claude' を実行し、表示されるURLを"
    echo "  ブラウザで開いてログインしてください"
    echo "  (URLが表示されたら 'c' キーでコピーできます)"
    echo ""
    echo -e "${BLUE}方法2: API Key${NC}"
    echo "  1. API Key を取得: https://console.anthropic.com/settings/keys"
    echo "  2. Codespaces Secrets に追加: https://github.com/settings/codespaces"
    echo "     シークレット名: ANTHROPIC_API_KEY"
    echo "  3. Codespace を再起動"
fi

echo ""
echo "================================================"
exit 0
