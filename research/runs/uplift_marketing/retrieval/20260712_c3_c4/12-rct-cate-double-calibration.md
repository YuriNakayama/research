# Improving Precision of RCT-Based CATE Estimation using Data Borrowing with Double Calibration

- **Link**: https://arxiv.org/abs/2306.17478 / HTML: https://arxiv.org/html/2306.17478v2
- **Authors**: Amir Asiaee, Chiara Di Gravio, Cole Beck, Yuting Mei, Samhita Pal, Jared D. Huling
- **Year**: 2023 (v1: 2023-06-30) / 改訂 v2: 2025-07-20
- **Venue**: arXiv preprint（Statistics > Methodology, stat.ME）。査読付きジャーナル掲載情報は記載なし
- **Type**: 方法論論文（因果推論 / CATE 推定 / データボローイング / transfer learning）

---

## Abstract (English, verbatim)

> Understanding how treatment effects vary across patient characteristics is essential for personalized medicine, yet randomized controlled trials (RCTs) are often underpowered to detect heterogeneous treatment effects (HTEs). We propose a framework that improves the efficiency of conditional average treatment effect (CATE) estimation in RCTs by leveraging large observational studies (OS) while preserving the unbiasedness of RCT estimates. By framing CATE estimation as a supervised learning problem, we show that estimation variance is minimized using the counterfactual mean outcome (CMO) as an augmentation function. We derive finite-sample error bounds and establish conditions under which OS data improves CMO estimation, and thus CATE efficiency, even in the presence of confounding in the OS or outcome distribution shifts between populations. We introduce R-OSCAR (Robust Observational Studies for CMO-Augmented RCT), a two-stage estimator that calibrates OS outcome predictions to the RCT population and corrects residual biases through regularized regression. Simulations show that R-OSCAR can reduce the RCT sample size needed for HTE detection by up to 75%, maintaining robustness to model misspecification. Application to the Tennessee STAR study confirms these efficiency gains. Our framework offers a principled approach to integrating observational and experimental data using tools from statistical learning and transfer learning.

## Abstract（日本語訳）

> 治療効果が患者特性ごとにどう変動するかを理解することは個別化医療に不可欠だが、ランダム化比較試験（RCT）は異質治療効果（HTE）を検出するには検出力が不足していることが多い。本研究では、RCT 推定量の不偏性を保ちつつ、大規模な観察研究（OS）を活用して RCT における条件付き平均治療効果（CATE）推定の効率を改善するフレームワークを提案する。CATE 推定を教師あり学習問題として定式化することで、反実仮想平均アウトカム（CMO, counterfactual mean outcome）を augmentation 関数として用いると推定分散が最小化されることを示す。有限標本の誤差限界を導出し、OS に交絡があっても、あるいは母集団間でアウトカム分布のシフトがあっても、OS データが CMO 推定（ひいては CATE 効率）を改善する条件を確立する。我々は R-OSCAR（Robust Observational Studies for CMO-Augmented RCT）を導入する。これは OS のアウトカム予測を RCT 母集団へ較正（calibrate）し、残差バイアスを正則化回帰で補正する 2 段階推定量である。シミュレーションでは、R-OSCAR が HTE 検出に必要な RCT サンプルサイズを最大 75% 削減でき、モデル誤特定に対しても頑健であることを示す。Tennessee STAR 研究への適用でもこの効率改善が確認された。本フレームワークは、統計的学習と転移学習のツールを用いて観察データと実験データを統合する原理的な手法を提供する。

---

## Overview

本論文は「RCT は不偏だが検出力不足、OS はデータ量豊富だが交絡でバイアスがある」という古典的トレードオフを、CATE（個別化された治療効果 τ(x)）の推定精度向上という文脈で解く。核心のアイデアは 2 つ:

1. **CATE 推定を教師あり学習に変換**: 治療割当 A ∈ {−1, +1} を使った「疑似アウトカム（pseudo-outcome）」を構成し、その回帰として CATE を推定する。このとき augmentation 関数 m(x) を最適に選ぶと疑似アウトカムの分散が最小化される。最適な m(x) は **反実仮想平均アウトカム（CMO）** μ(x) である（Theorem 2）。
2. **Double Calibration（二重較正）による安全なデータボローイング**: OS から学んだアウトカムモデルをそのまま使うのではなく、(i) アウトカムレベルの母集団差 δ_a(x) を較正し（outcome calibration）、(ii) さらに CATE レベルの残差差 δ(x) を較正する（CATE calibration）。この 2 層の較正が "double calibration" の名の由来であり、OS の交渉可能な情報だけを抽出し、有害なバイアスは RCT 側で打ち消す。

