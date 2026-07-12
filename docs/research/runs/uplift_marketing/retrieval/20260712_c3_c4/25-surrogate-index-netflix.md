# Evaluating the Surrogate Index as a Decision-Making Tool Using 200 A/B Tests at Netflix

- **Link**: https://arxiv.org/abs/2311.11922
- **Authors**: Vickie Zhang, Michael Zhao, Maria Dimakopoulou, Anh Le, Nathan Kallus
- **Year**: 2023 (v1: 2023-11-20 / v2: 2024-01-30)
- **Venue**: arXiv (Statistics > Applications)。査読会議名は記載なし
- **Type**: 実証研究（産業界の大規模 A/B テスト群を用いた surrogate index の意思決定妥当性検証）

---

## Abstract (English)

> Surrogate index approaches have recently become a popular method of estimating longer-term impact from shorter-term outcomes. In this paper, we leverage 1098 test arms from 200 A/B tests at Netflix to empirically investigate to what degree would decisions made using a surrogate index utilizing 14 days of data would align with those made using direct measurement of day 63 treatment effects. Focusing specifically on linear "auto-surrogate" models that utilize the shorter-term observations of the long-term outcome of interest, we find that the statistical inferences that we would draw from using the surrogate index are ~95% consistent with those from directly measuring the long-term treatment effect. Moreover, when we restrict ourselves to the set of tests that would be "launched" (i.e. positive and statistically significant) based on the 63-day directly measured treatment effects, we find that relying instead on the surrogate index achieves 79% and 65% recall.

---

## Abstract（日本語訳）

surrogate index（代理指標）アプローチは、短期の観測結果からより長期のインパクトを推定する手法として近年広く使われるようになった。本論文では、Netflix の 200 件の A/B テストに含まれる 1098 個のテストアーム（処置群）を用いて、14 日分のデータから構築した surrogate index による意思決定が、63 日目の処置効果を直接測定して行う意思決定とどの程度一致するかを実証的に調べる。特に、関心のある長期アウトカムそのものの短期観測値を利用する線形の「auto-surrogate（自己代理）」モデルに焦点を当てる。その結果、surrogate index から導かれる統計的推論は、長期処置効果を直接測定した場合と約 95% 一致することがわかった。さらに、63 日直接測定の処置効果に基づいて「ローンチする（正で統計的に有意）」と判断されるテスト集合に限定すると、surrogate index に頼った場合の recall はそれぞれ 79% と 65% であった。

---

## Overview

本論文は「surrogate index を意思決定ツールとして実運用してよいか」を、理論ではなく大規模実データで検証した実証研究である。長期指標（63 日 = 約 2 か月の平均アウトカム）を待つ代わりに、14 日（2 週間）分の短期観測から長期処置効果を予測する **線形 auto-surrogate モデル** を構築し、その予測に基づくローンチ判断が直接測定の判断とどれだけ整合するかを、統計的結論の一致率（約 95%）と launch 判断の precision / recall（79% / 65%）で定量化する。auto-surrogate とは「長期指標そのものの短期時系列値」を surrogate として使う点が特徴で、別の中間指標を代理に使う従来の surrogate と区別される。

---

## Problem（課題）

- 長期指標（ここでは 63 日平均アウトカム）は反応が遅く、意思決定サイクルが 2 か月単位になり実験スループットが低い。
- surrogate index は理論的には魅力的だが、「実際の意思決定が直接測定とどれだけ一致するか」を大規模に検証した実証はほとんどない。
- 代理モデルの学習データをどこから取るか（同一ユーザーの割当前データ vs. 別テスト）で性能がどう変わるかが不明。
- surrogate paradox（代理指標では改善に見えるが真の指標では悪化する）という失敗モードのリスクをどう抑えるか。

---

## Proposed Method（提案手法）

### コアアイデア

関心のある長期アウトカム $Y$ 自体を、短期の時系列観測 $\{Y_{i1}, \dots, Y_{iT}\}$（$T \le 63$）から線形回帰で予測する **auto-surrogate モデル** を学習し、その予測平均を用いて処置効果を推定する。「別の中間 surrogate を探す」のではなく「同じ指標の短期スナップショットを surrogate に使う」のが要点。

### 手順

1. **直接的長期処置効果の定義**: 各アーム $a$ の 63 日平均と対照群の差を差分推定量で計算する（Eq.1）。
2. **auto-surrogate モデルの学習**: 63 日平均 $\mu_i$ を短期観測 $Y_{i1..T}$ の線形結合として回帰（Eq.2）。学習データの取り方は 2 通り:
   - **Pre-Test**: 割当前 63 日間の同一ユーザーデータで学習。
   - **Similar Test**: 同じプロダクト領域の別 A/B テストのデータで学習。
