# 07. TorchRL / TensorDict / torch.compile / CUDA Graphs / AMP / LeanRL（Meta / PyTorch）

PyTorch ネイティブの RL 加速技術群。アルゴリズム/環境ではなく「PyTorch トレーナ自体のオーバーヘッド削減」に焦点。

## TorchRL

| 項目 | 値 | 出典 |
|---|---|---|
| **名称** | TorchRL（`pytorch/rl`） | — |
| **一言** | "A modular, primitive-first, python-first PyTorch library for Reinforcement Learning." | https://github.com/pytorch/rl |
| **論文** | "TorchRL: A data-driven decision-making library for PyTorch", arXiv **2306.00577** | https://arxiv.org/abs/2306.00577 |
| **著者** | Bou, Bettini, Dittert, Kumar, Sodhani, Yang, De Fabritiis, Moens | 同上 |
| **日付** | 投稿 2023-06-01、v2 改訂 2023-11-27 | 同上 |
| **Star** | ~3.5k（2026-06-26） | https://github.com/pytorch/rl |
| **最新版/状態** | **v0.13.2**（GitHub 2026-06-17 / PyPI 2026-06-16）。活発。Python ≥3.10、PyTorch 2.1+ | https://github.com/pytorch/rl, https://pypi.org/project/torchrl/ |

abstract（purpose の根拠）: 「PyTorch ... lacks a native and comprehensive library for decision and control tasks ... we propose TorchRL, a generalistic control library for PyTorch ... We introduce a new and flexible PyTorch primitive, the TensorDict.」

torch.compile/CUDA 連携: README は各コンポーネントが「increasingly friendly to `torch.compile`, CUDA, shared memory, memmaps, and distributed execution」と記述。TorchRL 0.13 以降 CUDA ベースの優先度付きリプレイバッファの Linux CUDA wheel を公開。**フラグ: README 自体には定量的な高速化数値はインラインで記載なし**（ベンチマークバッジは外部リンク）。

## TensorDict

| 項目 | 値 | 出典 |
|---|---|---|
| **名称** | TensorDict（`pytorch/tensordict`） | — |
| **一言** | "TensorDict is a batched, nested `dict[str, Tensor]` that behaves like a tensor." | https://github.com/pytorch/tensordict |
| **Star** | ~1,000（2026-06-26） | 同上 |
| **最新版/状態** | **v0.13.0（2026-06-04）**、活発 | 同上 |

**RL での効用（repo で検証）**:
- 単一の共有 `batch_size` を持つ dict 風テンソルコンテナで、「Move it, slice it, reshape it, stack it, save it, compile it, or do arithmetic on it」— つまり**全 leaf を一括でベクトル化/バッチ操作**でき、これが boilerplate 削減の本質
- ネストした軌跡（方策 + 環境報酬を 1 構造に）をカスタムコードなしで扱える
- `TensorDict.from_module()` / `to_module()` による関数的パラメータ操作（ベクトル化アンサンブル/ターゲットネットのモデル状態スワップに利用）
- **compile 対応**: 「used in compiled training and RL loops」、ホットパスに専用の `torch.compile` カバレッジ。v0.13 で compile 挙動改善
- **`CudaGraphModule`**: `nn.Module` を CUDA graphs で安全にラップするラッパ（LeanRL で使われる橋渡し）

## LeanRL（torch.compile + CUDA graphs の代表ベンチマーク）

| 項目 | 値 | 出典 |
|---|---|---|
| **名称** | LeanRL | https://github.com/meta-pytorch/LeanRL |
| **URL 注記** | 旧 `github.com/pytorch-labs/LeanRL` は `meta-pytorch/LeanRL` へリダイレクト（org 改名）。同一 repo | 同上 |
| **一言** | "a fork of CleanRL, where selected PyTorch scripts optimized for performance using compile and cudagraphs." 目的は「cut training time by half or more」 | 同上 |
| **Star** | 694（forks 32、2026-06-26） | 同上 |
| **著者** | Vincent Moens（Meta、TorchRL/TensorDict メンテナ）。2024-09 に Show HN で公開 | https://news.ycombinator.com/item?id=41597676 |
| **状態** | 軽量デモ repo（28 コミット、logging/checkpointing を意図的に除去し純粋な runtime 計測用） | 同上 |

**全体高速化（vs ベースライン CleanRL）**:

| アルゴリズム | 全体高速化 |
|---|---|
| PPO (Atari) | **6.8x** |
| SAC (連続) | **5.7x** |
| TD3 (連続) | **3.4x** |
| PPO (連続行動) | **2.7x** |

**FPS 詳細（H100 GPU、同一 step 数、3 seed）**:

| アルゴリズム | CleanRL | LeanRL baseline | + torch.compile | + Compile **and** CUDA graphs | 全体 |
|---|---|---|---|---|---|
| PPO (Atari) | 1022 | 3728 | 3841 | **6809** | 6.8x |
| PPO (連続) | 652 | 683 | 908 | **1774** | 2.7x |
| SAC (連続) | 127 | 130 | 255 | **725** | 5.7x |
| TD3 (連続) | 272 | 247 | 272 | **936** | 3.4x |

