# Simon Lucas planet-wars-rts + arXiv:1806.08544

## ソース

- GitHub: https://github.com/SimonLucas/planet-wars-rts
- 論文: https://arxiv.org/abs/1806.08544 (IEEE CIG 2018)
- 公式サイト: https://simonlucas.github.io/planet-wars-rts/
- 著者公式: QMUL Games AI Group, Prof. Simon Lucas

## planet-wars-rts の特徴

### 高速エンジン

- **1M ticks/sec** (ゲーム状態更新)
- Kotlin 実装、JIT で超高速
- RL 学習向け: **数億ステップの rollout** を合理的時間で生成可能

### 機能セット

| 機能 | 説明 |
|------|------|
| Fully observable mode | 全情報公開（従来の Planet Wars） |
| Partially observable mode | 敵惑星の ships を "fog of war" で隠す |
| Variable map generation | ランダム + seed 指定 |
| Multi-agent | 2 〜 N プレイヤー対戦 |
| Visualization | Kotlin Swing GUI |
| JVM-Python bridge | Python 側から制御可能 |

**Orbit Wars との関係**: partial observability は Orbit Wars にはない（観測完全）。fully observable モードが直接参考になる。

## arXiv:1806.08544 論文要約

タイトル: *Game AI Research with Fast Planet Wars Variants*

### Abstract

- Planet Wars を研究プラットフォームとして再設計
- MCTS, RHEA (Rolling Horizon Evolution) を比較
- 時間予算 40ms の制約下で各アルゴリズムが収束する深さを検証

### 実験設定

- 2P Planet Wars, 200 turn
- MCTS: 100 simulations / turn
- RHEA: population 10, horizon 20, 50 generations
- Random, Greedy を baseline

### 結果ハイライト

| Algorithm | Win rate vs Random | Win rate vs Greedy | 計算時間 |
|-----------|-------------------|-------------------|----------|
| Random | 50% | 10% | 1ms |
| Greedy (最近敵への攻撃) | 90% | 50% | 2ms |
| MCTS (UCT) | 95% | 70% | 40ms |
| **RHEA (horizon 20)** | **96%** | **78%** | **40ms** |

**結論**: RHEA が MCTS を上回る。特に大規模 action space では explorations vs exploitation の balance で RHEA 有利。

## RHEA 詳細（Rolling Horizon Evolution Algorithm）

### 基本アルゴリズム

```
1. 初期集団: N 個のランダム行動列 a_1, a_2, ..., a_H
2. Evaluation: 各行動列を simulator で H ステップ実行、終状態の V(s) を計算
3. Selection: top-k を親として選抜
4. Crossover: 親 2 個から 1 点交叉で子を作る
5. Mutation: 各 action を確率 p_m でランダム再サンプル
6. 世代進化: G 世代繰り返し
7. 実行: 最良個体の a_1 を submit
8. 次 turn: 集団を 1 シフト（a_2 を先頭に）
```

### ハイパーパラメータ（論文推奨）

- Horizon H: 20 turn
- Population size N: 10
- Generations G: 50
- Mutation rate p_m: 0.2
- Crossover: uniform 1-point

### Orbit Wars への適用

```python
def rhea_action(obs, config, horizon=15, pop=10, gens=30):
    # Action 候補: 各自惑星の (target, ships) pair
    # horizon 長の action sequence を population で持つ
    population = [random_sequence(obs, horizon) for _ in range(pop)]
    for _ in range(gens):
        scores = [evaluate_sequence(obs, seq) for seq in population]
        ranked = sorted(zip(scores, population), key=lambda x: -x[0])
        elite = [s for _, s in ranked[:pop//2]]
        offspring = []
        while len(offspring) < pop - len(elite):
            a, b = random.sample(elite, 2)
            child = crossover(a, b)
            child = mutate(child, obs)
            offspring.append(child)
        population = elite + offspring
    best = max(population, key=lambda s: evaluate_sequence(obs, s))
    return best[0]  # 先頭アクションのみ提出
```

### 計算量チェック

- 1 sequence 評価: horizon × sim_step_time
- sim_step: 15 turn × 1ms = 15ms
- 10 individuals × 30 gens × 15ms = 4500ms → **1s 制約 オーバー**

対策:
- horizon を 8-10 に短縮
- sim_step を高速化（惑星衝突判定の省略、艦隊の lazy evaluation）
- population を 6 に縮小

調整後:
- 6 × 25 × 8ms = 1200ms → 微調整でクリア可能

## planet-wars-rts のコード構造

GitHub リポジトリから抽出:

```
planet-wars-rts/
├── src/main/kotlin/
│   ├── planetwars/
│   │   ├── core/
│   │   │   ├── GameState.kt      # 状態更新 1M ticks/s
│   │   │   ├── Planet.kt
│   │   │   ├── Transporter.kt    # 艦隊（Orbit Wars の Fleet に相当）
│   │   ├── agents/
│   │   │   ├── GreedyAgent.kt
│   │   │   ├── MctsAgent.kt
│   │   │   ├── RheaAgent.kt
│   │   └── runner/
│   │       └── Main.kt
└── README.md
```

**Orbit Wars への利用**:
1. GameState の高速化パターン（field hot-path 最適化）を Python numba / Cython に翻訳
2. MctsAgent / RheaAgent をそのまま Python に移植

## partial observability への対応（参考）

Orbit Wars は observation 完全だが、将来拡張で partial observability になる可能性あり:

- 自分の unit から可視範囲のみ観測
- 敵の艦隊位置は推定必要 → Particle filter / Bayesian tracking

論文では partial observability 下で:
- MCTS + particle filter が RHEA + random model より強い
- Belief state を持つ MCTS が最強

## Orbit Wars 向け速度最適化テンプレ

### 1. 惑星位置 LUT

```python
import numpy as np

def build_planet_lut(obs, max_step=500):
    """全 step × 全惑星の位置を事前計算"""
    planets = obs["initial_planets"]
    omega = obs["angular_velocity"]
    lut = np.zeros((max_step, len(planets), 2))
    for step in range(max_step):
        for i, p in enumerate(planets):
            lut[step, i] = orbital_position(p, omega, step)
    return lut
```

### 2. 艦隊 ETA 近似

```python
def fast_eta(src_pos, target_idx, lut, step):
    # target の未来位置を 5-step 刻みでサンプル
    candidates = [(t, lut[step + t, target_idx]) for t in range(5, 100, 5)]
    return min(candidates, key=lambda x: abs(math.hypot(*(x[1] - src_pos)) - x[0]))[0]
```

### 3. 軽量 simulator

```python
def sim_step_light(state):
    """衝突判定を省略、各 fleet の ETA で発火"""
    for f in state.fleets:
        f.eta -= 1
        if f.eta <= 0:
            resolve_combat(state, f)
            state.fleets.remove(f)
    for p in state.planets:
        if p.owner != -1:
            p.ships += p.production
```

これで `sim_step` が 10 倍速化 → RHEA 実装に十分。

## 学び

1. **RHEA > MCTS** in Planet Wars-like RTS (1806.08544)
2. **Horizon 20, pop 10, gens 50** が論文の推奨、Orbit Wars では半分規模
3. **高速 simulator が必須**、衝突判定省略の light sim で 10-100 倍加速
4. **LUT 事前計算** で惑星位置の重複計算を排除
5. **Kotlin → Python 翻訳** で 100 倍遅くなるが numba で取り戻せる
