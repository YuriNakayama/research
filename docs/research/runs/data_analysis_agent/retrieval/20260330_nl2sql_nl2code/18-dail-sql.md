# Text-to-SQL Empowered by Large Language Models: A Benchmark Evaluation

- **Link**: https://arxiv.org/abs/2308.15363
- **Authors**: Dawei Gao, Haibin Wang, Yaliang Li, Xiuyu Sun, Yichen Qian, Bolin Ding, Jingren Zhou
- **Year**: 2023
- **Venue**: VLDB 2024 (Proceedings of the VLDB Endowment, Vol. 17)
- **Type**: Academic Paper

## Abstract

Large language models (LLMs) have emerged as a new paradigm for Text-to-SQL task. However, the absence of a systematic benchmark for this area hinders the understanding and advancement of employing LLMs for Text-to-SQL. To address this challenge, in this paper, we first conduct a systematical and extensive comparison with respect to prompt engineering on multiple LLMs covering prompt components, prompt design, and demonstration strategies. Additionally, we explore the efficacy of supervised fine-tuning on open-source LLMs. Our findings illuminate the critical impact of prompt engineering techniques, including question representation, example selection, and example organization, on LLM-based Text-to-SQL performance. We propose an integrated solution, DAIL-SQL, which refreshes the Spider leaderboard with 86.6% execution accuracy, as well as achieves competitive performance on the BIRD benchmark. We anticipate that this work can catalyze deeper comprehension of Text-to-SQL with LLMs and inspire further developments and practical applications.

## Abstract（日本語訳）

大規模言語モデル（LLM）はText-to-SQLタスクの新しいパラダイムとして登場した。しかし、この分野における体系的なベンチマークの不在が、LLMをText-to-SQLに活用する理解と進歩を妨げている。この課題に対処するため、本論文ではまず、プロンプトコンポーネント、プロンプト設計、デモンストレーション戦略を含む複数のLLMに対するプロンプトエンジニアリングの体系的かつ広範な比較を実施する。さらに、オープンソースLLMに対する教師ありファインチューニングの有効性も探求する。我々の発見は、質問表現、例の選択、例の構成を含むプロンプトエンジニアリング技術がLLMベースのText-to-SQL性能に与える重要な影響を明らかにする。統合ソリューションDAIL-SQLを提案し、Spiderリーダーボードを実行精度86.6%で更新するとともに、BIRDベンチマークでも競争力のある性能を達成した。本研究がLLMを用いたText-to-SQLのより深い理解を促進し、さらなる開発と実用的応用を刺激することを期待する。

## 概要

本論文は、大規模言語モデル（LLM）を用いたText-to-SQLタスクにおけるプロンプトエンジニアリング手法の体系的なベンチマーク評価を実施した先駆的研究である。LLMの登場によりText-to-SQLのアプローチは大きく変化したが、プロンプト設計の各要素（質問表現、例の選択、例の構成など）がどの程度性能に影響するかについての体系的理解は不足していた。本研究はGPT-4、GPT-3.5-Turbo、TEXT-DAVINCI-003、Vicuna-33Bなど複数のLLMを対象に、5種類の質問表現、複数の例選択戦略、異なる例構成方法を組み合わせた広範な実験を実施した。その結果として、質問とSQLスケルトンの類似性に基づく例選択（DAIL Selection）、質問-SQLペア形式の例構成、Code Representation Promptの有効性を明らかにし、これらを統合したDAIL-SQLを提案した。DAIL-SQLはSpiderリーダーボードで86.6%の実行精度を達成し（当時の最高性能）、トークン効率も優れている（質問あたり約1,600トークン）。また、オープンソースLLMの教師ありファインチューニングの可能性も探求し、GPT-4との性能差が依然として大きいことを示しつつ、今後の改善方向を示唆している。

## 問題設定

- **体系的ベンチマークの不在**: LLMベースのText-to-SQLアプローチが急増しているにもかかわらず、プロンプトエンジニアリングの各要素を体系的に比較評価した研究が存在しなかった。各研究が異なる設定・プロンプトを使用しており、手法間の公平な比較が困難であった。

- **プロンプト設計の理解不足**: 質問表現（テキスト形式、コード形式等）、例の選択（ランダム、類似性ベース等）、例の構成（完全情報、SQLのみ、質問-SQLペア等）がそれぞれ性能にどの程度影響するかが不明確であった。

