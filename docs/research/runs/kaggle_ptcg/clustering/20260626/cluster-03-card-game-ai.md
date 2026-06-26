# cluster-03: カードゲーム / TCG AI コンペ

> **ゲーム種が同一**（デッキ構築 + 不完全情報バトル + ドロー RNG）。本コンペに最も直接的なアナロジー。

## A. Legends of Code and Magic (LOCM) / Strategy Card Game AI Competition

- **年/会場**: CodinGame 2018 → IEEE CEC & IEEE CoG 2019–2022（Kowalski & Miernik, U. Wrocław）。
- **構成**: 2 フェーズ — **デッキ構築**（1.x = 共有カードからの arena draft、1.5 = constructed、**毎試合 新カードセット生成**で hardcode 封じ）+ **バトル**。不完全情報（相手手札/山札隠蔽）+ ドロー RNG。
- **勝者の変遷（何が何に勝ったか）**:

  | 年 | 勝者 | 手法 |
  |----|------|------|
  | 2019–20 | **Coac** | 深さ 3 minimax + alpha-beta + **ヒューリスティック枝刈り**、move ordering、リーサル検知 |
  | CoG 2020 | **Chad** | MCTS + 明示的 **相手手札予測** |
  | CoG 2021 | **DrainPowerAggressive** | 1-ply シミュレーション + 調整済みヒューリスティック |
  | CoG 2022 | **ByteRL** | **Deep RL + optimistic smooth fictitious play**、end-to-end LSTM 方策 |

- **核心的発見**: 安価でよく設計された **枝刈りが探索深さに勝つ**。組織が「毎試合カードセット生成」で暗記を封じるまで hardcode draft が支配的 → 封じた **2022 にようやく NN/RL が優勝**（ByteRL は Hearthstone top-10 人間にも勝利と報告）。
- **転用教訓**: まず move ordering・リーサル検知・高速ヒューリスティック評価関数に投資。ゲーム理論的自己対戦 RL (fictitious play→Nash) が勝つのは、環境が固定ラインの暗記を許さなくなったとき。
- 出典: [LOCM summary, arXiv:2305.11814](https://arxiv.org/abs/2305.11814), [ByteRL, arXiv:2303.04096](https://arxiv.org/abs/2303.04096), [legendsofcodeandmagic.com](https://legendsofcodeandmagic.com/)

## B. Hearthstone AI Competition (IEEE CIG/CoG, 2018–2020)

- **基盤**: SabberStone シミュレータを部分観測向けに改造。トラック: Premade Deck Playing / User Created Deck Playing。
- **構成**: 不完全情報 + **重い RNG**（ランダム効果、Discover、山札順）。
- **勝者 (2020)**: Premade 上位 3 つ *すべて* **Dynamic Lookahead**（尤もらしい結果上の深さ制限シミュレーション + ヒューリスティック評価、勝者 72.3%）。User-created 勝者は **トップ meta デッキ (Pirate Warrior) + MCTS/EA 調整**。全年通じて勝者は探索系（Rolling Horizon Evolution, MCTS, Pruned BFS, Dynamic Lookahead）+ 状態評価関数。
- **転用教訓**: 重い RNG 下では **determinized/サンプリング済み深さ制限 lookahead + 強い評価関数** が再現性ある王道（完全な確率木解決は不要）。そして **デッキ選択自体がレバー** — 強いデッキ + そこそこの player は、賢い player + 弱いデッキに勝つ。
- 出典: [hearthstoneai.github.io](https://hearthstoneai.github.io/)

## C. その他 TCG/CCG 研究

- **Magic: The Gathering は Turing 完全**（Churchill et al., FUN 2020）→ 最適プレイは **決定不能**。**遊戯王** も同様に困難/決定不能。**教訓: リッチ TCG に厳密ソルバは存在しない — 有界 lookahead + ヒューリスティック + 学習方策は近道でなく必須**。
  - 出典: [MtG Turing-complete, arXiv:1904.09828](https://arxiv.org/abs/1904.09828)
- **遊戯王 RL**: YGO-Agent / ygoenv（envpool + ygopro-core）。**教訓: 忠実な rules engine の高速 vectorized Gym ラッパーが実務的前提 — アルゴリズムでなくシミュレーション throughput がボトルネック**。
  - 出典: [ygo-agent](https://github.com/sbl1996/ygo-agent)
- **RLCard** (Zha et al. 2019): Leduc/Hold'em/闘地主/麻雀/UNO/Gin Rummy のツールキット。**CFR, DQN, NFSP, Deep CFR** を同梱。CFR は厳密だが非スケーラブル、**NFSP**（自己対戦→近似 Nash）が大規模隠蔽情報カードゲームの標準。**教訓: ゲーム規模に手法を合わせる — 表形式 CFR でなく自己対戦 + 関数近似が要る**。
  - 出典: [RLCard, arXiv:1910.04376](https://arxiv.org/abs/1910.04376)

## D. 本コンペへの転用まとめ

1. **最初に作るべきは「高速な状態評価関数 + リーサル検知 + move ordering」** — LOCM/Hearthstone を長年制した最小構成。
2. **Dynamic Lookahead（determinized 深さ制限シミュレーション）** が RNG + 不完全情報下の再現性ある王道。
3. **デッキ構築は独立した勝因** — Strategy track の「デッキ構築の独創性」とも直結。強いデッキ × まともな player を狙う。
4. **暗記が封じられた本コンペ（2,000 枚プール + 隠蔽情報）は、LOCM 2022 と同じく「学習/均衡探索が勝つ側」** に倒れている。
5. **忠実で高速な engine ラッパー**（cabt SDK の vectorize）を最優先で整備 — throughput が学習量を決める。
