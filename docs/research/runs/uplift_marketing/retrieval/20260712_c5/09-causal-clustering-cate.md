# Causal Clustering for Conditional Average Treatment Effects Estimation and Subgroup Discovery

- **Link**: https://arxiv.org/abs/2509.05775 / HTML: https://arxiv.org/html/2509.05775
- **Authors**: Zilong Wang, Turgay Ayer, Shihao Yang
- **Year**: 2025
- **Venue**: IEEE EMBS BHI 2025（submitted for publication／arXiv 2509.05775）
- **Type**: 手法提案論文（causal inference × unsupervised clustering）

---

## Abstract (English)

> Estimating heterogeneous treatment effects is critical in domains such as personalized medicine, resource allocation, and policy evaluation. A central challenge lies in identifying subpopulations that respond differently to interventions, thereby enabling more targeted and effective decision-making. While clustering methods are well-studied in unsupervised learning, their integration with causal inference remains limited. We propose a novel framework that clusters individuals based on estimated treatment effects using a learned kernel derived from causal forests, revealing latent subgroup structures. Our approach consists of two main steps. First, we estimate debiased Conditional Average Treatment Effects (CATEs) using orthogonalized learners via the Robinson decomposition, yielding a kernel matrix that encodes sample-level similarities in treatment responsiveness. Second, we apply kernelized clustering to this matrix to uncover distinct, treatment-sensitive subpopulations and compute cluster-level average CATEs. We present this kernelized clustering step as a form of regularization within the residual-on-residual regression framework. Through extensive experiments on semi-synthetic and real-world datasets, supported by ablation studies and exploratory analyses, we demonstrate the effectiveness of our method in capturing meaningful treatment effect heterogeneity.

## Abstract (日本語訳)

> 異質な処置効果（heterogeneous treatment effects）の推定は、個別化医療、リソース配分、政策評価などの領域で決定的に重要である。中心的な課題は、介入に対して異なる反応を示す部分集団（subpopulation）を特定し、より狙いを定めた効果的な意思決定を可能にすることにある。クラスタリング手法は教師なし学習で十分に研究されてきたが、因果推論との統合は依然として限定的である。本論文では、causal forest から導出した「学習済みカーネル」を用いて推定処置効果に基づき個体をクラスタリングし、潜在的な部分集団構造を明らかにする新しいフレームワークを提案する。本手法は 2 つの主要ステップから成る。第一に、Robinson decomposition による直交化学習器（orthogonalized learners）を用いてバイアス除去された Conditional Average Treatment Effect（CATE）を推定し、処置反応性におけるサンプル間類似度を符号化したカーネル行列を得る。第二に、このカーネル行列に対してカーネル化クラスタリングを適用し、処置感受性の異なる部分集団を発見し、クラスタ単位の平均 CATE を算出する。このカーネル化クラスタリング段階は、residual-on-residual 回帰フレームワーク内の一種の正則化として位置づけられる。半合成データおよび実世界データにおける広範な実験と、ablation study・探索的分析を通じて、意味のある処置効果異質性を捉える本手法の有効性を示す。

---

## Overview（概要）

本研究は、個体レベルで推定された CATE を単に予測するだけでなく、**「似た処置反応を持つ個体を同一クラスタにまとめ、クラスタ単位で処置効果を安定推定する」** ことを目的とした因果クラスタリング（causal clustering）フレームワークを提案する。

キーとなる着想は、causal forest が本質的に「隣接性（近さ）を測る適応的カーネル」を学習しているという点である。従来のクラスタリングは特徴量空間上のユークリッド距離（例: RBF カーネル）で近さを測るが、それは必ずしも「処置効果が近い」ことを意味しない。本手法は forest から抽出した重み $\alpha$ を用いてカーネル行列を構成し、**処置効果の観点で近い個体**をクラスタリングする。さらにこのクラスタリングを、Robinson の residual-on-residual 回帰に対する **正則化（regularization）** として理論的に位置づけている点が新規性である。

---

## Problem（課題）

