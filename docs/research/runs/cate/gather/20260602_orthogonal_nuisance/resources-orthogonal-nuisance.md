# C1 直交学習・nuisance 推定改善 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2017 – 2026（基礎論文含む / 直近4年優先）
- **収集日**: 2026-06-02
- **入力元**: clustering 結果 `docs/research/runs/cate/clustering/20260602/cluster-01-orthogonal-nuisance.md`

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 11 |
| 検証済み | 11 |
| 除外 | 0 |

全エントリは WebFetch で arXiv abstract ページのタイトル一致を確認済み。

## 全体の傾向

DR-learner / R-learner の核となる Neyman 直交性と cross-fitting（DML）の基礎理論（Nie & Wager, Chernozhukov, Foster & Syrgkanis, Kennedy）が確立され、2025-2026 年は Feuerriegel グループを中心に **直交性を生存時間・生成モデル・時系列・ランキングへ拡張** する研究が活発。重み付き直交学習（weighted orthogonal learner）が DR/R-learner を統一的に包含する視点が定着しつつある。

---

## 学術論文

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 1 | [Quasi-Oracle Estimation of Heterogeneous Treatment Effects](https://arxiv.org/abs/1712.04912) | Nie, Wager | 2017 | arXiv / Biometrika | R-learner 原論文。周辺効果と傾向スコアを先に推定し直交損失を最適化、nuisance 不正確でも quasi-oracle 誤差を達成 |
| 2 | [Double/Debiased Machine Learning for Treatment and Causal Parameters](https://arxiv.org/abs/1608.00060) | Chernozhukov et al. | 2016 | arXiv / Econometrics J. | DML 基礎論文。Neyman 直交スコア + cross-fitting で正則化バイアスを除去し √n 一致推定 |
| 3 | [Double/Debiased/Neyman Machine Learning of Treatment Effects](https://arxiv.org/abs/1701.08687) | Chernozhukov et al. | 2017 | arXiv / AER P&P | DML を ATE/ATTE 推定に応用した簡潔版 |
| 4 | [Orthogonal Statistical Learning](https://arxiv.org/abs/1901.09036) | Foster, Syrgkanis | 2019 | arXiv / Annals of Statistics | 直交統計学習の理論基盤。nuisance 誤差が超過リスクに二次の影響しか与えない条件を確立 |
| 5 | [Towards Optimal Doubly Robust Estimation of Heterogeneous Causal Effects](https://arxiv.org/abs/2004.14497) | Kennedy | 2020 | arXiv / EJS 2023 | DR-learner の理論精緻化。モデルフリー誤差限界とオラクル効率の十分条件を提示 |
| 6 | [Orthogonal Statistical Learning with Self-Concordant Loss](https://arxiv.org/abs/2205.00350) | Liu, Cinelli, Harchaoui | 2022 | arXiv / COLT 2022 | 自己一致損失で次元因子を除去し強凸性要件を緩和した直交学習の非漸近限界 |
| 7 | [On Weighted Orthogonal Learners for Heterogeneous Treatment Effects](https://arxiv.org/abs/2303.12687) | Morzywolek, Decruyenaere, Vansteelandt | 2023 | arXiv / Statistical Science | DR/R-learner を重み付き直交学習器の特殊例として統一し優劣条件を明確化 |
| 8 | [Orthogonal Survival Learners for Estimating HTE from Time-to-Event Data](https://arxiv.org/abs/2505.13072) | Frauen, Schröder, Hess, Feuerriegel | 2025 | arXiv | 打ち切り生存データ向け直交学習器。低オーバーラップ対処の重み付けとモデル非依存性 |
| 9 | [GDR-learners: Orthogonal Learning of Generative Models for Potential Outcomes](https://arxiv.org/abs/2509.22953) | Melnychuk, Feuerriegel | 2025 | arXiv | 潜在結果の条件付き分布を推定する生成的二重頑健学習器。深層生成モデルに quasi-oracle 効率を付与 |
| 10 | [Overlap-weighted Orthogonal Meta-learner for Treatment Effect Estimation over Time](https://arxiv.org/abs/2510.19643) | Hess, Frauen, van der Schaar, Feuerriegel | 2025 | arXiv | 時系列でのオーバーラップ崩壊に対処する重み付き直交メタ学習器 |
| 11 | [Rank-Learner: Orthogonal Ranking of Treatment Effects](https://arxiv.org/abs/2602.03517) | Arno, Frauen, Javurek, Demeester, Feuerriegel | 2026 | arXiv | CATE を陽に推定せずペアワイズ目的で処置効果順序を直接学習、nuisance 誤差に頑健 |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査
