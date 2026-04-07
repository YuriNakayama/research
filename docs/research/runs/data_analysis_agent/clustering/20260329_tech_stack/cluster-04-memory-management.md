# Cluster 4: エージェントメモリ管理システム

## 概要

AIエージェントにおけるメモリ（記憶）の管理手法を扱うクラスタ。人間の認知科学に着想を得た階層的メモリモデルが主流で、短期メモリ（コンテキストウィンドウ）、長期メモリ（外部ストレージ）、作業メモリ（タスク実行中の一時的状態）の3層構造が基本パターンとなっている。2024-2025年にかけて、MemGPT/Letta（OS的メモリページング）、Mem0（ベクトル+ナレッジグラフ）、Zep/Graphiti（時系列ナレッジグラフ）、Observational Memory（観察ログベース）など多様なアプローチが提案された。メモリの統合（consolidation）、忘却（forgetting）、検索最適化が主要な研究課題である。

## キーワード

`agent memory`, `short-term memory`, `long-term memory`, `working memory`, `episodic memory`, `semantic memory`, `memory consolidation`, `memory retrieval`, `MemGPT`, `Letta`, `Mem0`, `Zep`, `Graphiti`, `observational memory`

## 研究戦略

- **推奨検索クエリ**: `"AI agent memory management survey"`, `"MemGPT Letta memory architecture"`, `"Mem0 vs Zep agent memory comparison"`, `"agent memory consolidation forgetting"`
- **主要情報源**: arXiv (cs.AI, cs.CL), NeurIPS/ICLR/ICML workshops, GitHub repositories（Letta, Mem0, Zep）
- **注目研究グループ/企業**: Letta (旧MemGPT), Mem0 Inc., Zep AI, UC Berkeley (Charles Packer group), MemTensor (MemOS)
- **推奨読書順序**:
  1. "Memory in the Age of AI Agents" (2025) — メモリタクソノミーの全体像
  2. MemGPT論文 (2023) + Letta Documentation — OS的メモリ管理の原点
  3. Mem0 vs Zep比較記事 — 実装レベルの選択肢理解
  4. MemOS論文 (2025) — OS抽象化の最新アプローチ

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| Memory in the Age of AI Agents: A Survey | サーベイ論文 | 2025 | 事実的・経験的・作業メモリの分類と統合パイプラインを定義。[arXiv:2512.13564](https://arxiv.org/abs/2512.13564) |
| A Survey on the Memory Mechanism of LLM-based Agents | サーベイ論文 | 2025 | メモリ形成・進化・検索のダイナミクスを体系的に分析。[ACM](https://dl.acm.org/doi/10.1145/3748302) |
| MemGPT: Towards LLMs as Operating Systems | 論文 | 2023 | コンテキストウィンドウを仮想メモリとしてページング管理する先駆的手法。[letta-ai/letta](https://github.com/letta-ai/letta) |
| Memory OS of AI Agent (MemOS) | 論文 | 2025 | OS的メモリ管理をRL統合・マルチモーダルに拡張。[arXiv:2506.06326](https://arxiv.org/pdf/2506.06326) |
| Benchmarking AI Agent Memory | 技術記事 | 2025 | ファイルシステムベース vs MemGPT方式のベンチマーク。[Letta Blog](https://www.letta.com/blog/benchmarking-ai-agent-memory) |
| Mem0 | フレームワーク | 2024-ongoing | ベクトルストア+ナレッジグラフのデュアルアーキテクチャ。パーソナライゼーションに強み。~48K GitHub Stars。[mem0ai/mem0](https://github.com/mem0ai/mem0) |
| Zep / Graphiti | フレームワーク | 2024-ongoing | 時系列ナレッジグラフによるメモリ管理。LongMemEvalでMem0を上回る（63.8% vs 49.0%）。[getzep/graphiti](https://github.com/getzep/graphiti) |
| Observational Memory (VentureBeat報道) | 手法 | 2025 | Observer/Reflectorエージェントが会話を圧縮。コスト10x削減を実現。[VentureBeat](https://venturebeat.com/data/observational-memory-cuts-ai-agent-costs-10x-and-outscores-rag-on-long) |
| ICLR 2026 Workshop: MemAgents | ワークショップ | 2025-2026 | エージェントメモリアーキテクチャのベンチマーク・統合パイプラインを議論。[OpenReview](https://openreview.net/pdf?id=U51WxL382H) |
