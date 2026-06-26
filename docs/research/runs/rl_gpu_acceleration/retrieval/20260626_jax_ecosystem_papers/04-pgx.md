# Pgx — ハードウェア加速された並列ゲームシミュレータ

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem` / retrieval（個別 deep-dive）

## 基本情報

| 項目 | 内容 |
|------|------|
| タイトル | Pgx: Hardware-Accelerated Parallel Game Simulators for Reinforcement Learning |
| 著者 | Sotetsu Koyamada, Shinri Okano, Soichiro Nishimori, Yu Murata, Keigo Habara, Haruka Kita, Shin Ishii |
| 年 | 2023（投稿日: 2023-03-29、最終改訂 2024-01-15） |
| venue | NeurIPS 2023 Datasets and Benchmarks Track |
| arXiv ID | 2303.17503 |
| URL | https://arxiv.org/abs/2303.17503 |
| 所属 | Kyoto University ほか |

## 課題・背景

ボードゲームは RL 研究の標準ベンチマーク（バックギャモン・チェス・将棋・囲碁）だが、既存実装の多くは Python の逐次実装で、アクセラレータ上の大規模並列シミュレーションに適さない。AlphaZero 系の自己対戦学習は膨大なシミュレーションを要するため、環境ステップの遅さが研究サイクルのボトルネックとなる。

## 提案手法・コア機構

- **JAX 実装のボードゲーム環境スイート**: バックギャモン・チェス・将棋・囲碁を含む環境を JAX で記述し、GPU/TPU 向けに最適化（要旨: *"a suite of board game reinforcement learning (RL) environments written in JAX and optimized for GPU/TPU accelerators"*）。
- **`vmap` による auto-vectorization と device 並列化**: 要旨 VERBATIM — *"By leveraging JAX's auto-vectorization and parallelization over accelerators, Pgx can efficiently scale to thousands of simultaneous simulations over accelerators."* ゲームロジックを純関数化し、`jax.vmap` で数千の同時シミュレーションへ自動ベクトル化、アクセラレータ上で並列実行する。
  - ボードゲームは状態遷移が分岐に富む（合法手判定・終局判定）。これを XLA がコンパイルできる形（分岐を `lax.select`/`where` 等でデータ並列化）に書き下し、`jit`+`vmap` で数千局を同時進行させる点が技術的核心。
- **付属物**: ミニチュアゲームセット、baseline モデルを提供し研究サイクルを高速化。
- **学習実証**: Gumbel AlphaZero アルゴリズムの効率的学習を Pgx 環境上で実証（要旨: *"We demonstrate the efficient training of the Gumbel AlphaZero algorithm with Pgx environments."*）。

## 主要な定量結果（VERBATIM・条件付き）

- VERBATIM: *"In our experiments on a DGX-A100 workstation, we discovered that Pgx can simulate RL environments 10-100x faster than existing implementations available in Python."*
  - **倍率**: 10–100x。
  - **ベースライン**: 「existing implementations available in Python（Python で利用可能な既存実装）」。
  - **条件**: **DGX-A100 ワークステーション**上での実験。倍率に幅（10–100x）があるのはゲーム種別・実装により異なるため。「10–100x」を引用する際は必ず「DGX-A100 上、Python 既存実装比」という条件を併記すること。

## JAX エコシステムにおける位置づけ

- 本クラスタの「環境ライブラリ多様化」の **ボードゲーム/離散完全情報ゲーム**枠を担う。物理（Brax/Kinetix）、組合せ最適化（Jumanji）、マルチエージェント（JaxMARL）と並ぶ JAX 環境スイートの一角。
- AlphaZero 系（MCTS ベース）を JAX 上で end-to-end 高速化する基盤として、`mctx`（DeepMind の JAX 製 MCTS）等と組み合わせて使われる。Anakin 流（全部アクセラレータ上）で MCTS 探索＋環境を同一デバイスに載せる代表例。

## 限界・注意点

- 「10–100x」は倍率に1桁の幅があり、**最良値（100x）を単独引用すると誤解を招く**。ゲーム種別依存であることと DGX-A100 という強力なハードウェア前提を明記すべき。
- ボードゲームは状態遷移が複雑で、分岐の多いゲームほど vectorization 効率が落ちる可能性（幅の下限 10x 側）。
- 完全情報・離散ゲームに特化。連続制御や部分観測には別環境（Brax/JaxMARL 等）が必要。

## 出典

- arXiv abstract page: https://arxiv.org/abs/2303.17503 （WebFetch でタイトル・著者・要旨・venue・定量主張を verbatim 照合、2026-06-26）
