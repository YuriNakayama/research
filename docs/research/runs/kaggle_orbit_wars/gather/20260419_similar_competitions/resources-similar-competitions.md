# Resources: similar_competitions

過去の Kaggle Simulation 系コンペで **上位入賞した解法** を収集。提出 I/F や評価方式が Orbit Wars とほぼ共通のため、設計判断を短絡できる。

## Kore 2022（艦隊運用 RTS — メカニクス最類似）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | Kore 2022 — コンペページ | https://www.kaggle.com/competitions/kore-2022 | Kaggle | 2v2 艦隊 RTS。艦隊分割・ルート・fleet speed が Orbit Wars と酷似 |
| 2 | **1st place — Harm Buisman writeup** | https://www.kaggle.com/competitions/kore-2022/writeups/harm-buisman-1st-place-solution | Writeup | 公式 1 位解法 |
| 3 | Kore 2022 — autoregressive imitation learning | https://github.com/khanhvu207/kore2022 | GitHub | imitation + 自作 rollout |
| 4 | Kore 2022 Match Analysis | https://www.kaggle.com/huikang/kore-2022-match-analysis | Notebook | 上位試合の戦略分析 |
| 5 | Kore 2022 Feature Generator | https://www.kaggle.com/code/huikang/kore-2022-feature-generator | Notebook | 観測→特徴抽出の実装例 |
| 6 | Kore 2022 Beta | https://www.kaggle.com/competitions/kore-2022-beta | Kaggle | ベータ版。ルール変遷の参考 |

## Lux AI Season 2（資源 RTS — PPO+League の教科書）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 7 | Lux AI Season 2 コンペ | https://www.kaggle.com/competitions/lux-ai-season-2 | Kaggle | 646 teams / NeurIPS 2023 併催 |
| 8 | **1st place — ryandy/Lux-S2-public** | https://github.com/ryandy/Lux-S2-public | GitHub | 1st place コード + 解説 |
| 9 | Lux-Design-S2 公式 | https://github.com/Lux-AI-Challenge/Lux-Design-S2 | GitHub | ゲームエンジン・環境ラッパー |
| 10 | PPO Self-play baseline | https://www.kaggle.com/competitions/lux-ai-season-2/discussion/406791 | Discussion | PPO 実装の雛形 |
| 11 | Lux AI 公式サイト | https://www.lux-ai.org/ | Website | シーズン共通ドキュメント |
| 12 | 19th place solution (shmyak-ai) | https://github.com/shmyak-ai/lux-ai | GitHub | 中位解の実装、RL 学習ループ参考 |
| 13 | LuxPythonEnvGym | https://github.com/glmcdona/LuxPythonEnvGym | GitHub | Gym I/F ラッパー。Kaggle → RL ライブラリ橋渡し |

## Halite IV (2020)（連続マップ RTS — imitation の王道）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 14 | Halite by Two Sigma | https://www.kaggle.com/c/halite | Kaggle | 資源採取 + 艦船移動 RTS |
| 15 | **1st place — ttvand/Halite** | https://github.com/ttvand/Halite | GitHub | 1st: rule-based core + DL agent のハイブリッド |
| 16 | Halite IV discussion 183312 | https://www.kaggle.com/c/halite/discussion/183312 | Discussion | 上位解まとめ |
| 17 | Imitation Learning by Semantic Segmentation (KhaVo 8位) | https://voanhkha.github.io/2020/09/15/halite/ | Blog | 画像 CNN を盤面に適用。観測表現の参考 |
| 18 | Halite IV DQN example | https://www.kaggle.com/hsperr/halite-iv-dqn-example-pytorch | Notebook | DQN ベースライン |
| 19 | Halite RL challenge | https://www.kaggle.com/tiger37/reinforcement-learning-meets-halite | Notebook | RL 入門 |
| 20 | HaliteIV-Bot (4th place) | https://github.com/0Zeta/HaliteIV-Bot | GitHub | 4位 rule-based + ML |

## Hungry Geese (2021)（グリッドサバイバル — MCTS + BC）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 21 | Hungry Geese コンペ | https://www.kaggle.com/competitions/hungry-geese | Kaggle | 4人対戦 スネーク系 |
| 22 | Hungry Geese engine | https://github.com/Kaggle/kaggle-environments/blob/master/kaggle_environments/envs/hungry_geese/hungry_geese.py | Source | 同 kaggle-environments 内 |
| 23 | alpha-zero-hungry-geese | https://github.com/yonsweng/alpha-zero-hungry-geese | GitHub | AlphaZero PyTorch 実装 |
| 24 | Using HandyRL for Hungry Geese | https://www.kaggle.com/code/avikdas2021/using-handyrl-for-hungry-geese/output | Notebook | HandyRL (DeNA) 適用例 |
| 25 | Kaggle Hungry Geese (speakerdeck) | https://speakerdeck.com/hoxomaxwell/kaggle-hungry-geese | Slides | 日本語上位解説 |
| 26 | An Exploration of Deep Learning Methods in Hungry Geese | https://www.researchgate.net/publication/354400710 | 論文 | DL 手法比較 |

## ConnectX（Bitboard + 探索の王道）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 27 | ConnectX コンペ | https://www.kaggle.com/c/connectx | Kaggle | 四目並べ |
| 28 | AlphaZero ConnectX | https://www.kaggle.com/code/miichaaeel/alphazero-connectx | Notebook | AlphaZero 実装 |
| 29 | AlphaZero baseline (PaddlePaddle PARL) | https://github.com/PaddlePaddle/PARL/pull/282 | PR | スコア 1368 |
| 30 | A More Useful Negamax Opponent | https://www.kaggle.com/code/hubcity/a-more-useful-negamax-opponent-connectx | Notebook | Negamax 強化 |
| 31 | ConnectX rule-based + negamax | https://www.kaggle.com/code/domcastro/connectx-rule-based-easy-solution-or-negamax | Notebook | ルール+探索 |

## Lux AI Season 1 & 3（補助）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 32 | lux_ai_2021 env | https://github.com/Kaggle/kaggle-environments/tree/master/kaggle_environments/envs/lux_ai_2021 | Source | Season 1 環境 |
| 33 | lux_ai_s3 env | https://github.com/Kaggle/kaggle-environments/tree/master/kaggle_environments/envs/lux_ai_s3 | Source | Season 3 |

## Kaggle Simulation 共通インフラ

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 34 | kaggle-environments | https://github.com/Kaggle/kaggle-environments | GitHub | `env.run` / `env.render` / agent loading |
| 35 | kaggle-simulations-lab | https://github.com/0xd3ba/kaggle-simulations-lab | GitHub | 各環境で RL を試すための GUI |
| 36 | Winning solutions of kaggle competitions | https://www.kaggle.com/code/sudalairajkumar/winning-solutions-of-kaggle-competitions | Notebook | 横断まとめ |

## 優先度（retrieval フェーズでの推奨順）

1. **Kore 2022 Harm Buisman 1位 writeup** — メカニクス最類似、必読
2. **Lux S2 ryandy/Lux-S2-public** — self-play PPO の実戦コード
3. **Halite IV ttvand/Halite** — rule-based + DL のハイブリッド設計
4. Hungry Geese AlphaZero / HandyRL — MCTS + BC
5. ConnectX AlphaZero — self-play 入門ベースライン
