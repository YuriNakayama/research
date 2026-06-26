# 01. PufferLib / PuffeRL / Ocean（Joseph Suarez / PufferAI）

## 概要カード

- **GitHub**: https://github.com/PufferAI/PufferLib
- **プロジェクトサイト**: https://puffer.ai/ / ドキュメント https://puffer.ai/docs.html
- **一言で言うと**: C で書かれた高速環境スイート「Ocean」と、CleanRL 由来のベクトル化トレーナ「Clean PuffeRL」を組み合わせ、単一 GPU 上で RL を 100万 steps/s 級まで高速化する RL ライブラリ
- **Star（概算）**: ~6,056（GitHub API ライブ取得 2026-06-26、最終 push 2026-06-25 で活発）
- **最新状態**: 最新 GitHub Release はタグ `experiments`「4.0 Experiments」（2026-04-05 公開）。RLJ 2025 論文は v2.0 を記述するが、論文中の versioning note で v3.0、リポジトリには 3.0/4.0 ブランチが存在。系譜は 2.0（論文）→ 3.0 → 4.0（現行）。License: MIT。リポジトリ構成は C/CUDA が大半（~80% C, ~7.5% CUDA, ~9% Python）
- **論文**: 
  - v1.0: "PufferLib: Making Reinforcement Learning Libraries and Environments Play Nice" — https://arxiv.org/abs/2406.12905（2024-06-11, 単著 Joseph Suarez）。**注意: この arXiv 版にはスループット数値は含まれない**
  - v2.0（RLC/RLJ 2025, Outstanding Paper）: "PufferLib 2.0: Reinforcement Learning at 1M steps/s" — https://rlj.cs.umass.edu/2025/papers/Paper151.html / PDF https://rlj.cs.umass.edu/2025/papers/RLJ_RLC_2025_151.pdf
- **主要ベンチマーク**: Ocean 12 環境が各 1M+ steps/s（単一 CPU コア）/ PPO 学習が単一 RTX 4090 で 300k–1.2M steps/s。出典: RLJ 2025 Paper 151

## Ocean 環境とは（C 実装環境）

RLJ 2025 PDF より:
- 「Puffer Ocean, a suite of 12 environments written in C that each simulate at >1M steps/second on a single CPU core.」（C で書かれた 12 環境スイート、各々が単一 CPU コアで 1M steps/s 超）
- 「There are currently 12 environments that run 1M+ steps/second on a single CPU core. They range from as simple as Pong to as complex as Neural MMO 3.」（Pong のような単純なものから Neural MMO 3 のような複雑なものまで）
- **動機**: 「The vast majority of reinforcement learning environments are 10-100x too slow to keep up with an optimized GPU trainer ... PufferLib ships 20,000 lines worth of C environments. These are far easier to develop than high-performance GPU environments」（大多数の RL 環境は最適化済 GPU トレーナに対し 10–100x 遅すぎる。C 環境は高性能 GPU 環境より開発が遥かに容易で、約半分は OSS コントリビュータが執筆）
- versioning note: 「Ocean has grown to over 25 environments」（25 環境以上に拡大）。docs では「20+ environments」とも

→ JAX 系（Brax/MJX/gymnax）が「GPU 上で環境を書く」のに対し、PufferLib は「**CPU 上で C 環境を書く**」アプローチ。C は高性能 GPU カーネルより遥かに書きやすく、コミュニティ貢献も得やすいという設計思想。出典: RLJ 2025 PDF + https://puffer.ai/docs.html

## PuffeRL（トレーナ）とは

- 論文は "First-party Training with Clean PuffeRL" と呼ぶ。「By design, PufferLib does not include a library of learning algorithm implementations ... We do maintain one heavily customized version of CleanRL's PPO implementation for testing and baselines.」（学習アルゴリズム実装ライブラリは意図的に持たない。テスト/ベースライン用に CleanRL の PPO を高度にカスタマイズした 1 版を保守）
- 別学習/評価の分離、モデル保存・チェックポイント機能などを追加
- docs では Muon 最適化や優先度付きリプレイ等の独自研究改善を含む PPO 変種と説明

出典: RLJ 2025 PDF, https://puffer.ai/docs.html

## スループットの正確な主張と出典

| 主張 | 数値 | 条件 |
|------|------|------|
| 見出し | 「first-party suite of 12 environments each run at 1M steps/second」 | RLJ 2025 abstract |
| シミュレーション | Ocean 環境が単一 CPU コアで >1M steps/s、一部 10M steps/s | RLJ 2025 PDF |
| **学習（RTX 4090）** | 「trains Ocean environments at **300k-1.2M steps/second** on a single RTX 4090」（標準アーキは 150k–1M params の MLP-LSTM / CNN-LSTM） | RLJ 2025 PDF |
| Atari 学習 | 「up to 30k steps/second on Atari, which is still **30x faster than the original CleanRL**」 | RLJ 2025 PDF |
| テスト機 | 24 コア i9-14900k + RTX 4090（デスクトップ）/ 6 コア i7-10750H + RTX 3070（ノート） | RLJ 2025 PDF, Table 2 |
| v3.0 | 「small models now train **3-5M steps/second**」。Pong を 3–5 秒、Breakout を 20–30 秒で解く（RTX 5090）。Neural MMO 3 を 640B steps・3日8時間で学習（6× RTX 4090） | RLJ 2025 PDF versioning note |
| v4 native CUDA backend | CUDA 版で「20,000,000 step/second training in only ~5k lines of CUDA」、Torch 版は最大 5,000,000 | https://puffer.ai/docs.html |

