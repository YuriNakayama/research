# Retrieval: competition_spec

Orbit Wars コンペの **公式仕様** を一次ソースから抽出した詳細レポート群。

## レポート一覧

| # | タイトル | 主題 |
|---|---------|------|
| [01](01-kaggle-environments-integration.md) | kaggle-environments 統合とローカル実行 | `env.run()` / `make("orbit_wars")` / ローカル対戦・視覚化 |
| [02](02-env-specification-json.md) | orbit_wars.json スキーマ詳解 | 観測・アクション・設定の型・デフォルト値 |
| [03](03-submission-and-timing.md) | 提出形式と思考時間管理 | 1 秒 actTimeout / overage time / 提出エージェント I/F |
| [04](04-unknowns-and-checklist.md) | 未確定事項と確認チェックリスト | 賞金・タイムライン・外部データ等の残課題 |

## サマリ（2026-04-19 時点で確定した事実）

### 対象バージョン
- **環境名**: `orbit_wars`
- **バージョン**: `1.0.9`
- **実装場所**: https://github.com/Kaggle/kaggle-environments/tree/master/kaggle_environments/envs/orbit_wars

### プレイヤー構成
- `agents: [2, 4]` — 2P または 4P のいずれかで開催
- 2P 時: 対角 Q1-Q4 配置
- 4P 時: 各プレイヤー 1 枠

### 時間制約
- `episodeSteps`: **500 ターン**
- `actTimeout`: **1 秒/手**
- `remainingOverageTime`: **2 秒**（全期間で共有する余裕バッファ）

### 行動 I/F
```python
def agent(observation, configuration):
    # observation: planets, fleets, comets, player, angular_velocity, initial_planets, comet_planet_ids, remainingOverageTime
    # configuration: episodeSteps, actTimeout, shipSpeed, cometSpeed
    return [[from_planet_id, direction_angle_radians, num_ships], ...]
```

### 主要設定デフォルト

| 設定 | 値 | 単位 |
|------|---|------|
| shipSpeed | 6.0 | units/turn (max) |
| cometSpeed | 4.0 | units/turn |
| sunRadius | 10.0 | units |
| boardSize | 100.0 | units |
| episodeSteps | 500 | turns |
| actTimeout | 1 | second |

## 未確定の要確認事項（Kaggle コンペページ閲覧が必要）

1. **賞金・タイムライン・評価方式（TrueSkill/Elo）**
2. **提出形式**（Notebook 経由 or Python ファイル直接）
3. **計算資源上限**（CPU/RAM/GPU、submission runtime）
4. **外部データ・学習済みモデル**の許容可否
5. **チームマージ/エントリ deadline**

上記は Kaggle コンペ公式ページの Overview / Rules / Evaluation / Timeline タブをブラウザで直接確認する必要がある（reCAPTCHA のため WebFetch 不可）。
