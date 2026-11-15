# Information Set Monte Carlo Tree Search (ISMCTS): 不完全情報ゲームの探索基盤

## 概要

Cowling, Powley, Whitehouse (2012, IEEE TCIAIG) の "Information Set Monte Carlo Tree Search" は、不完全情報・確率的ゲームに MCTS を適用する基礎論文である。従来の **determinization(完全情報インスタンスをサンプリングして解く)** が抱える弱点 — 計算予算の分散・strategy fusion・nonlocality — を、ゲーム状態ではなく **情報集合 (information set)** をノードとする木を構築することで克服する。ポケモンカードのように相手手札・デッキ順・サイドが隠れ、コイン・ドローという確率要素を含むゲームに直接適用できる、本コンペ核心の探索理論である。

## 手法の要点

**3 種類の不完全情報の定式化**

論文は不完全情報を 3 類型に分ける: (1) **information sets**(プレイヤーから区別できない状態の集合。例: 相手手札の全順列)、(2) **partially observable moves**(行動の一部が隠れる)、(3) **simultaneous moves**(同時手番、Rock-Paper-Scissors 型)。ゲームは 9-tuple Γ=(S,Λ,s0,κ,μ,ρ,π0,(~i),(≈i)) で定義され、~i がプレイヤー i の情報集合の同値関係。

**determinization の弱点**

標準的 PIMC(perfect information Monte Carlo)は、現在の情報集合から複数の完全情報インスタンス(determinization)をサンプルし各々を別個の木で解いて統合する。これには (a) 計算予算が複数木に分散し共有されない、(b) **strategy fusion**(同一情報集合内の異なる状態で別々の決定をしてしまう=実際には区別できないのに区別できると誤仮定)、(c) **nonlocality**(他プレイヤーが避けるはずの状態に解が依存)という弱点がある。Russell & Norvig はこれを "averaging over clairvoyance"(千里眼の平均化)と批判した。

**ISMCTS のアイデア**

ノードを状態ではなく **情報集合**とし、各イテレーションで 1 つの determinization をランダムにサンプルして木を 1 本だけ降りる。これにより (1) 全イテレーションの統計が単一の木に集約され予算を効率利用、(2) 同一情報集合の状態が同一ノードに対応するため strategy fusion を緩和/解消できる。論文は 3 変種を提示: **SO-ISMCTS**(単一観測者、情報集合の木)、**SO-ISMCTS+POM**(部分観測手番に対し subset-armed bandit で対処)、**MO-ISMCTS**(各プレイヤーごとに木を持ち、観測される move のみで木を構築)。同時手番には UCB の代わりに **EXP3**(混合戦略に収束)を用いる。

## 主要な結果や知見

- 3 ドメイン(Lord of the Rings: The Confrontation、phantom (4,4,4)-game、中国式カードゲーム Dou Di Zhu)で評価。LotR では深い探索が要るため ISMCTS が予算効率で有利、phantom game では strategy fusion の害が大きいため ISMCTS が determinization を上回る。
- Dou Di Zhu では strategy fusion/nonlocality の影響が小さく、かつ情報集合木の分岐が桁違いに大きい(52! ≈ 8×10^67 の手札順列)ため、両手法は同等。**ドメイン特性(リーフ相関・bias・disambiguation rate)が適否を決める**(Long et al. の 3 パラメータ)。
- ISMCTS は「強い準最適方策を妥当な計算時間で見つける」性質を持つ。厳密 Nash には収束しない(混合最適には MCCFR が適する)が、組合せ的に巨大な木で実用的な強さを出す。
- 信念分布(belief)を陽にモデル化せず、情報集合上の一様分布を仮定しても多くのゲームでロバスト。相手モデルの推定が必須でない点が実装を軽くする。

## 本コンペ(PTCG AI Battle)への応用

- **cabt の search API との直結**: `search_begin(... opponent_deck, opponent_prize, opponent_hand ...)` は明示的に「予測カード ID で determinize する」設計であり、ISMCTS の 1 イテレーション = 1 determinization サンプル + `search_step` による降下、にそのまま対応する。複数 determinization を引いて同一の情報集合木に統計を集約すれば SO-ISMCTS が実装できる。
- **strategy fusion の回避**: ポケモンカードでは「相手の手札が読めない」状況で、もし状態ごとに別決定を許すと過度に楽観/悲観的になる。情報集合ノードで統計を共有することで、相手のサイド・手札が不明なまま堅実な手を選べる。
- **10 分予算下のアンタイム性**: ISMCTS はアンタイムアルゴリズムで、残り時間に応じてイテレーション数を調整可能。本コンペの時間切れ即敗北制約に対し、残り時間ウォッチドッグでイテレーションを打ち切り、その時点の最良 option index を返す設計が自然。
- **コイン・ドローの確率ノード**: 論文の chance node 扱い(各分岐をほぼ均等に訪問)を、ポケモンのコイントス・ドローに適用できる。`manual_coin=True` で確率を陽に制御し determinize する選択肢もある。
- **belief の軽量化**: 一様分布でロバストという知見は、序盤に重い相手モデルを作らず、`logs` から確定した公開情報(プレイされたカード)のみで determinization の制約を絞る軽量実装を正当化する。

## 出典(URL)

- Cowling, Powley, Whitehouse, "Information Set Monte Carlo Tree Search", IEEE TCIAIG 2012 (PDF): https://eprints.whiterose.ac.uk/id/eprint/75048/1/CowlingPowleyWhitehouse2012.pdf
- DOI: https://doi.org/10.1109/TCIAIG.2012.2200894
- 関連: Determinization and ISMCTS for Dou Di Zhu (IEEE): https://ieeexplore.ieee.org/document/6031993/
