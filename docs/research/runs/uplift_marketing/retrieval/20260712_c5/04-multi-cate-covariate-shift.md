# Multi-CATE: Multi-Accurate Conditional Average Treatment Effect Estimation Robust to Unknown Covariate Shifts

- **Link**: https://arxiv.org/abs/2405.18206
- **Authors**: Christoph Kern, Michael Kim, Angela Zhou
- **Year**: 2024（2024年5月28日投稿、10月17日改訂）
- **Venue**: arXiv:2405.18206 [cs.LG]（Computer Science, Machine Learning）
- **Type**: 方法論論文（multi-accuracy/multicalibration × CATE 推定）

---

## Abstract (English)

> The paper addresses heterogeneous treatment effect estimation when predictive models trained on one population are deployed on different, unknown populations. The authors employ multi-accurate prediction methods to adjust CATE T-learners and pseudo-outcome regressors (like DR-learners) to handle unknown covariate shifts. Their approach combines large confounded observational datasets with smaller randomized controlled trials by training a confounded predictor on observational data and validating multi-accuracy on RCT data. The methodology demonstrates reduced bias and mean squared error as covariate shift increases, validated through simulations and semi-synthetic case studies.

（注: 上記は WebFetch により要約された英語アブストラクトである。arXiv の逐語アブストラクトは本調査時点で完全な形での再取得ができなかったため、逐語性は保証されない。）

## Abstract (日本語)

本論文は、ある母集団で学習した予測モデルを、異なる未知の母集団に展開する際の異質処置効果（heterogeneous treatment effect, HTE）推定問題を扱う。著者らは multi-accurate 予測法を用いて、CATE の T-learner および疑似アウトカム回帰量（DR-learner など）を調整し、**未知の共変量シフト（unknown covariate shift）**に対応させる。アプローチは、大規模だが交絡のある観察データと、小規模な RCT を組み合わせる：観察データ上で交絡を含む予測器を学習し、RCT データ上で multi-accuracy を検証（audit）する。この手法は、共変量シフトが増大するにつれてバイアスと平均二乗誤差が減少することを、シミュレーションと半合成ケーススタディで実証する。

---

## Overview

本論文の核心は、**multi-accuracy（多重正確性）／multicalibration の理論を CATE 推定に持ち込み、展開先の分布が未知でも一定のバイアス保証を持つ CATE 推定量を後処理（post-processing）で構成する**ことである。通常、あるソース分布で学習した CATE モデルは、ターゲット分布へ展開すると共変量シフトでバイアスを持つ。しかし multi-accuracy 条件（テスト関数クラス `C` の全メンバーに対し予測残差の相関が小さい）を満たせば、その `C` に含まれる尤度比で表せる**任意のターゲット分布**に対してバイアスが `2α` で抑えられる（Proposition 2）。

さらに、交絡のある大規模観察データで CATE を学習しつつ、小規模 RCT で multi-accuracy を audit することで、観察データの情報量を活かしながら交絡バイアスを補正する（Setting 2）。実装は MCBoost（multicalibration boosting）による反復後処理。

---

## Problem（本論文が解く課題）

- ソース分布で学習した CATE モデル（T-learner, DR-learner）は、**展開先の未知のターゲット分布**へ持っていくと共変量シフトでバイアスを持つ。
- 展開先の分布が未知（尤度比が既知でない）なため、単純な importance weighting が使えない。
- 大規模観察データは交絡を含み、小規模 RCT は不偏だが分散が大きい — **両者をどう統合するか**。
- 「特定のシフトにだけ頑健」ではなく、**分布クラス全体にわたる worst-case バイアス保証**が欲しい。

---

## Proposed Method

### 中核アイデア

予測器 `p̃(X)` に対する multi-accuracy 条件「テスト関数クラス `C` の全 `c` について残差相関 `|E[(Y−p̃(X))c(X)]| ≤ α`」を課す。尤度比（共変量シフト）が `C`（あるいはその閉包 `H`）に含まれるなら、**任意のシフト先でバイアスが `2α` に抑えられる**。CATE は処置別アウトカムモデルの差 `τ̃(X)=μ̃_1(X)−μ̃_0(X)` として構成し、各 `μ̃_t` を MCBoost で multi-accurate に後処理する。

### 手順（numbered steps）

