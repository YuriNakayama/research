# cluster-02: 不完全情報ゲーム AI の系譜

> 本コンペと **情報構造が最も同型**（2 人ゼロ和・確率的・不完全情報）。
> 「情報集合 + 反実仮想後悔最小化 (CFR)」と「determinization / re-solving」が二大エンジン。

## A. ポーカー AI — 不完全情報の正統系譜

### A-1. Annual Computer Poker Competition (ACPC)
- **年/会場**: ~2006–2018, AAAI/IJCAI。後続マイルストーンの母体。
- **評価設計の教訓**: 勝者部門が 2 系統 — **Total Bankroll**（弱い相手の *搾取* を評価）と **Bankroll Instant Run-off**（*頑健性*＝exploit され難さを評価）。両者で勝者が異なることが多い。
- **転用教訓**: 評価で「頑健性」と「搾取」を分離して考える。TrueSkill ラダーは暗黙に頑健性を要求する。
- 出典: [AI Magazine, Bard et al. 2013](https://ojs.aaai.org/aimagazine/index.php/aimagazine/article/download/2474/2362), [Wikipedia: Computer poker player](https://en.wikipedia.org/wiki/Computer_poker_player)

### A-2. Libratus (CMU, 2017) — heads-up no-limit でプロに勝利
- **3 部構成**: (1) **MCCFR** で抽象化ゲーム上に blueprint をオフライン計算、(2) **nested subgame safe re-solving**（想定外の相手手はその subgame を実時間で高解像度に再解決）、(3) 夜間に blueprint の穴を自己修復。
- **転用教訓**: 粗いオフライン戦略 + 実時間 re-solving。想定外の相手手を最近傍バケットに丸めるな。
- 出典: [Science PDF](https://noambrown.com/papers/17-Science-Superhuman.pdf), [Wikipedia: Libratus](https://en.wikipedia.org/wiki/Libratus)

### A-3. Pluribus (CMU/Facebook, 2019) — 6 人ポーカー突破、blueprint は ~$144 の計算
- 多人数では Nash 均衡が保証にならないため均衡目標を放棄し **経験的に**勝利。(1) MCCFR blueprint、(2) **深さ制限実時間探索**（本人らが主因と明言）、(3) **探索 leaf で複数の継続戦略**を相手に選ばせ、単一想定応答でなく *応答集合* に対して頑健化。
- **転用教訓**: 多人数/理論薄の設定では blueprint + 深さ制限探索を「多様な相手継続」に対して頑健化。
- 出典: [Science](https://www.science.org/doi/10.1126/science.aay2400)

### A-4. DeepStack (U. Alberta, 2017)
- (1) **continual re-solving**（blueprint を保存せず各局面を自分の *range* と相手の counterfactual values だけで再解決）、(2) **深さ制限 lookahead**、(3) leaf で **deep counterfactual value network**（自分の隠れ手 *range 全体* の counterfactual 値を推定 = 不完全情報版の価値ネット）。
- **転用教訓**: 深い木再帰を「隠れ手 range 全体を採点する学習価値ネット」で置換し、毎ターン局所 re-solve。
- 出典: [Science PDF](https://poker.cs.ualberta.ca/publications/17science.pdf)

### A-5. CFR ファミリー（基盤エンジン）
- **CFR** (Zinkevich 2007): 各 **情報集合** に独立 regret-minimizer、**regret matching**、平均戦略が 2 人ゼロ和で Nash へ収束 (O(1/√T))。
- **CFR+** (2014–15): regret-matching⁺ + 交互更新 + 線形平均。heads-up limit Hold'em を **実質解決**。
- **Monte Carlo CFR** (Lanctot 2009): サンプリングで木全走査を回避。**external sampling**（chance/相手をサンプル、自分は列挙）が低分散で定番。
- **Deep CFR** (Brown 2019): NN が regret/戦略を情報集合の関数として近似 → **手作り抽象化を不要に**。
- **転用教訓**: ゲームを情報集合として表現し counterfactual regret を最小化する CFR 系自己対戦が、本コンペと同型の設定で exploitable でない方策を作る実証済みレシピ。大規模では Deep CFR / NFSP。
- 出典: [Zinkevich 2007](https://www.researchgate.net/publication/221619482_Regret_Minimization_in_Games_with_Incomplete_Information), [Bowling et al. Science 2015](https://webdocs.cs.ualberta.ca/~bowling/papers/15science.pdf), [Deep CFR, ICML 2019](https://proceedings.mlr.press/v97/brown19b/brown19b.pdf), [Depth-Limited Solving, Brown 2018](https://arxiv.org/pdf/1805.08195)

## B. 協力 / 敵対的な隠蔽情報（非カード）

### B-1. The Hanabi Challenge (DeepMind, 2019)
- **情報構造**: *協力*不完全情報。自分の手札は見えず他者の手札が見える。通信は限定的・コスト付きの **hint 行動**のみ → **theory of mind** が核心。self-play と ad-hoc teamwork の 2 regime。
- **主要手法**: Rainbow DQN; **BAD**（公共知識ベイズ信念を明示追跡、行動を通信路と見なす）; **SAD**（学習時に teammate の greedy 行動を観測させ意図を安価にデコード）; **Other-Play**（ゲーム対称性を利用し恣意的「秘密の握手」規約を回避、未知相手と zero-shot 協調）; **SPARTA**（公共信念状態で blueprint に belief-based 探索を追加、~24.61/25）。
- **転用教訓**: 行動は信号路。公共信念状態を追跡し「行動=信号」の一貫方策を学ぶ。ただし対称性破壊 (Other-Play) で脆い self-play 規約を回避。
- 出典: [The Hanabi Challenge, arXiv:1902.00506](https://arxiv.org/abs/1902.00506), [SAD ICLR 2020](https://openreview.net/forum?id=B1xm3RVtwB), [Other-Play ICML 2020](https://arxiv.org/abs/2003.02979)

### B-2. Stratego / DeepNash (DeepMind, 2022)
- **情報構造**: 2 人ゼロ和。chance 要素は無いが、秘匿配置 + 駒種隠蔽で巨大な隠れ状態 (~10^535)。
- **手法**: **Regularized Nash Dynamics (R-NaD)** — **model-free・search-free** RL で学習ダイナミクスを正則化し近似 Nash へ *収束*。明示的な相手モデルなしで、ブラフ・情報秘匿を自己発見。対 bot 97%+, 対人間 84%。
- **転用教訓**: 巨大隠蔽情報ゲームでは、相手を明示的に読む/木探索するより、model-free RL で exploitable でない均衡方策に収束する方が勝つことがある。
- 出典: [DeepNash, arXiv:2206.15378](https://arxiv.org/abs/2206.15378), [DeepMind blog](https://deepmind.google/blog/mastering-stratego-the-classic-game-of-imperfect-information/)

## C. 本コンペへの転用まとめ

| 手法 | 適用箇所 | コスト | 推奨度 |
|------|---------|--------|--------|
| determinization + 探索 | 最初のベースライン（相手手札をサンプリングして完全情報評価） | 低 | ★★★★★ |
| ISMCTS | カードゲーム native な不完全情報探索 | 中 | ★★★★★ |
| Deep CFR / NFSP | 大規模 exploitable 回避方策の学習 | 高 | ★★★★☆ |
| counterfactual value net (DeepStack 型) | leaf で隠れ手 range を採点 | 高 | ★★★☆☆ |
| R-NaD (DeepNash 型) | search-free 均衡収束 | 高 | ★★★☆☆ |
| Other-Play | self-play 規約の脆さ回避 | 中 | ★★★☆☆ |

> **要点**: 「情報集合でモデル化」+「determinization を最初の足場」+「均衡探索 (CFR/NFSP) を上積み」。
