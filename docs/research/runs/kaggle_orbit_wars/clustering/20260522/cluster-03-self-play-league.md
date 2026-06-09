# Cluster 3: Self-play / League Training (opponent dynamics)

## 概要

自己対戦 RL における**敵の生成・選定スケジュール**を制御する領域。Naive self-play (latest vs latest) は戦略循環 (rock-paper-scissors 振動) を起こしやすく、AlphaStar (2019) で Prioritized Fictitious Self-Play (PFSP) と League Training (main / exploiter / league-exploiter) が体系化された。2022–2025 は **MAESTRO (UED+MARL)**, **Fusion-PSRO**, **MEP (mixture-of-experts diversity)**, **LOQA / Advantage Alignment (opponent shaping)** が新潮流。Orbit Wars のように **戦術空間が広く局所最適に落ちやすい競技** では、opponent diversity の確保が最終勝率に直接効く。Lux S3 でも Boey チーム (10位) が PFSP を採用し、Frog Parade (vanilla self-play) と差別化していた。

## キーワード

`self-play`, `fictitious self-play (FSP)`, `prioritized FSP (PFSP)`, `league training`, `main agent`, `exploiter`, `league-exploiter`, `PSRO`, `Fusion-PSRO`, `MAESTRO`, `MEP`, `opponent shaping`, `LOLA`, `LOQA`, `Advantage Alignment`

## 主要論文・実装 (代表リソース)

| Title | Type | Year | Summary |
|-------|------|------|---------|
| [Grandmaster level in StarCraft II using multi-agent RL (AlphaStar)](https://www.nature.com/articles/s41586-019-1724-z) | Paper | 2019 | Vinyals et al., DeepMind, Nature。League training の出発点 |
| [A Survey on Self-play Methods in RL](https://arxiv.org/abs/2408.01072) | Survey | 2024 | THU/Peking U/Tencent。PSRO/PFSP/MAESTRO 系を統合分類 |
| [MAESTRO: Open-Ended Environment Design for MARL](https://arxiv.org/abs/2303.03376) | Paper | 2023 | Samvelyan et al. (Meta/Oxford)。「環境 × co-player」ペアを regret-based サンプリング |
| [Fusion-PSRO](https://arxiv.org/abs/2405.21027) | Paper | 2024 | Sun 他。Nash 解の policy fusion で oracle 効率改善 |
| [TLeague: A Framework for Competitive Self-Play](https://arxiv.org/abs/2011.12895) | Paper + OSS | 2020–22 | Tencent。Kubernetes ネイティブの CSP-MARL 分散フレーム |
| [A Robust and Opponent-Aware League Training for StarCraft II](https://proceedings.neurips.cc/paper_files/paper/2023/file/94796017d01c5a171bdac520c199d9ed-Paper-Conference.pdf) | Paper | NeurIPS 2023 | Huang et al. AlphaStar より遥かに低リソース、明示的 opponent modeling |
| [LOLA: Learning with Opponent-Learning Awareness](https://arxiv.org/abs/1709.04326) | Paper | 2018 | Foerster et al. 相手の学習更新を勾配に織り込む |
| [LOQA: Learning with Opponent Q-Learning Awareness](https://arxiv.org/abs/2405.01035) | Paper | 2024 | LOLA の 4 倍高速化、Q-学習相手を仮定 |
| [Advantage Alignment](https://arxiv.org/abs/2511.00811) | Paper | ICLR 2025 | LOLA を advantage 関数ベースに蒸留、極めて簡潔 |
| [MEP (Mixture-of-Experts Policy / Diversity SP)](https://arxiv.org/abs/2112.11701) | Paper | 2022 | 集団内 KL divergence の下界最大化で policy 多様性確保 |
| [Boey Lux S3 PFSP writeup (Zenn)](https://zenn.dev/kurupical/articles/61dbeedf89a29d) | Writeup | 2025 | PPO + BPTT + SelfAttention + LSTM + PFSP (latest 75% / 過去難敵 25%) |

## Orbit Wars 適用時の調査戦略

1. **最低限の naive self-play (latest vs latest) で baseline** を 1 週間
2. **frozen teacher snapshot を 1 週間ごとに更新**する**fictitious self-play** に移行 (FSP)
3. **PFSP** へ昇格: 過去 N=5–10 snapshot をプールし、現エージェントに対する勝率 p に対し `f(p) = (1-p)^2` の確率で sampling
4. **AlphaStar-lite league**: main / exploiter / league-exploiter の 3 クラス + 履歴サンプリングで頑健性
5. **LOQA / Advantage Alignment** で opponent shaping を試す (vanilla self-play で停滞時の脱出口)
6. **MAESTRO 風 UED**: 環境パラメータ (hidden rule, map seed) もペアでサンプリングし regret-based に curriculum 化

## 注目研究グループ

- **DeepMind**: AlphaStar / OpenAI Five 系の league training 本家
- **Tencent**: TLeague の分散実装 (Kubernetes)、PSRO 系研究も活発
- **Meta FAIR / Oxford FLAIR**: MAESTRO / JaxMARL の中心、UED + MARL
- **THU Peking 系**: Self-play サーベイ 2024 (arXiv 2408.01072) の著者群
- **Foerster et al. (Oxford)**: LOLA / LOQA の系譜

## 推奨読み順

1. AlphaStar Nature 論文 (league training の原典)
2. Self-play サーベイ 2024 (現状の体系化)
3. PFSP/MEP (実装しやすい opponent selection)
4. MAESTRO (UED との融合)
5. LOQA / Advantage Alignment (opponent shaping の最新)
6. Boey Lux S3 writeup (Kaggle での実適用例)

## 注意事項

- **league を回すには複数 agent の同時 GPU 保持**が必要 (各 ~10–50MB のネット × 5–20 体)。GPU メモリと throughput の trade-off を要計画
- **opponent prior の更新頻度**: 短すぎる (例: 1 epoch ごと) と学習が振動、長すぎる (例: 1 週間) と最新戦術への適応遅延。実証的に**1k–10k episodes ごと**が中庸
- **opponent shaping (LOLA/LOQA)** は計算コスト高 (相手勾配の 2 階微分)。LOQA で 4 倍緩和、Advantage Alignment でさらに軽量化
- **Kaggle submission 制約**: 提出時には main agent のみ。league 全体は学習時のみ保持

## Orbit Wars 向け推奨パス

- **段階 1**: naive self-play で baseline (Frog Parade 路線)
- **段階 2**: frozen teacher snapshot + FSP で teacher-KL 補助損失
- **段階 3**: PFSP (snapshot 5-10 体) + 上位率に応じた sampling
- **段階 4**: 戦略循環を観測したら LOQA / Advantage Alignment で opponent shaping
- **段階 5**: 計算リソースに余裕があれば AlphaStar-lite league (main + 2 exploiter)
- **段階 6**: 最終手段として MAESTRO の UED で hidden rule のカリキュラム化