- 標準的な処置効果分析は平均処置効果（ATE）のみを報告し、集団内の反応差（heterogeneity）を覆い隠してしまう。
- 個体レベル CATE $\hat\tau(X_i)$ は分散が大きく、単体では信頼性が低い（推定が不安定）。
- クラスタリングと因果推論の統合が進んでいない。特徴量ベースのクラスタリング（RBF カーネル等）は「特徴が近い」個体をまとめるが、それが「処置効果が近い」保証はない。
- thresholding ベースのサブグループ抽出は恣意的なカットオフに依存し、非単調な異質性（non-monotonic heterogeneity）を捉えられない。
- CRE のようなツリールールベース手法はクラスタ数を直接指定できず、標準的な ML ライブラリと親和性が低い。
- 発見した部分集団は「解釈可能」であってほしい（どの特徴がクラスタ分離を駆動しているか説明できること）。

---

## Proposed Method（提案手法）

### 中核アイデア

causal forest が学習する適応的近傍重み $\alpha_{j,i}$ を「処置効果類似度カーネル」として再利用し、そのカーネル上で convex clustering を行う。これにより、特徴量空間ではなく**処置反応空間**で個体をグループ化する。クラスタリングは residual-on-residual 回帰に対する $\ell_1$ 正則化（fusion penalty）として解釈される。

### 手順（numbered steps）

1. **Robinson decomposition による残差化**: nuisance 関数 $m(x,w)=\mathbb{E}[Y|X=x,W=w]$ と傾向スコア $e(x)=P(W=1|X=x)$ を推定し、アウトカム残差 $\tilde Y_i$ と処置残差 $\tilde W_i$ を作る（cross-fitting により過学習を防止）。
2. **CATE 推定（R-learner）**: residual-on-residual 回帰で debiased CATE $\hat\tau(X_i)$ を推定する。
3. **forest カーネル抽出**: 学習済み causal forest の各木の葉における共起頻度から重み $\alpha_{j,i}$ を計算し、カーネル行列 $K_{j,k}$ を外積和で構成する。
4. **カーネル化 convex clustering**: カーネル $\hat K^{(HF)}$ を fusion weight とした convex clustering を解き、$U_i=U_j$ となる個体を同一クラスタに割り当てる。
5. **クラスタ単位 CATE 算出**: 各クラスタ $\mathcal C_c$ の平均 CATE $\bar\tau_c$ を集計し、これをクラスタ内個体の効果推定値とする。
6. **クラスタ数選択**: eigengap 法などでクラスタ数 $k$ を決定する。

### Key Formulas

**Robinson decomposition（残差化された関係式）:**

$$\underbrace{Y_i - m(X_i, W_i)}_{\text{outcome residual}} = \underbrace{\{W_i - e(X_i)\}}_{\text{propensity residual}} \cdot \underbrace{\tau(X_i)}_{\text{CATE}} + \varepsilon_i$$

**R-learner の損失最小化:**

$$\tau^*(\cdot) := \arg\min_{\tau \in \mathcal{H}} \left(\frac{1}{n}\sum_{i=1}^n \{\tilde{Y}_i - \tilde{W}_i\tau(X_i)\}^2 + \Lambda(\tau)\right)$$

**forest 近傍重み（葉の共起頻度）:**

$$\alpha_{j,i} := \frac{1}{B}\sum_{b=1}^B \frac{\mathbb{1}\{X_j \in L_b(X_i)\}}{|L_b(X_i)|}$$

**カーネル行列（重みの外積和）:**

$$K_{j,k} = \sum_{i=1}^n \alpha_j(X_i)\alpha_k(X_i)$$

**カーネル化 convex clustering（fusion penalty 付き）:**

$$\min_{U \in \mathbb{R}^n} \sum_{i=1}^n \|U_i - \hat{\tau}_i^{(HF)}\|_2^2 + \lambda\sum_{i<j} \hat{K}^{(HF)}(X_i, X_j)\|U_i - U_j\|_1$$

ここで $U_i=U_j$ が成立する個体対が同一クラスタに属す（hard membership）。

---

## Algorithm（擬似コード / Pseudocode）

