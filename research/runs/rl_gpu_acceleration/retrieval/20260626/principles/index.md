# なぜ GPU アクセラレーションは強化学習を劇的に速くするのか — 技術原理の詳細解説

## パラメータ

- **ドメイン**: `rl_gpu_acceleration`
- **対象クラスタ**: `principles`（高速化の「なぜ」をメカニズムレベルで説明する技術原理レポート）
- **生成日**: 2026-06-26
- **手法**: WebSearch / WebFetch による一次資料（arXiv 論文・公式ドキュメント・専門家ブログ）の突き合わせ検証。定量主張はすべて出典 URL を明記し、検証できなかった主張は明示的にフラグ。
- **既存 run との関係**: `20260626_all`（ライブラリ別の横断サーベイ）・`20260626_pytorch_native`（PufferLib）とは別物で、本 run は「原理の説明」に特化。重複ではなく補完。

## 本レポートの構成

| 章 | テーマ | 内容 |
|----|--------|------|
| 1 | 古典的 RL のボトルネック | CPU シミュレータ + GPU ポリシーの直列化、host-device 転送、actor-learner 同期、低 GPU 稼働、~10k–100k FPS の上限 |
| 2 | 「すべてをアクセラレータ上で」パラダイム | 環境自体を GPU/TPU 上で動かす。host 転送ゼロ。なぜ 100–1000x になるか |
| 3 | ベクトル化 / バッチ化環境 | 数千環境を単一テンソル演算として。GPU の SIMT への完全マッピング。CPU マルチプロセスとの差 |
| 4 | JIT コンパイルと XLA | `jit` + `lax.scan` がロールアウト全体を単一融合カーネルへ。演算融合・カーネル起動排除・`vmap` 自動ベクトル化 |
| 5 | Anakin vs Sebulba | Podracer 論文の 2 つの配置戦略。どちらをいつ使うか |
| 6 | ハードウェア固有の論点 | single/multi-GPU、TPU pod、HBM 制約、混合精度、CUDA graphs |
| 7 | GPU アクセラレーションが効かない / 限界 | 分岐の多い環境、外部エンジン依存、巨大観測、デバッグ困難、数値精度 |
| 8 | スループットの算数（最重要） | steps/sec ≠ 収束までの実時間。sim-bound vs learner-bound、大バッチの sample efficiency 劣化、Amdahl の法則 |

---

## 1. 古典的 RL のボトルネック — なぜ ~10k–100k FPS で頭打ちになるのか

### 1.1 アーキテクチャの構図

伝統的な RL（Stable-Baselines3、古典的 A3C / IMPALA、GA3C など）は次の構図を取る。

```
  ┌─────────── CPU (host) ───────────┐        ┌──── GPU (device) ────┐
  │  環境 step（物理/ゲームロジック）  │        │  ポリシー NN forward  │
  │  obs を numpy で生成              │  PCIe  │  （行動の推論）        │
  │     │ obs をデバイスへコピー ───────────►  │     │                 │
  │     │                          │ ◄─────────── action をホストへ   │
  │  action を環境へ適用 ◄───────────┘  PCIe  │  学習（backward）     │
  └──────────────────────────────────┘        └──────────────────────┘
         ↑ ここが毎ステップ直列に往復する ↑
```

問題は、**1 ステップごとに `obs` を CPU→GPU、`action` を GPU→CPU と往復させる**点にある。この往復が同期的に行われると、パイプライン全体が直列化する。

### 1.2 host-device 転送と「GPU が遊ぶ」現象 — 最も具体的な定量証拠

GA3C 論文（Babaeizadeh et al. 2017）は、この往復オーバーヘッドを最も明確に数値化している。

- エージェントが推論呼び出しの完了を待つ平均時間は **108ms。そのうち実際の GPU 推論はわずか 10%**。
  - 原文: *"the average time spent by an agent waiting for a prediction call to be completed is 108ms, only 10% of which is taken by the GPU inference. The remaining 90% is overhead spent accumulating the batch and calling the prediction function in Python."*
- 学習側でも DNN 更新 1 回あたり平均 11.1ms のうち **59% がオーバーヘッド**。
- 最速構成でも **GPU 稼働率は平均 56%** にとどまる。
- 出典: https://ar5iv.labs.arxiv.org/html/1611.06256

つまり「ポリシーは GPU、環境は CPU」という素朴な構成では、GPU の演算時間は全体のごく一部で、**残りはバッチ蓄積・Python 呼び出し・host-device 転送に費やされ、GPU が CPU の env step を待って遊ぶ**。これが低 GPU 稼働の正体である。

### 1.3 同期 RL の構造的非効率（Sample Factory による批判）

Sample Factory（Petrenko et al. 2020）は、この同期構造の非効率を明示的に批判している。

- 原文: *"The sampling process has to halt when the actions for the next step are being calculated, and during the backpropagation step. This leads to a significant under-utilization of system resources during training."*
- GA3C 系の通信コストについて: *"high communication cost between CPU actors and GPU predictors prevents the algorithm from reaching optimal performance"*
- 解決策（非同期化 + double-buffered sampling）: 学習と経験収集を分離し *"new environment transitions can be collected during the backpropagation step"*、これにより *"we can completely mask the communication overhead and ensure full utilization of the CPU cores during sampling"*。
- Sample Factory は VizDoom で **146,551 FPS**、Atari Breakout で **135,893 FPS**、ヘッドラインで **>10^5 FPS**（2× Xeon Gold 6154 36 コア + RTX 2080 Ti）。
- 出典: https://ar5iv.labs.arxiv.org/html/2006.11751

### 1.4 actor-learner 同期コスト（IMPALA の policy-lag と V-trace）

IMPALA（Espeholt et al. 2018）は actor（経験収集）と learner（勾配計算）を分離してスループットを上げたが、その代償として **policy-lag**（actor のポリシー μ が learner のポリシー π より数更新ぶん古い）が生じる。

