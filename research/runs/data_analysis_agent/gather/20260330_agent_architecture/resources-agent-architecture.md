# エージェントアーキテクチャ & 推論基盤 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2022 – 2026
- **収集日**: 2026-04-05
- **入力元**: clustering結果（cluster-01-agent-architecture.md）

## 収集サマリ

| 領域 | 論文 | 特許 | 技術情報 | 事例 | 合計 |
|------|------|------|----------|------|------|
| エージェントアーキテクチャ & 推論基盤 | 24 | — | — | — | 24 |
| **合計** | **24** | **—** | **—** | **—** | **24** |

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 30 |
| 検証済み | 24 |
| 不一致で除外 | 0 |
| 重複除外 | 6 |

※以下のテーブルには検証済みエントリのみを掲載。すべてのURLはWebFetchで確認済み。

## 全体の傾向

2024〜2025年にかけてLLMベースのデータ分析エージェントのアーキテクチャ研究が急速に進展している。Plan-then-ExecuteやReActに代表される計画・推論パターンが基盤技術として確立し、自己修正（self-correction）やリフレクション機構の有効性と限界が実証的に明らかになりつつある。Function Calling / ツール使用の高度化も大きなトレンドであり、非同期実行やマルチターン対応など実用的な改善が進む。Agentic RAGは従来のRAGにエージェント的な推論・計画・ツール使用を統合する新パラダイムとして注目を集めている。サーベイ論文やベンチマーク（DataSciBench、AgentBench等）の充実により、分野の体系化と定量的評価が加速している。

---

