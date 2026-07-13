# ReAct: Synergizing Reasoning and Acting in Language Models

- **Link**: https://arxiv.org/abs/2210.03629
- **Authors**: Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao
- **Year**: 2022
- **Venue**: ICLR 2023
- **Type**: Academic Paper (Agent Architecture / Prompting Framework)

## Abstract

While large language models (LLMs) have demonstrated impressive capabilities across tasks in language understanding and interactive decision making, their abilities for reasoning (e.g. chain-of-thought prompting) and acting (e.g. action plan generation) have primarily been studied as separate topics. In this paper, we explore the use of LLMs to generate both reasoning traces and task-specific actions in an interleaved manner, allowing for greater synergy between the two: reasoning traces help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface with external sources, such as knowledge bases or environments, to gather additional information. We apply our approach, named ReAct, to a diverse set of language and decision making tasks and demonstrate its effectiveness over state-of-the-art baselines, as well as improved human interpretability and trustworthiness over methods without reasoning traces. Concretely, on question answering (HotpotQA) and fact verification (FEVER), ReAct overcomes issues of hallucination and error propagation prevalent in chain-of-thought reasoning by interacting with a simple Wikipedia API, and generates human-like task-solving trajectories that are more interpretable than baselines without reasoning traces. On two interactive decision making benchmarks (ALFWorld and WebShop), ReAct outperforms imitation and reinforcement learning methods by an absolute success rate of 34% and 10% respectively, while being prompted with only one or two in-context examples.

## Abstract（日本語訳）

大規模言語モデル（LLM）は言語理解やインタラクティブな意思決定のタスクにおいて印象的な能力を示してきたが、推論能力（例: chain-of-thought prompting）と行動能力（例: アクションプラン生成）は主に別個のトピックとして研究されてきた。本論文では、LLMを用いて推論トレースとタスク固有のアクションを交互に生成する手法を探索し、両者のより大きなシナジーを実現する。推論トレースはモデルがアクションプランを誘導・追跡・更新し例外を処理するのに役立ち、アクションは知識ベースや環境などの外部ソースとのインターフェースを提供して追加情報を収集する。ReActと名付けたこのアプローチを多様な言語タスクと意思決定タスクに適用し、最先端ベースラインに対する有効性、および推論トレースを持たない手法に対する人間の解釈可能性と信頼性の向上を実証する。具体的には、質問応答（HotpotQA）と事実検証（FEVER）において、ReActはシンプルなWikipedia APIとの対話によりchain-of-thought推論に蔓延するハルシネーションとエラー伝搬の問題を克服する。2つのインタラクティブ意思決定ベンチマーク（ALFWorldとWebShop）では、1-2個のインコンテキスト例のみのプロンプティングで模倣学習と強化学習の手法をそれぞれ絶対的な成功率で34%および10%上回る。

## 概要

本論文は、LLMにおける推論（Reasoning）と行動（Acting）を統合する新しいパラダイム「ReAct」を提案した、エージェントアーキテクチャの基礎的研究である。

主要な貢献：

1. **推論と行動の統合パラダイム**: 従来別々に扱われてきた推論トレースとタスク固有アクションを交互に生成する枠組みの提案
2. **拡張行動空間の定式化**: 行動空間を A から Â = A ∪ L へ拡張し、言語ベースの思考（L）を行動の一部として形式化
3. **幻覚の低減**: 外部情報源との対話により、chain-of-thought推論で頻発するハルシネーション問題を軽減
4. **汎用的適用性**: 知識集約型推論（HotpotQA, FEVER）と意思決定タスク（ALFWorld, WebShop）の双方で有効性を実証
5. **ファインチューニングへの拡張**: プロンプティングだけでなく、ファインチューニングによるReActの学習可能性を実証

## 問題と動機

