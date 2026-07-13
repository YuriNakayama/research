# TorchRL: PyTorch のためのデータ駆動な意思決定ライブラリ

> 原題: *TorchRL: A data-driven decision-making library for PyTorch*

## 基本情報

| 項目 | 内容 |
|------|------|
| 著者 | Albert Bou, Matteo Bettini, Sebastian Dittert, Vikash Kumar, Shagun Sodhani, Xiaomeng Yang, Gianni De Fabritiis, Vincent Moens |
| 所属 | Meta（PyTorch チーム）ほか |
| arXiv | [2306.00577](https://arxiv.org/abs/2306.00577)（2023-06-01 投稿 / 2023-11-27 改訂） |
| 公式 | https://github.com/pytorch/rl（TensorDict: https://github.com/pytorch/tensordict） |

## 課題・背景

abstract いわく、PyTorch は ML フレームワークの最有力でありながら「lacks a native and comprehensive library for decision and control tasks suitable for large development teams dealing with complex real-world data and environments（複雑な実データ・環境を扱う大規模開発チーム向けの、意思決定・制御タスクのためのネイティブで包括的なライブラリを欠いている）」。TorchRL はこの空白を埋める汎用制御ライブラリ。

## 提案手法・コア機構

- **TensorDict（新規 PyTorch プリミティブ）**: abstract いわく「a new and flexible PyTorch primitive, the TensorDict, which facilitates streamlined algorithm development across the many branches of Reinforcement Learning (RL) and control（RL・制御の多様な分野でアルゴリズム開発を効率化する、新しく柔軟な PyTorch プリミティブ）」。バッチ化されたネスト `dict[str, Tensor]` をテンソルのように扱い、データキャリアとして RL のパイプライン（環境・リプレイバッファ・損失・収集器）を疎結合に繋ぐ。
- **well-integrated yet standalone components**: 「well-integrated, yet standalone components（よく統合されつつ単体でも使えるコンポーネント群）」。各building block（環境 API・collector・replay buffer・損失モジュール等）が独立利用可能。
- **PyTorch エコシステム連携**: torch.compile（演算融合）/ CUDA graphs（カーネル起動の CPU 介入排除）/ AMP（混合精度）などの PyTorch ネイティブ加速機構を活用する設計（本クラスタの「③トレーナ加速」の中核データ構造を提供）。LeanRL（CleanRL fork）も TensorDict ベースの最適化を実証。
- 「comparative benchmarks to demonstrate its computational efficiency（計算効率を示す比較ベンチマーク）」を実験的に提示。

## 主要な定量結果（VERBATIM 引用 + 条件明記）

- abstract には**具体的な FPS / steps-per-second の数値は記載されていない**（"comparative benchmarks to demonstrate its computational efficiency" と定性的に述べるのみ）。
- abstract VERBATIM: 「we experimentally demonstrate its reliability and flexibility and show comparative benchmarks to demonstrate its computational efficiency.」
- 具体スループットは本文ベンチマーク章に依存し、abstract レベルでは VERBATIM 引用できる数値がない。**関連する定量効果としては LeanRL（TensorDict + torch.compile + CUDA graphs）の値が参照可能**: PPO Atari で CleanRL 比 6.8x、SAC 5.7x、TD3 3.4x（いずれも H100。出典: github.com/meta-pytorch/LeanRL、TorchRL 論文 abstract の数値ではない）。

| 主張 | 数値 | 条件・出典区分 |
|------|------|----------------|
| TorchRL の計算効率 | （abstract に具体値なし。"comparative benchmarks" のみ） | abstract VERBATIM |
| 参考: LeanRL（TensorDict + compile + CUDA graphs） | PPO 6.8x / SAC 5.7x / TD3 3.4x（vs CleanRL） | H100。**TorchRL 論文外**の関連実証 |

## pytorch_native クラスタにおける位置づけ

**③トレーナ加速系統**の中核。TorchRL 自体は環境を高速化（①）も物理を GPU 常駐化（②）もしないが、**TensorDict というデータ構造**で RL パイプラインをモジュール化し、torch.compile / CUDA graphs / AMP といった PyTorch ネイティブ加速をトレーナ側に適用しやすくする。EnvPool（①）や Isaac Gym（②）が供給する高速な経験を受け取り、launch-bound な RL の CPU 起動オーバーヘッドを CUDA graphs で削減する役割。LeanRL はその効果（特に CUDA graphs の寄与が支配的であること）を定量的に示す。

## 限界・注意点

- abstract に集約的なスループット数値がなく、計算効率は本文ベンチマーク依存。
- TensorDict という新プリミティブの学習コストがあり、既存コードからの移行に手間がかかる。
- 加速効果（compile/CUDA graphs）はネットワーク規模やバッチ構成に依存。AMP（混合精度）は RL では matmul より CPU 起動が支配的なため恩恵が限定的になりやすい（ピクセルベース/大規模ネットワーク以外）。
- ライブラリ自体は活発（v0.13.2 / 2026-06-17、TensorDict v0.13.0 / 2026-06-04）だが、API は進化途上。

## 出典

- arXiv abstract: https://arxiv.org/abs/2306.00577
- リポジトリ: https://github.com/pytorch/rl / https://github.com/pytorch/tensordict
- 参考（LeanRL, TorchRL 論文外）: https://github.com/meta-pytorch/LeanRL
