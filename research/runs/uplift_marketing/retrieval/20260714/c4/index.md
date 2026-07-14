# C4 詳細レポート索引: 逐次実験・warm-start による施策連結

- **Cluster**: C4 — Sequential / Warm-start Decision-making
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **上流**: `gather/20260714_c4/resources-sequential-warm-start.md`

## テーマ

疎な施策列を逐次意思決定として繋ぐ。過去施策ログでwarm-start、長期効果はsurrogate indexで短期proxyから補間。

## レポート一覧

| # | ファイル | タイトル | 一言 |
|---|---------|---------|------|
| 1 | [01-surrogate-index.md](01-surrogate-index.md) | The Surrogate Index | 複数の短期proxyを1指標に統合しPrentice仮定下で長期効果を早期推定。「長期購買効果を短期proxyで推定」に直結 |
| 2 | [02-warm-start-bandits.md](02-warm-start-bandits.md) | Warm-Start Contextual Bandits | 過去bandit/教師あり/専門家知識をLinTSの事前分布に注入しcold-start解消。「過去施策logでwarm-start」に最直結 |
| 3 | [03-budget-constrained-causal-bandits.md](03-budget-constrained-causal-bandits.md) | Budget-Constrained Causal Bandits | 予算制約下でupliftをオンライン学習し1人ずつ逐次配分、過去データ不要でTSを上回る |
| 4 | [04-artificial-replay.md](04-artificial-replay.md) | Artificial Replay | 過去ログを一括初期化せず必要時にリプレイ消費し不均衡カバレッジに頑健。偏ったログを安全に活用 |

## ユーザー課題への総括

各施策を「前施策の事前分布を引き継ぐ逐次ステップ」として設計すれば施策間隔の長さを緩和できる。手順: (1) レポート2/4で**過去施策logからwarm-start**（偏りが強いログはArtificial Replayが安全）→ (2) レポート1のsurrogate indexで**長期購買効果を短期反応から早期推定**し次施策を待たず学習更新 → (3) レポート3で予算制約下のuplift配分を逐次最適化。C1（多数実験のpooling）と接続し施策プログラム全体を最適化する上位視点。
