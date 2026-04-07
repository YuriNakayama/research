# Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows

- **Link**: https://arxiv.org/abs/2411.07763
- **Authors**: Fangyu Lei, Jixuan Chen, Yuxiao Ye, Ruisheng Cao, Dongchan Shin, Hongjin Su, Zhaoqing Suo, Hongcheng Gao, Wenjing Hu, Pengcheng Yin, Victor Zhong, Caiming Xiong, Ruoxi Sun, Qian Liu, Sida Wang, Tao Yu
- **Year**: 2024
- **Venue**: ICLR 2025 (Oral)
- **Type**: Academic Paper

## Abstract

We present Spider 2.0, an evaluation framework containing 632 real-world text-to-SQL workflow problems sourced from enterprise-level database use cases. These databases typically exceed 1,000 columns and reside in systems like BigQuery and Snowflake. The research demonstrates that successfully addressing these challenges necessitates comprehending database metadata, consulting dialect documentation, and examining codebases. The work requires models to navigate intricate SQL environments, handle extensive contextual information, perform sophisticated analysis, and construct multiple queries often spanning over 100 lines. Evaluation results show the o1-preview model solves only 21.3% of Spider 2.0 tasks, compared to 91.2% on Spider 1.0 and 73.0% on BIRD, indicating significant performance gaps between existing benchmarks and genuine enterprise requirements.

## Abstract（日本語訳）

我々はSpider 2.0を提示する。これは企業レベルのデータベースユースケースから収集された632の実世界Text-to-SQLワークフロー問題を含む評価フレームワークである。これらのデータベースは通常1,000以上のカラムを含み、BigQueryやSnowflakeなどのシステムに存在する。本研究は、これらの課題に成功裏に対処するにはデータベースメタデータの理解、方言ドキュメントの参照、コードベースの検証が必要であることを実証する。モデルは複雑なSQL環境をナビゲートし、広範なコンテキスト情報を処理し、高度な分析を実行し、しばしば100行を超える複数のクエリを構築する必要がある。評価結果は、o1-previewモデルがSpider 2.0タスクの21.3%しか解決できないことを示し、Spider 1.0の91.2%やBIRDの73.0%と比較して、既存ベンチマークと実際の企業要件との間に大きな性能ギャップがあることを示している。

## 概要

Spider 2.0は、従来のText-to-SQLベンチマーク（Spider 1.0、BIRD等）と実際の企業データベース利用環境との間に存在する巨大なギャップを埋めるために開発された次世代の評価フレームワークである。従来のベンチマークでは、比較的小規模でクリーンなデータベーススキーマ上での単一SQLクエリ生成が評価されてきたが、実際の企業環境では1,000カラムを超える大規模スキーマ、複数のデータベースシステム（BigQuery、Snowflake、SQLite等）、複雑なSQL方言、プロジェクトレベルのコードベース理解が求められる。Spider 2.0は632の実世界問題を収集し、コードエージェントタスクと伝統的Text-to-SQLタスクの2つの設定で評価を行う。さらにSpider 2.0-Snow（547例、Snowflake専用）やSpider 2.0-DBT（68例、DuckDB）といったサブセットを提供し、異なるスキルセットの評価を可能にしている。最先端のo1-previewモデルでさえ成功率は21.3%にとどまり、GPT-4oは10.1%と、従来ベンチマークでの86.6%（Spider 1.0）から劇的に低下する。この結果は、現在のLLMが実際の企業レベルのデータベースワークフローにはまだ大きく不足していることを明確に示しており、今後の研究の方向性を指し示す重要なベンチマークとなっている。

## 問題設定

- **ベンチマークと現実のギャップ**: Spider 1.0やBIRDなどの既存ベンチマークは比較的小規模で整理されたデータベースを使用しており、実際の企業環境の複雑さを反映していない。モデルがこれらのベンチマークで高い性能を示しても、実世界での有用性は保証されない。

- **スキーマの規模と複雑性**: 企業データベースは通常1,000以上のカラムを含み、テーブル間の関係も複雑である。従来のベンチマークでは数十カラム程度のスキーマしか扱っておらず、大規模スキーマのナビゲーション能力を評価できない。

