# 軌道惑星 Intercept Solver 完全ガイド

## ソース

- 2D Intercept: https://discussions.unity.com/t/intercept-prediction-in-a-2d-game-and-teh-maths/612337
- 2 Moving Objects Intercept: https://www.codeproject.com/articles/Interception-of-Two-Moving-Objects-in-D-Space
- 2D Circle Projectile + collider radius: https://discussions.unity.com/t/2d-circle-projectile-trajectory-prediction-taking-collider-radius-into-account/151868
- Orbital Gravity Simulation: https://jvm-gaming.org/t/simulating-orbital-gravity-with-a-prediction-of-trajectory-multiple-attractors/58267

## 問題定式化

### 静的惑星の場合（自明）

艦隊位置 `S`, target 位置 `T` (固定)、艦船速度 `v`:

```
angle = atan2(T.y - S.y, T.x - S.x)
t = distance(S, T) / v
```

### 軌道惑星の場合（連立方程式）

target 位置が時間関数:

```
T(t) = (C + r · cos(θ₀ + ω·(step_0 + t)),
        C + r · sin(θ₀ + ω·(step_0 + t)))
```

艦隊位置:

```
S(t) = S₀ + t · v · (cos α, sin α)
```

衝突条件:

```
|S(t) - T(t)| = target.radius + fleet_radius (0 とみなす)
```

これを `(t, α)` の連立方程式として解く。

## 解法 A: 直接解析解（2D Moving Target）

target が **直線運動** なら解析解が存在（codeproject より）:

相対位置 = `dp = T - S₀`
相対速度 = `dv = T速度 - 0 (S は初期)`
艦速 = `v`

```
|dp + t·dv - t·v·(cosα, sinα)|² = r²
```

これを `(t, α)` で解く。

```python
def intercept_linear(s0, t0, tv, v, r):
    """
    s0: source position
    t0: target initial position
    tv: target velocity (固定)
    v: fleet speed
    r: target radius

    Returns: (angle, t) or None
    """
    dx, dy = t0[0] - s0[0], t0[1] - s0[1]
    # aquadratic in t: (dv·t + dp)² = (v·t)² + r²  (目的惑星 radius に入る)
    # Expand: t²·(|dv|² - v²) + 2·t·(dp·dv) + (|dp|² - r²) = 0
    a = tv[0]**2 + tv[1]**2 - v**2
    b = 2 * (dx * tv[0] + dy * tv[1])
    c = dx**2 + dy**2 - r**2

    disc = b**2 - 4*a*c
    if disc < 0: return None
    t1 = (-b - math.sqrt(disc)) / (2*a)
    t2 = (-b + math.sqrt(disc)) / (2*a)
    t = min(t for t in [t1, t2] if t > 0) if any(t > 0 for t in [t1, t2]) else None
    if t is None: return None

    # angle
    target_at_t = (t0[0] + tv[0]*t, t0[1] + tv[1]*t)
    angle = math.atan2(target_at_t[1] - s0[1], target_at_t[0] - s0[0])
    return angle, t
```

## 解法 B: 軌道 (円運動) の反復解法（推奨）

Orbit Wars の軌道は非線形なので直接解析解は複雑。**Fixed-point iteration** で収束:

```python
def intercept_orbital(s0, target_init, omega, fleet_ships, step_now, max_iter=20):
    """
    s0: 艦隊初期位置
    target_init: [id, owner, x0, y0, radius, ships, prod] (initial_planets の 1 個)
    omega: angular_velocity
    fleet_ships: 発射艦数
    step_now: 現在 step
    """
    v = fleet_speed(fleet_ships)
    CENTER = 50.0

    def orbital_pos(step):
        dx, dy = target_init[2] - CENTER, target_init[3] - CENTER
        r = math.hypot(dx, dy)
        if r + target_init[4] >= 50.0:
            return (target_init[2], target_init[3])  # static
        theta = math.atan2(dy, dx) + omega * step
        return (CENTER + r * math.cos(theta), CENTER + r * math.sin(theta))

    # 初期推定: 現在位置への直接発射 ETA
    curr_pos = orbital_pos(step_now)
    t_est = math.hypot(curr_pos[0] - s0[0], curr_pos[1] - s0[1]) / v

    # 反復
    for i in range(max_iter):
        future_pos = orbital_pos(step_now + t_est)
        d = math.hypot(future_pos[0] - s0[0], future_pos[1] - s0[1])
        t_new = d / v
        if abs(t_new - t_est) < 0.01:
            t_est = t_new
            break
        t_est = t_new

    future_pos = orbital_pos(step_now + t_est)
    angle = math.atan2(future_pos[1] - s0[1], future_pos[0] - s0[0])
    return angle, t_est, future_pos
```

### 収束保証

- 軌道惑星の速度 `r · ω` ≤ `50 · 0.05 = 2.5` units/turn
- 艦船速度 `v` ≥ 1.0
- **艦速 > 惑星速度 なら必ず収束**
- 例外: 艦速 1.0 + 惑星速度 2.5 → 非収束（超低艦数の場合のみ）

低艦数の場合は target を **現在位置** として発射 (諦める) or 艦数増やす。

### 計算量

20 反復 × 三角関数 4 個 = 80 trig calls ≈ 100 μs/solve

