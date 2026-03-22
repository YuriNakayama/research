# Devcontainer Configuration（スマホ向け軽量版）

このディレクトリには、GitHub Codespaces用の開発環境設定が含まれています。
**スマホでの使用を想定した軽量版**です。

## 設計方針

- **軽量化**: ビルド時間を最小化するため、不要なパッケージ・拡張機能を削除
- **スマホ最適化**: 小さいフォントサイズで画面を有効活用
- **必要十分**: Git操作、ファイル閲覧、簡単な編集、テスト追加、サーバー起動に必要な機能のみ

## ファイル構成

- **`devcontainer.json`** - Codespace設定（スマホ向け軽量版）
- **`Dockerfile`** - コンテナイメージのビルド定義（最小構成）
- **`post-create.sh`** - コンテナ初回作成時のセットアップ（`dev/setup` に委譲）
- **`post-start.sh`** - コンテナ起動時の依存関係同期（高速）

## インストールされる拡張機能（極限軽量・Claude特化）

- **Claude Code** - Claude AI支援
- **Cline** - AIコーディングアシスタント

**削除した拡張機能**（ビルド時間最小化のため）:
- GitHub Copilot / Copilot Chat（Claude系のみに集約）
- Python拡張機能（シンタックスハイライトは基本機能で対応）
- Ruff（リンター/フォーマッター）
- ESLint/Prettier（フォーマット）
- Tailwind CSS（IntelliSense）

**理由**: スマホでのコーディングはClaudeベースのAIアシスタントに任せ、人間は確認と承認に専念

## 自動セットアップ

`post-create.sh`が以下を自動実行:

1. フロントエンド依存関係のインストール（`npm install`）
2. バックエンド依存関係のインストール（`uv sync`）
3. `.env`ファイルのテンプレート作成

## ポート転送

- **3000**: Next.js フロントエンド
- **8000**: FastAPI バックエンド

## 開発コマンド

`dev/` ディレクトリのスクリプトで統一的に操作できます:

```bash
dev/setup          # 環境初期化（.env コピー + 依存関係インストール）
dev/start-frontend # フロントエンド起動 (port 3000)
dev/start-backend  # バックエンド起動   (port 8000)
dev/lint        # 全体の lint/format
dev/test        # 全体のテスト実行
```

## エディタ設定（スマホ向け）

- フォントサイズ: 6（画面を有効活用）
- パンくずリスト: 無効（画面スペース節約）
- ミニマップ: 無効
- 自動フォーマット: 有効

## 軽量化のポイント

### Dockerfileの最適化（マルチステージビルド）

**採用技術**:
- **マルチステージビルド**: ビルドステージと実行ステージを分離
- **node:20-bookworm-slim**: 標準版より約200MB軽量なベースイメージ
- **--no-install-recommends**: 推奨パッケージをスキップ

**削除したパッケージ**:
- `python3.12-dev`: 実行時に不要（一部パッケージのコンパイルには必要だが、ほとんど使わない）
- `build-essential`: 実行時に不要
- `vim`, `nano`, `wget`, `jq`, `pkg-config`, `gnupg`, `lsb-release`: 不要

**効果**: Dockerイメージサイズ -30-40%、ビルド時間 -20-30%

### featuresから削除したもの
- `Terraform`: インフラ操作をCodespaceで行わない
- `GitHub CLI`: 基本的なgitコマンドで十分

### VS Code拡張機能（極限軽量・Claude特化）
**削除**:
- `GitHub.copilot`, `GitHub.copilot-chat`: Claude系に集約
- `ms-python.python`: 基本的なシンタックスハイライトはVS Code標準で対応
- `charliermarsh.ruff`: AIがフォーマット・リント
- `dbaeumer.vscode-eslint`: AIがリント
- `esbenp.prettier-vscode`: AIがフォーマット
- `bradlc.vscode-tailwindcss`: IntelliSense不要

**残存**: Claude Code、Cline のみ（2個）

## トラブルシューティング

### 依存関係のインストールに失敗する

```bash
bash .devcontainer/post-create.sh
```

### 拡張機能が見つからない

拡張機能が存在しない場合は自動的にスキップされます。
必要な場合は手動でインストールしてください。

### ビルドが遅い場合

さらに軽量化するには:
1. `devcontainer.json`の`extensions`を減らす
2. `Dockerfile`の`build-essential`を削除（コンパイルが必要ない場合）
