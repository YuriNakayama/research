# Enhancing Retrieval-Augmented Generation: A Study of Best Practices

- **Link**: https://arxiv.org/abs/2501.07391
- **Authors**: Siran Li, Linus Stenzel, Carsten Eickhoff, Seyed Ali Bahrainian
- **Year**: 2025
- **Venue**: arXiv preprint (cs.CL)
- **Type**: Academic Paper (Empirical Study / RAG Optimization)

## Abstract

Retrieval-Augmented Generation (RAG) systems have recently shown remarkable advancements by integrating retrieval mechanisms into language models, enhancing their ability to produce more accurate and contextually relevant responses. In this work, we study and explore numerous factors that influence RAG performance, including language model size, prompt design, document chunk size, knowledge base dimensions, retrieval stride, query expansion methods, contrastive in-context learning approaches, multilingual knowledge bases, and sentence-level context retrieval (Focus Mode). Our investigation reveals how these elements influence response quality and provides guidance for building effective RAG systems that balance contextual depth with operational efficiency.

## Abstract（日本語訳）

検索拡張生成（RAG）システムは、検索メカニズムを言語モデルに統合することにより、より正確で文脈に適した応答を生成する能力を向上させ、近年著しい進歩を遂げている。本研究では、言語モデルのサイズ、プロンプト設計、ドキュメントチャンクサイズ、知識ベースの規模、検索ストライド、クエリ拡張手法、対照的なインコンテキスト学習アプローチ、多言語知識ベース、文レベルのコンテキスト検索（フォーカスモード）を含む、RAG性能に影響を与える多数の要因を調査・探索する。これらの要素が応答品質にどのように影響するかを明らかにし、文脈の深さと運用効率のバランスをとる効果的なRAGシステム構築のためのガイダンスを提供する。

## 概要

本論文は、RAG（検索拡張生成）システムの性能に影響を与える9つの主要因子について体系的なアブレーション研究を実施し、最適な設計指針を導出した実証的研究である。

主要な貢献：

1. **9因子の体系的評価**: モデルサイズ、プロンプト設計、チャンクサイズ、知識ベース規模、検索ストライド、クエリ拡張、対照的ICL、多言語KB、フォーカスモードの各要因を独立に評価
2. **対照的インコンテキスト学習（Contrastive ICL）の提案**: 正例・負例の両方を含むICL手法を新たに導入し、全指標で最高性能を達成
3. **フォーカスモード（Focus Mode）の提案**: 文書全体ではなく文レベルの検索によるRAGの精度向上を実証
4. **品質優先の知見**: 知識ベースの量よりも質が重要であることを定量的に実証
5. **実践的ガイドライン**: RAGシステム設計者向けのベストプラクティスを体系的に整理

## 問題と動機

- **RAG設計空間の広大さ**: RAGシステムには多数のハイパーパラメータと設計選択が存在するが、それらの影響を体系的に評価した研究が不足していた
- **チャンクサイズの最適化**: 文書をどのような粒度で分割・検索すべきかについて一貫した指針がなかった
- **知識ベースのスケーリング**: 知識ベースを大きくすれば性能が向上するという直感的仮定の検証が必要であった
- **プロンプトの脆弱性**: RAGにおけるプロンプト設計の影響度が十分に理解されていなかった
- **多言語対応の課題**: 多言語知識ベースを用いたRAGの実現可能性と課題が未解明であった

## 提案手法

### 1. 対照的インコンテキスト学習（Contrastive ICL）

従来のICL（正例のみ提示）を拡張し、正例と負例（不正確な回答例）の両方を含む対照的な例示を提供する手法：

- **ICL1Doc**: 1つの正例ドキュメントを検索して提示
- **ICL2Doc**: 2つの正例ドキュメントを検索して提示
- **ICL1Doc+（対照的）**: 1つの正例 + 対応する不正確な回答例を提示
- **ICL2Doc+（対照的）**: 2つの正例 + 対応する不正確な回答例を提示

対照例により、モデルは「何が正しいか」だけでなく「何が間違っているか」も学習し、回答の正確性が向上する。

### 2. フォーカスモード（Focus Mode）

文書全体ではなく文レベルで検索・取得する手法：

- 文書を個別の文に分解し、各文を独立した検索単位として扱う
- 関連する文のみを抽出して言語モデルに提供し、ノイズとなる無関係な文脈を排除
- 構成例: 2Doc1S（2文書×1文）、80Doc80S（80文書×80文）、120Doc120S（120文書×120文）

### 3. 検索ストライド（Retrieval Stride）

生成中のコンテキスト更新頻度を制御するパラメータ：

- **Baseline**: 検索を1回のみ実行（初期コンテキスト固定）
- **Stride5**: 5トークン生成ごとにコンテキストを更新
- **Stride2**: 2トークンごとに更新
- **Stride1**: 毎トークン更新

## アルゴリズム / 疑似コード

