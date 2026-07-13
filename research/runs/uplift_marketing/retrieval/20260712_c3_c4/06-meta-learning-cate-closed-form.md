# Meta-learning for heterogeneous treatment effect estimation with closed-form solvers

- **Link**: https://arxiv.org/abs/2305.11353 / [Machine Learning (Springer) 113(9):6093-6114, 2024](https://link.springer.com/article/10.1007/s10994-024-06546-7)
- **Authors**: Tomoharu Iwata, Yoichi Chikahara (NTT Communication Science Laboratories)
- **Year**: 2023 (arXiv v1: 2023-05-19) / ジャーナル掲載 2024
- **Venue**: Machine Learning (Springer), vol. 113(9), pp. 6093-6114, 2024 / arXiv preprint (stat.ML, cs.AI, cs.LG)
- **Type**: 学術論文（ジャーナル / メタ学習 × 因果推論 / CATE 推定）

---

## Abstract (English, verbatim)

> This article proposes a meta-learning method for estimating the conditional average treatment effect (CATE) from a few observational data. The proposed method learns how to estimate CATEs from multiple tasks and uses the knowledge for unseen tasks. In the proposed method, based on the meta-learner framework, we decompose the CATE estimation problem into sub-problems. For each sub-problem, we formulate our estimation models using neural networks with task-shared and task-specific parameters. With our formulation, we can obtain optimal task-specific parameters in a closed form that are differentiable with respect to task-shared parameters, making it possible to perform effective meta-learning. The task-shared parameters are trained such that the expected CATE estimation performance in few-shot settings is improved by minimizing the difference between a CATE estimated with a large amount of data and one estimated with just a few data. Our experimental results demonstrate that our method outperforms the existing meta-learning approaches and CATE estimation methods.

## Abstract（日本語訳）

本論文は、少数の観測データから条件付き平均処置効果（CATE）を推定するためのメタ学習手法を提案する。提案手法は複数のタスクから CATE の推定方法を学習し、その知識を未知タスクに転用する。meta-learner フレームワーク（T/X/DR-Learner 等の分解型 CATE 推定枠組み）に基づき、CATE 推定問題をサブ問題に分解する。各サブ問題について、タスク共有パラメータとタスク固有パラメータを持つニューラルネットワークで推定モデルを定式化する。この定式化により、タスク固有パラメータの最適値を**閉形式（closed form）**で、かつタスク共有パラメータについて**微分可能**な形で得ることができ、効果的なメタ学習が可能になる。タスク共有パラメータは、「大量データで推定した CATE」と「少数データで推定した CATE」の差を最小化することで、few-shot 設定での期待 CATE 推定性能が向上するように学習される。実験により、提案手法が既存のメタ学習手法および CATE 推定手法を上回ることを示す。

---

## Overview

医療・広告・教育などで重要な「個人ごとに異質な処置効果（heterogeneous treatment effect）」を測るには CATE を推定する必要があるが、既存の機械学習ベース手法は**大量の観測データ**を要求する。現実には小規模な病院や小さなキャンペーンのように、各タスクのデータ量が極端に少ない場面が多い。

本論文は、この「データが少ないタスクでの CATE 推定」を**メタ学習（learning to learn）**で解く。多数の meta-training タスク（各タスク＝ある処置に関する CATE 推定タスク）から共有知識を抽出し、未知タスクに**少数のサポートデータ（support set）だけで適応**する。

技術的核心は 2 点：
1. **微分可能な閉形式ソルバ**：meta-learner（DR-Learner 等）の各サブ問題を、prototypical network（傾向スコア）＋ ridge 回帰型の線形最終層（アウトカム・擬似アウトカム）で定式化し、タスク固有パラメータを閉形式で解く。これにより通常の bi-level 最適化（内側で勾配降下を反復）を回避し、単一レベル最適化として効率的に解ける。
2. **pseudo CATE を教師信号に用いる**：真の CATE は反実仮想のため観測不能。そこで各 meta-training タスクの**大量データで推定した CATE を pseudo CATE（擬似ラベル）**とし、「少数データ推定 CATE」がそれに近づくよう学習する。これにより CATE 推定性能そのものを直接最適化する。

