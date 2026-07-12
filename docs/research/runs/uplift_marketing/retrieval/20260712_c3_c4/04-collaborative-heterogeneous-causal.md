# Collaborative Heterogeneous Causal Inference Beyond Meta-analysis

- **Link**: https://arxiv.org/abs/2404.15746 / HTML: https://arxiv.org/html/2404.15746v1 / PDF: https://arxiv.org/pdf/2404.15746 / PMLR: https://proceedings.mlr.press/v235/guo24c.html
- **Authors**: Tianyu Guo, Sai Praneeth Karimireddy, Michael I. Jordan
- **Year**: 2024 (arXiv 提出日: 2024-04-24)
- **Venue**: ICML 2024 (Proceedings of the 41st International Conference on Machine Learning, PMLR v235, pp. 16849–16868)
- **Type**: 学会論文 (統計的因果推論 / フェデレーテッド学習)

---

## Abstract (English, verbatim)

> Collaboration between different data centers is often challenged by heterogeneity across sites. To account for the heterogeneity, the state-of-the-art method is to re-weight the covariate distributions in each site to match the distribution of the target population. Nevertheless, this method could easily fail when a certain site couldn't cover the entire population. Moreover, it still relies on the concept of traditional meta-analysis after adjusting for the distribution shift. In this work, we propose a collaborative inverse propensity score weighting estimator for causal inference with heterogeneous data. Instead of adjusting the distribution shift separately, we use weighted propensity score models to collaboratively adjust for the distribution shift. Our method shows significant improvements over the methods based on meta-analysis when heterogeneity increases. To account for the vulnerable density estimation, we further discuss the double machine method and show the possibility of using nonparametric density estimation with d<8 and a flexible machine learning method to guarantee asymptotic normality. We propose a federated learning algorithm to collaboratively train the outcome model while preserving privacy. Using synthetic and real datasets, we demonstrate the advantages of our method.

## Abstract (日本語訳)

> 異なるデータセンター間の連携は、サイト間の異質性 (heterogeneity) によってしばしば阻害される。この異質性を考慮するための最先端の手法は、各サイトの共変量分布をターゲット母集団の分布に一致するよう再重み付け (re-weight) することである。しかし、この手法は特定のサイトが母集団全体をカバーできない場合には容易に破綻してしまう。さらに、分布シフトを補正した後も、依然として伝統的なメタ分析 (meta-analysis) の枠組みに依存している。本研究では、異質なデータに対する因果推論のための「協調的逆傾向スコア重み付け (collaborative inverse propensity score weighting)」推定量を提案する。分布シフトを個別に補正するのではなく、重み付き傾向スコアモデルを用いて分布シフトを協調的に補正する。提案手法は、異質性が増大するにつれてメタ分析ベースの手法を大きく上回る改善を示す。脆弱になりがちな密度推定に対応するため、ダブル機械学習 (double machine learning) 法を検討し、d<8 の下でのノンパラメトリック密度推定と柔軟な機械学習手法を用いて漸近正規性 (asymptotic normality) を保証できる可能性を示す。プライバシーを保ちつつ結果モデル (outcome model) を協調的に学習するフェデレーテッド学習アルゴリズムも提案する。合成データと実データを用いて、提案手法の優位性を実証する。

---

## Overview

本論文は、複数の異質なデータソース (病院・データセンター・臨床試験サイトなど) を横断して**平均処置効果 (ATE)** を推定する問題を扱う。従来の標準的アプローチは以下の 2 段階からなる:

1. 各サイトで共変量分布をターゲット母集団に合わせて再重み付けする (分布シフト補正)。
2. その後、サイトごとの推定値をメタ分析的に加重平均する (**Meta-IPW**)。

このアプローチの根本的な弱点は、**あるサイトが母集団の一部しかカバーしていない (incomplete coverage / disjoint domains)** 場合、そのサイト単体では有効な処置効果を推定できず、再重み付けが破綻する点にある。

