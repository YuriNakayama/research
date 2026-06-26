# 不完全情報ゲーム AI の系譜 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文 + 技術情報
- **対象期間**: 2007 – 2026（CFR/DeepStack/Libratus 等の必須古典を含むため期間を緩和）
- **収集日**: 2026-06-26
- **入力元**: clustering 結果 `runs/kaggle_ptcg/clustering/20260626/index.md`（cluster-02）
- **対象コンペ**: [Pokémon TCG AI Battle Challenge](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle)

## 学術論文

| # | サブトピック | タイトル | 著者 | 年 | Venue | 概要 |
|---|---|---|---|---|---|---|
| 1 | CFR | [Regret Minimization in Games with Incomplete Information](https://proceedings.neurips.cc/paper/2007/file/08d98638c6fcd194a4b1e6992063e944-Paper.pdf) | Zinkevich et al. | 2007 | NeurIPS (NIPS 2007) | CFR の原論文。情報集合ごとに反事実後悔を独立に最小化することで不完全情報展開形ゲームの近似ナッシュ均衡を計算する手法を確立。隠れ情報 TCG エージェントの均衡計算の理論的基盤であり、本クラスタの起点となる必読文献。 |
| 2 | CFR | [Monte Carlo Sampling for Regret Minimization in Extensive Games](https://papers.nips.cc/paper/3713-monte-carlo-sampling-for-regret-minimization-in-extensive-games) | Lanctot et al. | 2009 | NeurIPS (NIPS 2009) | MCCFR を提案し、external sampling 等で1反復あたりの計算量を桁違いに削減。巨大な確率的カードゲームの探索木をサンプリングで扱う実用的基盤で、PTCG 規模のゲームに CFR を適用する際の必須技法。 |
| 3 | CFR | [Solving Large Imperfect Information Games Using CFR+](https://arxiv.org/abs/1407.5042) | Tammelin | 2014 | arXiv:1407.5042 | regret-matching+ により CFR を桁違いに高速化した CFR+ を提案。後述の「ポーカー求解」を可能にした実装上の鍵で、TCG ソルバ実装時に CFR より優先採用すべきアルゴリズム。 |
| 4 | CFR | [Solving Imperfect-Information Games via Discounted Regret Minimization](https://arxiv.org/abs/1809.04040) | Brown & Sandholm | 2018 | arXiv:1809.04040 (AAAI 2019) | 過去反復の後悔を割り引く Discounted CFR (DCFR) を提案し全テストゲームで CFR+ を上回る。pruning やサンプリングと両立するため、大規模 TCG での収束高速化に直結する最新CFR変種。 |
| 5 | CFR | [Deep Counterfactual Regret Minimization](https://arxiv.org/abs/1811.00164) | Brown et al. | 2019 | arXiv:1811.00164 (ICML 2019) | 抽象化を排し、ニューラルネットで CFR の挙動を近似する Deep CFR。手作り抽象化なしで HUNL に強い性能を達成しており、PTCG のような巨大状態空間で関数近似型ソルバを組む際の中核手法。 |
| 6 | Bowling 2015 | [Heads-up limit hold'em poker is solved](https://pubmed.ncbi.nlm.nih.gov/25574016/) | Bowling et al. | 2015 | Science 347(6218):145-149, DOI:10.1126/science.1259433 | CFR+ により HULHE を本質的に弱解 (weakly solved) したマイルストーン。不完全情報ゲームが「解ける」ことを示した記念碑的成果で、TCG AI コンペの理論的到達点を示す参照点。 |
| 7 | DeepStack | [DeepStack: Expert-Level Artificial Intelligence in No-Limit Poker](https://arxiv.org/abs/1701.01724) | Moravčík et al. | 2017 | arXiv:1701.01724 (Science DOI:10.1126/science.aam6960) | 継続的再求解 (continual re-solving) と深層反事実価値ネットワークにより、事前に全戦略を保持せず局面ごとに解く DeepStack。深さ制限探索+価値ネットの組合せは TCG エージェントのリアルタイム意思決定設計に直結。 |
| 8 | Libratus/Pluribus | [Depth-Limited Solving for Imperfect-Information Games](https://arxiv.org/abs/1805.08195) | Brown et al. | 2018 | arXiv:1805.08195 (NeurIPS 2018) | 不完全情報ゲームで状態価値が一意でない問題を、深さ制限点で相手に複数戦略を選ばせる形で解決。Libratus/Pluribus の探索の核で、TCG エージェントに探索を組み込む際の原理的手法。 |
| 9 | Libratus/Pluribus | [Superhuman AI for heads-up no-limit poker: Libratus beats top professionals](https://www.science.org/doi/10.1126/science.aao1733) | Brown & Sandholm | 2018 | Science 359(6374):418-424, DOI:10.1126/science.aao1733 | blueprint戦略・nested subgame re-solving・自己改善の3本柱で2人零和ポーカーをプロ撃破。確率的・不完全情報・逐次という PTCG と同型の設定での超人 AI 先行事例。 |
| 10 | Libratus/Pluribus | [Superhuman AI for multiplayer poker](https://pubmed.ncbi.nlm.nih.gov/31296650/) | Brown & Sandholm | 2019 | Science 365(6456):885-890, DOI:10.1126/science.aay2400 | 6人ノーリミットポーカーで超人性能を達成した Pluribus。自己対戦で学んだ blueprint + 深さ制限探索を低コスト($150)で実現しており、自己対戦評価ベースの TCG コンペ設計の直接の先例。 |
| 11 | Libratus/Pluribus | [Combining Deep Reinforcement Learning and Search for Imperfect-Information Games (ReBeL)](https://arxiv.org/abs/2007.13544) | Brown et al. | 2020 | arXiv:2007.13544 (NeurIPS 2020) | AlphaZero 型の RL+探索を不完全情報に拡張した ReBeL。2人零和ゲームでナッシュ均衡に収束し最小限のドメイン知識で超人ポーカーを達成。TCG エージェント設計の最有力な統合フレームワーク候補。 |
| 12 | NFSP | [Deep Reinforcement Learning from Self-Play in Imperfect-Information Games](https://arxiv.org/abs/1603.01121) | Heinrich & Silver | 2016 | arXiv:1603.01121 | 架空対戦 (fictitious play) と深層 RL を統合した NFSP。ドメイン知識なしで近似ナッシュ均衡をエンドツーエンド学習でき、行動インデックスを出力する自己対戦型 TCG エージェントの最も基本的な学習法。 |
| 13 | ISMCTS | [Information Set Monte Carlo Tree Search](https://ieeexplore.ieee.org/document/6203567/) | Cowling et al. | 2012 | IEEE T-CIAIG 4(2):120-143, DOI:10.1109/TCIAIG.2012.2200894 | 状態でなく情報集合の木を探索する ISMCTS。隠れ情報・不確実性を持つカード／ボードゲームに MCTS を適用する標準手法で、PTCG エージェントの実装が最も容易な探索ベースライン。 |
| 14 | DeepNash/Stratego | [Mastering the Game of Stratego with Model-Free Multiagent Reinforcement Learning](https://arxiv.org/abs/2206.15378) | Perolat et al. | 2022 | arXiv:2206.15378 (Science DOI:10.1126/science.add4679) | 正則化ナッシュ動力学 (R-NaD) とモデルフリー RL で巨大不完全情報ゲーム Stratego を人間専門家級に攻略。探索なし・モデルフリーで均衡に収束する手法は、計算予算が限られた TCG コンペで有望。 |
| 15 | Hanabi | [The Hanabi Challenge: A New Frontier for AI Research](https://arxiv.org/abs/1902.00506) | Bard et al. | 2019 | arXiv:1902.00506 (Artif. Intell. 280) | 隠れ情報下の心の理論を要する Hanabi をベンチマークとして提案。マルチエージェント・部分観測・推論という TCG と共通する課題群を整理しており、エージェント評価設計の参照枠組み。 |
| 16 | Hanabi | [Bayesian Action Decoder for Deep Multi-Agent Reinforcement Learning](https://arxiv.org/abs/1811.01458) | Foerster et al. | 2018 | arXiv:1811.01458 (ICML 2019) | 全エージェントの行動を条件づけた public belief を近似ベイズ更新で得る BAD。行動から相手の手札分布を推論する仕組みは、PTCG で相手の隠れ手札を推定する belief モデル設計に有用。 |
| 17 | Hanabi | [Simplified Action Decoder for Deep Multi-Agent Reinforcement Learning](https://arxiv.org/abs/1912.02288) | Hu & Foerster | 2019 | arXiv:1912.02288 (ICLR 2020) | 探索性と情報伝達の両立を集中学習で解決した SAD。Hanabi で 2-5人 SOTA を達成し、行動が情報を兼ねる TCG での行動表現・探索設計に示唆を与える。 |
| 18 | Hanabi | [Other-Play for Zero-Shot Coordination](https://arxiv.org/abs/2003.02979) | Hu et al. | 2020 | arXiv:2003.02979 (ICML 2020) | ゲームの対称性を利用して恣意的な慣習に依存しない方策を学ぶ Other-Play。未知の対戦相手とのゼロショット協調・対戦汎化を扱い、自己対戦過学習を避けたい TCG エージェントの汎化に関連。 |
| 19 | Hanabi | [Improving Policies via Search in Cooperative Partially Observable Games (SPARTA)](https://arxiv.org/abs/1912.02318) | Lerer et al. | 2019 | arXiv:1912.02318 (AAAI 2020) | 学習済み方策を実行時探索で改善する SPARTA を提案し Hanabi で 24.61/25 の SOTA。部分観測下で belief 上の探索により方策性能を保証付きで底上げする技法は、TCG の実行時意思決定強化に直接応用可能。 |
| 20 | RLCard | [RLCard: A Toolkit for Reinforcement Learning in Card Games](https://arxiv.org/abs/1910.04376) | Zha et al. | 2019 | arXiv:1910.04376 | 不完全情報カードゲーム向け RL ツールキットの論文。DMC/DQN/NFSP/CFR を統一 API で提供し、PTCG 環境のラッパ実装・ベースラインエージェント構築の出発点となる。 |

## 技術情報

| # | サブトピック | タイトル | ソース | 年 | 種別 | 概要 |
|---|---|---|---|---|---|---|
| 1 | Hanabi | [facebookresearch/hanabi_SAD](https://github.com/facebookresearch/hanabi_SAD) | GitHub (Facebook AI Research) | 2019 | 公式実装 (GitHub) | SAD と Other-Play の公式実装。学習済みモデル・学習/評価基盤を含み、行動が情報を担うマルチエージェント協調学習を TCG 環境へ移植する際の参照コード。 |
| 2 | NFSP | [google-deepmind/open_spiel](https://github.com/google-deepmind/open_spiel) | GitHub (DeepMind) | 2019 | フレームワーク (GitHub) | n人・零和/協力・完全/不完全情報ゲーム向けの RL/探索フレームワーク。CFR・NFSP 等を C++/Python で実装しており、PTCG を OpenSpiel ゲームとして定義しソルバを再利用する基盤となる。 |
| 3 | RLCard | [datamllab/rlcard](https://github.com/datamllab/rlcard) | GitHub (DATA Lab, Rice/Texas A&M) | 2019 | フレームワーク (GitHub) | Leduc/Texas Hold'em/UNO/闘地主等の不完全情報カードゲーム環境と DMC/DQN/NFSP/CFR 実装を提供。PTCG エージェント開発で環境実装・ベースライン・評価を最短で立ち上げる実装基盤。 |
| 4 | Libratus/Pluribus | [Noam Brown — Research homepage](https://noambrown.com/) | 技術ブログ/個人サイト (OpenAI) | 2024 | 技術ブログ | Libratus・Pluribus・ReBeL・CICERO の著者本人による研究まとめ。不完全情報ゲーム AI 系譜の一次情報源で、各手法の位置づけと公開資料へのハブとして活用できる。 |

## URL検証結果

| 区分 | 件数 |
|---|---|
| 収集 | 24 |
| 検証済み | 24 |
| 不一致で除外 | 0 |
| アクセス不可で除外 | 0 |

注: science.org の3件 (Libratus/Pluribus/Heads-up limit solved) は本文ページが 403 でブロックされたため、タイトル・著者・DOI を PubMed および ADS の対応ページで照合・検証した。DeepStack は Science 版 (DOI:10.1126/science.aam6960) と同一内容の arXiv:1701.01724 を主 URL とした。ISMCTS は IEEE Xplore ランディングページが bot ブロックされたため、White Rose 公開 PDF の到達性確認に加え、York Research DB・White Rose・ResearchGate・IEEE 文献番号 6203567 の多元照合でタイトル/著者/Venue を確定した。CFR(2007)・MCCFR(2009) は arXiv が存在しないため NeurIPS proceedings PDF を主 URL とし本文照合済み。

## 全体の傾向

収集集合は、(1) 均衡計算の系譜 (CFR → MCCFR → CFR+ → Discounted CFR → Deep CFR)、(2) 探索と深層学習の統合 (DeepStack・Depth-Limited Solving・Libratus・Pluribus・ReBeL)、(3) 自己対戦学習 (NFSP・DeepNash/R-NaD)、(4) 部分観測下の belief・協調 (Hanabi 系: BAD・SAD・Other-Play・SPARTA)、(5) 実装基盤 (OpenSpiel・RLCard・hanabi_SAD) という 5 系統に明確に分かれ、PTCG (2人零和・確率的・不完全情報・逐次) に必要な理論と実装の双方を網羅している。全体として「探索なしで均衡に収束する手法」と「実行時探索で方策を底上げする手法」の二系統が並立しており、計算予算に応じた設計選択が可能であることが読み取れる。

次の retrieval フェーズでの最優先は、PTCG と最も設定が近く RL+探索を統合し低コストで超人性能を出した **ReBeL (arXiv:2007.13544)**、自己対戦評価ベースのコンペ設計に直結する **Pluribus (Science 2019)**、および実装着手を最短化する **RLCard (arXiv:1910.04376 / GitHub)** の 3 点である。

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの最優先論文 (ReBeL / Pluribus / DeepStack / ISMCTS / RLCard) を深掘り。
- **横展開**: cluster-05 (DouZero/Suphx) と統合し「(state, action) エンコード + determinization + 均衡探索」の実装方針へ。
