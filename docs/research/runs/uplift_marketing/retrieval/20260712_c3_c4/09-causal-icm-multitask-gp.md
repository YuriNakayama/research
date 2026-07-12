# Causal-ICM: A Data Fusion Framework For Heterogeneous Treatment Effect Estimation With Multi-Task Gaussian Processes

- **Link**: https://arxiv.org/abs/2405.20957 (HTML: https://arxiv.org/html/2405.20957v3)
- **Authors**: Evangelos Dimitriou, Edwin Fong, Jens Magelund Tarp, Karla Diaz-Ordaz, Brieuc Lehmann
- **Year**: 2024（v1: 2024-05-31 / v3: 2026-04-02）
- **Venue**: 5th Conference on Causal Learning and Reasoning (CLeaR 2026) 採択
- **Type**: 因果推論 / データ融合（Data Fusion）/ ベイズ・ノンパラメトリック手法（Multi-Task Gaussian Process）

---

## Abstract (English, verbatim)

> The paper addresses integrating randomized controlled trials and observational studies for treatment effect estimation. The authors propose a Bayesian nonparametric approach, Causal-ICM, leveraging multi-task Gaussian processes to integrate data from both RCTs and observational studies. They introduce a parameter controlling data borrowing between sources and offer a data-adaptive procedure for optimization. The method demonstrates superior point estimation performance and delivers principled uncertainty quantification, with validation across simulations and real-world applications.

（注: arXiv abstract ページから取得した要約文。完全な逐語一致はバージョンにより若干異なる可能性があるため、引用時は原文の再確認を推奨。）

## Abstract (日本語訳)

本論文は、処置効果推定のためにランダム化比較試験（RCT）と観察研究（observational study）を統合する問題を扱う。著者らは、multi-task Gaussian process を活用して RCT と観察研究の両データを統合するベイズ・ノンパラメトリック手法「Causal-ICM」を提案する。両データソース間の「データ借用（data borrowing）」を制御するパラメータを導入し、その最適化のためのデータ適応的な手続きを提供する。本手法は点推定性能で優位性を示し、原理に基づく不確実性定量化（uncertainty quantification）を提供することを、シミュレーションおよび実世界応用の双方で検証している。

---

## Overview

Causal-ICM は、**内部妥当性は高いがサンプルが少ない RCT** と、**サンプルは大きいが未観測交絡（unmeasured confounding）バイアスを含む観察データ** という 2 つの相補的なデータソースを、**multi-task Gaussian Process（MTGP）の Intrinsic Coregionalization Model（ICM）** の枠組みで結合する。

核心は、観察データからの情報の流入量を単一のスカラー **借用パラメータ ρ ∈ (0,1)** で制御する点にある。ρ を coregionalization 行列 B に埋め込むことで、

- ρ が大きい（1 に近い）→ 観察データを強く信頼し、RCT のデータを密に補完する
- ρ が小さい（0 に近い）→ 観察データを弱く扱い、交絡バイアスの流入を抑える

というトレードオフを連続的に調整できる。さらに ρ をデータ適応的に選ぶための **重み付きクロスバリデーション** を提案し、理論的には「観察データがどれだけ大きくなっても事後分散を無制限に縮められない」ことを保証する **分散下界（Proposition 3.1）** を示している。

---

## Problem

- RCT は無作為化により内部妥当性が高いが、**サンプルサイズが小さく、適格基準（eligibility criteria）が厳しい**ため、共変量空間の一部しかカバーできない。
- 観察研究は**大規模で母集団代表性が高い**が、**未観測交絡バイアス**を含む。
- 単純にプールすると観察データのバイアスが CATE 推定を汚染する。逆に RCT だけでは分散が大きく、RCT がカバーしない領域（外挿領域）で推定が破綻する。
- 既存の融合手法（例: Kallus et al. 2018, Yang et al. 2025b）の多くは**バイアス関数に線形などのパラメトリック仮定**を置くため、非線形な CATE / 交絡構造で性能が劣化する。
- 点推定だけでなく、**原理的な不確実性定量化（信頼区間・被覆率）**が求められる。

---

## Proposed Method（Causal-ICM）

### Core idea

2 つの study（RCT を `e`、観察を `o` と表記）それぞれの応答曲面 `f^e`, `f^o` を、**共有の潜在 GP と study 固有成分**の線形結合として表現する。study 間の相関を coregionalization 行列 B に押し込め、その非対角成分を借用パラメータ ρ で表す。ρ を小さくすると観察データが RCT 推定に与える影響が減衰する。

### Numbered steps

