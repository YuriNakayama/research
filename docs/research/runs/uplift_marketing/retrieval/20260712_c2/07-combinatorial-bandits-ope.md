# Effective Off-Policy Evaluation and Learning in Contextual Combinatorial Bandits

- **Link**: https://arxiv.org/abs/2408.11202
- **Authors**: Tatsuhiro Shimizu, Koichi Tanaka, Ren Kishimoto, Haruka Kiyohara, Masahiro Nomura, Yuta Saito
- **Year**: 2024
- **Venue**: RecSys 2024（ACM Recommender Systems Conference）
- **Type**: Method（組合せバンディットの OPE/OPL 推定量提案）

---

## Abstract (English)

> We explore off-policy evaluation and learning (OPE/L) in contextual combinatorial bandits (CCB), where a policy selects a subset in the action space. For example, it might choose a set of furniture pieces (a bed and a drawer) from available items (bed, drawer, chair, etc.) for interior design sales. This setting is widespread in fields such as recommender systems and healthcare, yet OPE/L of CCB remains unexplored in the relevant literature. Typical OPE/L methods such as regression and importance sampling can be applied to the CCB problem, however, they face significant challenges due to high bias or variance, exacerbated by the exponential growth in the number of available subsets. To address these challenges, we introduce a concept of factored action space, which allows us to decompose each subset into binary indicators. This formulation allows us to distinguish between the 'main effect' derived from the main actions, and the 'residual effect', originating from the supplemental actions, facilitating more effective OPE. Specifically, our estimator, called OPCB, leverages an importance sampling-based approach to unbiasedly estimate the main effect, while employing regression-based approach to deal with the residual effect with low variance. OPCB achieves substantial variance reduction compared to conventional importance sampling methods and bias reduction relative to regression methods under certain conditions, as illustrated in our theoretical analysis. Experiments demonstrate OPCB's superior performance over typical methods in both OPE and OPL.

---

## Abstract (日本語訳)

文脈付き組合せバンディット (CCB) におけるオフポリシー評価・学習 (OPE/L) を扱う。CCB では方策が行動空間の中から**部分集合**を選ぶ（例: インテリア販売で「ベッド＋引き出し」のように利用可能な家具から一組を選ぶ）。この設定はレコメンドやヘルスケアで広く現れるが、CCB の OPE/L はほとんど研究されていない。回帰や重要度サンプリングといった典型手法は CCB に適用可能だが、選べる部分集合数が指数的に増えるため高バイアス・高分散に苦しむ。これを解決するため著者らは **factored action space（因子化行動空間）** を導入し、各部分集合を二値インジケータに分解する。これにより、主要行動から生じる **main effect（主効果）** と補助行動から生じる **residual effect（残差効果）** を区別できる。提案推定量 **OPCB** は、主効果を重要度サンプリングで不偏に推定し、残差効果を回帰で低分散に扱う。理論解析の通り、OPCB は従来 IS 手法より大幅な分散低減を、一定条件下で回帰手法よりバイアス低減を達成する。実験は OPE・OPL 双方で OPCB の優位を示す。

---

## Overview（概要）

CCB では「送るクーポンの**組合せ**」のように部分集合を選ぶため、候補部分集合は行動数 $L$ に対し $2^L$ と指数増加し、素朴な IS は重要度重みの分散が爆発、回帰(DM)は部分集合すべての報酬を正しくモデル化できずバイアスになる。OPCB は部分集合を二値インジケータの積 $\mathcal{S}=\prod_{l=1}^{L}\mathcal{M}_l$ に因子化し、「効果の大部分を担う主要行動 (main actions) $\phi(m)$」と「残りの補助行動」に分けて、前者を IS（不偏）、後者を回帰（低分散）で扱うハイブリッド推定量である。

---

## Problem（解こうとしている課題）

- CCB では選べる部分集合が $2^L$ と指数増加し、IS の重要度重み分散が爆発する。
- 回帰 (DM) は全部分集合の報酬を正確にモデル化できず、系統的バイアスが残る。
- DR も分散・バイアスのバランスが CCB では十分でない。
- CCB 向けの OPE/L 手法自体がほぼ未整備。
- 目標: 部分集合選択の効果を「主効果」と「残差効果」に分け、不偏かつ低分散に価値推定・方策学習を行うこと。

---

## Proposed Method（提案手法）

### 中核アイデア

部分集合 $m$ を主要行動集合 $\phi(m)$ に写す写像で「効果の主要部分」を切り出し、報酬を $q(x,m)=g(x,\phi(m))+h(x,m)$（主効果 + 残差効果）に分解。主効果 $g$ は $\phi(m)$ に対する **marginalized importance weight** で不偏に、残差効果 $h$ は回帰 $\hat f$ で低分散に推定する。分散は主要行動の重要度重みにしか依存せず、補助行動の重みには依存しない。

### 手順（番号付き）

