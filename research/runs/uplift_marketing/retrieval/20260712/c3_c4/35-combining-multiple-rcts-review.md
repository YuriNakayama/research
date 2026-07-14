# Comparison of Methods that Combine Multiple Randomized Trials to Estimate Heterogeneous Treatment Effects

- **Link**: https://arxiv.org/abs/2303.16299 (arXiv 2303.16299) / 出版版: Statistics in Medicine 2024, 43(7): 1291-1314, https://onlinelibrary.wiley.com/doi/10.1002/sim.9955 / PMC 全文: https://pmc.ncbi.nlm.nih.gov/articles/PMC11086055/
- **Authors**: Carly Lupton Brantner, Trang Quynh Nguyen, Tengjie Tang, Congwen Zhao, Hwanhee Hong, Elizabeth A. Stuart
- **Year**: 2023 (arXiv v1: 2023-03-28, v2: 2023-11-15) / 出版: 2024
- **Venue**: Statistics in Medicine (2024). arXiv 初出は stat.ME (Statistics — Methodology)
- **Type**: Survey / Review（複数 RCT を統合して HTE を推定する手法の比較レビュー。手法群の taxonomy を主眼とする）

---

## Abstract (English, verbatim)

> Individualized treatment decisions can improve health outcomes, but using data to make these decisions in a reliable, precise, and generalizable way is challenging with a single dataset. Leveraging multiple randomized controlled trials allows for the combination of datasets with unconfounded treatment assignment to better estimate heterogeneous treatment effects. This paper discusses several non-parametric approaches for estimating heterogeneous treatment effects using data from multiple trials. We extend single-study methods to a scenario with multiple trials and explore their performance through a simulation study, with data generation scenarios that have differing levels of cross-trial heterogeneity. The simulations demonstrate that methods that directly allow for heterogeneity of the treatment effect across trials perform better than methods that do not, and that the choice of single-study method matters based on the functional form of the treatment effect. Finally, we discuss which methods perform well in each setting and then apply them to four randomized controlled trials to examine effect heterogeneity of treatments for major depressive disorder.

## Abstract (日本語訳)

> 個別化された治療判断は健康アウトカムを改善しうるが、単一データセットのみでは、その判断を信頼でき・高精度で・一般化可能な形で行うことは難しい。複数の RCT（ランダム化比較試験）を活用すれば、交絡のない（unconfounded な）介入割り当てを持つデータセット同士を結合でき、異質処置効果（heterogeneous treatment effects; HTE）をより良く推定できる。本論文では、複数試験のデータを用いて HTE を推定するためのいくつかのノンパラメトリック手法を論じる。単一研究向けの手法を複数試験のシナリオへ拡張し、試験間異質性（cross-trial heterogeneity）の水準を変えたデータ生成シナリオを持つシミュレーション研究を通じて、それらの性能を検討する。シミュレーションの結果、試験横断的な処置効果の異質性を直接許容する手法は、そうでない手法より良好に機能すること、そして処置効果の関数形（functional form）に応じて single-study 手法の選択が重要であることが示された。最後に、各設定でどの手法が良好かを議論し、4 つの RCT に適用して大うつ病性障害（MDD）治療の効果異質性を検討する。

---

## Overview

本論文は「複数の RCT をどう統合（pool）して HTE / CATE（conditional average treatment effect）を推定するか」という問いに対し、既存の single-study meta-learner（S-learner・X-learner・causal forest）を土台に、**複数試験を結合するための aggregation 戦略（pooling method の taxonomy）**を体系化し、シミュレーションと実データ（うつ病 4 試験）で横断比較したレビュー的方法論論文である。

核となる 2 軸の分解:

1. **Single-study 軸**（CATE をどう推定するか）: S-learner / X-learner / causal forest。
2. **Aggregation 軸**（複数試験をどう結合するか）: complete pooling / pooling with trial indicator / ensemble (tree・forest・lasso) / IPD meta-analysis / no pooling。

