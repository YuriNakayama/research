# Plan-Then-Execute: An Empirical Study of User Trust and Team Performance When Using LLM Agents As A Daily Assistant

- **Link**: https://arxiv.org/abs/2502.01390
- **Authors**: Gaole He, Gianluca Demartini, Ujwal Gadiraju
- **Year**: 2025
- **Venue**: CHI 2025
- **Type**: Academic Paper (Human-AI Interaction / Empirical Study)

## Abstract

Since the emergence of ChatGPT, large language models (LLMs) have increasingly shaped daily routines. When equipped with external tools for specific functions like flight booking or alarms, LLM agents demonstrate growing capacity to support human work. Yet understanding how such agents can effectively assist through planning and sequential decision-making remains limited. Drawing from research emphasizing "LLM-modulo" frameworks with human oversight for planning, we conduct an empirical investigation involving 248 participants. We examine LLM agents across six typical daily tasks with varying risk levels (flight bookings, credit card payments). Using a plan-then-execute structure, agents perform step-wise planning and sequential execution in controlled environments. Our analysis reveals how user participation at different stages influences trust and team effectiveness. Results indicate LLM agents function as double-edged tools — performing well with quality plans and adequate user involvement in execution, yet users frequently develop unwarranted confidence in plausible-seeming plans. Our work offers design guidance for calibrating user trust and improving collaborative outcomes with LLM-based daily assistants.

## Abstract（日本語訳）

ChatGPTの登場以来、大規模言語モデル（LLM）は日常のルーティンをますます形作るようになっている。フライト予約やアラームなどの特定機能のための外部ツールを備えた場合、LLMエージェントは人間の仕事を支援する能力を高めている。しかし、計画と逐次的な意思決定を通じてそのようなエージェントがどのように効果的に支援できるかについての理解は限定的である。計画における人間の監視を重視する「LLM-modulo」フレームワークの研究に基づき、248名の参加者を含む実証的調査を実施した。リスクレベルの異なる6つの典型的な日常タスク（フライト予約、クレジットカード決済）にわたりLLMエージェントを調査した。計画後実行（plan-then-execute）構造を用い、エージェントは統制された環境でステップ単位の計画と逐次的な実行を行った。分析の結果、異なる段階でのユーザー参加が信頼とチームの有効性にどう影響するかが明らかになった。結果は、LLMエージェントが両刃の剣として機能することを示す——高品質な計画と適切なユーザー関与があれば良好に機能するが、ユーザーはもっともらしく見える計画に対して不当な信頼を抱きがちである。本研究は、LLMベースの日常アシスタントにおけるユーザー信頼の較正と協調的成果の改善のための設計ガイダンスを提供する。

## 概要

本論文は、LLMエージェントを日常タスクのアシスタントとして使用する際のユーザー信頼とチーム性能を、248名の参加者による大規模実証実験で調査した研究である。

主要な貢献：

1. **Plan-Then-Execute フレームワークの実装と評価**: 計画段階と実行段階を分離した2段階協調ワークフローの設計と、4つの参加条件での体系的評価
2. **信頼較正の問題の発見**: ユーザーがもっともらしく見える計画に対して不当な信頼を抱く「過信」問題を実証的に特定
3. **ユーザー参加の二面性**: ユーザー関与が必ずしも性能改善につながらないケースの特定（高品質計画への不要な編集による品質低下）
4. **リスクレベル別の分析**: 高リスク（金融・修理）と低リスク（アラーム・旅行）タスクでのユーザー行動の違いを定量化
5. **設計ガイダンスの提示**: 適応的なユーザー関与制御、信頼較正メカニズム、リスク認知に基づくインタラクション設計の提案

## 問題と動機

- **LLMエージェントの信頼性問題**: LLMエージェントが生成する計画がもっともらしく見えるが実際には不正確な場合があり、ユーザーがこれを見抜けない
- **計画と実行の分離の未解明**: 計画段階と実行段階のどちらでユーザーが関与すべきかについてのエビデンスが不足
- **リスク別の対応戦略の欠如**: タスクのリスクレベルに応じたユーザー関与の最適化が未研究
- **信頼較正のメカニズム**: ユーザーのエージェントに対する信頼が適切に較正されているかを測定する方法論が未確立
- **認知負荷とのトレードオフ**: ユーザー関与を増やすことによる性能改善と認知負荷増加のバランスが未解明

## 提案手法

### 1. Plan-Then-Execute フレームワーク

2段階の協調ワークフロー：

**計画段階**:
- LLMエージェント（GPT-3.5-turbo）が階層的なステップ計画を生成（1., 1.x, 1.x.y形式）
- ユーザー参加条件（UP）では、4種類の編集操作（追加・削除・編集・分割）で計画を修正可能
- 自動条件（AP）では、エージェント生成の計画をそのまま使用

