# 08. RL 学習ライブラリ生態系（CleanRL / Stable-Baselines3 / RLlib）

「どの加速技術を、どのトレーナと組み合わせ、いつ使うか」を整理する。3 つは性質が大きく異なる。

## 1. CleanRL

| 項目 | 値 |
|---|---|
| **Repo** | https://github.com/vwxyzjn/cleanrl |
| **論文** | arXiv 2111.08819 → JMLR vol.23（2022）https://www.jmlr.org/papers/volume23/21-1342/21-1342.pdf |
| **Star** | ~10,000（forks ~1,100、2026-06-26） |
| **最新状態** | 最終正式リリース **v1.0.0（2022-11-14）**。repo は活発（843+ コミット、live docs/CI）だが新タグなし＝コミュニティ駆動/メンテナンス中心 |
| **一言** | PPO/DQN/C51/DDPG/TD3/SAC/PPG の高品質**単一ファイル**実装、研究フレンドリ |

- **単一ファイル設計**: 例えば `ppo_atari.py` は ~340 行に PPO+Atari の全実装を含む。可読性と高速プロトタイピング重視
- **EnvPool 統合（スループットの肝）**:
  - `ppo_atari_envpool.py` — EnvPool のベクトル化 Atari env で for-loop 版比「**3-4x side-effects-free speed-up**」（Linux のみ）。出典: https://docs.cleanrl.dev/rl-algorithms/ppo/
  - `ppo_atari_envpool_xla_jax.py` — EnvPool の実験的 **XLA インターフェース** + JAX/Flax/Optax。docs によれば PyTorch 版より XLA/JAX 版の方が速い（CleanRL 最速パス）
  - `ppo_atari_envpool_xla_jax_scan.py` — `jax.scan` でコンパイル時間短縮
- **スループット**: Atari PPO の end-to-end 学習が **~200 分（for-loop）→ ~73 分（EnvPool sync）**。基盤の EnvPool エンジン自体は 256 コアで ~1M Atari frames/s（本クラスタ 02）。出典: docs.cleanrl.dev, EnvPool 論文
- **使い所**: 研究・再現性・単一ファイルの可読性/改造容易性。アルゴリズム全体を 1 ファイルで読み/改変したい時、再現ベンチ（Open RL Benchmark https://benchmark.cleanrl.dev/）、アルゴリズム変種のプロトタイプ。プロダクションフレームワークではない

## 2. Stable-Baselines3（SB3）

| 項目 | 値 |
|---|---|
| **Repo** | https://github.com/DLR-RM/stable-baselines3 |
| **論文** | JMLR 2021, vol.22 no.268「Stable-Baselines3: Reliable Reinforcement Learning Implementations」 |
| **Star** | ~13.5k（forks ~2.2k、2026-06-26） |
| **最新状態** | **v2.9.0（2026-06-15）**（gymnasium 1.3.0 対応, torch ≥2.8）。活発に保守されるが README は「SB3 development is now focused on bug fixes and maintenance」と明記、機能開発は companion repo へ移行 |
| **一言** | 信頼性・テスト済みで一貫した使いやすい API を持つ PyTorch RL 実装 |

- **信頼性/プロダクション志向**: ピークスループットより、テスト済みで信頼できるベースラインと使いやすさを重視
- **エコシステム（companion）**:
  - **SBX (Stable-Baselines Jax)** = SB3 + JAX。https://github.com/araffin/sbx（~596 stars、v0.25.0 2026-06-15）。アルゴリズム: SAC/SAC-N/TQC/DroQ/PPO/DQN/TD3/DDPG/CrossQ/SimBa。SB3 docs は SBX を「can be much faster (**up to 20x**)」と記述（proof-of-concept）。出典: https://stable-baselines3.readthedocs.io/en/master/guide/sbx.html
  - **SB3-Contrib**: 実験的アルゴ（Recurrent PPO, CrossQ, TQC, Maskable PPO）
  - **RL Baselines3 Zoo**: 学習フレームワーク + チューニング済ハイパラ/ベンチ
- **スループット**: デフォルトは Python + Gym(nasium) ベクトル env（SubprocVecEnv）で **CleanRL-JAX/RLlib より概して低い**。EnvPool との組合せや SBX/JAX への移行で改善可
- **使い所**: 信頼できるベースライン、使いやすさ、教育、正確性/安定性とクリーンな API が速度より重要な応用案件。高速化が要れば SBX（JAX）を使う

