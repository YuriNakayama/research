# Off-Policy Evaluation for Large Action Spaces via Embeddings (MIPS)

- **Link**: https://arxiv.org/abs/2202.06317
- **Authors**: Yuta Saito, Thorsten Joachims
- **Year**: 2022
- **Venue**: ICML 2022（Outstanding Paper 候補級として著名）
- **Type**: 手法論文（Off-Policy Evaluation / 大規模行動空間）
- **Code**: https://github.com/usaito/icml2022-mips

---

## Abstract (English)

> Off-policy evaluation (OPE) in contextual bandits has seen rapid adoption in real-world systems, since it enables offline evaluation of new policies using only historic log data. Unfortunately, when the number of actions is large, existing OPE estimators -- most of which are based on inverse propensity score weighting -- degrade severely and can suffer from extreme bias and variance. This foils the use of OPE in many applications from recommender systems to language models. To overcome this issue, we propose a new OPE estimator that leverages marginalized importance weights when action embeddings provide structure in the action space. We characterize the bias, variance, and mean squared error of the proposed estimator and analyze the conditions under which the action embedding provides statistical benefits over conventional estimators. In addition to the theoretical analysis, we find that the empirical performance improvement can be substantial, enabling reliable OPE even when existing estimators collapse due to a large number of actions.

## Abstract (日本語訳)

文脈付きバンディットにおける Off-Policy Evaluation (OPE) は、過去のログデータのみを用いて新ポリシーをオフライン評価できるため、実システムで急速に普及している。しかし行動数が大きい場合、既存の OPE 推定量（その多くは逆傾向スコア重み付け＝IPS に基づく）は深刻に劣化し、極端なバイアスと分散に苦しむ。これは推薦システムから言語モデルまで多くの応用で OPE の利用を妨げる。本論文では、**行動埋め込み (action embedding) が行動空間に構造を与える**とき、**周辺化重要度重み (marginalized importance weights)** を活用する新しい OPE 推定量 MIPS を提案する。提案推定量のバイアス・分散・平均二乗誤差 (MSE) を特徴づけ、行動埋め込みが従来推定量に対して統計的優位を与える条件を解析する。理論解析に加え、行動数が多くて既存推定量が崩壊する場面でも信頼できる OPE を可能にし、実証的な性能改善が非常に大きいことを示す。

---

## Overview

MIPS (Marginalized IPS) は、生の行動 $a$ の代わりに**行動埋め込み $e$** の周辺分布を用いて重要度重みを定義する。行動数 $|\mathcal{A}|$ が大きいと $w(x,a)=\pi(a|x)/\pi_0(a|x)$ の分散が爆発するが、埋め込み次元が小さければ $w(x,e)=p(e|x,\pi)/p(e|x,\pi_0)$ の分散は抑えられる。埋め込みが行動の報酬への因果効果を「媒介」していれば MIPS は不偏となり、かつ IPS より必ず分散が小さい（MSE 改善は分散削減がバイアス導入を上回る条件で成立）。データ駆動の埋め込み次元選択 (SLOPE) により、意図的に仮定を破って MSE をさらに下げる実務的テクニックも提示。

---

## Problem（課題リスト）

- 行動数 $|\mathcal{A}|$ が大きいと IPS/DR の重要度重み $w(x,a)$ の分散が爆発 → OPE が使い物にならない。
- ロギングポリシーが一部の行動をほぼ選ばない（common support 欠如）と IPS はバイアスも発生。
- DM（モデルベース）は分散は低いが回帰モデル誤指定でバイアスが大きい。
- 推薦・言語モデル等、行動空間が数千〜数万の応用で従来 OPE が崩壊。

---

## Proposed Method（中核アイデアと手順）

**中核アイデア**: 重要度重みを「行動 $a$ について」ではなく「行動埋め込み $e$ について」周辺化して定義する。$e$ の次元が小さいほど重みの分散が小さくなる。

### 手順

1. 各行動 $a$ に埋め込み $e$（カテゴリ・属性等の構造情報）を割り当てる。ログには $(x_i, a_i, e_i, r_i)$ が含まれるとする。
2. 周辺化重要度重み $w(x,e)=p(e|x,\pi)/p(e|x,\pi_0)$ を推定（ロギングポリシー既知なら $p(e|x,\pi)=\sum_a \pi(a|x)p(e|x,a)$ で計算）。
3. $\hat V_{\mathrm{MIPS}} = \frac1n\sum_i w(x_i,e_i) r_i$ を算出。
4. （実務）SLOPE により埋め込み次元を data-driven に選択し、バイアス増と分散減のトレードオフで MSE 最小化。

### Key Formulas

MIPS 推定量:

