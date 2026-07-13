# C4 uplift ランキング指標の直接最適化 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2020 – 2026（直近優先）
- **収集日**: 2026-06-02
- **入力元**: clustering 結果 `docs/research/runs/cate/clustering/20260602/cluster-04-uplift-ranking-optimization.md`

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 12 |
| 検証済み | 10 |
| 除外 | 2 |

検証済みエントリは全て WebFetch で arXiv abstract ページのタイトル一致を確認済み。除外: ① Weighted doubly robust learning（Decision Support Systems）= ScienceDirect/ResearchGate とも 403 で本文取得不可、② Improving uplift model evaluation on RCT data（arXiv:2210.02152）= 内容が評価分散低減でクラスタ範囲外。

## 全体の傾向

CATE の絶対値推定ではなく **AUUC/Qini ランキング指標を直接最適化** する潮流（AUUC-max, learning-to-rank for uplift, listwise uplift ranking loss）が確立。さらに 2024-2025 は (1) 予算制約下のインセンティブ配分を end-to-end 最適化、(2) GNN による少ラベル uplift（GNUM, グラフ + 因果知識）、(3) knowledge distillation（KDSM）、(4) 多施策トレードオフ最適化、と **実務 KPI に直結した損失設計とアーキテクチャ革新** が中心。会議は KDD/WWW/SIGIR が主戦場。

---

## 学術論文

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 1 | [Treatment Targeting by AUUC Maximization with Generalization Guarantees](https://arxiv.org/abs/2012.09897) | Betlei, Diemert, Amini | 2020 | KDD 2021 | AUUC の汎化上界を導出し微分可能代理損失 AUUC-max を直接最適化。本クラスタの中核手法 |
| 2 | [Learning to rank for uplift modeling](https://arxiv.org/abs/2002.05897) | Devriendt, Guns, Verbeke | 2020 | IEEE TKDE | uplift 評価指標を learning-to-rank に統合、曲線下面積最適化を狙う新指標 PCG を導入 |
| 3 | [Rankability-enhanced Revenue Uplift Modeling Framework for Online Marketing](https://arxiv.org/abs/2405.15301) | He, Weng, Tang, Cui, Sun, Chen, He, Ma | 2024 | KDD 2024 | ランキング誤差を理論解析し2つの誤差上界を損失化、listwise uplift ranking loss で直接最適化 |
| 4 | [End-to-End Cost-Effective Incentive Recommendation under Budget Constraint with Uplift Modeling](https://arxiv.org/abs/2408.11623) | Sun, Yang, Liu, Weng, Tang, He | 2024 | SIGIR 2024 | uplift 予測と微分可能配分モジュール(ILP 微分可能化)を end-to-end 結合、予算制約下で最適化 |
| 5 | [Graph Neural Network with Two Uplift Estimators for Label-Scarcity Individual Uplift Modeling](https://arxiv.org/abs/2403.06489) | Zhu, Wang, Zhang, Kuang, Zhang, Kang, Zhou | 2024 | WWW 2024 | ソーシャルグラフを活用する GNN ベース uplift (GNUM)、ラベル希少でも精度向上 |
| 6 | [Uplift Modeling based on Graph Neural Network Combined with Causal Knowledge](https://arxiv.org/abs/2311.08434) | Wang, Ye, Zhou, Zhang, Zhang, Jiang | 2023 | arXiv | 因果知識(CATE + 隣接行列構造学習)を GNN に統合し uplift 推定精度を向上 |
| 7 | [KDSM: An uplift modeling framework based on knowledge distillation and sample matching](https://arxiv.org/abs/2303.02980) | Sun, Li, Wang, Xu, Liu | 2023 | arXiv | 木モデル(教師)から反実仮想サンプル対を生成、ペアワイズ増分予測を生徒の追加目的に |
| 8 | [Heterogeneous Multi-treatment Uplift Modeling for Trade-off Optimization in Short-Video Recommendation](https://arxiv.org/abs/2511.18997) | Zhai, Meng, Wang, Liu, Hu, Tang, Feng, Li | 2025 | KDD 2025 | オフライン HUM + オンライン DDM で多施策の相乗・個別効果を捉え競合 KPI を最適化 |
| 9 | [Uplift Modeling Under Limited Supervision](https://arxiv.org/abs/2403.19289) | Panagopoulos, Malitesta, Malliaros, Pang | 2024 | arXiv | EC グラフ + GNN で少数ラベルから処置効果推定、二モデル + 獲得関数で実験配分最適化 |
| 10 | [VALOR: Value-Aware Revenue Uplift Modeling with Treatment-Gated Representation for B2B Sales](https://arxiv.org/abs/2604.02472) | Guduguntla, Soni, Das | 2026 | arXiv | ゼロ過剰収益下で説得可能アカウントを特定する treatment-gated network + コスト感応 focal loss |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査
