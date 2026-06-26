# Cluster 09 — 【一次情報・最優先】公式カードデータと実エンジンAPI

> 🟢 **これは Kaggle 公式コンペデータ（`kaggle competitions download pokemon-tcg-ai-battle`）から取得した実ファイルに基づく一次情報**。他クラスタの推測・二次情報と矛盾する場合、**このファイルが正**。取得日: 2026-06-26（コンペデータは 2026-06-26 01:09 UTC 版）。

## 0. 取得できた公式ファイル一覧

```
Card_ID List_EN.pdf        (138MB)  全カードIDリスト（英語・画像PDF）
Card_ID List_JP.pdf        (182MB)  全カードIDリスト（日本語）
EN_Card_Data.csv           (359KB)  ★全カードデータ（英語）
JP_Card_Data.csv           (443KB)  全カードデータ（日本語）
sample_submission/
  main.py                  公式サンプルagent（ランダム）
  deck.csv                 公式サンプルデッキ（60枚）
  cg/api.py                (27KB) ★実エンジンAPI定義（dataclass+enum）
  cg/sim.py / game.py / utils.py    シミュレータ入口
  cg/cg.dll / libcg.so / libcg-arm64.so / libcg.dylib   ★C++エンジン本体（4プラットフォーム同梱）
```

→ **エンジンは Windows/Linux(x86/arm64)/macOS の4バイナリ同梱。Macでもローカル対戦・検証が可能。**

---

## 1. ✅ カードプール — 確定（「約2,000枚」は CONFIRMED）

`EN_Card_Data.csv` の実データ行数 = **2,022枚**。

> 🔵 **重要な訂正の訂正**: cluster-08 で「約2,000枚は裏取り不可・棄却」としたが、**公式CSVで 2,022枚と確定 → 「約2,000枚」は正しかった**。deep-research が一次データ（ログイン必須のKaggle data）に到達できなかったための誤判定。**一次ソース最優先で、ここで確定とする。** 同様に cluster-07 の「~1,200種/ex151」報道も**不正確**（下記の正しい内訳に置換）。

### カテゴリ内訳（Stage/Type 列）
| 種別 | 枚数 |
|---|---|
| Basic Pokémon | 958 |
| Stage 1 Pokémon | 618 |
| Stage 2 Pokémon | 229 |
| **ポケモン計** | **1,805** |
| Item | 82 |
| Supporter | 61 |
| Pokémon Tool | 28 |
| Stadium | 26 |
| **トレーナーズ計** | **197** |
| Special Energy | 12 |
| Basic Energy | 8 |

### ルール（Rule 列）
| ルール | 枚数 |
|---|---|
| Pokémon ex（2プライズ） | **270** |
| Mega Pokémon ex（3プライズ） | **54** |
| ACE SPEC（デッキに1枚制限） | **29** |
| 通常（n/a） | 1,669 |

### 収録セット（Expansion 列）= 20弾、Scarlet&Violet〜Mega Evolution期の**英語版（international）プール**
DRI 279 / ASC 198 / MEG 197 / TWM 166 / SSP 159 / WHT 142 / PFL 141 / BLK 138 / JTG 130 / POR 126 / TEF 107 / SCR 85 / SFA 57 / PRE 50 / PROMO 13 / SVI 11 / SVE 8 / SVP 4 / PAL 1。

### 「Trainer's Pokémon」サブカテゴリ（Category 列）— 人物別カードが実在
Team Rocket 85 / N 26 / Hop 21 / Ethan 15 / Larry 13 / Steven 12 / Cynthia 11 / Marnie 11 / Erika 11 / Misty 10 / Arven 10 / Iono 9 / Lillie 7。Tera(Stellar/各タイプ) 計約100、Ancient 26、Future 17、Fossil 10。
→ **Hop's Trevenant / Iono's Bellibolt / Ethan's Typhlosion 等の「人物デッキ」は公式カテゴリとして実在**（cluster-04の記述を裏付け）。

