# NL2SQL / NL2Code（自然言語→コード変換） — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文
- **対象期間**: 2022 – 2026
- **収集日**: 2026-04-05
- **入力元**: clustering結果（cluster-02-nl2sql-nl2code.md）

## 収集サマリ

| 領域 | 論文 | 特許 | 技術情報 | 事例 | 合計 |
|------|------|------|----------|------|------|
| Text-to-SQL サーベイ | 6 | - | - | - | 6 |
| Text-to-SQL 手法 | 7 | - | - | - | 7 |
| Text-to-SQL ベンチマーク | 5 | - | - | - | 5 |
| NL2Code / データサイエンス | 4 | - | - | - | 4 |
| **合計** | **22** | **-** | **-** | **-** | **22** |

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 22 |
| 検証済み | 22 |
| 不一致で除外 | 0 |
| アクセス不可で除外 | 0 |

※ 以下のテーブルには検証済みエントリのみを掲載。全URLはWebFetchで確認済み。

## 全体の傾向

Text-to-SQLはLLM時代に急速に発展し、2024年だけで4本以上のサーベイ論文が発表されるほど活発な研究領域となっている。手法面では、プロンプトエンジニアリング（ICL・CoT）とファインチューニングの両アプローチに加え、マルチエージェント型のText-to-SQLシステムが2025年に台頭し始めている。ベンチマーク面では、Spider 1.0での精度が90%超に達する一方、Spider 2.0やBIRD-INTERACTなどの実世界・対話型ベンチマークではLLMの精度が20〜30%台に留まり、大きなギャップが明らかになっている。NL2Code領域では、データサイエンス特化のコード生成エージェントとベンチマークが2024年以降活発に提案されている。

---

## 学術論文

