# Cluster 5: デッキ構築・ドラフト最適化

**Overview**:
提出物の `deck.csv`（60枚）を最適化する領域。CCG AI 研究では対戦プレイと並ぶ第2の主軸であり、本コンペでは Strategy 部門が明示的に「デッキ構築の独自性」を評価するため特に重要。進化計算（EA）で初期ランダムデッキを変異・交叉して強いデッキへ収束させる手法、自動プレイテスト、ドラフト（逐次カード選択）への強化学習適用、メタゲーム（流行デッキ分布）への適応を含む。デッキとエージェントは相互依存するため、**両者の共同最適化** が論点。

**Keywords**:
`deckbuilding optimization`, `evolutionary algorithm deck`, `automated playtesting`, `arena draft RL`, `active genes`, `meta-game adaptation`, `60-card deck construction`, `deck archetype`, `card synergy`, `co-evolution deck+agent`, `Standard format meta`, `win-rate estimation`

**Research Strategy**:
- 「Automated Playtesting in CCGs using EA (Hearthstone)」と「Evolutionary Deckbuilding in HearthStone」で EA ベースのデッキ最適化フローを把握。
- 「Active genes」アプローチ（部分的訓練データで世代ごとに学習する EA 変種）でサンプル効率を改善。
- ドラフト RL（"Exploring RL approaches for drafting in CCGs"）を本コンペの「デッキ選択フェーズで60枚IDを返す」I/F に対応づけ。
- エージェントの評価関数（C4）を fitness に使い、デッキ⇔エージェントの共進化ループを設計。
- スタンダードの実メタ（人間プレイヤーの流行デッキ）を外部知識として取り込む可否を検討（外部データ規約は C1 で要確認）。

**Seed Resources**:
| タイトル | 年 | 概要 | リンク |
|---------|----|------|--------|
| Automated Playtesting in CCGs using EA: A Case Study in Hearthstone | 2018 | EA による自動プレイテスト・デッキ最適化 | https://dl.acm.org/doi/10.1016/j.knosys.2018.04.030 |
| Evolutionary Deckbuilding in HearthStone | 2016 | デッキ進化の初期研究 | https://www.researchgate.net/publication/304246423_Evolutionary_Deckbuilding_in_HearthStone |
| Evolutionary Approach to CCG Arena Deckbuilding (active genes) | 2020 | active genes による効率的デッキ進化 | https://arxiv.org/pdf/2001.01326 |
| Exploring RL approaches for drafting in CCGs | 2022 | ドラフト（逐次カード選択）への RL | https://www.sciencedirect.com/science/article/abs/pii/S1875952122000490 |
