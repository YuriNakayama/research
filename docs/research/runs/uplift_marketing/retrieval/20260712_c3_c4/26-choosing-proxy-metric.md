# Choosing a Proxy Metric from Past Experiments

- **Link**: https://arxiv.org/abs/2309.07893
- **Authors**: Nilesh Tripuraneni, Lee Richardson, Alexander D'Amour, Jacopo Soriano, Steve Yadlowsky
- **Year**: 2023（v1: 2023-09-14 / rev: 2024-06-15）
- **Venue**: KDD 2024
- **Type**: 方法論提案 + 産業界レコメンドシステムでの実証

---

## Abstract (English)

> In many randomized experiments the treatment effect of the long-term metric (i.e. the primary outcome of interest) is often difficult or infeasible to measure. Such long-term metrics are often slow to react to changes and sufficiently noisy they are challenging to faithfully estimate in short-horizon experiments. A common alternative is to measure several short-term proxy metrics in the hope they closely track the long-term metric — so they can be used to effectively guide decision-making in the near-term. We introduce a new statistical framework to both define and construct an optimal proxy metric for use in a homogeneous population of randomized experiments. Our procedure first reduces the construction of an optimal proxy metric in a given experiment to a portfolio optimization problem which depends on the true latent treatment effects whose distribution is estimated. We then denoise the observed treatment effects across a corpus of experiments and, using this, form our optimal proxy metric. We show that the optimal proxy metric for a given experiment is not apriori fixed; rather it should depend on the sample size of the specific experiment, and adapts accordingly. We demonstrate the strong empirical performance of our procedure on data from a large industrial recommendation system.

---

## Abstract（日本語訳）

多くのランダム化実験では、長期指標（主要な関心アウトカム）の処置効果を測定することが困難あるいは不可能であることが多い。長期指標は変化への反応が遅く、ノイズも大きいため、短期実験で忠実に推定するのは難しい。一般的な代替策は、長期指標を近似的に追跡することを期待して複数の短期代理指標（proxy metric）を測ることである。本論文は、同質なランダム化実験集団で用いる最適な proxy metric を定義し構築するための新しい統計的枠組みを提案する。まず、ある実験での最適 proxy metric 構築を、真の潜在処置効果（その分布を推定する）に依存するポートフォリオ最適化問題に帰着させる。次に、実験コーパス全体で観測処置効果を denoise（ノイズ除去）し、それを用いて最適 proxy metric を構成する。重要な発見として、ある実験にとっての最適 proxy metric はあらかじめ固定されておらず、その実験の**サンプルサイズに依存して適応的に変わる**ことを示す。大規模な産業レコメンドシステムのデータで手法の高い実証性能を示す。

---

## Overview

複数の短期補助指標（auxiliary metrics）を重み付き線形結合して 1 つの合成 proxy を作る際、その最適な重みをどう決めるかを **ポートフォリオ最適化（Sharpe 比最大化）** として定式化した。核心は、観測処置効果は真の潜在効果 + 測定ノイズであるため、階層ベイズモデルで潜在共分散 $\Lambda$ を denoise してから最適化する点。そして「最適 proxy はサンプルサイズ $n$ に依存する」——大 $n$ では長期指標との整合（alignment）を重視し、小 $n$ では短期の感度（sensitivity/信号対雑音比）を重視する——という bias-variance トレードオフを明らかにした。

---

## Problem（課題）

- 長期指標は反応が遅くノイズが大きく、短期実験では忠実に推定できない。
- 複数の proxy 候補（auxiliary metrics）があるとき、どれを / どう組み合わせて使うべきかの原理的基準がなかった。
- 観測処置効果には測定ノイズが乗るため、素朴に共分散を推定すると重みがバイアスする。
- proxy の「良さ」は固定ではなく、実験規模で変わるはずだが、その依存関係が定式化されていなかった。
- surrogate paradox（proxy は正だが長期は負）を避けたい。

---

## Proposed Method（提案手法）

### コアアイデア

補助指標ベクトル $\Delta^P$ の線形結合 $w^\top \Delta^P$ を proxy とし、長期指標処置効果 $\Delta^N$ との「denoise 後の相関（proxy quality）」を最大化する重み $w$ を、Sharpe 比最大化（凸 QP）として解く。潜在共分散 $\Lambda$ は階層ベイズで推定し、新規実験のノイズはサンプルサイズ $n$ でスケールさせる。

### 手順

1. **proxy quality の定義**: 単一指標の quality を、潜在予測相関 ÷ (1 + ノイズ/分散) の平方根 として分解（Eq.2）。分母が信号対雑音比（= sensitivity 項）。
2. **ポートフォリオ問題への帰着**: 合成 proxy $w^\top\Delta^P$ と長期 $\Delta^N$ の相関最大化を、単体制約付きの相関最大化（Eq.4）→ Sharpe 比最大化 → 凸 QP（Eq.10）に変形。
3. **階層モデルで denoise**: 潜在効果 $(\Delta^N_i,\Delta^P_i)\sim \mathrm{MVN}(\mu,\Lambda)$、観測は潜在にノイズ $\Xi_i$ を加えたもの（Eq.5–7）。NumPyro + NUTS で $\Lambda$ の事後平均を推定。
4. **ノイズのサンプルサイズスケーリング**: 新規実験のノイズを $\Xi_{ref}^{PP}/n$ とし（precision 加重平均で $\Xi_{ref}$ 推定）、実験実行前に $n$ だけから最適重みを事前計算可能にする。
5. **合成 proxy の出力**: 解いた重み $w$ で $w^\top\hat\Delta^P_{K+1}$ を新規実験の proxy として使用。

