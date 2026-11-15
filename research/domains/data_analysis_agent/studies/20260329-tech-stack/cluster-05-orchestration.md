# Cluster 5: マルチエージェントオーケストレーション

## 概要

複数のAIエージェントを協調させるオーケストレーション（指揮・統制）パターンを扱うクラスタ。データ分析の各工程（データ収集、前処理、分析、可視化、レポーティング）を専門エージェントに分担させるマルチエージェント設計が注目されている。主要パターンとして、(1) シングルエージェント+ツール群、(2) 会話型マルチエージェント（AutoGen方式）、(3) ロールベースクルー（CrewAI方式）、(4) グラフベースステートフルワークフロー（LangGraph方式）の4つが確立されている。エージェント間通信プロトコルとしてA2A（Agent-to-Agent）やTEAプロトコルが提案されている。

## キーワード

`multi-agent system`, `agent orchestration`, `Agent-to-Agent (A2A)`, `TEA protocol`, `hierarchical agents`, `role-based agents`, `supervisor pattern`, `swarm pattern`, `agent communication`, `workflow graph`, `state management`

## 研究戦略

- **推奨検索クエリ**: `"multi-agent orchestration LLM survey 2025"`, `"agent-to-agent A2A protocol"`, `"LLM agent collaboration pattern"`, `"hierarchical multi-agent data analysis"`
- **主要情報源**: arXiv (cs.MA, cs.AI), AAMAS proceedings, ACM conferences, 企業技術ブログ
- **注目研究グループ/企業**: Microsoft Research (AutoGen), LangChain (LangGraph), Google (A2A Protocol), Deloitte AI Institute
- **推奨読書順序**:
  1. "Orchestration of Multi-Agent Systems" (2025) — アーキテクチャ概観
  2. A2Aプロトコル仕様 — Google提案の通信標準
  3. LangGraphドキュメント — 実装パターン
  4. Deloitte調査レポート — 企業導入の実態

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| Orchestration of Multi-Agent Systems | 論文 | 2025 | マルチエージェントアーキテクチャとA2Aプロトコルの体系的分析。[arXiv:2601.13671](https://arxiv.org/html/2601.13671v1) |
| AgentOrchestra: TEA Protocol | 論文 | 2025 | Tool-Environment-Agent統一インタラクションモデルの提案。[arXiv:2506.12508](https://arxiv.org/abs/2506.12508) |
| Survey of Multi-AI Agent Collaboration | サーベイ論文 | 2025 | マルチAIエージェント協調の包括的サーベイ。[ACM](https://dl.acm.org/doi/full/10.1145/3745238.3745531) |
| Deloitte: AI Agent Orchestration | 調査レポート | 2025 | 550社調査に基づくエージェントオーケストレーションの企業採用実態。[Deloitte](https://www.deloitte.com/us/en/insights/industry/technology/technology-media-and-telecom-predictions/2026/ai-agent-orchestration.html) |
| State of Agent Engineering | 調査レポート | 2025-2026 | 57.3%の組織がエージェントを本番運用中。スケーリング課題を分析。[LangChain](https://www.langchain.com/state-of-agent-engineering) |
| LLM-Based Agents for Tool Learning: A Survey | サーベイ論文 | 2025 | ツール学習エージェントのアーキテクチャ（訓練ベース/訓練不要）を調査。[Springer](https://link.springer.com/article/10.1007/s41019-025-00296-9) |
