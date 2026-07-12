# One-Step Weighting to Generalize and Transport Treatment Effect Estimates to a Target Population

- **Link**: https://arxiv.org/abs/2203.08701
- **Authors**: Ambarish Chattopadhyay, Eric R. Cohn, Jose R. Zubizarreta
- **Year**: 2022（2022年3月16日投稿、2023年6月15日最終改訂）
- **Venue**: arXiv:2203.08701 [stat.ME]（Statistics > Methodology）。The American Statistician 系の応用統計論文（R コード提供）
- **Type**: 方法論論文（balancing weights による一般化/移送）

---

## Abstract (English)

> The problem of generalization and transportation of treatment effect estimates from a study sample to a target population is central to empirical research and statistical methodology. In both randomized experiments and observational studies, weighting methods are often used with this objective. Traditional methods construct the weights by separately modeling the treatment assignment and study selection probabilities and then multiplying functions (e.g., inverses) of their estimates. In this work, we provide a justification and an implementation for weighting in a single step. We show a formal connection between this one-step method and inverse probability and inverse odds weighting. We demonstrate that the resulting estimator for the target average treatment effect is consistent, asymptotically Normal, multiply robust, and semiparametrically efficient. We evaluate the performance of the one-step estimator in a simulation study. We illustrate its use in a case study on the effects of physician racial diversity on preventive healthcare utilization among Black men in California. We provide R code implementing the methodology.

## Abstract (日本語)

研究サンプルからターゲット母集団へ処置効果推定値を一般化（generalization）・移送（transportation）する問題は、実証研究と統計的方法論の中心にある。ランダム化実験と観察研究のいずれでも、この目的で重み付け（weighting）法がしばしば用いられる。従来法は処置割付確率と研究選択確率を**別々に**モデル化し、それぞれの推定値の関数（例：逆数）を掛け合わせて重みを構成する。本研究では、**一段階（single step）で重み付けする**方法の正当化と実装を与える。この one-step 法が逆確率重み付け（IPW）および逆オッズ重み付け（inverse odds weighting）と形式的に接続することを示す。得られる target average treatment effect（TATE）推定量が一致性・漸近正規性・multiply robust・半パラメトリック効率性を持つことを実証する。シミュレーション研究で one-step 推定量の性能を評価し、カリフォルニアの黒人男性における医師の人種的多様性が予防医療利用に与える効果のケーススタディで応用を示す。R コードも提供する。

---

## Overview

従来の一般化/移送では、処置傾向スコア `e(X)` と研究選択確率 `π(X)` を別々にモデル化し、その逆数を**掛け合わせて**重みを作る（two-step, multiplicative）。この乗算構造は重みを極端に不安定にし、共変量バランスを保証しない。本論文は、**ターゲット母集団の共変量プロファイルに対して各処置群を直接バランスさせる凸最適化を一段階で解く**ことで、最小分散かつ安定な重みを構成する。この one-step 重みは、双対問題を通じて IPW/逆オッズ重みに、バランス条件を通じてアウトカムモデルに接続し、結果として得られる Hájek 推定量が multiply robust かつ半パラメトリック効率的であることを証明する。

---

## Problem（本論文が解く課題）

- 従来の two-step 重み（`1/e(X)` × `(1−π(X))/π(X)` のような乗算）は**高分散・極端値**を生み、有効標本サイズを激減させる。
- 別々にモデル化した確率を掛け合わせるため、ターゲット母集団に対する**共変量バランスが保証されない** → バイアスと不安定性。
- 一つの重みが分析全体を支配する（最大正規化重みが 1 に近い）ことがある。
- 一般化（study ⊂ target）と移送（study と target が disjoint）を統一的に扱う枠組みが欲しい。
- 得られる推定量に一致性・効率性・ロバスト性の理論保証を与えたい。

---

## Proposed Method

### 中核アイデア

「重みのバイアスは条件付き平均関数 `m_z(x)` の不均衡から生じ、分散は重みの L2 ノルムに比例する」という二つの事実（式5, 6）から出発し、**基底関数 `B_k(X)` をターゲット母集団のプロファイル `B̄_k^*` にバランスさせる制約下で、重みの分散（L2 ノルム）を最小化する凸最適化**を各処置群について解く。これが one-step 重み。

### 手順（numbered steps）

