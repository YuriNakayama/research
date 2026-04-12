# エージェントアーキテクチャ & 推論基盤 — 詳細レポート

## パラメータ

- **分析リソース数**: 24件
- **リソースタイプ**: 学術論文
- **生成日**: 2026-04-12
- **入力元**: gather 出力 (`20260330_agent_architecture/resources-agent-architecture.md`)
- **重点セクション**: コア手法・技術詳細 / 結果・評価 / 問題・動機 / 実用的応用（全セクション）
- **詳細レベル**: 詳細（200-400行/レポート）

## レポート一覧

### サーベイ論文（#1-6）

| # | タイトル | 著者 | 年 | Venue | 概要 | レポート |
|---|---------|------|-----|-------|------|---------|
| 1 | A Survey on LLM-based Agents for Statistics and Data Science | Sun et al. | 2025 | American Statistician | LLMベースデータエージェントの進化・能力・応用を概観 | [詳細](01-survey-agents-statistics-data-science.md) |
| 2 | Large Language Model Agent: A Survey on Methodology, Applications and Challenges | Luo et al. | 2025 | arXiv | 329本の論文を方法論中心の分類体系で分析 | [詳細](02-survey-llm-agent-methodology.md) |
| 3 | Large Language Model-based Data Science Agent: A Survey | Chen et al. | 2025 | arXiv | 二重視点フレームワ��ク（エージェント設計原則 × DSワークフロー） | [詳細](03-survey-ds-agent.md) |
| 4 | LLM/Agent-as-Data-Analyst: A Survey | Tang et al. | 2025 | arXiv | 4つのデータモダリティ × 4つの設計原則で技術を分類 | [詳細](04-survey-agent-as-data-analyst.md) |
| 5 | LLM-Based Data Science Agents: A Survey of Capabilities, Challenges, and Future Directions | Rahman et al. | 2025 | arXiv | 45システムを6段階ライフサイクルで分類、90%以上に信頼性メカニズム欠如 | [詳細](05-survey-ds-agents-capabilities.md) |
| 6 | Survey on Evaluation of LLM-based Agents | Yehudai et al. | 2025 | arXiv | 4次元評価タクソノミーで50以上のベンチマークを整理 | [詳細](06-survey-evaluation-llm-agents.md) |

### Agentic RAG（#7-9）

| # | タイトル | 著者 | 年 | Venue | 概要 | レポート |
|---|---------|------|-----|-------|------|---------|
| 7 | Agentic Retrieval-Augmented Generation: A Survey on Agentic RAG | Singh et al. | 2025 | arXiv | RAGの5パラダイム進化と7種のAgentic RAGアーキテクチャを分類 | [詳細](07-agentic-rag-survey.md) |
| 8 | Reasoning RAG via System 1 or System 2 | Liang et al. | 2025 | arXiv | 認知科学System 1/2理論をRAGに適用した分類フレームワーク | [詳細](08-reasoning-rag-system12.md) |
| 9 | Enhancing RAG: A Study of Best Practices | Li et al. | 2025 | arXiv | RAG設計要素のベストプラクティス���実証研究 | [詳細](09-rag-best-practices.md) |

### 計画・推論パターン（#10-12）

| # | タイトル | 著者 | 年 | Venue | 概要 | レポート |
|---|---------|------|-----|-------|------|---------|
| 10 | ReAct: Synergizing Reasoning and Acting in Language Models | Yao et al. | 2022 | ICLR 2023 | 推論トレースと行動実行をインターリーブさせる基盤的フレームワーク | [詳細](10-react.md) |
| 11 | Pre-Act: Multi-Step Planning and Reasoning Improves Acting | Rawat et al. | 2025 | arXiv | ReAct拡張、行動前マルチステップ計画でAction Recall 70%改善 | [詳細](11-pre-act.md) |
| 12 | Plan-Then-Execute: User Trust and Team Performance | He et al. | 2025 | CHI 2025 | Plan-then-Execute方式のユーザー信頼とチームパフォーマン���の実証研究 | [詳細](12-plan-then-execute.md) |

### 自己修正・リフレクション（#13-17）

