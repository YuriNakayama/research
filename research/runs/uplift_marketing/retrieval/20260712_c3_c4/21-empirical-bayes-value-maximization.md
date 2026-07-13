# Empirical Bayes Selection for Value Maximization

- **Link**: https://arxiv.org/abs/2210.03905
- **Authors**: Dominic Coey, Kenneth Hung
- **Year**: 2022（v1: 2022-10-08 / v3: 2025-05-29）
- **Venue**: arXiv (stat.ME / econ.EM)。ACM 会議録に採録（DOI: 10.1145/3711896.3736928）
- **Type**: 理論 + 実証（統計的方法論、Empirical Bayes、意思決定理論）

---

## Abstract (English)

We consider the problem of selecting the best `m` out of `n` units, as `m/n → α ∈ (0,1)`, based on noisy, heteroskedastic measurements of their true values. Given a prior on the true values, the empirical Bayes (EB) decision rule incurs regret `O_p(n^{-1})` relative to the Bayes-optimal (oracle) rule that knows the true prior. More generally, if the error in estimating the prior is `O_p(r_n)`, the regret is `O_p(r_n^2)`. This demonstrates that selection of the best units is fundamentally easier than the estimation of their values. We show that this rate is tight through examples, and we validate the approach on data from over four thousand internet experiments, confirming that empirical Bayes methods can effectively identify the best treatments with a modest number of experiments.

（上記は arXiv アブストラクトおよび HTML 本文の記述を要約・再構成したもの。逐語の一言一句の一致は保証しない。）

---

## Abstract (日本語訳)

`n` 個のユニットのうち、真の値に対するノイズありかつ**分散不均一（heteroskedastic）**な測定値に基づいて、上位 `m` 個を選ぶ問題を考える（`m/n → α ∈ (0,1)`）。真の値の事前分布が与えられているとき、**Empirical Bayes（EB）決定則**は、真の事前分布を知る**オラクル（Bayes 最適）決定則**に対して `O_p(n^{-1})` の regret（後悔）しか生じない。より一般に、事前分布の推定誤差が `O_p(r_n)` であれば、regret は `O_p(r_n^2)` となる。これは「**最良ユニットの選択は、その値の推定よりも本質的に容易である**」ことを示している。著者らはこのレートが（改善不能という意味で）タイトであることを例で示し、4,000 件超のインターネット実験データで手法を検証し、EB 手法が**わずかな数の実験でも最良の施策を効果的に特定できる**ことを確認した。

---

## Overview

本論文は「たくさんの候補（実験・施策・ユニット）から上位を選び出す」という**選択（selection）問題**を、統計的意思決定理論の枠組みで扱う。中心的な主張は、**選択という目的に限れば、各ユニットの値を正確に推定するよりもはるかに速い収束レートが得られる**という点にある。

具体的には、真の効果 `μ_i` の事前分布 `G_0` を Empirical Bayes で推定し、その推定事前分布に基づく**posterior mean（縮約推定量）**でユニットをランク付けして上位 `m` 個を選ぶ。真の事前分布を知るオラクルとの value（総価値）の差を regret と定義すると、regret は事前分布推定誤差 `r_n` の**2乗**でスケールする（`O_p(r_n^2)`）。事前分布がパラメトリックに推定できる場合には `r_n = n^{-1/2}` なので regret は `O_p(n^{-1})` となり、標準的な推定レート `n^{-1/2}` より一桁速い。

この「2乗ゲイン」は、選択という決定が本質的にラフ（どのユニットが閾値の上か下かだけを問う）であることに由来する。閾値付近のわずかなユニットしか誤選択されず、かつ誤選択されたユニットの value 損失も閾値付近で小さいため、誤差が2重に打ち消し合う。

---

## Problem（問題設定）

- **ノイズありの測定**: 各ユニット `i` について真の値 `μ_i` は観測できず、測定値 `X_i` のみ得られる。`X_i | μ_i, σ_i ~ N(μ_i, σ_i^2)`。
- **分散不均一（heteroskedasticity）**: 標準誤差 `σ_i` はユニットごとに異なる（例: 実験ごとにサンプルサイズが違う）。単純に測定値 `X_i` でランク付けすると、分散の大きいユニットが上位に紛れ込む。
- **事前分布は未知**: 真の効果の分布 `G_0`、標準誤差の分布 `H_0` はともに未知で、データから推定する必要がある。
- **選択の目的**: 誤分類率の最小化ではなく、選ばれた上位 `m` 個の**真の値の総和（value）を最大化**する。
- **オラクルとのギャップを最小化**: 真の事前分布を知る Bayes 最適則との regret をどれだけ速く 0 に近づけられるかが問い。

---

## Proposed Method（提案手法）

### コアアイデア