1. **識別**: Assumption 1（overlap・unconfoundedness とその一般化/移送版）のもとで TATE `τ` を重み付けで識別。
2. **バイアスと分散の分解**: 重みのバイアスは `Σ w_i m_z(X_i) − E_T[m_z(X)]`（式5）、分散は `σ_z^2 Σ w_i^2`（式6）に等しいことを示す。
3. **凸最適化の定式化**: 各処置群 `z` について、`B_k(X)` を `B̄_k^*` に許容誤差 `δ_k` 内でバランスさせつつ、重みの分散 `ψ(w_i)`（例：L2 ノルム）を最小化（式7）。
4. **基底関数の選択**: 主項（`m_z` が線形なら十分）、高次交互作用、RKHS カーネルまで柔軟に選べる。ターゲットの**共変量プロファイル `(B̄_1^*, ..., B̄_K^*)` だけ**あれば実行可能。
5. **接続の証明**: 双対問題から IPW/逆オッズ重みへ、バランス条件からアウトカムモデルへ接続。
6. **理論保証**: Theorem 4.1（multiply robust 一致性）、Theorem 4.2（漸近正規性・半パラメトリック効率境界達成）。
7. **評価**: Kang & Schafer 型シミュレーションと、カリフォルニア医師多様性実験のケーススタディ。

### Key Formulas（LaTeX）

**TATE の重み付け識別（式2）:**

$$\tau = \frac{\mathbb{E}_{P_1}\!\Big[\frac{t(X)}{e(X)p(X)}Y^{obs}\Big]}{\mathbb{E}_{P_1}\!\Big[\frac{t(X)}{e(X)p(X)}\Big]} - \frac{\mathbb{E}_{P_0}\!\Big[\frac{t(X)}{\{1-e(X)\}p(X)}Y^{obs}\Big]}{\mathbb{E}_{P_0}\!\Big[\frac{t(X)}{\{1-e(X)\}p(X)}\Big]}$$

**一般化への帰着（IPW 表現、式3）:** `t(X)/p(X) → 1/π(X)`（`π(X)=pr_Q(D=1|X)`）。

**移送への帰着（逆オッズ重み表現、式4）:** 重みが `{1−π(X)}/{e(X)π(X)}` の形になる。

**バイアス（式5）:**

$$\mathbb{E}_P\!\Big[\sum_{i:Z_i=z} w_i Y_i^{obs} - \mathbb{E}_T\{Y(z)\}\Big] = \mathbb{E}_P\!\Big[\sum_{i:Z_i=z} w_i m_z(X_i) - \mathbb{E}_T\{m_z(X)\}\Big]$$

**分散（式6）:**

$$\mathrm{Var}_P\!\Big(\sum_{i:Z_i=z} w_i Y_i^{obs}\ \Big|\ X,Z\Big) = \sigma_z^2 \sum_{i:Z_i=z} w_i^2$$

**one-step 重みの凸最適化（式7）:**

$$\arg\min_{w}\ \sum_{i:Z_i=z}\psi(w_i)\quad \text{s.t.}\quad \Big|\sum_{i:Z_i=z} w_i B_k(X_i) - \bar{B}_k^{*}\Big| \le \delta_k,\ k=1,\dots,K;\quad \sum_{i:Z_i=z} w_i = 1$$

**漸近分散（半パラメトリック効率境界、Theorem 4.2）:**

$$V_\tau^{*} = \mathbb{E}_T\!\Big(\frac{\sigma_1^2(X)}{\pi(X)e(X)} + \frac{\sigma_0^2(X)}{\pi(X)\{1-e(X)\}} + \{m_1(X)-m_0(X)-\tau\}^2\Big)$$

一般化（nested design）では `V_τ^*` が TATE の半パラメトリック効率境界に一致し、one-step 推定量がこれを達成する。

---

## Algorithm（擬似コード）

```
入力: 研究データ {(X,Z,Y): D=1}, ターゲット共変量プロファイル B̄* = (B̄_1*,...,B̄_K*), 許容誤差 δ_k
出力: TATE 推定量 τ̂

各処置群 z ∈ {0,1} について:
  1. 基底関数 B_k(X) を選択（主項/交互作用/カーネル）
  2. 凸最適化(式7)を解く:
       min Σ ψ(w_i)              # ψ = L2 ノルム（分散最小化）
       s.t. |Σ w_i B_k(X_i) − B̄_k*| ≤ δ_k  （ターゲットへのバランス）
            Σ w_i = 1            （正規化; 任意で w_i ≥ 0）
  3. 得られた one-step 重み w で Hájek 推定量を計算:
       Ê_T[Y(z)] = Σ_{i:Z_i=z} w_i Y_i
τ̂ = Ê_T[Y(1)] − Ê_T[Y(0)]
（δ_k は Chattopadhyay et al. 2020 のチューニングでバイアス/分散をトレードオフ）
```

