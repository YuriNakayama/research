# Orbit Wars 向け報酬設計と Curriculum

## Orbit Wars の Reward 構造

### 公式 Reward

`orbit_wars.py::interpreter()` L693-721 より:

- **Win**: +1
- **Lose**: -1
- **Draw**: 0

ゲーム終了時に決定、中間 reward なし (sparse)。

### 勝敗判定（推定、episodeSteps 到達時）

- 各プレイヤーの **惑星総 ships + 艦隊 ships の合計**
- 最大が勝ち、tie は draw

## Dense Reward Shaping

### Option A: 基本形（Halite IV / Kore 2022 ベース）

```python
def dense_reward(prev, curr, me, done, winner):
    r = 0.0
    # 1. 惑星占領デルタ
    prev_planets = count_planets(prev, me)
    curr_planets = count_planets(curr, me)
    r += 0.02 * (curr_planets - prev_planets)

    # 2. production 差分
    prev_prod = total_production(prev, me)
    curr_prod = total_production(curr, me)
    r += 0.01 * (curr_prod - prev_prod)

    # 3. ship advantage delta
    prev_adv = ship_advantage(prev, me)
    curr_adv = ship_advantage(curr, me)
    r += 0.001 * (curr_adv - prev_adv)

    # 4. Comet 占領ボーナス
    prev_comets = count_comets_held(prev, me)
    curr_comets = count_comets_held(curr, me)
    r += 0.05 * (curr_comets - prev_comets)

    # 5. Terminal
    if done:
        r += 1.0 if winner == me else (-1.0 if winner is not None else 0.0)

    return r
```

### Option B: 希少化 + 終端重視

Dense reward が強すぎると **局所最適** に陥る。Terminal reward を大きくして長期思考を促す:

```python
dense_weights = {
    "planet_delta": 0.01,     # 0.02 → 0.01
    "prod_delta": 0.005,      # 0.01 → 0.005
    "ship_delta": 0.0001,
    "comet_delta": 0.02,
}
terminal_weights = {
    "win": 5.0,               # 1.0 → 5.0
    "lose": -5.0,
}
```

Kore 2022 上位解法が採用、終盤逆転学習に有効。

### Option C: Potential-based Shaping

理論的に安全な shaping（Ng et al. 1999）:

```python
def potential(obs, me):
    """状態価値の heuristic 近似"""
    return (
        0.3 * count_planets(obs, me) +
        2.0 * total_production(obs, me) +
        0.001 * total_ships(obs, me)
    )

def potential_shaped_reward(prev, curr, me, done, winner, gamma=0.99):
    base = 1.0 if (done and winner == me) else (-1.0 if done and winner != me else 0.0)
    return base + gamma * potential(curr, me) - potential(prev, me)
```

**利点**: 学習される policy は shaping なしと同じ最適解に収束することが保証される。

## Curriculum Design

### Stage 0: Random Opponent (1,000 games)

- 学習対象: 基本的な move 候補
- 期待勝率: 60-70%（スタート地点）
- 時間: 30 分

### Stage 1: Starter Agent (5,000 games)

- 学習対象: 中立占領の基本
- 期待勝率: 55-60% → 70-80% に改善
- 時間: 2 時間
- **自動 stage 移行**: 勝率 75% 到達で次へ

### Stage 2: Rule v1 (10,000 games)

- 学習対象: 軌道 intercept, +1 rule
- 期待勝率: 30-40% → 55-65%
- 時間: 5 時間

### Stage 3: Rule v2 (strong rule) (20,000 games)

- 学習対象: 戦略的切替、opponent modeling
- 期待勝率: 20-30% → 50%+
- 時間: 10 時間

### Stage 4: Self-play (main) (100,000 games)

- 学習対象: RPS 戦略、meta-game
- 期待勝率: 50%（nash）
- 時間: 2-3 日（16 env parallel）

### Stage 5: PFSP Historical (100,000 games)

