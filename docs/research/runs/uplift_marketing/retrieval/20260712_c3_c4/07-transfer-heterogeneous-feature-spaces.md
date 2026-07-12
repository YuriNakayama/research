# Transfer Learning on Heterogeneous Feature Spaces for Treatment Effects Estimation

- **Link**: https://arxiv.org/abs/2210.06183 / PDF: https://arxiv.org/pdf/2210.06183 / NeurIPS proceedings: https://proceedings.neurips.cc/paper_files/paper/2022/hash/f0e5cde3850e7dd0db125c0ebae16680-Abstract-Conference.html / Code: https://github.com/ioanabica/HTCE-learners
- **Authors**: Ioana Bica (University of Oxford / The Alan Turing Institute), Mihaela van der Schaar (University of Cambridge / UCLA / The Alan Turing Institute)
- **Year**: 2022 (arXiv v1: 2022-10-08)
- **Venue**: NeurIPS 2022 (36th Conference on Neural Information Processing Systems)
- **Type**: 会議論文（因果推論 / 転移学習 / 表現学習）

---

## Abstract (English, verbatim)

> Consider the problem of improving the estimation of conditional average treatment effects (CATE) for a target domain of interest by leveraging related information from a source domain with a different feature space. This heterogeneous transfer learning problem for CATE estimation is ubiquitous in areas such as healthcare where we may wish to evaluate the effectiveness of a treatment for a new patient population for which different clinical covariates and limited data are available. In this paper, we address this problem by introducing several building blocks that use representation learning to handle the heterogeneous feature spaces and a flexible multi-task architecture with shared and private layers to transfer information between potential outcome functions across domains. Then, we show how these building blocks can be used to recover transfer learning equivalents of the standard CATE learners. On a new semi-synthetic data simulation benchmark for heterogeneous transfer learning we not only demonstrate performance improvements of our heterogeneous transfer causal effect learners across datasets, but also provide insights into the differences between these learners from a transfer perspective.

## Abstract（日本語訳）

> ある関心対象のターゲットドメインについて、条件付き平均処置効果（CATE）の推定を、異なる特徴空間を持つソースドメインの関連情報を活用して改善する問題を考える。この CATE 推定における「異種（heterogeneous）転移学習」問題は、医療のように、異なる臨床共変量を持ちデータが限られる新しい患者集団に対して治療の有効性を評価したい場面で普遍的に生じる。本論文では、異種特徴空間を扱うために表現学習（representation learning）を用いる複数のビルディングブロックと、共有層（shared layers）・私的層（private layers）を持つ柔軟なマルチタスクアーキテクチャを導入し、ドメイン間で潜在結果（potential outcome, PO）関数どうしの情報を転移する。次に、これらのビルディングブロックを用いて標準的な CATE 学習器（CATE learner）の転移学習版を再構成できることを示す。異種転移学習向けの新しい半合成（semi-synthetic）ベンチマークにおいて、我々の Heterogeneous Transfer Causal Effect（HTCE）学習器がデータセット横断で性能改善を示すことを実証するとともに、転移の観点からこれら学習器間の違いに関する知見を提供する。

---

## Overview

本論文は、**特徴空間が異なる（異種）ソース・ターゲットドメイン間での CATE 推定の転移学習**という問題を初めて定式化し、解法を与えた研究である。ターゲットドメインは学習データが極めて少なく（$N_T \ll N_R$）、ソースドメインは大きいが特徴（covariate）の集合が部分的にしか一致しない、という状況を想定する。

中心的なアイデアは、（1）異種特徴空間を「共有特徴 $X^s$」「ソース私的特徴 $X^{pR}$」「ターゲット私的特徴 $X^{pT}$」に分解し、shared encoder と private encoder で共通表現へ写像すること、（2）各処置 $w\in\{0,1\}$ の PO 関数を、ドメイン間で**共有部分空間 + ドメイン私的部分空間**を持つマルチタスク層で結合し、直交正則化（orthogonal regularization）で情報の重複を抑えることである。これらを「ビルディングブロック」として組み合わせることで、既存の主要 CATE 学習器（T-learner, S-learner, DR-learner, TARNet）の転移版（HTCE-learner）を機械的に構成できる点が新規性である。

---

## Problem

