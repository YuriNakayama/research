# 深層強化学習における再現性の問題（Deep RL that Matters）

## 基本情報

- **原題**: Deep Reinforcement Learning that Matters
- **著者**: Peter Henderson, Riashat Islam, Philip Bachman, Joelle Pineau, Doina Precup, David Meger（McGill University / Microsoft Maluuba）
- **掲載**: AAAI 2018（Thirty-Second AAAI Conference on Artificial Intelligence）。arXiv:1709.06560（2017-09-19 投稿、最終版 2019-01-30）
- **対象アルゴリズム**: TRPO, DDPG, PPO, ACKTR
- **対象環境**: HalfCheetah-v1, Hopper-v1, Walker2d-v1, Swimmer-v1（MuJoCo / OpenAI Gym）
- **URL**: https://arxiv.org/abs/1709.06560

## 課題・背景

深層 RL は多様なドメインで成果を上げたが、**SOTA 手法の結果再現は容易でない**。環境の非決定性と手法固有の分散が組み合わさり、報告された結果の解釈が難しい。本論文は「ハイパラ・ネットワーク構造・報酬スケール・ランダムシード・コードベース」が結果に与える影響を体系的に検証し、**厳密な実験・報告のガイドライン**を提案する。

> "reproducing results for state-of-the-art deep RL methods is seldom straightforward... non-determinism in standard benchmark environments, combined with variance intrinsic to the methods, can make reported results tough to interpret."（Abstract）

## 主要な知見・推奨事項（actionable な方法論として抽出）

### 1. ランダムシードの危険性（本論文の象徴的知見）
- **同一設定で 10 試行**を実施: "We perform 10 experiment trials, for the same hyperparameter configuration, only varying the random seed across all 10 trials."
- 10 シードを **2 群（各 5 シード）に分割して平均**すると、同じアルゴリズム・同じハイパラ・同じ環境にもかかわらず **2 本の平均曲線が統計的に有意に異なる**（HalfCheetah で t = −9.0916, p = 0.0016）。
- → **少数シードの平均は「アルゴリズム性能」ではなく「シードガチャ」を測りうる**。"top-N trials" の報告や N<5 は問題。
- 必要試行数: "While there can be no specific number of trials specified as a recommendation, it is possible that power analysis methods can be used to give a general idea."（power analysis で目安を決める）。

### 2. 報酬スケーリング
- DDPG では報酬の再スケール（×σ̂）が環境ごとに不安定な結果。σ̂=0.01 未満では学習失敗、1 や 10 では良好。layer normalization とも相互作用。**報酬スケールは隠れた重要ハイパラ**。

### 3. ネットワーク構造・活性化関数
- 活性化関数（ReLU / tanh / Leaky ReLU）とネットワークサイズが性能に大きく影響。"The effects are not consistent across algorithms or environments."
- 同じ環境・アルゴリズムでも活性化関数次第で最終リターンが数千ポイント変わりうる。**単一の最適構造は存在しない**（アルゴリズム・環境依存）。

### 4. コードベース間の分散
- 同一アルゴリズムの異なる公開実装が大きく異なる結果を出す。TRPO（original / rllab / OpenAI Baselines）を同一ハイパラで比較しても学習曲線が顕著に乖離（Fig.6）。DDPG（rllab / rllab++ / Baselines）も同様。
- "Implementation differences which are often not reflected in publications can have dramatic impacts on performance."

### 5. 報告ガイドライン（提案）
- **全ハイパラ・実装詳細・実験設定・評価法を報告**: "Report all hyperparameters, implementation details, experimental setup, and evaluation methods for both baseline comparison methods and novel work."
- **bootstrap 信頼区間（10k 反復）** を用いる。
- **power analysis** で十分な試行数を決める。
- **有意性検定**: 2-sample t-test, Kolmogorov-Smirnov 検定。
- **異なるシードで多数試行**: "Many trials must be run with different random seeds when comparing performance."

## 選定・実装への含意

- **「速くする前に、正しく測る」の原典**: GPU 高速化やスケーリング則（07/08）を論じる前に、評価方法論が壊れていれば全ての比較が無意味になる。本論文はその警鐘。
- **JAX の大量並列が "正しい評価" を安価にする**: 本論文が「多シードが必須」と示すなら、JAX の `vmap` による多シード同時学習（PureJaxRL は 1 回の実行で数千シード）は、再現性問題への直接的な処方箋になる。**JAX を選ぶ価値の一つは「統計的に頑健な評価が安い」点**。
- **フレームワーク間 steps/s 比較の警告**: 「コードベースが違えば結果が違う」という知見は、PyTorch 実装と JAX 実装の速度・性能比較を額面通り受け取ってはいけないことを意味する。横断ベンチ（PufferLib vs Brax 等）は「方向性」として読むべき（09 ガイドの検証フラグと一致）。
- **報告基準**: 本プロジェクトのレポートでも「何シード・どの信頼区間か」を必ず確認する根拠。

## 主要な定量結果（原文ママ）

- 10 試行・2 群分割で HalfCheetah が t = −9.0916, p = 0.0016（同一設定でも有意差）。
- 報酬スケール σ̂<0.01 で学習失敗、1〜10 で良好。
- bootstrap 信頼区間 10k 反復、2-sample t-test と KS 検定を推奨。
- アルゴリズム: TRPO, DDPG, PPO, ACKTR。環境: HalfCheetah/Hopper/Walker2d/Swimmer-v1。

## 限界・注意点

- **2017-2018 時点・MuJoCo 連続制御 4 環境に限定**。Atari / 大規模・GPU 並列環境は未検証。
- **当時のコードベース（rllab, baselines）依存**: 具体的なコードベース比較結果は今日の実装には直接転用できない。ただし「実装差が結果を変える」という教訓は普遍。
- **処方箋は統計手法であって高速化手法ではない**: 本論文は「どう測るか」を扱い、「どう速くするか」（GPU/JAX）は対象外。両者は補完関係。

## 出典

- 論文: https://arxiv.org/abs/1709.06560
- HTML: https://ar5iv.labs.arxiv.org/html/1709.06560