### CSV のカラム（17列・自前操縦の特徴量設計に直結）
`Card ID, Card Name, Expansion, Collection No., Stage/Type, Rule, Category, Previous stage, HP, Type, Weakness, Resistance, Retreat, Move Name, Cost, Damage, Effect Explanation`

---

## 2. ✅ 公式サンプルデッキ = Mega Abomasnow ex + Kyogre（Dragapultではない）

`sample_submission/deck.csv`（60枚）の実体:
| 枚数 | ID | カード | 備考 |
|---|---|---|---|
| 4 | 723 | **Mega Abomasnow ex** [Mega ex] | Frost Barrier 200 |
| 4 | 722 | Snover | Icy Snow 30（723の進化元） |
| 2 | 721 | Kyogre | Swirling Waves 130 |
| 4 | 1145 | Mega Signal | Mega ex サーチ |
| 4 | 1227 | Lillie's Determination | ドロー |
| 4 | 1235 | Waitress | 山上6枚から基本エネ1枚付与 |
| 2 | 1205 | Cyrano | サポート |
| 1 | 1158 | Maximum Belt [ACE SPEC] | exに+50ダメージ |
| 35 | 3 | Basic {W} Energy | 水単 |

→ **公式の `main.py` は「ランダムに合法手を選ぶ」ベースライン**（`random.sample(range(len(obs.select.option)), maxCount)`）。デッキ選択時は `obs.select is None` で `read_deck_csv()` が60枚IDを返す。**cluster-04/08で「公式サンプル＝Dragapult」としたのは kiyotah氏の別ノートブック（Code）であって、コンペ同梱の sample_submission とは別物**。両方存在する。

### deck.csv の正確な形式（確定）
- **1行1枚・60行・カードIDの整数のみ**（ヘッダなし）。`deck = [int(csv[i]) for i in range(60)]`。
- Kaggle実行時は `/kaggle_simulations/agent/deck.csv` にも対応。

---

## 3. ✅ 実エンジンAPI（`cg/api.py`）— enum値を確定（cluster-02の値を訂正）

> 🔴 **cluster-02 の `SelectContext`/`OptionType` の整数値は誤り**（参考実装 `wmh/ptcg-abc` の推測値で、SelectContextとOptionTypeを混同していた）。**以下が公式定義の正しい値**。

### `SelectContext`（49種, 0–48）抜粋（正しい値）
`MAIN=0, SETUP_ACTIVE_POKEMON=1, SETUP_BENCH_POKEMON=2, SWITCH=3, TO_ACTIVE=4, TO_BENCH=5, TO_FIELD=6, TO_HAND=7, DISCARD=8, TO_DECK=9, TO_DECK_BOTTOM=10, TO_PRIZE=11, NOT_MOVE=12, DAMAGE_COUNTER=13, DAMAGE_COUNTER_ANY=14, DAMAGE=15, REMOVE_DAMAGE_COUNTER=16, HEAL=17, EVOLVES_FROM=18, EVOLVES_TO=19, DEVOLVE=20, ATTACH_FROM=21, ATTACH_TO=22, DETACH_FROM=23, LOOK=24, EFFECT_TARGET=25, ... DISCARD_ENERGY=30, TO_HAND_ENERGY=31, ... ATTACK=35, DISABLE_ATTACK=36, EVOLVE=37, DRAW_COUNT=38, DAMAGE_COUNTER_COUNT=39, ..., IS_FIRST=41, MULLIGAN=42, ACTIVATE=43, FIRST_EFFECT=44, MORE_DEVOLVE=45, COIN_HEAD=46, AFFECT_SPECIAL_CONDITION=47, RECOVER_SPECIAL_CONDITION=48`

