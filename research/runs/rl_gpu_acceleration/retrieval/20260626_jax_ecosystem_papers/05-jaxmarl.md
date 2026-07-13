# JaxMARL — JAX によるマルチエージェント RL 環境・アルゴリズム

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem` / retrieval（個別 deep-dive）

## 基本情報

| 項目 | 内容 |
|------|------|
| タイトル | JaxMARL: Multi-Agent RL Environments and Algorithms in JAX |
| 著者 | Alexander Rutherford, Benjamin Ellis, Matteo Gallici, Jonathan Cook, Andrei Lupu, Gardar Ingvarsson, Timon Willi, Ravi Hammond, Akbir Khan, Christian Schroeder de Witt, Alexandra Souly, Saptarashmi Bandyopadhyay, Mikayel Samvelyan, Minqi Jiang, Robert Tjarko Lange, Shimon Whiteson, Bruno Lacerda, Nick Hawes, Tim Rocktäschel, Chris Lu, Jakob Nicolaus Foerster |
| 年 | 2023（投稿日: 2023-11-16） |
| venue | NeurIPS 2024 Datasets and Benchmarks Track |
| arXiv ID | 2311.10090 |
| URL | https://arxiv.org/abs/2311.10090 |
| 所属 | University of Oxford (FLAIR) ほか |

## 課題・背景

RL 環境は伝統的に CPU 上で動作し、典型的なアカデミック計算資源ではスケーラビリティに限界がある。JAX の進展で大規模並列 RL パイプライン・環境が可能になったが、これは**単一エージェント RL では成功しているが、マルチエージェント（MARL）シナリオでは未だ広く採用されていない**。MARL は評価が高コストで、十分なシード数・環境数での評価ができない「evaluation crisis」を抱える。

## 提案手法・コア機構

- **初の GPU 対応統合 MARL ライブラリ**: 要旨 VERBATIM — *"we present JaxMARL, the first open-source, Python-based library that combines GPU-enabled efficiency with support for a large number of commonly used MARL environments and popular baseline algorithms."* 主要 MARL 環境とベースラインアルゴリズムを GPU 効率込みで統合。
- **end-to-end JAX 学習パイプライン**: 環境・アルゴリズムを JAX で実装し、`jit` で全体を XLA コンパイル。複数環境を `vmap` で並列化、ロールアウトを `lax.scan` でアンロール。さらに**複数学習ラン（シード/ハイパラ）を `vmap` でまとめて並列実行**することで、評価の網羅性を確保する（これが 12500x の鍵）。
- **SMAX の導入**: 要旨 VERBATIM — *"We also introduce and benchmark SMAX, a JAX-based approximate reimplementation of the popular StarCraft Multi-Agent Challenge, which removes the need to run the StarCraft II game engine."* StarCraft II ゲームエンジンを不要にし（GPU 加速を可能にしつつ）、self-play・meta-learning など将来応用に開かれた柔軟な MARL 環境を提供。

## 主要な定量結果（VERBATIM・条件付き — 引用時の注意が最重要）

要旨 VERBATIM: *"Our experiments show that, in terms of wall clock time, our JAX-based training pipeline is around 14 times faster than existing approaches, and up to 12500x when multiple training runs are vectorized."*

| 主張 | 倍率 | ベースライン | 条件（**必ず併記**） |
|------|------|--------------|----------------------|
| 単一ラン | **around 14 times faster** | existing approaches（既存 CPU ベース実装） | wall clock time、**単一の学習ラン**での比較 |
| 複数ラン vectorize | **up to 12500x** | existing approaches | **複数の学習ランを vectorize した場合**（multiple training runs are vectorized） |

**最重要注意**: 「12500x」は**複数ランを `vmap` でまとめて並列実行した場合**の上限値であり、**単一ランの高速化は約 14x**。「JaxMARL は 12500 倍速い」と単独で書くのは誤り。常に「複数ラン vectorize 時の最大値」という条件を付けること。逆に単一ラン比較なら「約 14 倍」を使う。

## JAX エコシステムにおける位置づけ

- 本クラスタの **マルチエージェント RL** 枠の基盤。単一エージェント側の PureJaxRL/Brax に対する MARL 版「end-to-end をアクセラレータでコンパイル」の実証。
- Oxford FLAIR（Foerster, Lu, Lange ら）の JAX RL 群（Craftax, Kinetix, Discovered Policy Optimisation, evosax）と同じ研究室・共著者ネットワーク。SMAX により StarCraft II エンジン依存を断ち、self-play/meta-learning を GPU 上で回せるようにした点が応用上の意義。
- 「複数ランを vectorize して評価危機を緩和する」というパラダイムは、JAX RL 全体の評価方法論に影響（多シード並列評価の標準化）。

## 限界・注意点

- **12500x の誤引用リスクが本クラスタ最大**。条件（複数ラン vectorize）を外した引用は厳禁。
- SMAX は SC II の**近似（approximate）再実装**であり、本家 StarCraft Multi-Agent Challenge と完全に同一の挙動ではない（要旨が "approximate reimplementation" と明記）。
- 12500x の絶対値はハードウェア・ラン数・環境に依存する上限。一般化した倍率として扱わない。

## 出典

- arXiv abstract page: https://arxiv.org/abs/2311.10090 （WebFetch でタイトル・全著者・要旨・speedup の条件を verbatim 照合、2026-06-26）
