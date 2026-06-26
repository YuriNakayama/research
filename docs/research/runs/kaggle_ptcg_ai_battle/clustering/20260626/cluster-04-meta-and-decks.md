# Cluster 04 — メタ環境と主要デッキ

> ⚠️ **メタは日替わりで激変する**。以下は参考実装が記録した 2026-06 中旬〜下旬のスナップショット（Crustle 50%→Lucario 56%→Trevenant→Dragapult が**数日で**入れ替わった）。**実戦では必ず最新の episodes を `meta_analyze` で再分析すること**。数字は「考え方のテンプレート」として読む。
>
> 🔴 **[cluster-08で訂正] このファイルのシェア/勝率は単一の参考実装（GitHub `wmh/ptcg-abc`）の自己記録であり、敵対的検証で一部が裏取り不可だった**: 「Crustle 50%」「Dragaplutメタ首位」等の具体シェアは未確証。**外部サイト（LimitlessTCG）の相性数値は人間トーナメント由来で、cabtシミュレーション環境とは母集団が異なる**ため転用不可。本ファイルの数値は「考え方のテンプレート」として読み、**コンペ用の真のメタ・相性は日次エピソード(~720MB)の自前解析でのみ得られる**。詳細は [`cluster-08`](cluster-08-deep-research-verified.md)。

## メタ分布スナップショット（6-21, トップ層 Elo≥1150, 約1,524局）

| アーキタイプ | シェア | 勝率 | メモ |
|---|---|---|---|
| **Hop's Trevenant** | 42.2% | 52.3% ↓ | 最多だが勝率は環境適応で急落（前日64.6%）。全1プライズ |
| **Alakazam** | 18.9% | 55.1% | 全1プライズの手札バースト。安定ヘッジ |
| **Dragapult ex** 🚀 | 16.5% | **63.1%** | 急上昇。最も positioning が良い |
| Chandelure 🚀 | 6.0% | 66.7% | Trevenantカウンター |
| Cinderace 🚀 | 3.8% | 67.2% | **Dragapultの天敵** |
| Mega Froslass ex 🚀 | 3.6% | 70.0% | 上昇中。要監視 |
| Team Rocket's Mewtwo ex | 1.9% | 75.4% | 少数だが高勝率 |
| Mega Lucario ex | 0.4% | 46% | **絶滅**（数日前は56%の王者） |

> 教訓: **デッキ選択が支配的**。波は Trevenant→Dragapult へ**1日で**移った。Lucarioは56%→絶滅まで3日。

## じゃんけん（相性）構造

```
   Mega Starmie ex ──beats──▶ Trevenant(85%) & Dragapult(66%) & Alakazam(68%)   ← 環境の頂点候補
         ▲
         │(Mega Starmieは でんき弱点／みず弱点だが現状穴が少ない)
         │
   Dragapult ex ──beats──▶ Trevenant(79%) / Chandelure(81%) / Iono(80%)
         │  mirror Alakazam ~50% ／ vs Lucario 46%
         └──loses──▶ Cinderace(36%)  ← Dragapultの唯一の明確な穴

   Hop's Trevenant ──beats──▶ Mega Lucario(75%) / Typhlosion(89%) / Bellibolt(69%)
         └──loses──▶ Dragapult / Mega Starmie

   Alakazam（全1プライズ）──beats──▶ Crustle(71%) ／ even vs Lucario,Dragapult
         └──loses──▶ Bellibolt(29%) ／ Trevenant(59%は相手側勝率)
```

**読み方**: 「最多デッキ（Trevenant/Alakazam）を叩けて、かつ自分の天敵がまだ少数」のデッキが強い。6-22時点では **Mega Starmie ex（keidroidの#1構築、Elo 1341で2位に+400）** と **Dragapult ex** がその条件を満たす。

---

## 主要デッキ詳細

### ① Dragapult ex（スプレッド＋コントロール）— 参考実装の「主力」
- ライン: Dreepy(70HP{超}) → Drakloak(90HP, 特性: 山上2枚見て1枚) → **Dragapult ex(320HP, 2プライズ, 弱点なし)**。Rare Candyで飛ばせる。
- **エンジン: Phantom Dive [炎][超]=200＋相手ベンチに6個のダメカン（=60）を自由配置**。事前にダメカンを撒き→Boss's Ordersで釣って連続KO→1ターン複数プライズ。
- 妨害: **Crushing Hammer×4**（コインでエネトラッシュ）、Budew（アイテムロック）。加速: Crispin, Rare Candy。
- エネ: 基本{炎}4＋基本{超}4。**後攻**。
- 操縦: **公式サンプルの `_policy()` をそのまま採用**（自作政策は13-1で負けた）。最大のバグは **Fezandipiti ex の過剰優先**（PLAYスコア53000→35000に下げて改善）。
- vs Cinderace 36% が唯一の明確な穴。

