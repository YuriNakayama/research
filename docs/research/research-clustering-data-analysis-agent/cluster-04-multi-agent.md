# Cluster 4: マルチエージェント協調・トポロジー

## 概要

複数のLLMエージェントがデータ分析タスクで協調する際の通信パターン（トポロジー）と役割分担を扱うクラスタ。2025年のサーベイにより、バス型（全員が共有チャネルで会話）、スター型（中央コーディネーター経由）、リング型（順次伝達）、ツリー/DAG型（階層的指揮命令）の4大通信パラダイムが整理された。データ分析への適用では、AutoKaggle（5エージェント協調）やBioMedAgent（自己進化型マルチエージェント）のように、Reader・Planner・Developer・Reviewer等の役割特化エージェントがパイプラインの各段階を分担するパターンが有効とされている。

## キーワード

`multi-agent system`, `communication topology`, `bus topology`, `star topology`, `ring topology`, `DAG structure`, `role specialization`, `supervisor-critic`, `agent collaboration`, `GoAgent`, `scaling multi-agent`

## 研究戦略

- **推奨検索クエリ**: `"multi-agent LLM collaboration topology survey 2025"`, `"scaling multi-agent system ICLR"`, `"GoAgent group-of-agents communication"`, `"role-based multi-agent data analysis"`
- **主要情報源**: arXiv (cs.MA, cs.AI), ICLR/NeurIPS/AAMAS proceedings
- **注目研究グループ**: Microsoft Research (AutoGen), Tsinghua (communication topologies), Gaoling School of AI
- **推奨読書順序**:
  1. "Multi-Agent Collaboration Mechanisms" (2025) — 4通信パラダイムの全体像
  2. "Scaling LLM-based Multi-Agent Collaboration" (2025, ICLR) — DAG構造の実証
  3. GoAgent (2026) — トークン効率的なグループ化手法
  4. AutoKaggle (2024) — データ分析での5エージェント協調の実装例

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| Multi-Agent Collaboration Mechanisms: A Survey of LLMs | サーベイ | 2025 | バス・スター・リング・ツリーの4通信パラダイムを提案。[arXiv:2501.06322](https://arxiv.org/abs/2501.06322) |
| Scaling LLM-based Multi-Agent Collaboration | 論文 (ICLR) | 2025 | DAG構造でsupervisor-critic/compliant-actorの役割分担。 |
| GoAgent: Group-of-Agents Communication Topology Generation | 論文 | 2026 | グループ化でトークン消費削減+精度維持。[arXiv:2603.19677](https://arxiv.org/abs/2603.19677) |
| AutoKaggle | 論文 | 2024 | Reader/Planner/Developer/Reviewer/Summarizerの5エージェント協調。[arXiv:2410.20424](https://arxiv.org/abs/2410.20424) |
| BioMedAgent: Multi-agent LLM Framework with Self-Evolving Capabilities | 論文 (Nature BME) | 2026 | 自己進化型マルチエージェントのバイオインフォマティクス応用。[Nature](https://www.nature.com/articles/s41551-026-01634-6) |
| LLM/Agent-as-Data-Analyst: A Survey | サーベイ | 2025 | データ分析エージェントにおけるマルチエージェントパターンの整理。[arXiv:2509.23988](https://arxiv.org/abs/2509.23988) |
