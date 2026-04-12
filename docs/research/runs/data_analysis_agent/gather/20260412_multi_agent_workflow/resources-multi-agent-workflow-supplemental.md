# マルチエージェント協調 & ワークフロー自動化 — 追加リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2024 – 2026
- **収集日**: 2026-04-12
- **入力元**: ユーザーキーワード（OpenAI Swarm, Claude Agent SDK, A2A Protocol, Google ADK, multi-agent data analysis frameworks, agent orchestration patterns, multi-agent benchmarks）
- **既存 gather との関係**: 2026-03-30 の gather（22件）を補完する追加収集

## 収集サマリ

| 領域 | 論文 | 特許 | 技術情報 | 事例 | 合計 |
|------|------|------|----------|------|------|
| エージェント間プロトコル・インフラ | 5 | — | — | — | 5 |
| データ分析特化フレームワーク | 7 | — | — | — | 7 |
| DS パイプライン自動化 | 3 | — | — | — | 3 |
| ベンチマーク・評価 | 2 | — | — | — | 2 |
| 汎用オーケストレーション | 3 | — | — | — | 3 |
| ドメイン特化応用 | 2 | — | — | — | 2 |
| **合計** | **22** | **—** | **—** | **—** | **22** |

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 26 |
| 検証済み | 22 |
| 重複除外（バッチ間） | 2 |
| 既存 gather との重複除外 | 2 |

※以下のテーブルには検証済みエントリのみを掲載。すべてのURLはWebFetchで確認済み。

## 全体の傾向

2025-2026年のマルチエージェント×データ分析研究は3つの大きな潮流を示している。(1) **エージェント間プロトコルの標準化**が急速に進展しており、MCP/ACP/A2A/ANPなどの相互運用プロトコルの比較研究やDNSインスパイアのディスカバリシステムが登場している。(2) **データ分析特化フレームワーク**が成熟期に入り、モノリシックプロンプトからモジュラーワークフローへの転換（DataPuzzle）、外部知識検索と多役割討論の統合（DataSage）、科学的原則に基づく信頼性担保（VDSAgents）など、実用的な設計パターンが確立されつつある。(3) **ベンチマークの高度化**が進み、単純なタスク完了率からdata-to-insightパイプライン全体の評価（KramaBench）やインサイト品質の専門家評価（InsightEval）へと発展している。

---

