# E2E 認証の storageState 統一

## 背景 / 課題

現在フロントエンドの E2E (Playwright) は **2 つの互いに矛盾する認証機構**に依存している。

1. **`x-e2e-bypass` ヘッダーバイパス** — `playwright.config.ts` の `extraHTTPHeaders`
   でランごとのランダムトークンを全リクエストに付与し、`middleware.ts` がそれを
   検証してミドルウェア認証を丸ごとスキップする。login 以外の全 spec が依存。
2. **実 Cognito ログイン** — `login.spec.ts` だけが `test.use({ extraHTTPHeaders: {} })`
   でバイパスを無効化し、Amplify UI のフォームを実際に操作する。ただし「ログイン成功」
   テストは資格情報が無いと `test.skip` されるため、実運用ではほとんど走らない。

### 問題点

- **本番と E2E で認証経路が乖離**: 大半の spec は Cognito セッションを一切通らない。
  ミドルウェア〜ページ描画の実際の認証統合をテストできていない。
- **バイパス機構が本番に漏れるリスク**: `E2E_BYPASS_TOKEN` / `ALLOW_E2E_BYPASS_IN_PROD`
  / `next.config.ts` の安全弁 / `middleware.ts` のバイパス分岐という保守負債を、
  「本番へ漏れないこと」を祈りながら維持している。
- **spec ごとの認証スタンスがアドホック**: 各 spec が `test.use` でヘッダーを付けたり
  外したりし、認証の意図がファイル横断で散らばっている。

## 方針（採用）

Playwright 標準の **`storageState` + セットアッププロジェクト依存**パターンへ完全移行し、
`x-e2e-bypass` 機構を廃止する。

- `auth.setup.ts` が**実 Cognito ログインを 1 度だけ**実行し、認証済みブラウザ状態を
  `e2e/.auth/user.json` に保存する。
- 認証が必要な全 spec は Playwright の **project dependency** 経由でこの storageState を
  再利用する。個々の spec からは認証コードが消える。
- `login.spec.ts`（＝認証フロー自体を検証する spec）だけは storageState を使わず、
  未認証状態から開始する。
- `middleware.ts` / `next.config.ts` / `ci-frontend.yml` からバイパス関連コードを撤去し、
  **E2E も本番と同一の Cognito 認証経路**を通す。

これにより「認証機構は 1 つ（実 Cognito）」に統一され、本番と E2E の乖離が解消する。

## トレードオフ

- **利点**: 本番同一経路・保守負債の撤去・spec からの認証コード排除・単一の真実。
- **代償**: CI で常に実 Cognito テストユーザー資格情報が必須になる（既に
  `ci-frontend.yml` が Secrets Manager から取得済みなので追加コストは小さい）。
  ローカルでも `E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD` が無いと authenticated
  spec が実行できない → 資格情報未設定時は setup と依存 spec を **skip** し、
  未認証 spec（login フォーム表示・リダイレクト）は引き続き走らせる。

## ローカル実行用のテストユーザー資格情報

ローカルで authenticated spec（`auth.setup.ts` の実 Cognito ログイン）を走らせる際に
使うテストユーザーの資格情報:

| 項目 | 値 |
|------|-----|
| ユーザー名（メール） | `test@example.com` |
| パスワード | `Pass1234` |

このアカウントは **E2E 検証専用**で、実データ・実権限を一切持たない。

### このユーザーは Terraform で管理される（dev のみ固定パスワード）

テストユーザーは `infra/modules/cognito` で作成される。パスワードは通常 Terraform が
自動生成するが、**dev 環境に限り固定値を指定できる**よう `e2e_test_user_password`
変数を用意している（未指定なら自動生成にフォールバック）。ローカルで手打ちログインを
簡単にするため、dev の gitignore 済み `terraform.tfvars` に固定値を設定する:

```hcl
# infra/environments/dev/terraform.tfvars（gitignore 済み。staging/prod では設定しない）
create_e2e_test_user   = true
e2e_test_user_email    = "test@example.com"
e2e_test_user_password = "Pass1234"
```

`terraform apply` すると、この資格情報で Cognito ユーザーが作成され、同じ値が
Secrets Manager（`auto_research/dev/e2e-test-user`）にも保存される。

### ローカルで authenticated spec を実行する

```bash
export E2E_TEST_USER_EMAIL="test@example.com"
export E2E_TEST_USER_PASSWORD="Pass1234"
# Cognito 設定（dev の User Pool / App Client。terraform output で取得可）
export NEXT_PUBLIC_COGNITO_USER_POOL_ID="..."
export NEXT_PUBLIC_COGNITO_APP_CLIENT_ID="..."
npx playwright test
```

> CI（`ci-frontend.yml`）は上記を **Secrets Manager** から取得して注入するため、
> CI 側にこの値を直接記述する必要はない。dev で固定値を使っていても、CI は
> Secrets Manager 経由なので同じ経路で動く。
>
> staging/prod では `e2e_test_user_password` を空のままにし、パスワードを
> 自動生成させる（既知の固定値を本番系に置かない）。

## 実装ステップ

各ステップの詳細は個別ファイル参照。

| # | ファイル | 概要 |
|---|----------|------|
| 1 | `01-auth-setup.md` | `auth.setup.ts` 新設（実 Cognito ログイン → storageState 保存） |
| 2 | `02-playwright-config.md` | `setup` プロジェクト + `storageState` 依存を config に組込、`extraHTTPHeaders` 撤去 |
| 3 | `03-spec-migration.md` | 各 spec から `test.use` 認証コードを撤去、login.spec は未認証プロジェクトへ |
| 4 | `04-remove-bypass.md` | `middleware.ts` / `next.config.ts` からバイパス撤去 |
| 5 | `05-ci-update.md` | `ci-frontend.yml` から `ALLOW_E2E_BYPASS_IN_PROD` を撤去、resolve 済み資格情報を setup へ |
| 6 | `06-verify.md` | 型チェック・lint・ローカル/CI での動作確認 |

## 完了条件 (Definition of Done)

- [ ] `grep -r "e2e-bypass\|E2E_BYPASS\|ALLOW_E2E_BYPASS" frontend/ .github/` が 0 件
- [ ] `e2e/auth.setup.ts` が存在し storageState を生成する
- [ ] 全 authenticated spec が storageState 経由で認証される（spec 内に `extraHTTPHeaders` 無し）
- [ ] `login.spec.ts` は未認証プロジェクトで実 Cognito フローを検証
- [ ] 資格情報が無い環境では authenticated spec が skip され、未認証 spec は成功する
- [ ] `npx tsc --noEmit` / `npx next lint` green
