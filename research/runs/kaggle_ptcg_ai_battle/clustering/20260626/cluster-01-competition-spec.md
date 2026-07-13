# Cluster 1: コンペ仕様・cabt Engine・提出最適化

**Overview**:
本コンペ固有の制約とインフラを正確に理解し、提出物を最適化するための領域。`agent(obs_dict) -> list[int]` という I/F、1プレイヤー最大10分（時間切れ即敗北）、`submission.tar.gz`（`main.py` + `deck.csv` + `cg/`）という提出形式、ガウス分布ベースのレーティングによる自動対戦ラダー、cabt Engine（東大松尾研開発）の挙動などを把握する。**全クラスタの設計制約を与える基盤** であり、すでに `retrieval/20260626_competition_spec/` で一次調査済み。

**Keywords**:
`cabt Engine`, `kaggle-environments 1.30.1`, `obs_dict`, `legal moves index`, `deck.csv`, `submission.tar.gz`, `SelectContext scoring`, `Gaussian rating system`, `10-minute time budget`, `Simulation Division`, `Strategy Division`, `meta deck evaluation`

**Research Strategy**:
- 公式スターターノートブック（Kaggle Code タブ）で `obs_dict` の実キー構造・action space を確定する（→ retrieval の未確定事項を埋める）。
- `cabt_eval.py` でローカルに meta デッキと対戦させ、評価の再現性を確認。
- レーティングの収束特性（提出本数・対戦数）を踏まえ、提出戦略（複数 bot のうち最上位のみ採用される点）を設計。
- 既存の `kaggle_orbit_wars` ドメイン（同種の Kaggle ゲーム AI コンペ）の提出 I/F・タイミング管理の知見を流用。

**Seed Resources**:
| タイトル | 種別 | 概要 |
|---------|------|------|
| 既存 retrieval: competition_spec | 内部調査 | 公式仕様・ルール・I/F・未確定事項チェックリスト |
| `wmh/ptcg-abc`（GitHub） | 実装 | 提出形式・`cabt_eval.py`・web sandbox を含むコミュニティ実装 |
| `kiyotah/a-sample-rule-based-agent-dragapult-ex-deck` | Kaggle Code | 公式系サンプル（ルールベース） |