- **少データのターゲットドメイン**: 関心対象の集団（新病院・新患者集団）は $N_T$ が小さく、処置群・対照群双方を観測する必要がある CATE 推定では特にデータ不足が致命的。
- **異種特徴空間**: ソース $X_i^R \in \mathbb{R}^{D_R}$ とターゲット $X_i^T \in \mathbb{R}^{D_T}$ で次元が異なる（$D_R \neq D_T$）。共変量集合は重複するが一致しない。
- **分布のずれ**: $p(X^R)\neq p(X^T)$、処置割当機構 $p(W=1\mid X^R)\neq p(W=1\mid X^T)$、PO の条件付き分布 $p(Y(w)\mid X^R)\neq p(Y(w)\mid X^T)$ がいずれも異なりうる。すなわち同時分布 $p(X^R,W,Y)\neq p(X^T,W,Y)$。
- **反実仮想が観測できない**: 因果推論の根本問題により、教師あり転移よりも難しい。ドメイン間で PO 関数・処置割当機構の類似性と差異を同時にモデル化する必要がある。
- **既存手法の不足**: 既存の CATE 転移研究（[35][36][37]）は**共有特徴空間**を仮定。RadialGAN [22] は異種特徴を扱うが、ドメインごとに独立の生成器・識別器・予測器を訓練し、ターゲットでも十分なデータを要し、予測器間で情報を共有しない。

**識別可能性の仮定**（両ドメインで成立を仮定）:
- Assumption 1（Unconfoundedness / 交絡なし）: $Y(0),Y(1)\perp\!\!\!\perp W\mid X^T$ かつ $Y(0),Y(1)\perp\!\!\!\perp W\mid X^R$。
- Assumption 2（Overlap / 重なり）: $\pi^T(x^T)>0,\ \forall x^T$ かつ $\pi^R(x^R)>0,\ \forall x^R$。

---

## Proposed Method

### コアアイデア

CATE 学習器を「単一ドメインでの帰納バイアスを保持」しつつ「異種特徴空間を扱い」「ドメイン間で PO 関数の情報を共有」できるように拡張する 3 つのビルディングブロックを定義する。

1. **異種特徴空間の処理（Section 4.1）**: 共変量を共有/私的に分割し、encoder で共通表現へ写像。
2. **ドメイン間での PO 関数の情報共有（Section 4.2）**: 各処置 $w$ ごとに、共有部分空間とドメイン私的部分空間を持つ多層マルチタスクネットワークを構築。
3. **ドメイン内での PO 関数の情報共有（Section 5.2）**: TARNet 型に、ドメイン固有の追加表現層 $\Omega^{pR},\Omega^{pT}$ を積む。

### 手順（numbered steps）

1. **特徴分割とエンコード**: $X^R=(X^s,X^{pR})$, $X^T=(X^s,X^{pT})$ に分割。private encoder $\phi^{pR},\phi^{pT}$（各ドメインを $D_p$ 次元へ）と shared encoder $\phi^s$（共有特徴を $D_s$ 次元へ）を学習。ソース例は $[z^s\|z^{pR}]$、ターゲット例は $[z^s\|z^{pT}]$（$\|$ は連結）に符号化。共有特徴は private encoder にも通し、ドメイン共通の関係とドメイン固有の相互作用の双方を学習させる。
2. **表現の直交化**: 私的表現と共有表現が異なる情報を符号化するよう、直交正則化 $L_{\text{orth}z}$（式(3)）を課す。
3. **ドメイン間 PO 共有層の構築**: 各処置 $w$ について $L$ 層のネットワークを組み、各層に共有部分空間と 2 つのドメイン私的部分空間を持たせる。ソース/ターゲットの例に応じて対応する私的経路を活性化（式のスキームは下記 Algorithm 参照）。
4. **PO 損失の最小化**: ソース・ターゲット双方の観測（factual）結果への回帰損失 $L_y$（式(4)）を最小化。
5. **PO 層の直交正則化**: 共有層と私的層の重みに直交正則化 $L_{\text{orthPO}}$（式(5)）を課し冗長性を抑制。
6. **メタ学習器への展開**: 上記ブロックで T/S/DR/TARNet の HTCE 版を構成。DR-learner は 2 段階（nuisance 推定 → pseudo-outcome 回帰）で、各 nuisance 関数に転移ブロックを適用（式(6)）。

### Key Formulas

CATE の定義:

$$\tau(x) = \mathbb{E}[Y(1)-Y(0)\mid X=x] = \mu_1(x)-\mu_0(x)$$

