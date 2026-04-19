# Cluster 03: 類似 Kaggle Simulation コンペ (similar_competitions)

## スコープ

Kaggle が過去に開催した **Simulation 系コンペ** の勝者解法・上位解法・ベースラインを調査するクラスタ。提出形式・エージェント設計パターン・評価メカニズムがほぼ共通しているため、ここでの知見は直接転用できる。

## 主要トピック

| トピック | 調査内容 |
|---------|---------|
| ConnectX | 四目並べ。AlphaZero 的自己対戦 vs Minimax/bitboard の勝敗事例 |
| Halite IV (2020) | 資源採取 RTS。上位解法の RL / Imitation Learning |
| Hungry Geese (2021) | グリッドサバイバル。探索 + ヒューリスティック上位解 |
| Lux AI Season 1/2 | 資源管理 RTS。PPO + League / Rule-based 上位解 |
| Kore 2022 | 艦隊戦略。MCTS + imitation + self-play |
| Santa 2021–2024 | 組合せ最適化系（Orbit Wars とは毛色が異なるが提出パイプラインが参考） |
| `kaggle-environments` 共通 | Episode 進行、エラー処理、ローカル対戦、RL 学習ループ統合 |

## キーワード

- Kaggle Simulation winner solution
- Lux AI 1st place
- Halite IV top solution
- Kore 2022 winning approach
- `kaggle-environments` agent
- Self-play league Kaggle

## 想定リソース種別

- Kaggle Discussion「1st place solution」「X place writeup」投稿
- 勝者の GitHub リポジトリ（学習コード・推論コード）
- 関連ブログ記事（Deepmind, Weights & Biases, 個人ブログ）
- YouTube 動画（Kaggle Grandmaster 解説）

## 他クラスタとの関係

- **→ rl_methods / heuristic_search**: 上位解法から「実戦で勝った手法」を抽出し、cluster 05/06 の手法優先度付けに使う
- **→ competition_spec**: 提出形式・コンピュート制約が類似コンペと同じ前提なら、設計判断を短絡できる

## 優先度

**中〜高**。Orbit Wars 固有仕様が固まり次第、直近の Lux AI Season 2 と Kore 2022 の上位解を優先して詳細化する。

## 特に優先すべきコンペ

1. **Lux AI Season 2** — 連続的な資源管理 RTS、PPO + league が主流。Orbit Wars と行動空間が近い可能性大
2. **Kore 2022** — 艦隊分割・ルート指示。Orbit Wars の「艦隊派遣」とメカニクス類似
3. **Halite IV** — RTS / 資源。上位解の RL 学習設計が参考
