# Halite IV — ttvand 1st place 解法

## ソース

- 1st place リポジトリ: https://github.com/ttvand/Halite
- Halite IV コンペ: https://www.kaggle.com/c/halite
- 解法討論: https://www.kaggle.com/c/halite/discussion/183312

## Halite IV ルール要約

- 4 プレイヤー、21×21 グリッド
- `ship` と `shipyard` の 2 種 unit
- ship が halite を採取、shipyard に持ち帰る
- 400 ターン
- 時制約: ゲーム全体 6 分（overage model）

## Orbit Wars との類似点

| 項目 | Halite IV | Orbit Wars |
|------|-----------|------------|
| プレイヤー数 | 4 | 2 or 4 |
| 盤面 | 離散 | 連続 |
| 艦の移動 | 隣接タイル | 連続直線 |
| 戦闘 | 同タイル collision | 同ターン到着 combat |
| 終局判定 | halite 合計 | production 差分（推定） |

**共通の戦略的ジレンマ**: 採取 (mine) vs 攻撃 vs 守備の意思決定が毎ターン必要。

## ttvand 解法の設計

### ハイブリッド設計の核

```
observation
  ↓
[rule-based controller]          # 主戦場
  - ship allocation (mine/attack/defend)
  - shipyard construction timing
  - collision avoidance
  ↓
[DL value estimator]             # 補助
  - 状態価値 V(s) を学習
  - rule の選択で値が曖昧な時に tie-break
  ↓
action submission
```

### 1. Ship Scheduling

各 ship に以下の役割を動的付与:

- `miner`: 最寄り高濃度 halite を採取
- `attacker`: 敵 ship 襲撃
- `defender`: 自 shipyard 周辺に滞在
- `hunter`: 敵 shipyard 近辺の敵 miner を狙う
- `recaller`: halite を shipyard に回収

**役割遷移**: 毎ターン再評価、「今 miner だった ship が次ターンに defender になる」頻繁。

### 2. Optimization via Integer Programming

Ship の役割割当を ILP (integer linear programming) で解く:

- 変数: `x[ship, role] ∈ {0,1}`
- 制約: 各 ship は 1 役割、shipyard 守備数は下限
- 目的: 期待 halite 増加

CBC / PuLP で 0.1 秒以内で解ける規模。

**Orbit Wars 転用**:
- 変数: `x[planet, mission]`（各惑星の mission 割当）
- 制約: 各惑星は 1 mission、防衛下限確保
- 目的: Σ expected_production_gain × time_horizon − Σ required_ships

### 3. DL Value Network

**アーキテクチャ**: ResNet 20 層、入力は 21×21×20 channel。

Channel 構成（抜粋）:
- 自/敵 ship 位置 (4 channels)
- halite 密度 (1)
- 自/敵 shipyard (4)
- 各 player の cargo (4)
- turn progress (1)
- ...

**学習**:
- 自己対戦 200,000 試合
- TD(λ) loss
- Adam, lr=3e-4

**推論時間**: 5ms/call（GPU なし Kaggle kernel）。

**Orbit Wars への移植**:
- 連続座標なので **CNN でなく Entity Transformer 必須**
- 入力: planet entities (x, y, r, owner, ships, prod) + fleet entities
- 出力: 状態価値 V(s) スカラー
- 推論時間 50ms 以内を目標（1s 制約）

### 4. Opponent-Aware Planning

敵 ship の予測移動を多ステップ実行、衝突リスク低い経路を選ぶ:

```python
def predict_enemy_move(enemy_ship, history):
    # 過去 5 ターンの motion vector 平均
    dx = mean([h.dx for h in history[-5:]])
    dy = mean([h.dy for h in history[-5:]])
    return (enemy_ship.x + dx, enemy_ship.y + dy)
```

**Orbit Wars 適用**: 敵艦隊は発射後に角度固定なので**完全予測可能**。敵の次ターン **新規派遣予測** こそが難しい。敵惑星の ships デルタと target 履歴から発射予測モデルを構築。

