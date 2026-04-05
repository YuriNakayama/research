# Cluster 2: Pythonエージェントフレームワーク・ライブラリ

## 概要

データ分析エージェントを構築するためのPythonフレームワークとライブラリを扱うクラスタ。2024-2026年にかけて主要テック企業がそれぞれフレームワークをリリースし、エコシステムが急速に拡大した。汎用エージェントフレームワーク（LangGraph, CrewAI, AutoGen等）とデータ分析特化ライブラリ（PandasAI, Vanna等）の2層構造が形成されている。MCP（Model Context Protocol）がツール統合の業界標準として急速に普及し、フレームワーク選定の重要な判断基準となっている。

## キーワード

`LangGraph`, `LangChain`, `CrewAI`, `AutoGen`, `Smolagents`, `OpenAI Agents SDK`, `Anthropic Agent SDK`, `Google ADK`, `PandasAI`, `Vanna`, `Model Context Protocol (MCP)`, `PydanticAI`, `Semantic Kernel`, `tool integration`, `agent SDK`

## 研究戦略

- **推奨検索クエリ**: `"AI agent framework comparison 2026"`, `"LangGraph vs CrewAI benchmark"`, `"PandasAI Vanna data analysis LLM"`, `"Model Context Protocol survey"`
- **主要情報源**: GitHub repositories（Stars数・アクティビティ）、各フレームワーク公式ドキュメント、技術ブログ（LangChain Blog, Hugging Face Blog）、ACM/IEEE論文
- **注目企業・組織**: LangChain Inc., Anthropic, OpenAI, Microsoft, Google DeepMind, Hugging Face
- **推奨読書順序**:
  1. 各フレームワークの公式ドキュメント・Getting Started
  2. DataCamp/Medium等の比較記事でアーキテクチャの違いを把握
  3. MCP仕様書とACM TOSEM論文で標準化動向を理解

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| LangGraph Documentation | フレームワーク | 2024-ongoing | グラフベースの状態管理で複雑なワークフローを構築。最も本番運用実績が多い。[langchain-ai/langgraph](https://github.com/langchain-ai/langgraph) |
| CrewAI | フレームワーク | 2024-ongoing | ロールベースのマルチエージェントフレームワーク。迅速なプロトタイピングに最適。[crewAI-inc/crewAI](https://github.com/crewAI-inc/crewAI) |
| AutoGen (Microsoft) | フレームワーク | 2023-ongoing | 会話型マルチエージェントパターンに強み。2026年時点でメンテナンスモードに移行。[microsoft/autogen](https://github.com/microsoft/autogen) |
| Smolagents (Hugging Face) | フレームワーク | 2025 | 約1,000行のミニマルなエージェントライブラリ。透明性と可読性を重視。[huggingface/smolagents](https://github.com/huggingface/smolagents) |
| PandasAI | ライブラリ | 2023-ongoing | 自然言語でDataFrame/CSV/DBにクエリ可能。100+のLLMプロバイダ対応。[sinaptik-ai/pandas-ai](https://github.com/sinaptik-ai/pandas-ai) |
| Vanna AI | ライブラリ | 2023-ongoing | RAGベースのText-to-SQL生成。PostgreSQL/MySQL/Snowflake等に対応。[vanna-ai/vanna](https://github.com/vanna-ai/vanna) |
| MCP: Landscape, Security Threats, Future Directions | 論文 (ACM TOSEM) | 2025 | MCPのセキュリティ脅威と将来方向を体系的に分析。[ACM](https://dl.acm.org/doi/10.1145/3796519) |
| CrewAI vs LangGraph vs AutoGen | 比較記事 | 2025 | トークン消費・実行時間ベンチマークを含む実践的比較。[DataCamp](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen) |
