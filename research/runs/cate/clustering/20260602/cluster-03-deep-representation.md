# Cluster 3: 深層・表現学習による CATE 高度化

## Overview

既存 `deep_learning` クラスタ（TARNet / DragonNet / BCAUSS）の **続編** として、2024 年以降の最新深層 CATE アーキテクチャに焦点を当てる。核心は **representation learning による covariate balancing**（処置群・対照群の表現分布を揃えて交絡バイアスを減らす）と、その理論的限界（representation-induced confounding bias）への対処。高次元・非線形な実データで精度を確保するための最前線。

## Keywords

`TARNet`, `DragonNet`, `representation learning`, `covariate balancing`, `balanced representation (CFR)`, `representation-induced confounding bias`, `sufficient representation learning`, `CrossNet`, `targeted regularization`, `conformal inference + DragonNet`, `transformer-based CATE`, `deep orthogonal learner`

## Research Strategy

- **検索クエリ**:
  - `deep learning CATE architecture comparison TARNet DragonNet 2024 2025`
  - `representation learning balancing treatment effect confounding bias`
  - `sufficient representation CATE CrossNet`
  - `transformer foundation model treatment effect estimation`
- **着目すべき論点**:
  - representation balancing が過度になると情報損失で精度が落ちる（trade-off の理論）
  - representation-induced confounding bias の bound と緩和策
  - targeted regularization（DragonNet の正則化）の効果
  - conformal inference との組合せによる不確実性定量化
  - 直交学習（C1）を深層に組み込む deep orthogonal learner
- **主要研究グループ**: Shalit & Johansson (CFR/TARNet), Shi et al. (DragonNet), Melnychuk/Frauen/Feuerriegel (representation bias bounds), Curth & van der Schaar (CATENets ベンチマーク)

## Representative Resources

| Title | Type | Year | Summary |
|-------|------|------|---------|
| Deep Learning for Causal Inference: A Comparison of Architectures for HTE | Paper | 2024 | 深層 CATE アーキテクチャの比較サーベイ (arXiv:2405.03130) |
| Estimating CATE via Sufficient Representation Learning (CrossNet) | Paper | 2024 | 両群データから十分表現を学習する CrossNet (arXiv:2408.17053) |
| Bounds on Representation-Induced Confounding Bias for Treatment Effect | Paper | 2023→ | 表現学習が生む交絡バイアスの理論的 bound (arXiv:2311.11321) |
| Deep Orthogonal Learner for Conditional Quantile Treatment Effect | Paper | 2025 | 直交学習を深層に統合（C1 との接続） |
| Dragonnet + Conformal Inference for Individualized Treatment Effects | Paper | 2025 | DragonNet と conformal 予測の臨床応用 (JMIR Cardio) |
