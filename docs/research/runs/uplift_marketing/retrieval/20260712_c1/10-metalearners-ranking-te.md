# Metalearners for Ranking Treatment Effects

- **Link**: https://arxiv.org/abs/2405.02183
- **Authors**: Toon Vanderschueren, Wouter Verbeke, Felipe Moraes, Hugo Manuel Proença
- **Year**: 2024（2024-05-03 投稿）
- **Venue**: arXiv (cs.LG)
- **Type**: 手法提案（decision-focused learning-to-rank meta-learner）

---

## Abstract (English)

> Efficiently allocating treatments with a budget constraint constitutes an important challenge across various domains. In marketing, for example, the use of promotions to target potential customers and boost conversions is limited by the available budget. While much research focuses on estimating causal effects, there is relatively limited work on learning to allocate treatments while considering the operational context. Existing methods for uplift modeling or causal inference primarily estimate treatment effects, without considering how this relates to a profit maximizing allocation policy that respects budget constraints. The potential downside of using these methods is that the resulting predictive model is not aligned with the operational context. Therefore, prediction errors are propagated to the optimization of the budget allocation problem, subsequently leading to a suboptimal allocation policy. We propose an alternative approach based on learning to rank. Our proposed methodology directly learns an allocation policy by prioritizing instances in terms of their incremental profit. We propose an efficient sampling procedure for the optimization of the ranking model to scale our methodology to large-scale data sets. Theoretically, we show how learning to rank can maximize the area under a policy's incremental profit curve. Empirically, we validate our methodology and show its effectiveness in practice through a series of experiments on both synthetic and real-world data.

## Abstract (日本語)

予算制約下での効率的な処置割当は多分野の重要課題である。例えばマーケティングでは、見込み顧客を狙いコンバージョンを高めるプロモーションが予算に制約される。因果効果の推定に多くの研究が集中する一方、運用文脈を考慮した処置割当の学習は比較的手薄である。既存の uplift modeling や因果推論は主に処置効果を推定するのみで、予算制約を尊重する利益最大化割当ポリシーとの関係を考慮しない。その結果、予測モデルが運用文脈と整合せず、予測誤差が予算割当最適化に伝播し次善のポリシーを生む恐れがある。本論文は **learning to rank** に基づく代替手法を提案する。本手法はインスタンスを **増分利益（incremental profit）** で順位付けし割当ポリシーを直接学習する。ランキングモデル最適化のための効率的なサンプリング手続きを提案し大規模データにスケールさせる。理論的には learning to rank がポリシーの増分利益曲線の面積を最大化できることを示す。合成・実世界データでの実験で有効性を実証する。

---

## Overview

本論文は「効果推定（MSE 最小化）」と「予算割当（順位付け）」のミスアライメント問題を、**decision-focused な learning-to-rank** で解決する。核心は、予算 $B$ が一様分布と仮定すると割当ポリシーの価値（AUQC = Area Under Qini Curve）が NDCG と一致するという理論的等式であり、これにより listwise ランキング目的が評価指標を直接最適化する。既存の全 meta-learner（Z-, S-, T-, X-, DR-, R-learner）をランキング目的（pointwise/pairwise/listwise）で再学習し、$k=1$ の効率サンプリングで $O(n^2)$ を $O(n)$ に落とす。複数クーポン額を予算内で最適配分する本テーマにとって、「推定より割当そのものを学習する」設計思想が直接刺さる。

---

## Problem（課題の整理）

- 予算制約下の処置割当は marketing など多分野の課題。
- 既存 uplift/因果推論は効果推定（MSE 最小化）に注力し、利益最大化割当と整合しない。
- 予測モデルが運用文脈（予算・利益）と非整合だと、予測誤差が最適化に伝播し次善ポリシーに。
- MSE は割当品質（順位）の良い指標ではない（低 MSE でも順位が悪い例が存在）。
- pairwise/listwise ランキングは $O(n^2)$ で大規模データに非スケーラブル。

---

## Proposed Method: Learning-to-Rank Metalearners

### 核心アイデア

処置効果の点推定ではなく「増分利益による順位付け」を直接学習する。予算 $B$ が一様分布 $B\sim U(1,n)$ と仮定すると、割当ポリシーの価値 AUQC が listwise ランキング指標 NDCG と厳密に一致する。よって listwise 損失で学習すれば評価指標を直接最適化できる。

### 手順（numbered steps）