この 2 軸の直積が「手法の組み合わせ空間」であり、レビューの主眼は「どの aggregation 戦略が、どの試験間異質性・関数形のもとで有利か」を明らかにする点にある。結論として、**試験間異質性を明示的に許容する手法（pooling with trial indicator、ensemble forest）が、異質性を無視する complete pooling より一貫して優れる**。

---

## Problem

- 単一 RCT はサンプルサイズが限られ、HTE / effect moderator を信頼して検出するには検出力が不足する。本文の注記として「effect moderator を同定するには、平均処置効果（ATE）の同定に比べ 4 倍のサンプルが必要」とされる。
- 複数 RCT を結合すれば実効サンプルサイズは増えるが、**試験間で処置効果が異なりうる（cross-trial heterogeneity）**ため、単純結合（complete pooling）はバイアスを生む恐れがある。
- 一方で試験ごとに別々に推定（no pooling）すると情報共有ができず、精度が犠牲になる。
- 適切な「中間」（部分プーリング）をどう設計するか、single-study 手法（S/X-learner, causal forest）とどう組み合わせるかの体系的な指針が乏しい。
- 処置効果の関数形（線形 / 区分線形 / 非線形）により最適手法が変わり、実務者はどれを選ぶべきか判断が難しい。

---

## Proposed Method — Taxonomy of Pooling Methods

本論文は単一の新手法を提案するのではなく、**complete pooling から no pooling までの aggregation 戦略の taxonomy** を提示する。以下が pooling method の分類表である。

### Taxonomy Table: Aggregation（複数試験の結合）戦略

| Method family | Key idea | 試験間異質性の扱い | 出力する CATE | 主な仮定 | Pros | Cons |
|---|---|---|---|---|---|---|
| **Complete pooling** | K 個の RCT を 1 つのデータセットに結合し、試験識別子を入れずに単一の single-study 手法を当てはめる | 無視（同質を仮定） | universal（試験非依存）CATE | overall consistency、試験間同質性 | 実装が単純、最大サンプルを利用 | 異質性があるとバイアス増大（シミュレーションで MSE 急増） |
| **Pooling with trial indicator** | 全個人データを結合し、試験メンバーシップをカテゴリ共変量としてモデルに投入 | モデルが必要なら trial effect を吸収 | trial-specific CATE | consistency within each study | 異質性を許容しつつ情報共有、causal forest と好相性 | trial 数 K が大きいと trial indicator が split に使われにくくなる（K≥25 で study 重要度がほぼ 0） |
| **Ensemble — regression tree** | Tan らの federated learning 枠組みを応用。(1) 各試験内で trial-specific モデルを学習 →(2) 各試験モデルを全個人 (N·K) に適用し augmented CATE を生成 →(3) その augmented データに最終 ensemble モデル（回帰木）を当てはめ | 試験ごとの局所モデルを集約 | trial-specific / 個別 CATE | consistency within study | 非線形にも柔軟、分散型（生データ共有不要）に親和 | 3 段階で分散が乗る、木単体は不安定 |
| **Ensemble — random forest** | 同上、最終 ensemble モデルを random forest に | 同上 | 同上 | 同上 | S/X-learner で最良平均 MSE（回帰分析結果）、非線形に強い | 計算コスト高 |
| **Ensemble — lasso** | 同上、最終 ensemble モデルを lasso 回帰に | 同上 | 同上 | 同上、線形性に近い構造を仮定 | 疎な moderator 選択、線形設定で有効 | 非線形シナリオ（1b）で性能顕著に低下 |
| **IPD meta-analysis** | 個人参加者データ（IPD）を用いた古典的パラメトリック混合効果モデル。試験ごとの random intercept / random slope を持つ | random effects で明示的にモデル化 | trial-specific CATE | 線形関数形、moderator の事前指定、正規誤差 | 統計的に解釈しやすい、正しく指定されれば高性能 | moderator の事前指定が必要、非線形設定（1b）で性能低下 |
| **No pooling** | 各試験内で独立にモデルを当てはめ、情報共有なし（ベースライン比較用） | 完全分離 | trial-specific CATE | consistency within study | バイアスは小さい | 精度が犠牲、少数試験で不安定 |

### Single-study meta-learners（CATE 推定の基盤手法）

