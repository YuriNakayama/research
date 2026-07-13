# 04. gymnax（Robert T. Lange）— JAX ネイティブ古典環境

## 概要カード

- **一言で言うと**: 古典 RL 環境（classic control, bsuite, MinAtar, メタ RL）の JAX ネイティブ再実装。`jit`/`vmap` 互換で、大規模ベクトル化・GPU/TPU 高速 rollout が可能。
- **GitHub**: https://github.com/RobertTLange/gymnax
- **Star（概算）**: ~900（GitHub ページ表示「904」）。出典: https://github.com/RobertTLange/gymnax
- **最新版**: **v0.0.9**（2025-05-23 リリース）。出典: https://pypi.org/project/gymnax/

**状態**: 最新リリースは v0.0.9（2025-05）で、本調査時点で 2026 年のリリースは無し。メンテはされているがリリース頻度は低い。コミュニティフォーク `smorad/stable-gymnax` も存在。出典: https://pypi.org/project/gymnax/

## 環境カテゴリ

- **Classic Control**: Acrobot, Pendulum, CartPole, MountainCar
- **bsuite**: Catch, DeepSea, MemoryChain ほか
- **MinAtar**: Asterix, Breakout, Freeway, SpaceInvaders
- **Misc/メタ RL**: FourRooms, MetaMaze, PointRobot, bandits, Reacher, Swimmer, Pong

出典: https://github.com/RobertTLange/gymnax

## ベンチマーク数値（検証済み）

- **NVIDIA A100・2,000 並列ワーカー**、100 万ステップ遷移（random policy）: **CartPole-v1 を 0.05 秒**。一覧中最遅の Asterix-MinAtar で 0.92 秒。出典: https://github.com/RobertTLange/gymnax
- **gym/NumPy 比の高速化**: CartPole-v1 を NumPy 10 並列環境で回すと 100 万フレームあたり **46 秒**、A100 上の gymnax で 2,000 環境なら **0.05 秒** → **~1000x 高速化**。出典: https://github.com/RobertTLange/gymnax（gymnax-blines ベンチマーク）
  - ⚠️ この比較は並列数が異なる（NumPy 10 環境 vs JAX 2,000 環境）ため、「1000x」はスケール時のスループットを反映しており、単一環境の like-for-like 比較ではない。
- エコシステム文脈: PureJaxRL はフル JAX RL 訓練パイプラインで最大 **4000x** 高速化を報告（gymnax 流環境を利用）。ただし別プロジェクト。出典: https://chrislu.page/blog/meta-disco/

## 検証フラグ

- **「1000x」**: 並列数を揃えていないスループット比較。実数は正しいが条件に注意。
- Star 数・リリース日は変動・概算。

## 出典

- https://github.com/RobertTLange/gymnax
- https://pypi.org/project/gymnax/
- https://chrislu.page/blog/meta-disco/
