# Transfer Learning of CATE with Kernel Ridge Regression (COKE)

- **Link**: https://arxiv.org/abs/2502.11331
- **Authors**: Seok-Jin Kim (Columbia University, IEOR), Hongjie Liu (Purdue University, Statistics), Molei Liu (Peking University Health Science Center / Beijing International Center for Mathematical Research), Kaizheng Wang (Columbia University, IEOR & Data Science Institute)
- **Year**: 2025 (v1: 2025-02-17, v3: 2025-05-14)
- **Venue**: arXiv preprint（stat.ME 主分類、cs.LG / stat.ML にもクロスリスト）。査読付き会議・ジャーナル掲載は記載なし
- **Type**: 方法論・理論論文（因果推論 / 転移学習 / ノンパラメトリック回帰）
- **Code**: https://github.com/hongjiel/COKE

---

## Abstract (English, verbatim)

> The proliferation of data has sparked significant interest in leveraging findings from one study to estimate treatment effects in a different target population without direct outcome observations. However, the transfer learning process is frequently hindered by substantial covariate shift and limited overlap between (i) the source and target populations, as well as (ii) the treatment and control groups within the source. We propose a novel method for overlap-adaptive transfer learning of conditional average treatment effect (CATE) using kernel ridge regression (KRR). Our approach involves partitioning the labeled source data into two subsets. The first one is used to train candidate CATE models based on regression adjustment and pseudo-outcomes. An optimal model is then selected using the second subset and unlabeled target data, employing another pseudo-outcome-based strategy. We provide a theoretical justification for our method through sharp non-asymptotic MSE bounds, highlighting its adaptivity to both weak overlaps and the complexity of CATE function. Extensive numerical studies confirm that our method achieves superior finite-sample efficiency and adaptability. We conclude by demonstrating the effectiveness of our approach using a 401(k) eligibility dataset.

*Keywords: Data integration; Conditional average treatment effect (CATE); Covariate shift; Weak overlap; Model selection; Pseudo-outcomes.*

## Abstract (日本語訳)

> データの爆発的増加に伴い、ある研究で得られた知見を、直接的なアウトカム観測が存在しない別の対象母集団（target population）における処置効果の推定に活用したいという関心が高まっている。しかし転移学習のプロセスは、(i) source 母集団と target 母集団の間、および (ii) source 内の処置群（treatment）と対照群（control）の間の、大きな共変量シフト（covariate shift）と限られたオーバーラップ（overlap）によってしばしば阻害される。本論文では、kernel ridge regression (KRR) を用いた条件付き平均処置効果（CATE）の overlap 適応的な転移学習のための新手法を提案する。我々のアプローチは、ラベル付き source データを 2 つの部分集合に分割する。第 1 の部分集合は、regression adjustment と pseudo-outcome に基づく候補 CATE モデルの学習に用いる。次に、別の pseudo-outcome ベースの戦略を用いて、第 2 の部分集合とラベルなしの target データにより最適モデルを選択する。sharp な非漸近的（non-asymptotic）MSE バウンドによって手法の理論的正当化を与え、弱いオーバーラップと CATE 関数の複雑さの双方への適応性を示す。大規模な数値実験により、本手法が優れた有限標本効率と適応性を達成することを確認する。最後に 401(k) 加入資格データセットを用いて手法の有効性を実証する。

---

## Overview

本論文は、**source（実験を行った母集団）で観測した処置・アウトカムを、target（別の母集団、共変量のみ観測）へ転移して CATE を推定する**問題を扱う。提案手法 **COKE**（**T**ransfer learning of **C**ATE with **O**verlap-adaptive **KE**rnel ridge regression）は、次の 2 つの困難を同時に克服する点に新規性がある。

1. **二重の分布シフト（two-fold distribution shift）**: source と target の共変量分布のシフト（covariate shift）に加え、source 内の処置群と対照群の共変量分布のシフト（傾向スコアの偏り）。
2. **弱いオーバーラップ（weak overlap）**: 従来必須とされてきた positivity / strong overlap 仮定（傾向スコアが 0, 1 から離れて有界）を緩め、**傾向スコアが特異（0 や 1 の値をとる）でも成立**する枠組みを与える。ノンパラメトリック CATE 推定で positivity を緩めた初の結果と主張。