1. 各 meta-learner（Z/S/T/X/DR/R）の最終段の損失を、MSE から **ランキング損失**（pointwise/pairwise/listwise）に置換。
2. pairwise は RankNet 型シグモイド、listwise は LambdaMART の $\Delta$NDCG 重み付け。
3. $O(n^2)$ を避けるため、各インスタンスに対し $k$ 個のランダムペアのみサンプリング（$k=1$ で十分）。
4. LightGBM のカスタム目的として実装。
5. AUQC で評価。

### Key Formulas

割当最適化問題:

$$ \max_{t_i}\ \sum_i \tau_i(t_i)\quad \text{s.t.}\ \sum_i t_i \le B,\ t_i\in\{0,1\} $$

AUQC（Qini 曲線下面積, $B\sim U(1,n)$）:

$$ \text{AUQC} = \sum_{k=1}^{n}\sum_{i=1}^{k}\tau_i $$

pairwise 損失（RankNet 型, $\hat y_{i,j}=1/(1+\exp(-\sigma(\hat y_i-\hat y_j)))$）:

$$ L_{Pair} = \sum_i\sum_j\big[-y_{i,j}\log(\hat y_{i,j}) - (1-y_{i,j})(1-\log(\hat y_{i,j}))\big] $$

listwise 損失（LambdaMART, NDCG 重み）:

$$ L_{List} = \sum_i\sum_j \big[\text{pairwise\_loss}\big]\times \Delta\text{NDCG}_{i,j} $$

核心的等式（AUQC = NDCG, gain $g_i=\tau_i$, discount $d(i)=n-i+1$）:

$$ \text{AUQC} = \sum_i \tau_{\pi_i}(n-i+1) = \text{NDCG} $$

効率サンプリング（$J\sim (U[1,\dots,n])^k$）:

$$ L_{Pair} = \sum_i\sum_{j\in J}\big[-y_{i,j}\log(\hat y_{i,j}) - \dots\big] $$

---

## Algorithm（Pseudocode）

```
Input: {(X_i, T_i, Y_i)}, metalearner M, objective in {point, pair, list}, k
1: compute pseudo-outcome / target per metalearner M   # Z/S/T/X/DR/R
2: for each boosting iteration (LightGBM):
3:     for each instance i:
4:         sample J ~ (U[1..n])^k          # k random partners (k=1 works)
5:         if objective == pair:
6:             loss += RankNet(y_i, y_j) for j in J
7:         elif objective == list:
8:             loss += RankNet(y_i, y_j) * Delta_NDCG(i,j)
9:         else: # pointwise
10:            loss += (y_i - y_hat_i)^2
11:    update model on gradient of loss
12: return ranking model  # scores prioritize by incremental profit
```

---

## Architecture / Process Flow

```
 (X,T,Y) ──► metalearner target
              (Z/S/T/X/DR/R の疑似アウトカム)
                   │
                   ▼
        LightGBM + ランキング目的
        ┌───────────────────────────┐
        │ pointwise: MSE             │
        │ pairwise : RankNet (k=1)   │◄── O(n) サンプリング
        │ listwise : LambdaMART ΔNDCG│
        └───────────────────────────┘
                   │
             増分利益スコア
                   │
        予算 B 内で上位から割当 ──► AUQC = NDCG を直接最大化
```

---

## Figures & Tables（主要図表）

### Table 1: メタ学習器 × ランキング適応（手法比較）

| Metalearner | コア戦略 | ランキング適応 |
|---|---|---|
| Z-Learner | 変換アウトカム $z_i=y_i/\hat e_i$（treated）等 | pairwise/listwise で学習 |
| S-Learner | 単一モデル $f_S(x,t)$; $\hat\tau=f_S(x,1)-f_S(x,0)$ | ランキング損失で学習、スコア差で効果 |
| T-Learner | 群別2モデル $f_{T_1},f_{T_0}$ | 両モデルを独立にランキング学習 |
| X-Learner | imputed 効果 $D^t$ → 傾向重み付き2モデル | 最終段でランキング目的 |
| DR-Learner | doubly robust 疑似アウトカム $\phi_i$ | $\phi$ をランキング損失で学習 |
| R-Learner | Robinson 分解の重み付き MSE | MSE を重み付き pairwise/listwise に置換 |

### Table 2: MSE と順位のミスアライメント例

| モデル | MSE | 順位品質 |
|---|---|---|
| Model 1 | 0.17（低い） | 悪い |
| Model 2 | 0.17 より高い | 正しい順位 |

（低 MSE が良い割当を意味しないことを示す例。）

### Figure 2: 目的 × メタ学習器の勝敗（AUQC 基準, 全 30 ケース）

| 目的 | 最良となったケース数 |
|---|---|
| listwise | 16 / 30 |
| pointwise | 7 / 30 |
| listwise > pointwise | 20 / 30 |

