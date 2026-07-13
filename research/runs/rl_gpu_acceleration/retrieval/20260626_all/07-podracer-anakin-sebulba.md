# 07. Podracer アーキテクチャ（Anakin / Sebulba, DeepMind）

RL を TPU Pod 上にマッピングする 2 つの正典的パターン。概念的に最重要。

## 論文

- **"Podracer architectures for scalable Reinforcement Learning"**, **arXiv 2104.06272**（2021-04）。出典: https://arxiv.org/abs/2104.06272
- **著者（検証済み）**: Matteo Hessel, Manuel Kroiss, Aidan Clark, Iurii Kemaev, John Quan, Thomas Keck, Fabio Viola, Hado van Hasselt。「Hessel et al.」で正しい（Hessel 筆頭）。出典: https://arxiv.org/abs/2104.06272
- **コア主張（アブストラクト、検証済み）**: TPU（および TPU Pod = Google データセンタ内で低レイテンシ相互接続された多数の TPU デバイス）はスケーラブル・効率的・再現可能な RL に適する。本論文は RL を TPU Pod 上にマッピングする **2 つのアーキテクチャ**を提示。

## ANAKIN — 「everything on device」

- **パターン**: env + actor + learner をすべて JAX で書き、**単一の XLA プログラム**に JIT コンパイル。環境は RL 目的関数のフォワード計算の*一部*としてステップされ、勾配は複数の agent-environment 相互作用を貫いて微分される。自己完結的かつ決定論的 → 再現可能。小規模デバッグから大規模までスケール。出典: https://ar5iv.labs.arxiv.org/html/2104.06272
- **vmap/pmap の使い方（正確な仕組み）**: 最小計算単位（env ステップ + 行動選択 + パラメータ更新）を **`vmap`** して 1 つの TPU コアを飽和させるバッチに渡りベクトル化し、そのベクトル化関数を **`pmap`** して **TPU の 8 コアに複製**（さらに Pod のコア群へ拡張）。出典: 同上
- **対象環境**: **それ自体が JAX で書かれた環境**（純 JAX 関数、JIT 可能）のみ — すなわちアクセラレータ上で走る小規模/単純シミュレータ。出典: 同上
- **スループット/コスト数値**（ar5iv 全文抽出 → arXiv PDF で直接再確認済み）:
  - grid-world: **8-core TPU で 555 million steps/秒**。原文「When using small neural networks and grid-world environments an Anakin architecture can easily perform 555 million steps per second」。出典: https://arxiv.org/abs/2104.06272
  - 複雑なメタ学習（60K JAX 環境 + 1K 方策を並列訓練、単一共有 update rule の学習）: **16-core TPU で 333 million steps/秒超**。出典: 同上
  - コスト: 16-core TPU で ~24 時間訓練が GCP preemptible で **約 $100**。出典: 同上

## SEBULBA — actor–learner 分割

- **パターン**: actor-learner を分解。**環境はホスト CPU 上でステップ**し、ホストあたり 8 個の TPU コアを 2 つの素集合に分割 — **A コアが act、残り (8−A) コアが learn**。actor コアは TPU 上でバッチ推論（行動選択）、CPU スレッドが env を回す。learner コアが勾配更新。出典: https://ar5iv.labs.arxiv.org/html/2104.06272
- **典型的分割**: 単純な model-free エージェントでは **learner コアを actor コアの ~3 倍**にすることが多い（例: 8 コアで actor 2 / learner 6）。出典: 同上
- **対象環境**: **JIT コンパイルできない**任意の環境 — 例えば **Atari** や他の CPU バウンドシミュレータ。これが Anakin との決定的な対比。出典: 同上
- **スループット/コスト数値**（Atari、PDF 直接確認済み）:
  - V-trace エージェント、**8-core TPU で 200M Atari フレームを ~1 時間**、GCP preemptible で **約 $2.88**。出典: https://arxiv.org/abs/2104.06272
  - actor バッチを 32→128 にスケールで **8-core TPU で ~200K frames/秒**。出典: 同上
  - フル TPU Pod（**2048 コア**）: **~43 million frames/秒**、Atari Pong を **1 分未満**で解く。出典: 同上
  - 探索ベースの **MuZero**: 200M Atari フレームに **16-core TPU で ~999 時間（GCP preemptible で ~$40）**。出典: 同上

## どの現代ライブラリが Anakin / Sebulba を実装するか（検証済み）

- **Mava**（InstaDeep, instadeepai/Mava）: **両方**実装。README:「Mava は両 Podracer アーキテクチャをサポート … Anakin（JAX 環境）… Sebulba（非 JAX 環境）」。出典: https://github.com/instadeepai/Mava , arXiv 2107.01460（Mava 論文）
- **Stoix**（EdanToledo/Stoix）: 単一エージェント RL ライブラリ、**Mava から派生**。**Anakin システム**（フル JAX 最適化）と **Sebulba システム**（非 JAX/CPU 環境）の両方を提供。Sebulba 対応は 2024-08 に著者 Edan Toledo が告知。前提「Stoix は Anakin を実装」は正しく、今や Sebulba も実装。出典: https://github.com/EdanToledo/Stoix , https://x.com/EdanToledo/status/1825449109475487963
- 補足: JaxMARL の訓練ループ自体も Anakin スタイル（フル end-to-end JAX/JIT）。全環境が JAX ネイティブだからである — 2 トピックの接続点。

## 検証フラグ

- **完全検証済み**: arXiv ID、著者一覧、Anakin/Sebulba の概念的分割、vmap/pmap の仕組み、Sebulba の CPU 環境 actor-learner 分割、Mava 両対応・Stoix 両対応。
- **数値の解消済み discrepancy**: Anakin grid-world steps/秒 について、二次ソース SyncedReview は「5 million」「16-core で 3 million 超」と要約していたが、**一次論文（arXiv PDF 直接確認）は 555 million（8-core）/ 333 million 超（16-core, メタ学習）**。一次の値が正しく、SyncedReview は誤要約と判断。本レポートは一次の値を採用。

## 出典

- https://arxiv.org/abs/2104.06272（Podracer 論文、PDF 直接確認）
- https://ar5iv.labs.arxiv.org/html/2104.06272（HTML 版）
- https://github.com/instadeepai/Mava
- https://github.com/EdanToledo/Stoix
- https://x.com/EdanToledo/status/1825449109475487963
