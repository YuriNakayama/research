# Multi-Agent Collaboration Mechanisms: A Survey of LLMs

- **Link**: https://arxiv.org/abs/2501.06322
- **Authors**: Khanh-Tung Tran, Dung Dao, Minh-Duong Nguyen, Quoc-Viet Pham, Barry O'Sullivan, Hoang D. Nguyen
- **Year**: 2025
- **Venue**: arXiv preprint (cs.AI)
- **Type**: Academic Paper (Survey)

## Abstract

With recent advances in Large Language Models (LLMs), Agentic AI has become phenomenal in real-world applications, moving toward multiple LLM-based agents to perceive, learn, reason, and act collaboratively. These LLM-based Multi-Agent Systems (MASs) enable groups of intelligent agents to coordinate and solve complex tasks collectively at scale, transitioning from isolated models to collaboration-centric approaches. This work provides an extensive survey of the collaborative aspect of MASs and introduces an extensible framework to guide future research. Our framework characterizes collaboration mechanisms based on key dimensions: actors (agents involved), types (e.g., cooperation, competition, or coopetition), structures (e.g., peer-to-peer, centralized, or distributed), strategies (e.g., role-based or model-based), and coordination protocols. Through a review of existing methodologies, our findings serve as a foundation for demystifying and advancing LLM-based MASs toward more intelligent and collaborative solutions for complex, real-world use cases.

## Abstract（日本語訳）

大規模言語モデル（LLM）の最近の進歩により、エージェンティックAIは現実世界のアプリケーションにおいて顕著な存在となり、複数のLLMベースエージェントが協調的に知覚・学習・推論・行動する方向へと進化している。これらのLLMベースマルチエージェントシステム（MAS）は、知的エージェントのグループがスケーラブルに協調し、複雑なタスクを集団的に解決することを可能にし、孤立したモデルから協調中心のアプローチへの移行を実現する。本研究はMASの協調的側面に関する包括的なサーベイを提供し、将来の研究を導く拡張可能なフレームワークを導入する。我々のフレームワークは、アクター（関与するエージェント）、タイプ（協力、競争、共競争など）、構造（ピアツーピア、集中型、分散型など）、戦略（ロールベース、モデルベースなど）、協調プロトコルという主要な次元に基づいて協調メカニズムを特徴付ける。

## 概要

本論文は、LLMベースのマルチエージェントシステム（MAS）における「協調メカニズム」に焦点を当てた包括的サーベイである。単一エージェントの能力を超え、複数エージェントがどのように連携して複雑な問題を解決するかを体系的に分類・整理している。

主要な貢献：

1. **拡張可能なフレームワークの提案**: 協調メカニズムをアクター・タイプ・構造・戦略・協調プロトコルの5次元で特徴付ける体系的な枠組みを導入
2. **協調タイプの3分類**: 協力（Cooperation）、競争（Competition）、共競争（Coopetition）の3類型を定義し、それぞれの数学的定式化と利点・欠点を整理
3. **構造の体系化**: 集中型・分散型・階層型の通信構造を比較分析
4. **戦略の分類**: ルールベース・ロールベース・モデルベースの3つの協調戦略を詳述
5. **多様な応用領域の調査**: 5G/6G、インダストリー5.0、QA/NLG、社会・文化シミュレーションへの適用事例を網羅

## 問題と動機

- **孤立モデルの限界**: 単一のLLMでは複雑な実世界タスクに対処しきれず、複数エージェントによる協調的アプローチが必要。しかし、協調メカニズムの体系的な理解が不足している。

- **既存サーベイの不十分さ**: 先行サーベイ（Xi et al., Guo et al., Lu et al.等）はマルチエージェントシステムの概要を提供するものの、協調の「メカニズム」自体の詳細な分析が欠けている。

- **統一的フレームワークの欠如**: 協調のタイプ、構造、戦略を横断的に比較・分析するための汎用的な枠組みが存在しなかった。

## 提案手法

**マルチエージェント協調フレームワーク**

本論文の中核は、LLMベースMASの協調メカニズムを5つの次元で特徴付ける拡張可能なフレームワークである。

**エージェントの形式的定義**:

$$a = \{m, o, e, x, y\}$$

ここで、$m$ はモデル、$o$ は目的関数、$e$ は環境、$x$ は入力、$y$ は出力であり、出力は $y = m(o, e, x)$ として計算される。

**マルチエージェント協調システムの定式化**:

$$S = (\mathcal{A}, \mathcal{O}_{collab}, \mathcal{E}, \mathcal{C}, x_{collab}, y_{collab})$$