## Problem（本論文が解く課題）

- CATE 推定には大量観測データが必要だが、小病院・小規模施策など各タスクのデータは極端に少ない。
- 各タスクは母集団（特徴分布・アウトカム・処置選好）が異なり、単純に他タスクのデータを混ぜられない。
- **課題1（計算量）**：メタ学習の bi-level 最適化は、外側の各反復ごとに内側最適化（タスク適応）を反復勾配降下で解く必要があり計算コストが高い。
- **課題2（教師信号の欠如）**：既存メタ学習を素朴に適用すると損失計算に真の CATE が必要だが、2 つの潜在アウトカム $Y(0), Y(1)$ は同時観測できず（因果推論の基本問題）、真の CATE ラベルが得られない。
- transfer learning は source/target の 2 タスク前提、multi-task learning は few-shot を想定せず、いずれも訓練時に対象タスクデータを要求するため、少数データの未知タスクには適用不可。

## Proposed Method

**コアアイデア**：meta-learner の分解型 CATE 推定（DR-Learner）を、各サブ問題が閉形式で解けるモデルで定式化し、pseudo CATE を教師にタスク共有エンコーダをメタ学習する。

### 問題設定

- 二値処置 $A\in\{0,1\}$、連続アウトカム $Y\in\mathbb{R}$、特徴 $X$。CATE は strong ignorability・positivity の下で
$$ \mathbb{E}^{(t)}[Y(1)-Y(0)\mid X=x] = \mathbb{E}^{(t)}[Y\mid X=x, A=1] - \mathbb{E}^{(t)}[Y\mid X=x, A=0]. $$
- meta-training で $T$ 個のタスク $\mathcal{D}_t=\{(x_{tn}, y_{tn}, a_{tn})\}_{n=1}^{N_t}$ を与える。各タスクから小さな **support set** $\mathcal{S}$（適応用）と **query set** $\mathcal{Q}$（評価用）をサンプル。
- meta-test タスクでは少数の観測データのみを support set として用い、未知タスクへ適応する。

### 手順（番号付き）

1. **pseudo CATE の準備**：各 meta-training タスク $t$ で、大量データ $\mathcal{D}_t$ に CATE モデル（本実験では RA-Learner）を当てはめ、擬似ラベル $\{\tilde\tau_{tn}\}_{n=1}^{N_t}$ を得る。
2. **傾向スコアモデルの適応（閉形式）**：prototypical network で定式化し、タスク固有平均ベクトルをサポートインスタンスの符号化ベクトル平均として閉形式で得る。
3. **アウトカムモデル $\mu_a$ の適応（閉形式）**：タスク共有エンコーダ＋タスク固有線形最終層。MSE ＋ $\ell_2$ 正則化により ridge 回帰の閉形式解。
4. **pseudo outcome の計算**：DR-Learner の擬似アウトカム式で support 各点の $\tilde y_n^s$ を計算。
5. **擬似アウトカム回帰モデル $\gamma$ の適応（閉形式）**：$\{(x_n^s,\tilde y_n^s)\}$ に ridge 回帰の閉形式解でタスク固有パラメータを得る。
6. **CATE 損失の逆伝播**：query set 上で pseudo CATE と推定 CATE の差（CATE loss）を計算し、タスク共有パラメータ（エンコーダ・正則化係数）を SGD で更新。

### Key Formulas

タスク共有 $\theta$・タスク固有 $\phi^{(t)}$ による CATE 推定：
$$ \tau(x;\phi_y^{(t)},\theta_y) \approx \mathbb{E}^{(t)}[Y(1)-Y(0)\mid X=x]. $$

