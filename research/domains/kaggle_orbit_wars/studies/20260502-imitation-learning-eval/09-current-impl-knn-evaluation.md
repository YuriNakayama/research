# 09. 現状実装（近傍 K=7 + NOOP, ships ルールベース）の評価と発展

## 現状実装の要約

各 planet について:

```
入力: observation
   ↓
Per-planet model
   ↓
出力: 8 次元 softmax = {近傍 7 planet + NOOP}
   ↓
argmax で target 選択
   ↓
ships 数はルールベース（固定値 / 関数）で決定
```

**設計意図**: **学習を平易にする**こと。
- target 候補を「全 planet (~40)」ではなく **近傍 7 個に圧縮** → 出力次元を小さく、学習サンプルあたりの信号を強く
- ships 量を学習対象から外す → 学習タスクの次元削減、ノイズ源を排除

これは「**まず classifier として動く最小構成を作る**」という極めて実用的な選択であり、Phase 1 baseline として非常に妥当。

## なぜこの設計が学習を平易にするのか（理論的整理）

### (1) 出力次元の圧縮: 40 → 8 で学習が劇的に楽

| 設定 | 各 sample の cross entropy 学習信号 |
|------|------------------------------------|
| 全 planet softmax (40-class) | log(1/40) ≈ -3.7（chance） |
| 近傍 7 + NOOP (8-class) | log(1/8) ≈ -2.1（chance） |
| 近傍 7 のみ (7-class) | log(1/7) ≈ -1.95 |

class 数が減ると **chance baseline の loss が下がり、信号雑音比 (SNR) が上がる**。学習初期の収束が早い。

### (2) Inductive bias の注入: 「攻撃は近傍に対して行われる」

これは **Orbit Wars のドメイン知識の埋め込み**であり、機械学習における強力な priors:
- 軌道力学的に遠い planet への攻撃は ETA が長く非効率
- 期待 expert の 90%+ の attack は近傍で発生（と仮定）
- → 遠方候補を学習対象から外しても ground truth coverage が高い

### (3) ships 量を切り離す: タスクの直交分解

learning task を 2 つに分割:
- **学習する**: target 選択（戦略的判断、複雑）
- **学習しない**: ships 量（戦術的判断、ヒューリスティクスで近似可能）

target 学習において ships 量のノイズが loss に乗らないため、target head の学習が安定。これは **multi-task learning における task de-correlation** の実例。

## 現状実装の限界と落とし穴

### 限界 1: K=7 の coverage 漏れリスク

「近傍 7 planet」の定義による:
- **物理距離 K-NN**: 軌道が回転するため frame ごとに変わる → 学習が不安定
- **ETA (到達時間) K-NN**: より戦略的に意味があるが計算コスト
- **固定インデックス**（例: planet ID 0〜6）: 意味がないので除外

近傍定義が動的だと、「近傍 7 に最善 target が含まれない」ケースが発生:
- expert の attack target が 8 番目の近傍 → ground truth が NOOP に丸められる or データ捨てられる
- データ捨てなら **学習データの bias**（近傍内攻撃のみが残る）→ agent が「遠方への決定的攻撃」を学べない

**緩和策**:
- K を 10〜15 に増やす（次元圧縮の効果は減るが coverage 改善）
- 近傍に入らない target が ground truth の場合、loss から除外（mask）し expert 行動として replay には残す

### 限界 2: ships ルールベースが expert の戦略と不整合

expert は target を「自分が送る ships 量」を含めて判断している:
- 「100 ships ある → 強い enemy planet を攻撃」
- 「20 ships しかない → 近隣 neutral を確保」