1. **データ分割**: 推定用 `D_est` と後処理用 `D_post` に分割。
2. **アウトカムモデルの初期推定**: `D_est` 上で処置別回帰 `μ̂_t(x)=argmin_g E[(g(X)−Y)^2 | T=t]`。
3. **MCBoost による後処理**: `D_post` 上で `μ̂_t` を反復更新し、テスト関数クラス `F` に対する multi-accuracy `max_f |E[f(X)(Y−μ̃(X))|T=t]| ≤ α` を満たすまで補正。
4. **CATE の合成**: `τ̃(x)=μ̃_1(x)−μ̃_0(x)`。
5. **観察＋RCT 統合（Setting 2）**: 交絡ありの観察データで初期予測器を学習し、RCT データで multi-accuracy を audit・補正 → 交絡バイアスを尤度比クラス `H` の範囲で `2α` に抑える。
6. **理論保証**: 未知シフト先で `|E_Q[{τ̃(X)−τ(X)}c(X)]| ≤ 2α`（Proposition 2）。

### Key Formulas（LaTeX）

**multi-accuracy 条件（`(C, α)`-multi-accurate）:**

$$\max_{c \in \mathcal{C}} \Big| \mathbb{E}\big[(Y - \tilde{p}(X))\,c(X)\big] \Big| \le \alpha$$

**CATE（T-learner）:**

$$\tau(X) = \mathbb{E}[Y(1)-Y(0)\mid X], \qquad \hat{\tau}(x) = \hat{\mu}_1(x) - \hat{\mu}_0(x)$$

$$\mu_t(x) \in \arg\min_{g \in \mathcal{G}} \mathbb{E}_P\big[(Y - g(X))^2 \mid T=t\big]$$

**後処理後の CATE:**

$$\tilde{\tau}(X) = \tilde{\mu}_1(X) - \tilde{\mu}_0(X)$$

**DR / AIPW ベンチマーク:**

$$\mathbb{E}[Y(1)-Y(0)] = \sum_{t\in\{0,1\}} \mathbb{E}\!\left[\frac{\mathbf{1}[T=t]}{e_t(X)}\big(Y-\mu_t(X)\big) + \mu_t(X)\right]$$

**外部シフトの尤度比:**

$$w_t(x) = \frac{dQ_X(x)}{dP_{X_t}(x)} = \frac{dQ_X(x)}{dP_X(x)} \cdot \frac{P(T=t)}{e_t(x)}$$

**未知シフト下の頑健バイアス限界（Proposition 2）:**

$$\forall c \in \mathcal{C}:\quad \Big|\mathbb{E}_Q\big[\{\tilde{\tau}(X) - \tau(X)\}\,c(X)\big]\Big| \le 2\alpha$$

**交絡下の頑健識別（Corollary 1、尤度比 `W_t^*(X)=E[1/e_t(X,U)|X] \in H` のとき）:**

$$\Big|\mathbb{E}[\tilde{\tau}(X)] - \mathbb{E}[Y(1)-Y(0)]\Big| \le 2\alpha$$

**MCBoost の audit と更新:**

$$c^* \in \arg\min_{c\in\mathcal{C}} \mathbb{E}\big[((Y-p_k(X)) - c(X))^2\big]$$

$$p_{k+1}(x) \propto e^{-\Delta_c \cdot c^*(x)/2}\, p_k(x), \qquad \Delta_c = \mathbb{E}_V\big[c^*(X)(Y-p_k(X))\big]$$

---

## Algorithm（擬似コード）

```
Algorithm 1: Multi-Accuracy Post-Processing for CATE (Setting 1)
入力: データ D={(X_i,T_i,Y_i)}, auditor クラス F, アウトカムクラス G, 許容 α
出力: 頑健 CATE 推定量 τ̃

1. D を D_est と D_post に分割
2. for t in {0,1}:
     μ̂_t(x) ← argmin_{g∈G} E[(g(X)−Y)^2 | T=t]  on D_est
     μ̃_t(x) ← MCBoost(μ̂_t, α, F, D_post^t):
        repeat:
           c* ← argmin_{c∈F} E[((Y−p_k(X)) − c(X))^2]     # audit
           Δ_c ← E_V[c*(X)(Y−p_k(X))]                       # 検証集合上
           p_{k+1}(x) ∝ exp(−Δ_c·c*(x)/2)·p_k(x)            # multiplicative update
        until  max_{f∈F} |E[f(X)(Y−μ̃(X))|T=t]| ≤ α
3. return τ̃(x) = μ̃_1(x) − μ̃_0(x)

Setting 2（観察 + RCT）: 初期 μ̂_t を交絡ありの観察データで学習し、
                         MCBoost の audit を RCT データ上で実施
```

