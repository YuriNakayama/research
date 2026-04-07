# Cluster 5: ベンチマーク・評価手法

## 概要

データ分析エージェントの能力を定量的に測定するベンチマーク群とメタ評価手法を扱うクラスタ。2024年のDA-Code（EMNLP）を皮切りに、DataSciBench、DSCodeBench、Spider 2.0（ICLR Oral）、DSBench、LongDA等のベンチマークが急速に整備された。特徴的なのは最先端LLMでも正答率10-34%に留まるタスクが多い点で、データ分析エージェントの実力と理想のギャップを浮き彫りにしている。InsightBenchはEDA特化（質問生成→回答→洞察要約）の評価を初めて体系化し、ScienceAgentBenchは科学的データ分析に特化した評価を提供している。

## キーワード

`DA-Code`, `DataSciBench`, `DSCodeBench`, `DSBench`, `Spider 2.0`, `LongDA`, `InsightBench`, `ScienceAgentBench`, `VisEval`, `agent evaluation`, `code generation benchmark`, `text-to-SQL benchmark`

## 研究戦略

- **推奨検索クエリ**: `"data analysis agent benchmark 2025"`, `"DA-Code DataSciBench evaluation"`, `"Spider 2.0 enterprise text-to-SQL"`, `"InsightBench EDA evaluation"`, `"LLM agent evaluation survey KDD"`
- **主要情報源**: arXiv, EMNLP/ICLR/KDD proceedings, Papers With Code（リーダーボード）
- **注目研究グループ**: Yale LILY Lab (Spider), UIUC, Microsoft Research, NUS
- **推奨読書順序**:
  1. DA-Code (2024, EMNLP) — エージェント型データ分析ベンチマークの先駆け
  2. DataSciBench / DSCodeBench (2025) — フルワークフロー評価
  3. Spider 2.0 (2025, ICLR Oral) — エンタープライズ級の難易度理解
  4. InsightBench (2025, ICLR) — EDA特化の新評価軸
  5. LongDA (2026) — 長文ドキュメント×データ分析の最新

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| DA-Code | ベンチマーク (EMNLP) | 2024 | データラングリング・ML・EDAの500タスク。最良LLMで30.5%。[ACL Anthology](https://aclanthology.org/2024.emnlp-main.748/) |
| DataSciBench | ベンチマーク | 2025 | 自然なプロンプトによるデータサイエンスLLM能力の包括評価。[arXiv:2502.13897](https://arxiv.org/abs/2502.13897) |
| DSCodeBench | ベンチマーク | 2025 | GitHub由来1,000問。10種のPythonデータサイエンスライブラリ対象。[arXiv:2505.15621](https://arxiv.org/abs/2505.15621) |
| Spider 2.0 | ベンチマーク (ICLR Oral) | 2025 | 632のエンタープライズText-to-SQLワークフロー。GPT-4o成功率10.1%。[arXiv:2411.07763](https://arxiv.org/abs/2411.07763) |
| DSBench | ベンチマーク (ICLR) | 2025 | Kaggle由来540タスク。最高解決率34.12%。[arXiv:2409.07703](https://arxiv.org/abs/2409.07703) |
| InsightBench | ベンチマーク (ICLR) | 2025 | EDA質問生成→回答→洞察要約の初の評価体系。[arXiv:2407.06423](https://arxiv.org/abs/2407.06423) |
| ScienceAgentBench | ベンチマーク (ICLR) | 2025 | 科学的データ分析102タスク。最高32.4%。[arXiv:2410.05080](https://arxiv.org/abs/2410.05080) |
| LongDA | ベンチマーク | 2026 | 長文ドキュメント読解を伴うデータ分析505クエリ。[arXiv:2601.02598](https://arxiv.org/abs/2601.02598) |
| VisEval | ベンチマーク | 2024 | LLM時代の可視化ベンチマーク（146 DB、2,524クエリ）。[ACM](https://dl.acm.org/doi/10.1109/TVCG.2024.3456320) |
