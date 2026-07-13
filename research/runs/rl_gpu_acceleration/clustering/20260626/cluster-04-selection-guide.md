# Cluster 04: 実装・選定実践ガイド

## 概要

cluster-02（JAX）と cluster-03（PyTorch/ネイティブ）の **どちらを・どのハードウェアで・どう選ぶか**を意思決定する横断クラスタ。原理（cluster-01）を踏まえ、実務者が「自分の状況」から最短で大方針を決められるようにする。

## キーワード

`PyTorch vs JAX`, `decision tree`, `hardware tier`, `migration cost`, `optimization checklist`, `pitfalls`, `learning resources`, `torch.compile`, `jittable env`, `consumer GPU`, `A100/H100`, `TPU pod`

## 主要な意思決定軸

### 1. PyTorch vs JAX

| | JAX | PyTorch |
|---|-----|---------|
| 強み | end-to-end GPU で 1000x+、メタ RL、研究 SOTA | エコシステム、デバッグ容易、torch.compile、開発者数 |
| 弱み | 学習曲線、env が jittable 必須、デバッグ困難 | env が CPU なら毎ステップ転送ボトルネックが残る |
| 決定ルール | **env を JAX 化できる/Brax・gymnax を使える → JAX** | **env が外部固定（ゲーム/ロボット/kaggle-env）→ PyTorch** |

### 2. シナリオ別推奨スタック

| シナリオ | 推奨 |
|---------|------|
| env を JAX 化可能 | PureJaxRL + gymnax/Brax |
| env が外部固定 | PyTorch + EnvPool / PufferLib |
| 単一コンシューマ GPU で最大スループット | PufferLib（C env + PuffeRL） |
| TPU pod / マルチ GPU | Sebulba / Mava / Podracer |
| ロボティクス・連続制御 | Isaac Lab / Brax / MJX |
| マルチエージェント | JaxMARL / Mava / PufferLib |
| 初学者・学習目的 | CleanRL（単一ファイル） |

### 3. ハードウェア階層別

- コンシューマ GPU（RTX 3090/4090）→ PufferLib or PureJaxRL
- データセンタ GPU（A100/H100）→ PureJaxRL/Brax or Isaac Lab、torch.compile+CUDA graphs
- マルチ GPU ノード → pmap/sharding or RLlib
- TPU pod → Sebulba/Mava
- CPU のみ → EnvPool + SB3/CleanRL（限定的）

## 最適化チェックリスト（要点）

1. **まず env スループットを計測**（sim-bound か learner-bound か判定）
2. ベクトル化 env（EnvPool/gymnax/PufferLib）を使う
3. host-device 転送を削減（理想は env を GPU 常駐化）
4. num_envs / batch_size をチューニング（大バッチは sample efficiency 劣化に注意）
5. 混合精度（bf16）
6. torch.compile + CUDA graphs（PyTorch）/ jit + lax.scan（JAX）
7. プロファイルしてボトルネックを再確認

## 落とし穴

JAX 再コンパイル罠（動的形状）、GPU OOM（env 数過多）、vmap デバッグ、早すぎる最適化、jit 不能 env で JAX 選択、PRNG キー管理。

## 出力

詳細レポート: `docs/research/runs/rl_gpu_acceleration/retrieval/20260626_all/09-implementation-selection-guide.md`
