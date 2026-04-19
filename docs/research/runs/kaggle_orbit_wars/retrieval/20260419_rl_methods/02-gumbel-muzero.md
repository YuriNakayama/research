# Gumbel MuZero の Orbit Wars 適用

## ソース

- Multiagent Gumbel MuZero (AAAI 2024): https://ojs.aaai.org/index.php/AAAI/article/view/29121
- Policy Improvement by Planning with Gumbel (原論文): https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/gumbel-alphazero.pdf
- Gumbel MuZero for 2048 (IEEE 2023): https://ieeexplore.ieee.org/document/10056566/
- 解説 blog: https://medium.com/correll-lab/planning-with-gumbel-036018b180bf
- Empirical Analysis: https://link.springer.com/chapter/10.1007/978-981-97-1711-8_25

## MuZero の特徴

- **model-based RL**: 学習済みモデルで rollout、real env 少なくて済む
- AlphaZero と同じく MCTS + NN
- ただし **ゲームルールを知らない**、transition も NN で予測

3 つの NN head:
- Representation: observation → hidden state
- Dynamics: (hidden state, action) → next hidden state + reward
- Prediction: hidden state → (policy, value)

## Gumbel MuZero とは

標準 MuZero の MCTS は **UCB (Upper Confidence Bound)** で探索、action 数が多いと効率低下。

Gumbel MuZero は:
- **Gumbel top-k sampling**: 事前 policy から k 個サンプリング
- **Sequential halving**: 反復的に候補を半分ずつ絞る
- 少ない simulation 数 (例: 16, 32) で高精度な improvement

### Gumbel Top-K の数式

```
a_i = argmax_a (logits(a) + Gumbel(0, 1))  で 1 個サンプリング
top-K は同じ logits で K 回サンプリング（独立 Gumbel 乱数）
```

### Sequential Halving

```
Round 1: K 個候補、全てに n/log(K) simulation
Round 2: 上位 K/2 個候補、2n/log(K) simulation
...
Round log(K): 1 個候補（最終選択）
```

## Orbit Wars への適用

### Action Space の定式化

Orbit Wars の action は:
- 派遣元惑星 ID (可変、5-15 個)
- 発射角 (連続)
- 艦数 (1-1000)
- かつ複数 action 同時実行可能

**Combinatorial Action Space** → Gumbel MuZero の得意分野。

### 離散化戦略

```python
# 各 turn の action を以下の離散セットに制限
ACTIONS = []
for planet_idx in range(N_MAX_PLANETS):
    for target_idx in range(N_MAX_PLANETS):
        for ships_pct in [0.25, 0.5, 0.75, 1.0]:
            ACTIONS.append((planet_idx, target_idx, ships_pct))
ACTIONS.append(None)  # no-op
```

- planet × target × pct = 15 × 15 × 4 = 900 候補
- angle は target ベースで自動決定（intercept solver）

### Multi-action per turn

Orbit Wars は 1 turn に複数 action を提出可能。Gumbel MuZero 論文では:

- 全 action を**sequence**として扱う
- 1 turn を K 個の sub-step に分解
- 各 sub-step で 1 action 選択、sub-step K で特殊「commit」action

```python
def sample_turn_actions(obs, max_actions=5):
    actions = []
    for k in range(max_actions):
        a = gumbel_muzero_action(obs, actions)
        if a == "commit":
            break
        actions.append(a)
    return actions
```

### 実装パッケージ (LightZero)

LightZero (NeurIPS 2023) リポジトリに Gumbel MuZero 実装あり:

- https://github.com/opendilab/LightZero
- PyTorch ベース、Kaggle 環境に組み込み可能
- examples ディレクトリに Atari, Board Game のサンプル

**Orbit Wars への移植**: `kaggle_environments.orbit_wars` を Gym Env に wrap し、LightZero の train script で学習。

## MiniZero (参考実装)

https://github.com/rlglab/minizero

