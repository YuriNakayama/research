#!/bin/bash
# コンテナ起動時に毎回実行される軽量な同期スクリプト
# 依存関係の差分のみを同期するため高速に完了する

set -e

echo "== 依存関係の同期 =="

if [ -d "backend" ]; then
    cd backend && uv sync --quiet && cd ..
    echo "[backend] 同期完了"
fi

echo "== 同期完了 =="
