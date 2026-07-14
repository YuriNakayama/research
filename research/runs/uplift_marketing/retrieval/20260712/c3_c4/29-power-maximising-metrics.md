# Learning Metrics that Maximise Power for Accelerated A/B-Tests

- **Link**: https://arxiv.org/abs/2402.03915
- **Authors**: Olivier Jeunen, Aleksei Ustimenko
- **Year**: 2024（v1: 2024-02-06 / v2: 2024-06-13）
- **Venue**: Applied Data Science track, ACM SIGKDD Conference on Knowledge Discovery and Data Mining（KDD '24）
- **Type**: 方法論提案（指標学習 / 検出力最大化）+ 大規模 SNS 2 サービスでの実証

---

## Abstract (English)

> Online controlled experiments are a crucial tool to allow for confident decision-making in technology companies. A North Star metric is defined (such as long-term revenue or user retention), and system variants that statistically significantly improve on this metric in an A/B-test can be considered superior. North Star metrics are typically delayed and insensitive. As a result, the cost of experimentation is high: experiments need to run for a long time, and even then, type-II errors (i.e. false negatives) are prevalent. We propose to tackle this by learning metrics from short-term signals that directly maximise the statistical power they harness with respect to the North Star. We show that existing approaches are prone to overfitting, in that higher average metric sensitivity does not imply improved type-II errors, and propose to instead minimise the p-values a metric would have produced on a log of past experiments. We collect such datasets from two social media applications with over 160 million Monthly Active Users each, totalling over 153 A/B-pairs. Empirical results show that we are able to increase statistical power by up to 78% when using our learnt metrics stand-alone, and by up to 210% when used in tandem with the North Star. Alternatively, we can obtain constant statistical power at a sample size that is down to 12% of what the North Star requires, significantly reducing the cost of experimentation.

---

## Abstract（日本語訳）

オンライン統制実験は、テック企業が確信を持って意思決定するための重要ツールである。North Star 指標（長期収益やユーザー継続など）を定め、A/B テストでこれを統計的有意に改善するシステム変種を優れたものとみなす。North Star 指標は通常、遅延し感度が低い。その結果、実験コストは高い——実験は長期間走らせる必要があり、それでも type-II エラー（偽陰性）が頻発する。本論文はこれに対し、North Star に関して harness する統計的検出力（power）を直接最大化する指標を短期信号から学習することを提案する。既存手法は過学習しやすく、**平均指標感度が高くても type-II エラー改善を意味しない**ことを示し、代わりに「過去実験ログで指標が生成したであろう p 値を最小化する」ことを提案する。各 1.6 億 MAU 超の SNS 2 サービスから、計 153 超の A/B ペアのデータセットを収集した。実証結果では、学習指標を単独使用で検出力を最大 **78%**、North Star と併用で最大 **210%** 向上できた。あるいは、North Star が要求するサンプルサイズの **12%** で一定の検出力を得られ、実験コストを大幅に削減できる。

---

## Overview

短期信号の線形結合で「検出力を最大化する指標」を学習する。従来の「平均 z スコア（感度）最大化」は過学習し、平均が外れ値で吊り上がって type-III（符号）エラーを隠すという欠陥を指摘。代わりに **過去実験ログ上での p 値（特に log p 値変換）を最小化** する目的を提案する。z スコアはスケール不変で最適化が遅いため spherical regularisation を加える。1.6 億 MAU 級の SNS 2 サービス・153+ A/B ペアで、単独 +78%・North Star 併用 +210% の検出力向上、同じ検出力をサンプル 12% で達成。

---

## Problem（課題）

- North Star 指標は遅延・低感度で、実験を長く走らせても type-II エラー（偽陰性）が多い。
- 既存の「感度（平均 z スコア）最大化」は過学習: 平均 z が高くても median z や検出力は改善しないことがある。
- 平均 z は外れ値で吊り上がり、type-III/S（符号）エラーを隠蔽する。
- z スコアはスケール不変（重みに対して）で、勾配最適化が収束しにくい。

---

## Proposed Method（提案手法）

### コアアイデア

指標を短期信号の線形結合 $\omega=\mu w^\top$ とし、過去実験ログの既知結果 $E^+$（A≻B が検証済み）に対して、その指標が生成する **p 値（または log p 値変換）を最小化** する $w$ を学習する。z スコア最大化ではなく p 値最小化にすることで、type-III エラーを罰し、感度改善を実験間で公平に分配する。

### 手順