3. **surrogate index による処置効果推定**: 学習済みモデルで各ユーザーの予測長期値 $\hat\mu_{i,t}$ を計算し、処置群・対照群間の差をとる（Eq.3）。
4. **意思決定の突合**: 14 日 surrogate index の統計的結論（符号・有意性）を、63 日直接測定の結論とクロス集計（confusion matrix）し、一致率・precision・recall を評価。

### Key Formulas

直接的長期処置効果（差分推定量, Eq.1）:

$$\hat\tau_{a,63} = \frac{1}{63|N_a|}\sum_{i \in N_a}\sum_{t=1}^{63} Y_{it} - \frac{1}{63|N_0|}\sum_{i \in N_0}\sum_{t=1}^{63} Y_{it}$$

auto-surrogate 線形モデル（Eq.2）:

$$\mu_i = \beta_0 + \sum_{t=1}^{T} \beta_t Y_{it} + \epsilon_i, \qquad T \le 63$$

surrogate index に基づく処置効果（Eq.3）:

$$\hat\tau_{a,t} = \frac{1}{|N_a|}\sum_{i \in N_a}\hat\mu_{i,t} - \frac{1}{|N_0|}\sum_{i \in N_0}\hat\mu_{i,t}$$

---

## Algorithm（擬似コード）

```
Input: 各テスト arm の短期時系列 {Y_it}_{t=1..14}, 学習用データ源 (Pre-Test or Similar-Test)
Output: 各 arm の 14日 surrogate index 処置効果と launch 判断

# 1. auto-surrogate モデル学習
for 学習ソース in {Pre-Test, Similar-Test}:
    D_train <- 長期平均 mu_i と短期観測 Y_{i,1..T}
    beta   <- OLS(mu_i ~ Y_{i,1..T})            # Eq.2

# 2. surrogate index 推定
for each arm a in 1098 arms:
    for each user i in arm a:
        mu_hat_{i,14} <- beta_0 + sum_t beta_t * Y_{it}   # 14日観測を代入
    tau_hat_{a,14}   <- mean(mu_hat over N_a) - mean(mu_hat over N_0)  # Eq.3
    (z, p)           <- t検定(tau_hat_{a,14})
    decision_surr    <- sign(tau_hat) if p < alpha else "neutral"

# 3. 直接測定と突合
for each arm a:
    tau_hat_{a,63}   <- 差分推定量(63日平均)             # Eq.1
    decision_direct  <- sign & significance
    ConfusionMatrix[decision_surr][decision_direct] += 1

report consistency, precision, recall
```

---

## Architecture / Process Flow

```
14日短期観測 Y_{i,1..14}
        │
        ▼
 auto-surrogate 線形モデル (β)   ← 学習源: Pre-Test / Similar-Test
        │  予測長期値 μ̂_{i,14}
        ▼
 surrogate index 処置効果 τ̂_{a,14}  ──┐
                                       │  突合 (confusion matrix)
 63日直接測定 τ̂_{a,63} ────────────────┘
        │
        ▼
   一致率 ~95% / precision 79% / recall 65%
        │
        ▼
   Launch 判断（2週間サイクルへ短縮）
```

---

## Figures & Tables（必須セクション）

> 注: arXiv HTML から確認できた figure の src URL は本文抽出に含まれていなかったため、URL 埋め込みは行わず、キャプションと確認できた数値のみ記載する（画像 URL は「記載なし/未確認」）。

### 表1: 主要結果（意思決定の整合性、本文記載値）

| 指標 | 値 | 説明 |
|------|----|------|
| データ規模 | 200 テスト / 1098 arms | 検証対象 |
| 短期窓 vs 長期窓 | 14 日 vs 63 日 | 意思決定の比較単位 |
| 統計的結論の一致率 | ~95% | surrogate と直接測定の推論一致 |
| Precision（launch 判断） | 79% | surrogate が launch 判断した中の的中率 |
| Recall（launch 判断） | 65% | 直接測定で launch すべき中を捕捉した率 |
| Negative の偽陽性（真は悪化なのに good と誤判定） | 0 件 | surrogate paradox 事例なし |

（注: abstract では recall として 79% と 65% の両方が併記されており、本文 confusion matrix の Pre-Test / Similar-Test で precision・recall が学習源別に区別される。学習源ごとの厳密な割当は figure 4 の confusion matrix に依存する。）

### 表2: 学習源（auto-surrogate モデルの訓練データ）比較

