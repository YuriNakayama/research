# BIRD-INTERACT: Re-imagining Text-to-SQL Evaluation for Large Language Models via Lens of Dynamic Interactions

- **Link**: https://arxiv.org/abs/2510.05318
- **Authors**: Nan Huo, Xiaohan Xu, Jinyang Li, Per Jacobsson, Shipei Lin, Bowen Qin, Binyuan Hui, Xiaolong Li, Ge Qu, Shuzheng Si, Linheng Han, Edward Alexander, Xintong Zhu, Rui Qin, Ruihan Yu, Yiyao Jin, Feige Zhou, Weihao Zhong, Yun Chen, Hongyu Liu, Chenhao Ma, Fatma Ozcan, Yannis Papakonstantinou, Reynold Cheng
- **Year**: 2025
- **Venue**: ICLR 2026 (Oral)
- **Type**: Academic Paper

## Abstract

The paper introduces BIRD-INTERACT, a comprehensive benchmark addressing limitations in how large language models handle real-world database interactions. The framework includes a comprehensive interaction environment coupling each database with a hierarchical knowledge base, metadata files, and a function-driven user simulator, enabling models to request clarifications and recover from errors independently. The benchmark features two evaluation modes: a structured conversational protocol (c-Interact) and an open-ended agentic setting (a-Interact). Testing reveals significant challenges: GPT-5 completes only 8.67% of tasks in c-Interact and 17.00% in a-Interact. The dataset encompasses 600 comprehensive tasks and 300 simplified variants, covering complete database operations across business and operational contexts with executable validation.

## Abstract（日本語訳）

本論文はBIRD-INTERACTを導入する。これは大規模言語モデルが実世界のデータベースインタラクションをどのように処理するかに関する限界に対処する包括的なベンチマークである。このフレームワークは、各データベースに階層的知識ベース、メタデータファイル、関数駆動型ユーザーシミュレータを結合した包括的なインタラクション環境を含み、モデルが独立して明確化を要求しエラーから回復することを可能にする。ベンチマークは2つの評価モード、すなわち構造化された会話プロトコル（c-Interact）とオープンエンドのエージェント設定（a-Interact）を特徴とする。テストの結果、GPT-5はc-Interactで8.67%、a-Interactで17.00%のタスクしか完了できないという重大な課題が明らかになった。データセットは600の包括的タスクと300の簡略化バリアントを含み、ビジネスおよびオペレーショナルコンテキストにおける完全なデータベース操作を実行可能な検証でカバーする。

## 概要

BIRD-INTERACTは、従来のText-to-SQLベンチマークが持つ根本的な限界を克服するために設計された次世代の評価フレームワークである。従来のベンチマークでは、ユーザーのクエリが完全に明確であり、モデルは一回の推論でSQLを生成することが前提とされていた。しかし実際のデータベース利用シーンでは、ユーザーの質問は曖昧であり、ドメイン知識の不足やデータベーススキーマの複雑さから、対話的な明確化プロセスが不可欠である。BIRD-INTERACTはこの現実を反映し、モデルがユーザーに質問を投げかけ、段階的に情報を収集し、エラーを修正するという動的なインタラクションを評価する。ベンチマークは900のインタラクティブタスク（Full: 600、Lite: 300）で構成され、各タスクは曖昧性を含む優先サブタスクとフォローアップサブタスクの2段階構造を持つ。ビジネスインテリジェンス（BI）クエリとデータ管理（DM）操作の両方をカバーし、CRUDの全スペクトルを網羅している。関数駆動型ユーザーシミュレータは人間の行動との相関係数0.84を達成し、従来のLLMベースシミュレータの0.61を大幅に上回る。最新のGPT-5でさえもcc-Interactで14.50%、aa-Interactで29.17%の成功率にとどまり、現在のLLMが対話的データベース操作において大きな課題を抱えていることを示している。

## 問題設定