```
Algorithm: Contrastive ICL-enhanced RAG
Input: query q, knowledge base KB, LLM M, evaluation dataset D
Output: generated response r

1. RETRIEVE relevant documents from KB using embedding similarity
2. SELECT contrastive examples from D:
   a. positive_example ← correct answer pair from D
   b. negative_example ← incorrect answer pair from D
3. CONSTRUCT prompt:
   prompt ← system_instruction
         + "Correct example: " + positive_example
         + "Incorrect example: " + negative_example
         + "Retrieved context: " + retrieved_docs
         + "Query: " + q
4. GENERATE response r ← M(prompt)
5. RETURN r
```

```
Algorithm: Focus Mode RAG
Input: query q, knowledge base KB, num_docs N, num_sentences S
Output: generated response r

1. DECOMPOSE each document d ∈ KB into sentences {s1, s2, ...}
2. INDEX all sentences with embedding vectors
3. RETRIEVE top-N×S most relevant sentences for query q
4. RANK sentences by relevance score
5. CONSTRUCT context from top-ranked sentences
6. GENERATE response using LLM with sentence-level context
7. RETURN response
```

## アーキテクチャ / プロセスフロー

```
┌──────────────────────────────────────────────────────────────────┐
│                    RAG ベストプラクティス評価パイプライン           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌─────────────────────────────────────┐     │
│  │ クエリ入力    │────▶│ 検索エンジン                          │     │
│  └─────────────┘     │  ┌─────────────────────────────┐    │     │
│                       │  │ 検索モード選択               │    │     │
│                       │  │  ・文書レベル検索（通常）      │    │     │
│                       │  │  ・文レベル検索（Focus Mode）  │    │     │
│                       │  │  ・クエリ拡張検索             │    │     │
│                       │  └──────────┬──────────────────┘    │     │
│                       └─────────────┼───────────────────────┘     │
│                                     │                              │
│                       ┌─────────────▼───────────────────────┐     │
│                       │ コンテキスト構築                       │     │
│                       │  ┌─────────────────────────────┐    │     │
│                       │  │ ICL 例示付加                  │    │     │
│                       │  │  ・正例のみ (ICL1Doc/2Doc)    │    │     │
│                       │  │  ・対照的 (ICL1Doc+/2Doc+)    │    │     │
│                       │  └──────────┬──────────────────┘    │     │
│                       │             │                       │     │
│                       │  ┌──────────▼──────────────────┐    │     │
│                       │  │ プロンプト組立                │    │     │
│                       │  │  system + ICL + context + q   │    │     │
│                       │  └──────────┬──────────────────┘    │     │
│                       └─────────────┼───────────────────────┘     │
│                                     │                              │
│                       ┌─────────────▼───────────────────────┐     │
│                       │ LLM 生成（Mistral 7B / 45B）         │     │
│                       │  ・Retrieval Stride制御              │     │
│                       │  ・動的コンテキスト更新              │     │
│                       └─────────────┬───────────────────────┘     │
│                                     │                              │
│                       ┌─────────────▼───────────────────────┐     │
│                       │ 評価                                  │     │
│                       │  ROUGE / Cosine Sim / MAUVE / FActScore │  │
│                       └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

## Figures & Tables

### Table 1: RAG因子と実験設定一覧

| 因子 | 設定値 | 主要発見 |
|------|--------|---------|
| モデルサイズ | 7B vs 45B | 大きいモデルでTruthfulQA性能が大幅向上 |
| プロンプト設計 | HelpV1-V3, AdversV1-V2 | 敵対的プロンプトで性能が壊滅的に低下 |
| チャンクサイズ | 48, 64, 128, 192トークン | チャンクサイズ間の差は最小限 |
| 知識ベース規模 | 1K vs 10K文書 | 統計的有意差なし |
| 検索ストライド | Stride1, 2, 5, Baseline | 高頻度更新は一貫性を低下 |
| クエリ拡張 | 9, 15, 21記事 | わずかな改善のみ |
| 対照的ICL | ICL1Doc/2Doc, +対照例 | **全指標で最高性能** |
| 多言語KB | 英+仏, 英+仏+独 | 性能低下（多言語統合は困難） |
| フォーカスモード | 2Doc1S〜120Doc120S | ROUGE-Lで1.65%改善 |

### Table 2: 主要手法のベンチマーク結果比較

| 手法 | TruthfulQA ROUGE-L | MMLU ROUGE-L | TruthfulQA Cosine Sim | MMLU Cosine Sim |
|------|:---:|:---:|:---:|:---:|
| Baseline（RAGなし） | 23.86 | 8.91 | 55.14 | 28.38 |
| ICL1Doc+ (対照的) | **27.79** | **23.87** | 56.48 | 29.38 |
| Focus 80Doc80S | 25.51 | 9.72 | **58.33** | **30.01** |
| ExpendL (拡張) | 24.12 | 9.15 | 55.89 | 28.95 |
| AdversV1 (敵対的) | 7.48 | 8.60 | 41.23 | 27.15 |

### Table 3: 検索ストライドと生成品質の関係

| ストライド設定 | コンテキスト更新頻度 | ROUGE-L | 一貫性 | 計算コスト |
|-------------|:---:|:---:|:---:|:---:|
| Baseline（1回） | 最低 | 23.86 | 高 | 低 |
| Stride5 | 低 | 23.94 | 高 | 中 |
| Stride2 | 中 | 23.45 | 中 | 高 |
| Stride1 | 最高 | 22.87 | 低 | 最高 |

### Table 4: 評価指標の概要

| 指標 | 測定対象 | 算出方法 |
|------|---------|---------|
| ROUGE-1/2/L | n-gram重複 | 生成文と参照文のn-gramオーバーラップのF1 |
| Embedding Cosine Sim | 意味的類似度 | 埋め込みベクトル間のコサイン類似度 |
| MAUVE | 分布的類似度 | 生成テキストと人間テキストの分布比較 |
| FActScore | 事実性 | GPT-3.5-turboによる原子的事実レベルの正確性評価 |

### Figure 1: RAGシステムの因子影響度マップ

```
影響度（高→低）:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[致命的]  プロンプト設計（敵対的）  ████████████████████  -68.7%
[高]      対照的ICL              ████████████████      +16.5%
[高]      モデルサイズ            ███████████████       +14.2%
[中]      フォーカスモード        ████████              +6.9%
[低]      クエリ拡張             ████                  +1.1%
[低]      検索ストライド          ███                   +0.3%
[微小]    チャンクサイズ          ██                    ±0.2%
[微小]    知識ベース規模          █                     ±0.1%
[負]      多言語KB               ████████              -5.3%
```

### Figure 2: 対照的ICLの効果比較

```
ROUGE-L スコア (TruthfulQA)
                          Baseline    ICL      ICL+Contrastive
                          ┃           ┃        ┃
                     20 ──┃───────────┃────────┃──
                          ┃           ┃        ┃
                     22 ──┃───┐       ┃        ┃
                          ┃   │23.86  ┃        ┃
                     24 ──┃───┘       ┃─┐      ┃
                          ┃           ┃ │25.21 ┃
                     26 ──┃           ┃─┘      ┃─┐
                          ┃           ┃        ┃ │27.79
                     28 ──┃           ┃        ┃─┘
                          ┃           ┃        ┃
                          ┗━━━━━━━━━━━┻━━━━━━━━┻━━

