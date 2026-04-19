# Resources: competition_spec

公式仕様に直結する一次・準一次リソース一覧。

## 一次ソース（公式）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | Orbit Wars — Kaggle Competition Page | https://www.kaggle.com/competitions/orbit-wars | 公式ページ | Overview / Data / Rules / Evaluation / Timeline / Code タブを含むエントリーポイント。reCAPTCHA により WebFetch 不可、ブラウザから手動取得が必要 |
| 2 | Orbit Wars — Discussion | https://www.kaggle.com/competitions/orbit-wars/discussion | Kaggle forum | pinned post / FAQ / ルール変更アナウンスの source of truth |
| 3 | Kaggle Environments — GitHub | https://github.com/Kaggle/kaggle-environments | 公式リポジトリ | Kaggle Simulation 共通のエージェント実行ランタイム |
| 4 | **orbit_wars env ディレクトリ** | https://github.com/Kaggle/kaggle-environments/tree/master/kaggle_environments/envs/orbit_wars | ソースコード | **実装の source of truth**。README / py / json / test / visualizer を含む |
| 5 | orbit_wars README | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/README.md | Markdown | ルール・観測・アクション・勝利条件の公式ドキュメント |
| 6 | orbit_wars.json | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/orbit_wars.json | JSON spec | version 1.0.9 / 観測/アクション/報酬のスキーマ |
| 7 | orbit_wars.py | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/orbit_wars.py | Python | 惑星生成・戦闘解決・艦隊移動の実装 |
| 8 | test_orbit_wars.py | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/test_orbit_wars.py | Python test | エッジケースの仕様例証 |

## 補助リソース（Kaggle 共通）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 9 | Kaggle Competition Documentation | https://www.kaggle.com/docs/competitions | 公式ドキュメント | 提出 / チームマージ / メダル / コードコンペの共通ルール |
| 10 | kaggle-environments README | https://github.com/Kaggle/kaggle-environments/blob/master/README.md | Markdown | `env.run()`, `env.render()`, agent 関数シグネチャ、ローカル対戦方法 |
| 11 | kaggle-environments Releases | https://github.com/Kaggle/kaggle-environments/releases | GitHub | 仕様バージョン差分、orbit_wars が追加された version の特定 |
| 12 | kaggle-simulations-lab | https://github.com/0xd3ba/kaggle-simulations-lab | OSS | Kaggle Simulation コンペ用 RL 実験 GUI。参考実装 |

## 判明済みの確定仕様（orbit_wars v1.0.9 時点）

| 項目 | 値 |
|------|---|
| プレイヤー数 | 2 or 4 |
| 最大ターン | 500 |
| 1手あたり思考時間 | 1秒（`actTimeout`） |
| overage time（総余裕） | 2秒（`remainingOverageTime`） |
| 盤面サイズ | 100 x 100 連続 2D、原点は左上 |
| 太陽 | 中心 (50, 50)、半径 10。艦隊が横切ると消滅 |
| 艦隊速度 | `1.0 + (max-1.0) * (log(ships)/log(1000))^1.5`（最大 6.0） |
| コメット速度 | 4.0 units/turn（spawn: step 50/150/250/350/450） |
| 惑星数 | 20-40（5-10 の 4 重対称グループ） |
| 惑星回転 | `orbital_radius + planet_radius < 50` のグループのみ、角速度 0.025-0.05 rad/turn |
| 勝利条件 | 500 turn 終了時 or 生存者 1 人以下。最終スコア = 所有惑星の艦数 + 艦隊中の艦数 |
| アクション形式 | `[[from_planet_id, direction_angle_rad, num_ships], ...]` |
| 観測形式 | planets / fleets / comets / player / angular_velocity / initial_planets / comet_planet_ids / remainingOverageTime |

## 未確定・要調査

- **提出形式**: Python 単一ファイル or Notebook, 依存 pip パッケージの許容範囲 → Kaggle ページ Rules タブ確認必須
- **評価方式**: TrueSkill / Elo / エピソードマッチング頻度 → Overview or Evaluation タブ
- **賞金・メダル**: amount, 分配 → Overview タブ
- **タイムライン**: 開始日 / team merge / entry / final submission / 結果発表 → Timeline タブ
- **外部データ利用**: 許可範囲、学習済みモデル持ち込みの可否 → Rules タブ
- **計算資源制限**: 実行環境の CPU/RAM/GPU → Rules タブ or 公式 Notebook