**実行段階**:
- 各計画ステップに対してエージェントが予測アクションを生成
- ユーザー参加条件（UE）では、3種類の応答（Proceed / Feedback / Specify Action）から選択
- 自動条件（AE）では、エージェントのアクションをそのまま実行
- シミュレーション環境（Flaskバックエンド）で全アクションを安全に実行

### 2. 4条件の実験設計

2×2 被験者間計画：

- **AP-AE**: 自動計画＋自動実行（N=63）
- **AP-UE**: 自動計画＋ユーザー関与実行（N=64）
- **UP-AE**: ユーザー関与計画＋自動実行（N=61）
- **UP-UE**: ユーザー関与計画＋ユーザー関与実行（N=60）

### 3. 信頼較正の定量化

**計画の較正済み信頼（CTp）**:
- 信頼表明が「はい」かつ計画品質が最高（5点）、または信頼が「いいえ」かつ品質が5未満のケースをカウント
- 0（不適切な較正）〜1（完全な較正）のバイナリ指標

**実行の較正済み信頼（CTe）**:
- 信頼表明が「はい」かつ実行が正確、または信頼が「いいえ」かつ実行が不正確のケースをカウント
- 主観的信頼と客観的成果の整合性を測定

## アルゴリズム / 疑似コード

```
Algorithm: Plan-Then-Execute Collaborative Workflow
Input: task T, LLM agent A (GPT-3.5-turbo), user U, condition C ∈ {AP-AE, AP-UE, UP-AE, UP-UE}
Output: task_result, trust_metrics

--- Planning Stage ---
1. plan P ← A.generate_plan(T)
2. IF C ∈ {UP-AE, UP-UE}:  // User-involved planning
   a. PRESENT plan P to user U
   b. U.edit(P) using {add, delete, edit, split} operations
   c. P ← updated plan
3. RECORD trust_plan ← U.assess("Do you trust this plan?")
4. EVALUATE plan_quality ← expert_rating(P, scale=1-5)

--- Execution Stage ---
5. FOR each primary step s ∈ P:
   a. predicted_action ← A.predict_action(s, context)
   b. IF C ∈ {AP-UE, UP-UE}:  // User-involved execution
      - PRESENT predicted_action to U
      - user_response ← U.choose({Proceed, Feedback, Specify_Action})
      - IF user_response == Feedback:
          refined_action ← A.refine(predicted_action, U.feedback)
          action ← refined_action
      - ELIF user_response == Specify_Action:
          action ← U.specified_action
      - ELSE:
          action ← predicted_action
   c. ELSE:
      action ← predicted_action
   d. result ← SimEnvironment.execute(action)
6. RECORD trust_exec ← U.assess("Do you trust the execution?")

--- Evaluation ---
7. CTp ← calibrated_trust(trust_plan, plan_quality)
8. CTe ← calibrated_trust(trust_exec, execution_accuracy)
9. RETURN task_result, {CTp, CTe, ACCs, ACCe}
```

## アーキテクチャ / プロセスフロー

```
┌──────────────────────────────────────────────────────────────────┐
│              Plan-Then-Execute 協調ワークフロー                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐                                                 │
│  │ タスク入力    │  (例: フライト予約、クレジットカード決済)          │
│  └──────┬──────┘                                                 │
│         │                                                         │
│  ═══════▼═══════════════════════════════════════                  │
│  ║     計画段階 (Planning Stage)               ║                  │
│  ║                                              ║                  │
│  ║  LLMエージェント ──▶ 階層的計画生成           ║                  │
│  ║       │                                      ║                  │
│  ║       ▼                                      ║                  │
│  ║  [条件分岐]                                  ║                  │
│  ║   AP: 計画を確定      UP: ユーザーが編集      ║                  │
│  ║   （自動）            （追加/削除/編集/分割）   ║                  │
│  ║       │                      │               ║                  │
│  ║       └──────────┬───────────┘               ║                  │
│  ║                  │                            ║                  │
│  ║         信頼評価（計画への信頼）                ║                  │
│  ═══════════════════╪════════════════════════════                  │
│                     │                                             │
│  ═══════════════════▼════════════════════════════                  │
│  ║     実行段階 (Execution Stage)              ║                  │
│  ║                                              ║                  │
│  ║  FOR each step in plan:                      ║                  │
│  ║    LLMエージェント ──▶ アクション予測          ║                  │
│  ║         │                                    ║                  │
│  ║    [条件分岐]                                ║                  │
│  ║     AE: 自動実行       UE: ユーザー判断       ║                  │
│  ║                        ┌──────────────────┐  ║                  │
│  ║                        │ Proceed (承認)    │  ║                  │
│  ║                        │ Feedback (修正)   │  ║                  │
│  ║                        │ Specify (指定)    │  ║                  │
│  ║                        └──────────────────┘  ║                  │
│  ║         │                      │             ║                  │
│  ║         └──────────┬───────────┘             ║                  │
│  ║                    ▼                          ║                  │
│  ║        シミュレーション環境でアクション実行      ║                  │
│  ║                    │                          ║                  │
│  ║         信頼評価（実行への信頼）                ║                  │
│  ═════════════════════╪══════════════════════════                  │
│                       │                                           │
│           ┌───────────▼───────────┐                              │
│           │  タスク結果 + 信頼指標   │                              │
│           │  CTp, CTe, ACCs, ACCe  │                              │
│           └───────────────────────┘                              │
└──────────────────────────────────────────────────────────────────┘
```

