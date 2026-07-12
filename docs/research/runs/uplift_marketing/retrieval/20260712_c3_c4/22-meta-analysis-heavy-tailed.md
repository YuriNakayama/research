# Meta-Analysis of Randomized Experiments with Applications to Heavy-Tailed Response Data

- **Link**: https://arxiv.org/abs/2112.07602 (PDF: https://arxiv.org/pdf/2112.07602)
- **Authors**: Nilesh Tripuraneni (UC Berkeley), Dominique Perrault-Joncas (Amazon, Seattle), Dhruv Madeka (Amazon, NYC), Dean Foster (Amazon, NYC), Michael I. Jordan (UC Berkeley / Amazon)
- **Year**: 2021（初版 2021-12-14 提出、v5 は 2023-01-09）
- **Venue**: arXiv preprint（stat.ME / stat.AP / stat.ML）。OpenReview に投稿記録あり（`id=rWptAXSkIC`）。正式な採録会議・ジャーナルは記載なし。
- **Type**: 手法論文 + 実データ実証研究（Amazon サプライチェーンの 699 件の RCT）

---

## Abstract (English)

> A central obstacle in the objective assessment of treatment effect (TE) estimators in randomized control trials (RCTs) is the lack of ground truth (or validation set) to test their performance. In this paper, we propose a novel cross-validation-like methodology to address this challenge. The key insight of our procedure is that the noisy (but unbiased) difference-of-means estimate can be used as a ground truth `label' on a portion of the RCT, to test the performance of an estimator trained on the other portion. We combine this insight with an aggregation scheme, which borrows statistical strength across a large collection of RCTs, to present an end-to-end methodology for judging an estimator's ability to recover the underlying treatment effect as well as produce an optimal treatment 'roll out' policy. We evaluate our methodology across 699 RCTs implemented in the Amazon supply chain. In this heavy-tailed setting, our methodology suggests that procedures that aggressively downweight or truncate large values, while introducing bias, lower the variance enough to ensure that the treatment effect is more accurately estimated.

## Abstract (日本語訳)

> RCT（ランダム化比較試験）における処置効果（TE）推定量を客観的に評価するうえでの中心的な障害は、その性能を検証するための「正解（ground truth／検証セット）」が存在しないことである。本論文では、この課題に対処する新しいクロスバリデーション的な方法論を提案する。手法の鍵となる洞察は、ノイズは大きいが不偏である差分平均（difference-of-means）推定値を、RCT の一部分に対する正解「ラベル」として用い、もう一方の部分で学習した推定量の性能を検証できる、という点にある。この洞察を、多数の RCT にまたがって統計的強さを借用（borrow statistical strength）する集約スキームと組み合わせることで、推定量が真の処置効果を回復する能力と、最適な処置「ロールアウト（roll out）」方策を生成する能力とを判定する、エンドツーエンドの方法論を提示する。本手法を Amazon のサプライチェーンで実施された 699 件の RCT にわたって評価した。この裾の重い（heavy-tailed）設定において、本方法論は、大きな値を積極的にダウンウェイト（downweight）または切り詰め（truncate）する手続きが、バイアスを導入する一方で分散を十分に下げ、結果として処置効果をより正確に推定できることを示唆している。

---

## Overview

本研究は、「TE 推定量を客観的に選択したいが、真の処置効果 $\Delta$ が観測できないため通常のクロスバリデーションが使えない」という問題に取り組む。中心アイデアはシンプルで、**不偏な差分平均（DM）推定量をノイジーだが不偏な「正解ラベル」として使う**ことである。RCT の処置群・対照群をそれぞれ 2 分割し、片方（fold 1）で任意の複雑な推定量 $\hat{\Delta}_E$ を学習し、もう片方（fold 2）で計算した DM 推定量 $\hat{\Delta}_{DM}$ をラベルとして held-out MSE を測る。1 つの RCT だけでは DM ラベル自体の分散が大きく信号が弱いため、**同一母集団に対して行われた多数の RCT にまたがって誤差推定を集約（meta-analysis）し、統計的強さを借用する**。

さらに本手法は、単なる推定量選択にとどまらず、「どの処置を全体に展開（roll out）すべきか」という**意思決定方策の評価**にも拡張される。累積財務インパクト（Cumulative Financial Impact, CFI）を目的関数として定義し、DM の不偏性を利用して方策価値の不偏推定を構成する。Amazon の実データでは、標準的な「$\alpha=0.05$ で有意なら展開」という方針が最適から大きく外れており、より積極的な閾値（$t_c \approx -1.2$）が CFI を 2 倍以上に高め得ることを示す。

## Problem（本研究が扱う課題）

- **正解が観測不能**: 真の ATE $\Delta = E[Y(1)-Y(0)]$ は決して観測されず、標準的な CV は TE 推定に対して破綻する。
- **DM 推定量の高分散**: 最も単純で不偏な DM 推定量は、実世界の異質・高次元・**裾の重い**データでは分散が非常に大きい。
- **裾の重さ（heavy tails）**: 応答分布はべき則 $p(y)\sim y^{-\eta}$ に従い、上位 20% の商品が需要の約 80% を占める。バイアス-分散トレードオフの慎重な舵取りが必要。
- **推定量選択の非依存性**: 既存手法（Athey & Imbens 2016、Powers et al. 2018）はモデル特化型で、任意の TE 推定量には適用できない。Schuler et al. (2018) に近いが、本研究は ATE（全体一括処置）を対象とし、集約により RCT 横断で統計的強さを借用する点が異なる。
- **ロールアウト意思決定の最適閾値**: 「有意水準 $\alpha=0.05$ で有意なら展開」という慣行は type I 誤りに偏重しており、type II 誤り（機会損失）も同等に重視すべきビジネス文脈では最適でない。

---

## Proposed Method

### 核となるアイデア

不偏な DM 推定量を「ノイジーな正解ラベル」として使い、RCT を分割して held-out で任意推定量の MSE を不偏推定する。単一 RCT のノイズを、**多数 RCT の集約（正規化スコアの一標本 t 検定）**で克服する。

### 手順（番号付き）

1. **分割**: 各 RCT $I$ の処置群 $T$・対照群 $C$ を、割合 $p$ で互いに素な部分集合に分割し $(T_1,C_1)$（train fold）と $(T_2,C_2)$（test fold）を作る。
2. **学習**: fold 1 上で任意推定量 $\hat{\Delta}_E(T_1,C_1)$ を学習（Winsorization 等の前処理は train fold のみに適用）。
3. **ラベル生成**: fold 2 上で不偏な $\hat{\Delta}_{DM}(T_2,C_2)$ を計算し、これをノイジーな正解ラベルとする。
4. **単一 RCT の MSE 推定**: $\widehat{\text{MSE}}_{I,E} = (\hat{\Delta}_E(T_1,C_1) - \hat{\Delta}_{DM}(T_2,C_2))^2$。
5. **クロスバリデーション**: 分割を $B=100$ 回繰り返し（$p=0.5$）、サブサンプリング分散を低減。
6. **RCT 横断の集約**: $N$ 件の RCT で得た誤差ベクトル $\hat{A},\hat{B}$ を正規化スコア $S_i$ に変換し、一標本 $t$ 検定で推定量 A と B の優劣を判定。
7. **意思決定方策の評価**: DM の不偏性を用いて累積財務インパクト $\hat{F}_E$ を不偏推定し、ロールアウト閾値 $t_c$ を経験的に最適化。

### Key Formulas

母集団平均処置効果（ATE）:

$$\Delta = E[Y(1) - Y(0)]$$

差分平均（DM）推定量（不偏）:

$$\hat{\Delta}_{DM} = \frac{1}{|T|}\sum_{i\in T} Y_i(1) - \frac{1}{|C|}\sum_{i\in C} Y_i(0)$$

held-out MSE（ノイジーだが不偏）:

$$\widehat{\text{MSE}}_{I,E}((T_1,C_1),(T_2,C_2)) = \left(\hat{\Delta}_E(T_1,C_1) - \hat{\Delta}_{DM}(T_2,C_2)\right)^2$$

**不偏性の要（Theorem/Lemma 1 の分解）** — fold 独立性と DM 不偏性により交差項が消える:

$$E\left[(\hat{\Delta}_A(T_1,C_1) - \hat{\Delta}_{DM}(T_2,C_2))^2\right] = E\left[(\hat{\Delta}_A(T_1,C_1) - \Delta)^2\right] + E\left[(\Delta - \hat{\Delta}_{DM}(T_2,C_2))^2\right]$$

第 2 項は推定量 A・B で共通のため、held-out MSE の大小関係が真の MSE の大小関係を保存する:

$$E[(\hat{\Delta}_A - \hat{\Delta}_{DM})^2] \le E[(\hat{\Delta}_B - \hat{\Delta}_{DM})^2] \implies E[(\hat{\Delta}_A - \Delta)^2] \le E[(\hat{\Delta}_B - \Delta)^2]$$

**正規化スコア（集約スキームの核）** — RCT 間で MSE のスケールが異なる問題を吸収:

$$S_i(\hat{A}_i,\hat{B}_i) = \frac{\hat{B}_i - \hat{A}_i}{\hat{B}_i + \hat{A}_i} \in [-1,1]$$

このスコアベクトル $\hat{S}(\hat{A},\hat{B})$ に対し、平均が 0（両推定量が同等）という帰無仮説の**一標本両側 $t$ 検定**を適用する。

**累積財務インパクト（CFI）目的関数** と、その不偏推定:

$$F_E = \sum_{i\in I} M_i \Delta_i D_{E,i}, \qquad \hat{F}_E = \sum_{i\in I} M_i\, \hat{\Delta}_{DM,i}(T_2,C_2)\, D_{E,i}(T_1,C_1)$$

ここで $M_i$ は RCT $i$ の処置対象母集団サイズ、$D_{E,i}\in\{0,1\}$ は展開判断。fold 分割により $\hat{\Delta}_{DM,i}$ と $D_{E,i}$ の独立性を保証し、$E[\hat{F}_E] = \sum_i M_i \Delta_i E[D_{E,i}]$（Lemma 2、不偏）。

ロールアウト方策（一般形）:

$$D_E = \mathbb{1}\!\left[\frac{\hat{\Delta}_E}{\hat{\sigma}_E} > t_c\right]$$

（標準方策は $t_c = 1.96$、gen_dd 推定量を使用）。

### 比較対象の推定量

- **dm**: 差分平均（式 10）。
- **mom1000**: Difference-of-Median-of-Means（式 11）。データを $B=1000$ ブロックに分割し各ブロック平均の中央値を取る。ロバスト。
- **gen_dd**: Generalized Difference-in-Differences（式 12）。$Y = \alpha + T\cdot\Delta + X\cdot\beta + \epsilon$ を最小二乗回帰。事前処置共変量 $X$ で分散低減。
- **gen_dd_w1**: Weighted Generalized LR（式 13）。$\frac{1}{n}\sum_i \frac{1}{(1+D_i)^\gamma}(Y_i - \alpha - \Delta T_i - \beta_i X_i)^2$。補助共変量 $D$（正値サロゲート）で大きな $Y$ をダウンウェイト。
- **Winsorization（`_wins.001`）**: train fold のみ $X,Y$ を $P_{0.1}, P_{99.9}$、$D$ を $P_{99.9}$ で切り詰め。test fold は無加工（Theorem 1 を保つため）。

---

## Algorithm（擬似コード）

```
Input: 推定量集合 {E}, RCT コーパス I = {I_1, ..., I_N}, 分割割合 p=0.5, 反復 B=100