COKE は source データを 2 分割し、片方で pseudo-outcome を使った regression adjustment 学習器（RA learner）で複数の候補 CATE モデルを作り、もう片方と target 共変量を使って pseudo-outcome ベースの基準で最良モデルを選択する。理論的には、**effective sample size** \(n_{\mathrm{eff}} = n/(BR)\) を導入し、sharp な非漸近的 MSE バウンド（下界に一致）を証明する。

---

## Problem

- ある因果研究（source）の結果を、処置・アウトカムを観測できない別母集団（target）へ「一般化 / トランスポート」したい（例: RCT の結果を実世界の観測データ集団へ、新薬の効果を別コホートへ）。
- source と target で共変量分布が大きく異なる（covariate shift）と、従来の importance weighting (IW) は有効標本サイズを著しく低下させる（weak overlap 問題）。
- 同一 source 内でも処置群・対照群の割り当てが完全ランダムでないと positivity 違反が生じ、CATE 推定が困難になる。
- 目的の CATE 関数 \(h^\star\) は、nuisance となるアウトカム回帰 \(f_0^\star, f_1^\star\) より単純（滑らか）でありうるが、アウトカムが片方しか観測されない（欠測）ため \(h^\star\) を直接回帰できない。
- 既存の DML / semiparametric 系（Kennedy 2020 等）は strong positivity を前提とし、未知かつ弱いオーバーラップの度合いへの適応ができない。

---

## Proposed Method

### 記法とセットアップ

- source データ \(\mathcal{D} = \{(z_i, a_i, y_i)\}_{i=1}^n\)（\(z\): 共変量, \(a\in\{0,1\}\): 処置, \(y\): アウトカム）。
- target データ \(\mathcal{D}_\mathcal{T} = \{z_{0i}\}_{i=1}^{n_\mathcal{T}}\)（**共変量のみ観測、処置・アウトカムは未観測**）。
- source 共変量 \(z_i \sim \mathcal{Q}_\mathcal{S}\)、target 共変量 \(z_{0i} \sim \mathcal{Q}_\mathcal{T}\)（分布が異なる = covariate shift）。傾向スコア \(a_i \mid z_i \sim \mathrm{Bernoulli}(\pi(z_i))\)、\(\pi\) はモデル化しない。
- source と target でアウトカム回帰は共通と仮定:

$$
f_1^\star(z) = \mathbb{E}_{\mathcal{Q}_\mathcal{S}^\star}[y \mid a=1, z] = \mathbb{E}_{\mathcal{Q}_\mathcal{T}^\star}[y \mid a=1, z], \qquad
f_0^\star(z) = \mathbb{E}_{\mathcal{Q}_\mathcal{S}^\star}[y \mid a=0, z] = \mathbb{E}_{\mathcal{Q}_\mathcal{T}^\star}[y \mid a=0, z].
$$

- **推定対象 CATE**: \(h^\star(z) := f_1^\star(z) - f_0^\star(z)\)。
- **評価指標（target 分布下の MSE）**:

$$
\mathcal{E}_\mathcal{T}(h) = \mathbb{E}_{z\sim\mathcal{Q}_\mathcal{T}}\,\lvert h(z) - h^\star(z)\rvert^2.
$$

- 関数空間 \(\mathcal{F}\) は、有界カーネル \(K\)（\(\sup_z K(z,z)\le\xi\)）が誘導する RKHS \(\mathbb{H}\)。Sobolev / Besov / Matérn / NTK を特別な場合として含む。

### コアアイデア

source データを \(\mathcal{D}_1, \mathcal{D}_2\)（各サイズ \(n_1=n_2=n/2\)）に分割し、

1. **\(\mathcal{D}_1\)**: pseudo-outcome を用いた **RA learner** で、様々な正則化 \(\boldsymbol{\lambda}\) の下で候補 CATE 推定量の集合 \(\mathcal{H}\) を生成。
2. **\(\mathcal{D}_2 + \mathcal{D}_\mathcal{T}\)**: 別の pseudo-outcome ベース基準で、target 上の擬似テストアウトカムを合成し、最良の候補を選択。

