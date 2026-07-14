# 01. JAX コアプリミティブと「everything on accelerator」パラダイム

JAX による RL アクセラレーションの本質は、**環境ステップ・方策推論・rollout・勾配更新のすべてを単一のコンパイル済み XLA プログラムとしてアクセラレータ（GPU/TPU）上に載せる**ことにある。これを可能にするのが `jit` / `vmap` / `pmap` / `lax.scan` の 4 プリミティブと XLA コンパイラである。

## 1.1 `jax.jit` + XLA コンパイル — ループ全体の融合（fusion）

`jax.jit()` は「JAX の Python 関数を Just-In-Time コンパイルし、XLA 上で効率的に実行できるようにする」変換である（出典: https://docs.jax.dev/en/latest/jit-compilation.html ）。

**なぜ高速化するか（公式ドキュメントの記述）**:

- jit なし: 「上記コードは演算を 1 つずつアクセラレータに送っている。これが XLA コンパイラによる最適化能力を制限する」。
- jit あり: 「できる限り多くのコードを XLA コンパイラに渡すことで、関数を完全に最適化できる」。XLA は演算を 1 つずつディスパッチするのではなく**融合（fuse）**する。
- 公式ドキュメントのベンチマーク: 非 JIT 版 = 2.04 ms/loop、JIT 版 = 284 μs/loop（**約 7x 高速化**）。理由は XLA が個々の演算ではなく関数全体を最適化するため。

出典: https://docs.jax.dev/en/latest/jit-compilation.html

**RL における意義**: 環境ステップ・方策フォワード・rollout ループ・勾配更新をすべて JAX で書き、単一の `jit` で包むと、XLA が訓練ループ全体を 1 つの最適化済み GPU プログラムにコンパイル・融合する。これが「everything on accelerator」パラダイムである。Python レベルのステップごとのディスパッチオーバヘッドも、ステップごとの CPU↔GPU 転送もなくなる。

**トレードオフ（公式）**: jit 内のトレース値は「shape や dtype といった静的属性を通じてのみ制御フローに影響でき、値そのものを通じては影響できない」。静的引数を変えると再コンパイルが発生する。これが Python の `for`/`if` を jit 内で自由に使えない理由であり、`lax.scan`/`lax.cond` が存在する理由でもある（出典: 同上）。

## 1.2 `jax.vmap` — 自動ベクトル化 → 大規模並列環境

公式定義（要点引用）:

- 「`jax.vmap()` 変換は、そうしたベクトル化実装を自動生成するよう設計されている」
- 「`jax.jit()` と同様に関数をトレースし、各入力の先頭にバッチ軸を自動追加する」
- 手動バッチ化は「関数の複雑さが増すと煩雑でエラーを起こしやすい」が、vmap はこれを自動化する
- 「`jax.vmap()` と `jax.jit()` は合成可能に設計されており、vmap した関数を jit で包んでも、jit した関数を vmap で包んでも正しく動く」

出典: https://docs.jax.dev/en/latest/automatic-vectorization.html

**大規模並列環境を可能にする仕組み**: 単一環境の `step` 関数を書き、それをバッチ軸で `vmap` するだけで、JAX が数千環境を同時にステップするバッチ配列演算へと変換する。環境ループの Python ループは存在せず、効率的な GPU コードが生成される。これが PureJaxRL / gymnax が GPU 1 枚で 2,000 以上の環境を回せる仕組みである（出典: 同上、適用例は https://chrislu.page/blog/meta-disco/ ）。

## 1.3 `jax.lax.scan` — rollout の表現

公式セマンティクス（引用）: 「配列の先頭軸上で関数を走査しつつ状態を carry する（Scan a function over leading array axes while carrying along state）」。

型シグネチャ: `scan :: (c -> a -> (c, b)) -> c -> [a] -> (c, [b])`（`c` = ループ carry/状態、`a` = 入力要素、`b` = 出力要素）。

出典: https://docs.jax.dev/en/latest/_autosummary/jax.lax.scan.html

