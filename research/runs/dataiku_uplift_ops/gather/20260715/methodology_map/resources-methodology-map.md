# Resources: methodology_map

uplift / OPE / offline RL の手法論リソース。マーケティング施策最適化の実務家が実際に読むものを優先。

## 本リストの前提を覆す2つの発見

| 事前の想定 | 実際 |
|-----------|------|
| Adyen 論文は DRos / Switch-DR / MIPS / SLOPE++ を使っている | ❌ **IPS / SNIPS / DM / DR の4つのみ**。高度な推定量は未検証 |
| DR 系が IPS より優れる（理論的推奨） | ❌ Adyen の本番実測では**逆**。IPS/SNIPS が相関 0.8 超、**DM は負の相関、DR はほぼゼロ** |

## 1. Uplift / CATE の基礎

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **Metalearners for Estimating HTE Using Machine Learning**（Künzel et al., PNAS 2019） | https://www.pnas.org/doi/10.1073/pnas.1804597116 | 論文 | S/T/X-learner の原典。X-learner は**処置群・対照群が不均衡なとき（＝クーポン施策の典型）**に効く。**まずここから** |
| 2 | **Quasi-Oracle Estimation of HTE**（Nie & Wager, Biometrika 2021） | https://arxiv.org/abs/1712.04912 | 論文 | R-learner。Robinson 分解を ML に持ち込んだ直交化系 CATE の中核 |
| 3 | **Optimal Doubly Robust Estimation of HTE**（Kennedy, 2020） | https://arxiv.org/abs/2004.14497 | 論文 | DR-learner。AIPW 式を pseudo-outcome として2段階回帰。理論保証が最も明快 |
| 4 | **Generalized Random Forests**（Athey, Tibshirani, Wager, AoS 2019） | https://arxiv.org/abs/1610.01271 | 論文 | causal forest の原典。**CATE の信頼区間**が出せるのが実務上の決定的な差。honest splitting |
| 5 | **Double/Debiased Machine Learning**（Chernozhukov et al., 2018） | https://arxiv.org/abs/1608.00060 | 論文 | Neyman 直交性 + cross-fitting。causal forest / R-learner の裏側の原理 |
| 6 | Nonparametric Estimation of HTE: From Theory to Learning Algorithms（Curth & van der Schaar, AISTATS 2021） | https://arxiv.org/abs/2101.10943 | 論文 | metalearner 群を統一的に整理・比較。「どの learner をいつ使うか」の判断材料 |
| 7 | A Tutorial Introduction to HTE Estimation with Meta-learners | https://pmc.ncbi.nlm.nih.gov/articles/PMC11379759/ | 論文 | 査読付きチュートリアル。数式と実装の橋渡し |
| 8 | **21 - Meta Learners**（Causal Inference for the Brave and True） | https://matheusfacure.github.io/python-causality-handbook/21-Meta-Learners.html | 技術ブログ | **実務家向け解説の決定版**。論文3本読む前にこれを読むと理解が速い |
| 9 | Comparison of meta-learners for estimating multi-valued treatment HTE | https://arxiv.org/abs/2205.14714 | 論文 | **多値処置（クーポン金額が複数段階＝実務の実態）**への metalearner 拡張 |
| 10 | Chapter 23 Meta-Learners（Oxford APTS） | https://www.stats.ox.ac.uk/~evans/APTS/meta-learners.html | 技術ブログ | 講義ノート。ブログより厳密、論文より短い |