- **静的評価の限界**: 従来のText-to-SQLベンチマーク（Spider、BIRD等）は単一ターンの評価に限定されており、ユーザーの質問は完全に明確化されていることが前提とされている。しかし実世界では、ユーザーのクエリは曖昧であり、対話を通じた段階的な明確化が必要である。

- **ユーザーインタラクションの欠如**: 既存ベンチマークではモデルがユーザーに質問を投げかけたり、追加情報を要求する能力を評価する仕組みがない。これは実用的なデータベースアシスタントの重要な能力を無視している。

- **ドメイン知識の統合不足**: 実世界のデータベース利用では、スキーマだけでなく業務知識、データ辞書、メタデータなどの外部知識が必要であるが、既存ベンチマークはこれらを考慮していない。

- **エラー回復能力の未評価**: 実際の利用では、最初のSQL生成が失敗した場合にデバッグ・修正する能力が重要だが、従来の評価ではこのプロセスが考慮されていない。

- **CRUD操作の偏り**: 既存ベンチマークはSELECTクエリ（読み取り）に偏っており、INSERT、UPDATE、DELETEなどのデータ操作を十分にカバーしていない。

## 提案手法

BIRD-INTERACTは、動的インタラクションを通じたText-to-SQL評価の新しいパラダイムを提案する。

### ベンチマーク設計

**データセット構成**:
- BIRD-Interact-Full: 600タスク（複雑なデータベーススキーマ）
- BIRD-Interact-Lite: 300タスク（簡略化されたデータベース）
- 各タスクは2つの連続サブタスクで構成: 曖昧性を含む優先タスクとフォローアップタスク

**タスクカテゴリ**:
- ビジネスインテリジェンス（BI）クエリ: 410タスク（Full）
- データ管理（DM）操作: 190タスク（Full）
- CRUD全操作（Create, Read, Update, Delete）をカバー

**曖昧性注入メカニズム**:
3つの体系的な曖昧性注入方法を採用:
1. 表面的ユーザークエリ曖昧性（意図レベルおよび実装レベルの曖昧さ）
2. 知識曖昧性（孤立エントリおよび知識チェーンの断絶）
3. 環境曖昧性（データベースの不整合およびNULL値）

**階層的知識ベース（HKB）**:
外部ドメイン固有の事実を有向非巡回グラフノードとして組織化。依存関係は多段階推論の要件を明示的にモデル化する。

**関数駆動型ユーザーシミュレータ**:
2段階戦略を採用:
- Stage 1（意味解析）: 明確化リクエストを3つの制約付きアクション（AMB/LOC/UNA）にマッピング
- Stage 2（応答生成）: 選択されたアクションと注釈付き正解SQLに基づいてコンテキスト適切な応答を生成

### 評価指標

- **成功率（SR）**: サブタスクごとの二値スコアリング（0または1）
- **正規化報酬**: オフライン評価指標、[0,1]にスケーリング、優先サブタスクに70%、フォローアップに30%の重み
- **機能的正確性**: PostgreSQL 14インスタンスでの実行可能テストケースによる検証

### 2つの評価モード

**cc-Interact（会話プロトコル）**:
構造化されたマルチターン対話。予定された会話フローに従い、明確化対話の後にSQL生成を行う。バジェット制約: τ_clar = m_amb + λ_pat

**aa-Interact（エージェント自律）**:
ReActパラダイムに従う柔軟な自律計画。9つの離散アクションを含み、環境プローブ（コスト≤1）とユーザー仲介インタラクション（コスト≥2）で構成。バジェット制約: B = B_base + 2m_amb + 2λ_pat

## Figures & Tables

### Table 1: データセット統計

| 統計項目 | 値 |
|---------|-----|
| タスク数（Full） | 600 |
| タスク数（Lite） | 300 |
| Liteタスクあたりの平均曖昧性数 | 5.16 |
| タスクあたりの平均インタラクション数 | 13.04 |
| アノテータ間一致率 | 93.33% |
| BIタスク数（Full） | 410 |
| DMタスク数（Full） | 190 |

### Table 2: 主要モデル成功率結果（BIRD-Interact-Full）

