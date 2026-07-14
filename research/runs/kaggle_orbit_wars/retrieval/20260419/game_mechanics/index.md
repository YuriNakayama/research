# Retrieval: game_mechanics

Orbit Wars のゲームメカニクスを **orbit_wars.py (v1.0.9) の実装 807 行** から逆算して体系化した詳細レポート群。実装が唯一の真実 (source of truth)。

## レポート一覧

| # | タイトル | 主題 |
|---|---------|------|
| [01](01-turn-order-and-interpreter.md) | ターン順と interpreter の処理 | 7 段階のターン処理、I/O 境界 |
| [02](02-planet-generation-and-symmetry.md) | 惑星生成と 4 重対称 | 3 段階生成ロジック、対称性保証 |
| [03](03-rotation-and-orbital-dynamics.md) | 惑星回転と軌道力学 | `angular_velocity` 挙動、軌道予測公式 |
| [04](04-fleet-movement-and-speed.md) | 艦隊移動と速度スケーリング | 対数速度曲線、連続衝突判定、太陽回避 |
| [05](05-comets-and-spawn-windows.md) | コメット生成と spawn ウィンドウ | 楕円軌道、完全予測、tempo 要素 |
| [06](06-combat-resolution.md) | 戦闘解決ロジック | tie 全滅、掃き取り、garrison ロジック |
| [07](07-starter-agent-analysis.md) | 公式 starter_agent 分析 | ベースラインの戦略と弱点、拡張方針 |

## TL;DR: Orbit Wars 固有要素の本質

### 連続 2D + 軌道というハイブリッド

- **連続空間**なので discrete grid ゲームの手法（convnet）が直接使えず、entity-based 表現が必要
- ただし **惑星配置と軌道は開始時に完全決定** されるため、**未来位置は角度計算だけで予測可能**
- コメット軌道も `paths` 配列に全ステップ分格納済み

### 速度の非線形性

```
speed(ships) = 1.0 + 5.0 * (log(ships) / log(1000))^1.5
```

| ships | speed | 備考 |
|-------|-------|------|
| 1 | 1.00 | 最小 |
| 10 | 1.86 | 序盤 |
| 100 | 3.20 | 中盤 |
| 500 | 5.11 | 終盤 |
| 1000 | 6.00 | 上限 |

**大艦隊ほど速い** が、**2 個に分けて同着** させる場合は両方が遅くなる（trade-off）。

### tie → 全滅ルール

```
attacker_A (100) vs attacker_B (100) → 両者全滅 (survivor=0)
attacker_A (101) vs attacker_B (100) → A に 1 艦残存
```

これは **読み合いの最重要要素**。相手の派遣艦数を読み、+1 を送るだけで逆転可能。

### 掃き取り戦闘 (sweep)

軌道惑星が移動した際、**old_pos → new_pos の線分内にいた艦隊は衝突** したとみなされ戦闘に巻き込まれる。これは軌道惑星への防衛戦略を難しくする独特の要素。

### 生産→移動の順序

ターン内順序は **発射 → 生産 → 移動 → 回転/sweep → 戦闘**。
- 発射時点の艦数は **発射前の値**（生産は発射の後）
- 発射と同ターンに生産された艦は残留する
- 発射した残量と生産で garrison が決まる

## 戦略的含意

1. **軌道予測は閉形式で解ける**: 惑星位置 `P(t) = C + r·(cos(θ₀ + ωt), sin(θ₀ + ωt))` と艦隊の直線運動の交差は二次方程式で厳密解
2. **コメット占領の即効性**: 4 個同時 spawn + production 1 で 5-20 turn 保持する間に +5〜20 艦相当
3. **生産ラッシュ vs 攻撃タイミング**: production=5 の惑星 1 個で 200 turn 保持すれば 1000 艦 → これに届く攻撃タイミングを計算
4. **対称性開幕**: 初期配置は完全対称なので、相手初手を自分初手から予測可能
5. **太陽は壁**: 中心を通る最短経路は太陽で遮断される → 対角派遣は大回り必須

## 派生的な実装ポイント

- 艦隊 spawn 位置は `planet.r + 0.1` の外側なので **自惑星には即衝突しない**
- `fleet_id` は単調増加、重複なし
- `step` は 0-indexed、終了は `step >= episodeSteps - 2` （実質 498 ターンで判定）
- ネガティブ garrison 時の ownership 変更: `planet[5] -= survivor; planet[5] < 0 → owner = survivor_owner, ships = |planet[5]|`