各ユニットを、生の測定値 `X_i` ではなく、推定事前分布 `Ĝ` に基づく **Empirical Bayes posterior mean `θ̂_i`** でランク付けする。posterior mean は分散の大きい（信頼できない）測定値を事前分布の平均へ強く縮約（shrinkage）するため、分散不均一下でも公平にユニットを比較できる。

### 手順

1. **事前分布の推定**: データ全体 `{X_i, σ_i}` から真値の事前分布 `G_0` を推定し `Ĝ` を得る（NPMLE、あるいはパラメトリックな scale mixture of Gaussians など）。
2. **posterior mean の計算**: 各ユニットについて、推定事前分布 `Ĝ` と自身の標準誤差 `σ_i` を用いて posterior mean（縮約推定量）`θ̂_i = f_{Ĝ, σ_i}(X_i)` を計算する。
3. **上位選択**: `θ̂_i` の大きい順に上位 `m` 個のユニットを選ぶ（`m/n → α`）。
4. **regret 評価**: 選ばれた集合の真の value 総和と、オラクル選択の value 総和との差を regret として測る。

### Key Formulas

**posterior mean（式1）** — 分散不均一版の縮約推定量:

$$
f_{G,\sigma_i}(X_i) = \frac{\displaystyle\int \mu \cdot \frac{1}{\sigma_i}\varphi\!\left(\frac{X_i-\mu}{\sigma_i}\right) dG(\mu)}{\displaystyle\int \frac{1}{\sigma_i}\varphi\!\left(\frac{X_i-\mu}{\sigma_i}\right) dG(\mu)}
$$

ここで `φ` は標準正規密度。分母は周辺尤度、分子は事後平均の重み付き積分。

**regret 分解（Theorem 4 の骨子）**:

$$
\mathcal{R} \;\le\; \frac{2}{n}\cdot \#(\text{mistakes}) \cdot \max_i \bigl|\theta_i - \hat\theta_i\bigr|
$$

regret は「誤選択されたユニット数」×「posterior mean の推定誤差」の積で上から抑えられる。両因子がともに `O_p(r_n)` なので、積は `O_p(r_n^2)`。

**shrinkage 誤差の Lipschitz 界（Lemma 2）** — Wasserstein-1 距離 `W_1` による界:

$$
\bigl|f_{G,\sigma}(X) - f_{G_0,\sigma}(X)\bigr| \;\le\; K \cdot W_1(G, G_0)
$$

**主結果（regret レート）**:

$$
W_1(\hat G, G_0) = O_p(r_n) \;\;\Longrightarrow\;\; \mathcal{R} = O_p(r_n^2)
$$

パラメトリックな事前分布では `r_n = n^{-1/2}` なので `\mathcal{R} = O_p(n^{-1})`。

---

## Algorithm（擬似コード）

```text
Input : 測定値 {X_i}, 標準誤差 {σ_i} (i = 1..n), 選択割合 α
Output: 選択集合 S (|S| = m ≈ αn)

1. # 事前分布の Empirical Bayes 推定
   Ĝ ← EstimatePrior({X_i, σ_i})        # NPMLE または parametric MLE
                                          #（例: scale mixture of mean-zero Gaussians）

2. # 各ユニットの posterior mean（縮約推定量）
   for i = 1..n:
       θ̂_i ← ( ∫ μ · (1/σ_i) φ((X_i-μ)/σ_i) dĜ(μ) )
              / ( ∫ (1/σ_i) φ((X_i-μ)/σ_i) dĜ(μ) )

3. # posterior mean 降順で上位 m 個を選択
   m ← round(α · n)
   S ← argtop_m( {θ̂_i} )

4. return S
```

---

## Architecture / Process Flow

```text
   n 個のユニット
   { (X_i, σ_i) }          X_i | μ_i,σ_i ~ N(μ_i, σ_i^2)
        │
        ▼
 ┌──────────────────────┐
 │ Step1: 事前分布推定   │  データ全体で G_0 を推定 → Ĝ
 │ (Empirical Bayes)    │  (borrow strength across units)
 └──────────────────────┘
        │  Ĝ
        ▼
 ┌──────────────────────┐
 │ Step2: posterior mean │  θ̂_i = f_{Ĝ,σ_i}(X_i)
 │ (heteroskedastic     │  分散大 → 事前平均へ強く縮約
 │  shrinkage)          │
 └──────────────────────┘
        │  {θ̂_i}
        ▼
 ┌──────────────────────┐
 │ Step3: 上位 m 選択    │  θ̂_i 降順で top-m
 └──────────────────────┘
        │  S
        ▼
 ┌──────────────────────┐
 │ 評価: regret          │  value(S) を oracle と比較
 │  R = O_p(r_n^2)      │  → 選択は推定より速い
 └──────────────────────┘
```

---

## Figures & Tables