# --- 各推定量ペア (A, B) の誤差ベクトルを構成 ---
for each RCT I_i in I:
    for each estimator E in {A, B}:
        err_sum = 0
        for b in 1..B:
            # 処置群 T, 対照群 C を割合 p でランダム 2 分割
            (T1, C1), (T2, C2) = random_split(T_i, C_i, p)
            # train fold で学習（Winsorize は train fold のみ）
            hat_Delta_E = estimator_E.fit(T1, C1)
            # test fold で不偏ラベルを計算
            hat_Delta_DM = difference_of_means(T2, C2)
            err_sum += (hat_Delta_E - hat_Delta_DM)^2
        MSE_hat[E][i] = err_sum / B     # 式 (3) の CV 版

# --- RCT 横断集約（meta-analysis） ---
for i in 1..N:
    A_i = MSE_hat[A][i];  B_i = MSE_hat[B][i]
    S[i] = (B_i - A_i) / (B_i + A_i)     # 正規化スコア, 式 (7)

t_stat, p_value = one_sample_two_sided_ttest(S, mu0=0)
# t_stat > 0 → A が B より優れる（MSE 小）

Output: (t_stat, p_value) と スコアヒストグラム S
```

ロールアウト方策評価（式 9）は、上記の $\hat{\Delta}_{DM}(T_2,C_2)$ をラベル、$D_E(T_1,C_1)$ を方策として $\hat{F}_E = \sum_i M_i \hat{\Delta}_{DM,i} D_{E,i}$ を計算し、$t_c$ を掃引して最適閾値を探索する。

---

## Architecture / Process Flow

```
                        RCT コーパス I = {I_1, ..., I_699}
                                    │
             ┌──────────────────────┼──────────────────────┐
             ▼                      ▼                      ▼
         RCT I_1                 RCT I_2      ...        RCT I_N
             │                                            │
   split (p=0.5, B=100回)                       split (p=0.5, B=100回)
             │                                            │
   ┌─────────┴─────────┐                        ┌─────────┴─────────┐
   ▼                   ▼                        ▼                   ▼
 fold1(T1,C1)      fold2(T2,C2)              fold1              fold2
   │                   │                        │                   │
 推定量 E 学習       DM ラベル計算            推定量 E 学習       DM ラベル
   └───────┬───────────┘                        └───────┬───────────┘
           ▼                                            ▼
  MSE_hat = (Δ_E - Δ_DM)^2                      MSE_hat = (Δ_E - Δ_DM)^2
           │                                            │
           └──────────────┬─────────────────────────────┘
                          ▼
             正規化スコア S_i = (B_i - A_i)/(B_i + A_i)
                          ▼
                一標本両側 t 検定 (mu=0)
                          ▼
         推定量ランキング / ロールアウト閾値 t_c 最適化 (CFI)