1. **指標の定義**: 短期信号の線形結合で指標を作り、その two-sample z スコアを定義。
2. **p 値目的**: 既知改善 $E^+$ に対する one-tailed p 値の平均を最小化（$L_p^+$）。
3. **log p 値変換**: $\bar p=-p\log(1-p)$ を導入し、type-III/S エラーをより強く罰する凸緩和にする。
4. **spherical regularisation**: z スコアのスケール不変性による収束遅延を、$L_{\|w\|}=-\delta(N-\|w\|_2^2)^2$ で緩和（最適解は保存、勾配方向を整える。最大 40% 高速収束）。
5. **運用**: 学習指標を単独 or North Star + proxy と併用（Bonferroni 補正）して判定。

### Key Formulas

学習指標の z スコア:

$$z^{(A\succ B)}_{\omega}=\frac{\mu^A w^\top-\mu^B w^\top}{\sqrt{w\,\Sigma^A w^\top+w\,\Sigma^B w^\top}}$$

one-tailed p 値損失（既知結果 $E^+$）:

$$L_p^+(w;E^+)=\frac{1}{|E^+|}\sum_{(A,B)\in E^+}\big[1-\Phi(z^{(A\succ B)}_{\omega})\big]$$

log p 値変換（type-III/S を強く罰する凸緩和）:

$$\bar p=-p\log(1-p)$$

spherical regularisation:

$$L_{\|w\|}=-\delta\big(N-\|w\|_2^2\big)^2$$

---

## Algorithm（擬似コード）

```
Input: 過去実験ログ; ラベル E^+ (A≻B 検証済), E^? (不明), E^≃ (A/A)
       短期信号の per-arm 統計 μ, Σ
Output: 学習指標の重み w

初期化 w
repeat 収束まで:
    # 各既知ペアの z スコア
    for (A,B) in E^+:
        z_ω <- (μ^A w^T - μ^B w^T) / sqrt(w Σ^A w^T + w Σ^B w^T)
    # p 値損失（log p 版推奨）
    L_p  <- mean over E^+ of [1 - Φ(z_ω)]      # or  -p log(1-p)
    L_reg <- -δ (N - ||w||^2)^2                 # spherical
    L    <- L_p + L_reg
    w    <- w - lr * ∇_w L                       # 勾配降下
return w   # 単独 or North Star と併用（Bonferroni）
```

---

## Architecture / Process Flow

```
短期信号ベクトル
   │  線形結合 w
   ▼
学習指標 ω = μ w^T
   │  過去ログの既知ペア E^+ に対し z スコア → p 値
   ▼
目的: min  p 値（log p 変換）  +  spherical reg.
   │       ↳ type-III(符号)エラーを罰し、感度を公平配分
   ▼
勾配降下（+40% 高速収束）
   ▼
学習指標 w
   ├─ 単独運用           → type-II 最大 -78%
   └─ North Star + 併用   → 検出力 最大 +210% / サンプル 12%
```

---

## Figures & Tables（必須セクション）

> 注: HTML 抽出では図が `x N.png` プレースホルダで、arxiv.org 前置の完全 src URL は取得できなかった（画像 URL: 未確認）。以下はキャプションと本文記載の数値表。

### 表1: 過学習の例（本文 Table 1 の要点）

| 指標 | 平均 z スコア | 統計的検出力(α=0.05) | type-III エラー |
|------|---------------|----------------------|------------------|
| m₃（平均 z 最大） | **5.29** | 50% | あり |

平均 z スコアを最大化しても検出力は 50% にとどまり、type-III エラーを含む。「平均 z 最大化 ≠ 検出力改善」を示す反例。

### 表2: 感度改善（Table 2, Leave-One-Out CV, 本文記載値）

| 目的関数 | Mean z-score | Median z-score | Mean p-value | Median p-value |
|----------|--------------|----------------|--------------|----------------|
| Heuristic | 7.31 | 3.07 | 1.88e-01 | 1.18e-03 |
| Z-score | 7.55 | 2.67 | 2.33e-01 | 3.88e-03 |
| P-value | 5.22 | 3.08 | 4.32e-02 | 1.09e-03 |
| **Log p-value（提案）** | 4.33 | **3.17** | 5.19e-02 | **8.60e-04** |

Log p-value 目的が median z スコア・median p 値で最良（平均ではなく中央値・実効検出力で優れる）。

### 表3: 主要検出力ゲイン（本文記載値）

| 運用形態 | 効果 |
|----------|------|
| 学習指標 単独 | type-II エラー最大 **-78%** |
| North Star + proxy + 学習指標（Bonferroni） | 検出力 最大 **+210%**（North Star 単体比）、既存 proxy 併用比 +25〜30% |
| 一定検出力を維持するサンプル | North Star 要求の **12%**（= 約 8 倍少ないサンプル） |
| spherical regularisation | 収束反復 最大 **-40%** |

