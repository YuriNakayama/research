# Nexus Architect: Adaptive Multi-Agent Reasoning via Automated Workflow Generation

## 論文メタデータ

| 項目 | 内容 |
|------|------|
| タイトル | Adaptive Multi-Agent Reasoning via Automated Workflow Generation |
| 著者 | Humza Sami, Mubashir ul Islam, Pierre-Emmanuel Gaillardon, Valerio Tenace |
| 発表年 | 2025 |
| 会議/ジャーナル | arXiv preprint (2025) |
| arXiv | 2507.14393 |
| コード | https://github.com/PrimisAI/nexus |
| ベンチマーク | https://github.com/PrimisAI/arcbench |

---

## Abstract (原文)

The paper introduces Nexus Architect, a multi-agent system framework designed to address generalization limitations in Large Reasoning Models. The system autonomously generates tailored reasoning workflows by selecting suitable strategies, tool integrations, and adversarial techniques, and includes iterative prompt refinement capabilities. Testing on challenging logical questions demonstrated significant performance gains, achieving up to a 66% increase in pass rate over Gemini 2.5 Flash Preview, and nearly 2.5x against Claude Sonnet 4 and DeepSeek-R1.

## Abstract (日本語)

本論文は、大規模推論モデル（LRM）の汎化能力の限界に対処するために設計されたマルチエージェントシステムフレームワーク「Nexus Architect」を紹介する。本システムは、適切な戦略・ツール統合・敵対的技法を選択することで、テーラーメイドの推論ワークフローを自律的に生成し、反復的プロンプト洗練（IPR）機能を含む。挑戦的な論理問題でのテストにより、Gemini 2.5 Flash Previewに対して最大66%のパスレート向上、Claude Sonnet 4およびDeepSeek-R1に対して約2.5倍の性能を達成した。

---

## 1. 概要

Nexus Architectは、標準的な（特殊化されていない）LLMを用いて、複雑な推論タスクに対するマルチエージェントワークフローを自動生成するフレームワークである。中核概念は以下の通り：

1. **5段階パイプライン**: タスク分解からワークフロー検証・洗練までの自動化された生成プロセス
2. **IPR（Iterative Prompt Refinement）フィードバックループ**: 失敗事例の分析に基づくシステムプロンプトの反復的改善
3. **ArcBench**: 推論モデルの汎化能力を評価するための新規ベンチマーク
4. **宣言的ワークフロー定義**: YAML形式によるローコードなワークフロー仕様

最高パスレート66.17%を達成し、既存の最先端推論モデルを大幅に上回った。

---

## 2. 問題と動機

### 2.1 大規模推論モデルの限界

近年のLRM（Large Reasoning Models）は以下の問題を抱えている：

1. **汎化能力の限界**: 訓練分布外の新規問題に対する推論能力が不十分
2. **パターンマッチングへの依存**: 真の演繹的推論ではなく、既知パターンの適用に偏る傾向
3. **単一モデルの限界**: 1つのモデルで多様な推論戦略をカバーすることの困難さ
4. **プロンプト設計の労力**: 効果的なシステムプロンプトの手動設計は専門知識と時間を要する

### 2.2 既存MASフレームワークの課題

- ワークフロー設計が手動であり、タスク固有のエンジニアリングが必要
- ツール統合のための標準化されたインターフェースの欠如
- プロンプトの反復的改善メカニズムの不在
- 汎化能力を厳密に評価するベンチマークの不足

### 2.3 研究目標

非専門化LLMの組み合わせにより、専門的推論モデルを超える性能を自動的に構成可能であることを示す。

---

## 3. 提案手法

### 3.1 5段階パイプライン

**Stage 1: タスク分解と計画（Task Decomposition & Planning）**
- ユーザープロンプトを構造化されたタスクリストと具体的要件に分解
- タスク間の依存関係と優先順位を特定

**Stage 2: 推論ワークフロー設計（Reasoning Workflow Design）**
- スーパーバイザー、エージェント、入出力フィールド、必要ツールを指定する包括的ブループリントを生成
- 階層的マルチスーパーバイザーオーケストレーションの設計

