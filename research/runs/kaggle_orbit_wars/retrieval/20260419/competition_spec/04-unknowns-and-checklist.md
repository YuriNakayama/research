# 未確定事項と確認チェックリスト

Kaggle 公式ページ（reCAPTCHA でアクセス不可）で確定させるべき項目のチェックリスト。

## 🔴 最優先で確認すべき項目

### Overview タブ
- [ ] コンペのホスト（Kaggle 自体主催 or 第三者スポンサー）
- [ ] 賞金総額と分配（1st / 2nd / 3rd / Top N）
- [ ] メダル対象コンペか（Gold/Silver/Bronze 閾値）
- [ ] NeurIPS / ICML 等の併催イベント有無

### Timeline タブ
- [ ] コンペ開始日
- [ ] Entry deadline（エントリ締切）
- [ ] Team merge deadline（チームマージ締切）
- [ ] Final submission deadline（最終提出）
- [ ] 結果発表日
- [ ] Final evaluation period の長さ

### Rules タブ
- [ ] 外部データの利用可否
- [ ] 学習済みモデル持ち込みの許容範囲
- [ ] オープンソースライセンス要件
- [ ] コード共有のタイミング制約
- [ ] アカウント制限（multi-account 禁止など）
- [ ] 1 日あたりの submission 回数上限
- [ ] Self-submit の禁止事項

### Evaluation タブ
- [ ] 評価指標（TrueSkill / Elo / 勝率）
- [ ] マッチメイキングの頻度
- [ ] 最終評価はリーダーボード順位 or 別評価期間
- [ ] Final scoring period の進行（対戦数／ボット）

### Data / Code タブ
- [ ] スターターキットの有無
- [ ] 公式ベースラインエージェント
- [ ] 提出用テンプレート Notebook

## 🟡 中優先の確認項目

- [ ] 2P と 4P のどちらで開催？両方？
- [ ] Submission 実行環境のスペック（CPU コア数、RAM、ディスク）
- [ ] GPU の有無
- [ ] 1 submission あたりの総実行時間上限
- [ ] エピソードタイムアウトの詳細
- [ ] 実行環境の Docker image
- [ ] メモリ制限超過時の挙動（kill / error）
- [ ] Public / Private leaderboard の分割

## 🟢 あれば良い情報

- [ ] 過去同種コンペでのメダル閾値推移
- [ ] 公式 Discussion の pinned post（FAQ）
- [ ] 主催者の公式 Twitter / Discord
- [ ] スターターノートブックの提供
- [ ] ランキング更新頻度

## 推定（確認未済だが、類似コンペから高確率）

| 項目 | 推定値 | 類似コンペ |
|------|-------|----------|
| 評価 | TrueSkill rating | Kore 2022 / Lux S2 |
| メダル | 有 | 既存 Kaggle Simulation |
| 外部データ | 部分許可（Kaggle dataset 経由） | 同 |
| GPU | 提供なし | 同 |
| Runtime | 16GB RAM / 4 CPU / 無GPU | Kaggle default |
| Submission 上限 | 5 回/日 | Kaggle default |
| Final evaluation | 2 週間 | Kore 2022 |

## 確認方法

1. **ブラウザで Kaggle にログイン** し https://www.kaggle.com/competitions/orbit-wars にアクセス
2. 各タブ（Overview / Data / Rules / Timeline / Evaluation / Code / Discussion）を順に確認
3. Discussion の pinned post を最優先で読む
4. 公式 starter Notebook があれば fork してローカル検証

## 自動化メモ

- Kaggle API (`kaggle competitions list-files orbit-wars`) でファイル一覧取得は可能（認証必要）
- `kaggle competitions download -c orbit-wars` でスターターキット取得
- ただし cookie 認証付き WebFetch は本 CLI では未対応

## 結論

**現時点の情報だけで開発着手可能**:
- 公式環境 `kaggle_environments.envs.orbit_wars` が v1.0.9 で公開済
- ゲームルール・観測・アクションは完全に仕様化済
- ローカル対戦・ベースライン開発は **Kaggle 公式ページにアクセスせずとも開始可能**

一方、**提出前には必ず確認が必要** な項目:
- 提出形式の詳細
- 評価指標（最終スコアの計算式）
- 外部データ/学習済みモデルの扱い
- タイムラインと submission 上限