ships が固定値（例: 50% 一律）だと:
- 学習時の (target, ships) ペアと推論時の (target, ships') が**ペア整合性を失う**
- 結果として「target は良いが ships が不適切」な行動が出る

**緩和策**:
- ships ルールを expert と同じロジックにする（rule-based bot をそのまま使う）
- 学習データ生成時に「ships 量を expert 通り」「target をモデル予測」で hybrid 評価し、target だけが学習対象であることを保証

### 限界 3: 階層的依存性の欠如

現状:
```
P(target) は独立に予測、ships 量は決定論的関数
```

これは「**Head 1 (target) のみ学習、Head 2 (ships) は固定**」という極端な factorization。`08` で議論した autoregressive 階層 (`action_type → target → amount`) のうち、**target だけが学習されている状態**。

問題:
- target と ships の相関を捉えられない
- 「強い相手 → 大量送る」が学習できない（ships 固定なので）

ただしこれは Phase 1 の意図的な単純化であり、**性能が頭打ちになるまでは無視できる**。

### 限界 4: NOOP が混在することによる class imbalance

8-class の中で NOOP が大半（典型的に 80%+）。

```
chance: argmax = NOOP で 80% accuracy
```

→ accuracy 指標が誤解を招く。**NOOP を除いた action 時の target accuracy** を見る必要あり。

## 既存の推奨設計（08 章）との位置づけ

`08-orbit-wars-recommended-design.md` の **Phase 1 (Minimum Viable BC)** と現状実装は実質的に同じ哲学:

| 観点 | 08 章 Phase 1 | 現状実装 |
|------|------------|----------|
| 出力次元削減 | 独立 head（autoregressive ではない） | 近傍 7 + NOOP |
| 学習対象 | 3-head（at, target, amount） | target のみ |
| ships 扱い | 5-bin fraction を学習 | ルールベース固定 |
| 設計意図 | baseline 確立 | 同じく baseline |

つまり**現状実装は Phase 1 の更に保守的な版**。これは健全な戦略です:
- ships 学習を後回しにする判断は妥当
- 近傍 K 圧縮は inductive bias として強力

## 改訂された段階的プラン

`08` 章の Phase 分けを現状実装に合わせて再構成:

### Phase 0（**今ここ**）: K-NN classifier + ルールベース ships

- 出力: 8-class softmax (近傍 7 + NOOP)
- ships: ルールベース固定
- 目的: 学習基盤と推論パイプラインの確立

→ **これが動いていれば既に Phase 1 完了相当**。

### Phase 1.5: K 拡張 + ships ルールの精緻化

「もう一段の小ステップ」として、autoregressive に踏み出す前にやるべきこと:

- [ ] **K を 7 → 12〜15** に増やして coverage を測定
  - K を増やしたとき expert ground truth の coverage rate を計測
  - 95%+ になる K を採用
- [ ] **近傍定義を ETA-based に変更**（物理距離 → 到達時間）
  - 軌道回転の影響を受けない
- [ ] **ships ルールを expert と同じロジックに固定**
  - 学習データの (target, ships) ペアに整合性を持たせる
- [ ] **NOOP 除外時の target accuracy** を主指標に
- [ ] **Class weight** で NOOP の支配を緩和

→ アーキテクチャは変えず、データと評価指標の整合性だけ取る。1 週間以内で完了。

### Phase 2: Ships を学習対象に追加（独立 head）

target だけでなく ships も学習へ:

```
出力:
  Head 1: target ∈ {近傍 7 + NOOP}     (8-class)
  Head 2: amount fraction ∈ {0%,25%,50%,75%,100%}  (5-class)
```

**この時点ではまだ独立 head**（autoregressive ではない）。理由:
- ships 学習が単独で機能するかを切り分け
- Phase 0 / 1.5 比で性能が伸びるかを観測
- 伸びなければ ships を学習する意味がない（ルールベースで十分）

**期待**: target/ships 相関の弱い局面（neutral 占領など）では伸びない可能性高い、強い局面（敵主力との戦闘）で改善が出る。

### Phase 3: Autoregressive 化

ships を head として学習する価値が確認できたら、依存を入れる:

```
Head 1: target | observation
Head 2: amount | observation, target
```

target の embedding を amount head に流す。`08` 章の autoregressive 設計の **target → amount のみ**（action_type と source は外側ループで決定済み）。

期待: target/amount 相関が強い局面で性能向上。

### Phase 4: K 制約の緩和（Pointer Network 化）

近傍 K 圧縮を撤廃して全 planet 対象の Pointer Network へ:

- target head を Pointer over all planets に置換
- 学習データに「遠方への決定的攻撃」が含まれていれば、K=7 では学べなかった戦略が解放される

**この移行は性能差が小さければ skip して良い**。8-class softmax で leaderboard 上位なら K=7 のまま提出継続。

## 現状実装の強みを活かした loss 設計

8-class softmax (近傍 7 + NOOP) の loss 設計:

```python
# Class imbalance 対策
class_weight = compute_class_weight(  # NOOP の頻度に応じて自動調整
    "balanced", 
    classes=np.arange(8),
    y=train_labels
)

loss = F.cross_entropy(
    logits,                # [B, P, 8]
    targets,               # [B, P]
    weight=class_weight,   # [8]
    label_smoothing=0.1,
    reduction="mean",
)

# Per-planet mask（自分の planet ではない場所は loss から除外）
loss = (loss * my_planet_mask).sum() / my_planet_mask.sum()
```

### Soft label による近傍順序の活用（推奨追加）

8 候補のうち「近傍 1 位」と「近傍 7 位」では戦略的価値が異なる。`gold_target = neighbor_3` のとき:

```python
# Hard label: [0,0,0,1,0,0,0,0]
# Soft label (距離に応じた smoothing): [0.02, 0.05, 0.15, 0.6, 0.15, 0.02, 0.01, 0]
```

近傍順序を soft label で表現すると、「近傍 3 を予測できなくても近傍 2 や 4 を予測すれば部分的に正解」という勾配が流れる。これは expert の judgement の不確かさを表現する効果もある。

ただし複雑度増なので、**Phase 1.5 で hard label に label_smoothing 0.1 を試す → 不足なら soft label を試す** の順で。

## 検証すべき主指標（Phase 0 → 1.5 で）

| 指標 | 目標 |
|------|------|
| Validation accuracy (NOOP 除外) | 60%+ |
| Top-3 accuracy (NOOP 除外) | 90%+ |
| Coverage of expert target by neighbor-K | K=7 で ?%、K=12 で ?% |
| Win rate vs rule-based bot (100 games) | 互角〜上回る |

特に **Top-3 accuracy** と **coverage** を測ることで、「K を増やすべきか / autoregressive 化すべきか / そのままで良いか」の判断ができる。

## まとめ

### 現状実装は理論的に妥当な選択

「近傍 7 + NOOP の 8-class softmax + ships ルールベース」は:
- 学習を平易にする ✓ （次元圧縮 + タスク直交分解）
- Inductive bias を注入 ✓ （近傍攻撃の優位性）
- 推論コストを抑える ✓ （8-class は十分軽量）

### 次の一手は Phase 1.5（小修正）

アーキテクチャを変えずに以下を試す:
1. K を 7 → 12〜15 に増やして coverage を測る
2. 近傍定義を ETA-based に
3. ships ルールを expert と一致させる
4. NOOP 除外 accuracy を主指標に
5. Class weight + label smoothing

これで **rule-based bot を確実に超える** ことを目指し、超えてから初めて autoregressive 化や Pointer Network 化を検討する。

### 過剰な早期最適化を避ける

`08` 章の Pointer Network + Autoregressive 設計は理論的に正しいが、**現状実装が rule-based bot を超えていない段階で導入するのは危険**:
- 改善が autoregressive 化 / 近傍緩和 / 学習データ増の **どれに起因するか切り分け不能**
- デバッグ時間が指数的に増える

「**1 つの軸だけ動かして測る**」を厳守し、Phase 0 → 1.5 → 2 → 3 → 4 と段階を守る。

## 改定推奨フロー（08 章への上書き）

```
Phase 0 (現状): K=7 + NOOP + ships ルールベース
   ↓ Phase 1.5
データ整合性 + K 最適化 + 評価指標整理
   ↓ rule-based を超えたか？
   ├─ Yes: Phase 2 へ
   └─ No: 学習データ品質を疑う（expert の強さ、データ量）
Phase 2: ships を独立 head として学習追加
   ↓ Phase 2 で性能伸びたか？
   ├─ Yes: Phase 3 (autoregressive) へ
   └─ No: ships 学習断念、ルールベース継続
Phase 3: target → amount の autoregressive
   ↓ Phase 3 で性能伸びたか？
   ├─ Yes: Phase 4 (Pointer Network 化) 検討
   └─ No: K=7 + 2-head autoregressive のまま安定運用
Phase 4: K 制約撤廃 → Pointer over all planets
```

各段階で **「前段比で win rate +5% 以上」を改良採択基準** とする。微増なら roll back。