$$\hat{V}_{\mathrm{MIPS}}(\pi;\mathcal{D}) := \frac{1}{n}\sum_{i=1}^{n}\frac{p(e_i|x_i,\pi)}{p(e_i|x_i,\pi_0)}\,r_i = \frac{1}{n}\sum_{i=1}^{n} w(x_i,e_i)\, r_i$$

周辺化重要度重み:

$$w(x,e) := \frac{p(e|x,\pi)}{p(e|x,\pi_0)},\qquad p(e|x,\pi)=\sum_{a\in\mathcal{A}}\pi(a|x)\,p(e|x,a)$$

**Assumption 3.1 (Common Embedding Support)**: $p(e|x,\pi)>0 \Rightarrow p(e|x,\pi_0)>0$。

**Assumption 3.2 (No Direct Effect)**: $a \perp r \mid x,e$（行動の報酬への効果は完全に埋め込みが媒介）。

バイアス（Assumption 3.2 が破れた場合, Theorem 3.5）:

$$\mathrm{Bias}(\hat{V}_{\mathrm{MIPS}}) = \mathbb{E}_{p(x)p(e|x,\pi_0)}\Big[\sum_{a<b}\pi_0(a|x,e)\pi_0(b|x,e)\big(q(x,a,e)-q(x,b,e)\big)\big(w(x,b)-w(x,a)\big)\Big]$$

分散削減（Theorem 3.6）:

$$n\big(\mathbb{V}[\hat{V}_{\mathrm{IPS}}]-\mathbb{V}[\hat{V}_{\mathrm{MIPS}}]\big) = \mathbb{E}_{p(x)p(e|x,\pi_0)}\Big[\mathbb{E}_{p(r|x,e)}[r^2]\;\mathbb{V}_{\pi_0(a|x,e)}[w(x,a)]\Big] \geq 0$$

---

## Algorithm（擬似コード）

```
Input: logged data D={(x_i,a_i,e_i,r_i)}, target policy π, logging π0
Output: V̂_MIPS

1. for each i:
2.     p(e_i|x_i,π)  = Σ_a π(a|x_i) p(e_i|x_i,a)
3.     p(e_i|x_i,π0) = Σ_a π0(a|x_i) p(e_i|x_i,a)   # or empirical
4.     w(x_i,e_i)    = p(e_i|x_i,π) / p(e_i|x_i,π0)
5. V̂_MIPS = (1/n) Σ_i w(x_i,e_i) * r_i

# (optional) SLOPE embedding-dimension selection
6. for d in candidate embedding dims (coarse→fine):
7.     compute V̂_MIPS(d) and its variance estimate
8.     pick d by Lepski-type rule minimizing MSE bound
```

---

## Architecture / Process Flow

```mermaid
flowchart LR
    A["ログ: (x, a, r)"] --> B["行動埋め込み割当 e = φ(a) / p(e|x,a)"]
    B --> C["周辺化: p(e|x,π), p(e|x,π0)"]
    C --> D["周辺化重み w(x,e)=p(e|x,π)/p(e|x,π0)"]
    D --> E["MIPS: (1/n)Σ w(x,e) r"]
    E --> F["SLOPE 次元選択で MSE 最小化"]
    F --> G["V̂(π) 推定値"]
```

---

## Figures & Tables（主要な図表・数値）

### 表1: 行動数を変えた MSE 改善（MSE(IPS)/MSE(MIPS)、n=10,000 固定; ar5iv 抽出）

| 行動数 $|\mathcal{A}|$ | MSE(IPS)/MSE(MIPS) |
|----------------------:|-------------------:|
| 10    | 1.38 |
| 5,000 | 12.38（約 12 倍改善） |

行動数が増えるほど MIPS の優位が拡大（IPS は分散爆発、MIPS は埋め込み次元で抑制）。

### 表2: サンプル数を変えた MSE 改善（$|\mathcal{A}|=1{,}000$ 固定; ar5iv 抽出）

| サンプル数 $n$ | MSE(IPS)/MSE(MIPS) |
|--------------:|-------------------:|
| 800    | 9.10 |
| 25,600 | 4.87 |

サンプルが少ないほど IPS の分散問題が深刻で、MIPS の優位が大きい。

### 表3: 実験設定（Setup）

| 項目 | 合成データ | 実データ (Open Bandit Dataset) |
|------|-----------|-------------------------------|
| 文脈次元 | 10 | 実データ準拠 |
| 行動数 | 10〜5,000 | 240 items |
| サンプル数 | 800〜25,600 | 10,000〜500,000 |
| 埋め込み | 10 次元（各次元カード 10） | 4 次元（階層カテゴリ） |
| ロギング/評価 | softmax(β=−1) / ε=0.05 | uniform random / Thompson sampling |
| 報酬ノイズ | σ=2.5 | binary click |

