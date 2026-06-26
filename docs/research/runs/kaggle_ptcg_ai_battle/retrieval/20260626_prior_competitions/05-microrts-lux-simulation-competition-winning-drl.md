# microRTS/Lux AI 勝者解法 — 計算予算制約下のシミュレーション対戦コンペにおけるDRL運用知見

## 概要

本レポートは Kaggle/IEEE 系のシミュレーション対戦コンペで勝った DRL エージェントの**実務運用知見**を扱う:(1) Goodfriend (2024) *RAISocketAI* (arXiv:2402.08112, IEEE-CoG2023 microRTS 優勝)、(2) **Lux AI Challenge Season 2**(Kaggle/NeurIPS2023, 646チーム)。両コンペは PTCG と同じく「**コード(エージェント)を提出 → 自動対戦リーグで順位付け**」「**1ターン/1フレームの厳しい時間予算**」「**巨大な合法行動空間**」という制約を共有する。PTCG の「10分・合法手 index・自動対戦」運用に直結する、DRL を実コンペで勝たせるための報酬整形・カリキュラム・転移学習・推論コスト管理の具体ノウハウを抽出する。

## 手法の要点

**RAISocketAI(microRTS 優勝)**:
- **GridNet 行動空間**: 全ユニットの行動を1回の方策呼び出しで計算(各グリッド位置の行動 logit を出力)。行動は action type/move/harvest/return/produce 方向・produce type・relative attack の独立離散サブ行動に分解。
- **3つの value head による報酬整形**: (1) shaped reward(build-time でスケールしたユニット種別 = 高コストユニットを厚く評価)、(2) win-loss 疎報酬(Tanh)、(3) cost-based reward(ユニットコスト差分)。**訓練序盤は dense(1)+(3) → 終盤は win-loss 疎報酬のみ**へ mix-and-match。
- **カリキュラム + 転移学習**: 小マップ(≤16×16)5種で base 学習 → 大マップ個別に fine-tune し各マップ90%超勝率。
- **計算予算管理**: **100ms/ターン**制約に対し、小マップは DoubleCone(4,6,4)(残差ブロック+stride-4 downscale+SE層, 約500万パラ, adaptive pooling で多サイズ推論)、大マップは aggressive downscale の **squnet**。実行時に最初の観測で両モデルを100回走らせて速い方を**動的選択**。
- **成績**: IEEE-CoG2023 を総合勝率 **72%** で優勝(2020優勝 CoacAI に7/8マップで90%)。総訓練 **70 GPU日 × 7ネット**。

**Lux AI Season 2**:
- 1位 (ryandy) を含む上位は**ルールベース(C++/TS/Python)と RL の混在**。トップ DRL は **DoubleCone バックボーン + actor/critic ヘッド**。Season1 の勝利 DRL は **GridNet 行動空間 + 報酬整形 + IMPALA(+UPGO/TD(λ) loss, PPO ではなく)**。
- 過去コンペでは brute-force 探索・ヒューリスティクス・DRL・**模倣学習**が混在して勝利。

## 主要な結果や知見

- **報酬整形の段階的切替が鍵**: dense 報酬で立ち上げ、終盤に win-loss 疎報酬へ移す mix-and-match が安定学習に効く。
- **転移学習でマップ/設定別に特化**: 汎用 base を作ってから個別環境に fine-tune すると各環境90%超。
- **推論コストと精度のトレードオフを明示管理**: 時間予算内に収めるための複数アーキ(DoubleCone/squnet)と実行時動的選択は、**自動対戦コンペで失格を避ける**ための必須テクニック。
- **ルールベースが依然強い**: Lux S2 上位はルールベース多数。**RL が常に最善とは限らず、ハイブリッド(ルールの骨格 + 局所 RL/探索)**が現実解になりやすい。

## 本コンペ(PTCG AI Battle)への応用

1. **時間予算管理は勝敗に直結**: RAISocketAI の「100ms 制約に複数モデル + 動的選択」は、PTCG の10分制約にそのまま転用すべき設計思想。重い探索/大モデルと軽量フォールバックを用意し、**残り時間に応じて深さ・モデルを切り替える** time-aware agent() を実装する。タイムアウト失格は最悪の負け方。
2. **報酬整形の段階切替**: PTCG を RL で学習するなら、序盤は「サイド枚数差・盤面有利・カードアドバンテージ」等の dense 報酬で立ち上げ、終盤は「勝敗のみ」の疎報酬へ移行する mix-and-match が有効。
3. **合法手の構造化エンコード(GridNet 的発想)**: PTCG の行動は「どのカードを・どの対象に・どう使うか」の合成。GridNet のように**行動を独立サブ行動に分解してマスク付きで出力**すれば、巨大な合法手 index 空間を扱いやすくなる。合法手マスクを方策出力に適用する実装は必須。
4. **ルールベース骨格 + 局所学習のハイブリッド**: Lux S2 でルールベースが上位を占めた事実は、**まず堅実なヒューリスティック agent()(lethal 検出・脅威評価・展開順)で土台を作り、勝負所だけ探索/RL で強化**する戦略の堅実さを示す。いきなりフル RL より、ハイブリッドが計算予算・開発コストの両面で現実的。
5. **転移/カリキュラムでデッキ別特化**: deck.csv が複数アーキタイプを取りうるなら、汎用 base 方策を作ってから**主要デッキごとに fine-tune** する RAISocketAI 型の転移学習が、各デッキでの prime performance を引き出す。

## 出典(URL)

- A Competition Winning DRL Agent in microRTS (arXiv:2402.08112): https://arxiv.org/html/2402.08112v1
- Lux AI Challenge 公式: https://www.lux-ai.org/
- Lux AI Season 2 (Kaggle): https://www.kaggle.com/competitions/lux-ai-season-2
- Lux S2 1位解法 (ryandy/Lux-S2-public): https://github.com/ryandy/Lux-S2-public