## 学術論文

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 1 | プロトコル | [A Survey of Agent Interoperability Protocols: MCP, ACP, A2A, and ANP](https://arxiv.org/abs/2505.02279) | Abul Ehtesham et al. | 2025 | arXiv (cs.MA) | MCP・ACP・A2A・ANPの4主要エージェント間プロトコルを比較分析し、段階的な導入ロードマップを提案するサーベイ。 |
| 2 | プロトコル | [AgentOrchestra: Orchestrating Multi-Agent Intelligence with the TEA Protocol](https://arxiv.org/abs/2506.12508) | Wentao Zhang et al. | 2025 | arXiv (cs.AI) | Tool-Environment-Agent (TEA) プロトコルにより環境・エージェント・ツールを統一的に扱う階層的マルチエージェントフレームワーク。 |
| 3 | プロトコル | [AWCP: A Workspace Delegation Protocol for Deep-Engagement Collaboration across Remote Agents](https://arxiv.org/abs/2602.20493) | Xiaohang Nie et al. | 2026 | arXiv (cs.AI) | メッセージパッシングではなくワークスペース委譲による深い協調を可能にするプロトコル。リモートエージェント間の直接的なファイル操作を実現。 |
| 4 | プロトコル | [AgentDNS: A Root Domain Naming System for LLM Agents](https://arxiv.org/abs/2505.22368) | Enfang Cui et al. | 2025 | arXiv (cs.AI) | DNSアーキテクチャに着想を得たLLMエージェントのサービスディスカバリシステム。組織境界を越えた安全なエージェント発見と呼び出しを実現。 |
| 5 | プロトコル | [Towards Adaptive, Scalable, and Robust Coordination of LLM Agents: A Dynamic Ad-Hoc Networking Perspective](https://arxiv.org/abs/2602.08009) | Rui Li et al. | 2026 | arXiv (cs.AI) | RAPS（Reputation-Aware Publish-Subscribe）パラダイムによる適応的・スケーラブルなLLMエージェント協調。悪意あるピア検出を含む。 |
| 6 | データ分析FW | [DataSage: Multi-agent Collaboration for Insight Discovery](https://arxiv.org/abs/2511.14299) | Xiaochuan Liu et al. | 2025 | arXiv (cs.AI) | 外部知識検索・マルチロール討論・マルチパス推論を統合し、データインサイト発見を行うマルチエージェントフレームワーク。 |
| 7 | データ分析FW | [PublicAgent: Multi-Agent Design Principles From an Open Data Analysis Framework](https://arxiv.org/abs/2511.03023) | Sina Montazeri et al. | 2025 | arXiv (cs.AI) | オープンデータ分析フレームワークの評価を通じて、マルチエージェントシステムの5つの設計原則を導出。 |
| 8 | データ分析FW | [DataPuzzle: Breaking Free from the Hallucinated Promise of LLMs in Data Analysis](https://arxiv.org/abs/2504.10036) | Zhengxuan Zhang et al. | 2025 | arXiv (cs.DB) | モノリシックプロンプトをモジュラーワークフローに置き換える概念的マルチエージェントフレームワーク。透明で検証可能な分析を実現。 |
| 9 | データ分析FW | [DataFactory: Collaborative Multi-Agent Framework for Advanced Table Question Answering](https://arxiv.org/abs/2603.09152) | Tong Wang et al. | 2026 | arXiv (cs.CL) | ReActパラダイムを用いるData Leaderと専門チームが協調するテーブル質問応答フレームワーク。 |
| 10 | データ分析FW | [I2I-STRADA: Information to Insights via Structured Reasoning Agent for Data Analysis](https://arxiv.org/abs/2507.17874) | SaiBarath Sundar et al. | 2025 | arXiv (cs.AI) | 構造化認知ワークフローをデータ分析に適用するエージェントアーキテクチャ。DABstep・DABenchベンチマークで有効性を実証。 |
| 11 | データ分析FW | [LLM-Based Multi-Agent Blackboard System for Information Discovery in Data Science](https://arxiv.org/abs/2510.01285) | Alireza Salemi et al. | 2025 | arXiv (cs.MA) | ブラックボード型マルチエージェントアーキテクチャ。中央コントローラーに依存しない分散協調方式でデータレイク上の情報発見を実現。 |
| 12 | データ分析FW | [Dango: A Mixed-Initiative Data Wrangling System using Large Language Model](https://arxiv.org/abs/2503.03154) | Wei-Hao Chen et al. | 2025 | CHI 2025 | デモンストレーションベースの仕様記述と明確化質問によるミックスイニシアチブ型データラングリングシステム。 |
| 13 | DS自動化 | [VDSAgents: A PCS-Guided Multi-Agent System for Veridical Data Science Automation](https://arxiv.org/abs/2510.24339) | Yunxuan Jiang et al. | 2025 | arXiv (cs.AI) | Predictability-Computability-Stability原則に基づくマルチエージェントDS自動化。科学的理論原則をモジュラーエージェント群に組み込み信頼性を向上。 |
| 14 | DS自動化 | [SPIO: Ensemble and Selective Strategies via LLM-Based Multi-Agent Planning](https://arxiv.org/abs/2503.23314) | Wonduk Seo et al. | 2025 | arXiv (cs.AI) | 固定単一パスワークフローを適応的マルチパス計画に置き換えるフレームワーク。選択・アンサンブル両モードの戦略探索を実現。 |
| 15 | DS自動化 | [iML: A Multi-Agent Framework for Code-Guided, Modular, and Verifiable AutoML](https://arxiv.org/abs/2602.13937) | Dat Le et al. | 2026 | arXiv (cs.LG) | AutoMLを計画・実装・検証の3段階に分離するマルチエージェントアーキテクチャ。Kaggleで85%の有効提出率を達成。 |
| 16 | ベンチマーク | [KramaBench: A Benchmark for AI Systems on Data-to-Insight Pipelines over Data Lakes](https://arxiv.org/abs/2506.06541) | Eugenie Lai et al. | 2025 | arXiv (cs.DB) | データレイク上のdata-to-insightパイプライン全体を評価する104課題のベンチマーク。MIT Tim Kraskaグループ。 |
| 17 | ベンチマーク | [InsightEval: An Expert-Curated Benchmark for Assessing Insight Discovery in LLM-Driven Data Agents](https://arxiv.org/abs/2511.22884) | Zhenghao Zhu et al. | 2025 | arXiv (cs.AI) | LLM駆動データエージェントのインサイト発見能力を評価する専門家キュレーション型ベンチマーク。 |
| 18 | オーケストレーション | [SwarmSys: Decentralized Swarm-Inspired Agents for Scalable and Adaptive Reasoning](https://arxiv.org/abs/2510.10047) | Ruohao Li et al. | 2025 | arXiv (cs.AI) | Explorer・Worker・Validatorの3役割による群知能インスパイアの分散型マルチエージェント推論フレームワーク。 |
| 19 | オーケストレーション | [CASTER: Breaking the Cost-Performance Barrier in Multi-Agent Orchestration](https://arxiv.org/abs/2601.19793) | Shanyv Liu et al. | 2026 | arXiv (cs.AI) | グラフベースMASにおける動的モデル選択ルーター。推論コストを最大72.4%削減しつつ成功率を維持。 |
| 20 | オーケストレーション | [BIASINSPECTOR: Detecting Bias in Structured Data through LLM Agents](https://arxiv.org/abs/2504.04855) | Haoxuan Li et al. | 2025 | arXiv (cs.AI) | 構造化データのバイアス検出を自動化するマルチエージェントフレームワーク。多段階計画と多様なツール実装。 |
| 21 | ドメイン特化 | [CLIMATEAGENT: Multi-Agent Orchestration for Complex Climate Data Science Workflows](https://arxiv.org/abs/2511.20109) | Hyeonjae Kim et al. | 2025 | arXiv (cs.LG) | 気候科学に特化したマルチエージェントオーケストレーション。タスク分解・データ取得・分析を専門エージェントが担当。 |
| 22 | ドメイン特化 | [Manalyzer: End-to-end Automated Meta-analysis with Multi-agent System](https://arxiv.org/abs/2505.20310) | Wanghan Xu et al. | 2025 | arXiv (cs.AI) | メタ分析を自動化するツール呼び出し型マルチエージェントシステム。3ドメイン729論文のベンチマークで評価。 |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査できます
- **既存レポートとの統合**: 2026-03-30 の retrieval（25件）と合わせてメタ分析が可能です
