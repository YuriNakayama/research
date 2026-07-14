# Heterogeneous Treatment Effects in Panel Data (PaCE: Panel Clustering Estimator)

- **Link**: https://arxiv.org/abs/2406.05633
- **Authors**: Retsef Levi, Elisabeth Paulson, Georgia Perakis, Emily Zhang
- **Year**: 2024 (submitted 2024-06-09)
- **Venue**: arXiv preprint (Statistics > Machine Learning, stat.ML)
- **Type**: 手法提案論文（因果推論 / パネルデータの異質処置効果推定 + 理論保証）

---

## Abstract (English, verbatim)

> We address a core problem in causal inference: estimating heterogeneous treatment effects using panel data with general treatment patterns. Many existing methods either do not utilize the potential underlying structure in panel data or have limitations in the allowable treatment patterns. In this work, we propose and evaluate a new method that first partitions observations into disjoint clusters with similar treatment effects using a regression tree, and then leverages the (assumed) low-rank structure of the panel data to estimate the average treatment effect for each cluster. Our theoretical results establish the convergence of the resulting estimates to the true treatment effects. Computation experiments with semi-synthetic data show that our method achieves superior accuracy compared to alternative approaches, using a regression tree with no more than 40 leaves. Hence, our method provides more accurate and interpretable estimates than alternative methods.

## Abstract (日本語訳)

> 本研究は因果推論の中核的課題、すなわち「一般的な処置パターンを持つパネルデータを用いた異質処置効果（heterogeneous treatment effects）の推定」に取り組む。既存手法の多くは、パネルデータに潜在する構造を活用しないか、あるいは許容できる処置パターンに制約を持つ。本論文では、まず観測値を回帰木（regression tree）によって「処置効果が近い」互いに素なクラスタへ分割し、次にパネルデータの（仮定された）low-rank 構造を活用して各クラスタの平均処置効果を推定する新手法を提案・評価する。理論的結果として、得られた推定量が真の処置効果へ収束することを示す。半合成（semi-synthetic）データを用いた計算実験では、本手法が最大でも 40 個の葉（leaf）しか持たない回帰木を用いて、代替手法よりも優れた精度を達成することを示す。したがって、本手法は代替手法よりも高精度かつ解釈可能な推定を提供する。

---

## Overview

PaCE（**Pa**nel **C**lustering **E**stimator）は、パネルデータ（同一ユニットを複数期間にわたり観測した縦断データ）における**異質処置効果**を、(1) 回帰木による観測値のクラスタリングと (2) low-rank 行列補完に基づく de-biased 凸推定量、の2段階で推定する手法である。

従来のパネル因果推論（synthetic control, matrix completion, difference-in-differences 系）は「処置タイミングがブロック状（一度処置されると継続）」のような限定的な処置パターンを前提とすることが多い。PaCE はこの制約を緩め、任意の（unit, time）セルが処置され得る**一般的な処置パターン**を許容しつつ、効果の異質性を covariate に基づく回帰木で解釈可能な形に要約する点が特徴である。

---

## Problem

- **異質性の推定**: 処置効果は unit・time ごとに異なり、covariate の関数として変化する。均一な ATE では実務的示唆が乏しい。
- **一般的な処置パターン**: 既存のパネル手法（synthetic control 等）は staggered adoption / block treatment を前提にしがちで、任意セルが処置され得る設定を扱えない。
- **構造の未活用**: 一方で汎用の HTE 手法（Causal Forest, DML など）はパネル特有の low-rank 構造（潜在因子表現）を活用しないため、confounding を除去しきれない。
- **交絡と反実仮想**: 観測アウトカム行列 $O$ には未処置の反実仮想 $M$（low-rank と仮定）が埋め込まれており、これを分離しないと処置効果が汚染される。
- **解釈可能性 vs 精度のトレードオフ**: 複雑な ML 手法は精度は出ても解釈が難しい。実務では「どの層に効いたか」を可読な形で示したい。

---

## Proposed Method

### Core idea

観測アウトカム行列を「low-rank な反実仮想（未処置）ベースライン $M$ ＋ 行バイアス $m\mathbf{1}^\top$ ＋ 処置効果項」に分解する。処置効果項は、covariate 空間を回帰木で互いに素なクラスタ $\{C_j\}$ に分割し、各クラスタに定数の平均効果 $\tau_j$ を割り当てることで表現する。$M$ の nuclear norm 正則化（核ノルム）で low-rank を促し、正則化に起因するバイアスを de-biasing で補正する。

### Numbered steps

