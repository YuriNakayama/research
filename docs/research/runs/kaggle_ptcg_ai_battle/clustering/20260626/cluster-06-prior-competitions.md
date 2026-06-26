# Cluster 6: 先行コンペ・ベンチマークと勝者解法

**Overview**:
本コンペと構造が酷似した **先行カードゲーム AI コンペ／ベンチマークの勝者解法** を分析し、勝ち筋を直接流用する領域。LOCM（Legends of Code and Magic、ドラフト＋対戦を扱う CCG コンペ）、Hearthstone AI Competition、AAIA'17 Data Mining Challenge、PokéAgent Challenge（NeurIPS 2025、350万対戦データと rule-based/RL/LLM ベースライン提供）、DouZero（闘地主）など。各コンペの提出 I/F・評価方式・上位手法の傾向（探索 vs 学習 vs ハイブリッド）を比較し、本コンペへの移植可能性を評価する。

**Keywords**:
`LOCM`, `Legends of Code and Magic`, `Hearthstone AI Competition`, `AAIA17 Data Mining Challenge`, `PokeAgent Challenge`, `NeurIPS 2025 competition`, `ByteRL`, `DouZero benchmark`, `OpenHoldem`, `winning solution writeup`, `competition meta-strategy`, `baseline agents`, `leaderboard exploitation`

**Research Strategy**:
- **LOCM** の歴代上位解法（特に ByteRL/OSFP）を精読 — ドラフト＋対戦を1エージェントで扱う点が本コンペと最も近い。
- **PokéAgent Challenge**（NeurIPS 2025）の構成とベースライン（rule-based/RL/LLM）を分析 — ポケモン題材で最新、データセットも参照。
- Hearthstone AI Competition の上位（MCTS 系 vs RL 系の勝敗傾向）から、10分制約下の現実的な勝ち筋を抽出。
- 各コンペの「探索 vs 学習 vs ハイブリッド」の優劣傾向をまとめ、本コンペの主軸選定（C2/C3）の根拠にする。
- 既存 `kaggle_orbit_wars` の similar-competitions / kaggle-solutions クラスタの調査結果を横展開。

**Seed Resources**:
| タイトル | 年 | 概要 | リンク |
|---------|----|------|--------|
| The PokéAgent Challenge: Competitive and Long-Context Learning at Scale | 2025 | ポケモン題材の最新コンペ（350万対戦・各種ベースライン） | http://sethkarten.ai/data/NeurIPS_2025_PokeAgent_Challenge.pdf |
| Learning to Beat ByteRL（LOCM SOTA 分析） | 2024 | LOCM 2022 SOTA ByteRL の搾取 | https://arxiv.org/html/2404.16689v1 |
| Teamwork under extreme uncertainty: AI for Pokémon ranks 33rd | 2022 | ポケモン対戦 AI の実戦的設計 | https://arxiv.org/pdf/2212.13338 |
| Winning at Pokémon Random Battles Using RL (MIT thesis) | 2024 | PPO＋自己対戦＋MCTS lookahead | https://dspace.mit.edu/bitstream/handle/1721.1/153888/wang-jett-meng-eecs-2024-thesis.pdf |
| OpenHoldem: Benchmark for Large-Scale Imperfect-Info Games | 2020 | 大規模不完全情報ゲームのベンチマーク | https://arxiv.org/pdf/2012.06168 |
