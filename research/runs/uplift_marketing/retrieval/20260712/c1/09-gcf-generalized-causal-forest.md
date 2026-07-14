# GCF: Generalized Causal Forest for Heterogeneous Treatment Effect Estimation in Online Marketplace

- **Link**: https://arxiv.org/abs/2203.10975
- **Authors**: Shu Wan, Chen Zheng, Zhonggen Sun, Mengfan Xu, Xiaoqing Yang, Hongtu Zhu, Jiecheng Guo
- **Year**: 2022 投稿（2022-03-21）/ 2022-09-23 改訂
- **Venue**: arXiv (stat.ML)
- **Type**: 手法提案 + 本番デプロイ（連続処置 causal forest）

---

## Abstract (English)

> Uplift modeling is a rapidly growing approach that utilizes causal inference and machine learning methods to directly estimate the heterogeneous treatment effects, which has been widely applied to various online marketplaces to assist large-scale decision-making in recent years. The existing popular models, like causal forest (CF), are limited to either discrete treatments or posing parametric assumptions on the outcome-treatment relationship that may suffer model misspecification. However, continuous treatments (e.g., price, duration) often arise in marketplaces. To alleviate these restrictions, we use a kernel-based doubly robust estimator to recover the non-parametric dose-response functions that can flexibly model continuous treatment effects. Moreover, we propose a generic distance-based splitting criterion to capture the heterogeneity for the continuous treatments. We call the proposed algorithm generalized causal forest (GCF) as it generalizes the use case of CF to a much broader setting. We show the effectiveness of GCF by deriving the asymptotic property of the estimator and comparing it to popular uplift modeling methods on both synthetic and real-world datasets. We implement GCF on Spark and successfully deploy it into a large-scale online pricing system at a leading ride-sharing company. Online A/B testing results further validate the superiority of GCF.

## Abstract (日本語)

Uplift modeling は因果推論と機械学習で異質処置効果を直接推定する急成長中の手法で、近年オンラインマーケットプレイスの大規模意思決定に広く応用されている。causal forest (CF) など既存の人気モデルは、離散処置に限定されるか、アウトカム–処置関係にパラメトリック仮定を課しモデル誤特定に陥る。しかしマーケットプレイスでは連続処置（価格、時間など）がしばしば生じる。この制約を緩和するため、本論文は **カーネルベース doubly robust 推定量** で連続処置効果を柔軟にモデル化する非パラメトリック用量反応関数を復元する。さらに連続処置の異質性を捉える **距離ベース分割基準** を提案する。CF の適用範囲を大幅に一般化することから本手法を **generalized causal forest (GCF)** と呼ぶ。推定量の漸近性質を導出し、合成・実世界データで人気手法と比較して有効性を示す。GCF を Spark 上に実装し、大手配車企業の大規模オンライン価格システムに本番デプロイ。オンライン A/B テストでも優位性を検証した。

---

## Overview

本論文は causal forest を連続処置へ一般化した GCF を提案し、合成データ・実世界配車データ・本番 A/B の3層で検証する。核心は (1) カーネルベース doubly robust 推定量で非パラメトリックな用量反応関数（DRF）を復元、(2) 木の分割を「子ノード間の用量反応曲線の距離最大化」として定式化する距離ベース分割基準、の2点。これにより価格・時間などの連続処置の異質効果を、モデル誤特定なしに捉える。連続クーポン額を扱う本テーマにとって、pooled で頑健な連続処置 CATE 推定器の有力候補であり、Spark 実装・本番デプロイ実績も実務適用の裏付けになる。

---

## Problem（課題の整理）

- causal forest (CF) は離散処置に限定、またはアウトカム–処置関係にパラメトリック仮定を要しモデル誤特定リスク。
- マーケットプレイスでは価格・時間など連続処置が常態。
- 連続処置の用量反応関数（DRF）を非パラメトリックに推定する枠組みが必要。
- 木ベース手法で連続処置の「異質性」を捉える分割基準が未整備。
- 大規模データでの分散実装・本番運用が課題。

---

## Proposed Method: Generalized Causal Forest (GCF)

### 核心アイデア

各葉ノードで連続処置の用量反応関数 $\mu(t,x)$ をカーネルベース doubly robust 推定量で復元し、木の分割は「分割後の子ノード間で DRF が最も離れる」ように距離ベース基準で選ぶ。honesty（訓練用と推定用のサンプル分離）を用いて漸近正規性を担保する。

### 手順（numbered steps）

1. データ $\Omega$ を $\Omega_1$（割合 $\alpha$）と $\Omega_2$（$1-\alpha$）に分割（honesty）。
2. $\Omega_1$ で結果回帰 $\hat\mu$ と処置密度 $\hat\pi$ を事前学習。
3. 各木で、距離ベース分割基準 $\Delta$ を最大化する分割を再帰的に選ぶ。
4. $\Omega_2$ サンプルを葉に割当。
5. 予測時、葉内で DRF と CATE を推定し $B$ 本の木で平均。

