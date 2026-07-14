# Lux AI Season 2 — ryandy 1st place 解法

## ソース

- 1st place コード: https://github.com/ryandy/Lux-S2-public
- Lux AI S2 コンペ: https://www.kaggle.com/competitions/lux-ai-season-2
- Lux-Design-S2 公式: https://github.com/Lux-AI-Challenge/Lux-Design-S2

## Lux S2 ルール要約

- 2 プレイヤー対戦、連続 1000 ステップ
- **Bidding → Factory placement → Normal phase** の 3 フェーズ
- 64×64 グリッド、rubble/ice/ore のリソース
- Factory が robot を生産、robot は water/metal/power を扱う
- 勝利条件: game end 時の lichen 面積最大化

## Orbit Wars との類似点

| 要素 | 共通性 |
|------|--------|
| 可変エンティティ数 | ロボット/factory vs planet/fleet |
| 時間制約 | 3s → 1s, 同種の挑戦 |
| 2 プレイヤー self-play | 同様 |
| action space の可変長 | 各 robot にアクション割り当て |
| 複雑な collision ルール | robot collision vs fleet sweep |

## ryandy 解法の設計（GitHub コード解析）

### 全体構成

```
Lux-S2-public/
├── agent.py              # エントリーポイント
├── lux/                  # 環境ラッパー
├── agent_core/
│   ├── mission.py        # mission 管理
│   ├── planner.py        # 経路計画
│   ├── factory_manager.py
│   ├── robot_manager.py
│   └── threat_map.py
├── models/               # PyTorch policy network（ただし推論のみ）
└── utils/
```

### 1. Mission System（タスクグラフ）

`mission.py` で robot ごとに mission を割り当て:

```python
class Mission:
    type: str  # "mine_ice", "attack", "defend_factory", ...
    priority: float
    target: tuple  # (x, y)
    deadline: int
    assigned_robot: Optional[int]
```

- **mission pool** を毎ターン再計算、robot とのマッチングは Hungarian algorithm
- 優先度は factory 依存度 × 資源逼迫度 で動的調整

### 2. Path Planning（A* + collision avoidance）

Lux S2 は robot collision が致命的。ryandy は:

- 各 robot の **N ターン先の予約経路** を時空 A* で計算
- 敵 robot は過去 3 ターンの motion から予測
- 自分同士の衝突は**優先度順に後回し**

### 3. Policy Network（限定利用）

GitHub にある PyTorch モデルは **factory placement フェーズでのみ** 利用。normal phase は純 rule-based。

`models/` には:
- entity encoder（CNN + FC）
- value head（次フェーズの期待勝率）

**Orbit Wars への教訓**: **学習が必要な箇所を絞る**。ryandy は placement のみ NN、残りは rule。初動の惑星選定や開幕 3 turn だけ NN にする戦略が適用可能。

### 4. Threat Map（敵到達コスト）

`threat_map.py` で全タイル × 10 ターンの threat score を保持:

```python
threat[x, y, t] = Σ_{enemy robots} 1/(distance + 1) × arrival_prob(t)
```

自 robot は threat の低い経路を選択。

**Orbit Wars 移植**: 惑星配置が疎なので **grid 化せず惑星 ID 単位**:

```python
threat[planet_id] = Σ_{enemy fleets heading there} (fleet.ships × 1/eta)
```

守備不足惑星から補給艦を派遣するトリガーに使用。

### 5. Self-play League Training

README の学習ログから:

- **main agent**: 最新パラメータ
- **exploiter**: main の弱点を突く敵専用エージェント
- **historical league**: 過去 50 checkpoints を prioritized sampling

勝率データから難しい敵を優先してサンプリング（PFSP = Prioritized Fictitious Self-Play）。

### 6. Reward Shaping

sparse な win reward では学習が進まないため:

- 中間報酬 1: 新 lichen タイル獲得 +0.01
- 中間報酬 2: 敵 factory 破壊 +0.5
- 中間報酬 3: 資源採取効率 +0.001/step
- terminal: lichen 差 / max_lichen ∈ [-1, 1]

**Orbit Wars での代替**:
- production-weighted 占領 +0.1 × production
- 艦隊消滅 ±0.01
- terminal: final score delta

## ryandy 解法の強み（writeup 分析）

### 1. Modularity

各 manager が独立、placement / mine / attack / defend の切替が疎結合。**Orbit Wars でも同じ分離**：
- `CometManager` — コメット占領
- `OrbitManager` — 軌道惑星の intercept
- `DefenseManager` — 守備配置
- `ExpansionManager` — 中立占領

### 2. Simulation-Heavy Evaluation

候補 action の評価に **simulator 100+ rollouts**（短めの RHEA 風）。

### 3. Gradient Descent on Placement

factory 配置は 6 パラメータ（x, y, 資源優先度...）の連続最適化。SLSQP で解く。

**Orbit Wars の開幕**:
- 自惑星 5-10 個から最初の行動選択
- 目的関数 = 期待 production × remaining_turns − 必要艦数
- 数値最適化可能（ただし離散選択でも十分）

## 具体的な転用パッケージ

### パッケージ A: Entity Encoder

```python
import torch
import torch.nn as nn

class EntityEncoder(nn.Module):
    def __init__(self, entity_dim=32, embed_dim=128):
        super().__init__()
        self.planet_embed = nn.Linear(entity_dim, embed_dim)
        self.fleet_embed = nn.Linear(entity_dim, embed_dim)
        self.transformer = nn.TransformerEncoder(
            nn.TransformerEncoderLayer(embed_dim, 4), num_layers=3
        )

    def forward(self, planets, fleets):
        p = self.planet_embed(planets)
        f = self.fleet_embed(fleets)
        x = torch.cat([p, f], dim=1)
        return self.transformer(x)
```

### パッケージ B: Mission Allocation (Hungarian)

```python
from scipy.optimize import linear_sum_assignment

def allocate(planets, missions):
    cost = np.array([
        [-score(p, m) for m in missions] for p in planets
    ])
    row, col = linear_sum_assignment(cost)
    return {planets[r].id: missions[c] for r, c in zip(row, col)}
```

### パッケージ C: PFSP Sampler

```python
def pfsp_sample(opponents, win_rates, alpha=1.0):
    # 勝率 0.5 に近い相手ほど優先
    weights = (1 - |wr - 0.5|) ** alpha
    return np.random.choice(opponents, p=weights/weights.sum())
```

## 注意事項

- ryandy のコードは Lux S2 特有のゲームルールに深く依存、**直接 import 不可**
- あくまで **アーキテクチャの参考** として扱う
- モデル重みは公開されているが Lux S2 学習済みなので Orbit Wars には使えない（ゼロから学習必須）

## 学び

1. **Rule-based core + NN warmup** が 1s 制約下で最強
2. **Mission/planner の分離** が保守性・性能の両立
3. **Threat map + Hungarian 割当** は Orbit Wars でも直接効く
4. **League training** は Kaggle 投稿前の仕上げで 10-50 ELO 上積み
