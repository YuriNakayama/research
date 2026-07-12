# Pareto Optimal Proxy Metrics

- **Link**: https://arxiv.org/abs/2307.01000
- **Authors**: Alessandro Zito, Dylan Greaves, Jacopo Soriano, Lee Richardson
- **Year**: 2023（v1: 2023-07-03 / v2: 2025-02-19）
- **Venue**: 明示的な会議名は記載なし（arXiv）。著者は Google 系実験プラットフォーム
- **Type**: 方法論提案（多目的最適化）+ 産業レコメンドシステムでの実証

---

## Abstract (English)

> North star metrics and online experimentation play a central role in how technology companies improve their products. In many practical settings, however, evaluating experiments based on the north star metric directly can be difficult. The two most significant issues are 1) low sensitivity of the north star metric and 2) differences between the short-term and long-term impact on the north star metric. A common solution is to rely on proxy metrics rather than the north star in experiment evaluation and launch decisions. Existing literature on proxy metrics concentrates mainly on the estimation of the long-term impact from short-term experimental data. In this paper, instead, we focus on the trade-off between the estimation of the long-term impact and the sensitivity in the short term. In particular, we propose the Pareto optimal proxy metrics method, which simultaneously optimizes prediction accuracy and sensitivity. In addition, we give an efficient multi-objective optimization algorithm that outperforms standard methods. We applied our methodology to experiments from a large industrial recommendation system, and found proxy metrics that are eight times more sensitive than the north star and consistently moved in the same direction, increasing the velocity and the quality of the decisions to launch new features.

---

## Abstract（日本語訳）

north star 指標とオンライン実験は、テック企業が製品を改善するうえで中心的役割を果たす。しかし実務では north star 指標で実験を直接評価するのが難しいことが多い。最大の 2 つの問題は、1) north star 指標の感度の低さ、2) north star への短期インパクトと長期インパクトの差異、である。一般的な解決策は、実験評価とローンチ判断で north star ではなく proxy 指標に頼ることである。既存の proxy 研究は主に短期実験データからの長期インパクト推定に集中してきた。本論文は代わりに、長期インパクトの推定と短期の感度との**トレードオフ**に焦点を当てる。具体的には、予測精度と感度を同時に最適化する **Pareto optimal proxy metrics** 法を提案する。加えて、標準手法を上回る効率的な多目的最適化アルゴリズムを与える。大規模産業レコメンドシステムの実験に適用し、north star より **8 倍感度の高い** proxy 指標を見つけ、それらは一貫して同じ方向に動き、新機能ローンチ判断の速度と質を高めた。

---

## Overview

複数の補助指標を線形結合して proxy を作る際、「長期 north star との方向一致（directionality / correlation）」と「短期の感度（sensitivity）」は互いにトレードオフする。本論文はこれを **多目的最適化** として捉え、両目的の Pareto 前線（どちらか一方を犠牲にしないと他方を改善できない境界）を効率的に求める手法を提案する。感度をビンに区切って各ビン内で相関を最大化する制約付き最適化（DIRECT-L 使用）が、標準手法より Pareto 前線を良く近似する。産業データで north star の 8.5 倍感度・方向一致 recall 72%（north star 単体 40%）を達成。

---

## Problem（課題）

- north star（例: DAU）は感度が低く、短期実験で有意差が出にくい（type-II エラー多発）。
- north star の短期インパクトと長期インパクトが乖離する（surrogate paradox）。
- proxy を「長期予測精度」だけで選ぶと感度が犠牲になり、「感度」だけで選ぶと方向一致を失う。
- 両者は本質的にトレードオフだが、その Pareto 前線を効率的に探索する手法がなかった。

---

## Proposed Method（提案手法）

### コアアイデア

補助指標 $X_{\cdot,m}$ の重み付き線形結合 $Z(\omega)=\sum_m \omega_m X_{\cdot,m}$（$\sum\omega=1$）を proxy とし、二つの目的——(i) **sensitivity**（有意になる実験の割合 / 平均 |t 値|）と (ii) **correlation**（north star との方向一致）——を同時最大化する $\omega$ の Pareto 集合を求める。

### 手順

1. **proxy の定式化**: 補助指標の凸結合で合成 proxy $Z(\omega)$ を作る（Eq.1）。
2. **感度の測定**: Binary Sensitivity（有意割合, Eq.2）と Average Sensitivity（平均 |t|, Eq.3）を定義。
3. **方向一致の測定**: 合成 proxy と長期 north star の実験横断相関（Eq.5）。
4. **多目的最適化**: $\{BS(Z(\omega)),\ Cor(Z(\omega))\}$ を同時最大化する Pareto 集合を求める（Eq.7）。
5. **効率的アルゴリズム**: 感度を $B$ 個のビンに離散化し、各ビンで相関を最大化する制約付き最適化（Eq.8, DIRECT-L）で Pareto 前線を高速探索。

