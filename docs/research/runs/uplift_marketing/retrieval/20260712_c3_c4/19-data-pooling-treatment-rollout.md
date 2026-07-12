# Synthesizing Evidence: Data-Pooling as a Tool for Treatment Selection in Online Experiments

- **Link**: https://arxiv.org/abs/2508.10331 （HTML: https://arxiv.org/html/2508.10331v3）
- **Code**: https://github.com/shoucheng666/Data-Pooling-Treatment-Roll-Outs
- **Authors**: Zhenkang Peng, Chengzhang Li, Ying Rong, Renyu Zhang
- **Year**: 2025（v1: 2025-08-14 / v3: 2026-06-06 改訂）
- **Venue**: arXiv preprint, Statistics > Methodology (stat.ME)
- **Type**: 方法論論文（因果推論 / 実験計画 / shrinkage 推定）

---

## Abstract (English)

> Randomized experiments are the gold standard for causal inference but face significant challenges in business applications, including limited traffic allocation, the need for heterogeneous treatment effect estimation, and the complexity of managing overlapping experiments. These factors lead to high variability in treatment effect estimates, making data-driven policy roll out difficult. To address these issues, we introduce the data pooling treatment roll-out (DPTR) framework, which enhances policy roll-out by pooling data across experiments rather than focusing narrowly on individual ones. DPTR can effectively accommodate both overlapping and non-overlapping traffic scenarios, regardless of linear or nonlinear model specifications. We demonstrate the framework's robustness through a three-pronged validation: (a) theoretical analysis shows that DPTR surpasses the traditional difference-in-mean and ordinary least squares methods under non-overlapping experiments, particularly when the number of experiments is large; (b) synthetic simulations confirm its adaptability in complex scenarios with overlapping traffic, rich covariates and nonlinear specifications; and (c) empirical applications to two experimental datasets from real world platforms, demonstrating its effectiveness in guiding customized policy roll-outs for subgroups within a single experiment, as well as in coordinating policy deployments across multiple experiments with overlapping scenarios.

## Abstract (日本語訳)

> ランダム化実験は因果推論のゴールドスタンダードだが、ビジネス応用では、トラフィック配分の制約、異質処置効果（heterogeneous treatment effect）推定の必要性、重複する実験（overlapping experiments）の管理の複雑さといった大きな課題に直面する。これらの要因は処置効果推定量の分散を大きくし、データ駆動のポリシー roll-out（本番展開）を困難にする。本研究はこの問題に対し、**data pooling treatment roll-out (DPTR)** フレームワークを提案する。DPTR は個々の実験だけに狭く注目するのではなく、複数実験にまたがってデータをプール（pool）することで roll-out を改善する。DPTR は overlapping / non-overlapping いずれのトラフィックにも、線形・非線形いずれのモデル指定にも適用できる。堅牢性を三つの観点で検証する。(a) 理論解析により、non-overlapping 実験下で DPTR が従来の difference-in-mean・OLS を上回ること（特に実験数が多いとき）を示す。(b) 合成シミュレーションにより、overlapping トラフィック・豊富な共変量・非線形指定という複雑な状況でも適応的であることを確認する。(c) 実世界プラットフォームの二つの実験データセットへの適用により、単一実験内のサブグループ向けカスタマイズ roll-out と、overlapping する複数実験にまたがるポリシー展開の調整の両方で有効性を示す。

---

## Overview

オンラインプラットフォームでは日々数百〜数千の A/B テストが並行して走るが、各実験に割り当てられるトラフィックは限られており、**データ希少性（data scarcity）** による推定量の高分散が roll-out 判断を不安定にする。特にサブグループ（異質効果）に切ると各セルのサンプル数が極端に小さくなり、個別実験ごとの ATE 推定は「ノイズだらけ」になる。

DPTR は、**個々の実験を孤立して分析するのではなく、多数の実験の推定値を shrinkage（縮小）推定によってプールされたアンカー（全実験平均）へ引き寄せる**ことで、この高分散を抑え、より信頼できる roll-out 判断を得る。ポイントは、単なる MSE 最適化ではなく **roll-out 判断（有意水準 α による閾値判定）そのものを目的関数に組み込んだ decision-aware な shrinkage** を行うことにある。