提案手法 **Clb-IPW (Collaborative IPW)** の核心的アイデアは、「サイトごとに推定値を作ってから平均する」のではなく、「**傾向スコア関数そのものを協調的に足し合わせてから推定に使う**」という順序の入れ替えにある。これにより、単体では母集団をカバーできないサイトも、他サイトと相補的に組み合わさることで意味のある寄与ができるようになる。理論的には Meta-IPW より分散が小さい (`v²_Clb ≤ v²_Meta`) ことを証明し、さらに二重頑健な **Clb-AIPW** とプライバシー保護フェデレーテッド学習アルゴリズムを提案する。

---

## Problem

- **サイト間異質性 (heterogeneity)**: 各サイトの共変量分布 `p(X | S=k)` がターゲット母集団 `p(X)` と異なり、単純にプールできない。
- **不完全カバレッジ (incomplete population coverage)**: 特定サイトの共変量サポートが母集団全体を覆わない場合、そのサイト単体では overlap 条件を満たせず、再重み付け (importance weighting) が発散・破綻する。
- **メタ分析への依存**: 従来法は分布シフト補正後もサイトごとの独立推定値を加重平均するため、上記のカバレッジ問題を継承し、異質性の増大に対して不安定になる。
- **脆弱な密度推定**: 傾向スコア/密度比推定は次元 `d` が高いと不安定で、漸近正規性が保証されない。
- **プライバシー制約**: 各サイトの生データを中央に集約できない (フェデレーテッド設定)。

---

## Proposed Method

### コアアイデア

Meta-IPW は「各サイト k で推定値 `τ̂_k` を計算し、重み `η_k` で加重平均する」:

$$ \hat{\tau}_{\text{Meta}} = \sum_k \eta_k \, \hat{\tau}_k(\hat{e}_k) $$

これに対し Clb-IPW は「傾向スコア関数を先に重み付き集約 `Σ_r η_r ê_r` してから、その共有スコアで各サイトの推定を行う」:

$$ \hat{\tau}_{\text{Clb}} = \sum_k \hat{\tau}_k\!\left( \sum_r \eta_r \, \hat{e}_r \right) $$

この「和の順序の入れ替え」が、単体でカバレッジ不足のサイトを救済し、分散を縮小する鍵となる。

### Sampling–Selecting フレームワーク

ターゲット母集団から個体をサンプリングし、選択インジケータ `S_i ∈ {(k,Z) | k∈S, Z∈{0,1}} ∪ ∅` を割り当てるプロセスとして定式化する。傾向スコアは

$$ \mathbb{P}(S=(k,z) \mid X) = e^{(k,z)}(X), \qquad e^{\emptyset}(X) + \sum_k \sum_z e^{(k,z)}(X) = 1 $$

**主要な仮定**:
1. **Homogeneity & Unconfoundedness**: `(Y(1), Y(0)) ⊥⊥ S | X` — ポテンシャルアウトカムはサイト選択と共変量条件付き独立。
2. **Individual-Overlapping**: `min_{x,k} ℙ(Z=1, S=1 | x, A=k) > c > 0` (各サイト内 overlap、これが破綻するのが従来法の問題)。
3. **Overall-Overlapping**: `min_x ℙ(Z=1, S=1 | x) > c > 0` (全サイト合算での overlap、Clb-IPW が要求する緩い条件)。

### 手順 (numbered steps)

1. **各サイトで傾向スコア `ê^{(k,z)}(X)` を局所推定** (パラメトリックな exponential tilting、またはノンパラメトリックな k-NN 密度比推定)。
2. **傾向スコア関数を重み付き集約**して共有スコア `Σ_r η_r ê^{(r,z)}(X)` を構成する。
3. 各サイト k で共有スコアを分母に用いて局所モーメント `μ̂_{Clb,1}^{(k)}`, `μ̂_{Clb,0}^{(k)}` と正規化項 `N̂^{(k)}` を計算する。
4. 中央サーバーで集約し `τ̂_Clb = μ̂_{Clb,1} − μ̂_{Clb,0}` を得る。
5. (AIPW 版) 公開センサスデータ `D^{(t)}` を用いて結果モデル `m̂_1, m̂_0` をフェデレーテッド学習し、残差に対して IPW 補正を適用して二重頑健化する。

