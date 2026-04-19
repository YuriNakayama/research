# Planet Wars 知見 → Orbit Wars 転用総合マップ

## 転用マトリクス

| Planet Wars 知見 | Orbit Wars 適用度 | 変換の要点 |
|-----------------|------------------|----------|
| Multi-planet synchronized attack | ★★★★★ | tie→全滅 と直結、+1 rule 必須 |
| Sniping (中立奪取先取り) | ★★★★★ | コメット取り合いで最重要 |
| Ship redistribution | ★★★★☆ | 軌道惑星の位置変動に対応必要 |
| Snipe awareness (防御) | ★★★★☆ | 派遣判断で常時必要 |
| Evaluation function | ★★★★★ | そのまま移植可 |
| Plan-space reasoning | ★★★★★ | 連続座標でも同概念有効 |
| Iterative deepening | ★★★★☆ | 1s 制約で anytime 必須 |
| Trade-down in advantage | ★★★★★ | tie 全滅で戦略的に有効 |
| RHEA (horizon 20) | ★★★★☆ | 高速 simulator 実装必須 |
| MCTS (UCT) | ★★★☆☆ | 連続 action で直接適用困難 |
| Growth Race | ★★★★★ | 開幕の標準戦術 |
| Rush | ★★★☆☆ | 4P では漁夫の利リスク |
| Turtle | ★★★★☆ | 優勢時の王道 |
| Harass | ★★★☆☆ | 20 艦下限で小艦隊困難 |
| Kamikaze | ★★★★☆ | tie 全滅で相打ち可 |
| 軌道惑星 intercept | ★★★★★ | **Orbit Wars 固有、必須** |
| コメット運用 | ★★★★★ | **Orbit Wars 固有、必須** |
| 4P 混戦読み | ★★★★☆ | Planet Wars 2P から拡張 |

## 統合エージェント設計

### 階層アーキテクチャ

```
Level 0: 状態認識
  - 自/敵/中立/コメット 分類
  - production 集計
  - threat map 構築

Level 1: 戦略決定（style selector）
  - growth / turtle / rush / kamikaze を選択
  - 動的切替ロジック

Level 2: 戦術決定（mission allocator）
  - 各自惑星に mission 割当（Melis の plan space）
  - ILP or priority based

Level 3: 戦闘決定（action executor）
  - 発射角・艦数の計算
  - intercept solver 実行
  - +1 rule の適用

Level 4: 安全装置
  - 無効 action のフィルタ
  - 時間超過防止
```

### コード骨格（statically composable）

```python
class OrbitWarsAgent:
    def __init__(self):
        self.opponent_model = OpponentModel()
        self.planet_lut = None
        self.turn_time_budget = 0.8  # seconds, leave 0.2s margin

    def __call__(self, obs, config):
        start = time.time()
        if self.planet_lut is None:
            self.planet_lut = build_planet_lut(obs)

        # Level 0: 状態認識
        self.opponent_model.update(obs)
        threat = build_threat_map(obs)

        # Level 1: 戦略
        style = self.select_style(obs, threat)

        # Level 2: 戦術
        missions = self.allocate_missions(obs, style, threat)

        # Level 3: 戦闘
        actions = []
        for p_id, m in missions.items():
            if time.time() - start > self.turn_time_budget:
                break  # anytime
            a = self.execute_mission(obs, p_id, m, threat)
            if a is not None:
                actions.append(a)

        # Level 4: 安全
        actions = self.filter_valid(actions, obs)
        return actions
```

## 重み付き評価関数（Melis 式 + Orbit Wars 拡張）

