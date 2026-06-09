# Orbit Wars 模倣学習モデル設計 — Retrieval Index

**作成日**: 2026-05-02
**ドメイン**: kaggle_orbit_wars
**フェーズ**: retrieval
**クラスタ**: imitation_learning（新規・既存 `rl_methods` / `similar_competitions` を補完）

## このランの位置づけ

Orbit Wars の bot を **教師あり模倣学習 (Behavior Cloning)** で構築する場合、各 planet について以下を予測する必要がある:

1. **射出元 planet** — 自分が所有する planet の中から選ぶ（可変個数）
2. **射出先 planet** — 全 planet（最大 40）から選ぶ
3. **射出量** — `0 〜 ships(source)` の整数（連続的に近い大きな範囲）

これは **(離散 source) × (離散 target) × (整数 amount with state-dependent upper bound)** という典型的な「組み合わせ＋パラメータ付き行動空間 (parameterized action space)」であり、純粋な MLP + softmax では破綻する設計領域。本ランでは過去事例と論文を整理し、Orbit Wars 向けの推奨アーキテクチャを導出する。

## レポート一覧

| # | ファイル | 概要 |
|---|---------|------|
| 01 | [combinatorial-action-space-taxonomy.md](./01-combinatorial-action-space-taxonomy.md) | 組み合わせ行動空間の 5 つの設計パターン（独立 multi-head / autoregressive / pointer / parameterized / seq2seq）を比較 |
| 02 | [alphastar-autoregressive-heads.md](./02-alphastar-autoregressive-heads.md) | AlphaStar / AlphaStar Unplugged の autoregressive 7 ヘッド構造と模倣学習損失設計 |
| 03 | [kore2022-1st-place-deepdive.md](./03-kore2022-1st-place-deepdive.md) | Kore 2022 1位 (khanhvu207) の seq2seq 模倣学習。文字列「N 10 W 5」のデコーダ |
| 04 | [halite-iv-semantic-segmentation.md](./04-halite-iv-semantic-segmentation.md) | Halite IV 1位系 / khavo の per-cell semantic segmentation 方式 |
| 05 | [parameterized-action-space.md](./05-parameterized-action-space.md) | PADDPG / P-DQN / HyAR — 離散行動 + 連続パラメータの hybrid action space 文献 |
| 06 | [amount-prediction-strategies.md](./06-amount-prediction-strategies.md) | 「射出量 0〜N」の予測戦略（連続回帰 / 離散ビン / fraction / pointer / token decoder） |
| 07 | [imitation-learning-pitfalls.md](./07-imitation-learning-pitfalls.md) | BC 特有の落とし穴（compounding error / mode collapse / multi-modal expert / DAgger） |
| 08 | [orbit-wars-recommended-design.md](./08-orbit-wars-recommended-design.md) | 上記を統合した Orbit Wars 推奨アーキテクチャと段階的実装プラン |
| 09 | [current-impl-knn-evaluation.md](./09-current-impl-knn-evaluation.md) | **現状実装（近傍 K=7 + NOOP の 8-class、ships ルールベース）の評価と改訂プラン** |
| 10 | [backbone-training-log-comparison.md](./10-backbone-training-log-comparison.md) | **case1/3/4/5/8 の backbone × head × 学習ログの実測比較（DVC キャッシュから復元）** |

## 現状実装の位置づけ（2026-05-02 追記）

現状の Orbit Wars 実装は **「近傍 K=7 planet + NOOP の 8-class softmax、ships 量はルールベース固定値」** という設計を採用しており、これは学習の平易化（次元圧縮 + タスク直交分解 + inductive bias 注入）を狙った極めて妥当な Phase 0 baseline。

本ランの 01〜08 章は「Pointer Network + Autoregressive 3-head」という理論最適形を扱うが、**現状実装からそこへの移行は段階的に行うべき** で、その評価と改訂プランは [09 章](./09-current-impl-knn-evaluation.md) に整理した。

要点:
- 現状実装は `08` 章の Phase 1 baseline と同じ哲学（むしろ更に保守的）
- 次の一手はアーキテクチャ変更ではなく **K の coverage 測定 + ships ルールと expert の整合性確認 + NOOP 除外指標の整備**（Phase 1.5）
- Pointer Network 化や Autoregressive 化は、Phase 2 以降で **rule-based bot を超えてから** 初めて検討する

## 主要な結論（先取り）