改善率:  —          +5.7%     +16.5% (vs Baseline)
```

## 実験と評価

### データセット

- **TruthfulQA**: 38カテゴリにわたる817の常識質問。LLMの信頼性を試すように設計された質問集
- **MMLU**: 57科目から各32サンプル、計1,824サンプルの専門知識テスト
- **知識ベース**: Wikipedia Vital Articles（Level 3-4）、英語・フランス語・ドイツ語対応

### 主要な実験結果

**対照的ICLが最も効果的**: ICL1Doc+構成において、TruthfulQAでROUGE-L 27.79（ベースライン23.86から+3.93ポイント）、MMLUでROUGE-L 23.87（ベースライン8.91から+14.96ポイント）を達成。対照例の導入が全指標にわたって有意な改善をもたらした。

**品質が量に勝る**: 知識ベースを1Kから10K文書に拡大しても統計的に有意な改善は見られなかった。検索される文書の関連性と品質が規模よりも重要であることが実証された。

**プロンプト設計の決定的影響**: 敵対的プロンプトではROUGE-Lが7.48-8.60まで低下し、ほぼゼロに近い性能となった。わずかな文言の変更でもアライメントに影響を与える。

**フォーカスモードの有効性**: 文レベル検索（80Doc80S）でTruthfulQAのROUGE-Lが1.65ポイント向上。専門分野タスク（MMLU）ではembedding類似度が0.81ポイント改善した。

**検索ストライドのトレードオフ**: 高頻度更新（Stride1-2）は理論的には有利だが、実際にはコンテキストの一貫性を損ない性能が低下した。低頻度更新（Stride5）またはベースラインが一貫性を保持しつつ最良の結果を示した。

### 制限事項

- 因子間の相互作用（組み合わせ効果）は未探索
- モデルサイズの比較は7Bと45Bの2点のみ
- 多言語テストはフランス語とドイツ語に限定

## 備考

- 本研究は「量より質」のRAG設計原則を定量的に実証した点で実践的価値が高い。特に知識ベース規模とチャンクサイズの影響が最小限であるという知見は、リソース制約のある環境でのRAG構築に直接適用可能である
- 対照的ICL（正例+負例の両方を提示）は新規の手法であり、RAGに限らず幅広いLLMアプリケーションに応用可能な汎用的テクニックである
- フォーカスモード（文レベル検索）は、従来の文書レベル検索の限界を克服する方向性を示しており、ドメイン特化型RAGでの採用が期待される
- 検索ストライドの結果は、「頻繁な更新が必ずしも改善につながらない」という反直感的な知見であり、推論中のコンテキスト管理の難しさを示唆している
- コードと実装詳細が公開されており、再現性が確保されている
- データ分析エージェントアーキテクチャの文脈では、エージェントがデータソースから情報を取得する際のRAGコンポーネント設計に直接的な示唆を提供する
