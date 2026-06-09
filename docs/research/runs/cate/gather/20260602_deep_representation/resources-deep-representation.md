# C3 深層・表現学習による CATE 高度化 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2023 – 2026（古典 TARNet/DragonNet は既調査のため除外）
- **収集日**: 2026-06-02
- **入力元**: clustering 結果 `docs/research/runs/cate/clustering/20260602/cluster-03-deep-representation.md`

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 12 |
| 検証済み | 12 |
| 除外 | 0 |

全エントリは WebFetch で arXiv abstract ページのタイトル一致を確認済み。

## 全体の傾向

TARNet/DragonNet 系の素朴な表現バランシングは **representation-induced confounding bias**（次元削減による情報損失）という理論的限界が明らかになり（Melnychuk et al. 2023）、これを克服する方向に研究が進化。(1) 直交学習を表現学習に統合する OR-learner、(2) PFN/in-context learning による **CATE 基盤モデル**（CausalFM, CausalPFN）、(3) DAG 構造や disentangle を attention に組み込む transformer 系、が 2025-2026 の主流。表現学習は「balancing するほど良い」から「直交性・十分性・disentangle を保証する」段階へ移行。

---

## 学術論文

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 1 | [Bounds on Representation-Induced Confounding Bias for Treatment Effect Estimation](https://arxiv.org/abs/2311.11321) | Melnychuk, Frauen, Feuerriegel | 2023 | ICLR 2024 Spotlight | 低次元表現による情報損失が生む交絡バイアスを定式化、部分識別で上下界を計算 |
| 2 | [Orthogonal Representation Learning for Estimating Causal Quantities](https://arxiv.org/abs/2502.04274) | Melnychuk, Frauen, Schweisthal, Feuerriegel | 2025 | AISTATS 2026 | end-to-end 表現学習と2段階直交学習の溝を埋める OR-learner、任意表現上で quasi-oracle 効率 |
| 3 | [Estimating CATE via Sufficient Representation Learning](https://arxiv.org/abs/2408.17053) | Shi, Zhong, Zhang, Wang, Fu, Wang, Jin | 2024 | arXiv | 非交絡性を保証する「十分表現」を学習する CrossNet、両群データで CATE 精度向上 |
| 4 | [Foundation Models for Causal Inference via Prior-Data Fitted Networks](https://arxiv.org/abs/2506.10914) | Ma, Frauen, Javurek, Feuerriegel | 2025 | arXiv | PFN による CATE 基盤モデル CausalFM、back-door/front-door/IV 調整に対応 |
| 5 | [CausalPFN: Amortized Causal Effect Estimation via In-Context Learning](https://arxiv.org/abs/2506.07918) | Balazadeh, Kamkari, Thomas, Li, Ma, Cresswell, Krishnan | 2025 | arXiv | 多数の模擬 DGP で事前学習した transformer が in-context で再学習なしに CATE/ATE 推定 |
| 6 | [DAG-aware Transformer for Causal Effect Estimation](https://arxiv.org/abs/2410.10044) | Liu, Bellamy, Beam | 2024 | arXiv | 因果 DAG を attention に組み込む transformer、G-formula/IPW/AIPW に対応 |
| 7 | [Deep Disentangled Representation Network for Treatment Effect Estimation](https://arxiv.org/abs/2507.06650) | Meng, Yang, Peng, Zheng | 2025 | arXiv | MoE + multi-head attention + 線形直交正則化で共変量を IV/交絡/調整因子へ分解 |
| 8 | [Representation Learning Preserving Ignorability and Covariate Matching for Treatment Effects](https://arxiv.org/abs/2504.20579) | Nanavati, Prasad, Shanmugam | 2025 | arXiv | 勾配整合(FISH) + IPM 共変量整合で隠れ交絡・共変量ミスマッチに対処、PEHE 改善 |
| 9 | [Multiple Treatments Causal Effects Estimation with Task Embeddings and Balanced Representation Learning](https://arxiv.org/abs/2511.09814) | Murakami, Hattori, Kubota | 2025 | arXiv | タスク埋め込み + バランス表現で複数処置の相互作用効果を同時モデル化 |
| 10 | [Adversarially Balanced Representation for Continuous Treatment Effect Estimation](https://arxiv.org/abs/2312.10570) | Kazemi, Ester | 2023 | arXiv | 連続処置に対し KL で表現不均衡を敵対的に最小化、attention で処置値の影響を保持 (ACFR) |
| 11 | [Multi-CATE: Multi-Accurate CATE Estimation Robust to Unknown Covariate Shifts](https://arxiv.org/abs/2405.18206) | Kern, Kim, Zhou | 2024 | arXiv | multi-accuracy 学習で T-learner を後処理、未知の covariate shift に頑健化（C5 と共通） |
| 12 | [Conditional Average Treatment Effect Estimation Under Hidden Confounders](https://arxiv.org/abs/2506.12304) | Aloui, Dong, Hasan, Tarokh | 2025 | UAI 2025 | 擬似交絡因子生成器 + CATE モデルで観測データ潜在結果を RCT に整合（C5 と共通） |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査
