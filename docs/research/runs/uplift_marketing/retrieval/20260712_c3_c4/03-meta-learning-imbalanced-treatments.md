# Learning to Infer Counterfactuals: Meta-Learning for Estimating Multiple Imbalanced Treatment Effects (MetaITE)

- **Link**: https://arxiv.org/abs/2208.06748
- **Authors**: Guanglin Zhou, Lina Yao, Xiwei Xu, Chen Wang, Liming Zhu
- **Year**: 2022 (arXiv 投稿: 2022-08-13)
- **Venue**: arXiv preprint (cs.LG; stat.ME)。11 ページ。査読付き会議/ジャーナルの掲載記載なし
- **Type**: 手法提案論文（因果推論 × メタ学習）

---

## Abstract (English, verbatim)

> We regularly consider answering counterfactual questions in practice, such as "Would people with diabetes take a turn for the better had they choose another medication?". Observational studies are growing in significance in answering such questions due to their widespread accumulation and comparatively easier acquisition than Randomized Control Trials (RCTs). Recently, some works have introduced representation learning and domain adaptation into counterfactual inference. However, most current works focus on the setting of binary treatments. None of them considers that different treatments' sample sizes are imbalanced, especially data examples in some treatment groups are relatively limited due to inherent user preference. In this paper, we design a new algorithmic framework for counterfactual inference, which brings an idea from Meta-learning for Estimating Individual Treatment Effects (MetaITE) to fill the above research gaps, especially considering multiple imbalanced treatments. Specifically, we regard data episodes among treatment groups in counterfactual inference as meta-learning tasks. We train a meta-learner from a set of source treatment groups with sufficient samples and update the model by gradient descent with limited samples in target treatment. Moreover, we introduce two complementary losses. One is the supervised loss on multiple source treatments. The other loss which aligns latent distributions among various treatment groups is proposed to reduce the discrepancy. We perform experiments on two real-world datasets to evaluate inference accuracy and generalization ability. Experimental results demonstrate that the model MetaITE matches/outperforms state-of-the-art methods.

## Abstract (日本語訳)

実務では「糖尿病患者が別の薬を選んでいたら好転したか？」といった反事実的問いに答える必要がしばしばある。観察研究は RCT（ランダム化比較試験）より蓄積が容易で入手しやすいため、こうした問いに答える手段として重要性を増している。近年、表現学習やドメイン適応を反事実推論に取り込む研究が現れているが、その大半は二値処置（binary treatments）の設定に限定されている。さらに、処置ごとにサンプルサイズが不均衡である点、とりわけユーザーの本質的な選好により一部の処置群のデータが相対的に少ないという事情を考慮した研究は存在しない。本論文では反事実推論のための新しいアルゴリズム的枠組みを設計し、個別処置効果（ITE）推定のためのメタ学習という発想（MetaITE）を導入して、特に「複数の不均衡な処置」という上記の研究ギャップを埋める。具体的には、処置群間のデータエピソードをメタ学習タスクとみなす。十分なサンプルを持つソース処置群の集合からメタ学習器を訓練し、サンプルが限られたターゲット処置群において勾配降下でモデルを更新する。さらに 2 つの補完的な損失を導入する。1 つは複数のソース処置に対する教師あり損失、もう 1 つは各処置群間の潜在分布を整合させ乖離を減らす損失である。2 つの実世界データセットで推論精度と汎化能力を評価し、MetaITE が最先端手法に匹敵または凌駕することを示す。

---

## Overview

本論文は、**観察データからの個別処置効果（ITE）推定**を、**複数処置かつ処置群間のサンプル数が不均衡**という現実的設定に拡張する初の試み。従来手法（CFR, TARNet, SITE など）は二値処置を前提とし、各処置群に十分なサンプルがある想定だが、実際にはユーザー選好により特定の処置群だけデータが極端に少ない（例: 高価な新薬を選ぶ患者は少数）。MetaITE はこの少数処置群を**ターゲットドメイン**、サンプルが潤沢な他の処置群を**ソースドメイン**とみなし、**MAML 型のメタ学習**によってソース群から知識を転移し、ターゲット群に少数サンプルで素早く適応させる。加えて **MMD（Maximum Mean Discrepancy）による潜在分布整合損失**でドメイン間のギャップを縮め、選択バイアスを緩和する。

## Problem（解くべき課題）