### Key Formulas

合成 proxy（Eq.1）:

$$Z_{i,j}(\omega)=\sum_{m=1}^{M}\omega_m X_{i,j,m},\qquad \sum_m\omega_m=1,\ \omega_m\ge 0$$

Binary Sensitivity（Eq.2）:

$$BS(\bar X_{\cdot,m})=\frac{1}{J}\sum_{j=1}^{J}\mathbb{1}\big(|t_{j,m}|>\tau_{\alpha,N-1}\big)$$

Average Sensitivity（Eq.3）:

$$AS(\bar X_{\cdot,m})=\frac{1}{J}\sum_{j=1}^{J}|t_{j,m}|$$

Correlation（Eq.5）:

$$Cor(\bar X_{\cdot,m})=\frac{\sum_j(\bar Y_j-\bar Y)(\bar X_{j,m}-\bar X)}{\sqrt{\sum_j(\bar Y_j-\bar Y)^2\ \sum_j(\bar X_{j,m}-\bar X)^2}}$$

多目的最適化（Eq.7）:

$$\omega^*=\arg\max_{\omega}\ \big\{BS(\bar Z_\cdot(\omega)),\ Cor(\bar Z_\cdot(\omega))\big\}$$

ビン制約付き最適化（Eq.8）:

$$\omega^*_b=\arg\max_{\omega:\ BS(\bar Z_\cdot(\omega))\in[u_b,u_{b+1})}\ Cor(\bar Z_\cdot(\omega))$$

---

## Algorithm（擬似コード）

```
# Algorithm 1: Randomized Search（ベースライン）
Pareto <- {}
repeat R 回:
    omega <- Uniform([0,1]^M) を正規化
    (bs, cor) <- (BS(Z(omega)), Cor(Z(omega)))
    Pareto <- 非劣解のみ更新
return Pareto

# Algorithm 2: Constrained Optimization via Binning（提案・効率的）
感度レンジを B ビン [u_b, u_{b+1}) に分割
for b in 1..B:
    omega*_b <- argmax_{omega : BS(Z(omega)) ∈ bin_b} Cor(Z(omega))   # Eq.8
               （DIRECT-L, nlopt で解く）
    Pareto <- Pareto ∪ {omega*_b}
return Pareto
```

---

## Architecture / Process Flow

```
補助指標 X_{·,1..M}
        │  凸結合 ω  (Σω=1)
        ▼
 合成 proxy Z(ω)
        ├───────────► Sensitivity 軸 (BS / AS)   Eq.2,3
        └───────────► Correlation 軸 (方向一致)   Eq.5
                          │
                          ▼
        多目的最適化 (感度ビン × 相関最大化)  Eq.7,8  [DIRECT-L]
                          │
                          ▼
              Pareto 前線（感度 vs 方向一致）
                          │
                          ▼
        運用点の選択 → ローンチ判断（8.5×感度, recall 72%）
```

---

## Figures & Tables（必須セクション）

> 本論文は arXiv HTML に画像が存在し、`extracted/6215300/img/` 配下の PNG を確認済み。以下に確認できた src を埋め込む（バージョン v2 パスを使用）。

### 表1: 主要結果（本文記載値）

| 指標 | 提案 Pareto proxy | 短期 north star | 備考 |
|------|-------------------|-----------------|------|
| Sensitivity | **8.5×** | 1×（基準） | north star 比の感度倍率 |
| Recall（north star が有意な時に proxy も有意） | **72%** | 40% | 方向一致の捕捉率 |
| Precision | 100% | 100% | 方向不一致（逆符号）なし |
| Proxy Score | ベースライン比 **+50%** | — | 総合スコア |
| 逆方向への動き | <1% の実験 | — | surrogate paradox 稀 |

### 表2: アルゴリズム比較（Figure 5 の要約）

| アルゴリズム | 特徴 | AUPF（Pareto 前線下面積） |
|--------------|------|----------------------------|
| Randomized Search | 単純だが高次元で非効率 | 低め |
| Kriging | 小 M で高速だが計算コスト大 | 中 |
| Constrained Optimization（提案, ビン+DIRECT-L） | 速度と精度の最良バランス、M=15 で最良 AUPF | 最良 |

### 図: sensitivity–correlation トレードオフ

