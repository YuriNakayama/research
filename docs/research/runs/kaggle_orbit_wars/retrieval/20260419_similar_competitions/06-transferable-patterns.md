# Orbit Wars 向け転用テンプレ集

## 目的

ここまでの 5 個の親類コンペの上位解法から、Orbit Wars に **直接転用できる** パターンを抽出。

## テンプレ一覧

### 1. アーキテクチャ骨格（5 解法の共通構造）

```
observation
  ↓
[前処理]
  - entity extraction
  - threat map / future position 計算
  - my/enemy 状況分類
  ↓
[状況認識]
  - is_endgame?
  - under_attack?
  - winning?
  ↓
[役割割当 (Mission allocation)]
  - ILP / Hungarian / rule priority
  - 各自惑星 → mission
  ↓
[action synthesis]
  - mission 実行ロジック
  - 候補 action スコアリング
  - tie-break は simulator rollout
  ↓
action list
```

### 2. Mission 列挙（Kore + Lux S2 の結合）

```python
MISSIONS = [
    "defend",           # 守備固め
    "capture_neutral",  # 中立占領
    "capture_comet",    # コメット獲得
    "intercept_orbital", # 軌道惑星 intercept
    "attack_enemy",     # 敵惑星攻撃
    "reinforce_ally",   # 自陣補給
    "idle",             # 待機（累積）
]
```

### 3. Mission Scorer（Halite IV ILP 風）

```python
def score_mission(planet, mission, obs):
    if mission == "defend":
        threat = incoming_enemy_ships(planet, obs)
        return threat - planet.ships if threat > planet.ships else 0

    if mission == "capture_neutral":
        candidates = nearest_neutral_planets(planet, obs, k=3)
        return max(
            p.production * remaining_turns(obs) - required_ships(planet, p)
            for p in candidates
        )

    if mission == "capture_comet":
        candidates = available_comets(obs)
        if not candidates:
            return 0
        best = max(candidates, key=lambda c: c.remaining_turns - required_ships(planet, c))
        return best.remaining_turns * 1 - required_ships(planet, best)  # production=1

    if mission == "attack_enemy":
        candidates = enemy_planets(obs)
        return max(
            (p.production * remaining_turns(obs) - required_ships(planet, p))
            for p in candidates
        )

    # ...
```

### 4. Intercept Angle Solver（game_mechanics と同一）

```python
def compute_intercept(planet, target, obs, ships):
    """軌道惑星 intercept の数値反復"""
    omega = obs["angular_velocity"]
    step = obs["step"]
    init = {p[0]: p for p in obs["initial_planets"]}[target.id]
    speed = fleet_speed(ships)

    t_est = math.hypot(target.x - planet.x, target.y - planet.y) / speed
    for _ in range(20):
        future = orbital_position(init, omega, step + t_est)
        d = math.hypot(future[0] - planet.x, future[1] - planet.y)
        t_new = d / speed
        if abs(t_new - t_est) < 0.01:
            break
        t_est = t_new
    angle = math.atan2(future[1] - planet.y, future[0] - planet.x)
    return angle, t_est, future
```

### 5. Threat Map（Lux S2 ryandy 風, 惑星単位）

```python
def build_threat_map(obs):
    threat = defaultdict(lambda: 0.0)
    me = obs["player"]
    for fleet in obs["fleets"]:
        if fleet.owner == me:
            continue
        # どの惑星へ向かっているか予測（直近予想惑星）
        target, eta = predict_target(fleet, obs)
        if target is None:
            continue
        threat[target.id] += fleet.ships / (eta + 1)
    return threat
```

### 6. +1 Rule（Orbit Wars 固有、combat_resolution より）

```python
def safe_attack_ships(target_garrison, target_production, eta, competing_enemy_ships=0):
    """tie 全滅を避けるための必要艦数"""
    expected_growth = target_production * eta if target.owner != -1 else 0
    required = target_garrison + expected_growth + competing_enemy_ships + 1
    return required
```

### 7. Opponent Modeling（Halite IV 風）

```python
class OpponentModel:
    def __init__(self):
        self.ship_history = defaultdict(list)  # planet_id → list of ships over time

    def update(self, obs):
        for p in obs["planets"]:
            if p.owner != obs["player"] and p.owner != -1:
                self.ship_history[p.id].append((obs["step"], p.ships))

    def predict_launch(self, planet_id):
        """この惑星から何艦派遣されるか予測"""
        hist = self.ship_history[planet_id]
        if len(hist) < 3:
            return 0
        # 直近の減少量 = 派遣艦数
        recent_deltas = [hist[i][1] - hist[i-1][1] for i in range(-3, 0)]
        return max(0, -min(recent_deltas))
```

