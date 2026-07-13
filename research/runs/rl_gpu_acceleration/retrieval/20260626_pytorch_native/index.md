# PyTorch / ネイティブコード（非JAX）による RL の GPU アクセラレーション — 詳細レポート

## パラメータ

- **ドメイン**: `rl_gpu_acceleration`
- **対象クラスタ**: `pytorch_native`（PyTorch ベース + C/C++/Rust ネイティブコード系。**pure-JAX を除く**エコシステム横断サーベイ）
- **生成日**: 2026-06-26
- **リソース種別**: GitHub リポジトリ / arXiv 論文 / 公式ドキュメント / 技術ブログ
- **入力ソース**: ユーザー指定の調査スコープ（PyTorch / ネイティブコードによる RL アクセラレーション、JAX 専用は別 run `20260626_all` を参照）
- **手法**: WebSearch / WebFetch による複数ソース突き合わせ。定量主張はすべて出典 URL を明記。検証できなかった主張は明示的にフラグ。

> **関連 run**: 同一ドメインの JAX エコシステム編は `runs/rl_gpu_acceleration/retrieval/20260626_all/`（PureJaxRL / Brax / MJX / gymnax / JaxMARL / Podracer ほか）を参照。本 run はその「非JAX 側」を補完する。

## レポート一覧

| # | テーマ | レポート |
|---|--------|----------|
| 01 | PufferLib / PuffeRL / Ocean（Joseph Suarez, RLC 2025）— C 環境 + ベクトル化トレーナ | [詳細](01-pufferlib.md) |
| 02 | EnvPool（sail-sg / Sea AI Lab, NeurIPS 2022）— C++ 非同期ベクトル環境実行エンジン | [詳細](02-envpool.md) |
| 03 | Sample Factory / APPO（Aleksei Petrenko, ICML 2020）— 非同期 PPO・共有メモリ | [詳細](03-sample-factory.md) |
| 04 | NVIDIA Isaac Gym / Isaac Lab / Isaac Sim / Newton — GPU 常駐物理シミュレーション | [詳細](04-isaac-gym-lab-sim.md) |
| 05 | Madrona engine（Stanford, SIGGRAPH 2023）+ GPUDrive — GPU バッチシミュレーション ECS | [詳細](05-madrona.md) |
| 06 | WarpDrive（Salesforce, JMLR 2022）— 単一 GPU 上の end-to-end マルチエージェント RL | [詳細](06-warpdrive.md) |
| 07 | TorchRL / TensorDict / torch.compile / CUDA Graphs / AMP / LeanRL（Meta）— PyTorch ネイティブ加速 | [詳細](07-torchrl-compile-cudagraphs.md) |
| 08 | RL 学習ライブラリ生態系（CleanRL / Stable-Baselines3 / RLlib）— 位置づけと使い分け | [詳細](08-cleanrl-sb3-rllib.md) |
| 09 | Rust ベースのシミュレーション（entity-gym-rs / rlox / Lux AI S3 ほか）+ PyO3 連携 | [詳細](09-rust-sim.md) |

## サマリ：ライブラリ一覧表（2026-06-26 時点）

GitHub star 数は変動するため概算。最新リリース/状態と主要ベンチマークは各詳細レポートに出典 URL を記載。

