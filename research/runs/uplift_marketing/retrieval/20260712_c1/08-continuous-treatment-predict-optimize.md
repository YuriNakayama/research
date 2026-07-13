# Uplift modeling with continuous treatments: A predict-then-optimize approach

- **Link**: https://arxiv.org/abs/2412.09232
- **Authors**: Simon De Vos, Christopher Bockel-Rickermann, Stefan Lessmann, Wouter Verbeke
- **Year**: 2024 投稿（2024-12-12）/ 2025-05-20 改訂
- **Venue**: arXiv (cs.LG)
- **Type**: フレームワーク提案（predict-then-optimize, 連続処置）

---

## Abstract (English)

> The goal of uplift modeling is to recommend actions that optimize specific outcomes by determining which entities should receive treatment. One common approach involves two steps: first, an inference step that estimates conditional average treatment effects (CATEs), and second, an optimization step that ranks entities based on their CATE values and assigns treatment to the top k within a given budget. While uplift modeling typically focuses on binary treatments, many real-world applications are characterized by continuous-valued treatments, i.e., a treatment dose. This paper presents a predict-then-optimize framework to allow for continuous treatments in uplift modeling. First, in the inference step, conditional average dose responses (CADRs) are estimated from data using causal machine learning techniques. Second, in the optimization step, we frame the assignment task of continuous treatments as a dose-allocation problem and solve it using integer linear programming (ILP).

## Abstract (日本語)

Uplift modeling の目的は、どのエンティティに処置を与えるかを決めることで特定アウトカムを最適化する行動を推薦することにある。一般的手法は2段階からなる。まず CATE を推定する推論ステップ、次に CATE 値でエンティティを順位付けし予算内で上位 k に処置を割り当てる最適化ステップである。uplift modeling は通常 binary 処置に焦点を当てるが、実応用の多くは連続値処置（＝処置用量）で特徴づけられる。本論文は uplift modeling で連続処置を扱う **predict-then-optimize** フレームワークを提示する。推論ステップでは因果機械学習により **CADR（条件付き平均用量反応）** をデータから推定し、最適化ステップでは連続処置の割当を **用量割当問題** として定式化し **整数線形計画（ILP）** で解く。

---

## Overview

本論文は「連続処置（クーポン用量）× 予算制約付き割当」という実務問題を、予測（CADR 推定）と最適化（ILP による用量割当）を分離した predict-then-optimize 枠組みで解く。従来の uplift は binary 処置を前提に「上位 k を選ぶ」だけだが、連続処置では「各ユーザにどの用量を割り当てるか」という組合せ最適化が必要になる。本枠組みは公平性制約やインスタンス依存のコスト便益関数を柔軟に組み込め、ヘルスケア・与信・HR などへの応用を示す。連続クーポン額を扱う本テーマにとって、CADR 推定器（VCNet/DRNet 等）と割当最適化を組み合わせる設計図として直接参照価値が高い。

---

## Problem（課題の整理）

- 従来 uplift は binary 処置前提で「上位 k を選ぶ」割当しか扱えない。
- 実応用の多くは連続処置（用量、クーポン額、価格）。
- 連続処置では各ユーザへの最適用量を予算制約下で決める組合せ最適化が必要。
- 予測誤差が最適化に伝播し、割当ポリシーが最適化文脈と整合しない恐れ。
- 公平性制約やインスタンス依存のコスト便益を組み込む一般的枠組みが不足。

---

## Proposed Method: Predict-then-Optimize for Continuous Treatments

### 核心アイデア

(1) 因果 ML で **CADR** $\mu(s,x)$ と **CADE**（条件付き平均用量効果）$\tau_s(x)$ を推定し、(2) 用量を $\delta$ 個のビンに離散化して割当を ILP に定式化。目的は予算・公平性制約下での総価値最大化。

### 手順（numbered steps）

1. **推論**: 因果 ML（S-Learner RF/MLP, DRNet, VCNet）で CADR $\mu(s,x)$ を推定。
2. CADR から CADE $\tau_s(x) = \mu(s,x) - \mu(0,x)$ を導出。
3. **離散化**: 用量を $\delta$ ビンに離散化。$D=\{(d-1)/\delta \mid d=1,\dots,\delta+1\}$。
4. **最適化**: 各ユーザへの用量選択 $\pi_s(X_i)\in\{0,1\}$ を ILP で解き、予算・公平性・用量割当制約を満たしつつ総価値を最大化。

