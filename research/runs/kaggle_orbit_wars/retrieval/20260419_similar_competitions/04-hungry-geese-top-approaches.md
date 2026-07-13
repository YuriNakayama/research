# Hungry Geese — 上位解法総覧

## ソース

- Hungry Geese コンペ: https://www.kaggle.com/competitions/hungry-geese
- Kaggle env source: https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/hungry_geese/hungry_geese.py
- alpha-zero-hungry-geese: https://github.com/yonsweng/alpha-zero-hungry-geese
- HandyRL example: https://www.kaggle.com/code/avikdas2021/using-handyrl-for-hungry-geese/output
- 日本語解説: https://speakerdeck.com/hoxomaxwell/kaggle-hungry-geese

## Hungry Geese ルール要約

- 4 プレイヤー、11×7 トーラス盤（上下左右ループ）
- 各プレイヤーは snake（geese）を操作
- 毎ターン食料を食べると伸び、4 アクション選択: N/S/E/W
- 自分の尾/他者の体にぶつかると死亡
- 200 ターン、最後まで生き残った順位で得点

## Orbit Wars との共通点

| 項目 | 共通性 |
|------|--------|
| **4 プレイヤー** | マッチメイキング共通 |
| **TrueSkill 評価** | Kaggle Simulation 共通 |
| **同時 submit アクション** | 同期ターン |
| **短い time budget** | 1 秒オーダー |
| **戦略的に "混戦 2 位" 戦略が可能** | 3 者混戦で tie 回避 |

## 上位解法の 3 大アプローチ

### 1. AlphaZero / MuZero 系（1-5位）

`alpha-zero-hungry-geese` (yonsweng) の典型構造:

- **ニューラルネット** ResNet 12 層 + action head + value head
- **MCTS** ROOT で 400-800 simulation
- **自己対戦** 500,000 試合で学習
- **loss**: policy cross-entropy + value MSE + L2 weight decay

**Orbit Wars への示唆**:
- 離散 action space (4) の Hungry Geese に対し、Orbit Wars は連続角度
- **action discretization** が必要: 発射角を 36 分割（10°刻み）、ships 送信率を 5 段階
- action branching factor = 4 × 36 × 5 = 720（惑星数 1 つあたり）
- MCTS には重いが **Gumbel MuZero** なら対応可能（後述）

### 2. HandyRL（DeNA 製 RL ライブラリ）採用組（中位多数）

HandyRL の特徴:
- Off-policy actor-critic（V-trace）
- multi-agent 対応
- 大規模分散学習（数百 worker）
- Hungry Geese チュートリアルあり

HandyRL の利点:
- **multi-agent で勾配推定が安定**
- **impala + PPO のハイブリッド**
- Kaggle Simulation 向けに最適化済み

リポジトリ: https://github.com/DeNA/HandyRL

**Orbit Wars での採用可否**:
- HandyRL は **離散 action 前提**、連続角度には action head の書き換えが必要
- ゼロから書くより HandyRL fork のほうが早い（分散学習・logging 完備）

### 3. Rule-based + BC + PPO（上位に散見）

- Rule-based で baseline policy 作成
- 自己対戦データで Behavioral Cloning
- PPO で fine-tune

**Orbit Wars への示唆**: starter_agent の拡張版 → BC → PPO の 3 段は最も安定。

## Hungry Geese の戦略的教訓

### 教訓 1: 生き残り優先 > 即時食料

上位解法は「食料を取りに行くと死亡リスク → 取らない」判断ができる。

**Orbit Wars 版**: 攻撃で自惑星を空にして陥落させるより、守備優先で長期 production 積分で勝つ判断。

### 教訓 2: 対戦相手の行動予測

相手の過去 5 ターンの動きから次アクション予測 (Markov chain or small NN)。予測された場所を避ける。

**Orbit Wars 版**: 敵惑星の ships 増加パターンと target 選好から、次ターンの派遣先を予測。

### 教訓 3: End-game killshot

残り 10 ターンで、自 geese が長い時に相手の進路を塞ぐ「壁」戦術。

**Orbit Wars 版**: 残り 30 ターンで、勝勢なら tie 誘発で相手主力を消耗させる守備戦。

## 日本語スライド（hoxomaxwell）の要点

- 観測前処理: 盤面 + 各 snake の long vector
- PyTorch, ResNet 12 層, 1.5M パラメータ
- Kaggle kernel 推論 20ms / call
- 自己対戦 100 万試合（3 週間、GPU 4 枚）
- 最終順位: 50 位前後

**時間コスト参考**: Orbit Wars でも同規模の学習が必要（100 万試合 = GPU 単体で 2-3 週間）。

## Orbit Wars 向け HandyRL カスタム

### 観測エンコーダ（HandyRL 適合）

```python
def obs_to_tensor(obs):
    # HandyRL は固定長 flat tensor 前提
    planet_pad = 20   # 上限
    fleet_pad = 50
    planets = [[p.owner, p.x/100, p.y/100, p.radius/3, p.ships/500, p.production/5, int(p.id in comets)]
               for p in obs["planets"]]
    planets = planets[:planet_pad] + [[0]*7] * (planet_pad - len(planets))
    fleets = [[f.owner, f.x/100, f.y/100, f.angle/math.pi, f.ships/500, f.target_id]
              for f in obs["fleets"]]
    fleets = fleets[:fleet_pad] + [[0]*6] * (fleet_pad - len(fleets))
    return np.concatenate([np.array(planets).flatten(), np.array(fleets).flatten()])
```

### Action Head（離散化）

```python
# 各自惑星 × (角度 36 × ships 5 + no-op)
action_head = nn.Linear(hidden, N_planets * (36 * 5 + 1))
```

### 分散学習設定

- Worker: 16 × CPU（self-play 生成）
- Learner: 1 × GPU（parameter update）
- Parameter server: 1 VM
- Episode buffer: 10,000 episodes

## ConnectX との関係

- ConnectX と Hungry Geese は両方 Kaggle Simulation
- ConnectX: 2 player、9 action branching → **MCTS のみで解ける**
- Hungry Geese: 4 player, 4 action → **NN + MCTS ハイブリッド**

Orbit Wars は **action branching 大 + 連続 + 4P** なので Hungry Geese に最も近い。

## 学び

1. **4P コンペの上位解法 = AlphaZero 系 or HandyRL**
2. **学習コスト**: GPU 単体で 2-3 週間、分散で 1 週間
3. **Action discretization** は必須、精度 vs branching の trade-off
4. **Rule-based は上位 50-100 位止まり**、本気で 1 位狙うなら RL 必須（ただし 1 位への距離は大きい）
