# Learning the Covariance of Treatment Effects Across Many Weak Experiments

- **Link**: https://arxiv.org/abs/2402.17637
- **Authors**: Aurélien Bibaut, Winston Chou, Simon Ejdemyr, Nathan Kallus
- **Year**: 2024（v1: 2024-02-27 / v2: 2024-07-30）
- **Venue**: Proceedings of the 30th ACM SIGKDD Conference on Knowledge Discovery and Data Mining（KDD 2024）
- **Type**: 統計手法提案（メタ分析 + 弱操作変数の技法）+ Netflix での応用

---

## Abstract (English)

> When primary objectives are insensitive or delayed, experimenters may instead focus on proxy metrics derived from secondary outcomes. For example, technology companies often infer the long-term impacts of product interventions from their effects on short-term user engagement signals. We consider the meta-analysis of many historical experiments to learn the covariance of treatment effects on these outcomes, which can support the construction of such proxies. Even when experiments are plentiful, if treatment effects are weak, the covariance of estimated treatment effects across experiments can be highly biased. We overcome this with techniques inspired by weak instrumental variable analysis. We show that Limited Information Maximum Likelihood (LIML) learns a parameter equivalent to fitting total least squares to a transformation of the scatterplot of treatment effects, and that Jackknife Instrumental Variables Estimation (JIVE) learns another parameter computable from the average of Jackknifed covariance matrices across experiments. We also present a total covariance estimator for the latter estimand under homoskedasticity, which is equivalent to a k-class estimator. We show how these parameters can be used to construct unbiased proxy metrics under various structural models. Lastly, we discuss the real-world application of our methods at Netflix.

---

## Abstract（日本語訳）

主要目的（primary objective）が感度不足あるいは遅延する場合、実験者は代わりに二次アウトカムから導いた proxy 指標に注目することがある。例えばテック企業は、製品介入の長期インパクトを短期のユーザーエンゲージメント信号への効果から推測することが多い。本論文は、こうした proxy 構築を支える「これらアウトカムに対する処置効果の共分散」を、多数の過去実験のメタ分析で学習する問題を扱う。実験が豊富でも、処置効果が弱い（weak）場合、実験横断の推定処置効果の共分散は強くバイアスしうる。我々はこれを **弱操作変数分析（weak IV）** に着想を得た技法で克服する。Limited Information Maximum Likelihood（LIML）は、処置効果の散布図を変換したものに全最小二乗（TLS）を当てはめるのと等価なパラメータを学習し、Jackknife 操作変数推定（JIVE）は実験横断の Jackknife 共分散行列の平均から計算できる別パラメータを学習することを示す。さらに、後者の推定対象に対し等分散（homoskedasticity）下で k-class 推定量と等価な total covariance 推定量を提示する。これらパラメータを用いて各種構造モデル下で **不偏な proxy 指標** を構築する方法を示す。最後に Netflix での実応用を論じる。

---

## Overview

多数の過去実験から「短期指標 $S$ と長期指標 $Y$ の処置効果の共分散 $\Lambda$」を推定し、それを使って $S$ から $Y$ を予測する不偏 proxy（surrogate index）を構築する。核心的問題は、**処置効果が弱いと観測共分散が測定ノイズでバイアスする**こと（$E[\hat\Sigma_K]=\Lambda_K+\frac{4}{n}\bar\Omega_K$）。これを弱操作変数（weak IV）の技法——LIML / JIVE / total covariance（k-class）——で補正し、実験数 $K\to\infty$ で一致推定を得る。素朴な OLS は減衰バイアスを持つが、TLS ベースの LIML と不偏 TC 推定量はロバスト。

---

## Problem（課題）

- 長期指標 $Y$ が感度不足/遅延するため、短期指標 $S$ から $Y$ を予測する proxy を作りたい。
- proxy 構築には $S,Y$ の処置効果共分散 $\Lambda$ が必要だが、処置効果が弱いと観測共分散にノイズが乗りバイアスする（実験が多くても消えない）。
- 素朴な OLS 回帰は減衰バイアス（attenuation bias）を持ち、方向を誤る。
- 直接効果（$S$ を介さず $Y$ に効く経路）があると、素朴推定は $\beta$ に対し非一致。

