# C6 実証ベンチマーク・再現性・ライブラリ — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文・ライブラリ論文
- **対象期間**: 2016 – 2024（基礎ライブラリ含む / 直近優先）
- **収集日**: 2026-06-02
- **入力元**: clustering 結果 `docs/research/runs/cate/clustering/20260602/cluster-06-benchmark-reproducibility.md`

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 10 |
| 検証済み | 9 |
| 除外 | 1 |

検証済みエントリは WebFetch でタイトル一致を確認済み（No.3 は NeurIPS proceedings が 500 のため著者公式 publications ページで逐語確認）。除外: A Large-Scale Empirical Comparison of Meta-Learners and Causal Forests（arXiv:2604.06123）= 著者表記の揺れと将来日付で信頼度不足のため保守的に除外。

## 全体の傾向

「精度向上を正しく測る」基盤として、(1) **ベンチマーク批評**（Curth & van der Schaar が IHDP/ACIC の前提バイアスを繰り返し警告）、(2) **大規模実データ**（Criteo 1390万件 RCT, Yu & Sun の大規模ベンチマーク）、(3) **標準ライブラリ**（grf, CausalML, CATENets）、(4) **シミュレーション設計の原理化**（TISCA で反復回数を統計的に正当化）が揃う。手法論文の精度主張は、これらの評価基盤の上でこそ妥当性を持つ。C2 のモデル選択研究と密接に連動。

---

## 学術論文・ライブラリ

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 1 | [Generalized Random Forests](https://arxiv.org/abs/1610.01271) | Athey, Tibshirani, Wager | 2016 | Annals of Statistics 2019 | grf の基礎論文。CATE を含む3タスクに適用、一致性・漸近正規性・分散推定を理論保証 |
| 2 | [CausalML: Python Package for Causal Machine Learning](https://arxiv.org/abs/2002.11631) | Chen, Harinen, Lee, Yung, Zhao | 2020 | arXiv | Uber の CausalML。uplift modeling とメタラーナーを統一 API で提供 |
| 3 | [Really Doing Great at Estimating CATE? A Critical Look at ML Benchmarking Practices](https://datasets-benchmarks-proceedings.neurips.cc/paper_files/paper/2021/file/2a79ea27c279e471f4d180b08d62b00a-Paper-round2.pdf) | Curth, Svensson, Weatherall, van der Schaar | 2021 | NeurIPS D&B | 半合成ベンチ(特に IHDP)が特定アルゴリズムを系統的に有利にすると指摘。CATENets 関連の代表的批評 |
| 4 | [Doing Great at Estimating CATE? On the Neglected Assumptions in Benchmark Comparisons](https://arxiv.org/abs/2107.13346) | Curth, van der Schaar | 2021 | ICML WS | IHDP/ACIC2016 を分析、DGP 前提とベースラインの相互作用が比較結論を誤導すると論じる |
| 5 | [Benchmarking Heterogeneous Treatment Effect Models through the Lens of Interpretability](https://arxiv.org/abs/2206.08363) | Crabbé, Curth, Bica, van der Schaar | 2022 | arXiv | 解釈可能性(特徴重要度)の観点で HTE/CATE モデルをベンチマーク、精度以外の評価軸を提案 |
| 6 | [A Large Scale Benchmark for Individual Treatment Effect Prediction and Uplift Modeling](https://arxiv.org/abs/2111.10106) | Diemert, Betlei, Renaudin, Amini, Gregoir, Rahier | 2021 | NeurIPS D&B | Criteo 1390万サンプル RCT を公開、uplift タスクと評価指標を定式化した実データ基盤 |
| 7 | [Benchmarking for Deep Uplift Modeling in Online Marketing](https://arxiv.org/abs/2406.00335) | Liu, Tang, Qiao, Liu, Sun, He, Ming | 2024 | arXiv | 深層 uplift の標準ベンチを整備、Criteo/Lazada で13モデル再評価。新手法が従来を超えない場合を指摘 |
| 8 | [Do Contemporary Causal Inference Models Capture Real-World Heterogeneity?](https://arxiv.org/abs/2410.07021) | Yu, Sun | 2024 | arXiv | 観測サンプリング・新指標・実データを統合した大規模ベンチで実世界異質性のギャップを提示 |
| 9 | [Beyond Arbitrary Replications: A Principled Approach to Simulation Design in Causal Inference](https://arxiv.org/abs/2409.05161) | Souto, Louzada Neto | 2024 | arXiv | 検定力分析ベースの TISCA でシミュレーション反復回数を正当化、再現性と効率を向上 |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査
