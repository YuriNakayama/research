# Action Pruning 戦略

## 目的

1 秒 actTimeout 下で MCTS / RHEA を実行するには、**action 候補を 10-50 個に絞る** 必要がある。ここでは Orbit Wars 特有の pruning 戦略を整理。

## Orbit Wars の Raw Action Space

- 自惑星 10 個
- 各惑星から 任意 target (20 個) × 艦数 5 段階
- Total: 10 × 20 × 5 = **1000 actions per turn**（複数同時発射考慮なし）
- 複数発射組合せを含めると 2^1000 の部分集合 → 発射の有無も選択肢

## Pruning 戦略の層

```
Layer 1: 発射不要判定 (時制調整)
Layer 2: 目的不明惑星の除外 (pointless targets)
Layer 3: 採算割れ除外 (required ships > available ships)
Layer 4: スコア top-K 選抜
```

## Layer 1: 発射不要判定

```python
def skip_turn_if_possible(planet, obs):
    """ships が少ない or 脅威なしなら skip"""
    if planet.ships < 20:
        return True  # 閾値以下
    threat = incoming_enemy_ships_soon(planet, obs, turns=10)
    if threat > planet.ships * 0.5:
        return True  # 守備優先、発射せず待機
    return False
```

## Layer 2: 目的不明惑星の除外

```python
def is_pointless_target(planet, target, obs):
    """この target は攻める価値があるか"""
    # 自分所有: reinforcement なら有意義、そうでなければ不要
    if target.owner == obs["player"]:
        return target.ships > 100  # 既に充分な場合はスキップ
    # 敵所有、production 低い、距離遠い
    if target.owner != -1:
        dist = math.hypot(target.x - planet.x, target.y - planet.y)
        if target.production <= 1 and dist > 40:
            return True
    # コメット、残寿命わずか
    if is_comet(target, obs) and comet_remaining_steps(target, obs) < 5:
        return True
    return False
```

## Layer 3: 採算割れ除外

```python
def is_unprofitable(planet, target, obs, ships_to_send):
    eta = estimate_eta(planet, target, ships_to_send, obs)
    required = target.ships + target.production * eta + 1
    return ships_to_send < required

def min_required_ships(planet, target, obs):
    """最小必要艦数"""
    # iterative: ETA → required → ships, ships → speed → ETA
    required = target.ships + 1
    for _ in range(5):
        speed = fleet_speed(required)
        eta = distance(planet, target) / speed
        required = target.ships + target.production * eta + 1
    return int(required)
```

## Layer 4: スコア Top-K

```python
def score_action(planet, target, ships_frac, obs):
    """候補 action のスコア"""
    ships = int(planet.ships * ships_frac)
    required = min_required_ships(planet, target, obs)
    if ships < required: return -float('inf')

    eta = estimate_eta(planet, target, ships, obs)
    remaining_turns = 500 - obs["step"] - eta

    if target.owner == obs["player"]:
        # 自陣補給: 他攻撃から奪われないか
        return 0.5 * target.production * remaining_turns  # 守備固め効果
    elif target.owner == -1:
        # 中立占領: 純利得
        return target.production * remaining_turns - required
    else:
        # 敵攻撃: production 奪取 + 敵弱体化ボーナス
        return target.production * remaining_turns - required + 2 * target.production
```

## 統合: Pruning Pipeline

```python
def prune_actions(obs, top_k_per_planet=3, total_top_k=30):
    """全 action 候補を prune"""
    my_id = obs["player"]
    my_planets = [p for p in obs["planets"] if p.owner == my_id]
    candidates = []

    for planet in my_planets:
        if skip_turn_if_possible(planet, obs):
            continue

        per_planet_cands = []
        for target in obs["planets"]:
            if target.id == planet.id: continue
            if is_pointless_target(planet, target, obs): continue

            for frac in [0.3, 0.5, 0.7, 1.0]:
                ships = int(planet.ships * frac)
                if ships < 20: continue
                if is_unprofitable(planet, target, obs, ships): continue

                s = score_action(planet, target, frac, obs)
                per_planet_cands.append((s, (planet.id, target.id, frac)))

        # Top-K per planet
        per_planet_cands.sort(reverse=True)
        candidates.extend(per_planet_cands[:top_k_per_planet])

    # Global top-K
    candidates.sort(reverse=True)
    return [a for _, a in candidates[:total_top_k]]
```