1. **入力**: 観測アウトカム行列 $O \in \mathbb{R}^{n \times T}$、処置指示行列 $W$、covariate、正則化パラメータ $\lambda$、葉の最大数 $\ell$。
2. **Step 1 — Clustering（Algorithm 1）**: 回帰木を貪欲に成長させ、$n \times T$ 個の観測を「処置効果が近い」$\ell$ 個の互いに素なクラスタへ分割する。各分割候補について凸最適化を解いて推定 MSE を評価し、MSE を最小化する分割を選ぶ。
3. **Step 2 — Estimation**: 得られたクラスタ割当のもとで、low-rank 構造を利用した凸推定量を解き、各クラスタの平均処置効果 $\hat{\tau}_j$ を推定する。
4. **De-biasing**: 核ノルム正則化が導入するバイアスを解析的に補正し、de-biased 推定量 $\tau^{d}$ を得る。
5. **出力**: クラスタごとの平均処置効果と、解釈可能な回帰木（最大 40 葉）。

### Key Formulas

Step 1 のクラスタリングで解く凸最適化問題（クラスタメンバシップ $C^i_j$ を含む）:

$$
(\hat{M}, \hat{\tau}, \hat{m}) \leftarrow \arg\min \left[ \tfrac{1}{2}\big\| O - M - m\mathbf{1}^\top - \textstyle\sum_i \sum_j \tau_{i,j}\, W_i \circ C^i_j \big\|_F^2 + \lambda \|M\|_\star \right]
$$

Step 2 の処置効果推定（処置デザイン行列 $Z_i$ を用いた形）:

$$
(\hat{M}, \hat{\tau}, \hat{m}) \in \arg\min \left[ \tfrac{1}{2}\big\| O - M - m\mathbf{1}^\top - \textstyle\sum_i \tau_i Z_i \big\|_F^2 + \lambda \|M\|_\star \right]
$$

De-biased 推定量（$D$ は射影済み処置行列の内積、$\Delta^1$ は核ノルム正則化由来のバイアス項）:

$$
\tau^{d}_i = \frac{(\hat{\tau} - D^{-1}\Delta^1)_i}{\|\tilde{Z}_i\|_F}
$$

ここで、$\|\cdot\|_F$ は Frobenius ノルム、$\|\cdot\|_\star$ は nuclear norm（特異値の和 = low-rank 促進）、$\circ$ は要素積（Hadamard 積）。$M$ が反実仮想（未処置）ベースライン、$m\mathbf{1}^\top$ が行方向バイアス。

---

## Algorithm

```
Algorithm 1: Clustering the observations (PaCE Step 1)
Input : 観測行列 O, 処置指示 W, covariate, 正則化 λ, 最大葉数 ℓ
Output: 互いに素なクラスタ割当 {C_j} と 各クラスタの推定効果 τ̂_j

1  root ← 全観測を含む単一クラスタで初期化
2  while クラスタ数 (= 葉数) < ℓ do
3      for 各葉ノード l, 各分割候補 (covariate, threshold) do
4          l を2つの子クラスタへ暫定分割
5          現クラスタ割当のもとで凸最適化(式: Step 1 の argmin)を解く
6          推定 MSE を計算
7      end
8      MSE を最も減少させる分割を採用し、木を成長させる
9  end
10 return 最終クラスタ割当 {C_j} と τ̂_j

# 続いて Step 2 で low-rank 凸推定量を解き、
#   de-biasing により τ^d を得る。
```

---

## Architecture / Process Flow

```
        Panel data
   O ∈ R^{n×T} (units × time)
   + 処置指示 W + covariates
            │
            ▼
 ┌───────────────────────────────┐
 │ Step 1: Regression-tree        │
 │ Clustering (Algorithm 1)       │
 │ - 貪欲分割で ℓ 個(≤40)のクラスタ │
 │ - 各分割で凸最適化→MSE最小化     │
 └───────────────┬───────────────┘
                 │ 互いに素なクラスタ {C_j}
                 ▼
 ┌───────────────────────────────┐
 │ Step 2: Low-rank convex        │
 │ estimator                      │
 │ O = M(low-rank) + m·1ᵀ         │
 │     + Σ τ_j (処置効果項)         │
 │ nuclear-norm 正則化 ‖M‖_⋆       │
 └───────────────┬───────────────┘
                 │
                 ▼
 ┌───────────────────────────────┐
 │ De-biasing → τ^d               │
 │ (正則化バイアス Δ¹ を補正)       │
 └───────────────┬───────────────┘
                 ▼
   クラスタ別 平均処置効果 τ̂_j
   ＋ 解釈可能な回帰木
```

---

## Figures & Tables

