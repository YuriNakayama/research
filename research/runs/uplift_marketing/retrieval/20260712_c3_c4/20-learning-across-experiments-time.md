# Learning Across Experiments and Time: Tackling Heterogeneity in A/B Testing

- **Link**: https://arxiv.org/abs/2511.21282
- **Authors**: Xinran Li
- **Year**: 2025 (submitted 2025-11-26)
- **Venue**: arXiv preprint (Statistics > Methodology, stat.ME) — 査読付き会議・ジャーナルの記載なし（記載なし）
- **Type**: 方法論論文（Empirical Bayes / A/B テスト統計手法）

---

## Abstract (English)

> Treatment effect estimates in A/B testing often suffer from noise driven by short timeframes and incomplete accumulation of metrics. Pooling information across related experiments could improve reliability, but naive approaches introduce bias: temporal dynamics within experiments and contextual differences across experiments both distort estimates. To address this, we introduce a local empirical Bayes framework that adapts to both temporal and cross-experiment heterogeneity. The method selectively borrows information from comparable experiments while remaining sensitive to time-based changes, producing stabilized treatment effect estimates. We show that targeted pooling strategies outperform broad approaches by reducing variance while avoiding bias, enhancing decision-making speed in practical A/B testing scenarios.

（注: 上記は abstract ページおよび HTML 本文から再構成した英語要旨。原文の一字一句と完全一致しない可能性がある。）

## Abstract（日本語訳）

A/B テストにおける処置効果（treatment effect）の推定値は、観測期間が短くメトリクスの蓄積が不完全であることに起因するノイズにしばしば悩まされる。関連する複数の実験（experiments）間で情報をプール（pooling）すれば信頼性を改善できる可能性があるが、素朴なプーリングはバイアスを生む。すなわち、(1) 実験内部の時間ダイナミクス（temporal dynamics / nonstationarity）と、(2) 実験間の文脈差（product・ユーザー母集団・季節など）の双方が推定を歪める。この問題に対処するため、著者らは時間的異質性と実験間異質性の双方に適応する **local empirical Bayes（局所経験ベイズ）** フレームワークを提案する。本手法は、時間変化に敏感でありつつ、比較可能な実験からのみ選択的に情報を借用（selective borrowing）し、安定化された処置効果推定を生成する。実験の結果、対象を絞ったプーリング戦略が、バイアスを回避しつつ分散を削減することで、広範なプーリングを上回り、実運用の A/B テストにおける意思決定の高速化に寄与することを示す。

---

## Overview

本論文は、**短い観測期間・疎なデータ**という制約下で行われる A/B テストの処置効果推定を安定化させるための統計手法を提案する。中心的アイデアは「関連実験からの借用（borrowing strength）」だが、単純に全実験をプールする古典的 empirical Bayes（EB）は、実験間・時間内の**異質性（heterogeneity）**によって交換可能性（exchangeability）の仮定が破れ、バイアスを招く。

著者はこれを解決するため、**global shrinkage を局所的・実験固有の近傍（neighborhood）に置き換える** local EB を導入する。近傍は次の 2 軸で適応的に構築される:

1. **時間認識（time-aware）**: 実験内の到着パターン（arrival pattern）などプロセス特徴を尊重
2. **文脈認識（context-aware）**: 比較可能な相手実験のみを選択

具体アルゴリズムが **CF-SHN（Cross-Fitted Stratified Hybrid Neighbors）** であり、DTW によるプロセスフィルタリングと cross-fitted pilot 推定によるアウトカム精緻化を組み合わせる。ASOS Digital Experiments データセット（78 実験）を用いた半合成評価で、古典 EB の MSE 削減 1.2% に対し、CF-SHN は **27.2%** の削減を達成する。

---

## Problem

- **高分散**: 観測期間が短く、メトリクスの蓄積が遅いため、単一実験の処置効果推定はノイズが大きい。
- **プーリングの罠**: 情報の借用は有効だが、素朴に全実験をプールすると交換可能性が破れバイアスが生じる。
- **時間内異質性（temporal / nonstationarity）**: 実験内で処置効果が時間とともに変化するため、期間を通じた単純平均は歪む。
- **実験間異質性（cross-experiment heterogeneity）**: 製品・ユーザー母集団・季節などの文脈差により、無関係な実験から借用するとシグナルが希釈される。
- **古典 EB の限界**: global shrinkage は「全実験が交換可能」を暗黙に仮定するが、実データでは成り立たず、削減効果はわずか（本実験で 1.2%）。

---

## Proposed Method

