# Federated Causal Inference from Multi-Site Observational Data via Propensity Score Aggregation (Fed-IPW / Fed-AIPW with Membership Weights)

- **Link**: https://arxiv.org/abs/2505.17961
- **Authors**: Rémi Khellaf, Aurélien Bellet, Julie Josse
- **Year**: 2025（v1: 2025-05-23、最新改訂 v4: 2026-06-11）
- **Venue**: arXiv (stat.ME — Statistics > Methodology)
- **Type**: 方法論論文（連合学習による多 site 観測データからの ATE 推定）

---

## Abstract (English)

Causal inference typically assumes centralized access to individual-level data. Yet, in practice, data are often decentralized across multiple sites, making centralization infeasible due to privacy, logistical, or legal constraints. We address this problem by estimating the Average Treatment Effect (ATE) from decentralized observational data via a Federated Learning (FL) approach, allowing inference through the exchange of aggregate statistics rather than individual-level data. We propose a novel method to estimate propensity scores via a federated weighted average of local scores using Membership Weights (MW), defined as probabilities of site membership conditional on covariates. MW can be flexibly estimated with parametric or non-parametric classification models using standard FL algorithms. The resulting propensity scores are used to construct Federated Inverse Propensity Weighting (Fed-IPW) and Augmented IPW (Fed-AIPW) estimators. In contrast to meta-analysis methods, which fail when any site violates positivity, our approach exploits heterogeneity in treatment assignment across sites to improve overlap. We show that Fed-IPW and Fed-AIPW perform well under site-level heterogeneity in sample sizes, treatment mechanisms, and covariate distributions. Theoretical analysis and experiments on simulated and real-world data demonstrate clear advantages over meta-analysis and related approaches.

## Abstract (日本語訳)

因果推論は通常、個人レベルデータへの中央集約アクセスを前提とする。しかし実務では、プライバシー・運用・法的制約により中央集約が不可能で、データが複数 site に分散していることが多い。本研究は、連合学習（Federated Learning, FL）アプローチにより分散観測データから平均処置効果（ATE）を推定し、個人レベルデータではなく集約統計量の交換のみで推論を可能にする。傾向スコアを、共変量条件付きの site 所属確率として定義される Membership Weights（MW）を用いた局所スコアの連合加重平均で推定する新手法を提案する。MW はパラメトリック/ノンパラメトリック分類モデルで標準 FL アルゴリズムを用いて柔軟に推定できる。得られた傾向スコアで Federated IPW（Fed-IPW）と Augmented IPW（Fed-AIPW）推定量を構成する。任意の site が positivity を破ると破綻するメタ分析と対照的に、本手法は site 間の処置割り当ての異質性を活用して overlap を改善する。Fed-IPW/Fed-AIPW は、サンプルサイズ・処置メカニズム・共変量分布の site 間異質性の下で良好に機能する。理論解析と模擬/実データ実験により、メタ分析および関連手法に対する明確な優位性を示す。

---

## Overview

複数 site に分散した観測データから、**個人データを共有せず集約統計量のみ**で ATE を推定する連合学習フレームワーク。核心は **Membership Weights（MW）**: 「共変量 $X$ を条件とした site 所属確率 $\omega_k(x) = \mathbb{P}(H=k|X=x)$」を用いて、各 site の局所傾向スコア $e_k(x)$ を加重平均し、**グローバル傾向スコア $e(x)$** を構成する点。

$$e(x) = \sum_{k=1}^{K}\omega_k(x)\cdot e_k(x)$$

これにより、単一 site では positivity（overlap）が破れていても、site 間の処置割り当ての異質性を活用してグローバル overlap を改善できる。メタ分析がどれか 1 site の positivity 破れで破綻するのに対し、本手法は堅牢。

## Problem（解決すべき課題）

- 因果推論は中央集約データを前提とするが、実務ではプライバシー・法規制でデータが site 分散。
- メタ分析は各 site 内で positivity（処置群・対照群双方の存在）を要求し、**どれか 1 site で破れると全体が破綻**。
- 既存の連合因果手法は共有傾向スコア構造に関する制約的仮定を要する。
- site 間でサンプルサイズ・処置メカニズム・共変量分布が異質。