---

## Architecture / Process Flow

```mermaid
flowchart TD
    A[観察データ 大・交絡あり] --> B[初期アウトカムモデル μ̂_t(X)]
    C[RCT データ 小・不偏] --> D[MCBoost audit: c* = worst-case テスト関数]
    B --> D
    D --> E{multi-accuracy |E f·残差| ≤ α ?}
    E -- No --> F[乗法更新 p_{k+1} ∝ exp(−Δ c*)·p_k]
    F --> D
    E -- Yes --> G[μ̃_1, μ̃_0]
    G --> H[τ̃(X) = μ̃_1 − μ̃_0]
    H --> I[未知ターゲット Q へ展開: バイアス ≤ 2α]
```

---

## Figures & Tables（MANDATORY）

### Table 1（再構成）: シミュレーション1（外部シフト、線形 CATE `τ(x)=x1`）の MSE

| 手法 | MSE（シフト全域、概算） |
|------|------|
| Multi-accurate T-learner | 約 0.08–0.12 |
| Standard T-learner | 約 0.15–0.28（大シフト時） |
| S-learner ベースライン | 約 0.25–0.35 |

> Multi-accurate 法は最大シフト時に絶対バイアスを約 60% 削減。数値は WebFetch による概算抽出であり、正確な点推定値は原論文の表を要確認（→ 厳密値は記載なし）。

### Table 2（再構成）: シミュレーション2（観察 + RCT 統合）の MSE

| 手法 | MSE（概算） |
|------|------|
| Multi-accurate DR-learner | 約 0.11 |
| Standard DR-learner（RCT のみ） | 約 0.32 |
| Observational only（交絡バイアスあり） | 約 0.45 |

> データ: 観察 `n_obs=1000`、RCT `n_rct=100`（10:1）。ロジスティック傾向スコア＋非観測交絡 `U`。数値は概算抽出。

### Table 3（再構成）: 半合成ケーススタディ（WHI: Women's Health Initiative）

| 項目 | 内容 |
|------|------|
| 応用 | ホルモン療法（HT）の心血管アウトカムへの効果 |
| データ | 並行観察研究（`n ≈ 93,000`）＋ RCT（`n ≈ 16,600`） |
| Multi-accurate 推定 | `τ_HT ≈ −0.015`（わずかに保護的） |
| 観察のみ | `τ ≈ −0.08`（より保護的、交絡の疑い） |
| RCT のみ | 小標本で高分散 |

> 主知見: multi-accurate 後処理が観察情報を活かしつつバイアスを RCT 推定値へ引き寄せる。数値は概算抽出であり、原論文の表を要確認。

### Table 4（再構成）: 主要理論結果と手法比較

| 結果 | 内容 |
|------|------|
| Proposition 1 | multi-accuracy → 頑健 ATE：条件下で `E[τ̃(X)] = E[Y(1)−Y(0)] + 2α` |
| Corollary 1 | 交絡下でも尤度比 `W_t^*∈H` なら `|E[τ̃]−ATE| ≤ 2α` |
| Proposition 2 | 未知シフト先 `Q`（尤度比 `w_t∈H`）で `|E_Q[{τ̃−τ}c]| ≤ 2α` |
| Proposition 3 | 豊富な `F` の multi-accurate T-learner は簡素な DR-learner を近似（robustness-efficiency トレードオフ） |

| 手法 | 展開先分布 | 交絡 | バイアス保証 |
|------|------|------|------|
| Standard T/S-learner | 既知のみ | 弱い | なし |
| DR/AIPW | 既知 | 傾向スコアで補正 | 二重ロバスト |
| **Multi-CATE** | **未知（クラス `H`）** | **audit で補正** | **worst-case `2α`** |

> 注: 論文は Figure 1（Setting 1/2 の概念図）を参照するが、`<img>` の直接 URL は本調査で取得できなかったため埋め込みなし。arXiv HTML 版の図 URL は未確認。

---

## Experiments & Evaluation