- **二値処置への偏り**: 既存の反事実推論手法の大半は 2 処置しか扱えず、多値/複数処置に一般化されていない。
- **処置間の不均衡**: ユーザーの本質的選好により、一部の処置群のサンプルが極端に少ない。少数群では素朴な推定器が過学習・高分散に陥る。
- **選択バイアス**: 観察データでは処置割当が共変量に依存し、各処置群の共変量分布が異なる（covariate shift）。
- **反事実の欠測**: 各個体は 1 つの処置の factual outcome しか観測されず、他処置の counterfactual outcome は原理的に欠測。
- **データ密度の不足**: 少数処置群単独では信頼できる ITE を学習するデータ量が足りない。

## Proposed Method（提案手法）

**Core idea**: 「処置群 = メタ学習タスク（ドメイン）」とみなす。潤沢なソース処置群 $\{S^j\}_{j=1}^{k-1}$ からメタ学習器を訓練し、少数のターゲット処置群 $T$ へ勾配降下で高速適応する。モデルは特徴抽出器と推論ネットの合成 $f = g \circ h$ で構成され、$g(\psi): X \to Z$（潜在表現）、$h(\theta): Z \to Y$（アウトカム予測）。episodic training で support/query set を用い、内側ループでローカル適応、外側ループでグローバル更新を行う。

**Numbered steps**:
1. **タスク構成**: 各エピソードで、ソース処置群 $S^j$ を一様ランダムに選び、そこから support set と query set をサンプリング。ターゲット群 $T$ のデータも収集。
2. **Inner loop（ローカル適応）**: support set 上の教師あり損失 $L_{Sup}$ で勾配降下し、適応後パラメータ $(\psi', \theta')$ を得る。
3. **Outer loop（グローバル更新）**: 適応後パラメータで query set 損失 $L_{Que}$ を評価し、元のパラメータ $(\psi, \theta)$ をメタ更新。
4. **分布整合**: support/query（およびソース/ターゲット）の潜在表現間の MMD を最小化し、ドメイン乖離を縮小。
5. **統合最適化**: query 損失・source 教師あり損失・discrepancy 損失・L2 正則化を重み付き結合した目的関数 $L_{obj}$ で更新。
6. **推論**: 学習済み $g(\psi), h(\theta)$ をターゲット処置群に適用し、各個体の全処置に対するアウトカムを予測して ITE を算出。

### Key Formulas

Support set 上の教師あり損失:
$$L_{Sup} = \sum_{i=1}^{K} L_{inf}\big(y_i^{Sup},\, h(g(X_i^{Sup}; \psi); \theta)\big)$$

Maximum Mean Discrepancy（潜在分布整合）:
$$\mathrm{MMD}^2(D_S^j, D_T) = \left\| \frac{1}{N}\sum k(\cdot, Z_S^j) - \frac{1}{M}\sum k(\cdot, Z_T) \right\|_{\mathcal{H}_k}^2$$

Discrepancy 損失:
$$L_{disc} = \mathrm{MMD}^2\big(g(X^{Sup}; \psi),\, g(X^{Que}; \psi)\big)$$

