# Off-Policy Evaluation for Large Action Spaces via Policy Convolution

- **Link**: https://arxiv.org/abs/2310.15433
- **Authors**: Noveen Sachdeva, Lequn Wang, Dawen Liang, Nathan Kallus, Julian McAuley
- **Year**: 2023（arXiv 投稿）／ 2024（会議発表）
- **Venue**: The Web Conference 2024（WWW '24, ACM）※ DOI: 10.1145/3589334.3645501
- **Type**: Method（大規模行動空間向け OPE 推定量族の提案）

---

## Abstract (English)

> Developing accurate off-policy estimators is crucial for both evaluating and optimizing for new policies. The main challenge in off-policy estimation is the distribution shift between the logging policy that generates data and the target policy that we aim to evaluate. Typically, techniques for correcting distribution shift involve some form of importance sampling. This approach results in unbiased value estimation but often comes with the trade-off of high variance, even in the simpler case of one-step contextual bandits. Furthermore, importance sampling relies on the common support assumption, which becomes impractical when the action space is large. To address these challenges, we introduce the Policy Convolution (PC) family of estimators. These methods leverage latent structure within actions -- made available through action embeddings -- to strategically convolve the logging and target policies. This convolution introduces a unique bias-variance trade-off, which can be controlled by adjusting the amount of convolution. Our experiments on synthetic and benchmark datasets demonstrate remarkable mean squared error (MSE) improvements when using PC, especially when either the action space or policy mismatch becomes large, with gains of up to 5 - 6 orders of magnitude over existing estimators.

---

## Abstract (日本語訳)

新方策の評価・最適化のために正確なオフポリシー推定量を作ることは重要である。オフポリシー推定の主課題は、データを生成した **ログ方策** と評価したい **目標方策** の間の分布シフトである。分布シフト補正には通常、何らかの重要度サンプリングが用いられる。これは不偏な価値推定を与える一方、単純な一段階の文脈付きバンディットでさえ高分散という代償を伴う。さらに重要度サンプリングは **common support 仮定** に依存し、行動空間が大きいと非現実的になる。これらに対処するため著者らは **Policy Convolution (PC)** という推定量族を導入する。PC は **action embeddings（行動埋め込み）** で得られる行動内の潜在構造を活用し、ログ方策と目標方策を戦略的に **畳み込む (convolve)**。この畳み込みは独自のバイアス・分散トレードオフを生み、畳み込み量を調整して制御できる。合成・ベンチマークデータでの実験は、特に行動空間や方策ミスマッチが大きいときに顕著な MSE 改善を示し、既存推定量に対し **最大 5〜6 桁 (orders of magnitude)** の改善を得た。

---

## Overview（概要）

大規模行動空間で IPS 系は「common support 仮定」が崩れ、重要度重みの分散が爆発する。PC は行動を **埋め込み空間** に写し、ログ方策・目標方策を埋め込み空間上で **畳み込む（周辺化・平滑化する）** ことで、行動そのものではなく「埋め込み近傍」に対して重要度補正を行う。畳み込み量（バンド幅に相当）を増やすほど分散が下がりバイアスが上がる、というトレードオフをノブとして持つ。PC は既存の埋め込み系推定量（MIPS, OffCEM, similarity estimator, GroupIPS）を **特殊ケースとして含む一般族** である。

---

## Problem（解こうとしている課題）

- ログ方策と目標方策の **分布シフト** を IS で補正すると、単純な一段階バンディットでも高分散。
- IS は **common support 仮定** に依存し、行動空間が大きいとサポートが薄くなり破綻。
- 行動数が多い／方策ミスマッチが大きいほど MSE が悪化する。
- 目標: 行動埋め込みの潜在構造を使い、分布シフト補正の分散を制御可能にすること。

---

## Proposed Method（提案手法）

### 中核アイデア

行動 $a$ の代わりに **行動埋め込み** $e(a)$ を使い、ログ方策 $\pi_0$ と目標方策 $\pi$ を埋め込み空間で **畳み込む**。畳み込みカーネル（バンド幅）が「どれだけ近傍の行動をまとめて周辺化するか」を決め、これがバイアス・分散のノブになる。重要度補正を「厳密な行動一致」ではなく「埋め込み近傍での一致」に緩めることで、common support 仮定の困難を回避しつつ分散を抑える。

### 手順（番号付き）

