# POTEC: Off-Policy Learning for Large Action Spaces via Two-Stage Policy Decomposition

- **Link**: https://arxiv.org/abs/2402.06151
- **Authors**: Yuta Saito, Jihan Yao, Thorsten Joachims
- **Year**: 2024
- **Venue**: arXiv (stat.ML / cs.LG) ※プレプリント
- **Type**: Method（オフポリシー学習アルゴリズム提案）

---

## Abstract (English)

> We study off-policy learning (OPL) of contextual bandit policies in large discrete action spaces where existing methods -- most of which rely crucially on reward-regression models or importance-weighted policy gradients -- fail due to excessive bias or variance. To overcome these issues in OPL, we propose a novel two-stage algorithm, called Policy Optimization via Two-Stage Policy Decomposition (POTEC). It leverages clustering in the action space and learns two different policies via policy- and regression-based approaches, respectively. In particular, we derive a novel low-variance gradient estimator that enables to learn a first-stage policy for cluster selection efficiently via a policy-based approach. To select a specific action within the cluster sampled by the first-stage policy, POTEC uses a second-stage policy derived from a regression-based approach within each cluster. We show that a local correctness condition, which only requires that the regression model preserves the relative expected reward differences of the actions within each cluster, ensures that our policy-gradient estimator is unbiased and the second-stage policy is optimal. We also show that POTEC provides a strict generalization of policy- and regression-based approaches and their associated assumptions. Comprehensive experiments demonstrate that POTEC provides substantial improvements in OPL effectiveness particularly in large and structured action spaces.

---

## Abstract (日本語訳)

大規模な離散行動空間における文脈付きバンディット方策のオフポリシー学習（OPL）を扱う。既存手法の多くは報酬回帰モデルか重要度重み付き方策勾配に強く依存しており、過大なバイアスまたは分散のために破綻する。この問題を克服するため、著者らは新しい二段階アルゴリズム **POTEC (Policy Optimization via Two-stage Policy Decomposition)** を提案する。POTEC は行動空間のクラスタリングを活用し、方策ベースと回帰ベースのアプローチによって2つの異なる方策をそれぞれ学習する。特に、クラスタ選択を担う第一段階方策を方策ベースで効率的に学習できる、新しい低分散な勾配推定量を導出する。第一段階方策が選んだクラスタ内で具体的な行動を選ぶために、POTEC は各クラスタ内で回帰ベースに導出された第二段階方策を用いる。著者らは、回帰モデルが各クラスタ内の行動間の「相対的な期待報酬差」を保存するだけでよいという **局所正確性条件 (local correctness condition)** が満たされれば、勾配推定量が不偏となり第二段階方策が最適になることを示す。また POTEC が方策ベース・回帰ベース双方の手法とその仮定の厳密な一般化になっていることも示す。包括的な実験により、特に大規模で構造を持つ行動空間で OPL の有効性が大幅に改善することを実証する。

---

## Overview（概要）

POTEC は「行動が非常に多いとき、オフラインのログだけからより良い方策を学習する」問題に対する手法である。従来 OPL では、(a) 重要度重み付き方策勾配 (IPS-PG) はサポートが薄くなり分散爆発、(b) 回帰ベース (Reg-based / DM) は報酬モデルの誤りがそのままバイアスになる、という二律背反があった。POTEC は行動空間を **クラスタ** に分割し、

- **第一段階（クラスタ選択）**: 方策勾配（policy-based）で学習 → 分散を抑えた新しい勾配推定量
- **第二段階（クラスタ内での行動選択）**: 回帰ベース（regression-based）で決定的に選択

という役割分担を行う。分散が問題になる重要度重みは「行動 |A| 個」ではなく「クラスタ |C| 個」に対してのみ計算されるため、行動数が増えても分散が抑えられる。一方でバイアスは、報酬モデルがクラスタ内の相対差だけを正しく捉えれば消える（局所正確性条件）ため、グローバルに正確な報酬モデルより達成しやすい。

---

## Problem（解こうとしている課題）

- 大規模離散行動空間で、IPS ベースの方策勾配は重要度重み $w(x,a)=\pi(a|x)/\pi_0(a|x)$ の分散が行動数とともに爆発する。
- 回帰ベース（DM）は報酬モデル $\hat f(x,a)$ の系統誤差がそのまま学習方策のバイアスになる。
- 両者の中間（DR-PG）でも、大規模行動空間では十分な分散低減ができない。
- フルサポート条件 $\pi_0(a|x)>0\ \forall (x,a)$ は行動が多いと非現実的。
- 目標: 大規模かつ構造のある行動空間で、低バイアスかつ低分散に OPL を行うこと。