惑星 15 個 × 各 solve = 1.5ms → 無視できる。

## 解法 C: Grid Search (brute force)

t を 1..200 で走査、最小誤差の t を採用:

```python
def intercept_grid(s0, target_init, omega, v, step_now):
    best = None
    best_err = float('inf')
    for t_try in range(1, 200):
        future = orbital_pos(step_now + t_try)
        d = math.hypot(future[0] - s0[0], future[1] - s0[1])
        err = abs(d - v * t_try)
        if err < best_err:
            best_err = err
            best = (math.atan2(future[1] - s0[1], future[0] - s0[0]), t_try, future)
    return best
```

計算量大きいが、反復が収束しない場合の fallback として有用。

## 太陽回避

艦隊の直線経路が太陽 (半径 10, 中心 (50,50)) を横切らないかチェック:

```python
def trajectory_hits_sun(s0, angle, t_arrival, v, sun_center=(50,50), sun_r=10):
    # 線分 s0 → s_end の sun_center との最短距離
    s_end = (s0[0] + math.cos(angle) * v * t_arrival,
             s0[1] + math.sin(angle) * v * t_arrival)
    return point_to_segment_distance(sun_center, s0, s_end) < sun_r

def point_to_segment_distance(p, a, b):
    ax, ay = a
    bx, by = b
    px, py = p
    l2 = (bx-ax)**2 + (by-ay)**2
    if l2 == 0:
        return math.hypot(px-ax, py-ay)
    t = max(0, min(1, ((px-ax)*(bx-ax) + (py-ay)*(by-ay)) / l2))
    qx, qy = ax + t*(bx-ax), ay + t*(by-ay)
    return math.hypot(px-qx, py-qy)
```

**太陽を避けるルート**: 直接不可能なら、中継惑星経由 or 発射放棄。

## 他惑星との衝突

発射直後に隣接惑星にぶつかるリスク:

```python
def check_immediate_collision(s0, angle, obs, source_planet):
    test_x = s0[0] + math.cos(angle) * 5  # 5 units 前進
    test_y = s0[1] + math.sin(angle) * 5
    for p in obs["planets"]:
        if p.id == source_planet.id: continue
        d = math.hypot(test_x - p.x, test_y - p.y)
        if d < p.radius + 1:
            return True
    return False
```

衝突するなら target 変更。

## 統合: Full Intercept with Safety Checks

```python
def full_intercept(source, target, obs, ships):
    """安全性 check 込みの intercept"""
    my_id = obs["player"]
    omega = obs["angular_velocity"]
    step_now = obs["step"]
    initial = {p[0]: p for p in obs["initial_planets"]}

    # 発射開始位置 (source.radius + 0.1 外側)
    initial_guess_angle = math.atan2(target.y - source.y, target.x - source.x)
    s0 = (source.x + math.cos(initial_guess_angle) * (source.radius + 0.1),
          source.y + math.sin(initial_guess_angle) * (source.radius + 0.1))

    # Intercept 計算
    target_init = initial.get(target.id)
    if target_init is None:
        return None
    angle, eta, future_pos = intercept_orbital(s0, target_init, omega, ships, step_now)

    # Safety checks
    if trajectory_hits_sun(s0, angle, eta, fleet_speed(ships)):
        return None
    if check_immediate_collision(s0, angle, obs, source):
        # 隣接惑星を避けるための角度調整 (小角オフセット)
        for offset in [0.1, -0.1, 0.2, -0.2, 0.3, -0.3]:
            if not check_immediate_collision(s0, angle + offset, obs, source):
                angle += offset
                break
        else:
            return None

    return angle, eta, future_pos
```

## LUT (Look-Up Table) で加速

step=0 で全惑星の全 step 位置を事前計算:

```python
def build_planet_lut(obs, max_step=500):
    """[max_step, n_planets, 2] の np.ndarray"""
    initial = obs["initial_planets"]
    omega = obs["angular_velocity"]
    n = len(initial)
    lut = np.zeros((max_step, n, 2))
    for step in range(max_step):
        for i, p in enumerate(initial):
            dx, dy = p[2] - 50.0, p[3] - 50.0
            r = math.hypot(dx, dy)
            if r + p[4] >= 50.0:
                lut[step, i] = (p[2], p[3])
            else:
                theta = math.atan2(dy, dx) + omega * step
                lut[step, i] = (50.0 + r * math.cos(theta), 50.0 + r * math.sin(theta))
    return lut
```

これで `orbital_pos` を O(1) に。intercept solver の trig 計算を削減。

## Pursuit-Evasion Games (高度参考)

論文 [22-27] は spacecraft の軌道追跡。Orbit Wars は Planet が受動的なので基本の intercept で十分。ただし:

- 敵 fleet が自分の fleet を intercept しようとする場合 → pursuit-evasion
- コメット上の敵艦を奪取する場合 → moving target intercept

これらは標準 intercept solver で扱える範囲。

## 学び

1. **Fixed-point iteration** が Orbit Wars 軌道に最適
2. **LUT 事前計算** で trig 計算を O(1) に
3. **太陽回避・隣接衝突** の safety check 必須
4. **20 反復 + 4 trig = 100μs** で実用速度
5. **発射不可時** は target 変更 or 艦数増加で対処