### コアアイデア

各対象実験に対し、**その実験固有の局所近傍**を構築し、その近傍内でのみ hierarchical shrinkage を適用する。近傍選択は「プロセス（到着・トラフィック形状）」と「アウトカム（cross-fitted pilot 推定）」の 2 段階で行い、時間・文脈の双方の異質性に適応する。

### 手順（Numbered Steps）

1. **プロセスフィルタリング（Process filtering）**: 各実験の正規化到着パターン $\tilde\lambda_k(t)$ と対数トラフィック規模から、Dynamic Time Warping（DTW）距離に基づき候補 $M_0$ 個を選択する。
2. **アウトカム精緻化（Outcome refinement）**: cross-fitted pilot 推定 $\hat\mu_j^{(-)}$ を用い、候補を最終的な $q$ 近傍に絞る。cross-fitting によりノイズの再利用（noise reuse）を回避する。
3. **局所階層モデルの推定**: 選ばれた $q$ 近傍上で Restricted Maximum Likelihood（REML）により局所階層モデル（local hierarchical model）を当てはめ、shrinkage 推定を得る。REML が発散する場合は ML にフォールバックする。
4. **cross-fitting**: $K=5$ 分割で近傍・ハイパーパラメータを対象ノイズと独立にし、over-fitting を防ぐ。

### Key Formulas

近傍選択の類似度距離（プロセス形状 DTW と対数規模の重み付き和）:

$$
D(\Phi_i,\Phi_j) = \rho \cdot \frac{d_{\mathrm{DTW}}(\tilde\lambda_i,\tilde\lambda_j)}{\mathrm{median}\{d_{\mathrm{DTW}}\}} + (1-\rho)\cdot \frac{|\log n_i - \log n_j|}{\mathrm{MAD}_{\log n}}
$$

局所 shrinkage の中心（局所条件付き平均）:

$$
\mu_{\mathrm{loc}}(X_k) = \mathbb{E}[\mu_{z_k}\mid X_k]
$$

局所中心 $\mu_{\mathrm{loc}}(X_k)$ が global 混合平均 $\mu_{\mathrm{mix}}$ より真の型平均 $\mu_{z_k}$ に近いことが、系統的バイアス削減の鍵。

**Theorem 5.1（Oracle Dominance）**: 情報を持つ特徴の下での異質性において、local EB は古典 EB より厳密に低い MSE を達成する。

$$
\mathbb{E}[\mathrm{MSE}_{\mathrm{loc}}] < \mathbb{E}[\mathrm{MSE}_{\mathrm{glob}}]
$$

**Theorem 5.2（Plug-in Dominance）**: 推定誤差が制御される限り、ハイパーパラメータを推定してもオラクルの優位性は保持される。

---

## Algorithm

```text
Algorithm: CF-SHN (Cross-Fitted Stratified Hybrid Neighbors)
Input : 実験集合 {Φ_k}, 到着パターン λ̃_k(t), トラフィック規模 n_k,
        パラメータ ρ, 候補数 M_0, 近傍数 q, cross-fit 分割数 K
Output: 各対象実験 k の安定化処置効果推定 μ̂_k

for each 対象実験 k:
    # --- Stage 1: プロセスフィルタリング ---
    for each 候補実験 j != k:
        d_shape = d_DTW(λ̃_k, λ̃_j) / median{d_DTW}
        d_scale = |log n_k - log n_j| / MAD_log n
        D(Φ_k, Φ_j) = ρ * d_shape + (1 - ρ) * d_scale
    候補集合 C_k <- D が小さい上位 M_0 個の実験

    # --- Stage 2: cross-fitted アウトカム精緻化 ---
    K 分割で pilot 推定 μ̂_j^(-) を算出（対象 fold を除外）
    近傍 N_k <- C_k のうち μ̂_j^(-) が μ̂_k^(-) に近い上位 q 個

    # --- Stage 3: 局所階層モデル推定 ---
    N_k 上で REML により局所 hierarchical model を当てはめ
    if REML 発散: ML にフォールバック
    μ̂_k <- 局所 shrinkage 推定

return {μ̂_k}
```

---

## Architecture / Process Flow