---

## Proposed Method（提案手法）

### 中核アイデア

行動 $a$ をクラスタ $c_a$ に写す **クラスタリング関数** を与え、全体方策を「クラスタ選択（第一段階）× クラスタ内行動選択（第二段階）」に分解する。第一段階は方策勾配、第二段階は回帰で最適化することで、方策ベースの柔軟性と回帰ベースの低分散を両立させる。

### 手順（番号付き）

1. **ペアワイズ回帰** でクラスタ内の相対報酬差モデル $\hat h_\psi(x,a)$ を学習（Eq. 10）。これが第二段階方策としても、回帰モデルの一部としても使われる。
2. **残差回帰** でクラスタ単位のベースライン $\hat g_\omega(x,c)$ を学習（Eq. 11）。完全な回帰モデルは $\hat f_{\psi,\omega}(x,a)=\hat g_\omega(x,c_a)+\hat h_\psi(x,a)$。
3. **第一段階方策** $\pi_\theta^{1st}(c|x)$ を、POTEC 勾配推定量（Eq. 7）を用いた勾配上昇で学習。
4. 推論時は、$\pi_\theta^{1st}$ でクラスタ $c$ を選び、そのクラスタ内で $\hat h_\psi$ を最大化する行動を第二段階方策（Eq. 14）で決定的に選ぶ。

### Key Formulas

二段階分解（Eq. 4）:

$$\pi_{\theta,\psi}^{overall}(a|x) = \sum_{c\in\mathcal{C}} \pi_\theta^{1st}(c|x)\,\pi_\psi^{2nd}(a|x,c)$$

真の方策勾配（Eq. 6）:

$$\nabla_\theta V(\pi_{\theta,\psi}^{overall}) = \mathbb{E}_{p(x)\pi_\theta^{1st}(c|x)}\big[q^{\pi_\psi^{2nd}}(x,c)\,s_\theta(x,c)\big]$$

ここで $q^{\pi_\psi^{2nd}}(x,c):=\mathbb{E}_{\pi_\psi^{2nd}(a|x,c)}[q(x,a)]$、$s_\theta(x,c):=\nabla_\theta\log\pi_\theta^{1st}(c|x)$。

POTEC 勾配推定量（Eq. 7）:

$$\nabla_\theta \hat V_{POTEC} := \frac{1}{n}\sum_{i=1}^{n}\Big\{ w(x_i,c_{a_i})\big(r_i-\hat f(x_i,a_i)\big)s_\theta(x_i,c_{a_i}) + \mathbb{E}_{\pi_\theta^{1st}(c|x_i)}\big[\hat f^{\pi_\psi^{2nd}}(x_i,c)\,s_\theta(x_i,c)\big]\Big\}$$

ここで **クラスタ重要度重み** $w(x,c):=\pi_\theta^{1st}(c|x)/\pi_0(c|x)$（行動ではなくクラスタに対する重み）。

局所正確性条件（Condition 3.3）:

$$\Delta_q(x,a,b) = \Delta_{\hat f}(x,a,b)\quad \forall x,\ \forall a,b\ \text{s.t.}\ c_a=c_b$$

すなわち $\Delta_q(x,a,b):=q(x,a)-q(x,b)$ と $\Delta_{\hat f}(x,a,b):=\hat f(x,a)-\hat f(x,b)$ が一致すること。**クラスタ内の相対差だけ**正しければよい（絶対値は不要）。

回帰モデル分解と第二段階方策（Eq. 14）:

