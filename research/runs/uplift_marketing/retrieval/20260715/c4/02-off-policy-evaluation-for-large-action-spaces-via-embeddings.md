# 02. Off-Policy Evaluation for Large Action Spaces via Embeddings (MIPS)

[← index](index.md)

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | Off-Policy Evaluation for Large Action Spaces via Embeddings |
| 著者 | Yuta Saito, Thorsten Joachims |
| 年 | 2022 |
| 会場 | ICML 2022（arXiv コメント欄に "Accepted at ICML2022" と明記） |
| リンク | [arXiv:2202.06317](https://arxiv.org/abs/2202.06317) |

## 一言で言うと

行動そのものではなく**行動埋め込みの空間で重要度重みを周辺化する**ことで、行動数が大きく個々の行動のログが薄い状況でも OPE を可能にする推定量 MIPS。本課題にとっての価値は分散削減ではなく、**「行動を独立アームとして数えるのをやめる」定式化と、そのために埋め込みが満たすべき 2 条件**にある。

> **スコープ注記**: ユーザー指定により、本論文のバイアス・分散・MSE の理論解析章は本レポートの対象外とした。以下は周辺化の定式化と行動埋め込みへの要件に絞る。ただし「no direct effect を意図的に破る」戦略のみは、要件そのものの解釈に直結するため扱う。

## 問題設定

文脈付きバンディットの OPE は、ログ方策 $\pi_0$ が集めたログ $\mathcal{D} = \{(x_i, a_i, r_i)\}_{i=1}^{n}$ から、新方策 $\pi$ の価値をオフラインで推定する。

$$V(\pi) := \mathbb{E}_{p(x)\pi(a|x)}[q(x,a)]$$

ここで $q(x,a)$ は期待報酬。標準的な IPS は重要度重み $w(x,a) = \pi(a|x)/\pi_0(a|x)$ を使うが、**行動数が大きいと個々の行動のログが薄くなり、重みが極端な値をとって破綻する**。さらに深刻なのは、行動空間が大きいほどログ方策が目標方策と common support を持つこと自体が困難になる点である。論文はこれを次のように述べる。

> "a large action space makes it challenging for the logging policy to have common support with the target policies"

## 手法

### 周辺化重要度重み

行動埋め込み $e \in \mathcal{E} \subseteq \mathbb{R}^{d_e}$ が分布 $p(e|x,a)$ から得られるとする。MIPS の核心は、**行動 $a$ の空間ではなく埋め込み $e$ の空間で重みを取る**ことである。

埋め込みの周辺分布は

$$p(e|x,\pi) := \sum_{a\in\mathcal{A}} p(e|x,a)\,\pi(a|x)$$

と定義され、MIPS 推定量は

$$\hat{V}_{\text{MIPS}}(\pi;\mathcal{D}) := \frac{1}{n}\sum_{i=1}^{n}\frac{p(e_i|x_i,\pi)}{p(e_i|x_i,\pi_0)}\,r_i = \frac{1}{n}\sum_{i=1}^{n} w(x_i,e_i)\,r_i$$

となる。$w(x,e)$ が周辺化重要度重み（marginalized importance weight）である。

**この定式化が本課題にとって決定的な意味を持つ理由**: 分母が $\pi_0(a|x)$ ではなく $p(e|x,\pi_0)$ になっている。つまり**特定の行動のログがゼロでも、その行動の埋め込みと同じ埋め込みを持つ別の行動が観測されていれば、重みが定義できる**。行動レベルの support が破綻しても、埋め込みレベルの support は生き残りうる。

### 行動埋め込みへの要件（本レポートの主眼）

**Assumption 3.1 (Common Embedding Support)**:

> "The logging policy $\pi_0$ is said to have common embedding support for policy $\pi$ if $p(e|x,\pi) > 0 \to p(e|x,\pi_0) > 0$ for all $e\in\mathcal{E}$ and $x\in\mathcal{X}$."

すなわち、目標方策が正の確率で到達する埋め込みは、ログ方策も正の確率で到達していなければならない。重要なのは、**論文がこれを IPS の common action support (Assumption 2.1) より弱い条件だと明言している**点である（"Assumption 3.1 is weaker than common support of IPS"）。行動レベルで support がなくても埋め込みレベルで support が成立する例が Table 1 として与えられている。

**Assumption 3.2 (No Direct Effect)**:

> "Action $a$ has no direct effect on the reward $r$, i.e., $a \perp r \mid x,e$."

行動が報酬に与える因果効果は、**すべて埋め込みを経由して媒介される**ことを要求する。埋め込みに含まれていない行動の属性が報酬に効いてはならない。

この 2 条件の関係が本課題における埋め込み設計の全てを規定する。**埋め込みの次元を増やせば no direct effect は満たしやすくなるが、common embedding support は厳しくなる。次元を減らせばその逆**。

### no direct effect を意図的に破る戦略

論文は、この 2 条件が対立することを認識した上で、**no direct effect を意図的に破る**という戦略を提案している。

> "Including many embedding dimensions captures the causal effect better, leading to a smaller bias of MIPS. In contrast, using only a subset of the embedding dimensions reduces the variance more."

> "We thus propose a strategy to intentionally violate Assumption 3.2 by discarding less relevant embedding dimensions for achieving a better MSE at the cost of introducing some bias."

次元選択には SLOPE（Su et al. 2020b, Tucker & Lee 2021 の推定量選択手法）を適応させる。実験では、**次元が欠けて仮定が破れている方が性能が良い場合がある**ことが示されている（"MIPS and MIPS (true) perform better when there are some missing dimensions, even if it leads to the violated assumption"）。

つまり **no direct effect は「満たすべき理想」ではなく「どこまで破るかを選ぶ設計変数」**である、というのが実務的な読み方になる。

### support 不足への頑健性

論文は support が欠損した行動（deficient actions）を明示的に扱っている。IPS は Assumption 2.1 が破れると次のバイアスを持つ。

$$\left|\text{Bias}(\hat{V}_{\text{IPS}}(\pi))\right| = \mathbb{E}_{p(x)}\left[\sum_{a\in\mathcal{U}_0(x,\pi_0)}\pi(a|x)\,q(x,a)\right]$$

ここで $\mathcal{U}_0$ は support のない/欠損した行動の集合である。一方 MIPS については、実験（Figure 4）で

> "Note that MIPS (true) is robust and not affected by the existence of deficient actions"

と報告されている。**これは本課題の「新規行動」に直接効く観察である**（後述）。

## 実験・結果

| 項目 | 合成データ | 実データ (Open Bandit Dataset) |
|------|-----------|------------------------------|
| 文脈 | $x \sim \mathcal{N}(0, I_{10})$ | ファッション EC (ZOZOTOWN) |
| 行動数 | $\|\mathcal{A}\| = 10 \sim 5000$ | $\|\mathcal{A}\| = 240$ |
| 埋め込み | $d_e$ 次元カテゴリカル、各次元の cardinality 10 | $d_e = 4$ 次元のカテゴリ埋め込み |
| サンプル数 | $n = 800 \sim 25{,}600$ | "ALL" キャンペーンから 100,000 観測をサブサンプル |
| 報酬 | 合成 | バイナリのクリック |

**主要な結果**: 既存推定量が行動数の増大で破綻する領域でも MIPS は信頼できる OPE を可能にする。次元欠損がある場合に MIPS がより良い性能を示す場合がある（上述）。MIPS (true) は deficient actions の存在に影響されない。

※ 具体的な MSE 改善倍率等の数値はスコープ外として精読していない。

## 本課題への適用可能性

### 効く点

- **「施策を独立アームとして数えるのをやめる」という定式化の転換そのもの**が本課題の前提技術。施策ごとに対象・訴求・額が毎回異なりログが極端に薄い本課題では、施策 ID ベースの重み付けは原理的に成立しない。属性空間で周辺化するしかない。
- **Assumption 3.1 が行動 support より弱いという事実が、新規施策への希望の根拠**。「500 円 × メール × 休眠層」という施策自体は未実施でも、その埋め込み（額帯=中, チャネル=メール, 対象=休眠）に十分近い埋め込みを持つ過去施策があれば、埋め込みレベルの support は成立しうる。
- **deficient actions への頑健性が実験的に確認されている**点は、新規行動（support ゼロの極端なケース）に対する MIPS 系の適用可能性を支持する間接的な証拠になる。ただし注意点は後述。
- **no direct effect を意図的に破る発想**が実務的に極めて有用。クーポン施策の埋め込みに何を入れるべきか（額・訴求・チャネル・配信時刻・クリエイティブ…）を悩む必要はなく、**「支配的な効果を持つ少数次元に絞り、残りは捨ててバイアスを受け入れる」**のが正解になりうる、と論文が明示的に述べている。施策数が少ない本課題では、次元を絞る方向が強く推奨される。
- 日本語の著者スライドがあり導入コストが低い。

### 効かない/リスク点

- **MIPS は OPE（評価）であって新規行動を主題としない**。deficient actions への頑健性は「目標方策がその行動に確率を割り当てるが、ログ方策が割り当てていない」という状況の話であり、**「行動空間そのものが事後に拡張する」設定とは異なる**。MIPS の枠組みでは $\mathcal{A}$ は固定であり、新規行動は定義上そこに含まれない。この点を混同してはならない。本課題に真に必要なのは 01 (PONA) であり、MIPS はその前提技術という位置づけを崩すべきではない。
- **埋め込みの周辺化が「施策数が数個〜数十個」の規模で効くかは、本論文からは全く保証されない**。実験の最小行動数は $|\mathcal{A}|=10$ だが、これは合成データ上の設定であり、しかも MIPS の設計思想は $|\mathcal{A}|$ が数千規模で IPS が破綻する領域に向けられている。**行動数 10 の領域では、そもそも IPS が破綻しておらず MIPS の存在意義が薄い**。実データ実験も $|\mathcal{A}|=240$、$n=100{,}000$ である。
- より本質的な懸念として、**周辺化の利得は「複数の行動が同じ/近い埋め込みを共有する」ことから生じる**。行動数 5000 を 4 次元カテゴリ埋め込みに潰せば、1 つの埋め込み値を多数の行動が共有し、そこで統計的な集約が起きる。しかし**施策が 20 個しかなければ、埋め込みに潰しても 20 個は 20 個のまま**であり、集約による利得はほとんど生じない。極端には、施策の属性が毎回全て異なるなら埋め込みは施策 ID と 1 対 1 になり、MIPS は IPS に退化する。**「施策数が少ない ≠ MIPS が効く」であり、むしろ MIPS が効かない方向に働く**というのが正直な評価である。
- 本課題で MIPS 的発想が効くとすれば、それは「行動数を減らす」効果ではなく**「属性次元を跨いだ外挿」**の効果である。だが MIPS の周辺化はあくまで観測された埋め込み上での重み付けであり、**未観測の埋め込み領域への外挿は行わない**。外挿を担うのは 01 の LCPI の擬似逆行列による次元分解であって、MIPS の周辺化ではない。この区別が本課題では決定的に重要。
- $p(e|x,a)$ が既知または推定可能である必要がある。決定的な埋め込み（施策 → 属性が一意）なら問題ないが、その場合上記の退化リスクが最大化する。

## 実装ステップ

1. **本課題では MIPS を「使う」より「読む」**。目的は 01 (PONA) の記法・前提を理解し、埋め込みの 2 条件という設計言語を獲得すること。実装の第一候補にはしない。
2. **Assumption 3.1 / 3.2 を自社の施策データに当てて紙の上で点検する**。目標施策の埋め込みが過去ログの埋め込み分布の内側にあるか（3.1）。埋め込みに入れていない施策属性で報酬に効きそうなものは何か（3.2）。この点検自体が C2（施策特徴量設計）への最良のインプットになる。
3. **埋め込みの退化リスクを定量化する**。過去施策を属性ベクトルに落とし、埋め込み空間での重複度（同じ埋め込み値を共有する施策数の分布）を測る。**重複がほぼ無いなら MIPS 系の周辺化は本課題では無力**であり、この時点で MIPS ベースの評価パイプラインは捨て、01 の外挿ベースに一本化すべき。
4. 次元を絞る方向で設計する。SLOPE による次元選択の考え方を借り、支配的な少数次元（額帯・訴求カテゴリ程度）に限定する。
5. OBP (Open Bandit Pipeline) に MIPS 実装があるため、手元データで挙動を確認する場合はそこから。ただし OBP は EC の大規模ログ前提であり、規模感が異なることを念頭に置く。

## 関連リソース

- [arXiv:2202.06317](https://arxiv.org/abs/2202.06317) — 本論文
- [01. PONA](01-offline-contextual-bandits-in-the-presence-of-new-actions.md) — 本論文の発想を新規行動へ拡張した本命
- [04. Learning Action Embeddings](04-learning-action-embeddings-for-off-policy-evaluation.md) — 本論文が前提とする「良い埋め込みが与えられる」を緩和する系譜
- [Open Bandit Pipeline (GitHub: st-tech/zr-obp)](https://github.com/st-tech/zr-obp) — MIPS 実装を含む
- [MIPS 解説スライド（著者本人・日本語）](https://speakerdeck.com/usaito/mips-icml2022-jp)
- SLOPE — 埋め込み次元選択に転用される推定量選択手法（Su et al. 2020b / Tucker & Lee 2021。本調査では原典未確認）