## 2. Off-policy evaluation

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 11 | **Off-policy Evaluation for Payments at Adyen**（2025） | https://arxiv.org/abs/2501.10470 | 論文 | **本クラスタの中心**。billion-scale の本番 OPE。**IPS・SNIPS が A/B と相関 0.8 超、DM は負の相関**という理論と逆の結果。決定的ポリシーから exploration traffic で確率的ポリシーを復元する実装の記述が最大の価値 |
| 12 | **The Self-Normalized Estimator for Counterfactual Learning**（Swaminathan & Joachims, NeurIPS 2015） | https://papers.nips.cc/paper/5748-the-self-normalized-estimator-for-counterfactual-learning | 論文 | SNIPS。**Adyen で実際に効いた推定量**なので実務的優先度は高い |
| 13 | **Doubly Robust Policy Evaluation and Learning**（Dudík, Langford, Li, ICML 2011） | https://arxiv.org/abs/1103.4601 | 論文 | DR の原典。OPE の教科書的基準線 |
| 14 | Optimal and Adaptive OPE in Contextual Bandits（Wang et al., ICML 2017） | https://arxiv.org/abs/1612.01205 | 論文 | Switch-DR。bias-variance トレードオフを明示的に設計 |
| 15 | **Doubly Robust OPE with Shrinkage**（Su et al., ICML 2020） | https://proceedings.mlr.press/v119/su20a.html | 論文 | **DRos**。MSE 上界を最小化するよう重みを縮小。**Adyen が使わなかったが理論上は使うべきだった推定量** |
| 16 | **OPE for Large Action Spaces via Embeddings**（Saito & Joachims, ICML 2022） | https://arxiv.org/abs/2202.06317 | 論文 | **MIPS**。行動数が多いときの分散爆発を回避。**クーポン種類やクリエイティブが多数ある設定に直結** |
| 17 | OPE for Large Action Spaces via Conjunct Effect Modeling（Saito et al., ICML 2023） | https://proceedings.mlr.press/v202/saito23b/saito23b.pdf | 論文 | OffCEM。MIPS の「良い埋め込みを人手で定義できる」という強い前提を緩める |
| 18 | Doubly Robust Estimator for OPE with Large Action Spaces（Taufiq et al., 2023） | https://arxiv.org/abs/2308.03443 | 論文 | MDR。MIPS より弱い仮定で不偏かつ分散低減 |
| 19 | **Adaptive Estimator Selection for OPE**（Su et al., ICML 2020） | https://arxiv.org/abs/2002.07729 | 論文 | **SLOPE**。Lepski の原理でバイアス推定なしにハイパラを選ぶ。「どの推定量を信じるか」への最初の実用解 |
| 20 | Policy-Adaptive Estimator Selection for OPE（Udagawa, Kiyohara, Narita, Saito, Tanaka, AAAI 2023） | https://arxiv.org/abs/2211.13904 | 論文 | PAS-IF。**SLOPE（クラス内チューニング）と PAS-IF（クラス間選択）の組合せが実運用の推奨形** |
| 21 | Automated Off-Policy Estimator Selection via Supervised Learning | https://arxiv.org/abs/2406.18022 | 論文 | 推定量選択を教師あり学習として解く |
| 22 | **Offline A/B testing for Recommender Systems**（Gilotte et al., Criteo, WSDM 2018） | https://arxiv.org/abs/1801.07030 | 論文 | Criteo の OPE 実運用報告。**Adyen の7年前の先行事例で、Adyen と対で読むべき産業論文** |
| 23 | A Practical Guide of OPE for Bandit Problems（CyberAgent, 2020） | https://arxiv.org/abs/2010.12470 | 論文 | 🇯🇵 実務ガイド。実務上の落とし穴を列挙 |
| 24 | Debiased OPE for Recommendation Systems（Narita, Yasui, Yata） | https://arxiv.org/abs/2002.08536 | 論文 | 🇯🇵 成田・安井らによるバイアス除去 OPE |

## 3. Offline RL / 制約付き最適化

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 25 | **BCORLE(λ)**（NeurIPS 2021, Alipay） | https://proceedings.neurips.cc/paper/2021/hash/ab452534c5ce28c4fbb0e102d4a4fb2e-Abstract.html | 論文 | **本サブトピックの中心**。予算制約下のクーポン配分を Lagrangian 問題として定式化。**λ-generalization により λ 更新のたびの再学習を回避**（＝予算が期ごとに変わる実務に直結） |
| 26 | **Marketing Budget Allocation with Offline Constrained Deep RL**（WSDM 2023） | https://arxiv.org/abs/2309.02669 | 論文 | BCORLE の直接的な比較対象。定式化がより素直で実装しやすい |
| 27 | Safe Offline RL with Real-Time Budget Constraints（ICML 2023） | https://arxiv.org/abs/2306.00603 | 論文 | 配信中に予算が動く運用への対応 |
| 28 | HiBid: Cross-Channel Constrained Bidding with Hierarchical Offline Deep RL | https://arxiv.org/abs/2312.17503 | 論文 | メール／クーポン／広告を横断する場合の参考 |
| 29 | Strategic Coupon Allocation in Two-sided Marketplaces | https://arxiv.org/abs/2407.14895 | 論文 | 🇯🇵 供給側への配慮という、uplift 最大化だけでは抜ける観点 |