| Learner | 定義 | 特徴 |
|---|---|---|
| **S-learner** (Single) | 処置 $A$ を 1 つの特徴として含む単一の条件付き期待値 $\mu(X,A)=E(Y\mid X,A)$ を学習し、$\hat\tau(X)=\hat\mu(X,1)-\hat\mu(X,0)$ | シンプル。処置の影響が弱いと regularization で潰れやすい。区分線形（1a）で相対的に弱い |
| **X-learner** (Cross) | 群別に $\mu_0,\mu_1$ を学習 → 反実仮想を imputation して個別効果を作り → 群別に回帰 → 傾向スコアで加重結合 | 群間不均衡に強い。非線形（1b）で有効 |
| **Causal forest** | 処置効果の異質性を最大化する split で共変量空間を再帰分割する causal tree の加重集約 | シナリオ 2（試験ごとに関数形が変化）で single-study 手法中で最良 |

### Key Formulas

CATE（母集団レベル）:
$$\tau(X) = E\big(Y(1)\mid X\big) - E\big(Y(0)\mid X\big)$$

Study-specific CATE:
$$\tau_s(X) = E\big(Y(1)\mid X, S=s\big) - E\big(Y(0)\mid X, S=s\big)$$

潜在アウトカムの生成モデル:
$$Y_i(a) = m(x_i, s_i) + (2a-1)\cdot \tau(x_i, s_i) + \epsilon_i$$

S-learner 推定量:
$$\hat\tau(X) = \hat\mu(X,1) - \hat\mu(X,0)$$

X-learner の imputed individual effects と最終結合:
$$\tilde D_{i:A=1} = Y_{i:A=1} - \hat\mu_0(X_{i:A=1}), \qquad \tilde D_{i:A=0} = \hat\mu_1(X_{i:A=0}) - Y_{i:A=0}$$
$$\hat\tau(X) = \hat g(X)\,\hat\tau_1(X) + \big(1-\hat g(X)\big)\,\hat\tau_0(X)$$
ここで $\hat g(X)$ は通常傾向スコア。

IPD meta-analysis の線形混合効果モデル（Section 3.2.4）:
$$Y = \alpha_0 + a_s + \alpha_1 X_1 + \alpha_2 X_2 + \alpha_3 X_3 + \alpha_4 X_4 + \zeta A + \theta X_1 A + b_s X_1 + z_s A + t_s X_1 A + \epsilon$$
試験固有ランダム効果: $a_s\sim N(0,\sigma_a^2)$, $b_s\sim N(0,\sigma_b^2)$, $z_s\sim N(0,\sigma_z^2)$, $t_s\sim N(0,\sigma_t^2)$。

### 主要な仮定（Assumptions）

- **Assumption 1 — Unconfoundedness（各試験内で交絡なし）**:
$$\{Y(0),Y(1)\} \perp A \mid X, S=s \quad \text{for all studies } s$$
- **Assumption 2 — Consistency**:
$$Y = A\,Y(1) + (1-A)\,Y(0) \quad \text{almost surely (in each study)}$$
- **Assumption 3 — Positivity / Overlap**:
$$c < \pi_s(x) < 1-c \quad \text{for all studies } s,\ c>0$$
- **Assumption 4 — Trial Representation（緩和可能）**:
$$d < P(S=s\mid X=x) < 1-d \quad \text{for all } x,\ s,\ d>0$$
- 加えて各 RCT 内での **SUTVA**（Stable Unit Treatment Value Assumption）。universal CATE は「overall consistency」を、study-specific CATE は「各研究内の consistency」を要する。RCT を用いるため試験内の unconfoundedness は設計上満たされる（=pooling の主因は交絡除去ではなくサンプル増強と一般化）。

---

## Algorithm — Ensemble approach（代表的擬似コード）

本レビューで最も特徴的なのが Tan らの federated 枠組みを応用した ensemble 手法である。代表的な処理を一般化して示す。

