# evosax — JAX ベースの進化戦略（Evolution Strategies）

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem` / retrieval（個別 deep-dive）

## 基本情報

| 項目 | 内容 |
|------|------|
| タイトル | evosax: JAX-based Evolution Strategies |
| 著者 | Robert Tjarko Lange |
| 年 | 2022（投稿日: 2022-12-08） |
| venue | GECCO 2023 Companion（要旨では arXiv cs.NE 分類） |
| arXiv ID | 2212.04180 |
| URL | https://arxiv.org/abs/2212.04180 |
| 所属 | TU Berlin / Google DeepMind（Lange） |

## 課題・背景

深層学習は「hardware lottery」— 近年のハードウェアアクセラレータとコンパイラの進展 — により大規模バッチ勾配最適化が可能になり加速した。一方、**進化的最適化（evolutionary optimization）は主に CPU 並列（Dask スケジューリング・分散マルチホスト）に依存**してきた。本論文は、進化計算も GPU/TPU の膨大な計算スループットから大きな恩恵を受けられると主張する。

要旨 VERBATIM: *"Evolutionary optimization, on the other hand, has mainly relied on CPU-parallelism, e.g. using Dask scheduling and distributed multi-host infrastructure. Here we argue that also modern evolutionary computation can significantly benefit from the massive computational throughput provided by GPUs and TPUs."*

## 提案手法・コア機構

- **JAX ベースの進化戦略ライブラリ**: 要旨 VERBATIM — *"we release evosax: A JAX-based library of evolution strategies which allows researchers to leverage powerful function transformations such as just-in-time compilation, automatic vectorization and hardware parallelization."*
  - **`jit`（just-in-time compilation）**: ES の ask-tell ループを XLA でコンパイル。
  - **`vmap`（automatic vectorization）**: 個体群（population）の評価を自動ベクトル化。各個体の目的関数評価を 1 行でバッチ化。
  - **ハードウェア並列化（`pmap` 相当）**: 単一行のコードでデバイス横断に並列/分散（要旨: *"automatically vectorized or parallelized across devices using a single line of code"*）。
- **ask-evaluate-tell API**: モジュラー設計で、`ask`（候補生成）→ `evaluate`（適応度評価、ユーザ側で `vmap` 並列化）→ `tell`（分布更新）のシンプルな API（要旨: *"flexible usage via a simple ask-evaluate-tell API"*）。
- **RL との関係**: 勾配フリー最適化（ES/遺伝的アルゴリズム）を RL のポリシー最適化に使えるようにし、Brax 等の JAX 環境と組み合わせて end-to-end でアクセラレータ上の ES-RL を回す基盤を提供。

## 主要な定量結果（VERBATIM・条件付き）

要旨は speedup 倍率・FPS を提示せず、**実装アルゴリズム数**が主要な定量主張。

- VERBATIM: *"evosax implements 30 evolutionary optimization algorithms including finite-difference-based, estimation-of-distribution evolution strategies and various genetic algorithms."*
  - **実装アルゴリズム数: 30**（finite-difference ベース、推定分布型 ES、各種遺伝的アルゴリズムを含む）。
- 速度に関する主張は質的（GPU/TPU のスループットの恩恵を受けられる）であり、具体的な倍率・FPS は要旨に**非掲載**。

注意: evosax は speedup 倍率を要旨で主張していないため、本クラスタ speedup 一覧では「該当なし（30 アルゴリズム実装・GPU/TPU 並列化を質的に訴求）」として扱う。

## JAX エコシステムにおける位置づけ

- 本クラスタの **勾配フリー最適化（進化戦略）** 枠。Brax 要旨にも「ES」の再実装が含まれるが、evosax はそれを汎用ライブラリ化し 30+ アルゴリズムを `ask-evaluate-tell` で統一提供。
- 著者の Robert Tjarko Lange は JaxMARL（2311.10090）の共著者でもあり、Oxford FLAIR / DeepMind 圏の JAX RL/ES エコシステムの中核人物。`vmap` による population 評価並列化は、RL の複数シード/環境並列化と同じ JAX イディオムを進化計算に持ち込んだもの。
- meta-RL / black-box 最適化（学習則の進化など）の基盤ツールとして、Discovered Policy Optimisation 系のメタ学習研究とも親和性が高い。

## 限界・注意点

- 速度の絶対値・倍率は要旨にないため、「evosax は N 倍速い」とは書けない。GPU/TPU 並列化の質的優位に留める。
- ES の評価は目的関数（環境ロールアウト）が支配的であり、高速化の実効は環境側（Brax 等）が `vmap`/`jit` 化されているかに依存する。
- ES は勾配法に比べサンプル効率が劣る場合があり、ハードウェア並列化で評価数を稼ぐ前提（高スループット環境とセットで初めて有利）。

## 出典

- arXiv abstract page: https://arxiv.org/abs/2212.04180 （WebFetch でタイトル・著者・要旨・定量主張を verbatim 照合、2026-06-26）