| 学習源 | 定義 | 位置づけ |
|--------|------|----------|
| Pre-Test | 割当前 63 日の同一ユーザーデータ | 各テストに自前で調達可能 |
| Similar-Test | 同一プロダクト領域の別 A/B テスト | 新規テストで pre-period が無い場合に有用 |

### 図1（キャプション）

Direct Measurement（青）、Pre-Test Surrogate Index（橙）、Similar Tests Surrogate Index（緑）の推定値密度プロット。個別分布とスケール済み分布を比較。画像 URL: 未確認。

### 図2（キャプション）

単一テスト例。時間 $t$ に沿った surrogate 推定値と、直接測定した処置効果の推移を重ねて表示。画像 URL: 未確認。

### 図3（キャプション）

surrogate と 2 か月直接読みとの差分の密度プロット。fat-tailed（裾の重い）分布を示す。画像 URL: 未確認。

### 図4（キャプション）

統計的結論の confusion matrix。左が Pre-Test、右が Similar-Test。ここから precision / recall が算出される。画像 URL: 未確認。

---

## Experiments & Evaluation

### Setup

- **データ**: Netflix の 200 件の A/B テスト、1098 テストアーム。
- **短期窓**: 14 日。**長期窓（真値）**: 63 日（約 2 か月）平均アウトカム。
- **評価軸**: (i) 統計的結論（符号・有意性）の一致率、(ii) 「launch すべき」集合に対する precision / recall、(iii) surrogate paradox（真は悪化なのに good 判定）事例数。

### Main Results

- surrogate index と直接測定の統計的推論は **約 95% 一致**。
- 直接測定で launch 判断される集合に対し、surrogate index は **precision 79% / recall 65%**。
- 真に悪化（negative）なのに good と誤る **危険な偽陽性は 0 件**。
- 実運用上のインパクト試算: 2 か月サイクルを 2 週間サイクルに短縮すれば、実験キャパシティを最大 **300% 増** できうる（本文の hypothetical capacity 試算）。

### Ablation

- 学習源の比較（Pre-Test vs Similar-Test）が主要な感度分析であり、Similar-Test でも実用的な recall を達成できることを示す（pre-period データが取れない新規テストへの適用可能性を担保）。数値は図4の confusion matrix 依存。

---

## 本テーマへの適用可能性

本テーマ（クーポン/メールなど低頻度マーケ施策での uplift 推定・off-policy 評価。類似施策をプールし、有効な実験間隔を短縮したい）に対し、本論文は最も直接的なテンプレートを与える。

1. **実験間隔の短縮（surrogate による前倒し判断）**: 「クーポン施策の 60 日後 LTV/継続率」を待たずに、施策後 14 日の短期時系列（開封・訪問・購入頻度など長期指標そのものの短期スナップショット）から auto-surrogate 線形モデルで長期効果を予測し、2 週間でローンチ/停止を判断できる。実験サイクルを 2 か月→2 週間に短縮する具体的手順（Eq.1–3）がそのまま流用可能。

2. **類似施策のプール（Similar-Test 学習）**: 本論文の Similar-Test 方式は「同一プロダクト領域の別テストで代理モデルを学習」する。これは「過去の類似クーポン/メール施策を 1 つの学習コーパスにプールし、そこから代理モデルを推定」する発想と一致する。低頻度で単独施策のサンプルが薄い状況でも、類似施策を束ねることで実効的なデータ密度を上げ、新規施策の short-term signal から long-term uplift を予測できる。

3. **安全性（surrogate paradox の実証的抑制）**: 危険な偽陽性 0 件という実績は、代理指標での早期判断が真の長期指標を悪化させるリスクを実データで抑えられることを示す。off-policy 評価で「短期指標だけ見て良く見える施策」を誤採用するリスクへの実証的な安心材料になる。

4. **意思決定コスト vs 精度の目安**: recall 65–79% は「長期直接測定なら launch すべき施策の一部を取りこぼす」ことを意味する。低頻度・高コスト施策では、まず surrogate で高速スクリーニング → 有望なもののみ長期測定で確認、という二段構えの運用が合理的で、本論文はその trade-off を定量化している。

---

## Notes

- venue は arXiv のみ確認。査読付き会議/ジャーナル名は記載なし。
- figure の画像 src URL は HTML 抽出に現れなかったため、本レポートでは画像埋め込みを行っていない（キャプションのみ）。
- abstract 中の precision/recall（79% と 65%）は confusion matrix の学習源別（Pre-Test / Similar-Test）に対応するが、どちらがどちらかの厳密な割当は原著 figure 4 を要確認。
- auto-surrogate は「長期指標そのものの短期観測」を使う点が、別の中間指標を代理に使う古典的 surrogate と異なる（本テーマでは「短期の反応系列」を surrogate に使う設計に対応）。