```
Input : {(X_i, W_i, Y_i)}_{i=1..n}, 木の本数 B, penalty λ, cluster 数 k
Output: クラスタ割当 {c_i}, クラスタ平均 CATE {τ̄_c}

# --- Stage 1: debiased CATE (R-learner + cross-fitting) ---
folds ← split(1..n)                         # cross-fitting 用
for each fold f:
    m̂, ê ← fit nuisance(m, e) on ¬f          # 別 fold で学習
    Ỹ_i  ← Y_i - m̂(X_i, W_i)   for i in f    # outcome residual
    W̃_i  ← W_i - ê(X_i)        for i in f    # propensity residual
τ̂(·) ← argmin_τ (1/n) Σ (Ỹ_i - W̃_i τ(X_i))^2 + Λ(τ)   # residual-on-residual

# --- Stage 2: forest kernel ---
train causal forest with B trees on residualized data
for all (j, i): α_{j,i} ← (1/B) Σ_b 1{X_j ∈ L_b(X_i)} / |L_b(X_i)|
K_{j,k} ← Σ_i α_j(X_i) α_k(X_i)             # 外積和

# --- Stage 3: kernelized convex clustering ---
U* ← argmin_U Σ_i ||U_i - τ̂_i||^2
              + λ Σ_{i<j} K̂_{ij} ||U_i - U_j||_1
c_i ← group by (U*_i == U*_j)               # hard membership
for each cluster c: τ̄_c ← mean_{i∈C_c} τ̂_i

# --- cluster 数選択 ---
k ← eigengap(K)                             # 固有値ギャップ最大点
return {c_i}, {τ̄_c}
```

---

## Architecture / Process Flow

```
   (X, W, Y)  観測データ
        │
        ▼
 ┌──────────────────────────┐
 │ Stage 1: Robinson decomp │  nuisance m(x,w), e(x) を cross-fitting で推定
 │  → 残差 Ỹ, W̃            │  → R-learner で debiased CATE τ̂(X_i)
 └──────────────────────────┘
        │  residualized data
        ▼
 ┌──────────────────────────┐
 │ Stage 2: Causal Forest    │  各木の葉の共起頻度 α_{j,i}
 │  → learned kernel K       │  K_{j,k}=Σ_i α_j α_k（処置効果類似度）
 └──────────────────────────┘
        │  kernel matrix K
        ▼
 ┌──────────────────────────┐
 │ Stage 3: Kernelized       │  min ||U-τ̂||^2 + λ Σ K_ij ||U_i-U_j||_1
 │  Convex Clustering        │  U_i=U_j → 同一クラスタ
 └──────────────────────────┘
        │
        ▼
   クラスタ割当 c_i + クラスタ平均 CATE τ̄_c
   （eigengap で k を選択）
```

---

## Figures & Tables

> 注: arXiv HTML 内の図は相対パス（例 `Figures/combined_CATE_plot.png`）で参照されており、埋め込み可能な絶対 URL は取得できなかったため、以下では図のファイル名と内容のみ記載する。数値は本文・表から抽出した実測値。

### 図一覧（ファイル名のみ、HTML 内で参照確認）

| Fig | ファイル名 | 内容 |
|-----|-----------|------|
| Fig.1 | `cluster_assignments_truek_4_noise_0.5_seed_42.png` | 真の k=4・低ノイズでのクラスタ割当可視化 |
| Fig.2 | `adversarial_pehe_arrows_n800.0.png` | adversarial シナリオでの PEHE 変化（arrow plot, n=800） |
| Fig.3 | `combined_CATE_plot.png` | CATE 分布の統合プロット |
| Fig.4 | `adversarial_reconstructed_CATE.png` | クラスタリングによる CATE 応答面再構成 |
| Fig.5 | `Synthea/Synthea_Cluster_Features.png` | Synthea 実データのクラスタ別特徴分布 |
| Fig.6/7 | `lalonde_cf_cluster.png` / `lalonde_cf_feature_cluster.png` | LaLonde データの forest vs 特徴ベースクラスタ |

### Table I — 主要結果: 半合成 IHDP ablation（k=2〜6, PEHE 低いほど良い）

| k | Method | PEHE | V_within | V_out |
|---|--------|------|----------|-------|
| 2 | Cross Fitted | **3.60** | 9.53 | 48.16 |
| 2 | RBF Cross Fitted | 4.18 | 16.62 | 38.01 |
| 2 | CRE | 4.05 | 2.04 | 67.59 |
| 3 | Cross Fitted | **3.28** | 4.85 | 121.38 |
| 4 | Cross Fitted | **3.19** | 3.15 | 205.81 |
| 5 | Cross Fitted | **3.08** | 2.07 | 266.45 |
| 6 | Cross Fitted | **3.08** | 1.89 | 268.94 |