---

## Problem（課題）

- **トラフィック希少性**: 各実験に割ける traffic が小さく、個別 ATE 推定量の分散が大きい。
- **異質処置効果推定**: サブグループ単位で見ると各セルのサンプルがさらに小さくなり、推定が不安定。
- **overlapping experiments の管理**: 同一ユーザーが複数の並行実験に同時に晒される状況では、実験間の交絡・調整が複雑。
- **roll-out 判断の困難さ**: 高分散な推定量に基づく「展開するか否か」の意思決定は誤りやすく、価値を取りこぼす。
- **従来手法の限界**: difference-in-mean（DiM）や OLS を各実験に独立適用すると、K（実験数）が大きく N（各実験サンプル数）が小さい領域で性能が劣化する。

---

## Proposed Method（提案手法：DPTR）

### コアアイデア

各実験 k の個別推定量 $\hat\tau_k$ を、全実験から作った**プール済みアンカー** $\hat\tau_0$（全個別推定値の平均）へ向けて縮小する James–Stein 型 shrinkage を行う。縮小強度は data-driven なスケールパラメータ $\beta$ で制御し、その $\beta$ には **roll-out 閾値（有意水準 $z_{1-\alpha/2}$）を織り込んだ decision-aware 補正項**を加える。

### 手順（numbered steps）

1. 各実験 k について個別 ATE 推定量 $\hat\tau_k$ とその分散 $s_k^2$（あるいは信頼区間）を得る。
2. プールアンカー $\hat\tau_0 = \frac{1}{K}\sum_k \hat\tau_k$ を計算する。
3. データからスケールパラメータ $\hat\beta$ を推定する（分散–異質性トレードオフ項 + decision-aware 補正項）。
4. 各実験について縮小推定量 $\bar\tau_k$ と、その縮小後の信頼下限 $\bar\tau_k^{lb}$ を構成する。
5. $\bar\tau_k^{lb} > 0$ なら実験 k のポリシーを roll-out する。
6. overlapping / 非線形の場合は、実験固有の $\beta_k$（共変量構造 $b_k$ を反映）や DML（double machine learning）による $\hat\tau_k$ 推定に置き換える。

### Key Formulas

**Shrinkage 推定量（中核）**

$$\bar\tau_k = \frac{N}{N+\beta}\,\hat\tau_k + \frac{\beta}{N+\beta}\,\hat\tau_0$$

**スケールパラメータ推定（non-overlapping・線形・共変量なし）**

$$\hat\beta = \frac{\sum_k 4 s_k^2}{\sum_k(\hat\tau_k-\hat\tau_0)^2 - \frac{1}{KN}\sum_k 4 s_k^2} + \frac{z_{1-\alpha/2}\sqrt{N\sum_k 4 s_k^2}}{\hat\tau_0}$$

第1項が分散–異質性トレードオフ、第2項が roll-out 閾値を考慮した decision-aware 補正。

**共変量あり（OLS）**

$$\hat\beta_k = \frac{b_k^2\left(\frac{1}{K}\sum_{k'} s_{k'}^2\right)}{\frac{1}{K}\sum_{k'}(\hat\tau_{k'}-\hat\tau_0)^2 - \frac{1}{N}\left(\frac{1}{K}\sum_{k'} s_{k'}^2\right)\left(\frac{1}{K}\sum_{k'} b_{k'}^2\right)} + \frac{z_{1-\alpha/2}\, b_k \sqrt{N\sum_{k'} s_{k'}^2}}{\hat\tau_0}$$

ここで $b_k=\sqrt{N\,\mathbf{I}^\top (\mathbf{t}_k^\top \mathbf{t}_k)^{-1}\mathbf{I}}$ は実験固有の共変量構造を反映する。

**縮小後の信頼下限**

$$\bar\tau_k^{lb} = \frac{N}{N+\hat\beta}\,\hat\tau_k^{lb} + \frac{\hat\beta}{N+\hat\beta}\,\hat\tau_0$$

### 理論結果（non-overlapping・線形）

