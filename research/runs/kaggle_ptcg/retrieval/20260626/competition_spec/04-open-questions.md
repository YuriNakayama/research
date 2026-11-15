# 04. 未確定事項と確認チェックリスト

本調査は **Kaggle 公式ページの本文を直接取得できなかった**（JS レンダリング＋reCAPTCHA のため `WebFetch` 不可）。以下は **ブラウザで Kaggle 公式ページを直接確認すべき項目** の一覧。二次ソース間で記述が割れている点も含む。

## A. 公式ページで一次確認すべき項目

ログイン済みブラウザで以下のタブを確認する:
- Simulation: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle （Overview / Rules / Data / Code / Leaderboard）
- Strategy: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy

| # | 確認項目 | 現状の把握 | 確認タブ |
|---|----------|-----------|---------|
| 1 | **賞金の正確な内訳・通貨・税** | 総額 $300k+ / 上位8=各$30k / R2優勝$50k 等（二次ソース） | Overview, Prizes |
| 2 | **正確なタイムライン** | Sim締切 8/16・Strategy締切 9/14（ソースで日付が割れる） | Timeline |
| 3 | **Round 2 の正確な日程・場所** | 「2026年9月 日本」vs「2026年末以降」で記述不一致 | Overview |
| 4 | **観測辞書 `obs_dict` の正確なキー構造** | ログ/盤面/legal moves を含む（詳細キー未確認） | Code（スターターNotebook） |
| 5 | **行動空間（action space）の正確な定義** | 「legal moves の index を返す」まで | Code, Data |
| 6 | **デッキ選択フェーズの正確な I/F** | 「60枚のカードIDを返す」まで | Code |
| 7 | **提出形式の正式仕様** | `submission.tar.gz`(main.py+deck.csv+cg/)（コミュニティ実装） | Rules, Code |
| 8 | **計算資源上限**（CPU/RAM/GPU・実行時間） | 未確認 | Rules, Code |
| 9 | **外部データ・学習済みモデルの許容可否** | 未確認 | Rules |
| 10 | **使用可能カードの正式リスト（約2,000枚）** | 「組織側承認カードのみ」まで | Data |
| 11 | **時間制限の厳密な仕様** | 1プレイヤー最大10分・時間切れ即敗北 | Rules |
| 12 | **レーティングシステムの正式名・式** | 「ガウス分布ベース独自レーティング」（TrueSkill 類似？） | Overview, Leaderboard |
| 13 | **チームマージ deadline・チーム上限** | 最大5名（マージ期限未確認） | Rules, Team |
| 14 | **Strategy レポートのフォーマット・評価基準** | デッキ独自性・アルゴリズムの工夫を評価 | Rules（Strategy側） |
| 15 | **2部門の提出が独立か連動か** | 別コンペページだが評価が一部連動 | 両Overview |

## B. ソース間で記述が割れている点

| 論点 | ソースA | ソースB | 要裁定 |
|------|---------|---------|--------|
| Round 2 時期 | 「9月 日本でライブ」(Geeks+Gamers系) | 「2026年末以降 YouTube配信」 | 公式 Timeline |
| 締切の起点 | Sim 8/16締切 | 初回ラウンド 6/16〜8/17 | 公式 Timeline |
| シミュレータ提供元 | 「Pokemon Co. が提供」(一部記事) | 「東大 松尾研究所が開発」(AICU/やきいも) | 両方正しい可能性大（主催=ポケモン、開発=松尾研） |

## C. 次アクションの提案

1. **公式ページの一次確認**: ログイン済みブラウザ（または agent-browser skill）で上表 A を埋める。
2. **スターターノートブックの取得**: Kaggle Code タブから公式サンプルを取得し、`obs_dict` の実キー・action space を確定（→ 確定後に本 retrieval を新 run で更新）。
3. **gather フェーズへ展開**: 「PTCG ルール」「不完全情報ゲーム AI」「MCTS / ISMCTS」「自己対戦強化学習」「カードゲーム AI 先行事例（Hearthstone, MTG, OpenSpiel）」等のクラスタでリソース収集（`research-gather`）。
4. **kaggle_orbit_wars との比較**: 同じ Kaggle ゲーム AI コンペとして、行動空間設計・提出 I/F・評価方式の知見を流用できる（既存ドメインの retrieval 参照）。

> append-only ルールに従い、公式確認で事実が更新された場合は本 run を書き換えず、新しい日付の retrieval run を追加して `latest` ポインタを更新すること。
