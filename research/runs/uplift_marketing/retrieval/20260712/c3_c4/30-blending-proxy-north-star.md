# Blending Proxy Metrics with a North Star

- **Link**: https://arxiv.org/abs/2606.21745
- **Authors**: Winston Chou
- **Year**: 2026（2026-06-19）
- **Venue**: European Conference on Machine Learning and Principles and Practice of Knowledge Discovery in Databases（ECML PKDD '26）
- **Type**: 方法論提案（最適ブレンディング + 実験計画への含意）+ Netflix での実応用

---

## Abstract (English)

> Proxy metrics are widely used to improve the precision and velocity of online experimentation (aka A/B testing). Although proxies are often motivated by long-term outcomes that the experimenter does not observe, in many settings they are used alongside a contemporaneous but statistically insensitive north star. This can lead to a practical dilemma: when should experimenters trust the proxy metric, and when should they trust the north star? In this paper, I propose an optimal blending approach that smoothly guides decision-making towards the north star as the power of the experiment increases and away from the north star as the quality of the proxy metric improves. I study the implications of this decision-making framework for the design of experiments and of experimentation programs. Equipped with better (worse) proxy metrics, experimenters should run smaller and more (larger and fewer) experiments. I show how to leverage past experiments to estimate optimal blending weights and experiment sizes. Lastly, I describe the real-world application of the methodology to an experimentation program at Netflix.

---

## Abstract（日本語訳）

proxy 指標はオンライン実験（A/B テスト）の精度と速度を高めるため広く使われる。proxy はしばしば実験者が観測しない長期アウトカムを動機とするが、多くの場面では、同時期に観測できるが統計的に感度の低い north star と**併用**される。これは実務上のジレンマを生む——いつ proxy を信じ、いつ north star を信じるべきか。本論文は、実験の検出力（power）が上がるほど滑らかに north star へ、proxy の品質が上がるほど north star から離れるように意思決定を導く **最適ブレンディング** 手法を提案する。この意思決定枠組みが実験設計・実験プログラム設計に与える含意を調べる。より良い（悪い）proxy を備えた実験者は、より小さく多い（大きく少ない）実験を走らせるべきである。過去実験を活用して最適ブレンディング重みと実験サイズを推定する方法を示す。最後に Netflix の実験プログラムへの実応用を述べる。

---

## Overview

proxy $\hat P$ と north star $\hat Y$ を重み $a$ で線形ブレンドした意思決定指標 $\hat Z(A)=a\hat P+(1-a)\hat Y$ を使い、その重みを「north star への期待リターン最大化」で最適化する。核心の直観: 実験の検出力（サンプル $n$）が上がるほど north star を信じ（重みを north star に寄せ）、proxy の品質が上がるほど proxy に寄せる。最適重みには閉形式近似 $\tilde A\propto(\Sigma_X+(1+z^2)2\Omega/n)^{-1}\Gamma$（罰則付き回帰の形）があり、過去実験から推定できる。実験計画への含意: 良い proxy なら小さく頻繁な実験、悪い proxy なら大きく少ない実験を。Netflix の Clicks（proxy）/ Plays（north star）で実証。

---

## Problem（課題）

- proxy と north star を併用するとき「どちらをどれだけ信じるか」の原理的基準がない。
- north star は感度が低く単独では偽陰性が多い。proxy は感度が高いが surrogate paradox（偽陽性）のリスク。
- proxy 単独ルールは、サンプル $n$ が増えるほど false positive rate が上がりうる（north star と乖離）。
- proxy の品質に応じて「どの規模の実験を何回走らせるべきか」の実験計画指針がなかった。

---

## Proposed Method（提案手法）

### コアアイデア

proxy と north star のブレンド $\hat Z(A)=A^\top\hat X$ を意思決定指標とし、「ローンチしたときに north star が実際に得る期待リターン」$R(A)$ を最大化する重み $A$ を選ぶ。最適重みは罰則付き（ridge 的）回帰の閉形式で近似でき、$n$ が小さいほど proxy 側、大きいほど north star 側に自動で寄る。

