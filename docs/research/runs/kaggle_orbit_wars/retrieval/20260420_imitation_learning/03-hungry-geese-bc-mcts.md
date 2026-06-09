# Hungry Geese — Behavior Cloning + MCTS ハイブリッド

## 基本情報

- **コンペ**: [Kaggle Hungry Geese](https://www.kaggle.com/competitions/hungry-geese)
- **分析対象**: 3rd place solution (Maxwell) — BC + MCTS
- **1st place**: HandyRL (DeNA) — 分散 RL フレームワーク（IL 要素を含むが RL 比重大）
- **writeup**: https://speakerdeck.com/hoxomaxwell/kaggle-hungry-geese
- **HandyRL**: https://github.com/DeNA/HandyRL

## 3rd place (Maxwell) 解法の詳細

### ネットワーク

- **ResNet 8 層 × 46 チャネル** の Policy/Value dual head
- 入力特徴量: 20 特徴（17 base + floodFill 結果 + 食物関連 + 敵の尻尾位置）

### データ収集

- **Meta Kaggle Episodes** から **LB スコア > 1200** のエピソードを scrape
- **自作 MCTS エージェント**で生成したエピソードも追加
- 評価プロセス中に生まれたエピソードも再利用（self-play 的 data aggregation）

### 学習ハイパーパラメータ

| 項目 | 値 |
|------|---|
| `forward_steps` | 12 → 72 → 12 （rampup/rampdown） |
| `gamma` | 0.8 または 0.97 |
| Entropy regularization | 2.0e-3（0.3 decay） |
| Policy/Value target | UPGO → V-trace へ遷移 |
| メイン GPU | vast.ai の A100 + 16 CPU |
| エピソード生成 | 12× GTX 1080 Ti |

### MCTS 統合

- 公開 kernel ベース
- バッチ推論化（1 ルートから複数ノードを同時展開）と時間制限最適化を追加
- BC 方策を MCTS の **prior** として使用（AlphaZero 型 PUCT）

## 要所

1. **BC policy を MCTS の prior として使う**のは Hungry Geese で繰り返し成功したパターン。単体 BC より明らかに強く、かつ推論が MCTS の rollout 上で高速化できる。
2. **LB スコア閾値でリプレイを足切り**することで、弱い bot の真似を避ける。Orbit Wars でも LB 上位数十 bot のみに絞るのが定石。
3. **forward_steps を rampup/rampdown** するスケジュールは value target の分散抑制に効いている。

## HandyRL（1st place フレームワーク）補足

- DeNA 製の分散 RL フレーム
- policy-gradient + importance sampling + population ベースで多様性確保
- BC 単独ではなく、IL をスキャフォールドに RL で超える設計
- Hungry Geese 以外の Kaggle Simulation（Lux AI 等）でも公式プラグインが存在

## Orbit Wars への示唆

- Day 1 ベースライン: **BC 単体 ResNet**（cluster 04 の Halite 流儀を参考）
- Day 7–14: **BC policy + MCTS (or 浅い minimax)** のハイブリッド
- Day 21+: HandyRL 相当の **BC warm-start → distributed PG** で上位狙い
- forward_steps を動的に変えるテクニックは Orbit Wars の長いホライズン（軌道遷移タイムスケール）にもそのまま効く

## 参考文献

- Maxwell, "Kaggle Hungry Geese" (Speaker Deck): https://speakerdeck.com/hoxomaxwell/kaggle-hungry-geese
- DeNA/HandyRL: https://github.com/DeNA/HandyRL
- Li et al., "An Exploration of Deep RL Methods with Hungry Geese": https://arxiv.org/pdf/2109.01954
