# AlphaStar League Training

## ソース

- Nature 2019 論文: https://www.nature.com/articles/s41586-019-1724-z
- DeepMind blog: https://deepmind.google/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning/
- Decipher AlphaStar: https://cyk1337.github.io/notes/2019/07/21/RL/DRL/Decipher-AlphaStar-on-StarCraft-II/
- SCC (AlphaStar 効率化): https://arxiv.org/pdf/2012.13169
- Robust and Opponent-Aware League: https://proceedings.neurips.cc/paper_files/paper/2023/file/94796017d01c5a171bdac520c199d9ed-Paper-Conference.pdf

## AlphaStar の達成

- StarCraft II Grandmaster 達成（2019, 全 3 種族）
- 上位 0.2% 人間プレイヤーに到達
- 自己対戦 + 模倣学習のハイブリッド

## League Training のアーキテクチャ

### 3 種類のエージェント

```
Main Agents (MA)
  - 現在の "本命" エージェント
  - 全対戦相手と自己対戦
  - 勝率平均を最大化する目的で学習

Main Exploiters (ME)
  - Main の弱点を探すエージェント
  - Main とだけ対戦、MA を打ち負かすことを目的
  - Main 改善のための "adversary"

League Exploiters (LE)
  - リーグ全体の弱点を探す
  - 過去世代含む全エージェントと対戦
  - 多様性創出の担い手
```

### 学習フロー

```
1. Initialization:
   - Supervised Learning on human replay data (IL warmup)
   - MA, ME, LE の初期 weights に使用

2. Self-play Loop:
   for iteration in 1..N:
     # Generate experience
     for agent in {MA, ME, LE}:
       opponent = sample_opponent(agent, league)
       trajectory = play(agent, opponent)
       replay_buffer.add(trajectory)

     # Update agents
     for agent in {MA, ME, LE}:
       batch = replay_buffer.sample(agent)
       update(agent, batch, V-trace)

     # Checkpoint
     if iteration % checkpoint_freq == 0:
       league.add_snapshot(MA)  # 過去世代保存
```

### PFSP (Prioritized Fictitious Self-Play)

対戦相手の選択方法:

```python
def sample_opponent(agent, league):
    # 過去世代 + 現在のエージェントから選択
    candidates = league.all_snapshots + [MA, ME, LE]
    win_rates = agent.get_win_rates(candidates)
    weights = (1 - win_rates) ** p    # 勝率低い相手を優先
    return random.choices(candidates, weights=weights)[0]
```

- `p` = 2.0 が論文の推奨
- 勝率 50% 付近の相手を最も頻繁にサンプリング
- 一方的に勝てる相手 (win_rate > 0.9) は稀にしかサンプリング

## Orbit Wars への適用設計

### 簡易版 League (PFSP のみ)

```python
class SimpleLeague:
    def __init__(self, main_agent):
        self.snapshots = []  # 過去 checkpoint
        self.main = main_agent

    def add_snapshot(self):
        import copy
        self.snapshots.append(copy.deepcopy(self.main))

    def sample_opponent(self):
        if len(self.snapshots) < 5:
            return self.main  # self-play
        win_rates = [self.estimate_winrate(snap) for snap in self.snapshots]
        weights = [(1 - wr) ** 2 for wr in win_rates]
        return random.choices(self.snapshots, weights=weights)[0]
```

### フル League (MA + ME + LE)

Orbit Wars 向けに簡略化:

```python
class FullLeague:
    def __init__(self):
        self.main = create_agent()
        self.main_exploiter = create_agent()
        self.league_exploiter = create_agent()
        self.history = [copy.deepcopy(self.main)]

    def step(self):
        # Main: 全相手と対戦
        opp = self.sample_from([self.main, self.main_exploiter, self.league_exploiter] + self.history)
        self.update(self.main, opp)

        # Main Exploiter: Main と Main History のみ
        opp = random.choice([self.main] + self.history[-5:])
        self.update(self.main_exploiter, opp)

        # League Exploiter: 全員
        opp = self.sample_from(all)
        self.update(self.league_exploiter, opp)

        # Checkpoint
        if self.iter % 100 == 0:
            self.history.append(copy.deepcopy(self.main))
            # Exploiter reset
            if self.iter % 1000 == 0:
                self.main_exploiter = create_agent()
                self.league_exploiter = create_agent()
```

## V-trace Loss

AlphaStar は V-trace (IMPALA) を使用。off-policy correction の一種。

```python
def v_trace(behaviour_log_probs, target_log_probs, rewards, values, gamma=0.99, rho_bar=1.0, c_bar=1.0):
    rho = torch.exp(target_log_probs - behaviour_log_probs).clamp(max=rho_bar)
    c = torch.exp(target_log_probs - behaviour_log_probs).clamp(max=c_bar)
    deltas = rho * (rewards + gamma * values[1:] - values[:-1])
    vs = values.clone()
    acc = 0
    for i in reversed(range(len(rewards))):
        acc = deltas[i] + gamma * c[i] * acc
        vs[i] = values[i] + acc
    return vs
```

PPO でも代替可能。on-policy と off-policy のトレードオフ。

## 時間コスト見積もり

AlphaStar の学習コスト:

- 44 日間、TPU v3 × 128 並列
- 総ステップ: ~200 億
- 推定コスト: 数千万円

**Orbit Wars での現実的目標**:

- Kaggle Kernel (GPU: T4 × 1) で 1-2 週間
- 総ステップ: ~1 億
- コスト: ~$100-500 (Kaggle 無料枠 or Colab Pro)

**スケール差**: AlphaStar の 1/200。期待レベルは Grandmaster にならないが、Kaggle 上位は狙える。

## 改良手法 (2023 NeurIPS)

"Robust and Opponent-Aware League Training":

- 勝率だけでなく **policy divergence** も考慮
- 類似戦略の相手ばかり対戦しない、多様性確保
- Opponent-Aware Value: 敵ごとに異なる V 関数

**Orbit Wars 適用**: 4P 対戦では各相手ごとに戦略が異なる可能性あり、opponent-aware value が特に有効。

## Orbit Wars 用の league 構成（推奨）

### 段階 1: Self-play PPO (1 週間)

```
Main only, IL warmup → PPO self-play 100,000 steps
```

### 段階 2: Simple PFSP (1 週間)

```
Main + Historical snapshots (checkpoint 10 個)
勝率 50% 付近の相手をサンプリング
```

### 段階 3: MA + LE (2 週間)

```
Main + League Exploiter
Main: PFSP sampling
LE: 全相手から uniform sampling
```

### 段階 4: Full League (オプション、2-4 週間)

```
MA + ME + LE + historical
計算コスト大、Kaggle 最終段階で採用
```

## 学び

1. **League training = 勝ちに直結** ただし計算コスト大
2. **PFSP** が核心、難易度 50% 付近の相手と学習
3. **Opponent-aware value** は 4P Orbit Wars で特に効く
4. **V-trace vs PPO**: PPO は実装簡単、V-trace は off-policy で効率的
5. **Orbit Wars は AlphaStar の 1/200 スケール** で現実的に運用可能
