# Research Directory Rules

`research/**` 配下のファイルを作成・編集する際は、本ルールに従ってください。`research/**` はリポジトリルート直下の**表示用リサーチ成果物**領域で、viewer（`/research`）が配信します。

## 必読ファイル

何らかの操作を行う前に、必ず **`research/README.md`** を読んでください。構成・出力先決定フロー・命名規約はそこに記載されています。

## 基本ルール

1. **`runs/` は append-only**: 既存の run ディレクトリを書き換えたり削除したりしないでください。新しい結果は必ず新しい日付ディレクトリを作成して追加します。
2. **新規出力は必ず `runs/<domain>/<phase>/<date>[_<cluster>]/` に配置**: `domains/` に直接ファイルを作成しないでください（`domains/` は `runs/` への symlink で構成されます）。
3. **`domains/<domain>/domain.yaml` が存在する場合は最優先で参照**: ここに `output_paths` が定義されていれば、その値を README の既定値より優先します。
4. **clustering は複数回実行され得る**: 同一ドメインで再クラスタリングを行う場合、過去の `runs/<domain>/clustering/<old_date>/` は残し、新しい `<new_date>/` を追加して `latest` symlink を更新します。
5. **完了後の latest 更新**: 新規 run を追加したら、`runs/<domain>/<phase>/latest[_<cluster>]` symlink を更新します（skill が実施）。

## phase 別の既定出力先

| phase       | 既定出力先                                              |
|-------------|---------------------------------------------------------|
| clustering  | `research/runs/<domain>/clustering/<YYYYMMDD>/`         |
| gather      | `research/runs/<domain>/gather/<YYYYMMDD>_<cluster>/`   |
| retrieval   | `research/runs/<domain>/retrieval/<YYYYMMDD>_<cluster>/`|

クラスタが特定できない場合は `<cluster>` を `all` とします。

## ドメイン名の決定

1. 入力ファイルのパスから推定: `research/(runs|domains)/<domain>/...`
2. 推定不能ならユーザーに確認、または会話文脈から `snake_case` のドメイン名を生成
3. 既存ドメイン一覧は `ls research/domains/` または `ls research/runs/` で確認

## 禁止事項

- `runs/` 配下の既存ファイルを書き換えること（過去 run の改変）
- `domains/` 配下に symlink ではない実ファイルを作成すること
- `research/` 直下に新規ディレクトリを作成すること（`runs/` `domains/` `_schema/` 以外）

## viewer との境界

- `research/**` はビルド時に `frontend/research` へコピーされ、`/research` 配下で描画される。ファイル配置がそのまま公開 URL 構造になる。
- 開発用ドキュメントは `docs/**`（viewer 非対象）。両者を混同しないこと。
- E2E フィクスチャは `research/_e2e_fixture/...` にビルド時生成される（`frontend/scripts/setup-e2e-fixtures.mjs`）。手動で編集・コミットしない。