**Stage 3: コンポーネント構築とプロンプトエンジニアリング（Component Builders and Prompt Engineering）**
- フレームワーク仕様に基づいてスーパーバイザー、エージェント、ツールを初期システムプロンプトシードとともにインスタンス化
- Model Context Protocol（MCP）によるツールインターフェース標準化

**Stage 4: ワークフロー検証とテスト（Workflow Validation & Testing）**
- 自動化された検証と、提供された問題-解答ペアを用いた実証テスト
- 性能とタスク固有メトリクスの測定

**Stage 5: IPRフィードバックループ（IPR Feedback Loop）**
- 性能基準未達時に失敗事例を体系的に分析
- 問題点、根本原因、必要な変更を特定するフィードバック生成
- エージェントシステムプロンプトの修正指示に基づく洗練
- 性能目標達成までサイクルを反復

### 3.2 IPR（Iterative Prompt Refinement）メカニズム

強化学習的なフィードバックループとして機能：

1. 失敗事例の体系的生成と分析
2. 問題点・根本原因・必要変更の特定
3. 修正指示に基づくエージェントシステムプロンプトの洗練
4. 性能目標達成まで反復

実験Run 4のIteration 4では、サンプル10問セットのパスレートが60%から90%に向上。

### 3.3 Nexusフレームワークの特徴

- **階層的マルチスーパーバイザーオーケストレーション**: グローバルスーパーバイザーがタスクスーパーバイザーとワーカーエージェントに委譲
- **宣言的YAML仕様**: ローコードによるワークフロー定義
- **MCPツールインターフェース**: Model Context Protocolによる標準化されたツール連携
- **集中型モジュラーメモリ**: ロールベースアクセス制御付きの中央メモリコンポーネント
- **カスタムメッセージングプロトコル**: エンドツーエンドの情報フロー保持

---

## 4. アーキテクチャ

### 4.1 全体構成

```
ユーザープロンプト
    ↓
Stage 1: タスク分解・計画
    ↓
Stage 2: ワークフロー設計（ブループリント生成）
    ↓
Stage 3: コンポーネント構築（エージェント・ツールインスタンス化）
    ↓
Stage 4: 検証・テスト
    ↓ [性能基準未達]
Stage 5: IPRフィードバックループ
    ↓ [反復改善]
    → Stage 4 に戻る（最大n反復）
    ↓ [基準達成]
最終ワークフロー出力
```

### 4.2 階層的エージェント構造

```
Global Supervisor
    ├── Task Supervisor 1
    │     ├── Worker Agent A
    │     └── Worker Agent B
    ├── Task Supervisor 2
    │     ├── Worker Agent C
    │     └── Worker Agent D
    └── ...
```

### 4.3 モデル構成

- **Architect生成ワークフロー**: GPT-4.1（temperature=1, top_p=1）
- **比較対象モデル**: Llama 4 Scout/Maverick、DeepSeek-R1、Claude Sonnet 4、Gemini 2.5 Flash Preview

---

## 5. Figures & Tables

### Figure 1: Nexus Architectパイプラインブロック図

ユーザープロンプトから最終ワークフロー出力までの完全な5段階パイプラインを図示。タスク分解→ワークフロー設計→インスタンス化→検証→IPRフィードバック洗練ループの全フローを示す。各段階の入出力関係と、Stage 5からStage 4への反復ループが明確に表現されている。

### Figure 2: 最先端モデルとの性能比較

Nexus Architect生成ワークフローと主要推論モデルのArcBenchにおけるパスレートを比較する棒グラフ。Llama 4 Scout/Maverick、DeepSeek-R1、Claude Sonnet 4バリアント、Gemini 2.5 Flash Previewとの比較を示す。Nexus Architectが全モデルを大幅に上回ることが視覚的に明確。

### Figure 3: IPR反復におけるパスレート推移

5回の独立実行における各IPR反復（Iteration 1-5）でのパスレートをグループ棒グラフで表示。実線が最終データセット全体でのパスレート（最良実行で約70%）を示す。反復を重ねるごとに一貫した改善が確認できる。

### Table 1: モデル構成詳細

