# 戦闘解決ロジック

## ソース

`orbit_wars.py::interpreter()` Combat Resolution 部 (L630-669)

## ロジック（逐次読解）

```python
for planet_id, planet_fleets in combat_lists.items():
    planet = find_by_id(planet_id)
    if not planet or not planet_fleets:
        continue

    # Step 1: プレイヤー別に艦数集計
    player_ships = {}
    for fleet in planet_fleets:
        owner = fleet.owner
        player_ships[owner] = player_ships.get(owner, 0) + fleet.ships

    # Step 2: 最大 vs 第2 対決
    sorted_players = sorted(player_ships.items(), key=lambda x: x[1], reverse=True)
    top_player, top_ships = sorted_players[0]

    if len(sorted_players) > 1:
        second_ships = sorted_players[1][1]
        survivor_ships = top_ships - second_ships
        if top_ships == second_ships:
            survivor_ships = 0  # 同数 → 全滅
        survivor_owner = top_player if survivor_ships > 0 else -1
    else:
        survivor_owner = top_player
        survivor_ships = top_ships

    # Step 3: survivor と garrison の戦闘
    if survivor_ships > 0:
        if planet.owner == survivor_owner:
            # 自陣所有 → 加算
            planet.ships += survivor_ships
        else:
            # 異所有 → 差分
            planet.ships -= survivor_ships
            if planet.ships < 0:
                planet.owner = survivor_owner
                planet.ships = abs(planet.ships)
```

## 挙動の分類

### ケース 1: 単一プレイヤーの艦隊のみ到着

- 同じ所有者の複数艦隊 → 全部 survivor 扱い
- 中立惑星: `planet.ships -= total` で足りれば占領（残りは新 garrison）
- 自陣惑星: `planet.ships += total`（加算）

### ケース 2: 複数プレイヤーの艦隊が到着（tie なし）

- top_ships - second_ships が survivor ships
- **3 番手以降は完全無視**（2 プレイヤーバトルに等価）
- **その後** survivor vs garrison（中立なら survivor 全量で garrison を削る）

### ケース 3: tie（top = second）

- **survivor = 0** → 全員消滅
- garrison はそのまま残る
- **3 番手以降も消滅**（全艦消える）

### ケース 4: 複数艦隊同所有者 tie

- 先に所有者別に合計されてから比較なので、tie するのは **2 人以上の合計が偶然同じ** になった場合

## 具体例

### 例 A: 中立占領

```
planet: {owner=-1, ships=20}
arrivals: {P0: 30}
→ survivor = 30, survivor_owner = 0
→ planet.ships = 20 - 30 = -10 → owner=0, ships=10
```

### 例 B: 自陣補給

```
planet: {owner=0, ships=50}
arrivals: {P0: 100}
→ planet.ships = 50 + 100 = 150
```

### 例 C: 侵攻成功

```
planet: {owner=1, ships=40}
arrivals: {P0: 100}
→ planet.ships = 40 - 100 = -60 → owner=0, ships=60
```

### 例 D: 2 陣同着 tie 全滅

```
planet: {owner=1, ships=50}
arrivals: {P0: 100, P2: 100}
→ survivor = 0 → 全滅
→ planet 変化なし（ships=50, owner=1）
```

### 例 E: 2 陣同着 差分あり

```
planet: {owner=1, ships=30}
arrivals: {P0: 100, P2: 80}
→ survivor = 20, survivor_owner = 0
→ planet.ships = 30 - 20 = 10 (owner=1 維持、侵攻失敗)
```

### 例 F: 3 陣同着

```
planet: {owner=-1, ships=20}
arrivals: {P0: 100, P1: 80, P2: 70}
→ sorted: [P0:100, P1:80, P2:70]
→ survivor = 100 - 80 = 20, owner=P0
→ P2 は無視（70 艦消失）
→ planet.ships = 20 - 20 = 0 → **所有者は変わらず -1、ships=0**
```

**注意**: ships=0 ちょうどで等しくなった場合は所有者は変わらない（ownership 変更は `< 0` 判定）。

### 例 G: 3 陣同着 top tie

```
planet: {owner=-1, ships=20}
arrivals: {P0: 100, P1: 100, P2: 30}
→ sorted: [P0:100, P1:100, P2:30]
→ survivor = 0 → 全滅
→ planet 変化なし（P2 の 30 艦も消滅）
```

## 戦略的含意

### tie 全滅の読み合い

**+1 ルール** が最重要:
- 相手の予想派遣艦数が 100 なら、101 艦を送れば必ず 1 艦 survivor
- 逆に相手を 99 艦で引き出して tie を誘発できる

### 3 番手の無視

3 人以上の混戦では、top と second だけが戦い、**3 番手は完全消耗**。これは:
- 4P ゲームで **混戦を煽って 3 番手を消耗** させる戦略
- 自分は 2 番手に徹して 1 番手の survivor を削る戦法

### garrison との戦闘

survivor vs garrison は **一方的な減算**（戦闘ではない）:
- survivor が garrison より多い → 占領、余剰が新 garrison
- survivor が garrison と同じ → 所有者変わらず、ships=0
- survivor が garrison より少ない → 守備成功、garrison 減

### 複数艦隊の同一ターン到着

同ターンに同一惑星に到着する複数艦隊（自陣含む）は **同時処理**。
- 自陣への同ターン複数艦隊は `garrison += total`
- 自陣 vs 敵陣同ターンは: 自陣 survivor なら守備補強、敵陣 survivor なら敵差分で戦闘

## 実装の落とし穴

1. **survivor=0 なのに garrison 変化しない**: L662 の `if survivor_ships > 0:` で弾かれる
2. **ships < 0 のチェック**: ships = 0 ちょうどだと owner 変わらない（偶然守り切った扱い）
3. **tie で 3 番手以降を集計しない**: 3 番手 70 艦が消滅しても差し引き処理はしない（単に消える）

## 攻撃価値の近似式

相手惑星 `P` を攻略する期待値:
```
attack_value = P.production · remaining_turns - required_ships
required_ships = enemy_garrison + enemy_expected_reinforcement + 1
```

production=5, 残り 200 ターンなら 1000 艦相当の価値 → 500 艦の攻撃艦投入で +500 の利得。