要点: cross-fitted forest カーネルは、全クラスタ数で特徴ベース RBF カーネルおよび CRE を PEHE で上回る。k を増やすほど PEHE は単調に改善（3.60 → 3.08）し、V_within は減少（9.53 → 1.89）する。

### Table II — アーキテクチャ/クラスタ数選択法の比較（n=1200, K∈{2,…,6}）

| Method | ARI | NMI | PEHE |
|--------|-----|-----|------|
| **Eigengap** | **0.8873** | **0.8688** | 0.4989 |
| Elbow | 0.7052 | 0.7128 | 0.8301 |
| Gap Statistic | 0.8209 | 0.7792 | 0.4993 |
| Silhouette | 0.8510 | 0.8113 | 0.4993 |
| Causal Forest (baseline) | 記載なし | 記載なし | 0.5272 |

要点: eigengap 法が ARI/NMI とも最高で、真のクラスタ数を最も安定に回復する。

### Table III — 手法比較（提案手法 vs ベースライン、本文記述より整理）

| 比較対象 | 提案手法（forest kernel clustering）の優位点 |
|----------|---------------------------------------------|
| 特徴ベース RBF clustering | 処置効果に情報を持つカーネルで CATE 関連類似度を捉える。PEHE が優れる |
| Thresholding アプローチ | 恣意的カットオフ不要。非単調な異質性も捕捉 |
| CRE（tree-based rules） | クラスタ数を直接指定可能。標準 ML ライブラリと互換 |
| RBF Oracle（真の CATE 使用） | 真の効果へアクセスせずに oracle 性能に接近 |

---

## Experiments & Evaluation（実験と評価）

### Setup

- **評価指標**:
  - PEHE（Precision in Estimation of Heterogeneous Effects）: $\sqrt{\frac{1}{n}\sum_i(\hat\tau_i^{(cluster)}-\tau_i)^2}$
  - Within-cluster variance $V_{\text{within}}$, Between-cluster variance $V_{\text{out}}$
  - ARI（Adjusted Rand Index, -1〜1）, NMI（Normalized Mutual Information）
- **識別仮定**: consistency / unconfoundedness / positivity
- **データ**:
  - 半合成: IHDP（Table I の ablation）
  - adversarial simulation: 滑らかな複雑応答面
  - 実データ: Synthea viral sinusitis（6,000 患者）, LaLonde
- **実装**: causal forest は R の `grf` パッケージ。honest estimation により train/inference サンプルを分離。Stage 1 を再学習せずに新規テストデータへクラスタリング適用可能。

### Main Results（数値付き）

- IHDP（Table I）: cross-fitted 手法が k=2 で PEHE **3.60**、k=6 で **3.08** と、RBF Cross Fitted（k=2: 4.18）や CRE（k=2: 4.05）を一貫して上回る。
- クラスタ数選択（Table II）: eigengap が ARI **0.8873** / NMI **0.8688** / PEHE 0.4989 で最良。causal forest baseline は PEHE 0.5272。

### Adversarial Simulation

- 応答関数: $\zeta(X) = 1 + \frac{2}{1 + \exp(-20(x - 1/3))}$、$\tau(X_i) = \zeta(X_{i1})\zeta(X_{i2})$
- 設定: $n\in\{800,1000,1200\}$, $p=20$, ノイズ $\sigma\in\{1,2,3,4\}$, テスト $n=2000$
- Excess Risk（未クラスタ推定器に対する性能ペナルティ）で評価。
- 結果: 低ノイズ（$\sigma=2$）ではクラスタリングによる性能低下は軽微、高ノイズ域では劣化が最小。6 クラスタで真の応答面を "limited fidelity loss" で再構成。

### Real-World: Synthea Viral Sinusitis

- コホート: viral sinusitis 診断の 6,000 患者。chronic sinusitis の有無が処置傾向と効果の双方に影響（交絡）。
- 特徴: 7 併存疾患（asthma, allergy, anemia, flu, hypertension, obesity, pregnancy）＋条件間の時間距離指標。
- k=3（eigengap 選択）。
- 結果: 無関係な併存疾患はクラスタ間で分布がほぼ同一、一方 chronic/viral sinusitis の診断タイミングなど**処置関連特徴**がクラスタ分離を駆動 → 解釈可能な subgroup 構造を確認。

