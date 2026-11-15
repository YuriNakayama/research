# Cluster 6: ベンチマーク・評価手法

## 概要

データ分析エージェントの能力を定量的に測定するためのベンチマーク、データセット、評価フレームワークを扱うクラスタ。2022年のDS-1000（データサイエンスコード生成）を起点に、DA-Code（エージェント型タスク）、DataSciBench（フルワークフロー）、Spider 2.0（エンタープライズText-to-SQL）など、より複雑で実践的なベンチマークが登場している。最先端LLMでも正答率30%前後に留まるタスクが多く、この分野の難しさと成長余地を示している。評価軸は、行動（behavior）、能力（capability）、信頼性（trustworthiness）、安全性（safety）の4次元に体系化されつつある。

## キーワード

`DS-1000`, `DA-Code`, `DataSciBench`, `DSCodeBench`, `Spider 2.0`, `ScienceAgentBench`, `agent evaluation`, `benchmark`, `code generation evaluation`, `text-to-SQL benchmark`

## 研究戦略

- **推奨検索クエリ**: `"data analysis agent benchmark 2025"`, `"LLM code generation evaluation data science"`, `"text-to-SQL benchmark enterprise"`, `"agent evaluation framework survey"`
- **主要情報源**: arXiv, ACL/EMNLP/ICLR/KDD proceedings, Papers With Code (ベンチマークリーダーボード)
- **注目研究グループ**: Yale LILY Lab (Spider), UIUC, Microsoft Research, Google DeepMind
- **推奨読書順序**:
  1. "Evaluation and Benchmarking of LLM Agents" (KDD 2025) — メタサーベイで全体像を把握
  2. DS-1000 → DA-Code → DataSciBench の順で難易度と対象範囲の拡大を追跡
  3. Spider 2.0 — エンタープライズ向けの実践的課題を理解

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| DS-1000 | ベンチマーク | 2022 | 7つのPythonライブラリに渡る1,000のデータサイエンスコード生成問題。[arXiv:2211.11501](https://arxiv.org/abs/2211.11501) |
| DA-Code | ベンチマーク (EMNLP) | 2024 | データラングリング・ML・EDAの500タスク。最良LLMで30.5%の正答率。[arXiv:2410.07331](https://arxiv.org/abs/2410.07331) |
| DataSciBench | ベンチマーク | 2025 | コード生成・実行・結果解釈を含むフルワークフロー評価。[arXiv:2502.13897](https://arxiv.org/abs/2502.13897) |
| DSCodeBench | ベンチマーク | 2025 | GitHubベースの1,000問。10のPythonデータサイエンスライブラリをカバー。[arXiv:2505.15621](https://arxiv.org/abs/2505.15621) |
| Spider 2.0 | ベンチマーク (ICLR 2025 Oral) | 2024 | 632のエンタープライズText-to-SQLワークフロー問題。o1-previewで21.3%。[arXiv:2411.07763](https://arxiv.org/abs/2411.07763) |
| ScienceAgentBench | ベンチマーク (ICLR) | 2025 | 44の査読論文から抽出した102のデータ駆動科学発見タスク。[OpenReview](https://openreview.net/forum?id=6z4YKr0GK6) |
| Evaluation and Benchmarking of LLM Agents: A Survey | サーベイ論文 (KDD) | 2025 | 行動・能力・信頼性・安全性の4軸でエージェント評価を体系化。[arXiv:2507.21504](https://arxiv.org/abs/2507.21504) |
| Survey on Evaluation of LLM-based Agents | サーベイ論文 | 2025 | LLMエージェント評価手法の包括的サーベイ。[arXiv:2503.16416](https://arxiv.org/abs/2503.16416) |
