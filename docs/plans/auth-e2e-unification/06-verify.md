# Step 6: 検証

## 静的チェック

```bash
cd frontend
npx tsc --noEmit
npx next lint
```

## バイパス残存の検出（0 件であること）

```bash
grep -rn "e2e-bypass\|E2E_BYPASS\|ALLOW_E2E_BYPASS\|isE2EBypassAllowed\|extraHTTPHeaders" \
  frontend/src frontend/e2e frontend/playwright.config.ts frontend/next.config.ts .github/
```

## ローカル動作確認（資格情報あり）

```bash
cd frontend
export E2E_TEST_USER_EMAIL=...      # dev の Cognito テストユーザー
export E2E_TEST_USER_PASSWORD=...
export NEXT_PUBLIC_COGNITO_USER_POOL_ID=...
export NEXT_PUBLIC_COGNITO_APP_CLIENT_ID=...
npx playwright test
```

期待:
- `setup` プロジェクトが実 Cognito ログイン → `e2e/.auth/user.json` 生成。
- `chromium` / `mobile-chrome` が storageState で認証済み状態のまま各 spec 実行。
- `login.spec.ts` は storageState 無効化により未認証開始し、リダイレクト/フォームを検証。

## ローカル動作確認（資格情報なし）

```bash
cd frontend
unset E2E_TEST_USER_EMAIL E2E_TEST_USER_PASSWORD
npx playwright test login.spec.ts --project=chromium
```

期待:
- `setup` が skip → authenticated 依存 spec は storageState 不在で実行不可（意図通り）。
- login.spec の未認証テスト（フォーム表示・リダイレクト）は成功、実 Cognito テストは skip。

> 注: 資格情報なしで全 spec を回すと authenticated プロジェクトが storageState 不在で
> 失敗する。この構成は「CI では常に資格情報あり」を前提とする（README 参照）。
> ローカルで login のみ確認したい場合は上記のように `login.spec.ts` を明示実行する。

## CI 確認

- PR を作成し `CI Frontend` ワークフローが green になること。
- Playwright report アーティファクトで setup → authenticated → login の順に成功を確認。

## 完了条件（README の DoD 再掲）

- [ ] バイパス関連 grep が全て 0 件
- [ ] `auth.setup.ts` が storageState を生成
- [ ] authenticated spec は storageState 経由で認証
- [ ] `login.spec.ts` は未認証で実 Cognito フロー検証
- [ ] 型チェック・lint green
