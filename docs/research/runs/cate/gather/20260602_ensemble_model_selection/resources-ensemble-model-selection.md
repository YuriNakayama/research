# C2 アンサンブル・モデル選択・CATE 専用バリデーション — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2019 – 2025（直近4年優先）
- **収集日**: 2026-06-02
- **入力元**: clustering 結果 `docs/research/runs/cate/clustering/20260602/cluster-02-ensemble-model-selection.md`

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 13 |
| 検証済み | 13 |
| 除外 | 0 |

全エントリは WebFetch で arXiv abstract ページのタイトル一致を確認済み。

## 全体の傾向

「ground-truth が観測できない」CATE 推定で **どの推定器を選ぶか** は独立した研究テーマとして成熟。Counterfactual Cross-Validation（Saito & Yasui）以降、Tau-risk・RATE/AUTOC（Wager グループ）・Causal Q-Aggregation（Syrgkanis グループ）など理論保証付きのモデル選択指標が整備された。同時に **大規模ベンチマークでは多くの推定器が零効果予測器に劣る**（Yu & Sun 2024）という警鐘もあり、モデル選択の実務的重要性が裏付けられている。アンサンブル（Stacked X-Learner, CBA, causal rule ensemble）も精度・安定性向上の有力アプローチ。

---

## 学術論文

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 1 | [Counterfactual Cross-Validation: Stable Model Selection Procedure for Causal Inference Models](https://arxiv.org/abs/1909.05299) | Saito, Yasui | 2019 | ICML 2020 | CATE 推定器のモデル選択を「性能順位の保存」で定式化、ground-truth 無しの安定選択を実現 |
| 2 | [Causal Rule Ensemble: Interpretable Discovery and Inference of HTE](https://arxiv.org/abs/2009.09036) | Bargagli-Stoffi, Cadei, Lee, Dominici | 2020 | arXiv | 決定ルール分解に基づく CRE。因果フォレスト並み精度で解釈可能に HTE 構造を発見 |
| 3 | [Evaluating Treatment Prioritization Rules via Rank-Weighted Average Treatment Effects](https://arxiv.org/abs/2111.07966) | Yadlowsky, Fleming, Shah, Brunskill, Wager | 2021 | JASA 2025 | RATE（Qini/AUTOC を包含）で処置優先ルールを比較・検定、CLT による厳密推論 |
| 4 | [HTE Estimation for Observational Data using Model-based Forests](https://arxiv.org/abs/2210.02836) | Dandl, Bender, Hothorn | 2022 | arXiv | model-based forests を観察データに拡張、Robinson 直交化で交絡下も同時推定 |
| 5 | [What Makes Forest-Based Heterogeneous Treatment Effect Estimators Work?](https://arxiv.org/abs/2206.10323) | Dandl, Hothorn, Seibold, Sverdrup, Wager, Zeileis | 2022 | AOAS 2024 | causal/model-based forests を統一分析、傾向スコアによる局所中心化が性能の主要因と特定 |
| 6 | [Empirical Analysis of Model Selection for Heterogeneous Causal Effect Estimation](https://arxiv.org/abs/2211.01939) | Mahajan, Mitliagkas, Neal, Syrgkanis | 2024 | ICLR 2024 | CATE モデル選択指標を大規模実証比較、どの代理損失が良好なランキングを与えるか体系評価 |
| 7 | [Out-of-sample scoring and automatic selection of causal estimators](https://arxiv.org/abs/2212.10076) | Kraev, Flesch, Lekunze, Harley, Planell Morell | 2022 | arXiv | 多数の CATE/IV 推定器を out-of-sample でスコアリングし自動選択する実務的手法 |
| 8 | [Causal Q-Aggregation for CATE Model Selection](https://arxiv.org/abs/2310.16945) | Lan, Syrgkanis | 2023 | NeurIPS 2023 | doubly robust 損失 + Q-aggregation で最適オラクル選択レートを理論保証 |
| 9 | [Unveiling the Potential of Robustness in Selecting CATE Estimators](https://arxiv.org/abs/2402.18392) | Huang, Leung, Wang, Li, Wu | 2024 | NeurIPS 2024 | nuisance-free な Distributionally Robust Metric (DRM) で頑健な推定器を優先選択 |
| 10 | [Robust CATE Estimation Using Novel Ensemble Methods](https://arxiv.org/abs/2407.03690) | Machluf, Frostig, Shoham, Milo, Berkman, Pryluk | 2024 | arXiv | Stacked X-Learner と Consensus Based Averaging (CBA) の2アンサンブルで安定性・精度向上 |
| 11 | [Do Contemporary Causal Inference Models Capture Real-World Heterogeneity?](https://arxiv.org/abs/2410.07021) | Yu, Sun | 2024 | arXiv | 16 モデル×12 データ×43,200 変種の大規模ベンチマーク。62% が零効果予測器に劣ると報告 |
| 12 | [Statistical Learning for HTE: Pretraining, Prognosis, and Prediction](https://arxiv.org/abs/2505.00310) | Schuessler, Sverdrup, Tibshirani | 2025 | arXiv | 予後情報の事前学習を活用、R-lasso が AUTOC で優れた異質性検出力を示すと実証 |
| 13 | [Reliable Selection of Heterogeneous Treatment Effect Estimators](https://arxiv.org/abs/2511.18464) | Guo, Gao | 2025 | arXiv | 推定器選択を多重検定問題化、cross-fitted 指数重み付け統計量で ground-truth-free 選択 |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査
