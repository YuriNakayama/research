# RL 研究のための 9 つの物理エンジンのレビュー

## 基本情報

- **原題**: A Review of Nine Physics Engines for Reinforcement Learning Research
- **著者**: Michael Kaup, Cornelius Wolff, Hyerim Hwang, Julius Mayer, Elia Bruni
- **掲載**: arXiv:2407.08590 [cs.AI]（2024-07-11 投稿、2024-08-23 改訂）
- **対象 9 エンジン**: Brax, Chrono, Gazebo, MuJoCo, ODE, PhysX, PyBullet, Webots, Unity
- **URL**: https://arxiv.org/abs/2407.08590

## 課題・背景

RL 研究では物理シミュレータ（環境）の選択が成否を分けるが、エンジン間の体系的比較が乏しく、各フレームワークの能力理解も難しい。本レビューは 9 つのエンジンを **popularity（人気）・feature range（機能範囲）・quality（品質/忠実度）・usability（使いやすさ）・RL capabilities（RL 統合・並列化）** で評価し、研究者の選定を支援する。

> "It evaluates nine frameworks (Brax, Chrono, Gazebo, MuJoCo, ODE, PhysX, PyBullet, Webots, and Unity) based on their popularity, feature range, quality, usability, and RL capabilities."（Abstract）

## 主要な知見・推奨事項（選定向けに抽出）

### 評価軸（14 基準）
- 構造面: オープンソース可否、ドキュメント品質、コミュニティ資源、モデル/環境ライブラリ
- 技術能力: 剛体力学、多関節力学、センサー対応、URDF/MJCF 対応、可視化忠実度
- RL 固有: Gym ラッパーの有無、MARL 対応
- 性能: "The optimization (or possibility of optimization) for training of RL agents by allowing for efficient parallel computing."（並列計算による RL 学習最適化の可否）

### ヘッドライン結論
- **MuJoCo が支配的**: "MuJoCo is currently the dominant framework for RL research due to its good performance and flexibility, even though its documentation is sometimes lacking..."（性能・柔軟性で首位、ただしドキュメント難）
- **Unity は作りやすいが大規模不向き**: "While designing an environment is the easiest in Unity out of all frameworks, Unity is not optimized for parallel computing and large-scale training."

### GPU 加速・並列シミュレーション
- **Brax（GPU/TPU ネイティブ）**: "Brax brings both [simulation and RL algorithm] together on a single GPU or TPU chip in order to reduce latency."（sim と学習を 1 チップに載せ遅延削減）。ただし **MARL では弱い**: "after a threshold of only a low number of agents the simulation reaches a standstill."
- **PhysX / IsaacGym（GPU 活用）**: "IsaacGym's distinguishing feature is that it leverages GPU acceleration to increase simulation speed... By directly connecting the simulation backend with PyTorch Tensors, IsaacGym aims to avoid CPU bottlenecks."（シミュレーション backend を PyTorch Tensor に直結し CPU ボトルネックを回避）

### 各エンジンの一行評価
| エンジン | 評価 |
|---|---|
| **MuJoCo** | 最も人気・最高性能・usability は難 |
| **PyBullet** | "consistently rates worse in performance reviews"（性能評価で一貫して劣る） |
| **Unity** | 最も作りやすい設計 UI・スケーリング/忠実度に難 |
| **Gazebo** | "high-fidelity simulation robotics" 向け |
| **Webots** | "high stability and RTF even in complex scenarios"（複雑シーンでも安定・高 RTF） |
| **PhysX/IsaacGym** | "excels in terms of usability and provides a unified framework"（usability に優れ統一フレームワーク） |
| **Brax** | "fails to impress"（ドキュメント不足・MARL スケール不良で期待外れ） |
| **ODE** | "outdated both in terms of feature range and usability"（時代遅れ） |
| **Chrono** | "lacks important features such as URDF and MJCF support" |

### GPU 加速・大規模 RL への推奨
- 単一の万能解は示されない。"the most performant engine (MuJoCo) has poor usability and the most user-friendly engine (Unity) suffers from poor performance" というトレードオフを指摘。
- GPU スケールでは **PhysX/IsaacGym が「最も統一的な解」** として提示（"usability and provides a unified framework for scenario creation, simulation, and RL"）。
- "For significant progress in the field, a better combination of the best of the two worlds has to be achieved."（両世界の良いとこ取りが今後の課題）

## 選定・実装への含意

- **ハードウェア/フレームワーク選定に直結する物理エンジン地図**: GPU 高速化 RL では「環境がどのエンジンか」が転送ボトルネックを決める（09 ガイド §1.1）。本レビューは「どのエンジンが GPU on-device か」を整理する一次情報。
- **JAX 系を選ぶなら Brax**: Brax は GPU/TPU 上で sim+学習を統合（PureJaxRL/Anakin と相性良）。ただし MARL では破綻するので、JaxMARL 等の専用環境が必要（07 cluster の JAX エコシステムレポートと整合）。
- **PyTorch 系で GPU env なら IsaacGym/PhysX**: PyTorch Tensor 直結で CPU ボトルネック回避 → PyTorch ネイティブで end-to-end GPU を狙う本命。ロボティクス/sim-to-real は Isaac 一択級。
- **MuJoCo の二面性**: CPU の MuJoCo（gym 標準）は遅いが、MJX（MuJoCo XLA, JAX 版）にすれば GPU/TPU で大量並列化できる。本レビューが「MuJoCo 首位」と言うのは主に忠実度・柔軟性の話で、GPU スケールは MJX/Brax/Isaac への移行が前提。
- **Unity/Gazebo/Webots/PyBullet/ODE/Chrono は GPU 大規模 RL には非推奨**: 並列性・性能で劣る。実機連携・特定ドメイン（ロボット ROS 連携 = Gazebo）に限定。

## 主要な定量結果（原文ママ）

- 評価軸 14 基準。9 エンジン。
- 定量ベンチ（steps/s 表）は本レビューでは限定的で、主に定性比較。
- "MuJoCo is currently the dominant framework for RL research due to its good performance and flexibility."
- Brax: "single GPU or TPU chip" 上で統合。IsaacGym: "directly connecting the simulation backend with PyTorch Tensors."

## 限界・注意点

- **定性レビュー主体・統一ベンチ表は弱い**: 具体的 steps/s の横断表は提示されず、「人気・機能・usability」の定性評価が中心。速度の絶対比較は他の一次情報（EnvPool, MuJoCo Playground 論文）で補う必要。
- **2024 年時点・進化が速い**: Genesis / Newton（NVIDIA）/ MuJoCo Playground / MJX の最新動向は本レビュー後。GPU 加速エンジンは更新が速いので最新情報と併読を。
- **「9 エンジン」の選定にバイアス**: gymnax 等の純 JAX「物理なし」環境や、Isaac Lab（PhysX の上位フレームワーク）は別枠扱い。物理エンジン単体の比較であることに注意。

## 出典

- 論文: https://arxiv.org/abs/2407.08590
- HTML: https://arxiv.org/html/2407.08590