---

## Proposed Method（提案手法）

### コアアイデア

実験を「操作変数（instrument）」、処置効果推定を「弱いシグナル」とみなす weak-IV アナロジーで、観測共分散のノイズバイアスを除去する。3 つの推定量——OLS パラメータ $\theta_1$、TLS パラメータ $\theta_2$、それらを実現する LIML / JIVE / total covariance——を用意し、構造モデルに応じて不偏 proxy $h(S)=\theta_i(\Lambda_K)S$ を構成する。

### 手順

1. **処置効果共分散 $\Lambda_K$ の定義**: 実験横断で真 ATE $(\tau_S,\tau_Y)$ の共分散行列を定義（$\Lambda_{YY},\Lambda_{SY},\Lambda_{SS}$）。
2. **素朴推定のバイアス把握**: $E[\hat\Sigma_K]=\Lambda_K+\frac{4}{n}\bar\Omega_K$。弱効果でバイアスが支配的。
3. **total covariance（TC）**: 等分散下で $\hat\Lambda_K^{TC}=\hat\Sigma_K-\frac{4}{n}\Omega$（不偏）。k-class（$k=1+4/n$）と等価。
4. **LIMLK**: $\Omega^{-1/2}$ でノイズを等方化 → TLS → 逆変換。TLS は等方ノイズで固有ベクトル不変なので不偏。
5. **JIVE**: 実験ごとの Jackknife 共分散の平均。バイアス $O(M/N)$（総サンプルサイズで減衰）。
6. **不偏 proxy の構成**: 完全媒介モデル下で $h(S)=\theta_i(\Lambda_K)S$ が $E[Y(1)-Y(0)]=E[S(1)-S(0)]\theta_i$ を満たす。

### Key Formulas

処置効果共分散行列:

$$\Lambda_K=\begin{bmatrix}\Lambda_{YY,K} & \Lambda_{SY,K}^\top\\ \Lambda_{SY,K} & \Lambda_{SS,K}\end{bmatrix}$$

OLS パラメータ:

$$\theta_1(\Lambda_K)=\Lambda_{SS,K}^{-1}\Lambda_{SY,K}$$

TLS パラメータ（一般化固有値問題 $(\Lambda_K-\kappa\Psi)\gamma=0$ の最小 $\kappa$）:

$$\theta_{2,\Psi}(\Lambda_K)=-\gamma_{\Psi,S}(\Lambda_K)/\gamma_{\Psi,Y}(\Lambda_K)$$

素朴推定のバイアス:

$$E[\hat\Sigma_K]=\Lambda_K+\frac{4}{n}\bar\Omega_K$$

total covariance（不偏, 等分散下）:

$$\hat\Lambda_K^{TC}=\hat\Sigma_K-\frac{4}{n}\Omega,\qquad E[\hat\Lambda_K^{TC}]=\Lambda_K$$

LIMLK の k-class 形（$k=1+4/n$）:

$$\theta_1(\hat\Lambda_K^{TC})=\frac{(\tilde S^0)^\top\big(I-(1+4/n)M_T\big)\tilde Y^0}{(\tilde S^0)^\top\big(I-(1+4/n)M_T\big)\tilde S^0}$$

不偏 proxy 指標（完全媒介モデル）:

$$h(S)=\theta_i(\Lambda_K)\,S,\qquad E[Y(K{+}1,1)-Y(K{+}1,0)]=E[S(K{+}1,1)-S(K{+}1,0)]\,\theta_i(\Lambda_K)$$

---

## Algorithm（擬似コード）