- **推論と行動の分離**: chain-of-thought（CoT）は内部推論に優れるがハルシネーションに脆弱、行動のみのアプローチは推論によるゴール分解や状態追跡ができない
- **ハルシネーション問題**: CoT推論では56%の失敗事例が事実の捏造（ハルシネーション）に起因しており、外部知識による検証メカニズムが不在
- **エラー伝搬**: 多段階推論において初期の誤りが後続のステップに伝搬し、修正機会がない
- **解釈可能性の不足**: 行動のみのアプローチでは、エージェントがなぜその行動を選択したかの説明がなく、人間による監視・修正が困難
- **既存手法の限定性**: Inner MonologueやSayCan等の先行手法は特定ドメインに特化しており、汎用的な推論・行動統合フレームワークが不在であった

## 提案手法

### 1. ReActパラダイム

行動空間を拡張し、環境に影響を与えない「思考」ステップを導入：

- **思考（Thought）**: 自然言語による推論トレース。ゴール分解、情報抽出、進捗追跡、プラン更新、例外処理に使用
- **行動（Action）**: タスク固有の操作。外部環境との対話により情報取得や状態変更を実行
- **観察（Observation）**: 行動の結果として環境から得られるフィードバック

思考は環境からのフィードバックを生成しないが、推論コンテキストを更新し将来の判断を支援する。

### 2. タスク別の交互パターン

**知識集約型タスク（HotpotQA, FEVER）**: 密な交互パターン
- 各アクションの前後に思考を配置
- 思考→アクション→観察→思考→... の繰り返し

**意思決定タスク（ALFWorld, WebShop）**: 疎な交互パターン
- 思考を戦略的なポイントにのみ配置
- 複数のアクション→思考→複数のアクション→... の構造

### 3. ハイブリッドアプローチ

ReActとCoT-SC（self-consistency）を組み合わせた最適戦略：

- **ReAct → CoT-SC**: ReActが規定ステップ（7ステップ）内で解決できない場合、CoT-SCに切り替え
- **CoT-SC → ReAct**: CoT-SCの合意度が低い（n/2未満の一致）場合、ReActで外部情報を取得

## アルゴリズム / 疑似コード

```
Algorithm: ReAct Prompting
Input: task T, environment E, LLM M, few-shot examples X, max_steps N
Output: task result

1. INITIALIZE context c ← task description T
2. FOR step i = 1 to N:
   a. Generate next token type (thought or action) from M(c, X)
   b. IF token is Thought:
      - thought_i ← M.generate_thought(c)
      - c ← c + thought_i
      - (no environment interaction)
   c. IF token is Action:
      - action_i ← M.generate_action(c)
      - observation_i ← E.execute(action_i)
      - c ← c + action_i + observation_i
   d. IF action_i == "finish[answer]":
      - RETURN answer
3. RETURN failure (step limit reached)
```

```
Algorithm: ReAct + CoT-SC Hybrid
Input: query q, LLM M, Wikipedia API W
Output: answer

1. result_react ← RUN ReAct(q, M, W, max_steps=7)
2. IF result_react is successful:
   RETURN result_react
3. ELSE:
   results_cot ← RUN CoT-SC(q, M, n_samples=21)
   majority_vote ← AGGREGATE(results_cot)
   IF confidence(majority_vote) ≥ n/2:
      RETURN majority_vote
   ELSE:
      RETURN result_react  // fallback
```

## アーキテクチャ / プロセスフロー

