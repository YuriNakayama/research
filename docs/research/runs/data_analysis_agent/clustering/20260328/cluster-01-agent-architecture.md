# Cluster 1: エージェントアーキテクチャ・自律レベル

## 概要

LLMベースデータ分析エージェントの設計原則、タクソノミー（分類体系）、自律レベルの定義を扱うクラスタ。2025年の複数のサーベイ論文により、データ分析エージェントはセマンティック認識設計、自律パイプライン構築、ツール拡張ワークフロー、オープンワールドタスク対応という設計目標で体系化された。SIGMOD 2026チュートリアルではL1（ツール補助）からL5（完全自律）までの自律レベルが提案され、現在の技術はL3（人間監督下での自律パイプライン構成・実行）に到達している。

## キーワード

`data analysis agent`, `agent architecture`, `autonomy level`, `LLM-based agent`, `semantic-aware design`, `autonomous pipeline`, `tool-augmented workflow`, `open-world task`, `agent lifecycle`, `data science agent`, `structured data agent`, `tabular data LLM`

## 研究戦略

- **推奨検索クエリ**: `"data analysis agent architecture survey 2025"`, `"data agent autonomy level"`, `"LLM agent data science taxonomy"`, `"tabular data LLM survey"`
- **主要情報源**: arXiv (cs.AI, cs.DB), SIGMOD/VLDB/KDD proceedings, Taylor & Francis (The American Statistician)
- **注目研究グループ**: UIUC (ChengXiang Zhai), NUS (Yongfeng Zhang), Tsinghua, Microsoft Research Asia
- **サーベイ論文からの推奨読書順序**:
  1. "The Landscape of Emerging AI Agent Architectures" (2024) — 基礎パターン理解
  2. "LLM/Agent-as-Data-Analyst" (2025) — データ分析特化タクソノミー
  3. "Data Agents: Levels, State of the Art" (SIGMOD 2026) — 自律レベル定義と最新動向

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| LLM/Agent-as-Data-Analyst: A Survey | サーベイ | 2025 | 5つの設計目標でデータ分析エージェントを体系化。[arXiv:2509.23988](https://arxiv.org/abs/2509.23988) |
| A Survey on LLM-based Agents for Statistics and Data Science | サーベイ | 2025 | 統計・データサイエンス向けLLMエージェントの進化と応用。[Taylor & Francis](https://www.tandfonline.com/doi/full/10.1080/00031305.2025.2561140) |
| Large Language Model-based Data Science Agent: A Survey | サーベイ | 2025 | ロール・実行・知識・振り返りの4次元設計原則。[arXiv:2508.02744](https://arxiv.org/abs/2508.02744) |
| A Survey of Data Agents: Emerging Paradigm or Overstated Hype? | サーベイ | 2025 | データエージェントの実態と課題を批判的に検証。[arXiv:2510.23587](https://arxiv.org/html/2510.23587) |
| Data Agents: Levels, State of the Art, and Open Problems | チュートリアル (SIGMOD 2026) | 2026 | L1-L5の自律レベルを定義。現状はL3段階。[PDF](https://luoyuyu.vip/files/SIGMOD26-Tutorial-DataAgents.pdf) |
| Large Language Models on Tabular Data -- A Survey | サーベイ | 2024 | 表形式データに対するLLMの予測・生成・理解能力を体系的に調査。[arXiv:2402.17944](https://arxiv.org/abs/2402.17944) |
| Large Language Model for Table Processing: A Survey | サーベイ | 2024 | テーブルQA・事実検証等におけるLLM活用を調査。[arXiv:2402.05121](https://arxiv.org/abs/2402.05121) |
| DeepAnalyze: Agentic LLMs for Autonomous Data Science | 論文 | 2025 | 初の自律データサイエンス特化型エージェントLLM。[arXiv:2510.16872](https://arxiv.org/abs/2510.16872) |
