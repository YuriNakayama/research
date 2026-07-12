# An Algorithm for Identifying Interpretable Subgroups With Elevated Treatment Effects

- **Link**: https://arxiv.org/abs/2507.09494 （HTML: https://arxiv.org/html/2507.09494v1）
- **Authors**: Albert Chiu
- **Year**: 2025（arXiv 投稿: 2025-07-13）
- **Venue**: arXiv preprint（stat.ML）。査読付き会議・ジャーナルへの採録情報は記載なし
- **Type**: 手法提案論文（causal inference / interpretable subgroup discovery / heterogeneous treatment effect）

---

## Abstract (English)

> The paper introduces a computational approach for discovering easily understood subgroups that exhibit stronger treatment responses, starting from conditional average treatment effect estimates. These subgroups use "rule sets" — logical statements combining conditions through AND/OR operators — to maintain clarity while capturing complex interactions. The method serves as a complement to existing CATE estimation techniques by extracting actionable insights from complex models to support practical decision-making and policy design. The authors propose an objective function balancing subgroup prevalence against effect magnitude, producing a frontier of non-dominated rule sets when adjusting the hyperparameter. The approach enables valid statistical inference via sample splitting, with applicability demonstrated through both simulated and real-world cases.

（注: 上記はフェッチした arXiv ページの要約であり、原文 abstract の逐語再現を意図している。厳密な逐語一致は原論文 PDF での確認を推奨する。）

## Abstract (Japanese)

本論文は、条件付き平均処置効果（CATE）の推定値を出発点として、より強い処置反応を示す「理解しやすいサブグループ」を発見するための計算的アプローチを提案する。これらのサブグループは「rule set」（AND/OR 演算子で条件を組み合わせた論理式）で表現され、複雑な交互作用を捉えつつ解釈可能性を保つ。本手法は既存の CATE 推定手法を置き換えるものではなく、その補完として機能し、複雑なモデルから実務的な意思決定・政策設計に資する actionable な知見を抽出する。著者は、サブグループの出現頻度（prevalence / support）と効果の大きさ（effect magnitude）をバランスさせる目的関数を提案し、ハイパーパラメータを調整することで非劣（non-dominated）な rule set の frontier を生成する。さらに sample splitting により妥当な統計的推論を可能とし、シミュレーションと実データの両方で適用可能性を示す。

---

## Overview（概要）

多くの CATE 推定手法（causal forest, meta-learner 等）は個体レベルで高精度な効果を返す一方、「誰に介入すべきか」を人間が理解・運用できる形で提示しない。本論文は、既に得られた CATE 推定値 $\hat{\tau}_i$ を**入力**として受け取り、その上で「効果が高く、かつ人間が読める」サブグループを **rule set** の形で探索する後処理（post-hoc）アルゴリズムを提案する。

中心的な貢献は次の 3 点である。

1. **rule set による解釈可能なサブグループ表現**: 決定木より簡潔に重なりのあるサブグループを表現できることを理論的に示す。
2. **乗法型（multiplicative）目的関数**: サブグループサイズと効果量のトレードオフを 1 つのハイパーパラメータ $\alpha$ で制御し、$\alpha$ を掃引することで Pareto frontier 上の解を回収する。線形スカラー化が失敗する非凸フロンティアの内部点も回収できる。
3. **simulated annealing による探索**と **sample splitting による妥当な推論**。

---

## Problem（課題）

- CATE 推定は個体レベルでは精緻だが、複雑なモデル（森・NN 等）は「なぜ・誰に効くか」を説明できず、実務の意思決定・政策設計に落とし込みにくい。
- 単純な決定木（policy tree など）は解釈可能だが、根ノード条件が全パスに強制されるため、重なりのあるサブグループ（overlapping subgroups）を表現するのに指数的に深い木を要し、非効率。
- サブグループ探索では「効果の大きさ」と「該当ユーザーの多さ（support）」が本質的にトレードオフ。単純な線形加重（linear scalarization）では非凸 Pareto frontier の内部点を回収できない。
- 探索した後に「そのサブグループの効果は本当に有意か」を、探索そのものによるデータ流用（selection bias）を避けつつ検定する必要がある。

---

## Proposed Method（提案手法）

### Core idea

CATE 推定値 $\hat{\tau}_i$ が与えられたとき、rule set $A$（各 rule は条件の AND、rule 間は OR）で定義されるサブグループについて、**「support の大きさ」と「サブグループ内の平均効果の高さ」を乗法的に組み合わせた目的関数**を最大化する。$\alpha$ を変えることで frontier 上の複数解を得る。

### Numbered steps