| モデル | cc-Interact SR (%) | aa-Interact SR (%) | 正規化報酬 |
|-------|-------------------|-------------------|-----------|
| GPT-5 | 14.50 | 29.17 | 25.52 |
| Gemini-2.5-Pro | 25.00 | 20.33 | 20.92 |
| Claude-Sonnet-4 | 22.33 | 27.83 | 23.28 |
| O3-Mini | 24.00 | 19.83 | 20.27 |
| Qwen-3-Coder-480B | 22.00 | 13.33 | 17.75 |

### Table 3: ユーザーシミュレータ信頼性評価

| シミュレータタイプ | 人間との相関（Pearson） | 回答不能質問失敗率 |
|------------------|----------------------|------------------|
| 関数駆動型（提案手法） | 0.84 | 2.7% |
| ベースラインLLM | 0.61 | 67.4% |

### Figure 1: タスク概要図

マルチターンインタラクションシーケンスの全体像を示す図。システム、ユーザーシミュレータ、データベース環境間の明確化フェーズとフォローアップフェーズを通じたインタラクションの流れを描写。

### Figure 3: 二重評価設定の比較

cc-Interactの構造化対話プロトコルとaa-Interactの自律エージェント計画フレームワークをバジェット制約とともに比較する図。

### Figure 4: インタラクション Test-Time Scaling曲線

ユーザーの忍耐パラメータ（インタラクション機会）の増加に伴い、モデル性能が単調に向上することを示す曲線。Claude-3.7-Sonnetは明確なスケーリング傾向を示し、インタラクションターンの増加とともにシングルターンの理想条件に近づく。

### Figure 6: ユーザーシミュレータ信頼性評価

関数駆動型アプローチが回答不能質問での失敗率を2.7%に低減し（ベースラインの67.4%に対して）、人間との整合性が大幅に改善されたことを示すグラフ。

## 実験・評価

### セットアップ

- データベース: PostgreSQL 14インスタンスを各評価で新規作成
- 評価対象モデル: GPT-5、Gemini-2.5-Pro、Claude-Sonnet-4、O3-Mini、Qwen-3-Coder-480Bなど7モデル
- 各タスクは実行可能テストケースによる機能的正確性検証
- タスクあたりのコスト: $0.04〜$0.60

### 主要結果

**全体的な性能**:
全モデルにおいて成功率は非常に低く、最高でもGPT-5のaa-Interactで29.17%にとどまった。これは現在のLLMが動的インタラクションにおいて深刻な課題を抱えていることを示す。

**評価モード間の差異**:
モデルによって得意なモードが異なる。GPT-5はcc-Interactで14.50%だがaa-Interactで29.17%と、エージェント型設定で大幅に改善。一方、Gemini-2.5-Proはcc-Interactで25.00%、aa-Interactで20.33%と会話型が得意。

**タスクタイプ別分析**:
- BIクエリはDMクエリより一貫して高い性能
- フォローアップサブタスクは優先タスクより大幅に低い性能

**デバッグの効果**:
単一デバッグ試行による改善は限定的（通常1〜6%の改善のみ）。

**Test-Time Scaling**:
インタラクション機会の増加に伴い性能は単調に向上。Claude-3.7-Sonnetは明確なスケーリング傾向を示し、追加のインタラクションターンが有効であることを実証。

## 備考

- BIRD-INTERACTは従来のText-to-SQLベンチマークの根本的なパラダイムシフトを提案するものであり、静的な一問一答型の評価から動的なマルチターンインタラクションへの移行を推進している
- 関数駆動型ユーザーシミュレータの設計は、情報漏洩を防ぎつつ人間の行動を高い忠実度で再現する点で優れており、今後のインタラクティブ評価研究の基盤となりうる
- 最先端モデルでも成功率が30%未満にとどまることは、実用的なデータベースアシスタントの実現にはまだ大きなギャップがあることを示唆している
- ICLR 2026のOral発表に採択されており、ベンチマーク設計と評価の革新性が高く評価されている