### Key Formulas (LaTeX)

**Clb-IPW の `μ₁` 推定量**:

$$ \hat{\mu}_{\text{Clb},1}^{(k)} = \frac{1}{\hat{N}_{\text{Clb},1}^{(k)}} \sum_{i \in D^{(k)}} \frac{\eta^{(k)} \, Z_i \, Y_i}{\sum_r \eta^{(r)} \, e^{(r,1)}(X_i)}, \qquad \hat{N}_{\text{Clb},1}^{(k)} = \sum_{i \in D^{(k)}} \frac{\eta^{(k)} \, Z_i}{\sum_r \eta^{(r)} \, e^{(r,1)}(X_i)} $$

**Clb-IPW の漸近分散 (Theorem 2)** — Meta-IPW 以下であることが保証される:

$$ v^2_{\text{Clb}} = \mathbb{E}\!\left[ \frac{(Y_1 - \mu_1)^2}{\sum_k e^{(k,1)}(X)} + \frac{(Y_0 - \mu_0)^2}{\sum_r e^{(r,0)}(X)} \right], \qquad v^2_{\text{Clb}} \le v^2_{\text{Meta}} $$

**密度比による傾向スコアの識別 (Proposition 4)**:

$$ e^{(k,z)}(X) = r^{(k,z)}(X) \cdot \mathbb{P}(S=(k,z) \mid S \ne \emptyset) \cdot \mathbb{P}(S = \emptyset), \qquad r^{(k,z)}(X) = \frac{p(X \mid S=(k,z))}{p(X)} $$

- パラメトリック (exponential tilting): `r^{(k,z)}(X) = exp(ψ(X)^T γ^{(k,z)})`、収束率 `O(N^{-1/2})`。
- ノンパラメトリック (k-NN): 収束率 `O(N^{-1/(2+d)})`。

**Decoupled AIPW 推定量**:

$$ \hat{\tau}_{\text{aipw}} = \frac{1}{N^{(t)}} \sum_i \left[ \hat{m}_1(X_i^{(t)}) - \hat{m}_0(X_i^{(t)}) \right] + \sum_k \hat{\delta}_{\text{aipw}}^{(k)} $$

Clb-AIPW の補正項:

$$ \hat{\delta}_{\text{Clb-aipw},1}^{(k)} = \frac{1}{\hat{N}_{\text{Clb},1}^{(k)}} \sum_{i \in D^{(k)}} \frac{Z_i \, (Y_i - m_1(X_i))}{\sum_r e^{(r,1)}(X_i)} $$

**フェデレーテッド結果モデルの損失関数 (Eq. 23)** — IPW 重みでターゲット母集団への収束を保証:

$$ L^{(k)} = \sum_{i \in D^{(k)}} \frac{Z_i \, \ell(Y_i, m_1(X_i))}{\sum_r \hat{e}^{(r,1)}(X_i)} $$

**二重機械学習の収束条件 (Theorem 6)** — `d ≤ 8` で漸近正規性を保証:

$$ \xi_m \ge \tfrac{1}{2} - \tfrac{2}{2+d}, \qquad \xi_e = \tfrac{2}{2+d}, \qquad \xi_m \cdot \xi_e > \tfrac{1}{2} $$

ここで `ξ_m` は結果モデル、`ξ_e` は傾向スコアモデルの収束率。

---

## Algorithm (Pseudocode)

