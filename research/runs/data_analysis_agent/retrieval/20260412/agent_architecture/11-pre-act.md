# Pre-Act: Multi-Step Planning and Reasoning Improves Acting in LLM Agents

- **Link**: https://arxiv.org/abs/2505.09970
- **Authors**: Mrinal Rawat, Ambuje Gupta, Rushil Goomer, Alessandro Di Bari, Neha Gupta, Roberto Pieraccini
- **Year**: 2025
- **Venue**: arXiv preprint (cs.AI)
- **Type**: Academic Paper (Agent Architecture / Planning Enhancement)

## Abstract

The ReAct capability in large language models has become foundational for agentic systems, enabling the interleaving of reasoning and acting. In this paper, we introduce Pre-Act, an enhancement to the ReAct framework that improves agent performance by creating a multi-step execution plan along with the detailed reasoning for the given user input. Unlike ReAct, which generates isolated reasoning steps focused only on immediate action requirements, Pre-Act generates a comprehensive plan that dynamically refines itself after each step execution, incorporating previous observations and accumulated context. We propose a two-level evaluation framework: turn-level assessment measuring action recall and parameter accuracy, and end-to-end evaluation using milestone-based goal completion with simulated user interactions. Our experiments demonstrate that Pre-Act outperforms ReAct by 70% in Action Recall on the Almita dataset. Furthermore, fine-tuned Llama 3.1 70B models outperform GPT-4, achieving a 69.5% improvement in action accuracy (turn-level) and a 28% improvement in goal completion rate (end-to-end) on the Almita (out-of-domain) dataset.

## Abstract（日本語訳）

大規模言語モデルにおけるReAct機能は、推論と行動の交互実行を可能にし、エージェントシステムの基盤となっている。本論文では、ReActフレームワークの拡張であるPre-Actを導入する。Pre-Actは、与えられたユーザー入力に対して詳細な推論を伴うマルチステップ実行計画を作成することでエージェントの性能を向上させる。即時のアクション要件のみに焦点を当てた孤立的な推論ステップを生成するReActとは異なり、Pre-Actは各ステップの実行後に動的に自己修正される包括的な計画を生成し、過去の観察と蓄積されたコンテキストを取り込む。ターンレベルのアクションリコールとパラメータ精度を測定する評価と、マイルストーンベースの目標完了を用いたエンドツーエンド評価からなる2段階評価フレームワークを提案する。実験により、Pre-ActはAlmitaデータセットにおいてアクションリコールでReActを70%上回ることを実証する。さらに、ファインチューニングされたLlama 3.1 70Bモデルは、Almita（ドメイン外）データセットにおいてアクション精度（ターンレベル）で69.5%、目標完了率（エンドツーエンド）で28%の改善を達成し、GPT-4を上回る。

## 概要

本論文は、ReActフレームワークの拡張として「Pre-Act」を提案し、マルチステップ計画と動的な計画修正によりLLMエージェントの行動精度を大幅に向上させた研究である。

主要な貢献：

1. **Pre-Act手法の提案**: ReActの逐次的推論を包括的なマルチステップ計画に拡張し、各ステップ実行後の動的修正メカニズムを導入
2. **2段階評価フレームワーク**: ターンレベル（アクション精度）とエンドツーエンド（目標完了率）の2レベルで体系的にエージェント性能を評価する新しい枠組みを提案
3. **カリキュラム学習によるファインチューニング**: 2段階のカリキュラム学習戦略により、Llama 3.1 70BがGPT-4を上回る性能を達成
4. **ドメイン外汎化**: Almitaデータセット（18ユースケース、70ツール）でのドメイン外評価で優れた汎化性能を実証
5. **実用的な性能改善**: アクションリコールで70%、目標完了率で28%の改善を達成

## 問題と動機

- **ReActの逐次的思考の限界**: ReActは各ステップで即時のアクション要件にのみ焦点を当てた孤立的な推論を行うため、タスク全体を見通した計画が不足していた
- **複雑なマルチステップタスクへの対応困難**: 単一ステップの推論では、複数のツール呼び出しを含む複雑なワークフローの効率的な実行が困難
- **計画の動的修正の欠如**: 既存手法では、ステップ実行結果に基づく計画の修正メカニズムが十分に組み込まれていなかった
- **評価フレームワークの不足**: エージェントの性能を多角的に評価する体系的な枠組みが不在
- **プロプライエタリモデルへの依存**: GPT-4等の商用モデルに依存せず、オープンソースモデルで同等以上の性能を達成する手法が求められていた

## 提案手法

### 1. Pre-Act計画メカニズム

ReActの逐次的推論を拡張し、包括的なマルチステップ計画を生成する：