- **SQL方言の多様性**: BigQuery、Snowflake、PostgreSQL、SQLiteなど、異なるデータベースシステムは独自のSQL方言を持つ。実世界では方言固有の構文や関数を正しく使用する能力が不可欠だが、既存ベンチマークではSQLite中心の評価にとどまっている。

- **マルチステップワークフロー**: 企業のデータ分析では、単一のSQLクエリではなく、複数のクエリを段階的に構築・実行するワークフローが一般的である。100行を超える複雑なクエリの構築や、中間結果に基づく分析能力の評価が不足している。

- **ドキュメントとコードベースの理解**: 実世界のタスクでは、データベースメタデータ、方言ドキュメント、プロジェクトのコードベースを理解した上でSQLを生成する必要があるが、既存ベンチマークではこのような複合的なスキルを評価していない。

## 提案手法

### ベンチマーク設計

**データセット構成**:
- 総タスク数: 632の実世界Text-to-SQLワークフロー問題
- データソース: 企業レベルのデータベースユースケース
- 平均スキーマサイズ: 1,000カラム以上
- SQLクエリ複雑度: しばしば100行超

**3つのサブセット**:

1. **Spider 2.0（コードエージェントタスク）**: 632例
   - モデルが要件に基づいてSQLまたはPythonコードを反復的に修正
   - プロジェクトコードベースおよびデータベースとのインタラクション

2. **Spider 2.0-Lite**: 547例（マルチデータベースシステム）
   - BigQuery: 214例
   - Snowflake: 198例
   - SQLite: 135例

3. **Spider 2.0-Snow**: 547例（Snowflake専用）
   - 自己完結型Text-to-SQLタスク
   - 準備されたデータベースメタデータとドキュメントを含む
   - 参加者に無料クォータを提供

4. **Spider 2.0-DBT**: 68例
   - 包括的コード生成エージェントタスク
   - DuckDBを使用

**難易度レベル**:
- Easy、Medium、Hardの3段階
- o1-previewは全難易度でGPT-4oとClaude-3.5-Sonnetを上回る

### 評価指標

- **成功率（SR）**: Spider 2.0タスクにおける完全解決インスタンスの割合
- **実行精度（EX）**: Spider 2.0-lite/snowデータセットにおける生成クエリの正しいデータベース結果の割合

## Figures & Tables

### Table 1: ベンチマーク比較（Spider 1.0 vs BIRD vs Spider 2.0）

| 特性 | Spider 1.0 | BIRD | Spider 2.0 |
|------|-----------|------|-----------|
| データベース規模 | 小規模（数十カラム） | 中規模 | 大規模（1,000+カラム） |
| SQLシステム | SQLite | SQLite | BigQuery, Snowflake, SQLite, DuckDB |
| クエリ複雑度 | 低〜中 | 中〜高 | 高（100行超） |
| タスク数 | 1,034 | 12,751 | 632 |
| 外部知識要否 | 不要 | 一部必要 | 必要（メタデータ、ドキュメント、コードベース） |
| o1-preview精度 | 91.2% | 73.0% | 21.3% |

### Table 2: モデル別成功率（Spider 2.0）

| モデル | Spider 2.0 SR | Spider 1.0参考 |
|-------|-------------|--------------|
| o1-preview（コードエージェント） | 21.3% | 91.2% |
| o1-preview（直接） | 17.1% | - |
| GPT-4o | 10.1% | 86.6% |
| Claude-3.5-Sonnet | ~12% | - |
| DeepSeek-V3 | 8.78% | - |

### Table 3: Spider 2.0-Snow リーダーボード上位結果

| 順位 | 手法 | 精度 |
|------|------|------|
| 1 | Genloop's Sentinel Agent v2 Pro | 96.70% |
| 2 | Native mini | 96.53% |
| 3 | QUVI-3 + Gemini-3-pro-preview | 94.15% |
| 4 | TCDataAgent-SQL | 93.97% |
| 5 | Prism Swarm with Deepthink | 90.49% |