傾向スコア（prototypical network, Eq.9）と、その閉形式タスク固有解（Eq.10）：
$$ \pi(x;\phi_p,\theta_p) = \frac{\exp(-\lVert f_p(x;\theta_p)-\phi_{p1}\rVert^2)}{\sum_{a'=0}^{1}\exp(-\lVert f_p(x;\theta_p)-\phi_{pa'}\rVert^2)}, \qquad \hat\phi_{pa}^{(t)} = \frac{1}{N^s_a}\sum_{x\in\mathcal{S}_a} f_p(x;\theta_p). $$

線形最終層のアウトカム／擬似アウトカムモデルとその ridge 閉形式解（Eq.11-14）：
$$ \mu_a(x)=\phi_a^\top f_a(x;\theta_a), \quad \gamma(x)=\phi_y^\top f_y(x;\theta_y), $$
$$ \hat\phi_a^{(t)} = (Z_a^{s\top} Z_a^s + \lambda_a I)^{-1} Z_a^{s\top} y_a^s, \qquad \hat\phi_y^{(t)} = (Z_y^{s\top} Z_y^s + \lambda_y I)^{-1} Z_y^{s\top} \tilde y^s. $$

DR-Learner の擬似アウトカム（Eq.7）：
$$ \tilde y_n^s = \left(\frac{a_n^s}{\pi(x_n^s)} - \frac{1-a_n^s}{1-\pi(x_n^s)}\right) y_n^s + \left[\left(1-\frac{a_n^s}{\pi(x_n^s)}\right)\mu_1(x_n^s) - \left(1-\frac{1-a_n^s}{1-\pi(x_n^s)}\right)\mu_0(x_n^s)\right]. $$

メタ学習の目的関数（Eq.15-16）：pseudo CATE $\tilde\tau$ と適応後推定 $\tau$ の query 上二乗誤差を、タスク・サポート／クエリについて期待最小化：
$$ \hat\theta = \arg\min_\theta \; \mathbb{E}_t\, \mathbb{E}_{(\mathcal{S},\mathcal{Q})\sim\mathcal{D}_t}\big[\ell(\mathcal{S},\mathcal{Q},\theta)\big], \qquad \ell = \sum_{(x_n^q,\tilde\tau_n^q)\in\mathcal{Q}} \lVert \tilde\tau_n^q - \tau(x_n^q;\hat\phi_y^{(t)},\theta)\rVert^2. $$

中間・内側最適化が閉形式で微分可能なため、本来の tri-level 最適化は単一レベル最適化として SGD で解ける。

## Algorithm（擬似コード）

```
Algorithm 1  Meta-learning procedure
Input : meta-training data {D_t}_{t=1..T}, support sizes N^s_0,N^s_1, query sizes N^q_0,N^q_1
Output: trained task-shared parameters θ

1: for each task t = 1..T do
2:     Estimate pseudo CATEs {τ̃_tn}_{n=1..N_t} using large data D_t   # 本実験は RA-Learner
3: end for
4: Initialize task-shared parameters θ
5: while end condition not satisfied do
6:     Randomly select task t from {1..T}
7:     for each treatment a = 0,1 do
8:         Sample N^s_a support / N^q_a query instances with treatment a from D_t
9:     end for
10:    Build S = S_0 ∪ S_1,  Q = Q_0 ∪ Q_1
11:    Compute task-specific params for propensity & outcome models  (Eq.10, 13)  # closed form
12:    Compute pseudo outcomes for each support instance             (Eq.7)
13:    Compute task-specific params for pseudo-outcome model          (Eq.14)  # closed form
14:    Compute CATE loss ℓ                                            (Eq.16)
15:    Update θ via stochastic gradient method
16: end while
```

計算量：傾向スコア閉形式は $O(N^s)$、アウトカム／擬似アウトカムは行列逆行列で $O(K_a^3),O(K_y^3)$（Woodbury 公式で $O(N^{s3})$ に低減可能）。

## Architecture / Process Flow

