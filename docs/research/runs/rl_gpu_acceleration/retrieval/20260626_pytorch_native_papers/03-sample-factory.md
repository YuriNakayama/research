# Sample Factory: 100,000 FPS でのピクセルからの自己中心的 3D 制御（非同期 RL）

> 原題: *Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning*

## 基本情報

| 項目 | 内容 |
|------|------|
| 著者 | Aleksei Petrenko, Zhehui Huang, Tushar Kumar, Gaurav Sukhatme, Vladlen Koltun |
| arXiv | [2006.11751](https://arxiv.org/abs/2006.11751) |
| 査読発表 | ICML 2020 |
| 公式 | https://github.com/alex-petrenko/sample-factory |

## 課題・背景

大規模 RL 実験は通常「大規模分散システムと高価なハードウェア」に依存し、研究アクセスを制限する。abstract いわく「optimizing the efficiency and resource utilization of reinforcement learning algorithms instead of relying on distributed computation（分散計算に頼らず、RL アルゴリズムの効率と資源利用率を最適化する）」。Sample Factory は **単一マシン設定**に最適化された高スループット学習システムを目指す。

## 提案手法・コア機構

- **APPO（Asynchronous Proximal Policy Optimization）**: 「a highly efficient, asynchronous, GPU-based sampler with off-policy correction techniques（高効率な非同期 GPU ベースサンプラ + off-policy 補正）」。非同期化で生じる方策のズレを off-policy 補正で吸収しつつ sample efficiency を犠牲にしない。
- **3 種のワーカー分離アーキテクチャ**:
  - **Rollout workers**: 「solely responsible for environment simulation（環境シミュレーション専任）」
  - **Policy workers**: forward pass で「compute the action distributions（行動分布を計算）」
  - **Learner**: 「batches of trajectories and updates the parameters（軌跡バッチを処理しパラメータ更新）」
- **共有メモリ + FIFO キュー**: データは「shared memory tensors」「FIFO queues」を流れ、プロセス間コピーを最小化。
- **Double-Buffered Sampling（二重バッファサンプリング）**: rollout worker が環境グループ間で「alternate between」し、policy worker が行動生成する間も停止せず、「practically eliminates idle time on CPU workers（CPU ワーカーのアイドルをほぼ排除）」。

## 主要な定量結果（VERBATIM 引用 + 条件明記）

abstract: 「throughput higher than $10^5$ environment frames/second on non-trivial control problems in 3D without sacrificing sample efficiency（sample efficiency を犠牲にせず 3D の非自明な制御問題で 10^5 環境フレーム/秒超）」。

本文・表より（**System #2 = 36-core CPU + single RTX 2080 Ti**）:

| ベンチマーク | スループット（VERBATIM） | ハードウェア |
|--------------|--------------------------|--------------|
| VizDoom | "146551" env frames/second | System #2: 36-core CPU + RTX 2080 Ti |
| Atari Breakout | "135893" env frames/second | 同上 |
| DeepMind Lab | "42149" env frames/second | 同上 |

**ハードウェア定義（VERBATIM）**:
- System #1: "10-core CPU and a GTX 1080 Ti GPU"
- System #2: "36-core CPU and a single RTX 2080 Ti"

**純シミュレーション上限に対する効率（VERBATIM）**: Atari "74.8%"、VizDoom "45.4%"、DMLab "84.8%"。

## pytorch_native クラスタにおける位置づけ

**③トレーナ加速系統**（単一マシン非同期学習システム）。GPU 物理常駐（②）でも C++ 環境エンジン（①）でもなく、**CPU 上の多数の環境を非同期に回しながら GPU サンプラ/学習を遊ばせない**システム設計でスループットを稼ぐ。EnvPool（①）が「環境実行」を、Sample Factory が「学習システム全体のオーケストレーション」を担うという相補関係。EnvPool 論文でも先行システムとして引用される。

## 限界・注意点

- 14.6万 FPS 等は **36 コア CPU + RTX 2080 Ti という潤沢な単一マシン**での値。コア数が少ない環境では rollout worker の供給が律速する。
- 非同期化は方策のラグ（off-policy 性）を生むため、補正技術に依存。アルゴリズムは APPO に強く結びつく。
- バージョン状況に注意: PyPI 最新は 2.1.1（2023-06-19）で、近年の更新活動は低め（docs は v2.1.3 を記載するが PyPI 公開物は未確認）。

## 出典

- arXiv abstract: https://arxiv.org/abs/2006.11751（ICML 2020）
- 本文（HTML）: https://ar5iv.labs.arxiv.org/abs/2006.11751
- リポジトリ: https://github.com/alex-petrenko/sample-factory