### Key Formulas

用量反応関数（DRF）のカーネルベース doubly robust 推定量:

$$ \hat\mu(t) = \frac{1}{n}\sum_{i=1}^{n}\Big[\hat\mu(t,X_i) + \frac{K_h(T_i,t)}{\hat\pi(t\mid X_i)}\big(Y_i - \hat\mu(t,X_i)\big)\Big] $$

子ノードでの DRF 推定:

$$ \tilde\mu_c(t) = \frac{1}{|n_c|}\sum_{i\in c}\Big[\hat\mu(t,X_i) + \frac{K_h(T_i - t)}{\hat\pi(t\mid X_i)}\big(Y_i - \hat\mu(t,X_i)\big)\Big] $$

距離ベース分割基準:

$$ \Delta(C_1, C_2) = \frac{n_{C_1} n_{C_2}}{n_P}\,\big\|\hat\theta_{C_1} - \hat\theta_{C_2}\big\|_F^2 = \frac{n_{C_1} n_{C_2}}{n_P}\,D(\hat\theta_{C_1}, \hat\theta_{C_2}) $$

距離指標の候補:

$$ D_1=\!\int|\hat\theta_{C_1}(t)-\hat\theta_{C_2}(t)|dt,\quad D_2=\!\int|\hat\theta_{C_1}(t)-\hat\theta_{C_2}(t)|^2 dt,\quad D_\infty=\max_t|\hat\theta_{C_1}(t)-\hat\theta_{C_2}(t)| $$

漸近性質（Theorem 1）:

$$ \big\|\hat\theta_x(t) - \theta_x(t)\big\|_F \to 0 \quad (n\to\infty) $$

---

## Algorithm（Pseudocode）

```
# Training stage
1: split Omega -> Omega1 (alpha), Omega2 (1-alpha)   # honesty
2: pretrain mu_hat, pi_hat on Omega1
3: for b = 1..B trees:
4:     recursively split nodes maximizing Delta(C1,C2)  # distance-based
5:     assign Omega2 samples to leaves L_b
# Prediction stage
6: CDRF: mu_hat_b(t,x) = sum_{i in L_b(x)} 1{T_i=t} Y_i / |L_b(x)|
7: CATE: theta_hat_b(t,x) = mu_hat_b(t,x) - mu_hat_b(0,x)
8: Final: theta_hat(t,x) = (1/B) sum_b theta_hat_b(t,x)
```

---

## Architecture / Process Flow

```
 データ Ω
   │ honest split
   ├─ Ω1 ─► 事前学習: μ̂(t,x), π̂(t|x)
   │
   └─ Ω2 ─► B 本の木を構築
                │  各分割: 距離基準 Δ(C1,C2) 最大化
                │  （子ノード間で DRF が最も離れる分割を選択）
                ▼
        葉ごとに DRF 推定 → CATE θ̂_b(t,x) = μ̂_b(t,x) - μ̂_b(0,x)
                │
        B 本平均 → θ̂(t,x)  ──► Spark 実装 ──► オンライン価格システム
```

---

## Figures & Tables（主要図表）

### Figure（img URL）
- Figure 1（スナップショット）: `https://arxiv.org/html/2203.10975/assets/figures/snapshot.png`
- Figure 2（ODT 需要曲線）: `https://arxiv.org/html/2203.10975/assets/figures/odt_demand_curve.png`
- Figure 3（合成 DRF, sinusoidal）: `https://arxiv.org/html/2203.10975/assets/figures/1000,100,50,5,5,drf_sin.png`
- Figure 4（フローチャート）: `https://arxiv.org/html/2203.10975/assets/figures/flowchart.png`

### Table 1: 合成データ結果（100 run, 括弧内 SE, 指標 PEHE / RMSE, 小さいほど良い）

| データセット | 手法 | PEHE | RMSE |
|---|---|---|---|
| Polynomial | RF | 5.63 (0.4) | 4.61 (0.3) |
| Polynomial | CF | 14.09 (0.4) | 12.58 (0.4) |
| Polynomial | Kennedy | 4.37 (0.5) | 3.36 (0.5) |
| Polynomial | **GCF** | **4.14 (0.3)** | **2.88 (0.2)** |
| Sinusoidal | RF | 4.27 (0.4) | 3.21 (0.2) |
| Sinusoidal | CF | 5.15 (0.4) | 3.96 (0.2) |
| Sinusoidal | Kennedy | 4.14 (0.5) | 2.78 (0.3) |
| Sinusoidal | **GCF** | **4.05 (0.4)** | **2.7 (0.3)** |
| Exponential | RF | 3.57 (0.4) | 2.62 (0.2) |
| Exponential | CF | 4.34 (0.3) | 3.37 (0.2) |
| Exponential | Kennedy | 3.86 (0.4) | 2.54 (0.2) |
| Exponential | **GCF** | **3.85 (0.4)** | **2.48 (0.2)** |