1. 既存手法（例: causal forest）で各個体の CATE 推定値 $\hat{\tau}_i$ を得る。
2. 特徴量 $X$ から候補条件（連続変数は閾値による $\ge / <$、離散変数はカテゴリ一致）を構成する。
3. ハイパーパラメータ $\alpha$ を固定し、目的関数 $F(A, X, \hat{\tau}; \alpha)$ を simulated annealing で最大化して rule set $A$ を探索する。
4. rule 長 $L_{\max}$ と総複雑度 $C_{\max}$ の制約で解釈可能性（parsimony）を担保する。
5. $\alpha$ を掃引し、support–effect の Pareto frontier 上の非劣解集合を得る。
6. sample splitting（train で rule 発見、test で効果推定）により、発見したサブグループ効果の有効な検定・信頼区間を得る。

### Key Formulas

目的関数（乗法型）:

$$
F(A, X, \hat{\tau}; \alpha) \;=\; \left(\frac{\mathrm{supp}(A)}{N}\right)^{\alpha} \times \frac{\displaystyle\sum_{i \in A}\hat{\tau}_i \;-\; \min_i \hat{\tau}_i}{\displaystyle\max_i \hat{\tau}_i \;-\; \min_i \hat{\tau}_i}
$$

- $\mathrm{supp}(A)/N$: rule set $A$ に該当する個体割合（support）。
- 第 2 項: サブグループ内効果を $[\min\hat\tau, \max\hat\tau]$ で正規化した効果量。
- $\alpha = 0$ で効果量のみ、$\alpha$ を大きくするほど support（群サイズ）を重視。$\alpha$ 掃引で Pareto frontier を描く。

simulated annealing の受理確率:

$$
p_{\text{accept}} \;=\; \min\left\{\, 1,\; \exp\!\left(\frac{F(\text{proposal}) - F(A_t)}{T_t}\right)\right\}
$$

冷却スケジュール（指数冷却）:

$$
T_t \;=\; T_0\,\eta^{\,t}, \qquad 0 < \eta < 1
$$

rule set の複雑度（parsimony 指標）:

$$
\mathrm{complexity}(A) \;=\; \sum_{a \in A} \mathrm{length}(a)
$$

ここで $\mathrm{length}(a)$ は rule $a$ に含まれる条件数。

群間比較時の分散伝播（サブグループ A と B の効果差の分散）:

$$
\sigma^2_{\Delta} \;=\; \sigma^2_A + \sigma^2_B - 2\,\sigma_{AB}
$$

---

## Algorithm（擬似コード / Pseudocode）

```text
Input: features X, CATE estimates τ̂, hyperparameter α,
       constraints L_max (max rule length), C_max (max total complexity),
       T_0, cooling rate η, iterations M
Output: rule set A* maximizing F

A ← initialize (empty or single random rule)
T ← T_0
for t = 1 .. M:
    # early iterations: coarse moves; later: fine, single-condition moves
    op ← sample_operation(t)   # {ADD, CUT, REPLACE} or
                               # {ADDcond, CUTcond, REPLACEcond}
    A' ← apply(op, A)          # respect L_max and C_max
    ΔF ← F(A', X, τ̂; α) - F(A, X, τ̂; α)
    if ΔF > 0 or rand() < exp(ΔF / T):
        A ← A'                 # accept
    if F(A) > F(A*): A* ← A
    T ← T_0 * η^t              # cool down
return A*

# Sweep α over a grid → collect non-dominated (support, effect) rule sets
# → Pareto frontier
```

推論フェーズ:

```text
Split data into train / test (e.g., 70 / 30)
Discover A* on train
Estimate τ(A*) and its variance on test
Hypothesis test H0: τ(A*) = 0  (or compare two subgroups via σ²_Δ)
```

---

## Architecture / Process Flow

```mermaid
flowchart TD
    A[観測データ X, 処置 W, 結果 Y] --> B[CATE 推定<br/>causal forest 等 → τ̂_i]
    B --> C[候補条件の生成<br/>連続: 閾値 ≥/<, 離散: カテゴリ一致]
    C --> D{α を固定}
    D --> E[Simulated Annealing 探索<br/>ADD/CUT/REPLACE (+cond 版)]
    E --> F[目的関数 F(A,X,τ̂;α) 最大化<br/>制約 L_max, C_max]
    F --> G[rule set A* 出力]
    D -->|α を掃引| H[Pareto frontier<br/>support × effect の非劣解集合]
    G --> I[Sample splitting による推論<br/>train:発見 / test:効果推定・検定]
    H --> I
    I --> J[解釈可能サブグループ + 有意性]
```

---

## Figures & Tables

> 注: 本論文の HTML には数値表（table 要素）は含まれておらず（「No tables with numerical data appear in the source document」）、以下の「表」は本文中の数値を retrieval 用に整理した再構成である。図の画像 URL は HTML フェッチで実在を確認したもののみを掲載する。

### Figure 1. 決定木 vs rule set の複雑度

