# Cluster 01: コンペ公式仕様 (competition_spec)

## スコープ

Kaggle Orbit Wars コンペティションそのものの **公式仕様** を確定させるクラスタ。解法を設計する前に必ず押さえるべき「動かぬ事実」を扱う。

## 主要トピック

| トピック | 調査内容 |
|---------|---------|
| Overview | コンペの目的、参加形態（個人/チーム）、ホスト、スポンサー |
| Rules | 外部データ利用可否、複数アカウント禁止、提出回数制限、コード共有ポリシー |
| Evaluation | 評価指標（Elo? TrueSkill? 勝率?）、リーダーボード算出方式、最終順位確定方法 |
| Timeline | 開始日、team merge deadline、entry deadline、最終提出日、結果発表 |
| Submission format | エージェントコード形式（Python ファイル / Notebook / Docker?）、必須関数シグネチャ、依存関係、計算資源制限 |
| Prizes | 賞金総額、上位分配、Gold/Silver/Bronze メダルの閾値 |
| Compute limits | 1手あたり思考時間、総思考時間、メモリ上限、GPU 利用可否 |
| Starter kit | 公式提供のベースライン agent、シミュレータ API、評価スクリプト |

## キーワード

- Kaggle Orbit Wars rules / evaluation / submission
- `kaggle_environments` API
- Simulation competition episode
- Agent function signature
- TrueSkill / Elo ranking
- Team merge deadline

## 想定リソース種別

- Kaggle 公式ページ: Overview / Data / Rules / Evaluation / Timeline / Code タブ
- Kaggle Discussion フォーラム（特に pinned post / FAQ）
- `kaggle-environments` GitHub リポジトリ（該当環境がマージされていれば）
- 主催者の公式ブログ / プレスリリース

## 他クラスタとの関係

- **→ game_mechanics**: 仕様書に記載されるゲーム物理は cluster 02 で深掘り
- **→ similar_competitions**: 提出形式やシミュレータ API は Kaggle 過去 Simulation コンペと共通部分が多く、cluster 03 の知見が直接転用できる

## 優先度

**最高**。他のすべてのクラスタの前提となるため、gather / retrieval を最優先で完了させる。