### Table 2: 実世界 Qini スコア（配車データ, 10,698,884 エントリ, 用量水準 d5..d1）

| 手法 | d5 | d4 | d3 | d2 | d1 |
|---|---|---|---|---|---|
| XGBoost | 0.253 | 0.171 | 0.177 | 0.206 | 0.177 |
| CF | 0.253 | 0.194 | 0.202 | 0.272 | 0.300 |
| **GCF** | **0.309** | **0.248** | **0.305** | **0.444** | **0.780** |

### Table 3: オンライン A/B テスト（完了注文数改善, vs Causal Forest）

| 戦略 | 完了注文改善 |
|---|---|
| 単一モビリティ戦略 | +15.1% |
| デュアルモビリティ戦略 | +25.2% |

---

## Experiments & Evaluation

### Setup
- **合成データ**: $n=1000$, $p_X=50$, $p_Y=5$, $p_Z=5$。3種の DRF（Polynomial, Sinusoidal, Exponential）。
- **ベースライン**: Random Forest, Causal Forest (CF), Kennedy (2017, 非パラメトリックカーネル法)。
- **指標**: PEHE, RMSE, ADRF（平均用量反応関数）。
- **実世界**: 配車データ 10,698,884 エントリ、Qini スコア（用量水準別）。
- **本番**: Spark 実装、大手配車企業のオンライン価格システムにデプロイ。

### Main Results
- 合成 3 種すべてで GCF が最小 PEHE/RMSE（例 Polynomial PEHE=4.14 は CF の 14.09 を大幅に下回る）。
- 実世界 Qini で全用量水準にわたり GCF が最優（d1 で 0.780、CF の 0.300 を大きく上回る）。
- オンライン A/B で完了注文を単一戦略 **+15.1%**、デュアル戦略 **+25.2%** 改善。

### Ablation
- 距離指標（$D_1, D_2, D_\infty$）の選択で分割挙動が変化。
- honesty（$\alpha$ 分割）が漸近正規性の担保に必要。

---

## 本テーマへの適用可能性

本テーマ（連続クーポン額の per-user uplift、スパースキャンペーンのプール）に対し、GCF は「連続処置に強い pooled base estimator」の最有力候補となる。

- **連続クーポン額を非パラメトリックに扱える**: GCF は用量反応関数 $\mu(t,x)$ を多項式・正弦・指数いずれの形状でもモデル誤特定なく復元でき（合成 3 種で最小 PEHE）、「クーポン額に対する反応が線形とは限らない（閾値・逓減がある）」という実務の非線形性に対応する。連続クーポン額 $t$ に対する per-user の用量効果 $\theta_x(t)$ を直接得られる。
- **価格系処置で本番実績**: 配車の価格最適化で本番デプロイ・A/B 改善（+15.1〜25.2%）済み。クーポン額は「負の価格」と見なせるため、価格系の連続処置に強い GCF は概念的に転用しやすい。
- **pooled base estimator に向く**: 木ベースで honesty を用いるため、複数キャンペーンのデータをプールしても過学習しにくく、distance-based 分割が「どの共変量でクーポン反応が異質か」を自動発見する。本テーマの「base estimator later pooled across sparse campaigns」に直接合致。doubly robust なので観測ログの傾向スコア誤差にも頑健。
- **割当最適化と接続可能**: GCF が出す連続用量反応 $\theta_x(t)$ を、08 の ILP 割当（predict-then-optimize）に CADR として渡せば、「予算内で誰にいくらのクーポン」を最適化する完全パイプラインになる。
- **留意点**: Spark 実装前提の大規模設計で、小規模・不定期キャンペーンでは計算コストが過剰になりうる。データ量が少ないうちは 07 の S-learner 土台の方が手軽。またカーネル帯域 $h$ と用量密度 $\hat\pi(t\mid x)$ の推定品質が結果に効くため、クーポン配信ポリシーの傾向スコア推定を丁寧に行う必要がある。

---

## Notes

- CF・GRF の系譜を連続処置へ一般化した実務志向の論文。理論（漸近正規性）・合成・実世界・本番 A/B の4層検証は説得力が高い。
- 実世界データは配車の価格系で、マーケティングのクーポン額とは領域が異なるが連続処置という点で転用性が高い。
- 図 img URL は ar5iv 抽出の相対パス（`assets/figures/...`）を arXiv HTML の絶対 URL に補完して記載。
