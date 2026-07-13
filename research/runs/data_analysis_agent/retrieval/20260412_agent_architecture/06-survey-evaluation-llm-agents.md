# Survey on Evaluation of LLM-based Agents

- **Link**: https://arxiv.org/abs/2503.16416
- **Authors**: Asaf Yehudai, Lilach Eden, Alan Li, Guy Uziel, Yilun Zhao, Roy Bar-Haim, Arman Cohan, Michal Shmueli-Scheuer
- **Year**: 2025
- **Venue**: arXiv preprint (cs.AI, cs.CL, cs.LG)
- **Type**: Academic Paper (Survey)

## Abstract

This paper introduces the first comprehensive survey examining evaluation methods for LLM-based agents. It analyzes evaluation benchmarks across four dimensions: fundamental agent capabilities (planning, tool use, self-reflection, memory); application-specific benchmarks (web, software engineering, scientific, conversational agents); generalist agent benchmarks; and evaluation frameworks. Key findings include a movement toward more realistic evaluations with regularly refreshed benchmarks. The authors identify significant research gaps in assessing cost-efficiency, safety, robustness, and developing fine-grained, scalable evaluation approaches.

## Abstract（日本語訳）

本論文は、LLMベースエージェントの評価手法を検討する初の包括的サーベイを提示する。4つの次元にわたる評価ベンチマークを分析する：基本的エージェント能力（計画、ツール使用、自己省察、記憶）、アプリケーション固有ベンチマーク（Web、ソフトウェアエンジニアリング、科学、対話エージェント）、汎用エージェントベンチマーク、および評価フレームワーク。主要な知見として、定期的に更新されるベンチマークによるより現実的な評価への移行が含まれる。著者らは、コスト効率、安全性、ロバスト性の評価、ならびにきめ細かくスケーラブルな評価アプローチの開発における重要な研究ギャップを特定している。

## 概要

本サーベイは、LLMベースエージェントの評価手法を初めて体系的に整理した論文である。静的LLMの評価（MMLU、AlpacaEvalなど）を明示的にスコープ外とし、エージェントの多段階実行・環境とのインタラクション・ツール使用といったエージェント固有の評価に焦点を当てている。

主要な貢献：

1. **4次元評価タクソノミーの提案**: 基本能力・アプリケーション特化・汎用・フレームワークの4軸で評価手法を分類
2. **50以上のベンチマークの体系的レビュー**: 各ベンチマークの設計思想、評価対象、限界を詳述
3. **評価粒度の4レベルの特定**: 最終応答・ステップ単位・軌跡ベース・データセット管理
4. **動的ベンチマークの潮流の発見**: 静的評価からリアルタイム更新型評価への移行トレンドを指摘
5. **4つの重要研究方向の提示**: きめ細かな評価、コスト効率、スケーリング・自動化、安全性・コンプライアンス

## 問題と動機

- **エージェント評価の体系的理解の欠如**: LLMベースエージェントの数が急増する中、これらを如何に評価すべきかについての包括的な調査が存在しなかった。

- **静的LLM評価の不適用性**: MMLU、GSM8Kなど従来のLLMベンチマークは単一呼び出しの能力を測定するものであり、多段階推論、ツール使用、環境との継続的インタラクションを伴うエージェントの評価には不十分である。

- **評価の粒度と現実性のトレードオフ**: 粗粒度のエンドツーエンド成功率メトリクスは中間段階の失敗を隠蔽し、一方で細粒度の評価は標準化が困難という二律背反がある。

- **安全性とコスト評価の軽視**: 現行ベンチマークの大多数がタスク完了率に焦点を当て、コスト効率、安全性、ポリシー遵守の評価が不十分である。

## 分類フレームワーク / タクソノミー

**4次元評価タクソノミー**

### 次元1: 基本エージェント能力

**1.1 計画と多段階推論**
- 3-10の逐次的論理操作の実行能力
- サブ能力：タスク分解、状態追跡、自己修正、因果理解、メタ計画
- 代表的ベンチマーク：GSM8K、MATH、HotpotQA、PlanBench、ACPBench

**1.2 関数呼び出しとツール使用**
- サブタスク：意図認識、関数選択、パラメータマッピング、実行、応答生成
- 評価進化：合成データセット・ルールベースマッチング → 状態保持実行・暗黙的依存関係
- 代表的ベンチマーク：ToolBench、BFCL v1-v3、ToolSandbox、Seal-Tools

**1.3 自己省察**
- インタラクティブなフィードバック取り込みと動的信念更新
- 代表的ベンチマーク：LLF-Bench、LLM-Evolve、Reflection-Bench

**1.4 記憶**
- 短期記憶（リアルタイム応答）と長期記憶（持続的理解）
- 代表的ベンチマーク：ReadAgent、MemGPT、StreamBench、LTMbenchmark