---

## Architecture / Process Flow

```mermaid
flowchart TD
    A[研究サンプル D=1: X,Z,Y] --> C[各処置群 z]
    B[ターゲット: 共変量プロファイル B̄*] --> C
    C --> D[凸最適化 式7: min L2ノルム s.t. B_k を B̄* にバランス]
    D --> E[one-step 重み w_i]
    E --> F[Hájek 推定 Ê_T Y(1), Ê_T Y(0)]
    F --> G[τ̂ = TATE]
    E -.双対問題.-> H[IPW / 逆オッズ重みに接続]
    D -.バランス条件.-> I[アウトカムモデルに接続 → multiply robust]
```

---

## Figures & Tables（MANDATORY）

### Table 1（Table 2 相当・主結果）: Hájek 推定量の RMSE（800 回シミュレーション）

| 重み付け法 | ランダム化 M1 | ランダム化 M2 | ランダム化 M3 | 観察 M1 | 観察 M2 | 観察 M3 |
|------|------|------|------|------|------|------|
| Two-Step 1 | 17.47 | 21.80 | 23.53 | 22.55 | 24.76 | 24.96 |
| **One-Step 1** | **2.91** | **3.17** | **4.40** | **9.18** | **8.64** | **7.58** |
| Two-Step 2 | 19.00 | 23.70 | 25.23 | 42.47 | 41.44 | 45.72 |
| **One-Step 2** | **2.26** | **2.53** | **3.27** | **17.32** | **16.38** | **24.16** |
| Two-Step 3 | 4.75 | 5.58 | 6.09 | 9.11 | 10.59 | 12.43 |
| **One-Step 3** | **0.54** | **0.70** | **0.91** | **0.73** | **0.90** | **1.14** |

> One-Step は全モデル・両設定で Two-Step を上回る。ランダム化で平均 **86%**、観察で平均 **70%** の RMSE 削減。正しく特定された One-Step 3 は正しく特定された Two-Step 3 より一桁小さい RMSE。真の TATE はすべての設定で 0。

### Table 2（再構成）: 有効標本サイズ・最大正規化重み（Figure 1 の要約）

| 指標 | 改善（ランダム化） | 改善（観察） |
|------|------|------|
| 有効標本サイズ（One-Step vs Two-Step, 平均） | +43% | +87% |
| 最大正規化重みの極端性 | Two-Step の方が極端（特に観察設定で 1 に近い） | 同左（顕著） |

> 乗算構造の two-step 重みは重複が少ない観察設定で極端値問題が悪化する。図は各手法の有効標本サイズ（0〜400）と最大正規化重み（0〜1）のバープロット。

### Table 3（再構成）: multiply robust 一致性の条件（Theorem 4.1）

| 条件 | 一致性が成立する十分条件 |
|------|------|
| (a) | 処置群・対照群双方の IP 重みモデルが正しく近似 |
| (b) | （両群の潜在アウトカムモデル） |
| (c) | 処置群の IP 重みモデル ＋ 潜在アウトカムモデルが正しい |
| (d) | 対照群の IP 重みモデル ＋ 潜在アウトカムモデルが正しい |

> multiply robust 推定量と同様、複数の（IP 重み・潜在アウトカム・その組合せの）モデルのいずれかが正しければ一致。

### Table 4（再構成）: ケーススタディ（カリフォルニア医師人種多様性実験、Alsan et al. 2019）

| 項目 | 内容 |
|------|------|
| 研究課題 | 黒人男性が黒人医師 vs 白人医師で予防医療サービス利用が変わるか |
| 募集 | 1,300 名の黒人男性を募集 |
| スクリーニング来院 | 637 名 |
| ランダム化 | 黒人医師 313 名 / 白人医師 324 名 |
| アウトカム（7種） | 5つの予防サービス選択 ＋ 心血管サービス選択割合 ＋ 侵襲的サービス選択割合 |
| 手法の役割 | one-step 重みで一般化・移送を実演 |

> 論文本文の図（Figure 1）は有効標本サイズ・最大正規化重みのバープロット。arXiv HTML 版が本調査時点で 404 のため `<img>` URL は取得できず埋め込みなし。数値は PDF から抽出。

---

## Experiments & Evaluation