- **Theorem 4.1（最適 β・共変量なし）**: $\hat\tau_0>0$ のとき $\beta^* = \dfrac{4\sigma^2}{\sigma_0^2} + \dfrac{2\sqrt{N}\,z_{1-\alpha/2}\,\sigma}{\hat\tau_0}$。正アンカー領域で DPTR は ITR を厳密に改善。
- **Theorem 4.2（MSE 最適）**: MSE 最適スケールは $4\sigma^2/\sigma_0^2$（第1項のみ、decision 補正なし）。
- **Theorem 4.3（一致性）**: $K\to\infty$ で $\hat\beta^* \to_p \beta^*$。
- **Theorem 4.4**: 推定パラメータを用いた DPTR の期待報酬 $\bar r(\hat\beta^*,\hat\tau_0)\to_p \mathcal{R}(\beta^*,\tau_0)>$ ITR ベースライン。
- **Theorem 4.5（選択確率）**: $\lim_{K\to\infty}\mathbb{P}(\bar\tau_k^{lb}>0)=\Phi\!\left(\dfrac{N\tau_k+\tau_0\beta^*}{2\sqrt{N}\,\sigma}-z_{1-\alpha/2}\right)$。
- **Theorems 4.6–4.7**: 共変量あり OLS へ、実験固有 $\beta_k(b_k)$ を用いて同様の結果が拡張される。

---

## Algorithm（擬似コード）

```
Algorithm 1: ITR (Individual Treatment Roll-Out) — ベースライン
  input: 各実験 k の観測データ
  for each experiment k:
      推定 τ̂_k と信頼区間 [τ̂_k^lb, τ̂_k^ub]
      if τ̂_k^lb > 0:
          roll out experiment k
  return roll-out 判定集合

Algorithm 2: DPTR (Data-Pooling Treatment Roll-Out)
  input: 実験集合 S, モデル指定 M（linear / DML, overlap / non-overlap）
  1. for each k: 推定 τ̂_k, s_k^2（または DML 推定）
  2. アンカー   τ̂_0 = (1/K) Σ_k τ̂_k
  3. スケール   β̂ = β̂(S, M)   # 式(4)/(11)/(14)/(17) をシナリオで選択
  4. for each experiment k:
        τ̄_k^lb = (N/(N+β̂)) τ̂_k^lb + (β̂/(N+β̂)) τ̂_0
        if τ̄_k^lb > 0:
            roll out experiment k
  return roll-out 判定集合
```

---

## Architecture / Process Flow

```
                 K 個の並行実験（各 N 観測、traffic 希少）
   ┌────────┐  ┌────────┐  ┌────────┐        ┌────────┐
   │ Exp 1  │  │ Exp 2  │  │ Exp 3  │  ....  │ Exp K  │
   └───┬────┘  └───┬────┘  └───┬────┘        └───┬────┘
       │ τ̂_1,s_1  │ τ̂_2,s_2  │ τ̂_3,s_3         │ τ̂_K,s_K
       └──────┬────┴──────────┴─────────────────┘
              ▼
     [1] 個別推定  τ̂_k （linear / OLS / DML）
              ▼
     [2] プールアンカー  τ̂_0 = mean_k τ̂_k
              ▼
     [3] スケール推定  β̂
         = (分散–異質性トレードオフ項)
         + (decision-aware 補正:  z_{1-α/2} 閾値を反映)
              ▼
     [4] shrinkage:  τ̄_k = (N/(N+β̂))τ̂_k + (β̂/(N+β̂))τ̂_0
              ▼
     [5] roll-out 判定:  τ̄_k^lb > 0 ?  → yes: 展開 / no: 見送り
```

---

## Figures & Tables

> 注: 本文 HTML から実際に確認できた画像のみを埋め込む。数値表（Section 5–6）は取得した HTML 抜粋では欠落していたため、該当セルは「記載なし」と明記する。

### Figure 1a — Running example（7 実験 × 10 観測の報酬比較）