## Proposed Method（提案手法）

### 中核アイデア: Membership Weights によるグローバル傾向スコア

密度比重み（DW; 共変量密度 $f_k(x)$ のモデル化が必要）の代わりに、**site 所属確率**という分類問題として MW を推定する。これは連合分類器（logistic regression、NN、gradient-boosted trees）で標準 FL アルゴリズムにより学習でき、密度モデリング不要。

### 手順（Section 3.2）

1. **局所傾向スコア**: 各 site $k$ が任意の確率的 2 値分類器で $\hat e_k(x)$ を推定。
2. **連合 Membership Weights**: 全 site が協調して多クラス分類器を FedAvg で学習し $\hat\omega_k(x)$ を得る。
3. **アウトカムモデル（AIPW のみ）**: $\hat\mu_0, \hat\mu_1$ を FL で連合学習。
4. **クロスフィッティング**: データを $J$ 分割し、nuisance を訓練 fold で学習、held-out で評価。

### Key Formulas（主要数式）

グローバル傾向スコアの分解:
$$e(x) = \sum_{k=1}^{K}\mathbb{P}(H=k|X=x)\cdot e_k(x) = \sum_{k=1}^{K}\omega_k(x)\cdot e_k(x)$$

Oracle Fed-IPW / Fed-AIPW（局所推定量の $n_k/n$ 加重和、局所推定にグローバル傾向スコアを使用）:
$$\hat\tau_{\mathrm{IPW}}^{fed*} = \sum_{k=1}^{K}\frac{n_k}{n}\hat\tau_{\mathrm{IPW}}^{fed(k)}, \qquad \hat\tau_{\mathrm{AIPW}}^{fed*} = \sum_{k=1}^{K}\frac{n_k}{n}\hat\tau_{\mathrm{AIPW}}^{fed(k)}$$

site 効果拡張（Assumption 5、site レベル共変量 $Z$ を導入し ignorability を緩和）:
$$e(X,Z) = \sum_{k=1}^{K}\mathbb{P}(H=k|X,Z)\cdot e_k(X)$$

### 理論結果

- **Theorem 3**: Oracle 連合推定量 = Oracle 中央集約推定量（同一漸近分散）。
- **Theorem 4**: 連合分散 ≤ メタ分析分散: $\mathbb{V}[\hat\tau_{\mathrm{IPW}}^{fed*}] \leq \mathbb{V}[\hat\tau_{\mathrm{IPW}}^{meta*}]$。
- **Theorem 5（overlap 改善）**: $0 \leq \mathcal{O}_{global} \leq \sum_k \rho_k\mathcal{O}_k$。グローバル overlap は常に最悪局所 overlap 以上に良い。例: $e_1(X)=0.99$, $e_2(X)=0.01$, $\omega_k=0.5$ で $e(X)=0.5$（最適）、局所 overlap は $\approx 101$。
- **Theorem 6（経験的効率）**: nuisance が $o_P(n^{-1/4})$ 収束すれば Fed-AIPW は oracle 分散・局所半パラメトリック効率を達成。

## Algorithm（擬似コード）

```text
Input: sites k=1..K, local data (X, A, Y); FL algorithm (FedAvg)
# Step 1: 各 site が局所傾向スコアを学習
for k in 1..K:
  ê_k(x) = LocalClassifier_k(A ~ X)      # 個人データは site 内に留まる

# Step 2: 連合で Membership Weights（多クラス site 所属分類）
ω̂(x) = FedAvg over sites: multiclass classifier  P(H=k | X)   # 集約統計のみ交換

# Step 3 (AIPW): アウトカムモデルを連合学習
μ̂_0, μ̂_1 = FedAvg over sites: E[Y | X, A=a]

# Step 4: グローバル傾向スコア構成 & クロスフィッティング
e(x) = Σ_k ω̂_k(x) ê_k(x)
for each site k:
  τ̂^fed(k) = local IPW/AIPW using global e(x)  (cross-fitted over J folds)
# 集約
τ̂^fed* = Σ_k (n_k/n) τ̂^fed(k)
```

