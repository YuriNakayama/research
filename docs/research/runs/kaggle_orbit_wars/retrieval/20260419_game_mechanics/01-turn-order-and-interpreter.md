# ターン順と interpreter の処理

## ソース

`orbit_wars.py::interpreter()` (L352-712)

## 処理フロー（1 ターンの全ステップ）

```
0. 初期化（step=0 のみ）
   └ angular_velocity ランダム生成 (0.025-0.05)
   └ generate_planets() で惑星配置（4 重対称）
   └ home planet に各プレイヤーを割当 (10 ships 固定)

--- 通常ターン ---

1. コメット消滅
   └ 各 group の paths を path_index が超えた comet を除去
   └ 除去された comet の ships は消失

2. コメット spawn
   └ step+1 が COMET_SPAWN_STEPS [50, 150, 250, 350, 450] に含まれる時のみ
   └ generate_comet_paths() で楕円軌道生成
   └ 4 個 1 組、全対称、初期 ships は min(4 rolls from 1-99)

3. Fleet Launch（プレイヤー行動適用）
   └ action が [[from_id, angle, ships], ...] 形式
   └ 所有チェック・艦数チェック
   └ 新 fleet spawn (radius+0.1 の外側)

4. Production
   └ 所有惑星全てで planet[5] += planet[6]
   └ コメット（production=1）も加算

5. Fleet Movement（連続衝突判定）
   └ speed = 1 + 5·(log(ships)/log(1000))^1.5
   └ 直線移動
   └ Out of bounds → 消滅
   └ 太陽との線分最短距離 < SUN_RADIUS → 消滅
   └ 惑星との線分最短距離 < planet.radius → 戦闘キュー追加 & 消滅

6. Planet Movement & Sweep
   └ 軌道惑星の回転: angle = initial_angle + ω·step
   └ 回転前後で sweep: old_pos → new_pos の線分内の艦隊は戦闘キューへ
   └ コメットは path_index 進行、同様に sweep

7. Combat Resolution
   └ 各惑星ごとに戦闘キューを処理
   └ 所有者別に ships 集計
   └ top vs second 対決、差分が survivor
   └ tie → 両者全滅
   └ survivor vs garrison で占領判定

8. 終了判定
   └ step >= episodeSteps - 2 or alive_players ≤ 1
   └ スコア = 所有惑星の ships + 艦隊中 ships
   └ 最高スコアのプレイヤーに reward=1、他は -1
```

## エージェント観点での含意

### 観測は **ターン開始時** の状態

`observation` はステップ 1 の Fleet Launch 直前に提供される。つまり:
- 自分の惑星の `ships` は **生産前** の値
- 「このターンに生産される数」は `planet[6]` を見れば分かる
- 他プレイヤーの行動はまだ反映されていない（同期ターン）

### 発射の即時性

自分の Fleet Launch は同ターンに適用される。発射した艦は:
- 同ターンの **生産後の garrison から差し引かれる** ではなく、発射時点の garrison から差し引かれる
- 発射後に生産が加算されるので、max_ships = `ships - sent_ships + production`

### 同期ターンと情報

全プレイヤーが同時に行動宣言 → 同時に処理される。戦闘結果が見えるのは **次のターンの観測** になる。

### tie 回避のヒント

戦闘に巻き込まれるのは:
1. 相手の派遣艦隊が自分の惑星に到達
2. 自分が相手の惑星に派遣
3. 中立惑星への複数プレイヤーの到着

`fleets` 観測から相手の派遣量と着弾 ETA を計算可能。相手の派遣に対して:
- 完全ブロック: 派遣量 = 相手艦数 + garrison + 1
- 取引: 派遣量 = 相手艦数 のみ（tie → 全滅でこちらも失う）

### 掃き取り（sweep）の意味

軌道惑星が移動するとき、以前に惑星があった位置と新しい位置の間にいた艦隊は巻き込まれる。攻撃側の影響:
- 惑星が移動する軌道上に艦隊を待機させる "camp" 戦術は成立しない（移動時に吸収される）
- 軌道惑星に派遣するときは、**到着タイミングを惑星位置に合わせる必要**

## interpreter 呼び出しの頻度

- `env.step(actions)` → `interpreter(state, env)` が 1 回呼ばれる
- ローカル実行では毎ターン同期、Kaggle 上では各 agent が並列実行された後集約

## renderer と html_renderer

- `renderer()`: テキスト表示用
- `html_renderer()`: notebook では `orbit_wars.js` の軽量版、`render(mode="html")` では Vite ビルド済みの visualizer

## 既知の Edge Case（コードから）

- ships=0 の発射は `ships > 0` チェックで弾かれる
- ships が float で来たら `int()` で切り捨て
- `from_planet_id` が自分の惑星でないと無視（エラーではない）
- 同一 action リスト内に重複 from_id がある場合、各 move が順に処理されるので **ships が途中で不足** すれば後続は発射されない
