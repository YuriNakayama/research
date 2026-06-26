# EnvPool: 高度に並列化された RL 環境実行エンジン

> 原題: *EnvPool: A Highly Parallel Reinforcement Learning Environment Execution Engine*

## 基本情報

| 項目 | 内容 |
|------|------|
| 著者 | Jiayi Weng, Min Lin, Shengyi Huang, Bo Liu, Denys Makoviichuk, Viktor Makoviychuk, Zichen Liu, Yufan Song, Ting Luo, Yukun Jiang, Zhongwen Xu, Shuicheng Yan |
| 所属 | Sea AI Lab / sail-sg ほか |
| arXiv | [2206.10558](https://arxiv.org/abs/2206.10558) |
| 査読発表 | NeurIPS 2022（comments: "NeurIPS'22 camera-ready version"） |
| 公式 | https://github.com/sail-sg/envpool |

## 課題・背景

IMPALA・Ape-X・SeedRL・Sample Factory など過去の RL システムは「総合スループット（overall throughput）」の改善を狙ってきたが、abstract が指摘する通り **「parallel environment execution, which is often the slowest part of the whole system but receives little attention（並列環境実行はシステム全体で最も遅い部分なのに注目されてこなかった）」** がボトルネック。EnvPool はこの「環境実行」自体を C++ で並列化し直す。

## 提案手法・コア機構

- **C++ 非同期バッチ環境実行エンジン**: 環境ステップを C++ スレッドプールで非同期実行し、Python の GIL とプロセス間通信オーバーヘッドを回避。abstract いわく「a curated design for paralleling RL environments（RL 環境を並列化する入念な設計）」。
- **モデル非依存**: 学習側（モデル/アルゴリズム）と疎結合。CleanRL・rl_games・DeepMind Acme などと組み合わせ可能（「great compatibility with existing RL training libraries ... including CleanRL, rl_games, DeepMind Acme, etc.」）。
- **ハードウェア横断スケーラビリティ**: ラップトップ〜ワークステーション〜DGX-A100 まで対応（「ranging from a laptop and a modest workstation, to a high-end machine such as NVIDIA DGX-A100」）。
- C/C++ ネイティブ環境を高速供給する「②env 高速化」型エンジンであり、GPU 物理常駐はしない（環境は CPU 実行）。

## 主要な定量結果（VERBATIM 引用 + 条件明記）

abstract VERBATIM:

> "On a high-end machine, EnvPool achieves one million frames per second for the environment execution on Atari environments and three million frames per second on MuJoCo environments."

> "When running EnvPool on a laptop, the speed is 2.8x that of the Python subprocess."

> "Example runs show that it only takes five minutes to train agents to play Atari Pong and MuJoCo Ant on a laptop."

| 主張 | 数値（VERBATIM） | 条件・ハードウェア |
|------|-----------------|--------------------|
| Atari 環境実行 | "one million frames per second"（≒1M FPS） | high-end machine = **NVIDIA DGX-A100（256 CPU コア）** |
| MuJoCo 環境実行 | "three million frames per second"（≒3M FPS） | 同上（DGX-A100, 256 CPU コア） |
| ラップトップ速度 | "2.8x that of the Python subprocess" | ノート PC（12 コアクラス） |
| 学習試行例 | Atari Pong / MuJoCo Ant を "five minutes" で学習 | ラップトップ |

**gym.vector_env 比の speedup について**: abstract には倍率の明記なし。プロジェクト README/論文本文では Atari 14.9x、MuJoCo 約 19.x（README 19.6x ≒ 20x / 論文本文 19.2x）とされる（条件はいずれも DGX-A100 256 コア）。**この倍率は abstract VERBATIM ではない**ため、出典区分を明示して扱う。

## pytorch_native クラスタにおける位置づけ

**①env 高速化系統の代表格**。C++ 非同期実行で CPU 上の環境ステップを 1M〜3M FPS まで引き上げ、PyTorch/JAX 双方のトレーナにモデル非依存で供給する。GPU 物理常駐（②）でも独自トレーナ（③）でもない、純粋な「環境実行エンジン」。CleanRL の Atari PPO 学習時間を約 200 分 → 約 73 分に短縮する用途で広く使われる。

## 限界・注意点

- 1M/3M FPS は **DGX-A100 256 CPU コアという最高級機での値**。コンシューマ機では大幅に下がる（ラップトップでは Python subprocess 比 2.8x が指標）。
- 環境は依然 CPU 実行のため、物理 GPU 常駐型（Isaac Gym / Madrona）のような CPU↔GPU 転送ゼロ化はしない。
- 高速化の対象は「環境実行」であり、学習アルゴリズムの sample efficiency は改善しない。
- gym.vector_env 比「~20x」は MuJoCo の値で、Atari は 14.9x。倍率は abstract ではなく README/本文由来。

## 出典

- arXiv abstract: https://arxiv.org/abs/2206.10558（NeurIPS'22 camera-ready）
- リポジトリ/README: https://github.com/sail-sg/envpool
