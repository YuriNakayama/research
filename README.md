# FastAPI Project

## Commands

リモートに存在しないブランチを削除

```bash
git fetch --prune && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs -r git branch -d
```

### 初期設定

```bash
# UVのインストール
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.local/bin/env

uv python pin 3.12

# 依存関係のインストール
uv sync --all-extras --dev

# 仮想環境に入る
source .venv/bin/activate
# jupyter kernelの登録
ipython kernel install --user --name=realtime
```

### サーバーの起動

```bash
uv run uvicorn src.presentation.server:app
```

### クライアントの起動

```bash
uv run python src/presentation/client.py
```