- **トークン効率の課題**: LLMのAPI利用にはコストがかかるため、高い精度を維持しながらプロンプトのトークン数を最小化する効率的な手法が求められていた。

- **オープンソースLLMの位置づけ**: GPT-4のようなプロプライエタリモデルと比較して、オープンソースLLMがファインチューニングによりどの程度の性能を達成できるかが不明であった。

- **Few-shot学習の最適化**: LLMのin-context learning能力を最大限に活用するための、例の選択・構成の最適な戦略が確立されていなかった。

## 提案手法

### DAIL-SQL: 統合ソリューション

DAIL-SQLは以下の3つの核心的コンポーネントを統合した手法である:

**1. 質問表現（Question Representation）**

5種類の質問表現を評価:
- Basic Prompt: 最小限のスキーマ情報
- Text Representation Prompt: テキスト形式のスキーマ記述
- OpenAI Demonstration Prompt: OpenAI推奨形式
- Code Representation Prompt: CREATE TABLE文によるスキーマ表現
- Alpaca SFT Prompt: 指示チューニング形式

結論: Code Representation PromptとOpenAI Demonstration Promptがゼロショット設定で最適。外部キー情報と「説明なし」指示の追加が有効。

**2. 例選択（Example Selection）: DAIL Selection**

- ランダム選択: ベースライン
- 質問類似性選択: 自然言語の類似性に基づく
- クエリ類似性選択: SQLスケルトンの類似性に基づく
- **DAIL Selection（提案手法）**: 質問類似性とSQLスケルトン類似性の両方を組み合わせた選択戦略

LLMは質問とSQLスケルトンのマッピングから学習することを実証。

**3. 例構成（Example Organization）**

- Full Information: スキーマ、質問、SQLのすべてを含む
- SQL Only: SQLクエリのみを提示
- **Question-SQL Pair（最適）**: 質問とSQLのペアのみを提示（スキーマ省略）

スキーマ情報を例から除外することでトークン効率を大幅に改善しつつ精度を維持。

### ベンチマーク設計

- 主要評価ベンチマーク: Spider（開発/テスト）、Spider-Realistic、BIRD
- 評価指標: 実行精度（EX）、完全一致（EM）
- 対象LLM: GPT-4、GPT-3.5-Turbo、TEXT-DAVINCI-003、Vicuna-33B
- ファインチューニング評価: オープンソースLLM（教師あり微調整）

### 評価指標

- **実行精度（EX: Execution Accuracy）**: 生成SQLの実行結果が正解と一致する割合
- **完全一致（EM: Exact Match）**: 生成SQLが正解SQLと構造的に一致する割合
- **トークン効率**: 質問あたりのプロンプトトークン数

## Figures & Tables

### Table 1: DAIL-SQL主要結果（Spider）

| 設定 | EM | EX |
|------|-----|-----|
| GPT-4 + DAIL-SQL (dev) | 70.0% | 83.1% |
| GPT-4 + DAIL-SQL (test) | - | 86.2% |
| GPT-4 + DAIL-SQL + Self-consistency (test) | - | 86.6% |

### Table 2: モデル別3-Shot性能比較（Spider dev）

| モデル | EM | EX | トークン効率 |
|-------|-----|-----|-----------|
| GPT-4 | 69.1% | ~82% | ~1,600 tokens/question |
| TEXT-DAVINCI-003 | 64.4% | ~76% | ~1,600 tokens/question |
| GPT-3.5-Turbo | 63.9% | ~75% | ~1,600 tokens/question |
| Vicuna-33B | 30.7% | ~40% | ~1,600 tokens/question |

### Table 3: 質問表現別性能比較（GPT-4、ゼロショット、Spider dev）

| 質問表現 | EM | EX |
|---------|-----|-----|
| Basic Prompt | ~60% | ~72% |
| Text Representation | ~63% | ~75% |
| OpenAI Demonstration | ~66% | ~78% |
| Code Representation | ~67% | ~79% |
| Code Representation + FK + "no explanation" | ~68% | ~80% |

### Table 4: BIRDベンチマーク結果

| 設定 | 精度 |
|------|------|
| DAIL-SQL + GPT-4 (dev) | 54.8% |
| DAIL-SQL + GPT-4 (test) | 57.4% |

### Table 5: 例選択戦略の比較（GPT-4、Spider dev）

| 選択戦略 | EM | EX |
|---------|-----|-----|
| ランダム | ~64% | ~77% |
| 質問類似性 | ~67% | ~80% |
| クエリ類似性 | ~68% | ~81% |
| DAIL Selection（提案） | ~70% | ~83% |