この設計により、OS が交絡していても、また OS と RCT の母集団でアウトカム分布がシフトしていても、RCT 推定量の不偏性を壊すことなく効率だけを引き上げる。

---

## Problem

- RCT はランダム化により不偏な因果効果を与えるが、サンプルが小さく HTE / CATE の検出には検出力不足になりがち。
- 大規模 OS はデータ量が豊富だが、未測定交絡（unmeasured confounding）によりアウトカムモデルにバイアスが入る。
- 既存の generalizability / transportability 系手法は「平均交換可能性（mean exchangeability）」μ_a^r(x) = μ_a^o(x) を仮定することが多く、母集団間でアウトカム水準がずれると破綻する。
- 単純に OS を RCT に足し込むと、OS のバイアスがそのまま CATE 推定に流入する。
- 目的: RCT の不偏性を保証したまま、OS を「安全に」借用して CATE 推定の分散を減らし、HTE 検出に必要な RCT サンプルサイズを削減すること。

---

## Proposed Method

### Core idea

CATE 推定を、疑似アウトカム τ_m(X,A,Y) を目的変数とする回帰問題として定式化する。augmentation 関数 m(x) を最適化すると分散が最小化され、その最適解が CMO μ(x) になる。CMO は OS で高精度に学習できるので、OS の情報を「分散削減」という副作用の少ない形で借用できる。バイアスは outcome / CATE の 2 段階較正（double calibration）で除去する。

### 記号

- A ∈ {−1, +1}: 治療指標
- Y: 観測アウトカム
- S ∈ {r, o}: 研究種別（r = RCT, o = OS）
- π_a^s(x): 研究 s における割当確率
- μ_a^s(x): 潜在アウトカムの条件付き平均
- μ^s(x, a): アウトカム回帰関数
- τ^s(x): CATE
- μ^s(x): CMO（反実仮想平均アウトカム）
- δ_a(x): 母集団間のアウトカム平均差
- Δ₂(f,g): 関数間の L² 距離（RMSE）

### Numbered steps（R-OSCAR）

1. **OS アウトカムモデル推定**: OS データから各腕 a ごとに μ̂^o(·, a) を推定する（正則化 R_a^o(f) 付き）。
2. **Outcome calibration（第1較正）**: RCT 母集団と OS 母集団のアウトカム平均差 δ_a(x) ≡ μ_a^r(x) − μ^o(x, a) を、RCT データを使ってモデル化・推定する（正則化 R_a^r(d) 付き、スパース性を仮定）。
3. **CMO の構成**: 較正済みアウトカムモデルの割当確率重み付き和として CMO を組み立てる。
4. **CATE calibration（第2較正 / 残差補正）**: 疑似アウトカムを用いて CATE レベルの残差差 δ(x) を推定し、最終 CATE を補正する（正則化 R(d) 付き）。
5. **K-fold sample splitting**: outcome calibration（K−1 folds）と CATE calibration（1 fold）で独立なデータを使い、fold をまたいで平均する。

### Key Formulas

疑似アウトカム変換（augmentation 関数 m 付き）:

$$
\tau_m(X, A, Y) = \frac{A\,(Y - m(X))}{\pi_A(X)}
$$

分散最小化を与える最適 augmentation は CMO（Theorem 2）:

$$
\mu(x) = \arg\min_{m} \; \mathbb{V}\!\left(\tau_m(X, A, Y) \mid X = x\right)
$$

CMO の明示形（割当確率で重み付けした反対腕アウトカムの平均）:

$$
\mu(x) = \pi_{-1}(x)\,\mu_{+1}(x) + \pi_{+1}(x)\,\mu_{-1}(x)
$$

母集団間アウトカム差（第1較正の対象）:

$$
\delta_a(x) \equiv \mu_a^r(x) - \mu^o(x, a)
$$

較正済み CMO の構成:

$$
m(\cdot) = \sum_{a} \pi_a^r(\cdot)\,\bigl[\hat{\mu}^o(\cdot, a) + \hat{\delta}_a(\cdot)\bigr]
$$

最終 CATE 推定量（第2較正 δ̂ を加えた形）:

$$
\hat{\tau}^r(\cdot) = \sum_{a} a\,\bigl[\hat{\mu}^o(\cdot, a) + \hat{\delta}_a(\cdot)\bigr] + \hat{\delta}(\cdot)
$$

irreducible error の限界（Theorem 4, CMO からの乖離 Δ₂ に依存）:

$$
\frac{\Delta_2^2(m, \mu)}{(1-\rho)^2} \;\le\; \mathbb{E}\!\left[\mathbb{V}(\tau_m \mid X)\right] - \mathbb{E}\!\left[\mathbb{V}(\tau_\mu \mid X)\right] \;\le\; \frac{\Delta_2^2(m, \mu)}{\rho^2}
$$

予測リスクの上界（CMO 推定改善が予測・推定両誤差を下げることを示す）:

$$
R(\hat{\tau}^r) \;\lesssim\; \bar{\sigma}^2 + \Delta_2^2(m, \mu) + \Delta_2^2(\hat{\tau}^r, \tau^r)
$$

---

## Algorithm（Pseudocode）

```
Input:
  RCT data  D_r = {(X_i, A_i, Y_i)},  known π_a^r(x)   (RCT では既知)
  OS data   D_o = {(X_j, A_j, Y_j)}
  regularizers R_a^o, R_a^r, R
  number of folds K

# Stage 1: OS アウトカムモデル
for a in {-1, +1}:
    μ̂^o(·, a) = argmin_f  Loss_OS(f; D_o, a) + R_a^o(f)

# K-fold sample splitting for double calibration
split D_r into folds F_1, ..., F_K
for k in 1..K:
    train = D_r \ F_k        # K-1 folds  → outcome calibration
    valid = F_k              # 1 fold     → CATE calibration

    # Stage 2: outcome calibration (第1較正)
    for a in {-1, +1}:
        δ̂_a^(k)(·) = argmin_d  Loss(μ_a^r - (μ̂^o(·,a)+d); train) + R_a^r(d)

    # Stage 3: CMO 構成
    m^(k)(·) = Σ_a π_a^r(·) [ μ̂^o(·,a) + δ̂_a^(k)(·) ]

    # Stage 4: CATE calibration (第2較正, 残差補正)
    pseudo_i = A_i (Y_i - m^(k)(X_i)) / π_{A_i}^r(X_i)   for i in valid
    δ̂^(k)(·) = argmin_d  Loss(pseudo - d ; valid) + R(d)

    τ̂^(k)(·) = Σ_a a [ μ̂^o(·,a) + δ̂_a^(k)(·) ] + δ̂^(k)(·)

# 平均化
return  τ̂^r(·) = (1/K) Σ_k τ̂^(k)(·)
```

---

## Architecture / Process Flow

```
        ┌─────────────────────┐        ┌──────────────────────┐
        │   OS (large, biased) │        │   RCT (small, unbiased)│
        └──────────┬──────────┘        └───────────┬──────────┘
                   │ Stage 1                         │
                   ▼                                 │
        μ̂^o(x, a)  outcome model                     │
                   │                                 │
                   │◄──── Stage 2: outcome calibration δ̂_a(x)  ◄─┐
                   │        (RCT の K-1 folds で母集団差を較正)      │
                   ▼                                 │            │
        μ̂^o + δ̂_a  ── Stage 3 ──► CMO  m(x)          │            │
                                     │               │            │
                                     ▼               │            │
                     pseudo-outcome τ_m = A(Y−m)/π   │  (RCT の残り1 fold)
                                     │               │            │
                                     ▼ Stage 4: CATE calibration δ̂(x)
                                     │                            │
                                     ▼                            │
                          τ̂^r(x) = Σ_a a[μ̂^o+δ̂_a] + δ̂ ──────────┘
                                     │  (K-fold 平均)
                                     ▼
                          Unbiased, low-variance CATE
```

「double calibration」= (1) outcome level の δ_a と (2) CATE level の δ、の 2 段階較正。

---

## Figures & Tables

> 注: 論文本文（arXiv HTML）は「1 figure, 2 tables」と明記。HTML 抽出時に画像（`<img>`）URL は取得できなかったため、画像埋め込みは行わない（実在確認できないため）。以下は本文・表構造から確認できた範囲を再構成したもので、確認できなかった具体数値は「記載なし」とする。

### Table A: 記号・定義表（本文 Notation Table）