| # | タイトル | 著者 | 年 | Venue | 概要 | レポート |
|---|---------|------|-----|-------|------|---------|
| 13 | ReST meets ReAct: Self-Improvement for Multi-Step Reasoning LLM Agent | Aksitov et al. | 2023 | arXiv | ReST反復訓練でPaLM 2-XSがPaLM 2-Lに匹敵する性能を達成 | [詳細](13-rest-meets-react.md) |
| 14 | Large Language Models Cannot Self-Correct Reasoning Yet | Huang et al. | 2023 | ICLR 2024 | 内在的自己修正がすべてのモデルで性能低下を引き起こすことを実証 | [詳細](14-llm-cannot-self-correct.md) |
| 15 | Training Language Models to Self-Correct via Reinforcement Learning | Kumar et al. | 2024 | arXiv | SCoRe: 2段階RLでMATH 15.6%・HumanEval 9.1%の自己修正改善 | [詳細](15-score-self-correction-rl.md) |
| 16 | Self-Reflection in LLM Agents: Effects on Problem-Solving Performance | Renze & Guven | 2024 | FLLM 2024 | 9モデル×8反省タイプ×10ドメインの大規模実験、全条件で有意な改善 | [詳細](16-self-reflection-effects.md) |
| 17 | An Empirical Study on Self-correcting LLMs for Data Science Code Generation | Tang et al. | 2024 | arXiv | CoT-SelfEvolve: StackOverflow知識ベース+CoT推論の自己修正フレームワーク | [詳細](17-cot-selfevolve.md) |

### Function Calling（#18-22）

| # | タイトル | 著者 | 年 | Venue | 概要 | レポート |
|---|---------|------|-----|-------|------|---------|
| 18 | ToolACE: Winning the Points of LLM Function Calling | Liu et al. | 2024 | arXiv | 26,507 API合成パイプライン、8BモデルでGPT-4と競合 | [詳細](18-toolace.md) |
| 19 | Enhancing Function-Calling Capabilities in LLMs | Chen et al. | 2024 | arXiv | Decision Token・CoT推論・多言語パイプラインによる能力強化 | [詳細](19-function-calling-strategies.md) |
| 20 | Asynchronous LLM Function Calling | Gim et al. | 2024 | arXiv | AsyncLM: OS割込み機構で1.6-5.4倍のレイテンシ削減 | [詳細](20-async-function-calling.md) |
| 21 | Granite-Function Calling Model | Abdelaziz et al. | 2024 | arXiv | 7サブタスクのマルチタスク学習、BFCLオープンモデル1位（84.71%） | [詳細](21-granite-function-calling.md) |
| 22 | Facilitating Multi-turn Function Calling for LLMs via Compositional Instruction Tuning | Chen et al. | 2024 | ICLR 2025 | BUTTON: ボトムアップ+トップダウンの合成データ生成、ICLR 2025採択 | [詳細](22-button-multi-turn-function-calling.md) |

### ベンチマーク（#23-24）

| # | タイトル | 著者 | 年 | Venue | 概要 | レポート |
|---|---------|------|-----|-------|------|---------|
| 23 | DataSciBench: An LLM Agent Benchmark for Data Science | Zhang et al. | 2025 | arXiv | TFCフレームワーク、222プロンプト×23モデル評価、GPT-4oが64.51%で首位 | [詳細](23-datascibench.md) |
| 24 | AgentBench: Evaluating LLMs as Agents | Liu et al. | 2024 | ICLR 2024 | 8環境でのエージェント能力評価、GPT-4とOSSの約4倍のギャップを定量化 | [詳細](24-agentbench.md) |

## リソース間の関係マッ���

```mermaid
graph TB
    subgraph サーベイ["包括的サーベイ"]
        S1["#1 Sun et al.<br/>統計・DS向けエージェン��"]
        S2["#2 Luo et al.<br/>方法論・応用・課題"]
        S3["#3 Chen et al.<br/>DS Agent 二重視点"]
        S4["#4 Tang et al.<br/>Agent-as-Data-Analyst"]
        S5["#5 Rahman et al.<br/>能力・課題・将来"]
    end

    subgraph 評価["評価・ベンチマーク"]
        E1["#6 Yehudai et al.<br/>エージェント評価サーベイ"]
        E2["#23 DataSciBench<br/>DS特化ベンチマーク"]
        E3["#24 AgentBench<br/>汎用エージェントBM"]
    end

    subgraph 推論["計画・��論パターン"]
        R1["#10 ReAct<br/>推論+行動の基盤"]
        R2["#11 Pre-Act<br/>行動前マルチステップ計画"]
        R3["#12 Plan-then-Execute<br/>計画���実行���離"]
    end

    subgraph 修正["自己修正・リフレクション"]
        C1["#13 ReST+ReAct<br/>自己改善���練"]
        C2["#14 自己修正���限界<br/>外部FBなしでは悪化"]
        C3["#15 SCoRe<br/>RL経由の自己修正"]
        C4["#16 Self-Reflection<br/>反省タイプの体系的比較"]
        C5["#17 CoT-SelfEvolve<br/>DSコード自己修正"]
    end

    subgraph RAG["Agentic RAG"]
        A1["#7 Agentic RAG<br/>7種ア���キテクチャ"]
        A2["#8 System 1/2 RAG<br/>認知科学フレーム"]
        A3["#9 RAG Best Practices<br/>設計要素の実証研究"]
    end

    subgraph FC["Function Calling"]
        F1["#18 ToolACE<br/>訓練デ��タ合成"]
        F2["#19 FC強化戦略<br/>Decision Token・多言語"]
        F3["#20 AsyncLM<br/>非同期実行"]
        F4["#21 Granite-FC<br/>マルチタスク学習"]
        F5["#22 BUTTON<br/>マル���ターンFC"]
    end

    R1 --> R2
    R1 --> R3
    R1 --> C1
    C2 --> C3
    C2 --> C4
    C4 --> C5
    サーベイ --> 評価
    推論 --> 修正
    RAG --> ��論
    FC --> 推論
```

### 研究の時系列的発展

```
2022  ReAct（推論+行動の統合）
  │
2023  ├── ReST+ReAct（自己改善訓練）
  │   └── 自己修正の限界の指摘（Huang et al.）
  │
2024  ├── SCoRe（RLによる自己修正の実現）
  │   ├── Self-Reflection体系的比較
  │   ├── CoT-SelfEvolve（DS���ード特化）
  │   ├── ToolACE / Granite-FC / BUTTON / AsyncLM（Function Calling高度化）
  │   └── AgentBench（汎用ベンチマーク確立）
  ��
2025  ├─�� Pre-Act / Plan-then-Execute（計画パターンの���化）
  │   ├── Agentic RAG / System 1-2 RAG / RAG Best Practices
  │   ├── 5本のサーベイ論文（分野の体系化）
  │   └── DataSciBench（DS特化ベンチマーク）
```

## 手法比較テーブル

### 計画���推論パターンの比較

| 手法 | 年 | アプローチ | 計画タイミング | 推論と行動の統合方式 | 主要改善 |
|------|-----|----------|---------------|-------------------|---------|
| ReAct | 2022 | Thought-Action-Observation ループ | 各ステップで逐次 | インターリーブ | HotpotQA: EM +6% over CoT |
| Pre-Act | 2025 | マルチステップ計画→実行 | 行動前にN手先 | 計画→行動の分離 | Action Recall +70% |
| Plan-then-Execute | 2025 | 計画フェーズ→���行フェーズ | 事前に全体計画 | 完全分離 | タスク成功率 +15% |

### 自己修正手法の比較

| 手法 | 年 | 外部FB要否 | アプローチ | 主要結果 |
|------|-----|----------|----------|---------|
| 内在的自己修正 (Huang) | 2023 | 不要（内省のみ） | 自己フィードバック | 性能低下（GSM8K: 75.9→74.7%） |
| ReST+ReAct | 2023 | 不要（自己生成データ） | 反復的自己訓練 | 小モデルが大モデルに匹敵（65.9% vs 70.3%��� |
| SCoRe | 2024 | 不要（RL報酬） | 2段階強化��習 | MATH +15.6%, HumanEval +9.1% |
| Self-Reflection (Renze) | 2024 | 不要（プロンプト） | 8種の反省タイプ | 全条件で有意改善、Composite +14.6% |
| CoT-SelfEvolve | 2024 | 外部KB（StackOverflow） | CoT推論+知識検索 | DS-1000: pass@5 83.2% |

