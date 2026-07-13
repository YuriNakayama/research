# pytorch_native クラスタ — 一次論文 per-paper 詳細レポート

## パラメータ

- **ドメイン**: `rl_gpu_acceleration`
- **対象クラスタ**: `pytorch_native`（PyTorch / ネイティブコード系。pure-JAX を除く）
- **生成日**: 2026-06-26
- **run 種別**: retrieval（deep-dive）/ 一次論文 8 本の per-paper 精読
- **リソース種別**: 査読論文（arXiv / OpenReview）
- **手法**: 各論文 URL（検証済み一次ソース）を WebFetch し、abstract と本文（ar5iv HTML）から **定量値を VERBATIM 引用**。ハードウェアとベースライン条件を必ず併記。検証できない/出典区分が異なる主張は明示的にフラグ。

## このランの位置づけ

本 run は、同クラスタの**概念サーベイ** `retrieval/20260626_pytorch_native/`（PufferLib / EnvPool / Isaac Lab・Newton・Sim / Madrona・GPUDrive / WarpDrive / TorchRL・LeanRL / CleanRL・SB3・RLlib / Rust sim の 9 本立て横断レポート）を**補完する一次論文版**である。概念サーベイがエコシステム全体の地図と GitHub/リリース状況を俯瞰するのに対し、本 run は **検証済みの primary source 8 本それぞれを 1 ファイルで精読**し、abstract/本文の数値を VERBATIM で固定する。

## レポート一覧

| # | レポート | 論文 | 系統 | 一言で |
|---|----------|------|------|--------|
| 01 | [PufferLib](01-pufferlib.md) | Suarez, RLC/RLJ 2025（arXiv 2406.12905） | ①env 高速化（+③） | C 製環境 + 高速ベクトル化で PyTorch トレーナに供給 |
| 02 | [EnvPool](02-envpool.md) | Weng et al., NeurIPS 2022（arXiv 2206.10558） | ①env 高速化 | C++ 非同期バッチ環境実行エンジン（モデル非依存） |
| 03 | [Sample Factory](03-sample-factory.md) | Petrenko et al., ICML 2020（arXiv 2006.11751） | ③トレーナ加速 | 単一マシン非同期 RL（APPO）+ 共有メモリ |
| 04 | [Isaac Gym](04-isaac-gym.md) | Makoviychuk et al., NVIDIA（arXiv 2108.10470） | ②物理 GPU 常駐 | GPU 常駐 PhysX + PyTorch テンソル直結 |
| 05 | [Madrona](05-madrona.md) | Shacklett et al., SIGGRAPH/TOG 2023（OpenReview fqk7mDvrTS） | ②物理 GPU 常駐 | GPU 上 ECS の汎用バッチシミュレーションエンジン |
| 06 | [GPUDrive](06-gpudrive.md) | Kazemkhani et al., ICLR 2025（arXiv 2408.01584） | ②物理 GPU 常駐 | Madrona 上の 100万 FPS マルチエージェント運転シム |
| 07 | [WarpDrive](07-warpdrive.md) | Lan et al., JMLR v23（arXiv 2108.13976） | ②物理 GPU 常駐（+③） | 単一 GPU 上の end-to-end MARL（PyCUDA+PyTorch） |
| 08 | [TorchRL](08-torchrl.md) | Bou et al., Meta（arXiv 2306.00577） | ③トレーナ加速 | TensorDict による PyTorch ネイティブ RL ライブラリ |

## 3 系統の整理

本クラスタの手法は、RL の主ボトルネック（環境シミュレーション速度・CPU カーネル起動オーバーヘッド）を 3 つの角度から攻める:

1. **①env 高速化** — C/C++/Rust ネイティブ環境を CPU 上で高速実行し PyTorch トレーナに供給。CPU↔GPU 転送は残るが環境ステップ自体を桁違いに速くする。→ **EnvPool, PufferLib**
2. **②物理 GPU 常駐化** — 観測・行動・報酬・物理ステップをすべて GPU 上で完結させ CPU 転送を排除。環境を GPU 上で書き直す必要がある。→ **Isaac Gym, Madrona, GPUDrive, WarpDrive**
3. **③トレーナ加速** — 学習システム/トレーナ側の起動オーバーヘッドを削減（非同期化・共有メモリ・torch.compile・CUDA graphs）。→ **Sample Factory, TorchRL**（PufferLib/WarpDrive は①②に③を兼ねる）

## FPS / スループット比較表（headline 値・ハードウェア + ベースライン条件付き）

すべて各論文の VERBATIM 値。**ハードウェアとベースラインの条件が異なると値は比較不能**である点に注意（環境の重さ・並列数・GPU 機種が桁違いに違う）。