- **計画生成**: ユーザー入力に対して、実行すべきステップの完全な計画 {s₁, s₂, ..., sₙ, s_fa} を生成
- **各ステップの詳細推論**: 各ステップに対して、なぜそのアクションが必要かの詳細な推論を付与
- **動的修正**: ステップ i の実行後、観察 o_i と蓄積されたコンテキスト C_t = {(a₁, o₁), ..., (aᵢ, oᵢ)} を用いて次のステップを修正
- **適応的対応**: 前ステップの結果が予想と異なる場合や失敗した場合に、計画を動的に調整

### 2. 2段階評価フレームワーク

**Level 1: ターンレベル評価**
- 各会話ターンを個別にグラウンドトゥルースと比較
- ツール呼び出し: F1スコアとパラメータ完全一致を測定
- 最終回答: F1スコアと意味的類似度を算出
- 主要指標: アクションリコール（予測されたアクションがグラウンドトゥルースと一致する割合）

**Level 2: エンドツーエンド評価**
- GPT-4によるマイルストーン生成と依存関係グラフの構築
- GPT-4を合成ユーザーとして使用したシミュレーション対話
- 目標完了率（GC）と進捗率（PR）で評価
- LLM-as-a-judge手法によるシミュレーション対話の自動評価

### 3. カリキュラム学習によるファインチューニング

**Stage 1（初期ファインチューニング）**:
- データセット: Glaive Function-Calling v2（341,200インスタンス）
- アプローチ: 最小限の推論を伴うReAct形式
- 目的: ツール呼び出しの基礎能力（パラメータ設定、応答生成の判断）を獲得

**Stage 2（段階的精緻化）**:
- データセット: プロプライエタリデータセット（1,852インスタンス）
- アプローチ: 詳細な推論を伴うPre-Act形式
- 手法: QLoRA（量子化LoRA）による効率的なパラメータ更新
- アノテーション: 専門家によるステップレベルの推論説明を付与

## アルゴリズム / 疑似コード

```
Algorithm: Pre-Act Multi-Step Planning
Input: user_input u, tools T, LLM M, accumulated_context C = {}
Output: final_answer

1. GENERATE initial plan P = {s₁, s₂, ..., sₙ, s_fa} with reasoning for each step
   P ← M.plan(u, T)

2. FOR i = 1 to n:
   a. EXTRACT action aᵢ from step sᵢ
   b. EXECUTE action: oᵢ ← T.execute(aᵢ)
   c. UPDATE context: C ← C ∪ {(aᵢ, oᵢ)}
   d. IF oᵢ deviates from expected outcome:
      - REFINE remaining plan: P[i+1:] ← M.replan(u, C, P[i+1:])
   e. ELSE:
      - CONTINUE with next step

3. GENERATE final_answer ← M.respond(u, C)
4. RETURN final_answer
```

```
Algorithm: Two-Level Evaluation
Input: agent A, test_set D, tools T

--- Level 1: Turn-Level ---
FOR each conversation c ∈ D:
  FOR each turn t ∈ c:
    predicted ← A.act(t)
    IF predicted is tool_call:
      action_recall ← F1(predicted.tool, ground_truth.tool)
      param_match ← exact_match(predicted.params, ground_truth.params)
    IF predicted is final_answer:
      f1 ← F1(predicted.text, ground_truth.text)
      semantic_sim ← similarity_model(predicted, ground_truth)

--- Level 2: End-to-End ---
FOR each use_case uc ∈ D:
  milestones ← GPT4.create_milestones(uc)
  dependency_graph ← build_graph(milestones)
  simulated_user ← GPT4.create_persona(uc)
  conversation ← simulate(A, simulated_user, uc)
  GC ← evaluate_goal_completion(conversation, milestones)
  PR ← evaluate_progress_rate(conversation, dependency_graph)
```

## アーキテクチャ / プロセスフロー