- 原文: *"the learner policy π is potentially several updates ahead of the actor's policy μ at the time of update, therefore there is a policy-lag between the actors and learner(s)"*
- これにより学習がオフポリシー化する: *"because the policy used to generate a trajectory can lag behind the policy on the learner ... learning becomes off-policy"*
- これを補正するのが **V-trace**: *"V-trace corrects for this lag to achieve extremely high data throughput while maintaining data efficiency"*
- IMPALA スループット: **250,000 frames/sec（= 21 billion frames/day）**（375 CPUs + 1 GPU、batch size 128）。シングルマシンでは 17K–21K FPS（48 CPUs）。分散 A3C は 200 CPUs で 46K–50K FPS。
- 出典: https://ar5iv.labs.arxiv.org/html/1802.01561

つまり「actor-learner を分離してスループットを稼ぐ」設計は、本質的に **古いポリシーで集めたデータで学習する（off-policy 化）** という代償を伴い、補正なしでは sample efficiency が落ちる。これは後述の第 8 章の伏線である。

### 1.5 なぜ ~10k–100k FPS で頭打ちか（数値の整合）

| システム | スループット | ハードウェア |
|---------|-------------|-------------|
| 分散 A3C | 46K–50K FPS | 200 CPUs, 0 GPU |
| IMPALA（シングルマシン） | 17K–21K FPS | 48 CPUs, ±GPU |
| IMPALA（分散） | 80K–250K FPS | 150–375 CPUs, 1 GPU |
| EnvPool 比較用 Python subprocess | Atari 72K / MuJoCo 164K FPS | DGX-A100, 256 コア |
| Sample Factory | >100K FPS | 36 コア + 2080 Ti |

CPU シミュレータ方式では、スループットは概ね 10k–100k FPS のレンジで頭打ちになり、それを超えるには Sample Factory のような非同期化・通信マスキングや、大量の CPU コア（数百）を要する。「10k–100k」という単一フレーズの逐語出典は存在しないが、上記の複数論文の実測値を横断すると、この帯域が CPU シミュレータ方式の実効上限であることが裏付けられる。

> 補足（Python subprocess がボトルネック）: EnvPool 論文は同一の DGX-A100（256 コア）上で、Python multiprocessing による subprocess env が Atari 72K / MuJoCo 164K FPS にとどまるのに対し、C++ スレッドプール実装の EnvPool が **Atari 約 1,000,000 FPS / MuJoCo 約 3,000,000 FPS（14.9× / 19.2× 改善）** を達成すると報告。*"parallel environment execution, which is often the slowest part of the whole system but receives little attention."* 出典: https://ar5iv.labs.arxiv.org/html/2206.10558

---

## 2. 「すべてをアクセラレータ上で」パラダイム — 100–1000x の源泉

### 2.1 アイデア

第 1 章のボトルネックは「環境が CPU 上にあり、毎ステップ host-device を往復する」ことに帰着する。ならば **環境そのものを GPU/TPU 上で実装し、ロールアウト〜学習のループ全体をデバイス上に閉じ込めれば、host 転送は原理的に消える**。これが JAX 系（Brax / gymnax / PureJaxRL）、Isaac Gym / Isaac Lab、Madrona の発想である。

```
  ┌──────────────────── GPU / TPU (device) ────────────────────┐
  │  環境 step ─► obs（テンソル）─► ポリシー NN ─► action ─►       │
  │     ▲                                                  │     │
  │     └──────────────────────────────────────────────────┘     │
  │  ループ全体がデバイス上に閉じる。host への往復は無い。          │
  └────────────────────────────────────────────────────────────┘
```

Isaac Gym 論文は、従来方式の非効率と解決策を明確に対比している。

- 従来方式の非効率: *"switching back and forth between CPU cores ... and GPUs ... is by nature inefficient, requiring data to be transferred between different parts of the system at multiple points during the training process"*
- 解決策（オンデバイス保持）: *"Isaac Gym eliminates those inefficiencies by keeping all of the computations on the GPU. Stepping physics, computing observations and rewards, and applying actions are performed on the GPU without ever copying large quantities of data between devices."*
- 観測テンソルは直接ポリシー入力に: *"Observation tensors can be used as inputs to a policy network and the resulting action tensors can be directly fed back into the physics system."*
- 出典: https://ar5iv.labs.arxiv.org/html/2108.10470

### 2.2 検証済みの高速化数値（ベースライン条件を必ず明記）

> 重要: 「1000x」「4000x」のような大きな倍率は、ほぼ常に「1 GPU vs 少数 CPU コア」または「並列度の違い」を比較している。倍率はベースライン条件に決定的に依存するため、以下では条件を必ず併記する。

| 出典 | 倍率 | ベースライン / ハードウェア |
|------|------|---------------------------|
| **Brax**（arXiv:2106.13281） | **100–1000x**（速度/コスト改善） | ベースライン明示せず（論文の中核主張）。Ant で「十秒オーダー」vs 標準 PPO「30 分弱」（≈180x）が定量裏付け。著者自身が *"it probably isn't fair to compare"* と注記（8x8 TPU vs 1 CPU コア） |
| **Isaac Gym**（arXiv:2108.10470） | **2–3 桁（100–1000x）** | ベースライン = CPU シミュレータ + GPU NN の従来構成。単一 A100 で 4096–16384 並列環境。Shadow Hand を 1 時間未満（OpenAI Dactyl は **6144 CPU コア + 8 V100 クラスタで 30 時間**） |
| **Madrona**（SIGGRAPH 2023） | **2–3 桁**（OSS CPU 比）/ **5–33x**（32 スレッド CPU の強力なベースライン比） | RTX 4090。32,000 並列環境。Hide&Seek 約 200 万 steps/sec、Overcooked 4000 万 steps/sec |
| **PureJaxRL**（Chris Lu） | **10x**（純粋な単一エージェント、追加並列なし）/ **1000x**（sim のみ）/ **4000x**（複数 run をベクトル化） | A100。詳細は第 8 章 |

最も公正な比較は **Madrona の「32 スレッド CPU 比で 5–33x」** と **Isaac Gym の「1 A100 vs 6144 CPU コア + 8 V100 クラスタで OpenAI Dactyl と同等以上」**。これらはハードウェア条件を明示しており信頼できる。