## 4. AUUC / Qini 批判スレッド — **本クラスタで最重要**

> **このスレッドの主張は一枚岩ではない。批判の根拠がそれぞれ異なり、しかも互いに矛盾する。**

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 30 | **Rethinking Causal Ranking: A Balanced Perspective on Uplift Model Evaluation**（ICML 2025） | https://proceedings.mlr.press/v267/zhu25s.html | 論文 | **批判スレッドの現時点での到達点**。uplift / Qini 曲線は**二値の負のアウトカムを持つ個人を正しくランク付けできない**→バイアスのあるモデルが不偏なモデルより高い曲線値を得て**モデル選択を誤らせる**。対案 PUC / PUL / PTONet |
| 31 | **PUC — 公式実装** | https://github.com/euzmin/PUC | OSS | #30 の実装。PUC 指標、PTONet、`metric_test.ipynb`。⚠️ **ライセンス表記がない**点に注意 |
| 32 | ICML 2025 OpenReview 版 | https://openreview.net/pdf?id=iJdjDM6Odd | 論文 | 査読コメント込み。反論と著者応答が読め、主張の射程を測れる |
| 33 | **Improving Uplift Model Evaluation on RCT Data**（Bokelmann & Lessmann, 2022） | https://arxiv.org/abs/2210.02152 | 論文 | Qini 曲線の評価が**ランダムノイズに強く左右され、シグナルが恣意的になる**。分散削減法を提案。**#30 とは批判の切り口が異なる**（ノイズ vs 構造的欠陥） |
| 34 | **クーポンマーケティングにおける Uplift Modeling 適用の問題点と新しい評価指標**（メルカリ, JSAI2020） | https://www.jstage.jst.go.jp/article/pjsai/JSAI2020/0/JSAI2020_1H4OS12b02/_pdf | 論文 | 🇯🇵 **実務家による批判の原点**。Qini が**費用対効果の構造と一致しない**ことを具体例で示す。対案 Sure Things Curve。**学術的批判が統計的性質を問うのに対し、指標とビジネス目的の不一致を問う** |
| 35 | Evaluating Uplift Modeling under Structural Biases（KDD 2026） | https://arxiv.org/abs/2603.20775 | 論文 | ⚠️ **#30 と直接対立**。**Qini 係数はバイアス環境で安定性が著しく低く、Uplift / AUUC のほうが頑健**と結論。#35 は Qini を叩き AUUC を擁護、#30 は両方を叩く |
| 36 | **Evaluating Treatment Prioritization Rules via RATE**（Yadlowsky et al., JASA 2025） | https://arxiv.org/abs/2111.07966 | 論文 | **AUUC・Qini 批判に対する最も建設的な回答**。TOC 曲線を定義し重み付き積分として RATE を構成。**AUTOC と QINI は重み関数 α(q) の違いにすぎない**と統一的に整理し、**ブートストラップによる有効な標準誤差**を与える |
| 37 | Learning to Rank for Uplift Modeling（Devriendt et al., TKDE） | https://arxiv.org/abs/2002.05897 | 論文 | AUUC を目的関数として最適化することの是非。#30 の指摘と読み合わせると論点が立体的になる |
| 38 | Uplift Modeling with Generalization Guarantees（KDD 2021） | https://dl.acm.org/doi/10.1145/3447548.3467395 | 論文 | 評価指標の信頼性問題に理論側から接近 |