![Sensitivity vs correlation trade-off scatter across ~70 metrics and 300+ experiments](https://arxiv.org/html/2307.01000v2/extracted/6215300/img/sensitivity_corr_tradeoff.png)

70 指標・300+ 実験にわたる感度と相関の散布図。両目的が互いにトレードオフする様子を示す。

### 図: Pareto 前線

![Pareto front visualization with dominated points](https://arxiv.org/html/2307.01000v2/extracted/6215300/img/pareto_front_figure.png)

Pareto 前線と劣解（dominated points）の可視化。

### 図: アルゴリズム性能比較（AUPF と実行時間）

![Algorithm performance with Area Under Pareto Front](https://arxiv.org/html/2307.01000v2/extracted/6215300/img/alg_perf_with_area.png)

各アルゴリズムの AUPF スコアと runtime 比較。提案の制約付き最適化が最良バランス。

### 図: Pareto 前線に沿った重み係数

![Weight coefficients along the Pareto front](https://arxiv.org/html/2307.01000v2/extracted/6215300/img/coefficient_by_objective.png)

Pareto 前線上を移動すると、感度寄りか方向一致寄りかで各補助指標の重み $\omega_m$ がどう変化するかを示す。

### 図: proxy score の分割表

![Proxy score contingency table with nine outcome combinations](https://arxiv.org/html/2307.01000v2/extracted/6215300/img/proxy_score_3.png)

proxy と north star の {正有意 / 中立 / 負有意} × {同} の 9 通り分割表による proxy score の定義（付録A）。

（その他確認済み画像パス: `both_cases_v2.png`, `algorithm_compare.png`, `long_term_neutral.png`。同じ `https://arxiv.org/html/2307.01000v2/extracted/6215300/img/<name>` 形式でアクセス可能。）

---

## Experiments & Evaluation

### Setup

- **データ源**: 大規模産業レコメンドシステム。
- **学習セット**: 300 実験（各 30 日）。**評価セット**: 500+ 実験、6 か月間。
- **north star**: Daily Active Users（DAU）。**長期窓**: 最終 $T=7$ 日平均。
- 各実験に約 100 個の独立 cookie バケット。補助指標数 $M\in\{5,10,15\}$。

### Main Results

- 発見された Pareto proxy は north star の **8.5 倍感度**。
- north star が有意なケースで proxy も有意だった割合（recall）**72%**（north star 単体 40%）。
- precision 100%（逆符号の不一致なし）、逆方向の動きは実験の <1%。
- proxy score はベースライン比 +50%。

### Ablation

- アルゴリズム比較（Figure 5）: 制約付き最適化が M=15 で最良 AUPF。Kriging は小 M で高速だが計算コスト大。
- north star が中立（有意でない）ときの proxy の挙動を確認（Figure 6, `long_term_neutral.png`）。

---

## 本テーマへの適用可能性

本テーマ（低頻度マーケ施策で uplift 推定、類似施策プール、実験間隔短縮）に対し、本論文は「感度と長期整合のトレードオフを明示的に扱う」点で強力。

1. **実験間隔の短縮（感度 8.5× の効果）**: north star（例: 60日継続率）が感度不足で短期に有意差を出せない状況で、Pareto proxy は 8.5 倍感度を持つため、同じ効果をはるかに短い観測窓・小さいサンプルで検出できる。recall 72%（vs 40%）は「本来 launch すべき施策を、短期でより多く正しく拾える」ことを意味し、低頻度施策の判断待ち時間を短縮する。

2. **類似施策のプール**: 学習セット（300 実験）から補助指標の感度・方向一致を推定する枠組みは、過去の類似クーポン/メール施策を束ねて「この施策群に最適な合成 proxy」を作る発想に直結する。施策群でプールすることで、単一施策では見えない sensitivity–correlation トレードオフを推定でき、実効データ密度が上がる。

3. **運用点の選択自由度**: Pareto 前線は「どれだけ感度を取り、どれだけ方向一致を取るか」の選択肢を提示する。低頻度・高リスク施策では方向一致寄り（誤採用回避）、探索的施策では感度寄り（高速スクリーニング）と、施策の性質に応じて運用点を切り替えられる。これは off-policy 評価で「攻めるか守るか」を明示的に制御する手段になる。

4. **surrogate paradox 抑制**: 逆方向の動き <1%・precision 100% は、感度を上げても方向一致を犠牲にしない proxy を選べることを保証する。短期で有意に見える施策が長期で裏目に出るリスクを構造的に抑える。

---

## Notes

- 姉妹論文 2309.07893（Choosing a Proxy Metric）と同じ Google 系著者（Soriano, Richardson）。本作は sensitivity–correlation の多目的トレードオフ、2309 は alignment 最大化 + サンプルサイズ適応、と補完関係。
- 会議名は arXiv 上に明示なし。
- 画像は arXiv HTML v2 で実在確認済み（`extracted/6215300/img/` 配下）。埋め込み URL は確認できたパスのみ使用。
- 感度指標として Binary（有意割合）と Average（平均 |t|）の 2 系統を使い分ける点が実務的。