```
Input: K 実験の {処置割当 A_i, 短期 S_i, 長期 Y_i, セルサイズ n}
Output: 不偏 proxy 係数 θ, proxy h(S)=θ·S

# 1. 各実験の ATE 推定
for t in 1..K:
    τ̂_S(t), τ̂_Y(t) <- 差分推定量

# 2. 素朴共分散（バイアスあり）
Σ̂_K <- Cov({τ̂_S, τ̂_Y})            # E[Σ̂]=Λ+ (4/n) Ω̄  → 補正が必要

# 3. weak-IV 補正で Λ̂ を得る（いずれか）
option TC:   Λ̂^{TC} = Σ̂_K - (4/n) Ω                 # 等分散・不偏
option LIMLK: 変換 Ω^{-1/2} → TLS → 逆変換             # k=1+4/n の k-class
option JIVE:  Λ̂^{JK} = mean_t Jackknife共分散(t)        # バイアス O(M/N)

# 4. proxy 係数
θ <- θ_1(Λ̂)  または  θ_2,Ψ(Λ̂)      # モデルに応じて
return θ,  h(S)=θ·S
```

---

## Architecture / Process Flow

```
K 個の過去実験
   │ 各実験 ATE 推定 τ̂_S(t), τ̂_Y(t)
   ▼
散布図（短期TE vs 長期TE） → 素朴共分散 Σ̂_K
   │   ↳ バイアス Λ + (4/n)Ω̄   （弱効果で支配的）
   ▼
weak-IV 補正
   ├─ Total Covariance:  Σ̂ − (4/n)Ω        (不偏)
   ├─ LIMLK:  Ω^{-1/2} → TLS → 逆変換        (k=1+4/n)
   └─ JIVE:   Jackknife 共分散の平均          (bias O(M/N))
   ▼
潜在共分散 Λ̂  →  proxy 係数 θ_i(Λ̂)
   ▼
不偏 proxy  h(S)=θ·S  （surrogate index）
   ▼
新規実験で S から長期 Y の処置効果を予測
```

---

## Figures & Tables（必須セクション）

> 注: HTML 抽出では図の src URL が独立 URL として現れなかった（画像 URL: 未確認）。以下はキャプションと本文記載の理論結果表。

### 表1: 推定量比較（主要な方法論比較）

| 推定量 | 補正原理 | バイアス | 直接効果あり(INSIDE)時 | 弱操作変数の対応 |
|--------|----------|----------|------------------------|-------------------|
| Naive OLS | なし | $+\frac{4}{n}\bar\Omega$（減衰バイアス） | 非一致 | — |
| Total Covariance (TC) | $\hat\Sigma-\frac{4}{n}\Omega$ | 不偏（$E[\cdot]=\Lambda$） | ロバスト・一致 | k-class ($k=1+4/n$) |
| LIMLK | $\Omega^{-1/2}$ 変換→TLS | 小 $n$ でも高精度・低分散 | $\beta$ に非一致 | LIML |
| JIVE | Jackknife 共分散平均 | $O(M/N)$（総 $N$ で減衰） | — | Jackknife IV |

### 表2: シミュレーション結果の質的まとめ（Figure 3, 4）

| シナリオ | Naive | LIMLK | TC |
|----------|-------|-------|-----|
| 直接効果なし（Fig.3） | 強くバイアス | 大幅に高精度・小 $n$ で低分散 | ロバスト・同等精度 |
| 直接効果あり INSIDE（Fig.4） | バイアス | $\beta$ に対し明確に非一致 | ロバスト・一致維持 |

### 図1（キャプション）

測定誤差の歪み。ユニットレベルのノイズが真の処置効果共分散を圧倒し得ることを示す。素朴推定は $\theta_1(\Omega)$ 方向にバイアスし、小 $n$ ほど深刻。画像 URL: 未確認。

### 図2（キャプション）

$\Omega^{-1/2}$ 変換の効果（$n=100$ vs $n=10000$ の 2 パネル）。変換で測定誤差が等方化され、TLS は不偏（固有ベクトル不変）、OLS の plim は $n$ とともに減衰バイアス。画像 URL: 未確認。

