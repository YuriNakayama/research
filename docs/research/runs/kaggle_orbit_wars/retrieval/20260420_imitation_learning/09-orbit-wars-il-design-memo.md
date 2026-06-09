# Orbit Wars への模倣学習適用 設計メモ

## 目的

過去 Kaggle Simulation コンペの IL 事例調査（本 retrieval の 01–08）を踏まえ、Orbit Wars に IL を適用するときの **最短開発ルート**と **拡張パス**を設計する。

## 結論サマリ

- **Day 1 ベースライン**: **Halite IV 型 semantic segmentation BC**（cluster 04 推奨）
- **Day 7 改良**: **Kore 2022 型 entity/action-sequence BC** で多惑星指令を同時出力
- **Day 14 改良**: **BC policy + 浅い MCTS**（Hungry Geese 3位型）
- **Day 21 以降**: **AlphaStar 型 SL→MARL**（HandyRL 等を利用、時間があれば）
- **DAgger / GAIL** は時間に余裕があれば compound error の対策として導入

## なぜ IL なのか（意思決定ログ）

| 候補 | 立ち上げ時間 | 最終到達性能 | Kaggle での実績 | 決定 |
|------|-------------|--------------|----------------|------|
| Pure Rule-based | 1 day | 低〜中 | Halite 1位等、あり | ベースラインとして別途作る |
| Pure RL (PPO scratch) | 2-3週 | 中〜高 | Lux 1位等 | **Orbit Wars 初見で時間リスク大** |
| BC from top bots | 3-7 day | 中 | Lux S3 3位, Kore上位 | **まずこれを最初にやる** |
| BC + MCTS | 1-2週 | 中〜高 | Hungry Geese上位 | 次フェーズ |
| IL→RL hybrid | 3週+ | 高 | AlphaStar, AlphaGo | 余裕があれば |

**Orbit Wars は未知の物理（軌道力学）を含むため、RL scratch で報酬設計を詰めるのはコスパが悪い。** 上位 bot の意思決定をまず真似することで「軌道力学の常識」を暗黙学習させる戦略が効く。

## 段階別設計

### Phase 1: Semantic Segmentation BC（~Day 5）

**参考**: cluster 04 (Halite IV Kha Vo)

```
Observation (B, C, H, W):
  C = 14–18
    0: 自艦隊量 (正規化)
    1: 敵艦隊量
    2: 惑星中心位置マスク
    3: 惑星ID (one-hot 不要、embed)
    4: 所有者 (自/敵/中立)
    5: 残りターン比率
    6-9: 過去 4 ターンの敵行動履歴
    10-13: 軌道予測: 次 N ターンの惑星位置
    14-17: その他（太陽引力場, etc.）

Model: small U-Net (encoder 4 block, decoder 4 block, ch 32→256)
Output heads:
  - action_type per cell: {stay, launch}
  - fleet_fraction per cell: scalar in (0, 1]
  - target_planet per cell: softmax over planet IDs
Loss = CE(action_type) + MSE(fleet_fraction * mask) + CE(target_planet * mask)
Data: LB 上位 50 bot × 20 エピソード ≒ 1000 ep × 500 step = 500k サンプル
```

### Phase 2: Entity/Action Sequence BC（~Day 10）

**参考**: cluster 02 (Kore 2022 khanhvu207)

- 惑星・艦隊を **entity list**（可変長）として扱う Transformer encoder
- Action を `(src_planet, tgt_planet, fleet_ratio_bin, launch_tick)` の **token sequence** として autoregressive 生成
- 1 ターン中の全発射指令を 1 sequence で出力 → 同時最適化

### Phase 3: BC + 浅い MCTS（~Day 14）

**参考**: cluster 03 (Hungry Geese Maxwell)

- BC policy を **prior** として PUCT MCTS を走らせる
- 提出時の時間制約 (~1 秒/ターン) を考慮し、シミュレーション数 10–50 程度
- Value head は BC と同じネットから dual head で供給
- 軌道計算は **MCTS の rollout policy にも BC を使う**（古典ランダムロールアウトは軌道力学と相性が悪い）

### Phase 4: IL→RL（~Day 21+、任意）

**参考**: cluster 05 (AlphaStar), cluster 06 (AlphaGo)

- HandyRL で BC init → PPO or V-trace self-play
- リーグ最小構成: Main × 1 + Exploiter × 1 の 2 系統
- 自分の初期 rating が BC で十分高ければ、RL で +100–300 ELO が現実的

## データパイプライン（共通）

cluster 08 (Meta Kaggle Episodes) の通り：

1. コンペ開始後すぐ `Episodes.csv` / `EpisodeAgents.csv` の日次 pull
2. LB 上位 N bot × M エピソードを DownloadEpisode API で取得
3. `kaggle-environments` で parse → 観測 tensor / 行動 token の parquet 化
4. PyTorch `IterableDataset` で学習ループに供給

## リスクと緩和

| リスク | 緩和策 |
|-------|--------|
| covariate shift | DAgger（強めのヒューリスティック expert）、or self-play 生成データを混ぜる |
| 特定 bot への overfit | 上位 N チームを混合、bot ごとのサンプル cap |
| 観測仕様の変更（コンペ途中） | 取得時の env version をメタに残し、差分吸収層 or 再学習 |
| Kaggle 推論時間制限 | モデルは小さめ（~10M param）、batch inference、C++/ONNX export 検討 |
| IL 天井に当たる | Phase 3 (MCTS) か Phase 4 (RL) へ移行 |

## TODO（着手順）

- [ ] Orbit Wars 公式仕様が確定次第、cluster 02 (game_mechanics) の観測・行動仕様を突き合わせ、Phase 1 モデルの channel / output 仕様を確定
- [ ] Episode 取得スクリプトをローカルで動作確認（Hungry Geese か Kore で dry-run）
- [ ] Phase 1 U-Net の PyTorch 実装を用意（50-100 行程度）
- [ ] 小さなリプレイセットで loss が下がることを確認
- [ ] LB にサブミットして rating 確認 → 十分強ければ Phase 2 へ

## 関連ファイル

- 模倣学習クラスタ定義: [../../clustering/latest/cluster-07-imitation-learning.md](../../clustering/latest/cluster-07-imitation-learning.md)
- 類似コンペ勝者解法: [../../clustering/latest/cluster-03-similar-competitions.md](../../clustering/latest/cluster-03-similar-competitions.md)
- ゲームメカニクス: [../../clustering/latest/cluster-02-game-mechanics.md](../../clustering/latest/cluster-02-game-mechanics.md)
