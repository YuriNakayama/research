# Isaac Gym: ロボット学習のための高性能 GPU ベース物理シミュレーション

> 原題: *Isaac Gym: High Performance GPU-Based Physics Simulation For Robot Learning*

## 基本情報

| 項目 | 内容 |
|------|------|
| 著者 | Viktor Makoviychuk, Lukasz Wawrzyniak, Yunrong Guo, Michelle Lu, Kier Storey, Miles Macklin, David Hoeller, Nikita Rudin, Arthur Allshire, Ankur Handa, Gavriel State |
| 所属 | NVIDIA |
| arXiv | [2108.10470](https://arxiv.org/abs/2108.10470)（2021-08-24 投稿。comments: "tech report on isaac-gym"） |
| 後継 | Isaac Lab（Isaac Sim 上）/ Newton（GPU 物理エンジン）に発展。Isaac Gym Preview 自体はレガシー |

## 課題・背景

従来の RL 学習は「CPU ベースシミュレータ + GPU でニューラルネット」という構成で、CPU↔GPU 転送と CPU 物理がボトルネックになる。Isaac Gym は **物理シミュレーションと方策学習の双方を GPU 上に常駐させ**、CPU を一切経由せずに物理バッファと PyTorch テンソルを直結する。

## 提案手法・コア機構

abstract VERBATIM:
> "Both physics simulation and the neural network policy training reside on GPU and communicate by directly passing data from physics buffers to PyTorch tensors without ever going through any CPU bottlenecks."

- **GPU 常駐 PhysX パイプライン**: 「PhysX GPU simulations」を用い、剛体物理を GPU 上でバッチ実行。
- **end-to-end GPU テンソル API**: 「observation tensors can be used as inputs to a policy network and the resulting action tensors can be directly fed back into the physics system（観測テンソルを方策ネットの入力にし、出力の行動テンソルを直接物理系に戻す）」。CPU↔GPU コピーをゼロ化。
- **学習器**: 「rl_games, a highly-optimized GPU end-to-end implementation」による PPO。
- 結果として「2-3 orders of magnitude improvements compared to conventional RL training that uses a CPU based simulator（CPU シミュレータ利用の従来 RL 比 2〜3 桁高速）」（abstract VERBATIM）。

## 主要な定量結果（VERBATIM 引用 + 条件明記）

**ハードウェア（VERBATIM）**: 主計測は "single NVIDIA A100 GPU"（CPU は "single 3.7GHz Intel i7-8700K CPU"）。ANYmal rough terrain は "NVIDIA RTX A6000"。

| タスク | スループット / 学習時間（VERBATIM） | 並列環境数 | ハードウェア |
|--------|--------------------------------------|-----------|--------------|
| Ant | "540K environment steps per second"、reward 3000 超を "in just 20 seconds"、"fully converge in under 2 minutes" | 4096 agents | single A100 |
| Humanoid | "200K" steps/s、reward 5000 を "in less than 4 minutes" | 4096 agents | single A100 |
| Shadow Hand | "150K number of parallel environment steps per second" | 16384 agents | single A100 |
| ANYmal（rough terrain, sim-to-real） | 総学習時間 "under 20 minutes" | 多数並列 | RTX A6000 |

> 注: abstract 自体は具体的 FPS を出さず「2-3 orders of magnitude improvements」のみ。上記の個別数値は本文・図（Figures 6–7 等）から VERBATIM 抽出。

## pytorch_native クラスタにおける位置づけ

**②物理 GPU 常駐化系統の原典・代表**。観測・行動・報酬・物理ステップをすべて GPU 上で完結させ、PyTorch テンソルと直結することで CPU 転送を排除する。①（CPU 環境を速くする EnvPool/PufferLib）とは異なり、**そもそも CPU 環境を使わない**アプローチ。本クラスタの「②」を定義づけた技術であり、後継の Isaac Lab / Newton / Madrona 系へと連なる。

## 限界・注意点

- 数値はすべて **A100 / RTX A6000 という高性能 GPU** での値。ロボット剛体タスクに特化しており、任意の RL 環境を GPU 常駐化できるわけではない（環境を GPU 上で書き直す必要がある）。
- Isaac Gym Preview 単体は現在レガシー扱いで、実運用は Isaac Lab（Isaac Sim 上）へ移行が推奨される。
- 「2-3 桁高速」は CPU シミュレータ比であり、ベースラインの取り方に依存する。

## 出典

- arXiv abstract: https://arxiv.org/abs/2108.10470（tech report on isaac-gym）
- 本文（HTML）: https://ar5iv.labs.arxiv.org/abs/2108.10470