![Figure 1a: DPTR vs ITR の平均報酬比較（7 実験・各 10 観測、1,000 インスタンス）](https://arxiv.org/html/2508.10331v3/average_cost_toy.png)

7 個の同時実験（各 10 観測 = treatment 5 / control 5、異質 ATE）で、DPTR がノイジーな個別推定をプール平均へ縮小することで平均総報酬を大きく改善する様子を示す。

### Figure 1b — 決定境界の分析（different ATE）

![Figure 1b: 異なる ATE における roll-out 決定境界の分析](https://arxiv.org/html/2508.10331v3/different_ate_1.png)

### Table A — 4 つの実験シナリオと適用式（本文から再構成）

| Scenario | Overlapping | Model | スケール式 |
|----------|-------------|-------|-----------|
| 1 | No  | Linear            | Eqn (4)  |
| 2 | No  | Nonlinear (DML)   | Eqn (11) |
| 3 | Yes | Linear (OLS)      | Eqn (14) |
| 4 | Yes | Nonlinear (DML)   | Eqn (17) |

### Table B — 手法比較（method-comparison）

| 手法 | データ利用 | β / 縮小 | 主な弱点 |
|------|-----------|---------|---------|
| Difference-in-Mean (DiM) | 各実験を独立 | なし | K 大・N 小で高分散 |
| OLS (per-experiment) | 各実験を独立（共変量あり） | なし | 同上、サブグループで劣化 |
| ITR (Algorithm 1) | 各実験を独立 | なし | roll-out 判断が不安定 |
| **DPTR (Algorithm 2)** | **K 実験をプール** | **decision-aware $\hat\beta$** | Assumption 3（処置間非交互作用）に依存 |

### Table C — 主要結果テーブル（Optimality Ratio / VDP / 分類指標）

| 指標 | DPTR | ITR / DiM / OLS |
|------|------|-----------------|
| Optimality Ratio (OR) = $\hat r_{method}/r^*$ | 記載なし（取得 HTML に数値なし） | 記載なし |
| Value of Data Pooling (VDP) = $\hat r_{method}/\hat r_{ITR}-1$ | 記載なし | 記載なし |
| Accuracy | 記載なし | 記載なし |
| Recall | 記載なし | 記載なし |
| Specificity | 記載なし | 記載なし |
| Precision | 記載なし | 記載なし |

### Table D — ablation / 分析（robustness）

| 分析軸 | 内容 | 数値 |
|--------|------|------|
| K（実験数）依存 | K が大きいほど DPTR の優位が拡大（理論・Th 4.1） | 記載なし |
| MSE 最適 vs decision 最適 | decision-aware 補正項の有無で roll-out 価値が変化 | 記載なし |
| モデル誤指定 | logistic 誤指定下でのロバスト性（Appendix 12） | 記載なし |
| overlapping traffic | 共有ユーザーを含む並行実験の調整 | 記載なし |

---

## Experiments & Evaluation

### Setup

- **DGP（線形）**: $Y_{k,i}=a_k+\tau_k D_{k,i}+\varepsilon_{k,i}$。非線形は partial linear $g_k(\cdot)$ を含む部分線形モデル。
- **Assumption 3**: 処置効果は実験間で加法的（交互作用なし）。
- **有意水準**: デフォルト $\alpha=0.05$。
- **Running example**: 7 同時実験・各 10 観測（treat 5 / control 5）、異質 ATE、1,000 インスタンス。
- **評価指標**: OR（Optimality Ratio, オラクル比）、VDP（Value of Data Pooling, ITR 比改善率）、および分類指標（Accuracy / Recall / Specificity / Precision）。

### Main Results

- 理論解析（Theorems 4.1–4.5）: **non-overlapping・線形**の下で DPTR は DiM・OLS を上回り、K が大きいときに優位が顕著。
- 合成シミュレーション: overlapping traffic・豊富な共変量・非線形指定の複雑シナリオでも適応的（Scenarios 1–4）。
- 実データ 2 セット（Section 6）: (i) 単一実験内のサブグループ向けカスタマイズ roll-out、(ii) overlapping する複数実験にまたがるポリシー展開の調整、で有効性を確認。
- **具体的な数値（OR / VDP / 分類指標の値）**: 取得した HTML 抜粋では表本体が欠落しており、**記載なし**（原論文 Section 5–6 と GitHub リポジトリを参照）。

### Ablation

- decision-aware 補正項（第2項）を外すと MSE 最適 $\beta=4\sigma^2/\sigma_0^2$ に一致（Theorem 4.2）。roll-out 価値の観点では補正項ありが優れる。
- モデル誤指定（logistic, Appendix 12）や capacity 制約なしの前提（Appendix 13.2）に関する感度分析あり。具体値は記載なし。

---

## 本テーマへの適用可能性

本テーマ（marketing キャンペーン＝クーポン/メール配信を低頻度で実施し、ターゲットユーザーや treatment が毎回異なる。似たキャンペーンを **グループ化・プール**して密なデータを合成し、実効サンプル数を増やし、実効的な実験間隔を短縮して uplift modeling / off-policy evaluation に活かしたい）に対し、DPTR は極めて直接的に噛み合う。

- **キャンペーン＝実験 k への写像**: 過去の低頻度キャンペーンそれぞれを実験 k、各キャンペーンの uplift 推定を $\hat\tau_k$ と見なせる。単発では N（配信数×転換）が小さく高分散だが、DPTR は $\bar\tau_k=\frac{N}{N+\beta}\hat\tau_k+\frac{\beta}{N+\beta}\hat\tau_0$ で全キャンペーン平均 $\hat\tau_0$ へ縮小し、**実効サンプル数を「借り」て（borrow strength）**データ密度を実質的に高める。

- **似たキャンペーンのプール**: treatment やターゲットが異なっても、共変量構造 $b_k$ を通じて OLS/DML 版の実験固有 $\beta_k$ を使えば、**類似度に応じた縮小強度**を自動調整できる。似たキャンペーン群ほど $\hat\tau_0$ への引き寄せが効き、外れたものは相対的に個別推定を尊重する。これは「似た campaign を group/pool して密なデータを合成する」という要求そのもの。

- **実効実験間隔の短縮**: 単独キャンペーンで有意差が出るまで待つ（＝次回配信まで長い間隔）代わりに、複数キャンペーンをプールして roll-out 判断 $\bar\tau_k^{lb}>0$ を早く安定化できる。これは「effective experiment interval を短くする」目的に直接寄与する。

- **サブグループ／ターゲット差への対応**: 「毎回ターゲットが違う」点は、単一実験内サブグループ roll-out（Section 6 の応用 (i)）と同型。セルが小さいサブグループでも、他サブグループ/他キャンペーンからの情報プールで uplift 推定が安定する。

- **overlapping への耐性**: 同一ユーザーが複数キャンペーンに晒される（クーポン＋メールの重複配信など）状況は overlapping scenario（Scenarios 3–4, DML 版）でカバーされ、off-policy evaluation の交絡調整にも接続しやすい。

- **decision-aware な点が実務的**: 目的が「配信を本番展開するか否か」の意思決定であるため、MSE ではなく roll-out 閾値（$z_{1-\alpha/2}$）を織り込む DPTR の設計は、marketing の go/no-go 判断にそのまま使える。

- **実装上の注意**: Assumption 3（キャンペーン間で処置効果が加法的・非交互作用）が成り立ちにくい場合（例: クーポンとメールの強い相互作用）には overlapping+DML 版を選び、交互作用を明示的にモデル化する必要がある。また $\hat\tau_0>0$（正アンカー）領域で優位が理論保証される点に留意。

---

## Notes

- 取得した arXiv HTML 抜粋には Section 5–6 の**数値表本体が含まれていなかった**ため、OR / VDP / Accuracy / Recall / Specificity / Precision の具体値はすべて「記載なし」とした。正確な数値は原論文 v3 および GitHub（`shoucheng666/Data-Pooling-Treatment-Roll-Outs`）で確認のこと。
- 埋め込み画像は HTML 内で実在を確認した 2 枚（`average_cost_toy.png`, `different_ate_1.png`）のみ。
- venue は査読付き会議/ジャーナルではなく arXiv preprint（stat.ME）。v1 2025-08-14 → v3 2026-06-06。
- 数式・定理は取得テキストから転記。$\beta$ の第2項（decision-aware 補正）が本手法の新規性の核。