- 出典: https://arxiv.org/abs/2106.13281 / https://ar5iv.labs.arxiv.org/html/2108.10470 / https://madrona-engine.github.io/ / https://chrislu.page/blog/meta-disco/

### 2.3 なぜこれほど速くなるのか（メカニズムの分解）

速度向上は単一の効果ではなく、4 つの独立した効果の積である。

1. **host-device 転送の消滅**（第 1 章の 90% オーバーヘッドが消える）
2. **大規模ベクトル化**（数千環境を 1 テンソルで → 第 3 章）
3. **JIT 融合**（ループ全体を 1 カーネルに → 第 4 章）
4. **GPU の生の演算スループット**（CPU コアより桁違いに多い ALU）

「1000x」は主にこの (1)+(2) の合わせ技であり、純粋な (3)+(4) による単一エージェント高速化は PureJaxRL の実測で **約 10x** にとどまる（第 8 章で詳述）。

---

## 3. ベクトル化 / バッチ化環境 — なぜ GPU に完璧にマップするのか

### 3.1 SIMT への対応

GPU は SIMT（Single Instruction, Multiple Threads）アーキテクチャで、多数のコアが**同一命令をデータの異なる要素に対して並列実行**する。N 個の環境コピーを「先頭にバッチ次元 N を持つ単一テンソル `(N, ...)`」として保持し、環境 step・観測計算・ポリシー forward をこのバッチ次元全体に対して一括適用すると、これが GPU の data-parallel 実行に直接マップする。

- Isaac Gym: 全並列環境を 1 つの大きな物理シーンに展開し、観測・報酬・状態をすべて `(num_envs, dim)` 形状の GPU テンソルとして保持。**単一 GPU で数万環境を同時実行**。
- Gymnasium のベクトル環境セマンティクスも同型: rewards/terminations は `(num_envs,)`、観測は `(num_envs, obs_dim)` にバッチ化。
- 出典: https://ar5iv.labs.arxiv.org/html/2108.10470 / https://gymnasium.farama.org/api/vector/

### 3.2 CPU マルチプロセス並列との本質的な差

CPU 側の「並列化」（Python `multiprocessing` / gym `SubprocVecEnv` / Gymnasium `AsyncVectorEnv`）は、GPU ベクトル化とは原理が異なる。

```
  CPU subprocess 方式:
    主プロセス ──pipe──► worker proc 1 (env)   ← obs を pickle してIPC
              ──pipe──► worker proc 2 (env)   ← プロセス境界ごとにシリアライズ
              ──pipe──► worker proc N (env)   ← context switch コスト

  GPU ベクトル化方式:
    obs は最初から 1 個のデバイステンソル。プロセス境界もシリアライズも無い。
```

- Gymnasium `AsyncVectorEnv`: *"It uses `multiprocessing` processes, and pipes for communication."* 観測が大きい場合は共有メモリで通信（*"This can improve the efficiency if the observations are large (e.g. images)"*）—— 裏を返せば、観測がプロセス境界をまたぐ通信コストが効くということ。出典: https://gymnasium.farama.org/api/vector/async_vector_env/
- SB3 VecEnv ドキュメント: `SubprocVecEnv` は環境が計算的に重いときだけ高速化に寄与し、軽い環境では *"the overhead of multiprocess or multithread outweighs the environment computation time"*（マルチプロセス化が逆効果）。出典: https://stable-baselines3.readthedocs.io/en/master/guide/vec_envs.html
- EnvPool: Python multiprocessing は *"computationally inefficient compared to using a C++-level thread pool"*、Subprocess 実装は *"extremely poor scalability with an almost flat curve"*。出典: https://ar5iv.labs.arxiv.org/html/2206.10558

CPU subprocess のオーバーヘッドの内訳は、(a) プロセス境界をまたぐ観測の pickle/シリアライズ、(b) pipe を介した IPC、(c) GIL によるスレッド並列の制約、(d) context switching。GPU ネイティブ方式は、データが最初からデバイス上の単一テンソルであるため、**これらが原理的にゼロ**になる。

> 検証フラグ: 「GIL」「pickle」という語そのものの逐語引用は EnvPool 本文では取得できなかった（本文は "context switching"・"computationally inefficient"・"flat scalability" という表現）。GIL/pickle/IPC という具体名は SB3・Gymnasium ドキュメント（multiprocessing + pipes + serialization）側で裏付けられる。

---

## 4. JIT コンパイルと XLA — ロールアウト全体を 1 カーネルに融合する

### 4.1 問題: op 単位ディスパッチのオーバーヘッド

JAX を JIT せずに実行すると、各演算が個別にアクセラレータへ送られる。JAX 公式ドキュメントの表現では *"sending one operation at a time to the accelerator. This limits the ability of the XLA compiler to optimize our functions."* 小さな演算が多数あると、**演算ごとの Python ディスパッチ + カーネル起動コスト**が支配的になり、GPU の演算ユニットが起動の合間に遊ぶ。

`jax.jit` は *"give the XLA compiler as much code as possible, so it can fully optimize it"*。同ドキュメントの実測では、非 JIT `2.04 ms` → JIT `284 μs`（約 7 倍）。出典: https://docs.jax.dev/en/latest/jit-compilation.html

### 4.2 `lax.scan`: ロールアウトループを単一 `WhileOp` に

ロールアウト（T ステップの環境×ポリシーの繰り返し）を `jax.lax.scan` で書くと、ループ本体が **1 回だけトレース**され、単一の `WhileOp` にロワリングされる。

- *"Scan a function over leading array axes while carrying along state."*
- *"scan() is a JAX primitive and is lowered to a single WhileOp."*
- 素朴な Python `for` ループとの違い: *"native Python loop constructs in a jit() function are unrolled, leading to large XLA computations"* —— Python ループはアンロールされて巨大な XLA グラフになりコンパイルが遅くなるが、`lax.scan` はこれを回避する。
- 出典: https://docs.jax.dev/en/latest/_autosummary/jax.lax.scan.html

