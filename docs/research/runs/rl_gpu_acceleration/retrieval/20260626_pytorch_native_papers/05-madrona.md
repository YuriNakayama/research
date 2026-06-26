# Madrona: 高性能 Many-World シミュレーションのための拡張可能・データ指向アーキテクチャ

> 原題: *An Extensible, Data-Oriented Architecture for High-Performance, Many-World Simulation*（通称 Madrona engine）

## 基本情報

| 項目 | 内容 |
|------|------|
| 著者 | Brennan Shacklett, Luc Guy Rosenzweig, Zhiqiang Xie, Bidipta Sarkar, Andrew Szot, Erik Wijmans, Vladlen Koltun, Dhruv Batra, Kayvon Fatahalian |
| 所属 | Stanford ほか |
| 発表 | ACM Transactions on Graphics (TOG) 2023（SIGGRAPH 2023） |
| OpenReview | https://openreview.net/forum?id=fqk7mDvrTS |
| 公式 | https://madrona-engine.github.io / github.com/shacklettbp/madrona |

## 課題・背景

AI エージェント学習には「millions to billions of steps of experience」が必要で、最速シミュレータは **batch simulation（バッチシミュレーション）= 単一エンジンで多数環境を同時にステップ**するアイデアを採る。しかし、独自の学習環境（環境生成・時間発展・観測/報酬生成の独自ロジック）を**高性能な GPU バッチシミュレータとして生産的に書く**ための汎用フレームワークが欠けていた。

## 提案手法・コア機構

- **GPU 上で動く ECS（Entity-Component-System）**: abstract いわく「the first fully-GPU accelerated ECS implementation that natively supports batch environment simulation（バッチ環境シミュレーションをネイティブ対応する初の完全 GPU 高速化 ECS 実装）」。CPU 側ゲームロジックで一般的な ECS パターンを GPU バッチシミュレータの構造化に流用。
- **データ指向設計**: ECS の構造により「efficiently manage state, amortize work, and identify GPU-friendly coherent parallel computations within and across different environments（状態管理の効率化・作業の償却・環境内/環境間の GPU フレンドリなコヒーレント並列計算の特定）」を実現。
- **拡張可能なオーサリング**: ユーザは環境生成・time stepping・観測/報酬ロジックを記述するだけで、GPU 高速化バッチシミュレータとして実行される。
- Hide & Seek 実装では各ステップで「rigid body physics and ray tracing（剛体物理 + レイトレーシング）」を実行。

## 主要な定量結果（VERBATIM 引用 + 条件明記）

abstract VERBATIM:

> "we ... demonstrate GPU speedups of two to three orders of magnitude over open source CPU baselines and 5-33× over strong baselines running on a 32-thread CPU."

> "An implementation of the OpenAI hide and seek 3D environment written in our framework, which performs rigid body physics and ray tracing in each simulator step, achieves over 1.9 million environment steps per second on a single GPU."

| 主張 | 数値（VERBATIM） | 条件・ベースライン |
|------|-----------------|--------------------|
| OSS CPU ベースライン比 | "two to three orders of magnitude" | 単一 GPU vs OSS CPU |
| 32 スレッド CPU 強ベースライン比 | "5-33×" | vs 32-thread CPU |
| Hide & Seek（剛体物理 + レイトレ） | "over 1.9 million environment steps per second" | **single GPU**（機種は abstract 非記載） |

> 注: プロジェクトページ（madrona-engine.github.io）では Hanabi 40M / Overcooked 20M steps/s 等のより高い値も提示されるが、**GPU 機種が記載されておらず、abstract VERBATIM ではない**ため出典区分を明示して扱う。

## pytorch_native クラスタにおける位置づけ

**②物理 GPU 常駐化系統**の「汎用エンジン」版。Isaac Gym が剛体ロボット物理に特化するのに対し、Madrona は **ECS で任意の学習環境ロジックを GPU バッチシミュレータ化する汎用フレームワーク**。観測・報酬まで GPU 上で完結し CPU 転送を排除する点は共通。GPUDrive（本クラスタ 06）はこの Madrona engine 上に構築される。

## 限界・注意点

- 1.9M steps/s は「single GPU」とあるが **abstract に GPU 機種の明記がない**。プロジェクトページの 20M/40M 値も機種非記載。
- ECS でロジックを記述し直す必要があり、既存 Python 環境をそのまま GPU 化できるわけではない（②全般の制約）。
- 研究プロトタイプ寄りでリリースタグが整っておらず、導入には専門知識を要する。

## 出典

- OpenReview: https://openreview.net/forum?id=fqk7mDvrTS
- プロジェクトページ: https://madrona-engine.github.io
- ACM TOG 2023 / SIGGRAPH 2023