### ② Mega Starmie ex ＋ Cinderace（みず/ほのお）— ladder #1 keidroidのクローン
- ライン: Staryu(70HP{水}) → **Mega Starmie ex(330HP, 1進化のMega ex, 3プライズ, でんき弱点)**。**Cinderace(160HP, 2進化{炎})は特性 Explosiveness で前にうつ伏せ展開**（たね同然に開幕できる）。
- **エンジン**: Mega Starmie **Jetting Blow [水]=120＋ベンチ1体に50**（=主力。水1個で撃てる。keidroidの最多使用技）／**Nebula Beam [C][C][C]=210, 弱点抵抗＆相手の効果を全無視**（Crustle免疫・Mist・軽減を貫通する万能ハンマー）。Cinderace **Turbo Flare [C]=50＋基本エネ3枚サーチしベンチに**（初動加速）。
- **Ignition Energy×4**: 進化ポケに{C}{C}{C}供給だが**ターン終了時トラッシュ**→ Nebula用の使い切り起動。**ビルドアップ不可・ベンチ付け不可**。
- 維持: Wally's Compassion（Mega exを全回復＋エネを手札へ）、Hero's Cape（+100HP→430HP壁）。
- **先攻**（keidroid 27/27）。
- 操縦: 自作 `MegaStarmiePolicy` を **keidroidの116局と divergence分析**して校正。5つの実測fixで対自軍勝率 40/52/78 → 56/56/84（Dragapult/Alakazam/Trevenant）。
- **環境の頂点候補**: TrevenantとDragapultの両方を叩く。自分で使わないなら最大の天敵。

### ③ Alakazam（全1プライズ・手札バースト）— ヘッジ
- ライン: Abra(50HP) → Kadabra → **Alakazam**（全1プライズ）。Rare Candyで飛ばせる。
- **エンジン: Powerful Hand = 手札の枚数×20 を相手バトル場にダメカン配置**。**Dudunsparce（特性: 3ドローして自分を山に戻す、毎ターン反復）**で手札を15〜20枚に膨らませ**300〜400ダメージ**。
- **鉄則**: ベンチDudunsparceをほぼ毎ターン使う。**止めるのは自分のデッキが残り7枚以下のときだけ**（相手が手札を溜めていても止めない）。**ドローを絞るガードを足すとcabt勝率が60%→38%に必ず悪化**（大きな手札こそ勝ち筋）。
- **天敵: Mist Energy**（Powerful Handは「効果」なので完全無効化）。対策に Enhanced Hammer や真ダメージ技を積む。

### ④ Hop's Trevenant（全1プライズ・テンポ）— 6-22に降格
- 全1プライズ。Hop's Phantump→**Hop's Trevenant(140HP)**, Hop's Cramorant, Hop's Snorlax。
- **エンジン: Horrifying Revenge [C]=30、前ターンにHop'sがKOされていれば+100(=130)**。Hop's Choice Bandでコスト0。+30バフ3種（Postwickスタジアム／Choice Band／Snorlax特性）を重ねて**最大220**。安い1プライズ体を相手の3プライズexにぶつけ、プライズレースで勝つ。
- 環境適応で勝率が急落（64.6%→52.3%）。

### ⑤ その他（監視対象）
- **Cinderace**（67% 上昇中、Dragapultキラー）、**Chandelure**、**Mega Froslass ex**（70%）、**Team Rocket's Mewtwo ex**（75%）。
- **絶滅したが基礎知識として**: Mega Lucario ex（かくとう速攻、エスパー弱点）、Crustle（ex免疫の岩壁、ほのお弱点）、Iono's Bellibolt ex（でんき、かくとう弱点でLucarioに轢かれ消滅）、Ethan's Typhlosion（ほのお2進化、みず弱点）。

---

## 戦略的含意（デッキ選択への落とし込み）

1. **ボット操縦のしやすさ＝シンプルさ**。Bellibolt（単純1エンジン, Elo836）はラダーで安定し、複雑なコンボ（Quilava 2進化＋リサイクル, 532）はボットがもたつく。**「強い」デッキより「正確に回せる」デッキ**。
2. **最多デッキを叩けるか**を最優先。現状なら Trevenant/Alakazam を叩ける Dragapult / Mega Starmie。
3. **自分の天敵が少数か**を確認。Dragapultの天敵Cinderaceが増えるなら乗り換えを検討。
4. **公式サンプルがあるデッキ（Dragapult）は操縦の初期品質が高い**。無いデッキ（Mega Starmie等）は**#1プレイヤーの構築をクローンしてdivergence校正**する。

---

## 出典

- 参考OSS実装の `CLAUDE.md` メタログ・`docs/strategy/牌組策略.md`（`github.com/wmh/ptcg-abc`）
- 日次 episodes データセット（Kaggle）`kaggle/pokemon-tcg-ai-battle-episodes-*`
- リーダーボード（Kaggle, `TeamName → Elo`）
