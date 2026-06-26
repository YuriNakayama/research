# Cluster 07 — 公式ソース・カードプール・cabt API 一次情報（裏取り）

> automode 自律調査の追補。**公式 cabt ドキュメント（`matsuoinstitute.github.io/cabt`）・公式サイト/FAQ・日本語報道**で裏を取った一次情報寄りの事実。cluster-02（API）/ cluster-03（ルール）を**補強・更新**する位置づけ。

## ⚠️ 確度の注記

Kaggle の competition / code / data ページは JS 依存で WebFetch が描画できず、**実カードリストCSVの中身は直接未確認**。以下は公式 cabt ドキュメント・公式サイト・報道・コミュニティ記事の一致から構成。数値に幅がある箇所は明記する。

---

## 1. カードプール

- **使用可能カード: 約1,200種類（うち Pokémon ex が151種類）** — AUTOMATON が具体数を報道。複数記事は「1,000種類以上」、ITmedia は「数千種類」とより大きな言い回し。**数値は出典により幅がある**（一次CSV未確認）。
- **フォーマット**: 通常スタンダードそのものではなく、**本大会用に限定・調整されたカードプール**。「主催提供の指定リストのカードのみ使用可能」で全ソース一致。
- **収録セット範囲**: 「**ワイルドフォース**～（直近弾）」という記述あり（note 単一ソース）→ **日本版カードプール**を示唆。ただし公式での明示確認は取れず、**要注意の単一ソース情報**。
- **カード識別**: 数値の **card ID（int）**。`all_card_data()` が全カードのメタデータ（`cardId`, `name`, `cardType`, `hp`, `retreatCost`, `energyType`, 進化段階, `attacks`（attack IDの配列）, `weakness`/`resistance`, `ex`/`megaEx`/`tera`/`aceSpec` フラグ等）を `list[CardData]` で返す。攻撃は `all_attack()` で attack ID から引く。
- **`cardId` と `serial` の2系統**: `cardId`＝静的なカード種別ID、`serial`＝対戦内インスタンス固有番号。
- **`deck.csv`**: card ID を**1行1枚・計60行**並べた CSV（`deck = [int(line) for line in f if line.strip()]`）。

## 2. 公式スターター教材と提出フォーマット

Kaggle コンペページから配布:
- **エンジン cg-lib**: 実体は **C++ 共有ライブラリ（`libcg.so` / `cg.dll`）**。`cabt` の `sim` モジュールが `GameInitialize` / `BattleStart` / `Select` / `SearchBegin` / `AllCard` 等をバインド。
- **サンプルノートブック・カードデータ・ルールドキュメント**。
- 環境は `kaggle-environments==1.30.1`（ラダーと同一）でピン留め。`make("cabt")` で生成。

**提出物 `submission.tar.gz`（トップレベルに）**:
- `main.py` — エージェント本体
- `deck.csv` — 60枚分の card ID
- `cg/` — エンジン一式

- **提出は1日5回まで、直近2件がスコアリング対象**。
- **公式FAQ: 「AIエージェントにデッキを構築させる必要はない」** — デッキは**人が用意**し、エージェントは**プレイのみ**。
- コミュニティ知見（タナカナウ）: API を推測で作らず**公式 starter / sample agent / sample submission の仕様に完全準拠**せよ（カード名を勝手に創作しない）。

## 3. cabt エンジン仕様（API一次情報）

### 制限時間
- **1プレイヤーあたり最大10分のチェスクロック方式。使い切ると即敗北**（複数ソース一致）。公式紙ポケカの「合計25分」とは異なる。

### 観測 `Observation`
- `select: SelectData | None`（**デッキ選択時は `None`** → 60枚の card ID を返す）
- `logs: list[Log]`（前回選択以降のイベント履歴）
- `current: State | None`（現在の盤面）
- `search_begin_input: str | None`

### 行動
- `obs["select"]["option"]`（`list[Option]`）の**インデックス**を `list[int]` で返す。個数は `minCount` / `maxCount` 規定。
- `SelectData` は `type`（MAIN/CARD/ENERGY/YES_NO 等）, `context`（ATTACK/SWITCH/DISCARD 等）, `remainDamageCounter`, `remainEnergyCost` 等を持つ。

### 盤面 `State` / `PlayerState`
- `State`: `turn`, `yourIndex`, `firstPlayer`, `players: list[PlayerState]`, `stadium`, `supporterPlayed`, `retreated`, `result` 等。
- `PlayerState`: `active`, `bench`, `hand`（相手は `None`）, `discard`, `prize`, `deckCount`, `benchMax`、**特殊状態 bool フラグ** `poisoned`/`burned`/`asleep`/`paralyzed`/`confused`。
- `SpecialConditionType`: POISON(0)/BURN(1)/SLEEP(2)/PARALYZE(3)/CONFUSE(4)。
- `EnergyType`: COLORLESS〜TEAM_ROCKET の12種（RAINBOW=10 等）。
- `AreaType`: DECK/HAND/DISCARD/ACTIVE/BENCH/PRIZE/STADIUM/ENERGY/TOOL/PRE_EVOLUTION/PLAYER/LOOKING。

