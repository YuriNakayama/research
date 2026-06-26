# principles クラスタ — 論文別 詳細レポート（per-paper deep-dive）

## パラメータ

- **ドメイン**: `rl_gpu_acceleration`
- **対象クラスタ**: `principles`
- **run**: `retrieval/20260626_principles_papers`（論文別の deep-dive）
- **生成日**: 2026-06-26
- **手法**: 7 本の VERIFIED 一次資料（URL 確認済み）を arXiv abstract ページ + ar5iv フルテキストで WebFetch し、本文・表から実際の数値・原文引用を抽出。検証できなかった数値は明示的にフラグした。捏造は行っていない。

## このレポートの位置づけ

本 run は「**なぜ GPU アクセラレーションは強化学習を劇的に速くするのか**」という principles の問い（WHY-GPU-RL-is-fast）に対し、**根拠となる主要論文を 1 本ずつ精読**した補助資料である。概念レベルの統合解説は同階層の **`retrieval/20260626_principles/index.md`**（章立てで原理を解説する本編）にあり、本 run はその**各主張の出典を論文単位で裏取りする**役割を持つ。本編が「ストーリー」、本 run が「証拠集（per-paper エビデンス）」という関係。

7 本は GPU-RL 高速化の系譜を時系列で並べており、**GA3C（ボトルネックの発見）→ IMPALA（分散 actor-learner + off-policy 補正）→ Sample Factory（単一マシンで非同期最適化）→ Large Batch Simulation（環境を GPU に乗せる）→ Podracer（TPU での Anakin/Sebulba 二択）→ Survey（俯瞰の分類体系）→ Staggered Resets（超並列特有の新しい落とし穴）** という流れを成す。

## レポート一覧

| # | タイトル | リンク | 一言要約 |
|---|----------|--------|----------|
| 01 | GA3C: Asynchronous Advantage Actor-Critic on a GPU | [01-ga3c.md](./01-ga3c.md) | 「素朴な GPU 化では GPU が遊ぶ」を初めて数値化（108ms 中 GPU 推論は 10%）。キュー+動的スケジューリングで CPU 比最大 45×。 |
| 02 | IMPALA: Scalable Distributed Deep-RL | [02-impala.md](./02-impala.md) | actor-learner 分離 + V-trace off-policy 補正。250,000 frames/sec、単一マシン A3C の 30× 超。 |
| 03 | Sample Factory: 100000 FPS Async RL | [03-sample-factory.md](./03-sample-factory.md) | 分散に頼らず単一マシンで 10 万 FPS 超。double-buffered sampling + 共有メモリで GPU の遊びを消す。VizDoom で 146,551 FPS。 |
| 04 | Large Batch Simulation for Deep RL | [04-large-batch-simulation.md](./04-large-batch-simulation.md) | レンダリング含む環境を GPU 上でバッチ実行。先行比 2 桁高速化、64-GPU 3 日 → 1-GPU 1.5 日。 |
| 05 | Podracer architectures (Anakin / Sebulba) | [05-podracer-anakin-sebulba.md](./05-podracer-anakin-sebulba.md) | TPU 用 2 配置戦略。Anakin=全部 TPU 上（555M steps/sec, 転送ゼロ）、Sebulba=分散 actor-learner（フル Pod で 43M FPS）。 |
| 06 | Acceleration for Deep RL: A Survey | [06-acceleration-survey.md](./06-acceleration-survey.md) | 並列・分散 RL 高速化の体系的サーベイ（ACM CSUR 2024）。5 軸の taxonomy + 16 OSS 比較。個別論文を地図に載せる。 |
| 07 | Staggered Environment Resets | [07-staggered-resets.md](./07-staggered-resets.md) | 超並列 PPO で同期リセットが有害な非定常性を生む。リセットをずらすだけで実時間収束 2-3×、より良いスケーリング。 |

## 主要数値クイックリファレンス

