# Cluster 05: 自己対戦強化学習 (rl_methods)

## スコープ

Orbit Wars の bot を **深層強化学習 / 自己対戦** で学習するための手法・実装・インフラを調査するクラスタ。類似 Kaggle Simulation 上位勢は軒並み self-play RL を採用しており、最有力の解法候補。

## 主要トピック

| トピック | 調査内容 |
|---------|---------|
| オンポリシー RL | PPO, IMPALA, A3C の連続 2D 空間 RTS への適用 |
| 価値ベース + 探索 | AlphaZero, MuZero, Gumbel MuZero |
| Self-play schemes | Fictitious self-play, PSRO, prioritized fictitious self-play |
| League training | AlphaStar 型 main / exploiter / league exploiter 構成 |
| Population-based training | PBT, PBT-BT, CoPi |
| Reward shaping | sparse win/loss, 惑星数差分, 資源差分, curriculum |
| 観測/行動表現 | ベクトル観測 vs CNN グリッド化、Transformer entity encoder |
| Imitation / Behavioral Cloning | 上位 bot ログからの初期 warmup |
| オフライン RL | 過去 episode ログからの学習 |
| 分散学習 | Ray RLlib, Sample Factory, RLlib+League, CleanRL |

## キーワード

- PPO self-play RTS
- AlphaStar league training
- MuZero continuous action
- Kaggle Lux AI PPO
- Entity Transformer RL
- Prioritized fictitious self-play

## 想定リソース種別

- 論文: AlphaStar (Vinyals et al. 2019), MuZero, OpenAI Five, Dota2 paper, Lux AI 上位 writeup
- GitHub: CleanRL, Sample Factory, RLlib Leagues, Kaggle Lux AI 公開リポジトリ
- arXiv の最新 self-play / league training 研究
- OrbitZoo: Multi-Agent RL for Orbital Dynamics (arXiv:2504.04160)

## 他クラスタとの関係

- **← game_mechanics**: 観測/行動空間の形が学習アーキテクチャを決める
- **← similar_competitions**: Kaggle 上位解の RL レシピを転用
- **→ heuristic_search**: 学習中の opponent sampling や序盤ポリシーに heuristic を組み込む
- **→ competition_spec**: コンピュート制約が学習インフラ設計を決める

## 優先度

**高**。連続アクション + リアルタイム RTS + self-play という構図は計算コストが最大の壁。早期にコスト見積もりを立てる必要がある。