## 5. 評価指標のツーリング

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 39 | **causalml**（Uber） | https://github.com/uber/causalml | OSS | AUUC・感度分析・解釈性・policy optimization。**uplift 実務の第一候補** |
| 40 | **EconML**（Microsoft） | https://github.com/py-why/EconML | OSS | DML・DR-learner・causal forest。**あえて Qini/AUUC を持たず**方策を直接学習・解釈する設計思想 |
| 41 | **scikit-uplift (sklift)** | https://www.uplift-modeling.com/en/latest/index.html | OSS | AUUC・Qini（理想ケースつき）・uplift@k を最も素直に提供。**評価指標の計算だけならこれが一番速い**。⚠️ 2022年8月で凍結 |
| 42 | **grf — rank_average_treatment_effect()** | https://grf-labs.github.io/grf/reference/rank_average_treatment_effect.html | OSS | **RATE / TOC のリファレンス実装**（R）。ブートストラップ標準誤差つき。`target = "AUTOC"` / `"QINI"` で切替 |
| 43 | **Open Bandit Pipeline (obp)** | https://github.com/st-tech/zr-obp | OSS | 🇯🇵 OPE 推定量の実装カタログ。**Adyen が自前 Spark 実装した部分の多くはここに既にある** |
| 44 | CausalLift | https://github.com/Minyus/causallift | OSS | 🇯🇵 Two Models アプローチ。小規模・教育用途向き |
| 45 | Uplifting with Decision Forests（TF-DF） | https://www.tensorflow.org/decision_forests/tutorials/uplift_colab | 技術ブログ | 実行可能な Colab |

## 6. 傾向スコアのロギング実務

> **論文が最も少なく、しかし実装で最も詰まる領域。**

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 46 | **Adyen — exploration traffic 節** | https://arxiv.org/html/2501.10470 | 論文 | 本番が**決定的ポリシー**で OPE が原理的に不可能だった問題を、ε-greedy の exploration traffic から**含意される行動確率を復元**して解決。代償として重みが巨大化し、weight clipping で対処 |
| 47 | **The Hidden Foundation of OPE: Why Correct Propensity Logging Is Critical** | https://somayeh-farhadi.medium.com/the-hidden-foundation-of-off-policy-evaluation-why-correct-propensity-logging-is-everything-00335c93b496 | 技術ブログ | **実装原則**: 傾向スコアは**最終意思決定が行われるその場所で、最終的な eligible list を使って計算・ログする**。ここを外すと後段の推定量選択が全部無意味。エンジニア向けに最も実用的 |
| 48 | Candidate Sets: The Invisible Boundary of OPE | https://somayeh-farhadi.medium.com/candidate-sets-the-invisible-boundary-of-off-policy-evaluation-ope-796b3b299aff | 技術ブログ | 候補集合（フィルタ・ビジネスルール）が OPE の妥当性を壊す経路 |
| 49 | OPE for Ranking Policies under Deterministic Logging Policies | https://openreview.net/forum?id=0ZkWWxcHKV | 論文 | exploration traffic を確保できない場合の代替路 |
| 50 | Logging Policy Design for Off-Policy Evaluation | https://arxiv.org/abs/2605.15108 | 論文 | 「そもそもどうログを取る設計にすべきか」。**数ヶ月おきの配信なら次回設計時点で介入できる**ので実務的価値が高い |
| 51 | Unbiased Offline Evaluation for Learning to Rank with Business Rules | https://arxiv.org/abs/2311.01828 | 論文 | 現場のポリシーは必ずルールで汚染されているので現実的 |