ターゲットドメインの CATE（推定対象）:

$$\tau^T(x) = \mu_1^T(x^T)-\mu_0^T(x^T)$$

**式(3) 表現の直交正則化**（$\zeta^{pR},\zeta^{pT},\zeta^s$ は私的/共有表現を行に並べた行列、$\|\cdot\|_F$ は Frobenius ノルム）:

$$L_{\text{orth}z} = \lVert \zeta^{s\top}\zeta^{pR}\rVert_F^2 + \lVert \zeta^{s\top}\zeta^{pT}\rVert_F^2$$

**式(4) PO 推定の損失関数**（$g_w^R,g_w^T$ は各ドメインの仮説関数、$l(\cdot,\cdot)$ は連続値なら MSE、二値なら交差エントロピー）:

$$L_y = \sum_{i=1}^{N_R} l\big(y_i, g_{w_i}^R(\Phi_{w_i}^R(x_i^R))\big) + \sum_{i=1}^{N_T} l\big(y_i, g_{w_i}^T(\Phi_{w_i}^T(x_i^T))\big)$$

ここで仮説関数は $g_w^R(\Phi^R(x^R))=\psi(h_{w,L}^{pR}+h_{w,L}^s)$, $g_w^T(\Phi^T(x^T))=\psi(h_{w,L}^{pT}+h_{w,L}^s)$。$\psi$ は連続値では線形、二値ではシグモイド。

**式(5) PO 層の直交正則化**（$\theta_{w,l}^s,\theta_{w,l}^{pR},\theta_{w,l}^{pT}$ は第 $l$ 層の共有/私的重み）:

$$L_{\text{orthPO}} = \sum_{w\in\{0,1\}}\sum_{l=1}^{L} \Big( \lVert \theta_{w,l}^{s\top}\theta_{w,l,1:m_{l-1}^s}^{pR}\rVert_F^2 + \lVert \theta_{w,l}^{s\top}\theta_{w,l,1:m_{w,l-1}^s}^{pT}\rVert_F^2 \Big)$$

**式(6) DR-learner の pseudo-outcome**（第 1 段で推定した nuisance $\hat\eta=(\hat\mu_0,\hat\mu_1,\hat\pi)$ を用いる）:

$$\tilde{Y}_{DR,\eta} = \left(\frac{W}{\hat\pi(x)} - \frac{1-W}{1-\hat\pi(x)}\right) Y + \left(1-\frac{W}{\hat\pi(x)}\right)\hat\mu_1(x) - \left(1-\frac{1-W}{1-\hat\pi(x)}\right)\hat\mu_0(x)$$

第 2 段では $\tilde{Y}_{DR,\eta}$ に対し入力を回帰し、$\tau(x)=\mathbb{E}[\tilde{Y}_{\hat\eta}\mid X=x]$ として CATE を得る。この 2 段目にも転移アーキテクチャ（encoder $\phi_y^{pR},\phi_y^{pT},\phi_y^s$ + 共有/私的層）を適用。

**半合成データ生成 式(7)(8)**（$\alpha$: ドメイン間共有量、$\beta$: ドメイン内共有量の制御パラメータ）:

$$Y^R(w)=\alpha\!\left(\sum_{j=1}^{D_S}\frac{v_{w,j}^s X_j^s}{D_S}\right)+(1-\alpha)\!\left[\beta\!\left(\sum_{j=1}^{D_{pR}}\frac{v_{w,j}^{pR} X_j^{pR}}{D_{pR}}\right)+(1-\beta)\!\left(\sum_{j=1}^{D_R}\frac{v_j^R X_j^R}{D_R}\right)\right]+\epsilon_R$$

$$Y^T(w)=\alpha\!\left(\sum_{j=1}^{D_S}\frac{v_{w,j}^s X_j^s}{D_S}\right)+(1-\alpha)\!\left[\beta\!\left(\sum_{j=1}^{D_{pT}}\frac{v_{w,j}^{pT} X_j^{pT}}{D_{pT}}\right)+(1-\beta)\!\left(\sum_{j=1}^{D_T}\frac{v_j^T X_j^T}{D_T}\right)\right]+\epsilon_T$$