```
Input: K 個の試験 {D_1, ..., D_K}, single-study learner L, 最終 ensemble モデル F ∈ {tree, forest, lasso}
1. for s = 1..K:
2.     τ̂_s ← L を D_s に当てはめ、trial-specific CATE 関数を学習
3. Augmented ← 空データセット
4. for s = 1..K:
5.     for each individual i in ∪_k D_k (全 N·K 行):
6.         Augmented に (X_i, τ̂_s(X_i)) を追加   # 各試験モデルを全個人へ適用
7. τ̂_ensemble ← F を Augmented (目的変数 = τ̂_s(X_i)) に当てはめ
Output: τ̂_ensemble(X)   # 個人 X に対する集約 CATE
```

（他手法は既存の single-study learner を complete pooling / trial indicator 付きデータ、または混合効果モデルに当てはめるだけであり、独自擬似コードは提示されないため省略。）

---

## Architecture / Process Flow — 手法 taxonomy ツリー

```
複数 RCT の統合による HTE / CATE 推定
│
├─ [軸 A] Single-study learner（CATE をどう推定するか）
│   ├─ S-learner   : μ(X,A) 単一モデル
│   ├─ X-learner   : 群別 → imputation → 傾向スコア加重
│   └─ Causal forest: 効果異質性を最大化する split の集約
│
└─ [軸 B] Aggregation（K 試験をどう結合するか）
    ├─ Complete pooling ............ 試験識別子なしで結合（異質性を無視）
    ├─ Pooling with trial indicator  試験を共変量として投入（部分プーリング）
    ├─ Ensemble ................... trial 内モデル → 全個人へ適用 → 集約
    │     ├─ regression tree
    │     ├─ random forest   ← S/X-learner で最良平均 MSE
    │     └─ lasso           ← 非線形で弱い
    ├─ IPD meta-analysis .......... random intercept/slope の混合効果モデル
    └─ No pooling ................. 各試験独立（ベースライン）

異質性の許容度: Complete pooling  <  (Ensemble ≈ Trial indicator ≈ Meta-analysis)  <  No pooling
```

---

## Figures & Tables

> 注: arXiv HTML 版（`arxiv.org/html/2303.16299`）は取得時に 404 を返したため、実在を確認できた `<img>` 画像 URL はない。画像埋め込みは行わず、caption と数値のみを PMC 全文から転記する。

### Table（本レビューの中核: pooling method taxonomy）

上掲「Taxonomy Table: Aggregation 戦略」および「Single-study meta-learners」表を参照。これが survey の分類の本体である。

### Figure 1 — シミュレーション MSE 分布

> "Distribution of MSE for main parameter combinations across all single-study and aggregation approaches. Columns are broken down by simulation scenarios (piecewise linear vs nonlinear CATE), and rows are by standard deviation of study main and study interaction coefficients."

列 = シナリオ（区分線形 1a vs 非線形 1b）、行 = 試験主効果・試験交互作用係数の標準偏差 $(\sigma_\beta,\sigma_\delta)$。complete pooling の MSE は試験間異質性の増大とともに急増する。

### Figure 2 — CATE 点推定と 95% CI

> "Point estimates and 95% confidence intervals for CATEs according to causal forest with pooling with trial indicator."

### Figure 3 — Variable importance

- **3A**: "Variable importance measures within studies"（試験ごとの causal forest）— age, weight, baseline MADRS, baseline HAM-A の 4 変数が一貫して moderator として同定。
- **3B**: "Variable importance measures according to the causal forest with pooling with trial indicator" — 同 4 変数に加え trial membership が一部 split に関与（中程度の cross-trial heterogeneity）。

### Figure 4 — 解釈木

> "Interpretation tree for causal forest with pooling with trial indicator. Circled numbers represent the average CATE estimate for individuals in that leaf."

### Table 1 — 実データの手法別 CATE（平均, SD）

> "Mean (SD) of CATEs from all individuals in sample according to different single-study and aggregation method combinations."（正の CATE は vortioxetine の MADRS 低下量が小さい=効果が弱いことを示す）

| Single-study | 平均 CATE の範囲（aggregation 横断） | SD の範囲 |
|---|---|---|
| S-learner | 0.89 – 1.38 | 1.1 – 1.6 |
| X-learner | 2.32 – 2.57 | 1.3 – 1.5 |
| Causal forest | 2.23 – 2.37 | 2.1 – 2.8 |

