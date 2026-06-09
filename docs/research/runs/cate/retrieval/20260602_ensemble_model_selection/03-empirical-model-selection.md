# Empirical Analysis of Model Selection for Heterogeneous Causal Effect Estimation

> CATE 推定における「どの代理損失（surrogate metric）がモデル選択で最も信頼できるランキングを与えるか」を、415 個の推定器 × 34 個の指標 × 78 データセットという大規模実証で体系的に比較したベンチマーク論文。

---

## メタ情報

| 項目 | 内容 |
|------|------|
| タイトル | Empirical Analysis of Model Selection for Heterogeneous Causal Effect Estimation |
| 著者 | Divyat Mahajan, Ioannis Mitliagkas, Brady Neal, Vasilis Syrgkanis |
| 発表年 | 2024（arXiv 初版 2022-11） |
| 会議 | ICLR 2024（Spotlight） |
| arXiv | https://arxiv.org/abs/2211.01939 |
| HTML | https://arxiv.org/html/2211.01939 |
| 分野 | 因果推論 / CATE 推定 / モデル選択 |
| キーワード | surrogate metric, DR-score, plug-in metric, pseudo-outcome, AutoML, causal ensembling |

---

## Abstract（英語・原文）

> "We study the problem of model selection in causal inference, specifically for conditional average treatment effect (CATE) estimation. Unlike machine learning, there is no perfect analogue of cross-validation for model selection as we do not observe the counterfactual potential outcomes. Towards this, a variety of surrogate metrics have been proposed for CATE model selection that use only observed data. However, we do not have a good understanding regarding their effectiveness due to limited comparisons in prior studies. We conduct an extensive empirical analysis to benchmark the surrogate model selection metrics introduced in the literature, as well as the novel ones introduced in this work. We ensure a fair comparison by tuning the hyperparameters associated with these metrics via AutoML, and provide more detailed trends by incorporating realistic datasets via generative modeling. Our analysis suggests novel model selection strategies based on careful hyperparameter selection of CATE estimators and causal ensembling."

## Abstract（日本語訳）

> 因果推論におけるモデル選択、特に CATE（条件付き平均処置効果）推定の問題を扱う。通常の機械学習と異なり、反実仮想の潜在アウトカムを観測できないため、交差検証の完全な類似物が存在しない。これに対し、観測データのみを用いる多様な「代理指標（surrogate metric）」が提案されてきたが、先行研究の比較は限定的で、その有効性は十分に理解されていない。本研究では、既存の代理指標および本研究で新たに導入する指標を大規模にベンチマークする。各指標に付随するハイパーパラメータを AutoML で公平にチューニングし、生成モデルによる現実的データセットを取り込んでより詳細な傾向を示す。分析の結果、CATE 推定器のハイパーパラメータの慎重な選択と「因果アンサンブル（causal ensembling）」に基づく新しいモデル選択戦略を提案する。

---

## Overview

CATE 推定の最大の障壁は **「正解が観測できない」** ことにある。個体ごとに処置あり／なしの片方の結果しか得られないため、機械学習の交差検証のように「テスト誤差で最良モデルを選ぶ」ことができない。代替として様々な代理損失（surrogate loss / metric）が提案されてきたが、

- 比較が個別・小規模で、**どの指標が一貫して良いランキングを与えるか不明**
- 指標自身が抱えるニューサンス（傾向スコア・回帰関数）の推定品質が比較に混入していた

という問題があった。本論文は **34 指標 × 415 推定器 × 78 データセット** という規模で、ニューサンスも指標も AutoML で公平にチューニングしたうえで横並び比較を行い、実務的な推奨を導いた点が貢献である。

---

## Problem Definition：どの代理損失が良いランキングを与えるか

潜在アウトカム $Y(0), Y(1)$ に対し CATE は

$$
\tau(x) = \mathbb{E}[\, Y(1) - Y(0) \mid X = x \,]
$$