| 記号 | 意味 |
|------|------|
| A ∈ {−1,+1} | 治療指標 |
| Y | 観測アウトカム |
| S ∈ {r, o} | 研究種別（RCT / OS） |
| p | 測定共変量数 |
| n^s | 研究 s の標本サイズ |
| μ_a^s(x) | 条件付き潜在アウトカム平均 |
| μ^s(x, a) | アウトカム回帰関数 |
| τ^s(x) | CATE |
| π_a^s(x) | 割当確率 |
| μ^s(x) | CMO（反実仮想平均アウトカム） |
| δ_a(x) | 母集団間アウトカム平均差 |
| Δ₂(f,g), Δ_∞(f,g) | L² / L^∞ 距離 |

### Table B: シミュレーション設定（Section 3 本文より）

| 項目 | 値 |
|------|-----|
| RCT 基準サンプルサイズ n_r | 400（変動範囲 200〜800） |
| OS サンプルサイズ n_o | 5000（変動範囲 2000〜10000） |
| 共変量次元 p | {10, 50, 100} |
| アウトカムモデル | 線形 / 非線形 |
| 頑健性検証 | モデル誤特定、未測定効果修飾子（unmeasured effect modifiers） |

### Table C: 手法比較（baseline vs 提案）

| 手法 | OS 利用 | バイアス補正 | 不偏性 | 分散 |
|------|---------|-------------|--------|------|
| Naive（RCT のみ） | なし | 不要 | 不偏 | 高い |
| RCT-augmented（単純ボローイング） | あり | なし | OS バイアス流入の恐れ | 低いが偏る |
| Mean-exchangeability 系 | あり | 母集団同一を仮定 | 仮定破綻で偏る | 低い |
| **R-OSCAR（提案）** | あり | double calibration（δ_a + δ） | 不偏を保持 | 低い |

### 主要結果（Section 3 / 4 本文より、数値は確認できた範囲）

| 指標 | 値 |
|------|-----|
| HTE 検出に必要な RCT サンプルサイズ削減 | 最大 **75%** |
| モデル誤特定下の頑健性 | 競合より性能劣化が有意に小さい（具体的な数値比は記載なし） |
| Tennessee STAR 適用での効率改善 | 「効率改善を確認」と記述（具体的な効果推定値・標準誤差は本文抽出では記載なし） |
| 分散削減率 / MSE 比の厳密値 | 記載なし（図・表本体の数値は HTML から抽出できず） |

### Figure（本文の唯一の図）

- キャプション: 記載なし（HTML から図キャプションを取得できず、画像 URL も未取得）

---

## Experiments & Evaluation

### Setup

- **シミュレーション**: RCT サイズ n_r = 200〜800、OS サイズ n_o = 2000〜10000、共変量次元 p ∈ {10, 50, 100}。線形・非線形アウトカムモデル。モデル誤特定と未測定効果修飾子を意図的に注入。
- **比較手法**: naive 推定量（RCT のみ）、RCT-augmented 推定量、及び提案の R-OSCAR。
- **実データ**: Tennessee STAR（Student-Teacher Achievement Ratio）研究。学級規模介入の児童学力への効果。

### Main Results（具体数値）

- R-OSCAR は **HTE 検出に必要な RCT サンプルサイズを最大 75% 削減**（abstract および Section 3 で明記）。
- OS データが大きいほど効率改善が増大（n_o を 2000→10000 に増やすほど利得増）。
- 高次元（p = 100）でも正則化により機能。
- 個々の分散削減倍率・MSE の具体数値は本抽出では 記載なし。

### Ablation / 頑健性

- **モデル誤特定（3.4）**: アウトカムモデルが誤っていても、R-OSCAR は競合より性能劣化が小さい。CATE calibration（第2較正）が残差バイアスを吸収するため。
- **未測定効果修飾子（3.5）**: OS 側に未測定の効果修飾子があっても、RCT 側較正で CATE 推定の不偏性を維持。
- **理論的裏付け**: Theorem 4 により、CMO からの乖離 Δ₂(m, μ) が小さいほど irreducible error が小さくなり、OS で CMO を良く学べれば効率が上がることが有限標本で保証される。

---

## 本テーマへの適用可能性

想定シナリオ: データサイエンティストが**低頻度のマーケティング施策（クーポン・メール等）**を、毎回異なる対象ユーザー・異なる treatment で実施している。各キャンペーンは単体では標本が小さく、uplift（= CATE）の推定や off-policy evaluation に必要なデータ密度が不足している。本論文の枠組みは、この「疎なキャンペーン群を束ねて実効データ密度を上げる」課題に直接対応できる。

