# 提出最適化: submission.tar.gz・Gaussian ラダー・10分予算とロバスト性

## 概要

本レポートは PTCG AI Battle Challenge の Simulation 部門における「提出と評価の力学」を技術的に整理する。具体的には (1) `submission.tar.gz`(main.py + deck.csv + cg/)のパッケージング、(2) 提出時の validation episode(自己対戦検証)、(3) Gaussian スキルレーティング(TrueSkill 系)による自動対戦ラダー、(4) 1 プレイヤー最大 10 分・時間切れ即敗北という時間予算、を結びつけ、レーティングを最大化するためのエンジニアリング戦略を導く。これらは「強いエージェント」を作るだけでなく「失格しない・正しく評価される」ための前提条件である。

## 手法の要点

**提出パッケージとバージョン固定**

マルチファイルエージェントは `submission.tar.gz` にまとめ、ルートに `main.py` を置く(`tar -czf submission.tar.gz main.py ...`)。PTCG では `main.py`(エージェント本体)・`deck.csv`(60 枚の card ID)・`cg/`(公式エンジンディレクトリ)の 3 点を同梱する。ローカル環境はラダーと同一の `kaggle-environments==1.30.1` に固定する必要があり、バージョン不一致は再現性を壊す。非公式参照実装 (ptcg-abc) では提出シミュレーション締切 2026-08-16、1 日最大 5 提出・直近 2 つが採点という運用が示されている。

**Validation episode(自己対戦検証)**

`kaggle-environments` のシミュレーション系コンペでは、提出をアップロードすると Kaggle がまず **validation episode** を実行する。これは提出エージェントが**自分自身と対戦**して正常動作を確認するもので、エラーを投げる/不正な行動(非合法 index)を返す/タイムアウトするとそのエピソードを失い、提出は「Error」または無効としてマークされる。つまりラダーに乗る前段で、堅牢性とインターフェース適合が必須ゲートになる。

**Gaussian スキルレーティング(TrueSkill)**

ラダーは Gaussian 分布に基づく独自レーティングで 24 時間自動対戦を行う。これは Microsoft Research の TrueSkill 系であり、各エージェントの技量を平均 μ(スキル推定)と標準偏差 σ(不確実性)の 2 パラメータで表現する。Elo の一般化で、引き分け・多人数・部分参加を扱える。推論は因子グラフ上の近似メッセージパッシング(期待値伝播)で行われる。新規提出は σ が大きく、対戦を重ねると σ が縮小し μ が真の実力に収束する。リーダーボードは μ-kσ(保守的スコア)で順位付けされるのが一般的。

**10 分時間予算**

1 プレイヤーあたり試合全体で最大 10 分。**時間切れは即敗北**。kaggle サーバ上での推論は CPU 中心で、Lux AI の事例では 1 推論あたり 2〜2.5 秒かかったことが示されており、深層モデルや重い探索は容易に予算を食い潰す。

## 主要な結果や知見

- **σ の収束を意識した提出運用**: 新規提出直後は σ が大きく順位が乱高下する。改善を確認するには十分な試合数(σ が縮むまで)が必要で、1 日 5 提出という制約下では「ローカルで A/B 検証 → 確信を持って提出」が効率的。ローカルシミュレータはラダー結果を誤予測しうるため、実ラダー A/B も併用する。
- **TrueSkill の含意**: 引き分け・先攻後攻の非対称をモデルが吸収するため、勝率だけでなく「安定して勝てるか(分散の小ささ)」がスコアに効く。期待勝率がわずかに高い堅実な戦略が、ハイリスク・ハイリターン戦略より μ-kσ で上回りやすい。
- **失格回避が最優先 KPI**: validation episode で落ちる/ラダーで時間切れ・例外を出すと、どれだけ強くても 0 点。合法 fallback と残り時間ウォッチドッグの実装は「強さ」より先に効く。
- **バージョン固定の重要性**: `kaggle-environments==1.30.1` とエンジン (`cg/`) の同梱を怠ると、ローカルで通ってもラダーで Error になる。

## 本コンペ(PTCG AI Battle)への応用

- **時間予算ガバナ**: グローバルに「試合開始からの経過時間」を追跡し、残り時間が閾値を下回ったら探索を打ち切って即座に最良手 index を返す設計を `main.py` に組み込む。ターン単位ではなく試合単位 10 分なので、序盤に時間を使いすぎない予算配分(例: 1 ターンあたりソフト上限を動的に縮小)が必要。
- **deck.csv とデッキ選択フェーズの一致**: 提出物の `deck.csv`(60 枚)と、`current=None` のデッキ選択フェーズで返す 60 ID を厳密に一致させる。ズレるとエンジンが不正提出として扱う恐れがある。
- **堅牢性スキャフォールド**: 全選択分岐を `try/except` で包み、`minCount` 個の合法 index を返す `_legal_fallback` を必ず用意。validation episode(自己対戦)をローカルで `env.run([agent, agent])` により再現し、提出前に必ず通す。
- **レーティング駆動の改善ループ**: ローカルで対戦数千試合の勝率推定 → 有意差のある改善のみ提出 → ラダーで σ が縮むまで観測、という TrueSkill を意識したサイクルを回す。1 日 5 提出・直近 2 採点の制約に合わせ、提出は「確信した変更」に絞る。

## 出典(URL)

- Kaggle simulation competitions(submission.tar.gz, validation episode): https://github.com/Kaggle/kaggle-cli/blob/main/docs/simulation_competitions.md
- kaggle-environments README: https://github.com/Kaggle/kaggle-environments/blob/master/README.md
- TrueSkill: A Bayesian Skill Rating System (Microsoft Research): https://www.microsoft.com/en-us/research/publication/trueskilltm-a-bayesian-skill-rating-system/
- TrueSkill (Wikipedia): https://en.wikipedia.org/wiki/TrueSkill
- ptcg-abc README(提出運用・締切・cg/ 配置): https://github.com/wmh/ptcg-abc/blob/main/README.md
- PTCG AI Battle Challenge Simulation (Kaggle): https://www.kaggle.com/competitions/pokemon-tcg-ai-battle