> 注: arXiv HTML 版には図の `<img>` src URL が本文中に露出していなかったため、図画像の埋め込みは行わない（記載なし）。以下の表は本文・アブストラクト記載の数値を再構成したもの。

### 表1: 事前分布クラス別の regret 収束レート（提案手法 vs. Chen 2022）

| Prior Class（事前分布クラス） | 提案手法の regret 界 | Chen (2022) |
|---|---|---|
| Parametric（パラメトリック） | `O_p(n^{-1})` | `Õ(n^{-1/2})` |
| Finite support（有限台） | `O_p(n^{-1/2})` | `Õ(n^{-1/2})` |
| k-smooth density（k階平滑密度） | `O_p((log n)^{-k})` | `Õ(n^{-1/2})` |

（値は HTML 本文の比較表記述に基づく。パラメトリックで一桁速い収束が最大の売り。）

### 表2: 目的の違いによる収束レート比較（アーキテクチャ的比較）

| 目的（objective） | 収束レート | 備考 |
|---|---|---|
| **Value maximization(選択)**（本手法） | `O_p(r_n^2)`、parametric で `O_p(n^{-1})` | 本論文の主結果 |
| Misclassification rate最小化（等ペナルティ分類） | 標準パラメトリックレート `O_p(n^{-1/2})` 相当 | 選択より遅い |
| Treatment effect estimation（効果推定） | 標準パラメトリックレート | 選択より遅い |
| Prior estimation（事前分布推定） | `O_p(r_n)`（1乗） | 選択の入力段階 |

（本文の「identification with equal misclassification penalties / treatment effect estimation / prior estimation はいずれも標準パラメトリックレートに留まる」との記述に基づく。）

### 表3: regret 分解（アブレーション的な理論分解）

| 因子 | オーダー | 根拠 |
|---|---|---|
| 誤選択ユニット数 `#(mistakes)/n` | `O_p(r_n)` | 閾値 `P^{-1}(1-α)` 付近の密度で界付け（Lemma 3） |
| posterior mean 推定誤差 `max|θ_i-θ̂_i|` | `O_p(r_n)` | `W_1(Ĝ,G_0)` の Lipschitz 界（Lemma 2） |
| **regret（積）** | `O_p(r_n^2)` | 2因子の積（Theorem 4） |

### 表4: 実証実験の設定と結果

| 項目 | 値 |
|---|---|
| データ | インターネット実験 4,000 件超（over four thousand） |
| 選択割合 `m/n` | 0.10（上位 10%） |
| 事前分布のモデル | scale mixture of mean-zero Gaussians（データで較正） |
| 分散不均一の由来 | 実験ごとのサンプルサイズの違い |
| 実測 regret 収束 | `O_p(n^{-1})`（理論予測と整合） |
| 対比手法の収束 | 誤分類率・効果推定・事前分布推定はいずれも標準パラメトリックレート |

---

## Experiments & Evaluation

### Setup（設定）

- **データ**: 実際の A/B テストから較正した 4,000 件超のインターネット実験。各実験の真の効果 `μ_i` を、このデータで較正した **mean-zero Gaussians の scale mixture** からシミュレートする。
- **選択タスク**: 上位 10%（`m/n = 0.10`）の実験を選び出す。
- **分散不均一**: 実験ごとのサンプルサイズの差から `σ_i` が変動する状況を再現。
- **評価指標**: 選ばれた集合の真の value 総和とオラクル選択との差（regret）を、サンプルサイズ `n` を変えて測定し、収束レートを推定。

### Main Results（主要結果、具体的数値）

- **regret の実測収束レートは `O_p(n^{-1})`** となり、パラメトリック事前分布に対する理論界と一致した。
- これは標準的な推定レート `n^{-1/2}` より**一桁速い**。すなわち「わずかな数の実験でも最良施策を高精度に特定できる」ことを実データで確認。
- 対照手法（等ペナルティの誤分類最小化、直接の効果推定、事前分布推定そのもの）は、いずれも標準パラメトリックレートに留まり、選択目的の EB より遅い。

### Ablation（分解・感度）

- **理論的アブレーション**（表3）: regret を「誤選択数」×「posterior mean 誤差」に分解し、両者が個別には `O_p(r_n)` であることを Lemma 2・3 で示し、積が `O_p(r_n^2)` になることを Theorem 4 で確立。
- **事前分布クラスへの感度**（表1）: パラメトリック → 有限台 → k階平滑密度 の順にレートが劣化する。平滑密度では `(log n)^{-k}` と対数的に遅くなるが、それでも Chen (2022) の一様な `Õ(n^{-1/2})` と質的に異なる挙動を示す。
- **タイトネス**: 著者らは例により `O_p(r_n^2)` が改善不能（tight）であることを示している。

---

## 本テーマへの適用可能性