### 図（キャプション）

- 図1: 最適化目的（p 値・log p 値変換）を z スコアの関数として可視化。画像 URL: 未確認。
- 図3: 学習指標と North Star の合意度を有意水準横断で表示。p 値/log p 値目的は type-III エラーほぼゼロ。画像 URL: 未確認。
- 図4: (a) 単独指標、(b) Bonferroni 補正指標セットの type-I/II エラー。画像 URL: 未確認。
- 図5: 有意水準横断での必要サンプルサイズ削減。画像 URL: 未確認。
- 図6: spherical regularisation 有無での収束反復数。画像 URL: 未確認。

---

## Experiments & Evaluation

### Setup

- **プラットフォーム**: ShareChat と Moj（短尺動画 SNS）。各 1.6 億 MAU 超。
- **実験**: 153 A/B ペア（うち結論の出た 58）。A/A ペア 25,000 超。
- **指標**: 約 100 利用可能、10 をモデル化に選択。期間: 2023 年。
- **ラベル**: $E^+$（既知改善）、$E^?$（North Star 上不明）、$E^\simeq$（A/A、帰無真）。

### Main Results

- 学習指標 **単独** で type-II エラー最大 **78% 削減**（type-I は α 維持）。
- North Star + proxy と **併用** で検出力最大 **210% 向上**（既存 proxy 併用比 +25〜30%、type-I は α よりやや保守的）。
- 一定検出力を **サンプル 12%**（約 8 倍少）で達成 → 実験コスト大幅削減。
- Log p-value 目的が median z / median p で最良（Table 2）。

### Ablation

- 目的関数比較（Heuristic / Z-score / P-value / Log p-value）で、平均感度が高い z-score 目的が median・実検出力では劣ることを実証（過学習の証拠）。
- type-III エラー（図3）: z-score 目的は有意水準横断で顕著、p 値/log p 値目的はほぼゼロ。
- spherical regularisation（図6）: 全目的・全初期化で収束反復を最大 40% 削減、良/一定/悪初期化にロバスト。

---

## 本テーマへの適用可能性

本テーマ（低頻度マーケ施策・uplift・実験間隔短縮・類似施策プール）に対し、本論文は「短期信号から検出力最大の指標を学習し、実験を高速化する」最も実務直結の手法。

1. **実験間隔・サンプルの劇的短縮**: 「同じ検出力をサンプル 12%（約 8 倍少）で得る」は、低頻度マーケ施策で決定的。クーポン/メール施策で North Star（例: 長期継続/LTV）を待つ代わりに、学習指標で 1/8 のサンプル・短い期間で有意判定でき、施策の PDCA を回す間隔を大幅に短縮する。type-II エラー -78% は「効いている施策を見逃さない」ことに直結。

2. **類似施策プール = 過去実験ログの活用**: 手法は過去実験ログの既知結果 $E^+$ から指標重み $w$ を学習する。過去の類似クーポン/メール施策（結果が判明済みのもの）をログとしてプールすれば、この施策群に最適な短期指標を学習でき、単独では薄いデータを実効的に濃くできる。

3. **North Star との併用（+210%）**: 学習 proxy を North Star と併せて Bonferroni 判定する運用は、本テーマの「short-term proxy で長期効果を予測しつつ North Star も見る」二段構えに一致。単独 proxy より安全（type-I 保守的）で検出力も高い。

4. **過学習・符号誤りへの警告**: 「平均感度が高くても検出力は上がらず type-III(符号)エラーを隠す」という知見は、本テーマで proxy を作る際の重要な落とし穴。低頻度施策では実験数が少なく過学習しやすいので、p 値/log p 値ベースの目的（外れ値に頑健、符号誤りを罰する）を選ぶべき、という実践的指針を与える。

---

## Notes

- 会議は KDD '24 Applied Data Science track。産業実データ（ShareChat/Moj）での本番運用。
- 本バッチ内の他論文（Pareto 27・Choosing 26）が sensitivity/correlation を明示的に扱うのに対し、本作は「検出力（p 値）そのもの」を直接目的化する点が差別化。過学習批判は Pareto 論文の感度指標にも示唆的。
- 画像 src URL は HTML 抽出で未確認のため埋め込みなし。数値は本文抽出に基づく。
- $\bar p=-p\log(1-p)$ の log p 変換が type-III エラー抑制の鍵。spherical regularisation は最適化上のテクニック（最適解不変）。
