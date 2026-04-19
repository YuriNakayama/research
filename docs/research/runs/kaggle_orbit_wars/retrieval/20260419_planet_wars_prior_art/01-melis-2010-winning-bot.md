# Melis 2010 Planet Wars 優勝 bot 詳細

## ソース

- Post-mortem ブログ: http://quotenil.com/Planet-Wars-Post-Mortem.html
- GitHub (Lisp): https://github.com/melisgl/planet-wars
- Franz webinar PDF: https://franz.com/services/conferences_seminars/webinar_1-20-11.gm.pdf
- ニュース: https://www.dataversity.net/lisp-bot-wins-google-ai-challenge-will-lisp-win-in-the-semantic-web-too/

## 2010 Planet Wars ルール（参考）

- 2 プレイヤー
- 整数座標マップ（連続ではない）
- 艦の速度は **1 マス/turn 固定**（Orbit Wars は ships 依存）
- 200 turn 制限
- 1 action につき 1 秒制約
- 勝利: 艦総数で上回る or 相手の惑星ゼロ化

## Melis bot の全体構造

Post-mortem によると:

```
[observe] → [plan space] → [evaluate] → [execute]
    ↑                                      |
    └──────────────────────────────────────┘
```

ポイントは **plan space** の設計。単一 action ではなく「惑星間の ship 流れの計画」を考える。

### プラン空間の定義

各プラン = `{(source_planet, target_planet, ships, launch_turn), ...}` のセット。Melis は毎ターン:

1. **起点候補**: すべての自惑星
2. **目標候補**: 中立 + 敵の全惑星
3. **艦数候補**: 50%, 25%, 75%, 100%, optimal_required
4. **発射時刻**: 0 〜 N turn 遅延（同着用）

の直積から **top-K プラン** を evaluator で選抜。

## 評価関数（heuristic V(s)）

Melis の評価関数は 1000+ 行の Lisp だが、要素を分解すると:

```
V(s) = w1·ship_advantage(s) +
       w2·production_advantage(s) +
       w3·territory_value(s) +
       w4·time_discount(s) -
       w5·enemy_threat_value(s)
```

- **ship_advantage**: 自艦総数 - 敵艦総数
- **production_advantage**: 自 production - 敵 production
- **territory_value**: 各自惑星について `production × remaining_turns - cost_to_defend`
- **time_discount**: 200 turn 制限に近づくほど "確実な利得" を優先
- **enemy_threat_value**: 敵艦隊の ETA を見た既知 incoming 攻撃リスク

**Orbit Wars 適用**: 同じ式で production を 1-5 に置き換え、comet の短寿命を time_discount に織り込む。

## Ship Redistribution

後方惑星に artillery を溜めない。戦線（敵との境界）に常に艦を集中させる。

```
1. 各自惑星について frontline_distance を計算
2. frontline に艦が不足している惑星を検出
3. 後方 (frontline_distance 大) の自惑星から artillery 移動を計画
```

**Orbit Wars 適用**: 軌道惑星があるため frontline が動的。各 step で `nearest_enemy_distance(planet, step)` を再計算、閾値以上なら後方判定。

## Sniping 対策

相手が中立惑星に艦を送った後、自分がそれを上回る艦を送れば、相手の投資をゼロにできる。Melis はこの可能性を**敵の未来行動として先読み**:

```
if 自分が中立 P に artillery S を送ろうとしている:
    if 相手の隣接惑星から P への最短到達艦数 S' > S:
        自分のプランはキャンセル、代わりに別の target へ
```

**Orbit Wars 適用**: コメット取り合いに直接該当。4P ゲームでは 3 者が同時に狙う場合もあり、**自分が 2 位派遣になる確率** を評価する必要。

## Trade-Down in Advantage

優勢時（ship_advantage > threshold）には「自分も減るが相手も減る」行動を好む:

```
if winning:
    利得 = (自艦減少 × -1) + (敵艦減少 × +2)
else:
    利得 = (自艦減少 × -2) + (敵艦減少 × +1)
```

Orbit Wars では tie 全滅で両者ゼロになる場面 = 優勢時には tie 誘発が有効。

## Time Budget 管理

2010 では 1 秒制約。Melis は iterative deepening で:

1. 深さ 1 の探索を 100ms で完了
2. 残り 900ms で深さを徐々に増やす
3. 900ms 経過時点の最善解を返す（anytime 性）

**Orbit Wars 適用**:
- step=0 は 30s 初期化時間を活用 (配置最適化、LUT 構築)
- 以降 1s/step で iterative rollout
- 急な高負荷（多惑星戦況）に備えて overage time を ~10s 温存

## 実装のヒント

### ライブラリ化すべき関数

```python
def expand_plans(obs):
    """全 plan 候補を enumerate"""
    plans = []
    for s in my_planets:
        for t in all_planets:
            if s == t: continue
            for pct in [0.25, 0.5, 0.75, 1.0]:
                ships = int(s.ships * pct)
                if ships < 20: continue
                for delay in [0, 1, 2, 3]:
                    plans.append(Plan(s, t, ships, delay))
    return plans

def evaluate_plan(plan, obs, depth=3):
    """軽量 simulator で N ターン後の V(s) を計算"""
    sim_obs = deepcopy(obs)
    apply_plan(sim_obs, plan)
    for _ in range(depth):
        sim_step(sim_obs)
    return V(sim_obs)

def pick_top_k(plans, obs, k=5):
    return sorted(plans, key=lambda p: evaluate_plan(p, obs), reverse=True)[:k]
```

### 計算量コントロール

- 自惑星 10, 目標 20, pct 4, delay 4 → 10 × 20 × 4 × 4 = 3200 plans
- 各 plan evaluate 1ms → 3.2 秒（**オーバー**）
- 対策: pct は 2 段階、delay は 2 段階、depth を 2 turn で 10 × 20 × 2 × 2 = 800 plans, 0.8s

### 並列 plan 評価

プランは独立評価可能 → 並列化可能。Python `multiprocessing` or `joblib.Parallel`。

## Lisp 実装固有の側面

Melis が Lisp を選んだ理由:

1. **REPL 駆動の対局テスト**
2. **マクロによる eval 関数 DSL**
3. **型宣言による Python 並みの速度**

Kaggle 提出は Python 前提、Lisp は使えない。ただし **eval DSL** の考え方は転用可能:

```python
# 重み w1..w5 をハイパーパラメータ化、CMA-ES や Bayesian Opt で調整
WEIGHTS = {
    "ship_advantage": 1.0,
    "production_advantage": 5.0,
    "territory_value": 0.5,
    "time_discount": 1.0,
    "enemy_threat": -2.0,
}

def V(obs, weights=WEIGHTS):
    return sum(weights[k] * feature(obs, k) for k in weights)
```

## Melis の強さの本質

Post-mortem の締めくくり:

> The key insight was thinking in plans, not moves.

**単一の move ではなく plan（未来の行動列）を評価する** のが Melis の核心。Orbit Wars では:

- 発射角と ships は決定すれば変更不可
- 1 turn 後の結果はほぼ deterministic（コメット以外）
- **未来 10-20 turn のシミュレーションが極めて安定**

→ Orbit Wars は Melis 的アプローチに **最適な環境**。

## 学び

1. **Plan-space reasoning** が勝敗を決める
2. **評価関数の linearly weighted features** で 2010 年当時は十分
3. **iterative deepening** で 1s 制約下の anytime 性を確保
4. **sniping awareness** は 4P 混戦で最重要
5. **trade-down in advantage** で tie 全滅ルールを戦略的に活用
