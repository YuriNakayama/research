# Cluster 6: 実証ベンチマーク・再現性・ライブラリ

## Overview

CATE 精度向上の主張は **ground-truth が無い** ため検証が難しく、半合成データ・大規模実データでの **公平なベンチマーク** と **再現可能な評価プロトコル**、そして **標準ライブラリ**（EconML / CausalML / grf / CATENets）が精度向上研究の基盤となる。本クラスタは横断的・メタな評価軸で、C1〜C5 のどの手法が「実際に」精度を出すかを判定するインフラを扱う。手法そのものではなく「精度向上を正しく測る」ための研究軸。

## Keywords

`IHDP benchmark`, `ACIC benchmark`, `Criteo Uplift dataset`, `semi-synthetic evaluation`, `CATENets`, `EconML`, `CausalML`, `grf (generalized random forests)`, `reproducibility CATE`, `large-scale empirical comparison`

## Research Strategy

- **検索クエリ**:
  - `CATE benchmark IHDP ACIC semi-synthetic evaluation pitfalls`
  - `large-scale empirical comparison meta-learners causal forest uplift`
  - `EconML CausalML grf CATE library comparison`
  - `reproducibility heterogeneous treatment effect benchmark critique`
- **着目すべき論点**:
  - IHDP/ACIC など定番ベンチマークの限界・バイアス（過度な手法チューニングの懸念）
  - 実データ（Criteo 1,398万件）での meta-learner / Causal Forest の実力差
  - ライブラリ実装間の差異が結果に与える影響
  - 半合成データ生成プロトコルの標準化
- **主要研究グループ**: Curth & van der Schaar (CATENets, ベンチマーク批評), Microsoft Research (EconML), Uber (CausalML), Athey/Wager/Tibshirani (grf), Criteo Research

## Representative Resources

| Title | Type | Year | Summary |
|-------|------|------|---------|
| A Large-Scale Empirical Comparison of Meta-Learners and Causal Forests (Criteo) | Paper | 2026 | 1,398万件で S/T/X-learner・Causal Forest を実証比較 (arXiv:2604.06123) |
| Empirical Analysis of Model Selection for HTE Estimation | Paper | 2022 | ベンチマーク横断のモデル選択実証 (arXiv:2211.01939) |
| CATENets (Curth & van der Schaar) | Library/Paper | 2021→ | 深層 CATE 推定器の統一実装・ベンチマーク基盤 |
| EconML / CausalML / grf | Library | — | CATE 推定の標準 OSS（直交学習・Causal Forest 実装） |
| Deep Learning for Causal Inference: A Comparison of Architectures | Paper | 2024 | アーキテクチャ横断ベンチマーク (arXiv:2405.03130) |
