# Cluster 1: データ分析エージェントアーキテクチャ設計論

## 概要

LLMをコアとするデータ分析エージェントの設計原則とアーキテクチャパターンを扱うクラスタ。2023年のReAct・Toolformerに始まり、2024-2025年にかけて計画（Planning）、振り返り（Reflection）、ツール利用（Tool Use）、知識統合（Knowledge Integration）の4つの主要モジュールが体系化された。データ分析特有の課題として、セマンティック認識設計（データの意味理解）、自律パイプライン構築、オープンワールドタスクへの対応が重要視されている。

## キーワード

`LLM-based agent`, `data analysis agent`, `tool use`, `planning`, `reflection`, `code generation`, `ReAct`, `chain-of-thought`, `task decomposition`, `semantic-aware design`, `autonomous pipeline`, `agent lifecycle`

## 研究戦略

- **推奨検索クエリ**: `"LLM data analysis agent architecture"`, `"data science agent design pattern"`, `"LLM agent planning reflection survey"`
- **主要情報源**: arXiv (cs.AI, cs.CL), ACL Anthology, AAAI/NeurIPS/ICML proceedings
- **注目研究グループ**: UIUC (ChengXiang Zhai group), Tsinghua NLP, Microsoft Research
- **サーベイ論文からの推奨読書順序**:
  1. Wang et al. (2023) "A Survey on LLM-based Autonomous Agents" — 基礎フレームワーク
  2. Sun et al. (2024) "LLM-based Agents for Statistics and Data Science" — データ分析特化
  3. Tang et al. (2025) "LLM/Agent-as-Data-Analyst" — 最新タクソノミー

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| A Survey on LLM-based Autonomous Agents | サーベイ論文 | 2023 | 計画・メモリ・ツール利用の統一フレームワークを提案。[arXiv:2308.11432](https://arxiv.org/abs/2308.11432) |
| LLM/Agent-as-Data-Analyst: A Survey | サーベイ論文 | 2025 | データ分析エージェントの4設計目標を体系化。45システムを分析。[arXiv:2509.23988](https://arxiv.org/abs/2509.23988) |
| LLM-based Data Science Agents: Capabilities, Challenges, and Future Directions | サーベイ論文 | 2025 | ライフサイクル準拠タクソノミーで6段階をカバー。[arXiv:2510.04023](https://arxiv.org/abs/2510.04023) |
| Large Language Model-based Data Science Agent: A Survey | サーベイ論文 | 2025 | ロール・実行・知識・振り返りの4次元設計。[arXiv:2508.02744](https://arxiv.org/abs/2508.02744) |
| A Review of Prominent Paradigms for LLM-Based Agents: Tool Use, Planning, and Feedback Learning | 論文 (COLING 2025) | 2024 | ツール利用・計画・フィードバック学習を統合分類。[ACL Anthology](https://aclanthology.org/2025.coling-main.652/) |
| Understanding the Planning of LLM Agents: A Survey | サーベイ論文 | 2024 | LLMエージェント計画の初の体系的サーベイ。[arXiv:2402.02716](https://arxiv.org/abs/2402.02716) |