S-learner の推定は他より顕著に低く、causal forest は最も分散が大きい。

### 付録の主要 Table / Figure caption（抜粋）

- **Table A1**: "Average variable importance measures across 50 iterations of causal forest with pooling with trial indicator for different values of K." — $X_1$ の重要度は高いまま、study の重要度は K≥25 でほぼ 0 に。
- **Table A2**: 4 試験の参加者記述統計（処置群別）。
- **Table A3**: causal forest（trial indicator 付き）の best linear projection 結果。
- **Figure A1**: no pooling vs 最良の pooling/ensembling の MSE 比較。
- **Figure A2**: 試験ごとにサンプルサイズが異なる場合の MSE。
- **Figure A3**: 試験ごとに CATE 関数が変化する場合の MSE。
- **Figure A4**: covariate shift（共変量分布シフト）時の MSE。
- **Figure A6**: honest causal forest 使用時の平均 MSE（adaptive よりわずかに高い=やや劣るが差は非常に小さい）。
- **Figure A7 / A8**: 年齢別の CATE / subgroup ATE と 95% CI。

---

## Experiments & Evaluation

### シミュレーション設計（具体値）

- **試験数**: K = 10（主）, K = 30（副）。
- **試験あたりサンプル**: 500（基準）。総サンプル 5,000（K=10）/ 15,000（K=30）。
- **共変量**: 連続 5 個（$X_1$–$X_5$）、平均 0・分散 1・共分散 0.2。
- **処置割り当て**: 各試験内で傾向スコア $\pi_i=0.5$。
- **誤差**: $\epsilon\sim N(0,0.01)$。
- **試験固有係数**: $\beta_s\sim N(0,\sigma_\beta^2)$, $\delta_s\sim N(0,\sigma_\delta^2)$。標準偏差の組 $(\sigma_\beta,\sigma_\delta)\in\{(0.5,0),(1,0),(1,0.5),(1,1),(3,1)\}$。
- **サンプルサイズ変動**: 全試験 n=500 均等 / 大 1 試験 n=1,000 + 小 9 試験 n=200 / 半々（n=500 と n=200）。
- **covariate shift**: 偶数試験 $X_1\sim N(0,1)$、奇数試験 $X_1\sim N(2,1)$。
- **反復**: パラメータ組ごとに 1,000 回。
- **評価指標**: 推定 CATE と真の個人 CATE の間の MSE（平均二乗誤差）。

データ生成シナリオ:
- **1a（区分線形 CATE）**: $\tau(x,s)=x_1\cdot I(x_1>0)+\beta_s+\delta_s x_1$。
- **1b（非線形 CATE）**: $m(x,s)=0$, $\tau(x,s)=g(x_1)g(x_2)+\beta_s+\delta_s x_1$、$g(x)=\dfrac{2}{1+\exp(-12(x-1/2))}$（expit）。
- **2（試験ごとに関数形が変化）**: 一部非線形・一部区分線形・一部ゼロ。

### 主要な数値・定性結果

- **シナリオ 1a（区分線形）**: causal forest × pooling with trial indicator、および ensemble forest が最良。meta-analysis も良好（正しく指定されているため）。complete pooling の MSE は $(\sigma_\beta,\sigma_\delta)$ 増大で劇的に悪化。
- **シナリオ 1b（非線形）**: ensemble lasso と meta-analysis は顕著に悪化。ensemble forest と pooling with trial indicator が CATE を良好に推定。S-learner は 1a より有効。
- **シナリオ 2（可変 CATE）**: single-study 手法中で causal forest が明確に最良。S-learner は不良。pooling with trial indicator と ensemble forest が最も有効。
- **K=30**: causal forest × trial indicator の MSE が K=10 より実質的に上昇。variable importance 分析では trial indicator が split にほとんど使われず、多試験下で異質性同定が困難。
- **回帰分析による総合**（meta-analysis / no pooling / K=30 / covariate shift を除く区分線形・非線形横断）: **すべての aggregation 手法が complete pooling を有意に上回る**。ensemble forest は S-learner・X-learner で最良平均 MSE、pooling with trial indicator は causal forest で最良平均 MSE。
- **honest vs adaptive causal forest**（Figure A6）: honest はやや平均 MSE が高い（=わずかに劣る）が差は非常に小さく結論は不変。