出典: https://github.com/meta-pytorch/LeanRL（README）

**最適化スタック（README 逐語）**: ① torch.compile（オーバーヘッド削減 + 演算子融合）② cudagraphs（全 CUDA 演算の隔離）③ tensordict（CUDA 上のデータコピー高速化・明確化）④ torch.vmap（Q 値ネットの実行ベクトル化）

**重要な含意**: 連続制御・off-policy 系（PPO 連続, SAC, TD3）では **torch.compile 単体の効果は控えめ**（TD3 は 272 fps のまま無変化）。**大きな飛躍は compile の上に CUDA graphs を積んだ時に起きる**（SAC 255→725、TD3 272→936）。これは **RL が起動オーバーヘッド/CPU バウンド**であり演算バウンドでない、というテーゼを直接裏付ける。

## CUDA Graphs — 仕組みと RL での意義

公式ブログ「Accelerating PyTorch with CUDA Graphs」より:
- CUDA graph は「a record of the work (mostly kernels and their arguments) that a CUDA stream and its dependent streams perform」。捕捉後リプレイで「runs the GPU work as many times as needed」
- 解決する問題: 「CPU cores process meta-data like tensor shapes in order to prepare arguments needed to launch GPU kernels ... at small batch sizes CPU overhead can become larger than GPU run time. When that happens, GPUs go idle between kernel calls.」
- 効果: 「The GPU hardware launches the tasks in the captured CUDA Graph without CPU intervention. This reduces the overhead of launching individual GPU tasks.」
- 出典: https://pytorch.org/blog/accelerating-pytorch-with-cuda-graphs/

**RL での意義**: LeanRL は「Reinforcement learning is notoriously CPU-bound due to the high frequency of small CPU operations」と述べ、torch.compile 単体では「a minor CPU overhead associated with the execution of compiled code itself ... can negate the benefits of operator fusions」と説明。そのため CUDA graphs を重ねて毎 step の起動コストを除去し、最大 6.8x の end-to-end 高速化に至る。

## 混合精度（AMP — fp16 / bf16）

公式ブログ「What Every User Should Know About Mixed Precision Training in PyTorch」より:
- 「torch.amp ... makes it easy to get the speed and memory usage benefits of lower precision data types while preserving convergence behavior.」
- 「Peak float16 matrix multiplication and convolution performance is 16x faster than peak float32 performance on A100 GPUs」
- 一般高速化値: 「mixed precision training is **1.5x to 5.5x faster over float32 on V100** GPUs, and an additional **1.3x to 2.5x faster on A100** GPUs on a variety of networks.」
- bf16 vs fp16: 通常同程度に高速。精度が要るなら fp16、ダイナミックレンジが要るなら bf16（bf16 のレンジは float32 と同等）。Ampere 以降は bf16 が実用デフォルト
- 出典: https://pytorch.org/blog/what-every-user-should-know-about-mixed-precision-training-in-pytorch/

**RL で効きにくい理由（重要）**: RL は matmul FLOPs より CPU 起動オーバーヘッドが支配的なため、AMP（Tensor Core の大きな matmul で効く）の恩恵は小ネット RL では限定的。一方、**大規模ネットワーク/ピクセルベース RL（CNN エンコーダ）では AMP が効く**。ただし**この RL 特化の言明は一次 RL ベンチマークの直接引用ではなく、AMP ブログ（恩恵は大 matmul 由来）+ LeanRL の launch-bound 証拠を合成した推論である点をフラグ**。

## 位置づけ

本クラスタの他手法が「環境を速くする」のに対し、TorchRL/TensorDict/torch.compile/CUDA graphs は「**トレーナ側の Python/起動オーバーヘッドを削る**」アプローチ。EnvPool/Ocean のような高速環境と組み合わせると相乗効果が大きい。LeanRL は CleanRL（本クラスタ 08）に対する「最適化版テンプレート」として機能する。

## 検証フラグ

- **pytorch.org/blog の LeanRL 専用記事**: 専用 blog 記事は確認できず。正典出典は LeanRL GitHub README + Show HN（いずれも Vincent Moens）。
- **TorchRL v0.13.2 のリリース日**: GitHub 2026-06-17 / PyPI 2026-06-16 の 1 日差。
- **AMP の RL 特化言明**（launch-bound だから効きにくい/ピクセルベースでは効く）: 一次 RL ベンチの直接引用ではなく合成的推論。
- **`pytorch-labs/LeanRL` → `meta-pytorch/LeanRL`**: org 改名によるライブリダイレクト。

## 出典 URL

- https://github.com/pytorch/rl
- https://arxiv.org/abs/2306.00577
- https://github.com/pytorch/tensordict
- https://github.com/meta-pytorch/LeanRL
- https://news.ycombinator.com/item?id=41597676
- https://pytorch.org/blog/accelerating-pytorch-with-cuda-graphs/
- https://pytorch.org/blog/what-every-user-should-know-about-mixed-precision-training-in-pytorch/