ここで $v_{w,j}^s,v_{w,j}^{pR},v_{w,j}^{pT},v_j^R,v_j^T\sim\mathcal{N}(-10,10)$、$\epsilon_R,\epsilon_T\sim\mathcal{N}(0,0.1)$。処置割当は $W\mid X\sim \text{Bernoulli}(\text{Sigmoid}(\kappa(Y(1)-Y(0))))$。既定値 $\alpha=0.5,\beta=0.5,\kappa^R=1,\kappa^T=1$。

---

## Algorithm

```
Algorithm: HTCE-learner の学習（DR-learner を例に）
入力: ソース D^R = {(x_i^R, w_i, y_i)}_{i=1..N_R}, ターゲット D^T = {(x_i^T, w_i, y_i)}_{i=1..N_T}
      特徴分割 (X^s, X^{pR}, X^{pT}), 層数 L, 正則化係数

--- 第1段: nuisance η = (μ_0, μ_1, π) の推定 ---
for 各 nuisance 関数 (μ_0, μ_1, π):
  # 異種特徴空間の処理 (Section 4.1)
  z^{pR} = φ^{pR}(x^R);  z^{pT} = φ^{pT}(x^T);  z^s = φ^s(x^s)
  Φ^R = [z^s || z^{pR}];  Φ^T = [z^s || z^{pT}]

  # ドメイン間 PO 共有層 (Section 4.2)
  h̃^{pR}_{w,1}=Φ^R, h̃^{pT}_{w,1}=Φ^T
  for l = 1..L-1:
    ソース例: 共有経路 h^s と私的経路 h^{pR} を更新, 次層入力を連結
    ターゲット例: 共有経路 h^s と私的経路 h^{pT} を更新, 次層入力を連結
  ĝ^R = ψ(h^{pR}_{w,L} + h^s_{w,L});  ĝ^T = ψ(h^{pT}_{w,L} + h^s_{w,L})

  # 損失
  minimize  L_y (式4) + λ_1 · L_orthz (式3) + λ_2 · L_orthPO (式5)

# pseudo-outcome の計算 (式6)
Ỹ_{DR,η} = (W/π̂ − (1−W)/(1−π̂))·Y + (1 − W/π̂)·μ̂_1 − (1 − (1−W)/(1−π̂))·μ̂_0

--- 第2段: pseudo-outcome への回帰 ---
特徴 encoder φ_y^{pR}, φ_y^{pT}, φ_y^s + 共有/私的仮説関数 (g_y^R, g_y^T) を
Ỹ_{DR,η} に回帰し, τ̂^T(x^T) を得る
```

（メタ学習器共通に、Adam [63] で最適化。プラグイン系（T/S-learner, TARNet）は第1段のみ、DR/RA/PW-learner は 2 段構成。）

---

## Architecture / Process Flow

```
                異種特徴空間の処理 (4.1)         ドメイン間 PO 共有 (4.2)
  x^R ─► [private enc φ^{pR}] ─► z^{pR} ┐
         [shared  enc φ^s   ] ─► z^s ───┼─► Φ^R=[z^s||z^{pR}] ─► ┌────────────────┐
  x^T ─► [private enc φ^{pT}] ─► z^{pT} ┘   Φ^T=[z^s||z^{pT}] ─► │ 共有層 h^s      │─► μ̂^R_w(x^R)
                                                                 │  + 私的層 h^{pR}│
                                                                 │  + 私的層 h^{pT}│─► μ̂^T_w(x^T)
                                                                 └────────────────┘
                                            直交正則化: L_orthz (表現) / L_orthPO (層の重み)

  HTCE-T-learner : 処置別に独立の encoder/仮説, ドメイン間のみ共有
  HTCE-S-learner : 処置 w を共有特徴に連結し, 処置間も共有
  HTCE-TARNet    : φ の上に ドメイン固有表現層 Ω^{pR}, Ω^{pT} を追加 (ドメイン内 PO 共有)
  HTCE-DR-learner: 上記で η̂ 推定 → pseudo-outcome (式6) → 2段目回帰にも同構造を適用
```

---

## Figures & Tables

本節の数値は arXiv PDF（https://arxiv.org/pdf/2210.06183）本文から抽出。図の画像 URL は arXiv に HTML 版が存在しない（404）ため埋め込まない。

### Table 1（主要結果 + Source of gain）: Twins データセットでの PEHE

Table 1: Benchmarks comparison and source of gain analysis in terms of PEHE on Twins dataset.（10 回の平均 ± 標準誤差、低いほど良い）

