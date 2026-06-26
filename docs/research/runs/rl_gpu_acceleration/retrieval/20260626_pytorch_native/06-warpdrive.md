# 06. WarpDrive（Salesforce）

## 概要カード

- **GitHub**: https://github.com/salesforce/warp-drive
- **一言で言うと**: マルチエージェント RL（MARL）を完全に GPU 上で end-to-end 実行し、CPU↔GPU 間のデータコピーを排除するオープンソースフレームワーク
- **Star（概算）**: ~503（forks 83、2026-06-26 確認）
- **最新状態**: 最新リリース v2.7（2024-02-19）。**2025-05-01 にアーカイブ済（read-only、保守終了）**。License: BSD-3-Clause
- **論文**: 
  - arXiv: "WarpDrive: Extremely Fast End-to-End Deep Multi-Agent Reinforcement Learning on a GPU"（Tian Lan, Sunil Srinivasa, Huan Wang, Stephan Zheng）https://arxiv.org/abs/2108.13976
  - JMLR 出版: https://jmlr.org/papers/v23/22-0185.html（JMLR vol.23, 2022）
  - Salesforce ブログ: https://blog.salesforceairesearch.com/warpdrive-fast-rl-on-a-gpu/
- **主要ベンチマーク**: 2D-Tag で 2.9M env steps/s（2000 環境 × 1000 エージェント）、CPU 比 ≥100x。出典: JMLR v23 / arXiv 2108.13976

## 単一 GPU 上の end-to-end MARL（CPU-GPU 転送なし）

JMLR/arXiv abstract（https://jmlr.org/papers/v23/22-0185.html で検証）:
- 「WarpDrive ... eliminates data copying between the CPU and GPU and runs thousands of simulations and agents in parallel. It also enables distributed training on multiple GPUs and scales to millions of agents ... WarpDrive enables orders-of-magnitude faster MARL compared to common CPU-GPU implementations.」（CPU-GPU 間データコピーを排除し、数千のシミュレーション/エージェントを並列実行。複数 GPU 分散学習で数百万エージェントまでスケール。一般的な CPU-GPU 実装比で桁違いに高速な MARL を実現）
- 仕組み: **環境シミュレーションと RL 学習（モデル推論 + 誤差逆伝播）の両方を GPU 上で実行**。データは単一の統合 GPU データストアに格納され in-place 更新されるため、観測/行動/報酬が CPU に往復しない。**PyCUDA + PyTorch** ベース

## スループット / 高速化の主張（正確な数値 + 出典）

JMLR abstract（https://jmlr.org/papers/v23/22-0185.html、逐語確認）:
- **2.9 million environment steps/second**（**2,000 環境・1,000 エージェント**の 2D-Tag シミュレーション）
- **「at least 100× faster than a CPU version.」**

GitHub README（https://github.com/salesforce/warp-drive/blob/master/README.md）:
- 「at least 100x throughput over CPU-based counterparts」
- 環境は「millions of steps per second」で実行、学習は単一 GPU 上「few hours」で完了
- **~10× faster** than an N1 16-CPU node（**単一 A100 GPU** との比較、Tag 環境 100 runners / 5 taggers / 60 環境レプリカ）

## 並列エージェント / 環境数

GitHub README より:
- **GPU あたり 1〜1,000 環境**
- **環境あたり 1〜1,024 エージェント**
- v1.6+ で複数 GPU ブロックを組み合わせ、1 環境レプリカで **>1,024 エージェント**対応
- v1.4+ で **2–16 GPU ノード**の分散シミュレーション対応、abstract によれば**数百万エージェント**までスケール

## CUDA-C 環境要件

README より:
- 環境は GPU 側 step 関数を提供する必要がある。**v1.0+** では手書き **CUDA C**（"CUDA environment layer"）が必須
- **v2.0+** で **Numba** バックエンドを追加し、生 CUDA C の代わりに Numba コンパイル Python で step 関数を書けるようになり参入障壁を低下
- ビルド要件: **CUDA 11.0+**。ベンチ参照ハードウェアは **NVIDIA A100** と **Tesla V100-SXM2**

## 位置づけ

「環境も学習もすべて GPU 上」という思想は Isaac Gym（物理）や Madrona（バッチ ECS）と共通するが、WarpDrive は**マルチエージェント RL（MARL）**に特化し、CUDA-C/Numba で環境を GPU カーネルとして書く点が特徴。ただし **2025-05-01 にアーカイブされ保守終了**しており、現在は歴史的・参照的位置づけ。同種の MARL ニーズは JAX 側の JaxMARL（`20260626_all/05`）や Madrona/GPUDrive（本クラスタ 05）でカバーされつつある。

## 検証フラグ

- **Salesforce 公式ブログ（salesforce.com 側）** は HTTP 403 で直接取得不可。スループット数値は JMLR abstract と GitHub README で検証（2.9M steps/s, ≥100× CPU で一致）。
- **2.9M steps/s の正確な GPU 機種**: abstract に明記なし（別の ~10× 比較は A100 を明示）。repo 的に A100/V100 クラスと推定されるが abstract 本文では未確認。
- **アーカイブ済（2025-05-01, read-only）**: 保守終了。

## 出典 URL

- https://github.com/salesforce/warp-drive
- https://arxiv.org/abs/2108.13976
- https://jmlr.org/papers/v23/22-0185.html
- https://blog.salesforceairesearch.com/warpdrive-fast-rl-on-a-gpu/
