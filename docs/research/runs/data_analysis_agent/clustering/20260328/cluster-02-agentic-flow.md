# Cluster 2: Agentic Flow制御パターン

## 概要

データ分析エージェントの行動を制御するフロー（ワークフロー）パターンを扱うクラスタ。ReAct（推論+行動の交互実行）が基盤パターンとして広く採用され、その上にPlan-and-Execute（計画と実行の分離）、Reflexion（自己評価による改善ループ）、Tree-of-Thought（分岐的思考探索）が積層される。2024年にはAFlow（ワークフロー自動生成）やSALA（自己適応型エージェント）が登場し、ワークフロー自体をLLMが設計する「メタワークフロー」研究も始まっている。データ分析特化ではAgenticData（スマートメモリ管理付きReAct）やData Interpreter（階層的グラフモデリング）が注目される。

## キーワード

`ReAct`, `Plan-and-Execute`, `Reflexion`, `Tree-of-Thought`, `self-correction`, `reflection loop`, `agentic flow`, `AFlow`, `workflow generation`, `tool calling`, `function calling`, `code generation loop`, `adaptive planning`

## 研究戦略

- **推奨検索クエリ**: `"ReAct agent pattern data analysis"`, `"plan-and-execute LLM agent"`, `"agentic workflow generation AFlow"`, `"LLM agent reflection self-correction data science"`, `"tool orchestration function calling survey"`
- **主要情報源**: arXiv (cs.AI, cs.CL), ICLR/NeurIPS/ICML proceedings, ACL Anthology
- **注目研究グループ**: Princeton NLP (Reflexion), Google DeepMind (ReAct), Gaoling School of AI (AFlow)
- **推奨読書順序**:
  1. "The Landscape of Emerging AI Agent Architectures" (2024) — パターン全体像
  2. ReAct原論文 + Reflexion原論文 — 基盤パターン理解
  3. "Plan-and-Act" (2025) — 分離パターンの実証
  4. AFlow (2024) — メタワークフロー生成
  5. AgenticData / Data Interpreter — データ分析特化適用

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| The Landscape of Emerging AI Agent Architectures for Reasoning, Planning, and Tool Calling | サーベイ | 2024 | ReAct, Reflexion, Plan-and-Execute等を体系的に分類。[arXiv:2404.11584](https://arxiv.org/abs/2404.11584) |
| AFlow: Automating Agentic Workflow Generation | 論文 | 2024 | エージェントワークフローの自動生成手法。MCTSベースの探索。[arXiv:2410.10762](https://arxiv.org/abs/2410.10762) |
| Plan-and-Act: Improving Planning of Agents for Long-Horizon Tasks | 論文 | 2025 | PlannerとExecutorの分離で長期タスクのReAct超え。[arXiv:2503.09572](https://arxiv.org/abs/2503.09572) |
| SALA: Adaptive-planning, Reasoning, and Acting | 論文 | 2024 | ReAct+Reflexion統合の自己適応型エージェント。[arXiv:2408.06458](https://arxiv.org/abs/2408.06458) |
| AgenticData: Agentic Data Analytics for Heterogeneous Data | 論文 | 2025 | スマートメモリ管理付きReActのデータ分析特化システム。[arXiv:2508.05002](https://arxiv.org/abs/2508.05002) |
| Data Interpreter: An LLM Agent for Data Science | 論文 (ACL Findings) | 2025 | 階層的グラフモデリングで複雑なタスクを動的分解。[arXiv:2402.18679](https://arxiv.org/abs/2402.18679) |
| Agentic AI: Architectures, Taxonomies, and Evaluation | サーベイ | 2026 | ReActを基盤パターンとして位置づけた包括的分類体系。[arXiv:2601.12560](https://arxiv.org/abs/2601.12560) |
| Tool Learning with Large Language Models: A Survey | サーベイ | 2024 | ツール学習4段階（計画・選択・呼出・応答）を分類。[arXiv:2405.17935](https://arxiv.org/abs/2405.17935) |
| ToolACE | 論文 (ICLR) | 2025 | 26,507 APIプールからFunction Callingデータを自動合成。[arXiv:2409.00920](https://arxiv.org/abs/2409.00920) |
| Self-correcting LLMs for Data Science Code Generation | 論文 | 2024 | データサイエンスコード生成におけるSelf-Refineの実証評価。[arXiv:2408.15658](https://arxiv.org/abs/2408.15658) |
| MIRROR: Multi-agent Intra- and Inter-Reflection | 論文 (IJCAI) | 2025 | エージェント内・間の二重リフレクションで推論性能向上。 |
| A Survey on Code Generation with LLM-based Agents | サーベイ | 2025 | コード生成エージェントの全ワークフロー管理能力を体系化。[arXiv:2508.00083](https://arxiv.org/abs/2508.00083) |
