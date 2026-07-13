# Cluster 3: 自己対戦・深層強化学習・リーグ学習

**Overview**:
自己対戦（self-play）で方策ネットワークを学習し、推論時は軽量に行動を選ぶ **学習系手法** の領域。10分の時間制約に対し「重い探索を学習済み NN にオフロードする」発想で本コンペと相性が良い。PPO による自己対戦、NFSP（Neural Fictitious Self-Play）、OSFP、Deep CFR、そして DouZero（闘地主を自己対戦深層 RL で攻略）に代表される大規模行動空間 RL を含む。エージェント集団を戦わせて多様性と頑健性を確保する **リーグ学習（AlphaStar 系）** や exploitability 評価も対象。

**Keywords**:
`self-play`, `PPO`, `deep reinforcement learning CCG`, `NFSP`, `OSFP`, `Optimistic Smooth Fictitious Self-play`, `DouZero`, `ByteRL`, `league training`, `exploitability`, `sample efficiency`, `end-to-end deck+battle RL`, `policy network`, `reward shaping`

**Research Strategy**:
- **DouZero** を精読（巨大離散行動空間の闘地主を自己対戦 DMC で攻略 → カードゲームへの王道）。
- ByteRL / OSFP（LOCM 2022 SOTA、ドラフト＋対戦を統一・探索なし end-to-end）を分析（→ C6 と連携）。
- Hearthstone 向け改良 RL（"Mastering Strategy Card Game with Improved Techniques"）でサンプル効率・報酬設計のノウハウを収集。
- exploitability 論文（"Learning to Beat ByteRL"）で自己対戦 RL の弱点（搾取可能性）を把握し、対策を設計。
- 本コンペは **デッキ選択＋対戦** を1つの提出で扱うため、両者を統合する end-to-end RL（Hearthstone の card selection + gameplay 事例）が参考。

**Seed Resources**:
| タイトル | 年 | 概要 | リンク |
|---------|----|------|--------|
| DouZero: Mastering DouDizhu with Self-Play Deep RL | 2021 | 巨大行動空間カードゲームの自己対戦 DMC | https://proceedings.mlr.press/v139/zha21a/zha21a.pdf |
| Mastering Strategy Card Game (Hearthstone) with Improved Techniques | 2023 | Hearthstone 向け RL 改良技法 | https://arxiv.org/pdf/2303.05197 |
| Learning to Beat ByteRL: Exploitability of CCG Agents | 2024 | 自己対戦 RL エージェントの搾取可能性 | https://arxiv.org/html/2404.16689v1 |
| Exploring Deep RL for Battling in CCGs | 2022 | CCG 対戦への深層 RL 探索 | https://homepages.dcc.ufmg.br/~ronaldo.vieira/assets/pdf/sbgames-2022.pdf |
| Towards sample efficient deep RL in CCGs | 2023 | CCG での RL サンプル効率改善 | https://www.sciencedirect.com/science/article/abs/pii/S1875952123000496 |
| Robust Deep Monte Carlo CFR / NFSP の理論的リスク | 2025 | NFSP の理論的課題と頑健化 | https://arxiv.org/html/2509.00923v1 |