### `OptionType`（17種, 0–16）— これが「手の種類」（正しい値）
`NUMBER=0, YES=1, NO=2, CARD=3, TOOL_CARD=4, ENERGY_CARD=5, ENERGY=6, PLAY=7, ATTACH=8, EVOLVE=9, ABILITY=10, DISCARD=11, RETREAT=12, ATTACK=13, END=14, SKILL=15, SPECIAL_CONDITION=16`
- 各 Option の付随フィールド: `PLAY→index` / `ATTACH,EVOLVE→area,index,inPlayArea,inPlayIndex` / `ABILITY→area,index` / `ATTACK→attackId` / `ENERGY→area,index,playerIndex,energyIndex,count` / `CARD→area,index,playerIndex`。

### `EnergyType`（12種）
`COLORLESS=0, GRASS=1, FIRE=2, WATER=3, LIGHTNING=4, PSYCHIC=5, FIGHTING=6, DARKNESS=7, METAL=8, DRAGON=9, RAINBOW=10(全タイプ), TEAM_ROCKET=11(超or悪)`

### その他 enum（正しい値）
- `AreaType`: DECK=1, HAND=2, DISCARD=3, ACTIVE=4, BENCH=5, STADIUM=7, ENERGY=8, TOOL=9, PRE_EVOLUTION=10, PLAYER=11, LOOKING=12。
- `CardType`: POKEMON=0, ITEM=1, TOOL=2, SUPPORTER=3, STADIUM=4, BASIC_ENERGY=5, SPECIAL_ENERGY=6。
- `SpecialConditionType`: POISON=0, BURN=1, SLEEP=2, PARALYZE=3, CONFUSE=4。
- `SelectType`: MAIN=0, CARD=1, ATTACHED_CARD=2, CARD_OR_ATTACHED_CARD=3, ENERGY=4, SKILL=5, ATTACK=6, EVOLVE=7, COUNT=8, YES_NO=9, SPECIAL_CONDITION=10。
- `LogType`(0–23): SHUFFLE=0,…DRAW=4, PLAY=10, ATTACH=11, EVOLVE=12, ATTACK=15, HP_CHANGE=16, POISONED=17…CONFUSED=21, COIN=22, RESULT=23。

### 観測・盤面の正確な構造（dataclass）
- **`Observation`**: `select: SelectData|None`（デッキ選択時 None）, `logs: list[Log]`（前回選択以降のイベント）, `current: State|None`, `search_begin_input: str|None`。
- **`SelectData`**: `type, context, minCount, maxCount, remainDamageCounter, remainEnergyCost, option: list[Option], deck: list[Card]|None, contextCard: Card|None, effect: Card|None`。
- **`State`**: `turn, turnActionCount, yourIndex, firstPlayer(-1=未定), supporterPlayed, stadiumPlayed, energyAttached, retreated, result(-1=継続/それ以外=勝者index), stadium, looking, players[2]`。
- **`PlayerState`**: `active, bench, benchMax, deckCount, discard, prize(None=裏向き), handCount, hand(相手はNone), poisoned/burned/asleep/paralyzed/confused`。
- **`Pokemon`**: `id, serial, hp, maxHp, appearThisTurn, energies: list[EnergyType], energyCards, tools, preEvolution`。
- **`Card`**: `id, serial, playerIndex`。**`id`＝カード種別（CardDataと対応）, `serial`＝対戦内インスタンス固有**。
- **`CardData`**（`all_card_data()`）: `cardId, name, cardType, retreatCost, hp, weakness, resistance, energyType, basic, stage1, stage2, ex, megaEx, tera, aceSpec, evolvesFrom, skills, attacks(list[int])`。
- **`Attack`**（`all_attack()`）: `attackId, name, text, damage, energies: list[EnergyType]`。
- ⚠️ **`tera` フラグ = 「ベンチにダメージを受けない」**（Dragapult/Mega Starmieのスプレッド対策として重要。テラスタルポケモンはベンチスナイプが効かない）。

---

## 4. ✅ 先読み（探索）API — 公式に実在・完全仕様判明

ルールベースに**ゲーム木探索（lookahead）を載せる**ための公式API。cluster-07で示唆した内容を確定:

