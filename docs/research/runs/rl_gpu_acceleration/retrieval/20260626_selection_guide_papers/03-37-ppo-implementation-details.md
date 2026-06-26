# PPO の 37 の実装詳細（ICLR 2022 Blog Track）

## 基本情報

- **原題**: The 37 Implementation Details of Proximal Policy Optimization
- **著者**: Shengyi Huang, Rousslan Fernand Julien Dossa, Antonin Raffin, Anssi Kanervisto, Weixun Wang
- **掲載**: ICLR 2022 Blog Track（査読付きブログトラック、2022-03-25）
- **特徴**: arXiv なし。CleanRL（01 レポート）の参照実装と一体で「論文の PPO」と「動く PPO」の差を埋める決定版ドキュメント
- **URL**: https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/

## 課題・背景

PPO の論文（Schulman+ 2017）に書かれた擬似コードと、実際に動く SOTA 実装（`openai/baselines` の `ppo2`）の間には多数のギャップがある。本ブログは `openai/baselines` の系譜（pposgd 2017 → ppo2 2018 → 2020 commit ea25b9e）を辿り、**性能再現に必要な 37 の実装詳細を 5 カテゴリに分類** して列挙し、CleanRL の single-file 実装で高忠実度に再現する。

## 主要な知見・推奨事項（37 ディテールのカテゴリ別一覧）

この cluster で最も actionable な「実装チェックリスト」そのもの。GPU 化・フレームワーク選定の前に、これらが正しく実装されていることが性能の前提条件。

### カテゴリ1: コア実装詳細（13項目, 全 PPO 共通）
1. **Vectorized architecture** — N 個の並列環境を 1 学習器で回す
2. **Orthogonal initialization of weights + constant bias** — 隠れ層は √2 でスケール、出力層は固有スケール
3. **The Adam Optimizer's Epsilon Parameter** — eps=1e-5（PyTorch デフォルトではなく）
4. **Adam Learning Rate Annealing** — 初期 LR から 0 へ線形減衰
5. **Generalized Advantage Estimation (GAE)** — value bootstrap + TD(λ)
6. **Mini-batch Updates** — 収集軌跡をシャッフルしてミニバッチ化
7. **Normalization of Advantages** — ミニバッチ単位で標準化（バッチ全体ではない）
8. **Clipped surrogate objective** — PPO のコア clipping
9. **Value Function Loss Clipping** — value 損失にも clipping を適用
10. **Overall Loss and Entropy Bonus** — policy + value + entropy の合成損失
11. **Global Gradient Clipping** — L2 ノルム ≤ 0.5 に再スケール
12. **Debug variables** — policy/value loss, entropy, clipfrac, approx KL を追跡
13. **Shared vs separate MLP networks** — policy/value の結合・分離の選択

### カテゴリ2: Atari 特有（9項目）
1. **NoopResetEnv** — リセット時に 1〜30 の no-op をランダム実行
2. **MaxAndSkipEnv** — フレームスキップ（k=4）+ フレーム max-pooling
3. **EpisodicLifeEnv** — ライフ喪失をエピソード終了扱い
4. **FireResetEnv** — リセット時に FIRE を押す（特定ゲーム）
5. **WarpFrame** — Y チャネル抽出・84×84 リサイズ
6. **ClipRewardEnv** — 報酬を {+1, 0, −1} に二値化
7. **FrameStack** — 連続 m（通常 4）フレームをスタック
8. **Shared Nature-CNN network** — 特徴抽出 CNN のパラメータ共有
9. **Scaling images to [0,1]** — ピクセル値を 255 で除算

### カテゴリ3: 連続行動（MuJoCo）特有（9項目）
1. **Continuous actions via normal distributions** — ガウス方策からサンプリング
2. **State-independent log std** — 学習可能な固定 log-std
3. **Independent action components** — 多次元行動を因子化
4. **Separate MLP networks for policy and value** — 共有でなく分離
5. **Handling of action clipping** — 行動を有効域にクリップ、unclipped 版を保存
6. **Normalization of Observations** — VecNormalize による running mean/var 正規化
7. **Observation Clipping** — 正規化観測を [−10, 10] に制限
8. **Reward Scaling** — 割引付き rolling sum の std によるスケーリング
9. **Reward Clipping** — スケール後報酬を [−10, 10] に制限

