# NaïveMCTS と Combinatorial Bandit

## ソース

- Combinatorial Multi-armed Bandits for RTS (JAIR): https://arxiv.org/abs/1710.04805
- AAAI version: https://ojs.aaai.org/index.php/AIIDE/article/download/12681/12529/16198
- Parametric Action Pre-Selection: https://ceur-ws.org/Vol-2719/paper11.pdf
- MCTS Planning for continuous spaces: https://ceur-ws.org/Vol-3417/short6.pdf

## 通常 MCTS の限界（Orbit Wars の場合）

Orbit Wars の action space を概算:

- 自惑星 10 個
- 各惑星から **任意の角度 (連続)** × **任意の艦数**
- 1 turn に複数惑星から発射可能

離散化しても `10 × 36 (angle) × 5 (ships) = 1800` ≈ branching factor。

**UCT は branching factor 100+ で急速に non-informative になる**。

## NaïveMCTS の要点

### Combinatorial Action Space

Orbit Wars の action を **コンポーネント分解**:

- Component 1: 惑星 A1 から 36 角度 × 5 艦数 = 180 sub-actions
- Component 2: 惑星 A2 から 180 sub-actions
- ...
- 各 turn の action = 全 component の **直積**

### Naïve Assumption

各 component の最適 sub-action は **独立** と仮定:

```
Q(a_1, a_2, ..., a_n) ≈ Σ_i Q_i(a_i)
```

これは多くのゲームで近似的に正しい（特に RTS）。

### アルゴリズム

```
各 turn で:
  各 component i について、通常 UCB で最適 sub-action a_i* を選択:
    UCB_i(a) = Q_i(a) + c · sqrt(log(n) / n_i(a))
  
  最終 action = (a_1*, a_2*, ..., a_n*)
  
  1 simulation で全 component の Q 値を更新
```

### 論文実験結果（microRTS）

| Branching Factor | Standard UCT | NaïveMCTS |
|------------------|--------------|-----------|
| 10 | 85% | 80% |
| 100 | 60% | 75% |
| 1000 | 35% | 70% |
| 10000 | 15% | 65% |

**結論**: 巨大分岐では NaïveMCTS が UCT を大きく上回る。

## Orbit Wars への実装

### Component 定義

```python
def decompose_action_space(obs, my_id):
    """各自惑星を 1 component とする"""
    components = []
    for p in obs["planets"]:
        if p.owner == my_id and p.ships >= 20:
            sub_actions = []
            for target_p in obs["planets"]:
                if target_p.id == p.id: continue
                for ships_frac in [0.3, 0.5, 0.7, 1.0]:
                    sub_actions.append((target_p.id, ships_frac))
            sub_actions.append(None)  # no-op
            components.append((p.id, sub_actions))
    return components
```

### NaïveMCTS Core

```python
import math
import random
from collections import defaultdict

class NaïveMCTS:
    def __init__(self, components, c=1.4):
        self.components = components
        self.c = c
        self.Q = {i: defaultdict(float) for i in range(len(components))}
        self.N = {i: defaultdict(int) for i in range(len(components))}
        self.total_n = 0

    def select_action(self):
        action = []
        for i, (planet_id, sub_actions) in enumerate(self.components):
            # UCB for this component
            def ucb(a):
                n = self.N[i][a]
                if n == 0:
                    return float('inf')
                return self.Q[i][a] / n + self.c * math.sqrt(math.log(self.total_n) / n)
            best = max(sub_actions, key=ucb)
            action.append((planet_id, best))
        return action

    def update(self, action, reward):
        self.total_n += 1
        for i, (planet_id, sub) in enumerate(action):
            self.Q[i][sub[1] if sub else None] += reward
            self.N[i][sub[1] if sub else None] += 1

def run_naive_mcts(obs, simulations=200, horizon=10):
    my_id = obs["player"]
    components = decompose_action_space(obs, my_id)
    mcts = NaïveMCTS(components)
    for _ in range(simulations):
        action = mcts.select_action()
        reward = simulate(obs, action, horizon)
        mcts.update(action, reward)
    return mcts.select_action()  # final greedy
```

### 時間予算

- `simulations = 200`
- 各 simulation: action 選択 O(components) + rollout horizon 10
- simulator 1 step ≈ 1-5ms
- 1 simulation ≈ 50ms
- 200 simulations ≈ 10s → **オーバー**

対策:
- simulations を 30-50 に削減
- rollout horizon を 5 に削減
- 事前に action pruning で候補を絞る（次ファイル参照）

## MCTS Planning for Continuous Spaces (APW)

### Action Progressive Widening

連続 action space に対する拡張:

```
node.children = []
N_current = 0

def select_child(node):
    if len(node.children) < α * (node.N)^β:
        # 新しい child を生成（連続空間からサンプル）
        new_action = sample_new_action(node)
        new_child = Node(action=new_action)
        node.children.append(new_child)
        return new_child
    # 通常 UCB
    return max(node.children, key=ucb)
```

- `α, β` はハイパラ（推奨: α=1, β=0.5）
- Children 数が徐々に増える

**Orbit Wars での利用**: angle 連続化したい時は APW で動的に candidate angle を生成。ただし discrete 化で十分な精度が出ているので必要性は低い。

## Parametric Action Pre-Selection

- Rule ベースの quick heuristic で **top-K actions** を選出
- MCTS は K 個の中から選ぶ

```python
def preselect_actions(obs, K=10):
    candidates = enumerate_all_actions(obs)
    scored = [(quick_heuristic(a, obs), a) for a in candidates]
    return [a for _, a in sorted(scored, reverse=True)[:K]]
```

`quick_heuristic` は評価関数 V(next_state) の近似。

## Naïve UCT + Action Pruning

```python
def naive_mcts_with_pruning(obs, simulations=50, horizon=8):
    # 1. Pre-select top-K actions per component
    components = []
    my_id = obs["player"]
    for p in obs["planets"]:
        if p.owner == my_id and p.ships >= 20:
            candidates = []
            for target in obs["planets"]:
                if target.id == p.id: continue
                score = quick_score(p, target, obs)
                candidates.append((score, target.id))
            top_K = [t for _, t in sorted(candidates, reverse=True)[:5]]
            components.append((p.id, top_K + [None]))  # +no-op

    # 2. Run NaïveMCTS on reduced space
    mcts = NaïveMCTS(components)
    for _ in range(simulations):
        action = mcts.select_action()
        reward = simulate(obs, action, horizon=horizon)
        mcts.update(action, reward)
    return mcts.select_action()
```

計算量:
- 10 components × 5 candidates = 50 sub-actions
- Simulation 50 × horizon 8 × 2ms = 800ms ≈ 1s ギリギリ

## Orbit Wars 最終推奨

1. **Preselect top 3-5 targets per planet** (100ms)
2. **NaïveMCTS 30 simulations** with rollout horizon 8 (700ms)
3. Timeout safety: 800ms 到達で強制停止、current best 提出

## 学び

1. **標準 UCT は branching > 100 で力不足**
2. **NaïveMCTS** は component 独立仮定で巨大空間対応
3. **Parametric Pre-Selection** で候補を数十に絞るのが実用的
4. **APW** は連続空間向けだが Orbit Wars では discrete 化で代替可
5. **時間制約**: 30-50 simulations が 1s 制約下の現実解
