# データ前処理 & クリーニング自動化 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2024 – 2026
- **収集日**: 2026-04-12
- **入力元**: clustering結果（cluster-04-data-preprocessing.md）+ 追加キーワード検索

## 収集サマリ

| 領域 | 論文 | 特許 | 技術情報 | 事例 | 合計 |
|------|------|------|----------|------|------|
| サーベイ | 2 | — | — | — | 2 |
| データクリーニング・標準化 | 3 | — | — | — | 3 |
| データ前処理統合プラットフォーム | 4 | — | — | — | 4 |
| データラングリング・コード生成 | 4 | — | — | — | 4 |
| スキーママッチング・データ統合 | 3 | — | — | — | 3 |
| エンティティ解決 | 3 | — | — | — | 3 |
| 特徴量エンジニアリング | 1 | — | — | — | 1 |
| 欠損値補完 | 1 | — | — | — | 1 |
| 異常検出 | 1 | — | — | — | 1 |
| **合計** | **22** | **—** | **—** | **—** | **22** |

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 30 |
| 検証済み | 25 |
| バッチ間重複除外 | 5 |
| 既存 retrieval との重複除外 | 3 |

※以下のテーブルには検証済みかつ未調査のエントリのみを掲載。すべてのURLはWebFetchで確認済み。

## 全体の傾向

2024-2026年にかけてLLMによるデータ前処理の自動化研究が急速に発展している。(1) **包括的サーベイの登場**（2026年初頭に2本）により分野が体系化されつつある。(2) **統合プラットフォーム**（DeepPrep, Dataforge, DataFlow, kRAIG）が単一タスクのツールから全パイプライン自動化へと進化。(3) **ユーザーインタラクション**を重視するシステム（ViseGPT, Dango）がUIST/CHIに採択され、HCI視点からの品質向上が進む。(4) **エンティティ解決**ではLLMのコスト問題を知識蒸留や効率的なクラスタリングで解決する手法が登場。(5) 特徴量エンジニアリングの自動化（FAMOSE）は新しい研究方向として注目される。

---