### 手順

1. **ブレンド指標の定義**: $\hat Z(A)=a\hat P+(1-a)\hat Y$（Eq.1）。
2. **リターン目的の定義**: ローンチ条件（$\hat Z$ が閾値超）を満たしたときの north star 実値の期待値 $R(A)$（Eq.3–5）を最大化。
3. **閉形式近似（Proposition 1）**: $\tilde A\propto(\Sigma_X+(1+z^2)2\Omega/n)^{-1}\Gamma$。近似誤差 $O(n^{-2})$、regret $O(n^{-4})$。
4. **有効性しきい値**: 近似が妥当な最小サンプル $n\ge\bar n(A^*)$（Eq.10）。
5. **過去実験からの推定**: サンプリング共分散 $2\Omega/n$、真効果共分散 $\Sigma_X$、$\Gamma=\mathrm{Cov}(X,Y)$ を推定し、plug-in で $\dot A$ を計算 → 負成分を落として単体上に正規化 → しきい値検証。
6. **実験計画への適用**: 80% 検出力に要するサンプル $n_A$（Eq.19）を proxy 品質から逆算し、「小さく多く」か「大きく少なく」かを決める。

### Key Formulas

ブレンド意思決定指標（Eq.1）:

$$\hat Z(A)=A^\top\hat X=a\,\hat P+(1-a)\,\hat Y$$

リターン目的（Eq.3–5）:

$$R(A):=E\Big[Y\cdot\mathbb{1}\big\{A^\top\hat X>z\sqrt{A^\top(2\Omega/n)A}\big\}\Big]=\frac{A^\top\Gamma}{\sqrt{A^\top\Sigma_{\hat X}A}}\,\varphi\big(z\sqrt{q_n(A)}\big)$$

最適重みの閉形式近似（Proposition 1）:

$$\tilde A\ \propto\ \big(\Sigma_X+(1+z^2)\tfrac{2\Omega}{n}\big)^{-1}\Gamma$$

有効性しきい値（Eq.10）:

$$n\ \ge\ \bar n(A^*):=(z^2-1)\,\frac{2A^{*\top}\Omega A^*}{A^{*\top}\Sigma_X A^*}$$

80% 検出力に要するサンプル（Eq.19）:

$$n_A\ \ge\ \frac{(z+0.84)^2\,2\omega_A}{\mu_A(\tau_Y)^2}\,I(\theta),\qquad I(\theta)=\frac{z^2}{(z+0.84)^2(1-\theta)^2}$$

plug-in 推定量:

$$\dot A=\big(\hat\Sigma_X+(1+z^2)\tfrac{2\hat\Omega}{n}\big)^{-1}\hat\Gamma$$

---

## Algorithm（擬似コード）

```
Input: 過去実験の proxy/north star 処置効果推定と誤差
Output: 最適ブレンド重み Ȧ, 推奨実験サイズ

# 1. 共分散推定
2Ω̂/n <- 実験サンプルからサンプリング共分散
Σ̂_X  <- 真効果共分散（nonparametric / empirical Bayes / Bayesian）
Γ̂    <- Cov(X, Y)

# 2. 閉形式で重み
Ȧ <- (Σ̂_X + (1+z^2)·2Ω̂/n)^{-1} · Γ̂        # Proposition 1

# 3. 単体制約に射影
Ȧ <- 負成分を 0 に, 再正規化
if n < n̄(Ȧ):  数値最適化で R(A) を直接最大化   # Eq.10 未達時

# 4. 判定
launch if  Ȧ^T X̂ > z·sqrt(Ȧ^T (2Ω/n) Ȧ)

# 5. 実験計画
n_A <- Eq.19 で 80% 検出力に要するサンプル
      → proxy 良好: 小さく多く / proxy 劣悪: 大きく少なく
```

---

## Architecture / Process Flow