真の評価指標は **PEHE（Precision in Estimation of Heterogeneous Effect）**：

$$
\text{PEHE}(\hat\tau) = \mathbb{E}_x\big[(\hat\tau(x) - \tau(x))^2\big]
$$

しかし $\tau(x)$ は観測不能なため、PEHE は実データで計算できない。

> **核心の問い**：観測データのみから計算できる代理指標 $M(\hat\tau)$ のうち、PEHE による真のランキングに最も近いランキングを再現するのはどれか？

理想は $\arg\min_{\hat\tau} M(\hat\tau)$ が $\arg\min_{\hat\tau} \text{PEHE}(\hat\tau)$（オラクル）に一致すること。本論文はこの「選択の質」を **Normalized-PEHE**（後述）で測る。

---

## Proposed Method

論文の貢献は (A) 公平な大規模ベンチマーク、(B) 新規指標の導入、(C) 2 段階選択・因果アンサンブルの 3 点。

### A. 公平な比較フレームワーク
- 代理指標が依存するニューサンスモデル（$\hat\mu_w, \hat\pi_w$）を **AutoML（FLAML）** でチューニング。
- 指標の優劣に「ニューサンス調整の巧拙」が混ざらないようにした。

### B. 新規に導入した指標
- **TMLE Score**：Targeted Maximum Likelihood 補正で極端な傾向スコアに頑健化。
- **Calibration Score（Cal-DR）**：処置効果分位内での一貫性（キャリブレーション）を測る。
- **Qini Score / Value Score**：高効果サブグループを優先したときの政策価値で評価。
- **DR-Switch / DR-CAB**：傾向スコアが極端なとき DR と plug-in を適応的にブレンドするクリッピング変種。

### C. 新しい選択戦略
- **2 段階選択（two-level）**：まず各メタ学習器クラス内で最良を選び、次にクラス間で選ぶ。
- **因果アンサンブル**：単一最良を選ぶ代わりに $\exp\{\kappa M(\hat\tau_i)\}$ に比例した重みで複数推定器を加重平均。

---

## 分析：代理損失の体系的比較

代理指標は構成原理で 3 系統に大別される。

### 1. Plug-in 系（別の CATE 推定器を当てて二乗距離）
検証データ上で別途学習した「参照 CATE」$\tilde\tau$ と比較する。T-Score / X-Score など。

### 2. Pseudo-outcome 系（疑似アウトカムを構築して二乗距離）
DR（二重頑健）疑似アウトカムや R-learner 残差を参照に使う。DR-Score / R-Score など。

### 3. Plug-in vs Pseudo-outcome の対立軸
従来は「pseudo-outcome（特に DR）が plug-in より優れる」と信じられていた。本論文の重要発見は **AutoML で適切にチューニングすると plug-in（T-Score）も DR-Score とほぼ同等** という点で、先行研究の通説を部分的に覆す。

| 軸 | Plug-in | Pseudo-outcome (DR) |
|----|---------|---------------------|
| 参照の作り方 | 別 CATE 推定器の予測差 | 二重頑健疑似アウトカム |
| ニューサンス依存 | 回帰関数 $\hat\mu_w$ | 回帰 + 傾向 $\hat\pi_w$ |
| 極端傾向スコアへの頑健性 | 高い（IPW を含まない） | 低い → TMLE/clipping で補正 |
| 本論文での実証順位 | **意外に強い** | **最上位（DR/TMLE 系が支配的）** |

### S-learner vs T-learner ベース
指標を S 系（共変量に処置を 1 特徴として混ぜる）と T 系（処置群別に分けて学習）で比較すると、**T 系が一貫して優位**（例：DR T-Score 0.56 vs DR S-Score 0.93）。

---

## Key Formulas（主要な代理損失の定義）

> 以下は HTML 版から抽出した定義（記法は原論文に準拠）。$N$ は検証サンプル数。