### 5. Endgame Strategies

残り 30 ターンから `endgame mode` に入り、全 ship を shipyard に recall + 敵 shipyard 攻撃。

**Orbit Wars 適用**: 残り 30 ターン（step ≥ 470）から:
- 低 production 惑星への攻撃は不経済
- 敵 flagship（production 最大惑星）に総力戦
- tie 回避 + 1 艦派遣を厳格化

## コード構造（ttvand/Halite GitHub）

```
Halite/
├── rule_utils/           # 決定木的な rule
├── stable_baselines/     # RL 学習コード（学習時のみ）
├── agent.py              # Kaggle 提出用
├── agent_utils/          # 共通ヘルパ
├── configs/              # hyperparameters
└── models/               # saved checkpoints
```

`agent.py` の 1000+ 行が rule-based コア、ML は 1/5 以下。

## Halite IV 8位: Imitation Learning by CNN（KhaVo）

- ソース: https://voanhkha.github.io/2020/09/15/halite/
- 盤面を画像化し、CNN で U-Net 風 semantic segmentation
- 出力: 各タイルの「この ship の次の action」
- 訓練: 自作 rule-based で 10,000 試合生成、BC

**Orbit Wars への示唆**:
- 連続座標だが惑星 ID で indexing すれば **per-planet U-Net** 的な出力が可能
- 出力: 各自惑星の (action_type, target_planet_id, ships_pct)
- imitation で rule policy を近似 → PPO fine-tune

## Orbit Wars への転用テンプレ

### Template A: Per-Planet Role Assignment (ILP)

```python
from pulp import LpProblem, LpVariable, LpBinary, lpSum, LpMaximize

def assign_roles(planets, enemies):
    prob = LpProblem("roles", LpMaximize)
    x = {
        (p.id, r): LpVariable(f"x_{p.id}_{r}", cat=LpBinary)
        for p in planets for r in ["defend", "attack", "comet", "expand"]
    }
    # constraint: 各惑星 1 role
    for p in planets:
        prob += lpSum(x[p.id, r] for r in roles) == 1
    # objective
    prob += lpSum(expected_value(p, r) * x[p.id, r] for p in planets for r in roles)
    prob.solve()
    return {p.id: [r for r in roles if x[p.id, r].value() > 0.5][0] for p in planets}
```

### Template B: Value Network Skeleton

```python
class OrbitWarsValueNet(nn.Module):
    def __init__(self, hidden=128):
        super().__init__()
        self.planet_enc = nn.Linear(8, hidden)   # (id, owner, x, y, r, ships, prod, is_comet)
        self.fleet_enc = nn.Linear(6, hidden)    # (owner, x, y, angle, ships, eta)
        self.trans = nn.TransformerEncoder(nn.TransformerEncoderLayer(hidden, 4), 3)
        self.value_head = nn.Sequential(
            nn.Linear(hidden, hidden), nn.ReLU(), nn.Linear(hidden, 1)
        )

    def forward(self, planets, fleets):
        p = self.planet_enc(planets)
        f = self.fleet_enc(fleets)
        x = torch.cat([p, f], dim=0)
        h = self.trans(x.unsqueeze(0)).mean(dim=1)
        return self.value_head(h)
```

### Template C: Endgame Detector

```python
def is_endgame(obs):
    step = obs["step"]
    my_score = my_total_ships(obs)
    enemy_score = enemy_total_ships(obs)
    return step > 470 or abs(my_score - enemy_score) > 300
```

## 学び

1. **Rule-based コア + DL 補助** の比率: ルール 80%, DL 20%
2. **ILP による役割割当** は惑星数 10 個規模で瞬時に解ける
3. **Value network のみ** 学習で PPO より安定（ただし強さは PPO 以下）
4. **Endgame mode** は実装コストに対して効果大
5. CNN は離散盤面専用、連続座標では **Entity Transformer** に置換必須
