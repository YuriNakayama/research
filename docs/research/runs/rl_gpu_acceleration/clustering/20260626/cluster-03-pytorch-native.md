# Cluster 03: PyTorch / ネイティブコード系 — 非 JAX の高速化

## 概要

JAX を使わずに RL を高速化する系統。アプローチは 2 つ — (a) **環境を C/C++/Rust で高速化**して CPU 上で 1M+ steps/s を出し PyTorch トレーナへ供給（PufferLib/EnvPool/Rust sim）、(b) **物理を GPU 常駐化**して観測・行動・報酬まで GPU 上で完結（Isaac Lab/Madrona/WarpDrive）。加えてトレーナ側を torch.compile + CUDA graphs で加速。env が固定（外部ゲーム/ロボット）でも使え、デバッグが容易な点が JAX 系に対する実務的優位。

## キーワード

`PufferLib`, `PuffeRL`, `Ocean`, `EnvPool`, `Sample Factory`, `APPO`, `Isaac Gym`, `Isaac Lab`, `Isaac Sim`, `Newton`, `Madrona`, `GPUDrive`, `WarpDrive`, `TorchRL`, `TensorDict`, `torch.compile`, `CUDA graphs`, `AMP`, `LeanRL`, `CleanRL`, `Stable-Baselines3`, `RLlib`, `Rust sim`, `PyO3`

## 主要ライブラリ（2026-06-26 時点）

| ライブラリ | 種別 | 一言で | 主要数値 |
|-----------|------|--------|---------|
| PufferLib | C 環境 + トレーナ | Ocean 環境 + PuffeRL（CleanRL 互換） | RTX 4090 で 300k–1.2M（v4 CUDA で最大 20M）steps/s |
| EnvPool | 環境実行エンジン | C++ 非同期バッチ環境（モデル非依存） | Atari ~1M / MuJoCo ~3M FPS、subprocess 比 ~15–20x |
| Sample Factory | RL システム | 単機非同期 APPO + 共有メモリ | VizDoom 146K / Atari 136K FPS |
| Isaac Lab | ロボット学習基盤 | Isaac Sim 上の統合 RL（Isaac Gym 後継） | Ant 540K steps/s, 4096並列, 収束<2分(A100) |
| Madrona + GPUDrive | バッチ sim エンジン | GPU バッチ ECS シミュレーション | Hide&Seek >1.9M / GPUDrive >1M FPS |
| WarpDrive | MARL（**2025-05 アーカイブ**） | 単一 GPU end-to-end MARL | 2D-Tag 2.9M steps/s, CPU比 ≥100x |
| TorchRL / TensorDict / LeanRL | PyTorch ネイティブ加速 | torch.compile + CUDA graphs | LeanRL が CleanRL を最大 6.8x（H100） |
| CleanRL / SB3 / RLlib | RL 実装集 | 単一ファイル / 信頼性 / 分散 | — |

## 横断的洞察

- **3 系統の攻め方**: ①環境を高速化（C/Rust env）②物理を GPU 常駐化（CPU↔GPU 転送排除）③トレーナの起動オーバーヘッド削減（torch.compile + CUDA graphs）。
- **CUDA graphs の寄与が支配的**（LeanRL）= RL が launch-bound である証左。これは JAX の XLA fusion と同根の問題への PyTorch 側の対処。
- **混合精度（AMP）は RL では効きにくい**（matmul FLOPs より起動オーバーヘッドが支配的なため。大規模 NN/ピクセルベース RL では有効）。

## 検証注意

- 「Frog Parade」なる Rust sim は実在確認できず（名称誤りの可能性）。実在 citable は entity-gym-rs の「RTX 2080 Ti で 100K frames/s」（著者ブログ、査読なし）。
- Lux AI S3 は Rust ではなく **JAX ベース**。
- PufferLib「20M steps/s」は v4 CUDA backend のプロジェクト docs 値（査読論文は v3「3–5M」まで）。

## 出力

詳細レポート: `docs/research/runs/rl_gpu_acceleration/retrieval/20260626_pytorch_native/`（index + 01–09）