結果として、`jit` 配下で `lax.scan` でロールアウトを書くと、**T ステップのロールアウト全体が単一の XLA コンパイル単位に融合**され、毎ステップの Python インタプリタ復帰と小演算ごとのカーネル起動が消える。

### 4.3 演算融合（operator fusion）— なぜメモリ帯域を削減するのか

XLA の最重要最適化が **fusion**。OpenXLA 公式ドキュメントの表現:

- *"Fusion is XLA's single most important optimization, which groups multiple operations (e.g. addition into exponentiation into matmul) to a single kernel."*
- *"No intermediate storage inside the fusion is materialized in HBM (it has to be all passed through either registers or shared memory)."*
- 帯域削減の理由: *"avoiding the writing of intermediate tensors to HBM and then reading them back, and instead passes them around in either registers or shared memory."*
- *"A fusion is always compiled to exactly one GPU kernel."*
- 出典: https://openxla.org/xla/gpu_architecture

```
  融合なし:  op1 ─► HBM ─► op2 ─► HBM ─► op3 ─► HBM   （中間結果が HBM を往復）
  融合あり:  op1 → op2 → op3                          （中間結果はレジスタ/SRAM に留まる）
            └── 単一カーネル、HBM 往復ゼロ ──┘
```

多くの RL 演算（要素ごとの報酬計算・advantage 計算・活性化）はメモリ帯域律速の小演算であり、融合により HBM 往復が消えることが効く。補強として "Operator Fusion in XLA" 論文（arXiv:2301.13062）は、concat 除去でレジスタ局所性を得て **3.41x**、ループアンロールでカーネル数を 10 分の 1 にして **3.5x**、memory unit stall が **5x 減**などを実測。出典: https://ar5iv.labs.arxiv.org/html/2301.13062

### 4.4 `vmap`: 自動ベクトル化

`jax.vmap` は単一サンプル用に書いた関数を、手書きのバッチ版と同等効率のベクトル化コードへ**自動変換**する。

- *"the jax.vmap() transformation is designed to generate such a vectorized implementation of a function automatically"*
- 機構: *"It does this by tracing the function similarly to jax.jit(), and automatically adding batch axes at the beginning of each input."*
- 出典: https://docs.jax.dev/en/latest/automatic-vectorization.html

これにより、単一環境/単一エージェント用に書いたロジックを `vmap` するだけで N 環境・N エージェントへ並列展開できる（第 3 章のバッチ化と第 5 章の Anakin の基盤）。

> 検証フラグ: 「vmap で N 環境/N エージェントを並列化する」という明示的な結び付けは JAX 公式ページ本文には直接の記述がなく、機構からの妥当な推論。Brax 論文・Podracer 論文では vmap による環境並列化が逐語的に記述されている（第 5 章参照）。

---

## 5. Anakin vs Sebulba — アクセラレータへの 2 つの配置戦略

DeepMind の Podracer 論文（Hessel et al. 2021, arXiv:2104.06272）は、RL をアクセラレータ（特に TPU pod）に載せる 2 つのアーキテクチャを定義する。両者の決め手は **「環境がどこで動くか」** の一点に尽きる。

### 5.1 Anakin — すべてをアクセラレータ上で

環境 + 行動選択 + 学習の**全体をアクセラレータ上で完結**させる。

- *"environment ..., action selection ... and learning ... are all executed on the accelerators"* / *"the computation is replicated across all available cores"*
- 前提: *"All the environments must be written in JAX"*（環境が JAX で書けること）
- JAX の使い方: *"first vmapped to vectorise the computation across a batch large enough to ensure good utilisation of an entire TPU core, then the vectorized function is distributed across the 8 cores of a TPU, by using the pmap primitive"*。パラメータ更新は `psum`/`pmean` でコア間平均。
- 学習中の host-device 通信はゼロ。これが PureJaxRL / Stoix の「everything on GPU」系の基盤。
- ベンチマーク: grid-world + 小 NN で **8-core TPU（Colab 無料枠）555 million steps/sec**、16-core TPU で 333M steps/sec。

**いつ使うか**: オンデバイス化・ベクトル化可能な小〜単純環境を、多数並列で回す場合。

### 5.2 Sebulba — 環境だけ CPU ホスト、推論と学習はアクセラレータ

actor-learner 分離型。**行動選択（推論）と学習は TPU コア、環境は CPU ホスト**で動く。

- *"the environment computation ... happens on the CPU host"* / acting と learning は *"distributed across disjoint subsets of the available TPU cores"*
- 1 ホストの 8 TPU コアを *"A actor cores and L = 8 − A learner cores"* に分割。
- Anakin との関係: Sebulba は *"relaxes Anakin's assumption that environments can be compiled to run on TPU. Instead, it supports arbitrary environments."*
- バッチ推論 + パイプライン: 各 Python スレッドが環境バッチを step し *"feeds the resulting batch of observations to a TPU core, to perform inference in batch"*。
- ベンチマーク: Atari 200M frames を **8-core TPU で約 1 時間（約 $2.88）**。V-trace で 200K FPS（batch 128、IMPALA を再現）。**2048 TPU コア（フルポッド）で 43M FPS、Pong を 1 分未満で解く**。MuZero は 16-core TPU で 9 時間。

**いつ使うか**: JIT 化できない / CPU で動かすしかない複雑なシミュレータ（Atari、外部ゲームエンジン等）を、それでもバッチ推論 + パイプライン化で高スループットに回したい場合。

### 5.3 一言でまとめ

| 観点 | Anakin | Sebulba |
|------|--------|---------|
| 環境の実行場所 | **アクセラレータ上（JAX 必須）** | **CPU ホスト（任意フレームワークの環境可）** |
| アクセラレータ利用 | 全コアに計算を複製（pmap/vmap） | コアを actor 群と learner 群に分割 |
| host-device 通信 | 学習中なし | env step ごとに発生 |
| 適用対象 | オンデバイス化可能な小〜単純環境 | JIT 化不可・複雑なシミュレータ（Atari 等） |

