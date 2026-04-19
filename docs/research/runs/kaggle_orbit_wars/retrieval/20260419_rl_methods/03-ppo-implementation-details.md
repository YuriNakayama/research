# PPO Implementation Details for Orbit Wars

## ソース

- **The 37 Implementation Details of PPO** (ICLR 2022): https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
- Hugging Face PPO: https://huggingface.co/blog/deep-rl-ppo
- CleanRL (single-file PPO): https://github.com/vwxyzjn/cleanrl
- PPO self-play example: https://github.com/ImmanuelXIV/ppo-self-play

## なぜ PPO が第一候補か

1. **実装がシンプル**: 100 行以内で動作
2. **学習安定**: hyperparameter に頑健
3. **on-policy**: sample efficiency は低いが動作確実
4. **Kaggle 提出サイズ小**: policy network のみで OK
5. **parallelizable**: 16+ CPU で rollout 並列化

## PPO の基本式

```
Loss = L_policy + c1 · L_value + c2 · H(policy)

L_policy = E[min(ratio · A, clip(ratio, 1-ε, 1+ε) · A)]
L_value = E[(V(s) - V_target)²]
H(policy) = -E[Σ π log π]   # entropy bonus
```

## 37 Implementation Details からの抜粋（Orbit Wars に特に重要な 15 個）

### Core (すべての実装で必須)

**1. Vectorized environment**
- 16-128 並列 env で rollout、GPU 飽和
- Orbit Wars は Python sim なので `SubprocVecEnv` 必須

**2. Orthogonal initialization + constant bias=0**
- Policy/Value の最終層は `sqrt(2)` で初期化

**3. Adam optimizer, lr = 3e-4, eps=1e-5**

**4. Learning rate annealing**
- 0 まで linear decay

**5. Generalized Advantage Estimation (GAE)**
- λ = 0.95, γ = 0.99

**6. Mini-batch update**
- 4 epochs, 4 mini-batches / epoch

**7. Normalized advantages**
- Per mini-batch, not global

**8. Clipped surrogate objective**
- ε = 0.2 標準

**9. Value loss clipping**
- 同じく ε = 0.2 で value も clip

### Architecture

**10. Shared MLP trunk, separate policy/value heads**
- Orbit Wars では entity encoder 共通、heads 分離

**11. No shared feature with CNN (for image inputs)**
- Orbit Wars は entity なので関係なし

**12. Entropy coefficient = 0.01**
- 探索促進、小さめ

**13. Global gradient clipping 0.5**

### Observation Preprocessing

**14. Reward scaling / clipping**
- reward を [-10, 10] に clip
- running std で normalize

**15. Observation normalization**
- entity 属性を個別に normalize (x/100, ships/500, etc.)

### Specific to Continuous Actions

(Orbit Wars は action を離散化して扱うため該当部分は割愛)

## Orbit Wars 固有の設計

### Action Space 設計 A: 完全離散化

```python
class OrbitWarsDiscreteActionSpace:
    def __init__(self, n_planets_max=15, n_angles=36, n_ship_frac=5):
        self.n = n_planets_max * n_angles * n_ship_frac + 1  # +1 for no-op
    def decode(self, a, obs):
        if a == self.n - 1:
            return None  # no-op
        planet_idx = a // (36 * 5)
        angle_idx = (a // 5) % 36
        frac_idx = a % 5
        angle = (angle_idx / 36) * 2 * math.pi
        ships_frac = [0.2, 0.4, 0.6, 0.8, 1.0][frac_idx]
        return (planet_idx, angle, ships_frac)
```

計算量: 15 × 36 × 5 = 2700 + 1 = 2701 actions

### Action Space 設計 B: 階層的 (recommended)

```python
# Level 1: どの惑星から発射するか (or no-op)
# Level 2: どの惑星を target にするか
# Level 3: 何艦数送るか (5 段階)
# Angle は intercept solver で target から自動計算

class HierarchicalActionSpace:
    def __init__(self, n_planets=15, n_targets=15, n_frac=5):
        # Policy output: (n_planets + 1) × n_targets × n_frac
        self.shape = (n_planets + 1, n_targets, n_frac)
    def decode(self, action_triplet, obs):
        planet, target, frac = action_triplet
        if planet == 0:  # no-op
            return None
        planet_obj = obs["planets"][planet - 1]
        target_obj = obs["planets"][target]
        ships = int(planet_obj.ships * [0.2, 0.4, 0.6, 0.8, 1.0][frac])
        angle = compute_intercept_angle(planet_obj, target_obj, obs)
        return [planet_obj.id, angle, ships]
```