```text
Algorithm 1: Clb-IPW
  入力: 各サイト k のデータ D^(k)、集約重み η^(k)、共有傾向スコア {ê^(r,z)}
  各サイト k で並列に:
    1. μ̂_Clb,1^(k), μ̂_Clb,0^(k) を計算
         分母に Σ_r η^(r) ê^(r,z)(X_i) を用いる (協調的補正)
    2. 正規化項 N̂_Clb,1^(k), N̂_Clb,0^(k) を計算
    3. 局所統計量 (μ̂, N̂) のみ中央サーバへ送信 (生データは送らない)
  中央サーバ:
    4. τ̂_Clb = μ̂_Clb,1 − μ̂_Clb,0 を集約して出力

Algorithm 2: Clb-AIPW (二重頑健 + フェデレーテッド)
  1. 各サイトで傾向スコア ê^(k,z)(X) を局所推定
     (exponential tilting または k-NN 密度比)
  2. 損失 (Eq. 23) の IPW 重み付き損失で結果モデル m_1, m_0 を
     フェデレーテッド学習 (勾配のみ交換、生データ非共有)
  3. 残差化: Y_i ← Y_i − m_{Z_i}(X_i)
  4. 残差に Algorithm 1 (Clb-IPW) を適用して補正項 δ̂ を計算
  5. 公開センサス D^(t) 上のベースライン予測 m̂_1 − m̂_0 と結合し
     τ̂_aipw を出力
```

---

## Architecture / Process Flow

```mermaid
flowchart TD
    T[ターゲット母集団 p(X)] -->|Sampling-Selecting| S1[Site 1 D^1]
    T --> S2[Site 2 D^2]
    T --> SK[Site K D^K]

    S1 -->|局所推定| E1["ê^(1,z)(X)"]
    S2 -->|局所推定| E2["ê^(2,z)(X)"]
    SK -->|局所推定| EK["ê^(K,z)(X)"]

    E1 --> AGG["傾向スコア協調集約\nΣ_r η_r ê^(r,z)(X)"]
    E2 --> AGG
    EK --> AGG

    AGG -->|共有スコアを分母に| M1["各サイト局所モーメント\nμ̂_Clb,1^k, μ̂_Clb,0^k, N̂^k"]
    M1 -->|統計量のみ送信 (privacy)| SRV[中央サーバ集約]

    PUB["公開センサス D^t"] --> OM[フェデレーテッド結果モデル\nm̂_1, m̂_0 (Eq.23 IPW損失)]
    OM -->|残差化 + 二重頑健補正| SRV
    SRV --> OUT["τ̂_Clb / τ̂_Clb-aipw (ATE)"]
```

---

## Figures & Tables

> 注記: arXiv HTML 版 (v1) では図はページ内に埋め込まれているが、WebFetch では個別の `<img>` src URL (`.../2404.15746v1/*.png` 等) を確実に抽出できなかった。ハルシネーション防止のため、**確認できなかった画像 URL は埋め込まない**。以下は本文・キャプションから確認できた視覚要素の内容を再構成したものである。

### Figure 1: データ生成過程と推定量比較 (再構成)

| サブ図 | キャプション | 内容 |
|--------|-------------|------|
| Fig 1(a) | "Sampling-Selecting Framework" | ターゲット分布から各サイトが分布シフトを伴って個体を選択する枠組みの模式図 |
| Fig 1(b) | "KL-MSE curve of different estimators" | 横軸 = サイト間異質性 (KL ダイバージェンス)、縦軸 = MSE。異質性が増えるほど Meta 系は劣化し、Clb 系が安定することを示す曲線 |

### Table A: 推定量の比較 (本文の定式化から再構成)

| 推定量 | 集約の順序 | 単体カバレッジ不足サイト | 分散 | 二重頑健 |
|--------|-----------|------------------------|------|----------|
| Meta-IPW | 推定値を加重平均 `Σ η_k τ̂_k` | 破綻しやすい | `v²_Meta` (基準) | 否 |
| **Clb-IPW** | 傾向スコアを先に集約 `Σ η_r ê_r` | 相補的に救済 | `v²_Clb ≤ v²_Meta` | 否 |
| Meta-AIPW | 推定値を加重平均 + 結果モデル | 破綻しやすい | — | 是 |
| **Clb-AIPW** | 協調傾向スコア + フェデレーテッド結果モデル | 相補的に救済 | 最小 | 是 (DML) |

### Table B: 密度比推定手法と収束率 (Proposition 5)