これにより、傾向スコアや density ratio をモデル化せずに、未知の弱オーバーラップと CATE 複雑度に**適応**する。

### 手順（RA Learner, Algorithm 1）

1. \(\mathcal{D}_1\) 上で処置別に KRR を実行し nuisance 推定量 \(\hat{f}_0, \hat{f}_1\) を得る（正則化 \(\lambda_{0,0}, \lambda_{0,1}\)）:

$$
\hat{f}_0 := \arg\min_{f\in\mathcal{F}} \left\{ \frac{1}{n_1}\sum_{i=1}^{n_1} (y_{1i}-f(z_{1i}))^2 \mathbf{1}(a_{1i}=0) + \lambda_{0,0}\lVert f\rVert_\mathcal{F}^2 \right\},
$$

$$
\hat{f}_1 := \arg\min_{f\in\mathcal{F}} \left\{ \frac{1}{n_1}\sum_{i=1}^{n_1} (y_{1i}-f(z_{1i}))^2 \mathbf{1}(a_{1i}=1) + \lambda_{0,1}\lVert f\rVert_\mathcal{F}^2 \right\}.
$$

2. **pseudo-outcome** \(\{m_{1i}\}\) を \(\mathcal{D}_1\) 上で構成（観測された側は実測値、欠測側は imputation で補完）:

$$
m_{1i} := \begin{cases} y_{1i} - \hat{f}_0(z_{1i}), & a_{1i}=1, \\ \hat{f}_1(z_{1i}) - y_{1i}, & a_{1i}=0. \end{cases}
$$

3. pseudo-outcome を応答として、正則化 \(\lambda_1\) で **もう一段の KRR** を \(\mathcal{D}_1\) 上に適用し CATE 推定量を得る:

$$
\hat{h}_{\boldsymbol{\lambda}} := \arg\min_{h\in\mathcal{F}} \left\{ \frac{1}{n_1}\sum_{i=1}^{n_1} (m_{1i}-h(z_{1i}))^2 + \lambda_1\lVert h\rVert_\mathcal{F}^2 \right\}.
$$

（separate regression = \(\hat{f}_1-\hat{f}_0\) と異なり、pseudo-outcome への追加回帰を挟むことで CATE 複雑度 \(\lVert h^\star\rVert_\mathcal{F}\) への適応と rate double-robustness を得る。）

### 手順（Model Selection, Algorithm 2）

4. \(\mathcal{D}_2\) 上で小さい正則化 \(\tilde{\lambda}_0=\tilde{\lambda}_1=\xi\log n / n\) を用いて KRR を実行し \(\tilde{f}_0, \tilde{f}_1\) を得る:

$$
\tilde{f}_k := \arg\min_{f\in\mathcal{F}} \left\{ \frac{1}{n_2}\sum_{i=1}^{n_2} (y_{2i}-f(z_{2i}))^2 \mathbf{1}(a_{2i}=k) + \tilde{\lambda}_k\lVert f\rVert_\mathcal{F}^2 \right\}, \quad k\in\{0,1\}.
$$

5. \(\tilde{h} := \tilde{f}_1 - \tilde{f}_0\) を **target 共変量上の擬似テストアウトカム** \(\{\tilde{h}(z_{0i})\}\) として合成し、各候補 \(h\in\mathcal{H}_0\) の二乗損失を最小化する候補を選ぶ:

$$
L(h) = \frac{1}{n_\mathcal{T}}\sum_{i=1}^{n_\mathcal{T}} \big(\tilde{h}(z_{0i}) - h(z_{0i})\big)^2, \qquad \hat{h}_{\mathrm{final}} = \arg\min_{h\in\mathcal{H}_0} L(h).
$$

### 主要理論（MSE バウンド）

**effective sample size**（Definition 1）:

$$
n_{\mathrm{eff}} := \frac{n}{BR},
$$

ここで \(B\ge 1\) は source–target のオーバーラップ（covariate shift の度合い、\(B=1\) は同分布）、\(R\ge 1\) は処置–対照のオーバーラップ（傾向スコアの偏り）。両者とも Assumption 4（weak overlap）で定義され、singular な傾向スコアや density ratio を許容する。