## 7. 日本語の手法論解説

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 52 | **Off-Policy Evaluation の基礎と ZOZOTOWN 大規模公開実データおよびパッケージ紹介**（齋藤優太） | https://techblog.zozo.com/entry/openbanditproject | 技術ブログ | 🇯🇵 **日本語 OPE 入門の決定版**。英語論文に入る前にここを通ると効率が段違い |
| 53 | **私のブックマーク「反実仮想機械学習」**（人工知能学会誌 35巻4号） | https://www.ai-gakkai.or.jp/resource/my-bookmark/my-bookmark_vol35-no4/ | 技術ブログ | 🇯🇵 CFML 領域全体の**日本語ガイドマップ** |
| 54 | バンディットアルゴリズムの評価と因果推論（安井翔太） | https://cyberagent.ai/blog/research/causal_inference/199/ | 技術ブログ | 🇯🇵 バンディットと因果推論の接続 |
| 55 | バンディットアルゴリズムを用いた推薦システムの構成について | https://techblog.zozo.com/entry/zozoresearch-bandit-overviews | 技術ブログ | 🇯🇵 運用パイプラインの見取り図 |
| 56 | Uplift Modeling の適用（mercari AI） | https://ai.mercari.com/projects/uplift-modeling/ | 技術ブログ | 🇯🇵 persuadable のみに通知を送る設計思想。#34 の背景 |
| 57 | 因果推論 — CyberAgent AI Lab 論文一覧 | https://research.cyberagent.ai/pub_tag/因果推論/ | 技術ブログ | 🇯🇵 日本の産業界の最前線を追う起点 |
| 58 | 施策は本当に効果があったのか──因果推論に学ぶアップリフトモデリング入門（GiXo） | https://zenn.dev/gixo/articles/uplift-modeling-meta-learner-intro | 技術ブログ | 🇯🇵 #8 の日本語版として機能 |

## 8. 書籍

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 59 | **効果検証入門**（安井翔太, 技術評論社 2020） | https://gihyo.jp/book/2020/978-4-297-11117-5 | 書籍 | 🇯🇵 **日本語の実務因果推論の標準教科書**。CyberAgent の新人研修に採用。uplift の前提となる「正しい比較」の作法 |
| 60 | **Causal Inference for The Brave and True** | https://matheusfacure.github.io/python-causality-handbook/landing-page.html | 書籍 | 無料・Python 実装つき。**Part II が CATE / uplift とテック業界への応用**。予算制約下で誰に割引を出すかという本クラスタそのものの問題設定 |
| 61 | Causal Inference in Python（O'Reilly 2023） | https://www.oreilly.com/library/view/causal-inference-in/9781098140243/ | 書籍 | #60 の書籍版・整理版 |
| 62 | Causal Inference: What If（Hernán & Robins） | https://miguelhernan.org/whatifbook | 書籍 | 無料 PDF。傾向スコアの前提を疑う段で効く |

## 9. ベンチマークデータセット

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 63 | **Criteo Uplift Prediction Dataset**（AdKDD 2018） | https://ailab.criteo.com/criteo-uplift-prediction-dataset/ | データセット | 25M 行。実際の incrementality test 由来。業界標準ベンチマーク |
| 64 | **Hillstrom MineThatData Email Analytics Challenge** | https://blog.minethatdata.com/2008/03/minethatdata-e-mail-analytics-and-data.html | データセット | **販促メールの uplift 検証データの古典**。64,000顧客、メール2施策＋対照群。**本プロジェクトの「販促メール」設定にそのまま対応**。小さいので試作に最適 |
| 65 | **Open Bandit Dataset**（ZOZO） | https://github.com/st-tech/zr-obp/blob/master/obd/README.md | データセット | 🇯🇵 約26M 行。**真の傾向スコアが記録されている稀有な公開データ**。Uniform Random と Bernoulli TS の**複数ポリシーで収集**されており、**Adyen が苦労した部分を安全に練習できる** |

## 読解順序の推奨

### Step 0 — 前提を固める（1週間）
**#59 効果検証入門**（日本語なら最速）または **#60 Brave and True Part I**。「正しい比較とは何か」が曖昧なまま uplift に進むと後段の指標議論が空回りする。

### Step 1 — uplift の手法を掴む（1週間）
**#8 Meta Learners** → **#7 チュートリアル** → **#1 Künzel PNAS**。causal forest が必要になったら **#4 GRF**、直交化の原理は **#5 DML**。#2 / #3 は「X-learner で不足を感じてから」で十分。

### Step 2 — 評価指標の地雷原を先に踏む（**最優先・順序を入れ替えない**）
**ここを Step 3 の前に置くことが本リストの最大の主張。** モデルを作ってから指標を疑うと作業がすべて無駄になる。