### カテゴリ4: LSTM 特有（5項目）
1. **Layer initialization for LSTM layers** — 重み std=1、バイアス=0
2. **Initialize LSTM states to zeros** — 隠れ・セル状態をゼロ初期化
3. **Reset LSTM states at episode end** — 終了/打ち切りでメモリをクリア
4. **Prepare sequential rollouts in mini-batches** — 更新時に軌跡順序を維持
5. **Reconstruct LSTM states during training** — 保存した初期状態から系列を再生

### カテゴリ5: MultiDiscrete 行動空間特有（1項目, RTS ゲーム向け）
1. **Independent action components** — 離散行動次元を因子化確率として扱う

### 補助的・状況依存のテクニック（4項目）
- Clip range annealing（clip 範囲のアニーリング）
- Parallelized gradient updates
- Early stopping of policy optimization（KL ベースの早期停止）
- Invalid action masking（無効行動マスキング、RTS で必須）

## 選定・実装への含意

- **「動く PPO」のチェックリスト = フレームワーク選定の前提**: これら 37 項目は PyTorch でも JAX でも実装すべき不変条件。スタックを JAX に移す際、特に **observation 正規化（カテゴリ3-6）と LSTM 状態の再構築（カテゴリ4）** は device 上で正しく実装するのが難しく、移行コストの主因になる。
- **vectorized architecture（コア1）は GPU 並列の出発点**: N 並列環境は CPU 版（EnvPool 等）でも JAX 版（vmap）でも本質。GPU 高速化の議論はここから始まる。
- **Atari の前処理 9 項目は env 側のコスト**: これらは多くが CPU で行われる前処理。JAX で end-to-end on-device 化する場合、これらの前処理（frame stack, warp, clip）も device 上に載せる必要があり、純 JAX 環境（Craftax 等）が無いと再実装が重い。
- **observation/reward 正規化の running stats**: 02 レポート（What Matters）と一致して「正規化は性能に必須」。JAX では running mean/var を pytree state として引き回す必要があり、実装ミスが起きやすい落とし穴。
- **CleanRL との一体性**: 各ディテールは CleanRL の `ppo*.py`（~330行, 01 レポート）に対応行があり、「ドキュメント + 参照実装」がセット。学習者はこの 2 つを並べて読むのが最短。

## 主要な定量結果（原文ママ）

- 37 = 13（コア）+ 9（Atari）+ 9（連続行動）+ 5（LSTM）+ 1（MultiDiscrete）。+ 補助 4 項目。
- Adam eps=1e-5、global grad clip L2 ≤ 0.5、観測クリップ [−10,10]、報酬クリップ [−10,10]、画像 /255、Atari frame skip k=4 / frame stack 4。
- 再現方法論: `openai/baselines` の commit 系譜（pposgd 2017 → ppo2 2018 → ea25b9e 2020）を追跡、CleanRL で classic control / Atari / MuJoCo / LSTM / RTS をベンチマーク、W&B でトラッキング。
- "CleanRL has built their PPO implementation to match implementation details in `ppo2` closely."

## 限界・注意点

- **PPO に特化**: SAC/TD3/DQN 等の off-policy には直接適用できない（別途ディテールがある）。
- **2022 時点・CPU env 前提**: vectorized architecture は CPU 並列環境が主。GPU-native env（Brax/gymnax）での実装差分や、scaling-law 視点（07/08）は対象外。
- **arXiv なし・ブログ形式**: 引用時は ICLR Blog Track URL を用いる。査読は通っているが論文フォーマットの定量表は限定的。

## 出典

- ブログ（ICLR 2022 Blog Track）: https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
- 参照実装 CleanRL: https://github.com/vwxyzjn/cleanrl
