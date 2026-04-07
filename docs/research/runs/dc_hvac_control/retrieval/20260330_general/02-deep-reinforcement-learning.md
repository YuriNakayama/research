# クラスタ2: 深層強化学習 (DRL) と転移学習

## 概要

深層強化学習（DRL）は、HVAC制御における最も活発な研究領域の一つであり、環境との相互作用を通じて最適な制御ポリシーを学習する。DQN、DDPG、PPO、SAC、TD3といった各種アルゴリズムが適用され、PID制御と比較して最大26.3%のエネルギー削減が報告されている。近年はマルチエージェント強化学習（MARL）による複数ゾーンの協調制御、転移学習によるビル間のモデル汎化、継続学習による長期適応性の向上が重要な研究テーマとなっている。日本ではNTTグループとJR東日本の共同プロジェクトで50%のエネルギー削減を達成した実証事例がある。ただし、MPC同様に広範な産業採用にはまだ至っていない。

## キーワード

`Deep Reinforcement Learning (DRL)`, `深層強化学習`, `DQN`, `DDPG`, `PPO`, `SAC`, `TD3`, `Multi-Agent RL (MARL)`, `Transfer Learning`, `転移学習`, `Sim-to-real transfer`, `Reward function design`, `Continual learning`, `Expert-guided training`, `Hierarchical RL`

## 調査戦略

- **推奨検索クエリ**:
  - `"reinforcement learning" HVAC control review 2024 2025`
  - `"deep reinforcement learning" building energy optimization`
  - `"multi-agent reinforcement learning" HVAC multi-zone`
  - `"transfer learning" HVAC building control`
  - `"深層強化学習" "空調制御" 省エネ`
- **主要情報源**: arXiv, ScienceDirect (Energy and Buildings, Applied Energy), Nature Scientific Reports, Springer (Artificial Intelligence Review, Building Simulation)
- **注目研究グループ・企業**:
  - NREL（National Renewable Energy Laboratory）— マルチエージェント階層DRL
  - NTT + JR東日本 + NTTファシリティーズ — DRLベース空調制御実証（50%省エネ）
  - アラヤ (Araya Inc.) — 自律エージェントによるHVAC最適化
  - 清水建設 — AI/DRLクリーンルーム空調（輸送動力30%削減）
  - NTTドコモビジネス — AI空調制御クラウドサービス
- **推奨読解順序**:
  1. サーベイ: [RL for HVAC control in intelligent buildings (2024)](https://www.sciencedirect.com/science/article/pii/S235271022401653X)
  2. 実験評価: [Experimental evaluation of DRL algorithms for HVAC (2024)](https://link.springer.com/article/10.1007/s10462-024-10819-x)
  3. 報酬設計: [Reward function design in RL for HVAC (2025)](https://www.sciencedirect.com/science/article/pii/S0378778825011697)
  4. 実世界展開: [Lessons learned from field demonstrations of MPC and RL (2025)](https://arxiv.org/abs/2503.05022)
  5. 継続学習: [Continual RL for HVAC with Hypernetworks (2025)](https://arxiv.org/html/2503.19212v1)
  6. マルチエージェント: [Multi-agent deep RL for multi-zone buildings (2024)](https://www.sciencedirect.com/science/article/abs/pii/S0378778824013574)

## 日本の実証事例

| 組織 | 技術 | 成果 |
|------|------|------|
| NTT + JR東日本 + NTTファシリティーズ + NTTデータ | DRLベース空調制御 | PMV快適範囲維持しつつ50%省エネ |
| NTTドコモビジネス | AI空調制御クラウド | フィードフォワード制御+予測環境モデリング |
| アラヤ (Araya) | DRL自律エージェント | 快適性指標とエネルギー目標の自律最適化 |
| 清水建設 | AI+DRL (クリーンルーム空調) | 輸送動力30%削減、CFD+RL統合 |

## 性能ベンチマーク

| 指標 | 値 | 比較対象 |
|------|-----|---------|
| エネルギー削減 | 最大26.3% | PID制御 |
| 学習高速化 | 8.8倍 | ヘテロジニアス専門家ガイダンス使用時 |
| グリッド輸入削減 (MARL) | 51% | ルールベース制御 |
| 追加省エネ (フロア別報酬) | 23% | 均一報酬MARL |
| 温和気候での年間HVAC省エネ | 最大60% | セットポイント最適化 |
