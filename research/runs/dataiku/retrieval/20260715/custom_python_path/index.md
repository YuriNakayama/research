# Retrieval: custom_python_path

ネイティブ Causal Prediction の制約（MLflow モデル / Models ensembling / Model export / Model Evaluation Stores / Model Document Generator と非互換）を回避するために、CausalML/EconML をカスタム Python 経路で Dataiku に載せる設計を、gather で収集した一次ソースに基づいて検討したレポート群。

## パラメータ

| 項目 | 値 |
|------|-----|
| 生成日 | 2026-07-15 |
| 入力元 | `research/runs/dataiku_uplift_ops/gather/20260715/custom_python_path/resources-custom-python-path.md` |
| リソース数 | 62 件（公式ドキュメント / 公式KB / 公式Developer / GitHub / PyPI / MLflow公式 / Blog / 論文） |
| 未解決・要検証の論点 | 22 件（gather のセクション A〜G） |
| URL 到達確認 | 2026-07-15 時点（gather 側で実施） |

## レポート一覧

| # | ファイル | タイトル | 扱う主題 |
|---|---------|---------|---------|
| 01 | [01-three-paths-comparison.md](01-three-paths-comparison.md) | 三経路の比較 — ネイティブ / MLflow pyfunc / カスタム推定器 | 能力マトリクス、判断ロジック、プラグイン経路の制約、KB と本体ドキュメントの食い違い |
| 02 | [02-mlflow-pyfunc-path.md](02-mlflow-pyfunc-path.md) | MLflow pyfunc 経路（既存） | pyfunc ラップから Saved Model 取り込み、`prediction_type` 問題 |
| 03 | [03-custom-metrics-qini.md](03-custom-metrics-qini.md) | カスタム評価メトリックで Qini/AUUC を実装する | `score` 関数契約、reference dataframe、`causalml.metrics` 実在関数一覧と訂正 |
| 04 | [04-partitioned-and-mes.md](04-partitioned-and-mes.md) | Partitioned Model と MES は両立しない | 確定した衝突、トリレンマ、回避策、未確認事項の切り分け |
| 05 | [05-python-version-gate.md](05-python-version-gate.md) | Python バージョンゲート — 3.10 vs 3.11 の衝突 | CausalML `>=3.11` ゲート、ピン留め回避策、Cython ビルド依存 |
| 06 | [06-api-node-serving.md](06-api-node-serving.md) | API node での uplift サービング | `custom_keys` 契約、文書化の非対称、query log 回収の不確実性 |

なお 02 は本 retrieval 実行の前に作成済みのレポートであり、本実行では更新していない。

## 読解順序

推奨は **01 → 05 → 02 → 03 → 04 → 06**。

1. **01（三経路の比較）** をまず読む。ここで「どの経路を採るか」の全体地図が得られる。以降のレポートはすべて、この地図上のいずれかの経路の掘り下げにあたる。
2. 次に **05（Python バージョンゲート）** を読む。これは経路選択より手前の**環境的な足切り**であり、CausalML 0.17.0 の `>=3.11` と Dataiku の MLflow ドキュメントが記載する Python 3.10 検証との齟齬が、gather で「本経路の実務上の最大のブロッカー候補」と位置づけられている。ここが通らなければ 02/03 の設計は机上の議論になる。
3. **02（MLflow pyfunc 経路）** で本命経路の具体を確認し、続けて **03（カスタム評価メトリック）** で「pyfunc に載せた後 Qini/AUUC をどう取り戻すか」を読む。02 と 03 は対で機能する。
4. **04（Partitioned と MES）** はスコープ判断のレポート。セグメント別モデルを検討している場合のみ優先度が上がるが、トリレンマの存在自体は設計初期に知っておく価値がある。
5. **06（API node）** は本番サービング段階の話であり、学習・評価経路が固まってから読むのが自然。

急ぎで結論だけ必要な場合は、**01 の能力マトリクス**と **05 の結論**の 2 箇所を読めば、経路選択に必要な判断材料はおおむね揃う。

## 全体を通じた注意

- gather 段階で確認された**未解決・要検証の論点が 22 件**あり、各レポートはそれらを「⚠️」付きで明示的に保存している。断定と未確認の区別を潰さないこと。
- 特に **「CausalML/EconML を `mlflow.pyfunc.PythonModel` で包む」チュートリアルは事実上存在しない**（gather セクション G）。本経路はコミュニティの前例がほぼない領域であり、設計・検証コストは高めに見積もる必要がある。
- KB と公式ドキュメントで Causal Prediction の制約列挙が食い違っている（01 で詳述）。どちらを信じるかで回避策の設計が変わるため、実機確認が要る。
