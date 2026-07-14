# A Comparative Study of Model Adaptation Strategies for Multi-Treatment Uplift Modeling

- **Link**: https://arxiv.org/abs/2511.01185
- **Authors**: Ruyue Zhang, Xiaopeng Ke, Ming Liu, Fangzhou Shi, Chang Men, Zhengdan Zhu
- **Year**: 2025 (2025-11-03 submitted)
- **Venue**: arXiv (cs.LG)
- **Type**: 手法比較・新規手法提案（実証研究）

---

## Abstract (English)

> Uplift modeling has emerged as a crucial technique for individualized treatment effect estimation, particularly in fields such as marketing and healthcare. Modeling uplift effects in multi-treatment scenarios plays a key role in real-world applications. Current techniques for modeling multi-treatment uplift are typically adapted from binary-treatment works. In this paper, we investigate and categorize all current model adaptations into two types: Structure Adaptation and Feature Adaptation. Through our empirical experiments, we find that these two adaptation types cannot maintain effectiveness under various data characteristics (noisy data, mixed with observational data, etc.). To enhance estimation ability and robustness, we propose Orthogonal Function Adaptation (OFA) based on the function approximation theorem. We conduct comprehensive experiments with multiple data characteristics to study the effectiveness and robustness of all model adaptation techniques. Our experimental results demonstrate that our proposed OFA can significantly improve uplift model performance compared to other vanilla adaptation methods and exhibits the highest robustness.

## Abstract (日本語)

Uplift modeling は個別処置効果推定の重要技術であり、特にマーケティングやヘルスケア領域で活用される。実応用では multi-treatment（複数処置）シナリオでの uplift 効果モデリングが鍵となる。現行の multi-treatment uplift 技術の多くは binary-treatment 手法からの流用にすぎない。本論文は既存のモデル適応手法を **Structure Adaptation**（構造適応）と **Feature Adaptation**（特徴適応）の2類型に整理する。実証実験の結果、これら2類型はノイズデータや観測データ混在など多様なデータ特性下で有効性を維持できないことを示す。推定能力と頑健性を高めるため、関数近似定理に基づく **Orthogonal Function Adaptation (OFA)** を提案する。多様なデータ特性下での包括的実験により、OFA が既存の素朴な適応手法に比べ性能を大幅に改善し、最高の頑健性を示すことを実証する。

---

## Overview

本論文は「binary から multi-treatment への拡張」という uplift modeling の実務課題を、既存手法の分類学（taxonomy）と新手法提案の両面から扱う。核心的な主張は、既存の適応方式（Structure / Feature）はいずれも処置数 $m$ と特徴次元 $d$ のいずれかに計算量が指数的に依存し、データ特性（ノイズ、観測データ混在、IV 有無）に応じて脆弱になるという点である。OFA は処置変数 $T$ を連続変数とみなし、隠れ特徴から生成した係数で **直交多項式（Legendre 多項式）** による関数近似を行うことで、処置数への依存を切り離し頑健性を得る。マルチ処置（クーポン金額など）を連続量として扱える設計は、本テーマのマーケティング適用と親和性が高い。

---

## Problem（課題の整理）

- multi-treatment uplift は実応用（複数クーポン額、複数メッセージ）で不可欠だが、既存手法は binary からの素朴な流用にすぎない。
- **Feature Adaptation (FA)**: 処置値を特徴に連結して単一モデルに入力。処置数が増えると特徴空間が拡大し、計算量が $\Omega(\varepsilon^{-(m+d)/r})$ と最悪。
- **Structure Adaptation (SA)**: 処置ごとに分岐ヘッドを用意。処置数 $m$ に線形にヘッドが増え、各分岐のサンプルが希薄化し過学習・不安定化。
- 両類型ともノイズデータ・観測データ混在・IV 有無といったデータ特性の変化に頑健でない。
- スパースなキャンペーンをまたいでプールする実務では、この頑健性欠如が致命的。

---

## Proposed Method: Orthogonal Function Adaptation (OFA)

### 核心アイデア

処置 $T$ を（離散でも）連続量とみなし、uplift 応答関数 $f(X,T)$ を Weierstrass の近似定理に基づき直交多項式で展開する。多項式係数 $a_j$ を隠れ特徴 $\phi_X$ から生成することで、処置間で係数を共有しつつ処置固有の応答曲線を表現する。これにより処置数 $m$ への計算量依存を、多項式次数 $p$ という小さな定数へ置き換える。