### 表4: 手法比較

| 推定量 | 重み対象 | バイアス | 分散（大行動空間） | 主な仮定 |
|--------|---------|---------|-------------------|---------|
| DM     | −（回帰） | 高 | 低 | 回帰の正しさ |
| IPS    | 行動 $a$ | 不偏 | 非常に高 | common support（行動） |
| DR     | 行動 $a$ | 不偏 | 高 | common support（行動） |
| Switch-DR / DRos | 行動 $a$（切替/縮小） | 低 | 中 | 閾値/縮小 λ |
| **MIPS** | 埋め込み $e$ | 不偏（No Direct Effect 下） | **低** | common support（埋め込み）＋No Direct Effect |

（図の実画像 URL は ar5iv 上で埋め込み可能な直リンクとして確認できなかったため省略。図番号: Fig.2 MSE vs 行動数, Fig.3 MSE vs サンプル数, Fig.4 欠損行動, Fig.5 埋め込み次元分解, Fig.6 SLOPE 有無, Fig.7 実データ相対二乗誤差 CDF。）

---

## Experiments & Evaluation

### Setup
- 合成: 文脈 10 次元、行動 10〜5,000、$n$ 800〜25,600、埋め込み 10 次元、報酬ノイズ σ=2.5、ロギング softmax(β=−1)、評価 ε=0.05 の greedy。
- 実データ: Open Bandit Dataset（240 items、階層カテゴリ 4 次元を埋め込みとして使用）。

### Main Results
- **行動数 5,000 で MSE を約 12 倍改善**（対 IPS）。行動数が大きいほど優位拡大。
- **サンプル数 800 で MSE を約 9 倍改善**（対 IPS）。小サンプルほど優位。
- 欠損行動（deficient actions, 0〜900）が多くても MIPS(true) は頑健で、DM/IPS/DR を上回る。
- 実データで **MIPS+SLOPE が IPS を約 80%（150 ブートストラップ中）で上回る**（ar5iv 抽出値）。

### Ablation
- **埋め込み次元アブレーション**: 20 次元中 4〜8 次元を観測しない設定で MIPS の MSE が最小 → 意図的な仮定違反（No Direct Effect の緩い破り）がバイアス-分散上有利。
- SLOPE 有無比較で、小サンプルほど data-driven 次元選択が MSE を大きく改善。

---

## 本テーマへの適用可能性

本テーマ（クーポン/メール配信のオフライン方針評価、A/B なし、キャンペーン横断プーリング）に MIPS は極めて有効である。

- **大きなクーポン/商品カタログでの OPE**: マーケでは「配れるクーポン種別」「レコメンド商品」が数百〜数千に及ぶことが多く、生の行動での IPS は分散爆発する。MIPS は各クーポン/商品を**埋め込み（カテゴリ、割引率帯、対象商品ジャンル、価格帯など）**で表現し、埋め込み空間で重要度重みを定義することで、A/B テストなしに新しい配信方針の期待成果（購買率・売上）を低分散で推定できる。
- **キャンペーン横断プーリング**: 複数のクーポン/メールキャンペーンを、行動を「割引率×商品カテゴリ×チャネル」等の共通埋め込みに射影すれば、個々のキャンペーンでデータが薄くても埋め込み空間で束ねて評価できる。周辺化重みは埋め込み次元にしか依存しないため、行動が新規（過去に配ったことのないクーポン）でも埋め込みが既知なら評価可能 = **新方針・新クーポンへの外挿**に強い。
- **common support 欠如への耐性**: 過去に一度も配っていないクーポン（$\pi_0(a|x)\approx 0$）があると IPS は破綻するが、MIPS は「埋め込みレベルの common support」があれば評価可能。低頻度マーケでロギングが偏りがちな状況に適合。
- **SLOPE による実務調整**: サンプルが少ないマーケ現場ほど、埋め込み次元を粗くして分散を抑える SLOPE の効果が大きい。まず粗い埋め込み（割引率帯のみ等）で安定推定し、データが増えたら細粒度化する運用が可能。

---

## Notes

- MIPS は不偏性のために **No Direct Effect（埋め込みが行動効果を完全媒介）**を要する。埋め込みが粗すぎると同一埋め込み内の報酬差を無視しバイアスが出る。この弱点を緩和するのが後続の OffCEM（03）と MDR（05）。
- 実務では埋め込みを「観測属性」から与えるだけでなく、報酬回帰から学習することも可能（後続研究 "Learning Action Embeddings for OPE" 2305.03954）。
- 表内の一部数値は ar5iv 抽出値。厳密な桁は原論文 Figure/Table で照合すること。確認できない値は「記載なし」とした。