- 出典: https://ar5iv.labs.arxiv.org/html/2104.06272
- 実装による裏付け: Stoix（Anakin/Sebulba 両対応） https://github.com/EdanToledo/Stoix / cleanba（Sebulba 実装、monobeast IMPALA の 6.8x） https://github.com/vwxyzjn/cleanba / InstaDeep TPU 実例（TPUv4-128 で 3.43M FPS） https://instadeep.com/2023/10/reinforcement-learning-on-google-cloud-tpus-to-improve-deeppcb/

> 検証フラグ: arXiv abstract HTML には "Anakin"/"Sebulba" の語が現れず、名称・コア分割・数値は ar5iv 全文 HTML と実装 README で裏付けた。二次まとめ（SyncedReview）は Anakin を "5 million steps/sec" と記載するが、**一次資料（ar5iv 全文）の正値は 555 million steps/sec**。本レポートは一次資料の値を採用。

---

## 6. ハードウェア固有の論点

### 6.1 single GPU vs multi-GPU（データ並列）

- `jax.pmap` は SPMD プログラムを *"execute it in parallel on XLA devices, such as multiple GPUs or multiple TPU cores"*。バッチを各デバイスにシャードし、各レプリカが同一プログラムを実行。出典: https://docs.jax.dev/en/latest/_autosummary/jax.pmap.html
- 勾配の **all-reduce**: 各デバイスがローカル勾配を計算 → `jax.lax.pmean`（*"Compute an all-reduce mean on x over the pmapped axis"*）でデバイス間平均 → 同期 SGD 更新。出典: https://docs.jax.dev/en/latest/_autosummary/jax.lax.pmean.html
- 新 API では `jax.Array` のシャーディング（`NamedSharding` = `Mesh` + `PartitionSpec`）を使い、*"the compiler inserts communication operations as needed"*（コンパイラが通信を自動挿入）。`pmap` は現在 `jit` + `shard_map` で実装されレガシー寄り。出典: https://docs.jax.dev/en/latest/parallel.html

### 6.2 TPU pod（Sebulba のマッピング）

TPU pod は *"multiple TPU devices connected to each other by extremely low latency communication channels"*。Sebulba は 1 台の 8 コアを actor/learner に分割し co-locate、pod 全体ではレプリケーションで拡張し、全レプリカの全 learner コアにわたる all-reduce で勾配同期。InstaDeep の実測では線形スケーリング係数 0.995（単機 300K FPS @TPUv4 → TPUv4-128 で 3.43M FPS）。出典: https://arxiv.org/abs/2104.06272 / https://github.com/instadeepai/sebulba

### 6.3 GPU メモリ（HBM）= 律速制約 — batch size と並列 env 数のトレードオフ

並列環境数を増やすほど、観測・状態・ロールアウトバッファの保持に HBM を消費する。**より多くの env = より多くのメモリ**であり、これがスケーリングの上限を決める。観測が大きい（高解像度画像など）ほど顕著。

> 重要な honesty フラグ（最優先）: 一次論文（Isaac Gym / Brax / PureJaxRL）は「HBM が律速」「並列 env 数とバッチサイズのメモリトレードオフ」を**明示していない**。むしろ Brax は *"we can still easily parallelize over all collision primitives in a scene without straining modern accelerator memory buffers"* と逆のニュアンス。メカニズム自体は技術的に正しく実運用の OOM 報告で裏付けられるが、「メモリ律速」を一次研究の主張として引くのは不正確。**「env 数スケール実績」は論文を、「メモリ律速トレードオフ」はフォーラム/issue を根拠に引くべき**。

- 実証的裏付け（OOM 報告）: NVIDIA フォーラムは *"You can reduce the number of environments ... using the --num_envs NUM_ENVS argument. This will reduce the memory allocated."* 出典: https://forums.developer.nvidia.com/t/gym-cuda-error-running-out-of-memory/193568 / https://github.com/isaac-sim/IsaacLab/issues/462
- Isaac Lab（画像観測のメモリ上限）: *"Tiled rendering ... require heavy memory resources, especially at larger resolutions ... We recommend running 512 cameras in the scene on RTX 4090 GPUs."* 出典: https://isaac-sim.github.io/IsaacLab/main/source/overview/core-concepts/sensors/camera.html

### 6.4 混合精度（bf16 / fp16）

- 速度・メモリ: NVIDIA は *"up to 3x overall speedup on the most arithmetically intense model architectures"*、Tensor Core が *"8x more throughput than single precision"*、*"Lowering the required memory enables training of larger models or ... larger mini-batches."* 「ちょうど 2 倍」より「最大 3 倍、典型的には 2 倍前後 + メモリ半減」が正確。出典: https://docs.nvidia.com/deeplearning/performance/mixed-precision-training/index.html
- **bf16 vs fp16 の数値特性**: bf16 は 1 符号/8 指数/7 仮数で *"the dynamic range of bfloat16 is identical to that of FP32"*、*"BF16 comes close to being a drop-in replacement for FP32 ... no loss scaling required."* 一方 fp16 は指数 5bit でレンジが狭く、PyTorch は *"Gradient values with small magnitudes may not be representable in float16 ... 'gradient scaling' multiplies the loss by a scale factor."* 出典: https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus / https://docs.pytorch.org/docs/stable/amp.html
- 注: Tensor Core の高速化は NN の matmul/conv に効く。物理シミュレーション本体に効くとは限らない（論理的含意であり一次資料の明示文ではない）。

### 6.5 CUDA graphs（PyTorch）— XLA fusion と同じ根本原因への対処

- メカニズム: *"a replay submits the entire graph's work to the GPU with a single call to cudaGraphLaunch ... eliding CPU overhead is the main benefit"* / *"a graph replay skips all layers of argument setup and kernel dispatch, including Python, C++, and CUDA driver overheads."*
- なぜ小カーネルで効くか（XLA fusion と同根）: *"at small batch sizes CPU overhead can become larger than GPU run time. When that happens, GPUs go idle between kernel calls."*
- 出典: https://pytorch.org/blog/accelerating-pytorch-with-cuda-graphs/ / https://docs.pytorch.org/docs/stable/notes/cuda.html
- RL での利用: tensordict `CudaGraphModule`（TorchRL 基盤）、LeanRL（CleanRL の Meta/PyTorch フォーク）が torch.compile + cudagraphs で PPO(Atari) **6.8x** / SAC 5.7x / TD3 3.4x。出典: https://github.com/meta-pytorch/LeanRL

