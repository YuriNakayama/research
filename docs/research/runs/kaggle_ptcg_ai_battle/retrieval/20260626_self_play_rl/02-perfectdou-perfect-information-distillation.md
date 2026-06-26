# PerfectDou: Perfect-Training-Imperfect-Execution と PPO+GAE による高効率自己対戦

## 概要

PerfectDou(Guan et al., NeurIPS 2022)は、斗地主で DouZero を上回る SOTA を、**一桁高いサンプル効率**で達成した自己対戦RL手法である。鍵は「学習時は完全情報(全プレイヤーの手札)を使って価値関数を教え込み、実行時は不完全情報だけで方策を動かす」**Perfect-Training-Imperfect-Execution (PTIE)** 枠組み。PPO+GAE による分散自己対戦で学習する。本コンペ(PTCG AI Battle)のように、シミュレータ内では全情報が手に入るが本番では相手の手札・山札が隠れている、という状況に直結する設計思想を提供する。

## 手法の要点

### Perfect-Training-Imperfect-Execution (PTIE)
actor-critic 構成で、**critic(価値関数)には完全情報**(相手の手札を含むグローバル状態)を、**actor(方策)には不完全情報**(自分から見える観測のみ)を与える。完全情報の価値推定がアドバンテージ \(A\) を安定化し、不完全情報方策の学習を「蒸留(distillation)」のように導く。実行時は critic を捨て、不完全情報 actor のみで動くため不正(チート)にはならない。

- **PPO + GAE**: アドバンテージは GAE で計算し、PPO のクリップ目的で方策を更新。完全情報 critic により分散の低い価値推定が得られ、学習が安定・高速化する。
- **特徴設計**: カード特徴とゲーム特徴を、完全情報状態と不完全情報状態の両方について作り込む。報酬は終端の勝敗に加え、ゲーム進行を表す補助的な node reward を併用可能(ただし node reward なしでも DouZero に勝つ)。
- **発展形(OracleDou)**: \(\lambda\)(完全情報の混合度)を PerfectDou では1固定だが、OracleDou は学習中に1→0へ漸減させ、実行分布へ徐々に整合させる改良も提案されている。

## 主要な結果や知見

- **対 DouZero で上回る**: node reward なしでも PerfectDou は DouZero より高い勝率。「不完全情報を入力としつつ完全情報で価値を導く」ことが学習効率を高めると結論。
- **高サンプル効率**: actor-critic + PTIE により、DMC(DouZero)より大幅に少ないサンプル/wall-clock で SOTA に到達。完全情報 critic が credit assignment を容易にするのが主因。
- **理論的含意**: 不完全情報ゲームでは、学習時に「のぞき見(oracle)」できる情報を価値関数側にだけ注入することで、最終方策の品質と収束速度を同時に改善できる。Suphx の oracle guiding(後述)とも通底する一般原則。
- ※近年(2025)には「GAE は不完全情報自己対戦で短所がある」という指摘論文も出ており、アドバンテージ推定法の選択は要検証(出典欄参照)。

## 本コンペ(PTCG AI Battle)への応用

1. **cabt シミュレータの完全情報を critic に注入**: PTCG の自己対戦では、シミュレータ側で両者の手札・山札・サイド・ベンチを完全観測できる。これを **critic 専用入力**として使い、actor には本番と同じ「ログ・盤面・合法手リスト」だけを与える PTIE 構成にすれば、スパースな勝敗報酬の credit assignment が劇的に楽になる。実行時(Kaggle提出)は actor のみなので不完全情報のまま合法手index を返せる。
2. **10分制約との整合**: 重い計算(完全情報価値推定)は学習時だけに寄せ、推論時は不完全情報 actor の単一 forward pass で済む。これは「1プレイヤー10分」のオンライン予算を最小化する理想形。
3. **サンプル効率がそのまま競争力**: コンペ期間中に回せる自己対戦数は有限。PerfectDou のように PPO+GAE+完全情報 critic で1サンプルあたりの学習価値を上げれば、同じ計算量でより強い方策に到達できる。
4. **報酬整形(reward shaping)**: 終端勝敗に加え、PTCG 固有の進行指標(サイド枚数差、相手ベンチの弱体化、エネルギー付与効率など)を node reward 相当の補助報酬として critic 側に組み込むと、長いエピソードでの学習が安定する(ただし主目的は勝敗に保つ)。
5. **合法手 index への適合**: actor の出力を「合法手リスト上の softmax(不正手はマスク)」とし、critic は完全情報状態価値 \(V(s_\text{full})\) を出す。PTCG の index ベース行動仕様に PPO をそのまま乗せられる。
6. **デッキ最適化との接続**: PTIE は「学習時に多くの情報を価値側へ」という汎用原則なので、デッキ選択フェーズの探索でも、完全情報マッチアップ結果を価値推定に使ってデッキ評価のサンプル効率を上げられる。

## 出典(URL)
- 論文(arXiv): https://arxiv.org/abs/2203.16406
- OpenReview(NeurIPS 2022): https://openreview.net/pdf?id=Blbzv2ZjT7
- 関連批判(GAE の限界, 2025): https://arxiv.org/abs/2605.19235 (注: arXiv掲載の関連研究、要原典確認)
