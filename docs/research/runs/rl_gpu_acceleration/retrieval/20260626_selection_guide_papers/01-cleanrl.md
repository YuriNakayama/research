# CleanRL: 深層 RL アルゴリズムの高品質な単一ファイル実装

## 基本情報

- **原題**: CleanRL: High-quality Single-file Implementations of Deep Reinforcement Learning Algorithms
- **著者**: Shengyi Huang, Rousslan Fernand Julien Dossa, Chang Ye, Jeff Braga
- **掲載**: arXiv:2111.08819 [cs.LG]（2021-11-16 投稿）。のちに JMLR (Journal of Machine Learning Research, 2022) に採録。
- **フレームワーク**: PyTorch
- **URL**: https://arxiv.org/abs/2111.08819 ／ リポジトリ https://github.com/vwxyzjn/cleanrl

## 課題・背景

深層 RL アルゴリズムは「概念的には単純」でも、SOTA 実装には性能を左右する低レベル/高レベルの設計判断（implementation details）が多数埋め込まれている。modular な RL ライブラリ（SB3 / RLlib 等）はそれらを抽象化レイヤの裏に隠すため、「どの行が性能に効いているか」が見えにくい。CleanRL は **アルゴリズムの全ディテールを 1 ファイルに集約** することで、研究・教育における透明性と再現性を担保することを狙う。

> "we put all details of an algorithm into a single file, making these performance-relevant details easier to recognize."（Abstract）

## 主要な知見・推奨事項（この cluster の actionable な観点）

### 設計思想: single-file の利点
1. **透明性**: 「コードの全側面を 1 箇所で認識しやすくなる」("It becomes easier to recognize all aspects of the code in one place.")。
2. **デバッグ容易性**: ほとんどの変数が Python のグローバル名前空間に置かれるため、`Ctrl+C` で実行を止めて変数を直接調べられる("the researchers can do Ctrl+C to stop the program execution and check most variables.")。
3. **プロトタイピング速度**: デバッグ体験が速いため新機能開発が容易("it becomes easier to develop new features.")。

### single-file のトレードオフ
- **コード重複を明示的に許容**: "Despite having duplicate code among these files, the single-file implementations have the following benefits."
- modular ライブラリは「平均 7〜15 ファイル」のモジュール設計を理解する必要があるのに対し、CleanRL は 1 ファイルで完結。代償として再利用性・保守性は劣る。

### 実装アルゴリズム（8 種・13 バリアント）
PPO（classic / Atari / continuous の 3 種）、DQN（classic / Atari）、C51（classic / Atari）、Apex-DQN（Atari）、DDPG（continuous）、TD3（continuous）、SAC（continuous）。

### 行数の目安（透明性の実証）
- `ppo.py`（classic control）: 321 LOC
- `ppo_atari.py`: 337 LOC
- `ppo_continuous_action.py`: 331 LOC
- invalid action masking の追加: 約 40 LOC

つまり「PPO の全実装詳細が ~330 行で読める」。

### プロダクション機能
- **実験トラッキング（W&B）**: ソースコード、依存関係、ハイパラ、実行コマンド、学習メトリクス、エージェントのプレイ動画、システムメトリクス、ログを自動記録。
- **クラウドスケール**: Docker とクラウドで「2000 台超のマシンを同時にオーケストレーション」した実績("orchestrating experiments on more than 2000 machines simultaneously via Docker and cloud providers")。
- **ベンチマーク**: Open RL Benchmark（公開結果との照合・インタラクティブ可視化）。2020 年に 50,000+ 実験時間を記録。

## 選定・実装への含意

- **学習・教育目的なら CleanRL が第一候補**: PPO の 37 ディテール（02/03 レポート参照）を「動くコードで読む」最短経路。単一ファイルなので "どの行が何をしているか" を行単位で追える。
- **PyTorch スタックの基準点**: GPU 高速化（LeanRL の `torch.compile` + cudagraphs レシピ）は CleanRL を baseline に取って 3〜7x を測っている。つまり CleanRL は「PyTorch ネイティブ最適化の出発点」として位置づく。
- **PyTorch vs JAX の判断には直接踏み込まない**: CleanRL 本体は PyTorch だが、後発の `cleanrl/cleanba`（JAX 版）や purejaxrl は同じ single-file 思想を JAX に持ち込んでいる。CleanRL の価値は「フレームワーク非依存の透明性原則」にある。
- **プロダクション/大規模分散には不向き**: modular でないため、複数アルゴリズム共通基盤を構築・保守したい受託・商用では SB3 / RLlib / TorchRL の方が適する。

## 主要な定量結果（可能な限り原文ママ）

- アルゴリズム: 8 種・13 実装（Section 2）。Open RL Benchmark では "7+ algorithms"。
- `ppo.py` 321 LOC / `ppo_atari.py` 337 LOC / `ppo_continuous_action.py` 331 LOC。
- "orchestrating experiments on more than 2000 machines simultaneously via Docker and cloud providers"。
- 2020 年に 50,000+ experiment hours をトラッキング。
- 比較対象 modular ライブラリ: Stable Baselines 3, RLlib, MushroomRL, PFRL（「平均 7〜15 ファイル」）。

## 限界・注意点

- **コード重複は本質的トレードオフ**: アルゴリズム横断のバグ修正・機能追加は全ファイルに反映する必要があり、保守コストは modular ライブラリより高い。
- **再利用性が低い**: コンポーネント（buffer / network / optimizer）を他プロジェクトに切り出して使う設計ではない。
- **大規模カスタムシステムの土台には不適**: 抽象化が無いぶん、複雑な分散アーキテクチャやマルチエージェント基盤を組むには別ライブラリ（RLlib / TorchRL）が要る。
- **本論文は「実装詳細の体系的列挙」自体は別文書（37 details ブログ, 03 レポート）に委ねている**。CleanRL はその "動く参照実装" の位置づけ。

## 出典

- 論文: https://arxiv.org/abs/2111.08819
- リポジトリ: https://github.com/vwxyzjn/cleanrl
- ドキュメント: https://docs.cleanrl.dev/