**#34 メルカリ JSAI2020**（日本語・短い・問題設定が最も近い）→ **#33 Bokelmann & Lessmann** → **#30 ICML 2025** → **#36 RATE/TOC** の順。最後の #36 が建設的な出口。**#31 PUC 実装**と **#42 grf の RATE** を手元で動かし、**自社データで AUUC と RATE が食い違うかを実際に確認する**。食い違わなければ AUUC のままでよい。食い違うならそこが意思決定の分岐点。

### Step 3 — OPE を実装する（2〜3週間）
**#52 ZOZO の日本語解説** → **#13 DR 原典**・**#12 SNIPS** → **#11 Adyen** と **#22 Criteo** を**必ず対で** → **#43 OBP** で実装。行動数が多いなら **#16 MIPS**、推定量選択に迷ったら **#19 SLOPE**。

### Step 4 — ロギング設計に手を入れる（配信サイクルの谷間で）
**#47 Propensity Logging** → **#46 Adyen の exploration traffic 節** → **#50 Logging Policy Design**。**数ヶ月おきという cadence は次回配信の設計に介入できるという意味で有利**。ここで exploration を仕込めるかが Step 3 の難易度を決める。

### Step 5 — 予算制約が本質になったら
**#25 BCORLE(λ)** → **#26**。ただし **uplift + 単純な閾値ルールで足りるなら offline RL は不要**。RL は予算制約が動的で、かつ複数期にまたがる持ち越し効果がある場合にのみ元が取れる。

## 出典間の対立点

> **本クラスタは合意が形成されていない領域であり、それこそが最も重要な知見である。**

**対立1: Adyen の実測 vs OPE の理論的推奨（最も重大）**
理論と大半の論文（#13, #15）は「DR 系が IPS より優れる」と言う。しかし **#11 Adyen の本番実測では逆**（IPS/SNIPS が相関 0.8 超、DM は負の相関、DR はほぼゼロ）。DR は DM を内包するため、DM の回帰モデルが壊れていれば DR も引きずられるのが最も自然な解釈。**含意**: 自社の DM の質を検証せずに DR を選ぶのは危険。まず IPS/SNIPS を基準線に置き、DR がそれを上回ることを**自社データで実証してから**採用する。なお Adyen は DRos / Switch-DR / MIPS / SLOPE++ を検証していないので、**「DR 系が本当にダメ」ではなく「素朴な DR を素朴に使うとダメ」**と読むのが妥当。#43 OBP を使えばこの追試は安価にできる。

**対立2: Qini を捨てるのか AUUC も捨てるのか（正面衝突）**
**#35（KDD 2026）**は「**Qini は不安定、AUUC のほうが頑健**」と結論。**#30（ICML 2025）**は「**uplift 曲線も Qini 曲線も**失敗する」と両方を否定。**評価軸が違う**（前者はバイアス下の順位相関の安定性、後者は不偏モデルを正しく選べるか）ため直接比較できない。**含意**: どちらに賭けるかを決めるより、**#36 RATE を検定として併用**し「そもそも有意な heterogeneity があるか」を先に確かめるほうが安全。

**対立3: 批判の根拠が三者三様（同じ結論、違う理由）**
#30（構造的なランク付けの欠陥）、#33（ランダムノイズによる恣意性）、#34（費用対効果の構造との不一致）はいずれも「Qini を信じるな」に着地するが**原因診断が全く異なる**ため処方箋も互換性がない。**含意**: 自社の症状がどれなのかを見極めてから対策を選ぶ。クーポン金額が可変で ROI が焦点なら #34、サンプルが小さければ #33、モデル選択が安定しないなら #30。

**対立4: 学術的批判 vs 実務的批判の射程**
#34（メルカリ）は**指標とビジネス目的の不一致**を突く。これは #30 / #33 / #35 のどれとも直交し、**統計的に完璧な指標を使っても解消しない**。クーポン施策では「uplift が高い人」と「コストを回収できる人」が一致しない以上、最終的には指標の議論ではなく**目的関数の設計**（#25 の Lagrangian 定式化、#39 の policy optimization）に降りる必要がある。**本プロジェクトの設定では、この対立4がおそらく最も効いてくる。**