- 学習対象: 過去世代への一貫性
- 時間: 2-3 日

### Stage 6: Fine-tune on 4P (50,000 games)

- 2P 学習を 4P にtransfer
- 学習対象: 混戦戦略
- 時間: 1-2 日

### Total: 〜 2 週間 (GPU 1 枚 + 16 CPU)

## Auto Stage Transition

```python
class CurriculumScheduler:
    def __init__(self):
        self.stage = 0
        self.win_rate_threshold = 0.75
        self.eval_window = 200

    def check(self, recent_results):
        if len(recent_results) < self.eval_window:
            return self.stage
        win_rate = sum(recent_results[-self.eval_window:]) / self.eval_window
        if win_rate > self.win_rate_threshold:
            self.stage += 1
        return self.stage
```

**メリット**: マニュアル介入不要、学習が進まなくなったら上げない。

## Intrinsic Motivation (RND)

```python
class RND(nn.Module):
    def __init__(self, d_obs, d_out=64):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(d_obs, 128), nn.ReLU(), nn.Linear(128, d_out)
        )

predictor = RND(d_obs=256)
target = RND(d_obs=256)
for p in target.parameters():
    p.requires_grad = False

def intrinsic_reward(obs):
    with torch.no_grad():
        target_out = target(obs)
    pred = predictor(obs)
    return F.mse_loss(pred, target_out, reduction="none").mean(-1).detach()

# 訓練時に predictor のみ update
```

intrinsic reward の weight は 0.01-0.1 程度。

## Adversarial Curriculum

一般的な curriculum の逆:

```
初期: 強い opponent に負け続ける
→ policy は負けから学ぶ
→ 徐々に強くなり対等に戦える
```

PBT (Population-Based Training) や evolution で実現可能。Kaggle 規模では複雑すぎる。

## Multi-task Learning

2P と 4P を同時学習:

```python
def mixed_episode():
    mode = random.choice(["2p", "4p"])
    if mode == "2p":
        env = OrbitWarsEnv(n_players=2)
    else:
        env = OrbitWarsEnv(n_players=4)
    # ... rollout ...
```

**利点**: 両 mode に対応する policy を同時学習
**欠点**: 収束が遅くなる、学習ダイナミクス不安定

## Reward Normalization

Advantage や reward を running std で正規化:

```python
class RunningMeanStd:
    def __init__(self):
        self.mean = 0.0
        self.std = 1.0
        self.count = 0
        self.m2 = 0.0

    def update(self, x):
        self.count += 1
        delta = x - self.mean
        self.mean += delta / self.count
        self.m2 += delta * (x - self.mean)
        if self.count > 1:
            self.std = math.sqrt(self.m2 / (self.count - 1))

    def normalize(self, x):
        return (x - self.mean) / (self.std + 1e-8)
```

## Exploration Strategies

### 1. Entropy Regularization

```python
loss = policy_loss + 0.01 * (-entropy)
```

Entropy coefficient を 0.01 → 0.001 に decay、序盤探索 → 後半収束。

### 2. Temperature Sampling

```python
def sample_action(logits, temperature=1.0):
    scaled = logits / temperature
    probs = F.softmax(scaled, dim=-1)
    return torch.distributions.Categorical(probs).sample()
```

Evaluation 時 temperature = 0.1（greedy 寄り）、学習時 = 1.0。

### 3. Parameter Noise

NN 重みにノイズを加えてエクスプロレーション:

```python
for p in policy.parameters():
    p.data += torch.randn_like(p) * 0.01
```

Discrete action space では entropy より効果薄い。

## 学び

1. **Potential-based shaping** で安全に dense reward を付与
2. **Stage-based curriculum** で段階的難易度、auto transition
3. **RND intrinsic motivation** で探索促進
4. **Running std normalize** で learning stability
5. **2P → 4P transfer learning** は Orbit Wars の 4P 対応に必須
6. **GPU 1 枚 + 16 CPU** で 2 週間、$20-30 で上位圏