これは JAX の XLA fusion と**同じ問題（多数の小カーネルが起動オーバーヘッドに支配される）への、PyTorch 側の対処**である。JAX が「コンパイル時に融合」するのに対し、CUDA graphs は「実行グラフを捕捉して再生」する。

---

## 7. GPU アクセラレーションが効かない / 限界（公平かつ正直に）

> 原則: 以下はいずれも「常に無効」ではなく「効かない / 恩恵が限定されるケース」である。

### 7.1 分岐の多い / 制御フローが複雑な環境

- **warp divergence**: NVIDIA は *"A warp executes one common instruction at a time, so full efficiency is realized when all 32 threads of a warp agree on their execution path"* / *"If threads of a warp diverge via a data-dependent conditional branch, the warp executes each branch path taken, disabling threads that are not on that path."* データ依存の分岐が多いと、各分岐パスが直列実行され効率が落ちる。出典: https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/advanced-kernel-programming.html
- **JAX/XLA の静的形状制約**: Python 制御フローは JIT コンパイル時に評価され *"the compiled function represents a single path through the control flow graph"*。値依存分岐は既定では JIT 不可（`lax.cond`/`lax.scan` が必要）。可変長エピソードは *"the shape cannot depend on values within other arrays"* のためパディング/マスクが必要。出典: https://docs.jax.dev/en/latest/control-flow.html
- バランス注記: 発散は warp 局所であり、データを規則的にまとめれば緩和できる。「GPU/JAX が分岐を扱えない」のではなく「データ依存の発散的分岐・可変形状が性能と記述コストを生む」という限界。

### 7.2 外部エンジン / ゲームサーバ依存（GPU 移植不可）

- **StarCraft II / PySC2**: 実ゲームバイナリに依存（*"PySC2 depends on the full StarCraft II game"*）し、GPU テンソル演算に再実装できない。出典: https://arxiv.org/abs/1708.04782
- **OpenAI Five（Dota 2）**: ゲームステップは GPU 外。*"'Rollout' worker machines run self-play games on CPUs"* とし、CPU アクターを大量（Rerun 構成で 51,200 rollout CPU + 512 optimizer GPU + 512 forward-pass GPU）に並べてスケール。出典: https://ar5iv.labs.arxiv.org/html/1912.06680
- このクラスの環境では、Sebulba 型（環境は CPU、推論/学習はアクセラレータ）が現実解となる。

### 7.3 巨大観測空間（高解像度画像）

- データ転送がボトルネック化: Sample Factory は *"At full throttle, Sample Factory generates and consumes more than 1 GB of data per second, and even the fastest serialization/deserialization mechanism would severely hinder throughput"* とし、GPU 上のメモリ共有で回避。出典: https://arxiv.org/abs/2006.11751
- メモリ上限: Isaac Lab は高解像度カメラで RTX 4090 あたり 512 カメラ推奨（6.3 節参照）。

### 7.4 デバッグの困難さ

- `print` が効かない: *"print won't work with jax.jit or jax.pmap because those transformations delay numerical evaluation"*（`jax.debug.print` / `breakpoint` が必要）。出典: https://docs.jax.dev/en/latest/debugging/print_breakpoint.html
- 非同期ディスパッチ: *"JAX does not wait for the operation to complete before returning control"* / *"allows Python code to 'run ahead' of an accelerator device"*。正確な計測には `block_until_ready()`。出典: https://docs.jax.dev/en/latest/async_dispatch.html
- 関数的制約: *"JAX requires that programs are pure functions"*、配列は不変（`x[idx] = y` 不可、`x.at[idx].set(y)` を使う）、静的形状要求。出典: https://docs.jax.dev/en/latest/notebooks/Common_Gotchas_in_JAX.html

### 7.5 数値精度・シミュレーション忠実度

- fp64 が遅い: NVIDIA Ampere GA102（コンシューマ GPU）では *"The FP64 TFLOP rate is 1/64th the TFLOP rate of FP32 operations."* 高精度物理が必要なら GPU の旨味が削がれる。出典: https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf
- 非決定性・再現性: PyTorch は *"Results may not be reproducible between CPU and GPU executions, even when using identical seeds"* / *"atomicAdd ... can lead to the order of additions being nondeterministic"*（浮動小数加算の非結合性）。出典: https://pytorch.org/docs/stable/notes/randomness.html
- sim-to-real ギャップ: Isaac Gym は GPU 常駐で高速だが、TriFinger 実機の mean success rate は 55%、Shadow Hand では sim-to-real を試みていない。GPU 物理の高速化と実世界忠実度は別問題。出典: https://ar5iv.labs.arxiv.org/html/2108.10470

> 検証フラグ: 「非同期ディスパッチでエラーが紛らわしい位置に出る」「Tensor Core が物理に効きにくい」「Isaac Gym が fp32 使用・GPU/CPU 物理の sim-to-sim ギャップ」は、いずれも妥当な論理的含意だが一次資料の明示文ではない。

---

## 8. スループットの算数 — steps/sec ≠ 収束までの実時間（最重要・見落とされやすい）

これが本レポートで最も重要な論点である。**1000x の sim 高速化が、必ずしも 1000x 速い学習を意味しない。**

### 8.1 基本式

報酬の成長速度は、直交する 2 つの量の積に分解できる。

```
  収束までの実時間 ⁻¹ ∝  learning throughput (steps/sec)  ×  learning effectiveness (1 step あたりの学習効果)
                          └──── FPS が測るのはこちらだけ ───┘    └─ sample efficiency。FPS は測らない ─┘
```

