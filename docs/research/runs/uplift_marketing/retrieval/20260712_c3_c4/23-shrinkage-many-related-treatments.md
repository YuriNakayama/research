# Shrinkage-Based Regressions with Many Related Treatments

- **Link**: https://arxiv.org/abs/2507.01202
- **Authors**: Enes Dilber, Colin Gray
- **Year**: 2025 (submitted 2025-07-01)
- **Venue**: arXiv preprint（econ.EM; stat.ME; stat.ML）。査読付き会議・ジャーナル情報は記載なし
- **Type**: 方法論論文（因果推論 / トリートメント効果推定）。Wayfair での実応用を含む

---

## Abstract (English)

The researchers propose a computationally efficient method using customized ridge regression to estimate effects of numerous interconnected treatments in observational studies. Their approach balances between heterogeneous and homogeneous modeling, achieving substantially reduced MSE for the effects of each individual sub-treatment while enabling aggregated treatment effect reconstruction. They validate the estimator through theory and simulation, demonstrating practical application at Wayfair.

> 注: 上記は WebFetch により取得した要旨の要約的再構成である。逐語の完全一致は保証されないため、正確な引用時は原文 https://arxiv.org/abs/2507.01202 を参照のこと。

## Abstract（日本語訳）

本研究は、観察研究において多数の相互に関連するトリートメント（treatment）の効果を推定するための、計算効率の高い手法をカスタマイズした ridge 回帰によって提案する。この手法は、異質（heterogeneous）モデリングと同質（homogeneous）モデリングの間のバランスを取り、個々のサブトリートメント効果について MSE を大幅に削減しつつ、集約されたトリートメント効果の再構成を可能にする。著者らは理論とシミュレーションによって推定量を検証し、Wayfair における実務適用を示している。

---

## Overview

実務のマーケティング分析や施策評価では、「多数の関連する細かい施策（sub-treatment）」の効果を同時に推定したい場面が頻繁に生じる。例として、複数のマーケティングタッチポイント、複数の商品カテゴリ、複数のクーポン種別などが挙げられる。ここには次のトレードオフが存在する。

- **集約トリートメント（1本）として推定** → サンプルが集まり精度は高いが、粒度（どのサブ施策が効いたか）が失われる。
- **各サブトリートメントを別々に推定** → 粒度は得られるが、希少なサブ施策はサンプルが薄く、推定値がノイズだらけで意思決定に使えない。

本論文は、**focal function（焦点関数）** という枠組みで「共有される集約成分」と「ペナルティ付きのサブトリートメント成分」を1つのモデルに統合し、カスタマイズした ridge 回帰で解く。鍵は、集約効果に対応するパラメータ $\beta_0$ を **無penalty** にしたまま、サブ効果 $\beta_k$ のみを縮小（shrinkage）する点にある。これにより、(1) 各サブ効果は希少なほど集約平均へ縮小されて MSE が下がり、(2) 集約トリートメント効果 $\tau_0$ は penalty の強さ $\lambda$ に依存せず不変に再構成できる、という2つの性質を同時に満たす。

---

## Problem

- 多数の相互関連するサブトリートメントの効果を、観察データから同時推定したい。
- サブトリートメントごとに **発生頻度（prevalence）が大きく異なる**。希少な施策はサンプルが薄く、独立推定すると分散が爆発する。
- 「集約1本」では粒度が失われ、「完全に別々」ではノイズが大きい、という heterogeneous vs homogeneous のジレンマ。
- 集約効果とサブ効果の **整合性**（サブ効果を足し合わせると集約効果に一致する）を保ちたい。
- 計算コストを抑え、実運用（大規模データ、多クラス）でスケールさせたい。
- 交絡（confounding）を制御した上での推定が必要。

---

## Proposed Method

### コアアイデア

構造方程式は、共有される「focal（集約）」成分と、各サブトリートメント成分を分離して表現する。

$$
Y_i = f(X_i) + \beta_0 \max_k(D_{ki}) + \sum_k \beta_k D_{ki} + \epsilon_i
$$

ここで $D_{ki}$ は $i$ が $k$ 番目のサブトリートメントを受けたかを表すダミー、$\max_k(D_{ki})$ は「いずれかのサブトリートメントを受けたか」を表す **focal aggregation function**（集約ダミー、以下 $D'_i$）、$f(X_i)$ は交絡を捉える関数。

### 手順