### Plug-in（T-Score）
$$
M^{T}(\hat\tau) := \frac{1}{N}\sum_{i=1}^{N}\big(\hat\tau(x_i) - \tilde\tau_T(x_i)\big)^2,
\qquad
\tilde\tau_T(x) := \check\mu_1(x) - \check\mu_0(x)
$$

ここで $\check\mu_w(x)$ は処置群 $w\in\{0,1\}$ ごとに学習した回帰関数。X-Score も同様で、参照アウトカムの作り方が異なる。

### Pseudo-outcome（DR-Score）
$$
M^{\text{DR}}(\hat\tau) := \frac{1}{N}\sum_{i=1}^{N}\big(\hat\tau(x_i) - \tilde\tau_{\text{DR}}(x_i)\big)^2,
\qquad
\tilde\tau_{\text{DR}} := y^{\text{DR}}(\check\eta)
$$

DR（二重頑健）疑似アウトカム：
$$
y^{\text{DR}}(\check\eta) = \check\mu(x,w) + \frac{y - \check\mu(x,w)}{\check\pi_w(x)}
$$

$\check\eta = (\check\mu, \check\pi)$ はニューサンス（回帰 + 傾向スコア）。

### Calibration Score（Cal-DR）
$$
M^{\text{Cal-DR}}(\hat\tau) := \sum_k |G_k(\hat\tau)|\;\big|\widehat{\text{GATE}}_k(\hat\tau) - \text{GATE}_k^{\text{DR}}(\hat\tau)\big|
$$

予測効果の分位グループ $G_k$ 内で、予測 GATE と DR で推定した GATE のズレを測る。

### Qini Score（Qini-DR）
$$
M^{\text{Qini-DR}}(\hat\tau) := \sum_k |G_{\ge k}(\hat\tau)|\;\big(\text{GATE}_{\ge k}^{\text{DR}}(\hat\tau) - \text{ATE}^{\text{DR}}\big)
$$

高効果順に処置を割り当てたときの政策価値（uplift）を評価。

### R-Score（Tau-risk / R-loss, Nie & Wager 2021）
本論文 HTML には明示式が載っていないが、一般に R-learner 由来の残差直交化損失として次の形で知られる（**以下は一般知識による補足、原論文の表記ではない**）：
$$
M^{R}(\hat\tau) = \frac{1}{N}\sum_i \Big( \big(y_i - \hat m(x_i)\big) - \hat\tau(x_i)\big(w_i - \hat\pi(x_i)\big) \Big)^2
$$
$\hat m(x) = \mathbb{E}[Y\mid X=x]$ は周辺アウトカム回帰。本論文では R-Score は実証的に下位（後述、ACIC で 4.0）であった。

---

## Algorithm（評価プロトコル：疑似コード）

```
入力: データセット集合 D, CATE推定器集合 T (|T|=415), 代理指標集合 M (|M|=34)
出力: 各指標 m の Normalized-PEHE（選択の質）

for データセット d in D:
  for seed s in 1..20:
    train, valid, test = split(d, seed)
    # 1) 推定器を AutoML 調整ニューサンスで学習
    for τ̂ in T:
        τ̂ <- fit(train; nuisance via FLAML)
    # 2) 各指標で各推定器をスコアリング
    for m in M:
        nuisance_m <- FLAML(valid)            # 指標側ニューサンスも AutoML
        scores[m] = { τ̂ : m(τ̂, valid, nuisance_m) for τ̂ in T }
        τ̂*_m   = argmin scores[m]            # 単一最良を選択
        # 3) オラクル（真のPEHEで最良）と比較
        PEHE_sel    = PEHE(τ̂*_m, test)        # test は反実仮想既知
        PEHE_oracle = min_{τ̂} PEHE(τ̂, test)
        NormPEHE[m,d,s] = (PEHE_sel - PEHE_oracle) / PEHE_oracle
# 4) ベンチマーク群ごとに seed・dataset を平均
report mean ± stderr of NormPEHE per m
```