## 学術論文

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 1 | サーベイ | [A Survey on Large Language Model-based Agents for Statistics and Data Science](https://arxiv.org/abs/2412.14222) | Maojun Sun et al. | 2025 | American Statistician | LLMベースのデータエージェントの進化・能力・応用を概観。計画・推論・振り返り・マルチエージェント協調の設計特徴を詳述。 |
| 2 | サーベイ | [Large Language Model Agent: A Survey on Methodology, Applications and Challenges](https://arxiv.org/abs/2503.21460) | Junyu Luo et al. | 2025 | arXiv (cs.AI) | 方法論中心の分類体系でLLMエージェントを体系的に分析。329本の論文をカバーし、アーキテクチャ設計・協調メカニズム・進化戦略を統合的に論じる。 |
| 3 | サーベイ | [Large Language Model-based Data Science Agent: A Survey](https://arxiv.org/abs/2508.02744) | Ke Chen et al. | 2025 | arXiv (cs.AI) | LLMベースのデータサイエンスエージェントの包括的サーベイ。エージェントの役割・実行・知識・リフレクションの設計原則とデータサイエンスワークフローを接続する二重視点フレームワークを提案。 |
| 4 | サーベイ | [LLM/Agent-as-Data-Analyst: A Survey](https://arxiv.org/abs/2509.23988) | Zirui Tang et al. | 2025 | arXiv (cs.AI, cs.DB) | LLMとエージェントがデータ分析をどう変革するかを概観。構造化・半構造化・非構造化・異種データの4類型で技術を分類し、4つの設計原則を提示。 |
| 5 | サーベイ | [LLM-Based Data Science Agents: A Survey of Capabilities, Challenges, and Future Directions](https://arxiv.org/abs/2510.04023) | Mizanur Rahman et al. | 2025 | arXiv (cs.AI) | 45のAIシステムをデータサイエンスライフサイクル6段階で分類する初の包括的サーベイ。90%以上のシステムに信頼性・安全性メカニズムが欠如していることを指摘。 |
| 6 | サーベイ | [Survey on Evaluation of LLM-based Agents](https://arxiv.org/abs/2503.16416) | Asaf Yehudai et al. | 2025 | arXiv | LLMベースエージェントの評価手法に関する包括的サーベイ。計画能力・ツール使用等の基礎能力評価、ドメイン別ベンチマーク、汎用エージェント評価を4次元で整理。 |
| 7 | Agentic RAG | [Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG](https://arxiv.org/abs/2501.09136) | Aditi Singh et al. | 2025 | arXiv | Agentic RAGシステムの包括的サーベイ。エージェント数・制御構造・自律性・知識表現に基づく分類体系を提案。医療・金融・教育への応用を検討。 |
| 8 | Agentic RAG | [Reasoning RAG via System 1 or System 2: A Survey on Reasoning Agentic RAG for Industry Challenges](https://arxiv.org/abs/2506.10408) | Jintao Liang et al. | 2025 | arXiv | Reasoning Agentic RAGのサーベイ。固定パイプラインのSystem 1型と自律的ツール調整のSystem 2型の2パラダイムに分類。 |
| 9 | Agentic RAG | [Enhancing Retrieval-Augmented Generation: A Study of Best Practices](https://arxiv.org/abs/2501.07391) | Siran Li et al. | 2025 | arXiv | RAGシステムの設計要素のベストプラクティスを実証研究。クエリ拡張、検索戦略、Contrastive In-Context Learning RAG等を分析。 |
| 10 | 計画・推論 | [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) | Shunyu Yao et al. | 2022 | ICLR 2023 | 推論トレースと行動実行をインターリーブさせるReActフレームワークを提案。エージェントアーキテクチャの基盤的研究。 |
| 11 | 計画・推論 | [Pre-Act: Multi-Step Planning and Reasoning Improves Acting in LLM Agents](https://arxiv.org/abs/2505.09970) | Mrinal Rawat et al. | 2025 | arXiv (cs.AI) | ReActを拡張し、行動前にマルチステップの計画と詳細推論を生成するPre-Actを提案。Action Recall 70%の改善を達成。 |
| 12 | 計画・推論 | [Plan-Then-Execute: An Empirical Study of User Trust and Team Performance When Using LLM Agents As A Daily Assistant](https://arxiv.org/abs/2502.01390) | Gaole He et al. | 2025 | CHI 2025 | Plan-then-Execute方式のLLMエージェントにおけるユーザー信頼とチームパフォーマンスを実証的に調査。 |
| 13 | 計画・推論 | [ReST meets ReAct: Self-Improvement for Multi-Step Reasoning LLM Agent](https://arxiv.org/abs/2312.10003) | Renat Aksitov et al. | 2023 | arXiv (cs.CL) | ReAct形式のエージェントにReinforced Self-Training(ReST)を適用し自己改善を実現するフレームワーク。 |
| 14 | 自己修正・リフレクション | [Large Language Models Cannot Self-Correct Reasoning Yet](https://arxiv.org/abs/2310.01798) | Jie Huang et al. | 2023 | ICLR 2024 | LLMが外部フィードバックなしに推論を自己修正する能力の限界を分析。オラクルラベルなしでは性能改善が消失し悪化する場合があることを実証。 |
| 15 | 自己修正・リフレクション | [Training Language Models to Self-Correct via Reinforcement Learning](https://arxiv.org/abs/2409.12917) | Aviral Kumar et al. | 2024 | arXiv (cs.LG) | SCoRe（Self-Correction via Reinforcement Learning）を提案。マルチターンのオンライン強化学習によりLLMの自己修正能力を大幅に向上。 |
| 16 | 自己修正・リフレクション | [Self-Reflection in LLM Agents: Effects on Problem-Solving Performance](https://arxiv.org/abs/2405.06682) | Matthew Renze, Erhan Guven | 2024 | FLLM 2024 | LLMエージェントにおける自己反省手法の問題解決性能への影響を実証的に分析。全手法がベースラインに対して統計的に有意な改善を示した。 |
| 17 | 自己修正・リフレクション | [An Empirical Study on Self-correcting Large Language Models for Data Science Code Generation](https://arxiv.org/abs/2408.15658) | Thai Tang Quoc et al. | 2024 | arXiv | データサイエンスコード生成における自己修正手法CoT-SelfEvolveを提案。Chain-of-Thoughtに基づく反復的自動修正でDS-1000データセットで大幅改善。 |
| 18 | Function Calling | [ToolACE: Winning the Points of LLM Function Calling](https://arxiv.org/abs/2409.00920) | Weiwen Liu et al. | 2024 | arXiv | LLMのfunction calling学習データを自動生成するパイプライン。26,507APIプールを合成し、8Bモデルで既存OSSを大幅に上回りGPT-4と競合する性能を達成。 |
| 19 | Function Calling | [Enhancing Function-Calling Capabilities in LLMs: Strategies for Prompt Formats, Data Integration, and Multilingual Translation](https://arxiv.org/abs/2412.01130) | Yi-Chang Chen et al. | 2024 | arXiv | Function calling能力向上のためのプロンプト設計戦略。Decision Token、CoT推論適用、多言語対応パイプラインを提案。 |
| 20 | Function Calling | [Asynchronous LLM Function Calling](https://arxiv.org/abs/2412.07017) | In Gim et al. | 2024 | arXiv | 割り込みメカニズムにより関数の非同期実行を実現するAsyncLMを提案。1.6〜5.4倍のレイテンシ削減を達成。 |
| 21 | Function Calling | [Granite-Function Calling Model: Introducing Function Calling Abilities via Multi-task Learning of Granular Tasks](https://arxiv.org/abs/2407.00121) | Ibrahim Abdelaziz et al. | 2024 | arXiv | 7つのfunction callingサブタスクに対するマルチタスク学習による20Bオープンモデル。Berkeley Function Calling Leaderboardでオープンモデル最高性能。 |
| 22 | Function Calling | [Facilitating Multi-turn Function Calling for LLMs via Compositional Instruction Tuning](https://arxiv.org/abs/2410.12952) | Mingyang Chen et al. | 2024 | ICLR 2025 | マルチターンfunction callingのためのBUTTONアプローチ。ボトムアップ・トップダウンの2フェーズで合成データを生成。 |
| 23 | ベンチマーク | [DataSciBench: An LLM Agent Benchmark for Data Science](https://arxiv.org/abs/2502.13897) | Dan Zhang et al. | 2025 | arXiv | データサイエンスタスクにおけるLLMエージェント能力を評価する包括的ベンチマーク。Task-Function-Codeフレームワークを提案し23モデルを評価。 |
| 24 | ベンチマーク | [AgentBench: Evaluating LLMs as Agents](https://arxiv.org/abs/2308.03688) | Xiao Liu et al. | 2024 | ICLR 2024 | 8つの異なる環境でLLMエージェント能力を多面的に評価するベンチマーク。清華大学NLPグループの研究。29以上のモデルをテスト。 |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査できます
- **追加の領域マッピング**: research-clustering スキルで関連領域をさらに探索できます