### Key Formulas

MISE（CADR 推定精度）:

$$ \text{MISE} = \frac{1}{N}\sum_{i}\int_{s}\big[\mu(s,x_i) - \hat\mu(s,x_i)\big]^2 ds $$

コスト関数（用量比例, Eq.2）:

$$ \Psi_i(\pi) = \langle \pi(X_i), C_{i,\cdot}\rangle,\quad c_{i,d} = (d-1)/\delta $$

ILP 目的関数（Eq.11）と主要制約:

$$ \max \sum_{i=1}^{N} V_i(\pi) $$
$$ \text{s.t.}\quad \sum_i \Psi_i(\pi) \le B \quad\text{(予算, Eq.12)} $$
$$ \sum_{s\in D}\pi_s(X_i) = 1 \;\forall i \quad\text{(用量割当, Eq.17)},\qquad \pi_s(X_i)\in\{0,1\} \quad\text{(Eq.18)} $$

正規化リグレット（Eq.24）:

$$ \text{Regret}_{NB} = \frac{V^{opt} - V^{presc}}{V^{opt}} $$

---

## Algorithm（Pseudocode）

```
Input: data {(X_i, S_i, Y_i)}, budget B, bins delta,
       fairness slacks eps_DT, eps_DO
# --- Predict step ---
1: fit CADR estimator mu_hat(s, x)      # VCNet / DRNet / S-Learner
2: for each i, each dose bin d in D:
3:     tau_hat = mu_hat(s_d, X_i) - mu_hat(0, X_i)   # CADE
# --- Optimize step (ILP) ---
4: define pi_s(X_i) in {0,1}, sum_s pi_s(X_i) = 1
5: maximize  sum_i sum_s pi_s(X_i) * V(s, X_i)
   subject to  sum_i sum_s pi_s(X_i) * cost(s) <= B      # budget
               |avg dose(A=0) - avg dose(A=1)| <= eps_DT # allocation fairness
               |avg effect(A=0) - avg effect(A=1)| <= eps_DO # outcome fairness
6: solve ILP  -> optimal dose assignment pi*
7: return pi*
```

---

## Architecture / Process Flow

```
 [Predict]                              [Optimize]
 (X,S,Y) ──► CADR estimator ──► mu(s,x) ──► CADE tau_s(x)
             (VCNet/DRNet/S-L)                    │
                                        用量ビン化 D={0,1/δ,...,1}
                                                  │
                                        ┌─────────▼──────────┐
                                        │  ILP: max Σ V_i(π)  │
                                        │  s.t. 予算 B         │
                                        │       公平性 ε_DT,ε_DO│
                                        │       Σ_s π_s = 1    │
                                        └─────────┬──────────┘
                                                  │
                                        各ユーザへの最適用量 π*
```

---

## Figures & Tables（主要図表）

> 注: 本文 HTML 抽出範囲では Section 5.3 の数値表・図の img URL が truncated であり、正確な数値は取得できなかった。以下は本文中で定義・言及された指標と設定を整理したもの。実数値は 記載なし（原論文 PDF / GitHub 参照）。

### Table A: CADR 推定手法の比較（指標: MISE）

| 手法 | 種別 | 脱バイアス | MISE（実数値） |
|---|---|---|---|
| S-Learner (RF) | ランダムフォレスト | なし | 記載なし |
| S-Learner (MLP) | フィードフォワードNN | なし | 記載なし |
| DRNet (Schwab+2020) | 用量反応ネット | あり | 記載なし |
| VCNet (Nie+2021) | 分散制御ネット | あり | 記載なし |

### Table B: ポリシー価値の3定義

| 定義 | 割当に使う効果 | 評価に使う効果 |
|---|---|---|
| Expected (Eq.19) | 推定 CADE | 推定 CADE |
| Prescribed (Eq.20) | 推定 CADE | 真値 CADE |
| Optimal (Eq.21) | 真値 CADE | 真値 CADE |

### Table C: ILP 制約一覧

| 制約 | 式 | 内容 |
|---|---|---|
| 予算 | Eq.12 | $\sum_i \Psi_i(\pi) \le B$ |
| 割当公平性 | Eq.13–14 | 群 $A=0,1$ 間の平均用量差 $\le \varepsilon_{DT}$ |
| アウトカム公平性 | Eq.15–16 | 群間の平均効果差 $\le \varepsilon_{DO}$ |
| 用量割当 | Eq.17 | $\sum_{s\in D}\pi_s(X_i)=1$ |
| 二値 | Eq.18 | $\pi_s(X_i)\in\{0,1\}$ |

### Figure（アーキ図）
本文中に predict-then-optimize の2段構造図（Figure 1–2）が存在するが、img の直接 URL は 記載なし（`x1.png` 等のローカル参照のみ）。

---

## Experiments & Evaluation

### Setup
- **データ**: 準合成 IHDP（Infant Health and Development Program）変種。実特徴＋合成の連続用量・アウトカム、真の用量反応曲線を制御。
- **CADR 手法**: S-Learner (RF), S-Learner (MLP), DRNet, VCNet。
- **指標**: MISE（予測精度）、AUUC/AUVC（価値曲線面積）、Regret（絶対・正規化）、公平性制約違反。
- **主要パラメータ**: 用量ビン $\delta=10$、公平性スラック $\varepsilon_{DT}, \varepsilon_{DO}\in[0,1]$、予算 $B\in[0, B_{max}]$。
- **コード**: https://github.com/SimonDeVos/UMCT

### Main Results
- 公平性制約（$\varepsilon_{DT}, \varepsilon_{DO}$）とポリシー価値のトレードオフを提示。
- コスト感応目的は uplift のみ最大化に比べ効用が低下。
- 連続処置では ILP が貪欲ランキングヒューリスティクスを上回る。
- CADR 推定器の選択で性能が変化。
- （個別の実数値は本文抽出範囲では 記載なし。）

### Ablation
- 用量ビン数 $\delta$ の妥当性を Appendix D で検討（$\delta=10$ を採用）。
- 公平性スラックを緩めるほど価値が上がる／制約違反が減るトレードオフを可視化。

### Key Assumptions（Appendix B）
1. **Consistency**: 観測処置 $S=s$ に対し $Y=Y(s)$。
2. **Ignorability**: $\{Y(s)\} \perp S \mid X$（未観測交絡なし）。
3. **Overlap**: すべての $s, x$ で $0 < p(s\mid x) < 1$。

---

## 本テーマへの適用可能性

本テーマ（連続クーポン額の per-user uplift × 予算制約付き割当）に対し、本論文は「推定と割当を分離した実装ブループリント」を提供する。

- **連続クーポン額を用量として直接扱える**: クーポン額を連続処置 $s$ とみなし、CADR $\mu(s,x)$ を推定すれば「このユーザには 800円クーポンが最も費用対効果が高い」という per-user・per-dose の判断が可能。本テーマの「different coupon amounts」に正面から対応する。
- **予算制約付き割当が組み込み済み**: マーケ予算 $B$ の下で「誰にいくらのクーポンを配るか」を ILP で最適化できる（Eq.11–18）。上位 k を選ぶだけの binary uplift では表現できない、連続処置ならではの用量割当を扱える。
- **CADR 推定器の差し替えが容易**: 推論ステップは VCNet/DRNet/S-Learner と交換可能なので、スパースキャンペーンをまたいでプールした base estimator（例: 07 の S-learner 土台や 09 の GCF）を CADR 推定器として差し込み、割当だけ ILP で回す構成が取れる。**base estimator のプールと割当最適化を疎結合にできる**点が実務上大きい。
- **公平性・コスト便益の制約が実務要件に合う**: 顧客セグメント間の公平性（$\varepsilon_{DT}, \varepsilon_{DO}$）やインスタンス依存のコスト便益を制約として明示でき、規制・ブランド要件のある marketing に適合。
- **留意点**: 予測と最適化が分離しているため予測誤差が最適化に伝播しうる（本論文自身が指摘）。決定整合を重視するなら 10 の learning-to-rank（decision-focused）と比較検討すべき。また用量離散化 $\delta$ の粒度が割当品質に効くため、クーポン額の刻み設計と合わせて調整が必要。

---

## Notes

- 予測と最適化を分離する predict-then-optimize は実装・保守が容易だが、決定整合性では end-to-end 手法（learning-to-rank 等）に劣る可能性。
- IHDP 準合成での評価にとどまり、実マーケ A/B は 記載なし。
- 本文 HTML 抽出では主要数値表が truncated。正確な数値は原論文 PDF または GitHub リポジトリ UMCT を参照のこと。