**Theorem 1（最終モデルの MSE バウンド）**: Assumption 1–4 の下、\(n>BR\)、\(\lVert h^\star\rVert_\mathcal{F}\) 有界、\(M:=\max(\lVert f_0^\star\rVert_\mathcal{F}, \lVert f_1^\star\rVert_\mathcal{F})\) とすると、確率 \(1-n^{-10}\) 以上で

$$
\mathcal{E}_\mathcal{T}(\hat{h}_{\mathrm{final}}) \lesssim n_{\mathrm{eff}}^{-\alpha}\,\lVert h^\star\rVert_\mathcal{F}^{2(1-\alpha)} + M^2\left(\frac{1}{n_{\mathrm{eff}}} + \frac{R}{n_\mathcal{T}}\right),
$$

ここで \(\alpha = \dfrac{2\ell}{1+2\ell}\)（\(\ell\) は固有値多項式減衰率、Assumption 3）。第 1 項は KRR の sharp rate（式 6, \(\tilde{\mathcal{O}}(n^{-\alpha}\lVert h^\star\rVert_\mathcal{F}^{2(1-\alpha)})\)）で \(n\to n_{\mathrm{eff}}\) に置換したものであり、**下界（Theorem 3）に一致**。第 2 項は nuisance 複雑度 \(M\) に依存するが高次で無視可能（rate double-robustness に類似）。

**Theorem 3（下界）**: 任意の \((R,B)\)-bounded instance に対し、1 次多項式固有値減衰カーネルが存在し、

$$
\inf_{\hat{h}} \sup_{(f_0^\star, f_1^\star, h^\star):\lVert h^\star\rVert_\mathcal{F}\le W} \mathbb{E}[\mathcal{E}_\mathcal{T}(\hat{h})] \gtrsim \left(\frac{BR}{n}\right)^{2/3} W^{2/3}.
$$

→ effective sample size の導入が本質的であることを示す。

---

## Algorithm（Pseudocode）

```
Algorithm 3  COKE: Transfer learning of CATE with Overlap-adaptive KErnel ridge regression
Require: source data D = {(z_i, a_i, y_i)}_{i=1..n},  target covariates D_T = {z_0i}_{i=1..n_T}

  1. Set grid  Λ1 = { ξ·log n / n, 2ξ·log n / n, ..., 2^q·ξ·log n / n },  q = ceil(2 log n)
     Set λ_{0,0} = λ_{0,1} = ξ·log n / n
  2. Split source data D into D1, D2  (n1 = n2 = n/2)
  3. Define grid  Λ = {λ_{0,0}} × {λ_{0,1}} × Λ1
     for each λ = (λ_{0,0}, λ_{0,1}, λ1) in Λ:
         run Algorithm 1 (RA learner) on D1  ->  candidate CATE estimator  ĥ_λ
  4. Candidate set  H = { ĥ_λ : λ in Λ }
  5. Run Algorithm 2 (Model Selection) with (D2, D_T, H)  ->  ĥ_final
Ensure: ĥ_final

--------------------------------------------------------------------
Algorithm 1  RA Learner   (input: D1, λ = (λ_{0,0}, λ_{0,1}, λ1))
  a. KRR on D1(a=0) with λ_{0,0}  -> f̂_0 ;  KRR on D1(a=1) with λ_{0,1} -> f̂_1
  b. pseudo-outcome:  m_1i = (y_1i - f̂_0(z_1i))·1(a_1i=1) + (f̂_1(z_1i) - y_1i)·1(a_1i=0)
  c. KRR of m_1i on z_1i with λ1  -> ĥ_λ
  return ĥ_λ

--------------------------------------------------------------------
Algorithm 2  Model Selection   (input: D2, D_T, H0 = {ĥ_1,...,ĥ_L})
  a. λ̃_0 = λ̃_1 = ξ·log n / n
     KRR on D2(a=0) -> f̃_0 ;  KRR on D2(a=1) -> f̃_1 ;   set  h̃ = f̃_1 - f̃_0
  b. form test outcomes  { h̃(z_0i) }  on D_T
  c. for each h in H0:  L(h) = (1/n_T) Σ_i ( h̃(z_0i) - h(z_0i) )^2
  d. ĥ_final = argmin_h L(h)
  return ĥ_final
```

