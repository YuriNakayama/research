# JAX エコシステム — 個別論文 deep-dive（retrieval）

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem`（JAX エコシステム） / retrieval フェーズ / 2026-06-26

## このディレクトリについて

本ディレクトリは、JAX による end-to-end GPU/TPU 強化学習を支える **8 本の一次論文（primary sources）** の個別詳細レポート群です。各論文の arXiv abstract ページを WebFetch で照合し、要旨の定量主張を **verbatim 引用**して条件付きで記録しています。

クラスタ全体の概念的サーベイ（JAX core primitives、PureJaxRL、Brax/MJX、gymnax、JaxMARL、Podracer、限界・実装選択ガイド等を横断する解説）は **`docs/research/runs/rl_gpu_acceleration/retrieval/20260626_all/`** にあり、本ディレクトリはそれを**論文単位で補完する deep-dive レイヤー**です。両者を併せて参照してください。

設計思想の要約: 本クラスタの論文群は「環境とアルゴリズムを同一アクセラレータ上でコンパイルする」（Podracer の Anakin 流）を共通基盤とし、`jit`+`vmap`+`lax.scan` による単一/少数 GPU 上の桁違いの高速化を、物理（Brax/Kinetix）・ボードゲーム（Pgx）・マルチエージェント（JaxMARL）・オープンエンド（Craftax）・進化戦略（evosax）・メタ RL（Discovered Policy Optimisation）の各ジャンルへ展開しています。基盤レイヤは Oxford FLAIR・Google/DeepMind に集中しています。

## レポート一覧

| # | タイトル | リンク | 一言要約 |
|---|---------|--------|---------|
| 01 | Brax — 微分可能物理エンジン | [01-brax.md](01-brax.md) | JAX 製の微分可能剛体物理エンジン。PPO/SAC/ES を環境と同一デバイスでコンパイルし MuJoCo 風タスクを数分で学習。環境レイヤの原典。 |
| 02 | Podracer（Anakin / Sebulba） | [02-podracer-anakin-sebulba.md](02-podracer-anakin-sebulba.md) | TPU Pod 上で RL をスケールさせる2アーキテクチャ。Anakin=全部 TPU 上（vmap→pmap）、Sebulba=actor-learner 分離。JAX RL 分散の原典。 |
| 03 | Discovered Policy Optimisation | [03-discovered-policy-optimisation.md](03-discovered-policy-optimisation.md) | Mirror Learning 空間で drift 関数をメタ学習（LPO）し閉形式 DPO を導出。PureJaxRL 高速化基盤の上で Brax にて SOTA。 |
| 04 | Pgx — 並列ゲームシミュレータ | [04-pgx.md](04-pgx.md) | バックギャモン/チェス/将棋/囲碁を JAX 実装。auto-vmap で数千局同時。Python 実装比 10–100x（DGX-A100）。Gumbel AlphaZero を実証。 |
| 05 | JaxMARL | [05-jaxmarl.md](05-jaxmarl.md) | 初の GPU 対応統合 MARL ライブラリ。SMAX 同梱。単一ラン約 14x、複数ラン vectorize 時 最大 12500x（条件注意）。 |
| 06 | Craftax | [06-craftax.md](06-craftax.md) | Crafter を JAX 再実装したオープンエンド RL ベンチ。Craftax-Classic は Python 原版比 最大 250x。1B インタラクションの PPO を単一 GPU・1時間未満。 |
| 07 | Kinetix | [07-kinetix.md](07-kinetix.md) | 独自 2D 物理エンジン Jax2D 上で数千万タスクを手続き生成し汎用 RL エージェントを学習。未見タスクをゼロショット解。 |
| 08 | evosax | [08-evosax.md](08-evosax.md) | JAX 製進化戦略ライブラリ。30 アルゴリズムを ask-evaluate-tell API で提供。jit/vmap/device 並列で勾配フリー最適化を GPU/TPU 化。 |

## speedup 倍率の条件付き一覧（誤引用防止）

各論文が要旨で主張する speedup/規模を、**ベースラインと条件込み**で列挙します。倍率を引用する際は必ず右列の条件を併記してください。最良値の単独引用は誤解を招きます。

| # | 論文 | 主張（VERBATIM 由来） | ベースライン | 条件（**必ず併記**） |
|---|------|----------------------|--------------|----------------------|
| 01 | Brax | 「MuJoCo 風タスクを minutes で学習」 | （要旨に倍率なし） | 倍率・FPS は要旨非掲載。質的な「数分で学習」のみ。「N 倍速い」と書かない。 |
| 02 | Podracer / Anakin | 555 million steps per second | （実装比の倍率提示なし、絶対スループット） | 小規模ネット・grid-world・**無料 Colab TPU** |
| 02 | Podracer / Anakin | 333 million steps per second | 同上 | メタ学習・**16 コア TPU・60K 環境**（約 24 時間・約 100 ドル） |
| 02 | Podracer / Sebulba | 200M frames を ∼1 hour、約 2.88 ドル | （絶対値） | V-trace/IMPALA・**8 コア TPU** |
| 02 | Podracer / Sebulba | 43 million frames per second | （絶対値） | **フル Pod・2048 コア**（Pong を 1 分未満） |
| 02 | Podracer / Sebulba | 200M Atari frames を 9 hours、約 40 ドル | （絶対値） | MuZero・**16 コア TPU** |
| 03 | Discovered Policy Optimisation | SOTA（倍率なし） | （要旨に速度倍率なし） | **Brax 環境**で LPO/DPO が SOTA・未見設定へ転移。速度は引用対象外。 |
| 04 | Pgx | **10–100x faster** | existing implementations available in **Python** | **DGX-A100** 上での実験。ゲーム種別で幅。最良 100x の単独引用は不可。 |
| 05 | JaxMARL | **around 14x faster** | existing approaches（既存 CPU 実装） | wall clock time・**単一の学習ラン** |
| 05 | JaxMARL | **up to 12500x** | existing approaches | **複数の学習ランを vectorize した場合**の上限。単一ランは ~14x。**最重要注意**。 |
| 06 | Craftax | **up to 250x faster** | Python-native original（**Crafter のオリジナル Python 実装**） | **Craftax-Classic（軽量版）**のみ。本体 Craftax の倍率ではない。 |
| 06 | Craftax | 1B interactions を under an hour、optimal reward の 90% | （絶対値・性能） | **PPO・1 billion interactions・単一 GPU** |
| 07 | Kinetix | 数千万タスク生成 / 数十億 env steps を安価にシミュレート | （規模、倍率なし） | Jax2D。倍率は要旨非掲載。規模として扱う。 |
| 08 | evosax | 30 algorithms 実装 | （規模、速度倍率なし） | jit/vmap/device 並列を質的に訴求。「N 倍速い」は不可。 |

### 引用時の3大注意
1. **JaxMARL 12500x** は「複数ラン vectorize 時の上限」。単一ランは **約 14x**。
2. **Pgx 10–100x** は「DGX-A100 上、Python 既存実装比」。1桁の幅を潰さない。
3. **Craftax 250x** は「Craftax-Classic、Python オリジナル Crafter 比、最大値」。本体 Craftax ではない。

## 出典・検証メモ

- 全 8 論文の arXiv abstract ページを WebFetch でタイトル・著者・要旨・venue・定量主張と突き合わせ済み（2026-06-26）。
- Podracer の Anakin/Sebulba 機構・定量数値は ar5iv 本文（https://ar5iv.labs.arxiv.org/html/2104.06272 ）から verbatim 抽出。
- 倍率・FPS の数値はすべて要旨/本文の verbatim 引用。ID・数値の推測は一切行っていない（アンチハルシネーション方針）。
