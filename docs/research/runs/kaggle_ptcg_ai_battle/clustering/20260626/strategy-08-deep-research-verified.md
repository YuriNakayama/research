# Cluster 08 — deep-research 検証結果（裏取り・訂正・更新）

> `deep-research` ワークフロー（5角度ファンアウト → 20ソース取得 → 77主張抽出 → 25主張を3票敵対的検証 → 合成）の結果。**既存レポート（strategy-01〜07）の主張を裏取り・訂正する**。
> 統計: 角度5 / ソース20 / 抽出77 / 検証25 / **確定18 / 棄却7** / 合成後9。

## 🔴 最重要の訂正・留保

### ⚠️ 留保1: 相性データの「母集団」が2種類ある（混同禁止）
本調査で定量裏取りできた相性・勝率（LimitlessTCG）は**すべて現実の人間オンライントーナメント（CRI Standard 2026 / Moujii's Dojo 等）由来**であり、**Kaggleコンペが使う cabt シミュレーション環境のメタとは別物**。
- 例: LimitlessではDragapultの不利は **N's Zoroark / Crustle / Basic Box / Slowking**。
- 一方 cabt 環境（strategy-04）ではDragapultの明確な穴は **Cinderace** で、Mega Greninja/Beedrill/Slowking/N's Zoroark等は主要アーキタイプとして登場しない。
- → **人間メタの相性表はデッキ選択の「参考」止まり。コンペのレーティング最適化にそのまま転用しない**。コンペ用の真の相性は**日次エピソード（~720MB/日）を自前解析**するしかない。

### ❌ 訂正2: 「カードプール約2,000枚」は裏が取れず（0-3で棄却）
- PokéBeach等の二次情報の「around 2,000 cards from the Standard format」は**一次発表ベースでは裏取り不可**として**3票棄却**。
- strategy-07の自律調査では別ソースから **約1,200種（ex 151種）** との具体報道（AUTOMATON）。**枚数は出典により1,000〜数千と幅があり、一次CSV未確認**が正確な現状。**「約2,000枚」を確定事実として扱わない**。

### ❌ 訂正3: 「Dragapultがメタシェア首位9.36%」「Gardevoir 2位/Charizard 3位」は棄却（0-3）
- LimitlessTCG全体メタシェアの具体順位（Dragapult 9.36% 首位等）は**3票棄却**。これらは現実メタの集計であり、かつ数値の裏取りが取れなかった。**コンペのメタ順位とは無関係**。

### ⚠️ 訂正4: 「単純Bellibolt(Elo836)がコンボに勝った」は弱い主張（1-2で棄却寄り）
- strategy-04/06で引用した「シンプルなデッキが強い」という GitHub 由来の逸話は、**1-2票で支持されず**。**「シンプルさが操縦に有利」という一般原則は残すが、Elo836の具体逸話は確証が弱い**として扱いを下げる。

### ⚠️ 訂正5: 「Crustleがラダーの約50%」も棄却（0-3）
- strategy-04で歴史的経緯として触れた数値だが、コンペ環境の確たるメタシェアとしては**未確証**。歴史的逸話として読む。

---

## ✅ 高信頼で確定した新事実（既存レポートを強化）

### A. 公式サンプルエージェント（kiyotah / The Pokémon Company 編集, Apache 2.0, ベストスコア600.0, 2026-06-19公開）— 3-0
- `select=None` → 60枚カードIDのリストを返す／それ以外 → option インデックスを返す契約（strategy-02と一致、独立裏取り）。
- **スコアリング哲学（操縦の核心・3-0確定）**: 各行動を**「絶対的な強さ」ではなく「ターン内で処理すべき順序」で整数スコア付け**する決定論的 if/else。
  - 公式コメント: *"assign higher scores to actions that should be processed earlier in the turn ... which action order makes the intended behavior easier to control in code"*
  - *"Evolving first makes it easier to control the actions that come afterward"*
  - *"Attacking is usually the final action of the turn. So it does not receive a low score because it is weak, but because it is an action that should be taken later"* → **ATTACK は `score=attackId`（低値）**。
  - ルール根拠: 攻撃はターンを終了する／進化は同ターンの攻撃を可能にする。
- → **「操縦しやすいデッキ」の本質的条件＝行動を処理順で整数スコア化できること**。strategy-06の操縦鉄則に追加すべき重要原則。

### B. 公式サンプル Dragapult ex デッキ（完全60枚, Kaggle CLIでdiff検証, 3-0）
> Phantom Diveで1ターンに3枚以上のプライズを狙うアグロ。炎4＋超4の二色を Crispin×4 で成立。

| カード | 枚数 | | カード | 枚数 |
|---|---|---|---|---|
| Dreepy | 4 | | Crushing Hammer | 4 |
| Drakloak | 4 | | Ultra Ball | 4 |
| Dragapult ex | 3 | | Poké Pad | 3 |
| Fezandipiti ex | 1 | | Lucky Helmet | 1 |
| Latias ex | 1 | | Boss's Orders | 3 |
| Budew | 2 | | **Crispin** | 4 |
| Meowth ex | 1 | | Brock's Scouting | 2 |
| Rare Candy | 2 | | Lillie's Determination | 4 |
| Unfair Stamp | 1 | | Team Rocket's Watchtower | 2 |
| Buddy-Buddy Poffin | 4 | | 基本炎 | 4 |
| Night Stretcher | 2 | | 基本超 | 4 |

- docstring に勝ち筋明記: *"to take at least three Prize cards in a single turn with its Phantom Dive attack"*。
- Crispin に「炎or超が0枚のときの特別処理」がコードに存在 → 二色基盤を裏付け。

