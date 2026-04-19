# Heuristic Search for Orbit Wars

## このディレクトリの目的

RL 非依存（あるいは RL とのハイブリッド）な **探索・ヒューリスティック** 手法を Orbit Wars 向けに整理。1 秒 actTimeout 下で現実的なベースライン・併走戦略を構築するために必要。

## 手法比較マトリクス

| 手法 | 強さ | 実装難度 | 時間予算 | Orbit Wars 適合 |
|------|------|----------|----------|-----------------|
| **Rule v1 (greedy + intercept)** | ★★ | ★ | 0.1s | ★★★★★ |
| **Rule v2 (missions + opponent model)** | ★★★ | ★★ | 0.2s | ★★★★★ |
| **RHEA (horizon 10)** | ★★★★ | ★★ | 0.5s | ★★★★★ |
| **NaïveMCTS** | ★★★★ | ★★★ | 0.8s | ★★★★ |
| **MCTS (UCT)** | ★★★ | ★★ | 0.8s | ★★ (巨大分岐) |
| **Negamax + αβ** | ★★ | ★★★ | 0.5s | ★ (連続困難) |
| **Gumbel MCTS** | ★★★★★ | ★★★★ | 0.8s | ★★★★ (NN 依存) |

## 推奨ルート

```
Phase 1: Rule v1 (1 週間)
  ↓
Phase 2: Rule v2 + RHEA ハイブリッド (1 週間)
  ↓
Phase 3: NaïveMCTS 併用 (1 週間)
  ↓
Phase 4: NN 統合 (RL 方面)
```

Rule v2 + RHEA の段階で **ELO 中位** (Kaggle スコア +500〜+700) 到達可能。

## 収録ファイル

1. [01-mcts-naivesampling.md](01-mcts-naivesampling.md) — NaïveMCTS と combinatorial bandit
2. [02-rhea-for-rts.md](02-rhea-for-rts.md) — Rolling Horizon Evolution 詳説
3. [03-intercept-solver.md](03-intercept-solver.md) — 軌道惑星 intercept 数値解法
4. [04-action-pruning.md](04-action-pruning.md) — 行動事前絞り込み戦略
5. [05-integrated-agent-v2.md](05-integrated-agent-v2.md) — Rule v2 統合エージェント完全実装