FPS（steps/sec）は throughput のみを測る指標で、sample efficiency を測らない。throughput を 1000x にしても、その代償に sample efficiency が落ちれば、実時間の改善は 1000x より小さくなる。

### 8.2 PureJaxRL の「4000x」の正体（内訳の分解）

Chris Lu のブログは、よく引用される「4000x」が単一の効果ではないことを明示している（すべて逐語確認済み）。

- **純粋な sim のみ**: *"CartPole-v1 in numpy, with 10 environments ... takes 46 seconds to reach one million frames. Using Gymnax on an A100, with 2k environments in parallel takes 0.05 seconds. That's a 1000x speedup."* —— ただし **並列環境数が 200 倍違う**（10 vs 2000）。
- **学習込み・単一エージェント（追加並列なし）**: *"It's over 10x faster without any extra parallel environments."* —— これが「真の」単一エージェント高速化。
- **4000x の正体**: *"4000x when multiple training runs are vectorized."* —— つまり **複数の seed/ハイパラ run を vmap で同時実行**したスループット倍率であり、1 つのポリシーの収束を 4000 倍速くするという意味ではない。
- 出典: https://chrislu.page/blog/meta-disco/

したがって「4000x 速い」は、(a) 単一ポリシーの収束高速化（≈10x）、(b) 並列環境による sim 高速化（≈1000x）、(c) 複数 run の同時実行（≈4000x）という**全く異なる 3 つの主張**を 1 つの見出しに圧縮したものである。

### 8.3 大バッチ（多数並列環境）が sample efficiency を害する

並列環境を増やすとミニバッチが巨大化し、計算スループットは上がるが sample efficiency は naive には悪化しうる。

- **Large Batch Simulation**（arXiv:2103.07013）: 大ミニバッチで sample efficiency を維持するには**学習アルゴリズム自体の修正が必要**だったと明言。*"modify training algorithms to maintain sample efficiency when training with large mini-batches."* 何もしなければ大バッチは sample efficiency を落とす。さらに sim を 2 桁高速化した結果、**ボトルネックが DNN 推論/学習側に移り**、計算効率の良い policy DNN を別途設計する必要があった（sim-bound → learner-bound 遷移の実例）。出典: https://arxiv.org/abs/2103.07013
- **Staggered Resets**（arXiv:2511.21011）: 多数の同期リセット環境では *"while data throughput rises, learning efficiency diminishes due to temporally homogeneous [data] from many synchronously reset environments."* 全環境が同時リセットされるため各勾配更新のバッチがエピソードの特定フェーズに偏り、勾配のバイアス/分散が悪化。定量: StackCube-v1 では naive PPO が **N≈1024 環境付近で wall-clock 収束が飽和**、それ以上で劣化。*"Beyond a threshold, additional environments may not reduce wall-clock time and may even hurt performance due to higher gradient variance."* 出典: https://arxiv.org/html/2511.21011
- **37 PPO 実装詳細**（ICLR Blog 2022）: num_envs（N）増加でスループットは上がるが、N が大きすぎると *"shortened experience chunks"* と *"earlier value bootstrapping"* により性能が悪化。著者は「N 増加が sample efficiency を害しうることには同意するが、**評価は wall-clock time efficiency で行うべき**」と論じる。出典: https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
- **EnvPool**: 「同一構成（num_envs × batch_size を一定）を保てば sample efficiency は犠牲にならない（pure speedup）」が、保守的でない設定で num_envs を上げると *"a drop in sample efficiency is observed."* 出典: https://ar5iv.labs.arxiv.org/html/2206.10558

### 8.4 sim-bound vs learner-bound レジーム

| レジーム | 状況 | GPU sim 高速化の効果 |
|---------|------|---------------------|
| **sim-bound** | 環境 step が支配的（ポリシー NN が小さく sim が重い） | **near-linear に効く**（CPU 比 100–1000x） |
| **learner-bound** | ポリシー/価値 NN の forward+backward が支配的（大 CNN/Transformer） | **sim を速くしてもほぼ無意味**（learner が compute-bound） |

第 1 章の IMPALA policy-lag、第 8.3 の Large Batch Simulation の「sim 高速化で learner にボトルネックが移った」事例が、この遷移の実証である。**巨大ネットワークを使う設定では、sim をいくら GPU 化しても学習の forward/backward が律速するため、全体の実時間はほとんど縮まない。**

### 8.5 Amdahl の法則 — 非ベクトル化部分が上限を決める

Amdahl の法則により、タスクのうち**直列実行される割合**が speedup の理論上限を決める。*"the overall performance increase due to vectorization is always less than the theoretical speedup ... the speedup curve tends to flatten out as the vector width is increased."*（出典: https://cvw.cac.cornell.edu/vector/performance/performance-amdahl）

RL では、ロギング・評価（evaluation）・チェックポイント・CPU 側の env step・ホスト同期といった**ベクトル化できないホスト側処理**が、sim をいくら速くしても全体 speedup を律速する。PureJaxRL が価値を持つ理由も、まさにこの直列部分（CPU-GPU 転送・Python オーバーヘッド）を排除した点にある（*"By keeping the computation entirely on the GPU, we avoid the overhead of copying data back and forth between the CPU and GPU"* / *"By JIT compiling ... we avoid the overhead of Python"*、出典: https://chrislu.page/blog/meta-disco/）。

### 8.6 結論（本章の核心）

**FPS（steps/sec）は計算スループットの指標に過ぎず、収束までの実時間は throughput × sample-efficiency の合成量である。** GPU sim 高速化が near-linear に効くのは sim-bound レジームのみで、実時間の speedup は次の 3 つに律速される。

1. **learner-bound 化**: 大ネットワークでは sim を速くしても効かない
2. **大バッチによる sample efficiency 劣化**: temporally homogeneous batch / early bootstrapping / large-batch generalization gap。多くの場合**同じポリシー品質に到達するのにより多くの総環境ステップが必要**になる
3. **Amdahl 的ホスト側直列部分**: ロギング・評価・チェックポイントなど

