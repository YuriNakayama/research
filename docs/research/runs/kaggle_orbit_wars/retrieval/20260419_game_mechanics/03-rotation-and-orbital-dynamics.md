# 惑星回転と軌道力学

## ソース

`orbit_wars.py::interpreter()` Planet Movement & Sweep 部 (L553-590)

## 回転の公式

```python
if orbital_radius + planet.radius < ROTATION_RADIUS_LIMIT:  # 50
    initial_angle = atan2(dy, dx)          # 初期位置から計算
    current_angle = initial_angle + ω · step
    planet.x = CENTER + r · cos(current_angle)
    planet.y = CENTER + r · sin(current_angle)
```

- `ω` = `angular_velocity`（観測に含まれる、ゲームごとにランダムだが固定）
- 範囲: 0.025–0.05 rad/turn
- 1 周の目安: `2π/ω` ≈ 125 – 250 ターン

## 予測公式（実装推奨）

```python
import math

def predict_planet_position(initial_planet, angular_velocity, future_step):
    """t=future_step における惑星位置を予測。静的惑星は初期位置固定。"""
    _id, _owner, x0, y0, radius, _ships, _prod = initial_planet
    dx, dy = x0 - 50.0, y0 - 50.0
    r = math.hypot(dx, dy)
    if r + radius >= 50.0:
        return (x0, y0)  # 静的
    θ0 = math.atan2(dy, dx)
    θ = θ0 + angular_velocity * future_step
    return (50.0 + r * math.cos(θ), 50.0 + r * math.sin(θ))
```

## 艦隊 intercept 計算（重要）

### 静的惑星への派遣

ターゲット位置が固定なので、直接 `atan2(ty - sy, tx - sx)` で角度算出。
到達ターン数: `dist / speed(ships)`。

### 軌道惑星への intercept

艦隊が直線 `S(t) = S₀ + t·v·(cos α, sin α)` で進み、惑星が `P(t) = C + r·(cos(θ₀+ωt), sin(θ₀+ωt))` で回転する中で出会う `(t, α)` を解く。

**解析解の考え方**:

艦隊は速度 `v(ships)` が固定。一方、発射角 `α` を未知数として、`||S(t) - P(t)|| = planet.radius` を満たす最小 `t > 0` を探す。

- 式: `(S₀.x + v·t·cos α - 50 - r·cos(θ₀+ωt))² + (S₀.y + v·t·sin α - 50 - r·sin(θ₀+ωt))² = radius²`

この方程式は α, t について超越的（cos(θ₀+ωt) が非線形）なので、**数値解法**:

1. **反復解法（最も安定）**:
   ```
   初期推定: t₀ = distance(source, planet_now) / speed
   for iter in 1..20:
       予測着弾位置 P(t_est)
       α_est = atan2(P(t_est).y - source.y, P(t_est).x - source.x)
       t_new = distance(source, P(t_est)) / speed
       t_est = t_new
   ```

2. **格子サーチ**: t を 1..episodeSteps で走査、各 t で予測位置 P(t) への発射角 α と艦の直線移動距離 v·t の差が小さい t を採用。

### 到達不可ケース

- 太陽を横切る直線 → 発射前に検出して除外
- 艦隊 speed が惑星軌道よりずっと遅い → 永遠に追いつかない
- 惑星の角速度方向と艦隊の追跡角度で intercept が安定しない

## 掃き取り（sweep）の計算

軌道惑星が old_pos → new_pos に移動する 1 ターンの間、艦隊が線分内にいた場合に衝突扱い:

```python
if point_to_segment_distance(fleet_pos, planet.old_pos, planet.new_pos) < planet.radius:
    combat
```

艦隊視点: **軌道上を避けないと、近くを通り過ぎるつもりでも巻き込まれる**。

## 軌道惑星の戦略的特徴

| 特徴 | 影響 |
|------|------|
| 位置が時変 | 攻撃ルートが毎ターン変わる、キャンプ防衛不可 |
| sweep で巻き込み | 軌道上の camping 艦隊は自動的に戦闘へ |
| 中央に近い | 太陽が経路遮断、対角攻撃は大回り |
| production 多め | phase 1.5 で r が小さい（内側）ほど高 production |

## 実装のヒント

1. **毎ターンの現在位置は lazy に計算**: observation の `planets` に即値があるが、`initial_planets + angular_velocity` から自前計算することで "将来位置" もワンパスで算出
2. **角度キャッシュ**: θ₀ を全惑星について最初のターンで計算し、以降は `θ₀ + ω·step` のみ
3. **LUT (Look-Up Table)**: 500 ターン × ~20 軌道惑星 = 10,000 エントリ、起動時に計算して np.ndarray に入れれば intercept 計算が極速

## 軌道半径と production の関係（map generation から）

- Phase 1.5 (軌道惑星保証): `r = 1 + ln(prod)`, `orbital_r ∈ [SUN_R + r + 10, 50 - r]`
  - prod=5 → r=2.61, orbital_r ∈ [14.61, 47.39]
  - prod=1 → r=1.00, orbital_r ∈ [11.00, 49.00]
- **軌道惑星は中央付近に位置** することが多く、**production の高いものは保護価値が大きい**
- 静的惑星は外縁に分布、production は一様
