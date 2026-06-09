# CATE 推定の精度向上手法 — 領域マップ

## Research Parameters

- **Research type**: Academic Paper Survey
- **Time range**: 2022 – 2026（直近4年）
- **Generated on**: 2026-06-02
- **Input keywords**: CATE, conditional average treatment effect, meta-learner, uplift, accuracy improvement, DR-learner, R-learner, cross-fitting, model selection, robustness
- **Domain**: `cate`（既存ドメインの延長 / 精度向上の観点で新規クラスタを設計）

## Big Picture

CATE（条件付き平均処置効果）推定は、メタラーナー（S/T/X/B/M/RX-learner）や Causal Forest、深層表現学習（TARNet / DragonNet 系）といった「推定器」の研究が一巡し、現在は **「どうすれば実データで安定して高精度を出せるか」** という精度向上のフェーズに移っている。本マップは既存 cate ドメインで retrieval 済みの基礎メタラーナー・theory・deep_learning とは重複しない、**精度向上に直結する6つの研究軸** に分割する。

精度向上の主要な潮流は次の5つに整理できる:
1. **Neyman 直交性 + cross-fitting** による nuisance 推定誤差への頑健化（DR/R-learner の理論的高度化）
2. **アンサンブル・モデル選択・CATE 専用バリデーション** による「正しい推定器を選ぶ」技術（ground-truth が無い問題への対処）
3. **深層・表現学習** による covariate balancing と高次元での精度確保（TARNet/DragonNet 以降の最新アーキテクチャ）
4. **uplift ランキング指標（AUUC/Qini）の直接最適化** による実務 KPI に直結した学習
5. **データ効率・hidden confounding・分布シフトへの頑健性** による実データでの汎化性能確保

## Reference Survey/Review Papers

| Title | Year | Summary | Link |
|-------|------|---------|------|
| Quasi-Oracle Estimation of Heterogeneous Treatment Effects (Nie & Wager, R-learner) | 2021 | R-learner と quasi-oracle 性質の基礎理論。直交損失による精度向上の出発点 | https://arxiv.org/abs/1712.04912 |
| Empirical Analysis of Model Selection for Heterogeneous Causal Effect Estimation | 2022 | CATE 推定器のモデル選択を大規模に実証比較。Tau-risk 系指標の有効性を示す | https://arxiv.org/pdf/2211.01939 |
| Deep Learning for Causal Inference: A Comparison of Architectures for HTE Estimation | 2024 | TARNet/DragonNet 系を含む深層 CATE アーキテクチャの比較サーベイ | https://arxiv.org/html/2405.03130v1 |
| A Large-Scale Empirical Comparison of Meta-Learners and Causal Forests (Criteo Uplift) | 2026 | 1,398万件の uplift データで S/T/X-learner・Causal Forest を実証比較 | https://arxiv.org/pdf/2604.06123 |
| An Introduction to Double/Debiased Machine Learning | 2025 | DML/直交学習/cross-fitting の実務的入門・最新拡張 | https://arxiv.org/pdf/2504.08324 |

## Domain Map

```
                  CATE 推定の精度向上
                          │
   ┌──────────┬───────────┼───────────┬──────────────┐
   │          │           │           │              │
 [C1]       [C2]        [C3]        [C4]           [C5]
直交学習・   アンサンブル  深層・表現  uplift ランキ   データ効率・
nuisance改善 ・モデル選択  学習の高度化 ング最適化     頑健性
 (理論)    ・CATE検証    (DL)       (実務KPI)      (汎化)
   │          │                                      │
   └──────────┴──────────────────────────────────────┘
                          │
                        [C6]
                  実証ベンチマーク・
                  再現性・ライブラリ
                  (横断的・評価基盤)
```

## Cluster Summary

| # | Cluster Name | Keywords | Summary |
|---|-------------|----------|---------|
| 1 | 直交学習・nuisance 推定改善 | 12 | DR/R-learner の Neyman 直交性・cross-fitting・nuisance 誤差への頑健化で精度を底上げ |
| 2 | アンサンブル・モデル選択・CATE 専用バリデーション | 13 | 複数推定器の組合せと「ground-truth 無し」での正しい推定器選択・検証指標 |
| 3 | 深層・表現学習による CATE 高度化 | 12 | TARNet/DragonNet 以降の表現学習・balancing・基盤モデル系で高次元精度を確保 |
| 4 | uplift ランキング指標の直接最適化 | 11 | AUUC/Qini を直接最適化する損失設計で実務 KPI に直結した精度向上 |
| 5 | データ効率・hidden confounding・分布シフト頑健性 | 13 | 少データ・RCT+観測データ統合・隠れ交絡・分布シフトへの汎化で実データ精度を確保 |
| 6 | 実証ベンチマーク・再現性・ライブラリ | 10 | 大規模ベンチマーク・評価プロトコル・OSS（EconML/CausalML/grf）による横断的検証基盤 |

## Cluster Details

各クラスタの詳細は個別ファイルを参照:

- [Cluster 1: 直交学習・nuisance 推定改善](./cluster-01-orthogonal-nuisance.md)
- [Cluster 2: アンサンブル・モデル選択・CATE 専用バリデーション](./cluster-02-ensemble-model-selection.md)
- [Cluster 3: 深層・表現学習による CATE 高度化](./cluster-03-deep-representation.md)
- [Cluster 4: uplift ランキング指標の直接最適化](./cluster-04-uplift-ranking-optimization.md)
- [Cluster 5: データ効率・hidden confounding・分布シフト頑健性](./cluster-05-robustness-data-efficiency.md)
- [Cluster 6: 実証ベンチマーク・再現性・ライブラリ](./cluster-06-benchmark-reproducibility.md)

## 既存 retrieval 済みクラスタとの関係

| 既存クラスタ (2026-03-22) | 本マップの新規クラスタとの関係 |
|---------------------------|--------------------------------|
| `metalearner`（S/T/X/B/M/RX-learner の基礎） | C1（直交化による高度化）・C2（メタラーナーのアンサンブル/選択）が延長線上 |
| `theory`（識別・ignorability） | C1（直交性・quasi-oracle 理論）・C5（hidden confounding 理論）が深掘り |
| `deep_learning`（TARNet/DragonNet/BCAUSS） | C3（最新 DL アーキテクチャ）が直接の続編 |

## 推奨される次アクション

1. **C1 / C2 を優先** — メタラーナー精度向上の本丸（直交化 + 正しい選択）。research-gather → research-retrieval を実行
2. C3（最新 DL）・C5（頑健性）を続いて深掘り
3. C4（uplift 最適化）・C6（ベンチマーク）は実務適用フェーズで参照