### Key Formulas

proxy quality（単一指標, Eq.2）:

$$\mathrm{corr}(\Delta^N,\hat\Delta^P)=\frac{\mathrm{corr}(\Delta^N,\Delta^P)}{\sqrt{1+\Xi^{PP}/\mathrm{Var}(\Delta^P)}}$$

ポートフォリオ目的関数（Eq.4 の展開）:

$$\max_{w}\ \frac{w^\top \mathrm{Cov}(\Delta^N,\Delta^P)}{\sqrt{w^\top\big(\mathrm{Cov}(\Delta^P,\Delta^P)+\Xi^{PP}\big)w}}$$

凸 QP への変形（Eq.10, Sharpe 比）:

$$\min_{x}\ x^\top \Sigma x \quad \text{s.t. } x\ge 0,\ r^\top x = 1,\qquad \Sigma=\Lambda^{PP}+\hat\Xi^{PP},\ r=\Lambda^{NP}$$

階層生成モデル（Eq.5–7 の周辺化）:

$$(\hat\Delta^N_i,\hat\Delta^P_i)^\top \sim \mathrm{MVN}(\mu,\ \Sigma_i:=\Lambda+\Xi_i)$$

ノイズのサンプルサイズスケーリング:

$$\Xi_i^{PP}=\Xi_{ref}^{PP}/n_i,\qquad \hat\Xi_{ref}=\sum_i \gamma_i n_i \hat\Xi_i$$

意思決定誤り確率（ゼロ平均条件, Eq.8; surrogate paradox に対応）:

$$P(\Delta^N>0,\ w^\top\hat\Delta^P>0)=\frac{1}{4}+\frac{\arcsin(\rho)}{2\pi}$$

（$\rho$ = proxy quality 相関。$\rho$ 最大化が符号付き意思決定誤りを最小化する。）

---

## Algorithm（擬似コード：Algorithm 1 Composite Proxy）

```
Input:  過去実験の TE 推定 {Δ̂^N_i, Δ̂^P_i, Ξ̂_i}_{i=1..K}
        新規テストのノイズ Ξ̂^{PP}_{K+1} (= Ξ_ref^{PP}/n から算出)
Output: 最適重み w, 合成 proxy w^T Δ̂^P_{K+1}

Step 1: 階層モデルを NumPyro/NUTS で当てはめ
        → 事後平均 μ̂, 潜在共分散 Λ̂ を抽出   # denoise

Step 2: Σ = Λ̂^{PP} + Ξ̂^{PP},  r = Λ̂^{NP}
        Sharpe 比最適化 (Eq.10) を凸 QP として解く
        x* = argmin_x  x^T Σ x  s.t. x ≥ 0, r^T x = 1
        w  = normalize(x*)                      # 単体上に正規化

Return w, w^T Δ̂^P_{K+1}
```

---

## Architecture / Process Flow

```
過去実験コーパス {Δ̂^N, Δ̂^P, Ξ̂}
        │
        ▼
 階層ベイズモデル (NumPyro/NUTS)
   観測 = 潜在(Λ) + ノイズ(Ξ)          # denoise
        │  Λ̂ (潜在共分散)
        ▼
 新規実験のノイズ Ξ_ref^{PP}/n  ─────► サンプルサイズ n を入力
        │
        ▼
 Sharpe 比最大化 (凸 QP, Eq.10)
        │  最適重み w (= w(n))
        ▼
 合成 proxy  w^T Δ̂^P
        │
        ▼
 意思決定（大n→alignment重視 / 小n→sensitivity重視）
```

---

## Figures & Tables（必須セクション）

> 注: HTML 抽出で確認できた図のキャプションを掲載。arxiv.org を前置した完全な画像 src URL は抽出結果に現れなかったため、画像埋め込みは行わない（URL: 未確認）。

### 表1: ホールドアウト性能（Table 1, 本文記載値。全指標 [0,1] にスケール、高いほど良い）

| Method | Sensitivity | Proxy Score | Proxy Quality |
|--------|-------------|-------------|---------------|
| New Composite Proxy（提案） | 0.181 | **0.666** | **0.302** |
| Baseline Composite Proxy | 0.182 | 0.611 | 0.279 |
| Auxiliary Metric 1 | 0.062 | 0.611 | 0.174 |
| Auxiliary Metric 2 | 0.368 | 0.222 | 0.258 |
| Auxiliary Metric 3 | 0.166 | 0.104 | 0.030 |

提案手法は Proxy Score・Proxy Quality の両方でベースラインと個別指標を上回る。

### 表2: 手法比較（設計の観点）

