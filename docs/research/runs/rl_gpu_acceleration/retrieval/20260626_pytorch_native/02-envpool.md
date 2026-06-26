# 02. EnvPool（sail-sg / Sea AI Lab）

## 概要カード

- **GitHub**: https://github.com/sail-sg/envpool
- **一言で言うと**: 一般 RL 環境向けの C++ ベース高性能並列環境実行エンジン（ベクトル化 env）。モデル非依存で、RL システムで最も遅くなりがちな「並列環境実行」のみを担う
- **Star（概算）**: ~1,470（GitHub API ライブ取得 2026-06-26）
- **最新状態**: 最新リリース **v1.2.5（2026-05-20）**。直近は v1.2.4（2026-05-16）, v1.2.3（2026-05-11）。最終コミット 2026-06-17。License: Apache-2.0。**2026 年も活発に保守されている**（5月に複数リリース、6月までコミットあり）
- **論文**: "EnvPool: A Highly Parallel Reinforcement Learning Environment Execution Engine" — https://arxiv.org/abs/2206.10558（v1: 2022-06-21, NeurIPS 2022 camera-ready: 2022-10-12）。HTML ミラー: https://ar5iv.labs.arxiv.org/html/2206.10558
- **主要ベンチマーク**: Atari ~1M FPS / MuJoCo ~3M FPS（DGX-A100, 256 CPU コア）。出典: arXiv 2206.10558 + README

## 正確な FPS 数値とハードウェア

- abstract/論文: 「one million frames per second for Atari」「three million frames per second on MuJoCo」— **NVIDIA DGX-A100, 256 CPU コア**（出典: arXiv 2206.10558）
- README スループット表（https://github.com/sail-sg/envpool）:

**Atari (PongNoFrameskip-v4), DGX-A100 / 256 コア:**

| 手法 | FPS |
|------|-----|
| For-loop | 4,640 |
| Subprocess | 71,943 |
| Sample-Factory | 707,494 |
| EnvPool（async） | 891,286 |
| **EnvPool（numa + async）** | **1,069,922** |

**MuJoCo (Ant-v3), DGX-A100 / 256 コア:**

| 手法 | FPS |
|------|-----|
| For-loop | 11,569 |
| Subprocess | 163,656 |
| Sample-Factory | 1,573,262 |
| EnvPool（async） | 2,363,864 |
| **EnvPool（numa + async）** | **3,134,287** |

その他ハードウェア（README）: ノート PC（12 コア）Atari async ~49,439 / MuJoCo async ~105,126。ワークステーション（32 コア）Atari async ~200,428 / MuJoCo async ~582,446。TPU-VM（96 コア）Atari numa+async ~373,169 / MuJoCo numa+async ~896,830。

## 「~20x over Python subprocess」の正確な文脈

- README: 「1 Million frames per second with Atari and 3 Million frames per second with MuJoCo on 256 CPU cores, which is **14.9x / 19.6x** of the `gym.vector_env` baseline.」
- 論文本文（ar5iv）: 「**14.9× / 19.2×** improvement」over Python subprocess（DGX-A100）
- 「~20x」は **MuJoCo を 256 コア DGX-A100 で gym.vector_env / subprocess と比較した値**。Atari は 14.9x。
- ノート PC（12 コア）: 「2.8x that of the Python subprocess」（abstract）。README は Atari/MuJoCo で ~3.1x/2.9x
- 単一環境でも gym 比 ~2x の高速化（README）

## アーキテクチャ（仕組み）

arXiv/ar5iv より、同期 step 関数ではなくイベント駆動の非同期設計:
- 「Instead of providing a synchronous step function, in each interaction, EnvPool receives a batched action through the `send` function」、結果は `recv` で返す。コアは C++ + pybind11 でラップ。
- **3 つの C++ コンポーネント**:
  1. **ActionBufferQueue** — ロックフリー循環バッファ（サイズ 2N）、atomic カウンタ + セマフォで `send()` のアクションをキャッシュ
  2. **ThreadPool** — CPU コアにピン留めした固定ワーカースレッド（`std::thread`）。スレッド生成オーバーヘッドを回避。各スレッドが env + action を取り出し step して結果を push
  3. **StateBufferQueue** — 事前確保メモリブロックのロックフリー循環バッファ（各ブロックが `batch_size` 個の結果を保持）。ブロックが埋まると pybind11 経由で NumPy 配列として直接公開（追加コピーなし）
- **sync vs async モード**: sync は毎 step 全 N env を待つ。async は最初の M（`batch_size` < N）env が終わった時点で返し、残りスレッドは走り続けるため「最も遅い単一環境」にボトルネックされない。async は sync を一貫して上回る（DGX-A100 Atari で async ~891k vs sync ~428k FPS）
- OpenAI Gym と DeepMind dm_env の両 API をサポート

## 統合する RL ライブラリ（README で確認）

- **CleanRL**（Pong-v5 例、"Solving Pong in 5 mins"）、**rl_games**（Atari "2 mins Pong"/"15 mins Breakout", MuJoCo "5 mins Ant"）、**Tianshou**（CartPole/Pendulum/Atari/MuJoCo）、**Stable-Baselines3**（Pendulum-v1 例）、**DeepMind ACME**（HalfCheetah 例）
- 対応環境ファミリ（16+）: Atari, MuJoCo（gym + dm_control）, classic control, toy text, ViZDoom, DeepMind Control Suite, Box2D, Google Research Football, Procgen, Minigrid, MarlGrid, Highway, MetaWorld, MyoSuite, PGX, Jumanji, MuJoCo Playground

## 位置づけ

EnvPool は「環境実行エンジン」であり、モデル/トレーナを含まない点が PufferLib（環境 + トレーナ込み）と異なる。CleanRL や SB3 などの既存トレーナと組み合わせて使う「ドロップイン高速化部品」。PufferLib もこの EnvPool の非同期 pooling を Python で再実装して取り込んでいる（レポート 01 参照）。

## 検証フラグ

- **「~20x」の正確値**: README は 19.6x（MuJoCo）、論文本文（ar5iv）は 19.2x。両者とも MuJoCo の DGX-A100 256 コア値。差は小さくバージョン/丸めの差異と推定。Atari は 14.9x。
- **Star/リリース日**: 2026-06-26 に GitHub REST API でライブ取得。

## 出典 URL

- https://github.com/sail-sg/envpool
- https://arxiv.org/abs/2206.10558
- https://ar5iv.labs.arxiv.org/html/2206.10558
