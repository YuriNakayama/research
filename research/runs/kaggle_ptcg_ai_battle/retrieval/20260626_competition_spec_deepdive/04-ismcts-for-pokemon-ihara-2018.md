# ポケモン対戦への ISMCTS 適用 (Ihara et al. 2018): determinization vs 情報集合

## 概要

Ihara, Imai, Oyama, Kurihara による "Implementation and Evaluation of Information Set Monte Carlo Tree Search for Pokémon"(IEEE SMC 2018)は、ポケモン対戦という不完全情報・確率的ゲームに対し複数の MCTS 変種を実装比較した数少ない実証研究である。Cheating MCTS(全情報を覗き見る上限性能)、Determinization MCTS、Information Set MCTS(ISMCTS)などを同一環境で対戦させ、**情報集合を用いる手法が determinization より計算資源を効率的に配分し strategy fusion の害を減らす**ことを定量的に示した。本コンペのカードゲームとはルールが異なるが、「隠れた相手情報を持つポケモン題材で ISMCTS が有効」という直接的な先行事例である。

## 手法の要点

- **対象ゲーム**: ポケモン本編バトル型の対戦環境(相手の手持ち・選択が隠れる不完全情報、技の命中・追加効果などの確率要素を含む)をシミュレートし、各手番で MCTS により行動を選択する。
- **比較した MCTS 変種**: 
  - **Cheating MCTS**: 隠れ情報を全て知っている前提の上限ベースライン。
  - **Cheating Ensemble MCTS**: 複数木のアンサンブル版。
  - **Determinization MCTS**: 隠れ情報を完全情報インスタンスにサンプルして解き統合(PIMC)。
  - **Information Set MCTS (ISMCTS)**: 情報集合をノードとする単一木で統計を共有。
- **時間予算**: MCTS 系は 1 手番あたり最大 60 秒程度の計算予算で「効果的に」機能することが示された。アンタイム性を利用し予算内で探索を打ち切る。
- **評価軸**: determinization と情報集合の有効性を直接比較し、strategy fusion の影響と計算資源配分の観点で優劣を分析。

## 主要な結果や知見

- **ISMCTS が determinization に対し有意な優位**を示した。情報集合を用いることで strategy fusion の影響が減り、計算リソースが単一木に集約されてより効率的に配分される、というのが著者らの結論。
- Cheating(全情報)MCTS は当然最強だが、現実には不可能。ISMCTS はその差を縮めつつ、隠れ情報前提でも実用的な強さを出す中間解として位置づけられる。
- MCTS 系手法はポケモンの高分岐・確率性に対しても、1 手番 60 秒程度の予算で実用的に機能する。
- 信念分布の精緻なモデル化なしでも(情報集合上の素朴なサンプリングで)強さが出る、という Cowling らの一般的知見とも整合する。

## 本コンペ(PTCG AI Battle)への応用

- **直接の前例として参照価値が高い**: 「ポケモン×不完全情報×ISMCTS が有効」という結論は、cabt の `search_begin` を使った ISMCTS 実装方針を裏付ける。Determinization MCTS から始めて ISMCTS へ移行する段階的開発が合理的。
- **時間予算の現実性チェック**: 本研究では 1 手番 60 秒だったが、本コンペは**試合全体で 10 分**(全手番合計)と桁違いに厳しい。したがって (a) 1 手番あたりのイテレーション数を強く制限、(b) 自明手はルールベースで即決し探索を勝負どころに集中、(c) `search_begin` 呼び出し回数=探索ノード数の上限管理、が必須。Ihara らの「60 秒で有効」をそのまま使えないため、軽量化・early cutoff が鍵。
- **Cheating MCTS を開発用オラクルに**: ローカルでは自分のエージェント評価に「全情報を知る Cheating MCTS」を上限ベンチマークとして使い、ISMCTS 実装がどれだけその性能に近づけているかを測る評価プロトコルが作れる(本コンペは自己対戦の validation episode も走るため、内部評価との整合も取りやすい)。
- **strategy fusion 回避の実利**: ポケモンカードでサイド・相手手札が不明な局面で、状態ごとに別決定を許す determinization は楽観/悲観バイアスを生む。情報集合木で統計共有することで、Gaussian ラダーで効く「安定した勝率」に寄与する。

## 出典(URL)

- Ihara, Imai, Oyama, Kurihara, "Implementation and Evaluation of Information Set Monte Carlo Tree Search for Pokémon", IEEE SMC 2018: https://ieeexplore.ieee.org/document/8616371/
- Semantic Scholar 記録: https://www.semanticscholar.org/paper/Implementation-and-Evaluation-of-Information-Set-Ihara-Imai/d7ea079b7ef791d1928b2b4f5698f63ff0813383
- 研究記録 (researchr): https://researchr.org/publication/IharaIOK18