```
┌──────────────────────────────────────────────────────────────────┐
│                     ReAct エージェントアーキテクチャ               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐                                                 │
│  │ タスク入力    │                                                 │
│  │ (質問/指示)   │                                                 │
│  └──────┬──────┘                                                 │
│         │                                                         │
│         ▼                                                         │
│  ┌──────────────────────────────────────────────┐                │
│  │ Few-shot プロンプト構築                        │                │
│  │  ・1-6個の人間作成トラジェクトリ例              │                │
│  │  ・Thought/Action/Observation の交互パターン    │                │
│  └──────────────────┬───────────────────────────┘                │
│                     │                                             │
│         ┌───────────▼───────────────────────────┐                │
│         │         生成ループ                      │                │
│         │                                        │                │
│         │  ┌──────────────┐   ┌──────────────┐  │                │
│         │  │   Thought     │──▶│   Action      │  │                │
│         │  │ (推論トレース) │   │ (環境操作)    │  │                │
│         │  │ ゴール分解     │   │ search[x]    │  │                │
│         │  │ 情報抽出      │   │ lookup[x]    │  │                │
│         │  │ プラン更新     │   │ finish[x]    │  │                │
│         │  └──────────────┘   └──────┬───────┘  │                │
│         │                            │           │                │
│         │              ┌─────────────▼─────┐    │                │
│         │              │   Observation      │    │                │
│         │              │  (環境フィードバック) │    │                │
│         │              │  Wikipedia結果等    │    │                │
│         │              └─────────────┬─────┘    │                │
│         │                            │           │                │
│         │              ┌─────────────▼─────┐    │                │
│         │              │ 終了判定            │    │                │
│         │              │ finish? or 上限?    │    │                │
│         │              └─────────┬─────────┘    │                │
│         │                  Yes ──┘── No ──▶ ループ│               │
│         └────────────────────────────────────────┘                │
│                     │                                             │
│         ┌───────────▼───────────┐                                │
│         │  タスク結果出力        │                                │
│         └───────────────────────┘                                │
└──────────────────────────────────────────────────────────────────┘
```

## Figures & Tables

### Table 1: HotpotQA・FEVERベンチマーク結果

| 手法 | HotpotQA (EM %) | FEVER (Accuracy %) |
|------|:---:|:---:|
| Standard prompting | 28.7 | 57.1 |
| Chain-of-Thought (CoT) | 29.4 | 56.3 |
| CoT-SC (self-consistency) | 33.4 | 60.4 |
| Act-only | 25.7 | 58.9 |
| **ReAct** | **27.4** | **60.9** |
| ReAct → CoT-SC (hybrid) | **35.1** | — |
| CoT-SC → ReAct (hybrid) | — | **64.6** |

### Table 2: ALFWorld・WebShopベンチマーク結果

| 手法 | ALFWorld 成功率 (%) | WebShop 成功率 (%) |
|------|:---:|:---:|
| BUTLER (模倣学習) | 37 | — |
| IL + RL | — | 28.7 |
| Imitation Learning | — | 29.1 |
| Act-only (best of 6) | 45 | 30.1 |
| ReAct (average) | 57 | — |
| **ReAct (best of 6)** | **71** | **40.0** |

### Table 3: 失敗事例の分類（HotpotQA, 200トラジェクトリの手動分析）

| 失敗カテゴリ | ReAct | CoT |
|------------|:---:|:---:|
| ハルシネーション（事実の捏造） | — | **56%** |
| 推論エラー（誤った論理） | **47%** | 16% |
| 検索結果エラー（空/無関係） | **23%** | — |
| ラベル曖昧性（正しい推論だがラベル不一致） | 29% | 28% |

### Table 4: ファインチューニング結果（PaLMモデル）

| モデルサイズ | 手法 | 性能比較 |
|-----------|------|---------|
| PaLM-8B (ReAct f.t.) | ReAct | > PaLM-62B (全プロンプティング手法) |
| PaLM-62B (ReAct f.t.) | ReAct | > PaLM-540B (全プロンプティング手法) |
| PaLM-62B (Act f.t.) | Act | ≈ PaLM-62B (ReAct f.t.) |
| PaLM-62B (CoT f.t.) | CoT | < PaLM-62B (ReAct f.t.) |

### Figure 1: ReActとCoTの比較（推論パターン）

