# Retrieval: competition_spec — PTCG AI Battle Challenge 公式仕様

Kaggle コンペ **「The Pokémon Company - PTCG AI Battle Challenge」** の公式仕様・ルール・技術要件を一次／二次ソースから抽出した調査ドキュメント。

- **調査日**: 2026-06-26
- **対象コンペ**:
  - Simulation Division: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle
  - Strategy Division: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy
- **主催**: 株式会社ポケモン (The Pokémon Company) × 松尾研究所 × HEROZ（Google/NVIDIA 協力）
- **シミュレータ**: cabt Engine（松尾研究所が Kaggle 環境向けに開発）

> ⚠️ **ソースに関する注意**: Kaggle のコンペページは JavaScript レンダリング（および reCAPTCHA）のため `WebFetch` では本文を取得できなかった。本ドキュメントは Kaggle 検索結果のスニペット、公式告知（note.com の AICU / やきいも / タナカナウ各記事）、PR Times 公式リリース、cabt Engine 公式ドキュメント、コミュニティ実装（GitHub `wmh/ptcg-abc`）を突き合わせて作成している。**金額・日付・I/F の細部は必ず Kaggle 公式ページで最終確認すること**（→ [04](04-open-questions.md)）。
>
> 📌 関連: 本コンペの **技術深掘りレポート**（cabt Engine API 解剖・提出最適化・ISMCTS・Lux AI 優勝解・進化デッキ構築）は `../20260626_competition_spec_deepdive/` を参照。

## レポート一覧

| # | タイトル | 主題 |
|---|---------|------|
| [01](01-competition-overview.md) | コンペ概要と2部門構成 | 目的 / Simulation・Strategy 2 部門 / カードプール / cabt Engine |
| [02](02-rules-timeline-prizes.md) | ルール・タイムライン・賞金 | 提出締切 / 2 ラウンド制 / 賞金構造 / 日本ライブイベント / 参加資格 |
| [03](03-agent-interface.md) | エージェント I/F と提出形式 | `agent(obs_dict) -> list[int]` / 観測辞書 / deck.csv / submission.tar.gz |
| [04](04-open-questions.md) | 未確定事項と確認チェックリスト | 公式ページで要確認の項目一覧 |

## サマリ（2026-06-26 時点）

詳細は各レポートを参照。要点:

- **目的**: ポケモンカードゲーム（スタンダード、約2,000枚プール）をプレイする AI エージェント開発。不完全情報・確率的・巨大組合せ行動空間。
- **I/F**: `agent(obs_dict) -> list[int]`（観測辞書を受け取り合法手 index を返す）。`obs_dict` = `Observation(logs / current / select)`。デッキ選択フェーズは `current=None`。
- **時間制約**: 1プレイヤー最大10分、時間切れ即敗北。
- **提出物**: `submission.tar.gz`（`main.py` + `deck.csv`（60枚）+ `cg/`）。
- **2部門**: Simulation（Gaussian レーティング自動対戦ラダー）/ Strategy（技術レポート評価、上位8チームが Round 2 進出）。
- **賞金**: 総額 $290,000+（要公式確認）。

## ソース一覧

- Kaggle Simulation: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle
- Kaggle Strategy: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy
- cabt Engine 公式ドキュメント: https://matsuoinstitute.github.io/cabt/
- 公式プレスリリース（PR Times）: https://prtimes.jp/main/html/rd/p/000000872.000026665.html
- AICU 解説: https://corp.aicu.ai/ja/pokemon-20260616
- GitHub `wmh/ptcg-abc`: https://github.com/wmh/ptcg-abc
