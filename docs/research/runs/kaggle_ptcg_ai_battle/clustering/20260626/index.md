# Kaggle PTCG AI Battle Challenge — 研究領域マップ

ポケモンカードゲーム（PTCG, スタンダード）をプレイする AI エージェント開発コンペで上位入賞を狙うために、調査・習得すべき周辺研究領域を体系化したドメインマップ。

## 調査パラメータ

- **研究タイプ**: 学術論文サーベイ ＋ 技術トレンド分析（先行コンペ・実装事例）
- **時間範囲**: 2018–2026（CCG AI コンペ隆盛期〜最新の LLM エージェント）
- **生成日**: 2026-06-26
- **検索言語**: 英語 ＋ 日本語
- **入力キーワード**: PTCG, cabt Engine, 不完全情報ゲーム, 確率的ゲーム, 巨大組合せ行動空間, `agent(obs_dict)->list[int]`, 合法手選択, デッキ構築60枚, 自動対戦ラダー, Simulation/Strategy 部門
- **関連既存調査**: `docs/research/runs/kaggle_ptcg_ai_battle/retrieval/20260626_competition_spec/`（公式仕様）

## Big Picture（全体像）

PTCG は **2人ターン制・不完全情報・非決定的（確率的）・巨大かつ可変な組合せ行動空間** を持ち、囲碁やポーカーより難しい「収集型カードゲーム（CCG）」に分類される。この領域の AI 研究は、**(A) 対戦プレイ（battle/gameplay）** と **(B) デッキ構築（deckbuilding/draft）** の2軸に大別され、本コンペはこの両方を同時に解く必要がある点が特徴である（提出物に `deck.csv` と `agent()` の両方を含む）。

技術アプローチは大きく **探索系（ISMCTS / 決定化 / CFR）** と **学習系（自己対戦深層強化学習 / 模倣学習）** に分かれ、近年は **両者の統合（探索＋NN）** と **LLM エージェント** が新潮流になっている。本コンペには「ポケモン ISMCTS」「LOCM（Legends of Code and Magic）コンペ」「DouZero（闘地主）」「Hearthstone AI コンペ」「PokéAgent Challenge」という極めて近い先行事例群が存在し、これらの設計知見の流用が勝敗を分ける。

加えて、**1プレイヤー最大10分・時間切れ即敗北** という厳しい実時間制約があるため、重い探索をそのまま使うのは不利であり、**評価関数の質・推論の高速化・相手モデリング** が実務上の鍵になる。

## 参考サーベイ／レビュー論文

| タイトル | 年 | 概要 | リンク |
|---------|----|------|--------|
| Survey of Artificial Intelligence for Card Games and Its Application to the Swiss Game Jass | 2019 | カードゲーム AI 手法の包括サーベイ。探索・CFR・RL の俯瞰 | https://arxiv.org/pdf/1906.04439 |
| Monte Carlo Tree Search: a review of recent modifications and applications | 2022 | MCTS の最新改良・応用の体系的レビュー（ISMCTS 含む） | https://link.springer.com/article/10.1007/s10462-022-10228-y |
| A Survey on Large Language Model-Based Game Agents (ACM CSUR) | 2024+ | LLM ベースゲームエージェントのサーベイ（GitHub で随時更新） | https://github.com/git-disl/awesome-LLM-game-agent-papers |
| Information capture and reuse strategies in MCTS, with applications to games of hidden information | 2014 | 隠れ情報ゲームでの ISMCTS 基礎論文（決定化・strategy fusion） | https://www.sciencedirect.com/science/article/pii/S0004370214001052 |

## Domain Map（クラスタ間の関係）

```
                ┌──────────────────────────────────────────┐
                │  C1. コンペ仕様・cabt Engine・提出最適化   │  ← 既存 retrieval 済み（基盤）
                └──────────────────┬───────────────────────┘
                                   │ 設計制約を与える
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌───────────────┐        ┌───────────────────┐      ┌────────────────────┐
│ C2. 不完全情報 │        │ C3. 自己対戦・深層 │      │ C5. デッキ構築・    │
│  探索(ISMCTS/  │◀──統合─▶│  強化学習/CFR/     │      │  ドラフト最適化     │
│  決定化/CFR)   │        │  リーグ学習        │      │  (進化計算/メタ)    │
└───────┬───────┘        └─────────┬─────────┘      └─────────┬──────────┘
        │                          │                          │
        │  C4. 状態/行動表現・カード埋め込み・評価関数(全手法の土台)  │
        └──────────────────────────┼──────────────────────────┘
                                   ▼
        ┌──────────────────────────────────────────────────┐
        │ C6. 先行コンペ・ベンチマーク(LOCM/Hearthstone/     │  ← 直接流用できる勝ち筋
        │     PokéAgent/DouZero) の勝者解法                  │
        └──────────────────────────┬───────────────────────┘
                                   ▼
        ┌──────────────────────────────────────────────────┐
        │ C7. LLM エージェント・ツール使用・実時間意思決定    │  ← 新潮流(Strategy部門と相性)
        └──────────────────────────────────────────────────┘
```

## クラスタ一覧

| # | クラスタ名 | KW数 | 概要 |
|---|-----------|------|------|
| 1 | [コンペ仕様・cabt Engine・提出最適化](cluster-01-competition-spec.md) | 12 | 公式 I/F・時間制約・提出形式・ラダー評価の理解と最適化（基盤、調査済み） |
| 2 | [不完全情報ゲーム探索（ISMCTS / 決定化 / CFR）](cluster-02-imperfect-info-search.md) | 14 | 隠れ情報・確率性に対する探索系手法。ポケモン ISMCTS 先行研究あり |
| 3 | [自己対戦・深層強化学習・リーグ学習](cluster-03-self-play-rl.md) | 14 | PPO/自己対戦/NFSP/Deep CFR でエージェントを学習。DouZero 系 |
| 4 | [状態・行動表現と評価関数](cluster-04-representation-eval.md) | 13 | カード埋め込み・盤面エンコード・合法手表現・盤面評価関数。全手法の土台 |
| 5 | [デッキ構築・ドラフト最適化](cluster-05-deckbuilding.md) | 12 | 60枚デッキ設計・メタ最適化・進化計算・プレイテスト自動化 |
| 6 | [先行コンペ・ベンチマークと勝者解法](cluster-06-prior-competitions.md) | 13 | LOCM/Hearthstone AI/PokéAgent/闘地主 等の勝ち筋を流用 |
| 7 | [LLM エージェントと実時間意思決定](cluster-07-llm-agents.md) | 12 | LLM によるゲームプレイ・ツール使用・推論。Strategy 部門と好相性 |

## 推奨される調査順序

1. **C1（済）→ C4 → C6** を最優先（基盤理解と「既に勝っている設計」の流用）。
2. **C2 vs C3** を比較し、10分制約下でどちらを主軸にするか方針決定（ハイブリッドが有力）。
3. **C5** でデッキ構築を別タスクとして並行最適化（提出物の `deck.csv`）。
4. **C7** は Strategy 部門のレポート差別化・補助的意思決定として検討。

各クラスタの詳細・キーワード・推奨検索クエリ・シード論文は個別ファイル（`cluster-NN-*.md`）を参照。
