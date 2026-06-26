# Cluster 4: 状態・行動表現と評価関数

**Overview**:
探索系・学習系のどちらを採るにせよ土台となる、**ゲーム状態と行動の表現、カードの埋め込み、盤面評価関数** の設計領域。約2,000枚の可変カードプールを汎化的に扱う必要があるため、カードのテキスト/効果から汎用表現を学ぶ「generalised card representation」が重要。合法手リストのインデックス表現、盤面（バトル場/ベンチ/トラッシュ/サイド/手札）のエンコード、解説記事が強調する「盤面優劣を正しく定量化する評価関数」の精度がエージェントの強さに直結する。

**Keywords**:
`generalised card representation`, `card embedding`, `state encoding`, `action space representation`, `legal action masking`, `board state evaluation function`, `feature engineering`, `evolving evaluation functions`, `parameterized action space`, `set-based encoding`, `opponent modeling features`, `value network`, `heuristic scoring`

**Research Strategy**:
- 「Learning With Generalised Card Representations for MTG」を精読し、未知カード・大規模プールへの汎化手法を把握（**2,000枚プール対策の本命**）。
- 「Evolving Evaluation Functions for CCG AI」で評価関数の自動進化を学び、C5 の進化計算と接続。
- 合法手 index を返す I/F に合わせ、action masking／parameterized action space（既存 `kaggle_orbit_wars` retrieval にも知見あり）の設計を流用。
- 盤面エンコードは、可変長のベンチ・手札を扱う set-based / permutation-invariant 表現を検討。

**Seed Resources**:
| タイトル | 年 | 概要 | リンク |
|---------|----|------|--------|
| Learning With Generalised Card Representations for "Magic: The Gathering" | 2024 | 大規模・未知カードへ汎化する表現学習 | https://arxiv.org/html/2407.05879v1 |
| Evolving Evaluation Functions for Collectible Card Game AI | 2021 | 評価関数の自動進化 | https://arxiv.org/pdf/2105.01115 |
| 既存 retrieval: parameterized-action-space（kaggle_orbit_wars） | — | パラメータ化行動空間設計（内部知見） | docs/research/runs/kaggle_orbit_wars/retrieval/20260502_imitation_learning/05-parameterized-action-space.md |
