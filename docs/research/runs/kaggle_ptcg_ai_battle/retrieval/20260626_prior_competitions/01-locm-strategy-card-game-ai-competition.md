# LOCM/Strategy Card Game AI Competition 5年史 — 勝者解法の系譜とPTCGへの教訓

## 概要

本レポートは Kowalski & Miernik (2023) の総括論文 *"Summarizing Strategy Card Game AI Competition"* (arXiv:2305.11814) を精読し、**Legends of Code and Magic (LOCM)** を題材に5年間(2018 CodinGame、2019-2022 IEEE CEC/COG)続いたカードゲーム AI コンペの勝者解法の系譜を整理したものである。LOCM は Hearthstone に対する microRTS のような「軽量で高速反復可能なベンチマーク」として設計され、不完全情報・確率性・巨大行動空間・デッキ構築という CCG 特有の難しさを保ちながら、全カード効果が決定的(非決定性はデッキ順のみ)という研究向け簡略化を持つ。PTCG AI Battle と構造的に最も近い先行コンペであり、勝者解法の変遷(ヒューリスティクス→探索→end-to-end NN)はそのまま本コンペの技術ロードマップの出発点になる。

## 手法の要点

LOCM は **draft/construction フェーズ + battle フェーズ** の2段構成。バージョンごとに難度が上がる:

- **v1.0/v1.2**: 160枚固定プールから3枚提示×30回で30枚デッキを構築。盤面は v1.2 で2レーン(各3体)に分割。
- **v1.5 (COG 2022)**: 試合ごとに120枚を手続き生成(新カードセット)し、各カード最大2枚まで計30枚を選択。construction は **4秒1ターン**で120枚を一括提示。これにより「全 draft をハードコードして単一フェーズに退化させる」攻略法を封じ、未知・不均衡カードへの**汎化**を強制した。

勝者解法の年表(win rate は論文 TABLE I):

| 年/版 | 勝者 | 手法 |
|---|---|---|
| CEC2019 v1.2 | Coac (94.22%) | battle = depth-3 minimax + αβ + ヒューリスティック枝刈り、draft = 固定順 |
| COG2019 | Coac (89.88%) | 同上。2位 ProphetCoac は相手手札予測を追加するも探索時間が減り逆効果 |
| CEC/COG2020 | Coac→Chad | Chad = harmony search でカード評価、battle = MCTS + 相手手札予測 |
| COG2021 | DrainPower (78.72%) | flat simulation(自ターン+相手応答)+ ヒューリスティック評価関数の重み2種 |
| **COG2022 v1.5** | **ByteRL (84.41%)** | **唯一の end-to-end RL**(両フェーズ単一方策、OSFP、LSTM)。2位以下はPPO×2、Q学習+best-first 等 |

搜索系が v1.2 を全勝し、共通技術は **(1) 合法手の枝刈り・順序付け、(2) lethal(必勝手)検出、(3) 一手先〜数手先の相手応答シミュレーション**。NN 系は v1.5 で支配的になった。

## 主要な結果や知見

- **draft のハードコードが極めて強力**: v1.0/v1.2 では固定カード順だけで上位を取れた。固定プールでは draft はオフラインで解ける問題に退化する。v1.5 の手続き生成だけが汎化を強制した点が本質的。
- **「相手手札予測」は諸刃**: ProphetCoac は branching factor を下げる狙いだったが、予測コストで探索時間が削られ win rate が下がった。**探索時間とモデリング精度のトレードオフ**を明示する重要事例。
- **計算制約の重さ**: 学術版では memory 256MB(1024MB超は失格)、battle 標準ターンは倍化、construction は4秒。CodinGame 版は 1コア/768MB/GPUなし/全試合合計30秒。最強の Coac/Chad は C++/Rust 実装で「well-known アルゴリズムの徹底最適化」が効いた。
- **end-to-end RL の到達点と限界**: ByteRL は v1.5 を20%超差で制したが、続く研究(本クラスタ別レポート参照)で battle stage が搾取可能と判明。

## 本コンペ(PTCG AI Battle)への応用

1. **二段最適化を分離してから統合せよ**: PTCG も「deck.csv 60枚の構築 + agent() の対戦プレイ」という二段構造。LOCM の歴史は「まず battle を探索+ヒューリスティクスで強くし、deck は別問題として最適化、最後に end-to-end へ」という段階的ロードマップが堅実であることを示す。初手は **lethal 検出 + 1手先相手応答シミュレーション + 合法手枝刈り** という Coac/DrainPower 型ベースラインを最優先で実装すべき。
2. **10分制約 = Coac の思想**: 1プレイヤー10分は LOCM の memory/time 制約に通じる。C++/Rust 級の徹底最適化、固定深さ探索 + ヒューリスティック cut-off、time-aware な depth 制御(Coac は時間切れ・木が広い時は depth を下げる)が直接効く。「相手モデリングを足して時間が減り弱くなる」ProphetCoac の失敗は、10分制約下で必ず意識すべき教訓。
3. **deck 60枚同時最適化 = LOCM の deckbuilding 研究系譜**: 進化計算(カードを遺伝子、デッキを genotype、AI 同士の playout で評価)、MAP-Elites、active genes など LOCM/Hearthstone で蓄積された手法群がそのまま適用候補。PTCG は固定プールに近いので「draft ハードコード = 強い」教訓どおり、**強いデッキを少数の人手+進化計算で見つけて固定し、agent() の質に計算を集中**する戦略が有効と予想される。
4. **合法手 index 設計**: LOCM の勝者は合法手を順序付き生成し枝刈りした。PTCG の巨大行動空間でも、合法手 index に**事前のヒューリスティック順序**(lethal→脅威除去→展開→温存)を与えて探索の上位だけ展開する設計が効く。

## 出典(URL)

- Summarizing Strategy Card Game AI Competition (arXiv:2305.11814): https://arxiv.org/abs/2305.11814
- SCGAI 公式コード・リファレンス bot リポジトリ: https://github.com/acatai/Strategy-Card-Game-AI-Competition
- gym-locm (OpenAI Gym 環境): https://github.com/ronaldosvieira/gym-locm
