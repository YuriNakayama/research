<!--markdownlint-disable-->

## OPEの調査

<title>Off-policy evaluationの調査</title>
<objective>
因果推論分野で、ログデータによりCATE(Conditional Average Treatment Effect)の推定をを推定する手法であるoff-policy evaluationに関する論文を調査する。
</objective>

<exclusion>
- 因果構造の解明は対象外
- マッチングによるATT(Average Treatment effect on the Treated)の推定の調査は対象外
- 層別解析は対象外
</exclusion>

<goals>
- IPW(Inverse Probability Weighting)やDR(Doubly Robust), AIPW(Augmented Inverse Probability Weighting)といったランダム化比較試験が実施できない場合、観測データを用いて、処置が結果に与える「因果的効果」を行楽バイアスを取り除きながら推定する手法を調査する。
- 近年の英語論文のリストを作成する。この際に、できるだけ多くの手法をリスト化することを目指す。
</goals>

<steps>
1. 検索を行うためのキーワードを収集する
2. Google ScholarやarXivでキーワードを用いて論文を検索する
3. 論文のアブストラクトを確認し、目的に合致するものを選定する
4. 選定した論文の概要とリンクを日本語でリスト化する
5. 手法の方向性で分類する
</steps>

<rules>
- 論文は英語で書かれたものに限定する
- 論文の公開日はできるだけ新しいものを優先する（例：過去3年以内）
- 論文の概要は簡潔にまとめる（3-5文程度）
- 論文のリンクは必ず含める
- 思考は英語で行うが、出力は日本語で行う
</rules>

## MetaLearnerの調査
<title>MetaLearnerの調査</title>
<objective>
因果推論分野でCATE(Conditional Average Treatment Effect)の推定を機械学習モデルを選ばずに行うMetaLearnerに関する手法を調査する。
</objective>

<exclusion>
- CATEの推定精度の向上を目指し、因果構造の解明は対象外
- ATT(Average Treatment effect on the Treated)の推定は対象外
- Neural Networkを用いた手法は対象外
</exclusion>

<goals>
- T-Learner, S-Learner, X-Learner, R-Learner, DR-LearnerといったMetaLearnerの手法を調査する。
- 近年の英語論文のリストを作成する。この際に、できるだけ多くの手法をリスト化することを目指す。
</goals>

<steps>
1. 検索を行うためのキーワードを収集する
2. Google ScholarやarXivでキーワードを用いて論文を検索する
3. 論文のアブストラクトを確認し、目的に合致するものを選定する
4. 選定した論文の概要とリンクを日本語でリスト化する
5. 手法の方向性で分類する
</steps>

<rules>
- 論文は英語で書かれたものに限定する
- 論文の公開日はできるだけ新しいものを優先する（例：過去3年以内）
- 論文の概要は簡潔にまとめる（3-5文程度）
- 論文のリンクは必ず含める
- 思考は英語で行うが、出力は日本語で行う
</rules>

## 因果推論モデル(MetaLearner以外)の調査
<title>因果推論モデルの調査</title>
<objective>
因果推論分野でCATE(Conditional Average Treatment Effect)の推定を機械学習モデルを選ばずに行う因果推論モデル(アップリフトモデル)に関する手法を調査する。
</objective>

<exclusion>
- CATEの推定精度の向上を目指し、因果構造の解明は対象外
- ATT(Average Treatment effect on the Treated)の推定は対象外
- Neural Networkを用いた手法は対象外
- Causal Forestは対象外
- 差分プライバシー等の精度以外の目的を持つ手法は対象外
- MetaLearnerは対象外
</exclusion>

<goals>
- class variable transformationのような因果推論分野のアップリフトモデルを調査する。
- 近年の英語論文のリストを作成する。この際に、できるだけ多くの手法をリスト化することを目指す。
</goals>

<steps>
1. 検索を行うためのキーワードを収集する
2. Google ScholarやarXivでキーワードを用いて論文を検索する
3. 論文のアブストラクトを確認し、目的に合致するものを選定する
4. 選定した論文の概要とリンクを日本語でリスト化する
5. 手法の方向性で分類する
</steps>

<rules>
- 論文は英語で書かれたものに限定する
- 論文の公開日はできるだけ新しいものを優先する（例：過去3年以内）
- 論文の概要は簡潔にまとめる（3-5文程度）
- 論文のリンクは必ず含める
- 思考は英語で行うが、出力は日本語で行う
</rules>

## Modified Outcome / Class Variable Transformationの調査
<title>因果推論モデルの調査</title>
<objective>
因果推論分野でCATE(Conditional Average Treatment Effect)の推定を機械学習モデルを選ばずに行う因果推論モデル(アップリフトモデル)に関する手法を調査する。
目的変数を加工することで、標準的な回帰・分類モデルで直接CATEを学習可能にする手法(Modified Outcome / Class Variable Transformation)を調査する。
</objective>

<exclusion>
- CATEの推定精度の向上を目指し、因果構造の解明は対象外
- ATT(Average Treatment effect on the Treated)の推定は対象外
- Neural Networkを用いた手法は対象外
- Causal Forestは対象外
- 差分プライバシー等の精度以外の目的を持つ手法は対象外
- MetaLearnerは対象外
</exclusion>

<goals>
- class variable transformationのような因果推論分野のアップリフトモデルを調査する。
- 近年の英語論文のリストを作成する。この際に、できるだけ多くの手法をリスト化することを目指す。
</goals>

<steps>
1. 検索を行うためのキーワードを収集する
2. Google ScholarやarXivでキーワードを用いて論文を検索する
3. 論文のアブストラクトを確認し、目的に合致するものを選定する
4. 選定した論文の概要とリンクを日本語でリスト化する
5. 手法の方向性で分類する
</steps>

<rules>
- 論文は英語で書かれたものに限定する
- 論文の公開日はできるだけ新しいものを優先する（例：過去3年以内）
- 論文の概要は簡潔にまとめる（3-5文程度）
- 論文のリンクは必ず含める
- 思考は英語で行うが、出力は日本語で行う
</rules>