| 論文 | 指標 | 数値（VERBATIM / 出典本文） | 文脈 |
|------|------|------------------------------|------|
| 01 GA3C | 推論待ち時間と GPU 比率 | **108ms、うち GPU 推論は 10%**、残り 90% はオーバーヘッド | 素朴な CPU env + GPU policy の非効率の核心証拠 |
| 01 GA3C | GPU 稼働率 | 最速構成でも **平均 56%**（占有率 平均76%/ピーク98%） | GPU が CPU の env step を待って遊ぶ |
| 01 GA3C | CPU A3C 比高速化 | 小DNN **~4×**、大DNN(stride1) **~45×**、1日学習 ≒ 元A3Cの4日 | キュー+動的スケジューリングの効果 |
| 02 IMPALA | スループット | **250,000 frames/sec（= 21 billion frames/day）** | バッチ128最適化、単一マシンA3Cの **30× 超** |
| 02 IMPALA | 学習到達時間 | A3C の 7.5 日相当に **約 10 時間**で到達 | actor-learner 分離 + V-trace |
| 02 IMPALA | マルチタスク | DMLab-30 **49.4%**（A3C 23.8%）、Atari-57 **59.7%** median | 効率と汎化の両立 |
| 03 Sample Factory | スループット | **10^5 FPS 超**、APPO で **130,000 FPS**、VizDoom System#2 で **146,551 FPS** | 単一マシン、double-buffered sampling |
| 04 Large Batch Sim | 高速化倍率 | 先行研究比 **2 桁（×100）** | 環境＋レンダリングを GPU でバッチ実行 |
| 04 Large Batch Sim | スループット | 単一GPU **19,000+ FPS**、8-GPU **最大 72,000 FPS** | end-to-end GPU、host転送排除 |
| 04 Large Batch Sim | 学習コスト | **1-GPU 1.5 日**で 64-GPU 3日の SOTA の **97% 精度** | CPU シミュレーション律速を外す威力 |
| 05 Podracer (Anakin) | スループット | **555M steps/sec**（8-core free TPU）、24h で約 **$100** | 全計算を TPU 上、host転送ゼロ・Python なし |
| 05 Podracer (Sebulba) | スループット | 8-core TPU で **200K FPS**、フル Pod(2048核) で **43M FPS** | TPU Pod 上の分散 actor-learner |
| 05 Podracer (Sebulba) | コスト効率 | Atari 200M frames を **~1h / $2.88**、MuZero **9h / ~$40** | 環境が host を要する場合の選択肢 |
| 06 Survey | 比較対象 | **16 OSS ライブラリ/プラットフォーム**、5 軸 taxonomy | ACM Computing Surveys 2024、俯瞰枠組み |
| 07 Staggered Resets | 収束速度 | 短ロールアウト(K=8–16) は長比 **2–3× 速く収束** | 同期リセットの非定常性を除去 |
| 07 Staggered Resets | スケーリング | **6000 環境超**でも並列数増で実時間収束が短縮し続ける | ほぼゼロコストの実装変更 |

> 数値の注意:「100000 / 130000 / 146551 FPS」（03）はそれぞれタイトル主張・APPO 一般値・VizDoom 表中ピーク値という別文脈。GA3C・IMPALA・Podracer の数値は abstract には無く本文/表から取得。Staggered Resets（07）は 2025-11 のプレプリントで数値は暫定。詳細と原文引用は各論文レポートを参照。

## 出典一覧

1. https://arxiv.org/abs/1611.06256 — GA3C
2. https://arxiv.org/abs/1802.01561 — IMPALA
3. https://arxiv.org/abs/2006.11751 — Sample Factory
4. https://arxiv.org/abs/2103.07013 — Large Batch Simulation
5. https://arxiv.org/abs/2104.06272 — Podracer (Anakin/Sebulba)
6. https://arxiv.org/abs/2411.05614 — Acceleration Survey
7. https://arxiv.org/abs/2511.21011 — Staggered Environment Resets
