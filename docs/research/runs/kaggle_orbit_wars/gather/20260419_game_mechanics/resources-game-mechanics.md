# Resources: game_mechanics

ゲーム物理・メカニクスを深掘りするためのリソース。公式実装が source of truth。

## 一次ソース（公式実装）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **orbit_wars.py (実装本体)** | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/orbit_wars.py | Python | 惑星生成 / 艦隊移動 / 戦闘解決 / コメット軌道 / 回転処理の **唯一の真実**。ゲームエンジン全てを 807 行に集約 |
| 2 | orbit_wars.js | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/orbit_wars.js | JavaScript | リプレイレンダラ。座標変換・描画ロジックから視覚化を理解 |
| 3 | orbit_wars visualizer | https://github.com/Kaggle/kaggle-environments/tree/master/kaggle_environments/envs/orbit_wars/visualizer | Assets | フロント表示アセット |
| 4 | test_orbit_wars.py | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/orbit_wars/test_orbit_wars.py | Python test | 戦闘計算・衝突判定・対称性生成などコーナーケースの確定仕様 |

## 判明済みメカニクス（README 抜粋・確定）

### 盤面

- 100 x 100 連続空間、原点左上
- 中心 (50, 50) に太陽（半径 10）。艦隊が通過線分で太陽に近づくと **即破壊**
- **4 重鏡映対称**で惑星配置: `(x,y), (100-x,y), (x,100-y), (100-x,100-y)`
- 2P ゲームは対角 Q1 vs Q4 配置、4P は各プレイヤー 1 枠

### 惑星

- 20-40 個、5-10 対称グループ、うち **静的 ≥ 3 グループ / 軌道 ≥ 1 グループ保証**
- 属性: `[id, owner, x, y, radius, ships, production]`
- `radius = 1 + ln(production)`, production は 1–5 の整数
- 所有中のみ毎 tick `production` 機の艦を生成
- 軌道条件: `orbital_radius + planet_radius < 50` → 角速度 0.025–0.05 rad/turn（ゲームごとにランダム固定）
- **ホーム惑星は 10 艦でスタート**

### 艦隊

- 属性: `[id, owner, x, y, angle, from_planet_id, ships]`
- 速度: `1.0 + 5.0 * (log(ships)/log(1000))^1.5`。1 艦=1.0、約500艦=5.0、1000艦超=6.0（上限）
- 直線運動のみ、**連続衝突判定**: old→new の線分全体で太陽・惑星との干渉を検査
- 艦隊の ships は移動中一定、戦闘時のみ変化

### コメット

- step 50, 150, 250, 350, 450 に 4 個 1 組 spawn（対称）
- 半径 1.0、production 1、開始艦は 1-99 から min(4 rolls) の歪み
- 速度 4.0 units/turn（elliptical）、通常惑星と同じルールで捕獲可
- `comets` 観測に `paths` / `path_index` があり **未来位置完全予測可能**
- 盤面外へ出ると所有中の艦ごと消滅、出る瞬間の tick に発射は不可

### ターン順（重要 — 戦略に直結）

1. コメット消滅
2. コメット spawn
3. **艦隊発射**（プレイヤーアクション）
4. **生産**（所有惑星で production 加算、コメット含む）
5. 艦隊移動（連続衝突判定、着地は後段でまとめて戦闘）
6. 惑星回転 & コメット移動（**掃き取り戦闘**: 動いた惑星に捕捉された艦隊も巻き込む）
7. 戦闘解決

### 戦闘ロジック

1. 到着艦を所有者別に集計
2. **最大派閥 vs 第2派閥**: 差分のみ残存、同数なら **全滅（tie → 0）**
3. 残存艦 vs 守備隊:
   - 味方艦なら守備隊に加算
   - 敵艦なら: 残存 > 守備 → 占領、守備が剰余となる

### 勝利・終了

- 500 turn 到達 or 生存者 ≤ 1
- 最終スコア = 所有惑星の ships 合計 + 艦隊中 ships 合計 の **多い順に勝利**

## 関連研究・外部参考

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 5 | OrbitZoo: Multi-Agent RL Environment for Orbital Dynamics | https://arxiv.org/html/2504.04160v1 | arXiv 2025 | 軌道力学を扱う Multi-Agent RL 環境。観測設計・報酬設計の参考 |
| 6 | SimonLucas/planet-wars-rts | https://github.com/SimonLucas/planet-wars-rts | GitHub | Planet Wars RTS の AI エージェント評価環境、メカニクス比較用 |
| 7 | Continuous Real-Time Strategy Game AI (survey) | https://ieeexplore.ieee.org/document/7860439/ | IEEE CIG | RTS 状態評価 CNN。観測圧縮の参考 |

## 戦略的含意（メモ）

- **対称性の悪用**: 相手の配置を自分の配置から推定可能（開幕は完全対称）
- **艦隊速度の非線形性**: 500艦で 5/turn、50艦で ~3/turn。**大艦隊一発派遣が速度で有利**。一方で小分けによる同着タイミング調整は減速トレードオフ
- **太陽を横切れない**: 対角への最短経路は太陽回り込みで距離 > 直線距離
- **掃き取り戦闘**: 動く惑星の軌道上に艦隊を置くと **動いた側の所有者と戦闘** になる。軌道惑星での戦術が独特
- **コメット**: 未来位置完全予測可能 + 低コストで占領可 + 短命。**tempo と資源のトレードオフ**
- **同数 tie 全滅ルール**: 読み合いで敵派遣艦数に +1 するだけで逆転可
