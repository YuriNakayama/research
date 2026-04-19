# Cluster 06: 探索・ヒューリスティック (heuristic_search)

## スコープ

RL に依らない **探索アルゴリズム / ヒューリスティック / 模倣学習** を調査するクラスタ。Kaggle Simulation は計算資源・学習時間の制約が厳しく、ルールベースや MCTS が上位入賞する事例も多い。RL と組み合わせたハイブリッド構成も含む。

## 主要トピック

| トピック | 調査内容 |
|---------|---------|
| MCTS | UCT, PUCT, DMCTS, rollout policy 設計 |
| Minimax / αβ | 2P 用、bitboard 的状態圧縮 |
| ルールベース | expand priority, threat assessment, fleet routing, 軌道予測を踏まえた発射角 |
| 進化計算 | NEAT, CMA-ES, Neuroevolution of Augmenting Topologies |
| ポートフォリオ戦略 | 複数 bot の状況別切替、opening book |
| Imitation Learning | 上位 bot ログ or 人間プレイログからの BC / DAgger |
| 軌道予測 | 惑星位置の未来予測、発射タイミング計算、会合軌道 |
| ハイブリッド | RL policy を rollout として使う AlphaZero 型 |

## キーワード

- MCTS RTS game
- UCT Planet Wars
- Rule-based bot RTS
- Behavioral cloning game AI
- Neuroevolution RTS
- Orbital intercept prediction

## 想定リソース種別

- 書籍: Artificial Intelligence for Games (Millington), AI Game Programming Wisdom
- 論文: MCTS survey, PUCT, Gumbel MuZero の rollout 手法
- GitHub: MCTS 実装（open_spiel, mctx, AlphaZero-General）
- Kaggle Notebook: 過去 Simulation コンペのヒューリスティック公開 bot
- Planet Wars 軌道・intercept 数学解説

## 他クラスタとの関係

- **← planet_wars_prior_art**: 古典 Planet Wars で強かったヒューリスティックを移植
- **← game_mechanics**: 軌道予測には軌道力学の数式が必須
- **↔ rl_methods**: RL との併用（AlphaZero 型ハイブリッド、RL-warmstart → MCTS refinement）

## 優先度

**中〜高**。ベースラインとしてルールベース bot を早期に立ち上げ、RL の比較対象として保持するのが現実的。軌道予測の計算は Orbit Wars 固有の新規要素であり、独立した技術調査が必要。