**なぜ Python ループでなく scan か（引用）**: scan は「単一の WhileOp に lower される。これは JIT コンパイル関数のコンパイル時間削減に有用で、jit() 内のネイティブ Python ループ構文は展開（unroll）されて巨大な XLA 計算を生むため」。control-flow ドキュメントも「大きなループの展開を避けるトレース可能な制御フロー」が必要なときに `lax.scan` を使うよう述べる（出典: https://docs.jax.dev/en/latest/control-flow.html ）。

**rollout の表現方法**: RL の rollout はまさに状態を持つ逐次ループである。carry = (env_state, policy_params, rng) とし、各ステップで環境遷移と行動選択を適用し、transition（obs, action, reward, ...）を出力する。`lax.scan` はこれを 1 つのコンパイル済み `WhileOp` として表現するため、T ステップの rollout は T 個のコピーではなく定数サイズのグラフにコンパイルされ、コンパイル時間を低く保ちつつ rollout 全体をオンデバイスに留める。

## 1.4 `jax.pmap` — マルチ GPU/TPU の SPMD

公式定義（引用）: pmap は「single-program multiple-data (SPMD) プログラム」を表現し、「関数を複製して各レプリカを独立した XLA デバイス上で並列実行する」。vmap との違い: vmap は「マップ軸をプリミティブ演算の中へ押し下げてベクトル化する」のに対し、pmap は計算を物理的に別ハードウェアデバイスへ分散し、collective 演算（`psum` 等）を可能にする。「マップ軸のサイズは利用可能なローカル XLA デバイス数以下でなければならない」（出典: https://docs.jax.dev/en/latest/_autosummary/jax.pmap.html ）。

補足: 現行 JAX ではマルチデバイスに `jax.jit` + sharding を使う方向が推奨されつつあるが、PureJaxRL 時代の SPMD プリミティブとしては `pmap` が標準的に使われた。

## 1.5 なぜこの組合せが end-to-end GPU RL を可能にするか

- **CPU↔GPU 転送ボトルネックの排除**: 環境自体が JAX で書かれていれば（gymnax, Brax）、env-step・方策・rollout・learner がすべて GPU 上に存在する。「計算を完全に GPU 上に保ち、CPU と GPU の間でデータをコピーするオーバヘッドを避けることが重要。これはしばしば大きなボトルネックになる」（出典: https://arxiv.org/pdf/2502.00021 PixelBrax）。
- **rollout + 学習の融合**: 訓練ループ全体への `jit` により、XLA は rollout 収集と勾配更新を 1 つのプログラムに融合できる（出典: https://docs.jax.dev/en/latest/jit-compilation.html ）。
- **大規模環境並列**: `vmap` が数千環境をバッチ化、`lax.scan` が時間方向の rollout をコンパクトに保ち、`pmap`/sharding が複数 GPU にスケールさせる。JAX 高速化された訓練と JAX 高速化された環境を組み合わせることで「環境ステップを含む訓練ループが end-to-end で GPU 上を走り、wall-clock 時間が大幅に短縮される」（出典: https://arxiv.org/html/2510.01764v1 Octax、Brax/gymnax 文献でも裏付け）。

## 検証フラグ

- JAX プリミティブのセマンティクス・ベンチマーク（7x など）はすべて公式 `docs.jax.dev` から引用。✅ 検証済み。
- pmap vs jit+sharding: PureJaxRL 時代は `pmap`、現行 JAX は `jit`+sharding を推奨。矛盾ではなく時系列の変化。

## 出典

- https://docs.jax.dev/en/latest/jit-compilation.html
- https://docs.jax.dev/en/latest/automatic-vectorization.html
- https://docs.jax.dev/en/latest/_autosummary/jax.lax.scan.html
- https://docs.jax.dev/en/latest/control-flow.html
- https://docs.jax.dev/en/latest/_autosummary/jax.pmap.html
- https://arxiv.org/pdf/2502.00021 (PixelBrax)
- https://arxiv.org/html/2510.01764v1 (Octax)
- https://chrislu.page/blog/meta-disco/ (PureJaxRL ブログ、適用例)
