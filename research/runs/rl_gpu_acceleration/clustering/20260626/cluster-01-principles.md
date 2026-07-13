# Cluster 01: 高速化の技術原理 — なぜ GPU で RL が速くなるのか

## 概要

RL を GPU で高速化する全技術の **土台となる原理**を、メカニズムレベルで説明するクラスタ。「どのツールを使うか」の前に「なぜ速くなるのか／どこまで速くなるのか」を理解しないと、倍率の誇張に騙され、誤った最適化に時間を浪費する。最重要メッセージは **FPS（steps/sec）≠ 収束までの実時間** である。

## キーワード

`host-device transfer`, `actor-learner sync`, `policy-lag`, `V-trace`, `vectorized env`, `SIMT`, `JIT`, `XLA fusion`, `lax.scan`, `vmap`, `Anakin`, `Sebulba`, `mixed precision`, `bf16`, `CUDA graphs`, `warp divergence`, `sim-bound vs learner-bound`, `Amdahl's law`, `sample efficiency`

## 中心的な論点

1. **古典的ボトルネック**: CPU 環境 + GPU ポリシーの直列構成で毎ステップ host↔device 往復。GA3C で推論待ち 108ms 中 GPU 推論 10%、GPU 稼働率 56%。CPU sim 方式は ~10k–100k FPS で頭打ち。
2. **everything on accelerator パラダイム**: 環境自体を GPU/TPU 上に実装し、ロールアウト〜学習をデバイス上に閉じる。host 転送が原理的に消滅 → 100–1000x。
3. **ベクトル化**: 数千 env を単一テンソル `(N, ...)` として GPU の SIMT に直接マップ。CPU subprocess（pickle/IPC/GIL/context switch）との本質的な差。
4. **JIT/XLA**: `jit` + `lax.scan` がロールアウト全体を単一 WhileOp + 融合カーネルへ。HBM 往復排除。`vmap` で自動ベクトル化。
5. **Anakin vs Sebulba**: 環境がどこで動くか（デバイス上 vs CPU ホスト）で決まる 2 つの配置戦略。
6. **ハードウェア論点**: multi-GPU の all-reduce、TPU pod、HBM 制約、混合精度（bf16/fp16）、CUDA graphs。
7. **限界**: warp divergence、外部エンジン依存、巨大観測、デバッグ困難、数値精度。
8. **スループットの算数（最重要）**: 1000x の sim 高速化 ≠ 1000x 速い学習。learner-bound 化・大バッチの sample efficiency 劣化・Amdahl 的直列部分が実時間を律速。

## 主要一次資料

| 資料 | 役割 |
|------|------|
| GA3C (arXiv 1611.06256) | host-device オーバーヘッドの定量証拠（108ms/10%） |
| IMPALA (arXiv 1802.01561) | actor-learner 分離、policy-lag、V-trace、250K FPS |
| Sample Factory (arXiv 2006.11751) | 同期 RL 批判、double-buffered sampling |
| Podracer (arXiv 2104.06272) | Anakin / Sebulba の定義 |
| Brax (arXiv 2106.13281) / Isaac Gym (arXiv 2108.10470) | everything-on-device の数値 |
| OpenXLA fusion docs / JAX docs | JIT/scan/vmap/fusion のメカニズム |
| Large Batch Simulation (arXiv 2103.07013) / Staggered Resets (arXiv 2511.21011) | 大バッチの sample efficiency 劣化 |
| Chris Lu "Meta-Disco" blog | 「4000x」の内訳分解 |

## 出力

詳細レポート: `docs/research/runs/rl_gpu_acceleration/retrieval/20260626_principles/index.md`（全 8 章、一次資料の逐語引用付き）
