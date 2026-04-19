# RL 手法の Orbit Wars への適用

## このディレクトリの目的

Orbit Wars で **上位 10 位以内** を狙うには、rule-based を超えて **自己対戦深層強化学習** が必要。ここでは AlphaStar、AlphaZero、Gumbel MuZero、PPO などの手法を Orbit Wars 向けに整理する。

## 主要手法比較

| 手法 | 強さ | 計算コスト | 実装難度 | Orbit Wars 適合度 |
|------|------|-----------|----------|-------------------|
| **PPO + PFSP** | ★★★★ | 中 | 中 | ★★★★★ (第一候補) |
| **AlphaStar league** | ★★★★★ | 極大 | 高 | ★★★☆☆ (4P 対応未確立) |
| **Gumbel MuZero** | ★★★★ | 大 | 高 | ★★★★☆ (組合せ action に強い) |
| **AlphaZero MCTS** | ★★★☆ | 中 | 中 | ★★★☆☆ (連続角度に難) |
| **HandyRL V-trace** | ★★★☆ | 中 | 低 | ★★★★☆ (Kaggle 実績) |
| **Imitation + RL fine-tune** | ★★★☆ | 小 | 低 | ★★★★★ (warmup の王道) |

## 推奨ルート

1. **IL warmup** (rule-based → BC) で policy を初期化
2. **PPO self-play** 100k 試合で baseline
3. **PFSP (Prioritized Fictitious Self-play)** で多様性確保
4. 時間余れば **AlphaStar league** or **Gumbel MuZero** へ拡張

## 収録ファイル

1. [01-alphastar-league-training.md](01-alphastar-league-training.md) — AlphaStar Nature 論文 + league 詳細
2. [02-gumbel-muzero.md](02-gumbel-muzero.md) — Gumbel MuZero の Orbit Wars 適用
3. [03-ppo-implementation-details.md](03-ppo-implementation-details.md) — PPO 37 implementation details
4. [04-entity-transformer-for-rts.md](04-entity-transformer-for-rts.md) — Entity Transformer 観測設計
5. [05-microrts-lessons.md](05-microrts-lessons.md) — MicroRTS 2024 winner の知見
6. [06-reward-shaping-and-curriculum.md](06-reward-shaping-and-curriculum.md) — Orbit Wars 向け報酬設計
