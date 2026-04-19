# Rolling Horizon Evolution (RHEA) for RTS

## ソース

- Rolling horizon evolution vs tree search (GECCO 2013): https://dl.acm.org/doi/10.1145/2463372.2463413
- Rolling Horizon Coevolutionary Planning (2P): https://ar5iv.labs.arxiv.org/html/1607.01730
- Enhancing RHEA with Policy/Value Networks: https://ieeexplore.ieee.org/document/8848041/
- RHEA + Opponent Model: https://www.researchgate.net/publication/344759679
- Continual Online Evolutionary Planning: https://sebastianrisi.com/wp-content/uploads/justesen_gecco17.pdf
- GAIG project: https://gaigresearch.github.io/projects/rhea

## RHEA とは

ゲーム状態 s から **horizon H ステップ先の行動列** `(a_1, ..., a_H)` を進化計算で最適化。1 ターンごとに最初の action a_1 を実行し、残りをスライドして次ターンの初期集団とする。

## MCTS との違い

| 側面 | MCTS | RHEA |
|------|------|------|
| 探索方式 | ツリー展開 | 進化計算（個体ベース） |
| 前状態の再利用 | ツリー部分再利用 | 集団を 1 シフト |
| 行動の相互依存 | 明示 | 個体全体で連続評価 |
| 時間予算の使い方 | simulation 単位 | 世代単位 |
| 実装複雑度 | 中 | 低 |
| 連続 action | 弱い | 自然 |

**特に RTS** で RHEA が有効なのは、**複数ユニットの連続行動** を個体として丸ごと評価できるため。

## 基本アルゴリズム

```python
def rhea(obs, horizon=10, pop_size=8, generations=20, mutation_rate=0.2):
    # 初期集団
    population = [random_sequence(obs, horizon) for _ in range(pop_size)]

    for gen in range(generations):
        scores = [evaluate(obs, seq) for seq in population]
        ranked = sorted(zip(scores, population), reverse=True)
        elite = [s for _, s in ranked[:pop_size // 2]]

        offspring = []
        while len(offspring) < pop_size - len(elite):
            p1, p2 = random.sample(elite, 2)
            child = crossover(p1, p2)
            child = mutate(child, mutation_rate)
            offspring.append(child)

        population = elite + offspring

    best = max(population, key=lambda s: evaluate(obs, s))
    return best[0]  # 先頭アクション
```

## Orbit Wars 向け設計

### 1. Genotype の定義

```python
@dataclass
class ActionGene:
    planet_id: int       # 発射元
    target_id: int       # 着弾先
    ships_frac: float    # 艦数割合
    # Angle は intercept solver で自動計算

Sequence = List[ActionGene]  # 長さ = horizon
```

### 2. Random Initialization

```python
def random_action(obs, my_id):
    my_planets = [p for p in obs["planets"] if p.owner == my_id and p.ships >= 20]
    if not my_planets: return None
    p = random.choice(my_planets)
    target = random.choice([t for t in obs["planets"] if t.id != p.id])
    frac = random.choice([0.3, 0.5, 0.7, 1.0])
    return ActionGene(p.id, target.id, frac)

def random_sequence(obs, horizon):
    return [random_action(obs, obs["player"]) for _ in range(horizon)]
```

### 3. Evaluation

```python
def evaluate(obs, sequence, horizon):
    sim = clone(obs)
    for gene in sequence:
        if gene is None:
            sim_step(sim, [])
        else:
            a = decode_gene(gene, sim)
            sim_step(sim, [a])
    return V(sim, obs["player"])
```

### 4. Crossover

```python
def crossover(p1, p2):
    cut = random.randint(1, len(p1) - 1)
    return p1[:cut] + p2[cut:]
```

### 5. Mutation

```python
def mutate(seq, rate=0.2, obs=None):
    for i in range(len(seq)):
        if random.random() < rate:
            seq[i] = random_action(obs, obs["player"])
    return seq
```

## 時間予算チェック

- horizon = 10, pop = 8, generations = 15
- 1 evaluate = 10 × sim_step = 10 × 2ms = 20ms
- Total: 8 × 15 × 20ms = 2400ms → **オーバー**

対策:
- horizon = 6, pop = 6, gens = 12 → 6 × 12 × 12ms = 864ms ≈ 0.9s
- sim_step の高速化（次項）

## 高速 Simulator の実装

通常の `interpreter()` は全コリジョン判定を含み遅い。RHEA 用の **light sim** を自前で書く:

```python
def sim_step_light(state):
    """Light simulator - 戦闘のみ正確、spawn 省略"""
    # 1. 艦隊移動
    new_fleets = []
    combat_queue = defaultdict(list)
    for f in state.fleets:
        speed = fleet_speed(f.ships)
        new_x = f.x + math.cos(f.angle) * speed
        new_y = f.y + math.sin(f.angle) * speed

        # 惑星到達判定（target_id で高速化）
        target = state.get_planet(f.target_id)
        if target:
            d = math.hypot(new_x - target.x, new_y - target.y)
            if d < target.radius:
                combat_queue[target.id].append(f)
                continue
        f.x, f.y = new_x, new_y
        if 0 <= f.x <= 100 and 0 <= f.y <= 100:
            new_fleets.append(f)
    state.fleets = new_fleets

    # 2. 戦闘解決
    for pid, fleets in combat_queue.items():
        resolve_combat(state, pid, fleets)

    # 3. Production
    for p in state.planets:
        if p.owner != -1:
            p.ships += p.production

    # 4. 軌道位置更新（LUT から引く）
    state.step += 1
    for p in state.planets:
        if p.is_orbital:
            p.x, p.y = state.lut[state.step, p.id]

    return state
```