1. **行動埋め込みの取得**: 各行動に潜在構造を表す埋め込み $e(a)$ を与える（例: 商品・アイテムの特徴ベクトル）。
2. **方策の畳み込み**: ログ方策 $\pi_0$ と目標方策 $\pi$ を、埋め込み空間上の畳み込みカーネルで平滑化した「畳み込み済み方策」に変換。
3. **畳み込み量の選択**: 畳み込み量（カーネル幅）を調整してバイアス・分散をトレードオフ。
4. **PC 推定量の計算**: 畳み込み済み方策の比を重要度重みとして価値を推定。
5. **一般化**: 畳み込み量やカーネルの取り方に応じて MIPS / OffCEM / GroupIPS 等が復元される。

### Key Formulas

> 注: 論文 HTML が取得できず（arXiv HTML は 404、ACM/著者 PDF はバイナリのため本文抽出不可）、以下は Abstract・会議情報・関連調査に基づく概念記述。厳密な数式は原論文（WWW'24, arXiv:2310.15433）を参照のこと（記載なし）。

一般的な IPS 推定量:

$$\hat V_{IPS}(\pi) = \frac{1}{n}\sum_{i=1}^{n}\frac{\pi(a_i|x_i)}{\pi_0(a_i|x_i)}\, r_i$$

Policy Convolution の考え方（概念式）: 埋め込み $e(\cdot)$ 上の畳み込み演算子 $\ast K$（カーネル $K$）を用いて方策を平滑化し、その比を重み化する。

$$w_{PC}(x,a) \;\propto\; \frac{(\pi \ast K)\big(e(a)\,|\,x\big)}{(\pi_0 \ast K)\big(e(a)\,|\,x\big)}$$

- $K$ の幅（畳み込み量）→ 大: 分散↓・バイアス↑ ／ 小: 分散↑・バイアス↓。
- 畳み込み量 →0 で通常の IPS に、特定設定で MIPS / OffCEM / GroupIPS に一致（PC はこれらの厳密な一般化）。

---

## Algorithm（擬似コード）

```
Algorithm: Policy Convolution (PC) — 概念擬似コード
入力: ログデータ D={(x_i,a_i,r_i)}, ログ方策 π0, 目標方策 π,
      行動埋め込み e(·), 畳み込みカーネル K（幅 h）
出力: 方策価値推定 V̂_PC(π)

1. 各行動に埋め込み e(a) を割当
2. 埋め込み空間で π, π0 をカーネル K(幅 h) で畳み込み:
     π̃  = π  ∗ K,   π̃0 = π0 ∗ K
3. 畳み込み重み  w_i = π̃(e(a_i)|x_i) / π̃0(e(a_i)|x_i)
4. V̂_PC(π) = (1/n) Σ_i w_i r_i
5. h を調整して MSE 最小化（バイアス・分散トレードオフ）
```

※ 具体的な畳み込み演算・重み正規化・DR 化の詳細は原論文参照（本抽出では確認できず）。

---

## Architecture / Process Flow

```
   行動 a ──▶ 行動埋め込み e(a)   （潜在構造の付与）
                    │
         ┌──────────┴───────────┐
         ▼                      ▼
   ログ方策 π0            目標方策 π
         │                      │
   埋め込み空間で畳み込み ∗K（幅 h）
         │                      │
     π̃0 = π0∗K            π̃ = π∗K
         └──────────┬───────────┘
                    ▼
      畳み込み重み w = π̃ / π̃0
                    ▼
      V̂_PC = (1/n) Σ w_i r_i
                    ▲
      h（畳み込み量）でバイアス・分散を制御
      h→0: IPS,  特定設定: MIPS/OffCEM/GroupIPS
```

---

## Figures & Tables

> 注: 論文 HTML が取得できず、図の埋め込み URL は確認できなかった（記載なし）。以下は Abstract・関連調査から再構成した表。実際の図表番号・数値は原論文（arXiv:2310.15433 / WWW'24）を参照。

### Table A: 手法比較（PC が一般化する既存推定量）

| 推定量 | 位置づけ | PC との関係 |
|--------|----------|-------------|
| IPS | 素朴な重要度サンプリング | 畳み込み量→0 で PC が一致 |
| MIPS | 行動埋め込みの周辺化 IS | 埋め込みと行動が全単射なら IPS に退化。PC の特殊ケース |
| OffCEM | Conjunct Effect Modeling | PC 族の一インスタンス |
| GroupIPS | 行動グループ化 IS | PC 族の一インスタンス |
| similarity estimator | 行動類似度ベース | PC 族の一インスタンス |
| **Policy Convolution (PC)** | 畳み込みで平滑化した一般族 | 上記すべてを含む厳密な一般化 |