### 次元2: アプリケーション固有エージェント

**2.1 Webエージェント**: MiniWob++ → WebArena → WorkArena++への進化
**2.2 ソフトウェアエンジニアリングエージェント**: HumanEval → SWE-bench系列への進化
**2.3 科学エージェント**: アイデア生成からピアレビューまでの研究パイプライン
**2.4 対話エージェント**: ABCD、τ-Bench、IntellAgentなど

### 次元3: 汎用エージェント
- GAIA、AgentBench、OSWorld、TheAgentCompany

### 次元4: 評価フレームワーク
- 開発統合型：LangSmith、Langfuse、Arize AI
- Gym環境型：MLGym、BrowserGym、SWE-Gym

## アーキテクチャ / プロセスフロー

```
┌─────────────────────────────────────────────────────────────────┐
│           LLMベースエージェント評価の4次元タクソノミー            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  次元1: 基本能力              次元2: アプリ特化                  │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │ 計画・多段階推論  │         │ Web エージェント  │               │
│  │ ツール使用       │         │ SE エージェント   │               │
│  │ 自己省察        │         │ 科学エージェント  │               │
│  │ 記憶            │         │ 対話エージェント  │               │
│  └────────┬────────┘         └────────┬────────┘               │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌──────────────────────────────────────────┐                   │
│  │         評価粒度レベル                     │                   │
│  │  L1: 最終応答 → L2: ステップ → L3: 軌跡  │                   │
│  └──────────────────────────────────────────┘                   │
│           │                           │                         │
│           ▼                           ▼                         │
│  次元3: 汎用エージェント      次元4: 評価フレームワーク            │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │ GAIA             │         │ 開発統合型        │               │
│  │ AgentBench       │         │  LangSmith等     │               │
│  │ OSWorld          │         │ Gym環境型         │               │
│  │ TheAgentCompany  │         │  MLGym等         │               │
│  └─────────────────┘         └─────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## Figures & Tables

### Table 1: 基本能力ベンチマーク一覧

| 能力カテゴリ | ベンチマーク | 評価対象 | 特徴 |
|:----------:|:----------:|:------:|:---:|
| 計画・推論 | GSM8K, MATH | 数学的推論 | 多段階計算 |
| 計画・推論 | HotpotQA, StrategyQA | 多ホップQA | 複数文書横断推論 |
| 計画・推論 | PlanBench, ACPBench | 計画特化 | タスク分解能力 |
| ツール使用 | ToolBench, BFCL v1-v3 | 関数呼び出し | 合成→動的進化 |
| ツール使用 | ToolSandbox, Seal-Tools | 状態保持実行 | 暗黙的依存関係 |
| 自己省察 | LLF-Bench | インタラクティブ学習 | 標準化フィードバック |
| 自己省察 | Reflection-Bench | 認知科学的省察 | 6コンポーネント評価 |
| 記憶 | MemGPT, ReadAgent | コンテキスト管理 | 長文書処理 |
| 記憶 | StreamBench, LTMbenchmark | ストリーミング | 長期持続理解 |

### Table 2: アプリケーション固有ベンチマークの進化

| 領域 | 第1世代 | 第2世代 | 第3世代 | 進化の方向 |
|:---:|:------:|:------:|:------:|:---------:|
| Web | MiniWob, MiniWoB++ | WebShop, Mind2Web | WebArena, WorkArena++ | 単純シミュ→動的環境 |
| SE | HumanEval, MBPP | SWE-bench | SWE-bench Verified/+ | アルゴリズム→実リポジトリ |
| 科学 | ScienceQA | SciCode, SUPER | MLGym, DiscoveryWorld | 知識→完全研究サイクル |
| 対話 | MultiWOZ | ABCD, ALMITA | τ-Bench, IntellAgent | 静的収集→動的シミュ |

### Table 3: 評価フレームワーク機能マトリクス

| フレームワーク | ステップ評価 | モニタリング | 軌跡評価 | Human-in-Loop | 合成データ生成 | A/B比較 |
|:-----------:|:----------:|:----------:|:-------:|:------------:|:----------:|:------:|
| LangSmith | ○ | ○ | ○ | ○ | - | ○ |
| Google Vertex AI | ○ | ○ | ○ | ○ | - | ○ |
| Arize AI | ○ | ○ | - | ○ | ○ | ○ |
| Patronus AI | ○ | ○ | - | ○ | ○ | ○ |
| Databricks Mosaic AI | ○ | ○ | - | ○ | ○ | ○ |
| LangChain AgentEvals | ○ | ○ | - | - | - | ○ |

### Figure 1: ベンチマーク進化の時系列と現実性スペクトル

```
   現実性低                                              現実性高
   ◄──────────────────────────────────────────────────────────►

   Web:
   MiniWob ──→ WebShop ──→ Mind2Web ──→ WebArena ──→ WorkArena++
   (2022)      (2022)      (2023)      (2024)       (2024)

   SE:
   HumanEval ──→ SWE-bench ──→ SWE-bench Lite ──→ SWE-bench Verified
   (2021)        (2024)        (2024)              (2024)

   科学:
   ScienceQA ──→ SciCode ──→ CORE-Bench ──→ DiscoveryWorld
   (2022)        (2024)      (2024)         (2024)

   進化傾向: 単純タスク → 複雑実環境 → 動的更新 → 低成功率(~2%)