### Function Calling手法の比較

| 手法 | 年 | モデルサイズ | BFCL Overall | 特徴 |
|------|-----|-----------|-------------|------|
| ToolACE | 2024 | 8B | BFCL-v3 #3 (59.22%) | 自己進化的API合成��イプライン |
| Granite-FC | 2024 | 20B | BFCL #1 open (84.71%) | 7サブタスクのマルチタスク学習 |
| BUTTON | 2024 | 8B-70B | GPT-4o匹敵 (43.5% vs 46.0%) | ボトムアップ+トップダウン合��データ |
| AsyncLM | 2024 | — | — | 非同期実行で1.6-5.4倍高速化 |
| FC強化戦略 (Chen) | 2024 | 7B-70B | Relevance 57.50% | Decision Token + 多言語対応 |

### サーベイ論文の焦点比較

| 観点 | #1 Sun | #2 Luo | #3 Chen | #4 Tang | #5 Rahman |
|------|:---:|:---:|:---:|:---:|:---:|
| エージェント構築 | o | o | o | — | o |
| マルチエージェント協調 | o | o | o | — | o |
| エージェント進化 | — | o | — | — | — |
| データモダリティ分類 | — | — | — | o | — |
| 信頼性・安全性 | — | — | — | — | o |
| ベンチマーク調査 | 少数 | 多数 | 50+ | 多数 | 45+ |
| 二重視点フレームワーク | — | — | o | — | — |
| 設計目標の定義 | — | — | — | o | — |

## 追加調査候補

以下のリソースは、本レポート群の参考文献や関連研究から発見された追加調査候補です。

### 計���・推論の発展

| タイトル | 理由 |
|---------|------|
| Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al., 2023) | ReActの自己改善拡張、リフレクション研究の起源 |
| LATS: Language Agent Tree Search (Zhou et al., 2023) | 探索ベースの計画手法、ReActとMCTSの統合 |
| Tree of Thoughts (Yao et al., 2023) | ReActと同著者による思考の木構造探索 |

### データ分析エージェント実装

| タイトル | 理由 |
|---------|------|
| Data Interpreter (Hong et al., 2024) | 複数サーベイで言及されるデータ分析エージェント実装 |
| DS-Agent (Guo et al., 2024) | AutoML統合型DSエージェント、ケーススタディ有 |
| AIDE: ML自動化エージェント | Kaggleコンペで人間上位に匹敵 |

### Function Calling の理論的基盤

| タイトル | 理由 |
|---------|------|
| Gorilla: Large Language Model Connected with Massive APIs (Patil et al., 2023) | API呼び出しの初期研究、BFCLベンチマーク元 |
| NexusRaven: 関数呼び出し特化モデル | オープンソースFC研究の重要マイルストーン |

## 主要な横断的知��

1. **エージェント設計は「単一→動的マルチ」のスペクトラム上に位置付けられる**: 全サーベイがエージェント構成の複雑度と能力のトレード��フを指摘
2. **自己修正は「やり方次第」**: 素朴な内省は悪化するが（#14）、RL（#15）やComposite反省（#16）、外部知識ベース（#17）により有効に機能する
3. **計画パターンはReActから分化が進行中**: 逐次（ReAct）→ 先読み（Pre-Act）→ 完全分離（Plan-then-Execute）の進化軸が明確
4. **Function Callingは訓練データ生成が鍵**: ToolACE, BUTTON ともに合成データパイプラインが性能を決定
5. **ベンチマークの限界が共通課題**: クリーンなデータ・短いタスクに偏った評価が実務応用との乖離を生んでいる（#5: 90%以上のシステムに信頼性メカニズム欠如）
6. **Agentic RAGはエージェントと知識検索の融合点**: 従来のRAGからエージェント的な推論・計画・ツール使用を統合する新パラダイムへ