| ライブラリ/技術 | 種別 | GitHub | Star（概算） | 最新リリース/状態 | 一言で言うと |
|-----------------|------|--------|-------------|------------------|-------------|
| PufferLib | RL ライブラリ（C 環境 + トレーナ） | PufferAI/PufferLib | ~6,056 | "4.0 Experiments"（2026-04-05）, RLC 2025 受賞 | C 製 Ocean 環境 + ベクトル化 PuffeRL トレーナ、CleanRL 互換 |
| EnvPool | 環境実行エンジン | sail-sg/envpool | ~1,470 | v1.2.5（2026-05-20）, 活発 | C++ 非同期バッチ環境実行エンジン（モデル非依存） |
| Sample Factory | RL システム | alex-petrenko/sample-factory | ~1,000 | PyPI 2.1.1（2023-06-19）/ docs v2.1.3（2024-06-20）, 低活動 | 単一マシン非同期 RL（APPO）+ 共有メモリ |
| Isaac Lab | ロボット学習フレームワーク | isaac-sim/IsaacLab | ~7.5k | v3.0.0-beta2（2026-06-17）, 活発 | Isaac Sim 上の統合ロボット学習基盤（Isaac Gym 後継） |
| Isaac Gym (Preview) | GPU 物理シミュレータ | （非推奨/レガシー） | — | 非推奨 | GPU 常駐物理 + RL（Isaac Lab へ移行） |
| Newton | GPU 物理エンジン | newton-physics | （org） | Beta（2025-09-29）, Linux Foundation | Warp/OpenUSD ベースの微分可能 GPU 物理エンジン |
| Madrona | バッチシミュレーション エンジン | shacklettbp/madrona | ~504 | リリースタグ無し（研究プロトタイプ） | GPU バッチ ECS シミュレーションエンジン |
| GPUDrive | 運転シミュレータ | Emerge-Lab/gpudrive | ~604 | v0.4.0（2025-02-20）, ICLR 2025 | Madrona 上の 100万 FPS マルチエージェント運転シム |
| WarpDrive | MARL フレームワーク | salesforce/warp-drive | ~503 | v2.7（2024-02-19）, **アーカイブ済(2025-05-01)** | 単一 GPU 上の end-to-end マルチエージェント RL |
| TorchRL | RL ライブラリ | pytorch/rl | ~3.5k | v0.13.2（2026-06-17）, 活発 | PyTorch ネイティブのモジュラー RL ライブラリ |
| TensorDict | テンソルコンテナ | pytorch/tensordict | ~1,000 | v0.13.0（2026-06-04）, 活発 | バッチ化ネスト dict[str, Tensor]（テンソルのように振る舞う） |
| LeanRL | 最適化済 CleanRL fork | meta-pytorch/LeanRL | ~694 | デモリポジトリ（2024-）, 軽量 | torch.compile + CUDA graphs で CleanRL を最大 6.8x 高速化 |
| CleanRL | RL 実装集 | vwxyzjn/cleanrl | ~10k | v1.0.0（2022-11-14）, コミュニティ駆動 | 単一ファイル RL 実装、再現性・可読性重視 |
| Stable-Baselines3 | RL 実装集 | DLR-RM/stable-baselines3 | ~13.5k | v2.9.0（2026-06-15）, メンテナンス中心 | 信頼性重視の PyTorch RL 実装、使いやすい API |
| RLlib | 分散 RL | ray-project/ray | ~43k（Ray 全体） | Ray 2.55.1（2026-04-22）, 活発 | Ray 上の分散・スケーラブル産業グレード RL |
| entity-gym-rs | Rust 環境バインディング | entity-neural-network/entity-gym-rs | ~25 | 小規模 | Rust シミュレーションを EntityGym 環境として export |
| rlox | Rust 加速 RL | wojciechkpl/rlox | ~6 | v1.2.0（2026-06-21）, 活発 | PyO3 で Rust に env/buffer/GAE をオフロード（"Polars of RL"） |

## 主要ベンチマーク数値（出典付き・要点）

| 主張 | 数値 | 条件・出典 |
|------|------|-----------|
| PufferLib シミュレーション | Ocean 12 環境が各 1M+ steps/s（一部 10M） | 単一 CPU コア。出典: RLJ 2025 Paper 151 |
| PufferLib 学習（RTX 4090） | 300k–1.2M steps/s（v3 で 3–5M、v4 CUDA backend で最大 20M） | MLP/CNN-LSTM 150k–1M params。出典: RLJ 2025 + puffer.ai/docs |
| PufferLib（Atari 学習） | 最大 30k steps/s（オリジナル CleanRL の 30x） | 出典: RLJ 2025 Paper 151 |
| EnvPool（Atari） | ~1M FPS / gym.vector_env 比 14.9x | DGX-A100, 256 CPU コア。出典: arXiv 2206.10558 + README |
| EnvPool（MuJoCo） | ~3M FPS / gym.vector_env 比 ~19.6x（≒20x） | DGX-A100, 256 CPU コア。出典: README（論文本文は 19.2x）|
| EnvPool（ノート PC） | Python subprocess 比 2.8x | 12 コア。出典: arXiv 2206.10558 |
| Sample Factory（VizDoom） | 146,551 FPS | 36 コア CPU + RTX 2080 Ti。出典: arXiv 2006.11751 |
| Sample Factory（Atari） | 135,893 FPS（純シム上限の 74.8%） | 36 コア CPU + RTX 2080 Ti。出典: arXiv 2006.11751 |
| Isaac Gym（Ant） | 540K env steps/s, 4096 並列, 収束 < 2分 | A100。出典: arXiv 2108.10470 |
| Isaac Gym（Humanoid） | 200K env steps/s, 4096 並列, reward 5000 < 4分 | A100。出典: arXiv 2108.10470 |
| Isaac Gym（ANYmal rough, sim-to-real） | 実機転送込みで < 20分 | 4096 並列, RTX A6000。出典: arXiv 2108.10470 |
| Madrona（Hide & Seek） | > 1.9M env steps/s, 32,000 並列環境 | 単一 GPU。出典: madrona-engine.github.io |
| Madrona（Hanabi / Overcooked） | 20M / 40M steps/s | GPU 機種非記載。出典: madrona-engine.github.io |
| GPUDrive | > 1M FPS（ピーク ~2.3M ASPS） | RTX 4080 / A100。出典: arXiv 2408.01584 |
| WarpDrive（2D-Tag） | 2.9M env steps/s, 2000 環境 × 1000 エージェント, CPU 比 ≥100x | GPU 機種非記載。出典: JMLR v23 / arXiv 2108.13976 |
| LeanRL（PPO Atari） | CleanRL 比 6.8x（CUDA graphs 込み） | H100。出典: github.com/meta-pytorch/LeanRL |
| LeanRL（SAC / TD3） | 5.7x / 3.4x | H100。出典: github.com/meta-pytorch/LeanRL |
| AMP（混合精度, 一般） | float32 比 1.5–5.5x（V100）+ 1.3–2.5x（A100） | RL 特化値ではない。出典: PyTorch 公式ブログ |
| CleanRL + EnvPool（Atari PPO） | 学習時間 ~200分 → ~73分 | EnvPool sync 利用時。出典: docs.cleanrl.dev |
| SBX（SB3 + JAX） | SB3 比「最大 20x」 | proof-of-concept。出典: SB3 docs |
| entity-gym-rs（Rust env） | > 100,000 frames/s | RTX 2080 Ti + コンシューマ CPU。ブログ著者主張（査読なし）。出典: clemenswinter.com |
| rlox（Rust 並列 env） | 512 env で 2.7M steps/s, SB3 比 2–10x | 自己申告、独立検証なし。出典: github.com/wojciechkpl/rlox |

