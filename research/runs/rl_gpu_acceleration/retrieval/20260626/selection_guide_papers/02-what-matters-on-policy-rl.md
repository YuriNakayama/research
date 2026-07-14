# オンポリシー RL で何が効くのか? 大規模実証研究

## 基本情報

- **原題**: What Matters In On-Policy Reinforcement Learning? A Large-Scale Empirical Study
- **著者**: Marcin Andrychowicz, Anton Raichuk, Piotr Stańczyk, Manu Orsini, Sertan Girgin, Raphael Marinier, Léonard Hussenot, Matthieu Geist, Olivier Pietquin, Marcin Michalski, Sylvain Gelly, Olivier Bachem（Google Brain / Google Research）
- **掲載**: arXiv:2006.05990 [cs.LG]（2020-06-10 投稿）
- **規模**: 50+ の実装上の「選択肢」を統一フレームワークに実装し、5 つの連続制御環境で **25 万体超のエージェント** を学習
- **URL**: https://arxiv.org/abs/2006.05990

## 課題・背景

オンポリシー RL（PPO 等）のアルゴリズムは概念的に単純だが、SOTA 実装には「論文の記述に書かれない多数の設計判断」が含まれ、それが性能を強く左右する。論文記述と実装の乖離が「RL の進歩の帰属（attribution）を困難にし、分野全体の進歩を遅らせる」。本研究はこのギャップを埋めるため、50+ の選択肢を **統一フレームワークで網羅的にアブレーション** し、実用的な推奨を与える。

> "we implement >50 such 'choices' in a unified on-policy RL framework... We train over 250'000 agents in five continuous control environments."（Abstract）

## 主要な知見・推奨事項（actionable な推奨を抽出）

PPO 系オンポリシー RL を連続制御で組む際の **具体的デフォルト値** が得られる。以下、原文の推奨を整理。

### 1. ポリシー損失
- **PPO clipping を使う**。"Use the PPO policy loss. Start with the clipping threshold set to 0.25 but also try lower and higher values if possible."
- PPO は 5 環境中 4 環境で他の損失（vanilla PG, V-trace, AWR, V-MPO）を上回った。

### 2. ネットワーク構造
- **policy / value を分離する**: "Separate value and policy networks appear to lead to better performance on four out of five environments."
- **活性化関数は tanh**: "tanh activations perform best and relu worst."
- **隠れ層は 2 層**: "Two hidden layers appear to work well for policy and value networks."
- **幅は環境依存・value は広めが安全**: HalfCheetah では "16−32 units per layer in the policy network and 256 in the value network" が最良。value network は広くしても害が少ない。

### 3. 初期化（最重要級の知見）
- **最終ポリシー層を 100 倍小さい重みで初期化**: "Initialize the last policy layer with 100× smaller weights"（初期行動分布をゼロ付近に集中させる）。
- **初期 action std に非常に敏感**: "the performance is very sensitive to the initial action standard deviation with 0.5 performing best on all environments except Hopper."
- **action 変換は tanh がやや良い**: HalfCheetah で 30% 改善。

### 4. 正規化・クリッピング
- **入力（観測）正規化は必須級**: "Input normalization is crucial for good performance on all environments apart from Hopper."
- **value function 正規化も非常に効く**: HalfCheetah・Humanoid で必須。
- **per-minibatch advantage 正規化**: "seems not to affect the performance too much"（効果は小さい）。
- **gradient clipping**: 小さな改善あり、閾値の差は小さい。
- **観測クリッピング**: 効果の証拠ほぼなし。

### 5. アドバンテージ推定・割引
- **GAE / V-trace > N-step**: "GAE and V-trace appear to perform better than N-step returns."
- **GAE λ=0.9**: "λ=0.9 performed well regardless of whether GAE or V-trace was used on all tasks."
- **value loss は MSE、Huber や PPO-style value clipping は避ける**: "Use GAE with λ=0.9 but neither Huber loss nor PPO-style value loss clipping."
- **割引 γ は最重要ハイパラ・環境依存**: "Discount factor γ is one of the most important hyperparameters and should be tuned per environment (start with γ=0.99)."

### 6. 学習設定
- **データを複数回パスするのが重要**: "Going over experience multiple times appears to be crucial for good sample complexity."
- **遷移をシャッフルし、データパスごとに advantage を再計算**: "Shuffle individual transitions before assigning them to minibatches and recompute advantages once per data pass."
- **バッチサイズ拡大は sample complexity を害さず、反復速度を上げる**ために増やすべき。
- **並列環境数**: CPU コアが十分あれば多い方が wall-clock で速い（sample complexity は若干低下しうる）。

### 7. オプティマイザ
- **Adam（β₁=0.9）、学習率 0.0003 が安全なデフォルト**: "Use Adam optimizer with momentum β₁=0.9 and a tuned learning rate (0.0003 is a safe default)."
- **学習率の線形減衰**: わずかに改善しうるが二次的。

### 8. 正則化
- **エントロピーボーナス・KL 制約はほぼ効かない**: HalfCheetah を除き有意な効果なし。PPO の trust region と慎重な初期化が既にその役割を果たしている可能性。

## 選定・実装への含意

- **GPU 高速化以前に "正しい PPO" を固める根拠**: ここで挙がるデフォルト（tanh 2層 / policy・value分離 / 最終層100倍小さく / 入力正規化 / GAE λ=0.9 / γ=0.99 / Adam lr=3e-4 / PPO clip=0.25）は、PyTorch でも JAX でも普遍的に適用すべき。スタック選定の前に「アルゴリズム実装が壊れていないこと」を保証する。
- **JAX スイープと相性が良い**: 本研究自体が 25 万体の大規模アブレーション。JAX の `vmap`/`pmap` による大量並列スイープ（PureJaxRL 系）は、こうしたハイパラ探索を桁違いに安価にする → 本論文の方法論は JAX エコシステムの強みを正当化する。
- **正規化の重要性は env-on-GPU 設計に直結**: 入力・value 正規化が必須ということは、JAX で end-to-end on-device 化する際もこの正規化を device 上で正しく実装する必要がある（running mean/var の状態管理）。
- **value network を広く**は GPU メモリ予算（並列 env 数）とのトレードオフ材料になる。

## 主要な定量結果（原文ママ）

- ">50 choices"、"over 250'000 agents"、"five continuous control environments"。
- PPO clip 閾値 0.25 推奨。GAE λ=0.9。γ デフォルト 0.99。Adam lr=3e-4、β₁=0.9。
- 最終ポリシー層 "100× smaller weights"。初期 action std 0.5 が最良。
- policy/value 分離が 5 環境中 4 環境で良好。tanh 活性化が最良・relu が最悪。隠れ 2 層。
- HalfCheetah: policy 16-32 units / value 256 units。

## 限界・注意点

- **連続制御（MuJoCo 系 5 環境）に限定**: Atari / 離散行動 / 画像観測には直接転用できない（それは「37 details」ブログ 03 が補完）。
- **環境横断で単一の最適解は無い**: γ・幅・reward 系は環境ごとに調整が必要と繰り返し述べられる。
- **古典 RL（2020 時点）**: scaling-law 視点（07/08）やモデルサイズ依存は扱わない。デフォルト値はあくまで「中規模ネットワーク・中規模データ」前提。

## 出典

- 論文: https://arxiv.org/abs/2006.05990
- HTML: https://ar5iv.labs.arxiv.org/html/2006.05990