1. **因子化**: 部分集合空間を $\mathcal{S}=\prod_{l=1}^{L}\{\emptyset, a_l\}$ と二値インジケータに分解。
2. **主要行動写像 $\phi$ の設定**: 効果の主要部分を担う行動集合 $\phi(m)$ を定める（推定 $\hat\phi$ のサイズは調整可能）。
3. **報酬分解**: $q(x,m)=g(x,\phi(m))+h(x,m)$。
4. **OPCB 推定**: 主効果は marginalized IS、残差は回帰モデル $\hat f$ で扱う（下記 Eq.2）。
5. **OPL 拡張**: 主要行動のみの勾配で方策最適化する OPCB-PG（Eq.8）。

### Key Formulas

因子化行動空間:

$$\mathcal{S}=\prod_{l=1}^{L}\mathcal{M}_l,\qquad \mathcal{M}_l=\{\emptyset, a_l\}$$

報酬分解（主効果 + 残差効果）:

$$q(x,m)=g(x,\phi(m))+h(x,m)$$

OPCB 推定量（Eq. 2）:

$$\hat V_{OPCB}(\pi;\mathcal{D},\phi):=\frac{1}{n}\sum_{i=1}^{n}\Big\{ w(x_i,\phi(m_i))\big(r_i-\hat f(x_i,m_i)\big) + \mathbb{E}_{\pi(m|x_i)}[\hat f(x_i,m)]\Big\}$$

ここで marginalized importance weight:

$$w(x,\phi(m))=\frac{\pi(\phi(m)|x)}{\pi_0(\phi(m)|x)}$$

分散（Theorem 3.5）— **主要行動の重要度重みにのみ依存**:

$$n\cdot\mathrm{Var}[\hat V_{OPCB}] = \mathbb{E}\big[w(x,\phi(m))^2\sigma^2(x,m)\big] + \mathbb{E}\big[\mathrm{Var}[w(x,\phi(m))\Delta_{q,\hat f}(x,m)]\big] + \mathrm{Var}\big[\mathbb{E}_\pi[q(x,m)]\big]$$

不偏性（Theorem 3.3）: 主要行動に対する common support と conditional pairwise correctness の下で $\mathbb{E}_{\mathcal{D}}[\hat V_{OPCB}]=V(\pi)$。

---

## Algorithm（擬似コード）

```
Algorithm: OPCB (OPE)
入力: ログデータ D={(x_i,m_i,r_i)}, ログ方策 π0, 評価方策 π, 主要行動写像 φ
出力: 方策価値推定 V̂_OPCB(π)

1. 回帰モデル ĥ / f̂ を学習（残差効果用, 低分散）
2. 各サンプル i について:
     a. 主要行動 φ(m_i) に対する重み w = π(φ(m_i)|x_i) / π0(φ(m_i)|x_i)
     b. IS 項: w * (r_i - f̂(x_i,m_i))
     c. DM 項: E_{π(m|x_i)}[f̂(x_i,m)]
3. V̂_OPCB = (1/n) Σ_i [IS項 + DM項]

Algorithm: OPCB-PG (OPL)  ── Eq.8
  主要行動のみの勾配推定で方策 π_θ を最適化（分散の利点を学習時も維持）
```

---

## Architecture / Process Flow

```
   部分集合 m ──▶ 因子化 S = Π_l {∅, a_l}
                        │
          ┌─────────────┴──────────────┐
          ▼                            ▼
   主要行動 φ(m)                  補助行動（残り）
   main effect g(x,φ(m))         residual effect h(x,m)
          │                            │
   marginalized IS (不偏)         回帰 f̂ (低分散)
   w=π(φ(m)|x)/π0(φ(m)|x)              │
          └─────────────┬──────────────┘
                        ▼
            V̂_OPCB = IS項 + DM項
```

---

## Figures & Tables

### Table A: 合成実験のデフォルト設定

| 項目 | 値 |
|------|----|
| ユーザ数 / サンプル数 $n$ | 2,000（合成ユーザ 200、文脈5次元） |
| 行動数 $|\mathcal{A}|$ | 8 |
| 主効果比率 $\lambda$ | 0.8 |
| 真の主要行動数 $|\phi_{true}(m)|$ | 3 |
| 報酬ノイズ $\sigma$ | 3.0 |
| 方策パラメータ | $\beta=-0.5,\ \varepsilon=0.2$ |
| 報酬関数 (Eq.9) | $q(x,m)=\lambda g(x,\phi_{true}(m))+(1-\lambda)h(x,m)$ |

### Table B: 手法比較（ベースライン）

| 手法 | タイプ | CCB での課題 |
|------|--------|--------------|
| DM (Direct Method) | 回帰 | 全部分集合のモデル化バイアス |
| IPS | 重要度サンプリング | $2^L$ による分散爆発 |
| DR (Doubly Robust) | ハイブリッド | 大規模組合せで分散不足 |
| **OPCB (ours)** | 主効果IS + 残差回帰 | 主要行動のみの重みで分散抑制 |

