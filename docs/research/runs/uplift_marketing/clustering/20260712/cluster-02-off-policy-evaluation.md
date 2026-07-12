# Cluster 2: オフ方策評価 (OPE) / 反実仮想学習

**Overview**:
本クラスタは、ログとして残る「実際に配信した施策とその結果」だけを用いて、まだ配信していない新しい方策（クーポン/メールの出し分けルールや推薦モデル）の性能を A/B テストなしにオフラインで推定・最適化する反実仮想機械学習の領域である。中核は IPS を起点に、バイアスと分散のトレードオフを制御する DR・SNIPS・Switch-DR・DRos などの推定量群と、行動空間が巨大な場合に埋め込みで分散を抑える MIPS 系の発展であり、ZOZO の Open Bandit Dataset/Pipeline が実データ・実装の事実上の標準を提供する。マーケティング実務では、Mercari のクーポン配布方策評価のように「決定的方策・欠損サポート・複数ロガー」といった現場固有の難所への対応が実用化の鍵となる。数ヶ月に一度の施策も「方策の出し分け」と捉えれば、過去ログから次の方策を評価でき、A/B コストと待ち時間を削減できる。

**Keywords**:
`Off-Policy Evaluation (OPE)`, `Off-Policy Learning (OPL)`, `反実仮想機械学習 (Counterfactual ML)`, `Inverse Propensity Score (IPS)`, `Doubly Robust (DR)`, `SNIPS (Self-Normalized IPS)`, `Direct Method (DM)`, `Switch-DR`, `DRos (optimistic shrinkage)`, `Marginalized IPS (MIPS)`, `Contextual Bandits`, `Large Action Space`, `Deficient Support`, `Open Bandit Pipeline (OBP) / Dataset`, `Coupon Targeting / Incentive Allocation`

**Research Strategy**:
- 入口は survey #1/#2（Saito & Joachims のチュートリアル）で IPS/DR/DM の全体像を掴む。
- 実装は #3（OBP/OBD）で `IPS → DR → DRos → MIPS` を同一データで比較するのが実務的定石。
- クーポン/メールは行動数が多くなりがちなので #4（MIPS）#5（OffCEM）#10（MDR）の large action space 系を重視。
- 現場固有の難所（決定的方策・欠損サポート）は #7（Mercari クーポン実運用）が直接の手本。
- ランキング/スレート配信なら #8（Cascade DR）#9（AIPS）。
- 主要研究者/グループ: Yuta Saito・Thorsten Joachims、Haruka Kiyohara、Yusuke Narita（Mercari）、ZOZO Research。

**Representative Resources**:

| # | Title | Type | Year | Summary | Link |
|---|-------|------|------|---------|------|
| 1 | Counterfactual Learning and Evaluation for Recommender Systems [SURVEY] | Tutorial | 2021 | IPS/DR/DM から実装・最新手法までを推薦文脈で体系化。分野の入口 | https://usait0.com/en/publication/proposals/recsys2021-2/ |
| 2 | Counterfactual Evaluation and Learning for Interactive Systems [SURVEY] | Tutorial | 2022 | 産業応用寄り拡張版。OPE/OPL 適用手順と落とし穴を整理 | https://usait0.com/en/publication/proposals/kdd2022-2/ |
| 3 | Open Bandit Dataset and Pipeline | Paper/OSS | 2021 | ZOZOTOWN の実運用ログ(OBD)＋Python 実装(OBP)。再現可能な OPE 比較の標準基盤 | https://arxiv.org/abs/2008.07146 |
| 4 | Off-Policy Evaluation for Large Action Spaces via Embeddings (MIPS) | Paper | 2022 | 行動埋め込みで重要度重みを周辺化し、大規模カタログで IPS の分散爆発を緩和 | https://arxiv.org/abs/2202.06317 |
| 5 | Off-Policy Evaluation via Conjunct Effect Modeling (OffCEM) | Paper | 2023 | 報酬をクラスタ効果＋残差効果に分解し MIPS のバイアスを抑えた DR 系推定量 | https://arxiv.org/pdf/2305.08062 |
| 6 | Doubly Robust OPE with Shrinkage (DRos / DR-λ) | Paper | 2020 | MSE 上界を直接最小化する重みで DR の分散を制御。実務で使いやすい | https://arxiv.org/pdf/1907.09623 |
| 7 | OPE with General Logging Policies: Implementation at Mercari | Paper/Case | 2022 | 決定的/欠損サポート方策も扱う OPE で Mercari のクーポン配布方策を評価・改善 | https://www.rieti.go.jp/jp/publications/dp/22e097.pdf |
| 8 | DR OPE for Ranking Policies under Cascade Behavior Model | Paper | 2022 | カスケード閲覧を仮定しスレート/ランキング向けに IPS の分散を抑える DR | https://arxiv.org/pdf/2202.01562 |
| 9 | OPE of Ranking Policies under Diverse User Behavior (AIPS) | Paper | 2023 | 多様なユーザ行動が混在するランキング評価向けの適応的 IPS | https://dl.acm.org/doi/10.1145/3580305.3599447 |
| 10 | DR Estimator for OPE with Large Action Spaces (MDR) | Paper | 2023 | MIPS を DR 化し大規模行動空間で不偏かつ低分散を狙う | https://arxiv.org/pdf/2308.03443 |
| 11 | Optimal Baseline Corrections for Off-Policy Contextual Bandits | Paper | 2024 | SNIPS 含む分散削減をベースライン補正として統一し最適補正を導出 | https://arxiv.org/html/2405.05736v1 |

> クーポン/メール最適化の実装フロー: まず #3 OBP で IPS→DR→DRos→MIPS を比較し、#6/#7 の分散制御・欠損サポート対応を組み込む。