```python
search_begin(agent_observation, your_deck, your_prize,
             opponent_deck, opponent_prize, opponent_hand, opponent_active,
             manual_coin=False) -> SearchState   # SearchState{observation, searchId}
search_step(search_id, select: list[int]) -> SearchState   # select=選択option index列
search_end() -> None            # 探索終了（メモリは次回再利用）
search_release(search_id) -> None
```
- **相手の山・手札・サイド・裏向きアクティブを「予測値」として渡して決定論的に先読みできる**（不完全情報を仮定で埋める）。
- **`manual_coin=True` で `COIN_HEAD` のYES/NO選択によりコイン表裏を指定** → 分岐探索が可能。
- エラーコード: 0成功 / 1不正ID・search_idなし / 2アクティブ非ポケ・解放済み / 3対戦終了 / 4選択数違反 / 5不正index / 6重複選択 / 30 agent_ptr破損。
- ローカル対戦実行: `game.py` の `battle_start(deck0, deck1)` → `battle_select(select_list)` ループ、`battle_finish()`。`visualize_data()` で可視化用JSON。

---

## 5. 既存レポートへの確定的な訂正まとめ

| 項目 | 旧記述 | ✅ 正（一次ソース） |
|---|---|---|
| カードプール枚数 | cluster-08「約2,000は棄却」/cluster-07「~1,200種」 | **2,022枚で確定（≒約2,000で正しい）** |
| ex / Mega ex 数 | 「ex 151」 | **ex 270 / Mega ex 54 / ACE SPEC 29** |
| `OptionType`/`SelectContext`値 | cluster-02の値（推測・混同） | **本クラスタの公式値が正**（ATTACK系: SelectContext.ATTACK=35, OptionType.ATTACK=13） |
| 公式同梱サンプルデッキ | 「Dragapult」 | **Mega Abomasnow ex + Kyogre（水単）。main.pyはランダム** |
| カードプールの版 | 「日本版示唆」 | **英語版（international）。20弾、SV〜MEG期** |
| エンジン動作環境 | 不明 | **Win/Linux/arm64/macOS の4バイナリ同梱、Mac可** |

> 訂正の方針: **一次ソース（公式CSV / 公式api.py）＞二次報道＞コミュニティ推測**。本クラスタが最優先。

---

## 6. 実装への即効インサイト

1. **`EN_Card_Data.csv`（17列）をそのまま特徴量DBに使える** — HP/弱点/抵抗/にげ/技コスト/技ダメージ/効果テキストが全カード分。ルールベースのスコアリングはこのCSV駆動で書ける。
2. **`all_card_data()`/`all_attack()` で実行時にも同じ情報が取れる** — `attacks` は attack ID 配列、`Attack.energies` でコスト型まで分かる → cluster-06 の「エネルギー規律（実コスト導出）」がそのまま実装可能。
3. **`tera` フラグに注意** — スプレッド/ベンチスナイプ系デッキ（Dragapult/Mega Starmie）はテラスタル相手にベンチダメージが無効。スコアリングで除外すべき。
4. **先読みAPIでリーサル確定判定が書ける** — `search_begin(manual_coin=True)` で「この攻撃で相手を倒し切れるか」「次に何をされるか」を1〜2手読み。提出の制限時間（1人10分）内で浅い探索なら現実的。
5. **公式サンプルデッキ（Mega Abomasnow ex）は弱いベースライン** — これに勝つのは容易。本命は cluster-04/06 のメタ上位デッキを操縦すること。

---

## 出典（一次）

- Kaggle 公式コンペデータ（要参加登録・ログイン）: `kaggle competitions download pokemon-tcg-ai-battle -f <file>`
  - `EN_Card_Data.csv` / `JP_Card_Data.csv`（全カードデータ）
  - `Card_ID List_EN.pdf` / `_JP.pdf`（カードIDリスト）
  - `sample_submission/`（`main.py`, `deck.csv`, `cg/api.py`, `cg/sim.py`, `cg/game.py`, エンジンバイナリ）
- コンペページ: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle
