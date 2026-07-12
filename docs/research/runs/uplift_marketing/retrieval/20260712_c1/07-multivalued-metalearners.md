# Comparison of meta-learners for estimating multi-valued treatment heterogeneous effects

- **Link**: https://arxiv.org/abs/2205.14714 / [PMLR v202](https://proceedings.mlr.press/v202/acharki23a.html)
- **Authors**: Naoufal Acharki, Ramiro Lugo, Antoine Bertoncello, Josselin Garnier
- **Year**: 2022 投稿 / 2023 最終版（v3）
- **Venue**: ICML 2023（PMLR 202:91–132）
- **Type**: 理論解析 + 実証比較（meta-learner サーベイ）

---

## Abstract (English)

> Conditional Average Treatment Effects (CATE) estimation is one of the main challenges in causal inference with observational data. In addition to Machine Learning based-models, nonparametric estimators called meta-learners have been developed to estimate the CATE with the main advantage of not restraining the estimation to a specific supervised learning method. This task becomes, however, more complicated when the treatment is not binary as some limitations of the naive extensions emerge. This paper looks into meta-learners for estimating the heterogeneous effects of multi-valued treatments. We consider different meta-learners, and we carry out a theoretical analysis of their error upper bounds as functions of important parameters such as the number of treatment levels, showing that the naive extensions do not always provide satisfactory results. We introduce and discuss meta-learners that perform well as the number of treatments increases. We empirically confirm the strengths and weaknesses of those methods with synthetic and semi-synthetic datasets.

## Abstract (日本語)

観測データを用いた因果推論における中心課題の一つが CATE（条件付き平均処置効果）推定である。機械学習ベースのモデルに加え、特定の教師あり学習手法に縛られない利点を持つノンパラメトリック推定量「meta-learner」が開発されてきた。しかし処置が binary でない場合、素朴な拡張の限界が現れ課題は複雑化する。本論文は multi-valued（多値）処置の異質効果を推定する meta-learner を検討する。複数の meta-learner を対象に、処置水準数などの重要パラメータの関数として誤差上界を理論的に解析し、素朴な拡張が必ずしも満足な結果を与えないことを示す。処置数が増えても良好に機能する meta-learner を導入・議論し、合成・準合成データセットで各手法の長所と短所を実証的に確認する。

---

## Overview

本論文は uplift/CATE 推定の meta-learner（T-, S-, X-, M-, DR-, R-learner）を **多値処置 $K$ 水準** へ拡張したときの挙動を、理論（誤差上界）と実証（mPEHE）の両面から系統的に比較する。核心的知見は、(1) T-learner と naive X-learner は処置ごとの傾向スコア $\rho(t_k)$ の逆数に誤差が支配され処置数が増えると劣化する、(2) M-learner は傾向スコアへの感度が高く一貫して悪い、(3) S-learner は $K\ge 10$ で安定し、これを土台とした X-learner / DR-learner が観測データ設定で最良、という点。複数クーポン額のような多値処置を pooled base estimator で扱う本テーマにとって、どの meta-learner を土台に選ぶべきかの実務指針を与える。

---

## Problem（課題の整理）

- CATE 推定の meta-learner は binary 処置を前提に設計されており、多値処置 $T \in \{t_0, t_1, \dots, t_K\}$ への素朴な拡張には限界がある。
- 各処置水準 $t_k$ の観測割合 $\rho(t_k)$ が小さいと、その処置に対する推定分散が増大。
- 処置数 $K$ が増えると naive な手法（T-learner, naive X-learner）の誤差が発散しうる。
- 傾向スコア（propensity / 密度）$r(t_k, X)$ が小さい水準で IPW 系（M-learner）が不安定化。
- どの meta-learner が $K$ の増加に頑健かの理論・実証的整理が不足。

---

## Proposed Method（比較対象 meta-learner の定式化）

### 分類

1. **直接プラグイン系**
   - **T-Learner**: 処置ごとに別々の結果モデルを推定。$\hat\tau_k^{(T)}(x) := \hat\mu_{t_k}(x) - \hat\mu_{t_0}(x)$。
   - **S-Learner**: 単一モデル $\mu(t,x)=\mathbb{E}(Y^{obs}\mid T=t, X=x)$ を全データで学習。
2. **疑似アウトカム系（pseudo-outcome）**
   - **M-Learner**: IPW による疑似アウトカム $Z_k^M = \mathbf{1}\{T=t_k\}Y^{obs}/\hat r(t_k,X) - \mathbf{1}\{T=t_0\}Y^{obs}/\hat r(t_0,X)$。
   - **DR-Learner**: 結果モデルと傾向スコアを組み合わせた doubly robust。
   - **X-Learner (Improved)**: クロスフィット残差を組み込む回帰調整型。
   - **Naive X-Learner**: binary X-learner の素朴な多処置拡張。
3. **直交性ベース**
   - **R-Learner (Generalized)**: Robinson 分解損失を最小化。正則化なしでは非識別性に陥る。

### Key Formulas

M-learner の疑似アウトカム:

$$ Z_k^M = \frac{\mathbf{1}\{T=t_k\}\,Y^{obs}}{\hat r(t_k, X)} - \frac{\mathbf{1}\{T=t_0\}\,Y^{obs}}{\hat r(t_0, X)} $$

評価指標 mPEHE:

$$ \text{mPEHE} = \sqrt{\frac{1}{K}\sum_{k=1}^{K}\text{PEHE}(\hat\tau_k)^2},\quad \text{PEHE}(\hat\tau_k)^2 = \frac{1}{n}\sum_{i=1}^{n}\big(\hat\tau_k(X_i) - \tau_k(X_i)\big)^2 $$

誤差上界（$err(\hat\mu_t) = \mathbb{E}_X[(f(t,X)-\hat\mu_t(X))^2]$）:

- **Theorem 5.3**（T- と naive X-learner）: $\mathcal{E}^T = \mathcal{E}^{X,nv} = O\!\big(1/\rho(t_k) + 1/\rho(t_0)\big)$
- **Theorem 5.4**（疑似アウトカム系）:
  $$ \mathcal{E}^M = O\!\big(1/r_{min}^{1+\epsilon}\big) $$
  $$ \mathcal{E}^{DR} = O\!\Big((err(\hat\mu_{t_k}) + err(\hat\mu_{t_0}))/r_{min}^{1+\epsilon}\Big) $$
  $$ \mathcal{E}^X = O\!\Big(K^2 \sum_{l\neq k} err(\hat\mu_{t_l})\Big) $$

---

## Algorithm（Pseudocode: X-Learner 多値版）

```
Input: {(X_i, T_i, Y_i)}, treatment levels {t_0,...,t_K}
1: for each level t_k:                       # stage 1
2:    fit mu_hat_{t_k}(x) on {i : T_i = t_k}  # S-learner を土台にすると安定
3: for each treated level t_k (k>=1):        # stage 2: 疑似アウトカム
4:    D_i^{t_k} = Y_i - mu_hat_{t_0}(X_i)      # treated 側 imputed effect
5:    D_i^{t_0} = mu_hat_{t_k}(X_i) - Y_i      # control 側 imputed effect
6:    fit tau_k^{(1)} on D^{t_k}, tau_k^{(0)} on D^{t_0}
7:    tau_hat_k(x) = g(x) tau_k^{(0)}(x) + (1-g(x)) tau_k^{(1)}(x)  # 傾向で重み付け
8: return {tau_hat_1, ..., tau_hat_K}
```

---

## Architecture / Process Flow

```
                     ┌─ T-Learner:   K+1 個の別モデル → 差分（K増で劣化）
                     │
 (X,T,Y) ──► base ML ├─ S-Learner:   単一モデル μ(t,x)（K>=10 で安定）
                     │
                     ├─ M-Learner:   IPW 疑似アウトカム（傾向感度で不安定）
                     │
                     ├─ X/DR-Learner: S-learner を土台に疑似アウトカム学習（観測設定で最良）
                     │
                     └─ R-Learner:   Robinson 分解（要正則化）
                                          │
                                    mPEHE で評価（K 水準平均）
```

---

## Figures & Tables（主要図表）

### Table 2: Linear RCT（$n=2000$, $K=10$, mPEHE, 括弧内 sd）

| Learner | XGBoost | RandomForest |
|---|---|---|
| T-Learner | 0.065 (0.019) | 0.041 (0.016) |
| S-Learner | **0.033 (0.018)** | 0.032 (0.028) |
| DR-Learner | 0.068 (0.019)–0.063 (0.020) | 0.068 (0.018) |
| X-Learner | 0.063 (0.020)–**0.033 (0.017)** | **0.045 (0.016)**–0.061 (0.040) |
| M-Learner | 1.25 (0.610) | 1.22 (0.621) |

### Table 3: Hazard Rate Observational（$n=10000$, $K=10$, mPEHE）

| Learner | XGBoost | RandomForest |
|---|---|---|
| T-Learner | 0.183 (0.039) | 0.286 (0.155) |
| S-Learner | 0.176 (0.056) | 0.306 (0.153) |
| X-Learner | **0.167 (0.053)**–0.172 (0.057) | 0.302 (0.169)–0.332 (0.167) |
| DR-Learner | 0.168 (0.045)–0.178 (0.048) | 0.304 (0.158)–0.322 (0.162) |
| M-Learner | 1.61 (0.505) | 1.58 (0.472) |

### Table 4: Heat Extraction Semi-Synthetic（$n=10000$, $K=13$, mPEHE）

