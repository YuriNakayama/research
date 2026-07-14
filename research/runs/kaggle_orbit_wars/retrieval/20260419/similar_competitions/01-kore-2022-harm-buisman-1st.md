# Kore 2022 — Harm Buisman 1st place 解法

## ソース

- 公式 writeup: https://www.kaggle.com/competitions/kore-2022/writeups/harm-buisman-1st-place-solution
- Kore 2022 コンペ: https://www.kaggle.com/competitions/kore-2022

## Kore 2022 ルール要約（Orbit Wars との比較）

| 要素 | Kore 2022 | Orbit Wars |
|------|-----------|------------|
| プレイヤー数 | 2 | 2 or 4 |
| マップ | 21×21 グリッド | 連続 100×100 |
| 単位 | 造船所 (shipyard) + 艦隊 (fleet) | 惑星 (planet) + 艦隊 (fleet) |
| 資源 | Kore（採取） | なし（production のみ） |
| 艦隊経路 | フライトプラン文字列 (e.g. "N5E4SC") | 発射角固定、直線 |
| 生産 | shipyard sizeに応じて 0-6/turn | 1-5/turn（固定） |
| 戦闘 | fleet vs fleet, shipyard 破壊可 | tie→全滅、top-second 差分 |
| 時制約 | 3 秒 | 1 秒 |

**類似点**: 艦隊を増やし、相手 shipyard (惑星) を攻略するコア loop。戦闘解決が単純差分算。

## 1 位解法のアーキテクチャ

### 全体構造（rule-based MCTS）

```
observation
  ↓
[状況分析レイヤー]
  - 自/敵造船所のクラスタリング
  - 敵艦隊の pathfinding 予測
  - Kore 分布マップ更新
  ↓
[goal allocation]
  - 各 shipyard に「目的」を割り当て: {attack, defend, mine, expand}
  - スコアリング: production/分 − 所要艦数
  ↓
[action synthesis]
  - 各 shipyard の目的を satisfy する flight plan を生成
  - 内部シミュレータで 20 ステップ先までロールアウト
  - 複数候補を評価して最善を選択
  ↓
action submission
```

### 特筆すべき 3 点

#### 1. Flight Plan Builder（fleet path planner）

Kore の flight plan は文字列で、艦隊の移動経路を N/S/E/W + 整数で記述。Harm は以下の手順で最適 plan を構築:

- **Perspective path**: 目的地までの最短経路をループ（行って帰る）として列挙
- **Kore harvest 最大化**: ルート上の Kore タイルを累積
- **enemy intercept 回避**: 既知敵艦隊の ETA とクロスしないよう時間調整

**Orbit Wars への転用**: Orbit Wars は直線経路だが、軌道惑星の予測着弾位置を求める iterate loop（既に game_mechanics で実装）と本質同じ。**発射角の iterative 推定** が Harm の perspective path に対応。

#### 2. Shipyard Fleet Balancing（守備と攻撃のバランス）

各 shipyard が保持する艦数は、**近傍敵艦隊の最大 threat + α** になるよう維持。余剰艦は即座に mine/attack に回す。

```python
def balance(shipyard):
    max_enemy_nearby = estimate_max_incoming(shipyard, turns_ahead=10)
    safety = max(max_enemy_nearby + 10, shipyard.ships // 4)
    excess = shipyard.ships - safety
    if excess > 20:
        dispatch_mission(shipyard, ships=excess)
```

**Orbit Wars への転用**: 惑星の守備艦 lower bound を「敵艦隊の最大予想到着艦 + 1」に設定。残余を攻撃派遣。

#### 3. Opponent Intent Modeling

敵 shipyard の**艦数増加傾向**を見て「攻めてくる / 守ってる / 拡張してる」を分類。攻めてくる相手には早期 counter-attack を発動。

**Orbit Wars 適用**: 敵惑星の ships デルタを毎ターン記録、3 ターン平均で意図推定。

## Harm 解法のコードヒント（抜粋）

Harm 本人のコードは非公開だが、writeup から推測できる core algorithm:

```python
def kore_agent(obs, config):
    # 1. 状況マップ構築
    threat_map = build_threat_map(obs)         # 各タイルの敵到達 ETA
    kore_map = smooth_kore(obs)                 # harvest 期待値
    goal_map = allocate_goals(obs, threat_map)  # shipyard ごとの目的

    actions = {}
    for sy in my_shipyards:
        goal = goal_map[sy.id]
        if goal == "defend":
            continue  # 艦を貯める
        elif goal == "mine":
            plan = build_harvest_plan(sy, kore_map)
        elif goal == "attack":
            target = pick_target(sy, obs)
            plan = build_attack_plan(sy, target)
        elif goal == "expand":
            plan = build_expansion_plan(sy)
        actions[sy.id] = encode_flight_plan(plan)
    return actions
```

## Orbit Wars への移植戦略

### Mission-based agent（コア）

```python
MISSIONS = ["defend", "capture_neutral", "capture_comet", "attack_enemy", "reinforce_ally"]

def allocate_missions(obs):
    # 各自惑星の最適 mission を scoring
    return {planet_id: best_mission}

def execute(mission, planet, obs):
    if mission == "capture_comet":
        target_comet = nearest_comet_with_low_garrison(planet, obs)
        ships = target_comet.ships + 2
        angle = compute_intercept_angle(planet, target_comet, obs)
        return [planet.id, angle, ships]
    # ...
```

### Rollout-based tie-break

複数候補行動がある場合、**軽量シミュレータで 5-10 turn rollout** し、期待 production 差で選択。
Kore の Harm も内部シミュレータを使用（kaggle-environments の interpreter をそのまま step するより、省略版の方が高速）。

### 学習データ源としての利用

- Harm の解法 (rule-based) を Orbit Wars 用に書き換え、**自己対戦 10,000 試合** を生成
- 観測 → 行動 ペアを記録、Behavioral Cloning で policy network を事前学習
- その後 PPO self-play で fine-tune

## 注意事項（Kore と Orbit Wars の差分）

1. **資源の欠如**: Kore は harvest で資源獲得、Orbit Wars は production のみなので「mine」mission 相当は不要
2. **連続座標**: Kore はグリッドだが Orbit Wars は連続、経路計算を角度 + ETA で実装
3. **軌道惑星**: Kore にはない概念、artillery 発射問題として独立に実装
4. **時制約**: Kore 3s に対し Orbit Wars 1s、Harm のアルゴリズムをそのまま移すと間に合わない可能性あり → プロファイル必須

## 学び

1. **Rule-based + 内部シミュレータ** が最適、ML は補助
2. **Mission allocation** は goal-driven で planner 実装
3. **opponent tracking** が勝敗の 3-5% を分ける
4. **flight plan 最適化** = Orbit Wars なら intercept 計算の徹底
