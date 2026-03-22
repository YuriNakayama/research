---
description: E2E テスト（Playwright）の状況を確認し、失敗時は原因を特定して修正する
---

# E2E Fix

GitHub Actions 上の E2E テスト（Playwright）の状況を確認し、失敗している場合は原因を特定して修正する。

## 手順

### 1. E2E ワークフローの実行状況を確認

```bash
gh run list --workflow=e2e.yml --limit=5
```

### 2. 失敗している場合はログを確認

```bash
# 失敗した run の詳細ログを取得
gh run view <run-id> --log-failed

# テストレポート（アーティファクト）をダウンロード
gh run download <run-id> -n playwright-report -D /tmp/playwright-report
```

### 3. 失敗原因の分析

#### よくある失敗パターン

| パターン | 原因 | 対処法 |
|---------|------|--------|
| Timeout | ページロード遅延、要素未表示 | waitFor のタイムアウトを調整、セレクタを確認 |
| Element not found | セレクタ変更、DOM 構造変更 | `data-testid` の確認、セレクタ修正 |
| Navigation error | URL 変更、リダイレクト変更 | ルーティング確認 |
| Auth failure | 認証情報の期限切れ | SSM パラメータの確認（要 AWS アクセス） |
| Flaky test | 非同期処理の競合 | `waitForSelector`、`waitForResponse` の追加 |
| Environment issue | デプロイ未完了、サービス停止 | 対象環境の状態を確認 |

### 4. テストコードの確認と修正

```bash
# E2E テストファイルの確認
ls frontend/tests/

# ローカルでの実行（Mockoon モック使用、dev スクリプト経由）
dev/test-frontend

# 特定テストのデバッグ実行
cd frontend && npx playwright test --debug <test-file>

# headed モードで視覚確認
cd frontend && npx playwright test --headed <test-file>
```

### 5. Playwright レポートの確認

```bash
# ダウンロードしたレポートを開く
cd frontend && npx playwright show-report /tmp/playwright-report
```

### 6. 修正後の検証

```bash
# ローカルで全テストを実行（Mockoon 起動 + Playwright）
dev/test-frontend
```

### 7. 修正をコミット・プッシュして再実行

ユーザーに確認の上、修正をコミットしてプッシュする。

## E2E テスト環境

| 環境 | フロントエンド URL | バックエンド URL | 認証情報 |
|------|-------------------|-----------------|---------|
| dev | SSM: `/ai-reception-dev/frontend-url` | SSM: `/ai-reception-dev/backend-url` | SSM (暗号化) |
| stg | SSM: `/ai-reception-stg/frontend-url` | SSM: `/ai-reception-stg/backend-url` | SSM (暗号化) |
| prod | SSM: `/ai-reception-prod/frontend-url` | SSM: `/ai-reception-prod/backend-url` | SSM (暗号化) |

## 注意事項

- Playwright レポート（アーティファクト）は 7 日間保持される
- CI では chromium と webkit のみ実行（firefox は除外）
- ローカルテストは Mockoon モックサーバー使用、CI E2E は実環境に接続
- フレーキーテストは根本原因を修正し、リトライに頼らない
- **全出力は日本語で記載する**