**想定シナリオ**: データサイエンティストが、対象ユーザ・施策（クーポン/メール等）が毎回異なる**低頻度のマーケティングキャンペーン**を運用しており、似たキャンペーンを**グループ化・プーリング**して実効データ密度を上げ、実効的な実験間隔を短縮したい（uplift modeling / off-policy evaluation 目的）。

本論文の枠組みはこのニーズに直接的に効く。

1. **キャンペーン=ユニット、uplift=真値 `μ_i` というマッピング**: 各キャンペーン（あるいはセグメント×施策の組）を1つの「ユニット」とみなし、その uplift（処置効果）を真値 `μ_i`、実測 uplift を測定値 `X_i`、その標準誤差を `σ_i` とする。低頻度・小規模ゆえ `σ_i` が大きくばらつく（=分散不均一）という現実に本手法はそのまま適合する。

2. **事前分布 `G_0` の推定が「プーリングによる強度の借用（borrow strength）」そのもの**: Step1 で全キャンペーン横断で事前分布 `Ĝ` を推定する操作は、まさに「似たキャンペーンを束ねて共通の効果分布を合成する」行為に相当する。個々のキャンペーンが疎（少数ユーザ・少数配信）でも、横断的に事前分布を推定することで**実効サンプルサイズを増やす**効果が得られる。これは「密なデータを合成したい」という要望の統計的な実体である。

3. **縮約（shrinkage）が疎なキャンペーンのノイズを抑える**: Step2 の heteroskedastic posterior mean は、サンプルの少ない（`σ_i` の大きい）キャンペーンの過大・過小推定を事前平均へ縮約する。これにより「たまたま大きな uplift が観測された小規模キャンペーン」を過信せずに済み、上位選択の信頼性が上がる。

4. **「選択は推定より容易」= 実効実験間隔の短縮**: 本論文の中核メッセージ `regret = O_p(r_n^2)` は、「どのキャンペーン/施策が最良かを選ぶ」だけなら、各 uplift を正確に推定するより**桁違いに少ないデータで足りる**ことを意味する。低頻度運用で1回1回の実験が貴重な状況において、「上位施策の特定」というより緩い目的に切り替えることで、必要な実験回数・待ち時間を実質的に短縮できる。これは「実効的な実験間隔を短くしたい」という要望に理論的裏付けを与える。

5. **off-policy evaluation / policy selection への橋渡し**: 複数の候補ポリシー（施策割当ルール）の value を比較して最良を選ぶ問題は、まさに value maximization による selection である。個々のポリシーの value を精密推定せずとも、EB posterior mean でランク付けして上位を選べば `O_p(n^{-1})` の regret で最良ポリシーに到達し得る。OPE の分散が大きく苦しい低データ領域で特に有効。

6. **実装上の勘所**: (a) キャンペーンを「同一事前分布とみなせる」粒度でグルーピングする設計が重要（施策タイプ・対象セグメント・チャネル別に `G_0` を分けるか統合するか）。(b) 事前分布はパラメトリック（scale mixture of Gaussians 等）にすると `r_n = n^{-1/2}` を確保でき、regret `O_p(n^{-1})` の恩恵を最大化できる。(c) 標準誤差 `σ_i` を各キャンペーンで正しく見積もることが縮約の公平性を担保する。

**留意点**: 本手法は「事前分布が全ユニットで共通（交換可能性, exchangeability）」を前提とする。異質すぎるキャンペーンを無理にプールすると事前分布の誤設定でバイアスが入る。プーリングの単位設計（どこまで似たキャンペーンを束ねるか）が実務上の最重要判断となる。

---

## Notes

- **一次情報**: arXiv アブストラクトページ（2210.03905）および HTML 全文（v3）を WebFetch で取得。
- **数値の取り扱い**: regret レート（`O_p(n^{-1})`, `O_p(r_n^2)` 等）、実験件数（4,000 件超）、選択割合（`m/n = 0.10`）は一次情報の記述に基づく。個別の数表セル（誤差の具体値、図の軸目盛りなど）は HTML に露出していなかったため未記載（記載なし）。
- **図の埋め込み**: HTML 中に図の `<img>` src URL が確認できなかったため、図画像は埋め込んでいない。
- **コード**: 公開ソースコードあり（Zenodo: https://doi.org/10.5281/zenodo.15538137）。
- **関連**: Chen (2022) の一様 `Õ(n^{-1/2})` レートに対し、本論文は目的を「選択」に限定することで質的に速いレートを導出している点が新規性。
- **著者所属**: Dominic Coey, Kenneth Hung（いずれも産業界の実験・因果推論研究者。ACM 会議録採録は大規模オンライン実験文脈を示唆）。venue の詳細な会議名は arXiv 表記からは特定しきれず（DOI プレフィックス 10.1145 より ACM 系）。
