# Retrieval: data_platform_cycle

Dataiku を用いたマーケ施策 ML パイプライン（DB 抽出 → 特徴量管理 → 学習/推論 → 評価）を、**不定期・イベント駆動のキャンペーンサイクル**で回すための基盤に関する詳細レポート群。

## レポート一覧

| # | ファイル | タイトル | 主な論点 |
|---|---------|---------|---------|
| 01 | [01-sql-pushdown-performance.md](01-sql-pushdown-performance.md) | SQL プッシュダウンと性能設計 | 4 エンジン、同一接続条件、pandas の性能崖、partial recipe、DWH 別の最適化厚み |
| 02 | [02-partitioning-campaigns.md](02-partitioning-campaigns.md) | パーティショニングと施策サイクル | file-based vs column-based、`campaign_id` の discrete dimension 化、冪等性のユーザ責任、依存関数、Partitioned Model 非推奨 |
| 03 | [03-triggers-event-driven.md](03-triggers-event-driven.md) | イベント駆動のトリガ設計 | 時間ベースの限界、manual(API) trigger、SQL query change trigger の DB 依存リスク、grace delay、`get_trigger_params()` |
| 04 | [04-feature-store-drift-ab.md](04-feature-store-drift-ab.md) | Feature Store・ドリフト・A/B テスト — ネイティブの限界 | point-in-time 不在、DQ Rules の世代交代、domain classifier、A/B のプラグイン依存、champion/challenger との峻別 |

## パラメータ

| 項目 | 値 |
|------|-----|
| 生成日 | 2026-07-15 |
| ドメイン | dataiku_uplift_ops |
| クラスタ | data_platform_cycle |
| フェーズ | retrieval |
| 入力元 | `research/runs/dataiku_uplift_ops/gather/20260715/data_platform_cycle/resources-data-platform-cycle.md` |
| リソース数 | 81 |
| 一次ソース比率 | 公式ドキュメント / 公式 KB / 公式 Developer が中心。Community と Blog は実務知・限界の裏づけとして併用 |

## ネイティブ vs 自作の要約

| 必要なこと | ネイティブ? | 一言 |
|-----------|-----------|------|
| DB 抽出の in-DB 完結 | ◯ | 同一接続なら自動書き換え。接続をまたぐと即ストリームに落ちる |
| 複雑な分岐 + DB 内実行 | ◯ | partial recipe。本件の主力パターン |
| visual recipe の DB 押し込み | ◯ | Snowflake は Java/Python UDF で範囲が広い |
| pandas メモリ超過の回避 | △ 半自作 | `iter_dataframes` はあるが境界・schema は自分で書く |
| 時間/離散次元の増分計算 | ◯ | パーティション + 依存関数 |
| パーティション SQL の冪等性 | ✗ 自作 | 公式に「ユーザ責任」と明記 |
| 不定期・イベント駆動の起動 | ◯ | 本命は Public API の manual trigger |
| トリガ由来パラメータの受領 | △ 半自作 | SQL トリガ結果は DB 種別依存の報告あり |
| 外部リソース安定待ち | ◯ | grace delay + re-check |
| 特徴量の共有・発見 | ◯ | Feature Store / Feature Group |
| 特徴量の point-in-time 整合 | ✗ 完全自作 | **最大のリスク**。宣言的 as-of join は文書上不在 |
| データセットの品質ゲート | ◯ | Data Quality Rules（12.6.0+） |
| モデル/MES の品質ゲート | △ 旧世代 | DQ Rules はデータセット専用。二世代 API 併用 |
| ラベル無しドリフト監視 | ◯ | input data / prediction drift は ground truth 不要 |
| 実性能の劣化監視 | △ 条件付き | performance drift は ground truth 必須。検知が遅れる |
| モデル同士の比較 | ◯ | Model Comparison |
| champion/challenger 自動昇格 | ✗ 自作 | 比較はあるが昇格自動化は無い |
| 施策の A/B テスト | ✗ プラグイン/自作 | ネイティブではない。champion/challenger は代替にならない |
| 配信前の人手承認 | ◯（Govern 必要） | sign-off。却下/放棄でデプロイがロック |

## 未確認事項（各レポートで再掲）

1. Feature Store の point-in-time / as-of join — 一次ドキュメント上に言及なし（「無い前提で設計する」が唯一の安全策）
2. Feature Group への DQ Rules 適用可否 — 明示的記述なし。要実機確認
3. SQL query change trigger のパラメータ取得可否の DB 別条件 — 公式一覧を発見できず
4. カラムベースパーティションの DWH 別プッシュダウン効率 — 論じた資料なし
5. AB Test Calculator プラグインの保守状況 — 確認できず
6. 不定期サイクルにおけるドリフト検知の実務的閾値設定 — 公式・非公式とも発見できず
