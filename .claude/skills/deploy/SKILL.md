---
description: GitHub Actions 上の CD ワークフローを実行し、デプロイする
---

# Deploy (Continuous Deployment)

GitHub Actions 上のバックエンド（ECS Fargate）とフロントエンド（AWS Amplify）の CD ワークフローを実行し、デプロイする。

## 手順

### 1. 現在の状態を確認

```bash
git branch --show-current
git log --oneline -5
```

### 2. デプロイ対象の環境を確認

ブランチに基づく自動判定:

| ブランチ | 環境 | Backend CD | Frontend CD |
|---------|------|-----------|-------------|
| `develop` | dev | ✅ push 時自動 | ❌ 手動のみ |
| `release/*` | stg | ✅ push 時自動 | ✅ push 時自動 |
| `main` | prod | ✅ push 時自動 | ❌ 手動のみ |

### 3. デプロイ対象を選択

ユーザーに以下を確認:
- **デプロイ対象**: backend / frontend / both
- **環境**: dev / stg / prod

### 4. デプロイ実行

```bash
# dev スクリプトでデプロイ
dev/deploy backend dev        # バックエンドを dev にデプロイ
dev/deploy frontend stg       # フロントエンドを stg にデプロイ
dev/deploy both dev           # 両方を dev にデプロイ
```

**Backend CD のフロー:**
1. Docker イメージをビルド
2. Amazon ECR にプッシュ（タグ: `latest` + `<commit-sha>`）
3. ECS タスク定義を更新
4. ECS サービスをデプロイ（サービス安定性を待機）
5. 失敗時は前のタスク定義に自動ロールバック

**Frontend CD のフロー:**
1. Amplify ブランチをセットアップ（未作成の場合は作成）
2. Amplify デプロイジョブをトリガー
3. デプロイ完了を待機（最大 30 分）

**Frontend CD のフロー:**
1. Amplify ブランチをセットアップ（未作成の場合は作成）
2. Amplify デプロイジョブをトリガー
3. デプロイ完了を待機（最大 30 分）
4. ステータス確認（SUCCEED / FAILED / CANCELLED）

### 6. デプロイ状況の監視

```bash
# Backend デプロイの進捗確認
gh run view <run-id> --log

# Frontend デプロイの進捗確認
gh run view <run-id> --log
```

### 7. デプロイ後の確認

```bash
# Backend ヘルスチェック
curl -s https://api.<env>.legal-ai-reception.click/health

# デプロイされたイメージの確認
gh run view <run-id> --json jobs --jq '.jobs[] | {name, conclusion}'
```

### 8. デプロイ失敗時の対応

```bash
# 失敗ログの確認
gh run view <run-id> --log-failed

# Backend: ECS ロールバックは自動実行される
# Frontend: Amplify の前回デプロイにロールバックするには再デプロイが必要
```

## 注意事項

- **prod デプロイは必ずユーザーの明示的な承認を得てから実行する**
- Backend のデプロイ失敗時は前のタスク定義に自動ロールバックされる
- Frontend の Amplify デプロイは最大 30 分かかる場合がある
- `workflow_dispatch` による手動実行には対象ブランチの `--ref` 指定が必要
- デプロイ前に対応する CI が全て通過していることを確認する
- **全出力は日本語で記載する**