**Cross-fitting (CF) 版**: \(\{\mathcal{D}_1,\mathcal{D}_2\}\) と \(\{\mathcal{D}_2,\mathcal{D}_1\}\) の 2 通りで Algorithm 3 を実行し、2 つの推定量を平均する。理論は CF 版へも容易に拡張される。

---

## Architecture / Process Flow

```
   ┌──────────────────── source D = {(z, a, y)} ────────────────────┐
   │                                                                 │
   │  split                                                          │
   ▼                                                                 ▼
 D1 (n/2)                                                         D2 (n/2)
   │                                                                 │
   │  [RA learner: Algorithm 1]                       [KRR small λ̃] │
   │   KRR(a=0)->f̂0, KRR(a=1)->f̂1                     f̃0, f̃1        │
   │   pseudo-outcome m1                                  │           │
   │   KRR(m1 ~ z; λ1) over grid Λ                       h̃ = f̃1 - f̃0 │
   ▼                                                        │        │
  H = { ĥ_λ : λ ∈ Λ }  (候補 CATE 群)                        │        │
   │                                                        │        │
   └──────────────┐            ┌───────────── target D_T = {z0} ─────┘
                  ▼            ▼          (共変量のみ)
        [Model Selection: Algorithm 2]
        test outcome  { h̃(z0i) }  on D_T
        L(h) = mean( (h̃(z0) - h(z0))^2 )
                  │
                  ▼
          ĥ_final = argmin_{h∈H} L(h)
```

---

## Figures & Tables

> 注: 本論文の HTML 版（arxiv.org/html/2502.11331）は取得時点で 404 のため利用不可。以下の図表は PDF 本文から読み取った内容であり、外部画像 URL の埋め込みは行っていない（規約に従い、実際に HTML で確認した画像のみ埋め込み可のため）。

### Table A. 主要結果: 401(k) 実データでの CATE 予測性能（本文 Table 1、GLR nuisance、cross-fitting、30 回平均）

| Metric | COKE | SR | DR-CATE | ACW-CATE |
|---|---|---|---|---|
| Spearman Cor with \(\hat{s}_{0i}\) | **0.191** | 0.141 | 0.110 | 0.122 |
| Pearson Cor with \(\hat{s}_{0i}\) | **0.046** | 0.027 | 0.011 | 0.031 |

- COKE が全手法中で最高の一致度。Spearman で他手法比 **35% 超**、Pearson で **45% 超**高い。
- COKE の相関はいずれも有意に正（Spearman の p 値 \(<10^{-14}\)、Pearson の p 値 = 0.04）。
- \(\hat{s}_{0i}\) は target サンプル上で構成した CATE の efficient score（influence function）。

### Table B. 手法比較（実験で対照した 4 手法）

| 手法 | 概要 | positivity/overlap 依存 |
|---|---|---|
| **COKE**（提案） | 分割 + pseudo-outcome RA learner + target pseudo-outcome によるモデル選択 | weak overlap で成立（傾向スコア・density ratio のモデル化不要） |
| **SR** (separate regression) | \(\hat{f}_1-\hat{f}_0\) をそのまま CATE とするナイーブ法 | — |
| **DR-CATE** | Kennedy (2020) の DR-Learner（DML 系） | strong positivity 前提 |
| **ACW-CATE** | Lee et al. (2023) 由来、density ratio モデルで covariate shift 補正した ACW 推定量 | strong overlap 前提 |

（全手法とも回帰は KRR（Matérn kernel）で統一、cross-fitting で実装。）

### Table C. シミュレーション主要数値（本文 5.2、Figure 1 の要約、MSE は 100 回平均）

