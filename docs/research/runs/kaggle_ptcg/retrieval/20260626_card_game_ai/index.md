# 詳細レポート索引 — カードゲーム / TCG AI（最優先リソース）

**作成日**: 2026-06-26
**phase**: retrieval
**対象コンペ**: [Pokémon TCG AI Battle Challenge](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle)
**入力元**: `runs/kaggle_ptcg/gather/20260626_card_game_ai/resources-card-game-ai.md` の最優先リソース

## 収録レポート

| # | タイトル | 元論文 | 本コンペ適合度 |
|---|---------|--------|---------------|
| 06 | [ByteRL — end-to-end ポリシー + optimistic smooth fictitious play](06-byterl.md) | Xi et al. 2023, arXiv:2303.04096 | **二段構造に最も近い前例**（必ず08と接続） |
| 07 | [Strategy Card Game AI Competition 総説 (2018–2022)](07-locm-competition-survey.md) | Kowalski & Miernik 2023, arXiv:2305.11814 | 手法選択の地図・「暗記封じで RL が勝つ」転換点 |
| 08 | [ByteRL の搾取可能性](08-byterl-exploitability.md) | Haluska & Schmid 2024, arXiv:2404.16689 | 自己対戦上位の脆さ → league/PFSP 必須の根拠 |

## 横断的な結論（本コンペ向け）

1. **LOCM 系は本コンペに構造的に最も近い** — 「デッキ構築フェーズ + 対戦フェーズ」の多段階、観測/行動空間がフェーズで切り替わる、自己対戦レーティングで順位付け。Pokémon TCG の Simulation（agent）+ Strategy（デッキ構築・アルゴリズム）の二段構造の直接の前例。
2. **デッキ構築と対戦を一体学習する設計が有効**（ByteRL の end-to-end ポリシー）。両者の相互依存（構築が最適プレイを規定）を捉えられる。行動 index I/F には「統一行動表現 + 合法手マスク」が応用候補（ただし ByteRL の実装詳細は abstract では未確認）。
3. **「暗記を封じると RL が勝つ」転換点**（総説）— LOCM が毎試合カードセットを生成して hardcode を封じるまではルールベース/探索が優勢。封じた 2022 に深層 RL の ByteRL が制覇。PTCG は約2,000枚プール + 隠蔽情報で暗記不能側に倒れており、汎化学習が効く公算が大きい。
4. **競技会優勝 ≠ 頑健（最重要警告）** — ByteRL は LOCM で **highly exploitable** だった。自己対戦 TrueSkill ラダーで上位を狙うなら、均衡性/頑健性が無いと特定の搾取的相手に一晩で抜かれる。**league training / PFSP** と「自エージェントの exploitability を継続監視する自己診断」が必須。
5. **環境は gym-locm / SabberStone を参照** — cabt のラッパ設計（多段階フェーズ + 自己対戦評価）に転用可能。

## 注意（情報の確度）

- 06/07/08 はいずれも arXiv abstract を主たる接地としており、ネットワーク構成・収束保証・参加チーム数・年別優勝者の厳密対応・exploitability の定量値などは **本文 PDF 未確認**（各レポートで明示）。
- 「ByteRL」の名称は原論文 abstract には無く、後続の Haluska & Schmid 2024 による呼称。
- 「人間トップ撃破」は厳密には姉妹論文の Hearthstone 版（arXiv:2303.05197）の成果で、LOCM 版とは区別が必要。