```
[Meta-training data D_t (large)] --(RA-Learner)--> pseudo CATE τ̃  ... 教師信号
        |
        |  sample per treatment a∈{0,1}
        v
  Support set S ------------------+------------------ Query set Q
        |                         |                        |
  shared encoders f_p,f_0,f_1     |                  shared encoder f_y
        |  (closed-form adapt)    |                        |
   π(x)  μ_0(x)  μ_1(x)  <-- Eq.10,13 (task-specific φ)     |
        |                         |                        |
        +--> pseudo outcome ỹ^s (Eq.7)                      |
                    |                                       |
             closed-form ridge (Eq.14) --> φ_y^(t)          |
                    |                                       |
                    +------> CATE τ(x_q; φ_y^(t), θ) <------+
                                    |
                    CATE loss ℓ = ||τ̃_q - τ||^2  (Eq.16)
                                    |
                    backprop --> update task-shared θ (SGD)
```

## Figures & Tables

論文本体は PDF レンダリングであり、arXiv HTML 版（`arxiv.org/html/2305.11353`）は 404 で取得不能だったため、埋め込み可能な図画像 URL は確認できていない。以下は PDF から抽出した数値・キャプションを表として再構成したもの（画像 URL は未確認のため埋め込まない）。

### Table 1: 平均 PEHE（± 標準誤差）主要結果

CATE 推定精度の主指標 PEHE（precision in estimation of heterogeneous effect, 小さいほど良い）。30 回の分割平均。太字は各データセットの最良手法と 5% 有意差なし（提案手法 = Ours が全ケースで最良）。

**(a) Synth（100 タスク, 25 次元特徴）**

| 手法 | Ns=6 | Ns=10 | Ns=14 |
|---|---|---|---|
| **Ours** | **4.941 ±0.133** | **4.826 ±0.121** | **4.736 ±0.128** |
| DR-CFS | 5.767 ±0.165 | 6.246 ±0.155 | 6.547 ±0.179 |
| DR-ML (MAML) | 5.311 ±0.160 | 5.322 ±0.157 | 5.318 ±0.158 |
| Meta-CI | 5.295 ±0.161 | 5.302 ±0.158 | 5.304 ±0.158 |
| MT (multi-task) | 11.463 ±0.391 | 13.922 ±0.400 | 16.143 ±0.508 |
| TL | 11.738 ±0.383 | 11.643 ±0.332 | 12.710 ±0.284 |
| SL | 5.001 ±0.142 | 4.879 ±0.123 | 4.878 ±0.130 |
| XL | 11.001 ±0.374 | 10.065 ±0.355 | 10.355 ±0.286 |
| DRL | 175.808 ±30.994 | 348.802 ±59.052 | 2942.049 ±1494.359 |
| CF | 13.470 ±0.572 | 9.735 ±0.516 | 7.941 ±0.310 |
| Mean | 5.580 ±0.193 | 5.535 ±0.184 | 5.469 ±0.171 |

**(b) IHDP（747 幼児, 25 特徴, 100 シミュレーション=100 タスク）**

| 手法 | Ns=6 | Ns=10 | Ns=14 |
|---|---|---|---|
| **Ours** | **1.356 ±0.026** | **1.255 ±0.028** | **1.205 ±0.025** |
| DR-CFS | 2.907 ±0.095 | 3.204 ±0.088 | 3.460 ±0.089 |
| DR-ML (MAML) | 2.731 ±0.050 | 2.720 ±0.050 | 2.714 ±0.048 |
| Meta-CI | 2.783 ±0.044 | 2.765 ±0.044 | 2.761 ±0.044 |
| MT | 4.134 ±0.109 | 4.788 ±0.132 | 5.500 ±0.413 |
| TL | 3.026 ±0.105 | 3.373 ±0.109 | 3.695 ±0.101 |
| SL | 3.460 ±0.103 | 2.303 ±0.072 | 1.981 ±0.063 |
| XL | 2.563 ±0.068 | 2.738 ±0.081 | 3.035 ±0.088 |
| DRL | 207.866 ±34.684 | 409.598 ±100.264 | 745.870 ±173.200 |
| CF | 3.193 ±0.146 | 2.028 ±0.094 | 1.743 ±0.066 |
| Mean | 2.747 ±0.050 | 2.737 ±0.048 | 2.716 ±0.046 |

