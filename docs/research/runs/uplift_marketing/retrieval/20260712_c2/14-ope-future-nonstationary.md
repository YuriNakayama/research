# Off-Policy Evaluation and Learning for the Future under Non-Stationarity

- **Link**: https://arxiv.org/abs/2506.20417 （PDF: https://arxiv.org/pdf/2506.20417）
- **Authors**: Tatsuhiro Shimizu (Yale University), Kazuki Kawamura (Sony Group), Takanori Muroi (Sony Group), Yusuke Narita (Yale University), Kei Tateno (Sony Group), Takuma Udagawa (Sony Group), Yuta Saito (Cornell University)
- **Year**: 2025（arXiv 投稿: 2025-06-25）
- **Venue**: KDD 2025（Proceedings of the 31st ACM SIGKDD Conference on Knowledge Discovery and Data Mining, V.1）DOI: 10.1145/3690624.3709237
- **Type**: 研究論文（Off-Policy Evaluation / Learning、非定常環境、Batch learning）
- **Code**: https://github.com/sony/ds-research-code/tree/master/kdd2025-opfv

---

## Abstract (English) — verbatim

> We study the novel problem of future off-policy evaluation (F-OPE) and learning (F-OPL) for estimating and optimizing the future value of policies in non-stationary environments, where distributions vary over time. In e-commerce recommendations, for instance, our goal is often to estimate and optimize the policy value for the upcoming month using data collected by an old policy in the previous month. A critical challenge is that data related to the future environment is not observed in the historical data. Existing methods assume stationarity or depend on restrictive reward-modeling assumptions, leading to significant bias. To address these limitations, we propose a novel estimator named Off-Policy Estimator for the Future Value (OPFV), designed for accurately estimating policy values at any future time point. The key feature of OPFV is its ability to leverage the useful structure within time-series data. While future data might not be present in the historical log, we can leverage, for example, seasonal, weekly, or holiday effects that are consistent in both the historical and future data. Our estimator is the first to exploit these time-related structures via a new type of importance weighting, enabling effective F-OPE. Theoretical analysis identifies the conditions under which OPFV becomes low-bias. In addition, we extend our estimator to develop a new policy-gradient method to proactively learn a good future policy using only historical data. Empirical results show that our methods substantially outperform existing methods in estimating and optimizing the future policy value under non-stationarity for various experimental setups.

## Abstract (Japanese) — 日本語訳

分布が時間とともに変化する非定常環境において、方策の「将来価値（future value）」を推定・最適化する新しい問題、すなわち future off-policy evaluation（F-OPE）と future off-policy learning（F-OPL）を研究する。例えば e コマースの推薦では、前月に旧方策で収集したデータを用いて、来月の方策価値を推定・最適化したいことが多い。重要な課題は、将来環境に関するデータが過去ログには一切観測されない点である。既存手法は定常性を仮定するか、限定的な報酬モデリング仮定に依存しており、大きなバイアスを生む。この限界に対処するため、任意の将来時点での方策価値を精度良く推定する新推定量 OPFV（Off-Policy Estimator for the Future Value）を提案する。OPFV の核心は時系列データ内の有用な構造を活用できる点にある。将来データは過去ログに存在しなくとも、季節・曜日・祝日効果のように過去と将来で共通する構造は活用できる。本推定量は、この時間関連構造を新種の importance weighting によって利用する初の手法であり、効果的な F-OPE を実現する。理論解析により OPFV が低バイアスとなる条件を特定する。さらに、過去データのみを用いて良い将来方策を先取り的に学習する新しい policy-gradient 法へと拡張する。実験により、非定常下での将来方策価値の推定・最適化において、様々な設定で既存手法を大幅に上回ることを示す。

---

## Overview

本論文は、従来の Off-Policy Evaluation（OPE）が暗黙に仮定してきた**定常性**を外し、「過去の旧方策ログのみから、将来時点 $t'>T$ での新方策の価値を推定・最適化する」という **Future OPE / Future OPL（F-OPE / F-OPL）** を初めて定式化する。従来 OPE は過去の方策価値を推定してそのまま将来値の予測とみなす（分布不変を仮定）が、実運用では報酬（コンバージョン率など）が季節・曜日・イベントにより変動するため大きなバイアスを生む。