```
過去実験群
   │ 共分散推定 Σ_X, Ω, Γ
   ▼
最適ブレンド重み Ȧ = (Σ_X + (1+z^2)2Ω/n)^{-1} Γ     [Prop.1]
   │        ↳ n 小 → proxy 寄り / n 大 → north star 寄り
   ▼
ブレンド指標 Ẑ(A) = a·P̂ + (1-a)·Ŷ
   │ 閾値 z·SE(Ẑ) で launch 判定
   ▼
リターン R(A) 最大化（north star 期待値）
   ▼
実験計画への含意（Eq.19）
   ├─ 良い proxy → 小さく多い実験（探索）
   └─ 悪い proxy → 大きく少ない実験（確度重視）
```

---

## Figures & Tables（必須セクション）

> 注: HTML 抽出で図の src が `/figs/...png` の相対パスとして得られたが、arxiv.org を前置した完全 URL の実在は未確認のため、画像埋め込みは行わず、キャプションと確認できた数値のみ記載する（画像 URL: 未確認）。

### 表1: Netflix 実応用の最適ブレンド重み（本文記載値）

| 1 アームあたりサンプルサイズ | Clicks（proxy）重み | Plays（north star）重み |
|------------------------------|---------------------|--------------------------|
| ~2M | 100% | 0% |
| ~5M（中央値・典型） | 52% | 48% |
| ~25M（観測最大） | ~10% | ~90% |

サンプルが増えるほど north star（Plays）へ滑らかに重みが移る。

### 表2: Netflix 指標の感度比較（本文記載値）

| 指標 | SE 比 | 有意アーム割合(α=0.05) |
|------|-------|-------------------------|
| Clicks（proxy） | ~12 | ~60% |
| Plays（north star） | ~2 | ~25% |

Clicks は Plays の約 **6 倍感度**。

### 表3: 主要公式まとめ

| 概念 | 式 | 意味 |
|------|----|------|
| ブレンド指標 | $\hat Z(A)=a\hat P+(1-a)\hat Y$ | 効果の加重平均 |
| リターン | $R(A)=E[Y\cdot\mathbb 1\{\hat Z>z\,SE\}]$ | ローンチ時の north star 期待値 |
| 閉形式重み | $\tilde A\propto(\Sigma_X+(1+z^2)2\Omega/n)^{-1}\Gamma$ | 罰則付き回帰 |
| 有効性しきい値 | $n\ge\bar n=(z^2-1)2A^\top\Omega A/A^\top\Sigma_X A$ | 近似が妥当な最小 $n$ |
| 検出力サンプル | $n_A=((z+0.84)^2 2\omega_A/\mu_A^2)I(\theta)$ | 80% power に要する $n$ |

### 図（キャプション）

- 図1: サンプル $n$ 別の累積リターン（左）と最適ブレンド重み（右）。north star 重みは $n$ とともに単調増加。src: `/figs/sims-01-...png`（URL 未確認）。
- 図2: $n\times\rho$ の検出力ヒートマップ。proxy は $n$ 非依存、ブレンドは適応的に補間。src: `/figs/sims-02-power-heatmaps.png`（URL 未確認）。
- 図3: $n\times\rho$ の偽陽性率ヒートマップ。proxy 単独は $n$ とともに FPR>0.05（$\rho=1$ 除く）、ブレンドは名目 0.05 に収束。src: `/figs/sims-03-fpr-heatmaps.png`（URL 未確認）。
- 図5: Netflix の Clicks（x）vs Plays（y）処置効果散布図（15 実験×50 アーム）。線形・正規性を確認。src: `/figs/proxy-vs-north-star-external.png`（URL 未確認）。
- 図6: 1 アームサンプル $n$（対数）別の近似最適ブレンド重み。$n\approx2M$ 以下で単体制約が binding（100% Clicks）。src: `/figs/external-optimal-weights.png`（URL 未確認）。
- 図7: 実験あたり期待リターン vs $n$。ブレンドが plays 単独・clicks 単独の両方を全域で支配。src: `/figs/returns-external.png`（URL 未確認）。

---

## Experiments & Evaluation

### Setup

