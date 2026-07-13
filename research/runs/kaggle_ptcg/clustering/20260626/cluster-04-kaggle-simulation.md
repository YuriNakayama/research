# cluster-04: Kaggle Simulation 系コンペ勝者解法

> **評価基盤が同一**（提出 = agent 関数、TrueSkill ラダー、24h 自己対戦）。実務的な提出・運用知見の宝庫。
> 既存ドメイン `kaggle_orbit_wars` にも同系統の蓄積あり（読み取り再利用可）。

## 0. 評価インフラ（本コンペが継承する部分）— kaggle-environments + TrueSkill

- 全コンペ共通の agent I/F:
  ```python
  def agent(observation, configuration):  # obs=毎ターン状態, config=固定設定
      return action                         # 合法手
  ```
- ローカル評価: `env.run([a, b])` / `evaluate(...)`。replay 確認: `kaggle competitions episodes <ID>`。
- **TrueSkill の挙動**:
  - 各提出のスキル = ガウス **N(μ, σ²)**。μ=推定スキル、σ=不確実性。
  - アップロード時に **Validation Episode**（自分のコピーと対戦）で起動確認。有効なら **μ₀=600** で連続 episode プールへ。
  - **近い skill 同士をマッチング**。勝者 μ↑/敗者 μ↓（引分は平均へ）。更新幅は *surprise* と σ に比例。**σ は episode ごとに縮小**。**勝敗マージンは無視**（勝/分/負のみ）。
  - **leaderboard score = 保守的下界 μ − 3σ**。少数の幸運な勝ちでは上がれず、σ を下げるだけの episode 数が要る。
  - 上限例: **5 提出/日**、最終追跡は最新 ~2。締切後も収束まで episode 継続。