| Learner | S-Learner | T-Learner | DR-Learner | TARNet |
|---|---|---|---|---|
| Target（ターゲットのみで学習） | 0.30 ± 0.03 | 0.23 ± 0.02 | 0.20 ± 0.03 | 0.19 ± 0.02 |
| Shared features（共有特徴のみ） | 0.46 ± 0.10 | 0.47 ± 0.10 | 0.46 ± 0.09 | 0.46 ± 0.09 |
| RadialGAN [22] | 0.21 ± 0.02 | 0.2 ± 0.02 | 0.17 ± 0.01 | 0.19 ± 0.02 |
| HTCE − PO sharing（PO 共有を除去） | 0.18 ± 0.03 | 0.15 ± 0.01 | 0.11 ± 0.01 | 0.12 ± 0.01 |
| HTCE − $L_{\text{orth}z}$（表現直交化を除去） | 0.14 ± 0.01 | 0.08 ± 0.01 | 0.07 ± 0.01 | 0.11 ± 0.01 |
| HTCE − $L_{\text{orthPO}}$（層直交化を除去） | 0.15 ± 0.01 | 0.11 ± 0.01 | 0.10 ± 0.01 | 0.11 ± 0.01 |
| **HTCE (ours)** | **0.12 ± 0.01** | **0.06 ± 0.01** | **0.05 ± 0.01** | **0.09 ± 0.01** |

要点: HTCE (ours) が全学習器でベースラインを上回り、DR-Learner で最良（0.05）。各コンポーネント（PO 共有 / $L_{\text{orth}z}$ / $L_{\text{orthPO}}$）を外すと性能が劣化し、各要素の寄与が確認できる。S-Learner は「ドメイン内で PO を完全共有する」強い帰納バイアスが転移設定でさらに制約的になり、相対的に劣る。

### アーキテクチャ図（本文図、画像は非埋め込み）

- **Figure 1**: Building block for handling the heterogeneous feature space of the source and target domains.（$x^R,x^T$ を private/shared encoder で $[z^s\|z^{pR}]$, $[z^s\|z^{pT}]$ に符号化する構造図）
- **Figure 2**: Building block for sharing information between PO across domains.（各処置 $w$ の $L$ 層で共有部分空間 $h^s_{w,l}$ とドメイン私的部分空間 $h^{pR}_{w,l}, h^{pT}_{w,l}$ を持つ図）
- **Figure 3**: HTCE-one-step plug-in learners.（(a) HTCE-T-learner: 処置別 encoder・仮説関数、(b) HTCE-S-learner: 処置を共有特徴に連結し処置間も共有）
- **Figure 4**: HTCE-DR-learner.（第1段で $(\hat\mu_w^R,\hat\mu_w^T)$ と $(\hat\pi^R,\hat\pi^T)$ を共有、pseudo-outcome $\tilde Y_{DR,\eta}$ を計算、第2段で $(\hat{\tilde Y}^R_{DR,\eta},\hat{\tilde Y}^T_{DR,\eta})$ 間を共有して回帰）
- **Figure 5**: HTCE-TARNet.（$\phi$ の上にドメイン固有表現層 $\Omega^{pR},\Omega^{pT}$ を積みドメイン内で PO を共有）

### 感度分析（Figure 6, 7）

- **Figure 6 (top)**: Twins で $\alpha$（ドメイン間 PO 共有量）を 0.1〜1.0 に変化。HTCE は $\alpha=0.1$（PO が大きく異なる）でも $\alpha=1.0$（PO が共有特徴のみに依存）でも良好。$\alpha=1.0$ では HTCE の性能が「共有特徴のみで学習した CATE 学習器」と一致（sanity check）。ターゲットのみ学習は $\alpha=1.0$ で暗黙の特徴選択も担うため性能が低下。
- **Figure 6 (bottom)**: ターゲットサイズ $N_T$ を 0〜4000 に変化。$N_T$ が小さいほど HTCE の改善幅が大きく、$N_T$ 増大で改善は逓減（diminishing returns）。TARNet はターゲットのみでも T-learner より少データで HTCE 相当に到達。
- **Figure 7**: DR-learner で選択バイアス $\kappa^R\in\{0.0,2.0,10.0\}$、$\kappa^T\in[0.0,10.0]$ を変化。HTCE-DR-learner は両ドメインの選択バイアス増大や処置割当機構の乖離があっても一貫した性能。

### Table 2（手法比較、Appendix A）