計算量: 16 × 15 × 5 = 1200 actions

**利点**: Angle を NN に学ばせない（intercept solver が担当）、action space が減る。

### Multi-action per turn

```python
def sample_turn_actions(policy, obs, max_actions=5):
    """1 turn 内で複数 action を sample"""
    actions = []
    state = obs
    for _ in range(max_actions):
        logits = policy(state)
        a = sample_from(logits)
        if a == "commit":
            break
        actions.append(a)
        state = apply_action_to_state(state, a)
    return actions
```

Action に "commit" 特殊トークンを加え、policy が「もう送らない」を明示選択可能。

## 実装スケルトン

```python
import torch
import torch.nn as nn
from torch.distributions import Categorical

class OrbitWarsPolicy(nn.Module):
    def __init__(self, entity_dim=8, hidden=128, n_actions=1200):
        super().__init__()
        self.encoder = EntityTransformer(entity_dim, hidden)
        self.policy_head = nn.Linear(hidden, n_actions)
        self.value_head = nn.Linear(hidden, 1)

    def forward(self, obs_entities):
        h = self.encoder(obs_entities)
        h_pooled = h.mean(dim=1)  # [B, hidden]
        logits = self.policy_head(h_pooled)
        value = self.value_head(h_pooled)
        return logits, value.squeeze(-1)

def ppo_update(policy, optimizer, batch):
    obs, actions, old_log_probs, returns, advantages = batch
    for epoch in range(4):
        for mb in split_minibatches(batch, 4):
            logits, values = policy(mb["obs"])
            dist = Categorical(logits=logits)
            new_log_probs = dist.log_prob(mb["actions"])
            ratio = torch.exp(new_log_probs - mb["old_log_probs"])
            surr1 = ratio * mb["advantages"]
            surr2 = torch.clamp(ratio, 0.8, 1.2) * mb["advantages"]
            policy_loss = -torch.min(surr1, surr2).mean()
            value_loss = 0.5 * (values - mb["returns"]).pow(2).mean()
            entropy = dist.entropy().mean()
            loss = policy_loss + 0.5 * value_loss - 0.01 * entropy
            optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(policy.parameters(), 0.5)
            optimizer.step()
```

## Self-play Loop

```python
def self_play_episode(policy, env):
    obs = env.reset()
    trajectories = [[], []]  # player 0, player 1
    while not done:
        for player in range(2):
            logits, value = policy(to_tensor(obs[player]))
            action = sample(logits)
            trajectories[player].append((obs[player], action, logits, value))
        next_obs, rewards, done, info = env.step(actions)
        for player in range(2):
            trajectories[player][-1] += (rewards[player],)
        obs = next_obs
    return trajectories
```

## 計算コスト (Kaggle GPU 単体の現実解)

### Target: 100k 試合

- 1 試合平均 200 turn
- 1 turn rollout: 10ms (NN 推論 2ms + sim 8ms)
- 1 試合: 200 × 10ms = 2s
- 100k 試合: 200,000s = 55 時間 ≈ **2 日 (1 env)**
- 16 env parallel: **3.5 時間**
- 64 env parallel (Colab Pro TPU): **1 時間**

### Target: 1M 試合

- 16 env: 1.5 日
- 64 env: 9 時間

### GPU / TPU

- 学習自体 (PPO update) は GPU 必須
- Rollout は CPU で十分 (NN 推論以外)
- ベスト構成: **CPU 64 (rollout) + GPU 1 (update)**

## 最低 20k 試合で starter を倒す

経験則（Kore/Lux での観測）:
- 10k 試合: random 超え、starter 互角
- 30k 試合: rule-based ベースライン超え
- 100k 試合: 上位 rule-based 超え
- 500k 試合: 上位 RL 入り
- 1M+ 試合: 優勝圏

## Self-play の落とし穴

### Mode collapse

同じ戦略に収束、多様性喪失。対策:

- Entropy bonus 増やす (0.01 → 0.05)
- PFSP で古い world model 保存

### Rock-paper-scissors

A → B → C → A の循環。対策:

- League training の LE で全方位カバー
- 最終 policy は historical ensemble

### Reward hacking

予想外の exploit を発見。対策:

- 複数 baseline vs 対戦、安定性確認
- Evaluation metric を win_rate だけでなく per-feature でも測定

## 学び

1. **37 Details を全部守る** のが PPO 成功の第一条件
2. **Action Space は hierarchical** が Orbit Wars に最適
3. **16-64 env parallel** で現実的時間で学習
4. **IL warmup** を省略すると収束が 2-3 倍遅い
5. **Self-play の落とし穴** (mode collapse, RPS) を常に監視
