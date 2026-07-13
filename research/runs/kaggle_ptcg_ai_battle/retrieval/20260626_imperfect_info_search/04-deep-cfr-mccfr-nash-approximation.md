# MCCFR と Deep CFR — Nash 均衡近似による抽象化不要のニューラル CFR (Lanctot 2009 / Brown 2019)

## 概要

本レポートは、不完全情報ゲームの**ゲーム理論的に健全な (game-theoretically sound)** 解法系統である CFR とその拡張を扱う。Lanctot ら (NeurIPS 2009) の **Monte Carlo CFR (MCCFR)** は、CFR の各反復でゲーム木全体ではなくサンプリングした部分木のみを辿ることで大規模ゲームへの適用を可能にした。Brown, Lerer, Gross, Sandholm (ICML 2019) の **Deep CFR** は、手作りの状態抽象化 (abstraction) を不要にし、ニューラルネットで full game の CFR 挙動を近似する初の非表形式 CFR である。ISMCTS が「強い準最適方策を高速に得る」のに対し、CFR 系は「Nash 均衡に収束し搾取されにくい方策を得る」。PTCG AI Battle のように相手も探索エージェントである対戦環境では、搾取耐性が重要になる場面でこの系統が効く。

## 手法の要点

**counterfactual regret (反実仮想後悔)**: 情報集合 I・行動 a の counterfactual value v^σ(I,a) は「プレイヤー p が I に到達しようとした確率で重み付けした、a を 100% 選んだ場合の期待利得」。瞬間後悔 r^t(I,a) = v^σ(I,a) − v^σ(I)。後悔行列法 (regret matching) で、正の後悔に比例した確率分布を次反復の方策とする。CFR は各情報集合の後悔最小化が全体後悔を上界することを利用し、平均方策が O(1/√T) で Nash 均衡に収束する anytime アルゴリズム。

**MCCFR (外部サンプリング)**: バニラ CFR は全木走査が必要で大規模ゲームでは非現実的。MCCFR は各反復で部分集合 Q_t のみを辿り、サンプル後悔を確率で割って不偏推定する。**external sampling** では 1 プレイヤー(traverser)について木を走査し、traverser のノードでは全行動を展開、相手・chance ノードでは 1 行動のみサンプリング。サンプル全てに等重みを割り当てられ、全行動展開が分散を下げる利点がある。分岐が極端に大きいゲームでは **outcome sampling** が望ましい。

**Deep CFR**: 表形式 CFR の「各情報集合で後悔を蓄積」をニューラルネット近似に置き換える。
- **value network V(I,a|θ)**: tabular CFR が出す後悔 R^t に比例する値を予測。各反復 t で external sampling MCCFR により K 回の部分走査を行い、瞬間後悔のサンプルを**メモリ M_v に reservoir sampling で蓄積**。毎反復、新しいネットワークをゼロから訓練し、予測 advantage と蓄積サンプルの MSE を最小化。
- **policy network Π(I|θ)**: 最終的に Nash に収束するのは平均方策なので、別メモリ M_Π に各反復の方策ベクトルを蓄積し、平均方策を近似。
- **reservoir sampling が決定的**: スライディングウィンドウ式メモリだと、メモリが埋まった後に exploitability が増加してしまう。古いサンプルを確率的に保持する reservoir sampling が収束に必須。

## 主要な結果や知見

- **抽象化不要**: 従来の大規模ポーカー AI は手作りの状態抽象化(数十億決定 → 数万バケットへのクラスタリング)に依存し、ドメイン知識が必要で近似誤差も大きい。Deep CFR はこれを不要にする初の非表形式 CFR。
- **Flop Hold'em Poker (FHP, 10^12 ノード)**: Deep CFR は 360 万クラスタ抽象化と同等の exploitability に到達しつつ、収束が大幅に高速。
- **NFSP との比較**: Deep CFR は exploitability 37 mbb/g に対し NFSP は 47 mbb/g。head-to-head でも Deep CFR が NFSP を **43±2 mbb/g** で上回る。
- **HULH poker (10^17 ノード)**: Deep CFR は 3.3×10^8 バケットの抽象化(2007 年 Polaris 相当)に対し **−11±2 mbb/g** しか負けない(プロが Polaris に 52±10 mbb/g 負けたのと比較して僅差)。
- CFR は first-order 法より理論収束は遅い(O(1/√T))が、実用ではより高速かつ誤差・関数近似に頑健。

## 本コンペ(PTCG AI Battle)への応用

- **搾取耐性の確保**: ISMCTS は強い準最適方策を高速に得るが Nash には収束せず、相手にパターンを読まれると搾取されうる。PTCG の対戦相手も強い探索エージェントである場合、特に終盤や定型的な局面で CFR 系の Nash 近似方策を併用すると搾取されにくくなる。混合戦略(相手の山札読みに対する不確実性の維持)が必要な局面で有効。
- **抽象化不要は巨大行動空間に適合**: PTCG の行動空間は巨大で手作り抽象化は困難。Deep CFR の「ニューラルネットで情報集合を汎化し抽象化を不要にする」思想は、合法手 index が膨大な本コンペに適合する。external sampling は分岐が大きい局面では outcome sampling に切替える設計指針も得られる。
- **オフライン学習 + オンライン推論の二層**: Deep CFR は重い自己対戦オフライン訓練が前提。PTCG では事前に Deep CFR / value network を訓練し、対戦時(10 分制約)はネットワーク推論で高速に方策を出す構成が現実的。これは ISMCTS のオンライン探索と相補的に使える(ISMCTS のロールアウト方策や葉評価に CFR 由来のネットを使う)。
- **デッキ 60 枚最適化との接続**: CFR の exploitability は「あるデッキ+方策がどれだけ搾取されうるか」の定量指標になりうる。deck.csv の候補構築を、対戦方策の exploitability が低くなる方向で選ぶメタ最適化の評価軸として活用できる。
- **計算コストの注意**: Deep CFR は SGD ステップに時間の大半を費やす。本コンペの 1 プレイヤー 10 分は推論には十分だが訓練はオフラインで行う前提を厳守すべき。

## 出典(URL)

- Lanctot, M., Waugh, K., Zinkevich, M., Bowling, M. (2009). Monte Carlo Sampling for Regret Minimization in Extensive Games. NeurIPS 2009. https://papers.nips.cc/paper/3713-monte-carlo-sampling-for-regret-minimization-in-extensive-games
- Brown, N., Lerer, A., Gross, S., Sandholm, T. (2019). Deep Counterfactual Regret Minimization. ICML 2019. https://arxiv.org/abs/1811.00164