```text
  [全実験集合 {Φ_k}]
          │
          ▼
 ┌─────────────────────────────┐
 │ Stage 1: Process Filtering  │
 │  DTW(到着形状) + log トラフィック │
 │  D(Φ_i,Φ_j) → 上位 M_0 候補    │
 └─────────────────────────────┘
          │  候補 C_k (M_0 個)
          ▼
 ┌─────────────────────────────┐
 │ Stage 2: Outcome Refinement │
 │  cross-fitted pilot μ̂^(-)     │
 │  → 近傍 N_k (q 個)            │
 └─────────────────────────────┘
          │  近傍 N_k
          ▼
 ┌─────────────────────────────┐
 │ Stage 3: Local Hierarchical  │
 │  REML 当てはめ (発散時 ML)      │
 │  → local shrinkage 推定 μ̂_k   │
 └─────────────────────────────┘
          │
          ▼
   [安定化された処置効果推定]
```

---

## Figures & Tables

### 図1: MSE 削減の比較（メイン結果）

![MSE reduction relative to the raw estimator on simulated ASOS experiments. Bars show average reductions and lines trace trends as q increases.](https://arxiv.org/html/2511.21282v1/Reduction3.png)

（Figure 1 キャプション: "MSE reduction relative to the raw estimator on simulated ASOS experiments. Bars show average reductions and lines trace trends as q increases." バーは平均削減率、線は $q$ 増加に伴うトレンドを示す。No shrinkage・classical EB・CF-SHN と局所ベースラインを併記。）

### 表1: shrinkage 手法の比較（メイン結果, Appendix D 準拠）

| Method | Neighborhood Size | MSE Reduction | Win-Rate |
|--------|-------------------|---------------|----------|
| No Shrinkage | – | 0.0% | – |
| Classical EB | – | 1.2% | 52.7% |
| Outcome-only | q=6 | 19.6% | 74.3% |
| Process-only | q=10 | 17.9% | 71.6% |
| **CF-SHN (ours)** | **q=10** | **27.2%** | **82.4%** |

（Table 1 キャプション: "Full comparison of shrinkage methods on simulated ASOS experiments. CF-SHN achieves the largest and most stable MSE reductions across neighborhood sizes q."）
CF-SHN の平均 MSE は $3.53\times10^{-5}$（95% CI $[3.44, 3.62]\times10^{-5}$）。

### 表2: 手法比較（設計特性の対比）

| 手法 | 近傍選択の情報源 | 時間異質性への適応 | 特性・弱点 |
|------|------------------|--------------------|-----------|
| No Shrinkage | なし（借用しない） | – | 高分散、ベースライン |
| Classical (global) EB | 全実験を交換可能と仮定 | なし | 交換可能性違反でほぼ無効（1.2%） |
| Outcome-only | pilot アウトカムのみ | 間接的 | 近傍拡大で劣化（サイズ感受性大） |
| Process-only | 到着形状・規模のみ | あり | 安定だが中程度（~17.9%） |
| **CF-SHN** | プロセス + cross-fitted アウトカム | あり（二段階） | 最大かつ安定（27.2%）、$q\in[6,20]$ で >23% |

### 表3: 感度分析（Appendix E: Table 2 / Table 3 準拠）

| ハイパーパラメータ | 検証範囲 | パフォーマンス |
|---|---|---|
| $\rho$（形状-規模の重み） | 0.50–0.90 | $\rho=0.75$ でピーク 27.2%、$\ge 24\%$ で安定 |
| $M_0$（候補プールサイズ） | 20–40 | $M_0\ge 2q$ で $\ge 26\%$ と安定 |
| $q$（近傍サイズ） | 6–20 | $q=10$ でピーク、全範囲で >23% |

---

## Experiments & Evaluation

### Setup

- **データセット**: ASOS Digital Experiments（78 実験、24,153 の日次/12 時間スナップショット、2019–2020）。
- **半合成テストベッド**: 非同次ポアソン過程（nonhomogeneous Poisson process）を当てはめ、異質性を保持しつつ長期集約により近似的な ground truth を得る。
- **評価指標**: raw 推定器（no shrinkage）に対する MSE 削減率、および Win-Rate。
- **実装**: DTW 計算 約 10 分（M2 MacBook）+ 1000 ブートストラップ反復で総計 約 1 時間。cross-fitting は $K=5$ 分割、REML 発散時は ML にフォールバック。

### Main Results（具体数値）

- **CF-SHN**: MSE 削減 **27.2%**、Win-Rate **82.4%**、平均 MSE $3.53\times10^{-5}$（95% CI $[3.44, 3.62]\times10^{-5}$）。
- **Classical EB**: 削減 **1.2%**、Win-Rate 52.7% ― 交換可能性違反を裏付ける低さ。
- **Outcome-only（q=6）**: 19.6%、ただし近傍拡大で劣化。
- **Process-only（q=10）**: 17.9%、安定だが中程度。
- CF-SHN は $q\in[6,20]$ の全域で >23% の削減を維持し、頑健性を示す。

### Ablation

- **$\rho$（形状 vs 規模の重み）**: 0.50–0.90 で検証。$\rho=0.75$ でピーク 27.2%、$\ge 24\%$ で安定。
- **$M_0$（候補プール）**: 20–40 で検証。$M_0\ge 2q$ を満たせば $\ge 26\%$ と安定。
- **$q$（近傍サイズ）**: 6–20 で検証。$q=10$ でピーク、全域で >23%。
- **成分別**: プロセスのみ / アウトカムのみのいずれも CF-SHN に劣り、両者の二段階ハイブリッドが最良であることを確認。

---

## 本テーマへの適用可能性

本テーマは「**低頻度で実施される marketing campaign（クーポン・メール）を、ターゲットユーザーや treatment が異なる状態でグループ化・プールして、密なデータを合成し、実効サンプルサイズを増やし、実効的な実験間隔を短縮する**」ことを uplift modeling / off-policy evaluation の文脈で目指す。本論文はこの課題に対し、直接に近い統計基盤を与える。

- **疎な campaign のプーリングを「素朴なプール」で終わらせない**: 各 campaign を本論文の「実験（experiment）」とみなせば、CF-SHN の二段階近傍構築により、**似た campaign のみを選択的にプール**できる。全 campaign を一律にプールする古典 EB は、本論文が示す通り交換可能性違反でほぼ無効（1.2%）になり、これは「異なるターゲット・treatment の campaign を混ぜると効果が希釈される」という現場の直感と一致する。
- **borrow strength による実効サンプルサイズの増加**: 単一 campaign では観測が疎で uplift 推定の分散が大きいが、比較可能な過去/並行 campaign から選択的に借用することで、**バイアスを増やさずに分散のみを削減**できる（本論文で最大 27.2% の MSE 削減）。これは uplift/CATE 推定の安定化に直結する。
- **近傍の 2 軸が marketing 文脈にマッピングできる**:
  - *プロセス特徴（到着形状・トラフィック規模）* → campaign の配信規模・リーチ推移・エンゲージメント到着パターン。
  - *cross-fitted アウトカム* → 過去 campaign の pilot uplift 推定。ノイズ再利用を避ける cross-fitting は、少数サンプルの campaign 評価で over-fitting を防ぐうえで重要。
- **時間異質性への対応 = 実効実験間隔の短縮**: 低頻度 campaign では季節・トレンドで効果が変動する（temporal heterogeneity）。本手法は時間認識の近傍選択により、**古い campaign を「時間形状が近いものだけ」借用**するため、間隔が空いても信頼できる合成データを作れる。結果として、次の campaign 実施を待たずに意思決定を早められる（論文の "enhancing decision-making speed" に対応）。
- **off-policy evaluation への橋渡し**: local shrinkage で安定化した処置効果推定は、OPE における推定量（例: DR/IPS の効果推定）の分散低減に使える。近傍プーリングで実効データ密度を上げる発想は、疎なログしか持たない OPE の前処理として有望。
- **実装コストが軽い**: DTW + ブートストラップで約 1 時間（ノート PC 規模）。大規模 MLOps 基盤なしに、既存の campaign ログへ後付けで適用しやすい。

**留意点**: 本論文の評価は ASOS の e-commerce A/B テスト（ランダム化実験）であり、marketing campaign が観測データ・非ランダム化の場合は交絡調整（傾向スコア等）を別途要する。近傍プーリングはあくまで「分散削減の借用」であり、識別（identification）の問題は解決しない点に注意。

---

## Notes

- 本レポートの数値・キャプションは arXiv abstract ページおよび HTML 版（https://arxiv.org/html/2511.21282）から取得した。英語 Abstract は原文と一字一句一致しない可能性がある（再構成）。
- 埋め込んだ図 URL（`Reduction3.png`）は HTML 内で実在を確認したもの。他に実在する画像は LaTeXML マスコット（base64、内容と無関係）のみで、埋め込んでいない。
- Table 1–3 は Appendix D / E に配置。本文では要点数値のみ抜粋。
- 査読先・コード公開の有無は記載なし。single author（Xinran Li）。
- 主要な理論結果は Theorem 5.1（Oracle Dominance）と Theorem 5.2（Plug-in Dominance）。仮定は (1) 異質性 $\mathrm{Var}(\mu_{z_k})>0$、(2) cross-fitting による独立性、(3) 分散の有界性。