## 3. RLlib（Ray）

| 項目 | 値 |
|---|---|
| **Repo** | https://github.com/ray-project/ray（RLlib は Ray 内のライブラリ） |
| **Docs** | https://docs.ray.io/en/latest/rllib/ |
| **Star（Ray 全体）** | ~43,000（forks ~7,700、2026-06-26）※RLlib 単体ではなく Ray 全体 |
| **最新状態** | Ray 2.55.1（2026-04-22）、非常に活発（30,000+ コミット） |
| **一言** | Ray 上の産業グレードでスケーラブル/分散な RL（分散・耐障害・マルチ GPU・マルチエージェント） |

- **分散/スケーリング**: Ray 分散ランタイム上で **クラスタ横断（マルチノード・マルチ GPU）** に RL ワークロードをスケール、耐障害性あり。プロダクション級の高度分散 RL が対象。出典: https://docs.ray.io/en/latest/rllib/index.html
- **「新 API スタック」**: 近年の Ray でコア API を全面再設計。ユーザーが知るべきクラスを旧 ~8 → 新 ~5 に削減（機能損失なし）。新クラス: **RLModule**（複雑なマルチネット/マルチエージェント対応のカスタムモデル）。移行ガイド: https://docs.ray.io/en/latest/rllib/new-api-stack-migration-guide.html
- **使い所**: マルチノード/クラスタ規模の RL、プロダクション分散 RL、大規模/マルチエージェント、より広い Ray ML スタックへの統合。単一マシン研究には過剰（CleanRL/SB3 で十分）

## 使い分けマトリクス

| 観点 | CleanRL | SB3 | RLlib |
|------|---------|-----|-------|
| 主目的 | 研究・再現性・可読性 | 信頼できるベースライン・使いやすさ | 分散・スケール・プロダクション |
| コード構造 | 単一ファイル | モジュラー API | フレームワーク（Ray 統合） |
| 既定スループット | 中（EnvPool/JAX 版で高） | 低〜中（SBX で高） | 高（分散時） |
| スケール | 単一マシン | 単一マシン | マルチノード・クラスタ |
| 高速化との組合せ | EnvPool, LeanRL（最適化 fork） | EnvPool, SBX(JAX) | Ray ネイティブ分散 |

## 位置づけ（本クラスタ内での関係）

- これら 3 つは**トレーナ**であり、本クラスタの環境高速化部品（EnvPool=02, PufferLib Ocean=01）や物理 GPU 化（Isaac=04, Madrona=05）と組み合わせて使う「受け皿」。
- CleanRL ⇄ LeanRL（07）= 最適化版、CleanRL + EnvPool（02）= 高速 Atari、SB3 ⇄ SBX = JAX 高速版、RLlib = 分散という関係。
- GPUDrive（05）の下流トレーナとして SB3/PufferLib が、Isaac（04）では rl_games/RSL-RL が、EnvPool（02）では CleanRL/rl_games/Tianshou/SB3/ACME が使われる。

## 検証フラグ

- **SBX「up to 20x」**・**CleanRL EnvPool「3-4x」**: 公式 docs 由来の標準引用値（SBX repo 自体には明示数値なし）。
- **CleanRL の per-game SPS**: docs は学習曲線/wall-clock プロット中心で、単一の見出し SPS 数値はテキスト化されていない（定性的）。
- **Star 数**: GitHub 表示の丸め値（2026-06-26）。Ray の 43k は Ray 全体で RLlib 単体ではない。

## 出典 URL

- https://github.com/vwxyzjn/cleanrl · https://www.jmlr.org/papers/volume23/21-1342/21-1342.pdf · https://docs.cleanrl.dev/rl-algorithms/ppo/
- https://github.com/DLR-RM/stable-baselines3 · https://stable-baselines3.readthedocs.io/en/master/guide/sbx.html · https://github.com/araffin/sbx
- https://github.com/ray-project/ray · https://docs.ray.io/en/latest/rllib/ · https://docs.ray.io/en/latest/rllib/new-api-stack-migration-guide.html
