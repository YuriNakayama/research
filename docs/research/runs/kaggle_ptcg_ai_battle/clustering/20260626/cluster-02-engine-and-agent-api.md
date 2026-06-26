# Cluster 02 — cabtエンジンとエージェントAPI

> **実装の核心**。`agent(obs_dict)` という1関数を書くだけ。ゲームの進行・合法手生成はエンジンがやってくれる。

## エージェント契約（最重要）

```python
def agent(obs_dict) -> list[int]:
    ...
```

- **デッキ選択時**: `obs_dict["select"] is None`（あるいは `obs.select is None`）→ **60枚のカードIDのリスト** を返す。
- **対局中**: `obs.select` が存在 → **合法手（option）のインデックスのリスト** を返す（`minCount`〜`maxCount` 個）。
- **制約**:
  - **絶対にクラッシュしてはいけない**（常に合法なフォールバックを返す）。
  - **手番ごとの制限時間を守る**（プレイヤーあたり累計**最大10分**。超過＝即敗北）。
- 特殊状態（ねむり等のコイン判定）は**エンジン内部で自動処理**。エージェントは常に合法手しか提示されないので、特別扱い不要。

## 観測（observation）の構造

`to_observation_class(obs_dict)` で型付きオブジェクトに変換。

- `obs.current` — 現在のゲーム状態（`State`）
  - `.turn`, `.yourIndex`, `.firstPlayer`, `.supporterPlayed`, `.stadiumPlayed`, `.energyAttached`, `.stadium`, `.players[2]`
- `obs.select` — 現在の意思決定点
  - `.context: SelectContext` — **どの種類の決定か**（下表）
  - `.option[]` — 合法手のリスト（各 option に `.type: OptionType` と対象情報）
  - `.minCount`, `.maxCount` — 選ぶ個数の下限・上限
- ゲーム終了判定: `obs.current.result != -1`（値が勝者インデックス）

### `SelectContext`（決定の種類）

> ✅ 以下は要点抜粋。**全49種（0–48）の公式定義・正確な整数値は [`cluster-09`](cluster-09-PRIMARY-official-data-api.md)（公式 `cg/api.py` 由来の一次情報）を参照**。特に `ATTACK=35`（SelectContext側）/ `EVOLVE=37` / `COIN_HEAD=46` 等は cluster-09 で確定。

| 値 | 意味 |
|---|---|
| MAIN=0 | メインフェイズ（手札プレイ／進化／エネ付け／特性／攻撃／終了） |
| SETUP_ACTIVE=1 / SETUP_BENCH=2 | 初期配置 |
| SWITCH=3 / TO_ACTIVE=4 / TO_BENCH=5 | ポケモン入替・前/ベンチ送り |
| TO_HAND=7 | 手札に戻す |
| DISCARD=8 | トラッシュ選択 |
| DAMAGE_COUNTER=13/14 | ダメカン/ダメージの配置先（スプレッド系） |
| ATTACH_FROM=21 / ATTACH_TO=22 | エネ付けの元/先 |
| IS_FIRST=41 | 先攻/後攻の選択 |
| MULLIGAN=42 | マリガン判断 |

### `OptionType`（各手の種類）

| 値 | 意味 |
|---|---|
| NUMBER=0 / YES=1 / NO=2 | 数値・二択 |
| CARD=3 | カード選択 |
| ENERGY=6 / ATTACH=8 | エネルギー付け |
| PLAY=7 | 手札からプレイ |
| EVOLVE=9 | 進化 |
| ABILITY=10 | 特性使用 |
| RETREAT=12 | にげる |
| ATTACK=13 | 攻撃 |
| END=14 | パス/ターン終了 |

### カード/技データ（静的）

- `all_card_data()` → `card.cardId/hp/weakness/resistance/ex/megaEx/stage1/stage2/attacks/skills/evolvesFrom/retreatCost`
- `all_attack()` → `attack.attackId/name/damage/energies/text`
- `Pokemon`: `.hp`（現在HP）, `.maxHp`, `.energies`（`EnergyType`のリスト）, `.energyCards`, `.tools`, `.id`
- `EnergyType`: COLORLESS=0, GRASS=1, FIRE=2, WATER=3, LIGHTNING=4, PSYCHIC=5, FIGHTING=6 …

---

## 実装アーキテクチャ（参考実装 `wmh/ptcg-abc` の `BasePolicy` パターン）

提出物は実質これだけ:

```
agents/<name>/
  main.py           # agent(obs_dict) のエントリ
  deck.csv          # 60枚のカードID
  cg/               # cg-lib（API定義。エンジン本体）をコピー/symlink
  policy_base.py    # 共有スカフォールド（任意。下記）
```

