# Cluster 02: JAX エコシステム — end-to-end GPU/TPU RL

## 概要

環境・ロールアウト・学習を **すべて JAX で書いてアクセラレータ上に閉じる**系統。`jit`/`vmap`/`pmap`/`lax.scan` で host 転送を排除し、単一 GPU でも 100–1000x、複数 run の同時ベクトル化で見かけ数千倍のスループットを出す。研究 SOTA・メタ RL の中心であり、env を JAX 化できる（or Brax/gymnax を使える）なら最上限。

## キーワード

`JAX`, `jit`, `vmap`, `pmap`, `lax.scan`, `XLA`, `PureJaxRL`, `Brax`, `MJX`, `gymnax`, `JaxMARL`, `Stoix`, `rejax`, `Mava`, `Jumanji`, `evosax`, `Craftax`, `XLand-MiniGrid`, `Kinetix`, `Podracer`, `Anakin`, `Sebulba`

## 主要ライブラリ（2026-06-26 時点）

| ライブラリ | 種別 | 一言で | 主要数値 |
|-----------|------|--------|---------|
| PureJaxRL | RL 実装集 | end-to-end JAX RL のリファレンス（PPO/DQN/DPO） | 単一 ~10x / sim ~1000x / 複数run ~4000x |
| Brax | 物理シミュレータ | JAX 製微分可能剛体物理 | TPU で 100–1000x（コスト/速度） |
| MJX | 物理シミュレータ | MuJoCo の JAX/XLA 再実装 | TPU v5 2.7M / A100 950K steps/s |
| gymnax | 環境 | 古典 RL 環境の JAX 化 | CartPole 100万遷移を A100 2000並列 0.05秒 |
| JaxMARL | マルチエージェント | JAX 製 MARL 環境+アルゴリズム | 単一 ~14x / 並列 ~12,500x (NeurIPS 2024) |
| Stoix / rejax / Mava | RL 実装集 | 単一/マルチエージェント、Anakin/Sebulba | — |
| Jumanji / Craftax / XLand-MiniGrid / Kinetix | 環境 | 組合せ最適化・オープンエンド・メタ RL | Craftax 169–257x |
| evosax | 進化戦略 | JAX 製 ES（CMA-ES, OpenES ほか 30+） | — |

## 概念基盤: Anakin vs Sebulba（Podracer）

- **Anakin**: env + 行動選択 + 学習を全てアクセラレータ上で（env が JAX 必須）。pmap でコア複製。grid-world で 8-core TPU 555M steps/s。
- **Sebulba**: env は CPU ホスト、推論/学習はアクセラレータ。JIT 化できない複雑な env 向け。Atari 200M frames を 8-core TPU 約 1 時間。

## 限界

env が JAX/jittable である必要（値依存分岐・可変長エピソードはパディング/マスク要）、学習曲線（vmap/jit/scan の習得）、`print` が効かないデバッグ、純粋関数制約（in-place 不可）。

## 出力

詳細レポート: `docs/research/runs/rl_gpu_acceleration/retrieval/20260626_all/`（index + 01–08：コアプリミティブ / PureJaxRL / Brax・MJX / gymnax / JaxMARL / その他ライブラリ / Podracer / 限界）