**所見**：提案手法は全ケースで最良。DR-CFS（同アーキテクチャだが分類・回帰損失で学習）を上回り、pseudo CATE で CATE 性能を直接最適化することの有効性を示す。DRL（単タスク DR-Learner）はデータ希少下で逆傾向スコアが不安定化し PEHE が桁違いに悪化。

### Table 2: meta-learner の選択（DR / RA / Plugin）アブレーション

提案の閉形式ソルバは DR-Learner 以外でも成立。太字は 5% 有意差なし。

**(a) Synth**

| variant | Ns=6 | Ns=10 | Ns=14 |
|---|---|---|---|
| w/ DR | **4.941 ±0.133** | **4.826 ±0.121** | **4.736 ±0.128** |
| w/ RA | **4.950 ±0.141** | **4.804 ±0.124** | **4.673 ±0.129** |
| w/ Plugin | **4.939 ±0.135** | **4.787 ±0.122** | **4.714 ±0.135** |

**(b) IHDP**

| variant | Ns=6 | Ns=10 | Ns=14 |
|---|---|---|---|
| w/ DR | **1.356 ±0.026** | **1.255 ±0.028** | **1.205 ±0.025** |
| w/ RA | 1.462 ±0.033 | **1.279 ±0.028** | **1.185 ±0.030** |
| w/ Plugin | 1.532 ±0.039 | 1.312 ±0.036 | **1.205 ±0.029** |

多くのケースで同等だが、IHDP の Ns=6（最も希少）では DR-Learner が優位。

### Table 3: タスク適応の Linear vs Gaussian Process アブレーション

| データ | variant | Ns=6 | Ns=10 | Ns=14 |
|---|---|---|---|---|
| Synth | Linear | **4.941 ±0.133** | **4.826 ±0.121** | **4.736 ±0.128** |
| Synth | GP | 5.102 ±0.160 | **4.888 ±0.163** | **4.730 ±0.132** |
| IHDP | Linear | **1.356 ±0.026** | **1.255 ±0.028** | **1.205 ±0.025** |
| IHDP | GP | **1.335 ±0.029** | **1.284 ±0.042** | **1.213 ±0.030** |

GP（非線形カーネル）でも線形と同等の閉形式適応が可能。

### Table 4: メタ学習の計算時間（秒, Ns=6）

| データ | Ours | DR-CFS | DR-ML | Meta-CI |
|---|---|---|---|---|
| Synth | 1402.7 | 1454.6 | 2009.5 | 2634.1 |
| IHDP | 442.3 | 489.9 | 1003.8 | 1751.9 |

**所見**：閉形式ソルバ勢（Ours, DR-CFS）は反復最適化勢（DR-ML, Meta-CI, MAML の 5 内側 epoch）より大幅に高速。IHDP で Meta-CI 比 約 4 倍高速（442.3 vs 1751.9）。

### 図（画像 URL 未確認・キャプションのみ）

- **Figure 1**：問題設定図。meta-training フェーズで複数タスクの大量データからメタ学習し、meta-test フェーズで未知タスクの少数 support set で適応して CATE を推定。
- **Figure 2**：メタ学習フレームワーク全体図（pseudo CATE 準備 → support/query サンプル → 傾向スコア/アウトカム閉形式適応 → pseudo outcome 計算 → CATE 損失逆伝播の 6 ステップ、赤/緑/紫/青矢印で表現）。
- **Figure 3**：meta-training タスク数を増やしたときの PEHE（Ns=6）。Synth は約 20→60 タスクで概ね単調改善、IHDP も同様。タスク数増加が精度に critical。
- **Figure 4**：1 タスクあたりインスタンス数を増やしたときの PEHE（Ns=6）。Synth は 2000→10000、IHDP は 300→700 でサンプル増に伴い精度向上。

