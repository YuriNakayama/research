# 01. The Surrogate Index: Combining Short-Term Proxies to Estimate Long-Term Treatment Effects More Rapidly and Precisely

[← index](index.md)

## 書誌情報

| 項目 | 内容 |
|------|------|
| 著者 | Susan Athey, Raj Chetty, Guido W. Imbens, Hyunseung Kang |
| 年 | 2019（NBER Working Paper 26463、2019 年 11 月） |
| 会場 | NBER Working Paper 26463 / The Review of Economic Studies（Oxford Academic に掲載を確認。巻・号・掲載年月は未確認） |
| リンク | [NBER w26463](https://www.nber.org/papers/w26463) / [ReStud](https://academic.oup.com/restud/advance-article/doi/10.1093/restud/rdaf087/8268796) |

**確認状況**: 著者・タイトル・abstract は NBER ページから逐語確認済み。ReStud 掲載はタイトルと誌名のみ確認でき、巻号・DOI・掲載日は **未確認**。Opportunity Insights の PDF はネットワーク制約により取得できず、Assumption の番号付け・定理番号・実験結果表の詳細は **未確認**（以下の定式化は abstract の記述と本系譜の標準的表記に基づく再構成であり、論文中の式番号とは対応しない）。

## 一言で言うと

質的に異なる複数の短期成果を「長期成果の予測値」という 1 本の指標 —— surrogate index —— に合成すれば、Prentice surrogacy assumption の下で **surrogate index に対する平均処置効果が長期成果に対する処置効果と一致する**。9 年待つ代わりに最初の 6 四半期で判断でき、しかも標準誤差が 35% 減る。

## 問題設定

介入（職業訓練プログラム、教育プログラム）の効果を測りたいが、関心のある成果（生涯所得、労働市場成果）の観測には長い遅延が伴う。生物医学領域ではこの問題に対し短期成果を「surrogate」として使う伝統がある（癌研究における死亡率の surrogate としての腫瘍サイズ）。本論文はこの文献の上に立ち、**複数の、質的に異なりうる短期成果**（短期所得と雇用指標など）を体系的に 1 つの "surrogate index" へ合成する。

本課題との対応は以下の通り。

| 論文の設定 | 本課題での対応 |
|-----------|---------------|
| 長期成果 $Y$: 生涯所得・9 年後の雇用率 | LTV・継続購買 |
| 短期成果 $S$: 最初の 6 四半期の所得・雇用指標 | 開封・クリック・初回購入・初月利用頻度 |
| 処置 $W$: 職業訓練プログラムへの割当 | クーポン付与 |
| 待ち時間 9 年 → 6 四半期 | 数ヶ月 → 数週間 |

## 手法

### 記法

- $W_i \in \{0,1\}$: 処置
- $S_i \in \mathbb{R}^k$: 短期成果ベクトル（複数の proxy）
- $Y_i$: 長期成果
- $X_i$: 共変量
- $G_i \in \{E, O\}$: サンプルの出自（$E$ = 実験サンプル、$O$ = 観察サンプル）

データ構造の要点は **どの単一サンプルにも $(W, S, Y)$ が揃っていない** ことにある。実験サンプルには $(W_i, S_i, X_i)$ が観測されるが $Y_i$ は未観測（まだ時間が経っていない）。観察サンプルには $(S_i, Y_i, X_i)$ が観測されるが処置は割り当てられていない（あるいは処置情報が使えない）。

### surrogate index の定義

surrogate index とは **短期成果を条件とした長期成果の条件付き期待値** である。

$$
h(s, x) \;=\; \mathbb{E}\!\left[\,Y_i \mid S_i = s,\; X_i = x,\; G_i = O \,\right]
$$

これを観察サンプルで学習し、実験サンプルの各個体に対して予測値 $h(S_i, X_i)$ を当てはめる。この予測値が surrogate index である。個々の proxy ではなく、**長期成果の予測値というスカラーに合成する**点が本手法の核心にあたる。

### surrogacy assumption の明示的定式化

**Assumption（Prentice surrogacy / statistical surrogacy）**: 長期成果は、surrogate と共変量を条件として、処置と独立である。

$$
Y_i \;\perp\!\!\!\perp\; W_i \;\bigm|\; S_i,\; X_i
$$

平たく言えば **処置が長期成果に及ぼす影響は、すべて短期成果 $S$ を経由する** という主張である。$W \to Y$ の直接経路（$S$ を通らない経路）が存在しないことを要求する。

**Assumption（comparability / surrogacy の実験・観察間の移送）**: 観察サンプルで学習した $S \mapsto Y$ の関係が実験サンプルでも成り立つ。

$$
\mathbb{E}\!\left[\,Y_i \mid S_i = s, X_i = x, G_i = O \,\right] \;=\; \mathbb{E}\!\left[\,Y_i \mid S_i = s, X_i = x, G_i = E \,\right]
$$

この 2 つが成り立つとき、長期成果への平均処置効果は surrogate index への平均処置効果として識別される。

$$
\tau \;=\; \mathbb{E}[\,Y_i(1) - Y_i(0)\,] \;=\; \mathbb{E}\!\left[\, h(S_i, X_i) \mid W_i = 1 \,\right] \;-\; \mathbb{E}\!\left[\, h(S_i, X_i) \mid W_i = 0 \,\right]
$$

すなわち **観察データで $h$ を学習し、実験データで $h(S,X)$ の群間差を取る** という分業が成立する。この構造が本課題にとって決定的に重要である（→ [index の「低頻度性のパラドックス と 突破口」](index.md#低頻度性のパラドックス-と-突破口)）。

### abstract で言及されている 3 つの追加貢献

1. **surrogacy assumption を structural / causal assumption の集合に関係づける**: 統計的な条件付き独立という形の仮定を、構造的・因果的な仮定の言葉に翻訳する。
2. **各仮定の違反から生じるバイアスの特徴づけ**: "we then characterize the bias that arises from violations of each of the key assumptions"。仮定が破れたときに何がどう壊れるかを理論的に記述する。
3. **追加の観測成果を用いた仮定の検証方法**: "we provide simple methods to validate these assumptions using additional observed outcomes"。

**未確認**: 2 のバイアス公式の具体形、3 の検証手続きの具体的なアルゴリズムは、PDF 本文を取得できなかったため確認できていない。本課題の焦点（surrogacy assumption はマーケティングで成り立つか）に最も直結する部分であるため、PDF を別経路で入手して補完する必要がある。

## 実験・結果

カリフォルニアの multi-site 職業訓練実験への適用。

| 項目 | 内容 |
|------|------|
| 対象 | カリフォルニアの multi-site job training experiment |
| 長期成果 | 平均雇用率（mean employment rates） |
| 直接観測に要する期間 | 9 年（full nine years） |
| surrogate として用いた短期成果 | 最初の 6 四半期（the first six quarters）の雇用率 |
| 主要な結果 | 9 年待たずに、最初の 6 四半期の成果を surrogate として長期効果を推定可能 |
| 標準誤差 | **35% の減少**（a 35% reduction in standard errors） |

**未確認**: 実験のサンプルサイズ、拠点数、推定された効果量の実数値、surrogate index 推定値と 9 年後の直接測定値の乖離幅、仮定検証の結果は、いずれも abstract に記載がなく **未確認**。

なお、この 35% という標準誤差の減少は「待ち時間が短縮される」ことの副産物ではなく、**待ち時間を短縮しながら同時に精度も上がる**ことを意味する点が重要である。長期成果は測定にノイズが乗りやすく、複数の短期指標を合成した予測値の方が分散が小さくなり得る。

## 本課題への適用可能性

### 効く点

**1. 「個々の proxy が surrogacy を満たさなくても、合成すれば満たし得る」という設計思想**

これが本論文の最も実務的な貢献である。開封率だけ、クリック率だけを見て「これは LTV の代理になっていない」と切り捨てるのではなく、**開封・クリック・初回購入・初月利用頻度をまとめて $Y$ の予測に使う**。abstract の "combining multiple, possibly qualitatively distinct, short-term outcomes" という表現は、質的に異なる指標を混ぜてよいことを明示している。マーケティングの proxy 群はまさに質的に異なる（行動の種類が違う）ため、この設定に合致する。

**2. データ構造が本課題と一致している**

$h$ の学習に観察データを使い、効果推定に実験データを使うという分業は、本課題のデータ状況（過去顧客の LTV 実績は豊富、実験は少ない）に構造的に適合する。**この点が C5 全体の突破口の理論的根拠**であり、本論文がそれを最初に定式化した。

**3. 待ち時間短縮と精度向上が同時に得られる**

低頻度施策ではサンプルサイズも限られるため、35% の標準誤差減少に相当する効果が得られれば価値が大きい。ただし後述の通りこの数値の転用は保証されない。

**4. 時間圧縮の比率が本課題と同型**

9 年 → 6 四半期（1.5 年）は約 6 分の 1 の圧縮。本課題の「数ヶ月 → 数週間」も同程度の比率であり、適用例としてのテンプレート性が高い。

### 効かない/リスク点

**1. 「観察データで $h$ を学習する」ことは実験本数の不足を完全には救わない**

本課題の中心的な問いは「少数実験しかない状況で index をどう構成・検証するか」である。本論文の分業は **構成（$h$ の学習）** については実験本数から解放してくれる。しかし **検証**、すなわち「$Y \perp W \mid S, X$ が本当に成り立つか」の確認には、**処置 $W$ が絡む** 以上、実験データが要る。observational data には $W$ の変動がない（あるいは交絡している）ため、仮定の中核部分を観察データだけで検証することは原理的にできない。

> 突破口は **半分しか救わない**。構成は救われるが、検証は救われない。

**2. comparability assumption はマーケティングで破れやすい**

観察サンプル（過去顧客の自然な購買行動）で学習した $S \mapsto Y$ の関係が、実験サンプル（クーポンを受け取った顧客）でも同じである保証はない。むしろ **クーポン経由の初回購入と自然発生の初回購入では、その後の LTV への繋がり方が違う**と考える方が自然である。同じ「初回購入」という $S$ の値でも、そこに至る経路が違えば $\mathbb{E}[Y|S]$ が違う。これは comparability の直接の違反であり、本課題では論点 1（媒介の完全性）より深刻かもしれない。

**3. 原典は「仮定が成り立つ場合」を扱う**

gather 段階の観察通り、後続研究の大半が仮定の緩和に費やされている事実は、**素朴な surrogacy assumption が現実にはほぼ成り立たない**という共通認識を示す。本論文単体を本番運用の設計図にしてはならない。特に本課題では persistent confounding（→ [04](04-persistent-confounding.md)）と surrogate paradox（→ [03](03-imperfect-surrogates-many-weak-experiments.md)）の 2 つが実在の脅威である。

**4. 職業訓練と割引施策では処置の性質が違う**

職業訓練は「スキルを付与する」処置であり、短期の雇用・所得が長期の雇用・所得に繋がる経路は素直である。対して **クーポンは顧客の価格期待を変える** という、短期指標に現れない副作用を持つ。$W \to Y$ の直接経路（「この店は値引きする」という認識 → 定価購買意欲の低下）は surrogacy assumption の直接の違反である。適用例の成功をそのまま持ち込むことはできない。

**5. 35% という数値は転用できない**

この数値はカリフォルニアの特定の実験における特定の成果指標に対する値であり、proxy と長期成果の相関構造に依存する。本課題で同等の減少が得られる保証はなく、**自前で測定するしかない**。

**6. 仮定検証手法の詳細が未確認**

本課題にとって最も重要な「追加成果を用いた仮定検証」の具体手続きが、PDF 未取得のため確認できていない。この部分の理解なしに実装に進むべきではない。

## 実装ステップ

1. **PDF 本文の入手（前提作業）**: バイアスの特徴づけと仮定検証手法の 2 節を精読する。本レポートの最大の欠落であり、他のどのステップよりも先に行う。NBER 経由、ReStud 経由、または大学リポジトリを当たる。

2. **$Y$ と $S$ の定義を確定する**: $Y$ = 施策後 6 ヶ月（または LTV 確定期間）の累積購買額。$S$ = 施策後 14 日以内に観測される指標ベクトル。`[開封フラグ, クリック回数, 初回購入フラグ, 初回購入額, 初月購買回数, 初月購買額, カテゴリ多様性]` 程度から始める。$X$ = 施策前の顧客属性（会員年数、過去購買履歴、RFM）。

3. **観察データで $h$ を学習する**: 過去顧客のうち $Y$ が確定している母集団で $S, X \mapsto Y$ を回帰。まずは線形回帰から始める（→ [02](02-netflix-200-ab-tests.md) が線形 auto-surrogate の有効性を示している）。

4. **$h$ の予測精度を測る**: cross-validation で $R^2$ / RMSE を出す。ただし**これは surrogacy の検証ではない**。予測精度が高くても surrogacy が成り立つとは限らない（$S$ と $Y$ の相関は交絡由来かもしれない）。この区別を実装者が理解していることが最重要。

5. **長期成果が確定済みの過去施策で backtest する**: 少数でも「実験があり、かつ $Y$ が既に確定している」施策があれば、$\hat\tau_{\text{surrogate}}$ と $\hat\tau_{\text{direct}}$ を比較する。**符号の一致**を最優先の評価軸とする（→ [03](03-imperfect-surrogates-many-weak-experiments.md)）。

6. **comparability を診断する**: クーポン経由の初回購入者と自然発生の初回購入者で、$S$ を揃えた上で $Y$ の分布を比較する。乖離があれば comparability が破れており、観察データで学習した $h$ をそのまま実験サンプルに当てはめてはならない。

7. **推論の誤差伝播を扱う**: $h(S,X)$ を「観測値」として通常の t 検定にかけない。$h$ の推定誤差を織り込む（cross-fitting / sample splitting）。

## 関連リソース

- [02. Evaluating the Surrogate Index Using 200 A/B Tests at Netflix](02-netflix-200-ab-tests.md) — 本論文の手法が実務でどう機能するかの唯一の大規模実証。線形 auto-surrogate という最小構成の有効性を示す。
- [03. Long-Term Causal Inference with Imperfect Surrogates](03-imperfect-surrogates-many-weak-experiments.md) — 本論文の仮定が成り立っていてさえ符号を誤り得る（surrogate paradox）ことを示す。原典の楽観に対する最強の反証。
- [04. Long-term Causal Inference Under Persistent Confounding](04-persistent-confounding.md) — 本論文の識別戦略を無効化する persistent confounding を扱う。
- [arXiv:2309.07893 — Choosing a Proxy Metric from Past Experiments](https://arxiv.org/abs/2309.07893)（Tripuraneni et al., KDD 2024） — $S$ の重み付けを過去実験から学習する。本レポートの実装ステップ 2（$S$ の定義）に対する体系的な答え。
- [CyberAgent Developers Blog — Surrogate index](https://developers.cyberagent.co.jp/blog/archives/44402/) — 日本語での用語対応（代理指標、代理性の仮定）。社内説明用。
