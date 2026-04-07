# Cluster 3: 自動EDAシステム・NL2Vis/SQL

## 概要

LLMを活用した探索的データ分析（EDA）の自動化システムと、自然言語からの可視化・SQL生成を扱うクラスタ。データロード→統計プロファイリング→欠損値分析→相関検出→外れ値検出→可視化→レポート生成の一連のEDAプロセスをLLMエージェントが自律的に実行するシステムが2024年以降急増した。TiInsight（VLDB 2025）のドメイン横断型EDA、QUIS（質問生成駆動型EDA）、LAMBDA（コード不要型）などの代表的システムが提案されている。また、データ品質評価・クリーニングの自動化（CleanAgent、AutoDCWorkflow）もEDAの前処理として重要なサブテーマとなっている。

## キーワード

`exploratory data analysis`, `automated EDA`, `NL2SQL`, `NL2Vis`, `text-to-SQL`, `visualization generation`, `data profiling`, `insight discovery`, `data cleaning agent`, `LIDA`, `InsightPilot`, `Data-Copilot`, `AutoKaggle`, `TiInsight`

## 研究戦略

- **推奨検索クエリ**: `"automated EDA LLM agent 2025"`, `"NL2SQL survey LLM 2024"`, `"natural language visualization generation"`, `"data cleaning agent LLM"`, `"AutoKaggle LIDA InsightPilot"`
- **主要情報源**: arXiv (cs.DB, cs.AI), VLDB/SIGMOD/EMNLP proceedings, IEEE VIS, ACM CHI
- **注目研究グループ**: PingCAP (TiInsight), Microsoft Research (InsightPilot, LIDA), SJTU (AutoKaggle), NUS
- **推奨読書順序**:
  1. LIDA (2023, ACL) — 基盤パイプラインの理解
  2. TiInsight (2025, VLDB) — ドメイン横断型EDAの最新
  3. QUIS (2024) — 質問駆動型EDAの新パラダイム
  4. AutoKaggle (2024) — マルチエージェントEDAの実装例
  5. "Talk to Your Data" サーベイ (2025) — NL2Vis全体像

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| TiInsight: Towards Automated Cross-domain EDA through LLMs | 論文 (VLDB) | 2025 | 階層的データコンテキスト+Text-to-SQLでドメイン横断EDA自動化。Spider上86.3%実行精度。[arXiv:2412.07214](https://arxiv.org/abs/2412.07214) |
| QUIS: Question-guided Insights Generation for Automated EDA | 論文 | 2024 | 質問生成+インサイト生成の2段階反復でEDA完全自動化。[arXiv:2410.10270](https://arxiv.org/abs/2410.10270) |
| LAMBDA: A Large Model Based Data Agent | 論文 | 2024 | プログラマー+インスペクターの2エージェント構成。コード不要のデータ分析。[arXiv:2407.17535](https://arxiv.org/abs/2407.17535) |
| Data Interpreter: An LLM Agent for Data Science | 論文 (ACL Findings) | 2025 | 階層的グラフモデリングでタスク分解・動的コード生成。[arXiv:2402.18679](https://arxiv.org/abs/2402.18679) |
| InsightBench | ベンチマーク (ICLR) | 2025 | EDAの質問生成→回答→洞察要約を評価する初のベンチマーク。[arXiv:2407.06423](https://arxiv.org/abs/2407.06423) |
| LIDA: A Tool for Automatic Generation of Grammar-Agnostic Visualizations | 論文 (ACL) | 2023 | データ要約→目標探索→コード生成→インフォグラフィック4段階パイプライン。[arXiv:2303.02927](https://arxiv.org/abs/2303.02927) |
| InsightPilot | 論文 (EMNLP) | 2023 | IQuery連鎖によるデータ探索自動化（Microsoft Research）。[arXiv:2304.00477](https://arxiv.org/abs/2304.00477) |
| Data-Copilot | 論文 | 2023 | LLMがデータスキーマを事前探索し汎用インターフェースを自律設計。[arXiv:2306.07209](https://arxiv.org/abs/2306.07209) |
| AutoKaggle | 論文 | 2024 | 5エージェント協調でKaggleパイプラインを自律実行。提出成功率0.85。[arXiv:2410.20424](https://arxiv.org/abs/2410.20424) |
| A Survey of NL2SQL with LLMs | サーベイ | 2024 | LLM時代のNL2SQL技術を包括的にサーベイ。[arXiv:2408.05109](https://arxiv.org/abs/2408.05109) |
| Talk to Your Data: NL Interfaces for Data Visualization | サーベイ | 2025 | 100+論文・50+システム対象のNL2VIS体系的サーベイ。[HKUST](https://dsa.hkust-gz.edu.cn/blog/2025/06/09/talk-to-your-data-a-survey-on-natural-language-interfaces-for-data-visualization-in-the-age-of-llms/) |
| ChartGPT | 論文 (IEEE VIS) | 2024 | 自然言語からステップバイステップ推論でチャート生成。[IEEE VIS](https://ieeevis.org/year/2024/program/paper_v-tvcg-20243368621.html) |
| CleanAgent: Automating Data Standardization with LLM-based Agents | 論文 | 2024 | 宣言的APIでデータ標準化をLLMエージェントが自動実行。[arXiv:2403.08291](https://arxiv.org/abs/2403.08291) |
| AutoDCWorkflow: LLM-based Data Cleaning Workflow Auto-Generation | 論文 (EMNLP Findings) | 2025 | データクリーニングワークフローを自動生成。[arXiv:2412.06724](https://arxiv.org/abs/2412.06724) |
| AutoML-Agent: Multi-Agent LLM Framework for Full-Pipeline AutoML | 論文 | 2024 | 前処理・NN設計等を専門エージェントに分担するAutoML統合。[arXiv:2410.02958](https://arxiv.org/abs/2410.02958) |
| DS-Agent | 論文 (ICML) | 2024 | 事例ベース推論+LLMでKaggle知識活用MLパイプライン自動構築。GPT-4成功率100%。[arXiv:2402.17453](https://arxiv.org/abs/2402.17453) |