Normalized-PEHE 定義：
$$
\text{Norm-PEHE}(m) = \frac{\text{PEHE}(\hat\tau^{*}_m) - \text{PEHE}(\hat\tau^{\text{oracle}})}{\text{PEHE}(\hat\tau^{\text{oracle}})}
$$
**0 に近いほど良い**（オラクルに近い選択）。

---

## Architecture（評価フローの全体像）

```mermaid
flowchart TD
    A[観測データ d] --> B[train / valid / test 分割]
    B --> C[415 CATE推定器を学習<br/>ニューサンスは AutoML(FLAML)]
    B --> D[34 代理指標のニューサンスを<br/>valid で AutoML 調整]
    C --> E[各指標 m で全推定器をスコアリング]
    D --> E
    E --> F[単一最良 argmin M を選択]
    E --> G[2段階選択: クラス内→クラス間]
    E --> H[因果アンサンブル exp(κ·M) 重み]
    F --> I[test で真のPEHEを計算<br/>反実仮想既知]
    G --> I
    H --> I
    I --> J[Normalized-PEHE で<br/>指標の選択品質を順位付け]
```

```
[ 代理指標の系統 ]
 ├─ Plug-in 系 ........ T-Score, X-Score        (回帰のみ依存・頑健)
 ├─ Pseudo-outcome 系 . DR-Score, R-Score        (回帰+傾向に依存)
 ├─ 補正系 ............ TMLE-Score, DR-Switch, DR-CAB
 └─ 政策/校正系 ....... Qini, Value, Cal-DR
            │
            ▼  AutoML で公平化
   ─────── ランキング品質を Norm-PEHE で評価 ───────
            │
            ▼
  支配的: DR T-Score (0.56) / TMLE T-Score (0.64) / T-Score plug-in (0.56)
```

---

## Figures & Tables（実証結果の再現）

> 以下の数値は HTML 版から抽出した Normalized-PEHE（mean (stderr)）。**0 に近いほど選択が優秀**。

### Table 1. 主要指標の選択品質（ACIC 2016, 単一段階選択）

| 代理指標 | 系統 | Norm-PEHE (ACIC2016) | 評価 |
|----------|------|----------------------|------|
| **DR T-Score** | pseudo-outcome | **0.56 (0.02)** | 支配的・最良 |
| **T-Score (plug-in)** | plug-in | **0.56 (0.02)** | 意外に最強クラス |
| **TMLE T-Score** | 補正 | **0.64 (0.03)** | 準最良 |
| DR S-Score | pseudo-outcome | 0.93 (0.02) | T系に劣る |
| R-Score (Tau-risk) | pseudo-outcome | 4.0 (0.11) | 下位 |
| Influence Score | IF ベース | 1455.75 (1439.46) | 破綻的に不安定 |

### Table 2. T-base vs S-base（同系統での比較）

| ペア | T-base | S-base | 差 |
|------|--------|--------|----|
| DR Score | 0.56 (0.02) | 0.93 (0.02) | **T が一貫優位** |

→ メタ学習器を群別に分ける T 系参照のほうがランキング再現性が高い。

### Table 3. 2 段階選択（two-level）による改善

| 指標 | 単一段階 | 2 段階 | 改善 |
|------|----------|--------|------|
| Qini DR-Score | 1.32 (0.07) | **0.58 (0.02)** | 大幅改善・支配的に |
| Value DR-Score | 13.02 (11.73) | **0.64 (0.03)** | 不安定 → 安定化 |

→ 2 段階戦略は約 **28.7%** のケースで単一段階を上回り、劣るケースは無し。

### Table 4. 現実的データセット（RealCause 生成）での合意度