1. **交絡の残差化（Robinson transformation）**: アウトカム $Y$ と各トリートメント指標を共変量 $X$ で残差化し、$\tilde{Y}_i$, $\tilde{D}'_i$, $\tilde{D}_{ki}$ を得る（partialling-out）。これにより $f(X_i)$ による交絡を除去する。
2. **カスタマイズ ridge 回帰を解く**: focal パラメータ $\beta_0$ は無penalty、サブ効果 $\beta_k$ のみに $\ell_2$ ペナルティを課す。
3. **$\lambda$ のチューニング**: cross-validation で penalty を選択する（closed-form 解のため再推定が高速）。
4. **集約効果の再構成**: 推定された $\beta_0, \beta_k$ から $\tau_0$ を解析的に再構成する（後述の不変性により $\lambda$ 非依存）。

### Key Formulas

**カスタマイズ ridge 目的関数**（focal パラメータ $\beta_0$ を無penalty に）:

$$
\min_{\beta_0, \beta_k} \sum_i \left(\tilde{Y}_i - \beta_0 \tilde{D}'_i - \sum_k \beta_k \tilde{D}_{ki}\right)^2 + \lambda \, \lVert \beta_k \rVert_2
$$

ペナルティ行列（focal 成分のみ 0）:

$$
\Lambda = \mathrm{diag}(0, \lambda, \lambda, \ldots, \lambda)
$$

**性質1 — 収束**: $\lambda \to \infty$ で係数は単一トリートメント射影に収束する。

$$
\tau_0 = \frac{\mathbb{E}[Y \tilde{D}']}{\mathbb{E}[\tilde{D}'^2]}
$$

**性質2 — 有限penalty での集約効果再構成**: 任意の $\lambda$ で集約効果は次式で再構成できる。

$$
\tau_0 = \beta_0 + \sum_k \beta_k \cdot \frac{\mathbb{E}[\tilde{D}' \tilde{D}_k]}{\mathbb{E}[\tilde{D}'^2]}
$$

**性質3 — 不変性**: 一階条件が任意の penalty 水準で $\mathbb{E}[(Y - Y^\lambda)\tilde{D}'] = 0$ を保証するため、再構成された $\tau_0$ は $\lambda$ に依存しない。

---

## Algorithm

```text
Input:  data {(Y_i, X_i, D_{ki})}, sub-treatments k = 1..K, penalty grid {λ}
Output: aggregate effect τ0, sub-treatment effects {β_k}

1. 集約ダミー D'_i = max_k(D_{ki}) を構築
2. Robinson 残差化:
     f_Y  = E[Y  | X]  を推定し  Ỹ_i  = Y_i  - f_Y(X_i)
     f_D' = E[D' | X]  を推定し  D̃'_i = D'_i - f_D'(X_i)
     for each k: f_Dk = E[D_k | X];  D̃_{ki} = D_{ki} - f_Dk(X_i)
3. ペナルティ行列 Λ = diag(0, λ, ..., λ) を構成（focal 成分のみ 0）
4. closed-form ridge 解:
     β = (Z̃'Z̃ + Λ)^{-1} Z̃'Ỹ,   Z̃ = [D̃', D̃_1, ..., D̃_K]
5. λ を cross-validation で選択（4 を再評価するだけ、反復最適化不要）
6. 集約効果を再構成:
     τ0 = β0 + Σ_k β_k · E[D̃' D̃_k] / E[D̃'^2]
7. return τ0, {β_k}
```

---

## Architecture / Process Flow

```text
 ┌───────────────────────────┐
 │  観察データ (Y, X, D_k)   │
 └────────────┬──────────────┘
              ▼
 ┌───────────────────────────┐
 │ focal 集約ダミー D' = max_k D_k │
 └────────────┬──────────────┘
              ▼
 ┌───────────────────────────┐
 │ Robinson 残差化 (X で partial out) │  → Ỹ, D̃', D̃_k
 └────────────┬──────────────┘
              ▼
 ┌────────────────────────────────────┐
 │ カスタマイズ ridge:                 │
 │  β0 無penalty  /  β_k に λ penalty  │
 │  Λ = diag(0, λ, …, λ)              │
 └────────────┬───────────────────────┘
              ▼
   ┌──────────────────┬────────────────────┐
   ▼                  ▼                    ▼
 希少 D_k は          高頻度 D_k は        集約効果 τ0 を
 集約平均へ縮小        安定に保持          λ 非依存で再構成
 (MSE 低下)                              (性質2,3)
```

---

## Figures & Tables

本論文には数値表は掲載されていない（すべて図で提示）。以下は HTML 版で実際に確認した図である。

### 図1: サブトリートメント効果の shrinkage path

![Sub-treatment effect estimates under varying ridge penalties. Left: Estimated heterogeneous treatment effects τ_k at three penalty levels. Right: Shrinkage paths showing convergence of each τ_k toward the single-treatment estimator (dashed line).](https://arxiv.org/html/2507.01202v1/x1.png)

3つの penalty 水準における異質トリートメント効果 $\tau_k$（左）と、各 $\tau_k$ が単一トリートメント推定量（破線）へ収束していく shrinkage path（右）。希少な施策（$p=0.05$）は集約側へ強く縮小され、高頻度施策（$p=0.2$）は安定。

### 図2: MSE 分解（bias² + variance）

![Mean squared error (MSE) decomposition into squared bias and variance for each target parameter τ_k in Equation (10). Treatments with higher prevalence (τ1, τ3, τ5) exhibit stable estimation across penalty values, while rarer treatments (τ2, τ4, τ6) suffer high variance at low penalties.](https://arxiv.org/html/2507.01202v1/x2.png)

各 $\tau_k$ の MSE を bias² と variance に分解。高頻度な $\tau_1, \tau_3, \tau_5$ は penalty 全域で安定、希少な $\tau_2, \tau_4, \tau_6$ は低penalty 時に分散が大きく、正則化で恩恵を受ける。

### 図3: Wayfair 実データ — 53 商品クラスの推定

![Estimated heterogeneous treatment effects for 53 anonymized product classes at three penalty levels: no penalty (λ=0), optimal penalty (λ=0.001), and extreme penalty (λ=100). Classes sorted by prevalence. High-prevalence categories (top) exhibit lower variance and are less affected by regularization. Low-prevalence categories (bottom) are more strongly shrunk toward the global average.](https://arxiv.org/html/2507.01202v1/x3.png)

53 の匿名化商品クラスについて、$\lambda=0$（無penalty）、$\lambda=0.001$（最適）、$\lambda=100$（極端）の3水準で異質効果を推定。prevalence 順にソート。高頻度カテゴリ（beds, rugs 等、上部）は分散が低く正則化の影響が小さい。低頻度カテゴリ（flooring, pet 等、下部）は global average へ強く縮小される。

### 手法比較表（本文記述からの整理）

| 手法 | 粒度 | 希少施策の分散 | 集約効果との整合性 | 計算コスト |
|------|------|----------------|--------------------|-----------|
| 集約1本（single treatment） | なし | 低（サンプル多） | 自明 | 低 |
| 各サブ効果を独立推定（heterogeneous） | 高 | 高（ノイズ大） | 保証なし | 中 |
| 通常 ridge（全係数を penalty） | 高 | 低 | 集約効果が biased | 低 |
| **本手法（focal 無penalty ridge）** | 高 | 低（縮小で改善） | $\lambda$ 非依存で再構成可 | 低（closed-form） |

---

## Experiments & Evaluation

### Setup（シミュレーション）

- **サブトリートメント数**: 6 個（binary）。
- **発生確率**: $p = [0.2, 0.05, 0.2, 0.05, 0.2, 0.05]$（高頻度と希少を交互配置）。
- **アウトカム生成**: $Y_i = 5 \cdot D'_i + [2,2,1,1,-1,-1] \cdot \mathbf{D}_{ki}$（集約効果 5、サブ効果は符号・大きさが多様）。
- **評価**: 各 $\tau_k$ の推定を bias² と variance に分解して MSE を評価。

### Main Results（具体的数値）

- **図1**: 希少施策（$p=0.05$）は penalty 増加とともに集約推定量（破線）へ **積極的に縮小**、高頻度施策（$p=0.2$）は安定を維持。
- **図2**: 希少な $\tau_2, \tau_4, \tau_6$ は低penalty 時に **高分散**、正則化により MSE 改善。高頻度な $\tau_1, \tau_3, \tau_5$ は penalty 全域で安定。
- **集約効果**: 性質3（不変性）により、再構成 $\tau_0$ は $\lambda$ に依存せず一貫（真値 5 に対応）。
- 定量的な MSE 削減率などの具体数値は本文表として提示されておらず: 記載なし。

### 実データ応用（Wayfair）

- **対象**: 53 商品クラスの、長期の顧客支出（long-term customer spending）への効果。
- **penalty 水準**: $\lambda = 0,\ 0.001,\ 100$ の3点で比較。$\lambda=0.001$ が最適。
- **結果**: 高頻度カテゴリは正則化強度によらず安定。希少商品クラスは global mean へ大きく縮小 — これはサンプル削減の当然の帰結であり、手法のアーティファクトではないと解釈。

### Ablation

- penalty $\lambda$ を 3 水準（0 / 最適 / 極端）で変化させることが実質的な ablation となっており、無penalty では希少効果が過剰にノイジー、極端penalty では集約へ完全縮小、最適 $\lambda$ でバランスが取れることを示す（図1・図3）。
- focal パラメータを無penalty にする設計の妥当性は、性質1〜3（集約効果の $\lambda$ 不変再構成）として理論的に裏付けられている。

---

## 本テーマへの適用可能性

**想定シナリオ**: データサイエンティストが、対象ユーザーや施策内容の異なるマーケティングキャンペーン（クーポン・メール等）を **不定期・低頻度** で実施しており、類似キャンペーンをグルーピング／プーリングしてデータを稠密化し、実効サンプルサイズを増やし、実効的な実験間隔を短縮したい（uplift モデリング / off-policy 評価向け）。

本手法はこの課題に対して直接的に有効である。

1. **類似キャンペーンのプーリング（borrow strength）**: 各キャンペーン（クーポン種別・配信セグメント等）を1つのサブトリートメント $D_k$ と見なし、「いずれかのキャンペーンを受けたか」を focal 集約 $D' = \max_k D_k$ とする。focal 成分 $\beta_0$ が全キャンペーン横断の共有効果を捉えるため、希少なキャンペーンでも集約側から強度を借用（borrow strength）でき、単独では推定できない薄いデータのキャンペーン効果を安定推定できる。

2. **実効データ密度の向上**: 図2・図3 が示すとおり、prevalence（発生頻度）の低い施策ほど shrinkage の恩恵が大きい。不定期・低頻度キャンペーンはまさに希少サブトリートメントに該当し、集約平均へ縮小されて分散（＝MSE）が下がる。これは「疎な複数キャンペーンを1つの稠密な集約情報＋補正項として扱う」ことに等しく、実効サンプルサイズを増やす効果を持つ。

3. **実効的な実験間隔の短縮**: 個別キャンペーンごとに十分なサンプルが貯まるのを待つ必要がなく、関連キャンペーンをプールして早期に効果推定できるため、「次の意思決定までの待ち時間」を短縮できる。低頻度施策でも、集約効果 + 縮小されたサブ効果として毎回情報を積み増せる。

4. **集約⇔粒度の両立（uplift × 全体効果）**: 性質2・3 により、集約キャンペーン効果 $\tau_0$ は penalty $\lambda$ に依存せず一貫再構成できる一方、個別キャンペーンの uplift（$\beta_k$）も同時に得られる。「全体でどれだけ効いたか」と「どの施策が効いたか」を1モデルで整合的に取得でき、off-policy 評価の粒度と安定性を両立する。

5. **運用上の利点**: closed-form ridge のため、$\lambda$ を cross-validation で選び直しても即座に再推定でき、キャンペーンが1つ増えるたびに軽量に更新可能。Robinson 残差化により観察データ由来の交絡（ユーザー属性・セグメントの偏り）も制御できるため、RCT でない履歴キャンペーンデータにも適用しやすい。

**留意点**: 本手法は「サブトリートメント同士が集約 focal を共有するほど関連している」という前提に立つ。ターゲットユーザーや施策メカニズムが本質的に異質なキャンペーンを無理にプールすると、集約への縮小がバイアスを生む可能性がある。グルーピングの単位（どのキャンペーンを1つの focal に束ねるか）はドメイン知識で慎重に設計する必要がある。

---

## Notes

- Venue は arXiv preprint（2025-07-01 投稿、カテゴリ econ.EM / stat.ME / stat.ML）。査読付き発表先は本ページ上では確認できず: 記載なし。
- 実応用は Wayfair（家具 EC）で、long-term customer spending への 53 商品クラスの効果推定。
- 数値テーブルは論文中に存在せず、結果はすべて図1〜3で提示される。図の URL は HTML 版（v1）で実際に確認したもののみ埋め込んだ（x1.png / x2.png / x3.png）。
- 要旨（英語）は WebFetch 取得の要約再構成であり、逐語一致は保証されない。厳密な引用時は原論文を参照のこと。
- MSE の定量削減率、Wayfair の具体的な効果量などの数値は本文（本調査で取得した範囲）に明示されておらず「記載なし」とした。