**Sun 衝突判定は省略**（稀発生、誤差許容）。Comet spawn も light sim では省略（横成り事象）。

## Coevolutionary Extension (2P)

敵の反応も同時進化:

```python
def coevo_rhea(obs, horizon=8, pop=6, gens=10):
    my_pop = [random_seq(obs, horizon) for _ in range(pop)]
    enemy_pop = [random_seq_enemy(obs, horizon) for _ in range(pop)]

    for gen in range(gens):
        # Evaluate: all pairs
        scores = {}
        for me_idx, me_seq in enumerate(my_pop):
            for en_idx, en_seq in enumerate(enemy_pop):
                r = simulate_2p(obs, me_seq, en_seq, horizon)
                scores.setdefault(me_idx, []).append(r)
                scores.setdefault(('enemy', en_idx), []).append(-r)

        # Select + breed
        my_pop = evolve(my_pop, [mean(scores[i]) for i in range(pop)])
        enemy_pop = evolve(enemy_pop, [mean(scores[('enemy', i)]) for i in range(pop)])

    return my_pop[0][0]  # best first action
```

計算量: pop × pop 対戦なので 2 倍コスト。

## Enhanced RHEA with Policy/Value Network (IEEE 2019)

RHEA の中に NN を組み込む:

### 1. NN Policy for Seeding

初期集団を random でなく policy NN で生成:

```python
def policy_seed(obs, horizon):
    seq = []
    sim = clone(obs)
    for _ in range(horizon):
        logits = policy_net(to_tensor(sim))
        a = sample(logits)
        seq.append(a)
        sim_step(sim, [a])
    return seq

population = [policy_seed(obs, horizon) for _ in range(pop_size)]
```

### 2. NN Value for Evaluation

ゲーム結末の代わりに中間状態の value を評価:

```python
def evaluate(obs, seq, horizon):
    sim = clone(obs)
    for a in seq:
        sim_step(sim, [a])
    return value_net(to_tensor(sim)).item()
```

**利点**: 完全 rollout 不要、速い。

### 3. NN-Guided Mutation

```python
def guided_mutate(seq, obs, rate=0.2):
    for i in range(len(seq)):
        if random.random() < rate:
            logits = policy_net(state_at_step_i)
            seq[i] = sample(logits)  # NN から sample
    return seq
```

## Continual Online Evolutionary Planning (Justesen 2017)

- 集団を **turn 間で永続化**
- 1 turn ごとに全集団を 1 step シフト + 末尾 random
- Generations は turn 間で累積

```python
class ContinualRHEA:
    def __init__(self, pop_size=8, horizon=10):
        self.population = None
        self.horizon = horizon

    def step(self, obs, time_budget=0.8):
        if self.population is None:
            self.population = [random_seq(obs, self.horizon) for _ in range(pop_size)]
        else:
            # Shift + append random
            self.population = [seq[1:] + [random_action(obs)] for seq in self.population]

        start = time.time()
        while time.time() - start < time_budget:
            # One generation
            scores = [evaluate(obs, seq) for seq in self.population]
            ranked = sorted(zip(scores, self.population), reverse=True)
            elite = [s for _, s in ranked[:pop_size // 2]]
            offspring = [mutate(crossover(*random.sample(elite, 2))) for _ in range(pop_size // 2)]
            self.population = elite + offspring

        best = max(self.population, key=lambda s: evaluate(obs, s))
        return best[0]
```

**利点**: turn 間で知識を保持、初期集団が良質。

## Orbit Wars 推奨実装

### フェーズ 1: Basic RHEA

```python
def rhea_agent(obs, config):
    return rhea(obs,
                horizon=6,
                pop_size=6,
                generations=12,
                mutation_rate=0.2)
```

### フェーズ 2: NN-Enhanced RHEA

```python
def enhanced_rhea(obs, policy_net, value_net):
    return rhea_nn(obs,
                    horizon=10,
                    pop_size=6,
                    generations=15,
                    policy_seeder=policy_net,
                    evaluator=value_net)
```

### フェーズ 3: Continual RHEA

```python
continual = ContinualRHEA(pop_size=8, horizon=12)
def agent(obs, config):
    return continual.step(obs, time_budget=0.8)
```

## 学び

1. **RHEA は 1s 制約下で MCTS を上回る**（1806.08544）
2. **高速 light simulator** が実用の鍵
3. **Horizon 6-10, Pop 6-8, Gens 12-15** が Orbit Wars での現実解
4. **NN-Enhanced RHEA** で学習 policy と統合可能
5. **Continual RHEA** で turn 間知識保持、収束高速化