## 数値確認（典型的な盤面）

- 自惑星 10 × target 20 × frac 4 = 800 candidates
- Layer 1-3 で 80% 削減 → 160 candidates
- Layer 4 top-K (K=30) で 30 candidates

**計算量**: 各 scoring ≈ 10μs, 800 × 10μs = 8ms → 予算内。

## 時間・戦略依存 Pruning

### 序盤 (step < 30)

- 中立占領のみに絞る
- 敵攻撃は除外

```python
if obs["step"] < 30:
    candidates = [c for c in candidates if c.target.owner == -1]
```

### 終盤 (step > 470)

- 低 production target 除外
- 高 production 敵惑星に集中

```python
if obs["step"] > 470:
    candidates = [c for c in candidates
                  if c.target.production >= 3 or c.target.owner == obs["player"]]
```

### コメット出現直後 (step ∈ [50-55, 150-155, ...])

- コメットを優先候補に追加

```python
if obs["step"] in [50, 51, 52, 150, 151, 152, ...]:
    comet_candidates = [c for c in candidates if is_comet(c.target)]
    other_candidates = [c for c in candidates if not is_comet(c.target)]
    candidates = comet_candidates + other_candidates[:15]
```

## Multi-Action Combinations

1 turn に複数 action を送る場合、組合せ爆発に注意:

- 独立 10 candidates → 2^10 = 1024 combinations
- すべて評価は無理

**簡単な方針**:
- 各自惑星から最良 1 action のみ選択（per-planet greedy）
- 評価が必要な combination は per-planet top-2 の直積（2^10 = 1024 でも filtering で 100 以下）

```python
def greedy_multi_action(candidates_per_planet):
    """各惑星から最良 1 個"""
    result = []
    for planet_id, candidates in candidates_per_planet.items():
        if candidates:
            result.append(candidates[0])
    return result
```

## Coordinated Attack Pruning

複数惑星から同じ target に向けて同着攻撃する **coordinated attack** の候補を陽に enumerate:

```python
def find_coordinated_attacks(obs, max_sources=3):
    my_planets = [p for p in obs["planets"] if p.owner == obs["player"]]
    coordinated = []

    for target in obs["planets"]:
        if target.owner == obs["player"]: continue
        # Candidates: 何個の自惑星が同着可能か
        reachable_sources = []
        for p in my_planets:
            if p.ships < 30: continue
            angle, eta, _ = intercept_orbital(...)
            if eta < 100:
                reachable_sources.append((p, angle, eta))

        if len(reachable_sources) >= 2:
            # 最遅 ETA に合わせて他を遅らせる
            max_eta = max(eta for _, _, eta in reachable_sources)
            combined_ships = sum(
                min_required_ships(p, target, obs)
                for p, _, _ in reachable_sources
            )
            if combined_ships > target.ships + target.production * max_eta + 1:
                coordinated.append({
                    "target": target,
                    "sources": reachable_sources[:max_sources],
                    "timing": max_eta,
                })
    return coordinated
```

**Orbit Wars 固有**: tie→全滅ルールのため、combined_ships を precise に計算する必要。

## 学び

1. **Pruning が MCTS/RHEA の本体以上に重要**
2. **Layer 1-3 で 80% 削減**、Top-K で最終 30 個程度
3. **時間依存 pruning**（序盤/終盤）で query 性能向上
4. **コメット優先 pruning** で新規 spawn 対応
5. **Coordinated attack** は explicit に enumerate、MCTS 任せは不安定
