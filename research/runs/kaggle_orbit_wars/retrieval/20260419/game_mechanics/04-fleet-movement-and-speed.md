# 艦隊移動と速度スケーリング

## ソース

`orbit_wars.py::interpreter()` Fleet Movement 部 (L519-551)

## 速度の公式

```python
speed = 1.0 + (max_speed - 1.0) * (log(ships) / log(1000)) ** 1.5
speed = min(speed, max_speed)   # 上限 6.0
```

### 数値表

| ships | speed | notes |
|-------|-------|-------|
| 1 | 1.00 | 最小 |
| 5 | 1.46 | home planet 相当 |
| 10 | 1.86 | |
| 20 | 2.30 | |
| 50 | 2.84 | |
| 100 | 3.20 | |
| 200 | 3.78 | |
| 500 | 5.11 | |
| 700 | 5.55 | |
| 1000 | 6.00 | 上限到達 |
| 2000 | 6.00 | clip |

### 可視化の直感

`log(ships)/log(1000)` は `log₁₀₀₀(ships)` で、ships=1 で 0、ships=1000 で 1 になる。`^1.5` がかかることで序盤（ships=10〜100）は緩やかに、後半（ships=500〜1000）で急増する。

## 移動処理

```python
old_pos = (fleet.x, fleet.y)
fleet.x += cos(angle) * speed
fleet.y += sin(angle) * speed
new_pos = (fleet.x, fleet.y)
```

角度 `angle` は発射時の固定値で、**飛翔中変更不可**。

## 衝突判定（3 段階、順序が重要）

### 1. 盤面外判定

```python
if not (0 ≤ fleet.x ≤ 100 and 0 ≤ fleet.y ≤ 100):
    remove
```

new_pos での判定のみ。old_pos → new_pos の線分が **途中で盤面外に出て戻る** パターンは想定されない（盤面 100x100、speed≤6 なので事実上起きない）。

### 2. 太陽通過判定

```python
if point_to_segment_distance((50,50), old_pos, new_pos) < SUN_RADIUS (10):
    remove
```

**線分と太陽中心の最短距離** を見るので、端点が離れていても途中で接近すれば消滅する。

### 3. 惑星衝突判定

```python
for planet in planets:
    if point_to_segment_distance(planet.pos, old_pos, new_pos) < planet.radius:
        combat_queue[planet.id].append(fleet)
        remove
        break  # 最初にヒットした惑星のみ
```

- **最初にヒットした惑星** にのみ追加、それ以降の惑星は判定しない
- 自分の惑星から発射直後に戻って衝突することはない（spawn が `radius + 0.1` の外側）

## 同着タイミングの計算

2 つの艦隊（ships=100 と ships=200）を同時到着させたい場合:
- speed₁ = 3.20, speed₂ = 3.78
- 同じ距離を飛ばすなら、200 艦のほうが早着
- 小さい艦隊を先に発射して待たせる必要がある
- ただし速度を下げるために小分けするのは逆効果（両方遅くなる）

### 実用式

`t = distance / speed(ships)` で到達ターン計算。距離 D を T ターンで到達する艦数:
- speed = D/T を満たす ships を逆算
- `ships = exp(log(1000) · ((speed-1)/5)^(2/3))`
- 例: T=20, D=60 → speed=3.0 必要 → ships≈76

## 派遣時の初期位置

```python
start_x = planet.x + cos(angle) * (planet.radius + 0.1)
start_y = planet.y + sin(angle) * (planet.radius + 0.1)
```

- 発射角度方向、惑星表面の **0.1 外側**
- 発射直後の同ターンでも自惑星に衝突しない
- ただし **隣接惑星には即衝突する可能性** → 発射前に近隣惑星を避ける方向調整が必要な場合あり

## 戦略的含意

### 大艦隊主義（Big Stack）

- 1000 艦単一派遣 ≈ 500 艦 + 500 艦 2 回派遣 で、前者が 6.0 speed、後者が 5.11 speed
- **速度で明らかに有利** なので、**可能な限り大艦隊を 1 個にまとめる** のが速度的には最適
- ただし tie 全滅ルールで **1000 艦 vs 1000 艦で全滅** するリスクを負う

### Small Stack Denial（小艦隊による妨害）

- 50 艦（speed 2.84）を camping 位置に置いても遅く、spam しにくい
- ただし 5-20 艦の偵察派遣は **低コストで情報を得る** 手段として有効

### 時間ずれによる連鎖攻撃

- 第一波（小艦隊）が守備を引き出し、第二波（大艦隊）が同タイミング差分で到着
- 大艦隊を遅らせて小艦隊と合流させる「waiting」は cost があるが、tie 全滅回避に有効

### 軌道惑星への角度補正

artillery 問題と同じ。惑星位置 P(t) での着弾を狙うため、発射角は静的惑星とは異なる（前述）。

## 実装上の注意

- 速度計算は毎ターンの全艦隊で実行される: 艦数が 100 個なら 100 回 `log()` + `pow()`
- Python ネイティブで 1 秒制約なら問題ないが、numpy vectorize で 10-100 倍高速化可能
- `point_to_segment_distance` は O(N·M)（艦隊×惑星）。空間分割（bucket grid）で O(N + M) 近くまで削減可能

## 壁衝突の扱い（なし）

- 盤面境界は **吸収境界**（触れると消滅）
- 反射・ラッピングなし
- 艦隊を盤面外に出すミスは致命的
