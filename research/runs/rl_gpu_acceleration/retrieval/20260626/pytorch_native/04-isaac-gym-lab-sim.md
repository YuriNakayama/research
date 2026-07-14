# 04. NVIDIA Isaac Gym / Isaac Lab / Isaac Sim / Newton

## 概要カード

- **一言で言うと**: GPU 常駐物理シミュレーション（観測・行動・報酬を GPU 上で完結）により、単一 GPU で数千の並列環境を回しロボット学習を分単位で行う NVIDIA 製シミュレーション基盤
- **現行（2026）の主役**: **Isaac Lab**（Isaac Gym の後継）。Isaac Gym Preview は**非推奨/レガシー**。Isaac Sim は基盤シミュレータ

## 2026 年時点のステータス

| コンポーネント | 状態 | 備考 |
|---|---|---|
| **Isaac Gym (Preview)** | **非推奨/レガシー** | スタンドアロン preview SDK。DL 可だが公式サポート終了 |
| **IsaacGymEnvs** | 非推奨 | Isaac Gym Preview 上の RL 環境ライブラリ。Isaac Lab に統合 |
| **OmniIsaacGymEnvs / Orbit** | 非推奨→ Isaac Lab に統合 | Orbit が Isaac Lab に改名 |
| **Isaac Lab** | **活発に保守される後継** | Isaac Sim 上の統合ロボット学習フレームワーク |
| **Isaac Sim** | 基盤シミュレータ | Omniverse ベース、物理 + フォトリアル描画 |

出典: https://isaac-sim.github.io/IsaacLab/main/source/setup/ecosystem.html（Isaac Lab が「IsaacGymEnvs, OmniIsaacGymEnvs and Orbit frameworks を置換」と明記）/ 非推奨告知 https://forums.developer.nvidia.com/t/isaac-gym-deprecation-transition-to-isaac-lab/322978

## Isaac Lab — リポジトリ事実

- **GitHub**: https://github.com/isaac-sim/IsaacLab
- **一言**: "Unified framework for robot learning built on NVIDIA Isaac Sim"
- **Star**: ~7.5k（2026-06-26 確認）。forks 3.7k、contributors 229
- **最新版**: **v3.0.0-beta2（2026-06-17）**（Isaac Lab 3.0 はベータ）
- **論文**: "Isaac Lab: A GPU-Accelerated Simulation Framework for Multi-Modal Robot Learning" — arXiv **2511.04831**（2025-11-06, lead author Mayank Mittal, NVIDIA）。abstract は Isaac Lab を「the successor to Isaac Gym」と明記し、将来の Newton 物理エンジン統合に言及。https://arxiv.org/abs/2511.04831

## 物理エンジンの関係（Isaac Sim / Isaac Lab / Isaac Gym / PhysX / Newton）

- Isaac Gym Preview は **NVIDIA PhysX** を GPU テンソルパイプラインで利用
- Isaac Lab は **Isaac Sim** 上で動作し、デフォルト物理は **PhysX 5**（GPU 加速）
- **Newton** = 新しい GPU 物理エンジン（代替/後継ソルバとして統合中）:
  - **2025-03-18（GTC 2025）発表**、**NVIDIA + Google DeepMind + Disney Research** 共同開発。https://developer.nvidia.com/blog/announcing-newton-an-open-source-physics-engine-for-robotics-simulation/
  - **NVIDIA Warp** + **OpenUSD** ベース、複数ソルバ対応、微分可能
  - **Beta 2025-09-29（CoRL 2025, Seoul）**、Isaac Lab 3.0 beta（develop ブランチ）で利用可。https://www.therobotreport.com/nvidia-launches-newton-physics-engine-gr00t-ai-corl-2025/
  - **Linux Foundation** がガバナンス（Disney Research / Google DeepMind / NVIDIA が貢献）。https://www.linuxfoundation.org/press/linux-foundation-announces-contribution-of-newton-by-disney-research-google-deepmind-and-nvidia-to-accelerate-open-robot-learning
  - GitHub org: https://github.com/newton-physics
  - 関連: **MuJoCo-Warp**（DeepMind + NVIDIA）が humanoid シミュレーションで **>70x**、in-hand manipulation で **100x** の加速を主張（NVIDIA/DeepMind の発表値、査読ベンチマークではない）

