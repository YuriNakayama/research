# orbit_wars.json スキーマ詳解

## 一次ソース

- JSON: https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/orbit_wars.json
- バージョン: `1.0.9`

## トップレベル構造

```json
{
  "name": "orbit_wars",
  "title": "Orbit Wars",
  "description": "Conquer planets rotating around a sun in a continuous space.",
  "version": "1.0.9",
  "agents": [2, 4],
  "configuration": { ... },
  "reward": { "type": "number", "default": 0 },
  "observation": { ... },
  "action": { ... },
  "status": { "defaults": ["ACTIVE", "ACTIVE"] }
}
```

## configuration

| キー | 型 | デフォルト | 意味 |
|------|----|-----------|------|
| `episodeSteps` | int | 500 | 最大ターン数 |
| `actTimeout` | number | 1 | 1 手あたりの思考時間（秒） |
| `agentTimeout` | number | 2 | 廃止予定。`observation.remainingOverageTime` を使用 |
| `shipSpeed` | number | 6.0 | 艦隊速度の最大値 |
| `cometSpeed` | number | 4.0 | コメット速度 |

※ `sunRadius: 10.0`, `boardSize: 100.0` は定数（コード内ハードコード）。

## observation スキーマ

| フィールド | 型 | 説明 |
|-----------|----|------|
| `planets` | `list[list]` | `[id, owner, x, y, radius, ships, production]` の配列。全惑星（コメット含む） |
| `fleets` | `list[list]` | `[id, owner, x, y, angle, from_planet_id, ships]` の配列。移動中の艦隊 |
| `player` | int | 自分の ID (0-3) |
| `angular_velocity` | float | 惑星の自転角速度 (rad/turn)。ゲーム開始時に 0.025–0.05 から決定、以降固定 |
| `initial_planets` | `list[list]` | 開始時の惑星配置。軌道計算の基準 |
| `next_fleet_id` | int | 次に発行される艦隊 ID |
| `comets` | `list[dict]` | `{planet_ids, paths, path_index}`。コメットグループごとの軌道情報 |
| `comet_planet_ids` | `list[int]` | コメットとして扱う惑星 ID の一覧 |
| `remainingOverageTime` | float | 残り overage time（秒） |

### planets / fleets の要素構造（namedtuple）

```python
from kaggle_environments.envs.orbit_wars.orbit_wars import Planet, Fleet
Planet._fields  # ('id', 'owner', 'x', 'y', 'radius', 'ships', 'production')
Fleet._fields   # ('id', 'owner', 'x', 'y', 'angle', 'from_planet_id', 'ships')
```

- `owner`: プレイヤー ID (0-3)、中立は -1
- `radius`: `1 + ln(production)` で算出（production=1 で 1.0、production=5 で ~2.61）
- `production`: 1-5 の整数、毎ターン所有時に生成される艦数
- `ships`: 艦船数（整数）

### comets 要素構造

```python
comets = [
    {
        "planet_ids": [7, 8, 9, 10],     # 4 重対称の 4 個の惑星 ID
        "paths": [                        # 各コメットの位置列（完全決定的）
            [(x0, y0), (x1, y1), ...],    # comet 0 の軌道
            [...],                        # comet 1
            [...],                        # comet 2
            [...],                        # comet 3
        ],
        "path_index": 5                   # 現在の path 上の位置 index
    },
    ...
]
```

**重要**: `paths` は **未来位置まで全て** 格納されているため、コメットが盤面を出る時刻まで完全予測可能。

## action スキーマ

```json
{
  "type": "array",
  "items": {
    "type": "array",
    "minItems": 3, "maxItems": 3,
    "items": [
      {"type": "integer", "description": "Source planet ID"},
      {"type": "number",  "description": "Angle in radians"},
      {"type": "integer", "description": "Number of ships"}
    ]
  },
  "default": []
}
```

```python
action = [
    [from_planet_id, angle_radians, num_ships],
    [from_planet_id, angle_radians, num_ships],
    ...
]
```

### 角度の規約（README より）

```
0       = 右 (+x 方向)
π/2     = 下 (+y 方向) ※ 原点が左上なので y は下向き
π       = 左
3π/2    = 上
```

### 発射制約
- `from_planet_id` は **自分の所有惑星** であること
- `num_ships` ≤ 発射直前の惑星 ships
- 同ターンに **同じ惑星から複数発射可能**（各々が独立した艦隊になる）
- 艦隊は惑星の周囲（radius の外側）に spawn し、`angle` 方向へ直進

## reward / status

- `reward`: エピソード終了時の最終スコア（= 所有惑星の艦総数 + 所有艦隊の艦総数）
- `status`: 各エージェントの状態
  - `ACTIVE`: プレイ中
  - `DONE`: 終了（勝敗確定）
  - `INACTIVE`: 脱落
  - `ERROR`: エージェントエラー
  - `TIMEOUT`: 時間切れ
  - `INVALID`: 不正アクション

## 導出できる重要な定数

| 定数 | 値 | ソース |
|------|---|--------|
| `BOARD_SIZE` | 100.0 | orbit_wars.py |
| `CENTER` | 50.0 | orbit_wars.py |
| `SUN_RADIUS` | 10.0 | orbit_wars.py |
| `ROTATION_RADIUS_LIMIT` | 50.0 | orbit_wars.py |
| `COMET_RADIUS` | 1.0 | orbit_wars.py |
| `COMET_PRODUCTION` | 1 | orbit_wars.py |
| `PLANET_CLEARANCE` | 7 | orbit_wars.py |
| `MIN_PLANET_GROUPS` | 5 | orbit_wars.py |
| `MAX_PLANET_GROUPS` | 10 | orbit_wars.py |
| `MIN_STATIC_GROUPS` | 3 | orbit_wars.py |
| `COMET_SPAWN_STEPS` | [50, 150, 250, 350, 450] | orbit_wars.py |