### Text-to-SQL サーベイ

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 1 | サーベイ | [Exploring the Landscape of Text-to-SQL with Large Language Models: Progresses, Challenges and Opportunities](https://arxiv.org/abs/2505.23838) | — | 2025 | arXiv | Text-to-SQLにおけるLLMの最新進展、課題、将来の研究機会を包括的に探索 |
| 2 | サーベイ | [A Survey of Large Language Model-Based Generative AI for Text-to-SQL: Benchmarks, Applications, Use Cases, and Challenges](https://arxiv.org/abs/2412.05208) | Aditi Singh et al. | 2024 | arXiv | Text-to-SQLのベンチマーク、実世界アプリケーション、ユースケース、残存課題をカバーするサーベイ |
| 3 | サーベイ | [Large Language Model Enhanced Text-to-SQL Generation: A Survey](https://arxiv.org/abs/2410.06011) | Xiaohu Zhu et al. | 2024 | arXiv | LLMベースText-to-SQL手法を、プロンプトエンジニアリング・ファインチューニング・事前学習・エージェントの4グループに分類し92論文を分析 |
| 4 | サーベイ | [A Survey on Employing Large Language Models for Text-to-SQL Tasks](https://arxiv.org/abs/2407.15186) | Liang Shi et al. | 2024 | arXiv | プロンプトエンジニアリングとファインチューニング手法の包括的分類体系を提示。主要ベンチマークと評価指標を整理 |
| 5 | サーベイ | [Next-Generation Database Interfaces: A Survey of LLM-based Text-to-SQL](https://arxiv.org/abs/2406.08426) | Zijin Hong et al. | 2024 | arXiv | LLMベースText-to-SQLの体系的分類を導入。質問理解・スキーマ理解・SQL生成の3側面から分析 |
| 6 | サーベイ | [A Survey of Text-to-SQL in the Era of LLMs: Where are we, and where are we going?](https://arxiv.org/abs/2408.05109) | — | 2024 | arXiv | Text-to-SQLパイプライン全体（モデル翻訳・データ合成・ベンチマーク・エラー分析）を網羅するサーベイ |

### Text-to-SQL 手法

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 7 | 手法 | [SQL-of-Thought: Multi-agentic Text-to-SQL with Guided Error Correction](https://arxiv.org/abs/2509.00581) | Saumya Chaturvedi et al. | 2025 | arXiv | マルチエージェントフレームワークでText-to-SQLをスキーマリンク・サブ問題分解・クエリ計画・SQL生成・エラー修正に分割。Spiderで実行精度91.59%を達成 |
| 8 | 手法 | [SDE-SQL: Enhancing Text-to-SQL Generation in Large Language Models via Self-Driven Exploration with SQL Probes](https://arxiv.org/abs/2506.07245) | — | 2025 | arXiv | SQLプローブを用いた自己駆動型探索アプローチにより、反復的な洗練を通じてText-to-SQL精度を向上 |
| 9 | 手法 | [Query and Conquer: Execution-Guided SQL Generation](https://arxiv.org/abs/2503.24364) | Lukasz Borchmann et al. | 2025 | arXiv | 実行結果に基づく意味整合性判定で候補SQLを選択。7B Qwen 2.5 Coderで精度を約10%向上、o1レベルを30倍低コストで実現 |
| 10 | 手法 | [ReFoRCE: A Text-to-SQL Agent with Self-Refinement, Consensus Enforcement, and Column Exploration](https://arxiv.org/abs/2502.00675) | Minghang Deng et al. | 2025 | arXiv | 自己洗練・合意形成・カラム探索によるエージェント型Text-to-SQL。Spider 2.0（Snow/Lite）でSOTA精度を達成 |
| 11 | 手法 | [OpenSearch-SQL: Enhancing Text-to-SQL with Dynamic Few-shot and Consistency Alignment](https://arxiv.org/abs/2502.14913) | Xiangjin Xie et al. | 2025 | arXiv | 質問類似性に基づく動的Few-shot例選択と整合性アライメントを組み合わせ、従来手法を超越 |
| 12 | 手法 | [From Natural Language to SQL: Review of LLM-based Text-to-SQL Systems](https://arxiv.org/abs/2410.01066) | Ali Mohammadjafari et al. | 2024 | arXiv | ルールベースからLLMアプローチへの進化を調査。Graph RAGによるスキーマリンクの文脈精度向上を研究 |
| 13 | 手法 | [Enhancing LLM Fine-tuning for Text-to-SQLs by SQL Quality Measurement](https://arxiv.org/abs/2410.01869) | Shouvon Sarker et al. | 2024 | arXiv | 生成SQLの品質評価メカニズムを提案。構文正確性と意味精度の両面からの継続的学習を実現 |

### Text-to-SQL ベンチマーク・評価

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 14 | ベンチマーク | [BIRD-INTERACT: Re-imagining Text-to-SQL Evaluation for Large Language Models via Lens of Dynamic Interactions](https://arxiv.org/abs/2510.05318) | Nan Huo et al. | 2025 | arXiv | 900件の対話型マルチターンText-to-SQLタスク。曖昧なクエリ・明確化要求・環境不確実性を含むCRUD全体をカバー |
| 15 | ベンチマーク | [NL2SQL-BUGs: A Benchmark for Detecting Semantic Errors in NL2SQL Translation](https://arxiv.org/abs/2503.11984) | — | 2025 | arXiv | NL2SQL翻訳の意味エラーを9主カテゴリ・31サブカテゴリに分類。2,018件の専門家アノテーション付きインスタンス |
| 16 | ベンチマーク | [Is Long Context All You Need? Leveraging LLM's Extended Context for NL2SQL](https://arxiv.org/abs/2501.12372) | — | 2025 | arXiv | LLMの拡張コンテキストウィンドウがNL2SQL性能改善に寄与するかを検証 |
| 17 | ベンチマーク | [Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows](https://arxiv.org/abs/2411.07763) | Fangyu Lei et al. | 2024 | arXiv | 632件の実世界企業Text-to-SQL問題。o1-previewの解決率は21.3%（Spider 1.0では91.2%）で大きなギャップを示す |
| 18 | ベンチマーク | [Text-to-SQL Empowered by Large Language Models: A Benchmark Evaluation](https://arxiv.org/abs/2308.15363) | — | 2023 | arXiv | DAIL-SQLベンチマーク評価フレームワークを提案。Spider排行榜で実行精度86.6%を達成し従来手法を大幅に上回る |

### NL2Code / データサイエンスコード生成

| # | 領域 | タイトル | 著者 | 年 | Venue | 概要 |
|---|------|---------|------|-----|-------|------|
| 19 | NL2Code | [A Survey on Code Generation with LLM-based Agents](https://arxiv.org/abs/2508.00083) | Yihong Dong et al. | 2025 | arXiv | LLMベースコード生成エージェントに関する100論文（2022〜2025）のサーベイ。自律性・タスク範囲・ソフトウェア開発ライフサイクル全体をカバー |
| 20 | NL2Code | [DataSciBench: An LLM Agent Benchmark for Data Science](https://arxiv.org/abs/2502.13897) | Dan Zhang et al. | 2025 | arXiv | Task-Function-Code (TFC) フレームワークによるデータサイエンスLLMエージェント評価ベンチマーク |
| 21 | NL2Code | [DA-Code: Agent Data Science Code Generation Benchmark for Large Language Models](https://arxiv.org/abs/2410.07331) | Yiming Huang et al. | 2024 | arXiv | 500例のデータサイエンスコード生成ベンチマーク。最先端LLMでも精度は約30.5%に留まる |
| 22 | NL2Code | [Data Interpreter: An LLM Agent For Data Science](https://arxiv.org/abs/2402.18679) | Sirui Hong et al. | 2024 | arXiv | 階層的グラフモデリングによる問題分解とプログラマブルノード生成でデータサイエンスタスクを自律実行するLLMエージェント |

---

## 次のステップ

- **論文の詳細調査**: research-retrieval スキルでこのリストの論文を詳しく調査できます
- **追加の領域マッピング**: research-clustering スキルで関連領域をさらに探索できます