- 教育的な MuZero 実装
- Board game (Go, Gomoku, Othello) 中心
- Gumbel variant の実装あり

## 学習コスト見積もり

Gumbel MuZero for 2048 (IEEE 2023):
- 学習: GPU 1 枚で 24 時間
- 結果: 2048 到達率 95%+

Orbit Wars の複雑度は 2048 の 10-100 倍 → **GPU 1 枚で 2-4 週間**。

## 利点と制約

### 利点

1. **Sample efficiency**: 少ない real game で学習
2. **Model-based**: dynamics を学習、hypothetical rollout 可能
3. **Combinatorial action**: Gumbel top-k で scale

### 制約

1. **Dynamics model の精度が命**: Orbit Wars の物理 (軌道・sweep・tie 判定) を正確に予測必要
2. **MCTS 時間**: actTimeout 1s 内に 16-32 simulation、dynamics NN 推論が間に合うか要検証
3. **Kaggle 提出サイズ**: Dynamics + Prediction + Representation の 3 NN、weights が大きい

## Orbit Wars 固有の工夫

### 1. Dynamics Model の知識注入

Orbit Wars のルールは完全公開。dynamics を **ゼロから学習** する代わりに、ルール知識を embedding:

```python
class HybridDynamics(nn.Module):
    def __init__(self):
        super().__init__()
        self.nn_dynamics = StandardDynamicsNet()
        self.rule_update = RuleBasedUpdate()  # 軌道・戦闘など

    def forward(self, state, action):
        # ルールで確実に計算できる部分は rule、不確実部分は NN
        rule_state = self.rule_update(state, action)
        residual = self.nn_dynamics(state, action)
        return rule_state + residual
```

### 2. Reduced Search Depth

actTimeout 1s → MCTS simulation は限定的:

```
depth = 3 (turns), simulations = 32
dynamics 1 call ≈ 10ms → 32 × 3 = 96 calls → 960ms ≈ 1s
```

深さ 3 は浅いが、Gumbel の sequential halving で効率化。

### 3. Value-Only Fallback

actTimeout 超過しそうな時、MCTS 停止して value network の直接出力で action 選択:

```python
def act(obs, config):
    start = time.time()
    if time.time() - start > 0.8:
        # Fallback: policy head の argmax
        return policy_argmax(obs)
    return gumbel_muzero_mcts(obs, timeout=0.8)
```

## 対 PPO 比較

| 観点 | Gumbel MuZero | PPO |
|------|--------------|-----|
| Sample efficiency | ★★★★★ | ★★★ |
| 実装難度 | ★★★★ | ★★ |
| 学習安定性 | ★★★ | ★★★★ |
| Combinatorial action 対応 | ★★★★★ | ★★★ |
| Kaggle 提出サイズ | ★★ (大) | ★★★★ (小) |
| Time budget 適合 | ★★★ | ★★★★ |

**結論**: 第一候補は PPO、余裕があれば Gumbel MuZero に upgrade。

## Orbit Wars 向け推奨 Gumbel MuZero 構成

```
Representation Network
  Input: observation (entities)
  Architecture: Entity Transformer (d_model=128, 4 layers)
  Output: hidden state (batch, 128)

Dynamics Network
  Input: (hidden state, action embedding)
  Architecture: 2-layer MLP
  Output: (next hidden state, reward)

Prediction Network
  Input: hidden state
  Architecture: 2 head MLP
  Output: (policy logits over 900 actions, value)

MCTS
  Simulations per move: 32
  Gumbel top-K: K=8
  Sequential halving: 4 rounds
  UCB constant: c_puct=1.25
```

## 学び

1. **Gumbel MuZero は combinatorial action に強い** → Orbit Wars 適合
2. **Sequential halving** で少 simulation でも精度確保
3. **LightZero / MiniZero** で実装テンプレあり
4. **Dynamics Hybrid (rule + NN)** で Orbit Wars の物理を正確化
5. **時間制約下では value-only fallback** 必須