### Ablation（要約）

- Table I の k=2〜6 スイープが ablation を兼ねる。クラスタ数増加で PEHE と $V_{\text{within}}$ が改善する一方、$V_{\text{out}}$ は増大（クラスタ間分離が強まる）。
- カーネル種別 ablation（Cross Fitted vs RBF Cross Fitted）: 全 k で forest カーネルが RBF を上回る。

---

## 本テーマへの適用可能性

**想定シナリオ**: データサイエンティストが低頻度のマーケティングキャンペーン（施策）を実施しており、処置効果（uplift）が高く・かつクラスタ内で均質な subgroup を発見して、類似ユーザーをまとめ、効果を安定推定・転用したい。

本論文の枠組みは、この課題に対して以下の点で直接的に有用である。

1. **個体 uplift の不安定さをクラスタ集約で緩和**: マーケティングでは 1 人ずつの CATE（uplift）$\hat\tau(X_i)$ は分散が大きく、低頻度施策では特にサンプルが少なく推定が荒れる。本手法は forest カーネルで「uplift 反応が近いユーザー」をまとめ、クラスタ平均 $\bar\tau_c$ を用いることで推定を安定化する。Table I が示す通り、クラスタ数を増やすと PEHE も $V_{\text{within}}$ も改善しており、**「効果が均質な subgroup へ集約する」ことが精度を損なわず、むしろ安定化に寄与**する。

2. **特徴が近い ≠ 効果が近い、を回避**: 一般的な RBF/ユークリッド距離クラスタリング（デモグラ属性で束ねる等）は、必ずしも uplift の近さを保証しない。本手法の forest kernel は処置反応空間で近さを測るため、**「反応するユーザー群 vs 反応しないユーザー群」を狙って分離**できる。マーケでいう persuadables（説得可能層）と sleeping dogs（逆効果層）の切り分けに適合する。

3. **効果の転用（transfer）と新規ユーザーへの適用**: 本手法は Stage 1 を再学習せずに新規テストデータへクラスタリングを適用できる。つまり、過去キャンペーンで学習した subgroup 構造を、次回キャンペーンの新規ユーザーに割り当て、そのクラスタ平均 uplift を初期推定として転用できる。低頻度施策で新規データが乏しい状況に有効。

4. **解釈可能なセグメント定義**: Synthea 実験のように「無関係な特徴はクラスタ間で分布が変わらず、効果関連特徴だけが分離を駆動する」性質は、マーケでは **どの属性・行動ログが uplift を左右しているか** をステークホルダーに説明する材料になる。ターゲティングルールの言語化に直結する。

5. **クラスタ数選択の実務判断**: eigengap 法（Table II で ARI 0.8873）を用いれば、恣意的にセグメント数を決めずにデータ駆動でセグメント粒度を決められる。キャンペーンの配信リスト設計（何セグメントに分けるか）の根拠づけに使える。

**留意点**: 本論文の検証は医療系（IHDP, Synthea）と経済系（LaLonde）中心であり、マーケティング CV データ（不均衡・スパース・大規模）での検証は本論文には含まれない（記載なし）。unconfoundedness / positivity の仮定は、施策配信ログが完全ランダム化されていない場合に注意が必要。低頻度施策では forest 学習に十分なサンプルが確保できるかが実務上の律速となる。

---

## Notes（備考）

- 本手法の理論的な位置づけ: kernelized convex clustering を residual-on-residual 回帰の **fusion penalty 型正則化**として定式化した点が新規性。$\|U_i-U_j\|_1$ による融合により、近い個体の推定値が自動的に一致（=クラスタ化）する。
- 実装は R の `grf` パッケージ（generalized random forests）に依拠。cross-fitting と honest estimation を併用して過学習を抑制。
- 図の絶対 URL は HTML から取得できなかったため未埋め込み（相対パスのみ確認）。ファイル名は上記 Figures 表に整理。
- Table II の Causal Forest baseline の ARI/NMI は本文で明示されず「記載なし」。
- Venue は IEEE EMBS BHI 2025 への submitted 段階（arXiv プレプリント 2509.05775, 2025）。
