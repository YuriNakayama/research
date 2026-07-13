# Step 5: CI (`ci-frontend.yml`) の更新

## 目的

- バイパス前提の `ALLOW_E2E_BYPASS_IN_PROD` env を撤去。
- Playwright ステップの Cognito 資格情報 env はそのまま
  （auth.setup.ts / webServer が消費する）。

## 変更対象: `.github/workflows/ci-frontend.yml` の "Run Playwright" ステップ

現状:

```yaml
      - name: Run Playwright
        working-directory: frontend
        env:
          NEXT_PUBLIC_COGNITO_USER_POOL_ID: ${{ vars.COGNITO_USER_POOL_ID }}
          NEXT_PUBLIC_COGNITO_APP_CLIENT_ID: ${{ vars.COGNITO_APP_CLIENT_ID }}
          E2E_TEST_USER_EMAIL: ${{ steps.e2e_user.outputs.email }}
          E2E_TEST_USER_PASSWORD: ${{ steps.e2e_user.outputs.password }}
          # CI runs `next start` (NODE_ENV=production) against the build that
          # includes the E2E bypass token — this is an expected CI-only state,
          # so explicitly opt in past the next.config.ts safety valve.
          ALLOW_E2E_BYPASS_IN_PROD: "true"
        run: npx playwright test
```

変更後:

```yaml
      - name: Run Playwright
        working-directory: frontend
        env:
          NEXT_PUBLIC_COGNITO_USER_POOL_ID: ${{ vars.COGNITO_USER_POOL_ID }}
          NEXT_PUBLIC_COGNITO_APP_CLIENT_ID: ${{ vars.COGNITO_APP_CLIENT_ID }}
          E2E_TEST_USER_EMAIL: ${{ steps.e2e_user.outputs.email }}
          E2E_TEST_USER_PASSWORD: ${{ steps.e2e_user.outputs.password }}
        run: npx playwright test
```

- `ALLOW_E2E_BYPASS_IN_PROD: "true"` とそのコメントを削除。
- 資格情報を取得する既存ステップ（"Configure AWS credentials" / "Fetch Cognito E2E test
  user credentials"）は**そのまま**。auth.setup.ts が実 Cognito ログインに使う。

## 検討: `next start` (本番モード) での実 Cognito 認証

CI は `next start`（`NODE_ENV=production`）で走る。バイパス撤去後、middleware は
実 Cognito セッションを要求する。auth.setup.ts が本物のログインを行い storageState を
生成するため、本番モードでも認証済み spec は通る。**追加設定は不要**。

## 完了条件

- [ ] `ci-frontend.yml` に `ALLOW_E2E_BYPASS_IN_PROD` が無い
- [ ] Cognito 変数・資格情報 env は維持
- [ ] `grep -rn "E2E_BYPASS\|ALLOW_E2E_BYPASS" .github/` が 0 件
