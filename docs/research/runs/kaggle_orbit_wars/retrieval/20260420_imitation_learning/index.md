# Retrieval — Orbit Wars / Imitation Learning

- **ドメイン**: kaggle_orbit_wars
- **クラスタ**: imitation_learning
- **生成日**: 2026-04-20
- **入力**: [gather/20260420_imitation_learning/resources-imitation-learning.md](../../gather/20260420_imitation_learning/resources-imitation-learning.md)
- **目的**: Orbit Wars に模倣学習 (IL) を適用するにあたり、過去 Kaggle Simulation コンペで実績ある手法と、IL 基礎理論、データパイプライン、設計案を詳細レポート化する。

## レポート一覧

| # | タイトル | 対応リソース | 焦点 |
|---|---------|--------------|------|
| [01](01-lux-s3-3rd-imitation.md) | Lux AI Season 3 — Imitation Learning 3rd Place Solution | A1 | IL 単独で 3 位入賞した最新事例 |
| [02](02-kore2022-autoregressive-il.md) | Kore 2022 — Autoregressive Transformer IL (khanhvu207) | A2 | 船プランを文字列 autoregressive 生成 |
| [03](03-hungry-geese-bc-mcts.md) | Hungry Geese — BC + MCTS ハイブリッド (Maxwell 3位) | A3, A4 | BC 方策 → MCTS 評価の定石 |
| [04](04-halite-iv-semantic-segmentation-il.md) | Halite IV — Semantic Segmentation IL (Kha Vo) | A5 | 盤面を image として扱う IL |
| [05](05-alphastar-supervised-pretraining.md) | AlphaStar — 97万リプレイでの SL 事前学習 | B2 | SL→MARL League の設計 |
| [06](06-alphago-sl-policy-network.md) | AlphaGo — SL policy network (3000 万手) | B3 | 古典的 IL→RL 設計の原型 |
| [07](07-dagger-dataset-aggregation.md) | DAgger (Ross et al. 2011) — Dataset Aggregation | B1 | covariate shift の理論的解決 |
| [08](08-meta-kaggle-episodes-pipeline.md) | Meta Kaggle Episodes 活用パイプライン | C1–C3 | 上位 bot リプレイ取得の実装手順 |
| [09](09-orbit-wars-il-design-memo.md) | Orbit Wars への適用設計メモ | — | 上記を踏まえた意思決定まとめ |

## まとめ（先読み）

- **Kaggle Simulation における IL は主要戦略の一つ**。Lux S3 3位、Kore 2022 上位、Hungry Geese 上位、Halite IV 上位に IL 採用事例がある。
- **共通パターン**: (1) Meta Kaggle Episodes で LB 上位 bot のリプレイを収集 → (2) 観測/行動対を抽出 → (3) supervised 学習 (CNN / ResNet / Transformer) → (4) 必要に応じて MCTS / RL で refine。
- **Orbit Wars 推奨アプローチ**: `Halite IV 型 semantic segmentation` を Day 1 ベースラインに、`Kore 2022 型 autoregressive` を中期改良として、最終的に `AlphaStar 型 IL→MARL` へ段階拡張するのが最短ルート。