### 8. Endgame Mode（Halite IV 転用）

```python
def is_endgame(obs):
    return obs["step"] > 470

def endgame_strategy(planet, obs):
    """勝敗確定的な局面では production 最大化を優先"""
    # 低 production 敵惑星無視
    # 高 production 敵惑星集中攻撃
    targets = [p for p in obs["planets"] if p.owner != obs["player"] and p.production >= 3]
    if not targets:
        return None
    return max(targets, key=lambda t: t.production / distance(planet, t))
```

### 9. Kaggle 提出ファイル形式

```python
# submission/main.py（単一ファイル、全ロジック内包）

import math
from collections import defaultdict

# すべての関数と定数を inline で定義
CENTER = 50.0
ROTATION_RADIUS_LIMIT = 50.0
MAX_SPEED = 6.0

# ... constants, helpers ...

class AgentState:
    def __init__(self):
        self.opponent_model = OpponentModel()
        self.turn = 0

state = AgentState()

def agent(obs, config):
    global state
    state.turn += 1
    state.opponent_model.update(obs)
    return plan_actions(obs, state)

if __name__ == "__main__":
    # local test
    import json
    obs = json.load(open("sample_obs.json"))
    print(agent(obs, None))
```

### 10. NN 重み提出方法

```python
import base64
import pickle
import torch

# 学習後:
# weights = net.state_dict()
# weights_bytes = pickle.dumps(weights)
# weights_b64 = base64.b64encode(weights_bytes).decode()
# print(f"WEIGHTS_B64 = \"{weights_b64}\"")

WEIGHTS_B64 = "..."  # 学習済み state_dict の base64

def load_model():
    weights = pickle.loads(base64.b64decode(WEIGHTS_B64))
    model = OrbitWarsValueNet()
    model.load_state_dict(weights)
    model.eval()
    return model
```

## 統合エージェント skeleton

```python
def agent(obs, config):
    """統合エージェント: rule-based + optional NN value"""
    my_id = obs["player"]
    my_planets = [Planet(*p) for p in obs["planets"] if p[1] == my_id]
    fleets = [Fleet(*f) for f in obs["fleets"]]

    # 1. 状況認識
    state.opponent_model.update(obs)
    threat = build_threat_map(obs)
    endgame = is_endgame(obs)

    # 2. Mission 割当
    missions = {}
    for p in my_planets:
        scores = {m: score_mission(p, m, obs) for m in MISSIONS}
        missions[p.id] = max(scores, key=scores.get)

    # 3. Action 合成
    actions = []
    for p in my_planets:
        m = missions[p.id]
        if m == "idle":
            continue
        target = pick_target(p, m, obs)
        if target is None:
            continue
        ships = compute_ships(p, target, m, obs, threat)
        if ships < 20:
            continue
        angle, eta, future = compute_intercept(p, target, obs, ships)
        # +1 rule
        required = safe_attack_ships(target.ships, target.production, eta)
        if ships < required:
            continue
        actions.append([p.id, angle, min(ships, p.ships - 1)])

    return actions
```

## 期待性能（親類コンペからの推測）

| 実装レベル | ELO 相当 | 実装工数 |
|-----------|----------|----------|
| random | 0 | 10 min |
| starter_agent | +100 | 既存 |
| rule v1 (上記 skeleton) | +300 | 1 週間 |
| rule v2 (+ ILP + opponent model) | +500 | 2 週間 |
| rule + BC warmup | +600 | +1 週間 |
| PPO self-play 100万試合 | +800 | +3 週間 |
| PPO + League training | +900 | +1 週間 |

**結論**: 最低でも **rule v2 + BC** まで実装することが上位入賞の必要条件。League training は決勝ラウンドの仕上げ用。

## 優先実装順

1. **Intercept solver + combat rules** (game_mechanics 由来)
2. **Mission allocation rule** (Kore, Halite IV 由来)
3. **Opponent tracking** (Halite IV, Kore 由来)
4. **Endgame mode** (Halite IV 由来)
5. **BC warmup policy** (Lux S2, Hungry Geese 由来)
6. **PPO fine-tune** (ConnectX, Hungry Geese 由来)
7. **League training** (Lux S2 由来)