## Architecture / Process Flow

```mermaid
flowchart TB
    subgraph Sites[分散 site（個人データ非共有）]
      S1[site 1: ê_1, 局所統計]
      S2[site 2: ê_2, 局所統計]
      SK[site K: ê_K, 局所統計]
    end
    S1 --> FL[FedAvg: Membership Weights ω_k(x)<br/>+ アウトカムモデル μ_0,μ_1]
    S2 --> FL
    SK --> FL
    FL --> GE[グローバル傾向スコア<br/>e(x)=Σ ω_k(x) e_k(x)]
    GE --> EST[各 site 局所 Fed-IPW/AIPW]
    EST --> AGG[n_k/n 加重集約 → ATE]
```

## Figures & Tables

### 表 1: site 効果下の MSE（K=30 sites、低いほど良い）

| Estimator | n_k=20 | n_k=60 | n_k=100 |
|-----------|--------|--------|---------|
| IPW Oracle (e*(X,Z)) | 0.853 | 0.443 | 0.091 |
| IPW Meta-SW | 5.176 | 0.777 | 0.590 |
| **IPW Fed-MW (Logit, e(X,Z))** | **0.427** | **0.132** | **0.043** |
| AIPW Oracle | 0.015 | 0.005 | 0.002 |
| AIPW Meta-SW | 10.673 | 0.346 | 0.084 |
| **AIPW Fed-MW (Logit, e(X,Z))** | **0.022** | **0.004** | **0.002** |

小 site（$n_k=20$）で Fed-MW はメタ分析（Meta-SW）を桁違いに上回る（AIPW: 0.022 vs 10.673）。

### 表 2: 局所 overlap の悪い設定でのバイアス（低いほど良い）

| Estimator | DGP A Bias | DGP B Bias |
|-----------|-----------|-----------|
| Meta-AIPW | 0.234 | 0.189 |
| Fed-IPW-MW (Logit) | 0.021 | 0.018 |
| **Fed-AIPW-MW (NN)** | **0.008** | **0.006** |

局所 overlap $\mathcal{O}_2 \approx 10^7$（ほぼ positivity 破れ）でも Fed-AIPW-MW はほぼ無バイアス。

### 表 3: overlap 改善の理論例（Theorem 5）

| 設定 | 局所 overlap | グローバル overlap e(X) |
|------|-------------|----------------------|
| e_1(X)=0.99, e_2(X)=0.01, ω_k=0.5 | ≈101（各 site とも劣悪） | 0.50（最適） |

### 表 4: 手法比較（設計上の差異）

| 手法 | 個人データ共有 | positivity 要件 | 傾向スコア推定 | overlap 活用 |
|------|--------------|---------------|--------------|------------|
| 中央集約 IPW/AIPW | 要 | 全体で 1 回 | 直接 | — |
| Meta-analysis (Meta-SW) | 不要 | **各 site 内で必須** | site 局所のみ | ✗（1 site 破れで破綻） |
| Fed-DW（密度比重み） | 不要 | 緩和 | 密度比モデル必要 | ✓（ただし高次元で不安定） |
| **Fed-IPW/AIPW-MW** | **不要** | **緩和（グローバルで満たせば可）** | **site 所属分類（密度不要）** | **✓（異質性を活用）** |

## Experiments & Evaluation

### Setup

- **合成**: DGP A & B、K=3 sites、共変量 d=10。局所 overlap を「なし/劣悪/良好」で変化。site 効果版は K=30 sites。
- **実データ**: Traumabase コホート — K=14 外傷センター、n=8,248 患者（638 treated）、共変量 17。site 間で高度に不均衡（$n_k \in [106, 2092]$、site 11 は treated 4 vs control 121）。

### Main Results

