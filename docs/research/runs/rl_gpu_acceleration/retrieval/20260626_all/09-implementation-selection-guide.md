# GPU アクセラレーション RL — 実装・選定実践ガイド（2026-06-26）

意思決定指向の実践ガイド。「どのスタックを選ぶか」「どこから最適化するか」「どこで詰まるか」を、ベンチマーク・専門家の見解・実運用事例に基づいて**断定的に**示す。各主張には出典 URL を付す。

> このファイルは同じ retrieval run（`20260626_all`）の補完文書。01〜08 がリソース単位の詳細サーベイ（主に JAX エコシステム）であるのに対し、本書は **PyTorch を含めた選定・実装の意思決定** にフォーカスする。

---

## 0. 一文サマリ（結論を先に）

- **環境を JAX で書ける／既存の JAX 環境（Brax・Isaac・gymnax・Jumanji 等）が使えるなら → JAX で end-to-end GPU**。ここでのみ「1000x〜4000x」級の高速化が現実になる。
- **環境が外部固定（ゲームサーバ・実機ロボット・`kaggle-environments` 等）で jit 不能なら → PyTorch**（TorchRL / SB3 / CleanRL）。JAX に行っても旨味の大半が消える。
- **迷ったら PyTorch から始める**。実装・デバッグ・エコシステムが圧倒的に楽で、`torch.compile` + CUDA graphs で学習側は 3〜7x まで詰められる（[LeanRL](https://github.com/meta-pytorch/LeanRL)）。
- **最適化はプロファイル優先**。まず環境スループットを測り、sim-bound か learner-bound かを判定してから手を打つ（[RL-Scope, arXiv:2102.04285](https://arxiv.org/pdf/2102.04285)）。

---

## 1. PyTorch vs JAX — 判断基準

### 1.1 根本のトレードオフ

従来の深層 RL は **環境=CPU、学習器=GPU** に分離し、毎ステップ CPU↔GPU 転送が発生する。これが最大のボトルネック。JAX の価値は **環境自体を JAX で書けば、env step / reset / 推論 / 学習更新までを丸ごと GPU/TPU 上で実行（end-to-end on-device）** でき、転送オーバーヘッドを消し、`vmap` で数千環境を一気に並列化できる点にある（[PureJaxRL, Chris Lu](https://chrislu.page/blog/meta-disco/)、[Gymnax](https://github.com/RobertTLange/gymnax)）。

### 1.2 JAX を選ぶ理由（Pros）

- **end-to-end GPU/TPU 学習**：env + 学習器が両方デバイス上。「従来の Python ベース RL を悩ませる CPU-GPU 通信オーバーヘッドを除去」（[PixelBrax, arXiv:2502.00021](https://arxiv.org/pdf/2502.00021)）。
- **報告される高速化**：環境ベクトル化で **~1000x**（CartPole 100万フレーム：NumPy 10並列で 46秒 → gymnax A100 2000並列で 0.05秒）、ワークフロー全体で **最大 ~4000x**（PureJaxRL の見出し主張）。ただし単一エージェントの純粋な JIT 効果は **~10x**（同条件 CleanRL PyTorch 比）。残りは数千エージェント/シードの同時 `vmap` による合成スループット（[PureJaxRL blog](https://chrislu.page/blog/meta-disco/)）。
- **`jit` / `vmap` / `pmap`**：2048 CartPole エージェントを「CleanRL 1体の学習の半分の時間」で、>500,000 エージェントを「A40 1枚・約9時間」で学習（[PureJaxRL blog](https://chrislu.page/blog/meta-disco/)）。
- **関数純粋性 → 研究 SOTA・メタ RL**：学習プロセス自体をメタ学習可能。Discovered Policy Optimisation（DPO, NeurIPS 2022）が未知の Brax タスクで PPO を上回る閉形式更新則を発見（[arXiv:2210.05639](https://arxiv.org/abs/2210.05639)）。

### 1.3 JAX を避ける理由（Cons）

- **環境が jittable / JAX 製でなければならない**：「env step と reset の両方が完全に jittable である必要」（[Gymnax](https://github.com/RobertTLange/gymnax)）。既存の任意 C/C++/Python シミュレータをそのまま載せられない。
- **静的形状要求 → 再コンパイル罠**：新しい入力形状やトレース値依存の制御フローで re-jit が走り、「頻繁な再コンパイルは Python より遅くなり得る」（[APXML: Avoiding Recompilation](https://apxml.com/courses/advanced-jax/chapter-2-optimizing-jax-code-performance/avoiding-recompilation)）。可変長エピソードが本質的に厄介。
- **デバッグが難しい**：トレース＆コンパイル実行のため、ブレークポイントや `print` が素直に効かない（[Liquid AI: Why we moved to PyTorch](https://mlechner.substack.com/p/why-we-started-with-jax-but-moved)）。
- **学習曲線が急**：関数純粋性、PRNG キーの引き回し、`lax.scan`/制御フロー、pytree。
- **エコシステム/インフラの脆さ**：Liquid AI は JAX の NCCL バックエンドが AWS EFA と非互換で帯域が 100x 落ちる壁に当たり PyTorch へ移行（[Liquid AI](https://mlechner.substack.com/p/why-we-started-with-jax-but-moved)）。
- **JIT コンパイル時間**：MuJoCo Playground タスクで 1〜3 分（[arXiv:2502.08844](https://arxiv.org/pdf/2502.08844)）。

### 1.4 PyTorch を選ぶ理由（Pros）

- **成熟した巨大エコシステム**：Stable-Baselines3 / RLlib / TorchRL / CleanRL。「PyTorch は応用 RL で支配的であり続け、ほとんどの商用 RL ではデフォルトとして正しい」（[geekflare 比較](https://geekflare.com/dev/jax-vs-pytorch/)）。
- **eager デバッグが容易**：「常に eager で動くのでデバッグが格段に楽」「`if global_rank==0: breakpoint()` で分散デバッグも自明」（[Liquid AI](https://mlechner.substack.com/p/why-we-started-with-jax-but-moved)）。
- **`torch.compile` の成熟（2025-2026）**：学習側のギャップを大きく縮める（§1.6）。
- **開発者母数が大きい**：実装・採用・採用面接・引き継ぎが楽。

### 1.5 PyTorch を避ける理由（Cons）

- **env が CPU 上だと CPU-GPU 転送ボトルネック**：「gymnax を GPU で動かせば不要な、ネットワーク更新のための CPU→GPU 転送が実行時間に大きなオーバーヘッドを足す」（[Gymnax](https://github.com/RobertTLange/gymnax)、[EnvPool, arXiv:2206.10558](https://arxiv.org/pdf/2206.10558)）。完全 on-device RL では原理的に不利（GPU 製 env と組み合わせない限り）。

### 1.6 `torch.compile` はどこまで詰められるか（2025-2026）

最も具体的な証拠は **LeanRL**（Meta PyTorch チーム、Vincent Moens）。CleanRL を `torch.compile` + CUDA graphs + TensorDict で書き直したもの（アルゴリズム不変）：

| アルゴリズム | CleanRL 基準 | +compile | +compile +cudagraphs | 倍率 |
|---|---|---|---|---|
| PPO (Atari) | 1,022 | 3,728 | **6,809 fps** | **6.8x** |
| SAC (連続) | 127 | 130 | **725 fps** | **5.7x** |
| TD3 (連続) | 272 | 247 | **936 fps** | **3.4x** |
| PPO (連続) | 652 | 683 | **1,774 fps** | **2.7x** |

出典：[meta-pytorch/LeanRL](https://github.com/meta-pytorch/LeanRL)

**要点**：`torch.compile` 単体は PPO-Atari には効くが SAC/TD3 にはほぼ効かない。**大きな伸びは cudagraphs**（CUDA 呼び出しの突入コストを排除）。ただし **これは「旧 PyTorch 比」で、PureJaxRL との直接対決値は未公開**（HN でも「JAX 実装とどう比較？」に回答なし。[Show HN](https://news.ycombinator.com/item?id=41597676)）。決定的なのは：**`torch.compile`/cudagraphs は学習器側と Python オーバーヘッドを詰めるが、env が CPU 上なら毎ステップ転送ボトルネックは残る**。JAX の「env も GPU 常駐」という構造的優位は別軸であり、`torch.compile` では埋まらない。

### 1.7 明快な決定ルール

> **環境を JAX で（合理的工数で）書けて、かつスループットが律速 → JAX。**
> **それ以外はすべて PyTorch。**

補足条件：

- 研究で「多シード一括」「ハイパラ大量スイープ」「メタ RL／アルゴリズム発見」をやる → **JAX**。
- 商用・受託・実機・短期プロジェクト・チームに JAX 経験者がいない → **PyTorch**。
- 既に learner-bound（env は十分速く GPU が埋まっている）→ JAX 化の旨味は小さい。**PyTorch のまま batch/precision/compile を詰める**。

---

## 2. シナリオ別ディシジョンツリー

| あなたの状況 | 推奨スタック | 根拠 |
|---|---|---|
| **環境を JAX で書ける／Brax・Isaac・gymnax・Jumanji が使える** | **PureJaxRL / rejax / Stoix（PPO・DQN）** + 該当 JAX 環境 | end-to-end on-device で 1000x 級が現実化（[PureJaxRL](https://chrislu.page/blog/meta-disco/)） |
| **環境が外部固定（ゲームサーバ・実機ロボット・`kaggle-environments`）** | **PyTorch（TorchRL / SB3 / CleanRL）**。高速化したいなら **EnvPool**（C++ ベクトル化、CPU）で env を、学習器は `torch.compile` | jit 不能な env では JAX の旨味が消える（[Kaggle JAX tutorial](https://www.kaggle.com/code/stonet2000/jax-environment-extended-tutorial)、[kaggle-environments](https://github.com/Kaggle/kaggle-environments)） |
| **コンシューマ GPU 1枚（RTX 4090）で最大スループット** | **PufferLib**（C/CUDA env + 独自 PPO） | RTX 4090 で 300k〜1.2M steps/s、Ocean で複数 env が各 1M steps/s（[PufferLib 2.0, RLJ 2025](https://rlj.cs.umass.edu/2025/papers/Paper151.html)） |
| **TPU pod / マルチ GPU クラスタ** | **Sebulba/Anakin（Podracer）パターン**：実装としては **Mava / Stoix**。JAX 環境なら Anakin、非 JAX 環境なら Sebulba | Anakin=env を TPU 上、Sebulba=env を CPU・学習を TPU コアに分割（[Podracer, arXiv:2104.06272](https://arxiv.org/abs/2104.06272)） |
| **ロボティクス / 連続制御** | **Isaac Lab**（sim-to-real 本命）／ **Brax**（trainer）／ **MJX + MuJoCo Playground**（pip 一発で数分学習） | Isaac は単一 GPU で ~4096 並列、A100 で Humanoid ~4分（[Isaac Gym, arXiv:2108.10470](https://arxiv.org/abs/2108.10470)） |
| **マルチエージェント** | **JaxMARL**（env+algo、研究）／ **Mava**（分散、Anakin+Sebulba）／ **PufferLib**（高スループット） | JaxMARL は単一実行 ~14x、並列化で最大 ~12,500x（[arXiv:2311.10090](https://arxiv.org/abs/2311.10090)） |
| **初心者 / 学習目的** | **CleanRL**（単一ファイル）。理論は **Spinning Up** / **HF Deep RL Course** | `ppo_atari.py` ~340行に全実装詳細が詰まる（[CleanRL docs](https://docs.cleanrl.dev/)） |

---

## 3. ハードウェア階層別の推奨

| ハードウェア | 推奨スタック | コメント |
|---|---|---|
| **コンシューマ GPU 1枚（RTX 3090/4090）** | **PufferLib**（最大スループット）／ JAX 環境が使えるなら **PureJaxRL on gymnax/Brax**。PyTorch なら **CleanRL + LeanRL の compile レシピ** | 1枚で「クラスタ級」スループット。VRAM 24GB は env 数の上限を決める要因 |
| **データセンター GPU 1枚（A100/H100）** | **PureJaxRL / Brax / MJX**（大バッチ並列が活きる）。ロボティクスは **Isaac Lab** | A100 で gymnax CartPole 100万遷移 0.05秒、Isaac Humanoid ~4分（[arXiv:2108.10470](https://arxiv.org/abs/2108.10470)） |
| **マルチ GPU ノード** | JAX: **`pmap` + Anakin（Mava/Stoix）**。PyTorch: **TorchRL の分散 collector** か **RLlib**。ロボティクスは **Isaac Lab マルチ GPU**（8-GPU で >1.6M FPS） | Isaac Lab は単一/マルチ GPU・マルチノード対応 |
| **TPU pod** | **Sebulba/Anakin（Podracer）**：実装は **Mava**。Brax/MJX は TPU で本領（MJX humanoid TPU v5 で 2.7M steps/s） | TPU は JAX 一択。PyTorch/XLA は RL では実績薄い |
| **CPU のみ / GPU なし** | **SB3 + EnvPool**（C++ ベクトル化 env で 10万 fps 級）。または小規模 **CleanRL**。JAX も CPU で動くが旨味薄 | EnvPool は 12コア PC で Atari ~49k fps（[arXiv:2206.10558](https://arxiv.org/pdf/2206.10558)）。古典制御・小規模なら十分実用 |

---

## 4. 移行コストと工数の現実

### 4.1 JAX RL の習得期間

- **基礎は概ね 1〜2 週間**（Python/NumPy と NN の素養がある前提）。関数型・PRNG モデルに慣れが要る（[TDS: Gentle intro to DRL in JAX](https://towardsdatascience.com/a-gentle-introduction-to-deep-reinforcement-learning-in-jax-c1e45a179b92/)、[HF: On Learning JAX](https://huggingface.co/blog/afmck/jax-tutorial)）。
- **検証フラグ**：「1〜2 週間」は二次情報レベルで、権威ある一次ソースは未特定。**目安として扱うこと**（既存 08 レポートでも未検証フラグ済み）。

### 4.2 環境を書き直すコスト（JAX vs C++ vs Rust）

- **前提**：複雑な RL 環境の高性能実装は「従来、数ヶ月の専門エンジニアリングを要してきた」。PureJaxRL 作者も「JAX への RL 環境書き直しは時間がかかり得る」と明言（[arXiv:2603.12145](https://arxiv.org/html/2603.12145)、[PureJaxRL](https://chrislu.page/blog/meta-disco/)）。
- **JAX 書き直しの具体作業**：全状態の外部化（state を入出力）、`jax.numpy` 化、副作用除去（assert/print/logging）、Python 制御フロー → `lax.cond`/`lax.fori`、RNG キーを state 化。見返りは **Gymnasium 比 38〜5,439x**、ピーク ~790M steps/s（[arXiv:2603.12145](https://arxiv.org/html/2603.12145)）。
- **C++（EnvPool）**：最適化 C++ で Atari 最大 ~1M frames/s だが **CPU-GPU 転送は残る**（[arXiv:2206.10558](https://arxiv.org/pdf/2206.10558)）。
- **C/Rust（PufferLib）**：数百万 steps/s だが **2万行超の最適化 C** が代償（[arXiv:2603.12145](https://arxiv.org/html/2603.12145)）。
- **近道**：env が既に **gymnax / Brax / Jumanji / Pgx / Craftax** にあるなら書き直し不要。**まずこれを探すこと**。

### 4.3 移行が割に合わないケース

- **env が jit/ベクトル化不能**（外部ゲームサーバ・実機ロボット・`kaggle-environments`）。書き直しがプロジェクト本体になり、旨味が消える。
- **短期・使い捨て実験**。数ヶ月の書き直しが償却できない。
- **既に learner-bound**。env は十分速く GPU が埋まっている → JAX 化より batch/precision/compile を詰める。
- **画像など大観測で VRAM 律速**。大量並列 env + on-GPU buffer が OOM し、達成可能な高速化が頭打ち。
- **既存 JAX 環境がある** → 自前で書き直さず流用。

---

## 5. 実践最適化チェックリスト

順番が重要。**測る前に最適化しない**。

1. **[最優先] 環境スループットを最初に測る**。ランダム方策で env を回し、全並列環境合計の steps/s を計測。env は「RL システム全体で最も遅いのに最も注目されない部分」（[Isaac Lab Training Guide](https://isaac-sim.github.io/IsaacLab/main/source/overview/reinforcement-learning/training_guide.html)）。3指標を区別：`fps step` / `fps step+inference` / `fps total`。
2. **ボトルネックを分類（sim-bound vs learner-bound）**。on-policy（PPO/A2C）は off-policy より「少なくとも 3.5x sim-bound」（[RL-Scope, arXiv:2102.04285](https://arxiv.org/pdf/2102.04285)）。**注意：`nvidia-smi` の GPU 使用率は誤誘導しやすい**。CPU/GPU 時間内訳を取る（[arXiv:2012.04210](https://arxiv.org/pdf/2012.04210)）。
3. **env をベクトル化／並列化**。CPU 版は 50〜100 env で頭打ち、JAX/GPU 版は 600+ までスケール（[arXiv:2603.12145](https://arxiv.org/html/2603.12145)）。
4. **CPU-GPU 転送を削る**。end-to-end on-GPU 化が本質的勝因。Nsight Systems で不要な同期/転送を可視化（[Nsight guide](https://arikpoz.github.io/posts/2025-05-25-speed-up-pytorch-training-by-3x-with-nvidia-nsight-and-pytorch-2-tricks/)）。
5. **batch size と env 数を別レバーとしてチューニング**。`batch = N(env) × T(steps)`。総サンプルを固定すると並列 env を増やしすぎると逆効果（研究例で ~4 並列が最効率の場合あり。[arXiv:2506.03404](https://arxiv.org/html/2506.03404v1)）。並列を大きく変えたら **学習率を再スケール**（平方根則。[arXiv:2603.06009](https://arxiv.org/html/2603.06009v1)）。
6. **混合精度は BF16 推奨**（FP16 ではなく）。BF16 は FP32 と同じ 8bit 指数で動的範囲が広く、RL の return/value のレンジに強い（[PyTorch mixed precision](https://pytorch.org/blog/what-every-user-should-know-about-mixed-precision-training-in-pytorch/)）。ただし RL の方策/価値網は小さいことが多く、**learner-bound の時に効く**。
7. **`torch.compile`（+ cudagraphs）**。学習更新と（可能なら）推論をコンパイル。初回コンパイル費用と、**形状変化で再コンパイル**に注意（rollout/batch 形状を固定）。SAC/TD3 は cudagraphs が効く（[LeanRL](https://github.com/meta-pytorch/LeanRL)）。
8. **replay buffer を GPU に置く（観測が小さいなら）**。in-GPU replay は「in-RAM の 2倍速」（batch 128。[arXiv:1801.03138](https://arxiv.org/pdf/1801.03138)）。ただし画像観測や大容量では VRAM が律速 → CPU/ハイブリッド。
9. **プロファイラで裏取り**：`nvidia-smi -l 1`（即席）、PyTorch profiler（CPU+CUDA、Chrome trace、GPU の空き=赤信号）、JAX profiler（TensorBoard trace、`jax_log_compiles`）、必要なら RL-Scope。

---

## 6. よくある落とし穴

1. **JAX 再コンパイル罠（動的形状）**。JIT 関数は形状・dtype に特化され、新形状で re-trace。可変長エピソードが各々新形状になり致命的。→ **固定最大長へパディング**＋ **常に `step_env` を呼び `jnp.where(done, ...)` で条件適用**、**auto-reset env**、**Python ループでなく `lax.scan`/`fori_loop`/`while_loop`**。`jax_log_compiles=True` / `jax_explain_cache_misses=True` で診断。ループ内で `jax.jit()` を呼ばない（[APXML JIT pitfalls](https://apxml.com/courses/getting-started-with-jax/chapter-2-accelerating-functions-jit/jit-common-pitfalls)、[Avoiding Recompilation](https://apxml.com/courses/advanced-jax/chapter-2-optimizing-jax-code-performance/avoiding-recompilation)）。
2. **並列 env 過多による GPU OOM**。NUM_ENV を上げすぎると VRAM 枯渇。on-GPU replay + 大量並列は「GPU メモリの大半を占有」し非現実的になる（[arXiv:2307.12983](https://arxiv.org/pdf/2307.12983)）。断片化でも詰まる。→ NUM_ENV を下げる、観測/buffer を圧縮、シャーディング。
3. **vmap / ベクトル化コードのデバッグ**。`jit`/`pmap` 下では素の `print` が効かない（トレース時に tracer を見るだけ）。→ **`jax.debug.print("{x}", x=x)`（f-string 不可）**、**`jax.debug.breakpoint()`**。vmap 下では要素ごとに出力。順序保持は `ordered=True`（pmap では不可）。ホットパスからは外す（[JAX print/breakpoint docs](https://docs.jax.dev/en/latest/debugging/print_breakpoint.html)）。
4. **早すぎる最適化**。incidental なコードでは「早すぎる最適化は悪」だが、NN 学習が本丸なら早期最適化が効くこともある。**いずれにせよプロファイル → 計測したボトルネックを叩く**（[Nsight guide](https://arikpoz.github.io/posts/2025-05-25-speed-up-pytorch-training-by-3x-with-nvidia-nsight-and-pytorch-2-tricks/)）。
5. **jit 不能な env なのに JAX を選ぶ**。外部 I/O・隠れ状態・非決定を持つ env（ゲームサーバ・実機・`kaggle-environments`）は JIT できない。→ ローカルな jittable 再実装を書くか、PyTorch に留まる。
6. **PRNG キーの取り扱い**。JAX 乱数は純粋関数：同じキー＝同じ結果。**毎回の乱数操作前に `split` して独立ストリーム**を作る。env では **キーを env state の一部に**（reset 時に新乱数が要る）。RL は本質的にノイジー → **複数シードで評価**（[Bejjani: RL with JAX](https://josephbejjani.com/mechagogue-jax/)）。

---

## 7. 学習リソース（推奨読了順）

**Step 1 — RL の基礎**
- **Spinning Up in Deep RL（OpenAI）**：無料の定番入門。理論・用語・key papers・短い実装。コードは ~2018 で CPU 中心なので**概念用**。https://spinningup.openai.com/
- **Hugging Face Deep RL Course**：8 ユニット、Colab + 動画 + 修了証。SB3 / CleanRL を扱う。https://huggingface.co/learn/deep-rl-course/

**Step 2 — PPO の実装詳細（GPU 化前に必須）**
- **「The 37 Implementation Details of PPO」**（Huang et al., ICLR Blog 2022）：論文の PPO と「動く PPO」の差を埋める決定版。https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
- **CleanRL docs**：単一ファイル実装を行単位で読む。https://docs.cleanrl.dev/

**Step 3 — JAX を学ぶ**
- **JAX 101**（公式、順番に読む）：https://docs.jax.dev/en/latest/jax-101.html
- 内在化すべき概念：`vmap`/`pmap`、`jit`、pytree、tracing。

**Step 4 — end-to-end GPU RL（JAX）**
- **PureJaxRL**：まずブログ「Achieving 4000x Speedups...」https://chrislu.page/blog/meta-disco/ → walkthrough ノートブック https://github.com/luchris429/purejaxrl/blob/main/examples/walkthrough.ipynb
- **PufferLib docs**：高スループット実運用。https://puffer.ai/docs.html

**Step 5 — GPU シミュレータ（用途で選ぶ）**
- **Brax**：https://github.com/google/brax ／ **MuJoCo Playground / MJX**：https://playground.mujoco.org/ ／ **gymnax**：https://github.com/RobertTLange/gymnax ／ **Isaac Lab**：https://isaac-sim.github.io/IsaacLab/

### 読むべき論文（順）

1. **PPO**（Schulman+ 2017）— [arXiv:1707.06347](https://arxiv.org/abs/1707.06347)
2. **37 Implementation Details of PPO**（ICLR Blog 2022）— [link](https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/)
3. **Podracer architectures**（Hessel+ 2021, Anakin/Sebulba）— [arXiv:2104.06272](https://arxiv.org/abs/2104.06272)
4. **Isaac Gym**（Makoviychuk+ 2021）— [arXiv:2108.10470](https://arxiv.org/abs/2108.10470)
5. **Brax**（Freeman+ 2021）— [arXiv:2106.13281](https://arxiv.org/abs/2106.13281)
6. **Discovered Policy Optimisation**（Lu+ NeurIPS 2022）— [arXiv:2210.05639](https://arxiv.org/abs/2210.05639)
7. **JaxMARL**（Rutherford+ 2023）— [arXiv:2311.10090](https://arxiv.org/abs/2311.10090)
8. **PufferLib**（Suarez 2024）— [arXiv:2406.12905](https://arxiv.org/abs/2406.12905) ／ **PufferLib 2.0**（RLC 2025）— [RLJ Paper 151](https://rlj.cs.umass.edu/2025/papers/Paper151.html)
9. **MuJoCo Playground**（Zakka+ 2025）— [arXiv:2502.08844](https://arxiv.org/abs/2502.08844)
10. **TorchRL**（Bou/Bettini+ 2023）— [arXiv:2306.00577](https://arxiv.org/abs/2306.00577)

### 研究すべき GitHub リポジトリ

- 単一ファイルで学ぶ：**CleanRL** https://github.com/vwxyzjn/cleanrl
- end-to-end JAX：**PureJaxRL** https://github.com/luchris429/purejaxrl
- 高スループット：**PufferLib** https://github.com/PufferAI/PufferLib
- 物理：**Brax** https://github.com/google/brax ／ **MuJoCo Playground** https://github.com/google-deepmind/mujoco_playground
- 環境：**gymnax** https://github.com/RobertTLange/gymnax
- マルチエージェント：**JaxMARL** https://github.com/FLAIROx/JaxMARL ／ **Mava** https://github.com/instadeepai/Mava
- ロボティクス：**Isaac Lab** https://github.com/isaac-sim/IsaacLab
- PyTorch ネイティブ：**TorchRL** https://github.com/pytorch/rl ／ 学習側高速化レシピ **LeanRL** https://github.com/meta-pytorch/LeanRL

---

## 8. 検証フラグ

- **「JAX 習得 1〜2 週間」**：一次ソース未特定。目安として扱う。
- **PureJaxRL「4000x」**：見出し主張は実在するが合成スループット指標。クリーンな単一エージェント値は ~10x（vs CleanRL）。
- **`torch.compile` vs JAX 直接対決**：公開された head-to-head 値は未発見。LeanRL は「旧 PyTorch 比」3〜7x で、env 転送ボトルネック解消という JAX の構造的優位は別軸。
- **PufferLib RTX 5090 値**：一次ソース未確認（4090 値は確認済み）。
- **クロスフレームワーク steps/s 比較**：単一の権威ある横断表は未発見。PufferLib（軽量 C env）と Brax/Isaac（重い物理）の steps/s は直接比較不可。**方向性として読むこと**。

---

## 主要出典

- PureJaxRL blog: https://chrislu.page/blog/meta-disco/
- LeanRL（Meta/PyTorch）: https://github.com/meta-pytorch/LeanRL
- Liquid AI（JAX→PyTorch 移行記）: https://mlechner.substack.com/p/why-we-started-with-jax-but-moved
- RL-Scope（プロファイリング）: https://arxiv.org/pdf/2102.04285
- Isaac Lab Training Guide: https://isaac-sim.github.io/IsaacLab/main/source/overview/reinforcement-learning/training_guide.html
- Isaac Gym 論文: https://arxiv.org/abs/2108.10470
- Podracer（Anakin/Sebulba）: https://arxiv.org/abs/2104.06272
- PufferLib 2.0（RLC 2025）: https://rlj.cs.umass.edu/2025/papers/Paper151.html
- EnvPool: https://arxiv.org/pdf/2206.10558
- JAX debug docs: https://docs.jax.dev/en/latest/debugging/print_breakpoint.html
- APXML JIT/再コンパイル: https://apxml.com/courses/advanced-jax/chapter-2-optimizing-jax-code-performance/avoiding-recompilation
- 37 Implementation Details of PPO: https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
- 環境自動生成/書き直しコスト: https://arxiv.org/html/2603.12145