### C. Mega Starmie ex 公式カードデータ（Perfect Order #21, pokemon.com/Limitless/Bulbapedia 3ソース一致, 3-0）
- 水タイプ **Stage 1（Staryuから進化）/ HP330 / でんき弱点 / にげ2**。
- **Jetting Blow [水1] = 相手アクティブ120＋ベンチ1体に50**（スプレッド主力）。
- **Nebula Beam [無3] = 210、弱点・抵抗・相手アクティブの効果を全無視**。
- ⚠️ **注意**: 公式pokemon.com記事の Mega Starmie ex デッキは **水4＋悪4（Munkidoriの Adrena-Brain 起動）＋Legacy1＋Ignition1** の構成で、**Froslass（ダメカン追加）＋Munkidori（ダメカン移動）**で増幅する型。
  - これは strategy-04 が記録した **keidroidクローン（水9＋Ignition4、Cinderace採用）** とは**別の構築**。同じ Mega Starmie ex でも複数の型が存在する。**コンペで使うなら keidroid 構築（cabt実績）を優先し、公式記事構築は参考に留める**。

### D. Iono's Bellibolt ex デッキ（完全60枚, wmh/ptcg-abc の deck.csv とID・枚数完全一致, 3-0）
- 勝ち筋: 特性 **Electric Streamer**（手札から基本雷を Iono's ポケモンに**何枚でも**付与）→ **Iono's Voltorb の Voltaic Chain（付与エネ数比例・実質上限なしダメージ）**。
- 60枚: Iono's Voltorb×3, Tadbulb×3, Bellibolt ex×3, Wattrel×3, Kilowattrel×3, Buddy-Buddy Poffin×3, Night Stretcher×2, Max Rod×1, Energy Retrieval×1, Ultra Ball×3, Poké Pad×2, Lillie's Determination×4, Canari×4, Levincia×3, **基本雷×22**。
- → **単色・高速エネ積みの単純構築＝ルールベースで操縦しやすい典型**（strategy-04のBellibolt評価を補強）。

### E. コンペ制度（2-1〜3-0で確定、strategy-01を裏取り）
- 持ち時間 **1試合あたり1人最大10分のチェスクロック、使い切ると即敗北**（複数ソース一致）。
- 2トラック: Simulation（24h自動対戦・**ガウス分布ベースのレーティング**・締切2026-08-16／公式はJST 8:59 Aug 17表記）＋ Strategy（レポート・締切2026-09-14）。
- **episodes-index データセットは7列のメタデータのみ**（date, daily_dataset_slug, daily_dataset_url, episode_count, total_bytes, top_avg_score, median_avg_score）。**デッキ/勝率/相性/カードプール規模/フォーマット仕様は含まない** → 実データは**日次エピソード(~720MB)側**にあり、デッキ研究には自前ダウンロード・解析が必須。

---

## 📌 残された未解決問題（次の調査・実装の宿題）

1. **cabt環境の実相性マトリクス**は、LimitlessTCGではなく**日次エピソード(~720MB)を自前解析**して定量化するしかない（keidroid等トップ構築のcabt勝率を含む）。
2. **カードプールの正確な規模**（約2,000枚は棄却）と、cabtで**実装済み/未実装のカード・効果**の一次定義の所在。
3. 公式サンプル3種以外で**ルールベース操縦性が高く cabt 高レートな型**（Cinderace/Trevenant/Alakazam等）とそのスコアリング設計。
4. **keidroidの実デッキ・エージェント実装**を公開エピソードから再構成できるか。

---

## 戦略的含意（デッキ選択への反映）

- **公式サンプル3種（Dragapult ex / Mega Starmie ex / Iono's Bellibolt ex）は完全な60枚リストが判明**。**まずこの3つから始めるのが最短**（操縦コードの初期品質が公式保証）。
- **操縦の核心原則を更新**: スコアは「強さ」でなく「**ターン内の処理順序**」で付ける（進化→特性→エネ→攻撃の順に高→低）。これはstrategy-06の鉄則に統合すべき。
- **相性データはコンペ自前解析が必須**: 外部（LimitlessTCG）の人間メタは母集団違いで転用不可。日次エピソード解析パイプライン（strategy-02のmeta_analyze相当）が勝負を分ける。

---

## 出典（deep-research が検証に用いた一次/二次ソース）

- 公式サンプル(Dragapult): https://www.kaggle.com/code/kiyotah/a-sample-rule-based-agent-dragapult-ex-deck
- 公式サンプル(Iono's): https://www.kaggle.com/code/kiyotah/a-sample-rule-based-agent-iono-s-deck
- Kaggle Simulation/leaderboard: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle/leaderboard
- episodes-index: https://www.kaggle.com/datasets/kaggle/pokemon-tcg-ai-battle-episodes-index
- Mega Starmie ex 公式: https://www.pokemon.com/us/strategy/build-a-mega-starmie-ex-deck-from-pokemon-tcg-mega-evolution-perfect-order
- Mega Starmie ex カード: https://limitlesstcg.com/cards/POR/21
- Dragapult 相性(人間メタ・要留保): https://play.limitlesstcg.com/decks/dragapult-ex/matchups?format=standard&rotation=2026
- wmh/ptcg-abc: https://github.com/wmh/ptcg-abc/blob/main/README.md
- AICU(#ポケカABC): https://note.com/aicu/n/ne9cc5c7b4157
- 公式サイト: https://ptcg-abc.pokemon.co.jp
