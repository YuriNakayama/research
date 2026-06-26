# Cluster 01 — コンペ仕様

> Kaggle「Pokémon TCG AI Battle Challenge」の制度的な枠組み。**戦略の前提**になるので最初に押さえる。

## 概要

- **主催**: The Pokémon Company × Kaggle × 松尾研（東京大学 松尾豊研究室 / Matsuo Institute）× HEROZ
- **発表**: 2026-06-16
- **エンジン**: 松尾研が本コンペ専用に開発したポケカ対戦シミュレータ **「cabt Engine」**（Kaggle環境 `kaggle-environments` 上で動作）
- **総賞金**: 約 **$290,000〜$300,000+**（報道により数字に幅。Strategyトラック本体が **$240,000**）

## 2つのトラック

| | Simulation トラック | Strategy（戦略レポート）トラック |
|---|---|---|
| Kaggle slug | `pokemon-tcg-ai-battle` | `pokemon-tcg-ai-battle-challenge-strategy` |
| 内容 | AIエージェントを提出し、自動対戦の**Eloラダー**で順位を競う | エージェントの**戦略ロジックを説明する文書**を提出 |
| 締切 | **2026-08-16〜17** | **2026-09-13〜14** |
| 賞金 | **なし**（順位はStrategy評価の入力になる） | **$240,000**（上位8チーム×$30,000） |
| 提出 | `submission.tar.gz`（`main.py` + `deck.csv` + エンジン `cg/`）。**1日5回まで／最新2件が採点対象**（表示は2件のうちの良い方） | レポート（デッキ設計思想・アルゴリズムの独自性等） |

> **戦略上の含意**: 賞金はStrategyトラックにある。だが Strategy の評価軸に「**Simulation での順位**」が含まれるため、**両トラックは一体**。実質「強いエージェントを作り（Simulation）、その設計を説得力ある形で文書化する（Strategy）」のが勝ち筋。

## Strategy トラックの評価軸（報道ベース）

順位は以下を総合して決定:
1. **エージェントの安定性（stability）** — クラッシュ・違反手を出さないこと
2. **デッキ設計のコンセプト（deck design concept）** — 構築の独自性・合理性
3. **Simulation カテゴリでの成績** — 実ラダー順位

→ 上位8チームが各 **$30,000** を獲得し、**第2ステージ（東京での対面トーナメント、日程未定）** に進出。

## ラダーの運用詳細（参考実装からの知見）

- **リセット**: UTC 00:00（＝台湾/日本に近いタイムゾーンで朝）。このタイミングで採点が反映される。
- **1日5提出・最新2件採点**: 提出枠は貴重。**当てずっぽうの調整で枠を浪費しない**（後述の divergence 検証を通したものだけ出す）。
- **エピソード（棋譜）データセット**: 実ラダーの対局ログ（トップ層含む）が**日次のKaggleデータセット**として公開される。これがメタ分析と操縦改善の生命線。
  - 例: `kaggle/pokemon-tcg-ai-battle-episodes-2026-06-19`（zip ~720MB、展開で21GB級。**展開せず `zipfile` で直接処理**）
  - インデックス: `kaggle/pokemon-tcg-ai-battle-episodes-index`（日付・トップ/中央値スコア一覧）
  - リーダーボードCSV（`TeamName → Elo`）と突き合わせて「Elo≥1150のトップ層」を切り出せる。

### エピソードJSONの構造（棋譜リプレイに必須）

- `steps[1][pi]['action']` = そのプレイヤーの**60枚デッキ**
- `rewards` = `[p0, p1]`（**高い方が勝者**）
- `info.Agents[i].Name` = プレイヤー名（リーダーボードCSVの `TeamName` でEloに紐付け）
- リプレイ: `steps[t][pi]['observation']` を自分の `agent` に食わせ、**正解手は `steps[t+1][pi]['action']`**（オフバイワン。同一 `pi` の連続ステップが同一ターン内の連続意思決定。step-1のactionはデッキ）

---

## 出典

- [The Pokémon Company - PTCG AI Battle Challenge Simulation | Kaggle](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle)
- [The Pokémon Company - PTCG AI Battle Challenge Strategy | Kaggle](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy)
- [PokéBeach — Pokémon launches AI competition, $300,000+ in prizes](https://www.pokebeach.com/2026/06/the-pokemon-company-launches-ai-competition-to-build-the-strongest-pokemon-tcg-player-featuring-300000-in-prizes)
- [AICU — Pokémon TCG AI Battle Challenge Begins (#PokécaABC)](https://note.com/aicu/n/ne9cc5c7b4157)
- [Shane the Gamer — $290,000 Prize Pool](https://www.shanethegamer.com/esports-news/pokemon-tcg-ai-battle-challenge/)
- [Deltia's Gaming — $240K Prize Pool](https://deltiasgaming.com/the-pokemon-company-issues-tcg-ai-challenge-with-240k-prize-pool-learn-more/)
- 参考OSS実装: [`github.com/wmh/ptcg-abc`](https://github.com/wmh/ptcg-abc)（独立コミュニティ実装。エンジン/公式素材は非同梱）
