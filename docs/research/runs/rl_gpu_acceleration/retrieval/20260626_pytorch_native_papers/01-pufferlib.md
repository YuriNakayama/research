# PufferLib: 強化学習ライブラリと環境を「仲良く」させる

> 原題: *PufferLib: Making Reinforcement Learning Libraries and Environments Play Nice*

## 基本情報

| 項目 | 内容 |
|------|------|
| 著者 | Joseph Suarez |
| arXiv | [2406.12905](https://arxiv.org/abs/2406.12905)（cs.LG, 2024-06-11 投稿） |
| 査読発表 | Reinforcement Learning Conference (RLC) 2025 / RLJ 2025（Paper 151）。受賞あり |
| ライセンス | MIT（コード・ベースライン・ドキュメント・サポート公開） |
| 公式 | http://pufferai.github.io（PufferAI/PufferLib） |

## 課題・背景

RL の実務では「環境」「モデル」「RL ライブラリ」が本来は協調動作するはずなのに、API 非互換やボトルネックで噛み合わない。論文 abstract の表現を借りれば「You have an environment, a model, and a reinforcement learning library that are designed to work together but don't.（環境・モデル・RL ライブラリがあり、協調すべきなのにしない）」。さらに標準的な Python 環境ベクトル化は遅く、最適化されたトレーナに環境供給が追いつかず GPU 利用率が低迷する。PufferLib はこの 2 点（互換性とベクトル化速度）を同時に解く。

## 提案手法・コア機構

- **ワンライン環境ラッパー**: abstract いわく「one-line environment wrappers that eliminate common compatibility problems（よくある互換性問題を排除するワンライン環境ラッパー）」。Gymnasium/PettingZoo 互換性の差異やネストした observation/action 空間を吸収し、CleanRL・SB3 など既存ライブラリでそのまま回せるようにする。
- **高速ベクトル化（Puffer Pool 等のベクトル化機構）**: abstract いわく「fast vectorization to accelerate training（学習を加速する高速ベクトル化）」。複数環境を効率的に束ねてトレーナに供給する。
- **対応スケール**: 「classic benchmarks like Atari and Procgen to complex simulators like NetHack and Neural MMO」まで。pip パッケージとプリビルドイメージで数十環境を即利用可能。
- **Ocean（C 製環境スイート）**: 論文本文では Ocean 系環境（例: "Ocean Squared"）が登場するが、主に sanity-check / validation 用途として言及される。**論文 v1 では Ocean を定量的な学習ベンチマークとしては前面に出していない点に注意**。

## 主要な定量結果（VERBATIM 引用 + 条件明記）

すべて単一 CPU コア計測（Table 1, single-core SPS）。GPU 機種は論文本文の該当箇所では非明記。

| 環境 | 単一コア steps/s（SPS） |
|------|------------------------|
| Cartpole | "270k" |
| Ocean Squared | "240k" |
| NetHack | "29k" / "39k"（2 エントリ） |
| MiniHack | "11k" |
| Procgen Bigfish | "25k" |
| Minigrid | "16k" |
| Neural MMO | "2400" |
| Pokemon Red | "700" |
| Atari Breakout | "1.2k" |
| Crafter | "320" |

**ベクトル化スループット（Table 2, Desktop / Laptop 形式）**:

- Atari Breakout: PufferLib "11.8k / 2k"、EnvPool 併用 "25.6k / 3k"
- Cartpole: PufferLib "460k / 110k"、pooling 併用 "3M / 200k"
- Crafter（Puffer Pool 併用）: "6x faster"（定性）

**実プロジェクトでの学習速度（VERBATIM）**:
> "Training runs at 7000 steps per second with Clean PuffeRL on a single desktop"（Pokemon Red プロジェクト, 単一デスクトップ）

## 査読論文値 vs プロジェクト・ドキュメント値（CRITICAL）

| 主張 | 出典区分 | 検証結果 |
|------|----------|----------|
| 単一コア 240k–270k SPS（Cartpole / Ocean Squared）、Pokemon Red 学習 7000 steps/s | **査読論文（arXiv v1 / RLJ 2025）** | 本文 Table 1/2・本文記述で確認 |
| 「v4 CUDA backend で最大 20M steps/s」「3–5M steps/s（v3）」 | **プロジェクト・ドキュメント（puffer.ai/docs、査読なし）** | **arXiv 論文（v1）本文には "20 million steps/s" も "CUDA backend" も一切登場しない**ことを WebFetch で確認 |

> 結論: **「20M steps/s」は論文の主張ではなくプロジェクト docs の主張**。本レポートでは両者を厳密に区別する。論文が定量的に保証するのは上表の単一コア/ベクトル化 SPS と Pokemon Red の 7000 steps/s まで。

## pytorch_native クラスタにおける位置づけ

主に **①env 高速化系統**（C 製環境 + 高速ベクトル化で Python トレーナに環境供給）。ただし PuffeRL/Clean PuffeRL という独自トレーナも持つため、**③トレーナ加速**の性格も併せ持つハイブリッド。物理 GPU 常駐（②）ではなく、CPU 環境を高速供給して PyTorch トレーナの GPU 利用率を引き上げる立ち位置。

## 限界・注意点

- 論文 abstract には集約的な「総合スループット」数値や GPU 機種・ハードウェア条件の網羅表が乏しく、定量主張は Table 1/2 の個別環境値に依存。GPU 機種（RTX 4090 等）は本文の該当箇所では非明記。
- 最も派手な「20M steps/s」は査読範囲外（project docs）。査読済みの数値と混同してはならない。
- Atari など重い環境では単一コア SPS は小さく（Breakout 1.2k）、ベクトル化/プーリングや EnvPool 併用が前提になる。

## 出典

- arXiv abstract: https://arxiv.org/abs/2406.12905
- 本文（HTML）: https://ar5iv.labs.arxiv.org/abs/2406.12905
- RLJ 2025 Paper 151（RLC 2025）
- プロジェクト docs（20M steps/s 等、査読外）: http://pufferai.github.io / puffer.ai/docs
