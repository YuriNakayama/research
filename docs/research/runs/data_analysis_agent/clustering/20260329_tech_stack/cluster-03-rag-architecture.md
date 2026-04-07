# Cluster 3: RAG基盤アーキテクチャ

## 概要

Retrieval-Augmented Generation（RAG）のアーキテクチャ進化を扱うクラスタ。初期のNaive RAGから、Advanced RAG（前処理・後処理最適化）、Modular RAG（コンポーネント分離）を経て、2025年にはAgentic RAG（エージェントが検索戦略を自律的に決定）が主流となった。データ分析エージェントにおいてRAGは、ドメイン知識の検索、SQLスキーマの参照、過去の分析結果の再利用といった役割を担う。ベクトルDB選択、チャンキング戦略、エンベディングモデルの組み合わせ最適化が実用上の重要課題である。

## キーワード

`Retrieval-Augmented Generation`, `Agentic RAG`, `Naive RAG`, `Advanced RAG`, `Modular RAG`, `vector database`, `embedding model`, `chunking strategy`, `hybrid search`, `reranking`, `query transformation`, `knowledge graph RAG`, `context window management`

## 研究戦略

- **推奨検索クエリ**: `"agentic RAG architecture survey"`, `"RAG optimization chunking embedding"`, `"vector database comparison RAG 2025"`, `"knowledge graph RAG integration"`
- **主要情報源**: arXiv (cs.IR, cs.CL), ACM SIGIR, EMNLP, 各ベクトルDBドキュメント（Pinecone, Weaviate, Qdrant, ChromaDB）
- **注目研究グループ/企業**: RAGFlow (InfiniFlow), LlamaIndex, Pinecone Research, Weaviate
- **推奨読書順序**:
  1. "Agentic RAG: A Survey" (2025) — Agentic RAGの全体像
  2. "Engineering the RAG Stack" (2026) — エンタープライズ向けアーキテクチャ
  3. "RAG-Stack: Co-Optimizing Quality and Performance" — 最適化手法

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| Agentic Retrieval-Augmented Generation: A Survey | サーベイ論文 | 2025 | シングル/マルチエージェントRAGの包括的タクソノミー。[arXiv:2501.09136](https://arxiv.org/abs/2501.09136) |
| Towards Agentic RAG with Deep Reasoning | 論文 | 2025 | 深い推論能力とRAGの統合を調査。[arXiv:2507.09477](https://arxiv.org/abs/2507.09477) |
| A Survey on Reasoning Agentic RAG | 論文 (ACL Findings) | 2025 | 推論強化型Agentic RAGの査読付きサーベイ。[ACL Anthology](https://aclanthology.org/2025.findings-ijcnlp.122.pdf) |
| Engineering the RAG Stack | 論文 | 2026 | RAGアーキテクチャ全体と信頼性フレームワークのレビュー。[arXiv:2601.05264](https://arxiv.org/html/2601.05264v1) |
| A Systematic Review of Key RAG Systems | サーベイ論文 | 2025 | 2018-2025年のRAGシステムを体系的にレビュー。[arXiv:2507.18910](https://arxiv.org/html/2507.18910v1) |
| RAG-Stack: Co-Optimizing RAG Quality and Performance | 論文 | 2025 | KVキャッシュ再利用と投機的検索による最適化。[arXiv:2510.20296](https://arxiv.org/abs/2510.20296) |
| LLM Selection and Vector Database Tuning for RAG | 論文 | 2025 | チャンクサイズ・エンベディングモデル・LLMの組み合わせ効果を分析。[MDPI](https://www.mdpi.com/2076-3417/15/20/10886) |
| From RAG to Context - A 2025 Year-End Review | 技術記事 | 2025 | RAGからコンテキストエンジニアリングへの進化を総括。[RAGFlow](https://ragflow.io/blog/rag-review-2025-from-rag-to-context) |