### 図3 / 図4（キャプション）

直接効果なし / あり（INSIDE）での Naive / LIMLK / TC 推定量比較。TC は両シナリオでロバスト。画像 URL: 未確認。

---

## Experiments & Evaluation

### Setup

- **シミュレーション**: 弱処置効果 + 測定ノイズの構造モデル。直接効果なし / あり（INSIDE 制約 $\pi_Y^\top\Pi_S=0$）の 2 シナリオ。
- **実応用**: Netflix の実験プラットフォームで線形 surrogate index を構築（Section 6）。具体数値は本文抽出からは取得不可（記載なし）。

### Main Results（理論・シミュレーション）

- 素朴 OLS は弱効果下で強くバイアス（$\frac{4}{n}\bar\Omega$）。
- LIMLK は素朴推定より大幅に高精度、小 $n$ でも低分散。
- TC 推定量は不偏で、直接効果（INSIDE）があってもロバストに一致。
- JIVE のバイアスは $O(M/N)$ で総サンプルサイズとともに減衰。
- weak-IV アナロジー: JIVE↔Jackknife IV、LIMLK↔LIML、TC↔k-class（$k=1+4/n$）。実験数 $K\to\infty$（操作変数強度は固定）で一致。

### Ablation

- 直接効果の有無（Fig.3 vs Fig.4）が主要な感度分析。TC のみ両条件でロバスト、LIMLK は直接効果下で $\beta$ に非一致という切り分けを提示。

---

## 本テーマへの適用可能性

本テーマ（低頻度マーケ施策・uplift・off-policy 評価・類似施策プール・実験間隔短縮）に対し、本論文は「過去実験群から surrogate index の係数を不偏に学習する」統計的基盤を与える。

1. **類似施策プールの理論的正当化**: 手法はまさに「多数の過去実験のメタ分析」で $S$（短期反応）と $Y$（長期 uplift）の処置効果共分散を学習する。過去のクーポン/メール施策を 1 コーパスにプールし、そこから短期→長期の変換係数 $\theta$ を推定する——本テーマの「プール」戦略に直接対応する。

2. **低頻度・弱効果への頑健性が核心**: マーケ施策は 1 回あたりの uplift が小さく（弱効果）、サンプルも限られる。素朴に短期・長期指標の相関を取ると測定ノイズ $\frac{4}{n}\Omega$ でバイアスし、間違った proxy 係数を得る危険がある。本論文の TC / LIMLK 補正は、まさにこの「弱効果 + 低サンプル」条件で不偏な係数を回復する。低頻度施策で最も効く補正。

3. **実験間隔の短縮（不偏 surrogate index）**: 得られた $h(S)=\theta\cdot S$ は、新規施策で短期反応 $S$ だけから長期 uplift の処置効果を不偏推定する surrogate index になる。60 日後の LTV/継続を待たず、短期反応から不偏に長期効果を読めるため、実験サイクルを短縮できる。しかも「不偏」なので、他の proxy 手法で懸念される surrogate paradox（減衰・方向誤り）を統計的に回避する。

4. **直接効果への配慮**: マーケ施策では「短期反応を介さず直接長期に効く」経路（例: ブランド想起）があり得る。本論文は INSIDE 制約下で TC がロバストに一致することを示しており、直接効果がある施策でも proxy 係数を誤らない設計指針を与える。

---

## Notes

- 著者は Netflix（Bibaut, Chou, Ejdemyr）+ Cornell/Netflix の Kallus。同じ Kallus・Chou が本バッチの他論文（surrogate index Netflix 論文 25、blending 論文 30）にも関与。
- 会議は KDD 2024。
- 図の画像 src URL は HTML 抽出に現れず未確認のため埋め込みなし。
- 「実験を操作変数、処置効果を弱シグナルとみなす」weak-IV フレーミングが本論文の独創点。$k=1+4/n$ の k-class 補正が実装上の要。
- Netflix 実応用（Section 6）の具体数値は本文抽出から取得できず「記載なし」。
