# Satirist.org Planet Wars 戦略カタログ

## ソース

- 戦略概念: http://satirist.org/ai/planetwars/strategy.html
- プレイスタイル分類: http://satirist.org/ai/planetwars/playing-styles.html
- 総合インデックス: https://satirist.org/ai/planetwars/

## 位置づけ

Lars Hamre (satirist) は Planet Wars 2010 参加者で、**3rd party アナリスト** として上位 100 bot を観察、戦略概念をカタログ化。Melis post-mortem と並んで歴史的標準文書。

## 戦略概念カタログ

### 1. Growth Race (growth-first)

開幕は中立占領に全投資。敵との衝突を避け、production を積み上げる。

- **利点**: 長期 production advantage で勝利
- **欠点**: 相手の rush 戦術で序盤崩壊のリスク

**Orbit Wars**: 軌道惑星の production 偏重（中央付近 production 高）を考えると、Growth Race が有力。

### 2. Rush

開幕から大艦隊で敵惑星を狙う。相手が Growth Race なら戦力差で勝利。

- **利点**: 相手を序盤で確殺
- **欠点**: 失敗すると守備薄弱

**Orbit Wars 4P**: 4 人対戦では Rush で 1 人倒しても 2nd, 3rd 位の漁夫の利。慎重に。

### 3. Turtle

自惑星に守備集中、敵を消耗させる。production で追い越せば勝利。

- **利点**: 低リスク
- **欠点**: 相手の Growth Race を許す

### 4. Snipe

相手の中立占領艦隊の直後に上乗せ攻撃。「相手が artillery 投資 → 自分が少し多い artillery で奪取」

- **条件**: 対象中立まで相手が近い、自分も近い
- **利得**: 相手の投資ゼロ化

**Orbit Wars**: コメット取り合いが最大の snipe 機会。

### 5. Harass

相手の **最大 production 惑星** に小艦隊を繰り返し送る。相手が毎回守備に回せば production 停滞。

- **リスク**: 無視されれば単なる艦隊消耗
- **利得**: 相手の攻撃余力を奪う

### 6. Federation（Planet Wars 4P 仕様想定）

4 人中 2 人が協調（明示的 alliance は禁止だが行動で協調）。最弱を集中攻撃して 2 人で 1-2 位。

**Orbit Wars 4P**: 明示 alliance 禁止だが、偶発的な federated attack は発生し得る。

### 7. Kamikaze

自惑星の全艦を相手に送る。失う artillery が相手に与える影響よりも相手を弱体化させる。

- **条件**: 自分が劣勢、勝ち目薄い
- **Orbit Wars**: tie 全滅ルールで相打ちが確実に起きる → 有効

### 8. Redistribution

後方（敵との距離遠い）惑星から前線惑星へ artillery を移動。Melis の定番。

### 9. Drip Feed

1 回の大艦隊でなく、毎ターン小艦隊を送り続ける。相手の守備が薄れるまで継続。

- **Orbit Wars**: 20 艦未満制約 + 速度スケールから不利（小艦隊は速度遅い）

### 10. Defensive Timing

敵艦隊 ETA を見て「到着直前に自惑星へ reinforcement」で守備強化。守備 artillery を最小化。

- **Orbit Wars 軌道惑星**: 軌道惑星は位置が動くので ETA 計算が複雑、LUT 必須

## プレイスタイル分類（Hamre 2010 観察）

- **Type A - Analyst**: 深い計算、慎重。Melis タイプ。
- **Type B - Aggressor**: 常に攻撃、Rush 多用
- **Type C - Opportunist**: Snipe と Redistribution の達人
- **Type D - Turtle**: 守備優先、終盤 production 勝利
- **Type E - Chaos**: Kamikaze 多用、読みづらい

上位 10 bot のうち 7 は Type A、2 は Type C、1 は Type B。

## Orbit Wars 向け戦略ツリー

```
開幕 (step 0-30)
├── 近隣中立惑星 2-3 個を占領（必須）
├── 軌道惑星 1 個の intercept 計算開始
└── 対戦相手の開幕行動を観察

中盤 (step 30-150)
├── production 優位を目指す Growth Race
├── コメット spawn (step 50, 150) で snipe
└── 敵の薄い惑星に opportunistic attack

後半 (step 150-400)
├── 優勢ならば Turtle + tie 誘発
├── 劣勢ならば Rush or Kamikaze
└── 敵の最大 production 惑星に Harass

終盤 (step 400-500)
├── 勝勢固め or 逆転狙い
├── 低 production 惑星は捨てる
└── 高 production 惑星集中攻撃
```

## Hamre の観察: 勝敗を分ける 3 要素

1. **Territory management**: 惑星の価値評価の精度
2. **Timing**: 艦隊の同着タイミング制御
3. **Simulation depth**: 何 turn 先まで読めるか

**Orbit Wars への示唆**:
1. production × remaining_turns を正確に計算（time_discount 含む）
2. 軌道惑星への intercept で timing 精密化
3. Python で 10 turn 先の rollout を実装（RHEA horizon=10 相当）

## 戦術の組合せ（Melis の実装）

Melis は以下を **動的に切替**:

```python
def select_style(obs, state):
    my_prod = sum(p.production for p in obs["planets"] if p.owner == state.me)
    enemy_prod = sum(p.production for p in obs["planets"] if p.owner != state.me and p.owner != -1)
    ship_diff = sum(p.ships for p in my_planets) - sum(p.ships for p in enemy_planets)

    if obs["step"] < 30:
        return "growth_race"
    if ship_diff > 200 and my_prod > enemy_prod:
        return "turtle"  # 勝勢
    if ship_diff < -200:
        return "kamikaze"  # 劣勢
    if enemy_prod > my_prod * 1.3:
        return "rush"  # 追い上げ
    return "balanced"
```

各 style は `V(s)` の重み w1..w5 を変更して実現。

## 学び

1. **10 戦略のカタログ** は Planet Wars 系の頻出パターン網羅
2. **Type A - Analyst** が最強（Melis もこのタイプ）
3. **スタイル動的切替** が上級者の共通
4. **Snipe と Redistribution** が 2 大定番戦術
5. **Orbit Wars 4P** では Federation / Kamikaze の新しい考慮が必要
