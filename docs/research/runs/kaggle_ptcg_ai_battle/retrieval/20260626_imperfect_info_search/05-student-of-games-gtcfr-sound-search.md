# Student of Games と GT-CFR — 完全/不完全情報を統合する健全探索、決定化を超えて (Schmid et al. 2023)

## 概要

Schmid ら (DeepMind, Science Advances 2023) の **Student of Games (SoG)** は、guided search・自己対戦学習・ゲーム理論的推論を統合した汎用アルゴリズムで、**完全情報ゲーム(チェス・囲碁)と不完全情報ゲーム(ポーカー・Scotland Yard)の両方**で強い性能を達成する。中核は **growing-tree CFR (GT-CFR)** と **counterfactual value-and-policy network (CVPN)**、および公開信念状態 (public belief state) 上の **健全な継続的再解決 (sound continual re-solving)**。重要なのは、SoG が Scotland Yard で**決定化ベースの SOTA エージェント PimBot を打ち負かす**点で、これは「決定化は最適戦略に収束しない」という ISMCTS 系の限界を理論・実験で乗り越えた到達点である。PTCG AI Battle に「探索+学習+ゲーム理論」を統合する設計のロードマップを与える。

## 手法の要点

**公開信念状態 (public belief state)**: β = (s_pub, r)。s_pub は全プレイヤーが観測する公開情報、r は range(各情報状態に各プレイヤーが到達する確率=信念)。不完全情報ゲームでは、単一状態ではなく「どの情報状態にいうるか」を健全に扱うために信念分布が必要。

**GT-CFR(成長木 CFR)**: 現在の公開状態を根として木を成長させ、2 つのフェーズを交互に回す。
- **regret update フェーズ**: 現在の木で public tree CFR の後悔更新を実行。各情報状態への到達確率(range)を信念として保持し、葉ノードは range・chance 確率・利得と CVPN の出力で評価。
- **expansion フェーズ**: シミュレーションベースの展開軌道で新しい公開状態を木に追加。これにより木が動的に成長する(MCTS の展開に相当するが CFR 上で行う)。
- 表記 SoG(s, c): s は総展開シミュレーション数、c は後悔更新ごとの展開数。GT-CFR 反復数は ⌈s/c⌉。

**CVPN (counterfactual value-and-policy network)**: 公開信念状態を入力に、各情報状態の反実仮想価値と方策を出力。AlphaZero の value-policy network の不完全情報版。

**sound continual re-solving**: DeepStack 由来の safe re-solving(範囲と相手の反実仮想価値という要約情報のみから部分ゲーム方策を生成し、exploitability 保証を保つ)を、行動のたびに再帰的に適用。Theorem 1/2 で全体方策の exploitability が O(1/√T) で抑えられることを保証。

**sound self-play**: 自己対戦が生む 2 種の訓練データ — 探索クエリ(GT-CFR が照会した公開信念状態)と full-game 軌道 — で CVPN を更新。AlphaZero(800 シミュレーションで訓練し test 時はより大きく)同様、訓練と推論で探索量を変えられる柔軟性を持つ。

## 主要な結果や知見

- **決定化系を超える**: Scotland Yard の SOTA は決定化・ヒューリスティック評価・プレイアウト方策を使う MCTS 変種 PimBot。SoG(400,1) は、ゲームのごく一部しか探索しないにもかかわらず、1000 万シミュレーションの PimBot に **55% の勝率**で勝ち越す。論文は「決定化は時間が経っても最適戦略に収束しない」ことを実験的に示し、SoG の game-theoretic な探索の優位を実証。
- **exploitability の収束 (Leduc poker / 小 Scotland Yard)**: 訓練ステップ増・探索 T 増で exploitability が低下することを Theorem 1 通りに確認。標準 RL の自己対戦はこの保証を持たない。
- **ポーカー (HUNL)**: SoG(10,0.01) は平均 7±3 mbb/手で勝ち越し、近年の強豪ポーカー AI に匹敵。
- **完全情報**: 囲碁で Pachi(10 万シミュレーション)より 1100 Elo 以上強く、チェスでも Stockfish と比較可能。ただし AlphaZero には及ばない(SoG(16000,10) は AlphaZero に 0.5% 勝率)= 汎用性と引き換えに単一ドメイン特化には劣る。
- **計算コスト**: 実行時間は GT-CFR 反復数の 2 乗にスケール(展開ごとに木全体を再帰評価)。これが SoG の実用上の主な制約。

## 本コンペ(PTCG AI Battle)への応用

- **決定化 ISMCTS の理論的限界を意識する**: 本論文は「決定化は最適に収束しない」ことを明示。PTCG で ISMCTS をベースにしつつも、終盤や搾取が問題になる局面では SoG 的な公開信念状態 + 健全探索の発想を取り入れることで、より頑健な方策が得られる。少なくとも「決定化系には収束限界がある」前提で設計すべき。
- **公開信念状態のモデル化**: PTCG の公開情報(双方の場・トラッシュ・サイド枚数・スタジアム・既プレイ履歴)を s_pub とし、相手手札・山札順の確率分布を range として保持する設計は、相手モデリングの精度を大きく上げる。Ihara 2018 が示した「隠れ情報推定の精度が強さを決める」と整合する。
- **value-policy ネットの併用**: SoG/AlphaZero 流に、オフライン自己対戦で CVPN 相当のネットを訓練し、対戦時の探索の葉評価とロールアウト方策に使う。これは 10 分制約下で深いシミュレーションを省略しつつ精度を保つ実用解(RIS-MCTS の学習評価関数とも共通)。
- **計算コストと 10 分制約の現実的折衷**: GT-CFR は反復数の 2 乗にスケールするため、本コンペの時間予算では full SoG をそのまま回すのは難しい。現実的には ISMCTS をオンライン探索の主軸にし、CFR/SoG 由来の学習済みネットを評価関数として組み込むハイブリッドが妥当。SoG(400,1) のように少ない探索でも強い設定の存在は、軽量運用の希望を与える。
- **デッキ 60 枚最適化への接続**: exploitability を最小化する方向のメタ学習は、deck.csv の構築選択にも適用できる。搾取されにくいデッキ+方策のペアを探す外側ループの評価軸として SoG の健全性指標が使える。

## 出典(URL)

- Schmid, M. et al. (2023). Student of Games: A unified learning algorithm for both perfect and imperfect information games. Science Advances. https://arxiv.org/abs/2112.03178