| 変動要因 | 設定 | 結果（COKE の相対効率 = ベンチマーク MSE / COKE MSE 等） |
|---|---|---|
| \(S_B\)（source–target シフト） | \(S_B=25\) | COKE の DR-CATE に対する相対効率 **1.61**。DR-CATE/ACW-CATE の MSE は \(S_B\) 増大で顕著に悪化（\(n\propto\sqrt{S_B}\) でも）。 |
| \(S_R\)（処置–対照シフト） | \(S_R=3\) | COKE の DR-CATE に対する相対効率 **1.40**（SR・ACW-CATE 比ではさらに高い）。 |
| \(c\)（nuisance 複雑度 vs CATE） | \(c=1\) | COKE の任意ベンチマークに対する相対効率 **>1.5**。\(c\) 増大で SR に対する優位が拡大。 |
| \(n_\mathcal{T}\)（標本サイズ） | 250〜1500 | 全手法が同率でリスク低減、COKE が常に最小 MSE。 |
| CF 版 vs data-splitting 版 | \(q=1\), \(S_B\) 変動 | CF 版が **約 13.5–15% 低リスク**。 |

### Figure 1（本文、5 パネル、ASCII 再現）

```
   MSE ↑                       (各パネル: 上から ACW-CATE > SR > DR-CATE > COKE の順に高い)
      │  ACW-CATE ───●───●───●   (weak overlap で急増)
      │  SR         ─▲──▲──▲
      │  DR-CATE    ─■──■──■
      │  COKE       ─◆──◆──◆     (最も低く安定)
      └────────────────────────→  (i) S_B  (ii) S_R  (iii) c  (iv) S_B(q=2)  (v) n_T
```
Figure 1 キャプション: 「Performance of COKE, ACW-CATE, DR-CATE and SR across varying simulation settings.」5 パネルはそれぞれ \(S_B\)（source–target シフト, \(q=1\））、\(S_R\)（処置–対照シフト）、\(c\)（nuisance 複雑度）、\(S_B\)（\(q=2\)、2 次元共変量の弱オーバーラップ）、\(n_\mathcal{T}=n/4\) の関数として平均 MSE を示す。**全設定で COKE が最小 MSE**。

### Figure 2（本文、401(k) の density ratio 分布）

Figure 2 キャプション: 「Empirical distribution of the logarithms of the estimated density ratio (using the logistic regression) between the source and target.」\(\log_{10}\hat{\omega}(z)\) のヒストグラム。source サンプル: 平均 \(-0.889\)、標準偏差 \(0.956\)。target サンプル: 平均 \(0.732\)、標準偏差 \(0.748\)。source の**有効標本サイズは 399.01**（\(n=5997\) に対し）→ 強い covariate shift と弱いオーバーラップを示す。

---

## Experiments & Evaluation

### Setup

- **共通**: Matérn kernel \(K(z,w)=\frac{4}{\sqrt{\pi}\rho}\exp\!\big(-\frac{2\sqrt{2}\lVert z-w\rVert_2}{\rho}\big)\)、スケール \(\rho=5\)。COKE の tuning は \(\lambda_{0,0}=\lambda_{0,1}=\frac{1}{5n}\)、\(\boldsymbol{\Lambda}=\{\frac{2^k}{5n}: k=0,\dots,\lceil\log_2(5n)\rceil\}\)。
- **シミュレーション**: \(n_\mathcal{T}=n/4\)。共変量次元 \(p=4\)、\(q<p\) がシフト対象次元数。\(S_B\) が source–target シフト度、\(S_R\) が処置–対照非オーバーラップ度、\(c\) が nuisance 複雑度。真の CATE は \(h^\star(z)=q^{-1}\sum_{i=1}^q \sin z_i\)、nuisance \(f_a^\star\) は絶対値項を含むため CATE より複雑。ノイズ \(y\mid a,z\sim N(f_a^\star(z),0.25)\)。基準設定: \(q=1, S_B=10, S_R=2, c=1, n_\mathcal{T}=n/4=\lceil 350\sqrt{S_B}+60 S_R+25\rceil\)。各設定 100 回反復の平均 MSE。
- **比較手法**: COKE, SR, DR-CATE (Kennedy 2020), ACW-CATE (Lee et al. 2023)。全て KRR で回帰、cross-fitting 実装。

### Main Results（具体数値）

- **全シナリオで COKE が全ベンチマークを一貫して上回る**（Figure 1）。
- \(S_B=25\) で COKE の DR-CATE に対する相対効率 = **1.61**。DR-CATE / ACW-CATE の MSE は \(S_B\) 増大とともに（サンプルサイズが \(\sqrt{S_B}\) に比例して増えても）顕著に悪化 → 半パラメトリック（DML）系の弱オーバーラップ脆弱性に対する COKE の頑健性。
- \(S_R=3\) で COKE の DR-CATE に対する相対効率 = **1.40**（SR, ACW-CATE 比ではさらに高い）。
- \(c=1\) で COKE の任意ベンチマークに対する相対効率 **>1.5**。\(c\) 増大とともに SR に対する優位拡大 → 複雑な nuisance に対する適応性（理論の rate double-robustness と整合）。
- \(q=2\)（2 次元弱オーバーラップ）でも COKE が最小 MSE。\(n/n_\mathcal{T}=4\) 一定でサンプルサイズを増やすと全手法が同様のレートで減少、COKE が常に最小。

### 401(k) 実データ（Real-World Example）

- 1991 SIPP データ。処置 \(a\) = 401(k) 加入資格、アウトカム \(y\) = net financial assets (NFA)。共変量 7 個（age, income, family size, education years, benefit pension status, IRA 参加, home ownership）。
- **転移設定**: source = 既婚（married）\(n=5997\)、target = 未婚（not married）\(n_\mathcal{T}=3918\)（target は共変量のみ学習に使用、処置・アウトカムは検証のみ）。source の有効標本サイズは **399.01**（強い covariate shift）。
- 評価: target 上の efficient score \(\hat{s}_{0i}\)（反実仮想 \(y_{0i}(1)-y_{0i}(0)\) の代理）と CATE 推定量 \(\hat{h}(z_{0i})\) の Spearman / Pearson 相関、30 回平均。
- **結果（Table 1）**: COKE が Spearman 0.191 / Pearson 0.046 で最良。他手法比 Spearman >35%、Pearson >45% 高い。有意性は p(Spearman) \(<10^{-14}\)、p(Pearson) = 0.04。
- 感度分析（RF nuisance、CF なし）でも COKE が最良。CF 版が非 CF 版より僅かに良好。

### Ablation

- **RA learner vs SR**: pseudo-outcome への追加回帰（RA learner）が SR（\(\hat{f}_1-\hat{f}_0\)）より CATE 複雑度への適応で優位。理論（Corollary 1）でも候補中最良の MSE が下界に一致。
- **cross-fitting**: \(q=1\), \(S_B\) 変動下で CF 版が data-splitting 版比 **13.5–15% 低リスク**。
- **nuisance 学習器の選択**（GLR vs RF）・**cross-fitting 有無**は Appendix J.2.2 で追加検証、結論不変。

---

## 本テーマへの適用可能性

**テーマ**: マーケティング施策（クーポン/メール等）を、対象ユーザーや処置内容が毎回異なる形で**低頻度**に実施しており、類似キャンペーン/ユーザーをグループ化してデータを稠密化し、実効的な実験間隔を短縮したい（uplift モデリング / off-policy evaluation）。

この論文は、まさに「**別々に実施した施策のデータを、共通の推定対象へ転移して strength を借りる**」問題設定と一致し、以下の点で直接的に有用。

1. **疎なキャンペーンを「source → target」転移でつなぐ**:
   - 過去に実施済みで処置・アウトカムが揃っているキャンペーンを **source**、これから配信したい（あるいはアウトカム未観測の）ユーザー群を **target** とみなせる。COKE は **target 側で処置・アウトカムが未観測でも、共変量だけあれば** CATE（= uplift）を転移推定できる。低頻度施策で target のアウトカムを待たずに uplift を先読みできる。

2. **「異なる対象ユーザー」= covariate shift を明示的に扱える**:
   - キャンペーンごとにターゲット属性が違う（若年層向け / 高額購入者向け 等）ことは source–target の covariate shift そのもの。COKE は density ratio をモデル化せずに未知のシフト度 \(B\) へ適応し、**シフトが強くても頑健**（シミュレーションで \(S_B=25\) でも DR/ACW を 1.61 倍上回る）。従来の IW / DML 系は shift が強いと有効標本が激減するが、COKE はこれに強い。

3. **「類似施策のグルーピングでデータを稠密化」を effective sample size で定量化**:
   - COKE の中核概念 \(n_{\mathrm{eff}}=n/(BR)\) は「オーバーラップで割り引いた実効データ量」。**類似度の高いキャンペーン群（= \(B\) が 1 に近い、シフトが小さいグループ）をまとめるほど \(n_{\mathrm{eff}}\) が大きくなり MSE が下がる**という理論的裏付けになる。retrieval / clustering フェーズで「どのキャンペーンを束ねると転移が効くか」を、共変量 density ratio と傾向スコアの偏りから見積もる指針を与える（実データ節の「有効標本 399.01」の推定手順がそのままテンプレート）。

4. **配信偏り（傾向スコアの偏り）への頑健性 = weak overlap**:
   - 実運用の施策は完全ランダム配信でないことが多く、特定セグメントに処置が偏る（傾向スコアが 0/1 に近い）。COKE は positivity 違反（singular 傾向スコア）を許容する初のノンパラ CATE 手法であり、**観察データ由来の配信ログからでも uplift を推定できる**可能性を広げる。

5. **off-policy evaluation の検証プロトコルとして流用可能**:
   - 401(k) 実験の評価法（target サンプルで efficient score \(\hat{s}_{0i}\) を作り、CATE 推定量との Spearman/Pearson 相関で uplift モデルをランキング検証）は、**アウトカムが後から一部だけ観測されるマーケ現場での uplift モデル評価**にそのまま適用できる。COKE の pseudo-outcome ベースのモデル選択（Algorithm 2）は、複数の uplift モデル候補から target 集団向けに最良を選ぶ「オフライン選択器」として利用できる。

6. **実装上の注意 / 制約**:
   - source と target で**アウトカム回帰 \(f_0^\star, f_1^\star\) が共通**という仮定が必要（属性を条件付ければ処置反応が母集団間で不変）。施策間で商品・価格・時期が大きく違うと崩れ得るため、グルーピングは「反応関数が共有できる粒度」で行うべき。
   - KRR ベースなので高次元・大規模カテゴリ共変量にはカーネル設計や近似が必要。target のアウトカムが全く得られない設定を想定しており、逐次的なオンライン最適化ではなくバッチ的な転移評価に向く。

要約すると、本論文は「**低頻度・異ターゲットの施策を、共変量ベースで転移してまとめ、実効データ量（\(n_{\mathrm{eff}}\)）を増やしつつ配信偏りに頑健な uplift 推定を行う**」という本テーマの核心に、理論保証付きの具体的アルゴリズム（COKE）と評価プロトコルを提供する。

---

## Notes

- 提案手法名 **COKE** = **T**ransfer learning of **C**ATE with **O**verlap-adaptive **KE**rnel ridge regression。
- 主要貢献: (i) 二重分布シフト下の CATE 転移学習、(ii) positivity を緩めた **weak overlap** 仮定（singular 傾向スコア・singular density ratio を許容、ノンパラ CATE で初）、(iii) effective sample size \(n_{\mathrm{eff}}=n/(BR)\) を用いた **sharp な非漸近 MSE バウンド（下界に一致するオラクル不等式）**、(iv) 傾向スコア・density ratio を**モデル化せず** \(\lVert h^\star\rVert_\mathcal{F}\) について最適という点。
- 関連: Nie & Wager (2021, R-learner) も KRR で CATE を扱うが傾向スコアモデル化と十分な学習率を要する点で異なる。DML（Kennedy 2020）とは rate double-robustness の思想を共有するが positivity 不要な点が差別化。
- 数値実験は 100 回反復（シミュレーション）/ 30 回反復（実データ）。コード公開: https://github.com/hongjiel/COKE 。
- **アンチハルシネーション**: arXiv HTML 版が 404 のため図の外部画像 URL は埋め込んでいない。本文で明示的に確認できなかった数値（例: 各手法の絶対 MSE の生値、Appendix の詳細表）は「記載なし」扱い。Figure 1 のパネル別絶対値、\(S_B<25\)・\(S_R<3\)・\(c\neq1\) での相対効率の個別数値は本文に明示なし = 記載なし。