- **builder への含意**: 良い agent は **早く提出**して σ を下げる。**安定性 > ピーク**（クラッシュ/タイムアウト/非合法手 = 敗北）。微修正で提出枠を浪費しない（毎回 μ₀=600・高 σ から再開）。**多様で敵対的な相手 pool でローカル多数 episode 検証**。
- 出典: [kaggle-environments](https://github.com/Kaggle/kaggle-environments), [simulation_competitions.md](https://github.com/Kaggle/kaggle-cli/blob/main/docs/simulation_competitions.md), [trueskill.org](https://trueskill.org/)

## 1. Lux AI — Season 1 (2021) & Season 2 (NeurIPS 2023)

| | Lux S1 (2021) | Lux S2 (NeurIPS 2023) |
|---|---|---|
| ゲーム | 1v1 RTS, 12–32 grid, 360 turns | 1v1, **48×48, 1000 turns**, action-queue, bidding |
| 情報 | 全盤面（敵対的） | **完全情報** |
| **勝者** | **Deep RL** | **ルールベース + forward-sim 探索 (ML なし)** |

- **S1 1st — Toad Brigade: deep RL**。アルゴリズムは **IMPALA**（+UPGO+TD-λ）、**PPO ではない**。**fully-conv ResNet + squeeze-excitation**（~24 block, ~20M params）。最初 20M step は **reward shaping** → sparse 勝敗報酬へ anneal。自己対戦の「戦略サイクル」を **frozen teacher + KL 蒸留** で安定化。
- **S2 1st — ry_andy_: 純 Python ルールベース + 役割割当 + 明示的 forward simulation**（NN なし）。組織の S3 論文いわく **top 5 の 4 つがルールベース、RL は top5 に 1 つだけ・1 位ではない**。S2 は大規模 RL 用に設計 (JAX env) されたが、1000 turn + sparse lichen 報酬が手作り lookahead を有利にした。
- **転用教訓**: 純 self-play RL は脆い（TrueSkill ラダーが非推移サイクルを増幅）。唯一勝った RL は **frozen teacher への KL 蒸留 + 密報酬 warm-up→sparse anneal** で生き延びた。長 horizon で credit assignment が難しいと **探索/forward-sim が end-to-end RL に勝つ** → ハイブリッド（学習価値/方策で determinized 探索をガイド）が有望。
- 出典: [Toad Brigade writeup](https://www.kaggle.com/competitions/lux-ai-2021/writeups/toad-brigade-toad-brigade-s-approach-deep-reinforc), [IsaiahPressman/Kaggle_Lux_AI_2021](https://github.com/IsaiahPressman/Kaggle_Lux_AI_2021), [ryandy/Lux-S2-public](https://github.com/ryandy/Lux-S2-public), [Lux S3 paper](https://openreview.net/pdf?id=7t8kWYbOcj)

## 2. Halite IV / "Halite by Two Sigma" (2020) & Halite III (2018)

- **ゲーム**: 資源採取 RTS、**21×21 トーラス, 4P, 400 turns, 完全情報**。
- **Halite IV 1st — ttvand: ルールベース**（RL 専門家だが優勝 bot は rule-based）。
- **4th — 0Zeta**: 「100% ルールベース。この問題は deep RL に最適でなかった」。linear-sum-assignment で役割割当（~10 役割）、dominance map、100+ 手調整パラメータ。
- **8th — KhaVo ら（注目の学習系）**: **imitation learning**（CNN semantic-segmentation 風に上位 replay を per-ship 模倣）。だが純ルールベース勢の **下**。
- **Halite III**: 勝者は再びルールベース/ヒューリスティック + 最適化（GA/CLOP 調整）。勝つ RL 無し。
- **転用教訓**: **leaderboard 上位 replay の imitation learning が最高 ROI の入口** — Halite で唯一効いた学習法（純 self-play RL は勝てず）。連続 TrueSkill ラダーは高品質 replay を吐き続ける → 安価に clone してベースライン化 → 高レバレッジな少数決定に薄いヒューリスティック層 → league self-play は最後の 10%。
- 出典: [ttvand/Halite](https://github.com/ttvand/Halite), [0Zeta/HaliteIV-Bot](https://github.com/0Zeta/HaliteIV-Bot), [KhaVo writeup](https://khavo.ai/2020/09/15/halite/)

## 3. Kore 2022 & ConnectX

- **Kore 2022**: 21×21, 2P, 400 turns, **完全情報**。fleet を **flight-plan プログラム**（"N 10 W 5"）で発射 → **巨大な構造化行動空間**。
  - **勝者はルールベース + flight-plan 探索。RL は勝てず**。1st Harm Buisman は「RL 目的で参加したがルールベースに集中」、ほぼ全候補ルートを採点する routing engine + **3 秒/turn 予算** との戦い（キャッシュ/vectorize）。学習系 (khanhvu207) は行動を **autoregressive Transformer で flight-plan を文字単位生成**（top5 から ~200M tuple で imitation）したが、複雑な行動空間ゆえルールベースを超えられず。
- **ConnectX**: 完全情報 Connect-4（解決済み）。天井は minimax/alpha-beta + transposition table。AlphaZero 系 RL は学習演習で、勝ち筋ではない。
- **転用教訓**: *(Kore)* 行動空間が巨大なら **構造化行動空間を探索する強い手作り方策が naive end-to-end RL に勝つ** — 各ターンをルール生成の候補手に分解し採点（今はヒューリスティック、後で学習）、高速・キャッシュ済み候補生成に投資。RL は価値関数の調整に上積み。*(ConnectX)* leaderboard は **μ−3σ の連続トーナメント対 移動する相手集団** — 多様な相手への頑健 win-rate と低 σ を最適化。1 つの exploit ラインで順位が一晩で覆る。
- 出典: [Kore 1st writeup](https://www.kaggle.com/competitions/kore-2022/writeups/harm-buisman-1st-place-solution), [qihuazhong/kore-2022](https://github.com/qihuazhong/kore-2022), [khanhvu207/kore2022](https://github.com/khanhvu207/kore2022), [connectx](https://www.kaggle.com/c/connectx)

## 4. Hungry Geese (2021) & Google Research Football (2020–21)

- **Hungry Geese**: 4P 同時手の Snake、7×11 トーラス, 200 step。**全盤面は可観測だが相手の同時次手は隠れ** — 同時性の意味での不完全情報。同時手カードゲームに最も近い構造類似。
  - **勝者は探索 + 学習評価のハイブリッドが純 RL を圧倒**。1st HandyRL (DeNA): **学習評価 (線形 + 大 NN アンサンブル) を伴う MCTS**。3rd Maxwell: BC（>1200 LB replay）+ **4 体同時評価の batch MCTS**。共通技: **MCTS 内で全 player 同時の batch NN 推論**。
- **GRF**: 11v11、19 離散行動、実質全状態。難所 = sparse goal + 長 horizon + 多 agent 協調。
  - **1st WeKick (Tencent): deep-RL self-play + league training + 重い報酬 shaping + imitation**。分散 PPO, LSTM, multi-head value, **league self-play**, **GAIL imitation** ブートストラップ, 密 reward shaping（possession ±0.2 等）。
- **転用教訓**: *(Hungry Geese)* 同時/隠れ手ゲームでは **自己対戦学習した方策/価値ネットを推論時探索でラップし、相手の同時隠れ手を明示モデル化**（joint 評価 or determinized/expectimax rollout）。*(GRF)* **league/opponent-pool self-play（最新 checkpoint だけでなく過去の多様な自分と対戦）+ 密報酬 shaping + imitation ブートストラップ** が sparse 報酬・長 horizon の勝ちレシピ。
- 出典: [HandyRL](https://github.com/DeNA/HandyRL), [GeeseZero](https://github.com/takedarts/hungry-geese), [TiKick, arXiv:2110.04507](https://arxiv.org/abs/2110.04507)

## 5. 横断パターン（再掲・本コンペ向け）

1. **ルールベース + 探索は思ったより多く勝つ**（Halite III/IV, Kore, Lux S2）。ただし完全情報 + 分解可能目的 + tight time budget が条件。
2. **学習が勝った時、最高レバレッジは leaderboard 上位 replay の imitation/BC**。
3. **勝つ RL は naive self-play ではない** — league/opponent-pool + teacher KL 蒸留 + 密報酬→sparse anneal。
4. **学習ネット上の推論時探索が raw 方策推論に勝つ**（同時/不完全手）。card-game native な対応物は **ISMCTS / 隠れ手 determinized 探索**。
5. **TrueSkill (μ−3σ) は頑健性と低分散を評価**。早期提出で σ を下げ、絶対にクラッシュ/タイムアウト/非合法手を出さない。

> **本コンペ向け単一の最良プラン**: 上位 replay の **BC** で観測 + 行動/ログ履歴から方策/価値ネット → 提出時に **ISMCTS（隠れ手 determinized expectimax）でラップ** → その後 **league self-play**（過去上位の frozen pool + KL-to-teacher + 密 tempo/盤面優位 shaping を勝敗へ anneal）で微調整。**ターン予算速度とゼロクラッシュ安定性**を徹底し σ を素早く潰す。