## Figures & Tables

### Table 1: 6タスクの設計とリスク分類

| タスク | ドメイン | リスク | 複雑度 | 計画品質 | 概要 |
|-------|--------|:---:|:---:|:---:|------|
| T1 | 金融 | 高 | 単純 | 不完全 | ユーロ/ドル通貨取引 |
| T2 | 金融 | 高 | 複雑 | 不完全 | クレジットカード債務返済 |
| T3 | 修理 | 高 | 複雑 | 不完全 | テレビ修理サービス予約 |
| T4 | アラーム | 低 | 単純 | 正確 | 平日アラーム設定 |
| T5 | フライト | 低 | 単純 | 正確 | ロンドン→アムステルダム予約 |
| T6 | 旅行 | 低 | 複雑 | 正確 | 日本旅行プラン作成 |

### Table 2: 4条件における主要性能指標

| 条件 | N | 計画較正信頼 (CTp) | 実行較正信頼 (CTe) | アクション系列精度 (ACCs) | 実行精度 (ACCe) |
|------|:---:|:---:|:---:|:---:|:---:|
| AP-AE | 63 | 0.51 | 0.64 | **0.53** | 0.50 |
| AP-UE | 64 | 0.50 | 0.66 | 0.47 | 0.52 |
| UP-AE | 61 | 0.49 | 0.64 | 0.45 | 0.50 |
| UP-UE | 60 | 0.50 | 0.65 | 0.46 | **0.56** |
| 全体平均 | 248 | 0.50 | 0.64 | 0.48 | 0.52 |

### Table 3: リスクレベル別のタスク実行精度

| タスク | リスク | AP-AE | AP-UE | UP-AE | UP-UE |
|-------|:---:|:---:|:---:|:---:|:---:|
| T1 (通貨取引) | 高 | 1.8% | 4.7% | 3.3% | 13.0% |
| T2 (債務返済) | 高 | 78% | 72% | 57% | 75% |
| T3 (修理予約) | 高 | 44% | 28% | 52% | 29% |
| T4 (アラーム) | 低 | **95%** | 91% | 82% | 84% |
| T5 (フライト) | 低 | 90% | 95% | **98%** | 97% |
| T6 (旅行計画) | 低 | 6% | 13% | 10% | **23%** |

### Table 4: ユーザー編集操作の分布

| 操作タイプ | 件数 | 割合 |
|----------|:---:|:---:|
| 削除（ステップの削除） | 394 | 43.6% |
| 追加（ステップの追加） | 183 | 20.3% |
| 分割（複合ステップの分解） | 126 | 14.0% |
| テキスト編集 | 200 | 22.1% |
| **合計** | **903** | 100% |

### Table 5: 実行段階のユーザー介入分布

| 介入タイプ | 件数 | 割合 |
|----------|:---:|:---:|
| アクション指定（Specify Action） | 445 | 63.7% |
| 実行後フィードバック | 163 | 23.3% |
| 実行前フィードバック | 91 | 13.0% |
| **合計** | **699** | 100% |

### Figure 1: 信頼較正と計画品質の関係

```
較正済み信頼 (CTp)
     │
1.0 ─┤  T4●────────●T5
     │       ○T4          ●T5
0.9 ─┤  (正確な計画 → 高い較正)
     │
0.8 ─┤       ●T6
     │
0.7 ─┤
     │
0.6 ─┤
     │
0.5 ─┤
     │
0.4 ─┤
     │
0.3 ─┤       ○T2
     │  ○T1
0.2 ─┤           ○T3
     │  (不完全な計画 → 低い較正 = 過信)
0.1 ─┤
     │
0.0 ─┴──┬───┬───┬───┬───┬───┬───
        1   2   3   4   5
        計画品質スコア

● = 正確な計画のタスク (T4,T5,T6)
○ = 不完全な計画のタスク (T1,T2,T3)
相関係数 r = 0.723, p < 0.001
```

### Figure 2: 認知負荷の条件間比較（NASA-TLX）

