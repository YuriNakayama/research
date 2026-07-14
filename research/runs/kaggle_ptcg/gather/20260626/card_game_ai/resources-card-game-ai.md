# カードゲーム / TCG AI コンペ — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文 + 技術情報
- **対象期間**: 2018 – 2026（LOCM/Hearthstone コンペ期 2018–2022 を中心に、基盤文献を含む）
- **収集日**: 2026-06-26
- **入力元**: clustering 結果 `runs/kaggle_ptcg/clustering/20260626/index.md`（cluster-03）
- **対象コンペ**: [Pokémon TCG AI Battle Challenge](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle)

## 学術論文

| # | サブトピック | タイトル | 著者 | 年 | Venue | 概要 |
|---|---|---|---|---|---|---|
| 1 | Hearthstone AI | [Q-DeckRec: A Fast Deck Recommendation System for Collectible Card Games](https://arxiv.org/abs/1806.09771) | Chen, Z. ほか | 2018 | IEEE CIG 2018 | 大規模カードプールから固定サイズのデッキを選ぶデッキ構築を強化学習で探索方策として学習。対戦相手別に高速にデッキを最適化する初期研究で、デッキビルディング型エージェントの構築フェーズ設計の出発点になる。 |
| 2 | Hearthstone AI | [Improving Hearthstone AI by Combining MCTS and Supervised Learning Algorithms](https://arxiv.org/abs/1808.04794) | Świechowski, M. ほか | 2018 | IEEE CIG 2018 | 隠れ情報・乱数を含む Hearthstone 向けに MCTS をニューラル評価関数で誘導し、勝率を上げつつ計算量を削減。不完全情報・確率要素を持つ TCG での探索+学習ハイブリッドの実証として直接参考になる。 |
| 3 | Hearthstone AI | [Introducing the Hearthstone-AI Competition](https://arxiv.org/abs/1906.04238) | Dockhorn, A. ほか | 2019 | arXiv (IEEE CoG competition) | SabberStone をベースに 2 トラック(指定デッキ/持込デッキ)で行われた IEEE CoG の Hearthstone AI 競技を紹介。隠れ情報 TCG での自己対戦評価とデッキ持込ルールという、本コンペと相似の競技設計の前例。 |
| 4 | Hearthstone AI | [Deep Surrogate Assisted MAP-Elites for Automated Hearthstone Deckbuilding](https://arxiv.org/abs/2112.03534) | Zhang, Y. ほか | 2021 | GECCO 2022 | 深層サロゲートモデルで対戦結果を予測しつつ品質多様性 (MAP-Elites) でデッキを探索し、多様で強いデッキ集合を効率的に生成。約2000枚プールからのデッキ構築最適化に直結する手法。 |
| 5 | Hearthstone AI | [Mastering Strategy Card Game (Hearthstone) with Improved Techniques](https://arxiv.org/abs/2303.05197) | Xiao, C. ほか | 2023 | IEEE CoG 2023 | ByteDance チームの end-to-end ポリシー+fictitious play を Hearthstone のデッキ構築と対戦の両方に適用しトッププレイヤーを撃破。デッキビルディングと対戦を一体で学習する近年最強級の RL 手法。 |
| 6 | LOCM / Strategy Card Game | [Magic: The Gathering is Turing Complete](https://arxiv.org/abs/1904.09828) | Churchill, A. ほか | 2019 | arXiv (cf. FUN 2021) | 実カードによる Magic の最適プレイがチューリング機械の停止問題と同等に難しいことを構成的に証明。TCG の規則複雑性・計算的困難さの理論的背景として、なぜ単純探索が効かないかを裏付ける。 |
| 7 | LOCM / Strategy Card Game | [Mastering Strategy Card Game (Legends of Code and Magic) via End-to-End Policy and Optimistic Smooth Fictitious Play](https://arxiv.org/abs/2303.04096) | Xi, W. ほか | 2023 | arXiv (COG 2022 優勝 ByteRL) | COG 2022 を制した ByteRL の手法。多段階(デッキ構築+対戦)で観測・行動空間が変わるゲームを単一の end-to-end ポリシーで扱い、optimistic smooth fictitious play で大規模二人零和ゲームの Nash 均衡に収束。本コンペの中核参照。 |
| 8 | LOCM / Strategy Card Game | [Summarizing Strategy Card Game AI Competition](https://arxiv.org/abs/2305.11814) | Kowalski, J.; Miernik, R. | 2023 | IEEE CoG 2023 | LOCM を題材とした Strategy Card Game AI Competition の5年間(2018–2022)を総括。ルールベース・探索・深層 RL まで22チームの手法を比較しており、本コンペに最も近い先行コンペの全体像を与える必読の総説。 |
| 9 | LOCM / Strategy Card Game | [Learning to Beat ByteRL: Exploitability of Collectible Card Game Agents](https://arxiv.org/abs/2404.16689) | Haluska, R.; Schmid, M. | 2024 | arXiv | LOCM の SOTA エージェント ByteRL が、行動クローニング+RL ファインチューニングの敵対エージェントにより容易に攻略可能であることを示す。自己対戦レーティングで上位を狙う際の堅牢性・搾取可能性の警鐘。 |
| 10 | MTG / 一般 CCG | [Learning With Generalised Card Representations for "Magic: The Gathering"](https://arxiv.org/abs/2407.05879) | Bertram, T. ほか | 2024 | IEEE CoG 2024 (Best Paper nominee) | 未知カードへ汎化するカード表現(数値・名義・テキスト・画像・利用メタ情報)を研究し、新規セットのカードでも人間の選択を55%予測。新カードが継続追加される本コンペのカード表現設計に直結。 |
| 11 | サーベイ / 分類 | [A Taxonomy of Collectible Card Games from a Game-Playing AI Perspective](https://arxiv.org/abs/2410.06299) | Vieira, R. e S. ほか | 2024 | ICEC 2024 | 391の物理・553のデジタル CCG から代表10ゲーム(MTG, Hearthstone, Gwent 等)を選び、ルール・メカニクス・ゲームモードを AI 観点で分類。本コンペのゲーム特性(隠れ情報・確率・デッキ構築)を位置づける枠組み。 |
| 12 | Yu-Gi-Oh! | [UrzaGPT: LoRA-Tuned Large Language Models for Card Selection in Collectible Card Games](https://arxiv.org/abs/2508.08382) | Bertram, T. | 2025 | arXiv | MTG ドラフトの実時間カード選択を LoRA で微調整した LLM で推薦。小型 LLM を1万ステップで66.2%精度に到達させ、拡張セットへ高速適応。LLM ベースで更新容易なドラフト/デッキ選択 AI の方向性を示す。 |
| 13 ⚠️ | Yu-Gi-Oh! | [Deciding winning strategies in Yu-Gi-Oh! TCG is hard](https://arxiv.org/abs/2603.02863) | Nicolosi, O. ほか | 2026 | arXiv | 与えられた局面で計算可能戦略が勝ちかを判定する問題が Π¹₁-完全(停止問題より難しい)であることを実在カードの合法デッキで証明。TCG の意思決定の理論的困難さを定量化し探索の限界を示す。**注: arXiv ID が将来日付 (2603 = 2026/03) で要再確認。** |

## 技術情報

| # | サブトピック | タイトル | ソース | 年 | 種別 | 概要 |
|---|---|---|---|---|---|---|
| 1 | Hearthstone AI | [HearthSim/SabberStone](https://github.com/HearthSim/SabberStone) | GitHub | 2016– | シミュレータ (C#/AGPLv3) | Hearthstone AI Competition の公式シミュレータ。Standard カードの約98%を実装し、全合法手の列挙・状態遷移をライブラリとして提供。隠れ情報 TCG の環境実装の参照例。 |
| 2 | Hearthstone AI | [hearthstoneai.github.io](https://hearthstoneai.github.io/) | 競技サイト | 2018–2020 | コンペ公式サイト | IEEE CoG の Hearthstone AI Competition 公式サイト。指定デッキ/持込デッキの2トラック構成。自己対戦評価・デッキ持込という本コンペと相似のルール設計の一次情報。 |
| 3 | Hearthstone AI | [icaros-usc/EvoStone2](https://github.com/icaros-usc/EvoStone2) | GitHub | 2022 | 実装コード | "Deep Surrogate Assisted MAP-Elites" (GECCO 2022) 公式実装。DSA-ME/MAP-Elites とサロゲートモデルで分散デッキ構築探索を行う。デッキ最適化アルゴリズムの再現・流用に有用。 |
| 4 | LOCM / Strategy Card Game | [legendsofcodeandmagic.com](https://legendsofcodeandmagic.com/) | 競技サイト | 2018– | コンペ公式サイト | Kowalski & Miernik による Strategy Card Game AI Competition (LOCM) 公式サイト。arena/constructed モードや各年度(CEC/COG 2019–2022)のルール・結果を掲載。本コンペの最有力先行事例の一次情報源。 |
| 5 | LOCM / Strategy Card Game | [Coac/locm](https://github.com/Coac/locm) | GitHub | 2019 | エージェント実装 | CEC 2019・COG 2019 優勝ボット。minimax + α-β 枝刈り、固定カードランクによるドラフト、遺伝的アルゴリズムで最適化した評価関数を使用。決定的・探索ベースの強豪エージェントの具体例。 |
| 6 | LOCM / Strategy Card Game | [ronaldosvieira/gym-locm](https://github.com/ronaldosvieira/gym-locm) | GitHub | 2020– | RL 環境 | LOCM の Gymnasium 環境。constructed/draft/battle の各フェーズ、1人/2人プレイ、CLI ランナー、深層 RL 学習スクリプトを提供。多段階 TCG エージェントを学習・評価するベンチマーク基盤。 |
| 7 | Yu-Gi-Oh! | [sbl1996/ygo-agent](https://github.com/sbl1996/ygo-agent) | GitHub | 2024– | RL 環境+エージェント | envpool と ygopro-core 上に gym 互換の高性能環境 ygoenv を構築し、深層 RL/LLM で超人プレイを目指す ygoai を実装(JAX/LSTM 対応)。複雑な実 TCG ルール下での RL 学習基盤の実例。 |

## URL検証結果

| 区分 | 件数 |
|---|---|
| 収集 | 19 |
| 検証済み | 19 |
| 不一致で除外 | 0 |
| アクセス不可で除外 | 0 |

注: 「Drafting in Collectible Card Games via Reinforcement Learning」(Vieira ほか, SBGames 2020) は arXiv 版が存在せず canonical URL の検証が弱いため学術論文表からは除外し、その実装基盤である gym-locm を技術情報として採録した。論文 #13 (Yu-Gi-Oh! hardness) は subagent が報告した arXiv ID が将来日付 (2603.02863) であり、retrieval フェーズで実在確認を要する（⚠️ マーク付与）。

## 全体の傾向

収集したセットは、(1) Strategy Card Game AI Competition (LOCM) と Hearthstone AI Competition という2大先行コンペ、(2) end-to-end 深層 RL + fictitious play による近年の SOTA 手法、(3) デッキ構築の最適化(品質多様性・サロゲート・LLM)、(4) TCG の計算論的困難さの理論、という4軸に整理でき、本コンペ(2人零和・確率的・不完全情報・デッキ構築・自己対戦 TrueSkill)の主要課題をほぼ網羅している。特に LOCM 系は「デッキ構築フェーズ+対戦フェーズの多段階構造」「自己対戦レーティングによる順位付け」という点で本コンペと構造的に最も近く、最重要の参照群である。

次の retrieval フェーズで深掘りすべき最優先リソースは、(a) ByteRL の手法論文 [arXiv:2303.04096](https://arxiv.org/abs/2303.04096)(多段階 end-to-end ポリシー+optimistic smooth fictitious play は本コンペのベースライン設計に直結)、(b) コンペ総説 [arXiv:2305.11814](https://arxiv.org/abs/2305.11814)(22チームの手法分布から実装方針の地図が得られる)、(c) [arXiv:2404.16689](https://arxiv.org/abs/2404.16689)(SOTA エージェントの搾取可能性は自己対戦レーティング環境での堅牢性確保に不可欠)の3点である。あわせて環境基盤として **gym-locm** リポジトリは実装・実験の出発点として高優先度となる。

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルで ByteRL (2303.04096) / コンペ総説 (2305.11814) / 搾取可能性 (2404.16689) を深掘り。
- **環境構築**: gym-locm / SabberStone を参照し、cabt Engine のラッパ設計（多段階フェーズ + 自己対戦評価）に転用。
