# 04 ISMCTS — 情報集合モンテカルロ木探索

## メタ情報

| 項目 | 内容 |
|------|------|
| タイトル | Information Set Monte Carlo Tree Search |
| 著者 | Peter I. Cowling, Edward J. Powley, Daniel Whitehouse（University of York） |
| 掲載 | IEEE T-CIAIG, Vol. 4(2), pp. 120–143, 2012 |
| DOI | 10.1109/TCIAIG.2012.2200894 |
| 入手元 | White Rose（eprints.whiterose.ac.uk/75048）、IEEE Xplore |
| 関連 | "Determinization and Information Set MCTS"（CIG 2011）／ "Information capture and reuse strategies in MCTS"（AIJ 2014） |

> ⚠️ IEEE 掲載 PDF はバイナリ破損/403 で本文の直接パースに失敗。手法・結果は同著者の CIG 2011・AIJ 2014 と複数の二次資料で相互照合。精密値（勝率テーブル等）は IEEE 原典で再確認推奨。

## 概要

MCTS は完全情報・決定論ゲームで成功したが、隠れ情報・不確実性ゲームへの適用に課題がある。本論文はゲーム状態の木でなく **情報集合（情報集合 = あるプレイヤー視点で区別できない状態の集合）の木** を直接探索する3種のアルゴリズム（総称 ISMCTS）を提案。古典的 determinization / PIMC search が抱える strategy fusion と non-locality の少なくとも一部を緩和する。

## 手法の核心

- **determinization / PIMC**: determinization = 現在の情報集合からランダムに1状態をサンプリングし隠れ情報を確定させた完全情報インスタンス。PIMC = 複数 determinization それぞれに独立に完全情報 MCTS を走らせ集約。容易だが構造的問題を抱える。
- **情報集合の木**: ISMCTS は情報集合をノードとする1本の木を構築・再利用。各反復冒頭で determinization を1つサンプリングし、その determinization で **合法な行動のみ** に選択・展開を制限して木を降りる。これにより (1) determinization 間で統計を1本の木に蓄積・共有でき計算効率が良い、(2) 反復ごとに合法手集合が変わる **subset-armed bandit problem** が生じる（UCB はその反復で合法な子に限定）。
- **3変種**:
  1. **SO-ISMCTS（Single-Observer）**: ルートプレイヤー1人視点。最も単純だが相手の部分観測可能な手を区別できず strategy fusion が残る。
  2. **SO-ISMCTS + POM**: 相手の部分観測可能な手による strategy fusion を緩和。代償に相手モデルが弱まる（相手はルート視点で区別できない行動の間でランダム選択と仮定）。
  3. **MO-ISMCTS（Multiple-Observer）**: プレイヤーごとに別々の木を保持、各反復で全木を同時降下。部分観測可能な手を最も整合的に扱える。
- **隠れ情報の扱い**: 明示的な確率分布で推論せず determinization サンプリングで近似。情報集合内の各状態を等確率とみなす（→限界）。

## 主要な結果

| ゲーム | 特性 | 結果（傾向） |
|--------|------|--------------|
| Lord of the Rings: The Confrontation | 深い探索が必要 | ISMCTS が determinized UCT を一貫して上回る |
| Phantom (4,4,4) | strategy fusion の悪影響大 | ISMCTS が determinization を上回る |
| Dou Di Zhu（闘地主） | fusion/non-locality 影響小、情報集合木の分岐因子が桁違いに大 | ほぼ互角（determinization 数と反復数が十分なら差は小） |

> ⚠️ 具体的な勝率・有意性は二次資料の図キャプションからの傾向記述。正確なテーブルは IEEE 原典確認推奨。

## Pokémon TCG AI Battle Challenge への示唆

- **最も実装容易な不完全情報探索ベースライン**: 学習不要・ルールエンジンさえあれば動く。RL ベースラインより先に立てられる強力な初手。
- **cabt の合法手リストとの相性**: 各反復が「その determinization で合法な行動のみに制限」する設計なので、cabt が返す合法手リストをそのまま subset-armed bandit の選択肢に渡せる。
- **determinization で相手手札/山札順をサンプル**: 自分が観測できる情報（公開フィールド・トラッシュ・ベンチ・自分の手札・既知プライズ枚数）に矛盾しないよう、相手手札・両者の山札順・サイドの中身を1つサンプリング → 完全情報インスタンス上で UCT。デッキリスト既知（構築戦）なら残カード母集団が確定しサンプリングの整合性が取りやすい。
- **段階的アプローチ**: まず SO-ISMCTS（必要なら +POM）で立ち上げ、頭打ちなら MO 化（本推奨は当研究の判断であり論文の直接主張ではない）。

## 限界・注意

- **strategy fusion**: 同一情報集合内で隠れ情報を暗黙的に使い分けてしまう。SO+POM/MO で緩和されるが完全除去はされない。
- **non-locality**: 最適 payoff が部分ゲームに再帰的に定義できず、相手の情報集合誘導能力を無視。
- **等確率仮定**: 情報集合内の各状態を等確率とみなすため、相手の行動から得られるベイズ的信念更新・予測モデルを素朴に組み込めない。PTCG では「相手が特定カードをプレイした事実」で手札分布が偏るため注意（後続研究で予測モデル統合の試みあり）。
- 分岐因子が極端に大きいゲーム（PTCG の1ターン内連鎖）では木が肥大化し効率低下しうる。

## 出典

- White Rose: https://eprints.whiterose.ac.uk/id/eprint/75048/
- York Research DB: https://pure.york.ac.uk/portal/en/publications/information-set-monte-carlo-tree-search/
- 先行 CIG 2011: https://www.researchgate.net/publication/254060888_Information_Set_Monte_Carlo_Tree_Search
- 拡張 AIJ 2014: https://www.sciencedirect.com/science/article/pii/S0004370214001052
- DOI: 10.1109/TCIAIG.2012.2200894