1. RCT データ `𝒟_e` と観察データ `𝒟_o` を、study インデックス `s ∈ {e, o}` を付与して 1 つの multi-task 学習問題として構成する。
2. ICM カーネル（B ⊗ k）で study 間相関を導入。借用パラメータ ρ を coregionalization 行列に埋め込む。
3. 与えられた ρ のもとで、GP のハイパーパラメータ（カーネル長さスケール・分散等）を周辺尤度最大化で学習する。
4. **重み付きクロスバリデーション** で ρ をデータ適応的に選択（RCT の hold-out のみで評価、外挿領域を重視する逆確率重み付け）。
5. 選択した ρ で RCT 応答曲面 `f^e` の事後分布を計算し、CATE と 95% 信用区間を出力する。

### Key Formulas

**Causal-ICM のパラメータ化（係数行列）**

$$
\begin{bmatrix} \alpha_1^e & \alpha_2^e \\ \alpha_1^o & \alpha_2^o \end{bmatrix}
=
\begin{bmatrix} 1 & 0 \\ \rho & \sqrt{1-\rho^2} \end{bmatrix}
$$

**応答曲面（study 固有）**

$$
f^e(\mathbf{x}) = u_1(\mathbf{x})
$$

$$
f^o(\mathbf{x}) = \rho\, f^e(\mathbf{x}) + \sqrt{1-\rho^2}\; u_2(\mathbf{x})
$$

ここで潜在関数 $u_q \sim \mathrm{GP}(0, k)$ は共有のスカラーカーネル $k$ を持つ独立 GP。

**Coregionalization 行列 / ICM カーネル**

