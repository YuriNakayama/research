# 詳細レポート索引 — 不完全情報ゲーム AI（最優先リソース）

**作成日**: 2026-06-26
**phase**: retrieval
**対象コンペ**: [Pokémon TCG AI Battle Challenge](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle)
**入力元**: `runs/kaggle_ptcg/gather/20260626_imperfect_info_games/resources-imperfect-info-games.md` の最優先リソース

## 収録レポート

| # | タイトル | 元論文 | 本コンペ適合度 |
|---|---------|--------|---------------|
| 01 | [ReBeL — RL+探索を不完全情報へ統合](01-rebel.md) | Brown et al. 2020, arXiv:2007.13544 | 理論枠組みは正面一致だが完全移植は非現実的 |
| 02 | [Pluribus — 多人数ポーカーの超人AI](02-pluribus.md) | Brown & Sandholm, Science 2019 | blueprint+実時間探索、低コスト学習の教訓 |
| 03 | [DeepStack — 継続的再求解と深層反事実価値ネット](03-deepstack.md) | Moravčík et al. 2017, arXiv:1701.01724 | 隠れ手 range を価値ネットで採点→毎ターン re-solve |
| 04 | [ISMCTS — 情報集合モンテカルロ木探索](04-ismcts.md) | Cowling et al. 2012, IEEE T-CIAIG | **最も実装容易な不完全情報探索ベースライン** |
| 05 | [RLCard — カードゲーム RL ツールキット](05-rlcard.md) | Zha et al. 2019, arXiv:1910.04376 | **環境ラッパ・ベースライン・評価の雛形** |

## 横断的な結論（本コンペ向け）

1. **理論の頂点（ReBeL / Pluribus / DeepStack）はそのまま移植できない** — PTCG は状態空間・カードプール（Standard 約2,000枚）・隠れ手の組合せが爆発的で、PBS の陽な保持や CFR サブゲーム求解は非現実的。**抽出すべきは思想**：「学習価値関数で探索の葉を評価」「自己対戦で価値を育てる」「想定外の相手手を最近傍に丸めない」。
2. **実装の現実解は ISMCTS（determinization 探索）から** — 学習不要・cabt の合法手リストをそのまま subset-armed bandit に渡せる。相手手札/山札順をサンプリングして完全情報インスタンスを評価。SO-ISMCTS で立ち上げ、頭打ちなら MO 化。
3. **足場は RLCard 型の env 設計** — `Game`/`Env` 2層、`obs`+`legal_actions` 辞書、`reset/step/get_payoffs` をテンプレに cabt をラップ。大規模行動空間には **DMC（DouZero 系、cluster-05）** が第一候補。
4. **低コストでも超人は可能** — Pluribus は 64コア8日・約$144。大規模GPU必須ではない。Kaggle の Google Cloud $3,000 クレジットでも blueprint+探索路線は現実的。
5. **DeepStack の数秒/手は cabt の10分/プレイヤー予算と整合** — 価値ネットで葉を評価する深さ制限 re-solve なら予算内に収まる。anytime 設計必須。

## 注意（情報の確度）

- science.org 系（Pluribus / DeepStack / Libratus）は本文 403 のため、PubMed / arXiv(ar5iv) / 著者サイト / 二次資料で数値を相互照合。
- ISMCTS の IEEE 原典 PDF はパース失敗のため、同著者の CIG 2011 / AIJ 2014 と二次資料で手法照合。勝率テーブル等の精密値は原典再確認推奨。
- ReBeL の Venue「NeurIPS 2020」は一般引用ベース（ページ本文から直接未確認）。
