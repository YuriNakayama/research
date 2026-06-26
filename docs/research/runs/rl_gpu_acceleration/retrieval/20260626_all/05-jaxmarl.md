# 05. JaxMARL（Oxford FLAIR / FLAIROx, NeurIPS 2024）— マルチエージェント RL

## 概要カード

- **一言で言うと**: GPU 対応（end-to-end JAX）の効率と、よく使われる MARL 環境の大規模スイートを統一 API で組み合わせた、初のオープンソース Python ライブラリ。
- **GitHub**: https://github.com/FLAIROx/JaxMARL
- **Star（概算）**: ~823（2026-06、変動するため「~800+」目安）。出典: https://github.com/FLAIROx/JaxMARL
- **最新リリース**: v0.1.0（2025-06-01、計 7 リリース）。活発に開発中。出典: https://github.com/FLAIROx/JaxMARL
- **主要言語**: Python（~70%）

## 論文 / 採択

- **arXiv ID: 2311.10090**（"JaxMARL: Multi-Agent RL Environments and Algorithms in JAX"）。初投稿 2023-11。題名はバージョンで微変動（v1 "...Environments in JAX" → 後に "...Environments and Algorithms in JAX"）。出典: https://arxiv.org/abs/2311.10090
- **NeurIPS 2024 Datasets & Benchmarks Track 採択（検証済み）**。公式 proceedings PDF と NeurIPS 2024 バーチャルポスター（poster/97649）が存在。出典: https://proceedings.neurips.cc/paper_files/paper/2024/file/5aee125f052c90e326dcf6f380df94f6-Paper-Datasets_and_Benchmarks_Track.pdf , https://neurips.cc/virtual/2024/poster/97649
- **筆頭著者**: Alexander Rutherford。著者多数（Benjamin Ellis, Matteo Gallici, Jonathan Cook, Mikayel Samvelyan, Chris Lu, Shimon Whiteson, Jakob N. Foerster ほか、Foerster Lab / FLAIR, Oxford）。出典: https://arxiv.org/abs/2311.10090

## 高速化主張（検証済み・正確な条件付き）

アブストラクトの正確な引用: 「wall clock 時間で見ると、我々の JAX ベース訓練パイプラインは既存手法より約 14 倍高速で、複数の訓練実行をベクトル化すると最大 12500x になる」。出典: https://arxiv.org/abs/2311.10090

- **~14x** = 既存（CPU ベース）手法に対する単一実行 wall-clock 高速化。
- **~12,500x** = 見出し数値。**多数の訓練実行を並列ベクトル化した場合のみ**達成（単一実行の数値ではない）。Foersterlab 公式ブログも「最大 12500x 高速化」と確認。出典: https://blog.foersterlab.com/jaxmarl/
- **ハードウェア**: ベンチマークは単一 **NVIDIA A100 GPU**。12,500x は数千シードを 1 アクセラレータ上で同時実行したときの実効「実行あたり」高速化。出典: https://blog.foersterlab.com/jaxmarl/
- 追加ブログ数値（二次、ブログ要約 — 厳密値は論文の図を参照）: MPE Spread で MARLLIB 比 ~100x、SMAX 512 実行で PyMARL 比 ~100x、GPU 1 枚で 1024 実行並列時 ~10,000x。⚠️ これらの個別倍率はブログの本文/図由来でアブストラクトの 1 文ではない。方向性は信頼できるが精密値は論文図を参照。出典: https://blog.foersterlab.com/jaxmarl/

## 環境（GitHub README で検証）

SMAX（SMAC / StarCraft Multi-Agent Challenge の JAX 再実装、SC2 エンジン不要）、MPE（Multi-Agent Particle Environments）、Overcooked / OvercookedV2、Hanabi、Multi-Agent Brax（MABrax）、STORM（行列ゲームの時空間表現）、Coin Game、Switch Riddle、JaxNav（2D 幾何ナビゲーション）、JaxRobotarium。出典: https://github.com/FLAIROx/JaxMARL

**SMAX（旗艦ベンチマーク）**: StarCraft Multi-Agent Challenge を JAX で近似再実装したもの。StarCraft II ゲームエンジンを排除し、GPU 高速化と self-play/メタ学習を可能にする。出典（アブストラクト）: https://arxiv.org/abs/2311.10090

## アルゴリズム（GitHub README で検証）

IPPO、MAPPO、IQL（Independent Q-Learning）、VDN、QMIX、加えて拡張/新規追加の TransfQMIX、SHAQ、PQN-VDN。コアベースラインとして論文/ブログは IPPO・QMIX・VDN・MAPPO を強調。出典: https://github.com/FLAIROx/JaxMARL , https://blog.foersterlab.com/jaxmarl/

## 検証フラグ

- **完全検証済み**: arXiv ID、著者、NeurIPS 2024 採択、14x / 12,500x のアブストラクト主張とその「複数実行ベクトル化」条件、環境・アルゴリズム一覧、GitHub URL。
- **概算/変動**: Star 数（~823, 2026-06）。
- **二次・要注意**: クロスライブラリ倍率（100x/10,000x）はブログ本文/図由来。精密値は論文図を参照。

## 出典

- https://arxiv.org/abs/2311.10090
- https://proceedings.neurips.cc/paper_files/paper/2024/file/5aee125f052c90e326dcf6f380df94f6-Paper-Datasets_and_Benchmarks_Track.pdf
- https://neurips.cc/virtual/2024/poster/97649
- https://github.com/FLAIROx/JaxMARL
- https://blog.foersterlab.com/jaxmarl/