1. **action は autoregressive に分解せよ**: `source → target → amount` の順に factorize し、前段の選択を次段の context に流す（AlphaStar 設計）。独立 multi-head は source/target/amount の相関（強い source からは強い target へ）を学習できず必ず性能が出ない。
2. **source / target は pointer network で**: planet 数が可変（5〜40）なので固定次元 softmax は使えない。entity embedding に対する attention で planet を pointer 選択する。
3. **amount は離散ビン化が第一選択**: `[0%, 25%, 50%, 75%, 100%]` のような **fraction-of-source-ships** 5〜10 段で離散化。Kore 2022 1位や AlphaStar 系の事例ではほぼ全てこの方針。連続回帰 (regression) は loss の不安定さと multi-modality の扱いで負ける。
4. **Per-planet 並列 vs 1 ターン 1 アクション**: Orbit Wars は 1 ターンに複数 planet が同時に射出可能 → 各 planet ごとに **独立に** policy を適用（per-planet decoding）するのが Kore 2022 / Halite IV と同型。
5. **Kore 2022 の seq2seq 直接デコードは Orbit Wars にも転用可能**: 「N 10 W 5」のような plan 文字列を Transformer decoder で 1 文字ずつ生成。Orbit Wars でも `"target_planet=7 ships=42"` 的トークン列で同様にできるが、固定長 3 ヘッドで十分（オーバーキル）。
6. **教師データの作り方**: 自前の strong rule-based bot で self-play → 全 planet の行動を抽出。`docs/research/runs/kaggle_orbit_wars/retrieval/latest_heuristic_search/` の探索系 bot を expert 化して replay 化するのが現実解。
7. **Mode collapse 対策**: 複数 expert (異なる戦略) を混ぜると BC は平均化して弱くなる。1 expert に絞る or expert ID を context に入れる（AlphaStar の z 統計と同じ発想）。

## 既存リサーチとの関係

| 既存ファイル | 本ランとの関係 |
|------------|--------------|
| `runs/kaggle_orbit_wars/retrieval/latest_rl_methods/04-entity-transformer-for-rts.md` | Entity Transformer + Pointer 設計の基盤。本ランはこれを「教師あり模倣学習」に特化して拡張 |
| `runs/kaggle_orbit_wars/retrieval/latest_similar_competitions/01-kore-2022-harm-buisman-1st.md` | Kore 2022 の他解法。本ランは autoregressive IL の khanhvu207 解法を深掘り |
| `runs/kaggle_orbit_wars/retrieval/latest_similar_competitions/03-halite-iv-ttvand-1st.md` | Halite IV 1位の文脈。本ランは semantic segmentation 方式 (khavo) を補強 |
| `runs/kaggle_orbit_wars/retrieval/latest_rl_methods/01-alphastar-league-training.md` | AlphaStar の league training。本ランは action head の autoregressive 構造に focus |

## 出典 (主要)

- Kore 2022 1st place (khanhvu207): https://github.com/khanhvu207/kore2022 / https://www.kaggle.com/competitions/kore-2022/discussion/340035
- AlphaStar (Vinyals et al. 2019, Nature): https://storage.googleapis.com/deepmind-media/research/alphastar/AlphaStar_unformatted.pdf
- AlphaStar Unplugged (Mathieu et al. 2023): https://arxiv.org/abs/2308.03526
- Decipher AlphaStar blog: https://cyk1337.github.io/notes/2019/07/21/RL/DRL/Decipher-AlphaStar-on-StarCraft-II/
- AlphaStar standard architecture (DeepWiki): https://deepwiki.com/google-deepmind/alphastar/3.3-standard-architecture
- Halite IV semantic segmentation IL (khavo): https://khavo.ai/2020/09/15/halite/
- Halite IV 1st place (ttvand): https://github.com/ttvand/Halite
- Lux S2 1st place (ryandy): https://github.com/ryandy/Lux-S2-public
- Hausknecht & Stone, "Deep RL in Parameterized Action Space" (2015): https://arxiv.org/abs/1511.04143
- Xiong et al., "Parametrized Deep Q-Networks" (P-DQN, 2018): https://arxiv.org/abs/1810.06394
- HyAR (hybrid action representation): https://openreview.net/pdf?id=wQkaGq7Vz6q
- Action Space Shaping in Deep RL (Kanervisto et al.): https://arxiv.org/abs/2004.00980
- Pointer Networks (Vinyals et al. 2015): https://arxiv.org/abs/1506.03134
- Deep RL in Large Discrete Action Spaces (Dulac-Arnold et al. 2015): https://arxiv.org/pdf/1512.07679
- BeClone: Behavior Cloning with Inference for RTS: https://ceur-ws.org/Vol-3217/paper27.pdf
- Sparse Imitation Learning for Combinatorial Action Spaces: https://research.google/pubs/sparse-imitation-learning-for-text-based-games-with-combinatorial-action-spaces/
- Diffusion Policy (Chi et al. 2023): https://diffusion-policy.cs.columbia.edu/
