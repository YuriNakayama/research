# DynamoDB による個人メモ機能

ドキュメント（slug）単位の**個人メモ**を追加する。投稿者本人だけが閲覧できる非公開メモを、
Next.js Route Handler から DynamoDB へ直接読み書きする（Cognito JWT で認可）。

## スコープ

- 対象: リサーチドキュメント表示ページ（`/research/<slug>`）
- 種類: 個人メモ（本人のみ閲覧・編集・削除）
- 実行基盤: Amplify Hosting 上の Next.js Route Handler（新規サービス不要）

## データモデル（DynamoDB）

テーブル: `<project>_<environment>_notes`

| 属性        | 型     | 役割                                              |
|-------------|--------|---------------------------------------------------|
| `pk`        | S (HASH)  | `USER#<cognito_sub>`                            |
| `sk`        | S (RANGE) | `DOC#<slug>#<note_id>`（slug 単位で range query）|
| `note_id`   | S      | ULID 相当（サーバ生成）                            |
| `slug`      | S      | 対象ドキュメント slug                             |
| `body`      | S      | メモ本文（最大長を Zod で制限）                    |
| `created_at`| S      | ISO8601                                           |
| `updated_at`| S      | ISO8601                                           |

- 課金モード: PAY_PER_REQUEST（オンデマンド）
- 暗号化: SSE 有効（AWS 管理キー）
- PITR: 有効
- 本人スコープは `pk = USER#<sub>` で強制。他人の `pk` にはアクセスできない。

## Infra（Terraform 新規モジュール `infra/modules/notes`）

1. `aws_dynamodb_table.notes`（上記スキーマ、SSE / PITR / PAY_PER_REQUEST）
2. Amplify SSR ランタイム用の IAM ロール（**compute role**）
   - 既存 `amplify` サービスロールはビルド/デプロイ用。ランタイム（WEB_COMPUTE）は別ロールが必要。
   - 付与ポリシー: `dynamodb:PutItem/GetItem/Query/DeleteItem/UpdateItem` を **当該テーブル ARN のみ**（least privilege）
   - `aws_amplify_app.compute_role_arn`（または branch 単位）に設定
3. `outputs`: `notes_table_name`, `compute_role_arn`
4. Amplify モジュールへ環境変数 `NOTES_TABLE_NAME`, `NEXT_PUBLIC_AWS_REGION`（既存）を追加

## Backend（Route Handler）

`frontend/src/app/api/notes/route.ts`（＋ `[noteId]/route.ts`）

- `getCurrentUserSub()`: `runWithAmplifyServerContext` + `fetchAuthSession` で ID トークンの `sub` を取得。未認証は 401。
  （middleware で保護済みだが、Route Handler 側でも本人 sub を必ず再取得して pk に使う = 多層防御）
- `lib/notes/dynamo.ts`: DynamoDBDocumentClient を生成（region は env）。
- `lib/notes/schema.ts`: Zod スキーマ（body 長・slug 形式の検証）。
- エンドポイント:
  - `GET  /api/notes?slug=<slug>`  → 本人の当該 slug メモ一覧（Query, `pk=USER#sub` かつ `begins_with(sk, DOC#slug#)`）
  - `POST /api/notes`（body: slug, body） → 作成
  - `PUT  /api/notes/<noteId>`（body: slug, body） → 更新（本人所有を条件付き書き込みで担保）
  - `DELETE /api/notes/<noteId>?slug=<slug>` → 削除
- レスポンスは frontend rules の `ApiResponse<T>` 形式。
- レート制限は将来課題として TODO コメント（個人スコープ・認証済みのため優先度低）。

## Frontend（UI）

- `components/notes/notes-panel.tsx`: メモ一覧・追加フォーム・削除。表示ページのサイドに配置。
- `hooks/use-notes.ts`: fetch/mutation ロジック（Zod で応答検証）。
- `page.tsx` の Markdown 表示分岐に `<NotesPanel slug={currentSlug.join("/")} />` を追加。
- 楽観的更新はせず、成功後に再取得（シンプル優先）。

## テスト

- Unit: `use-notes` フックと Zod スキーマ（fetch モック）。
- E2E: 既存 storageState 認証を使い、メモ投稿→表示→削除の1フロー。
  - DynamoDB 依存を避けるため、E2E では Route Handler をローカルのインメモリ実装へ切替可能にするか、
    テスト用テーブルを使う。まずは**フック単体テスト**を厚めにし、E2E は表示のみに絞る方針で開始。

## 検証

- `frontend/`: `npx tsc --noEmit` / `npx next lint` / `npx next build`
- `infra/`: `terraform fmt` / `terraform validate`

## セキュリティ確認（security.md）

- [ ] 認可: pk を必ずサーバ側 sub から生成（クライアント入力の user id を信用しない）
- [ ] 入力検証: Zod で body/slug を検証
- [ ] IAM: テーブル ARN 限定の least privilege
- [ ] 暗号化: SSE + in-transit（HTTPS）
- [ ] エラーメッセージに内部情報を含めない
- [ ] ハードコードされた秘密情報なし（region/table は env）