rule set が重なりのあるサブグループを木より簡潔に表現できることを図示。例として、長さ 3 の重なる 2 rule は tree depth 4 を要するが rule set complexity は 6。

![Example Tree](https://arxiv.org/html/2507.09494v1/x1.png)
![Complexity and Policy Class Size](https://arxiv.org/html/2507.09494v1/x2.png)

### Figure 2. 離散シミュレーションの Pareto frontier（concave / convex）

![Concave Pareto Front](https://arxiv.org/html/2507.09494v1/x3.png)
![Convex Pareto Front](https://arxiv.org/html/2507.09494v1/x4.png)

### Figure 3. 連続変数（adversarial）設定

![Continuous Setting](https://arxiv.org/html/2507.09494v1/x5.png)

### Figure 4. Job Corps で選択された処置 rule

![Selected Treatment Rules](https://arxiv.org/html/2507.09494v1/x6.png)

### Figure 5. train / test 性能

![Training and Test Set Performance](https://arxiv.org/html/2507.09494v1/x7.png)

### Table A. 主要実験結果（本文数値の再構成）

| 実験 | 設定 | 主要結果 |
|------|------|----------|
| Simulation 1（離散） | N=1,000, J=10 binary, 3 rules, μ=(4.5,6.5,7) concave / (1,5,10) convex | 乗法型は concave front を全点回収、convex front は内部点を部分回収。線形型は convex front で失敗 |
| Simulation 2（連続 / adversarial） | N=10,000, 連続変数 10（Uniform[0,1]）, τ(x) ∝ (X₁+X₂+1)(X₄+X₅+1)(X₇+X₈+1) | 変数組み合わせ 69 中 58（**84.1%**）が真の交互作用。条件 170 中 161（**94.7%**）が正しい向き（≥）を使用 |
| Empirical（Job Corps） | 元 81,000 名 → 完全ケース 7,830 obs、train/test = 70/30、causal forest で週次収入（割当 3〜4 年後）の CATE | policytree（depth 2, 4）より柔軟。overfitting は最小限で train/test 曲線がほぼ一致（depth-2 tree を除く） |

### Table B. 手法比較（本文の定性的比較の再構成）

| 手法 | 重なりサブグループ | Pareto 内部点（非凸）回収 | 計算量 | 解釈性 |
|------|:--:|:--:|:--:|:--:|
| 本手法（乗法型目的 + SA） | ○（rule set） | ○（部分回収） | 中（SA） | 高（rule set） |
| 線形スカラー化 | ○ | ×（凸包上のみ） | 低 | 高 |
| hypervolume スカラー化 | ○ | ◎（完全回収） | 高 | 高 |
| decision / policy tree | ×（根条件が全パス強制で深化） | 目的が全体 welfare のみ | 低 | 中 |

### Table C. アブレーション / 目的関数比較（本文数値の再構成）

| 目的関数 | concave front | convex（非凸）front |
|----------|:--:|:--:|
| 乗法型（提案） | 全点回収 | 内部点を部分回収 |
| 線形加重（linear scalarization） | 回収可 | 内部点を回収できず（失敗） |

---

## Experiments & Evaluation（実験と評価）

### Setup

- **Simulation 1（離散）**: $N=1{,}000$、$J=10$ の binary 変数。真の DGP は 3 つの rule から成り、効果パラメータ $\mu=(4.5,6.5,7)$（concave front を生む）と $\mu=(1,5,10)$（convex front を生む）の 2 通り。
- **Simulation 2（連続 / adversarial）**: $N=10{,}000$、$\mathrm{Uniform}[0,1]$ の連続変数 10 個。真の CATE は $\tau(x) \propto (X_1+X_2+1)(X_4+X_5+1)(X_7+X_8+1)$ の乗法的交互作用。
- **Empirical（National Job Corps Study）**: 元は約 81,000 名の若年者を職業訓練にランダム割当。完全データのサブセットで 7,830 obs。CATE は causal forest で割当後（3〜4 年後）の週次収入に対して推定。train/test = 70/30。

### Main Results（数値付き）

- **Simulation 1**: 乗法型目的関数は concave front 上のすべての点を回収し、convex front では内部点を部分的に回収した。線形目的関数は convex（非凸）front で内部点を回収できなかった。
- **Simulation 2**: 特定された変数の組み合わせ 69 個中 **58 個（84.1%）** が真の交互作用に対応し、出現した条件 170 個中 **161 個（94.7%）** が正しい向き（$\ge$ 演算子）を使用した。
- **Empirical（Job Corps）**: 本手法は全体 welfare のみを最適化する policytree（depth 2, 4）より柔軟なサブグループを提示。overfitting は最小限で、train/test の性能曲線は（depth-2 tree を除き）ほぼ一致した。具体的な数値表は原論文に table 形式では記載なし（図 4・図 5 で提示）。

### Ablation

- **目的関数のアブレーション**: 乗法型 vs 線形スカラー化を非凸 Pareto front で比較し、乗法型のみが内部点を回収できることを示した（Table C）。
- **hypervolume スカラー化との対比**: hypervolume 型は非凸 front を完全回収できるが計算コストが高い。乗法型はより単純ながら実用上十分な内部点回収を達成、というトレードオフを論じた。
- **限界**: 凸 front での回収は部分的（hypervolume ほど完全でない）、rule 発見の安定性（stability）に課題、adversarial 設定では high-effect / low-support rule で overfitting の兆候。

---

## 本テーマへの適用可能性

**想定シナリオ**: データサイエンティストが**頻度の低いマーケティング施策**（例: 季節キャンペーン、限定クーポン配布）を運用し、処置効果が**高く・かつ均質（homogeneous）なサブグループ**を発見して、類似ユーザーをまとめ、効果を安定的に推定・転用したい。

本論文はこのニーズに直接的に適合する。理由と具体的な適用像を以下に整理する。

- **「効果が高いサブグループ」を rule set で発見する後処理手法**: まず uplift model / causal forest で個体 CATE $\hat\tau_i$（キャンペーン反応リフト）を推定し、その上に本手法を載せる。出力は「（年齢 ≥ 35 AND 過去購入 ≥ 3 回）OR（アプリ利用 ≥ 週2）」のような**運用可能な rule set**で、マーケ担当が直接ターゲティング条件として使える。これは「類似ユーザーをグループ化して効果を割り当てる」という要求そのものである。

- **均質性 × サイズのトレードオフ制御**: $\alpha$ を掃引して得られる Pareto frontier は、「効果は非常に高いが少人数のセグメント」〜「効果はやや落ちるが十分な規模のセグメント」を並べて提示する。頻度の低い施策では**サンプルが限られ効果推定が不安定**になりやすいため、support を確保しつつ効果が均質なセグメント（frontier 上の中間解）を選ぶことで、推定分散を抑えられる。$\alpha$ が意思決定者の「規模 vs 効果」選好の直接的つまみになる。

- **効果の信頼できる推定・転用（sample splitting）**: 施策回数が少ないと「発見したセグメントが本当に効くのか」が selection bias で過大評価されやすい。本手法は train で rule を発見し test で効果を推定する分割設計を組み込んでおり、**次回同種キャンペーンへ転用する際の効果の下振れ検証**（$H_0: \tau(A)=0$ の検定、群間差 $\sigma^2_\Delta$）に使える。これは「効果を reliably に推定・転用したい」要求に合致する。

- **重なりサブグループの表現力**: マーケでは「若年ライトユーザー」と「高頻度シニア」のように**互いに重なる複数セグメント**が同時に高反応となることがある。rule set（OR 結合）は決定木より簡潔にこれを表現でき、木ベースの policy tree より柔軟にセグメント設計できる。

- **実務上の留意点**: (1) 入力の $\hat\tau_i$ の質に結果が依存するため、上流の uplift/CATE モデルの妥当性検証が前提。(2) low-support・high-effect rule は overfitting しやすいため、$C_{\max}$・$L_{\max}$ で複雑度を抑え、test 集合での効果確認を必須とする。(3) rule 発見の安定性に課題があるため、複数シード・複数 train split での rule の再現性を確認し、頑健に現れる条件のみを運用に採用するのが安全。

**まとめ**: 「頻度の低い施策で、効果が高く均質なサブグループを発見し、類似ユーザーをまとめて効果を安定推定・転用する」という本テーマに対し、本手法は (a) rule set による直接運用可能なグループ定義、(b) $\alpha$ による規模–効果トレードオフの明示的制御、(c) sample splitting による転用時の効果検証、という 3 点で実務的に有用である。

---

## Notes（備考）

- 本論文は査読前の arXiv preprint（stat.ML）であり、会議・ジャーナル採録情報は記載なし。著者は Albert Chiu（単著）。
- 原論文 HTML には数値の table 要素が存在せず、本レポートの Table A〜C は本文中の記述・数値を retrieval 用に整理した再構成である（原表そのものではない）。
- 図 URL（x1〜x7.png）は HTML フェッチで実在を確認したもののみ掲載。
- Abstract (English) は arXiv ページのフェッチ結果に基づく整形であり、逐語一致の厳密確認には原論文 PDF 参照を推奨する。
- コード公開（GitHub 等）の有無は本フェッチ範囲では確認できず、記載なし。
- 主要数値: N=1,000（J=10 binary）/ N=10,000（連続 10 変数）/ 交互作用回収 84.1%（58/69）/ 条件方向 94.7%（161/170）/ Job Corps 81,000 → 7,830 obs / train:test = 70:30。