補助的に OPCB(true)（真の $\phi$）と OPCB(best) も比較対象。

### Figure 2: ログデータ数を変化（$n\in[500,8000]$）

OPCB(ours) が全サンプルサイズで大幅に低い MSE。$n=2000$ で概ね **約50%の MSE 低減**（改善の主因は分散低減）。
※ 画像は本文に埋め込みで個別 URL なし（記載なし）。

### Figure 3: 行動数を変化（$|\mathcal{A}|\in[4,10]$）

行動空間が増えるとベースラインの分散が指数増加。$|\mathcal{A}|=10,\ n=2000$ で IPS/DR/DM の分散は **約3〜5倍**に増大する一方、OPCB は安定。

### Figure 4: 主効果比率を変化（$\lambda\in[0.2,0.8]$）

主効果が強いほど OPCB が有利。$\lambda=0.8$ で **約40%の MSE 低減**、$\lambda=0.2$ では優位が **約15〜20%**に縮小。

### Figure 5: 推定主要行動数を変化（$|\hat\phi(m)|\in[1,5]$）

真の主要行動サイズ（$|\hat\phi|=3$）付近で最良。過大指定は分散増、過小指定はバイアス増。

### 実データ実験

「precision medicine（精密医療）」を模したデータで OPCB(ours) がベースラインを上回り、合成外でも有効性を確認。

---

## Experiments & Evaluation

### Setup

- **合成データ**: 200合成ユーザ、5次元文脈、報酬 $q(x,m)=\lambda g+(1-\lambda)h$、$r\sim N(q,\sigma^2)$、$\sigma=3.0$、真の主要行動数3。デフォルト $n=2000,\ |\mathcal{A}|=8,\ \lambda=0.8$。
- **ベースライン**: DM, IPS, DR, および OPCB(true)/OPCB(best)/OPCB(ours)。
- **評価**: OPE では MSE（分散・バイアス分解付き）、OPL では学習方策の価値。

### Main Results

- $n=2000$ で OPCB は概ね **約50% MSE 低減**（Fig.2、主因は分散低減）。
- $|\mathcal{A}|=10$ でベースライン分散が **約3〜5倍**に増える中 OPCB は安定（Fig.3）。
- $\lambda=0.8$ で **約40% MSE 低減**、$\lambda=0.2$ で **約15〜20%**（Fig.4）。

### Ablation

- 推定主要行動数 $|\hat\phi|$ は真値3付近が最良（Fig.5）。
- 実データ（precision medicine 模擬）でも優位を確認。

### 限界

- 論文は $|\mathcal{A}|\le 10$ 程度でのスケールを示し、より大きな行動空間は実務的制約と明記。

---

## 本テーマへの適用可能性

本テーマ（低頻度のクーポン/メール配信をログからオフライン評価したいデータサイエンティスト）にとって、OPCB は **「複数のクーポン/オファーを同時に配る（=部分集合）」施策**の評価に直結する。

- **クーポンのバンドル配信評価**: 「10%オフ券＋送料無料券＋新商品お試し券」のように複数オファーを1回の配信で組合せる場合、行動は部分集合であり候補は指数的。OPCB を使えば、効果の大半を担う主要オファー $\phi(m)$（例: 割引率が大きい主力券）を IS で不偏に、残りの補助券を回帰で低分散に扱い、A/B を回さず過去ログから価値を推定できる。
- **メール施策の組合せ最適化**: 1通のメールに複数訴求（クーポン・新商品・レビュー依頼）を載せる場合も、主効果（購買を主に駆動する訴求）と残差効果に分けて評価でき、素朴な IPS の分散爆発を避けられる。
- **キャンペーン横断のプーリング**: 主要行動写像 $\phi$（どのオファー種が主力か）や残差回帰モデル $\hat f$ をキャンペーン間で共有すれば、低頻度・少サンプルなキャンペーンでも情報を集約できる。$\lambda$（主効果比率）が大きい実務設定（主力券が反応を支配）ほど OPCB の優位が大きい点は、クーポン施策の実態に合致する。
- **注意点**: 現行の実証は $|\mathcal{A}|\le 10$ 規模。券種が極端に多い場合は #06 POTEC のクラスタ化や #08 Policy Convolution の埋め込みと組合せる設計が現実的。主要行動写像 $\phi$ の設計（どの券を「主力」と見なすか）が精度を左右する。

---

## Notes

- OPCB は「主効果=IS（不偏）／残差効果=回帰（低分散）」というハイブリッドで、CCB という未開拓設定に初めて実用的な OPE/L を与えた点が新規性。
- 分散が主要行動の重要度重みにのみ依存する（Theorem 3.5）ことが、補助行動をいくら増やしても分散が悪化しない鍵。
- OPL 版 OPCB-PG（Eq.8）で方策学習にも拡張可能。
- 図の個別 URL は本文抽出範囲では確認できず（記載なし）。
