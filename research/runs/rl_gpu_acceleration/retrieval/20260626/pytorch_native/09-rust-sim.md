# 09. Rust ベースのシミュレーション（+ PyO3 連携）

Rust ネイティブ環境を PyO3/maturin で Python にバインドし、PyTorch トレーナへ高速供給するパターン。**形式的な文献が少ない領域**のため、検証可能（repo/ブログ本文）と逸話的（個人ブログ/フォーラム主張）を厳密に区別する。

## 「Frog Parade」+「~110k steps/s」主張 — 重要な訂正

**「Frog Parade」という名のプロジェクト/環境/例は、どこにも確認できなかった**（entity-gym-rs にも、Clemens Winter のブログにも、一般 web/GitHub 検索にも存在しない）。entity-gym-rs の `examples/` にあるのは **`bevy_snake`**（蛇ゲーム）。**「Frog Parade」は名称の記憶違い/誤りの可能性が高い**ためフラグする。

**ただし背後の「~100k+ steps/s の Rust env」主張は実在し、よく出典が取れる**（「~110k」の数値の出所はほぼこれ）:
- **出典（検証可能）**: Clemens Winter のブログ "Entity-Based Reinforcement Learning"（2023-04-14）https://clemenswinter.com/2023/04/14/entity-based-reinforcement-learning/
- **正確な引用**: `entity-gym-rs` で Rust 実装した環境が「**training speeds of more than 100,000 frames per second on a single RTX 2080 Ti and consumer CPU**」に到達
- 理由: 「fully utilizing the level of throughput that can be sustained by enn-trainer requires environments with more efficiency than can be easily achieved in Python」→ ゆえに Rust
- 著者は entity-gym / enn-trainer の作者（元 OpenAI）。https://github.com/cswinter

→ 「~110k steps/s」は「**RTX 2080 Ti で 100,000 frames/s 超**」と述べるのが正確（**ブログ/著者主張、査読なし**）。「110k」という具体値と「Frog Parade」名は裏付けなし＝逸話的/誤りとして扱う。

## entity-gym-rs / enn-trainer エコシステム（実在する「Rust env + Python trainer」パターン）

| プロジェクト | URL | Star（2026-06-26） | 備考 |
|---|---|---|---|
| **entity-gym-rs** | https://github.com/entity-neural-network/entity-gym-rs | ~25 | Rust バインディング。Rust シミュレーションを EntityGym 学習環境として export。学習済 NN エージェントを pure Rust で実行も可。Bevy 統合あり、例 = `bevy_snake` |
| **entity-gym**（Python） | https://github.com/entity-neural-network/entity-gym | — | エンティティベース RL インターフェース（固定観測空間ではなく動的サイズのエンティティリスト） |
| **enn-trainer** | https://github.com/entity-neural-network/enn-trainer | — | EntityGym 環境向け PPO/行動クローン トレーナ。可変エンティティ数のため **Rust 製 3D ragged array** を使用 |
| **enn-zoo** | https://github.com/entity-neural-network/enn-zoo | — | Procgen/Griddly/MicroRTS/VizDoom/**CodeCraft** の EntityGym バインディング |

これが要求された「**Rust 環境 + PyO3 バインディング → PyTorch/Python トレーナで ~100k+ steps/s**」の正典パターン。CodeCraft（Winter の RTS ゲーム）が代表的 Rust 環境で、単一 GPU 上数時間で強いプレイに到達。出典: 上記ブログ + https://clemenswinter.com/2021/03/24/mastering-real-time-strategy-games-with-deep-reinforcement-learning-mere-mortal-edition/

## Lux AI Season 3（luxai-s3 / Lux-Design-S3）— Rust ではなく JAX

- **Repo**: https://github.com/Lux-AI-Challenge/Lux-Design-S3 — ~337 stars（forks ~71、2026-06-26）
- **文脈**: NeurIPS 2024 コンペ、Kaggle ホスト（https://www.kaggle.com/competitions/lux-ai-season-3）。Best-of-5、部分観測 + メタ学習テーマ。OpenReview: https://openreview.net/forum?id=7t8kWYbOcj
- **実装 — JAX で確定（Rust ではない）**: 環境は **JAX で GPU 並列化**（「a GPU parallelized game environment via JAX to enable fast training/evaluation on a single GPU」）。**Rust 実装は見当たらず**
- **スループット**: ベンチスクリプト（`src/tests/benchmark_env.py`、例 `-n 16384 -t 5` = 16,384 並列 env）は存在するが、**公開された見出し steps/s 数値は repo になし**

