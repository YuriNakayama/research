# Exploration of LLM Multi-Agent Application Implementation Based on LangGraph+CrewAI

- **Link**: https://arxiv.org/abs/2411.18241
- **Authors**: Zhihua Duan, Jialin Wang
- **Year**: 2024
- **Venue**: arXiv preprint (cs.MA, cs.AI)
- **Type**: Academic Paper (Framework Integration / Multi-Agent System)

## Abstract

With the rapid development of large language model agents, multi-agents achieve complex tasks that are difficult for a single model or agent to handle through division of labor and collaboration among agents. This study focuses on how to build efficient multi-agent collaboration systems using LangGraph and CrewAI. The study explores the architecture design of multi-agents, focusing on how LangGraph can be used to construct agent structures and enable precise operational control through streamlined information flow. At the same time, it analyzes how CrewAI's intelligent task distribution and resource optimization capabilities can enhance agent functionality and expand applications across different fields. By combining these two frameworks, this study aims to bridge the gap between graph-based architecture efficiency and collaborative team frameworks, thereby advancing multi-agent technology and fostering innovation in language model-based intelligent systems.

## Abstract（日本語訳）

大規模言語モデルエージェントの急速な発展に伴い、マルチエージェントは単一モデルやエージェントでは困難な複雑なタスクを、エージェント間の分業と協調により達成する。本研究はLangGraphとCrewAIを用いた効率的なマルチエージェント協調システムの構築に焦点を当てる。LangGraphを用いたエージェント構造の構築と、効率化された情報フローによる精密な操作制御を可能にするアーキテクチャ設計を探求する。同時に、CrewAIの知的タスク分配とリソース最適化能力がエージェント機能を強化し、異なる分野へのアプリケーション拡張を可能にする方法を分析する。これら2つのフレームワークを組み合わせることで、グラフベースアーキテクチャの効率性と協調的チームフレームワークのギャップを埋め、マルチエージェント技術の進歩と言語モデルベース知的システムのイノベーション促進を目指す。

## 概要

本論文は、LangGraph（グラフベースのワークフロー管理）とCrewAI（ロールベースの協調管理）を統合したマルチエージェントシステムの設計と実装を探求する。2つのフレームワークの相補的な強みを活かし、コード生成とチケット処理のユースケースで有効性を実証する。

主要な貢献：

1. **LangGraph + CrewAI統合アーキテクチャ**: グラフベースのワークフロー制御とロールベースの協調管理を組み合わせた新しいマルチエージェント設計パターンの提案
2. **コード生成ユースケース**: LangGraphによる状態管理とCrewAIによるタスク分配を活用したコード生成パイプラインの実装
3. **チケット処理ユースケース**: カスタマーサポートにおけるチケットの自動分類・割当・処理のマルチエージェント化
4. **LangSmithによる監視統合**: エージェント間の通信とワークフロー実行の可視化・デバッグ
5. **Ollama + Faissの活用**: ローカルLLM実行とベクトル検索の統合によるオフライン対応

## 問題と動機

- **単一フレームワークの限界**: LangGraphは精密なワークフロー制御に優れるがチーム協調の抽象度が低い。CrewAIはロールベース協調に優れるがワークフロー制御の柔軟性が不足。いずれも単独では複雑なマルチエージェントシステムの要件を満たせない
- **グラフベース vs ロールベースの断絶**: ワークフローのグラフ構造とエージェントの役割分担を統合的に管理するアプローチが未確立
- **実用的な実装パターンの不足**: 学術的なフレームワーク提案は多いが、実際のプロダクション環境での統合実装パターンの知見が不足
- **監視・デバッグの課題**: 複数フレームワークを組み合わせた場合のエージェント動作の可観測性が低い
- **ローカル実行への需要**: セキュリティやコストの観点から、クラウドAPIに依存しないローカルLLM実行環境が求められている

## 提案手法

### 1. LangGraphによるワークフロー管理

LangGraphは有向グラフ構造でエージェント間の情報フローを定義：

- **StateGraph**: エージェント間で共有される状態オブジェクトを管理
- **ノード**: 各エージェントの処理ロジックを表現（関数ノード）
- **エッジ**: エージェント間のメッセージパッシングと条件分岐を定義
- **チェックポイント**: ワークフローの状態保存と障害回復