（メタ学習器別の相性: listwise が Z-/X-/R-Learner に有利、pairwise が S-Learner、pointwise が DR-Learner に好適。）

### Figure 3: 指標と AUQC の相関（合成データ）

| 指標 | AUQC との相関 |
|---|---|
| Kendall τ | $\rho > 0.9$（ランキングモデル） |
| MSE | ほぼ 0（非整合を示す） |

### Figure 4: サンプリング反復数 $k$ の感度
$k=1$ でほぼ最適、$k>10$ で有意な AUQC 改善なし（S/T-Learner 非正規化版はやや向上）。

（各図の img 直接 URL は抽出範囲では 記載なし。）

---

## Experiments & Evaluation

### Setup
- **データ**: (1) 合成（EC 想定, 10,000 サンプル, $d=10$）、(2) Criteo（500,000 サンプル, アウトカム = conversion − visit）、(3) Hillstrom（メールキャンペーン, 男性/女性別）、(4) Promotion Campaign（オンライン旅行代理店実データ）。
- **プロトコル**: 5-fold CV、64%/16%/20% 分割、ハイパラは10反復ランダムサンプリング（num_leaves∈[10,50], lr∈[0.01,0.20], max_depth∈[3,10], min_data_in_leaf∈[10,30]）。
- **実装**: LightGBM カスタム目的。
- **指標**: 主 AUQC、副 MSE・Kendall τ。
- **予算仮定**: $B\sim U(1,n)$。

### Main Results（RQ 別）
- **RQ1（目的×学習器）**: listwise が 30 ケース中 16 で最良、pointwise は 7 のみ。listwise は pointwise を 20/30 で上回る。
- **RQ2（指標整合）**: Kendall τ は AUQC と $\rho>0.9$ で強相関、MSE は AUQC とほぼ無相関（効果推定 MSE が割当品質の代理にならないことを実証）。
- **RQ3（$k$ 感度）**: $k=1$ で最適、$k>10$ で有意改善なし。$O(n)$ で pointwise 同等の計算量。

### Ablation
- デフォルト設定（$k=1$, sigmoid $\sigma=1$, スコア正規化）が多くのメタ学習器・目的で良好。
- メタ学習器の選択は目的の選択と「少なくとも同等に重要」。

---

## 本テーマへの適用可能性

本テーマ（複数クーポン額を予算内で最適配分し per-user に uplift を効かせる）に対し、本論文は「推定精度ではなく割当品質を直接最適化する」という決定整合の方法論を提供する。

- **予算制約付き割当そのものを学習**: 不定期マーケでは「限られた予算で誰にクーポンを配るか」の順位付けが本質。本手法は増分利益で順位付けする割当ポリシーを直接学習し、AUQC（= 予算一様下の Qini 面積）を最大化する。「上位 k を選ぶ」実運用と目的関数が一致する。
- **既存 meta-learner を差し替えなく強化**: S/T/X/DR/R-learner の最終段損失を MSE からランキング損失に替えるだけ。07 で選定した S-learner 土台の base estimator を、そのままランキング目的で再学習して割当性能を上げられる。**pooled base estimator と decision-focused 最適化を両立**できる。
- **MSE 非整合問題への直接処方**: スパースキャンペーンで MSE を下げても割当が改善しないことは実務でよくあるが、本論文はこれを定量化（MSE–AUQC 相関ほぼ 0）し、Kendall τ / AUQC を検証指標に使うべきと示す。オフライン評価の指標設計に直結する。
- **大規模スケール**: $k=1$ サンプリングで $O(n)$ に収まり、Criteo 50万件規模でも回る。複数キャンペーンをプールした大規模データにスケールする。
- **多値・連続処置への拡張留意**: 本論文の主対象は binary 処置の割当順位付け。複数クーポン額（多値/連続）へ直接適用するには、07（多値 meta-learner）や 08/09（連続処置 CADR/GCF）で per-dose 効果を推定し、その上で本手法のランキング割当を各用量に対して適用する二段構成が現実的。決定整合を重視するなら、08 の predict-then-optimize より本手法（decision-focused）が誤差伝播を抑えられる点で優位になりうる。

---

## Notes

- decision-focused learning を uplift 割当に持ち込み、AUQC = NDCG の等式で理論的裏付けを与えた点が新規。
- 実装は LightGBM カスタム目的。明示的リポジトリは本文抽出範囲では 記載なし。
- 主対象は binary 処置割当。多値/連続クーポン額へは他手法との併用が前提。
- 図の img 直接 URL は抽出範囲では 記載なし。