```
【CoT（推論のみ）】                    【ReAct（推論+行動）】

Question: Xの出身地は？               Question: Xの出身地は？
                                       
Thought 1: Xは俳優で               Thought 1: Xを検索する必要がある
  テキサス出身だと思う ← 幻覚        Action 1: search[X]
Thought 2: テキサスの首都は          Obs 1: Xはカリフォルニア出身の...
  オースティンだ                      Thought 2: Xはカリフォルニア出身
Answer: テキサス ✗                   Action 2: finish[カリフォルニア] ✓

問題: 外部検証なし → 幻覚が伝搬      解決: 外部情報で事実を検証
```

### Figure 2: タスク別のThought密度パターン

```
知識集約型タスク（HotpotQA/FEVER）:
T₁ → A₁ → O₁ → T₂ → A₂ → O₂ → T₃ → A₃ → O₃ → finish
████  ████  ████  ████  ████  ████  ████  ████  ████
 密な交互パターン（毎アクション前に推論）

意思決定タスク（ALFWorld/WebShop）:
T₁ → A₁ → O₁ → A₂ → O₂ → A₃ → O₃ → T₂ → A₄ → O₄ → finish
████  ████  ████  ████  ████  ████  ████  ████  ████  ████
 疎な交互パターン（戦略的ポイントでのみ推論）
```

## 実験と評価

### 知識集約型推論タスク

**HotpotQA**: ReAct単体ではEM 27.4%とCoT-SC（33.4%）に劣るが、ハイブリッド手法（ReAct → CoT-SC）で35.1%を達成し最高性能。ReActの強みはハルシネーション低減であり、CoTの56%のハルシネーション失敗率に対し、外部情報検索による事実検証が有効に機能した。

**FEVER**: ReActは60.9%の精度を達成し、CoT-SC（60.4%）を上回った。ハイブリッド手法（CoT-SC → ReAct）で64.6%に到達。事実検証タスクでは外部情報源へのアクセスが特に有効であった。

### インタラクティブ意思決定タスク

**ALFWorld**: 6種類のテキストベースゲームタスクにおいて、ReAct（best of 6）は71%の成功率を達成。BUTLER模倣学習（37%）を34ポイント、Act-only（45%）を26ポイント上回った。推論トレースによるゴール分解と状態追跡が特に効果的であった。

**WebShop**: E-コマース環境において40.0%の成功率を達成。IL+RL（28.7%）を10ポイント以上上回り、1-2個のインコンテキスト例のみで従来の学習ベース手法を凌駕した。

### ファインチューニング結果

3,000個の自動生成トラジェクトリでファインチューニングした結果：
- PaLM-8B ReActがPaLM-62Bの全プロンプティングベースラインを上回った
- PaLM-62B ReActがPaLM-540Bの全プロンプティング結果を超えた
- ReActファインチューニングがStandardおよびCoTファインチューニングを上回る性能を示した

### Human-in-the-Loop

2つの思考ステートメントの編集のみで失敗トラジェクトリを修正可能であり、パラメータ再調整が必要な従来のRL手法と比較して、人間との協調が容易であることが示された。

## 備考

- ReActは2022年の発表以来、LLMエージェントアーキテクチャの事実上の標準パラダイムとなり、LangChain、AutoGen、CrewAI等の主要フレームワークすべてに採用されている
- ICLR 2023に採択され、エージェントAI分野で最も引用されている論文の一つ。Google DeepMindとPrincetonの共同研究
- 「思考」を行動空間に統合するという形式化（Â = A ∪ L）は、後続のReflexion、Plan-and-Solve、Tree of Thoughts等の多くの研究に影響を与えた
- 本論文のハイブリッドアプローチ（ReAct + CoT-SC）は、単一パラダイムの限界を認めつつ相補的な組み合わせを提案した点で、メタ認知的なアプローチの先駆けとなった
- データ分析エージェントの文脈では、ReActは「データについて推論→SQLクエリ/コード実行→結果の解釈→次の分析ステップの計画」というサイクルの基礎となるアーキテクチャパターンを提供する
- 本論文はPaLM-540Bを使用しているが、後続研究でGPT-4、Claude、Llama等の多様なモデルでもReActパラダイムの有効性が確認されている
