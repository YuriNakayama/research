# Research Directory Rules

`docs/research/**` 配下のファイルを作成・編集する際は、本ルールに従ってください。

## 必読ファイル

何らかの操作を行う前に、必ず **`docs/research/README.md`** を読んでください。構成・出力先決定フロー・命名規約はそこに記載されています。

## 基本ルール

1. **`runs/` は append-only**: 既存の run ディレクトリを書き換えたり削除したりしないでください。新しい結果は必ず新しい日付ディレクトリを作成して追加します。
2. **新規出力は必ず `runs/<domain>/<phase>/<date>[_<cluster>]/` に配置**: `domains/` に直接ファイルを作成しないでください（`domains/` は `runs/` への symlink で構成されます）。
3. **`domains/<domain>/domain.yaml` が存在する場合は最優先で参照**: ここに `output_paths` が定義されていれば、その値を README の既定値より優先します。
4. **clustering は複数回実行され得る**: 同一ドメインで再クラスタリングを行う場合、過去の `runs/<domain>/clustering/<old_date>/` は残し、新しい `<new_date>/` を追加して `latest` symlink を更新します。
5. **完了後の latest 更新**: 新規 run を追加したら、`runs/<domain>/<phase>/latest[_<cluster>]` symlink を更新します（pipeline か skill が実施）。

## phase 別の既定出力先

| phase       | 既定出力先                                                   |
|-------------|--------------------------------------------------------------|
| clustering  | `docs/research/runs/<domain>/clustering/<YYYYMMDD>/`         |
| gather      | `docs/research/runs/<domain>/gather/<YYYYMMDD>_<cluster>/`   |
| retrieval   | `docs/research/runs/<domain>/retrieval/<YYYYMMDD>_<cluster>/`|

クラスタが特定できない場合は `<cluster>` を `all` とします。

## ドメイン名の決定

1. 入力ファイルのパスから推定: `docs/research/(runs|domains)/<domain>/...`
2. 推定不能ならユーザーに確認、または会話文脈から `snake_case` のドメイン名を生成
3. 既存ドメイン一覧は `ls docs/research/domains/` または `ls docs/research/runs/` で確認

## レガシー配置

- `docs/daily/**` は legacy です。新規ファイルは作成せず、既存ファイルへの追記が必要な場合は `docs/research/runs/legal_tech/...` への移行を検討してください。
- `docs/research/cate/**`, `docs/research/data_analysis_agent/**`, `docs/research/dc_hvac_control/**`, `docs/research/outputs/**`, `docs/research/research-clustering-*/` も legacy 配置です。読み取りは可能ですが、新規出力はすべて `runs/<domain>/<phase>/...` に配置してください。

## 禁止事項

- `runs/` 配下の既存ファイルを書き換えること（過去 run の改変）
- `domains/` 配下に symlink ではない実ファイルを作成すること
- `docs/research/` 直下に新規ディレクトリを作成すること（`runs/` `domains/` `_schema/` 以外）

## 自動パイプラインとの境界

- **`docs/research/**` は手動リサーチ専用領域**。自動実行パイプライン（ECS Fargate の daily ジョブ）はこのディレクトリを **絶対に書き換えない**。
- 自動パイプラインの入出力はすべて **`docs/daily/**`** 側で管理される。両者を混同しないこと。
- 既存の研究成果を daily 側にコピーする必要がある場合でも、`docs/research/**` からの読み取りのみ許可し、書込は行わない。