## Experiments & Evaluation

### Setup

- **データセット**：Synth（Curth & van der Schaar 2021 の setting (ii)、100 タスク、25 次元特徴、confounder $x_c$/outcome 影響 $x_o$/$Y(1)$ 影響 $x_\delta$ を各 5 次元、タスク固有パラメータで異質化）と IHDP（747 幼児・139 処置/608 対照・25 特徴、Hill 2011 setting B、100 シミュレーション=100 タスク）。
- **分割**：タスクを 70% meta-train / 10% meta-val / 20% meta-test にランダム分割。
- **few-shot 設定**：$N_s\in\{6,10,14\}$（処置/対照を同数）、query $N_q=40$。meta-training の全データ量は $N_t\in\{747,10000\}$。
- **エンコーダ**：3 層 FFN（隠れ・出力 32 ユニット、$f_0,f_1$ はパラメータ共有）。Adam（lr $10^{-3}$）、バッチ 32 タスク、最大 5000 epoch、early stopping。pseudo CATE は RA-Learner（NN base learner）で推定。単タスク系 baseline は EconML（線形回帰 base learner）。
- **評価指標**：PEHE（真値と推定 CATE の二乗誤差）、30 回平均。
- **比較手法**：メタ学習系（Ours, DR-CFS, DR-ML(MAML), Meta-CI）、multi-task（MT）、単タスク系（TL, SL, XL, DRL, CF, Mean）。

### Main Results（具体値）

- 提案手法は Synth・IHDP の全 $N_s$ で最良 PEHE（Synth Ns=6: 4.941、IHDP Ns=6: 1.356）。
- 最強 baseline との比較：IHDP Ns=6 で XL 2.563、DR-ML 2.731 に対し Ours 1.356（約半減）。Synth では SL が善戦（4.878-5.001）するが Ours がなお上回る。
- 単タスク DR-Learner（DRL）は逆傾向スコアの不安定性でデータ希少下では PEHE が 175〜2942 と破綻。提案手法は傾向スコアをメタ学習することでこの不安定性を回避。
- MT（multi-task）は few-shot に不向きで PEHE が高い（Synth Ns=14 で 16.143）。

### Ablation

- **meta-learner 選択**（Table 2）：DR/RA/Plugin いずれでも良好。IHDP の最希少 Ns=6 では DR が優位。
- **タスク適応の非線形化**（Table 3）：Linear と GP は同等。GP でも閉形式適応が成立。
- **タスク数・サンプル数**（Fig.3,4）：どちらも増やすほど PEHE 改善。特にメタ学習タスク数の増加が精度に critical。
- **計算効率**（Table 4）：閉形式ソルバは反復最適化より数倍高速。

## 本テーマへの適用可能性

本テーマは「稀にしか実施しない販促キャンペーン（クーポン・メール等）で、対象ユーザーや施策内容が毎回異なり、1 回あたりのデータが薄い。似たキャンペーン／ユーザーをグループ化して密なデータを合成し、実質的な実験間隔を短縮して uplift モデリング／off-policy 評価に使いたい」というもの。本論文の枠組みはこの課題にほぼ 1:1 で対応する。

- **「1 キャンペーン = 1 タスク」への写像**：論文の「1 病院 = 1 タスク」を「1 キャンペーン（=特定クーポン/メール施策）= 1 CATE 推定タスク」と読み替えれば、そのまま適用できる。処置 $A$＝クーポン付与有無、アウトカム $Y$＝購買額/CV、特徴 $X$＝ユーザー属性。各キャンペーンが母集団・処置選好の異なるタスクとなり、まさに本手法の想定する設定。

