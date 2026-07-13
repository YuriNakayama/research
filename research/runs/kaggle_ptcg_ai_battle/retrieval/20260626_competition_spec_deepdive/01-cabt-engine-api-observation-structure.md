# cabt Engine API と obs_dict (logs/current/select) 構造の完全解剖

## 概要

cabt Engine は、松尾研究所が PTCG AI Battle Challenge のために `kaggle-environments` 上に構築したポケモンカードゲーム(スタンダード)対戦シミュレータである。公式 API ドキュメント (matsuoinstitute.github.io/cabt) に基づき、本レポートはエージェント契約 `agent(obs_dict) -> list[int]` を中心に、観測構造(`logs`/`current`/`select`)、`PlayerState`、`State`、`SelectType`/`SelectContext`/`OptionType`、デッキ選択フェーズ、探索 API (`search_begin`/`search_step`) を技術的に整理し、本コンペで合法手 index を正しく返すために必要な最小知識を体系化する。

エージェントは毎ターン「ゲームログ・盤面状態・その時点での合法手リスト」を Observation として受け取り、適切な行動の **index(整数のリスト)** を返す。`select.option` のインデックスがそのまま Action になる、という設計が全ての出発点である。

## 手法の要点

**Observation の 3 フィールド構造**

- `Observation.logs: list[Log]` — 前回選択以降に発生したイベント列(`DRAW`/`PLAY`/`ATTACH`/`EVOLVE`/`ATTACK`/`HP_CHANGE`/`POISONED`/`RESULT` など `LogType`)。相手の公開行動・コイン結果・ダメージ推移を観測する唯一の手段で、相手手札推定(belief)の入力になる。
- `Observation.current: State | None` — 盤面状態。**デッキ選択フェーズでは `None`**。`State` には `turn`(0 は先攻ターン1前)、`turnActionCount`、`yourIndex`(自分が 0/1 どちらか)、`firstPlayer`(未確定は -1)、`supporterPlayed`/`stadiumPlayed`/`energyAttached`/`retreated`(そのターンの使用済みフラグ)、`result`(勝者 index、進行中は -1)、`stadium: list[Card]`(0 or 1 要素)、`looking`(閲覧中カード)、`players: list[PlayerState]`(2 要素)が含まれる。
- `Observation.select: SelectData | None` — 選択プロンプト。**デッキ選択時は `None`**。`type: SelectType`、`context: SelectContext`、`minCount`/`maxCount`(選択数の下限・上限)、`option: list[Option]`(合法手本体)、`deck`(デッキ選択時のみ)、`contextCard`/`effect`(選択を誘発したカード)、`remainDamageCounter`/`remainEnergyCost` を持つ。

**SelectType による option 解釈の分岐**

`select.type` が option の意味を決める: `MAIN(0)`(PLAY/ATTACH/ATTACK/RETREAT/END/ABILITY の主行動メニュー)、`CARD(1)`、`ENERGY(4)`、`ATTACK(6)`、`EVOLVE(7)`、`COUNT(8)`、`YES_NO(9)`、`SPECIAL_CONDITION(10)` など。`context: SelectContext` はさらに目的を示す(`SETUP_ACTIVE_POKEMON`/`SWITCH`/`DISCARD`/`ATTACK`/`MULLIGAN`/`COIN_HEAD` など)。`Option` は `type: OptionType` と、`area`/`index`/`playerIndex`/`attackId`/`cardId`/`energyIndex`/`count` 等の付随フィールドを持つが、**エージェントが返すのは option リスト内の index** であって付随フィールドそのものではない点が重要。

**PlayerState(自分と相手で可視性が非対称)**

`active: list[Pokemon|None]`(0 or 1)、`bench`(最大 `benchMax`=通常5)、`hand: list[Card]|None`(**相手の hand は None、`handCount` のみ可視**)、`deckCount`、`discard`、`prize: list[Card|None]`(裏向きは None、bottom→top 順)、状態異常フラグ `poisoned`/`burned`/`asleep`/`paralyzed`/`confused`。相手の deck/hand/prize が不可視であることが不完全情報性の核心。

**探索 API による先読み**

`search_begin(agent_observation, your_deck, your_prize, opponent_deck, opponent_prize, opponent_hand, opponent_active, manual_coin=False) -> SearchState` は、**相手の未知情報を予測カード ID で埋めて(determinize して)**完全情報ゲームのインスタンスを構築し、`search_step(search_id, select) -> SearchState` で1手ずつ前進させる。`search_end`/`search_release` でメモリ解放。`all_card_data()`/`all_attack()` でカード/技メタ情報(HP・必要エネルギー・ダメージ・効果)を取得し知識ベースを構築する。

## 主要な結果や知見

- **合法手 index 設計**は実装を単純化する一方、`option` の意味は `type`/`context` に依存して動的に変わるため、エージェントは「どの SelectContext か」を判別してからスコアリングする必要がある(`per-SelectContext scoring`)。
- ランダムエージェントの最小実装は `random.sample(range(len(obs["select"]["option"])), obs["select"]["maxCount"])` の一行で書け、`minCount`/`maxCount` を満たす個数のインデックスを返すのが契約。
- `current=None`(デッキ選択)と通常選択の分岐を最初に行わないとクラッシュする。本コンペは「クラッシュ即敗北・時間切れ即敗北」なので、`try/except` で合法 fallback(例: `[0]` や `list(range(minCount))`)を必ず返す防御実装が必須。
- `search_begin` の determinization 入力は、相手 deck/prize/hand を「予測」で埋める設計であり、後述の ISMCTS / determinized MCTS とそのまま接続できる。

## 本コンペ(PTCG AI Battle)への応用

- **obs_dict パーサの最優先実装**: `current is None` → デッキ選択 → `deck.csv` 由来の 60 枚 ID を返す。それ以外 → `select.type`/`context` で分岐し option をスコアリング。この骨格を最初に固めることで「合法手 index を返す」契約違反による失格を防げる。
- **10 分予算との接続**: `search_begin/search_step` は強力だが 1 ノードごとにエンジン呼び出しコストがかかる。1 プレイヤー最大 10 分・時間切れ即敗北のため、ターンあたりの探索ノード数に上限を設け、必ず時間内に最良 fallback を返すウォッチドッグ(残り時間監視)を組み込む。序盤の自明手(エネルギー添付・進化)はルールベースで即決し、探索予算を勝負どころ(攻撃選択・サイド取り)に配分する。
- **不完全情報への接続**: 相手 `hand=None`・`prize=None`・`deck` 不可視という obs 構造は、`logs` から公開情報を蓄積して belief を更新し、`search_begin` の `opponent_*` 引数に複数のサンプル(determinization)を渡して平均する設計を自然に要求する。
- **デッキ 60 枚同時最適化への接続**: `all_card_data()`/`all_attack()` で約2000枚プールの数値特徴を取得し、デッキ評価・シナジー分析の特徴量に使う。デッキ選択フェーズで返す 60 ID は `deck.csv` と一致させる。

## 出典(URL)

- PTCGABC cabt Engine Documentation: https://matsuoinstitute.github.io/cabt/
- cabt Engine API module: https://matsuoinstitute.github.io/cabt/api.html
- PTCG AI Battle Challenge Simulation (Kaggle): https://www.kaggle.com/competitions/pokemon-tcg-ai-battle
- ptcg-abc README (非公式リファレンス実装): https://github.com/wmh/ptcg-abc/blob/main/README.md
