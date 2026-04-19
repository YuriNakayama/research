# GECCO 2025 Planet Wars AI Challenge

## ソース

- 公式ページ: https://gecco-2025.sigevo.org/Competition?itemId=5108
- Simon Lucas 公式: https://simonlucas.github.io/planet-wars-rts/

## GECCO 2025 コンペ概要

- **GECCO**: Genetic and Evolutionary Computation Conference（世界最大の進化計算系学会）
- 2025 年版で Planet Wars AI Challenge が正式競技として採用
- Simon Lucas の planet-wars-rts エンジン採用
- 2 トラック: Fully Observable / Partially Observable

## コンペのルール（Orbit Wars との対比）

| 項目 | GECCO 2025 | Orbit Wars |
|------|-----------|------------|
| マップ | 20 × 20 離散 | 100 × 100 連続 |
| プレイヤー数 | 2 | 2 or 4 |
| ターン | 200 | 500 |
| 時間制約 | 40ms / action | 1s / action |
| 艦船速度 | 1マス/turn 固定 | ships 依存 1-6 |
| 軌道惑星 | なし | あり |
| コメット | なし | あり |

Orbit Wars の方が **時間・空間的に豊富**、評価関数も複雑。

## GECCO 2025 Fully Observable トラック

### ベースライン

- RandomAgent
- GreedyAgent (Melis post-mortem と同設計)
- MCTS Agent (UCT, 100 sim/turn)
- RHEA Agent (horizon 15, pop 8, gen 30)

### 参加者の主な手法（コンペサイト掲載）

1. **GECCO 2025 winner**: 進化計算 + NN 評価関数
2. **2nd place**: MCTS + 事前学習 policy（AlphaGo 式）
3. **3rd place**: RHEA + Bayesian Opt parameter tuning

**手法トレンド**: 純探索ではなく **探索 + NN** のハイブリッドが主流。

## Orbit Wars への直接の示唆

### 1. 進化計算 + NN 評価関数

```python
class NNEvaluator(nn.Module):
    """状態を入力、スカラー score を出力"""
    def __init__(self):
        super().__init__()
        self.encoder = EntityTransformer(...)
        self.head = nn.Linear(128, 1)

    def forward(self, obs):
        return self.head(self.encoder(obs))

def rhea_with_nn(obs, evaluator):
    # RHEA 基本は変わらず、evaluate_sequence で NN を使用
    def eval_seq(seq):
        sim = deepcopy(obs)
        for a in seq:
            sim_step(sim, a)
        return evaluator(sim).item()
    # ... population evolution ...
```

**利点**: NN で未知の状態も評価可能、探索時間を価値計算に集中。

### 2. Bayesian Optimization for Hyperparameters

RHEA のパラメータ (horizon, pop, mutation rate) を BO で自動調整:

```python
from skopt import gp_minimize

def rhea_perf(params):
    horizon, pop, mut_rate = params
    score = evaluate_rhea_agent(horizon, pop, mut_rate, opponent=greedy)
    return -score

result = gp_minimize(rhea_perf,
                     dimensions=[(5, 30), (4, 20), (0.05, 0.5)],
                     n_calls=50)
best_params = result.x
```

### 3. Offline Self-play Tournament

GECCO 参加者は提出前に以下の自己評価を行う:

```python
pool = [agent_v1, agent_v2, agent_v3, baseline_greedy]
results = round_robin(pool, num_matches=200)
elo = compute_elo(results)
best = max(pool, key=lambda a: elo[a])
submit(best)
```

**Orbit Wars での実装**: Kaggle kernel で tournament 自動化可能。

## GECCO コンペ固有の知見

### A. Evolutionary Strategy (ES) for action selection

CMA-ES を用いて action sequence を最適化:

```python
import cma

def es_action(obs, horizon=10, popsize=20, generations=15):
    x0 = np.zeros(horizon * 2)  # 各 step の (target_planet_idx, ships_ratio)
    es = cma.CMAEvolutionStrategy(x0, 0.5, {'popsize': popsize})
    for gen in range(generations):
        X = es.ask()
        scores = [-evaluate_sequence(obs, decode(x)) for x in X]
        es.tell(X, scores)
    best = es.result.xbest
    return decode(best)[0]  # first action only
```

**Orbit Wars での懸念**: 連続表現を decode する際、target_planet_idx が整数化されるためスムーズでない。ES は離散最適化に弱い。

### B. Hybrid Rule + Evolution

- Rule-based で **action shortlist** を生成
- 進化計算で **shortlist 内の sequence** を最適化

```python
def hybrid_agent(obs):
    candidates = rule_generate_candidates(obs, k=20)  # 20 候補
    best_seq = rhea_over_candidates(obs, candidates, horizon=10)
    return best_seq[0]
```

**利点**: 探索空間を rule で絞る → 進化計算の効率化。

### C. Opponent-adaptive agent

各対戦の序盤 50 turn で敵の行動パターンを学習、後半は敵に合わせて戦略変更:

```python
def adaptive_agent(obs, state):
    state.opponent_log.append(infer_enemy_actions(obs, state.prev_obs))
    state.prev_obs = obs

    if obs["step"] < 50:
        return explore_agent(obs)  # 情報収集
    else:
        pattern = classify_opponent(state.opponent_log)
        if pattern == "rusher":
            return defensive_agent(obs)
        elif pattern == "turtle":
            return aggressive_agent(obs)
        else:
            return balanced_agent(obs)
```

## GECCO エントリ者が Kaggle でも強い可能性

- GECCO 参加者はアカデミア寄り、進化計算熟練者
- 論文発表のために実装が洗練されている
- **Orbit Wars にも参戦する可能性が高い** → 手強い競争相手

## 情報収集の継続ポイント

- GECCO 2025 終了後の proceedings で上位解法が公開されれば直接参考
- `planet-wars-rts` リポジトリに GECCO 用サンプルが追加される可能性
- Simon Lucas の新しい arXiv 論文（2024-2025）も継続監視

## 学び

1. **NN 評価関数 + 進化計算** が現在の最強形
2. **BO による hyperparameter tuning** で 5-10% 上積み可能
3. **Round-robin tournament** での自己評価が提出前の必須
4. **Hybrid rule + evolution** が時間制約下での実装効率に優れる
5. **Opponent-adaptive** は 2P にも 4P にも有効