- **RCT ↔ OS の対応付け**: 直近のランダム配信を行った小規模キャンペーンを「RCT（不偏だが疎）」、過去の非ランダム配信（配信ルールや自己選択で交絡した大量ログ）を「OS（大量だが偏る）」とみなせる。R-OSCAR はまさにこの構図で、過去ログの uplift を安全に借用する。
- **CMO による分散削減が施策間バラつきに強い**: uplift を疑似アウトカム τ_m = A(Y − m(X))/π_A(X) の回帰として定義し、m(X) に過去ログ由来の CMO を当てると、施策ごとの結果ばらつき（分散）を主に削減できる。マーケでは Y（購買・CV）の分散が大きいので、この分散削減が効きやすい。**割当確率 π が既知**（自社でランダム配信を制御できる）である点は RCT 仮定を満たしやすく、医療より適用が容易。
- **Double calibration で「似たキャンペーン/ユーザー群」を安全にグルーピング**: 過去の別キャンペーンと現行キャンペーンの母集団差（季節性・対象セグメントの違い・オファー内容の違い）は outcome calibration δ_a(x) が吸収し、uplift レベルの残差差は CATE calibration δ(x) が吸収する。これにより「完全同一ではないが類似したキャンペーン」を強引に混ぜてもバイアスが現行 RCT 側で打ち消され、実効サンプルを増やせる。mean-exchangeability を仮定しない設計なので、施策ごとにベースライン CV 率がずれても破綻しない。
- **実験間隔の短縮**: 「必要な RCT サイズを最大 75% 削減」という結果は、マーケ文脈では「各キャンペーンで必要なランダム配信量を削れる／同じ配信量でより早く有意な uplift を検出できる」ことを意味し、低頻度施策でも実効的な実験サイクルを短くできる。
- **off-policy evaluation との接続**: 疑似アウトカム＋augmentation という構成は doubly robust / AIPW 系 OPE と親和的で、m(X)（CMO）を過去ログで学習した control variate とみなせる。新方策の価値推定の分散を、過去キャンペーン群から借りた CMO で下げられる。
- **グルーピング戦略への示唆**: 本テーマの「類似キャンペーン/ユーザーをクラスタしてデータを合成する」方針は、R-OSCAR では明示的クラスタリングではなく「δ_a(x), δ(x) のスパース較正」で暗黙に実現される。すなわち、クラスタ境界を人手で切らずとも、共変量 x を通じて類似部分だけ情報共有し、異なる部分だけ較正で分離する。逆に、事前にキャンペーンを粗くクラスタしておけば OS プールを絞り込め、較正すべき δ の規模が小さくなり推定が安定する（クラスタリングと本手法は補完関係）。

**留意点**: 本手法は「割当確率 π が既知の RCT が少なくとも1つ存在」する前提。完全に観察ログのみ（ランダム配信ゼロ）の場合は RCT 側較正が使えず、別途 propensity 推定と交絡仮定が必要になる。また Y の分布シフトが「疎（sparse）」であるという仮定に依存するため、キャンペーン間で uplift 構造が根本的に異なる場合は借用効果が限定的になる。

---

## Notes

- 本論文は arXiv v1（2023-06-30）から v2（2025-07-20）で推定量名が **R-OSCAR** に整理されている。ファイル名の "double-calibration" は本手法の中核（outcome calibration δ_a + CATE calibration δ の 2 段階較正）を指す。
- Statistics > Methodology（stat.ME）の preprint。査読付き掲載先は 記載なし。
- 図（1点）・表（2点）が本文にあると明記されているが、arXiv HTML からは画像 URL・図表本体の数値を確実に抽出できなかったため、分散削減倍率・MSE・STAR の効果推定値などの厳密数値は「記載なし」とした。正確な数値は原論文 PDF の Section 3–4 を要参照。
- 医療（personalized medicine）文脈の論文だが、割当確率が既知でランダム配信を制御できるマーケティング uplift の方が RCT 仮定を満たしやすく、適用は容易と考えられる。
- 関連キーワード: CATE, HTE, data borrowing, transportability, generalizability, counterfactual mean outcome (CMO), pseudo-outcome, doubly robust, transfer learning, sample splitting。
