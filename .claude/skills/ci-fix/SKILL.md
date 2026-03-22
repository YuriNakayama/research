---
description: CI パイプライン状況を確認し、失敗時は原因を特定して修正する
---

# CI Fix

バックエンド・フロントエンドの CI パイプライン状況を確認し、失敗している場合は原因を特定して修正する。

## 手順

### 1. 現在のブランチと PR を確認

```bash
git branch --show-current
gh pr view --json number,title,state,statusCheckRollup
```

### 2. CI ワークフローの実行状況を確認

```bash
# 最新の CI 実行を確認
gh run list --workflow=ci-backend.yml --limit=3
gh run list --workflow=ci-frontend.yml --limit=3
```

### 3. 失敗している場合はログを確認

```bash
# 失敗した run の詳細ログを取得
gh run view <run-id> --log-failed
```

### 4. 失敗原因の分析と修正

#### Backend CI 失敗パターン

| ステップ | 確認コマンド | 修正方法 |
|---------|------------|---------|
| ruff format | `dev/test-backend` (format check 含む) | `dev/format` |
| ruff check | `dev/lint` | `dev/lint` (--fix 付き) |
| mypy | `dev/lint` (mypy 含む) | 型エラーを修正 |
| pytest | `dev/test-backend` | テスト失敗を修正 |

#### Frontend CI 失敗パターン

| ステップ | 確認コマンド | 修正方法 |
|---------|------------|---------|
| type-check | `dev/test-frontend` (type-check 含む) | 型エラーを修正 |
| format:check | `dev/test-frontend` (format:check 含む) | `dev/format` |
| lint | `dev/lint` | lint エラーを修正 |
| Playwright | `dev/test-frontend` (Mockoon + Playwright 含む) | テスト失敗を修正 |

### 5. 修正後のローカル検証

```bash
# Backend（format check → lint → type check → pytest）
dev/test-backend

# Frontend（type-check → format:check → lint → Mockoon + Playwright）
dev/test-frontend
```

### 6. 修正をコミット・プッシュして CI を再実行

ユーザーに確認の上、修正をコミットしてプッシュする。

## 注意事項

- CI の失敗原因を必ずログから特定してから修正する
- ローカルで再現・検証してから修正をプッシュする
- 複数の失敗がある場合は優先度順に対応（format → lint → type → test）
- **全出力は日本語で記載する**