```
┌──────────────────────────────────────────────────────────────────┐
│                   Pre-Act エージェントアーキテクチャ               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐                                                 │
│  │ ユーザー入力  │                                                 │
│  └──────┬──────┘                                                 │
│         │                                                         │
│         ▼                                                         │
│  ┌──────────────────────────────────────────────┐                │
│  │ マルチステップ計画生成                          │                │
│  │  Step 1: [action + reasoning]                 │                │
│  │  Step 2: [action + reasoning]                 │                │
│  │  ...                                          │                │
│  │  Step n: [action + reasoning]                 │                │
│  │  Final: [response generation]                 │                │
│  └──────────────────┬───────────────────────────┘                │
│                     │                                             │
│         ┌───────────▼───────────────────────────┐                │
│         │        逐次実行ループ                    │                │
│         │                                        │                │
│         │  ┌──────────┐    ┌─────────────────┐  │                │
│         │  │ Step i    │───▶│ ツール実行        │  │                │
│         │  │ 実行      │    │ (API呼び出し等)   │  │                │
│         │  └──────────┘    └────────┬────────┘  │                │
│         │                           │            │                │
│         │              ┌────────────▼────────┐  │                │
│         │              │ 観察 oᵢ 取得         │  │                │
│         │              └────────────┬────────┘  │                │
│         │                           │            │                │
│         │              ┌────────────▼────────┐  │                │
│         │              │ 予想との乖離判定     │  │                │
│         │              └─────┬──────┬────────┘  │                │
│         │                    │      │            │                │
│         │         乖離なし──┘      └──乖離あり   │                │
│         │            │                   │       │                │
│         │            │         ┌─────────▼─────┐│                │
│         │            │         │ 計画修正       ││                │
│         │            │         │ M.replan(C,P)  ││                │
│         │            │         └─────────┬─────┘│                │
│         │            │                   │       │                │
│         │            └────────┬──────────┘       │                │
│         │                     │                   │                │
│         │              次ステップへ / 完了          │                │
│         └────────────────────────────────────────┘                │
│                     │                                             │
│         ┌───────────▼───────────┐                                │
│         │ 最終回答生成            │                                │
│         │ (蓄積コンテキストC使用)  │                                │
│         └───────────────────────┘                                │
└──────────────────────────────────────────────────────────────────┘
```

## Figures & Tables

### Table 1: ReAct vs Pre-Act ターンレベル性能比較（アクションリコール）

| モデル | データセット | ReAct | Pre-Act | 改善率 |
|-------|-----------|:---:|:---:|:---:|
| Llama 3.1 70B (vanilla) | プロプライエタリ | 0.2015 | 0.4071 | +102% |
| Llama 3.1 70B (vanilla) | Almita | 0.3268 | 0.4045 | +24% |
| GPT-4-turbo | プロプライエタリ | 0.3196 | 0.5326 | +67% |
| GPT-4-turbo | Almita | 0.4430 | 0.5449 | +23% |
| Llama 3.1 70B (f.t.) | Glaive | — | 0.9929 | — |
| Llama 3.1 70B (f.t.) | Almita | — | **0.9238** | — |

### Table 2: エンドツーエンド評価結果（目標完了率 / 進捗率）

| モデル・手法 | Order Discrepancy | Internet Ping | Gift Card | Digital Download | Delivery | 平均 |
|------------|:---:|:---:|:---:|:---:|:---:|:---:|
| GPT-4 ReAct | 0.28/0.39 | 0.00/0.11 | 0.18/0.33 | 0.55/0.79 | 0.60/0.74 | 0.32/0.47 |
| GPT-4 Pre-Act | 0.63/0.72 | 0.52/0.73 | 0.75/0.74 | 0.68/0.90 | 0.66/0.89 | 0.64/0.80 |
| Llama 70B f.t. Pre-Act | **0.75/0.89** | **1.00/1.00** | **0.90/0.86** | **0.89/0.97** | 0.60/0.79 | **0.82/0.90** |

### Table 3: カリキュラム学習における壊滅的忘却の影響

| モデル | Stage 1 Action Recall | Stage 2 Action Recall | 低下率 |
|-------|:---:|:---:|:---:|
| Llama 3.1 8B | 0.9750 | 0.9672 | -0.80% |
| Llama 3.1 70B | 0.9965 | 0.9929 | -0.36% |

### Table 4: Almitaデータセットの構成

| 項目 | 詳細 |
|------|------|
| テストインスタンス数 | 1,100 |
| ユースケース数 | 18 |
| ドメイン | ヘルスケア、製造、通信、銀行、金融 |
| 利用可能ツール数 | 70 |
| E2E評価用ユースケース | 5（Order Discrepancy, Internet Ping, Gift Card, Digital Download, Delivery） |

### Figure 1: ReAct vs Pre-Act の推論パターン比較

```
【ReAct（逐次的推論）】
─────────────────────────────────
Turn 1: Thought: "ユーザーの注文を確認する必要がある"
        Action: get_order(id=123)
        Obs: {order: ...}
Turn 2: Thought: "注文状態を更新する必要がある"
        Action: update_order(id=123, status="shipped")
        Obs: {success: true}
─────────────────────────────────
→ 各ステップで局所的な推論のみ

【Pre-Act（包括的計画 + 動的修正）】
─────────────────────────────────
Plan:
  Step 1: 注文詳細を取得（理由: 現在の状態を確認するため）
  Step 2: 在庫を確認（理由: 出荷可能か判断するため）
  Step 3: 出荷ステータスを更新（理由: 在庫確認後に状態遷移）
  Final: ユーザーに結果を報告

Execute Step 1: get_order(id=123) → Obs: {order: ...}
  [計画維持 - 予想通りの結果]
Execute Step 2: check_inventory(item=456) → Obs: {stock: 0}
  [計画修正 - 在庫切れのため Step 3 を変更]
  New Step 3: バックオーダー処理（理由: 在庫切れに対応）
Execute Step 3: create_backorder(id=123) → Obs: {backorder: ...}
Final: "在庫切れのためバックオーダーを作成しました"
─────────────────────────────────
→ 全体計画 + 結果に基づく動的修正
```