### Figure 1: プロンプトエンジニアリングの全体フレームワーク

質問表現、例選択、例構成の3つの軸でプロンプト設計空間を体系化した図。各軸の選択肢と組み合わせの全体像を視覚化。

### Figure 2: 例選択戦略の効果分析

ランダム、質問類似性、クエリ類似性、DAIL Selectionの4つの戦略を比較する棒グラフ。DAIL Selectionが一貫して最高性能を達成することを示す。

### Figure 3: トークン効率と精度の関係

異なるプロンプト設計におけるトークン数と精度のトレードオフを示す散布図。DAIL-SQLが約1,600トークン/質問で高い精度を達成する効率性を視覚化。

### Figure 4: オープンソースLLMのファインチューニング結果

GPT-4との性能差を示す比較図。ファインチューニングにより一定の改善が見られるが、GPT-4との差は依然として大きいことを示す。

## 実験・評価

### セットアップ

- 評価対象LLM: GPT-4、GPT-3.5-Turbo（gpt-3.5-turbo-0613）、TEXT-DAVINCI-003、Vicuna-33B
- 主要ベンチマーク: Spider（開発セット1,034例、テストセット）、Spider-Realistic、BIRD（開発/テスト）
- プロンプト設定: ゼロショット、1-shot、3-shot、5-shot
- 評価指標: 実行精度（EX）、完全一致（EM）
- デコーディング: temperature=0（グリーディ）、self-consistencyあり/なし

### 主要結果

**プロンプト設計の影響**:
- 質問表現の選択だけで8ポイント以上の精度差（Basic Prompt ~72% vs Code Representation ~80%）
- 外部キー情報の追加は一貫して性能を改善
- 「説明なし（with no explanation）」指示の追加も有効

**例選択の効果**:
- DAIL Selection（質問+クエリ類似性の統合）が全戦略中最高性能
- LLMは質問とSQLスケルトンの対応関係から効果的に学習することを実証
- ランダム選択と最適選択の差は約6ポイント

**例構成の影響**:
- Question-SQL Pair形式が最も効率的（トークン数最小で精度維持）
- スキーマ情報を例から省略してもLLMは対応関係を学習可能
- Full Information形式はトークン数が増大するが精度改善は限定的

**LLM間の性能差**:
- GPT-4が全設定で最高性能（3-shot EM: 69.1%）
- GPT-3.5-TurboとTEXT-DAVINCI-003は同等水準（EM: ~64%）
- Vicuna-33Bは大幅に劣る（3-shot EM: 30.7%）

**Spider-Realistic結果**:
DAIL-SQL + GPT-4は76.0%の実行精度を達成し、より現実的な設定でも高い性能を示した。

**BIRDベンチマーク結果**:
開発セットで54.8%、テストセットで57.4%を達成。外部知識を要するBIRDはSpiderより困難であることを確認。

**オープンソースLLMのファインチューニング**:
教師ありファインチューニングによりオープンソースLLMの性能は改善されるが、GPT-4との差は依然として大きい。トークン効率を重視したプロンプト設計が特に重要。

**トークン効率**:
DAIL-SQLは質問あたり約1,600トークンという高いトークン効率を達成。これはFull Information形式の約1/3であり、API利用コストの大幅な削減に貢献。

## 備考

- DAIL-SQLはLLMベースのText-to-SQLにおけるプロンプトエンジニアリングの体系的理解を提供した初の包括的ベンチマーク研究であり、後続研究の重要な基盤となっている
- 「質問表現」「例選択」「例構成」の3軸による設計空間の整理は、プロンプト設計の理論的フレームワークとして広く参照されている
- トークン効率の概念の導入は、LLMのAPI利用コストが重要な実用的課題であることを早期に指摘した点で先見的である
- GPT-4の86.6%という当時のSpider最高性能は、LLMがText-to-SQLタスクにおいて専用モデルを上回りうることを初めて大規模に実証した
- 2023年の結果であるため、現在のGPT-4o、Claude-3.5-Sonnet、Gemini等の最新モデルではさらなる改善が期待されるが、プロンプト設計の原則自体は依然として有効
- VLDB 2024に採択されており、データベースコミュニティにおける高い評価を受けている
- オープンソースLLMとGPT-4の性能差の分析は、モデル選択の実用的指針を提供している