- **「グループ化して密なデータを合成」を明示的に実現**：ユーザーが望む「似たキャンペーン/ユーザーをまとめて密なデータにする」ことは、本手法では**タスク共有エンコーダ**が担う。エンコーダは全キャンペーンで共有され、タスク間で共通する uplift の構造（どの属性が反応しやすいか等）を学習する。個別キャンペーン固有の差はタスク固有パラメータ（$\phi_p,\phi_a,\phi_y$）が閉形式で吸収する。すなわち「明示的にデータを合成する」のではなく、**共有表現を通じて過去全キャンペーンから strength を借り（borrow strength）**、実効的なデータ密度を高める。

- **新規・希少キャンペーンへの即時適応**：新しいクーポン施策を打った直後、手元に $N_s\approx 6$〜$14$ 件程度の反応データしかなくても、meta-train 済みモデルに support set として与えるだけで CATE（=uplift）を推定できる。閉形式解なので**再学習不要・数式評価のみ**で適応が完了し、キャンペーン投入から uplift 推定までの「実効実験間隔」を大幅短縮できる。IHDP の結果（Ns=6 で PEHE 1.356、単タスク手法の約半分）は、この極少データ適応の有効性を裏付ける。

- **off-policy 評価との親和性**：DR-Learner ベースの擬似アウトカム（doubly-robust）を用いるため、傾向スコアかアウトカムどちらか正しければ不偏。マーケでは配信ロジック（傾向スコア）が既知/推定可能なことが多く、DR 構成は off-policy 評価の分散低減にそのまま活きる。しかも傾向スコア自体をメタ学習で安定推定するため、単純な IPW/DR がデータ希少下で破綻する（論文の DRL が PEHE 2942 に発散）問題を回避できる。

- **pseudo CATE による「濃いキャンペーンで薄いキャンペーンを教える」**：過去に大規模に回した定番キャンペーン（データが厚い）に対しては RA/DR-Learner で信頼できる pseudo CATE を作れる。これを教師に、薄いキャンペーンでの推定がそれに近づくよう学習する仕組みは、「濃い施策の知見で薄い施策の推定を底上げする」という本テーマの狙いそのもの。

- **実装上の橋渡し**：EconML（本論文が baseline 実装に使用）で S/T/X/DR-Learner や causal forest は既に手に入る。本手法はその上に「タスク共有エンコーダ＋閉形式適応＋pseudo CATE 損失」を載せる PyTorch 実装（著者プロジェクトページにコードあり）で、既存 uplift パイプラインへの追加負担は限定的。

- **留意点**：(1) strong ignorability（未観測交絡なし）を各キャンペーンで仮定するため、配信対象選定に観測外の要因が強く効く場合は注意。(2) meta-train タスク数が精度に critical（Fig.3）なので、過去キャンペーン数がある程度（数十〜）蓄積されている必要がある。(3) support の処置/対照は非空が前提のため、各キャンペーンで両群に最低数件は必要。

## Notes

- ジャーナル版：Machine Learning (Springer), 113(9):6093-6114, 2024, DOI 10.1007/s10994-024-06546-7。arXiv v1（2023-05-19）を分析対象とした。
- コードは著者プロジェクトページ（http://www.kecl.ntt.co.jp/as/members/iwata/meta_cate.html）で公開。
- arXiv HTML 版（`arxiv.org/html/2305.11353`）は取得時 404。本レポートの数値・式・アルゴリズムは arXiv PDF から抽出したテキストに基づく。図の画像 URL は確認できなかったため埋め込んでいない（アンチハルシネーションのため）。
- 本手法は「meta-learner（分解型 CATE 推定）」と「meta-learning（learning to learn）」という同名の別概念を橋渡しする点が新規性の核。closed-form solver は Bertinetto et al. 2018（ridge）・Snell et al. 2017（prototypical network）を CATE の 2 段推定に初めて拡張。
- 数式の一部（Eq.7 の擬似アウトカム等）は PDF テキスト抽出で下付き/記号が崩れていたため、原論文の DR-Learner 定義（Kennedy 2020, Curth & van der Schaar 2021）に照らして整形した。厳密な符号・添字は原論文 Eq.(7)(9)-(14) を参照のこと。