- **シミュレーション**: $\Sigma_X=[[1.0,0.08],[0.08,0.01]]$、$\Omega=[[25,8],[8,16]]$、$\alpha=0.05$（$z\approx1.645$）、$\rho\in\{0,0.2,...,1.0\}$、$J=100$ 実験、$n\in\{1000,...,20000\}$、MC 1,000 回。重裾ロバスト性は多変量 $t$（$\nu=3$）で検証。
- **Netflix 実応用**: 15 A/B テスト、50 アーム。proxy=Clicks、north star=Plays。

### Main Results

- ブレンド指標は全サンプルサイズで累積リターン最良（ブレンド > north star 単独 > proxy 単独）。
- north star への最適重みは $n$ とともに単調増加。
- proxy 単独ルールは $n$ とともに偽陽性率が増加（$\rho=1$ 除く）。ブレンドは漸近的に north star の type-I 制御を継承。
- Netflix: Clicks は Plays の約 6 倍感度（SE 比 ~12 vs ~2、有意割合 ~60% vs ~25%）。最適重みは $n\approx2M$ で 100% Clicks、$\approx5M$ で 52:48、$\approx25M$ で約 10:90。ブレンドが両単独ルールを全観測域で支配。

### Ablation

- 重裾ロバスト性（図4, $\nu=3$）: 質的結論は $t$ 分布下でも維持。
- $\rho$（proxy 品質）掃引: proxy 品質が高いほど proxy 重視で小さい実験が最適、という設計含意を数値検証。

---

## 本テーマへの適用可能性

本テーマ（低頻度マーケ施策・uplift・off-policy 評価・類似施策プール・実験間隔短縮）に対し、本論文は「proxy と north star をどう配合し、どの規模で実験するか」という**運用・計画レベルの最適化**を与える点で他 5 本と補完的。

1. **実験計画そのものの最適化（低頻度施策の核心的示唆）**: 「良い proxy を持つなら小さく多い実験、悪い proxy なら大きく少ない実験」という設計原理（Eq.19）は、低頻度マーケ施策の計画に直結する。過去のクーポン/メール施策から proxy 品質を推定し、次の施策を「短期反応が良い予測子なら、小規模テストを高頻度で回す」戦略に切り替えられる。これは実質的に実験間隔を短縮し、実効データ密度を上げる意思決定。

2. **proxy と north star の動的配合**: 施策初期（サンプル小）は short-term proxy（開封・クリック等）を強く信じ、サンプルが貯まるにつれ north star（長期継続/LTV）へ滑らかに重みを移す——という自動配合は、「短期信号で早期判断しつつ、データが増えたら長期指標を重視」する理想的運用を閉形式で実現する。$\tilde A\propto(\Sigma_X+(1+z^2)2\Omega/n)^{-1}\Gamma$ を過去施策から plug-in 推定すればよい。

3. **類似施策プールでの共分散推定**: 最適重みは過去実験群から $\Sigma_X,\Omega,\Gamma$ を推定して得る。類似クーポン/メール施策をプールしてこれらを推定すれば、単独では不安定な共分散を安定化でき、新規施策のブレンド重みを事前に決められる。

4. **surrogate paradox / 偽陽性の制御**: proxy 単独ルールがサンプル増で偽陽性を増やすという知見は、off-policy 評価で「短期指標だけで採否を決める」危険を定量化する。ブレンドは north star の type-I 制御を漸近的に継承するため、低頻度・高コスト施策の誤採用リスクを構造的に抑える。

---

## Notes

- 単著（Winston Chou, Netflix）。本バッチの weak-experiments 論文（28）の共著者でもあり、surrogate index Netflix 論文（25）と同じ Netflix 実験プログラム系列。
- 会議は ECML PKDD '26。arXiv ID 2606.21745 は 2026 年投稿（システム上の現在日付 2026-07 と整合）。
- 図の画像は `/figs/...png` 相対パスのみ確認でき、完全 URL の実在は未検証のため埋め込みなし（キャプションのみ）。
- 本論文は「proxy を作る」より「proxy と north star をどう使い、どう実験を設計するか」に焦点があり、25–29 の proxy 構築手法の上位に立つ運用・計画レイヤーを担う。
