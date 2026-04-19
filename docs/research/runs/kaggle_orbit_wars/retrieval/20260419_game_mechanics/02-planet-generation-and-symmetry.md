# 惑星生成と 4 重対称

## ソース

`orbit_wars.py::generate_planets()` (L46-212)

## 生成アルゴリズム（3 段階）

### Phase 1: 静的惑星グループ保証（≥ 3 groups）

Q1 (右上) の極座標でサンプリング:
```python
angle = U(0, π/2)
prod  = U{1, ..., 5}
r     = 1 + ln(prod)
min_orbital = ROTATION_RADIUS_LIMIT - r  # 50 - r
max_orbital = (BOARD - CENTER - r) / max(cos(angle), sin(angle))
orbital_r = U(min_orbital, max_orbital)
x = CENTER + orbital_r · cos(angle)
y = CENTER + orbital_r · sin(angle)
```

バリデーション:
- 惑星本体が盤面内
- 4 つの対称コピーも盤面内
- Q1 が軸から `r + 5` 以上離れている（対称コピーが重ならない）
- 既存惑星と `p.r + tp.r + PLANET_CLEARANCE (=7)` 以上離れている

初期艦数:
```python
ships = min(U[5, 99], U[5, 99])  # 低めに歪ませる
```

### Phase 1.5: 軌道惑星グループ保証（1 group, y=x 対角）

4P 対称性を保つため、軌道惑星は **y=x 対角 (π/4)** にのみ配置される:
```python
x = CENTER + orbital_r · cos(π/4)
y = CENTER + orbital_r · sin(π/4)
# 4 対称コピー → π/4, 3π/4, 5π/4, 7π/4 に均等配置
```

orbital_r の範囲:
```
min = SUN_RADIUS + r + 10    # 太陽に近すぎない
max = ROTATION_RADIUS_LIMIT - r
```

軌道 vs 静的のクロスチェック: 回転時に最接近しても `|Δorbital_r| ≥ r₁ + r₂ + 7` を保証。

### Phase 2: 残り惑星をランダム充填

目標: `num_q1 = U[5, 10]` グループ（合計 20-40 個）

```python
x = U(CENTER + 15, BOARD - r - 5)  # 中心から十分離れた Q1 内
y = U(CENTER + 15, BOARD - r - 5)
orbital_radius = sqrt((x-C)² + (y-C)²)
```

条件:
- `orbital_r ≥ SUN_RADIUS + r + 10` （太陽近接回避）
- 軌道惑星化する場合は `orbital_r + r < 50`
- 静的惑星化する場合は盤面内に収まる

初期艦数はここでは `U[5, 30]`（Phase 1 より低めの上限）。

`max_attempts = 5000` で強制打ち切り。`has_orbiting=True` 保証ループを並走。

## 出力

```python
planets = [
    [id, owner=-1, x, y, r, ships, production],
    ...
]
# 4 の倍数個。group k の 4 個は [4k, 4k+1, 4k+2, 4k+3]
# 4k   = Q1 (x, y)
# 4k+1 = Q2 (100-x, y)
# 4k+2 = Q3 (x, 100-y)
# 4k+3 = Q4 (100-x, 100-y)
```

## home planet 割当（interpreter 内）

```python
num_groups = len(planets) // 4
home_group = random.randint(0, num_groups - 1)
base = home_group * 4

# 4P: Q1 が軌道惑星なら y=x 対角 group に振り替え
if num_agents == 4 and orbital:
    find_y_eq_x_diagonal_orbiting_group()

# 2P: base (Q1) と base+3 (Q4) 対角
planets[base].owner = 0;   planets[base].ships = 10
planets[base+3].owner = 1; planets[base+3].ships = 10

# 4P: 4 個全部
for j in 0..3:
    planets[base+j].owner = j
    planets[base+j].ships = 10
```

## 対称性の含意

### プレイヤー情報

2P では:
- プレイヤー 0 (Q1) の全惑星は `id % 4 == 0`
- プレイヤー 1 (Q4) の全惑星は `id % 4 == 3`
- 位置が `(100-x, 100-y)` で完全対称

4P では:
- プレイヤー i の home は `id % 4 == i`
- 各プレイヤー間の関係:
  - i=0 vs i=1: 上下反転
  - i=0 vs i=2: 左右反転
  - i=0 vs i=3: 点対称

### 戦略的情報

1. **自分の視点で解いた行動は対称コピーにも転用可能** → 対称性を活用した学習データ増強
2. **開幕の最適手は対称性から唯一解**（相手も同じ手を打つ）→ 先手の優位は存在しない
3. **自分の惑星間距離 == 対応する相手惑星間距離** → 防衛プランが直接転用可能

### バリエーション

- 惑星数: 20-40（5-10 グループ × 4）
- 惑星の production 分布: 1-5 の一様乱数、ゲームごとに異なる
- 初期 ships: 5-99 の歪んだ分布、ゲームごとに異なる
- 軌道 vs 静的の比率: 1-7 グループ軌道 / 3-8 グループ静的
- 角速度: 0.025-0.05 rad/turn、ゲームごとに固定（1 ゲーム内では一定）

## 実装ポイント

- `initial_planets` 観測から初期配置を常に参照可能（経過ターン数に関係なく）
- `angular_velocity` も観測にあるので、軌道惑星の現在位置は `step=0` 情報だけで計算可能:

```python
def orbital_position(initial_planet, angular_velocity, step):
    x0, y0 = initial_planet[2], initial_planet[3]
    dx, dy = x0 - CENTER, y0 - CENTER
    r = sqrt(dx² + dy²)
    θ0 = atan2(dy, dx)
    θ = θ0 + angular_velocity * step
    return (CENTER + r·cos(θ), CENTER + r·sin(θ))
```