## 横断的な技術的洞察

- **RL の主ボトルネックは「演算量」ではなく「環境シミュレーション速度」と「CPU カーネル起動オーバーヘッド」**。標準的な Python 環境（Atari クラスで数千 steps/s/コア）は最適化された GPU トレーナに追従できず、GPU 利用率が 5–20% に留まる（出典: RLJ 2025 PufferLib）。本クラスタの各手法はこのボトルネックを別の角度から攻める。
- **アプローチの 3 系統**:
  1. **環境を高速化**（C/C++/Rust ネイティブ環境）: PufferLib Ocean, EnvPool, entity-gym-rs。CPU 上で 1M+ steps/s を出し、PyTorch トレーナに供給。
  2. **物理を GPU 常駐化**（観測・行動・報酬まで GPU 上で完結）: Isaac Gym/Lab, Madrona, WarpDrive。CPU↔GPU 転送を排除。
  3. **トレーナ側の起動オーバーヘッドを削減**: torch.compile（演算融合）+ CUDA graphs（カーネル起動の CPU 介入排除）。LeanRL が示す通り、**CUDA graphs の寄与が支配的**（RL が launch-bound である証左）。
- **混合精度（AMP）は RL では効きにくい**: RL は matmul FLOPs より CPU 起動オーバーヘッドが支配的なため、大規模ネットワーク/ピクセルベース RL（CNN エンコーダ）以外では AMP の恩恵は限定的（**この RL 特化の言明は一次ベンチマークでは未検証の合成的推論**、レポート 07 でフラグ）。

## 検証フラグ（要約）

- **PufferLib v4「20M steps/s」CUDA backend**: 出典は puffer.ai/docs（プロジェクト自身のドキュメント、査読なし）。査読論文 RLJ 2025 は v3 の「3–5M steps/s」までを記載。
- **EnvPool「~20x」**: README は MuJoCo で 19.6x、論文本文は 19.2x（DGX-A100 256 コアの MuJoCo, gym.vector_env 比）。Atari は 14.9x。「~20x」は MuJoCo の値。
- **Sample Factory バージョン不一致**: PyPI 最新は 2.1.1（2023-06-19）、docs は v2.1.3（2024-06-20）を記載。後者の PyPI 公開物は未確認。
- **Madrona 40M/20M steps/s**: GPU 機種が出典ページに記載なし。
- **WarpDrive 2.9M steps/s**: 該当数値の GPU 機種が abstract に明記されず（別の ~10x 比較は A100）。アーカイブ済(2025-05-01)。
- **「Frog Parade」**: 該当する RL プロジェクト/環境は**確認できず（名称誤りの可能性大）**。実在する citable な主張は entity-gym-rs の「RTX 2080 Ti で 100,000 frames/s 超」（著者ブログ、査読なし）。
- **Lux AI Season 3 (luxai-s3)**: **Rust ではなく JAX ベース**であることを確認。Rust 再実装は見当たらず。公開スループット数値も未記載。
- **AMP の RL 特化言明**（「launch-bound だから効きにくいがピクセルベースでは効く」）: 一次 RL ベンチマークの直接引用ではなく合成的推論。
- **rlox / entity-gym-rs ベンチマーク**: 小規模プロジェクトの自己申告値で独立検証なし。
- **Star 数全般**: 変動するため概算（2026-06-26 時点、多くは GitHub 表示の丸め値）。
- 詳細な検証フラグは各レポート末尾に記載。
