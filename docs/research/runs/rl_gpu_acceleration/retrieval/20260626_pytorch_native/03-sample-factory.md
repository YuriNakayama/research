# 03. Sample Factory / APPO（Aleksei Petrenko）

## 概要カード

- **GitHub**: https://github.com/alex-petrenko/sample-factory
- **ドキュメント**: https://www.samplefactory.dev/
- **一言で言うと**: 単一マシンに最適化された高スループットの同期/非同期 RL システム（アルゴリズム: APPO = Asynchronous PPO）
- **Star（概算）**: ~1,000（GitHub 表示 "1k"、forks 150。2026-06-26 確認）
- **最新状態**: PyPI 最新は **2.1.1（2023-06-19）**。docs の release-notes は **v2.1.3（2024-06-20）** を最新と記載（v2.1.2/2.1.3 は PyPI 未公開の docs/ソースレベル）。**実質メンテナンス中心（低活動）**、2.0 系の rewrite 以降は「minor compatibility fixes」のみ。アーカイブはされていない。License: MIT
- **論文**: "Sample Factory: Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning" — https://arxiv.org/abs/2006.11751（Petrenko, Huang, Kumar, Sukhatme, Koltun。ICML 2020, PMLR v119）。公式 PDF: https://proceedings.mlr.press/v119/petrenko20a/petrenko20a.pdf。所属: Intel Labs + USC
- **主要ベンチマーク**: VizDoom 146,551 FPS / Atari 135,893 FPS（36 コア CPU + 単一 RTX 2080 Ti）。出典: arXiv 2006.11751

## APPO とは

APPO = **Asynchronous Proximal Policy Optimization**。論文 abstract（PDF p.1）より:
- 「Sample Factory, built around an Asynchronous Proximal Policy Optimization (APPO) algorithm, is a reinforcement learning architecture that allows us to aggressively parallelize the experience collection and achieve throughput as high as **130000 FPS** (environment frames per second) on a single multi-core compute node with only one GPU.」
- PPO 系の方策勾配法を非同期化し、3 つのワークロード（環境シミュレーション・モデル推論・誤差逆伝播）が互いに待たないようにする
- 非同期化で生じる off-policy 性に対し、**PPO clipping と V-trace（IMPALA 由来）off-policy 補正を併用**: 「a combination of PPO clipping and V-trace works well across tasks and yields stable training, therefore we decided to use both methods in all experiments.」（PDF p.5）

## スループットの主張と正確なハードウェア

論文の実験節（PDF p.5–7）:
- **2 つのベンチマーク機**: System #1 = 10 コア CPU + GTX 1080 Ti / **System #2 = 36 コア CPU + 単一 RTX 2080 Ti**
- **System #2 のピークスループット（Table 1, "SampleFactory APPO" 行, environment frames/s）**:

| タスク | FPS | 純シミュレーション上限に対する割合 |
|--------|-----|----------------------------------|
| Atari | 135,893 | 74.8%（上限 181,740） |
| VizDoom | 146,551 | 45.4%（上限 322,907） |
| DMLab | 42,149 | 84.8%（上限 49,679） |

- 見出し: abstract は「as high as 130000 FPS ... on a single multi-core compute node with only one GPU」。タイトルは「100000 FPS」に丸め
- **ベースライン比較（Table 1, System #2 ピーク FPS）**: DeepMind IMPALA（VizDoom 10,708）, RLlib IMPALA（12,391）, SeedRL V-trace（34,428）, rlpyt PPO（73,544）を大きく上回る。VizDoom で最速ベースライン比 ~4x の wall-clock 学習速度（PDF p.6, Fig.4）

出典: https://proceedings.mlr.press/v119/petrenko20a/petrenko20a.pdf

## 共有メモリアーキテクチャ（シリアライズ回避）

3 種の非同期コンポーネント: **rollout workers**（環境シミュレーション）, **inference/policy workers**（GPU 上の行動生成）, **learner**（GPU 上の SGD）。
- 観測/軌跡をプロセス境界でシリアライズして送る代わりに、**PyTorch 共有メモリバッファ**経由でデータを渡す: 「Instead of explicitly sending the data between components ... we choose to send the data through shared memory buffers.」
- データ受け渡し時は「it writes the data to a shared memory buffer and sends a signal containing the buffer ID (essentially a pointer to data)」— プロセス間を流れるのは小さなバッファ ID（ポインタ）のみで、ペイロード本体は流れない。これが IMPALA/GA3C 型アーキの失敗モード（シリアライズ/転送ボトルネック）を解消
- ポリシー遅延対策: パラメータが共有メモリにあるため policy-worker の重み更新は「**less than 1 ms**」（PDF p.5）で、収集経験は最小限の off-policy に留まる

出典: https://www.samplefactory.dev/06-architecture/overview/ + 論文 Section 3

## ダブルバッファサンプリング

https://www.samplefactory.dev/07-advanced-topics/double-buffered/ + 論文 Section 3.4:
- 問題: CPU バウンド環境では、rollout worker が GPU 推論の戻りを待つ間アイドルになる
- 解決: 各 rollout worker が **2×N 環境を 2 グループに分割**。グループ 1 が推論待ちの間、CPU はグループ 2 のシミュレーションを進め、推論とシミュレーションをオーバーラップしてアイドルギャップを除去: 「While we're waiting for the inference to finish on the first N environments, we can already collect observations from the next N environments.」
- `--worker_num_splits=2`（デフォルト 2）で有効化。sync/async・batched/non-batched いずれでも動作

## Sample Factory 2.0 vs 1.0

release notes（https://www.samplefactory.dev/11-release-notes/release-notes/）, v2.0.0（2022-12-01）:
- 保守性・明瞭性のため**コードベースをスクラッチから書き直し**、大規模 API 更新
- 2.x 新機能: **同期/非同期**両モード、**serial/parallel** 実行モード（1.x は非同期/並列中心）、**ベクトル化 GPU 環境**（IsaacGym, Brax 等）対応、Hugging Face Hub 統合、`gymnasium` 移行（v2.1.0）、Torch 2 互換、適応的学習率（v2.0.3）
- リポジトリ tagline も「High throughput **synchronous and asynchronous** reinforcement learning」と範囲拡大を反映

## 位置づけ

「CPU シミュレーション + 単一 GPU learner」を単一マシンで最大効率化する古典的かつ影響力の大きいシステム。EnvPool の比較表にも "Sample-Factory" 列として登場する（レポート 02）。GPU 常駐物理（Isaac/Madrona/WarpDrive）とは異なり、CPU 上の既存環境（VizDoom/Atari/DMLab）を高速に回す系統の代表。Sample Factory 2.0 以降は Isaac Gym/Brax のベクトル化 GPU 環境にも対応した。

## 検証フラグ

- **正確な Star 数**: GitHub は丸め「1k」表示。検索キャッシュで 997。~1,000 として扱う。
- **「最新バージョン」不一致**: PyPI 最新は 2.1.1（2023-06-19, JSON API で確認）だが、docs release-notes は v2.1.2/v2.1.3（2024-06-20）を記載。後者の PyPI 公開物は未確認。最新インストール可能版は 2.1.1。

## 出典 URL

- https://github.com/alex-petrenko/sample-factory
- https://www.samplefactory.dev/
- https://arxiv.org/abs/2006.11751
- https://proceedings.mlr.press/v119/petrenko20a/petrenko20a.pdf