- **Setup**: Kang & Schafer (2007) 型。4つの非観測共変量 `U1..U4 ~ N(0,1)` と、それらの非線形変換で作った4つの観測共変量 `X1=exp(U1/2)`, `X2=U2/{1+exp(U1)}+10`, `X3=(U1U3/25+0.6)^3`, `X4=(U2+U4+20)^2`。選択確率 `pr(D=1|U)=expit(−U1+0.5U2−0.25U3−0.1U4)`（周辺 `pr(D=1)=0.5`）、総コホート 1,000。3つのアウトカムモデルで異質性の度合いを変える（真の TATE は常に 0）。One-Step 3種 vs Two-Step 3種を 800 回反復で比較。
- **Main Results（数値）**: Table 1 の通り、One-Step が RMSE をランダム化で平均 86%、観察で平均 70% 削減。正しく特定された One-Step 3 は Two-Step 3 より一桁小さい RMSE（例：ランダム化 M1 で 0.54 vs 4.75）。
- **Ablation**: 有効標本サイズは One-Step でランダム化 +43%、観察 +87% 改善。study と target が disjoint（移送）な追加シミュレーション（付録8.7）でも One-Step が優位。異分散設定（付録8.8）でも漸近的性質が保たれることを確認。

---

## 本テーマへの適用可能性

本論文の one-step balancing weights は、**「ターゲットクラスタの共変量プロファイルさえあれば、過去キャンペーンの効果を安定に移送できる」** という点で、本テーマの実務要件に極めてよく合う。

- **共変量プロファイルだけで移送可能**: 本手法はターゲット母集団の個票を必要とせず、**共変量の要約（平均・分布モーメント）`(B̄_1^*,...,B̄_K^*)` だけ**あれば重みを解ける。マーケティングでは移送先クラスタの個人データが手元になくても「そのクラスタの RFM 平均・年齢分布」といった集計値は入手しやすく、この軽量さは大きな利点。
- **極端重みの回避 → 少数キャンペーンでの安定性**: 施策が稀（infrequent）でサンプルが小さいと、従来の two-step 重み（傾向スコア × 選択確率の逆数）は極端値を生み、一つのユーザーが推定を支配してしまう。one-step は L2 ノルム最小化で有効標本サイズを最大化（実験で +43〜87%）するため、**小標本の過去キャンペーンから安定した uplift 移送**ができる。
- **一般化と移送の両対応**: 「過去キャンペーンの母集団 ⊂ 全ユーザー基盤（generalization）」でも「過去キャンペーン群と全く別の新セグメント（transportation, disjoint）」でも、同じ凸最適化で対応できる。行動クラスタが重なる場合も disjoint な場合も統一的に扱える。
- **クラスタ横断バランシング**: 行動クラスタリング（RFM・購買頻度・チャネル反応）で得た各クラスタのプロファイルを `B̄^*` とし、過去キャンペーンの処置群/対照群をそのプロファイルにバランスさせれば、クラスタごとの TATE（そのクラスタで施策を打ったらどうなるか）を推定できる。
- **multiply robust による実務的頑健性**: 選択モデルとアウトカムモデルのいずれかが正しければ一致する（Theorem 4.1）。マーケティングの行動モデルは誤特定しやすいため、この頑健性で「どのクラスタへ効果を運んでも大崩れしない」保証が得られる。
- **R コード提供**: 著者が実装を公開しており、データサイエンティストが自社のキャンペーンログにすぐ適用できる。基底関数を RFM の主項＋交互作用に設定するだけで運用開始できる。
- **効率境界の達成**: nested design（キャンペーン参加者が全ユーザー基盤の部分集合）では推定量が半パラメトリック効率境界を達成するため、限られたデータから最大限の精度で効果を移送できる。

---

## Notes

- 著者は Harvard の Zubizarreta グループ。balancing weights（stable balancing weights, Wang & Zubizarreta 2020）の系譜に位置づけられる。
- one-step 重みは、特定のパラメータ設定で generalization/transportation の線形回帰インピュテーション推定量（Dahabreh et al. 2019, 2020）と等価になることを付録で示している。
- Theorem 4.1（multiply robust 一致性）と Theorem 4.2（漸近正規性・半パラメトリック効率性）が主要理論結果。効率境界 `V_τ^*` はランダム化/観察のいずれでも成立。
- 数値（Table 1 の RMSE、86%/70%/43%/87% の改善率）は PDF から抽出した確定値。ケーススタディの効果量の点推定値は本文で図示されており、正確な数値は本レポートでは取得できず（記載なし）。
- arXiv HTML 版（`/html/2203.08701`）は本調査時点で 404（別テンプレートが返る）。図の `<img>` URL は取得できなかったため埋め込みなし。
