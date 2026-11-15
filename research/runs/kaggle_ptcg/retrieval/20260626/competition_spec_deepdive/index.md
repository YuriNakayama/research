# Retrieval: competition_spec_deepdive — cabt Engine・提出最適化の技術深掘り

Kaggle「PTCG AI Battle Challenge」攻略のための **コンペ仕様・cabt Engine・提出最適化** クラスタの詳細技術レポート群。公式仕様の概要は `../20260626_competition_spec/` を参照し、本ディレクトリはエンジン内部構造・提出ロバスト性・関連先行手法を深掘りする。

- 生成日: 2026-06-26
- レポート数: 6
- gather 元: `../../gather/20260626_competition_spec/`

## レポート一覧

| # | タイトル |
|---|---------|
| [01](01-cabt-engine-api-observation-structure.md) | cabt Engine API と obs_dict (logs/current/select) 構造の完全解剖 |
| [02](02-submission-packaging-gaussian-ladder-time-budget.md) | 提出最適化: submission.tar.gz・Gaussian ラダー・10分予算とロバスト性 |
| [03](03-ismcts-information-set-monte-carlo-tree-search.md) | Information Set Monte Carlo Tree Search (ISMCTS): 不完全情報ゲームの探索基盤 |
| [04](04-ismcts-for-pokemon-ihara-2018.md) | ポケモン対戦への ISMCTS 適用 (Ihara et al. 2018): determinization vs 情報集合 |
| [05](05-lux-ai-toad-brigade-deep-rl-winning-solution.md) | Lux AI 優勝解 Toad Brigade の深層強化学習: 巨大行動空間への RL アプローチ |
| [06](06-evolutionary-deck-building-collectible-card-games.md) | 進化計算によるデッキ構築最適化: 60枚同時最適化とメタゲーム評価 |

> 注: 03/04(ISMCTS) は `imperfect_info_search` クラスタ、06(進化デッキ構築) は `deckbuilding` クラスタとも内容が重複する。横断的に参照のこと。
