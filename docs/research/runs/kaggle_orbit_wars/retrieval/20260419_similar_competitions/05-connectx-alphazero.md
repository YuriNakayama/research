# ConnectX — AlphaZero ベースライン参考

## ソース

- ConnectX コンペ: https://www.kaggle.com/c/connectx
- AlphaZero ConnectX Notebook: https://www.kaggle.com/code/miichaaeel/alphazero-connectx
- PaddlePaddle PARL (スコア 1368): https://github.com/PaddlePaddle/PARL/pull/282
- Negamax tutorial: https://www.kaggle.com/code/hubcity/a-more-useful-negamax-opponent-connectx

## ConnectX ルール

- 2 プレイヤー、7×6 グリッド、四目並べの一般化
- 最初に縦/横/斜め 4 個並べたら勝ち
- action = 7 列のどれに駒を落とすか

## Orbit Wars との関係

**ルールは完全に違う** が、以下の 2 点で学習テンプレとして有用:

1. Kaggle-environments API の最小例として
2. AlphaZero の **最小実装** が豊富（学習コード 300 行程度）

## AlphaZero ConnectX Notebook（miichaaeel）分析

### 基本アーキテクチャ

```python
class ConnectXNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 64, 3, padding=1)    # 3 channel: me, opp, empty
        self.conv2 = nn.Conv2d(64, 64, 3, padding=1)
        self.conv3 = nn.Conv2d(64, 64, 3, padding=1)
        self.fc_policy = nn.Linear(64 * 7 * 6, 7)
        self.fc_value = nn.Linear(64 * 7 * 6, 1)
```

### MCTS コア

```python
def mcts(root, num_sims=100):
    for _ in range(num_sims):
        node = root
        path = []
        # selection
        while node.expanded and not node.terminal:
            node = select_uct(node)
            path.append(node)
        # expansion
        if not node.terminal:
            policy, value = net(node.obs)
            node.expand(policy)
        else:
            value = node.result
        # backup
        for n in reversed(path):
            n.update(value)
            value = -value
    return best_action(root)
```

### self-play 学習ループ

```python
for epoch in range(num_epochs):
    games = [self_play_game(net) for _ in range(100)]
    batch = build_training_batch(games)
    train(net, batch)
```

### 推論時間

Notebook では 1 actionに 0.5-1 秒。Kaggle の ConnectX 提出制約は 2 秒なのでギリギリ。

**Orbit Wars 適用**: ConnectX (盤面 42 マス, action 7) に比べ Orbit Wars は観測・行動ともに 100 倍以上規模大きい。**Gumbel MuZero** や **軽量 MCTS** が必要。

## PaddlePaddle PARL 実装（Score 1368）

- Paddle 製 distributed actor-critic
- ConnectX で PPO + self-play の標準例
- Kaggle 提出スコア 1368（当時上位）

**特徴**:
- Actor 32 プロセスで self-play 生成
- Learner 1 プロセスで parameter update
- Redis で experience buffer 共有

**Orbit Wars への示唆**:
- Actor の並列度は最低 16 必要
- GPU は学習時のみ、提出時は CPU 推論

## Negamax vs AlphaZero

ConnectX Notebook には **純探索 Negamax** と AlphaZero の比較:

| 手法 | スコア | 実装行数 | 備考 |
|------|--------|----------|------|
| Random | 700 | 5 行 | baseline |
| Simple rule | 900 | 50 行 | 即勝ち・即負け回避 |
| Negamax depth 4 | 1100 | 150 行 | αβ 剪定 |
| Negamax depth 7 + bitboard | 1300 | 300 行 | 上位 |
| AlphaZero | 1350 | 500 行 | 学習に GPU 1 日 |

**Orbit Wars への示唆**:
- 連続座標・可変 action で Negamax は実装困難
- **RHEA (Rolling Horizon Evolution)** が Negamax の代替として機能
- heuristic_search クラスタで詳細化

## Kaggle-environments API 最小例

ConnectX の agent 定義が最も簡潔:

```python
def my_agent(observation, configuration):
    board = observation.board
    my_mark = observation.mark
    # 空列を列挙
    valid_cols = [c for c in range(configuration.columns)
                  if board[c] == 0]
    return random.choice(valid_cols)
```

**Orbit Wars との差**:
- ConnectX は action が int (列番号)、Orbit Wars は list of [planet_id, angle, ships]
- observation.board は flat list、Orbit Wars は dict of lists

## Kaggle 提出のラッパー

ConnectX では単一ファイル agent.py として提出:

```python
# submission.py
def agent(observation, configuration):
    # すべてロジック
    return action
```

**Orbit Wars も同じ**: `main.py` 形式で単一ファイル、import は inline。

### モデル重み読み込み

ConnectX AlphaZero 組は state_dict を base64 encode して .py ファイル内にハードコード:

```python
WEIGHTS_B64 = "iVBORw0KGg..."  # 10MB 程度
model.load_state_dict(pickle.loads(base64.b64decode(WEIGHTS_B64)))
```

**Orbit Wars の NN 提出**: 同じ手法。ただし Kaggle には **追加ファイル upload** 機能もあるので、モデルを別ファイルで提出可能（要確認）。

## 学び

1. **AlphaZero 最小実装** は 300-500 行で実装可能
2. **MCTS** の self-play ループは Orbit Wars でもほぼそのまま移植
3. **Negamax** は離散 action 向け、Orbit Wars には **RHEA** が代替
4. **Kaggle 提出フォーマット** は単一 .py、重みは base64 or 別ファイル
5. ConnectX スコア曲線: Random 700 → Rule 900 → Search 1100 → RL 1350
   - Orbit Wars でも似た曲線が予想、Rule で 1100 相当、RL で 1350 超えを狙う