### Table B: バイアス・分散トレードオフのノブ

| 畳み込み量（カーネル幅 $h$） | 分散 | バイアス | 対応する既存法 |
|------------------------------|------|----------|----------------|
| $h \to 0$（畳み込み無し） | 高 | 0（不偏） | IPS |
| 中程度 | 中 | 中 | MIPS 等 |
| 大 | 低 | 高 | 強く平滑化 |

### Table C: 主結果（Abstract 記載の定量）

| 条件 | 改善 |
|------|------|
| 行動空間または方策ミスマッチが大きい | 既存推定量に対し MSE を **最大 5〜6 桁 (orders of magnitude)** 改善 |
| データ | 合成データおよびベンチマークデータ |

※ ベースライン別・データセット別の個別 MSE 数値は本抽出では確認できず（記載なし）。

---

## Experiments & Evaluation

### Setup

- **データ**: 合成データおよびベンチマークデータ（Abstract 記載）。具体的データセット名・行動数・サンプル数は本抽出では確認できず（記載なし）。
- **ベースライン**: IPS 系、MIPS、OffCEM 等の埋め込み系推定量（PC はこれらの一般化として比較）。
- **評価指標**: MSE $\mathbb{E}[(\hat V - V(\pi))^2]$。

### Main Results

- 行動空間が大きい、あるいはログ方策と目標方策のミスマッチが大きい設定で PC が特に有効。
- 既存推定量に対し **最大 5〜6 桁の MSE 改善**（Abstract）。
- 畳み込み量を調整することで MSE を最小化できる。

### Ablation

- 畳み込み量（カーネル幅）を変えたバイアス・分散トレードオフの解析が中心（具体数値は記載なし）。

---

## 本テーマへの適用可能性

本テーマ（低頻度のクーポン/メール配信を過去ログからオフライン評価したいデータサイエンティスト）にとって、PC は **「配信オプションが大量にあり、かつ過去の配信方策と新方策が大きく異なる」** 場合の OPE で威力を発揮する。

- **A/B なしの新方策評価**: 過去ログのログ方策確率と、評価したい新ターゲティング方策の確率があれば、A/B を回さず MSE の小さい価値推定が得られる。特に「今までほとんど送らなかった券種を大きく増やす」ような **方策ミスマッチが大きい** 施策変更でこそ PC の 5〜6 桁改善が効く（素朴 IPS はこの状況で分散爆発する）。
- **券種埋め込みの活用**: クーポン券種やメールクリエイティブを **埋め込み（割引率・対象カテゴリ・チャネル等の特徴ベクトル）** で表せば、common support が薄い（=過去にほぼ送っていない券種）でも近傍券種の情報を畳み込みで借りて評価できる。低頻度施策で行動あたりサンプルが少ない実務に適合する。
- **キャンペーン横断のプーリング**: 埋め込み空間を全キャンペーンで共有すれば、キャンペーンごとにサンプルが少なくても、埋め込み近傍の配信ログを畳み込みでまとめて重要度補正に使え、実質的にキャンペーン横断のプーリングになる。
- **運用ノブ**: 畳み込み量を「どの程度券種をまとめて評価するか」の運用パラメータとして扱える。低頻度でノイズが大きいキャンペーンほど畳み込みを強め（分散↓）、データが十分なら弱める（バイアス↓）といった調整が可能。
- **注意点**: PC は OPE（評価）手法であり、方策学習は別途必要。埋め込みの質が結果を左右する。本レポートの数式・実験数値は原論文 HTML 未取得のため概念中心であり、実装前に原論文（WWW'24）の厳密な推定量定義を確認すること。

---

## Notes

- PC は MIPS / OffCEM / GroupIPS / similarity estimator を特殊ケースとして含む **一般化された推定量族**。
- 畳み込み量というノブでバイアス・分散を明示的に制御できるのが実務上の利点。
- 本レポートは arXiv HTML が 404、著者/ACM PDF がバイナリ抽出不可のため、Abstract・WWW'24 会議情報・関連調査で再構成した。厳密な推定量定義・実験データセット名・個別数値は原論文を参照のこと（本文で確認できなかった箇所は「記載なし」と明記）。