### 🔑 先読み（探索）API — **これは新発見・実装上の大武器**
- `search_begin(...)` → `SearchState`、`search_step(search_id, select)`（`select` は option インデックスの `list[int]`）→ 次状態、`search_end()` / `search_release()` でクリーンアップ。
- **`search_begin(manual_coin=True)`**: `True` のときエージェントが `SelectContext.COIN_HEAD` の YES/NO 選択で**コインの表裏を指定**できる → 相手デッキ/手札の予測込みで**決定論的に先読みシミュレーション**を回せる設計。
- → ルールベースに**浅いゲーム木探索（lookahead）を載せられる**ことを意味する。リーサル確定手の探索や「この攻撃を撃ったら次相手に何をされるか」の1〜2手読みに使える。cluster-06 のロードマップに「探索の追加」を選択肢として加える価値がある。

### 特殊状態・コインの扱い
- 報道は「引き・コイントスのランダム要素が絡む**不完全情報ゲーム**」と説明。
- 対戦実行（本番）では特殊状態の解決はエンジン内部で自動。**先読みAPIでのみ** `manual_coin` でコインを制御できる。
- ⚠️ 解決順序など内部アルゴリズムの公式詳細記述は未取得。

## 4. 通常ポケカとのルール調整（確認できた相違点）

- 基本は公式対戦ルール準拠だが**本大会用に独自調整**。明示できた相違:
  1. **限定カードプール**（指定リストのみ、通常スタンダードと非一致）。
  2. **持ち時間が1人最大10分のチェスクロック**（公式の合計25分と異なる）。
  3. **AIにデッキ構築をさせない**（`deck.csv` は人が用意）。
- 禁止カード・特殊裁定など網羅的な差分一覧の公開文書は**見つからず**（Kaggle data セクション参照とされるが中身未確認）。

## 5. 日本語コミュニティの技術リソース（実装の足がかり）

| ソース | 内容 |
|---|---|
| **公式 cabt ドキュメント** | API/sim モジュールの一次仕様（`matsuoinstitute.github.io/cabt`） |
| **公式サイト / FAQ** | `ptcg-abc.pokemon.co.jp`（「AIにデッキ構築させない」等） |
| **AICU（#ポケカABC）** | コンペ概要・観測/行動の考え方・公式doc導線 |
| **タナカナウ（note）** | 最小提出（`main.py`+`deck.csv` トップレベル同梱）、公式仕様準拠の徹底、簡易スコアリング例 |
| **Qiita「ポケカABCにチャレンジ #1」(Te2hi-ro)** | `obs["select"]=None` の扱い、`agent(obs_dict)->list[int]`、kaggle-environments上の構成 |
| **やきいも（note）** | 初級（ランダム→強カード優先）/中級（ifルールベース）/上級（強化学習）の3段階 |
| **GitHub `wmh/ptcg-abc`** | ルールベース3エージェント＋評価ツール＋ブラウザ対戦サンドボックス。「単純デッキが最良ラダーElo」「実ラダーA/Bが唯一の審判」「イワパレス(Crustle)メタ」知見 |

---

## 既存レポートへの更新点（差分）

- **cluster-02 への追記**: cabt には **`search_begin/search_step/search_end` の先読みAPI** があり、`manual_coin=True` で決定論的シミュレーションが可能 → ルールベースに lookahead を載せる選択肢が公式に用意されている。
- **cluster-03 への追記**: カードプールは**約1,200種・ex151**（数値に幅あり）、**日本版示唆（ワイルドフォース～、要裏取り）**。特殊状態は `PlayerState` の bool フラグ＋`SpecialConditionType` 列挙。
- **cluster-01 への補強**: 公式の一次ドキュメント（cabt doc・公式サイト・FAQ）の所在が判明。**実装前に必ず一読すべき一次情報源**。

---

## 出典

- Kaggle Simulation: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle
- Kaggle Strategy: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy
- 公式 cabt ドキュメント: https://matsuoinstitute.github.io/cabt/
- 公式 cabt API: https://matsuoinstitute.github.io/cabt/api.html
- 公式 cabt sim: https://matsuoinstitute.github.io/cabt/sim.html
- 公式サイト ポケカABC: https://ptcg-abc.pokemon.co.jp/
- 公式 FAQ: https://ptcg-abc.pokemon.co.jp/faq/index.html
- GitHub wmh/ptcg-abc: https://github.com/wmh/ptcg-abc/blob/main/README.md
- AICU note: https://note.com/aicu/n/ne9cc5c7b4157 / https://corp.aicu.ai/ja/pokemon-20260616
- タナカナウ note: https://note.com/tanaka_now/n/n707a493e0d8a
- Qiita (Te2hi-ro): https://qiita.com/Te2hi-ro/items/db57cc682c1fb71eeb9c
- やきいも note: https://note.com/yakiimo_blog/n/n71a63378b943
- pokeka_ryo note（セット範囲）: https://note.com/pokeka_ryo/n/n3873f44cc783
- AUTOMATON（カード数・メタ）: https://automaton-media.com/articles/newsjp/ai-battle-challenge-20260617-450193/
- ITmedia（不完全情報・10分）: https://www.itmedia.co.jp/aiplus/article/2606/17/2000000098/
- 攻略大百科: https://premium.gamepedia.jp/pokeca/archives/23606
- 株式会社ポケモン PR TIMES: https://prtimes.jp/main/html/rd/p/000000872.000026665.html
- HEROZ リリース: https://heroz.co.jp/release/2026/06/16_press01-5/