$$\hat f_{\psi,\omega}(x,a)=\hat g_\omega(x,c_a)+\hat h_\psi(x,a),\qquad \pi_\psi^{2nd}(a|x,c)=\begin{cases}1 & a=\arg\max_{a':c_{a'}=c}\hat h_\psi(x,a')\\ 0 & \text{otherwise}\end{cases}$$

---

## Algorithm（擬似コード）

```
Algorithm 1: POTEC
入力: ログデータ D, ログ方策 π0, クラスタリング関数 c_a
出力: 第一段階方策 π_θ^{1st}, 第二段階方策 π_ψ^{2nd}

1. ペアワイズ回帰 (Eq.10) を解いて ĥ_ψ(x,a) を得る
     D_pair = {(x,a,b,r_a,r_b) | 同一文脈 x, c_a = c_b}
     → ĥ_ψ は第二段階方策 (Eq.14) かつ回帰モデル成分
2. 残差回帰 (Eq.11) を解いて ĝ_ω(x,c) を得る
     入力残差: r - ĥ_ψ(x,a)
     完全な回帰モデル: f̂_{ψ,ω}(x,a) = ĝ_ω(x,c_a) + ĥ_ψ(x,a)
3. 第一段階方策 π_θ^{1st} を POTEC 勾配 (Eq.7) で勾配上昇学習
4. return π_θ^{1st}, π_ψ^{2nd}
```

---

## Architecture / Process Flow

```
                 ┌──────────────────────────┐
   文脈 x ───────▶│  第一段階方策 π_θ^{1st}   │  (policy-based, 方策勾配)
                 │  クラスタ c を選択        │  重要度重みは |C| 個のみ
                 └──────────┬───────────────┘
                            │ 選択クラスタ c
                            ▼
                 ┌──────────────────────────┐
                 │  第二段階方策 π_ψ^{2nd}   │  (regression-based, 決定的)
                 │  クラスタ内で ĥ_ψ 最大化  │  局所正確性で最適
                 └──────────┬───────────────┘
                            ▼
                        行動 a を実行
```

学習パイプライン: `ペアワイズ回帰 ĥ` → `残差回帰 ĝ` → `第一段階を POTEC 勾配で学習`。

---

## Figures & Tables

### Figure 1: POTEC の二段階オフポリシー学習手順（アーキテクチャ図）

第一段階（クラスタ選択・policy-based）と第二段階（クラスタ内行動選択・regression-based）の役割分担を示す。
画像パス: `extracted/5399379/figs/section3/potec.png`

### Table A: 主要な合成実験のデフォルト設定

| 項目 | 値 |
|------|----|
| 学習データ数 $n$ | 4,000 |
| 行動数 $|\mathcal{A}|$ | 2,000 |
| 真のクラスタ数 $|\mathcal{C}|$ | 30 |
| 文脈次元 | 10 |
| 報酬 | ベルヌーイ（平均 $q(x,a)$、二値） |
| シミュレーション回数 | 100 seeds |
| 評価指標 | テスト方策価値 $V(\pi)$ を $V(\pi_0)$ で正規化 |

### Table B: 手法比較（ベースライン一覧）

| 手法 | タイプ | 大規模行動空間での弱点 |
|------|--------|------------------------|
| Reg-based (DM) | 回帰ベース | 報酬モデル誤差がそのままバイアス |
| IPS-PG (Eq.1) | 方策勾配 | 重要度重みの分散爆発 |
| DR-PG (Eq.2) | ハイブリッド | 大規模行動で分散低減が不十分 |
| **POTEC** | 二段階 | クラスタ重要度重みで分散抑制、局所正確性でバイアス除去 |

※ ベースラインは真のテスト方策価値でハイパラ調整（POTEC に不利な条件）。POTEC はハイパラ固定。

### Figure 3: 合成実験の主結果（テスト方策価値の比較）

3パネル: (i) $n$ を変化、(ii) $|\mathcal{A}|\in\{500,1000,2000,5000,10000\}$、(iii) $|\mathcal{C}|\in\{5,30,100,200\}$。
POTEC は行動数が増えても安定（クラスタ空間は固定）、ベースラインは $|\mathcal{A}|$ 増で明確に劣化。
画像パス: `extracted/5399379/figs/section4/main.png`
※ 図中の正確な数値は本文に明記なし（記載なし）。

### Figure 4: アブレーション（クラスタノイズ比率）

| クラスタノイズ | POTEC の挙動 |
|----------------|--------------|
| 0% | ベースラインを大幅に上回る |
| 10% | 優位性維持 |
| 20% | 依然優位 |
| 30% | まだベースラインより良い |
| 約50% | ベースライン水準まで劣化 |

画像パス: `extracted/5399379/figs/section4/ablation.png`

### Figure 5: 報酬モデル精度への感度

$\hat q(x,a)=(g(x,c_a)+\epsilon_{c_a})+(h_{c_a}(x,a)+\epsilon_a)$ でクラスタ成分誤差 $\sigma_c$ と行動成分誤差 $\sigma_a$ を 0→0.5 に変化。POTEC はどちらの誤差にも頑健で、DR-PG / Reg-based の方が速く劣化。局所正確性（相対差保存）はグローバル精度より達成しやすいことを示す。
画像パス: `extracted/5399379/figs/section4/reward-model-noise.png`

### Figure 6: 実データ実験（EUR-Lex 4K / Wiki10-31K）

extreme multi-label 分類を supervised-to-bandit 変換。クラスタ数を 5〜500 で変化。EUR-Lex 4K はクラスタ 50〜100 付近で最良、Wiki10-31K は 50〜200 付近で最良。いずれもベースライン（IPS-PG / DR-PG / Reg-based）を上回る。
画像パス: `extracted/5399379/figs/section4/real.png`
※ 個別の数値は本文抽出範囲では明記なし（記載なし）。

---

## Experiments & Evaluation

### Setup

- **合成データ**: 文脈10次元、$q(x,a)=g(x,c_a)+h_{c_a}(x,a)$、二値報酬。デフォルト $n=4000,\ |\mathcal{A}|=2000,\ |\mathcal{C}|=30$、100 seeds。
- **実データ**: EUR-Lex 4K（約4,000行動）、Wiki10-31K（約31,000行動）。クラスタはデータから学習（ground-truth ではない）。
- **実装**: OpenBanditPipeline (OBP, https://github.com/st-tech/zr-obp) ベース。ベースラインは3層 NN。IPS-PG / DR-PG には Lopez et al. (2021) の分散低減を適用。

### Main Results

- 合成実験: 行動数 $|\mathcal{A}|$ が 500→10,000 に増えても POTEC は安定、ベースラインは劣化（Fig.3(ii)）。
- クラスタ数が少ない（構造が強い）ほど POTEC の優位が大きい（Fig.3(iii)）。
- 実データ: 中間クラスタ数（50〜200）で最良、全ベースラインを上回る（Fig.6）。
- ※ 正規化テスト方策価値の具体的数値は本文に明記なし（記載なし）。

### Ablation

- クラスタノイズ 30% でも優位維持、約50%で崩れる（Fig.4）。
- 報酬モデル誤差 $\sigma_c,\sigma_a$ に対して頑健（Fig.5）。

---

## 本テーマへの適用可能性

本テーマ（低頻度のクーポン/メール配信をログからオフライン評価・改善したいデータサイエンティスト）に対して、POTEC は「配信オプションが多い」場面で有効な方策学習フレームを与える。

- **大規模な配信バリエーションのクラスタ化**: 「どのクーポン券種・どのメールクリエイティブ・どの割引率」を送るかという行動が数百〜数千に及ぶ場合、それらを類似クーポン群（例: 割引率帯、商品カテゴリ、送付チャネル）へクラスタ化し、第一段階で「どのクーポン群を送るか」、第二段階で「群内のどの具体案を送るか」を分離学習できる。重要度重みがクラスタ数だけになるため、A/B を回さず過去ログのみでも分散が抑えられる。
- **A/B なしのオフライン方策改善**: 過去の配信ログ（送付した券種・反応・ログ方策の確率）から、新しいターゲティング方策を勾配学習で得られる。局所正確性条件は「同一クーポン群内での顧客間・案間の相対的な効果差」だけ当てればよいので、収益絶対値の予測が難しくても実務的に達成しやすい。
- **キャンペーン横断でのプーリング**: クラスタ定義（券種の意味的埋め込み等）をキャンペーン間で共有すれば、各キャンペーンが低頻度でサンプルが少なくても、クラスタ単位で情報を集約でき、$\hat h_\psi$（クラスタ内相対効果）や第一段階方策の学習をキャンペーン横断で安定化できる。
- **注意点**: POTEC は OPL（学習）手法であり、方策「評価」だけが目的なら OPE 指標（本ドメインの他レポート #07〜#10）と併用する必要がある。クラスタリング品質が結果を左右する（ノイズ30%程度までは頑健、50%で崩れる）ため、券種の意味的グルーピング設計が実務上の要となる。

---

## Notes

- POTEC は方策ベースと回帰ベースの厳密な一般化（クラスタ数 = 全行動なら方策ベース、クラスタ数 = 1 なら回帰ベースに近づく）。
- 不偏性はフルクラスタサポート（$\pi_0(c|x)>0$）＋局所正確性で保証。フル行動サポートは不要。
- コードは OBP をベースに公開想定。図の具体的数値は本文抽出範囲では確認できず、必要なら原論文の Figure を直接参照のこと。