> 注: arXiv HTML 版から本文・式・Algorithm・実験設定は取得できたが、**結果テーブルの完全な数値および図の `<img>` URL は HTML 出力上で取得できなかった**（Section 4 が truncate されて返された）。そのため以下の数値は「取得できた範囲のみ」を記載し、未取得のセルは「記載なし」とする。画像 URL は実際に確認できていないため埋め込まない。

### Table 1: 手法比較（method comparison）

| 手法 | パネル low-rank 構造の活用 | 一般的な処置パターン | 解釈可能性 |
|------|--------------------------|--------------------|-----------|
| **PaCE (本手法)** | あり（nuclear-norm） | 対応 | 高（≤40 葉の回帰木） |
| Double Machine Learning (DML) | なし | 対応 | 低〜中 |
| Doubly Robust (DR) Learner | なし | 対応 | 低〜中 |
| XLearner | なし | 対応 | 低〜中 |
| Multi-arm Causal Forest | なし | 対応 | 中 |
| Synthetic control 系（比較の文脈） | あり | 限定的（block/staggered） | 中 |

### Table 2: 実験設定（datasets / semi-synthetic）

| パネル構成 | ユニット数 $n$ | 期間 $T$ | 備考 |
|-----------|--------------|---------|------|
| SNAP data | 517 zip code (Massachusetts) | 70 months | semi-synthetic |
| State data | 52 U.S. states/territories | 18 years | semi-synthetic |
| County data | 770 U.S. counties | 18 years | semi-synthetic |

- 処置割合 $\alpha \in \{0.05, 0.25, 0.5, 0.75, 1.0\}$
- 処置パターン: non-adaptive（ランダムなブロック） / adaptive（絶対変化が大きい箇所を狙う）の2種
- 効果は covariate の組合せで生成し、平均アウトカムの 20% に正規化
- 各パラメータ組合せにつき 200 インスタンスで評価（処置パターン・効果をランダム化）

### Table 3: 主要結果（main results）

| 指標 | PaCE | DML | DR Learner | XLearner | Causal Forest |
|------|------|-----|-----------|----------|---------------|
| 精度（error / RMSE の具体値） | 記載なし | 記載なし | 記載なし | 記載なし | 記載なし |

> 定性的結論のみ取得: PaCE は「最大 40 葉の回帰木」を用いて、代替手法（DML / DR Learner / XLearner / multi-arm Causal Forest）に対し **competitive、しばしば superior な精度**を達成した。具体的な数値テーブルは HTML から取得できず「記載なし」。

### Table 4: 理論保証（analysis / theory）

| 命題 | 内容（取得できた範囲） |
|------|----------------------|
| Assumption 3.1 (Coverage Condition) | 各 hyper-rectangle 内の処置観測割合が体積にほぼ比例。マージン誤差 $M := \sqrt{\ln(nT)(p+1)/\min(n,T)}$ |
| Assumption 3.3 (Identification) | 処置行列が low-rank 構造の接空間に対し十分な incoherence を持つ。$\sigma_{\min}(D^\star) \ge c_s/\log n$（処置行列の非共線性） |
| Theorem 3.2 (Bounded bias tree) | 各クラスタ内の最大処置効果差が $2 L_i \sqrt{p} / \ell^{s}$ で抑えられる（$s$ は葉数 $\ell$ 増加に伴う多項式減衰率） |
| Theorem 3.5 (Optimal rate) | 平均処置効果推定の誤差が（対数項を除き）最適レートで収束。単一処置の既存結果を $O(\log n)$ 処置へ拡張 |

---

## Experiments & Evaluation

### Setup

- **データ**: 3種の semi-synthetic パネル（SNAP: 517×70、State: 52×18、County: 770×18）。実データの共変量構造の上に既知の処置効果を人工付与し、真値との比較で精度を測る。
- **処置パターン**: 処置割合 $\alpha \in \{0.05, 0.25, 0.5, 0.75, 1.0\}$、non-adaptive / adaptive の2タイプ。
- **効果生成**: covariate の組合せから生成、平均アウトカムの 20% に正規化。
- **比較手法**: DML、DR Learner、XLearner、multi-arm Causal Forest。
- **試行数**: 各パラメータ組合せで 200 インスタンス。
- **木サイズ**: 葉数は最大 40。

### Main Results

- PaCE は最大 40 葉の回帰木を用いて、比較手法に対し **competitive・しばしば superior** な精度を達成。
- 解釈可能性（可読な回帰木でクラスタ＝効果の異質性を提示）と精度を両立。
- 理論的に、推定量が真の処置効果へ（対数項を除く）最適レートで収束することを保証。
- 具体的な数値（各手法の RMSE / error）は HTML から取得できず「記載なし」。原論文 PDF の Section 4 のテーブル参照が必要。

