# マルチエージェント協調 & ワークフロー自動化 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2022 – 2026
- **収集日**: 2026-04-05
- **入力元**: clustering結果（cluster-03-multi-agent-workflow.md）

## 収集サマリ

| 領域 | 論文 | 特許 | 技術情報 | 事例 | 合計 |
|------|------|------|----------|------|------|
| マルチエージェント協調 & ワークフロー自動化 | 22 | — | — | — | 22 |
| **合計** | **22** | **—** | **—** | **—** | **22** |

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 30 |
| 検証済み | 22 |
| 不一致で除外 | 1 |
| 重複除外 | 7 |

※以下のテーブルには検証済みエントリのみを掲載。すべてのURLはWebFetchで確認済み。

## 全体の傾向

2024〜2025年にかけてLLMベースのマルチエージェントシステムの研究が急増しており、特にデータ分析パイプラインの自動化が注目されている。AutoGenを基盤としたフレームワークが多く、役割特化（Programmer/Inspector、Generator/Critic等）による協調パターンが主流。サーベイ論文も複数発表されており、分野としての成熟が進んでいる。エンタープライズ応用（金融、犯罪データ分析等）への展開や、動的なオーケストレーション・ワークフロー自動生成といった次世代アプローチも登場している。

---

## 学術論文

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 1 | サーベイ | [Multi-Agent Collaboration Mechanisms: A Survey of LLMs](https://arxiv.org/abs/2501.06322) | Khanh-Tung Tran et al. | 2025 | arXiv (cs.AI) | LLMベースのマルチエージェント協調メカニズムを包括的に調査。通信構造、フィードバック、タスク分解手法を体系的に分類。 |
| 2 | サーベイ | [Large Language Model based Multi-Agents: A Survey of Progress and Challenges](https://arxiv.org/abs/2402.01680) | Taicheng Guo et al. | 2024 | arXiv (cs.CL) | LLMベースのマルチエージェントシステムの進展と課題を網羅。協調・競争パラダイムを含む様々な応用領域を詳細にレビュー。 |
| 3 | サーベイ | [LLM Multi-Agent Systems: Challenges and Open Problems](https://arxiv.org/abs/2402.03578) | Shanshan Han et al. | 2024 | arXiv (cs.MA) | LLMマルチエージェントシステムにおけるメモリ管理、情報検索、スケーラビリティなどの課題と未解決問題を体系的に整理。 |
| 4 | サーベイ | [A Survey on LLM-based Multi-Agent System: Recent Advances and New Frontiers in Application](https://arxiv.org/abs/2412.17481) | Shuaihang Chen et al. | 2024 | arXiv (cs.CL) | LLMベースMASのアプリケーションに焦点を当てたサーベイ。オープンソースフレームワーク、ベンチマーク、データセットを分析。 |
| 5 | サーベイ | [A Survey on Large Language Model-based Agents for Statistics and Data Science](https://arxiv.org/abs/2412.14222) | Maojun Sun et al. | 2025 | The American Statistician | 統計・データサイエンス向けLLMエージェントの包括的サーベイ。計画・推論・マルチエージェント協調・知識統合を体系的に整理。 |
| 6 | サーベイ | [LLM-Based Data Science Agents: A Survey of Capabilities, Challenges, and Future Directions](https://arxiv.org/abs/2510.04023) | Mizanur Rahman et al. | 2025 | arXiv (cs.AI) | データサイエンス分野におけるLLMベースエージェントの能力・課題・将来方向を包括的に調査。 |
| 7 | サーベイ | [LLM-Based Multi-Agent Systems for Software Engineering: Literature Review, Vision and the Road Ahead](https://arxiv.org/abs/2404.04834) | Junda He et al. | 2024 | ACM TOSEM | ソフトウェア工学におけるLLMベースMASの文献レビュー。CEO/CTO/プログラマー等の役割特化による協調を体系的に分析。 |
| 8 | フレームワーク | [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155) | Qingyun Wu et al. | 2023 | arXiv (cs.AI) | AutoGenフレームワークの原著論文。会話可能なエージェントによりLLM・人間・ツールを組み合わせたマルチエージェントワークフロー構築を可能にする。 |
| 9 | フレームワーク | [AutoGen Studio: A No-Code Developer Tool for Building and Debugging Multi-Agent Systems](https://arxiv.org/abs/2408.15247) | Victor Dibia et al. | 2024 | arXiv (cs.SE) | AutoGen上に構築されたノーコード開発ツール。マルチエージェントワークフローの迅速なプロトタイピング・デバッグ・評価を実現。 |
| 10 | フレームワーク | [Exploration of LLM Multi-Agent Application Implementation Based on LangGraph+CrewAI](https://arxiv.org/abs/2411.18241) | Zhihua Duan, Jialin Wang | 2024 | arXiv (cs.MA) | LangGraphとCrewAIを統合したマルチエージェント実装を探求。グラフ構造による柔軟なワークフロー設計と管理を提示。 |
| 11 | フレームワーク | [Flow: Modularized Agentic Workflow Automation](https://arxiv.org/abs/2501.07834) | Boye Niu et al. | 2025 | arXiv | モジュール化されたエージェントワークフロー自動化フレームワーク。複雑なタスクをサブプロセスに分解し専門エージェントが担当する構造を提案。 |
| 12 | オーケストレーション | [Multi-Agent Collaboration via Evolving Orchestration](https://arxiv.org/abs/2505.19591) | Yufan Dang et al. | 2025 | NeurIPS 2025 | 強化学習により動的にエージェント実行順序を決定する「パペティア型」協調パラダイムを提案。 |
| 13 | オーケストレーション | [A Dynamic LLM-Powered Agent Network for Task-Oriented Agent Collaboration](https://arxiv.org/abs/2310.02170) | Zijun Liu et al. | 2024 | COLM 2024 | タスク指向の動的LLMエージェントネットワーク。タスクに応じて協調構造を適応的に変化させるフレームワーク。 |
| 14 | オーケストレーション | [Adaptive Multi-Agent Reasoning via Automated Workflow Generation](https://arxiv.org/abs/2507.14393) | Humza Sami et al. | 2025 | arXiv (cs.AI) | 自動ワークフロー生成による適応的マルチエージェント推論。タスク性質に応じた動的ワークフロー構築と協調戦略の自動最適化。 |
| 15 | データ分析応用 | [Can Large Language Models Serve as Data Analysts? A Multi-Agent Assisted Approach for Qualitative Data Analysis](https://arxiv.org/abs/2402.01386) | Zeeshan Rasheed et al. | 2024 | arXiv (cs.SE) | 27のLLMエージェントを配備し定性データ分析の各タスク（要約・コード生成・テーマ抽出等）を自動化するシステムを提案。 |
| 16 | データ分析応用 | [LAMBDA: A Large Model Based Data Agent](https://arxiv.org/abs/2407.17535) | Maojun Sun et al. | 2025 | J. American Statistical Association | ProgrammerとInspectorの2エージェント協調によるコード不要のマルチエージェントデータ分析システム。 |
| 17 | データ分析応用 | [AutoML-Agent: A Multi-Agent LLM Framework for Full-Pipeline AutoML](https://arxiv.org/abs/2410.02958) | Patara Trirat et al. | 2025 | ICML 2025 | ML パイプライン全体を自動化するマルチエージェントフレームワーク。データ収集からモデル構築まで各段階に特化したエージェントが連携。 |
| 18 | データ分析応用 | [Data-to-Dashboard: Multi-Agent LLM Framework for Insightful Visualization in Enterprise Analytics](https://arxiv.org/abs/2505.23695) | Ran Zhang, Mohannad Elhamod | 2025 | arXiv (cs.AI) | 企業分析向けデータからダッシュボードへの自動パイプライン。ドメイン検出・概念抽出・反復的自己省察を行うモジュラーエージェント群。 |
| 19 | データ分析応用 | [Insight Agents: An LLM-Based Multi-Agent System for Data Insights](https://arxiv.org/abs/2601.20048) | Jincheng Bai et al. | 2026 | SIGIR 2025 | 自動情報検索を通じてパーソナライズされたデータ・ビジネスインサイトを提供するLLMベースのマルチエージェント会話型アシスタント。 |
| 20 | データ分析応用 | [AutoGen Driven Multi Agent Framework for Iterative Crime Data Analysis and Prediction](https://arxiv.org/abs/2506.11475) | Syeda Kisaa Fatima et al. | 2025 | arXiv (cs.MA) | AutoGenベースの複数エージェントが協調して犯罪データを反復的に分析・予測するフレームワーク（LUCID-MA）。 |
| 21 | エンタープライズ | [LLM and Agent-Driven Data Analysis: A Systematic Approach for Enterprise Applications and System-level Deployment](https://arxiv.org/abs/2511.17676) | Xi Wang et al. | 2025 | arXiv (cs.DB) | エンタープライズデータ分析のためのLLM・エージェント駆動型システムの体系的アプローチ。セキュリティ検証・計算効率を含む。 |
| 22 | エンタープライズ | [Towards Effective GenAI Multi-Agent Collaboration: Design and Evaluation for Enterprise Applications](https://arxiv.org/abs/2412.05449) | Raphael Shu et al. | 2024 | arXiv (cs.CL) | エンタープライズ向けGenAIマルチエージェント協調の設計と評価。タスク分解とエージェント専門化のアプローチを分析。 |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査できます
- **追加の領域マッピング**: research-clustering スキルで関連領域をさらに探索できます