```python
def V(obs, me, weights=None):
    w = weights or DEFAULT_WEIGHTS
    features = {}

    # Melis 古典特徴
    my_planets = [p for p in obs["planets"] if p[1] == me]
    enemy_planets = [p for p in obs["planets"] if p[1] != me and p[1] != -1]
    my_fleets = [f for f in obs["fleets"] if f[0] == me]
    enemy_fleets = [f for f in obs["fleets"] if f[0] != me]

    features["ship_advantage"] = sum(p[5] for p in my_planets) - sum(p[5] for p in enemy_planets)
    features["production_advantage"] = sum(p[6] for p in my_planets) - sum(p[6] for p in enemy_planets)
    features["fleet_advantage"] = sum(f[4] for f in my_fleets) - sum(f[4] for f in enemy_fleets)
    features["planet_count"] = len(my_planets) - len(enemy_planets)

    # Orbit Wars 固有特徴
    my_comets = [p for p in my_planets if p[0] in obs.get("comet_planet_ids", [])]
    features["comet_holding"] = len(my_comets)

    # Threat
    features["enemy_threat"] = -sum(f[4] / max(1, estimate_eta(f, obs)) for f in enemy_fleets if f[0] != me)

    # Time discount
    remaining = config.episodeSteps - obs["step"]
    features["production_value"] = features["production_advantage"] * remaining

    return sum(w[k] * features[k] for k in features)


DEFAULT_WEIGHTS = {
    "ship_advantage": 1.0,
    "production_advantage": 5.0,
    "fleet_advantage": 0.5,
    "planet_count": 2.0,
    "comet_holding": 10.0,  # 短命なので即時価値が高い
    "enemy_threat": -3.0,
    "production_value": 0.1,  # remaining * production
}
```

## ハイパーパラメータ tuning

### Step 1: Grid search (初期)

```python
for prod_w in [3.0, 5.0, 7.0]:
    for threat_w in [-2.0, -3.0, -5.0]:
        win_rate = evaluate_vs_baselines(weights={
            "production_advantage": prod_w,
            "enemy_threat": threat_w,
            ...
        })
```

### Step 2: CMA-ES (本格最適化)

```python
import cma

def objective(w):
    weights = dict(zip(DEFAULT_WEIGHTS.keys(), w))
    return -evaluate_vs_pool(weights, num_matches=50)

es = cma.CMAEvolutionStrategy(list(DEFAULT_WEIGHTS.values()), 0.3)
es.optimize(objective, iterations=30)
```

### Step 3: PBT (Population-Based Training)

複数重みを並列に自己対戦、下位を上位の mutation で置き換え。

## 開発ロードマップ

### Phase 1: Baseline (1 週間)

- [ ] kaggle-environments で env.run が動くこと確認
- [ ] starter_agent を勝てる rule エージェント v0.1
- [ ] 中立占領 + 軌道 intercept のみ

### Phase 2: Strategic (1-2 週間)

- [ ] Mission allocation 実装
- [ ] Opponent model 導入
- [ ] RHEA horizon=10, pop=6 で探索層追加
- [ ] CMA-ES で重み tuning

### Phase 3: ML Augmentation (2-3 週間)

- [ ] Entity Transformer で value network 構築
- [ ] BC warmup: rule エージェント vs 自分 10,000 試合でデータ生成
- [ ] PPO self-play 100,000 試合

### Phase 4: Submission Hardening (1 週間)

- [ ] League training (PFSP)
- [ ] Endgame mode 実装
- [ ] Kaggle kernel で 1s 制約下動作確認
- [ ] 100 試合自己対戦 sanity check

## Quick Win リスト（すぐ実装して勝てるもの）

1. **+1 ship rule**: starter は ships // 2 固定 → これを `enemy_garrison + 2` に
2. **軌道惑星対応**: starter は無視 → `predict_planet_position` を使って intercept
3. **コメット占領**: starter は無視 → spawn 時に最近自惑星から最少艦派遣
4. **production 重視**: starter は最近のみ → `production × 1/distance` で優先順位
5. **敵艦隊応答**: starter はゼロ → threat map で守備 trigger

この 5 つだけで starter から大幅な勝率改善。

## 学び

1. **Planet Wars 15 年の知見** の 90% が Orbit Wars に転用可能
2. **固有要素** (軌道・コメット・4P) は追加実装必要、古典に混ぜる
3. **RHEA + NN + CMA-ES** が現代形
4. **段階的ロードマップ** で 4 週間で本格参戦可能
5. **Quick Win 5 項目** で最初の勝率向上が即達成