## 学術論文

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 1 | サーベイ | [Can LLMs Clean Up Your Mess? A Survey of Application-Ready Data Preparation with LLMs](https://arxiv.org/abs/2601.17058) | Wei Zhou et al. | 2026 | arXiv | LLMによるデータ前処理の包括的サーベイ。クリーニング・統合・エンリッチメントの3カテゴリで体系化。 |
| 2 | サーベイ | [Empowering Tabular Data Preparation with Language Models: Why and How?](https://arxiv.org/abs/2508.01556) | Mengshi Chen et al. | 2025 | arXiv | 表形式データ前処理における言語モデル活用の理由と手法を論じるサーベイ。 |
| 3 | クリーニング | [CleanAgent: Automating Data Standardization with LLM-based Agents](https://arxiv.org/abs/2403.08291) | Danrui Qi et al. | 2024 | arXiv | Dataprep.Clean統合のLLMエージェント。宣言的APIによるワンライナー標準化。 |
| 4 | クリーニング | [AutoDCWorkflow: LLM-based Data Cleaning Workflow Auto-Generation and Benchmark](https://arxiv.org/abs/2412.06724) | Lan Li et al. | 2024 | EMNLP 2025 Findings | クリーニング手順自動生成。96テーブル・142テストケースのベンチマーク構築。 |
| 5 | クリーニング | [Exploring LLM Agents for Cleaning Tabular ML Datasets](https://arxiv.org/abs/2503.06664) | Tommaso Bendinelli et al. | 2025 | ICLR 2025 Workshop | LLMエージェントによるKaggleデータセットの誤エントリ自動検出・修正の検証。 |
| 6 | 統合PF | [DeepPrep: An LLM-Powered Agentic System for Autonomous Data Preparation](https://arxiv.org/abs/2602.07371) | Meihao Fan et al. | 2026 | arXiv | 木構造推論による乱雑テーブルの自動変換。推論コスト約15分の1で達成。 |
| 7 | 統合PF | [Dataforge: Agentic Platform for Autonomous Data Engineering](https://arxiv.org/abs/2511.06185) | Xinyuan Wang et al. | 2025 | arXiv | 自動停止機構付き反復最適化で生データのクリーニング・正規化・特徴変換を自動化。 |
| 8 | 統合PF | [DataFlow: An LLM-Driven Framework for Unified Data Preparation and Workflow Automation](https://arxiv.org/abs/2512.16676) | Hao Liang et al. | 2025 | arXiv | 約200のモジュラーオペレータと再利用可能パイプラインによる統一フレームワーク。 |
| 9 | 統合PF | [kRAIG: A Natural Language-Driven Agent for Automated DataOps Pipeline Generation](https://arxiv.org/abs/2603.20311) | Rohan Siva et al. | 2026 | arXiv | 自然言語からDataOpsパイプライン全体を自動生成するエージェント。 |
| 10 | ラングリング | [ViseGPT: Towards Better Alignment of LLM-generated Data Wrangling Scripts and User Prompts](https://arxiv.org/abs/2508.01279) | Jiajun Zhu et al. | 2025 | UIST 2025 | ユーザ要件との不一致を検出・修正。Ganttチャート可視化。 |
| 11 | ラングリング | [Data Wrangling Task Automation Using Code-Generating Language Models](https://arxiv.org/abs/2502.15732) | Ashlesha Akella et al. | 2025 | AAAI 2025 Demo | メモリ依存/非依存の両タスクに対応するコード生成ベースのデータラングリング自動化。 |
| 12 | ラングリング | [Contextualized Data-Wrangling Code Generation in Computational Notebooks](https://arxiv.org/abs/2409.13551) | Junjie Huang et al. | 2024 | ASE 2024 | 58,221例のCoCoNoteデータセットとDataCoderモデル。 |
| 13 | ラングリング | [DA-Code: Agent Data Science Code Generation Benchmark for LLMs](https://arxiv.org/abs/2410.07331) | Yiming Huang et al. | 2024 | arXiv | データラングリング・分析のコード生成ベンチマーク。 |
| 14 | スキーマ | [Towards Scalable Schema Mapping using Large Language Models](https://arxiv.org/abs/2505.24716) | Christopher Buss et al. | 2025 | arXiv | 多数の異種データソースのスキーママッピングをLLMで自動化。 |
| 15 | スキーマ | [BDIViz: Biomedical Schema Matching with LLM-Powered Validation](https://arxiv.org/abs/2507.16117) | Eden Wu et al. | 2025 | arXiv | 生物医学データのスキーママッチングにLLM検証+インタラクティブ可視化。 |
| 16 | スキーマ | [SemPipes: Optimizable Semantic Data Operators for Tabular ML Pipelines](https://arxiv.org/abs/2602.05134) | Olga Ovcharenko et al. | 2026 | arXiv | LLMベースコード合成によるセマンティックデータオペレータ群。 |
| 17 | エンティティ | [Match, Compare, or Select? An Investigation of LLMs for Entity Matching](https://arxiv.org/abs/2405.16884) | Tianshu Wang et al. | 2024 | arXiv | エンティティマッチングにおけるLLMの3戦略を体系的に調査。 |
| 18 | エンティティ | [DistillER: Knowledge Distillation in Entity Resolution with LLMs](https://arxiv.org/abs/2602.05452) | Alexandros Zeakis et al. | 2026 | arXiv | LLMの知識蒸留によるコスト効率の高いエンティティ解決。 |
| 19 | エンティティ | [In-context Clustering-based Entity Resolution with LLMs](https://arxiv.org/abs/2506.02509) | Jiajie Fu et al. | 2025 | arXiv | インコンテキスト学習+クラスタリングによる効率的エンティティ解決。 |
| 20 | 特徴量 | [FAMOSE: A ReAct Approach to Automated Feature Discovery](https://arxiv.org/abs/2602.17641) | Keith Burghardt et al. | 2026 | arXiv | ReActパラダイムで表形式データの特徴量を自律的に探索・生成・精製。 |
| 21 | 欠損値 | [SketchFill: Sketch-Guided Code Generation for Imputing Derived Missing Values](https://arxiv.org/abs/2412.19113) | Yunfan Zhang et al. | 2024 | arXiv | スケッチベースの導出欠損値補完。CoT比56.2%, MetaGPT比78.8%精度向上。 |
| 22 | 異常検出 | [Multi-Agent Debate for Tabular Anomaly Detection](https://arxiv.org/abs/2602.14251) | Pinqiao Wang, Sheng Li | 2026 | arXiv | 複数異種検出モデル間の不一致をLLM批評エージェントが解決。 |

---

## ベンチマーク参考

| タイトル | 概要 |
|---------|------|
| [ELT-Bench](https://arxiv.org/abs/2504.04808) | ELTパイプライン構築のAIエージェント評価ベンチマーク |
| [AutoDCWorkflow Benchmark](https://arxiv.org/abs/2412.06724) | 96テーブル・142テストケースのデータクリーニングベンチマーク |
| [DA-Code](https://arxiv.org/abs/2410.07331) | データサイエンスコード生成ベンチマーク |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査できます
- **クラスタ #5（可視化）の調査**: 同様の手順で可視化・レポート自動生成の調査が可能です