### 2. CrewAIによる協調管理

CrewAIはロールベースのエージェント協調を実現：

- **Agent**: 特定の役割（role）、目標（goal）、背景（backstory）を持つエージェント
- **Task**: エージェントに割り当てられる具体的なタスク定義
- **Crew**: エージェント群をチームとして組織し、タスク実行を管理
- **Process**: Sequential（順序実行）またはHierarchical（階層実行）のプロセス制御

### 3. 統合アーキテクチャ

LangGraphの精密な状態管理とCrewAIのチーム協調を組み合わせ：

- LangGraphがワークフロー全体の状態遷移とルーティングを制御
- CrewAIが各ノード内でのエージェントチーム協調を管理
- LangSmithがエンドツーエンドの可観測性を提供

### 4. ローカル実行環境

- **Ollama**: ローカルLLM推論エンジン（Llama、Mistral等のモデル実行）
- **Faiss**: Facebook AI Similarity Searchによるローカルベクトル検索
- クラウドAPI依存を排除し、セキュリティとコスト効率を向上

## アーキテクチャ / プロセスフロー

```
┌──────────────────────────────────────────────────────────────────┐
│                LangGraph + CrewAI 統合アーキテクチャ              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────── LangGraph (ワークフロー制御層) ───────────────┐  │
│  │                                                              │  │
│  │  [入力] ──▶ [ノード1] ──▶ [条件分岐] ──▶ [ノード2] ──▶ [出力]│  │
│  │              │                           │                   │  │
│  │         StateGraph                  StateGraph               │  │
│  │         (状態共有)                  (状態共有)                │  │
│  │              │                           │                   │  │
│  └──────────────┼───────────────────────────┼───────────────────┘  │
│                 │                           │                      │
│  ┌──────────────▼────┐          ┌───────────▼──────────┐          │
│  │  CrewAI チーム A   │          │  CrewAI チーム B      │          │
│  │                    │          │                       │          │
│  │  Agent: Coder      │          │  Agent: Reviewer      │          │
│  │  Agent: Tester     │          │  Agent: Deployer      │          │
│  │  Process: Sequential│         │  Process: Hierarchical│          │
│  └────────────────────┘          └───────────────────────┘          │
│                 │                           │                      │
│  ┌──────────────▼───────────────────────────▼──────────────────┐  │
│  │                    共有インフラ層                              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐       │  │
│  │  │   Ollama   │  │   Faiss    │  │   LangSmith      │       │  │
│  │  │  ローカルLLM│  │ ベクトルDB  │  │  監視・トレース   │       │  │
│  │  └────────────┘  └────────────┘  └──────────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Figures & Tables

### Table 1: LangGraphとCrewAIの特徴比較

| 特徴 | LangGraph | CrewAI | 統合による利点 |
|------|-----------|--------|-------------|
| ワークフロー制御 | 有向グラフ（精密） | Sequential/Hierarchical | グラフ精密制御 + チーム協調 |
| 状態管理 | StateGraph（強力） | 内部状態管理 | 階層的状態管理 |
| エージェント定義 | 関数ノード | ロール/目標/背景 | 構造 + 人格の統合 |
| タスク分配 | 条件分岐・ルーティング | 自動タスク割当 | インテリジェントルーティング |
| エラー処理 | チェックポイント | リトライ機構 | 堅牢なフォールバック |
| 可観測性 | LangSmith連携 | ログ出力 | エンドツーエンド可視化 |

### Table 2: ユースケース別の構成

| ユースケース | LangGraph役割 | CrewAI役割 | Agent構成 | 出力 |
|-------------|-------------|-----------|----------|------|
| コード生成 | 生成→レビュー→テストのフロー制御 | コーダー/レビュアー/テスターの協調 | 3 Agent | 品質保証済みコード |
| チケット処理 | 分類→割当→処理→完了の状態遷移 | サポート/エスカレーション/QAの分業 | 3+ Agent | 処理済みチケット |

### Table 3: 技術スタック詳細

| コンポーネント | 技術 | 役割 | 選定理由 |
|-------------|------|------|---------|
| ワークフローエンジン | LangGraph | 状態遷移・ルーティング制御 | 精密なグラフ制御が可能 |
| チーム協調 | CrewAI | ロールベースのAgent管理 | 直感的な役割定義 |
| LLM推論 | Ollama | ローカルLLM実行 | オフライン対応・低コスト |
| ベクトル検索 | Faiss | 類似文書検索・RAG | 高速・ローカル実行 |
| 監視 | LangSmith | トレース・デバッグ | LangChainエコシステム統合 |
| API | FastAPI | バックエンドAPI | 非同期・高性能 |

### Table 4: 関連フレームワークとの位置づけ

| フレームワーク | アプローチ | 強み | 弱み |
|-------------|---------|------|------|
| AutoGen | 会話プログラミング | 柔軟な会話パターン | ワークフロー可視化が弱い |
| MetaGPT | SOP駆動 | 構造化プロセス | 柔軟性が低い |
| LangGraph単体 | グラフベース | 精密な制御 | チーム抽象度が低い |
| CrewAI単体 | ロールベース | 直感的な協調 | ワークフロー制御が限定的 |
| **LangGraph+CrewAI** | **統合** | **精密制御 + 協調** | **統合の複雑性** |

### Figure 1: コード生成パイプラインのフロー

```
    ┌──────────┐
    │ 要件入力  │
    └────┬─────┘
         │
         ▼
    ┌──────────┐    CrewAI: Coder Agent
    │ コード生成 │────────────────────────┐
    └────┬─────┘                         │
         │                               │
         ▼                               │
    ┌──────────┐    CrewAI: Reviewer Agent│
    │ コードレビュー│◄────────────────────┘
    └────┬─────┘
         │
    ┌────▼──────┐
    │  合格？    │──No──▶ [コード生成に戻る]
    └────┬──────┘
         │ Yes
         ▼
    ┌──────────┐    CrewAI: Tester Agent
    │ テスト実行 │
    └────┬─────┘
         │
    ┌────▼──────┐
    │  合格？    │──No──▶ [コード生成に戻る]
    └────┬──────┘
         │ Yes
         ▼
    ┌──────────┐
    │ 最終出力  │
    └──────────┘

    ※ 全体のフロー制御: LangGraph StateGraph
    ※ 各ノード内の協調: CrewAI Crew