Table 2: 関連研究との比較。比較軸は「ドメイン数」「異種特徴空間の可否」「異種ラベル空間の可否」「ターゲットラベルへのアクセス」「ドメイン固有の outcome 関数の有無」。本手法（HTCE）は 1 ソース→1 ターゲットで、異種特徴空間に対応し、ターゲットラベルへアクセスし、ソースと共通構造を持ちつつドメイン固有 outcome 関数を構築する点で既存手法と差別化される（各セルの詳細記号は記載なし＝PDF テキスト抽出で欠落）。

---

## Experiments & Evaluation

### Setup

- **データ生成**: 実患者特徴に対し式(7)(8)で outcome を半合成生成。反実仮想（従って真の因果効果）は実データでは観測できないため半合成が必須。
- **実データ（実特徴のみ使用）**: Twins [43]、TCGA [44]、MAGGIC [45]（本文は Twins のみ報告、他は Appendix E）。ソース/ターゲット、共有/私的特徴の分割方法は Appendix D。
- **CATE 学習器**: S-Learner, T-Learner, DR-Learner, TARNet。
- **ベンチマーク**: (1) ターゲットのみで学習、(2) 共有特徴のみ使用、(3) RadialGAN [22] でソースをターゲットへ「翻訳」。これらを、ソース+ターゲット全体を使う HTCE と比較。層数・ユニット数などのハイパーパラメータは公平比較のため揃える（Appendix D）。
- **評価指標**: $\tau^T(x^T)$ 推定の RMSE、すなわち PEHE（Precision in Estimation of Heterogeneous Effects）[5]。10 回の平均 PEHE と標準誤差を報告。
- **最適化**: Adam [63]。

### Main Results（具体的数値）

Table 1 の通り、HTCE (ours) が全 4 学習器でベースラインを上回る。DR-Learner が最良で **PEHE 0.05 ± 0.01**（対 Target 0.20、RadialGAN 0.17）。T-Learner は HTCE で **0.06 ± 0.01**（対 Target 0.23）。TARNet は **0.09 ± 0.01**（対 Target 0.19）。S-Learner は **0.12 ± 0.01**（対 Target 0.30）と相対的に最も高い（帰納バイアスが強すぎるため）。「Shared features のみ」は全学習器で 0.46〜0.47 と最悪で、ソースの私的特徴を捨てることの損失が大きいことを示す。

### Ablation（Source of gain, Table 1）

- **HTCE − PO sharing**: ドメイン間で PO を共有する層を除去 → 例えば DR で 0.05→0.11 に劣化。ドメイン間 PO 共有が最大の寄与源。
- **HTCE − $L_{\text{orth}z}$**: 表現の直交正則化を除去 → DR で 0.05→0.07 に劣化。
- **HTCE − $L_{\text{orthPO}}$**: PO 層の直交正則化を除去 → DR で 0.05→0.10 に劣化。
- 感度: $\alpha$（ドメイン間共有度）・$N_T$（ターゲットサイズ）・$\kappa$（選択バイアス）の全域で HTCE が頑健。特に $N_T$ が小さいほど利得大。

---

## 本テーマへの適用可能性

**テーマ**: マーケティング担当のデータサイエンティストが、頻度の低いキャンペーン（クーポン・メール等）を、毎回異なるターゲットユーザー・異なる施策（treatment）で実施している。似たキャンペーン/ユーザーをグルーピングしてデータを実質的に高密度化し、実験間隔を短縮したい（uplift モデリング / off-policy evaluation 向け）。

本論文の枠組みは、このテーマに次のように直接対応する。