中心となる貢献は推定量 **OPFV** で、時刻 $t$ から抽出した **time feature $\phi(t)$**（曜日・月・季節など）を鍵に、「将来のターゲット時刻 $t'$ と同じ time feature を持つ過去サンプルだけを選択的に重み付けする」新種の importance weighting を導入する。これにより、過去ログに全く存在しない将来時点の価値を、時系列構造を介して不偏に近く推定できる。time feature の粒度（cardinality $|\phi|$）がバイアス・バリアンスのトレードオフを支配し、粗いほど低バリアンス・高バイアス、細かいほど低バイアス・高バリアンスとなる。最適粒度を過去データのみから選ぶ data-driven な手続きも提示する。さらに policy-gradient 版 **OPFV-PG** を導出し、将来方策の直接学習へ拡張する。

---

## Problem

- **将来時点でのデータが未観測**: 過去ログ $\mathcal{D}$ は $t\in[0,T]$ で収集され、ターゲット時刻 $t'>T$ については $p(x,t)=0$、すなわちデータが一切存在しない。
- **従来 OPE は定常性を仮定**: IPS / DR は過去の方策価値を将来値としてそのまま流用するため、報酬分布が時間変動すると大きなバイアスを生む。
- **既存の非定常手法の限界**:
  - Chandak et al. の **Prognosticator** は各過去期間で方策価値を推定し、期間インデックスを basis function とする線形回帰で将来をトレンド外挿する。しかし (1) 各サブセット $\mathcal{D}_k$ のサンプル数 $n_k$ が小さくなり推定・外挿の両段階で高バリアンス、(2) 期間インデックスのみから将来トレンドを外挿する回帰が過去データにうまく汎化せず大きなバイアスを残す。
  - Uehara et al. の covariate shift 手法は $p^{\text{eval}}(\tilde x)>0 \Rightarrow p^{\text{hist}}(\tilde x)>0$ という strong overlap を要するが、将来時刻には $p^{\text{hist}}(x,t')=0$ となるため本設定では成立せず、そのままでは適用不可能。
- **abrupt/gradual 両方の非定常性への対応**: 緩やかな変化と急峻なジャンプの双方を単一枠組みで扱う必要がある。

---

## Proposed Method

### Core idea

将来のターゲット時刻 $t'$ に対して、報酬関数を **time feature effect** と **residual effect** に分解し、「$t'$ と同一の time feature $\phi(t)=\phi(t')$ を持つ過去サンプル」を選択的に importance weighting することで time feature effect を不偏推定し、残差効果は回帰モデル $\hat f$ で補正する。

報酬関数の分解（式 (3)、これは仮定ではなく恒等的分解）:

$$
q(x,t,a) = \underbrace{g\bigl(x,\phi(t),a\bigr)}_{\text{time feature effect}} + \underbrace{h(x,t,a)}_{\text{residual effect}}
$$

### 定式化（F-OPE の目的）

将来ターゲット時刻 $t'$ における方策 $\pi_e$ の価値:

$$
V_{t'}(\pi_e) := \mathbb{E}_{p(x\mid t')\,\pi_e(a\mid x,t')}\bigl[q(x,t',a)\bigr]
$$

過去ログの生成過程（$t\le T$ でのみ観測、$t>T$ では $p(x,t)=0$）:

$$
\mathcal{D} := \{(x_i,t_i,a_i,r_i)\}_{i=1}^n \sim \prod_{i=1}^n p(x_i,t_i)\,\pi_0(a_i\mid x_i,t_i)\,p(r_i\mid x_i,t_i,a_i)
$$

### Numbered steps

1. **time feature $\phi(t)$ を設計**: 曜日・月・季節・祝日など、過去と将来で共通する時系列構造を写像する関数 $\phi:[0,T]\to$ 有限集合を選ぶ。
2. **同一 time feature のサンプルを選択**: ターゲット時刻 $t'$ に対し $\phi(t_i)=\phi(t')$ となる過去サンプル $i$ を抽出（indicator $\mathbb{I}_\phi(t_i,t')$）。
3. **二重の importance weighting**: 通常の方策比 $\pi_e/\pi_0$ に加え、time feature に関する新しい重み $\mathbb{I}_\phi(t_i,t')/p(\phi(t'))$ を掛け、time feature effect を非パラメトリックに不偏推定する。
4. **residual effect を回帰補正**: 報酬回帰 $\hat f(x,t',a)$ を DR 的に組み込み、time feature だけでは説明できない残差を減らす。
5. **time feature の粒度を data-driven に最適化**: 推定バイアスとバリアンスの推定値の和を最小化する $\hat\phi$ を過去データのみで選ぶ。
6. **（学習）policy-gradient へ拡張**: OPFV による将来価値の勾配推定を用い、方策パラメータ $\zeta$ を勾配上昇で更新して将来方策を直接学習（OPFV-PG）。

### Key Formulas

**OPFV 推定量（式 (4)）**:

$$
\hat V_{t'}^{\text{OPFV}}(\pi_e;\mathcal{D}) = \frac{1}{n}\sum_{i=1}^n\left\{ \frac{\mathbb{I}_\phi(t_i,t')}{p(\phi(t'))}\,\frac{\pi_e(a_i\mid x_i,t')}{\pi_0(a_i\mid x_i,t_i)}\bigl(r_i-\hat f(x_i,t',a_i)\bigr) + \mathbb{E}_{\pi_e(a\mid x_i,t')}\bigl[\hat f(x_i,t',a)\bigr]\right\}
$$

ここで $\mathbb{I}_\phi(t_i,t')=\mathbb{I}\{\phi(t_i)=\phi(t')\}$、$p(\phi(t')) := \int_{s\in[0,T]} p(s)\,\mathbb{I}_\phi(s,t')\,ds$ は $\phi$ の周辺確率密度。

**バイアス（Theorem 3.3）**:

$$
\text{Bias}\bigl(\hat V_{t'}^{\text{OPFV}}(\pi_e;\mathcal{D})\bigr) = \mathbb{E}\left[\frac{\mathbb{I}_\phi(t,t')}{p(\phi(t'))}\Bigl(\Delta_q(x,t,t',a) - \Delta_{\hat f}(x,t,t',a)\Bigr)\right]
$$

ここで $\Delta_q(x,t,t',a):=q(x,t,a)-q(x,t',a)$ は同一 time feature を持つ $t,t'$ 間の期待報酬の相対差、$\Delta_{\hat f}$ はその推定量。time feature が細かいほど $\mathbb{I}_\phi(t,t')=1$ となる $t\ne t'$ が減り、バイアスは 0 に近づく。

**バリアンス（Proposition 3.4）**: $n\,\text{Var}[\hat V_{t'}^{\text{OPFV}}]$ は 4 項からなり、第 1 項は重み $\mathbb{I}_\phi(t,t')/p(\phi(t'))$ の二乗 × 方策比二乗 × 報酬の条件付き分散 $\sigma^2(x,t,a)$ に比例。粗い time feature は $p(\phi(t'))$ が大きく重み変動が小さいため低バリアンス。

**data-driven な $\phi$ 選択（式 (7)）**:

$$
\hat\phi \in \arg\min_{\phi\in\Phi}\ \widehat{\text{Bias}}(\phi)^2 + \widehat{\text{Var}}(\phi),\quad \widehat{\text{Bias}}(\phi):=\hat V_{t'}^{\text{OPFV}}(\pi_e;\mathcal{D},\phi)-\hat V_{t'}^{\text{OPFV}}(\pi_e;\mathcal{D},\phi_\infty)
$$

$\phi_\infty$ は $\Phi$ 内で最も細かい（最小バイアス）time feature。

**OPFV-PG 勾配推定（式 (8)）**:

$$
\nabla_\zeta \hat V_{t'}^{\text{OPFV}}(\pi_\zeta;\mathcal{D}) = \frac{1}{n}\sum_{i=1}^n\left\{ \frac{\mathbb{I}_\phi(t_i,t')}{p(\phi(t'))}\frac{\pi_\zeta(a_i\mid x_i)}{\pi_0(a_i\mid x_i,t_i)}\bigl(r_i-\hat f(x_i,t_i,a_i)\bigr)\nabla_\zeta\log\pi_\zeta(a_i\mid x_i) + \mathbb{E}_{\pi_\zeta(a\mid x_i)}\bigl[\hat f(x_i,t_i,a)\nabla_\zeta\log\pi_\zeta(a\mid x_i)\bigr]\right\}
$$

方策更新: $\zeta_{\tau+1} \leftarrow \zeta_\tau + \eta\,\nabla_\zeta V_{t'}(\pi_{\zeta_\tau})$（学習率 $\eta$）。

---

## Algorithm (Pseudocode)

```
# F-OPE: OPFV 推定
Input: 過去ログ D = {(x_i, t_i, a_i, r_i)}_{i=1..n}, ターゲット時刻 t', 候補 time feature 集合 Φ
1. 報酬回帰 f_hat(x, t, a) を D で学習（residual effect 補正用）
2. for each φ in Φ:
3.     各 t_i について I_φ(t_i, t') = 1{φ(t_i) = φ(t')} を計算
4.     p(φ(t')) を D 中の該当サンプル比率で推定
5.     式(4) で V_hat_OPFV(π_e; D, φ) を計算
6.     Bias_hat(φ)^2 + Var_hat(φ) を推定（式(7)）
7. φ_hat = argmin_φ (Bias_hat^2 + Var_hat)
8. return V_hat_OPFV(π_e; D, φ_hat)

# F-OPL: OPFV-PG 学習
Input: 過去ログ D, ターゲット時刻 t', 学習率 η, 反復数 R
1. 方策パラメータ ζ を初期化、f_hat を学習、φ_hat を選択（上記手続き）
2. for τ = 1..R:
3.     式(8) で勾配 ∇_ζ V_hat_OPFV(π_ζ; D) を計算
4.     ζ ← ζ + η ∇_ζ V_hat_OPFV
5. return π_ζ
```

---

## Architecture / Process Flow

```
              PAST  (t ∈ [0, T])                 FUTURE (t' > T)
   ┌─────────────────────────────────┐      ┌──────────────────────┐
   │ 過去ログ D ~ π_0(x, t, a, r)      │      │ 新方策 π_e を将来に配備 │
   │  報酬は季節/曜日/祝日で変動        │      │  真値 V_{t'}(π_e) 未観測│
   └───────────────┬─────────────────┘      └───────────┬──────────┘
                   │                                     │
        time feature φ(t) 抽出                同一 φ を持つ t' を対応付け
                   │                                     │
                   ▼                                     ▼
        報酬分解 q = g(x, φ(t), a) + h(x, t, a)
                   │
   ┌───────────────┴───────────────────────────────────┐
   │ OPFV: I_φ(t_i,t')/p(φ(t')) · (π_e/π_0) · (r - f̂)   │  ← time feature 重み付け
   │       + E_{π_e}[ f̂ ]                                │  ← residual を回帰補正
   └───────────────┬───────────────────────────────────┘
                   │
         data-driven に φ の粒度 |φ| を最適化（bias²+var 最小）
                   │
        ┌──────────┴───────────┐
        ▼                      ▼
   F-OPE: V̂_{t'}(π_e)     F-OPL: OPFV-PG で ζ を勾配上昇 → 将来方策 π_ζ
```

---

## Figures & Tables

本文 PDF から実際に確認した図表。

### Table 1 — Kuairec（実データ）F-OPL の将来方策価値比較（10 run の平均 ± 標準偏差、値が高いほど良い）

| Method | Mean Value (± SD) |
|---|---|
| RegBased | 1.48 (± 0.31) |
| IPS-PG | 1.02 (± 0.70) |
| DR-PG | 1.15 (± 0.57) |
| Prognosticator | 1.39 (± 0.59) |
| OPFV-PG (w/o tuned φ) | 1.60 (± 0.56) |
| **OPFV-PG (w/ tuned φ)** | **1.67 (± 0.63)** |

- OPFV-PG (w/ tuned φ) が最高値。tuned φ 版が w/o tuned φ 版を上回り、data-driven な time feature 最適化の実データ有効性を示す。

### Figure 1 — F-OPE の概念図（アーキテクチャ的説明）

PAST（$0\le t\le T$、旧方策 $\pi_0$ でログ収集）と FUTURE（$t'>T$、新方策の価値 $V_{t'}(\pi_e)$ が非定常で変動）を対比。従来 OPE（水平線）は将来変動を捉えられず、Future OPE（提案）は将来の変動に追随する。

### Figure 2 — バイアス・バリアンストレードオフ（method 特性）

time feature の粒度 / cardinality $|\phi|$ に対し、Squared Bias は減少、Variance は増加。両者の和である MSE を最小化する最適 $\phi^*$ が存在。

### Figure 3 — 合成データ F-OPE

- (i) 季節（target time $t'$）1〜8 にわたる真の将来価値 $V_t(\pi_e)$ と各推定量の追随。OPFV（true φ / tuned φ）は変動を良く追随。Prognosticator は season 2 などで大きく外れる（回帰段階の失敗）。
- (ii) time feature の有用性 $\lambda$ を横軸に MSE を比較。$\lambda$ 増大とともに OPFV が IPS / DR / Prognosticator より顕著に低 MSE。$\lambda\le 0.2$（時系列構造が乏しい領域）では全手法が同程度。

### Figure 4 — time feature の cardinality アブレーション

真の time feature の cardinality を 8 に固定し、OPFV で用いる $|\hat\phi|$ を 2〜16 に変化。$|\hat\phi|$ が真の値（=8）以上に細かくなるまで Squared Bias は減少、Variance は増加。Theorem 3.3 のバイアス解析と整合。

### Figure 5 — ログサイズ $n$ アブレーション

$n=500\to 4000$ で MSE / Squared Bias / Variance を比較。OPFV は全サイズで最良の MSE。IPS/DR より Variance は高いが、Bias 削減効果がそれを大きく上回る。IPS/DR は非現実的な定常性仮定により最大バイアス。

### Figure 6 — 実データ F-OPL

- (i) target time $t'$ 1〜8 での学習方策価値。OPFV-PG が多くの $t'$ で最高値。
- (ii) 学習データサイズ $n$（1000〜8000）増加に対し OPFV-PG は将来価値が向上。ベースラインはバイアスのある勾配を用いるため $n$ 増でも改善が保証されない。

---

## Experiments & Evaluation

### Setup

**合成データ（Synthetic）**:
- Year 1（1/1〜12/31, $t=0\to T$）で過去ログを生成、Year 2 の複数ターゲット時刻での新方策価値を評価。
- 10 次元コンテキスト $x$ を標準正規から、報酬関数 $q(x,t,a;\lambda)=\lambda\cdot g(x,\phi_{\text{true}}(t),a)+(1-\lambda)\cdot h(x,t,a)$。$\lambda$ は true time feature $\phi_{\text{true}}$ の有用性を制御。
- 真の time feature は 1 年を 8 季節に均等分割（$\phi_{\text{true}}:t\to\{\text{season 1},\dots,\text{season 8}\}$、Year 1/Year 2 で反復）。$h$ 関数により同一 season でも timestamp $t$ ごとに期待報酬が異なる非定常性を導入。
- logging policy $\pi_0$: 報酬に対する softmax（逆温度 $\beta=0.1$）、行動空間 $|\mathcal{A}|=10$、報酬は平均 $q$・標準偏差 $\sigma=1.0$ の正規分布。
- evaluation policy $\pi_e$: $\epsilon$-greedy（$\epsilon=0.2$）。
- サンプル数: F-OPE で $n=1000$、F-OPL で $n=8000$。$\lambda=0.5$（両実験のデフォルト）。
- F-OPE baseline: IPS, DR, Prognosticator。F-OPL baseline: RegBased, IPS-PG, DR-PG, Prognosticator。OPFV は true φ 版と tuned $\hat\phi$ 版を比較。

**実データ（Kuairec）**:
- 動画共有アプリ Kuaishou の推薦ログ。ユーザ ID、timestamp $t$、推薦動画 ID（action $a$）、reward $r\in[0,\infty)$（視聴時間 / 動画長 = watch ratio）。
- 行動空間は計算効率のため 3327 動画から 100 action を一様サブサンプル。context $x$ はユーザ特徴・動画特徴（疎・欠損は除外）。
- 過去ログ: 2020-07-05〜08-04（$t=0\to T$）、テスト（将来）: 08-05〜09-05。
- 方策はニューラルネット（隠れ層 3）でパラメータ化。OPFV-PG (w/o tuned φ) は time feature に「曜日（day of the week）」を使用。DR / OPFV は Random Forest で $q(x,t,a)$ を推定。

### Main Results（数値付き）

- **実データ F-OPL（Table 1）**: OPFV-PG (w/ tuned φ) が **1.67 (± 0.63)** で最高。次点 OPFV-PG (w/o tuned φ) 1.60 (± 0.56)。ベースライン最良は RegBased 1.48 (± 0.31)、Prognosticator 1.39 (± 0.59)、DR-PG 1.15 (± 0.57)、IPS-PG 1.02 (± 0.70)。OPFV-PG が既存手法を明確に上回る。
- **合成 F-OPE（Figure 3, 5）**: OPFV は $\lambda$ 増大・全ログサイズで最低 MSE。IPS/DR は定常性仮定により最大バイアス、Prognosticator は小サンプル時に高バリアンスで失敗。（個別の MSE 数値は本文グラフのみで表形式の厳密値は**記載なし**。）
- **合成 F-OPL（Figure 6）**: OPFV-PG が多くのターゲット時刻・学習サイズで最高の将来方策価値を達成。

### Ablation

- **time feature の cardinality（Figure 4）**: $|\hat\phi|$ を細かくすると真値（8）に達するまでバイアス減少、バリアンス増加。最適粒度が MSE を最小化。
- **time feature の有用性 $\lambda$（Figure 3(ii)）**: $\lambda\le 0.2$ では時系列構造が乏しく全手法同程度（OPFV の限界）だが、$\lambda$ 増大で OPFV の優位が拡大。
- **ログサイズ $n$（Figure 5）**: OPFV は全 $n$ で MSE 最良。
- **tuned φ vs true φ**: 合成データで tuned $\hat\phi$ は true $\phi_{\text{true}}$ とほぼ同等の性能。真の time feature を知らなくても data-driven 選択が有効。実データでも tuned φ が w/o tuned を上回る（Table 1）。

---

## 本テーマへの適用可能性

想定ユーザは、クーポン / メールなど**低頻度なマーケティング施策**を最適化するデータサイエンティストで、過去ログから新しいターゲティング / 配信方策を**オフライン評価（off-policy evaluation）**し、ランキング / slate や**長期・非定常**設定を扱い、複数キャンペーン間でデータをプールしたいというニーズを持つ。この論文は特に「非定常」と「将来価値の評価」に直接刺さる。

- **将来キャンペーンの価値を過去ログから評価（F-OPE の中核）**: マーケティングでは「前四半期のキャンペーンログを使って、次のキャンペーンでの新配信方策の効果を事前に見積もる」ことが典型。従来 OPE（IPS/DR）は過去の反応率をそのまま将来に流用するが、季節性（年末商戦、給料日、連休）で反応率が変動するとバイアスが乗る。OPFV はまさにこの「将来時点 $t'>T$ にデータが無い」状況を初めて正面から扱う枠組みで、施策評価の設計に直接応用できる。
- **time feature $\phi(t)$ をマーケティングカレンダーに写像**: 曜日・月・季節に加え、給料日 / セール期間 / 祝日 / キャンペーン週といったドメイン固有の時間構造を $\phi(t)$ として設計すれば、「来月の同じイベント週」と「過去の同イベント週」を対応付けて反応率を選択的に重み付けできる。低頻度施策では各時点のサンプルが薄いため、粗い time feature（例: 「セール週 / 平常週」の 2 値）で低バリアンスに寄せる運用が現実的。
- **粒度の data-driven 最適化（式 7）が薄いデータで効く**: 施策が低頻度でログが少ない状況では、細かい time feature はバリアンスで破綻する。bias²+var を過去データのみで最小化する $\hat\phi$ 選択の手続きは、キャンペーン数が限られる現場での実装ガイドとして直接使える。
- **複数キャンペーン間のデータプール**: 「同一 time feature を共有する過去サンプルを束ねる」という OPFV の発想は、個々のキャンペーンを跨いで「同種のイベント文脈」のログをプールして評価する設計と親和的。異なる過去キャンペーンでも $\phi(t)$ が一致すれば重み付き平均に寄与させられ、低頻度施策のサンプル不足を緩和できる。
- **新方策の直接学習（OPFV-PG）**: 評価に留まらず、将来ターゲット時刻に最適化された配信方策そのものを過去ログから学習できる。ターゲティング方策（誰にクーポンを送るか）の勾配学習に応用可能。
- **長期・非定常への対応**: gradual / abrupt 双方の非定常を単一枠組みで扱えるため、需要トレンドの緩やかな変化と、キャンペーン開始による急峻な行動変化の両方を含むマーケティング環境に適合する。
- **留意点（ランキング / slate への直接性）**: 本論文は contextual bandit（単一 action）設定であり、**ランキング / slate は明示的に扱っていない**。slate への適用には、slate 用の importance weighting（例: pseudo-inverse / adaptive IPS 系）と OPFV の time feature 重みを合成する追加設計が必要で、本論文だけでは埋まらない。ランキング評価には別途 slate OPE 手法との組合せを検討すべき。
- **前提条件のチェック**: (1) Common Support（$\pi_e>0 \Rightarrow \pi_0>0$）— 旧配信方策が探索的で被覆を持つこと、(2) Common Time Feature Support（$p(\phi(t'))>0$）— 将来イベントと同種の過去イベントがログに存在すること。低頻度施策で「過去に一度も経験していない新イベント週」を評価する場合はこの条件が崩れ、time feature を粗くするか外挿の限界を認識する必要がある。

---

## Notes

- Venue は KDD 2025（ACM SIGKDD, Toronto, 2025-08-03〜07）。arXiv v1 は 2025-06-25。
- コードは Sony 公開: https://github.com/sony/ds-research-code/tree/master/kdd2025-opfv
- OPFV は DR の上に time feature に関する追加 importance weight を乗せた形で、既存 DR 実装への組込みが容易（本文が強調する OPFV の利点）。
- 本レポート中の厳密な数値は Table 1（実データ F-OPL）のみ表形式で提示されており、合成データ F-OPE/F-OPL の MSE・方策価値は本文グラフ（Figure 3〜6）で示され、表形式の厳密値は本文（本編）には**記載なし**（付録に個別推定量結果あり、との言及のみ）。
- 図の画像 URL: arXiv HTML 版（https://arxiv.org/html/2506.20417）は取得時点で 404 のため、埋め込み可能な図 URL は**確認できず**。図の内容は PDF 本文から直接読み取った記述に基づく。
- 略称の注意: 提案手法名は OPFV（Off-Policy Estimator for the Future Value）、学習版は OPFV-PG。Prognosticator は比較対象（Chandak et al.）であり本論文の提案ではない。
