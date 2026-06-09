# Resources — Orbit Wars / Imitation Learning

- **ドメイン**: kaggle_orbit_wars
- **クラスタ**: imitation_learning
- **収集日**: 2026-04-20
- **対象**: Kaggle Simulation コンペにおける模倣学習 (IL / Behavioral Cloning) の適用事例、基礎手法論文、Orbit Wars へ適用可能な技術

## A. Kaggle Simulation コンペの模倣学習勝者/上位解法

| # | リソース | 種別 | 概要 | URL |
|---|---------|------|------|-----|
| A1 | Lux AI Season 3 — Imitation Learning 3rd Place Solution (adg4b) | Kaggle writeup | IL 単独で 3 位入賞。BC ベース。 | https://www.kaggle.com/competitions/lux-ai-season-3/writeups/adg4b-imitation-learning-3rd-place-solution |
| A2 | khanhvu207/kore2022 (Kore 2022 autoregressive IL) | GitHub | マルチモーダル Transformer で「船のプラン」(e.g. `N 10 W 5`) を autoregressive に生成する BC。トップ5チーム 200M tuple から学習 | https://github.com/khanhvu207/kore2022 |
| A3 | Hungry Geese 3rd Place (Maxwell) Behavior Cloning + MCTS | Speaker Deck | ResNet 8層46ch、Meta Kaggle から LB>1200 のエピソードを収集、BC→MCTS で refine | https://speakerdeck.com/hoxomaxwell/kaggle-hungry-geese |
| A4 | HandyRL (DeNA) — Hungry Geese 優勝フレームワーク | GitHub | BC + 分散 RL の汎用フレーム。環境プラグインに Hungry Geese 実装あり | https://github.com/DeNA/HandyRL |
| A5 | Halite IV — Imitation Learning by Semantic Segmentation (Kha Vo) | ブログ | 盤面を画像として扱い、U-Net/FCN 型で各セルの行動を予測する BC。上位チームリプレイを継続収集 | https://khavo.ai/2020/09/15/halite/ (原 voanhkha.github.io) |
| A6 | ttvand/Halite — 1st place (rule-based + DL hybrid) | GitHub | 優勝解法。ルールベース主体だが DL 補助を併用 | https://github.com/ttvand/Halite |
| A7 | ryandy/Lux-S2-public — Lux AI Season 2 1st place | GitHub | 1位解法。手法ディレクトリと writeup 参照リンクあり | https://github.com/ryandy/Lux-S2-public |
| A8 | Lux-AI-Challenge/Lux-Design-S2 — IL baseline + 1B frame dataset | GitHub | コンペ主催提供の IL ベースライン。Season 1 の 10億フレームを学習データに使用可 | https://github.com/Lux-AI-Challenge/Lux-Design-S2 |

## B. IL 基礎手法（論文・チュートリアル）

| # | リソース | 種別 | 概要 | URL |
|---|---------|------|------|-----|
| B1 | Ross et al., "A Reduction of Imitation Learning and Structured Prediction" (AISTATS 2011) — DAgger 原論文 | 論文 PDF | Dataset Aggregation: BC の covariate shift を反復データ収集で解消 | https://www.cs.cmu.edu/~sross1/publications/Ross-AIStats11-NoRegret.pdf |
| B2 | Vinyals et al., "Grandmaster level in StarCraft II" (Nature 2019) — AlphaStar | 論文 | 97.1万リプレイの SL 事前学習 → league-based MARL。SL policy は 上位 16% 水準 | https://www.nature.com/articles/s41586-019-1724-z |
| B3 | Silver et al., "Mastering the game of Go with deep neural networks and tree search" (Nature 2016) — AlphaGo | 論文 | 3000 万手の SL policy → self-play RL → MCTS 統合 | https://www.nature.com/articles/nature16961 |
| B4 | Shafiullah et al., "Behavior Transformers: Cloning k modes with one stone" (NeurIPS 2022) | 論文 | multi-modal 行動のための Transformer BC、action を k-means で離散化 | https://proceedings.neurips.cc/paper_files/paper/2022/file/90d17e882adbdda42349db6f50123817-Paper-Conference.pdf |
| B5 | HumanCompatibleAI/imitation — BC / DAgger / GAIL / AIRL 実装 | GitHub | PyTorch 製の IL ライブラリ、pip install 可 | https://github.com/HumanCompatibleAI/imitation |
| B6 | imitation docs — BC チュートリアル | ドキュメント | API と最小サンプル | https://imitation.readthedocs.io/en/latest/algorithms/bc.html |
| B7 | MineRL NeurIPS 2019 Competition 論文 | 論文 | BC/DQfD を前提にした sample-efficient RL コンペ。CraftRL 4位、UEFDRL 5位 | https://ar5iv.labs.arxiv.org/html/2101.11071 |