### 設計の肝：3つの責務分離

1. **汎用「エネルギー規律（energy discipline）」**
   各技の**実コストから導出**して、「まだどの技も撃てないときだけエネを付ける」。これにより**過充填（over-fill）が構造的に起きない**。
   ```python
   def should_fuel(self, p):
       # 自己エネ量で威力が伸びる技を持つなら付け続ける。
       # そうでなければ「どの技も撃てない間だけ」付ける。
       if any(aid in SELF_SCALING_ATTACKS for aid in p.attacks): return True
       return not self.can_attack(p)   # type-aware: エネ種別まで照合
   ```

2. **`SelectContext` ごとのディスパッチ**（コンテキスト別サブスコアラー）
   ```python
   def score(self, o):
       if self.context == SelectContext.IS_FIRST:
           return 100 if (o.type==YES)==self.go_first() else 0
       if o.type == OptionType.PLAY:   return self.score_play(o)    # → hand_score(card_id)
       if o.type in (ENERGY, ATTACH):  return self.score_attach(o)  # should_fuelでゲート
       if o.type == OptionType.EVOLVE: return self.score_evolve(o)
       if o.type == OptionType.ATTACK: return self.score_attack(o)
       ...
   ```

3. **絶対にクラッシュしない2段ガード**
   ```python
   def agent(obs_dict):
       try:
           obs = to_observation_class(obs_dict)
           if obs.select is None: return my_deck          # デッキ選択
           try:
               return policy_cls(obs).choose()            # 通常の政策
           except Exception:
               return legal_fallback(obs.select)          # 政策が落ちても最小合法手
       except Exception:
           return legal_fallback_from_dict(obs_dict)      # 観測の展開すら失敗→超フォールバック

   def legal_fallback(select):
       n = len(select.option)
       return list(range(min(max(0, select.minCount), n)))  # 常に合法
   ```

### スコアリングと選択

- 各合法手に**数値スコア**を付け、降順ソート。
- `normalize_selection`: スコア>0 の手を `maxCount` まで採用。`minCount` に満たなければ残りで埋める（**負スコアの不要手は選ばない**）。

### 「公式サンプル方式」（より明示的なスコアリング）

参考実装が最終的に推している方針は、`BasePolicy` の汎用推論ではなく、**公式Dragapultサンプルのように「カード毎・コンテキスト毎に明示スコアを直書き」**するスタイル:

```python
def hand_score(id):
    if id == Dreepy:      return 18000 if main_count<3 else 1000
    elif id == Drakloak:  return 20000 if can_evolve_dreepy else 3000
    elif id == Dragapult_ex: ...   # 4分岐
    elif id == Fezandipiti_ex: ... # 3分岐
    ...
```
各分岐の数値は**トップ人間プレイヤーの棋譜（divergence分析）から校正**する（後述cluster-06）。

---

## ローカル検証ツール（参考実装の構成）

| ツール | 用途 |
|--------|------|
| `tools/check_agent.py` | **変更後に必ず実行**。過充填0・クラッシュ/フォールバック0・合法選択を保証 |
| `tools/cabt_eval.py <dir> <opp> <games>` | 公式cabt環境で勝率測定（**40局は±10ptノイズ。80局以上で**） |
| `tools/cabt_gauntlet.py` | 実トップ層の構成比でガントレット（Trevenant41.5%→…） |
| `tools/meta_analyze.py <zip> --elo 1150` | 棋譜zip→アーキタイプ分布・勝率・相性行列（**毎日**） |
| `tools/replay_divergence.py` / `divergence_decode.py` | 棋譜を自分のagentで再生→**人間との手の食い違い**をカード/技名で集計（操縦改善の中核） |
| `tools/autopsy.py` | 上記を1コマンドで回す日次パイプライン |

> ⚠️ **cabtはノイジー（40局±10pt）かつラダー順位を誤予測する**。対戦相手の「操縦」が実トップ人間より弱いため。**回帰検出（バグ取り）には有効だが戦略のオラクルではない**。最終判断は実ラダー。

---

## 出典

- 参考OSS実装: [`github.com/wmh/ptcg-abc`](https://github.com/wmh/ptcg-abc)（README + `CLAUDE.md` + `agents/_base/policy_base.py` 等）
- 公式サンプル（Kaggle Code、要ログイン）: "A Sample Rule-Based Agent Dragapult ex Deck", "Heuristic Agent & Data Pipeline", "PPO Agent"
- [AICU — 技術仕様（cabt Engine, 入出力, 10分制限）](https://note.com/aicu/n/ne9cc5c7b4157)