```

---

## Figures & Tables

> 注: HTML 版（arxiv.org/html/2112.07602）は HTTP 404 で取得不能だったため、画像 URL の埋め込みは行っていない。以下は PDF 本文から抽出した図表の説明と数値である。

### 表A: 主要結果 — 推定量比較（Table 1、$t$統計量, $p$値）

Table 1 は正規化スコアベクトルへの一標本 $t$ 検定。行方向に読み、index $(A,B)$ の大きな正の $t$統計量は「A が B より優れる（MSE 小）」を意味する。

| A ＼ B | dm | mom1000 | gen_dd | gen_dd_w1 | dm_wins.001 | gen_dd_wins.001 | gen_dd_w1_wins.001 |
|---|---|---|---|---|---|---|---|
| **dm** | x | (-3.58, 3.63e-4) | (-12.68, 2.38e-33) | (-22.36, 3.6e-84) | (-28.19, 7.99e-118) | (-25.33, 2.96e-101) | (-24.96, 4.11e-99) |
| **mom1000** | (3.58, 3.63e-4) | x | (-2.12, 0.0342) | (-11.89, 7.32e-30) | (-13.51, 3.78e-37) | (-14.61, 1.94e-42) | (-15.72, 5.33e-48) |
| **gen_dd** | (12.68, 2.38e-33) | (2.12, 0.0342) | x | (-21.1, 4.73e-77) | (-19.01, 2e-65) | (-25.15, 3.11e-100) | (-23.49, 1.14e-90) |
| **gen_dd_w1** | (22.36, 3.6e-84) | (11.89, 7.32e-30) | (21.1, 4.73e-77) | x | (-0.26, 0.794) | (-5.12, 3.87e-7) | (-9.56, 1.87e-20) |
| **dm_wins.001** | (28.19, 7.99e-118) | (13.51, 3.78e-37) | (19.01, 2e-65) | (0.26, 0.794) | x | (-4.17, 3.41e-5) | (-5.39, 9.62e-8) |
| **gen_dd_wins.001** | (25.33, 2.96e-101) | (14.61, 1.94e-42) | (25.15, 3.11e-100) | (5.12, 3.87e-7) | (4.17, 3.41e-5) | x | (-4.12, 4.2e-5) |
| **gen_dd_w1_wins.001** | (24.96, 4.11e-99) | (15.72, 5.33e-48) | (23.49, 1.14e-90) | (9.56, 1.87e-20) | (5.39, 9.62e-8) | (4.12, 4.2e-5) | x |

**導出ランキング（Copeland/Borda 集計）**:

```
gen_dd_w1_wins.001 > gen_dd_wins.001 > dm_wins.001 ≈ gen_dd_w1 > gen_dd > mom1000 > dm
```

- **dm は全推定量に劣る**（表の全列で負の $t$）。
- 事前処置共変量調整（gen_dd）は dm より良い。
- 大きな $Y$ のダウンウェイト（gen_dd_w1）と Winsorization が総じて最良。

### 表B: 頑健性/アブレーション（Table 2 & Table 3、リサンプル分割 50 回）

Table 2・3 は、$\hat{A},\hat{B}$ に投入する誤差ベクトルを **50 回のリサンプル分割のみ**（互いに異なる乱数）で計算した再現性チェック。追加推定量 `gen_dd_w_norm` を含む。主要な符号・順序は Table 1 と整合（安定）。代表値:

| 比較 | Table 2 (t, p) | Table 3 (t, p) |
|---|---|---|
| dm vs dm_wins.001 | (-27.53, 5.04e-114) | (-27.85, 7.64e-116) |
| gen_dd_w1 vs dm_wins.001 | (-0.22, 0.828) | (-0.37, 0.714) |
| gen_dd_w1 vs gen_dd_w_norm | (6.83, 1.8e-11) | (6.72, 3.64e-11) |
| gen_dd_wins.001 vs gen_dd_w1_wins.001 | (-4.11, 4.44e-5) | (-3.87, 1.19e-4) |

### 表C: 手法比較（推定量の性質まとめ）

| 推定量 | 種別 | 分散低減の仕組み | バイアス | 裾の重さ耐性 |
|---|---|---|---|---|
| dm | 不偏ベースライン | なし | なし | 低（最劣位） |
| mom1000 | ロバスト（中央値ベース） | 1000 ブロック中央値 | 小 | 中 |
| gen_dd | 回帰調整 | 事前共変量 $X$ | 小 | 中 |
| gen_dd_w1 | 加重回帰 | $D$ による逆重み付け | 中 | 高 |
| `_wins.001` 系 | 切り詰め | train fold の $P_{0.1}/P_{99.9}$ Winsorize | 中〜大 | 高（最良） |

### 図の説明（PDF より、画像は未埋め込み）

- **Fig. 1（Gini プロット）**: 単一 RCT の需要累積シェア vs 商品母集団シェア。上位 20% の人気商品が需要の約 80% を占める（裾の重さ）。
- **Fig. 2（Hill プロット）**: 応答変数右裾のべき指数 $\eta$（$p(y)\sim y^{-\eta}$）を Hill 推定量で推定。単一 RCT では $\eta \approx 1$〜$3$。コーパス全体（Hill cutoff を 5 パーセンタイル）では平均 $\eta \approx 2.32$（標準偏差 0.79、中央値 2.1476）。
- **Fig. 3–5, 11–19（スコアヒストグラム）**: 各推定量ペアの正規化スコア分布。左に歪む（left-skewed）ほど B が優れる。
- **Fig. 6–7（CFI vs $t_c$）**: DM / Gen. DD / Weighted Gen. DD（$\gamma=0.6$）の正規化 CFI を $t_c$ の関数として描画。$t_c \approx -1.2$（信頼区間 $(-2.4, 0.4)$）で最大。
- **Fig. 8, 9, 10（方策比較・オンライン評価）**: Random Forest 方策 $D=D(X)$ が最高 CFI を達成し、$t_c=-1.2$ の Weighted Gen. DD に対し統計的に有意に上回る。オンライン方策は標準方策（$t_c=1.96$）を **2 倍超**で上回る。

---

## Experiments & Evaluation

### Setup

- **データ**: Amazon サプライチェーンで 2017 年以降に実施された **699 件の RCT**。処置は商品の処理方法の改善介入。
- **規模**: 各 RCT は通常 50%/50% で処置・対照に割付（一部は不均衡）。サイズは数万〜数百万商品。約 27 週間実施し、10 週目のトリガー日に介入。
- **前処理変数**: 事前処置応答 $X$、非負補助共変量 $D$（需要予測などのサロゲート）、事後処置応答 $Y$、処置ダミー $T$。
- **CV 設定**: 分割割合 $p=0.5$、反復 $B=100$。集約は正規化スコアの一標本両側 $t$ 検定。

### Main Results（具体数値）

- **推定量ランキング**: `gen_dd_w1_wins.001 > gen_dd_wins.001 > dm_wins.001 ≈ gen_dd_w1 > gen_dd > mom1000 > dm`。dm は全手法に劣る。
- **dm vs gen_dd_w1_wins.001**: $t=-24.96$, $p=4.11\text{e-}99$（Winsorize+加重が圧倒的に優位）。
- **gen_dd_w1 vs dm_wins.001**: $t=-0.26$, $p=0.794$（有意差なし → 概ね同等）。
- **裾の重さ**: べき指数 $\eta \approx 2.32$（std 0.79, 中央値 2.1476）。
- **ロールアウト最適閾値**: 標準の $t_c=1.96$ より $t_c \approx -1.2$（CI $(-2.4, 0.4)$）が最適で、CFI を **2 倍以上**にし得る。
- **オンライン方策**: 時系列順（RCT 終了日順）でオンライン回帰として評価した RF・オンライン $t_c$ 方策は、いずれも標準方策を **2 倍超** の正規化 CFI で上回る（out-of-sample 評価でも成立）。

### Ablation / 頑健性

- **リサンプル分割数**: $B=100$ の Table 1 と、$B=50$ の異なる乱数 2 セット（Table 2, 3）で符号・順序が一貫し、集約結果が train/test 分割の乱数に対して安定であることを確認。
- **正規化の必要性**: `gen_dd_w_norm`（正規化版）との比較で、非正規化の重み付けの方が MSE 選択では優位（例 gen_dd_w1 vs gen_dd_w_norm: $t\approx 6.8$）。ただし CFI 目的では、母集団サイズ $M_i$ で重み付けし正規化しない設計を採用。
- **方策空間の拡張**: 単純な $t_c$ 閾値方策より、共変量 $X$（単位利益・母集団サイズ・各 ATE 推定値と $t$統計量）を入力とする Random Forest 方策 $D=D(X)$ が有意に高い CFI を達成。

---

## 本テーマへの適用可能性

本テーマは、**低頻度で実施される（対象ユーザーも施策内容も毎回異なる）クーポン／メール等のマーケティング施策**を、似た施策同士でグルーピング・プールして「データを合成的に稠密化」し、実効サンプルサイズを増やし・実効実験間隔を短縮して uplift モデリング / off-policy 評価に活かす、というものである。本論文はこの狙いにほぼ直接対応する方法論を提供する。

- **散在する施策を「RCT コーパス」として横断集約する枠組み**: 本論文の中心貢献は、**多数の独立した RCT にまたがって統計的強さを借用（borrow strength）**し、単一実験ではノイズに埋もれる信号を meta-analysis で取り出す点にある。マーケティングでは、各キャンペーン（クーポン配布・メール送信）を 1 つの RCT と見なし、対象ユーザーや treatment が違っても正規化スコア $S_i=(B_i-A_i)/(B_i+A_i)$ でスケール差を吸収して集約できる。これがまさに「似た施策をプールして実効データ密度を上げる」操作に相当する。
- **正解ラベルなしで uplift 推定量を客観選択**: uplift モデリングでは真の個別処置効果が観測できず、モデル選択が難しい。本手法の「fold 2 の不偏 DM をノイジー正解ラベルにする」トリックを応用すれば、複数キャンペーン横断で uplift 推定量（S-learner / T-learner / gen_dd 型回帰調整 / 加重推定など）の held-out MSE を不偏に比較でき、キャンペーン単体では検出力不足でも、プールにより有意な優劣判定が可能になる。
- **実効実験間隔の短縮 = CFI の逐次オンライン評価**: 本論文は RCT を終了日順に並べ、「最初の $N$ 件の結果で $N+1$ 件目の方策を決める」**オンライン回帰**として CFI を最適化し、out-of-sample でも標準方策の 2 倍超を達成した。これは低頻度施策でも、過去キャンペーン群から学んだ方策を次の施策に即転用し、実質的に「意思決定サイクルを詰める」ことに直結する。新規施策 1 件を待たずに、蓄積プールから方策を更新できる。
- **裾の重いマーケティング指標への処方**: 顧客収益・購買額・エンゲージメントは本論文の設定同様に heavy-tailed（$\eta\approx 2.3$）。本研究の結論「積極的な Winsorization / ダウンウェイトがバイアスを増やしても分散を下げて MSE を改善」は、コンバージョン額や LTV を uplift のアウトカムに使う場合に、外れ値上位客の切り詰め・$1/(1+D)^\gamma$ 型重み付け（$D$ に予測購買額サロゲートを使う）で推定を安定化できることを示唆する。プールで得た稠密データがあってこそ、この分散低減の効果を統計的に検証できる。
- **ロールアウト閾値の経験的最適化**: 「$p<0.05$ で有意なら配信拡大」という慣行が最適から外れ得るという知見は、マーケティングの「勝ち施策の全体展開」判断にそのまま移せる。施策母集団サイズ $M_i$（配信対象規模）で重み付けした $\hat{F}_E=\sum_i M_i \hat{\Delta}_{DM,i} D_{E,i}$ を、プールした施策群で最適化すれば、ROI 最大化の展開閾値をデータ駆動で決められる。

### 適用上の前提と注意

本手法の CFI 拡張は、(1) 目的指標が母集団に対して加法的、(2) 施策同士が相互作用しない、(3) 意思決定が二値、(4) 各 RCT が独立にランダム化、を要求する。マーケティングでは、同一ユーザーに複数施策が重複すると (2)(4) が崩れやすいため、施策間の対象重複・キャリーオーバー効果に注意が必要。また、プールできるのは「同一母集団・共通指標を持つ似た施策」に限られる（正規化スコアはスケール差を吸収するが、母集団や測定対象が異質すぎる施策の混在は集約の妥当性を損なう）。

---

## Notes

- HTML 版（`https://arxiv.org/html/2112.07602` および `v3`）は HTTP 404 のため取得できず、本文・数値は arXiv PDF（v5, 2023-01-09）を `pdftotext` で抽出して精査した。**図の画像 URL は実見していないため埋め込んでいない**。
- 正式な採録会議・ジャーナルは PDF・abstract ページ上に記載なし（arXiv preprint、OpenReview に投稿記録あり）。著作権表記は「©2022」となっている。
- Winsorization レベル `0.001` は $X,Y$ を $P_{0.1}/P_{99.9}$、正値補助共変量 $D$ を $P_{99.9}$ で切り詰めることを指す。train fold のみ適用し、test fold は無加工で Theorem 1 の不偏性を保持。
- 本文中の "Theorem 1/2" と "Lemma 1/2" は同一命題を指しており、証明は Appendix A にある（fold 独立性と DM 不偏性による交差項の消去が鍵）。
- 数値のうち Table 1 と Table 2/3 で $p$ 値がわずかに異なるのは、リサンプル分割数（$B=100$ vs $50$）と乱数の違いによる（本文記載どおり）。それ以外に本レポートで補完・推測した数値はない。値が本文に無い箇所は「記載なし」と明記した。
