# 公式 starter_agent 分析

## ソース

`orbit_wars.py::starter_agent()` (L773-804)

## コード再現

```python
def starter_agent(obs):
    moves = []
    player = obs.get("player", 0)
    planets = [Planet(*p) for p in obs.get("planets", [])]

    # 静的惑星で敵 or 中立のものをターゲット候補に
    static_targets = []
    for p in planets:
        orbital_r = math.sqrt((p.x - CENTER) ** 2 + (p.y - CENTER) ** 2)
        if orbital_r + p.radius >= ROTATION_RADIUS_LIMIT and p.owner != player:
            static_targets.append(p)

    my_planets = [p for p in planets if p.owner == player]
    for mp in my_planets:
        if mp.ships <= 0:
            continue
        # 最近の静的ターゲット
        closest = min(static_targets, key=lambda t: hypot(mp.x-t.x, mp.y-t.y), default=None)
        if closest:
            angle = atan2(closest.y - mp.y, closest.x - mp.x)
            ships = mp.ships // 2
            if ships >= 20:
                moves.append([mp.id, angle, ships])
    return moves
```

## 動作分析

### ターゲット選定

- **静的惑星のみ** を候補にする（軌道惑星は無視）
- 自分以外の所有者（中立 + 敵）

### 派遣規則

- 自分の各惑星から、**最も近い静的ターゲット** へ派遣
- 派遣艦数 = 自惑星の ships の **半分**
- **20 艦未満は派遣しない**（累積して次のターンへ）

### 強み

1. **軌道計算不要**: 静的ターゲットのみなので `atan2` 一発
2. **シンプルで堅実**: 艦数を半分残すので守備力も確保
3. **累積 → ラッシュ**: 20 艦未満の間は溜め込み、超えたら送る

### 弱み

1. **軌道惑星を完全無視** → 敵が軌道惑星を取り放題
2. **コメット対応なし** → 低コスト tempo を逃す
3. **最近くばかり攻撃** → 同じ惑星を毎ターン攻撃、戦力分散できず
4. **敵艦隊への応答なし** → 防衛計画ゼロ
5. **tie 全滅考慮なし** → 相手と同数派遣で全滅する危険
6. **production 無視** → production=1 と =5 の価値差を無視
7. **ships // 2** は固定、戦況に応じた調整なし

## ベースラインとしての意義

Starter agent は **最小限の active 戦略を示すテンプレ**。これに以下を追加すれば大幅に強化可能:

### Level 1 改善（ルールベース追加）

1. **コメット占領**: コメット spawn 時に最近自惑星から最少艦派遣
2. **軌道惑星占領**: predict_planet_position() で将来位置を計算して intercept
3. **production 重み**: closest ではなく `production × (1/distance)` で優先順位付け
4. **派遣艦数のチューニング**: 必要艦数 = 敵艦 + 敵期待増援 + 1

### Level 2 改善（防衛・tie 回避）

1. **敵艦隊のトラッキング**: `fleets` 観測から着弾惑星と ETA を算出、間に合う再配置を実行
2. **tie 回避**: 2 番手にならないよう、相手より多く or 少なく派遣
3. **multi-planet 合流**: 複数惑星から同時派遣で相手守備を超過

### Level 3 改善（探索/ RL）

1. **NaïveMCTS**: action を数十候補に絞ってから MCTS で評価
2. **RHEA**: horizon 10-20 でパラメタライズした行動列を進化
3. **自己対戦 PPO**: entity encoder で状態表現、league training で多様性

## 典型的な対戦結果（予想）

`env.run([starter_agent, "random"])` は starter が高確率で勝つ。
`env.run([starter_agent, starter_agent])` は開幕対称性により長期互角 → production 偶然で決着。

## 拡張テンプレ（実装しやすい MVP）

```python
import math
from kaggle_environments.envs.orbit_wars.orbit_wars import Planet, Fleet, CENTER, ROTATION_RADIUS_LIMIT

def orbital_position(init_p, omega, step):
    dx, dy = init_p[2] - CENTER, init_p[3] - CENTER
    r = math.hypot(dx, dy)
    if r + init_p[4] >= ROTATION_RADIUS_LIMIT:
        return (init_p[2], init_p[3])
    theta = math.atan2(dy, dx) + omega * step
    return (CENTER + r * math.cos(theta), CENTER + r * math.sin(theta))

def estimate_eta(from_pos, target_pos, ships):
    d = math.hypot(target_pos[0] - from_pos[0], target_pos[1] - from_pos[1])
    speed = min(6.0, 1.0 + 5.0 * (math.log(max(ships,1)) / math.log(1000)) ** 1.5)
    return d / speed

def agent_v1(obs, config):
    player = obs.get("player", 0)
    step = obs.get("step", 0)
    planets = [Planet(*p) for p in obs.get("planets", [])]
    fleets = [Fleet(*f) for f in obs.get("fleets", [])]
    omega = obs.get("angular_velocity", 0.03)
    initial = obs.get("initial_planets", [])
    initial_map = {p[0]: p for p in initial}

    my_planets = [p for p in planets if p.owner == player and p.ships > 5]
    moves = []

    for mp in my_planets:
        # ターゲット: 敵 or 中立、production 重視
        best = None
        best_score = -1e9
        for tp in planets:
            if tp.owner == player or tp.id == mp.id:
                continue
            # 軌道惑星は将来位置を推定
            init_t = initial_map.get(tp.id)
            if init_t is None:
                continue
            # ETA 反復
            t = 0
            target_pos = (tp.x, tp.y)
            ships_send = max(int(mp.ships * 0.5), 20)
            for _ in range(5):
                future_pos = orbital_position(init_t, omega, step + t)
                t = estimate_eta((mp.x, mp.y), future_pos, ships_send)
            # スコア: production × residual_turns - required_ships
            required = int(tp.ships + tp.production * t + 2)
            if ships_send <= required:
                continue
            score = tp.production * max(0, 500 - step - t) - required
            if score > best_score:
                best_score = score
                best = (tp, required, future_pos)
        if best:
            tp, required, target_pos = best
            ships_send = min(mp.ships - 1, max(required + 1, 20))
            angle = math.atan2(target_pos[1] - mp.y, target_pos[0] - mp.x)
            moves.append([mp.id, angle, ships_send])
    return moves
```

これで starter より顕著に強い（軌道対応 + production 重視 + tie 回避の `+1` 派遣）。