→ ユーザー指定の「1M–4M steps/s on single RTX 4090」は、v2 論文の「300k–1.2M」と v3 の「3–5M」を合わせた framing に対応。**4M を超える値は v4 の CUDA backend（プロジェクト docs のみ、査読外）**。

## CleanRL 互換 API（検証済）

- 「With PufferLib, you can use familiar libraries like CleanRL and SB3 to scale from classic benchmarks like Atari and Procgen to complex simulators like NetHack and Neural MMO 3.」（RLJ abstract）
- 「Our main demo is built on CleanRL, but with added integrations for performance, logging, experiment management, and hyperparameter sweeps.」（RLJ PDF）

## C 環境 + ベクトル化トレーナで高速化する仕組み

1. **C 実装 Ocean 環境**が単一 CPU コアで >1M steps/s を出し、環境ボトルネックを除去。動機: 標準 Atari クラス環境は「a few thousand steps per second on a modern CPU core」で、CleanRL/SB3 の「old, unoptimized multiprocessing and expensive Python environment wrappers」が加わり、「training that runs at hundreds to thousands of steps per second, leaving modern GPUs at **5-20% utilization**」となる（RLJ PDF）
2. **Emulation 層**: Gym/Gymnasium space 上に numpy 構造化配列 dtype（C 構造体相当）を推論し、ゼロコピーの連続メモリを提供。変換コードは Cython 化。「Emulation overhead is negligible for environments slower than several thousand steps per second per core」
3. **スクラッチ実装のベクトル化**（serial/multiprocessing/Ray バックエンド）: 観測を共有メモリに直接書き込み「eliminates several redundant data copies」。多くの環境で 30% 高速化、pooling で 50%–3x
4. **EnvPool の Python 実装**（Weng et al., 2022b を引用）: 「Standard vectorization simulates M environments in parallel and requires waiting on all M before returning observations. PufferLib can instead retrieve N << M observations」。論文は「provides most of the speedup」と記述。M 並列のうち N << M だけ取得する非同期 pooling で、最も遅い env/コアにブロックされない
5. **v4 native CUDA backend**: 環境 + PPO ループを GPU 上で融合（fused kernels, CUDA graphs, 静的メモリ確保, ストリーム間非同期ベクトル化）し ~20M steps/s（~1500 行 Python + ~5000 行 CUDA C）

## 主要ベンチマーク（各出典付き）

- Ocean 12 環境 @ 1M+ steps/s/コア（一部 10M）— RLJ 2025 PDF
- PPO 学習 @ 300k–1.2M steps/s on 単一 RTX 4090 — RLJ 2025 PDF
- Atari 学習 最大 30k steps/s「30x faster than the original CleanRL」— RLJ 2025 PDF
- v3: 3–5M steps/s（小モデル）、Pong 3–5 秒 / Breakout 20–30 秒（RTX 5090）— RLJ 2025 versioning note
- Native CUDA backend 最大 20M steps/s — puffer.ai/docs.html
- Table 2 ベクトル化スループット例: NetHack 96k/18k SPS（Puffer）vs 7k（Gymnasium）; Cartpole 460k/110k（Puffer）vs 82k/14k（Gymnasium）— RLJ 2025 PDF

## 検証フラグ

- **v4「20M steps/s」CUDA backend**: 出典は puffer.ai/docs.html（プロジェクト docs、査読外）。査読論文 RLJ 2025 は v3「3–5M steps/s」までを記載。
- **arXiv 2406.12905**: これは v1.0 論文でスループット数値を含まない。すべての PufferLib のスループット数値は RLJ 2025 論文と puffer.ai 由来。
- **C 環境のファイルワークフロー（.h/.c/.pyx）**: 公式論文/docs では断片的にしか確認できず、第三者 Medium チュートリアルに依拠する箇所は二次情報として扱う。
- **EnvPool 内部実装の独立 FPS**: PufferLib が「EnvPool の Python 実装を含み most of the speedup を提供」と述べるが、その機能単体の独立ベンチマーク数値は提示されていない（Table 2 の "Puffer Pool" 列に統合）。

## 出典 URL

- https://github.com/PufferAI/PufferLib
- https://rlj.cs.umass.edu/2025/papers/Paper151.html
- https://rlj.cs.umass.edu/2025/papers/RLJ_RLC_2025_151.pdf
- https://arxiv.org/abs/2406.12905
- https://puffer.ai/
- https://puffer.ai/docs.html
