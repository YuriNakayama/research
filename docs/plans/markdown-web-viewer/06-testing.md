# Markdownウェブビューア — テスト戦略

## テストアプローチ

E2Eテストを主軸とし、重要なライブラリユーティリティにユニットテストを追加する。短納期の制約から、UI コンポーネントの個別ユニットテストは省略し、E2Eで主要フローを網羅する。

## E2Eテスト (Playwright)

### 対象シナリオ

| # | シナリオ | ビューポート | 説明 |
|---|---------|-------------|------|
| 1 | ログイン → トップ → 一覧 → 詳細 | デスクトップ (1280x720) | 主要フローの基本動作確認 |
| 2 | モバイル閲覧フロー | モバイル (375x667) | モバイルレイアウト、ハンバーガーメニュー、フローティングTOC |
| 3 | ダークモード切替 | デスクトップ + モバイル | テーマ切替の動作、コントラスト比の確認 |
| 4 | 目次ナビゲーション | デスクトップ | TOCクリックでセクションにスクロール、アクティブ項目ハイライト |
| 5 | モバイルTOCドロワー | モバイル (375x667) | フローティングボタン → ドロワーTOC → セクションジャンプ |
| 6 | Markdownレンダリング品質 | デスクトップ | 数式、テーブル、コードブロック、画像が正しく表示される |
| 7 | テーブル横スクロール | モバイル (375x667) | テーブルが横スクロール可能で切れない |
| 8 | 未認証アクセス拒否 | デスクトップ | 未認証でアクセスするとログインページにリダイレクト |

### テストデータ

- `frontend/tests/fixtures/` に実際のレポートファイル（docs/から抜粋）を配置
- 数式・テーブル・コードブロック・画像を含むサンプルMarkdownを用意
- Cognito テストユーザーを環境変数で管理

## ユニットテスト (Vitest)

### 対象モジュール

| モジュール | テスト内容 | 優先度 |
|-----------|----------|--------|
| `src/lib/metadata.ts` | CSVパース、メタデータ抽出、エッジケース（空行、不正CSV）| 高 |
| `src/lib/dynamodb.ts` | DynamoDBクエリ構築、レスポンス変換 | 高 |
| `scripts/sync-dynamodb.ts` | CSV → DynamoDB upsertロジック、冪等性確認 | 高 |
| `src/lib/content.ts` | Markdownファイル一覧取得、スラッグ生成 | 中 |
| `src/hooks/use-toc.ts` | 見出し抽出ロジック | 中 |

### モック戦略

- DynamoDB: `@aws-sdk/client-dynamodb` のモック（aws-sdk-client-mock）
- ファイルシステム: `memfs` または Vitest の `vi.mock` でfs操作をモック
- Cognito: テスト時は認証をバイパス

## テストデータ

```
frontend/tests/
├── fixtures/
│   ├── sample-report.md          # 全要素を含むサンプルレポート
│   ├── sample-report-math.md     # 数式を多用するレポート
│   ├── sample-csv/
│   │   └── 20260330.csv          # テスト用CSVデータ
│   └── expected/
│       └── parsed-metadata.json  # 期待されるパース結果
├── e2e/
│   ├── auth.spec.ts              # 認証フロー
│   ├── browse.spec.ts            # 閲覧フロー
│   ├── mobile.spec.ts            # モバイルフロー
│   ├── markdown.spec.ts          # Markdownレンダリング
│   └── dark-mode.spec.ts         # ダークモード
└── unit/
    ├── metadata.test.ts          # CSVパーサー
    ├── dynamodb.test.ts          # DynamoDBクライアント
    ├── sync.test.ts              # 同期スクリプト
    ├── content.test.ts           # コンテンツ読み込み
    └── toc.test.ts               # TOC見出し抽出
```

## カバレッジ目標

- **ユニットテスト**: `src/lib/` と `scripts/` の主要モジュールで80%以上
- **E2E**: 主要フロー8シナリオを網羅（デスクトップ + モバイル）
- **Lighthouse CI**: Performance 90+, Accessibility 90+, Best Practices 90+

## CI統合

```yaml
# .github/workflows/ci-frontend.yml
jobs:
  lint-and-type:
    - ESLint
    - tsc --noEmit
  unit-test:
    - Vitest (coverage report)
  e2e-test:
    - Playwright (3 browsers: chromium, firefox, webkit)
    - Screenshot comparison on failure
  lighthouse:
    - Lighthouse CI (performance, accessibility)
```