### Table 4: Spider 2.0-Lite リーダーボード上位結果

| 順位 | 手法 | 精度 |
|------|------|------|
| 1 | Databao Agent | 69.65% |
| 2 | QUVI-2.3 + Claude-Opus-4.5 | 65.81% |
| 3 | EXA-SQL | 64.16% |

### Table 5: Spider 2.0-DBT リーダーボード上位結果

| 順位 | 手法 | 精度 |
|------|------|------|
| 1 | Databao Agent | 44.11% |
| 2 | Shadowfax-DBT-Agent + GPT-5 | 41.18% |
| 3 | Spider-Agent-Extended + GPT-5 | 39.71% |

### Figure 1: Spider 2.0タスク概要

企業レベルのデータベースワークフローの全体像を示す図。大規模スキーマ、複数のデータベースシステム、メタデータ、ドキュメント、コードベースを統合したタスク環境の構成を視覚化。

### Figure 2: ベンチマーク難易度比較

Spider 1.0、BIRD、Spider 2.0の3つのベンチマークにおけるモデル性能の劇的な低下を示す棒グラフ。o1-previewが91.2% → 73.0% → 21.3%と急落する傾向を明示。

## 実験・評価

### セットアップ

- 評価対象モデル: o1-preview、GPT-4o、Claude-3.5-Sonnet、DeepSeek-V3、o3-mini等
- 評価設定: コードエージェントフレームワーク（モデルがSQLまたはPythonコードを反復的に修正）および直接生成
- データベースシステム: BigQuery、Snowflake、SQLite、DuckDB
- 評価指標: 成功率（SR）および実行精度（EX）

### 主要結果

**全体的な性能低下**:
最先端モデルのSpider 2.0での性能は既存ベンチマークと比較して劇的に低下。o1-previewはSpider 1.0の91.2%からSpider 2.0の21.3%へ70ポイント低下し、GPT-4oは86.6%から10.1%へ76.5ポイント低下した。

**コードエージェントの効果**:
o1-previewをコードエージェントフレームワークで使用すると21.3%、直接生成では17.1%であり、エージェント型アプローチにより4.2ポイントの改善が得られた。

**難易度別分析**:
o1-previewはEasy、Medium、Hard全カテゴリでGPT-4oおよびClaude-3.5-Sonnetを上回り、特に推論能力の優位性が示された。

**主要な失敗要因**:
1. スキーマナビゲーションエラー: 大規模スキーマでのテーブル-カラムリンキングの失敗
2. SQL方言処理: 方言固有の構文バリエーションへの対応不足
3. 複雑なクエリ計画: ネストクエリやCTEの取り扱いミス
4. ドキュメント統合: プロジェクトレベルのメタデータとコードベースの活用不足

**リーダーボードの進化**:
Spider 2.0-Snowでは最新のエージェントシステム（Genloop's Sentinel Agent v2 Pro）が96.70%を達成し、初期のモデル性能（~20%）から大幅な改善が見られる。Spider 2.0-Liteでは最高69.65%（Databao Agent）、Spider 2.0-DBTでは最高44.11%にとどまっており、タスクの複雑さに応じた性能差が明確。

## 備考

- Spider 2.0は実世界の企業データベースワークフローの複雑さをベンチマークに忠実に反映した初の試みであり、「ベンチマーク性能=実用性能」という誤った仮定に警鐘を鳴らす重要な貢献である
- 従来ベンチマークでの90%超の精度と実世界での10〜20%の精度という劇的なギャップは、Text-to-SQL研究の方向性を再考する必要性を示唆している
- BigQuery、Snowflake等のクラウドデータベースの統合は、実際の企業環境での評価を可能にする画期的な設計である
- Spider 2.0-Snowのリーダーボードでエージェントシステムが96%超を達成していることは、適切なツール統合とドキュメント参照により性能が大幅に向上しうることを示している
- ICLR 2025のOral発表に採択されており、ベンチマークとしての重要性が広く認められている
- 100行を超えるSQLの生成能力評価は、LLMのコード生成能力の限界を探る上でも重要な指標を提供している