## GPU 常駐 / end-to-end-on-GPU アーキテクチャ

Isaac Gym 論文 abstract（検証済）:
- 「Both physics simulation and the neural network policy training reside on GPU and communicate by directly passing data from physics buffers to PyTorch tensors without ever going through any CPU bottlenecks ... 2-3 orders of magnitude improvements compared to conventional RL training that uses a CPU based simulator.」（物理シミュレーションとニューラルネット学習が共に GPU 上に常駐し、物理バッファから PyTorch テンソルへ直接データを渡し CPU ボトルネックを一切通らない。CPU シミュレータ利用の従来 RL 比 2–3 桁の改善）
- 出典: https://arxiv.org/abs/2108.10470（Makoviychuk et al.）

## Isaac Gym ベンチマーク数値（論文 ar5iv HTML で検証）

論文: "Isaac Gym: High Performance GPU-Based Physics Simulation For Robot Learning", arXiv 2108.10470。全数値の出典: https://ar5iv.labs.arxiv.org/html/2108.10470

| タスク | 並列環境数 | スループット | 学習時間 | GPU |
|---|---|---|---|---|
| **Ant** | 4096 | **540K env steps/s** | reward >3000 を ~20 秒、完全収束 **< 2 分** | A100 |
| **Humanoid**（21 DOF） | 4096 | **200K env steps/s** | reward 5000 を **< 4 分** | A100 |
| **ANYmal**（平地） | 4096 | — | **< 2 分** | A100 |
| **ANYmal**（不整地, sim-to-real） | 4096 | — | 学習 + 実機転送で **< 20 分** | RTX A6000 |
| **Shadow Hand**（標準） | — | — | 連続 20 成功を **< 35 分** | A100 |
| **Shadow Hand**（OpenAI, FF） | — | — | 20 成功超を **< 1 時間** | A100 |
| **Franka キューブ積み** | 16384 | — | **< 25 分** | A100 |
| **Ingenuity** | 4096 | — | reward 5000 を ~30 秒 | A100 |
| **TriFinger**（sim-to-real） | — | — | 実機で **55%** 平均成功 | A100 |

- **RL トレーナ**: PPO via **rl_games**（Denys88/rl_games）— 論文で確認。Isaac Lab では rl_games, **RSL-RL**, SKRL, Stable-Baselines3 に対応（locomotion/manipulation では RSL-RL と rl_games が最多）。https://isaac-sim.github.io/IsaacLab/main/source/overview/reinforcement-learning/rl_frameworks.html

## 位置づけ

ロボット学習（locomotion / manipulation / sim-to-real）に特化した GPU 常駐シミュレーションの事実上の標準。JAX 系の Brax/MJX（レポート群 `20260626_all/03`）と競合領域だが、Isaac は PyTorch トレーナ（rl_games/RSL-RL）+ PhysX という非 JAX スタックである点が本クラスタに属する理由。数千環境を単一 GPU 上で回し、Ant/Humanoid を分単位で学習できる。

## 検証フラグ

- **MuJoCo-Warp 70x/100x**: NVIDIA/DeepMind の発表のみ、独立査読ベンチマークではない。
- **ANYmal/Shadow Hand/Franka の per-task FPS**: 論文は env 数と wall-clock のみ記載で FPS は一部のみ（540K/200K は A100 固有）。
- **Isaac Lab star 7.5k**: GitHub 表示の丸め値。

## 出典 URL

- https://github.com/isaac-sim/IsaacLab
- https://arxiv.org/abs/2108.10470
- https://ar5iv.labs.arxiv.org/html/2108.10470
- https://arxiv.org/abs/2511.04831
- https://isaac-sim.github.io/IsaacLab/main/source/setup/ecosystem.html
- https://developer.nvidia.com/blog/announcing-newton-an-open-source-physics-engine-for-robotics-simulation/
- https://github.com/newton-physics