$$
B = \begin{bmatrix} 1 & \rho \\ \rho & 1 \end{bmatrix},
\qquad
K\big((\mathbf{x},s),(\mathbf{x}',s')\big) = B_{s,s'}\, k(\mathbf{x},\mathbf{x}') = \big(B \otimes k(\mathbf{x},\mathbf{x}')\big)_{s,s'}
$$

（$\otimes$ は Kronecker 積。）

**RCT 応答曲面の事後分布（テスト点 $\mathbf{x}^*$）**

$$
f^e(\mathbf{x}^*)\mid \mathcal{D} \sim \mathcal{N}\big(m^e(\mathbf{x}^*),\, V^e(\mathbf{x}^*)\big)
$$

$$
m^e(\mathbf{x}^*) = k^e(\mathbf{x}^*, X)\, \Sigma^{-1}\, \mathbf{y}
$$

$$
V^e(\mathbf{x}^*) = \beta^e\, k(\mathbf{x}^*,\mathbf{x}^*) - k^e(\mathbf{x}^*, X)\, \Sigma^{-1}\, k^e(X, \mathbf{x}^*)
$$

**分散下界（Proposition 3.1）**

$$
V^e(\mathbf{x}^*) \;\ge\; (1-\rho^2)\, V^e_{\mathcal{D}_e}(\mathbf{x}^*), \qquad \rho \in (0,1)
$$

観察データのサンプル数が幾ら増えても、RCT 応答曲面の事後分散は $(1-\rho^2)$ 倍の下界を割り込めない → 観察データが不確実性を恣意的に潰すことを防ぐ。

**重み付きクロスバリデーション目的関数（ρ 選択）**

$$
\mathcal{L}(\rho) = \sum_i w(\tilde{\mathbf{x}}_i)\big(\tilde{y}_i - m^e(\tilde{\mathbf{x}}_i)\big)^2,
\qquad
w(\mathbf{x}) = \frac{1}{1 - p(S=o\mid \mathbf{x})}
$$

RCT の hold-out データのみで評価し、外挿（extrapolation）領域を重視する逆確率重み付けを用いる。

---

## Algorithm（Pseudocode）

```
Input:  RCT data D_e = {(x, a, y)}, Observational data D_o = {(x, a, y)}
        rho-grid R = [0.0, 0.1, ..., 1.0]
        propensity-of-source model p(S=o | x)  (for CV weights)
Output: CATE posterior mean m^e(.) and 95% credible intervals

1. Build joint multi-task dataset with study index s in {e, o}
2. for rho in R:
3.     B <- [[1, rho], [rho, 1]]                      # coregionalization matrix
4.     K <- B ⊗ k(x, x')                              # ICM kernel
5.     theta_rho <- argmax  marginal_likelihood(D_e ∪ D_o | K, theta)
6.     # weighted CV on held-out RCT folds (5-fold)
7.     L(rho) <- sum_i w(x_i) * ( y_i - m^e(x_i) )^2    # w(x)=1/(1-p(S=o|x))
8. rho* <- argmin_rho L(rho)
9. Refit GP with rho* on all data; compute posterior:
       m^e(x*) = k^e(x*,X) Σ^{-1} y
       V^e(x*) = β^e k(x*,x*) - k^e(x*,X) Σ^{-1} k^e(X,x*)
10. return m^e(.), 95% CI from N(m^e, V^e)
```

---

## Architecture / Process Flow

```mermaid
flowchart TD
    A[RCT data D_e<br/>小・低バイアス] --> C[Joint Multi-Task Dataset<br/>study index s∈{e,o}]
    B[Observational data D_o<br/>大・交絡バイアス] --> C
    C --> D[ICM Kernel  K = B ⊗ k<br/>B = 1,ρ / ρ,1]
    D --> E[周辺尤度最大化で<br/>ハイパーパラメータ学習]
    E --> F[重み付き CV で ρ* 選択<br/>RCT hold-out のみ / IPW]
    F --> G[事後分布 f^e | D<br/>~ N m^e, V^e]
    G --> H[CATE 点推定 + 95% 信用区間]
    F -. 分散下界 V^e ≥ 1-ρ² V^e_De .-> G
```

ASCII 版:

```
[RCT D_e] --\
             >--> [Joint MTGP: K = B ⊗ k, B=[[1,ρ],[ρ,1]]]
[Obs D_o] --/            |
                         v
             [周辺尤度最適化 (θ)] --> [重み付きCVで ρ* 選択]
                         |
                         v
             [事後 f^e ~ N(m^e, V^e)] --> [CATE + 95% CI]
```

---

## Figures & Tables

> 以下の画像 URL は HTML（v3）内で実際に確認した `<img>` src（`RMSE_boxplots.png`, `coverage.png`, `illustrative_example.png`）のみを埋め込んでいる。

### Figure 1: シミュレーション RMSE 比較

![Simulation results over 100 simulated datasets. Left: Simulation setting 1 (linear CATE and unobserved confounding). Right: Non-linear CATE and unobserved confounding.](https://arxiv.org/html/2405.20957v3/2405.20957v3/RMSE_boxplots.png)

- **キャプション**: "Simulation results over 100 simulated datasets. Left: Simulation setting 1: linear CATE and unobserved confounding, Right: Non-linear CATE and unobserved confounding"
- 線形設定: Causal-ICM は Integrative HTE (Yang et al. 2025b) / Elastic HTE と同等。全手法が Kallus et al. (2018) ベースラインを大きく上回る。
- 非線形設定: Causal-ICM が**最小 RMSE**を達成し、線形性仮定に縛られる競合手法を大きく上回る。

### Figure 2: 95% 条件付き被覆率（Conditional Coverage）

![95% conditional coverage over the covariate distribution of the observational study for the two simulation studies. Black solid line = nominal 95%. Left: linear setting, Right: non-linear setting. GP (obs) exhibited 0% coverage in most of the support.](https://arxiv.org/html/2405.20957v3/2405.20957v3/coverage.png)

- **キャプション**: "95% conditional coverage over the covariate distribution of the observational study for the two simulation studies. The black solid line indicates the nominal level (95%). Left: First simulation setting (linear CATE and confounding), Right: Second simulation setting (non-linear CATE and confounding). The GP (obs) method exhibited 0% coverage in most of the support covariate distribution."
- Causal-ICM: 線形設定で名目 95% に近い被覆率、非線形設定でもわずかに保守的な程度。
- 観察データのみの GP (obs): 交絡により大部分の support で**被覆率 0%**。

### Figure 3: Independent GPs vs Multi-Task GP（概念図）

![Comparative illustration between Independent GPs and Multitask GP. A = distinct treatment groups, Y = outcome, X = baseline covariates.](https://arxiv.org/html/2405.20957v3/2405.20957v3/illustrative_example.png)

- **キャプション**: "Comparative illustration between Independent GPs and Multitask GP. Here, A represents distinct treatment groups, Y corresponds to the outcome, and X denotes baseline covariates."
- （注: この URL は HTML 内 `illustrative_example.png` として確認。Figure 番号は本文の対応を要再確認だが、独立 GP と MTGP の対比を示す概念図。）

### Table 1: 実世界データ（Tennessee STAR）RMSE 結果

| Method | RMSE |
|--------|------|
| Experimental grounding (RF) — Kallus et al. (2018) + Random Forest | 6.27 |
| **Causal-ICM (ρ=0.4)** | **6.29** |
| GP (exp) — T-learner GP、非交絡データ学習 | 6.36 |
| Experimental grounding (GP) — Kallus et al. (2018) + GP | 6.38 |
| GP (obs) — T-learner GP、交絡データ学習 | 7.47 |
| Integrative HTE — Yang et al. (2025b) | 11.84 |

- **キャプション（要約）**: "RMSE values for the RWD example. Causal-ICM: our method; GP (exp): T-learner with GPs trained on unconfounded data; GP (obs): trained on confounded data; Experimental grounding (GP/RF): Kallus et al. (2018); Integrative HTE: Yang et al. (2025b)."
- Causal-ICM は Experimental grounding (RF) と並び「highly competitively」な性能。

### 手法比較表（Method Comparison）

| 手法 | バイアス関数仮定 | 不確実性定量化 | 非線形対応 | 借用制御 |
|------|------------------|----------------|------------|----------|
| **Causal-ICM** | ノンパラメトリック（仮定なし） | あり（GP 事後分布） | ◎ | ρ ∈ (0,1) 連続 |
| Kallus et al. (2018) Experimental grounding | あり（パラメトリック補正） | 限定的 | △ | 明示的でない |
| Integrative HTE (Yang et al. 2025b) | 線形バイアス仮定 | あり | ×（線形制約） | あり |
| GP (obs) 単独 | — | あり（但し交絡で破綻） | ◎ | なし |
| GP (exp) 単独 | — | あり（但し外挿弱い） | ◎ | なし |

---

## Experiments & Evaluation

### Setup

**シミュレーション共通データ生成**: X ~ Unif[-2, 2]; Y = A·τ(X) + X² − 1 + U + ε; U ~ 𝒩((2A−1)·sin(X−1), 1)。

- **Simulation 1（線形）**: CATE τ(X) = 1 + X、交絡 η(X) = 2X。RCT ≈ 250、観察 ≈ 1000。
- **Simulation 2（非線形）**: CATE τ(X) = 1 + X + X²、交絡 η(X) = 2·sin(X−1)。同サンプルサイズ。
- 各設定 **100 個のシミュレーションデータセット**で評価。

**実世界データ: Tennessee STAR**
- Experimental subset: 422 名（rural / inner city のみ）
- Observational subset: 2593 名（control ケース + down-weight した treatment）
- Validation set: 379 名
- 共変量: gender, race, birth month/year, free lunch eligibility, teacher ID
- アウトカム: 標準化テストスコア

**実装**: GPy（Sheffield ML）、RBF カーネル（分散スケーリング項付き）、周辺尤度最大化、5-fold CV（RCT 上）、ρ グリッド [0.0, 0.1, …, 1.0]。ハード: MacBook Pro M2 / 16GB RAM。

### Main Results（具体値）

- **実世界（Table 1）**: Causal-ICM (ρ=0.4) は **RMSE 6.29**。最良は Experimental grounding (RF) の **6.27**、GP (exp) 6.36、GP (obs) 7.47、Integrative HTE 11.84。Causal-ICM は最良手法と実質同等。
- **シミュレーション（Figure 1）**: 線形設定では上位群と同等、**非線形設定で最小 RMSE**（線形仮定手法に対し明確な優位）。
- **被覆率（Figure 2）**: 線形で名目 95% に近く、非線形でわずかに保守的。GP (obs) は大部分で **0% 被覆**。

### Ablation（Appendix J）

感度分析の対象:
- ρ パラメータの変動
- 観察データのサンプルサイズスケーリング
- カーネル選択に対する頑健性
- 共変量オーバーラップの度合い
- RCT support 内 / 外での性能

**主要知見**: "gains are particularly pronounced in regions lacking experimental data"（**RCT データが欠けている領域で改善が特に顕著**）。

---

## 本テーマへの適用可能性

対象テーマは「異なる対象ユーザー・異なる施策（クーポン/メール等）で**低頻度に**実施されるマーケティングキャンペーンを、**類似のキャンペーン/ユーザーでグループ化してデータ密度を高め**、実効的な実験間隔を短縮し、uplift モデリング / off-policy evaluation に活かす」というものである。Causal-ICM の枠組みは以下の形で直接的に対応する。

1. **「RCT × 観察データ融合」→「A/B テスト付き施策 × 過去のログ施策」への読み替え**
   Causal-ICM の `e`（RCT）を「無作為割当のあるクリーンな最新キャンペーン」、`o`（観察）を「無作為化されていない/交絡を含む過去の配信ログ」に対応させれば、**少数のクリーンな実験を、大量だがバイアスを含む過去ログで密に補完**できる。これは「疎なキャンペーンを合成して密なデータにしたい」という要求そのものである。

2. **借用パラメータ ρ による「グループ化強度」の連続制御**
   類似キャンペーン間の情報借用を単一スカラー ρ ∈ (0,1) で調整できる。**似ているキャンペーン同士は ρ を大きく**して strength を borrow し、**構造が異なる場合は ρ を小さく**してバイアス流入を抑制する。ρ をデータ適応的に選ぶ重み付き CV（RCT hold-out で評価）は、「どのキャンペーンをどれだけ束ねてよいか」を**データから自動決定**する手続きとしてそのまま使える。

3. **multi-task 化による「キャンペーン/セグメントを task として束ねる」拡張**
   本論文は 2 task（e/o）だが、ICM の coregionalization 行列 B は原理的に多 task へ拡張可能。**各キャンペーン（または各ターゲットセグメント/各 treatment）を 1 つの task** とし、B の task 間相関で「似たキャンペーン群」を表現すれば、**疎な個別キャンペーンが共有潜在 GP を通じて相互に strength を borrow** し、実効サンプル密度が上がる。これにより「1 回あたりのキャンペーンが小さくても、束ねれば密な CATE 曲面が推定できる」→ **実効的な実験間隔の短縮**につながる。

4. **外挿領域での uplift 推定の底上げ**
   Ablation の知見「RCT データが欠けている領域で改善が顕著」は、マーケティングで頻出する「**まだ配信していないユーザー層・新しいクーポン額**」への uplift 外挿に直結する。過去ログ（観察データ）が広くカバーする領域を借りて、少数実験の外挿を安定化できる。

5. **off-policy evaluation との接続 — 原理的な不確実性定量化**
   Causal-ICM は CATE の点推定に加え **GP 事後分散に基づく 95% 信用区間**を提供する。off-policy 評価では推定 uplift の**信頼区間が意思決定に不可欠**であり、Proposition 3.1 の分散下界は「**バイアスを含む過去ログが幾ら大量でも不確実性を過小評価しない**」ことを保証する。これは「密度を稼ぎつつ、過去ログのバイアスに騙されない」という実務要件と整合的で、過信を防ぐ安全弁になる。

6. **実務上の留意点**
   - 借用の正当性は Selection exchangeability（A4）や Conditional invariance（A6）などの識別仮定に依存する。**キャンペーン間で共変量分布・処置定義が大きく異なる場合**、ρ を小さく選ぶ以上のバイアス制御（傾向スコアの source モデル設計）が必要。
   - 多 task 化・大規模ログでは GP の計算コスト（O(N³)）がボトルネックになり得るため、疎近似（inducing points 等）の導入が現実的な拡張課題。

**まとめ**: Causal-ICM は「少数の信頼できる実験 × 大量のバイアス付きログ」を、ρ という単一の解釈可能なノブと multi-task GP で束ねる。低頻度マーケティングキャンペーンを**キャンペーン/セグメント単位の task としてグループ化 → 共有潜在構造で strength を borrow → 実効データ密度を上げつつ不確実性を担保**、という本テーマの狙いに極めて素直に対応するフレームワークである。

---

## Notes

- Venue は CLeaR 2026 採択。v1 が 2024-05-31、最新 v3 が 2026-04-02。
- 数式・数値は arXiv HTML（v3）および abstract ページから抽出。abstract の逐語引用は取得ソースに基づくため、正式引用時は原論文 PDF で再確認を推奨。
- 埋め込み画像 URL は HTML 内で実在を確認した 3 点（`RMSE_boxplots.png`, `coverage.png`, `illustrative_example.png`）のみ。パスは `https://arxiv.org/html/2405.20957v3/2405.20957v3/<file>.png` の形式で HTML の src を反映。閲覧時にリンク切れの場合は arXiv 側のパス構成変更の可能性あり。
- Figure 3 の Figure 番号は本文対応の再確認余地あり（HTML では独立 GP vs MTGP の概念図として `illustrative_example.png` が確認された）。
- Simulation の正確な RCT/観察サンプル数は「~250 / ~1000」と近似表記。厳密値は論文本文参照。
- 多 task 拡張（3 task 以上）は本論文の直接的な実験対象ではなく、ICM の一般性からの推察を含む（本テーマ適用の項 3）。
- 本論文が明示していない指標値は本レポートでは補完せず、必要箇所は「記載なし」扱いとした（例: 各手法のシミュレーション RMSE の厳密な数値は Figure のボックスプロットのみで表形式の値は本文に明示なし → 記載なし）。