### Figure 2: ファインチューニング性能のモデルサイズ別比較

```
アクションリコール (Almitaデータセット)

1.0 ─┬─────────────────────────────────────────────
     │                                    ┌──┐
0.9 ─┤                                    │  │ 0.9238
     │                                    │FT│
0.8 ─┤                                    │  │
     │                                    │  │
0.7 ─┤                                    │  │
     │                                    │  │
0.6 ─┤                          ┌──┐      │  │
     │                          │  │0.5449 │  │
0.5 ─┤                          │G4│      │  │
     │               ┌──┐      │  │      │  │
0.4 ─┤               │  │0.4430│  │      │  │
     │    ┌──┐       │G4│      │PA│      │  │
0.3 ─┤    │  │0.3268 │RA│      │  │      │  │
     │    │L7│       │  │      │  │      │  │
0.2 ─┤    │RA│       │  │      │  │      │  │
     │    │  │       │  │      │  │      │  │
0.1 ─┤    │  │       │  │      │  │      │  │
     │    │  │       │  │      │  │      │  │
0.0 ─┴────┴──┴───────┴──┴──────┴──┴──────┴──┴──
      Llama70B    GPT-4      GPT-4     Llama70B
       ReAct      ReAct     Pre-Act   FT Pre-Act

L7RA = Llama 70B ReAct, G4RA = GPT-4 ReAct
G4PA = GPT-4 Pre-Act, FT = Fine-tuned Llama 70B Pre-Act
```

## 実験と評価

### ターンレベル評価（Level 1）

Pre-Actはバニラモデルにおいて、プロプライエタリデータセットでアクションリコールを平均102%、Almitaデータセットで70%改善した。GPT-4-turboでもPre-Actへの移行により23-67%の改善が確認され、手法の汎用性が示された。

ファインチューニングされたLlama 3.1 70Bは、Almitaデータセットでアクションリコール0.9238を達成し、GPT-4のPre-Act（0.5449）を69.5%上回った。バニラLlama 70B（0.4045）と比較して128%の改善であり、カリキュラム学習の有効性が実証された。

### エンドツーエンド評価（Level 2）

5つのユースケースにわたる評価で、ファインチューニングLlama 70BのPre-Actは平均目標完了率0.82を達成した。GPT-4のReAct（0.32）と比較して156%、GPT-4のPre-Act（0.64）と比較して28%の改善である。特にInternet Pingタスクでは目標完了率1.00/進捗率1.00の完全な成功を達成した。

### カリキュラム学習の効果

2段階のカリキュラム学習における壊滅的忘却は最小限に抑えられた。Stage 1からStage 2への移行で、Llama 3.1 70Bのアクションリコール低下はわずか0.36%（0.9965→0.9929）であり、LoRAによるパラメータ効率的な学習が過去の知識を効果的に保存している。

### 主要な知見

1. **計画が精度を向上**: マルチステップ計画の事前生成により、エージェントはタスク全体を見通した適切なアクション選択が可能になる
2. **動的修正の重要性**: 実行結果に基づく計画の動的修正が、予期せぬ状況への対応力を大幅に向上させる
3. **オープンソースモデルの可能性**: 適切なファインチューニング戦略により、70Bパラメータのオープンソースモデルが商用最大モデルを上回る性能を達成可能

## 備考

- Pre-ActはReActの直接的な拡張であり、ReActの「推論+行動」パラダイムに「計画」の次元を追加した点で、エージェントアーキテクチャの進化における自然な次のステップと位置づけられる
- 2段階評価フレームワーク（ターンレベル + エンドツーエンド）は、エージェント評価の標準化に向けた重要な貢献であり、他のエージェント研究でも採用可能な汎用的枠組みである
- カリキュラム学習戦略（大規模データでの基礎能力獲得→小規模高品質データでの精緻化）は、エージェントのファインチューニングにおけるベストプラクティスとして参考になる
- Almitaデータセットは18ユースケース、70ツールをカバーする実践的なベンチマークだが、プロプライエタリであるため再現性に制限がある
- QLoRAを用いたファインチューニングでは学習率5e-5、最大シーケンス長4096、1エポックという設定が使用されており、比較的少ないリソースで実施可能
- データ分析エージェントへの示唆として、Pre-Actの「計画→実行→修正」サイクルは、複数のデータソースからの情報収集・分析・可視化を含む複雑な分析タスクに特に適している