---

## 本テーマへの適用可能性

**テーマ**: データサイエンティストが不定期にマーケティングキャンペーン（クーポン・メール等）を、毎回異なる対象ユーザー・異なる施策で実施している。似たキャンペーンを**グルーピング／プーリング**して密なデータを合成し、実効サンプルサイズを増やし、実効的な実験間隔を短縮して、uplift modeling / off-policy evaluation に活かしたい。

PaCE の枠組みは、この課題に対して以下のように具体的に対応する。

1. **キャンペーン履歴を自然にパネルとして表現できる**
   反復的なキャンペーンは (unit = ユーザーまたはセグメント) × (time = キャンペーン実施時点) の行列 $O$ として表現でき、まさに PaCE が対象とする $n \times T$ パネルになる。不定期・スパースな処置（毎回対象が異なる）は「一般的な処置パターン」に相当し、PaCE が block/staggered 制約を課さない点が直接に効く。

2. **「似たキャンペーンのプーリング」= 回帰木クラスタリング**
   本テーマの「似た campaign をグループ化して密なデータを合成」という要求は、PaCE の Step 1（covariate に基づく回帰木クラスタリング）に対応する。ユーザー属性・施策属性（クーポン額、チャネル、季節等）を covariate として与えれば、「処置効果が近い (user, campaign) セル」が自動的に同一クラスタへ集約され、クラスタ単位で実効サンプルが増える。これはヒューリスティックな手動プーリングより原理的で、しかも解釈可能（≤40 葉）。

3. **low-rank ベースラインが「実効実験間隔の短縮」に寄与**
   未処置の反実仮想 $M$ を low-rank と仮定して行列補完的に推定するため、各キャンペーン単独では観測が疎でも、他時点・他ユーザーの情報を借りてベースラインを補完できる。これにより「毎回きれいな RCT を長期間回す」必要を緩和し、疎な観測から uplift を引き出す=実効的な実験間隔短縮に直結する。

4. **異質処置効果 → uplift modeling そのもの**
   PaCE の出力（クラスタ別 $\hat{\tau}_j$ ＋回帰木）は uplift のセグメント別推定に他ならない。どのユーザー×施策の組合せが効くかを可読な木で提示できるため、次回キャンペーンのターゲティング（誰にどのクーポンを送るか）に即転用できる。

5. **off-policy evaluation への接続**
   de-biased 推定量はクラスタ別平均効果の一致性・収束レートを保証するため、「もし別のターゲティング方策で配っていたら」という反実仮想評価（OPE）に、クラスタ別 $\tau$ を積み上げる形で利用できる。

### 適用上の注意・ギャップ

- **low-rank 仮定の妥当性**: ユーザー×キャンペーンのベースライン反応が低ランク潜在因子で近似できることが前提。行動が強く非定常・イベント駆動だと崩れ得る。
- **Coverage Condition（Assumption 3.1）**: 各セグメント内で処置観測が体積比例に十分カバーされている必要がある。極端に偏ったターゲティング（常に同じ層だけ処置）だと identification が弱くなる。
- **処置効果のクラスタ内定数近似**: 木の葉内では効果を定数とみなすため、葉数（≤40）と異質性の粒度がトレードオフ。細かすぎる個別化には向かない。
- **semi-synthetic 検証のみ**: 実際のマーケ RCT ログでの外部妥当性は本論文では未検証。自社ログでの再現検証が必要。
- **incoherence / 非共線性（Assumption 3.3）**: 施策パターンが low-rank ベースラインと重なりすぎると効果とベースラインが分離できない。キャンペーン設計に一定のランダム性・多様性が必要。

---

## Notes

- 手法名 **PaCE = Panel Clustering Estimator**。2段構成（回帰木クラスタリング → low-rank de-biased 凸推定）。
- 理論保証（Theorem 3.2 / 3.5）と semi-synthetic 実験の両面から評価。単一処置の既存 low-rank 因果推論結果を $O(\log n)$ 個の処置へ拡張した点が理論的貢献。
- **本レポートの数値の取得状況**: title / authors / abstract / 手法・式・Algorithm・実験設定・仮定・定理は取得済み。**結果テーブルの具体的 error/RMSE 数値と図の画像 URL は arXiv HTML から取得できず「記載なし」**とした（ハルシネーション回避のため未取得の数値・画像は記載・埋め込みしていない）。正確な結果値は原論文 PDF (arXiv:2406.05633) Section 4 を要参照。
- 関連比較手法: DML, DR Learner, XLearner, multi-arm Causal Forest, および文脈上の synthetic control / matrix completion 系パネル因果推論。