| Learner | XGBoost | RandomForest |
|---|---|---|
| S-Learner | **0.101 (0.040)** | 0.218 (0.129) |
| X-Learner | 0.142 (0.041)–**0.094 (0.034)** | 0.173 (0.077)–0.211 (0.120) |
| DR-Learner | 0.148 (0.042)–0.097 (0.029) | 0.164 (0.068)–0.203 (0.108) |
| M-Learner | 1.04 (0.423) | 0.898 (0.417) |

### 手法比較（誤差上界と $K$ 依存性のまとめ）

| Learner | 誤差上界 | $K$ 増加時 | 特徴 |
|---|---|---|---|
| T / naive X | $O(1/\rho(t_k)+1/\rho(t_0))$ | 劣化 | 各処置サンプル希薄化に脆弱 |
| M | $O(1/r_{min}^{1+\epsilon})$ | 悪い | 傾向スコア感度が致命的 |
| DR | $O((err_k+err_0)/r_{min}^{1+\epsilon})$ | 頑健だが高分散 | doubly robust |
| X | $O(K^2\sum_{l\neq k}err_{t_l})$ | 良好（S土台時） | 観測設定で最良 |

（図の img URL は ar5iv 抽出範囲では未取得のため 記載なし）

---

## Experiments & Evaluation

### Setup
- **データ**: Linear RCT（合成, $n=2000$, $K=10$）、Hazard Rate（観測合成, $n=10000$, $K=10$）、Heat Extraction（準合成, $n=10000$, $K=13$）。
- **ベース学習器**: XGBoost, RandomForest。
- **指標**: mPEHE（$K$ 水準の PEHE 二乗平均平方根）、sdPEHE。
- **コード**: https://github.com/nacharki/multipleT-MetaLearners

### Main Results
- **RCT 設定**: S-Learner が最良（XGBoost で mPEHE=0.033）、improved X-Learner が同等（0.033）。
- **観測設定（Hazard Rate）**: X-Learner が最良（XGBoost で 0.167）。
- **準合成（Heat, $K=13$）**: S-Learner 0.101、improved X-Learner 0.094 が優位。
- **M-Learner は全設定で桁違いに悪い**（RCT で 1.25, 観測で 1.61, 準合成で 1.04）。

### Ablation / 分析
- 処置数 $K$ の増加に対し T-/naive X-learner が劣化する一方、S-learner は $K\ge 10$ で安定し、疑似アウトカム学習器（X/DR）の土台として機能。
- ベース学習器（XGBoost vs RF）で最良手法が変化する場合があり、学習器選択も重要。

---

## 本テーマへの適用可能性

本テーマ（複数クーポン額＝多値処置の per-user uplift 推定、スパースキャンペーンのプール）に対し、本論文は「どの meta-learner を base estimator に据えるか」の直接的な設計指針を与える。

- **多値処置そのものが主題**: 「500/1000/2000円クーポン」を $t_1, t_2, t_3$ とする多値処置に、T/S/X/M/DR/R-learner のどれが向くかを $K$ の関数で理論・実証済み。本テーマの中心課題と完全に一致する。
- **S-Learner を土台に据える推奨**: 各クーポン額のサンプルが希薄（スパースキャンペーン）な状況では、処置ごとに別モデルを立てる T-learner は $O(1/\rho(t_k))$ で劣化する。単一モデルで全処置をプールする S-learner は $K\ge10$ で安定し、これを土台とした X-/DR-learner が観測設定で最良（X-learner mPEHE=0.167）。**pooled base estimator という本テーマの運用は S-learner 土台と整合的**。
- **M-Learner は避けるべき**: 不定期キャンペーンでは各クーポン額の配信割合 $\rho(t_k)$ が偏りやすく傾向スコアが小さい水準が出る。M-learner はこの $1/r_{min}$ 感度で全設定で桁違いに悪化（1.2〜1.6）したため、実務での採用は非推奨。
- **観測ログ混在時は X-/DR-learner**: RCT でない自然配信ログを使う場合、doubly robust 性を持つ DR-learner か、分散の小さい X-learner が有効。ただし DR は高分散なので、キャンペーン数が少ないうちは X-learner が無難。
- **留意点**: 本論文の処置は順序性ある多値（用量的）を想定。メッセージ種別のような順序なしカテゴリ処置には、水準ごとの T/S 拡張として素直に適用できるが、$K$ 増加時の劣化に注意。連続クーポン額なら GCF（09）や OFA（06）との併用も検討価値あり。

---

## Notes

- ICML 2023 採択。理論（誤差上界）と実証（mPEHE）を両立させた稀な多値処置 meta-learner 比較論文。
- R-Learner は正則化なしで非識別性に陥るとの指摘があり、本文の主要表では詳細数値の扱いが限定的。
- 図の実 img URL は抽出範囲外のため 記載なし（arXiv HTML 版は 404、ar5iv 版を使用）。