| 観点 | 素朴な共分散最大化 | 提案（denoise + Sharpe QP） |
|------|--------------------|------------------------------|
| ノイズ処理 | 観測共分散をそのまま使用（バイアス） | 階層ベイズで潜在 Λ を denoise |
| サンプルサイズ依存 | 固定重み | $n$ 依存で適応 |
| surrogate paradox | 未対応 | Eq.8 で符号誤り確率を最小化 |
| 最適化形式 | ヒューリスティック | 凸 QP（大域最適） |

### 図1（キャプション）

新規実験では、観測 TE を潜在値に独立・ゼロ平均・共分散 $\Xi$ のノイズを加えた「ノイジーチャネル」出力とみなす。到達不能な長期アウトカムを近似追跡する proxy を求める。画像 URL: 未確認。

### 図2（キャプション）

denoise の可視化（3 パネル）:(a) 潜在集団 TE（合成、パラメータ表示）、(b) ガウスノイズ付加後の観測 TE、(c) 階層モデルによる潜在変動の復元。画像 URL: 未確認。

### 図3（キャプション）

**最適重みのサンプルサイズ依存**。大 $n$ ではノイジーだが alignment の良い指標に高い重み、小 $n$ ではノイズの少ない（alignment は劣る）指標へ後退。bias-variance トレードオフを表す。画像 URL: 未確認。

### 図4（付録A, キャプション）

Auxiliary Metric 1・2 の A/B テスト分散が、307 テストにわたり一貫した prefactor で逆べき乗則（$\propto 1/n$）に従うことを示す。ノイズスケーリング仮定の裏付け。画像 URL: 未確認。

---

## Experiments & Evaluation

### Setup

- **データ**: 大規模産業レコメンドシステムの **307 件の A/B テスト**。
- サンプルサイズは $O(10^6)$〜$O(10^8)$ 処置ユニット。
- 手選びの **base proxy 3 種** + 長期指標。
- **評価**: 過去コーパスに対する層化 4-fold クロスバリデーション。

### Main Results

- 提案 New Composite Proxy は Proxy Score **0.666**（Baseline 0.611）、Proxy Quality **0.302**（Baseline 0.279）で最良。
- 個別の auxiliary metric（0.030〜0.258）を大きく上回る。
- 最適重みがサンプルサイズで系統的に変化することを実データで確認（図3）。

### Ablation

- サンプルサイズを掃引した最適重みの変化（図3）が中心的分析: 大 $n$ で alignment 重視、小 $n$ で sensitivity 重視へ切り替わる。
- ノイズの $1/n$ スケーリング仮定を 307 テストで検証（図4）。
- 限界: i.i.d. 仮定（Eq.1）は強い非定常設定に不向き。非線形合成 proxy・異質処置効果への拡張が今後の課題。

---

## 本テーマへの適用可能性

低頻度マーケ施策で uplift / off-policy 評価を行う本テーマに、本論文は「複数の短期反応指標をどう束ねて 1 本の proxy にするか」の原理的レシピを与える。

1. **類似施策のプール = 実験コーパスの構築**: 手法は「同質な実験集団」の過去 TE コーパスから潜在共分散 $\Lambda$ を推定する。過去のクーポン/メール施策（開封・クリック・訪問・短期購入など複数の短期指標）を 1 つのコーパスにプールすれば、単独では薄いデータでも $\Lambda$ を denoise 推定でき、実効データ密度が上がる。

2. **サンプルサイズ適応 = 低頻度施策に最適**: 低頻度施策は 1 回あたりの $n$ が小さくなりがち。本手法の「小 $n$ では sensitivity 重視、大 $n$ では alignment 重視」という自動切替は、まさに小規模施策で「まず有意差を出しやすい proxy」に寄せ、大規模施策で「長期 uplift と整合する proxy」に寄せる、という理にかなった運用を保証する。実験規模に応じた最適重みを **実行前に $n$ だけから事前計算** できるため、施策設計段階で使える。

3. **実験間隔の短縮**: 長期 uplift（例: 60日後継続/LTV）を待たず、denoise 済み合成 proxy で早期に有意判定できる。Proxy Quality 0.302 のような合成指標は個別短期指標より長期整合が高く、短い観測窓での意思決定の信頼度を上げる。

4. **surrogate paradox の抑制**: Eq.8 の符号付き意思決定誤り確率を最小化する定式化は、「短期 proxy は良いが真の uplift は負」という危険な誤採用を off-policy 評価で直接抑える。マーケ施策の採否判断に安全性の裏付けを与える。

---

## Notes

- 会議は KDD 2024。著者は Google 系（denoise 手法・NumPyro 利用）。
- 同著者陣（Soriano, Richardson）による姉妹研究「Pareto optimal proxy metrics」(2307.01000) と補完関係（本作は alignment 最大化、Pareto 版は sensitivity との多目的トレードオフ）。
- proxy quality の定義（相関 ÷ SNR）と Eq.8 の arcsin 誤り確率は、本テーマで「proxy の良さ」を定量化する共通言語として有用。
- 画像 src URL は HTML 抽出に現れず未確認のため埋め込みなし。数値は本文抽出に基づく（発明せず）。