- **Setup**: (1) 外部シフトシナリオ：線形 CATE `τ(x)=x1`、Beta 分布の交絡。(2) 観察＋RCT：観察 `n_obs=1000`、RCT `n_rct=100`、ロジスティック傾向スコア＋非観測交絡 `U`。(3) 半合成：WHI（観察 `n≈93,000`＋RCT `n≈16,600`）のホルモン療法。
- **Main Results（数値、概算）**: 外部シフトで Multi-accurate T-learner が MSE 約 0.08–0.12（Standard T-learner の 0.15–0.28、S-learner の 0.25–0.35 に対し優位）、大シフト時に絶対バイアス約 60% 削減。観察＋RCT で Multi-accurate DR-learner が MSE 約 0.11（RCT のみ DR 0.32、観察のみ 0.45）。WHI で `τ_HT ≈ −0.015`（観察のみ −0.08 の交絡を補正）。
- **Ablation**: 共変量シフトの大きさを増すにつれ multi-accurate 法のバイアス・MSE 優位が拡大。auditor クラス `F` を豊富にすると DR-learner に近い頑健性（Proposition 3 の robustness-efficiency トレードオフ）。

> すべての数値は WebFetch による概算抽出であり、原論文の正確な表値は本調査では確定できなかったため「概算」と明記。厳密値は要原典確認。

---

## 本テーマへの適用可能性

Multi-CATE は、**「展開先セグメントの分布が未知でも、過去キャンペーンで学習した uplift モデルに worst-case バイアス保証を付けて運ぶ」** という、本テーマの外的妥当性問題に対する最も機械学習的な解を与える。

- **未知セグメントへの頑健展開**: マーケティングでは、新規セグメントの共変量分布が事前に分からないことが多い。Multi-CATE は尤度比クラス `H` に入る**任意の**シフト先で uplift 推定バイアスを `2α` に抑えるため、「どのクラスタへ持っていってもある程度信頼できる」保証付きの uplift モデルを作れる。
- **CATE（uplift）の後処理で実装**: 既存の T-learner/DR-learner ベースの uplift モデル（購買確率の処置差）に、MCBoost による後処理を一段足すだけで頑健化できる。既存パイプラインへの追加コストが小さい。
- **大規模ログ × 小規模 A/B テストの統合（Setting 2）**: マーケティングでは「交絡のある大規模行動ログ（過去の非ランダムな配信履歴）」と「小規模だがクリーンな A/B テスト」が併存する。Multi-CATE はまさにこの構図を想定し、大規模ログで uplift を学習しつつ A/B テストで multi-accuracy を audit して交絡バイアスを補正する。infrequent キャンペーン（小 RCT）でも大規模ログを活かせる。
- **クラスタを auditor クラスに使う**: テスト関数クラス `C`/`F` を「行動クラスタの指示関数」に設定すれば、multi-accuracy 条件は「各クラスタ上で uplift 予測残差が小さい」ことを直接要求する。これにより、**クラスタ横断で偏りのない uplift**（＝クラスタ間で効果を安全に移送できる状態）が保証される。本テーマの「クラスタごとにグループ化して効果を運ぶ」に直結する。
- **worst-case 保証 vs 平均効率のトレードオフ**: Proposition 3 が示すように、auditor クラスを豊かにすると頑健性は上がるが効率（分散）と引き換え。稀な施策で「大外ししたくない」場面では頑健性寄りに、頻繁な施策で「平均精度重視」なら効率寄りに調整できる。
- **本テーマ内での他手法との棲み分け**: One-Step weighting（03）や minimax-regret（05）が「重み/凸結合で特定ターゲットへ移送」するのに対し、Multi-CATE は「モデル自体を分布クラス全体に頑健化」する。移送先が明確なら 03/05、移送先が未知・多数なら Multi-CATE、という使い分けが可能。

---

## Notes

- 著者の Michael Kim は multicalibration/multi-accuracy 理論（Hébert-Johnson et al. 2018）の主要研究者であり、本論文はその理論を因果推論へ橋渡しした位置づけ。
- 実装は MCBoost（R/Python の multicalibration boosting）に基づく反復後処理。
- Proposition 1〜3 と Corollary 1 が主要理論結果。特に Proposition 2（未知シフト下の `2α` バイアス保証）が本テーマにとって最重要。
- **重要な注意**: 本レポートの実験数値（MSE 約 0.08–0.12 等）と英語アブストラクトは WebFetch による要約/概算抽出であり、逐語アブストラクトおよび正確な表値の再取得が本調査時点でできなかった。厳密値・逐語テキストは原論文（arXiv:2405.18206）で要確認。arXiv HTML 版の図 `<img>` URL も未取得のため埋め込みなし。
- cs.LG カテゴリ投稿であり、機械学習会議（multicalibration 系）文脈。正確な採択会議は本調査では確認できず（記載なし）。
