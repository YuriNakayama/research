# C5 データ効率・hidden confounding・分布シフト頑健性 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2023 – 2026（直近優先）
- **収集日**: 2026-06-02
- **入力元**: clustering 結果 `docs/research/runs/cate/clustering/20260602/cluster-05-robustness-data-efficiency.md`

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 12 |
| 検証済み | 12 |
| 除外 | 0 |

全エントリは WebFetch で arXiv abstract ページのタイトル一致を確認済み。

## 全体の傾向

実データでの CATE 精度を左右する「前提の崩れ」への対処が3方向で進む。(1) **hidden confounding**: 点推定から bound（B-learner）へ、または LLM・生成器で交絡因子を補完（ProCI, pseudo-confounder generator）。(2) **RCT + 観測データ統合**: data borrowing と double calibration（R-OSCAR は必要 RCT サンプルを最大75%削減、MR-OSCAR は共変量不一致に対応）。(3) **分布シフト**: multi-accurate 後処理・minimax regret・DRM 選択で covariate shift に頑健化。プライバシー保証付き CATE（DP-CATE）や転移学習も精度・実用性を補強。

---

## 学術論文

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 1 | [B-Learner: Quasi-Oracle Bounds on HTE Under Hidden Confounding](https://arxiv.org/abs/2304.10577) | Oprescu, Dorn, Ghoummaid, Jesson, Kallus, Shalit | 2023 | ICML 2023 | marginal sensitivity model に基づき CATE の sharp bound を valid・efficient・quasi-oracle に学習 |
| 2 | [Bounds on Representation-Induced Confounding Bias for Treatment Effect Estimation](https://arxiv.org/abs/2311.11321) | Melnychuk, Frauen, Feuerriegel | 2023 | ICLR 2024 | 表現学習による情報損失が生む交絡バイアスを部分識別で上下界化（C3 と共通） |
| 3 | [A Partial Initialization Strategy to Mitigate Overfitting in CATE Estimation with Hidden Confounding](https://arxiv.org/abs/2501.08888) | Zhou, Li, Zheng, Zhang, Li, Gong | 2025 | KDD 2024 WS | 観測データで事前学習し RCT 微調整時に予測ヘッドを部分初期化、過学習を防止 |
| 4 | [Conditional Average Treatment Effect Estimation Under Hidden Confounders](https://arxiv.org/abs/2506.12304) | Aloui, Dong, Hasan, Tarokh | 2025 | UAI 2025 | pseudo-confounder generator で観測データ潜在結果を RCT に整合、RCT は結果のみで OK |
| 5 | [Improving Precision of RCT-Based CATE Estimation using Data Borrowing with Double Calibration](https://arxiv.org/abs/2306.17478) | Asiaee, Di Gravio, Beck, Mei, Pal, Huling | 2023 | arXiv | R-OSCAR: 観測データを RCT に二重キャリブレーション、必要サンプルを最大75%削減 |
| 6 | [Improving RCT-Based CATE Estimation Under Covariate Mismatch via Double Calibration](https://arxiv.org/abs/2603.17066) | Pal, Huling, Asiaee | 2026 | arXiv | MR-OSCAR: 共変量不一致の RCT と観測データを統合、欠損 trial 変数を補完して校正 |
| 7 | [Unveiling the Potential of Robustness in Selecting CATE Estimators](https://arxiv.org/abs/2402.18392) | Huang, Leung, Wang, Li, Wu | 2024 | NeurIPS 2024 | nuisance-free な DRM で covariate shift・hidden confounder による分布シフトに頑健な推定器選択 |
| 8 | [Multi-CATE: Multi-Accurate CATE Estimation Robust to Unknown Covariate Shifts](https://arxiv.org/abs/2405.18206) | Kern, Kim, Zhou | 2024 | arXiv | multi-accuracy で T-learner を後処理、デプロイ時の未知 covariate shift に頑健化 |
| 9 | [Minimax Regret Estimation for Generalizing HTE with Multisite Data](https://arxiv.org/abs/2412.11136) | Zhang, Huang, Imai | 2024 | arXiv | 対象集団との差が未知でも worst-case regret を最小化する一般化可能 CATE モデル |
| 10 | [Mitigating Hidden Confounding by Progressive Confounder Imputation via LLMs](https://arxiv.org/abs/2507.02928) | Yang, Li, Chen, Wang, Chen, Gong | 2025 | arXiv | ProCI: LLM の知識で隠れ交絡因子を反復生成・補完・検証、分布的推論で崩壊を防止 |
| 11 | [Differentially Private Learners for Heterogeneous Treatment Effects](https://arxiv.org/abs/2503.03486) | Schröder, Melnychuk, Feuerriegel | 2025 | arXiv | DP-CATE: Neyman 直交 + 差分プライバシーを両立、任意の2段階メタラーナーに適用可 |
| 12 | [Transfer Learning for Causal Effect Estimation](https://arxiv.org/abs/2305.09126) | Wei, Zhang, Moore, Kamaleswaran, Xie | 2023 | arXiv | ℓ1-TCL: nuisance モデルに正則化転移学習を適用、希少事例(敗血症)で有効性を実証 |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査
