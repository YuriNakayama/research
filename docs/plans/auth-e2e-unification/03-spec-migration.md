# Step 3: 各 spec の移行

## 目的

- authenticated spec から認証コード（`test.use({ extraHTTPHeaders })` 等）を撤去。
  → storageState はプロジェクトレベルで注入されるため spec 側は何もしなくてよい。
- `login.spec.ts` を「未認証状態」で走るよう整理する。

## authenticated spec（変更なし、確認のみ）

以下は認証コードを持たず、`extraHTTPHeaders` は config のプロジェクト設定から来ていた。
config 側で storageState を注入するため **spec の変更は不要**。ただし
grep で `extraHTTPHeaders` / `x-e2e-bypass` 参照が残っていないことを確認する。

- `domain.spec.ts`
- `header.spec.ts`
- `home.spec.ts`
- `mobile-toc.spec.ts`
- `palette.spec.ts`
- `report-detail.spec.ts`

## `login.spec.ts` の整理

現状 `login.spec.ts` は先頭で `test.use({ extraHTTPHeaders: {} })` によりバイパスを無効化
していた。バイパス廃止後この行は不要（かつ未定義変数を参照しないよう）撤去する。

login.spec は **未認証状態**から始まる必要がある（リダイレクト・フォーム表示を検証するため）。
storageState を注入する chromium プロジェクトに含めると認証済み状態で始まってしまう。

### 対応方針

`login.spec.ts` の各テストで **storageState を空に上書き**する:

```typescript
import { test, expect } from "@playwright/test";

// login フローの検証は未認証状態から始める必要があるため、プロジェクトの
// storageState を無効化する。
test.use({ storageState: { cookies: [], origins: [] } });

const testUserEmail = process.env.E2E_TEST_USER_EMAIL;
const testUserPassword = process.env.E2E_TEST_USER_PASSWORD;
const hasCredentials = Boolean(testUserEmail && testUserPassword);

test.describe("Login page", () => {
  // ... 既存テスト本体はそのまま（extraHTTPHeaders 依存は無い）
});
```

- 先頭の `test.use({ extraHTTPHeaders: {} })` を
  `test.use({ storageState: { cookies: [], origins: [] } })` に置換する。
- 「real Cognito login」describe 内の `hasCredentials` による `test.skip` は**そのまま維持**。
  auth.setup と役割は重複するが、login.spec は「wrong password でエラー」など
  auth.setup がカバーしない UI 挙動も検証しているため残す。

## 完了条件

- [ ] `grep -rn "extraHTTPHeaders\|x-e2e-bypass" frontend/e2e/` が 0 件
- [ ] `login.spec.ts` が `storageState: { cookies: [], origins: [] }` で未認証開始
- [ ] authenticated spec は無改変（config の storageState で認証される）