### 実データ適用（うつ病 4 RCT）

- **対象**: duloxetine（active reference）vs vortioxetine（新薬）を比較する 4 試験。
- **試験と N**（placebo・欠測除外後）:
  - NCT00635219: 575（duloxetine 134 / vortioxetine 441）
  - NCT00114906: 436（144 / 292）
  - NCT00672620: 418（134 / 284）
  - NCT01153009: 418（140 / 278）
  - **合計 N = 1,847**
- **主要アウトカム**: baseline から week 8 の MADRS スコア変化（早期離脱は LOCF）。
- **moderator 候補 13 変数**: age, sex, smoking, weight, baseline MADRS, baseline HAM-A, 併存症（糖尿病・甲状腺機能低下・不安）, 併用薬（抗うつ薬・抗精神病薬・甲状腺薬）。
- **欠測**: ごく僅少（weight n=1, baseline HAM-A n=2 を条件付き平均で補完）。
- **主な知見**:
  - 全手法で平均 CATE は正（vortioxetine の効果がやや弱い）。線形 random effects モデルの ATE 推定 = **2.49（SE 0.49）**。
  - 一貫した effect moderator: age, weight, baseline MADRS, baseline HAM-A。併存症・併用薬は弱い。
  - cross-trial heterogeneity は低く、study indicator は causal forest の分割にほとんど関与せず。
  - age moderation の best linear projection 係数 = **0.09（SE 0.04, p=0.03）**だが CI は 0 を含み、年齢群（18–34/35–44/45–54/55–75）別のパラメトリック解析では非有意。
  - IPD meta-analysis も同様の結論。age 交互作用が有意手前（95% CI: −0.01, 0.14）。
- **限界の注記**: 4 試験は同一組織・類似プロトコルで異質性が小さい。著者は「effect moderator の同定には ATE の 4 倍のサンプルが必要で、本研究の試験数はちょうど 4」と述べる。

---

## 本テーマへの適用可能性

想定シナリオ: データサイエンティストが**頻度の低いマーケティング施策（クーポン・メール等）**を、毎回異なるターゲットユーザー・異なる treatment で実施している。個々のキャンペーンはサンプルが薄く、uplift modeling / off-policy evaluation を単独で回すには効果異質性の検出力が足りない。そこで**過去の類似キャンペーンをグループ化・pool してデータを高密度化し、実効サンプルを増やして実効的な実験間隔を短縮**したい。本レビューの taxonomy はまさに「複数の過去施策をどう束ねるか」の設計図として使える。

**マッピング（本論文の概念 ↔ マーケ施策）**:

| 本論文 | マーケティング施策への対応 |
|---|---|
| 個々の RCT（trial $s$） | 個々の過去キャンペーン（配信バッチ／実験） |
| unconfounded treatment assignment | 施策内でのランダム配信（A/B）による交絡なし割り当て |
| CATE / HTE $\tau(X)$ | ユーザー属性 $X$ 別の uplift（クーポン/メールの増分効果） |
| cross-trial heterogeneity | キャンペーン間で uplift 構造が異なる度合い（季節・オファー額・チャネル差） |
| effect moderator | uplift を左右するユーザー特徴（RFM, 過去反応率, デモグラ等） |

**taxonomy を pooling 戦略として使い分ける指針**:

1. **Complete pooling（全施策を無差別に結合）**: 最も密なデータになるが、キャンペーン間で uplift 構造が違えばバイアス。本論文の「異質性増大で MSE 急増」がそのまま警告になる。施策が本当に同質（同一オファー・同一チャネル）のときのみ推奨。
2. **Pooling with trial indicator（campaign_id を共変量に）**: 実務で第一に試すべき部分プーリング。全施策を結合しつつ `campaign_id`（＋季節・オファー額・チャネル）を特徴として入れれば、共通構造を共有しながら施策固有のシフトを吸収できる。causal forest との組み合わせが本論文で最良だった点は、uplift 木ベースモデル（causal forest / uplift tree）を使う実務と整合する。ただし**施策数 K が非常に多い（K≥25）と campaign_id が split に使われにくくなる**という警告があるため、多数キャンペーンでは施策をメタ属性でグルーピングして次元を下げるのが有効。
3. **Ensemble（各施策モデル → 全ユーザーへ適用 → 集約）**: 各キャンペーンで別々に uplift モデルを学習し、それを全ユーザーに適用して集約する federated 型は、**生データを一元化しづらい（プライバシ・データ基盤分断）状況に親和**。最終集約に random forest を使うと S/X-learner で最良平均 MSE、非線形 uplift に強い。lasso は非線形施策で弱いので、効果が滑らかでない場合は forest 集約を選ぶ。
4. **IPD meta-analysis（混合効果）**: uplift が概ね線形で、moderator を事前に絞れる場合に解釈性が高い。random intercept/slope で「施策ごとのベース反応率・オファー感応度のばらつき」を素直にモデル化できる。非線形 uplift では性能が落ちるため、探索段階では forest 系と併用。
5. **No pooling**: ベースライン。各施策単独の uplift を残しておき、pooling で得た推定と乖離が大きい施策を「異質な施策」として検出する診断に使える。

**single-study 手法選択**: uplift の関数形が未知なら causal forest（可変・非線形に強い）を第一候補に、線形に近ければ X-learner、単純比較用に S-learner。本論文の「関数形で最適 learner が変わる」という結論は、施策ごとに uplift 形状が違うマーケでこそ重要。

**運用上の効用**:
- **実効サンプル増強と実験間隔短縮**: 過去の類似施策を pool with indicator で束ねれば、次の単発施策を待たずに HTE を更新でき、実効的な学習サイクルが短縮される。
- **異質性の見える化**: variable importance に campaign_id が現れるか（本論文 Fig 3B の発想）で、「施策をまとめてよいか／分けるべきか」を定量判断できる。study importance がほぼ 0 なら complete pooling に近づけてよい、というグルーピング基準として直接使える。
- **サンプル要件の目安**: 「moderator 同定には ATE の 4 倍のサンプル」という注記は、uplift のセグメント別最適化に必要なデータ量の見積もり根拠になる。単発施策で uplift セグメンテーションが不安定なのは検出力不足であり、pooling が処方箋。

**留意点**: 本論文の unconfoundedness は各 RCT がランダム化されている前提。マーケ施策も配信がランダム（A/B）であれば同じ枠組みが成り立つが、**配信がターゲティング済み（非ランダム）の観測データを混ぜる場合は追加の交絡調整（傾向スコア）**が必要で、本レビューの範囲外である点に注意。

---

## Notes

- 出版版は Statistics in Medicine 2024, 43(7):1291-1314（arXiv 2303.16299 と同一内容）。PubMed 38273647 / PMC11086055。
- arXiv HTML 版（`arxiv.org/html/2303.16299`）は取得時 404。図の実 URL を確認できなかったため画像埋め込みは行っていない。数値・caption は PMC 全文と arXiv abstract に基づく。
- 本論文は新手法提案ではなく、既存の single-study meta-learner（S/X-learner, causal forest）を複数試験へ拡張する aggregation 戦略の**比較レビュー**。pooling taxonomy 自体が最大の貢献。
- ensemble 手法は Tan らの federated learning 枠組みの応用。federated / privacy 制約下のマルチソース pooling を検討する際の橋渡しになる。
- 本文中の具体値（ATE=2.49 (SE 0.49)、age 係数 0.09 (SE 0.04, p=0.03)、N=1,847、$(\sigma_\beta,\sigma_\delta)$ の 5 組、反復 1,000 回 等）は出典に明記された数値のみを転記。単一の総合 MSE 数表は原論文に存在せず（結果は Figure 1 の分布として提示）、そのため個別手法の MSE スカラ値は「記載なし」。