| モデル | プロバイダー | Temperature | Top_p |
|--------|-----------|-------------|-------|
| GPT-4.1 | OpenAI | 1 | 1 |
| Gemini 2.5 Flash Preview | Google | - | - |
| Claude Sonnet 4 | Anthropic | - | - |
| DeepSeek-R1 | DeepSeek | - | - |
| Llama 4 Scout | Meta | - | - |

各評価モデルのプロバイダー、モデルID、温度パラメータ、top_p設定を記載。

### Table 2: ArcBench比較性能結果

| モデル | パスレート | Nexus Architectとの差 |
|--------|----------|---------------------|
| Llama 4 Scout | 最低群 | 3x改善（最良）、2.5x（平均） |
| Gemini 2.5 Flash Preview | 44.94% | +66.17%（最良）、+39.6%（平均） |
| Claude Sonnet 4 | 低群 | 約2.5x改善 |
| DeepSeek-R1 | 低群 | 約2.5x改善 |
| **Nexus Architect** | **66.17%** | **-** |

---

## 6. 実験と評価

### 6.1 ArcBenchベンチマーク

- **構成**: RoR-Benchから導出された158問の問題-解答ペア
- **特徴**: 推論モデルを挑戦するために設計された、未見の演繹的推論問題（なぞなぞ）
- **目的**: 既存モデルのパターンマッチング依存を暴き、真の汎化能力を測定

### 6.2 実験設計

- **5回の独立実行**: 各実行でIPRフェーズ用に10問をランダムサンプリング
- **IPR反復**: 各実行で5反復
- **評価指標**: パスレート = 正答数 / 総問題数

### 6.3 主要結果

**最先端モデルとの比較**:
- vs. Llama 4 Scout: 最良ケースで3倍、平均で2.5倍の改善
- vs. Gemini 2.5 Flash Preview: 最良ケースで+66.17%、平均+39.6%の改善
- Gemini 2.5の最良パスレート: 44.94%
- Nexus Architectの最良パスレート: 66.17%

**IPR効果の評価**:
- IPRループは5回の反復までに一貫して基盤MASの精度を改善
- 実験Run 4 Iteration 4: サンプルセットパスレートが60%→90%に向上
- 初期システムプロンプトシードからの段階的改善を確認

### 6.4 IPRウォークスルー事例

**デジタル時計問題**:
- 問題：「デジタル時計の6:10で、針が作る鈍角は？」
- Iteration 1: エージェントが存在しない針の角度を計算
- フィードバック: 「デジタル時計に針はない」というトリック回答の優先が必要と特定
- Iteration 2: メタ回答の特定と優先を明示するシステムメッセージに洗練
- 結果: エージェントが期待される回答を正しく出力

この事例は、IPRが微妙なニュアンスの問題解決能力をどのように改善するかを実証している。

---

## 7. 備考

### 7.1 学術的意義

Nexus Architectは、マルチエージェントワークフローの自動生成と反復的改善という2つの重要な課題に同時に取り組んでいる。特に、非専門化LLMの組み合わせが専門的推論モデルを上回りうるという結果は、モデルの能力よりもワークフロー設計の品質が重要であるという示唆を与えている。

### 7.2 データ分析エージェントへの示唆

- **自動ワークフロー生成**: データ分析タスクに対するマルチエージェントワークフローの自動設計に直接適用可能
- **IPRメカニズム**: 分析プロンプトの反復的改善により、ドメイン固有の分析品質を段階的に向上
- **YAML宣言的定義**: 非エンジニアでもワークフロー定義と修正が可能なローコードアプローチ
- **MCPツール統合**: 外部ツール（データベース、統計ライブラリ等）との標準化された連携

### 7.3 制限事項

- ArcBenchが158問と比較的小規模（統計的有意性に懸念）
- IPRの収束保証がない（5反復での改善は確認されるが、最適解への到達は保証されない）
- GPT-4.1への依存（他のバックボーンモデルでの検証が限定的）
- 計算コスト（5段階パイプライン+IPR反復）の詳細な分析が不足

### 7.4 技術的特徴

オープンソースかつpipで配布可能な軽量実装は、研究再現性と実用的採用の両面で優れている。YAML形式のワークフロー定義とMCPベースのツール統合は、標準化の観点から今後のマルチエージェントフレームワーク開発に影響を与える可能性がある。
