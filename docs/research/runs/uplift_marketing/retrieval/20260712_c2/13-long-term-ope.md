# Long-term Off-Policy Evaluation and Learning (LOPE)

- **Link**: https://arxiv.org/abs/2404.15691
- **Authors**: Yuta Saito, Himan Abdollahpouri, Jesse Anderton, Ben Carterette, Mounia Lalmas
- **Year**: 2024
- **Venue**: The Web Conference 2024 (WWW '24)
- **Type**: 研究論文（Off-Policy Evaluation / 長期効果推定）

---

## Abstract (English)

> Short- and long-term outcomes of an algorithm often differ, with damaging downstream effects. A known example is a click-bait algorithm, which may increase short-term clicks but damage long-term user engagement. A possible solution to estimate the long-term outcome is to run an online experiment or A/B test for the potential algorithms, but it takes months or even longer to observe the long-term outcomes of interest, making the algorithm selection process unacceptably slow. This work thus studies the problem of feasibly yet accurately estimating the long-term outcome of an algorithm using only historical and short-term experiment data. Existing approaches to this problem either need a restrictive assumption about the short-term outcomes called surrogacy or cannot effectively use short-term outcomes, which is inefficient. Therefore, we propose a new framework called Long-term Off-Policy Evaluation (LOPE), which is based on reward function decomposition. LOPE works under a more relaxed assumption than surrogacy and effectively leverages short-term rewards to substantially reduce the variance. Synthetic experiments show that LOPE outperforms existing approaches particularly when surrogacy is severely violated and the long-term reward is noisy. In addition, real-world experiments on large-scale A/B test data collected on a music streaming platform show that LOPE can estimate the long-term outcome of actual algorithms more accurately than existing feasible methods.

## Abstract (Japanese)

> アルゴリズムの短期成果と長期成果はしばしば乖離し、下流に悪影響を及ぼす。よく知られた例が click-bait アルゴリズムであり、短期のクリックは増やすが長期のユーザーエンゲージメントを損なう。長期成果を推定する一案は、候補アルゴリズムをオンライン実験（A/B テスト）で走らせることだが、目的となる長期成果の観測には数か月あるいはそれ以上を要し、アルゴリズム選定プロセスが許容できないほど遅くなる。本研究は、履歴データ（historical data）と短期実験データ（short-term experiment data）のみを用いて、アルゴリズムの長期成果を実行可能かつ正確に推定する問題を扱う。既存手法は、短期成果に対する surrogacy と呼ばれる強い仮定を必要とするか、あるいは短期成果を有効活用できず非効率であるかのいずれかである。そこで本研究は、報酬関数の分解（reward function decomposition）に基づく新フレームワーク **Long-term Off-Policy Evaluation (LOPE)** を提案する。LOPE は surrogacy よりも緩和された仮定の下で機能し、短期報酬を有効活用して分散を大幅に削減する。合成実験では、surrogacy が著しく破られ長期報酬がノイジーな場合に、LOPE が既存手法を上回ることを示す。さらに音楽ストリーミングプラットフォームで収集した大規模 A/B テストデータでの実世界実験により、LOPE が実運用アルゴリズムの長期成果を既存の実行可能手法より正確に推定できることを示す。

---

## Overview

本論文は **off-policy evaluation (OPE)** の枠組みを「長期成果（long-term outcome）」の推定に拡張する。中核となるのは、長期報酬の期待報酬関数 `q(x,a,s)` を「短期成果（surrogate）から予測できる部分 `g(x,s)`」と「行動そのものが長期に与える追加効果 `h(x,a,s)`」に分解し、前者は履歴データ上の importance weighting（重要度重み付け）で、後者は回帰で扱うという doubly-robust 型のアイデアである。これにより、従来 surrogate-based 手法が要求していた強い surrogacy 仮定（短期成果さえ一致すれば長期成果も一致する）を緩和しつつ、短期報酬の情報を分散削減に活用する。

LOPE は評価（evaluation）だけでなく、policy gradient を通じた学習（learning: LOPE-PG）へも拡張される。

---

## Problem

- アルゴリズムの**短期成果と長期成果が乖離**する（click-bait 例：短期クリック増・長期エンゲージメント減）。
- 長期成果を A/B テストで直接観測するには**数か月以上**かかり、アルゴリズム選定が致命的に遅い。
- 既存の surrogate-based 手法（例: LCI = Latent Confounder / surrogate index 系）は、**surrogacy 仮定**（短期成果が長期成果の十分統計量である）に依存し、これが破られると強くバイアスする。
- 一方、典型的な OPE は長期報酬を直接扱えるが、**短期成果を活用できず**、長期報酬がノイジーなとき分散が大きく非効率。
- 目標: **履歴データ + 短期実験データのみ**で、新方策（new policy）の長期成果を feasible かつ低バイアス・低分散に推定・最適化する。

---

## Proposed Method

### Core Idea

長期期待報酬関数を **surrogate effect** と **action effect** に分解する。

$$
q(x,a,s) = g(x,s) + h(x,a,s)
$$

- $g(x,s)$: **surrogate effect** — 文脈 $x$ と短期成果（surrogate）$s$ から予測できる長期報酬の成分。
- $h(x,a,s)$: **action effect** — 行動 $a$ が短期成果を超えて長期報酬に与える追加成分。

surrogacy が成り立つ極限では $h \equiv 0$ となり $g(x,s)$ だけで長期成果が決まる。LOPE はこれを仮定せず、$h$ を回帰で明示的に補正するため、より緩い仮定で不偏になる。

### Numbered Steps

1. 履歴データ $\mathcal{D}_H = \{(x_i, a_i, s_i, r_i)\}$（$r_i$ は長期報酬）を用意する。
2. 行動効果 $\hat{h}(x,a,s)$ を回帰で推定する（doubly-robust の regression 部分）。
3. **surrogate importance weight** $w(x,s) = \pi_1(s\mid x)/\pi_0(s\mid x)$ を推定する。これは短期成果 $s$ の周辺分布に対する重み比であり、$\pi_0(a\mid x,s)$ の回帰（$(x,s)\to a$ 予測）から導出する。
4. importance weighting 項（残差 $r_i - \hat{h}$ に重みを掛ける）と、回帰項 $\hat{h}(x_i, \pi_1)$ を足し合わせて LOPE 推定量を得る。
5. 学習に用いる場合は、この推定量の勾配を取って policy gradient（LOPE-PG）として方策 $\pi_\theta$ を直接最適化する。

### Key Formulas

報酬分解:
$$
q(x,a,s) = g(x,s) + h(x,a,s)
$$

LOPE 推定量:
$$
\hat{V}_{\text{LOPE}}(\pi_1; \mathcal{D}_H) = \frac{1}{n_H} \sum_{i=1}^{n_H} \left\{ \frac{\pi_1(s_i \mid x_i)}{\pi_0(s_i \mid x_i)} \bigl(r_i - \hat{h}(x_i, a_i, s_i)\bigr) + \hat{h}(x_i, \pi_1) \right\}
$$

surrogate importance weight（行動の周辺化）:
$$
w(x,s) = \mathbb{E}_{\pi_0(a \mid x,s)}\bigl[w(x,a)\bigr]
$$

分散削減の保証（Theorem 3.2 の核）:
$$
\mathbb{E}_{\pi_0(s \mid x)}\Bigl[\mathbb{V}_{\pi_0(a \mid x,s)}\bigl[w(x,a)\bigr]\Bigr] \ge 0
$$

（surrogate 周辺への重み集約が vanilla importance weighting の重み分散を上回らない = 分散が削減される。）

policy learning（勾配）:
$$
\nabla_\theta V(\pi_\theta) = \mathbb{E}_{\pi_\theta(a \mid x)}\bigl[q(x,a)\,\nabla_\theta \log \pi_\theta(a \mid x)\bigr]
$$

### Theoretical Guarantees

- **Theorem 3.1（不偏性）**: LOPE は次のいずれかが成り立てば不偏。
  1. surrogacy 仮定、または
  2. **conditional pairwise correctness (CPC)**: 相対的な報酬差 $h$ の推定が正しい。
     （＝ $\hat{h}$ が絶対値でなく相対差を正しく捉えれば十分、という緩い条件。）
- **Theorem 3.2（分散削減）**: 上式により、短期成果を活用した重みは vanilla importance weighting より分散が小さいことを保証。

---

## Algorithm (Pseudocode)

```
Input:  historical data D_H = {(x_i, a_i, s_i, r_i)}_{i=1..n_H}
        target policy pi_1 (or short-term experiment data for policy comparison)
        behavior policy pi_0

# --- Step 1: action-effect regression ---
Fit  h_hat(x, a, s)  by regressing long-term reward residual on (x, a, s)

# --- Step 2: surrogate importance weight ---
Fit  pi0_hat(a | x, s)     # predict action from (context, surrogate)
Derive w(x, s) = pi_1(s|x) / pi_0(s|x)   via marginalization over actions

# --- Step 3: LOPE point estimate ---
V_hat = 0
for i in 1..n_H:
    iw   = w(x_i, s_i)                       # surrogate importance weight
    corr = iw * (r_i - h_hat(x_i, a_i, s_i)) # bias-corrected IW term
    reg  = h_hat(x_i, pi_1)                  # regression (direct) term
    V_hat += corr + reg
V_hat /= n_H
return V_hat

# --- (optional) Step 4: policy learning LOPE-PG ---
for each SGD step:
    grad = gradient of V_hat_LOPE(pi_theta) w.r.t. theta
    theta <- theta + lr * grad
```

---

## Architecture / Process Flow

```
Historical data (baseline pi_0)        Short-term experiment data
   (x, a, s, r_long)                        (x, a, s)  [short-term only]
        |                                        |
        v                                        v
  +----------------------+          +---------------------------+
  | Reward decomposition |          | Surrogate importance      |
  | q = g(x,s) + h(x,a,s)|          | weight  w(x,s)            |
  +----------+-----------+          +-------------+-------------+
             |                                    |
     h_hat(x,a,s) regression         w = pi_1(s|x)/pi_0(s|x)
             |                                    |
             +------------------+-----------------+
                                v
              +-------------------------------------+
              |  LOPE estimator (doubly-robust)     |
              |  IW*(r - h_hat) + h_hat(x, pi_1)    |
              +------------------+------------------+
                                 |
                 +---------------+----------------+
                 v                                v
     Long-term OPE (evaluation)         LOPE-PG (policy learning)
     -> pick best algorithm             -> optimize pi_theta directly
```

---

## Figures & Tables

論文 HTML（arxiv.org/html/2404.15691v1）で実際に確認した図の画像 URL を以下に示す。

- 概念図（短期実験では逆転が観測されない例）: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section1/concept.png`
- surrogacy の説明図: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section2/surrogacy.png`
- 報酬分解の概念図: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section3/decomposition.png`
- 合成実験（データサイズ依存）: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section4/data-size.png`
- 合成実験（報酬ノイズ std 依存）: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section4/reward_std.png`
- 合成実験（方策差 eps 依存）: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section4/eps.png`
- 方策選択精度: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section4/selection.png`
- 方策学習（相対改善）: `https://arxiv.org/html/2404.15691v1/extracted/2404.15691v1/figs/section4/learning-relative.png`

### Table 1: 手法比較（Method Comparison）

| Method | Feasible（数か月待たない） | No Surrogacy（surrogacy 不要） | Uses Short-term（短期成果活用） | Learning Algo（学習に使える） |
|--------|:--:|:--:|:--:|:--:|
| Long-term Experiment（直接 A/B） | ✗ | ✔ | ✔ | ✗ |
| LCI（surrogate index 系） | ✔ | ✗ | ✔ | ✗ |
| Typical OPE（IPS / DR） | ✔ | ✔ | ✗ | ✔ |
| **LOPE（提案）** | **✔** | **✔** | **✔** | **✔** |

### Table 2: 実世界 A/B テスト結果（MSE, ×10⁻³, 低いほど良い）

音楽ストリーミングプラットフォームの大規模 A/B テストデータでの長期成果推定 MSE。括弧内は LOPE に対する相対的な悪化率（LOPE より何 % MSE が高いか）。

| Method | Policy #1 | Policy #2 | Policy #3 |
|--------|-----------|-----------|-----------|
| LCI | 8.316（+18.8%） | 9.566（+11.0%） | 6.476（+13.3%） |
| IPS | 8.474（+21.0%） | 9.735（+13.0%） | 6.614（+15.7%） |
| DR | 8.051（+15.0%） | 9.411（+9.2%） | 6.343（+10.9%） |
| **LOPE** | **6.999** | **8.615** | **5.715** |

LOPE が全 3 方策で最良。DR 比で約 **9.2%〜15.0%** の MSE 削減。
（実験規模: 約 4M ユーザー / 3 週間程度の A/B テストデータ。ユーザー数・期間の厳密値は本文記載に基づく概数。）

### Table 3: 合成実験・アブレーション（主要数値）

いずれも fetched HTML の要約から得た数値。単独の集計表ではなく複数図（Figure 5〜10 相当）に散在する結果を抜粋。

| 設定 | 比較 | LOPE の改善 |
|------|------|-------------|
| データサイズ n=200 | vs DR | MSE **36%** 削減 |
| データサイズ n=1,000 | vs LCI | MSE **71%** 削減 |
| 高報酬ノイズ σ_r=9.0 | vs DR | MSE **45%** 削減 |
| 方策選択精度 σ_r=9.0 | LOPE ≈85% vs DR ≈79% | 選択精度向上 |
| 方策選択精度 ε=0.5 | LOPE ≈65% vs OPE ≈55% | 選択精度向上 |
| 方策学習 LOPE-PG, n=500 | vs DR-PG | 約 **60%** 改善 |
| 方策学習 LOPE-PG, σ_r=9.0 | vs DR-PG | 約 **80%** 改善 |

（上記合成実験の各数値は WebFetch 要約に基づく。図中の正確なプロット値は原論文図を参照のこと。）

---

## Experiments & Evaluation

### Setup

- **合成実験（Synthetic）**: データサイズ $n$、surrogacy 破れ度 $\lambda$、報酬ノイズ $\sigma_r$、方策差 $\varepsilon$ を系統的に変化させ、MSE と方策選択精度を評価。比較対象は LCI、IPS、DR、および提案 LOPE / LOPE-PG。
- **実世界実験（Real-world）**: 音楽ストリーミングプラットフォームの大規模 A/B テストデータ（約 4M ユーザー、3 週間規模）。3 つの実運用方策（Policy #1〜#3）について長期成果推定の MSE を比較。

### Main Results（数値付き）

- 実世界（Table 2）: LOPE が全 3 方策で最小 MSE。Policy #1 = 6.999、#2 = 8.615、#3 = 5.715（×10⁻³）。DR 比で **9.2%〜15.0%**、IPS 比で最大 **21.0%**、LCI 比で最大 **18.8%** の MSE 削減。
- 合成: n=200 で DR 比 **36%**、n=1,000 で LCI 比 **71%** の MSE 削減。

### Ablation

- **surrogacy 破れ（λ 増大）**: LCI のバイアスは急増するが、LOPE はロバスト（$h$ 補正が効く）。
- **高報酬ノイズ（σ_r=9.0）**: LOPE は DR 比 **45%** MSE 削減。短期成果活用による分散削減が効く領域。
- **方策選択精度**: σ_r=9.0 で LOPE ≈85% vs DR ≈79%。ε=0.5 で LOPE ≈65% vs OPE ≈55%。
- **学習（LOPE-PG）**: n=500 で DR-PG 比 60%、σ_r=9.0 で 80% の改善。評価だけでなく最適化でも優位。

---

## 本テーマへの適用可能性

対象は「クーポン・メール等の**低頻度マーケティング施策**を運用するデータサイエンティストが、過去ログから新しいターゲティング/配信方策を**オフラインで評価（off-policy evaluation）**したい」というシナリオ。LOPE の要素は以下のように直接マッピングできる。

1. **長期成果 vs 短期成果の乖離への対処**
   - クーポン配布の短期成果（開封・即時利用）と長期成果（LTV・継続購買・解約率）はしばしば乖離する。まさに click-bait 問題のマーケティング版であり、LOPE が想定する状況そのもの。
   - LTV のような長期 KPI を A/B テストで直接待つと数か月かかるため、履歴ログ + 短期実験だけで長期効果を推定できる LOPE は施策サイクルの高速化に直結する。

2. **報酬分解の実務的な当てはめ**
   - $s$（surrogate）= 施策直後の短期反応（クーポン利用フラグ、1 週間以内の購買額、メール開封/クリック）。
   - $r$（long-term reward）= 90 日 LTV や継続率。
   - $g(x,s)$ で「短期反応から予測できる LTV」、$h(x,a,s)$ で「短期反応に現れない施策固有の長期効果（例: ブランド毀損・値引き依存の助長）」を分離できる。surrogacy を仮定しない点が重要で、短期反応が良くても長期で悪化する値引き施策を正しく捉えられる。

3. **off-policy 評価としての利用**
   - 過去の配布方策 $\pi_0$（誰にどのクーポンを送ったか）のログに対し、新ターゲティング方策 $\pi_1$ の長期成果を $\hat{V}_{\text{LOPE}}(\pi_1)$ で推定。IPS/DR より分散が小さく、低頻度施策で**サンプルが乏しく報酬がノイジー**な状況（σ_r 大の領域）で特に有利。

4. **低頻度・データ希少への相性**
   - キャンペーンが年数回など低頻度だと長期成果のサンプルが極端に少ない。LOPE は短期報酬で分散を削減するため、**少数サンプル領域（n=200 で DR 比 36% 改善）**での優位がそのまま効く。

5. **方策学習（LOPE-PG）による配布最適化**
   - 評価に留まらず、`∇_θ V(π_θ)` を使って「どの顧客にどのクーポンを送るか」の配布方策自体を長期 LTV 最大化方向へ直接学習できる。ターゲティングモデルの学習目的関数を短期 CV でなく推定長期成果にできる。

6. **本テーマの他要件との関係（留意点）**
   - **ranking / slate**: 本論文は単一行動 $a$（アルゴリズム/施策選択）を主対象とし、スレート・ランキング特有の組合せ構造は明示的に扱っていない。slate OPE（例: PBM / cascade / slate estimator 系）と組み合わせる余地があるが、本手法単体では slate は未カバー（要拡張）。
   - **non-stationary / 長期・非定常**: 「短期実験で観測されない長期トレンドの逆転」を推定する点で**時間的ドリフトへの一部対処**にはなるが、明示的な非定常モデリング（時間変化する報酬分布の逐次推定）は範囲外。
   - **campaign 間のデータ共有（pooling）**: 本手法は履歴データ全体を一括で使う枠組みで、複数キャンペーン横断のプーリングを直接は論じない。ただし $x$ にキャンペーン特徴を含めれば $g,h$ の回帰でキャンペーン間の情報共有を近似的に実現でき、pooling の受け皿にはなり得る。

総じて、**低頻度・長期 KPI・ノイジー報酬**という本テーマの中核課題に LOPE は強く適合する。一方で slate/ranking と明示的非定常はカバー外であり、それらは別系統の OPE 手法と組み合わせる前提で位置づけるのが妥当。

---

## Notes

- Table 2 の相対改善率は 2 回の WebFetch で数値表現に差があった。本レポートは、図の src と個別数値まで確認できた 3 回目取得の値（LCI +18.8% / IPS +21.0% / DR +15.0% など、Policy #1 基準）を採用した。DR 比のレンジ「9.2%〜15.0%」は全 3 方策にわたる最小〜最大の幅を指す。
- 合成実験の百分率（36% / 71% / 45% / 60% / 80% など）は WebFetch 要約由来であり、原論文図中のプロット値そのものは確認していない。厳密値が必要な場合は原論文の Figure を直接参照のこと。
- 実世界実験のユーザー数（約 4M）・期間（3 週間規模）は取得要約に基づく概数。正確な規模は本文記載を確認のこと。
- surrogate importance weight の推定 $\pi_0(a\mid x,s)$ の学習品質が推定精度に効くため、実務では短期成果 $s$ の設計（施策直後の適切な代理指標選定）が成否を分ける。
- 比較手法 LCI は surrogate index / latent confounder 系の代表として位置づけられている（本文の略称に準拠）。
- 数値が原文で確認できない箇所は本文中で明示（「概数」「要約由来」）とした。捏造した数値は含まない。
