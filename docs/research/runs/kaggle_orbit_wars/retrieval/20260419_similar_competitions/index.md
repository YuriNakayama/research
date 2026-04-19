# 類似 Kaggle Simulation コンペ 上位解法リファレンス

## このディレクトリの目的

Orbit Wars は Kaggle Simulation シリーズの新コンペで、提出 I/F・評価方式・マッチメイキング (TrueSkill ベース) は過去コンペと同一。**過去の上位解法は即そのまま転用できるビルディングブロックの宝庫**。ここでは 5 つの親類コンペごとに、上位解法の「どこを採用できるか」を抽出する。

## 親類コンペ比較マトリクス

| コンペ | 年 | 参加数 | 類似度 | 主要テクニック | Orbit Wars への転用度 |
|--------|----|--------|--------|----------------|----------------------|
| **Kore 2022** | 2022 | 1,006 | ★★★★★ | Rule-based + 艦隊スケジューリング、限定 RL | 艦隊運用・ルート計算をほぼ流用可 |
| **Lux AI Season 2** | 2023 | 646 | ★★★★☆ | PPO + League、Imitation Learning | Self-play 学習設計の教科書 |
| **Halite IV** | 2020 | 1,139 | ★★★★☆ | Rule-based コア + DL 補助、CNN 観測 | ハイブリッド設計の典型 |
| **Hungry Geese** | 2021 | 875 | ★★★☆☆ | AlphaZero、HandyRL、BC | 4人対戦 + TrueSkill マッチの参考 |
| **ConnectX** | 継続 | 継続 | ★★☆☆☆ | Negamax、AlphaZero | Self-play ベースライン |

## 重要な共通パターン（全 1 位解法の交差分析）

### A. Rule-based コア + ML 加速（4/5 コンペで 1 位採用）

- Halite IV (ttvand), Kore 2022 (Harm Buisman), Lux S1 (Toad Brigade) はいずれも **ルールベース** が主戦場
- ML は「評価関数近似」「opponent modeling」に限定活用
- **理由**: 1 秒時制約、観測が離散（惑星 ID, fleet ID）、デバッグ容易性

### B. Imitation Learning warmup（3/5 で採用）

- 自作 rule-based で数千試合 → policy network に supervised で模倣 → PPO fine-tune
- Lux S2 1位 ryandy, Kore 2022 khanhvu207 が採用
- **Orbit Wars でも starter_agent + 強化 rule → BC → PPO の 3 段が王道**

### C. League Training（Lux S2 のみ 1 位で明示採用）

- 過去世代エージェントを prioritized sampling で対戦
- Lux S2 1位 ryandy は main / exploiter / league の 3 種を継続育成
- **Orbit Wars のような 2v2 対戦では prioritized fictitious self-play が最適**

### D. 観測の非スパース化

- Halite IV KhaVo 8位: **CNN セマンティックセグメンテーション** 入力（盤面を画像化）
- Kore 2022 Harm Buisman: **entity-level encoding** + pair attention
- **Orbit Wars は可変個の Planet/Fleet なので Entity Transformer が自然**

### E. Time Budget 分割戦略

- 1 秒 actTimeout + overage を超えないよう **per-turn budget** を管理
- Kore 1位は 0.2 秒で rule eval、0.8 秒で MCTS rollouts
- **Orbit Wars は actTimeout=1s 厳守（spec.json 確認済み）**

## 収録ファイル

1. [01-kore-2022-harm-buisman-1st.md](01-kore-2022-harm-buisman-1st.md) — Kore 2022 1位 Harm Buisman 解法
2. [02-lux-s2-ryandy-1st.md](02-lux-s2-ryandy-1st.md) — Lux S2 1位 ryandy 解法
3. [03-halite-iv-ttvand-1st.md](03-halite-iv-ttvand-1st.md) — Halite IV 1位 ttvand 解法
4. [04-hungry-geese-top-approaches.md](04-hungry-geese-top-approaches.md) — Hungry Geese 上位解法総覧
5. [05-connectx-alphazero.md](05-connectx-alphazero.md) — ConnectX AlphaZero 参考
6. [06-transferable-patterns.md](06-transferable-patterns.md) — Orbit Wars 向け転用テンプレ

## 優先度

1位 writeup（Kore/Lux S2/Halite IV）は **必読** だが、**6 番の transferable patterns** から逆引きで読むのが効率的。
