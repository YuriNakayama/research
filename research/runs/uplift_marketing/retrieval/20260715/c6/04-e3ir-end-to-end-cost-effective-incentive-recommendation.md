# 04. End-to-End Cost-Effective Incentive Recommendation under Budget Constraint with Uplift Modeling (E3IR)

[← index](index.md)

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | End-to-End Cost-Effective Incentive Recommendation under Budget Constraint with Uplift Modeling |
| 略称 | E3IR |
| 著者 | Zexu Sun, Hao Yang, Dugang Liu, Yunpeng Weng, Xing Tang, Xiuqiang He |
| 年 | 2024 |
| 会場 | **RecSys 2024** |
| リンク | [arXiv:2408.11623](https://arxiv.org/abs/2408.11623) / [HTML 全文](https://arxiv.org/html/2408.11623v1) / [ACM RecSys'24](https://dl.acm.org/doi/10.1145/3640457.3688147) |

> **gather の記載に対する訂正**：gather ファイルは本論文について「Meituan での online A/B テストにより、注文量で 0.53%、GMV で 0.65% の改善を報告している」としているが、**これは誤りである**。HTML 全文を確認したところ、本論文は「all experiments are conducted in an offline setting」「future work includes online deployment」と明記しており、**online A/B テストは一切行っていない**。Meituan は**オフラインのプロダクションデータセット**として使われているにすぎない。0.53% / 0.65% という数値は gather のリソース 12（Hidden Representation Clustering）が報告するものであり、gather 自身も論点として「両者が同一数値である」ことに気づいていた（リソース 12 の項）。**同一数値なのは E3IR がその値を報告しているからではなく、gather が 12 の数値を 01 に誤って転記したためと見られる**。引用時は要注意。

## 一言で言うと

予算制約下のインセンティブ割当を multi-choice knapsack として定式化し、**単調性・平滑性というマーケティング領域知識をネットワーク構造と損失に埋め込んだ uplift 予測**と、**ILP を微分可能レイヤとして埋め込んだ割当**を end-to-end に繋ぐ。レポート 01（アイソトニック回帰の後処理）と同じ知識を、後処理ではなく学習に統合する対抗設計。ただし**検証は全てオフライン**。

## 問題設定

各ユーザー $i$ に対し $K$ 種の処置（インセンティブ水準）から高々 1 つを選ぶ。

- $z_{ik} \in \{0,1\}$：ユーザー $i$ に処置 $k$ を割り当てる
- $\tau_{ik}^r$：処置 $k$ による response（収益・転換）の uplift
- $\tau_{ik}^c$：処置 $k$ による cost の uplift
- $B$：予算

## 手法

### Multi-choice Knapsack（式 3）

$$\max_{z} \sum_{i=1}^{I}\sum_{k=1}^{K} \tau_{ik}^{r}\, z_{ik}$$

subject to

$$\sum_{i=1}^{I}\sum_{k=1}^{K} \tau_{ik}^{c}\, z_{ik} \leq B \qquad \text{(予算制約)}$$

$$\sum_{k=1}^{K} z_{ik} = 1 \qquad \text{(ユーザーごとに 1 処置)}$$

これが C6 の共通言語となる定式化である。レポート 01/02 の $\lambda$ 決定則は、**この予算制約をラグランジュ緩和して顧客ごとに分解したもの**に他ならない。本論文は緩和せず ILP のまま微分可能化する道を選ぶ。

### Uplift 予測モジュール

**アーキテクチャ**：shared bottom ネットワークが表現 $\Phi$ を出力し、cost 用・response 用の別々の予測ヘッドに供給する。

**隣接処置間の増分**（式 4〜5）：隣接する処置間の増分 $\hat{\vartheta}_i^c, \hat{\vartheta}_i^r$ を直接モデル化し、最終予測を累積和で構成する：

$$\hat{y}_t^r = \hat{y}_0^r + \sum_{k=1}^{t} \hat{\vartheta}_i^r \qquad (t \geq 1)$$

**処置水準ごとに独立に予測するのではなく、$k=0$ からの増分を積み上げる**。これが本論文の中心的な設計で、額の順序関係が構造として組み込まれる。

**単調性制約**：

$$\hat{\vartheta}_i^c \geq 0, \qquad \hat{\vartheta}_i^r \geq 0$$

を、増分出力に**二乗変換または指数変換を適用する**ことで強制する。増分が常に非負なら累積和は必ず単調増加になる——**制約ではなくパラメータ化によって単調性を構造的に保証する**というやり方であり、罰則項ではないので必ず満たされる。

これはレポート 01 のアイソトニック回帰（後処理で PAVA）、レポート 02 の $\beta(x)=\beta^\top x$（線形化で結果的に 99.5%）と**同じ業務知識に対する第 3 の実装**である。3 本が独立に同じ結論に達している（gather 論点 3）ことが、本レポートで確認された。

**平滑性制約**（式 8〜9）：Lipschitz 定数の積として

$$\mathcal{L}_{\text{Lip}} = \prod_{j=1}^{l} \text{softplus}(c_j)$$

$c_j$ は各層の Lipschitz 上界。uplift 側の損失は

$$\mathcal{L}_{\text{uplift}} = \mathcal{L}_{\text{prediction}} + \alpha\, \mathcal{L}_{\text{Lip}}$$

平滑性は「隣り合う処置水準の効果が急激には変わらない」という知識であり、**額水準間の内挿を安定させる**役割を持つ。単調性が順序を、平滑性が滑らかさを与える。

### 微分可能割当モジュール

ILP を descent direction theory（Proposition 1）により微分可能レイヤとして埋め込む。

- **コスト側の更新**（式 12〜13）：予算超平面までの距離を測る区分アフィンな mismatch 関数を通じた勾配
- **response 側の更新**（式 14）：実行可能解を優先する簡略形

$$P(\tau^r) = \tau^r \cdot (z_i' - z) \quad \text{（実行可能なら）}, \qquad 0 \quad \text{（そうでなければ）}$$

- **基底分解**（式 16）：支配的な勾配座標から整数移動 $\Delta_i$ を構成。係数 $\lambda_j$ は再帰的に定義される（Proposition 2）
- **end-to-end 損失**（式 19〜20）：

$$\mathcal{L}_{\text{allocation}} = \frac{1}{N}\sum \mathcal{L}_d(t, z_i) \qquad \text{（割当に対する交差エントロピー）}$$

$$\mathcal{L}_{\text{E3IR}} = \mathcal{L}_{\text{predict}} + \beta\, \mathcal{L}_{\text{allocation}}$$

**注**：本論文の割当モジュールはラグランジュ双対を明示的には使わない（レポート 01/02、および gather が挙げた DFCL とはこの点で異なる）。予算制約は微分可能 ILP レイヤの中で扱われる。

## 実験・結果

| 項目 | 内容 |
|------|------|
| 公開データ | **Criteo Uplift Prediction Dataset** — **2,038,910 サンプル**、**13 特徴量**、二値処置（$K=1$） |
| プロダクションデータ | **Meituan データセット** — 約 **120 万ユーザー**、**5 処置水準**（$K=4$ + control） |
| データ設定 | 両方とも RCT："These experiments are conducted under the RCT setting" |
| 評価指標 | Incremental Net Revenue (INR)（主要）、CATE 推定誤差、Conversion Rate Uplift、Revenue Uplift、Budget Utilization Rate、AUCC、Expected Outcome Metric |
| ベースライン | CFRNet + MCKP、DragonNet + MCKP（二段法）、Greedy 割当、RL ベース割当、E3IR の ablation（単調性・平滑性を外した版） |
| 結果（Criteo） | CFRNet ベースライン比 **+8.2%** |
| 結果（Meituan） | INR でベースライン比 **+6.5%** |
| **online A/B テスト** | **なし**。"all experiments are conducted in an offline setting"、"future work includes online deployment" と明記 |

**両データセットとも RCT（ランダム化）である**点は重要で、本論文の手法は非ランダムな観測データでの成立性を検証していない。

## 本課題への適用可能性

### 効く点

- **multi-choice knapsack の定式化が C6 全体の共通言語**である。式 3 を押さえておくと、レポート 01/02 の $\lambda$ 決定則が「この予算制約をラグランジュ緩和して顧客ごとに分解したもの」だと理解でき、手法群の関係が一本の線で繋がる。**理解の土台として読む価値は高い**。
- **増分の累積和 $\hat{y}_t^r = \hat{y}_0^r + \sum_k \hat{\vartheta}_i^r$ という構成は、額の順序を構造として持つ最も自然な形**。水準ごとに独立に予測するより遥かにデータ効率がよく、思想としては本課題に適合する。
- **単調性を「非負増分 + 二乗/指数変換」で構造的に保証する**アイデアは、深層モデルを使わなくても移植できる。例えば線形モデルでも係数を $\exp(\cdot)$ でパラメータ化すれば同じ効果が得られる。**アーキテクチャではなく、このパラメータ化の発想だけを取り出せる**。
- 平滑性制約（$\mathcal{L}_{\text{Lip}}$）は「隣接水準の効果が急変しない」という知識で、**額水準ごとのサンプルが薄い本課題では内挿の安定化に効く**方向の正則化である。
- ablation で単調性・平滑性を外した比較を行っているため、**制約そのものの寄与を確認できる**（ただし個別の寄与幅の数値は本レポートでは未確認）。
- Meituan データが **120 万ユーザー・5 処置水準**というのは、額を 5 水準に離散化する本課題の設計と構造が一致する。

### 効かない/リスク点

- **online 検証が存在しない**。gather が「Meituan で A/B、注文 +0.53%、GMV +0.65%」としていたのは誤りで、本論文は全てオフライン評価である。**実運用での有効性は本論文からは主張できない**。この点でレポート 01（フィールド実験 340 万人、CNY 800 万）、レポート 02（A/B 2,000 万人、+4.5%、p<0.01）とは証拠の質が明確に劣る。
- **データ規模のギャップが最大**。Criteo 203 万サンプル、Meituan 120 万ユーザー。本課題は数ヶ月に一度の施策であり、**shared bottom + 複数予測ヘッド + 微分可能 ILP レイヤという構成の学習が安定するとは考えにくい**。gather の懸念（論点 7）はそのまま当たる。
- **微分可能 ILP レイヤは実装コストが高い**。descent direction theory、基底分解、再帰的な $\lambda_j$（Proposition 2）と、実装の難度がレポート 01/02 とは桁違いである。**得られるものが「予測と意思決定の整合」であるのに対し、レポート 01/02 は $\lambda$ の argmax だけで実運用の成果を出している**。本課題での費用対効果は明らかに悪い。
- **両データセットが RCT である**。本課題で過去の非ランダムな配布履歴（効きそうな人に厚く配る運用）から学ぶ場合、本論文の検証は保証を与えない。RCT データが前提なら、レポート 03 の探索枠確保が先行条件になる。
- **逐次性・参照効果を扱わない**。単発割当であり、レポート 02 が実証した参照効果（購入率を 7〜137% 動かす）はモデル外。
- **単調性の対象が response と cost の両方**（$\hat{\vartheta}_i^c \geq 0, \hat{\vartheta}_i^r \geq 0$）である点は本課題でも自然だが、**収益 $= $ response $-$ cost は単調ではない**。最適額の決定が自明にならないのはレポート 01 と同じ。
- 増分の累積和構成は、**処置が全順序を持つ離散水準であることを前提**とする。額を連続値として内挿・外挿したい場合、水準間の補間は平滑性制約に頼ることになり、**未実施の額への外挿の保証はない**。
- **推定不確実性を扱わない**（gather 論点 8）。点推定を信じて ILP を解く系統であり、サンプルが少なく推定が不安定な本課題ではこの前提が崩れる。

## 実装ステップ

本課題では **E3IR をそのまま実装することは推奨しない**（微分可能 ILP のコストとデータ規模のギャップ）。取り出すべきは以下の設計思想のみ。

1. **式 3（multi-choice knapsack）を課題の定式化として明文化する**。目的・予算制約・1 ユーザー 1 処置。ここを共通言語にすると、レポート 01/02 の $\lambda$ がこの制約の緩和であることが説明できる。
2. **増分パラメータ化を軽量モデルに移植する**：水準 $k$ の効果を独立に推定せず、$\hat{y}_t = \hat{y}_0 + \sum_{k=1}^{t}\hat{\vartheta}_k$ の形で累積和として構成する。
3. **非負性を変換で保証する**：$\hat{\vartheta}_k = \exp(g_k(x))$ または $\hat{\vartheta}_k = g_k(x)^2$ とすれば、単調性は罰則なしで必ず成立する。**線形モデル・GBDT の出力に対しても適用可能**。
4. **平滑性の代替**：Lipschitz 積（式 8）の実装は重いので、本課題では隣接増分の差に対する単純な L2 罰則 $\sum_k (\hat{\vartheta}_{k+1} - \hat{\vartheta}_k)^2$ で代替するのが現実的。
5. **微分可能 ILP レイヤは採用しない**。予算制約はレポート 01/02 の $\lambda$ による分解で扱う。ソルバも微分可能化も不要。
6. **単調性の実装は 3 択から選ぶ**：後処理 PAVA（レポート 01、最も軽い）、線形処置効果（レポート 02、$\beta^\top x$）、非負増分パラメータ化（本論文）。**本課題ではまず PAVA を試し、不十分なら他を検討する**のが費用対効果の順。
7. **評価指標**：AUCC / Expected Outcome Metric より、**INR（Incremental Net Revenue）や Budget Utilization Rate といった意思決定側の指標**を採る（gather 論点 4)。

## 関連リソース

- [01. Data-Driven Real-time Coupon Allocation](01-data-driven-real-time-coupon-allocation.md) — 同じ単調性知識を後処理（PAVA）で実現。本論文の対抗設計であり、本課題では明確にこちらが有利。
- [02. Personalized Promotions in Practice](02-personalized-promotions-in-practice.md) — 単調性を線形処置効果で暗黙に達成（$\beta(x)>0$ が 99.5%）。単調性の第 3 の実装。
- [03. Balancing Revenue and OPE](03-balancing-immediate-revenue-and-future-ope.md) — 本論文が前提とする RCT データを、本課題でどう確保するか。
- gather 一覧: [resources-practical-coupon.md](../../../gather/20260715/c6/resources-practical-coupon.md)（リソース 01）。**リソース 12（Hidden Representation Clustering）が 0.53%/0.65% の実際の出所と見られる。**