- 局所 overlap なし: メタ分析は未定義（site 2 に treated なし）だが Fed-IPW-MW / Fed-AIPW-MW は無バイアス。
- 良好 overlap: 全手法無バイアス、Fed-AIPW-MW が最小分散（メタ分析比 ~35% 分散削減）。
- 実データ Traumabase: Fed-AIPW-MW (NN) $\hat\tau = -0.052$ [-0.089, -0.015]、中央集約 RF ベンチマーク $-0.054$ [-0.091, -0.017] とほぼ一致。Meta-SW は $-0.038$（CI が広く中央集約推定からバイアス）。Fed-DW は 17 次元で不安定。

### Ablation / 比較

- Xiong et al.（2023, 1S-IVW）比: Fed-MW-NN が共有パラメータの知識なしで同等/低分散。

## 本テーマへの適用可能性

本テーマ（散発的なマーケティングキャンペーンで、対象ユーザ・施策が異なる。類似キャンペーン/ユーザをグルーピングして密度を高め、実験間隔を短縮したい）に対し、本手法の「複数 site の異質性を活用して overlap とデータ密度を高める」枠組みは概念的に強く合致する。

- **「複数キャンペーンを複数 site とみなす」統合フレーム**: 散発的な各キャンペーン（異なる時期・対象・施策）をそれぞれ 1 つの "site" とみなせば、Fed-IPW/AIPW は**個々のキャンペーンでは overlap が不十分（例: あるキャンペーンでは特定ユーザ層にしか配信していない）でも、キャンペーン横断でグローバル傾向スコアを構成することで overlap を回復**できる。Theorem 5 の「グローバル overlap ≥ 最悪局所 overlap」は、まさに「単体では推定不能なまばらキャンペーンでも、束ねれば推定可能になる」ことを保証する。
- **メタ分析（単純な結果の平均）より優位**: 実務でありがちな「各キャンペーンで別々に uplift を測って平均する」（=メタ分析）は、どれか 1 つのキャンペーンで対照群/処置群の一方が欠けると破綻する。本手法はそれを回避し、まばらキャンペーンの情報も捨てずに使うため、**実効サンプルサイズを最大化**する。表 1 の小 site（$n_k=20$）での圧倒的優位は、少数配信の散発キャンペーンにそのまま当てはまる。
- **Membership Weights = キャンペーン所属確率**: MW は「この共変量プロファイルのユーザはどのキャンペーンに割り当たりやすいか」を学習する。これは本テーマの「類似ユーザ/キャンペーンのグルーピング」を確率的ソフト割り当てで実現しており、明示的なクラスタリング不要で密度合成に寄与する。
- **site 効果拡張がキャンペーン固有要因を吸収**: Assumption 5 の site レベル共変量 $Z$ は、「キャンペーン固有の時期効果・チャネル効果」を吸収する仕組みとして使える。これにより、時期の異なる散発キャンペーンを ignorability を保ちつつ統合できる。
- **プライバシー/組織境界**: 本来は個人データ非共有が目的だが、マーケティングでは「異なるチームやパートナー企業のキャンペーンデータを個人情報を出さずに統合」する用途にも直結する。
- **注意点**: 「site 内で局所傾向スコアを正確に学習できる程度のサンプルは各 site に必要」と論文自身が限界を明記しており、**極端に小さいキャンペーンばかりでは局所傾向スコア推定が不安定**。中規模〜大規模のサイロが複数ある状況で最も効果を発揮する。また ATE 推定が主眼で、CATE/uplift への拡張は future work（傾向スコアを T/S/X/R-learner に組み込む案が示唆）。

## Notes

- 手法名: Membership Weights (MW)、Fed-IPW、Fed-AIPW。ベースライン: Meta-analysis（Meta-SW）、Fed-DW（密度比重み）、Xiong et al. 2023（1S-IVW）、中央集約 RF。
- 実データは医療（Traumabase）。マーケティングへの適用は本テーマ側の類推。
- コード公開の有無は取得情報からは**記載なし**。
- 表 2 の DGP A/B バイアス値、35% 分散削減はソース要約に基づく報告値。図（Figure 2/3）の具体的画像 URL は取得要約に含まれなかったため画像埋め込みは行っていない。