| 論文 | 系統 | headline スループット（VERBATIM） | ハードウェア | ベースライン / 条件 |
|------|------|------------------------------------|--------------|---------------------|
| EnvPool | ① | Atari "one million frames per second" / MuJoCo "three million frames per second" | **DGX-A100（256 CPU コア）** | gym.vector_env 比 Atari 14.9x・MuJoCo ~19.x（倍率は README/本文、abstract 外） |
| EnvPool（ラップトップ） | ① | "2.8x that of the Python subprocess" | ノート PC（12 コア級） | Python subprocess 比 |
| PufferLib（論文値） | ①+③ | 単一コア Cartpole "270k" / Ocean Squared "240k" SPS、Pokemon Red 学習 "7000 steps per second" | 単一 CPU コア / 単一デスクトップ（GPU 機種非明記） | Table 1/2（査読論文 arXiv v1） |
| PufferLib（project docs, 査読外） | ①+③ | v3 "3–5M steps/s" / v4 CUDA backend "最大 20M steps/s" | RTX 4090 等 | **puffer.ai/docs（査読なし）。arXiv 論文本文には記載なし** |
| Sample Factory | ③ | VizDoom "146551" / Atari "135893" / DMLab "42149" env frames/second | **36-core CPU + RTX 2080 Ti（System #2）** | 純シム上限比 Atari 74.8% / VizDoom 45.4% / DMLab 84.8% |
| Isaac Gym | ② | Ant "540K" / Humanoid "200K" / Shadow Hand "150K" env steps per second | **single A100**（ANYmal は RTX A6000） | CPU シミュレータ比 "2-3 orders of magnitude"。4096〜16384 並列 |
| Madrona | ② | Hide & Seek "over 1.9 million environment steps per second" | **single GPU（機種 abstract 非記載）** | OSS CPU 比 "two to three orders of magnitude" / 32-thread CPU 比 "5-33×" |
| GPUDrive | ② | "over a million simulation steps per second" / "1 million FPS" | GPU（機種 abstract 非記載。本文 2.3M ASPS は RTX 4080/A100） | Madrona engine 上、Waymo Open Motion Dataset |
| WarpDrive | ②+③ | "2.9 million environment steps/second"（2000 環境 × 1000 エージェント） | GPU（2.9M 値の機種 abstract 非記載） | CPU 実装比 "at least 100x"。Tag シミュレーション |
| TorchRL | ③ | abstract に具体 FPS なし（"comparative benchmarks"） | — | 参考: LeanRL（TensorDict+compile+CUDA graphs）= CleanRL 比 PPO 6.8x/SAC 5.7x/TD3 3.4x（H100、論文外） |

## 検証フラグ（要点）

- **PufferLib「20M steps/s」/「CUDA backend」**: **arXiv 論文（v1）本文・abstract には一切登場しない**ことを WebFetch で確認。出典は puffer.ai/docs（査読外プロジェクトドキュメント）。査読論文が定量保証するのは単一コア 240k–270k SPS と Pokemon Red 7000 steps/s まで。本 run では両者を厳密に区別した（レポート 01 参照）。
- **PufferLib の Ocean**: 論文本文では主に sanity-check / validation 環境として言及。定量的な学習ベンチマークとしては前面化されていない。
- **EnvPool「~20x」**: abstract には倍率記載なし。MuJoCo で ~19.x（README 19.6x ≒ 20x / 本文 19.2x）、Atari 14.9x。いずれも DGX-A100 256 コア条件。1M/3M FPS という絶対値が abstract VERBATIM。
- **Madrona / GPUDrive / WarpDrive の GPU 機種**: それぞれの headline 値（1.9M / 1M / 2.9M steps/s）の GPU 機種が **abstract に明記されていない**。プロジェクトページ等のより高い値（Madrona 20M/40M, GPUDrive 2.3M）は abstract VERBATIM ではない。
- **Sample Factory のバージョン**: PyPI 最新 2.1.1（2023-06-19）で活動は低め（docs は v2.1.3 を記載）。論文値（14.6万 FPS 等）は System #2 = 36-core CPU + RTX 2080 Ti。
- **WarpDrive**: リポジトリは 2025-05-01 アーカイブ済（メンテ停止）。
- **TorchRL**: abstract に具体スループット数値がない（"comparative benchmarks" の定性記述のみ）。関連定量は LeanRL（論文外）を参照。
- **横断的留意**: スループット値は環境の重さ・並列数・GPU 機種が桁違いに異なるため、表の数値を直接横並び比較してはならない。

## 関連 run

- 概念サーベイ（本 run の母体）: `runs/rl_gpu_acceleration/retrieval/20260626_pytorch_native/`
- JAX エコシステム編: `runs/rl_gpu_acceleration/retrieval/20260626_all/`（PureJaxRL / Brax / MJX / gymnax / JaxMARL / Podracer ほか）
- 高速化の技術原理編: `runs/rl_gpu_acceleration/retrieval/20260626_principles*/`