Query set 損失（適応後パラメータで評価）:
$$L_{Que} = \sum_{i=1}^{K} L_{inf}\big(y_i^{Que},\, h(g(X_i^{Que}; \psi'); \theta')\big)$$

メタ学習の勾配更新（inner / outer）:
$$(\psi', \theta') \leftarrow (\psi, \theta) - \alpha \nabla_{\psi,\theta} L_{Sup}$$
$$(\psi, \theta) \leftarrow (\psi, \theta) - \beta \nabla_{\psi,\theta} L_{Que}$$

統合目的関数:
$$L_{obj} = \mu L_{Que} + \epsilon L_{Sup} + \gamma L_{disc} + \|\omega\|_2$$

ここで $\mu, \epsilon, \gamma$ は損失重み、$\|\omega\|_2$ は L2 正則化項。

## Algorithm（擬似コード）

```
Algorithm 1: MetaITE Training
Input : ソース処置群 {D_S^j}_{j=1..k-1}, ターゲット処置群 D_T
        学習率 α, β, 損失重み μ, ε, γ
Output: 特徴抽出器 g(ψ), 推論ネット h(θ)

1  パラメータ ψ, θ を初期化
2  while not converged do                      # Outer loop（エピソード）
3      ソース処置群 S^j を一様ランダムに選択
4      support set / query set を D_S^j からサンプリング
5      # ---- Inner loop（ローカル適応）----
6      L_Sup = Σ_i L_inf(y_i^Sup, h(g(X_i^Sup; ψ); θ))
7      (ψ', θ') ← (ψ, θ) - α ∇_{ψ,θ} L_Sup
8      # ---- 損失計算 ----
9      L_Que  = Σ_i L_inf(y_i^Que, h(g(X_i^Que; ψ'); θ'))
10     L_disc = MMD²( g(X^Sup; ψ), g(X^Que; ψ) )   # 分布整合
11     L_obj  = μ·L_Que + ε·L_Sup + γ·L_disc + ||ω||_2
12     # ---- Outer loop（グローバル更新）----
13     (ψ, θ) ← (ψ, θ) - β ∇_{ψ,θ} L_obj
14 end while
15 return g(ψ), h(θ)
```

## Architecture / Process Flow

```
             ┌──────────── ソース処置群 {S^j}（潤沢） ────────────┐
             │   support set              query set               │
             ▼                             ▼                       │
        ┌─────────┐  Z       ┌─────────┐                          │
  X ──► │ g(ψ)    │ ───────► │ h(θ)    │ ──► ŷ                     │
        │特徴抽出 │          │推論ネット│                          │
        └─────────┘          └─────────┘                          │
             │                    │                                │
     [Inner loop]           [Outer loop]                          │
   (ψ,θ)-α∇L_Sup ─► (ψ',θ')   L_Que で (ψ,θ) をメタ更新           │
             │                                                     │
             └── MMD( g(X^Sup), g(X^Que) ) = L_disc（分布整合）────┘
                            ▲
             ┌──────────────┴───── ターゲット処置群 T（少数）──────┐
             │  少数サンプルで勾配降下により高速適応                │
             └─────────────────────────────────────────────────────┘

     統合目的:  L_obj = μ·L_Que + ε·L_Sup + γ·L_disc + ||ω||_2
```

---

## Figures & Tables

### Figure 1: 不均衡 2 処置の効果推定イメージ

![Illustration of effect estimation on two imbalanced treatments from observational data.](https://arxiv.org/html/2208.06748/assets/x1.png)

> Figure 1 (caption 抜粋): 糖尿病患者が 2 種の薬（安価で効くコントロール vs 高価で効果が高いかもしれない新薬）から選ぶ状況で、観察データからの効果推定を図示。新薬群はサンプルが少なく不均衡になる。

### Figure 2: MetaITE 全体アーキテクチャ

![The overview of our model MetaITE.](https://arxiv.org/html/2208.06748/assets/x2.png)

> Figure 2 (caption 抜粋): ランダムに選んだソース処置群 $S^j$ とターゲット処置群 $T$ からデータ $\{D_S^j, D_T\}$ を収集。inner loop で support set 上のパラメータをローカル更新し、outer loop で 3 つの損失によりグローバル更新する。

### Table 2（主要結果）: MetaITE と SOTA 手法の性能比較（Twins / News）

数値は「低いほど良い」。太字が最良（本文表より抜粋、代表値）。

| Dataset | Metric | MetaITE | 最良ベースライン（手法） |
|---|---|---|---|
| Twins_bin | $\sqrt{\text{PEHE}}$ | **0.3093** | 0.3097 (OLS/LR1) |
| Twins_bin | $\epsilon_{ATE}$ | **0.0062** | 0.0069 (SITE) |
| News_2 | $\epsilon_{ATE}$ | **9.2552** | 12.1902 (BNN) |
| Twins_4 | RMSE | **0.1921** | 0.1925 (TARNet) |
| News_4 | RMSE | **8.7303** | 8.75516 (K-NN) |

> Table 2 (caption): "Performance Evaluation of MetaITE with other state-of-the-art methods on Twins and News datasets. Bold indicates the method with the best performance. The lower is the better."
> 全ベースライン数値の完全な表は本文参照（本レポートでは代表値のみ）。上記以外の各手法別セル値は本レポートには**記載なし**（原典を参照）。

### 手法比較表（本レポートによる整理）

| 手法 | 処置数 | 不均衡対応 | 分布整合 | メタ学習 |
|---|---|---|---|---|
| OLS/LR1, OLS/LR2 | 二値/多値 | なし | なし | なし |
| BNN | 二値 | なし | なし | なし |
| TARNet | 二値 | なし | なし | なし |
| CFR-Wass / CFR-MMD | 二値 | なし | あり (IPM) | なし |
| SITE | 二値 | なし | あり | なし |
| GANITE | 二値 | なし | GAN 補完 | なし |
| ABCEI / CBRE | 二値 | 限定的 | あり | なし |
| **MetaITE (提案)** | **複数 (k≥2)** | **あり** | **あり (MMD)** | **あり (MAML 型)** |

### Figure 3 / Figure 4: 不均衡度に対するロバストネス

![Robustness Study of imbalanced treatments on Twins_bin.](https://arxiv.org/html/2208.06748/assets/x3.png)

![Robustness Study of imbalanced treatments on News_4.](https://arxiv.org/html/2208.06748/assets/x4.png)

> Figure 3/4 (caption 抜粋): control 群と treated 群のサンプル比率を変えて不均衡度を制御したときの性能変化を検証。MetaITE は不均衡が強まっても安定。

---

## Experiments & Evaluation

### Setup（設定）

- **データセット**:
  - **Twins**: 双子の 1 年後死亡（binary outcome, mortality）。二値設定で 11,400 ペア。4 処置設定は「出生体重 × 性別」の組合せで定義。Sigmoid 関数で選択バイアスを注入。
  - **News**: NY Times コーパスを LDA（50 トピック）で処理した 5,000 サンプル。アウトカムは読者の意見（回帰）。処置は閲覧デバイス（desktop, smartphone, newspaper, tablet）。softmax（$\kappa=10$）で処置割当バイアスを注入。
- **ベースライン（11 種）**: OLS/LR1, OLS/LR2, k-NN, BNN, CFR-Wass, CFR-MMD, TARNet, GANITE, SITE, ABCEI, CBRE。
- **評価指標**:
  - 二値: $\sqrt{\text{PEHE}}$（Precision in Estimation of Heterogeneous Effect）と ATE の平均絶対誤差 $\epsilon_{ATE}$。
  - 多値: $\text{RMSE} = \sqrt{\frac{1}{n|T|}\sum_i \sum_t (y^{t=t_i}(x_i) - \hat{y}^{t=t_i}(x_i))^2}$。

### Main Results（主要結果、具体値）

- **Twins_bin**: $\sqrt{\text{PEHE}} = 0.3093$（最良ベースライン OLS/LR1 の 0.3097 を上回る）、$\epsilon_{ATE} = 0.0062$（SITE の 0.0069 を上回る）。
- **News_2**: $\epsilon_{ATE} = 9.2552$（BNN の 12.1902 を大きく下回り改善）。
- **Twins_4（4 処置）**: RMSE $= 0.1921$（TARNet の 0.1925 を上回る）。
- **News_4（4 処置）**: RMSE $= 8.7303$（k-NN の 8.75516 を上回る）。
- 総括: MetaITE は 4 設定すべてで最良または最良に匹敵し、SOTA を match/outperform。

### Ablation / 感度分析

- **最適損失重み** $\{\mu, \epsilon, \gamma\}$: News_2 で $\{1.0, 0.9, 1.0\}$、News_4 で $\{1.0, 0.0, 1.0\}$。
- **discrepancy 損失重み** $\gamma$ は一貫して大きく、**分布整合が重要**であることを示す。
- **query set 損失** $\mu$ が最重要コンポーネント。
- **source 教師あり損失** $\epsilon$ は News_2 では有効だが News_4 では重要度が低い。
- **ロバストネス**（Figure 3/4）: サンプル比率を 100% → 5% と不均衡を強めても MetaITE は安定。比較手法 CBRE は不均衡が 5:1 → 10:1 に強まると約 **39%** 性能劣化。
- **パラメータ感度**（Figure 5, 6 サブプロット）: support サンプルサイズ、層数、埋め込み次元、学習率、メタバッチサイズ、勾配更新回数を検証（付録）。

---

## 本テーマへの適用可能性

想定シナリオ: データサイエンティストが**頻度の低いマーケティングキャンペーン**（クーポン・メール等）を、毎回**異なるターゲットユーザー層・異なる施策（treatment）**で実施している。個々のキャンペーンはサンプルが薄く、施策の種類も回ごとにバラバラで、uplift モデリングや off-policy 評価に必要なデータ密度が不足しがち。本論文の枠組みは、この課題に直接対応する複数の武器を提供する。

- **「施策＝処置群＝メタ学習タスク」への写像**: 本論文は各処置群をメタ学習のドメイン（タスク）として扱う。マーケティング文脈では **1 キャンペーン/1 施策タイプを 1 タスク**とみなせる。過去の潤沢なキャンペーン群を**ソースドメイン**、今回の少数サンプルな新規キャンペーンを**ターゲットドメイン**に据えることで、新施策に対して過去施策から知識転移して素早く ITE/uplift を推定できる。これは「似たキャンペーン/ユーザーをグループ化して密なデータを合成し、実効的な実験間隔を短縮したい」という要望とほぼ同型の定式化である。

- **不均衡・疎な処置への強靭性**: 本手法の核心は「一部の処置群だけサンプルが極端に少ない」不均衡設定への対応。散発的なキャンペーンでは新施策・新セグメントの露出数が小さいのが常であり、MetaITE は少数サンプルでも inner-loop の勾配適応で過学習を抑えつつ推定できる。Twins_bin で 5% まで薄めても性能が安定した点（対 CBRE の約 39% 劣化）は、疎な施策に対する実務的な安心材料。

- **borrow strength（統計的強度の借用）**: 教師あり損失 $L_{Sup}$ をソース処置群に課しつつ、query 損失 $L_{Que}$ で適応性能を最適化する二段構造は、豊富な過去キャンペーンから今回の薄いキャンペーンへ**統計的強度を借りる**メカニズムそのもの。単一キャンペーン単独では不可能な信頼できる uplift 推定を、束ねることで可能にする。

- **MMD による分布整合＝キャンペーン/セグメント間ギャップの吸収**: 各キャンペーンはターゲットユーザー分布や配信文脈が異なり、素朴に統合すると covariate shift でバイアスが生じる。$L_{disc}$（潜在空間の MMD 最小化）はこの**キャンペーン間の共変量分布ズレを潜在表現レベルで吸収**し、異質なキャンペーンを安全にプールして「実効データ密度」を高める役割を果たす。ablation で $\gamma$ が一貫して大きかったことは、異質データ統合では分布整合が効くという実務示唆になる。

- **多施策（multi-treatment）対応**: 二値処置に留まらず $k \ge 2$ の複数処置を扱えるため、「クーポン額違い」「メール文面違い」「配信デバイス違い」など**多腕の施策を同一枠組みで比較**でき、off-policy 評価やポリシー最適化に接続しやすい。News データでデバイス 4 種を処置とした構成は、マルチチャネル/マルチクリエイティブのマーケ設定に読み替えやすい。

- **実効的な実験間隔の短縮**: 新規キャンペーンごとに一からデータを貯める代わりに、過去キャンペーン群で事前学習したメタ学習器を「少数サンプルで即適応」させることで、必要サンプル数と観測期間を圧縮できる。これは要望の「実験間隔を短くしたい」に直接効く。

- **実装上の留意点**: 本論文の実験は Twins/News のセミ合成データであり、マーケの実データでは (a) キャンペーン間の共変量スキーマ統一、(b) タスク（キャンペーン）粒度の設計（施策単位か配信バッチ単位か）、(c) 損失重み $\{\mu, \epsilon, \gamma\}$ のドメイン別チューニング、(d) ターゲット群のサンプル最小量の検証、が必要。similar campaign のグルーピング自体は本論文の外（前処理）で、クラスタリングや埋め込みで事前に「ソース群」を選ぶ設計が現実的。

## Notes

- 本文の Table 2 は全 11 ベースライン × 全設定の完全な数値表を含むが、本レポートには **MetaITE と各設定の最良ベースラインの代表値のみ**転記した。個別セル値の一部は本レポートには**記載なし**（原典参照）。
- HTML 版（`arxiv.org/html/2208.06748`）は直接取得時に 404 だったが、ar5iv ミラー経由で本文・数式・図表キャプション・画像 src を確認。図の埋め込み URL（`https://arxiv.org/html/2208.06748/assets/x1.png` 等）は ar5iv 上で実在を確認した src パスに基づく。
- 数式は ar5iv 抽出に基づく再構成であり、記号（$\psi, \theta, \mu, \epsilon, \gamma$ 等）は原典表記に合わせたが、細部の添字は原典 PDF で最終確認を推奨。
- 公開コードリポジトリの明示的リンクは検索で**確認できず（記載なし）**。
- 掲載 venue（査読会議/ジャーナル）は arXiv comments に**記載なし**。関連系譜として MetaCI（Sharma & Gupta）等のメタ学習 × 因果推論研究がある。