## C. Meta Kaggle Episodes 関連

| # | リソース | 種別 | 概要 | URL |
|---|---------|------|------|-----|
| C1 | Meta Kaggle dataset | Kaggle dataset | EpisodeAgents.csv 等、提出 bot 全エピソードのメタデータ | https://www.kaggle.com/datasets/kaggle/meta-kaggle |
| C2 | Meta Kaggle Code dataset | Kaggle dataset | 公開 kernel のソース | https://www.kaggle.com/datasets/kaggle/meta-kaggle-code |
| C3 | Kaggle API — `/api/i/competitions.EpisodeService/DownloadEpisode` | API | LB 上位 bot のリプレイ JSON を取得（kaggle-environments で可視化可能） | https://github.com/Kaggle/kaggle-environments |

## D. Orbit Wars 適用観点の補助リソース

| # | リソース | 種別 | 概要 | URL |
|---|---------|------|------|-----|
| D1 | kaggle-environments | GitHub | Orbit Wars を含む Simulation コンペの公式ランタイム。エピソード再生・評価 | https://github.com/Kaggle/kaggle-environments |
| D2 | OpenAI Five paper (arXiv 2019) | 論文 | **IL 不採用**で純粋 self-play RL を選んだ対照事例。選択肢比較の参考 | https://arxiv.org/abs/1912.06680 |
| D3 | SimonLucas/planet-wars-rts | GitHub | Planet Wars RTS 環境（軌道なし）。リプレイ生成器としてローカル BC データ拡張に使える可能性 | https://github.com/SimonLucas/planet-wars-rts |

## 優先順位

1. **A2 Kore 2022 (khanhvu207)** — Orbit Wars に最も近い topology（複数ユニット + 連続マップ + プラン列）
2. **A3 Hungry Geese (Maxwell)** — BC + MCTS ハイブリッドの手順が明快、Orbit Wars にも直適用可
3. **A5 Halite IV semantic segmentation** — 空間構造を image として扱う BC、Orbit Wars の 2D 連続空間に直結
4. **A1 Lux S3 3rd IL** — 最新 Kaggle IL 解法、プロンプト最適化の参考
5. **B2 AlphaStar / B3 AlphaGo** — SL→RL 設計の理論的バックボーン
6. **B1 DAgger** — covariate shift 対策の基礎、late stage で効く
7. **C1–C3 Meta Kaggle Episodes** — データパイプラインの実装詳細

## retrieval phase 作成方針

`runs/kaggle_orbit_wars/retrieval/20260420_imitation_learning/` に以下の形で詳細レポートを作成する。

- `01-lux-s3-3rd-imitation.md` (A1)
- `02-kore2022-autoregressive-il.md` (A2)
- `03-hungry-geese-bc-mcts.md` (A3 + A4)
- `04-halite-iv-semantic-segmentation-il.md` (A5)
- `05-alphastar-supervised-pretraining.md` (B2)
- `06-alphago-sl-policy-network.md` (B3)
- `07-dagger-dataset-aggregation.md` (B1)
- `08-meta-kaggle-episodes-pipeline.md` (C1–C3)
- `09-orbit-wars-il-design-memo.md` (D1 + 統合設計)
- `index.md` — 上記のナビゲーション