| データセット | Norm-PEHE 帯域 | 解釈 |
|--------------|----------------|------|
| LaLonde CPS / PSID | 約 0.16–0.21 | 指標間の合意が強い |
| Twins | 約 0.16–0.21 | 同上 |
| Influence Score (LaLonde PSID) | 0.80 (0.02) | IF系は単純データでも不安定 |

---

## Experiments & Evaluation（実験設定と具体数値）

| 項目 | 内容 |
|------|------|
| データセット | ACIC 2016（75 種）+ RealCause 生成 3 種（LaLonde CPS/PSID, Twins）= 計 78 |
| CATE 推定器 | 415 個（T/S/DR/R-Learner ほか 7 系統のメタ学習器） |
| 代理指標 | 34 個（既存 + 新規 TMLE/Cal/Qini/Value/DR-Switch/DR-CAB） |
| ニューサンス調整 | AutoML（FLAML）— 推定器・指標の双方 |
| 評価尺度 | Normalized-PEHE（オラクル最良との相対差） |
| シード | データセットあたり 20 |
| アンサンブル結果 | 非アンサンブルより統計的に優位なのは約 **5.8%**、残りは同等（限定的効果） |

主要な定量結論：
- **DR/TMLE 系の指標がほぼ常に支配集合（dominating set）に入る**。「グローバルに一律のルールを使うなら DR/TMLE 系を選べ」。
- **plug-in（T/X Score）は他指標にほとんど支配されない** — AutoML 調整が効くと DR 系と同等に強い。
- R-Score（ACIC で 4.0）・Influence Score（ACIC で 1455.75）は不安定で実務向きでない。
- 因果アンサンブルの上積みは限定的（約 5.8% のケースのみ有意）。

> 注：本ノートに転記した数値は HTML 版の抽出結果。論文表番号・厳密値の確認は原論文 Table 1/2/3, Appendix D（Table 9）を参照。

---

## Notes（精度向上の観点：実務でどの検証指標を使うべきか）

CATE 推定の **精度向上＝最終的な PEHE を下げる** という観点での実務的示唆：

1. **既定の検証指標は DR T-Score を第一候補に**。支配集合に常に入り、Norm-PEHE 0.56 とオラクルに最も近い選択を与える。極端な傾向スコアが懸念される現場では **TMLE T-Score**（0.64）でクリッピング／補正の頑健性を確保。

2. **plug-in（T-Score）を侮らない**。「DR でなければダメ」という通説は AutoML 前提では成立せず、T-Score は DR と同等（0.56）。傾向スコア推定が困難・不安定な現場ではむしろ IPW を含まない plug-in が安全。

3. **指標は必ず T-base（処置群別）で構成**。S-base は同系統でも明確に劣る（DR で 0.56 vs 0.93）。

4. **R-Score / Influence Score を主指標にしない**。本ベンチでは ACIC で 4.0 / 1455.75 と破綻的に不安定。先行研究で R-Score が好成績だった報告とは食い違い、データ依存が大きい。

5. **2 段階選択を採用する価値が高い**。メタ学習器クラス内 → クラス間の順で選ぶと約 28.7% のケースで改善し、劣化ケースが無い。複数系統の推定器を持つなら標準採用すべき。

6. **ニューサンスの AutoML 調整が前提条件**。指標の優劣はニューサンス品質に大きく左右される。指標を比較・運用する前に回帰・傾向モデルを AutoML（FLAML 等）で十分にチューニングすること自体が精度向上の最大要因の一つ。

7. **因果アンサンブルは「保険」程度**。有意改善は約 5.8% に留まるため、第一選択ではなく、単一選択が不安定なときの補助に留めるのが現実的。

**実務まとめ**：まず DR T-Score（不安傾向スコア下では TMLE T-Score）を、T-base 構成・AutoML 調整ニューサンスのうえで使い、複数メタ学習器があれば 2 段階選択を併用する — これが本論文が実証的に支持する CATE モデル選択のベストプラクティス。