- **「頻度の低い個別キャンペーン」＝「少データのターゲットドメイン」**: 各キャンペーンは配信対象・施策が異なり単独では $N_T$ が小さい。本手法はまさに $N_T \ll N_R$ を前提に、過去の大きなキャンペーン（ソース）から情報を借りて（borrow strength）ターゲットの uplift（＝CATE $\tau^T(x)$）推定を改善する。Table 1 が示すように、ターゲット単独学習（PEHE 0.19〜0.30）に対し HTCE は 0.05〜0.12 と大幅改善し、Figure 6(bottom) は「$N_T$ が小さいほど利得が大きい」ことを定量的に裏づける。実質的なデータ密度向上により、必要な実験期間・実験規模を短縮できる可能性を示す。
- **「異なるターゲットユーザー/特徴」＝「異種特徴空間」**: キャンペーンごとに取得する属性（デモグラ、行動ログ、チャネル固有特徴）が一致しない状況は、まさに $X^R,X^T$ の特徴集合が部分的にしか重ならない設定に対応する。共有特徴 $X^s$（全キャンペーン共通の顧客属性）と私的特徴 $X^{pR}/X^{pT}$（そのキャンペーン固有のシグナル）に分割し、shared/private encoder で共通表現へ写像する 4.1 のブロックが、特徴の異なるキャンペーンを同一モデルに統合する仕組みになる。単に「共通特徴だけで学習」する素朴なグルーピング（Table 1 の Shared features 行、PEHE 0.46）は最悪で、私的特徴を捨ててはいけないことも本論文が示している。
- **「似たキャンペーンのグルーピングによる情報共有」＝「PO 関数のドメイン間共有 + 直交正則化」**: 4.2 の共有層/私的層は、「複数キャンペーンで共通に効く反応構造」を共有層に、「そのキャンペーン固有の反応」を私的層に分離学習する。$\alpha$（ドメイン間共有度）に対する頑健性（Figure 6 top）は、施策が似ていても（$\alpha$ 大）大きく異なっても（$\alpha$ 小）機能することを意味し、「どのキャンペーンをまとめてよいか事前に厳密に分からない」実務でも安全に情報を借りられる。
- **off-policy evaluation / uplift への接続**: DR-learner の HTCE 版（式(6) の doubly-robust pseudo-outcome）は、傾向スコア $\hat\pi$（＝配信ロジック / 過去のターゲティング方針）が既知・推定可能な場合に、選択バイアスに頑健な uplift 推定を与える。Figure 7 が示す「ソース・ターゲットで選択バイアス $\kappa$ が乖離しても一貫」という性質は、キャンペーンごとに配信方針（誰にクーポンを送るか）が異なる実務設定で特に有用で、off-policy 評価の分散低減に資する。
- **具体的な使い方の示唆**: (1) 全キャンペーン共通の顧客特徴を $X^s$、各キャンペーン固有の特徴を $X^p$ として整理する。(2) 直近の大規模キャンペーンをソース、新規/小規模キャンペーンをターゲットとして HTCE-DR-learner を適用する。(3) 複数の過去キャンペーンを「ソース」として順次借用し、少ない新規実験でも密な uplift 推定を得る。ただし後述の制約に留意。

---

## Notes

- **想定と制約**:
  - 二値処置（binary treatment）のみを対象。用量付き処置・処置の組合せ・時系列処置は将来課題（本文 Discussion）。マーケティングで「複数クーポン額」「複数チャネルの組合せ」を扱う場合は直接適用外で、拡張が必要。
  - 両ドメインで **unconfoundedness（交絡なし）と overlap** を仮定。観測共変量で処置割当が説明できること、全個体で配信確率が 0 でないことが前提。隠れ交絡（hidden confounder）は扱わない。
  - ソース 1 個 → ターゲット 1 個の転移が基本設計（Table 2）。多数キャンペーンを同時に融合する場合の一般化は明示されていない。
  - ソースとターゲットの条件付き分布に **共有構造があること** を暗黙に仮定（無関係なキャンペーン間では転移が効かない可能性）。
- **理論保証は未提供**: 性能改善は実験的にのみ示され、ソース・ターゲット類似度に基づく理論的保証は将来課題。
- **評価はすべて半合成**: 真の反実仮想が必要なため実データそのままでの CATE 評価はできず、実特徴 + 合成 outcome で評価。実運用の uplift 検証には別途 A/B ホールドアウト等が要る。
- **HTML 版なし**: arXiv HTML（https://arxiv.org/html/2210.06183）は 404 のため、本レポートの数値・式は PDF 本文からの抽出。Table 2 の一部セル記号は PDF テキスト抽出で欠落し **記載なし**。他データセット（TCGA, MAGGIC）の具体的 PEHE 値は本文に非掲載（Appendix E、本レポートでは **記載なし**）。
- **コード**: https://github.com/ioanabica/HTCE-learners および https://github.com/vanderschaarlab で公開。
- **著者**: van der Schaar 研の CATE メタ学習器系列（TARNet [10], FlexTENet [14], SNet [15]）の延長線上にあり、FlexTENet の shared/private 層アイデアをドメイン間転移へ拡張した位置づけ。
