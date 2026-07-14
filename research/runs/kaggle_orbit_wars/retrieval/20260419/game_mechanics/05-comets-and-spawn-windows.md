# コメット生成と spawn ウィンドウ

## ソース

- `orbit_wars.py::generate_comet_paths()` (L215-349)
- `orbit_wars.py::interpreter()` comet 処理部 (L419-478, L592-626)

## コメットの基本

- **半径**: 1.0（固定）
- **production**: 1 （所有時に毎ターン 1 艦生産）
- **初期艦数**: `min(U[1,99], U[1,99], U[1,99], U[1,99])`（4 回振って最小、つまり低めに歪む）
- **4 個 1 グループ**（完全対称）
- 盤面に現れる期間は **5 〜 40 ターン**（path 長）

## Spawn ウィンドウ

```python
COMET_SPAWN_STEPS = [50, 150, 250, 350, 450]
```

- 各 step で 1 グループ = 4 個のコメットが出現
- **ゲーム全体で最大 5 × 4 = 20 個**
- 既存コメットとは id が被らない（`next_id = max(planets.id) + 1`）

## 軌道の計算

### 楕円パラメータ

```python
e = U(0.75, 0.93)     # 離心率（高偏心）
a = U(60, 150)        # 長半径
perihelion = a · (1 - e)
b = a · sqrt(1 - e²)
c = a · e             # 焦点距離
phi = U(π/6, π/3)     # 傾きの方位（Q4 方向）
```

### path 生成

5000 点を密サンプリング後、`comet_speed = 4.0 units/turn` で等距離再サンプリング。その後、盤面内にある連続セグメントを抽出。

```python
for i in 0..5000:
    t = 0.3π + 1.4π · i / (5000-1)
    ex = c + a·cos(t)
    ey = b·sin(t)
    # 回転と平行移動
    x = CENTER + ex·cos(phi) - ey·sin(phi)
    y = CENTER + ex·sin(phi) + ey·cos(phi)
```

ゲーム空間座標 `(x, y)` が盤面内の `5 ≤ len ≤ 40` 連続ステップのみ採用。

### 4 対称コピー

```python
paths = [
    [(x, y) for ...],             # Q1
    [(100-x, y) for ...],         # Q2
    [(x, 100-y) for ...],         # Q3
    [(100-x, 100-y) for ...],     # Q4
]
```

### 衝突バリデーション

生成された path が:
1. 太陽に近すぎない: 全点で `distance to center > SUN_RADIUS + COMET_RADIUS`
2. 静的惑星に近すぎない: 4 対称点の各点で干渉なし
3. 軌道惑星に近すぎない: **その step 時点での軌道惑星位置** で干渉なし

を満たすまで最大 300 回試行。成功しなければ spawn スキップ（ゲーム継続）。

## 観測での扱い

```python
comets = [
    {
        "planet_ids": [21, 22, 23, 24],   # 4 個の惑星 ID
        "paths": [                          # 軌道（完全決定的）
            [[x0, y0], [x1, y1], ...],     # comet 21 の軌跡
            [...],                          # 22
            [...],                          # 23
            [...],                          # 24
        ],
        "path_index": 7                     # 現在の位置 index
    },
    ...
]
comet_planet_ids = [21, 22, 23, 24, ...]
```

### 重要: **未来完全予測可能**

`paths` には spawn から消滅までの **全ステップ** が格納されている。`path_index` が増えるだけで将来位置は既知:

```python
def future_comet_pos(group, comet_idx, turns_ahead):
    idx = group["path_index"] + turns_ahead
    p_path = group["paths"][comet_idx]
    if idx >= len(p_path):
        return None  # 盤面外
    return p_path[idx]
```

## コメットの寿命管理

```python
# ターン開始時: 期限切れ処理
for group in comets:
    for i, pid in enumerate(group.planet_ids):
        if path_index >= len(paths[i]):
            expired.append(pid)
# 除去
planets, initial_planets, comet_planet_ids から除外
```

**ships は消える**（所有中でも補償なし）。コメットに艦を置いておくのはリスクだが、その間の生産は得られる。

## 戦略的含意

### 1. コメットは低コスト高配当

- 初期 ships 1-99 の min(4 rolls) → **実質 1-30 程度** で占領できるケース多
- 保持中 1 ship/turn 生産
- 5-40 ターン保持 → **平均 +10-20 艦の利得**

### 2. 4 個同時 spawn → 並行占領

自プレイヤーは 4 個のうち自分の方位（Q1 プレイヤーなら Q1 コメット）にアクセスしやすい。**最近くの惑星から 1 艦でも送って占領予約** するのが効率的。

### 3. 期限切れの損失

コメットに 50 艦貯め込んだ状態で消滅 → **50 艦失う**。以下のルールで管理:
- 残り path_len ≤ 3 なら全艦を近くの自惑星へ retreat
- production=1 なので長期 garrison は意味薄い

### 4. コメット間の協調攻撃

4 個コメットは **4 重対称** なので、相手の獲得状況も自分の対応位置から予測可能。

### 5. 敵コメットへの攻撃

敵のコメットを奪うのも可能だが:
- コメットは移動中なので到着タイミングに注意
- 残り path_len ≤ 数ターンなら攻撃が無駄（どうせ消える）
- 敵が艦を溜めたコメットは奪取で大逆転可能

## 実装メモ

### path_index = -1 の初期状態

spawn 直後の 1 ターンは `path_index = -1`、位置は `(-99, -99)` の placeholder。その後 Planet Movement 段階で `path_index += 1` になり、`paths[0]` の位置に着く。

### spawn timing と agent observation

step=49 終了時に step=50 の spawn 処理が走る。step=50 の agent は **新コメットを観測で受け取る**（位置は placeholder、次ターンに真の初期位置）。

### 軌道の高偏心

`e ∈ [0.75, 0.93]` なので、perihelion（近日点）と aphelion（遠日点）の比は `(1+e)/(1-e) ∈ [7, 27.6]` と大きく、**太陽近傍で急加速、外側でゆっくり**。ただし Orbit Wars は等距離サンプリングのため path 上の速度は `comet_speed` で一定。

## コメット戦略チートシート

| 状況 | 推奨行動 |
|------|---------|
| spawn 直後、自方位コメット | 最近くの自惑星から 最少艦（コメット初期艦 + 1）で即占領 |
| 敵方位コメット | 敵の reach 次第、遠すぎるなら無視 |
| 自分所有のコメット、残り < 5 turns | 艦を近傍自惑星へ retreat |
| 敵所有のコメット、残り > 10 turns | 奪取価値あり、その艦数を計算 |
| 多コメット同時出現 | 艦数が多い所有中惑星からの分散派遣が有効 |