### 手順（numbered steps）

1. 特徴 $X$ をエンコーダに通し隠れ特徴 $\phi_X$ を得る（TARNet / DR-CFR / CFRNet など既存バックボーン流用）。
2. $\phi_X$ から $p+1$ 個の多項式係数 $a_0(\phi_X), \dots, a_p(\phi_X)$ を生成。
3. 処置値 $T$ に対する Legendre 直交多項式 $P^{(0)}(T), \dots, P^{(p)}(T)$ を計算。
4. 出力を係数と多項式の内積として構成: $f_{OFA}(X,T) = \sum_j a_j(\phi_X) P^{(j)}(T)$。
5. BCE 損失と（観測データ用の）分布距離正則化（MMD / Wasserstein）を組み合わせて学習。

### Key Formulas

OFA モデル定式化:

$$ f_{OFA}(X,T;\theta_{OFA}) = \sum_{j=0}^{p} a_j(\phi_X)\, P^{(j)}(T) $$

Legendre 直交多項式（漸化式）:

$$ P^{(0)}(t) = 1,\quad P^{(1)}(t) = t $$
$$ (k+1)P^{(k+1)}(t) = (2k+1)\,t\,P^{(k)}(t) - k\,P^{(k-1)}(t) $$

計算量比較（$m$: 処置数, $d$: 特徴次元, $r$: 平滑度）:

$$ C_{OFA} = O(\varepsilon^{-m/r}) < C_{SA} = O(\varepsilon^{-d/r}) < C_{FA} = \Omega(\varepsilon^{-(m+d)/r}) $$

損失関数（分布距離正則化付き）:

$$ L = \lambda_1 \cdot L_{BCE} + \lambda_2 \cdot L_{disc} $$

---

## Algorithm（Pseudocode）

```
Input: dataset {(X_i, T_i, Y_i)}, polynomial degree p, backbone encoder g
Output: OFA uplift model f_OFA

1: for each mini-batch B do
2:    phi <- g(X)                         # 隠れ特徴抽出
3:    [a_0, ..., a_p] <- CoeffHead(phi)    # 多項式係数生成
4:    for j = 0 .. p:                      # Legendre 多項式（漸化式）
5:        P_j <- Legendre(j, T)
6:    y_hat <- sum_j a_j * P_j             # 内積で uplift 応答を構成
7:    L_bce <- BCE(y_hat, Y)
8:    L_disc <- MMD or Wasserstein(phi | T groups)   # 観測データ時のみ
9:    L <- lambda1 * L_bce + lambda2 * L_disc
10:   theta <- Adam.step(L)                # lr = 1e-4
11: end for
12: return f_OFA
```

---

## Architecture / Process Flow

```
        X ──► Encoder g ──► phi_X
                             │
                             ├─► CoeffHead ─► [a_0, a_1, ..., a_p]
                             │                        │
   T ──► Legendre basis ─► [P^0(T), ..., P^p(T)]      │
                             │                        │
                             └──────► inner product ◄─┘
                                          │
                                    f_OFA(X,T) = Σ a_j P^j(T)
                                          │
                              BCE loss + (MMD/Wasserstein) 正則化
```

---

## Figures & Tables（主要図表）

### Figure 1: 3適応方式の比較アーキテクチャ
Feature Adaptation・Structure Adaptation・Orthogonal Function Adaptation を並置した概念図。
`https://arxiv.org/html/2511.01185/img/poly-adaption.png`

### Table 1: RCT データセット（mQini スコア）

| データセット | TARNet+OFA | DR-CFR+OFA |
|---|---|---|
| RCT | 0.2547 | 0.2652 |
| RCT-Noise | 0.2732 | 0.2875 |
| RCT-NM | 0.3160 | 0.2882 |

### Table 2: 観測データ（mQini スコア）

| 設定 | CFRNet+OFA | DR-CFR+OFA |
|---|---|---|
| OBS w/ IV | 0.2796 (WASS) | 0.2837 (MMD) |
| OBS w/o IV | 0.2826 (MMD) | 0.2797 (MMD) |

### Table 3: 混在データ（Mixed, mQini スコア）

| 設定 | CFRNet+OFA | DR-CFR+OFA |
|---|---|---|
| MIX w/ IV | 0.2684 (WASS) | 0.2798 (MMD) |
| MIX w/o IV | 0.2864 (MMD) | 0.2769 (WASS) |

