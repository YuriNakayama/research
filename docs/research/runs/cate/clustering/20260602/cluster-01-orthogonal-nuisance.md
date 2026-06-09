# Cluster 1: 直交学習・nuisance 推定改善

## Overview

DR-learner / R-learner に代表される **Neyman 直交（orthogonal）メタラーナー** は、2段階で nuisance 関数（傾向スコア・条件付き期待値）を機械学習で推定し、直交損失で CATE を targeting することで「nuisance 推定誤差に対する1次の鈍感さ（quasi-oracle 性質）」を獲得する。本クラスタは、この直交化と cross-fitting を起点に **メタラーナー自体の精度をどう底上げするか** に焦点を当てる。基礎メタラーナー（S/T/X）の単純な差分推定より一段高精度で、CATE 精度向上の理論的本丸。

## Keywords

`DR-learner`, `R-learner`, `Neyman orthogonality`, `quasi-oracle`, `cross-fitting`, `double/debiased machine learning (DML)`, `orthogonal statistical learning`, `nuisance estimation`, `weighted orthogonal learner`, `oracle-efficient estimation`, `Rank-learner`, `multiway cross-fitting`

## Research Strategy

- **検索クエリ**:
  - `"DR-learner" OR "R-learner" quasi-oracle CATE convergence rate`
  - `Neyman orthogonal CATE meta-learner nuisance robustness 2024 2025`
  - `cross-fitting sample splitting CATE estimation bias`
  - `orthogonal statistical learning heterogeneous treatment effect`
- **着目すべき論点**:
  - nuisance 推定器の選び方が CATE 精度に与える影響（quasi-oracle bound が成立する条件）
  - cross-fitting の fold 数・実装上の落とし穴
  - DR vs R-learner の使い分け（どの DGP で優位か）
  - T-learner と DR-learner の融合による oracle-efficient 推定
- **主要研究グループ**: Nie & Wager (Stanford), Kennedy (CMU, DR-learner), Foster & Syrgkanis (orthogonal statistical learning), Oprescu et al. (B-learner)

## Representative Resources

| Title | Type | Year | Summary |
|-------|------|------|---------|
| Quasi-Oracle Estimation of Heterogeneous Treatment Effects (R-learner) | Paper | 2021 | R-learner の原論文。直交損失と quasi-oracle 性質の定式化 |
| Combining T-learning and DR-learning: oracle-efficient estimation of causal contrasts | Paper | 2024 | T と DR を融合し oracle 効率を達成するフレームワーク (arXiv:2402.01972) |
| On Weighted Orthogonal Learners for Heterogeneous Treatment Effects | Paper | 2023 | 重み付き直交学習による精度改善 (arXiv:2303.12687) |
| Rank-Learner: Orthogonal Ranking of Treatment Effects | Paper | 2026 | 直交性を保ちつつ処置効果のランキングを学習 (arXiv:2602.03517) |
| An Introduction to Double/Debiased Machine Learning | Paper | 2025 | DML/cross-fitting の最新拡張・実務入門 (arXiv:2504.08324) |
