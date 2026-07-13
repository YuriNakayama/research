# 05. Madrona engine（Stanford）+ GPUDrive / Madrona MJX

## 概要カード

- **GitHub**: https://github.com/shacklettbp/madrona
- **ウェブサイト**: https://madrona-engine.github.io/
- **一言で言うと**: GPU 上で数千の独立ワールドをバッチ実行する「GPU 駆動の Entity Component System (ECS)」シミュレーションエンジン。バッチシミュレーションのスループットを極大化する汎用基盤
- **Star（概算）**: ~504（2026-06-26 確認）。forks 51、main 1,515 コミット、**タグ付きリリースなし（研究プロトタイプ、活発に開発中だが pre-1.0）**
- **論文**: "An Extensible, Data-Oriented Architecture for High-Performance, Many-World Simulation"（Shacklett, Rosenzweig, Xie, Sarkar, Szot, Wijmans, Koltun, Batra, Fatahalian）, **ACM TOG Vol.42 No.4, 2023 — SIGGRAPH 2023**
  - **注記**: ユーザー指定の「...High-Performance Batch Simulation」は通称。公式 ACM TOG タイトルは「...High-Performance, **Many-World** Simulation」（同一論文）
- **主要ベンチマーク**: Hide & Seek で単一 GPU 上 32,000 並列環境を >1.9M env steps/s。出典: madrona-engine.github.io

## ECS-on-GPU アーキテクチャ

Madrona は **GPU 駆動のバッチ Entity Component System (ECS)** を実装。ゲーム状態を component/archetype として表現し、ロジックを **task graph**（`TaskGraphBuilder`）にコンパイル。主要 API は `Context`（エントリポイント）、`ECSRegistry`（component/archetype 登録）。data-oriented 設計により**数千の独立ワールドインスタンスを単一 GPU に常駐**させ、バッチ・SIMD フレンドリに step する — これがスループットの源泉。出典: repo README + 論文（https://github.com/shacklettbp/madrona）

## スループットベンチマーク（madrona-engine.github.io で検証）

| ベンチマーク | スループット | 備考 |
|---|---|---|
| **Hide and Seek**（OpenAI） | **>1.9M env steps/s**（単一 GPU） | 32,000 並列環境 |
| **Overcooked-AI** | **40M steps/s** | — |
| **Hanabi** | **20M steps/s** | — |
| 一般高速化 | オープンソース CPU ベースライン比 **2–3 桁**、強力な 32 スレッド CPU ベースライン比 **5x–33x** | — |

出典: https://madrona-engine.github.io/

## 関連プロジェクト

### GPUDrive（Madrona 上の自動運転シミュレータ）

- **一言**: "GPUDrive: Data-driven, multi-agent driving simulation at 1 million FPS" — Waymo Open Motion Dataset 上のマルチエージェント運転シミュレータ
- **論文**: arXiv **2408.01584**（Kazemkhani, Pandya, Cornelisse, **Shacklett**, Vinitsky。2024-08-02 投稿、ICLR 2025）。https://arxiv.org/abs/2408.01584
- **GitHub**: https://github.com/Emerge-Lab/gpudrive — **~604 stars**、最新 v0.4.0（2025-02-20）（2026-06-26 確認）
- **Madrona ベース**: 確認済（repo に「1 million FPS through the Madrona engine」）
- **ベンチマーク（論文 HTML https://arxiv.org/html/2408.01584v3 で検証）**:
  - 見出し: **>1M simulation steps/s**（"1 million FPS"）
  - ピーク **~2.3M Agent-Steps-Per-Second (ASPS)**（並列ワールド横断）
  - 数百〜数千ワールド、平均 ~10.8 制御エージェント/シナリオ、最大 512 Waymo シナリオ
  - RL 実験 GPU: **RTX 4080**（コンシューマ）と **A100**（データセンタ）
  - Nocturne（最大 ~15,000 ASPS）比 **2–3 桁高速**
  - 下流学習統合: IPPO (SB3) 25–50K steps/s、IPPO (**PufferLib**) 100–300K steps/s

### Madrona MJX（vision/描画ブリッジ）

- **GitHub**: https://github.com/shacklettbp/madrona_mjx — ~162 stars（2026-06-26 確認）
- **一言**: **MuJoCo MJX**（物理）と Madrona バッチレンダラの間の高スループットバッチ描画ブリッジ（vision ベース方策学習向け）。描画 FPS は数十万に達する
- **状態**: **非推奨/保守終了** — ユーザーは **MJWarp**（MuJoCo にネイティブ化された公式 MJX レンダラ）に誘導されている

### その他

`madrona_escape_room`, `gpu_hideseek`, `madrona_puzzle_bench`（いずれも github.com/shacklettbp）

## 位置づけ

Isaac/WarpDrive が物理（剛体/接触）に寄っているのに対し、Madrona は**ゲーム的・離散的なバッチシミュレーション全般**の汎用エンジン。Hide & Seek / Overcooked / Hanabi のような多様な環境を単一エンジンで GPU バッチ化でき、GPUDrive のように特定ドメイン（運転）へ応用される。下流トレーナとして PufferLib（本クラスタ 01）や SB3 が使われる点も非 JAX スタックとしての位置づけを示す。

## 検証フラグ

- **40M（Overcooked）/ 20M（Hanabi）steps/s**: 出典ページに GPU 機種記載なし。
- **GPUDrive 2.3M ASPS ピーク**: 論文はピーク値の正確な GPU/ワールド構成を明示せず（ベンチ GPU は RTX 4080, A100）。
- **論文タイトル**: ユーザー指定タイトルと公式 ACM TOG タイトルが微妙に異なる（"...Many-World Simulation"）。同一論文。
- **Madrona MJX 非推奨**: 比較的新しい情報、MJWarp へ移行。

## 出典 URL

- https://github.com/shacklettbp/madrona
- https://madrona-engine.github.io/
- https://arxiv.org/abs/2408.01584
- https://arxiv.org/html/2408.01584v3
- https://github.com/Emerge-Lab/gpudrive
- https://github.com/shacklettbp/madrona_mjx