### Table 4: 実世界 RCT（配車プラットフォーム, mQini スコア）

| 手法 | mQini |
|---|---|
| TARNet+OFA | 0.1153 |
| DR-CFR+OFA | 0.1100 |

### 手法比較（改善率サマリ）

| 設定 | 改善率 | 比較対象 |
|---|---|---|
| RCT-NM | +62.2% | SA 版（TARNet+OFA vs TARNet+SA） |
| RCT-Noise | +8.0% | 非OFA 最良手法 |
| OBS w/ IV | +42.1% | 非OFA 最良手法 |
| 実世界 RCT | +6.6% | 非OFA 最良手法 |

---

## Experiments & Evaluation

### Setup
- **合成データ**: 5処置・8共変量・訓練/テスト各10,000サンプル。データ特性別に RCT / RCT-Noise / RCT-NM / Observational（IV 有無）/ Mixed（IV 有無）を用意。
- **実世界データ**: 配車プラットフォームの RW-RCT。47共変量・5処置・訓練975,940 / テスト811,027 サンプル。
- **ベースライン**: Slearner+FA, BNN+FA, TARNet+SA, DR-CFR+SA, CFRNet+SA/OFA。
- **指標**: Mean Qini Score (mQini)（全処置にわたり算出）。
- **ハイパラ**: パラメータ約90k（合成）/約150k（実世界）、Adam、lr=1e-4。

### Main Results
- RCT-NM で TARNet+OFA は SA 版に対し **+62.2%**。
- 観測データ（IV 有）で **+42.1%**、RCT-Noise で **+8.0%**。
- 実世界 RCT で非OFA 最良手法に対し **+6.6%**（TARNet+OFA mQini=0.1153）。

### Ablation
- 分布距離正則化 $L_{disc}$（MMD / Wasserstein）の選択が観測データ・混在データ設定で mQini に影響。IV 有無で最良の距離指標が変化（例: OBS w/ IV は WASS、OBS w/o IV は MMD が優位）。
- 各種バックボーン（TARNet / DR-CFR / CFRNet）に OFA を差し込む形で頑健性向上を確認。

---

## 本テーマへの適用可能性

本テーマ（不定期・複数/連続処置マーケティングでの per-user uplift 推定）に対し、OFA は以下の点で直接的に有効である。

- **クーポン金額を連続処置として扱える**: OFA は処置 $T$ を連続量とみなし多項式展開するため、「500円・1000円・2000円クーポン」のような multi-valued 処置も、離散ヘッドを増やさずに単一の応答曲線 $f(X,T)=\sum_j a_j(\phi_X)P^j(T)$ で表現できる。処置間で係数 $a_j$ を共有するので、あるクーポン額のサンプルが希薄でも他の額から情報を借りられる。
- **スパースなキャンペーンのプールに適する**: SA のように処置ごとにヘッドを分けると各分岐のサンプルが希薄化するが、OFA は処置数 $m$ に依存する計算量を多項式次数 $p$ に置き換えるため、複数キャンペーンをプールしても過学習しにくい。ベース推定器を campaign 横断でプールする本テーマの運用と整合する。
- **観測データ混在への頑健性**: 不定期キャンペーンでは RCT ログと観測ログ（自然な受信履歴）が混ざりがち。OFA は MMD/Wasserstein 正則化で交絡を緩和でき、Mixed 設定での mQini 優位（例 MIX w/o IV で 0.2864）がこの実務条件に対応する。
- **既存バックボーンへの差し込み**: 既に TARNet/CFRNet 系を使っているチームなら、出力ヘッドを OFA に差し替えるだけで multi-treatment 化できる。導入コストが低い。
- **留意点**: 多項式次数 $p$ はハイパラであり、処置応答が非平滑（閾値的な反応）だと高次項が必要になる。メッセージ種別のような純カテゴリ処置（順序性なし）には連続化の前提が合わないため、その場合は SA との併用やカテゴリ埋め込みを検討すべき。

---

## Notes

- コード公開に関する記載なし（本文抽出範囲では未確認）。
- 実世界データは配車プラットフォーム由来で、価格系処置と親和的。マーケティングのクーポン額へは概念的に転用可能だが、直接のマーケ実験は記載なし。
- mQini 以外の指標（AUUC など）での評価は記載なし。