```
NASA-TLX スコア（低←→高）
                   AP-AE    AP-UE    UP-AE    UP-UE
Mental Demand    ──███──  ──███──  ──█████──  ──██████──
                   3.2      3.4      4.1*       4.5*
Temporal Demand  ──██──   ──███──  ──████──   ──█████──
                   2.8      3.1      3.7*       4.2*
Frustration      ──██──   ──███──  ──████──   ──█████──
                   2.5      2.9      3.5*       4.0*
Performance      ──███──  ──████── ──███──    ──█████──
                   3.3      3.8*     3.4       4.3*
Effort           ──███──  ──████── ──████──   ──██████──
                   3.1      3.6*     3.5       4.4*

* p < 0.0125（Bonferroni補正後）
ユーザー関与の増加 → 認知負荷の有意な増大
```

## 実験と評価

### 参加者と手続き

248名の参加者をProlificプラットフォームから募集（初期スクリーニング347名）。平均年齢32.5歳（SD=8.1）、49.6%が女性。LLM使用経験の平均は5点中3.6。各参加者は4条件のいずれかにランダム割当てされ、6つのタスクをランダム順序で実施した。報酬は時給£8.1に加え、高品質な計画・正確な実行結果に対するボーナスを支給。

### 仮説検証結果

**H1（ユーザー関与が計画への較正信頼を改善する）: 不支持**
- タスク4のみで有意な効果（p<0.0125）が確認されたが、予想に反してAP条件がUP条件より高い較正信頼を示した
- ユーザーが計画を編集することで、正確な計画を不正確に変更してしまうケースが観察された

**H2（ユーザー関与が全体的タスク性能を改善する）: 部分的に支持**
- 計画品質: 正確な計画（T4-T6）に対するユーザー編集は品質を低下させ、不完全な計画（T1）に対する編集は改善をもたらした
- アクション系列精度: AP-AEが最高（M=0.53）で、ユーザー関与は一貫した改善を示さなかった

**H3（ユーザー関与が実行への較正信頼を改善する）: 不支持**
- 4条件間でCTeに有意差なし（一元配置ANOVA）

**H4（ユーザー関与が実行性能を改善する）: 部分的に支持**
- タスク6でのみ有意な改善（p<0.0125）。タスク3では自動実行が有意に優れていた

### ユーザー行動分析

計画段階では121名中104名（86%）が少なくとも1つの計画を編集。最も多い操作は削除（394件）で、次いでテキスト編集（200件）、追加（183件）、分割（126件）。実行段階では124名中114名（92%）が少なくとも1つのアクションを変更し、アクション指定（445件）が最多であった。

### 失敗事例分析

高品質計画を持つ235件の実行失敗を分析した結果：
- 48.9%: パラメータ値の誤り（タスク要件と一致しない値）
- 48.5%: 無効なアクション（有効なアクション名/パラメータの予測失敗）
- 2.6%: アクション名の誤り

### 主要な知見

1. **計画のもっともらしさが過信を生む**: LLMが生成する計画は表面的に説得力があるため、ユーザーは隠れた誤りを見落としがちである
2. **文脈依存的なユーザー関与**: 不完全な計画ではユーザー編集が有益だが、正確な計画では有害になりうる
3. **高リスクタスクでの信頼較正の失敗**: 金融タスク（T1,T2）では較正信頼が0.12-0.27と著しく低く、ユーザーが計画の正確性を判断できていない

## 備考

- 本研究はCHI 2025に条件付き採択されており、人間-AI協調の分野で最も権威のある会議の一つで発表される
- Plan-Then-Execute構造はLangChainの計画実行エージェントアーキテクチャに直接対応しており、実装面でも実用性が高い
- 「もっともらしさの罠」（plausibility trap）の発見は、LLMエージェント全般に適用される重要な知見であり、単にエージェントの能力を向上させるだけでなく、ユーザーとの適切なインタラクション設計の重要性を示している
- 248名規模の被験者実験はLLMエージェント分野では大規模であり、統計的検出力の点で信頼性の高い結果を提供している
- GPT-3.5-turboの使用は2025年時点では性能面で制約があり、GPT-4o等のより高性能なモデルでの追試が望まれる
- シミュレーション環境での実験であるため、実際の金銭的リスクが存在しない。実環境での行動はさらに慎重になる可能性がある
- データ分析エージェントへの示唆として、分析計画をユーザーに提示し承認を得るワークフローは有効だが、計画のもっともらしさに依存した過信のリスクを考慮し、計画の不確実性を明示的に表示する設計が推奨される
- NASA-TLXによる認知負荷測定の結果は、ユーザー関与の増加が必ずしもユーザー体験の向上を意味しないことを定量的に示しており、関与の最適化（いつ・どの程度関与すべきか）の重要性を裏付けている