→ ユーザー指定の「Rust または JAX の高速再実装」のうち、**luxai-s3 は JAX ベース**である点を確認・フラグ。

## その他の注目 Rust RL クレート

| クレート/repo | URL | Star/状態 | スループット/備考 |
|---|---|---|---|
| **rlox** | https://github.com/wojciechkpl/rlox | ~6 stars、**v1.2.0（2026-06-21）**、活発（208 コミット） | 自称「**Rust-accelerated RL — 22 algorithms, 2-10x faster than SB3. The Polars of RL.**」。**PyO3**（"Polars パターン": Rust が env stepping/buffer/GAE、Python が学習 + PyTorch）。**repo の検証可能ベンチ**: GAE 32K steps = 69µs（NumPy 比 135x）; replay buffer push（10K, obs_dim=4）= 3.2ms（SB3 比 4.6x）; E2E rollout（256×2048）= 669ms（SB3 比 3.1x）; **並列 env stepping = 512 env で 2.7M steps/s**。**フラグ: 小規模/若いプロジェクトの自己申告値、独立検証なし** |
| **burn-rl** | https://crates.io/crates/burn-rl ; 例 https://github.com/yunjhongwu/burn-rl-examples | 小規模/ニッチ | **Burn**（Rust テンソルライブラリ、NdArray/WGPU/CUDA/LibTorch で動作 https://github.com/tracel-ai/burn）上の RL 構成部品 |
| **rl4burn / r2l-burn** | https://crates.io/crates/rl4burn ; https://lib.rs/crates/r2l-burn | ニッチ | Burn 上の RL ライブラリ、バックエンド非依存（CPU/GPU/CUDA/LibTorch をコード変更なしで切替） |
| **gym-rs** | https://github.com/MathisWellmann/gym-rs（pure Rust）; https://github.com/MrRobb/gym-rs（バインディング） | ニッチ | 「OpenAI Gym in pure Rust」/ Gym の Rust バインディング。SPS 数値は未確認 |
| **bevy_rl** | https://github.com/stillonearth/bevy_rl | ニッチ | Bevy ゲームエンジン内で Gym 風 RL 環境を構築（pixel/state 観測） |

## 位置づけ

Rust 系は本クラスタの中で最も**形式的文献が薄い**領域。「Rust で env を書き PyO3 で Python に渡す」パターンは EnvPool（C++）や PufferLib Ocean（C）の Rust 版に相当する発想で、メモリ安全性と性能の両立が利点。ただし主役は依然 C/C++（EnvPool, Ocean）と GPU 物理（Isaac, Madrona）であり、Rust はニッチ・実験的段階。rlox の "Polars パターン"（Rust に env/buffer/GAE をオフロード、学習は PyTorch）が現状最も整理されたアプローチだが、いずれも小規模・自己申告ベンチで独立検証は乏しい。

## 検証フラグ（最重要）

- **「Frog Parade」= 未確認/名称誤りの可能性大**。実在 citable な主張は entity-gym-rs の「RTX 2080 Ti で 100,000 frames/s 超」（著者ブログ、査読なし）。「~110k」具体値は裏付けなし。
- **luxai-s3 は JAX ベース**（Rust ではない、確認済）。Rust 再実装なし、公開スループット数値なし。
- **rlox ベンチ**（512 env で 2.7M steps/s, SB3 比 2–10x）: ~6 star の極小プロジェクトの**自己申告**、独立検証なし。
- **entity-gym-rs star ~25, rlox ~6, Lux-Design-S3 ~337**: GitHub 直読（2026-06-26）。
- burn-rl / gym-rs / bevy_rl 等は具体的 SPS 数値が見当たらず。

## 出典 URL

- https://github.com/entity-neural-network/entity-gym-rs
- https://clemenswinter.com/2023/04/14/entity-based-reinforcement-learning/
- https://github.com/Lux-AI-Challenge/Lux-Design-S3
- https://openreview.net/forum?id=7t8kWYbOcj
- https://github.com/wojciechkpl/rlox
- https://github.com/tracel-ai/burn
