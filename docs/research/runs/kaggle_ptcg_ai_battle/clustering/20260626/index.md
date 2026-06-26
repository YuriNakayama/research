# Kaggle「Pokémon TCG AI Battle Challenge」攻略リサーチ

**作成日**: 2026-06-26
**ドメイン**: `kaggle_ptcg_ai_battle`
**目的**: 本コンペで勝つための戦略立案（コンペ仕様・ゲームルール・メタ・エージェント実装方針の整理）

---

## 0. このリサーチの要約（3行）

1. **コンペは2トラック**: Simulation（Eloラダー、賞金なし、〜8/17）と Strategy（レポート提出、**$240K**、〜9/14）。本命は**Strategy トラックの上位8チーム入賞（各$30,000＋東京決勝進出）**で、その評価軸の一つが Simulation の順位。
2. **エージェントは `agent(obs_dict) -> list[int]` の1関数**。デッキ選択時は60枚のカードIDを返し、対局中は合法手のインデックス列を返すだけ。ゲームエンジン（cabt）は与えられる。**「強い思考プレイヤー」を書く問題であって、ゲーム実装の問題ではない**。
3. **勝ち筋は「デッキ選択 × ルールベース操縦 × 実ラダーでのA/B検証」**。MLや模倣学習に走った参加者の多くは失敗しており、**シンプルなデッキを正確に操縦するルールベース**が現状の有力解。メタは日替わりで激変するため、毎日のメタ再分析が必須。

> ⚠️ 本リサーチは公開情報（Kaggle・ニュース・OSS参考実装 `github.com/wmh/ptcg-abc`）に基づく独立調査です。最終的な仕様・ルールは必ず Kaggle 公式コンペページで確認してください。

---

## 1. レポート構成（クラスタ）

| ファイル | 内容 |
|----------|------|
| [`cluster-01-competition-spec.md`](cluster-01-competition-spec.md) | コンペ仕様：2トラック、賞金、締切、提出方式、評価方法、組織 |
| [`cluster-02-engine-and-agent-api.md`](cluster-02-engine-and-agent-api.md) | cabtエンジン／`agent(obs_dict)`契約／`SelectContext`・`OptionType`／観測構造／実装テンプレート |
| [`cluster-03-game-rules-and-mechanics.md`](cluster-03-game-rules-and-mechanics.md) | ポケカ標準ルール：プライズ、弱点、進化、特殊状態、勝利条件、デッキ構築制約 |
| [`cluster-04-meta-and-decks.md`](cluster-04-meta-and-decks.md) | メタ分布・主要デッキ・相性表（じゃんけん構造）・期待勝率 |
| [`cluster-05-trainer-cards.md`](cluster-05-trainer-cards.md) | トレーナーズ（ドロー/サーチ/加速/妨害/回復/入替/道具/スタジアム）の運用 |
| [`cluster-06-strategy-playbook.md`](cluster-06-strategy-playbook.md) | **総合戦略：何をどの順で作るか／デッキ選択基準／操縦の鉄則／勝つためのロードマップ** |
| [`cluster-07-official-sources-card-pool.md`](cluster-07-official-sources-card-pool.md) | 公式cabtドキュメント裏取り：カードプール（~1,200種/ex151）・提出フォーマット・**先読みAPI（search_begin/manual_coin）**・日本語コミュニティ資料 |
| [`cluster-08-deep-research-verified.md`](cluster-08-deep-research-verified.md) | deep-research検証（敵対的fact-check）：人間メタ vs cabtメタの母集団注意／公式サンプル(Code)の操縦原則 |
| 🟢 [`cluster-09-PRIMARY-official-data-api.md`](cluster-09-PRIMARY-official-data-api.md) | **【一次情報・最優先】公式コンペデータ実取得：カードプール2,022枚確定／全カードCSV/実エンジンAPI(cg/api.py)の正確なenum値/先読みAPI/公式サンプルデッキの実体。他クラスタと矛盾時はこれが正。** |

> ✅ **確定事項（cluster-09＝公式データ実取得で判明、最優先）**:
> - **カードプール = 2,022枚で確定**（「約2,000枚」は正しかった。cluster-08での「棄却」を撤回）。内訳: ポケモン1,805＋トレーナーズ197＋エネ20。ex 270 / Mega ex 54 / ACE SPEC 29。英語版20弾。
> - **実エンジンAPI（`cg/api.py`）取得済み** → enum値・観測構造・先読みAPI（`search_begin`/`manual_coin`）が確定。cluster-02の値は cluster-09 で照合。
> - **公式同梱サンプル = Mega Abomasnow ex 水単デッキ＋ランダムmain.py**（「Dragapult」は別Codeノートブック）。
>
> ⚠️ **未確証として読む点**: 外部サイト（LimitlessTCG）の相性・勝率は**人間トーナメント由来でcabt環境とは母集団が違う**（参考止まり）。コンペ用の真の相性・メタは**日次エピソード(~720MB)の自前解析が必須**。cluster-04のメタ数値は単一参考実装の自己記録で一部未確証。

**まず読むべき**: [`cluster-06-strategy-playbook.md`](cluster-06-strategy-playbook.md)（行動計画）。
**実装を始めるなら**: [`cluster-02`](cluster-02-engine-and-agent-api.md) →[`cluster-04`](cluster-04-meta-and-decks.md) の順。

---

## 2. 一目でわかる勝ち筋（TL;DR 戦略）

```
                ┌─────────────────────────────────────────────┐
                │ 目標：Strategyトラック上位8（$30K＋東京決勝）│
                └─────────────────────────────────────────────┘
                                   ▲
          ┌────────────────────────┼────────────────────────┐
          │                        │                         │
   ① 良いデッキを選ぶ      ② 正確に操縦する         ③ 説得力ある戦略レポート
   （メタ最重要）          （ルールベース政策）       （Strategy評価の本体）
          │                        │                         │
  ・現環境の上位デッキを   ・1関数 agent(obs_dict)    ・デッキ設計思想
    クローン／改良          ・カード毎に明示スコア     ・安定性（クラッシュ0）
  ・単純で操縦しやすい      ・エネ過充填しない          ・Simulation順位の裏付け
    構築を優先              ・絶対にクラッシュしない
          │                        │
          └──── ④ 実ラダーA/Bで毎日検証（ローカルsimは順位を当てない）────┘
```

- **最重要レバーはデッキ選択**。同じ操縦コードでもデッキで順位が大きく動く。
- **次点が操縦の正確さ**。トップ人間プレイヤーの棋譜（episodes データセット）との「乖離分析（divergence）」で、どこを打ち間違えているかを特定し、カード毎スコアを直す。
- **ローカルシミュレータ（cabt）はラダー順位を正確に予測しない**。回帰検出（バグ取り）には使えるが、最終判断は**実ラダー**でしかできない。1日5回提出・最新2件採点を使い倒す。

詳細は各クラスタ参照。