| 手法 | 表現 | 収束率 | 適用条件 |
|------|------|--------|----------|
| Exponential tilting (パラメトリック) | `exp(ψ(X)^T γ^{(k,z)})` | `O(N^{-1/2})` | 傾向モデルが正しく指定される |
| k-Nearest Neighbor (ノンパラメトリック) | k-NN 密度比 | `O(N^{-1/(2+d)})` | `d < 8` で DML により漸近正規性を確保 |

### Table C: 主要な理論的結果 (Propositions / Theorems)

| 結果 | 内容 |
|------|------|
| Proposition 1 | Meta-IPW の漸近分散公式 |
| Theorem 2 | Clb-IPW の一致性と分散縮小 `v²_Clb ≤ v²_Meta` |
| Theorem 3 | `ℙ(S|X)` と `ℙ(Z(S)|X)` がともに valid な balancing score |
| Proposition 4/5 | 密度比による傾向スコア識別と収束率 |
| Theorem 6 | Clb-AIPW の漸近正規性 (`ξ_m·ξ_e > 1/2`, `d ≤ 8`) |
| Theorem 7 | IPW 重み付き結果モデル学習の収束 |

---

## Experiments & Evaluation

### Setup

- **合成データ (Synthetic)**: 共変量次元 `d ∈ [2, 8]`、サイト数 `K = 3`。サイトごとのサンプル数 `N^{(k)}` を調整して分布シフト (異質性) を人工的に作り込む。異質性は KL ダイバージェンスで制御する。
- **比較対象**: Meta-IPW / Clb-IPW / Meta-AIPW / Clb-AIPW の 4 推定量。
- **評価指標**: MSE (対 KL ダイバージェンスの曲線、Figure 1(b))。
- **実データ (Real application)**: 臨床試験・観察研究文脈での応用。本文中の動機例として Example 1 (Agomelatine の臨床試験、13 試験を含む異質なデモグラフィクス)、Example 2 (COVID-19 の学習損失に関する 42 の観察研究) が挙げられている。※実験セクションで使用された具体的データセット名・数値は HTML から確実に抽出できず、**記載なし** とする。

### Main Results

- **定性的主張** (本文引用): 提案手法はメタ分析ベース手法より高精度を達成し、「異質性が増大しても安定 (remains stable even as the heterogeneity between sites increases)」する。
- **理論的保証**: Clb-IPW は Meta-IPW に対して分散を厳密に縮小 (`v²_Clb ≤ v²_Meta`)。
- **具体的な MSE / 分散の数値**: HTML 版から表形式の正確な数値を抽出できなかったため **記載なし** (PDF 図表参照が必要)。カバレッジ確率・信頼区間の具体値も **記載なし**。

### Ablation / Analysis

- **異質性 (KL) 掃引**: KL を増やすほど Meta 系の MSE が急増する一方、Clb 系は緩やかに劣化 (Figure 1(b) の曲線)。
- **次元 `d` の影響**: ノンパラメトリック密度比は `O(N^{-1/(2+d)})` で劣化するが、DML により `d ≤ 8` までは漸近正規性を保持できることを理論的に示す (次元の呪いへの対処)。
- **パラメトリック vs ノンパラメトリック**: 正しく指定できれば exponential tilting が `O(N^{-1/2})` で優位、モデル誤指定リスクがあれば k-NN が頑健。

---

## 本テーマへの適用可能性

想定シナリオ: **データサイエンティストが不定期にマーケティング施策 (クーポン・メール等) を、毎回異なるターゲットユーザー層・異なる処置内容で実施しており、施策間隔が空くためデータが疎になる。似た施策・似たユーザーをグループ化して「密なデータ」を合成し、実効的な実験間隔を短縮したい (uplift モデリング / off-policy 評価)。**

本論文の枠組みは、この課題に対して直接的に有用な要素を複数持つ:

1. **「異なる施策 = 異なるサイト」への読み替え**: 各キャンペーンを 1 つの「サイト k」とみなす。各施策はターゲットユーザー層 (共変量分布 `p(X|S=k)`) が異なり、まさに論文の「サイト間異質性」に対応する。従来なら施策ごとに独立に uplift を推定 (= Meta-IPW) するしかないが、これは各施策のデータが疎なとき不安定になる。

2. **カバレッジ不足の施策を救済する (最大の利点)**: あるキャンペーンが特定ユーザーセグメントしか対象にしていない場合 (incomplete coverage)、そのキャンペーン単体では全社母集団に対する処置効果を推定できない。Clb-IPW は「傾向スコアを先に協調集約」することで、複数の部分的キャンペーンを**相補的に組み合わせて全母集団の uplift を推定**できる。これは「疎な施策データを合成して密にする」という要求そのものである。

3. **borrow strength による分散縮小**: `v²_Clb ≤ v²_Meta` の理論保証は、施策をグループ化して協調推定すると、施策ごとに独立推定するより必ず分散が下がることを意味する。つまり**少ない施策回数・短い期間でも、統計的に有効な uplift 推定に到達しやすくなる** = 実効的な実験間隔の短縮に直結する。

4. **off-policy 評価との整合**: IPW / AIPW はまさに off-policy 評価の中核推定量である。本論文の Clb-AIPW は複数の過去キャンペーン (異なる割当方策) を横断して二重頑健に ATE/uplift を推定するため、**過去の異なる配信ロジックのログを束ねた off-policy 評価**にそのまま応用できる。傾向スコア (= 過去の配信確率) を協調集約する発想は、方策が施策ごとに違う状況で有効。

5. **フェデレーテッド結果モデル = 部門/チャネル横断でのデータ非共有連携**: 施策データが事業部・チャネル・提携先で分散し、生データを一元化できない場合でも、Eq. 23 の IPW 重み付き損失で結果モデルを勾配交換のみで学習できる。プライバシー/データガバナンス制約下での uplift モデル共同学習に有用。

6. **「似た施策/ユーザーのグループ化」への具体的接続**: 本論文自体はクラスタリング手法を提供しないが、集約重み `η^{(k)}` が施策間の寄与配分を担う。事前に施策・ユーザーを類似度でグループ化 (本リサーチの clustering フェーズ) し、同一グループ内でのみ `η` を非ゼロにすれば、「似た施策だけを協調集約して密なデータを合成する」設計が自然に実装できる。異質性が大きすぎるグループでは、KL-MSE 曲線 (Fig 1(b)) を診断指標としてグループ粒度を調整できる。

**留意点**: 論文は Unconfoundedness と Overall-Overlapping を仮定する。マーケティング応用では、(a) 全施策を合算したときにセグメント全体の overlap が確保されているか、(b) 施策割当が観測共変量で条件付き ignorable か、を検証する必要がある。また `d ≤ 8` の次元制約 (ノンパラメトリック密度比の漸近正規性条件) は、高次元ユーザー特徴を扱う場合に次元削減や exponential tilting の併用を要する。

---

## Notes

- **出典の信頼性**: タイトル・著者・アブストラクト・venue (ICML 2024 / PMLR v235 pp.16849–16868) は arXiv 要旨ページと PMLR で確認済み。数式・定理・アルゴリズム構成は arXiv HTML 本文から抽出。
- **抽出できなかった項目**: 実験セクションの正確な MSE/分散の数値、カバレッジ確率、実データセット名は HTML から確実に取得できず **記載なし** とした (PDF の図表を直接参照する必要がある)。Figure の個別画像 URL も確実に特定できなかったため、ハルシネーション防止方針により**画像 URL は埋め込んでいない**。
- **関連研究**: 後続に "Federated Causal Inference from Multi-Site Observational Data via Propensity Score Aggregation" (arXiv 2505.17961) 等、傾向スコア集約系のフェデレーテッド因果推論が続いている。
- **参照リンク**: [arXiv abs](https://arxiv.org/abs/2404.15746) / [PMLR](https://proceedings.mlr.press/v235/guo24c.html) / [PDF](https://arxiv.org/pdf/2404.15746)