```

## 実験と評価

本論文は主にアーキテクチャ設計と実装パターンの提案に焦点を当てており、大規模な定量的ベンチマーク比較は実施していない。

### コード生成ユースケースの評価

- LangGraphの条件分岐により、レビュー不合格時の自動的な再生成ループを実現
- CrewAIのロールベースエージェント（Coder、Reviewer、Tester）による分業で、コード品質が単一エージェント比で向上
- LangSmithによるトレースで、各エージェントの処理時間と入出力を完全に可視化

### チケット処理ユースケースの評価

- チケットの自動分類精度と処理速度の改善を確認
- 複雑なチケットの階層的エスカレーションをCrewAIのHierarchical Processで実現
- LangGraphの状態管理により、処理途中のチケット状態を保持しリカバリ可能

### 主要な知見

1. **相補性の実証**: LangGraphの精密なフロー制御とCrewAIの直感的なチーム管理は相補的であり、統合により両者の弱点を補完
2. **Ollamaの実用性**: ローカルLLM実行により、APIコストを削減しつつプライバシーを確保。ただし推論速度はクラウドAPIに劣る
3. **LangSmithの重要性**: マルチフレームワーク統合環境では、エンドツーエンドの可観測性が開発・デバッグの鍵
4. **統合コストの認識**: 2つのフレームワークの統合には設定の複雑性が増すため、タスクの複雑度に応じた選択が必要

## 備考

- 本論文はLangGraphとCrewAIという2つの実用的フレームワークの統合に焦点を当てた実践志向の研究であり、新規アルゴリズムの提案ではなく統合パターンの知見を提供
- Ollama + Faissの組み合わせにより完全ローカル環境での実行を実現しており、機密データを扱う企業ユースケースに適用可能
- LangSmithはLangChainエコシステムの一部であり、LangGraphとの親和性が高い。CrewAI側のトレースもLangSmith経由で統一的に監視可能
- CrewAIは2024年に急速に普及したフレームワークであり、本論文はその早期の学術的分析として位置づけられる
- 実装コードの詳細は限定的であるが、両フレームワークの公式ドキュメントとの対応関係が明示されており、再現性は高い