> 検証フラグ: sim-bound/learner-bound の二次解説（APXML）は WebFetch 403 で逐語未取得（趣旨は Large Batch Simulation 論文で代替）。EnvPool 要約に現れた *"high throughput alone does not guarantee faster wall-clock training time to convergence"* は論文本文で逐語確認できておらず、本レポートでは使用していない（趣旨は 37-details ブログと Staggered Resets 論文で裏付け）。

---

## 検証フラグ一覧（要約）

| 項目 | 状態 |
|------|------|
| PureJaxRL「4000x」 | 実在するが合成的スループット指標。単一エージェント値は ~10x、sim のみ ~1000x（並列数 200 倍差） |
| Brax「100–1000x」 | ベースライン未明示。論文内の定量裏付けは Ant の ≈180x。著者自身が「フェアでない比較」と注記 |
| 「10k–100k FPS で頭打ち」 | 単一フレーズの逐語出典なし。複数論文（IMPALA/A3C/Sample Factory/EnvPool）の実測の横断的整合 |
| HBM 律速トレードオフ | 一次論文は明示せず。env 数スケールは論文、メモリ律速は OOM フォーラム/issue を根拠に |
| 混合精度「2x」 | NVIDIA は「最大 3x、典型 2x 前後 + メモリ半減」がより正確 |
| Anakin「555M steps/sec」 | 一次資料（ar5iv 全文）の正値。二次まとめの「5M」は誤り |
| GIL/pickle の逐語 | EnvPool 本文では未取得。SB3/Gymnasium ドキュメントで裏付け |
| vmap↔N 環境並列の明示リンク | JAX 公式に直接記述なし。Brax/Podracer 論文で裏付け |
| sim-bound/learner-bound 二次解説 | APXML は 403。Large Batch Simulation 論文で代替 |
| 論理的含意（一次資料の明示文でない） | CUDA graphs↔XLA fusion 同根性、async dispatch のエラー遅延、Tensor Core が物理に効きにくい点、Isaac Gym の fp32/sim-to-sim |

## 主要出典 URL 一覧（すべて検証済み）

**古典的ボトルネック**
- IMPALA: https://ar5iv.labs.arxiv.org/html/1802.01561
- GA3C: https://ar5iv.labs.arxiv.org/html/1611.06256
- Sample Factory: https://ar5iv.labs.arxiv.org/html/2006.11751
- EnvPool: https://ar5iv.labs.arxiv.org/html/2206.10558

**everything on accelerator**
- Brax: https://arxiv.org/abs/2106.13281
- Isaac Gym: https://ar5iv.labs.arxiv.org/html/2108.10470
- Madrona: https://madrona-engine.github.io/
- PureJaxRL: https://chrislu.page/blog/meta-disco/

**ベクトル化 / JIT / XLA**
- Gymnasium Vector: https://gymnasium.farama.org/api/vector/ / https://gymnasium.farama.org/api/vector/async_vector_env/
- SB3 VecEnv: https://stable-baselines3.readthedocs.io/en/master/guide/vec_envs.html
- JAX jit: https://docs.jax.dev/en/latest/jit-compilation.html
- JAX lax.scan: https://docs.jax.dev/en/latest/_autosummary/jax.lax.scan.html
- JAX vmap: https://docs.jax.dev/en/latest/automatic-vectorization.html
- OpenXLA fusion: https://openxla.org/xla/gpu_architecture
- XLA fusion 解析: https://ar5iv.labs.arxiv.org/html/2301.13062

**Podracer / マルチデバイス**
- Podracer: https://ar5iv.labs.arxiv.org/html/2104.06272
- jax.pmap: https://docs.jax.dev/en/latest/_autosummary/jax.pmap.html
- jax.lax.pmean: https://docs.jax.dev/en/latest/_autosummary/jax.lax.pmean.html
- jax 並列: https://docs.jax.dev/en/latest/parallel.html
- Stoix: https://github.com/EdanToledo/Stoix / cleanba: https://github.com/vwxyzjn/cleanba
- InstaDeep TPU: https://instadeep.com/2023/10/reinforcement-learning-on-google-cloud-tpus-to-improve-deeppcb/

**ハードウェア / 混合精度 / CUDA graphs**
- NVIDIA mixed precision: https://docs.nvidia.com/deeplearning/performance/mixed-precision-training/index.html
- bfloat16: https://cloud.google.com/blog/products/ai-machine-learning/bfloat16-the-secret-to-high-performance-on-cloud-tpus
- PyTorch AMP: https://docs.pytorch.org/docs/stable/amp.html
- CUDA graphs: https://pytorch.org/blog/accelerating-pytorch-with-cuda-graphs/
- LeanRL: https://github.com/meta-pytorch/LeanRL
- Isaac Lab camera: https://isaac-sim.github.io/IsaacLab/main/source/overview/core-concepts/sensors/camera.html

**限界 / 数値精度**
- CUDA warp divergence: https://docs.nvidia.com/cuda/cuda-programming-guide/03-advanced/advanced-kernel-programming.html
- JAX control flow: https://docs.jax.dev/en/latest/control-flow.html
- JAX gotchas: https://docs.jax.dev/en/latest/notebooks/Common_Gotchas_in_JAX.html
- JAX debug: https://docs.jax.dev/en/latest/debugging/print_breakpoint.html
- JAX async: https://docs.jax.dev/en/latest/async_dispatch.html
- PySC2: https://arxiv.org/abs/1708.04782 / OpenAI Five: https://ar5iv.labs.arxiv.org/html/1912.06680
- Ampere GA102: https://www.nvidia.com/content/PDF/nvidia-ampere-ga-102-gpu-architecture-whitepaper-v2.pdf
- PyTorch randomness: https://pytorch.org/docs/stable/notes/randomness.html

**スループットの算数**
- 37 PPO 詳細: https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
- Large Batch Simulation: https://arxiv.org/abs/2103.07013
- Staggered Resets: https://arxiv.org/html/2511.21011
- Sample Factory policy lag: https://www.samplefactory.dev/07-advanced-topics/policy-lag/
- Amdahl（Cornell）: https://cvw.cac.cornell.edu/vector/performance/performance-amdahl