**協調タイプの数学的定義**:

- **協力 (Cooperation)**: $\mathcal{O}_{collab} = \bigcup_{i=1}^{n} o_i$ — 全エージェントの目的が共有目標に整合
- **競争 (Competition)**: $\mathcal{O}_{collab} = \{o_i | o_i \neq o_j, \forall i \neq j\}$ — エージェント間の目的が相互に矛盾
- **共競争 (Coopetition)**: 一部のタスクで協力し、他のタスクで競争する混合形態

## アーキテクチャ / プロセスフロー

```
┌─────────────────────────────────────────────────────────────┐
│            マルチエージェント協調フレームワーク               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐    ┌──────────────────────────────┐           │
│  │ Agent a₁ │───→│                              │           │
│  └──────────┘    │    協調チャネル C = {cⱼ}      │           │
│  ┌──────────┐    │                              │   ┌─────┐│
│  │ Agent a₂ │───→│  タイプ: 協力/競争/共競争     │──→│y_col││
│  └──────────┘    │  構造: 集中/分散/階層         │   │ lab ││
│       ⋮          │  戦略: ルール/ロール/モデル    │   └─────┘│
│  ┌──────────┐    │                              │          │
│  │ Agent aₙ │───→│                              │          │
│  └──────────┘    └──────────────────────────────┘          │
│       ↕                                                     │
│  ┌──────────────────────┐                                   │
│  │ 共有環境 E            │                                   │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
```

## Figures & Tables

### Table 1: 既存サーベイとの比較

| サーベイ | 協調システム焦点 | 協調メカニズム分析 | フレームワーク提案 | 実世界応用レビュー |
|---------|:---:|:---:|:---:|:---:|
| Xi et al. | Medium | Low | Low | Low |
| Guo et al. | Medium | Low | Medium | Low |
| Lu et al. | Low | Low | Low | Low |
| **本論文** | **High** | **High** | **High** | **High** |

### Table 2: 協調タイプの比較

| タイプ | 定義 | 主な利点 | 主な欠点 |
|--------|------|----------|----------|
| 協力 | エージェントが共有目標に整合 | 強みに基づくタスク割当 | 目標不一致で非効率 |
| 競争 | 個別目的が相互に矛盾 | より高い性能への動機づけ | 紛争解決メカニズムが必要 |
| 共競争 | 協力と競争の混合 | トレードオフのバランス | 研究が少なく未成熟 |

### Table 3: 通信構造の比較

| 構造 | 利点 | 欠点 | 代表例 |
|------|------|------|--------|
| 集中型 | 設計がシンプル、効率的資源配分 | 単一障害点、中央ノード依存 | FedIT, LLM-Blender, AutoAct |
| 分散型 | 障害耐性、高スケーラビリティ | 通信オーバーヘッド大 | MedAgent, MetaGPT/ChatDev, SOA |
| 階層型 | 低通信ボトルネック、効率的配分 | 中間層依存、高複雑性 | DyLAN, CAMEL, AgentVerse |

### Table 4: 協調戦略の比較

| 戦略 | 特徴 | 利点 | 欠点 | 代表例 |
|------|------|------|------|--------|
| ルールベース | 事前定義ルールによる厳格制御 | 高効率、予測可能 | 低適応性 | 多数決投票、ピアレビュー |
| ロールベース | 役割分担に基づく専門化 | モジュール性、再利用性 | 硬直的構造 | MetaGPT, AgentVerse |
| モデルベース | 確率的意思決定 | 高適応性、ノイズ耐性 | 計算コスト大 | ToM, PGM |

## 実験と評価

本論文はサーベイ論文であり、独自の実験は実施していない。フレームワーク分析を通じた主要な知見：

1. **協力型が最も普及**: AgentVerse、MetaGPT、CAMEL、AutoGen等の主要フレームワークは協力型を採用
2. **共競争型は未開拓**: 協力と競争を組み合わせた共競争型は大きな可能性を秘めている
3. **動的アーキテクチャの重要性**: DyLAN等の動的構造はタスク要件に応じてエージェント構成を適応させる能力を示す

## 備考

- 5G/6Gネットワーク、インダストリー5.0といった通信・産業分野への応用を強調しており、他のサーベイにない実践的視点を提供
- 「人工集合知能（Artificial Collective Intelligence）」への道筋を最終的な研究方向として提示
- カスケードする幻覚（hallucination）の問題を指摘：マルチエージェント間で一つのエージェントの幻覚が増幅・伝播するリスク