```

### Table 4: SWE-bench系列の詳細比較

| バリアント | タスク数 | 特徴 | 対処する問題 |
|:---------:|:------:|:---:|:---------:|
| SWE-bench (Original) | 2,294 | GitHubイシューベース | 実世界バグ修正 |
| SWE-bench Lite | 300 | バグ修正に限定 | 評価コスト削減 |
| SWE-bench Verified | 500 | 人手検証テストケース | テスト信頼性 |
| SWE-bench+ | - | ソリューション漏洩軽減 | データ汚染対策 |
| SWE-bench Multimodal | - | ビジュアルJavaScript | マルチモーダル対応 |
| SWT-Bench | - | ユーザーイシューからテスト生成 | テスト生成能力 |

## 主要な知見と分析

### 1. 現実的で挑戦的な評価への移行

ベンチマークは一貫して簡略化されたシミュレーションから動的な実環境へと進化している。MiniWobからWebArena、静的なLAB-BenchからDiscoveryWorldへの進化がこの傾向を示している。Natural PlanはGoogle Calendar/Mapsのシミュレート結果を使用するなど、現実世界の複雑性の統合が進んでいる。結果として、タスクの複雑性が増大し、エージェントの成功率が時に2%まで低下するケースも生じている。

### 2. ライブベンチマークの台頭

静的ベンチマークは飽和と急速な陳腐化のリスクを抱えている。BFCLはv1からv3まで、ライブデータセットと多ターンロジックを追加しながら3バージョンを経て進化した。SWE-benchファミリーもLite、Verified、+と多様なバリアントを展開している。IntellAgentのようにτ-Benchに基づく動的精製も登場している。

### 3. 粗粒度メトリクスの限界

現行の「粗粒度のエンドツーエンド成功率メトリクス」は中間段階の失敗を覆い隠す。WebCanvasのノード完了率やLangSmith、Galileo Agentic Evaluationsのようなきめ細かなメトリクスの標準化が求められている。

### 4. コスト効率評価の空白

現行のベンチマークはほぼ例外なく精度指向であり、トークン使用量、API費用、推論時間、リソース消費の標準化された追跡が欠如している。性能と運用実現可能性のバランスを取るコスト効率メトリクスの確立が急務である。

### 5. 安全性・コンプライアンスの重大なギャップ

安全性、信頼性、ポリシー遵守への焦点が限定的である。敵対的入力へのロバスト性、バイアス軽減、組織ポリシー遵守の評価は初期段階にあり、AgentHarm、ST-WebAgentBenchなど少数の取り組みに限られる。特にマルチエージェントシナリオにおける包括的な多次元安全性ベンチマークの開発が不可欠である。

## 将来の研究方向

1. **きめ細かな評価の推進**: 実行軌跡を捕捉する標準化された細粒度メトリクスの開発。ステップ単位の失敗診断メカニズムの構築。

2. **コスト・効率メトリクスの標準化**: トークン使用量、API費用、推論時間、リソース消費の体系的追跡。性能と運用コストのバランスを取る評価枠組みの確立。

3. **スケーリングと自動化**: 静的な人手アノテーションによる評価のスケーラビリティ課題の解決。IntellAgent、Mosaic AIによる合成データ生成と「Agent-as-a-Judge」アプローチの発展。

4. **安全性とコンプライアンス**: 敵対的入力へのロバスト性、バイアス軽減、組織ポリシー遵守を評価する包括的な多次元安全性ベンチマークの開発。マルチエージェントシナリオにおける安全性評価の確立。

## 備考

- LLMベースエージェントの評価手法を初めて体系的に整理した先駆的サーベイであり、本研究領域の今後の評価設計の基盤となる文献
- マルチエージェントシステム、ゲームエージェント、具現化エージェントはスコープ外と明示しており、焦点の明確性を保っている
- 「Agent-as-a-Judge」アプローチの台頭は、評価のスケーラビリティ問題に対する有望な方向性として注目に値する
- ヘブライ大学、IBM Research、イェール大学の共同研究であり、学術と産業の両面からの知見が統合されている
- 評価フレームワークの商用化（LangSmith、Arize AI等）が進んでおり、評価の実用化段階への移行を示している
