# マーケティング施策のアップリフト最適化 — ビジネス事例・特許 収集結果

## 収集パラメータ

- **対象リソース**: ビジネス事例（企業導入・技術ブログ・登壇）+ 特許
- **対象期間**: 2020–2026（一部、基盤的な事例・特許は例外的に収録）
- **収集日**: 2026-07-12
- **入力元**: ユーザー指定（Mercari / Netflix / Criteo 等の実運用事例 + 特許）
- **検証**: 全 URL を WebFetch で到達・内容一致確認。特許番号は Google Patents で verbatim 確認

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集候補 | 事例 約16 / 特許 約9 |
| 採用（検証済み） | 事例 13 / 特許 6 |
| 除外（範囲外・関連度低・誤関連付け） | 特許3、事例数件（Mercari と誤関連付けした arXiv:2407.11039 等） |

> 注: DoorDash 2件・Booking.com は WebFetch が 403/証明書エラーを返したが、URL は検索結果に verbatim 出現しリダイレクトも解決、内容は別ミラー等で確認して採用。

## 全体の傾向

実運用事例は大きく3系統に分かれる。(1) **クーポン/インセンティブ配布の最適化**（Mercari, LINEヤフー, DoorDash, Booking.com, Wayfair）— アップリフト/Double ML で予算制約下の増分を最大化。(2) **実験プラットフォームと代理指標**（Netflix）— 過去実験からプロキシ指標を学習し実験を加速（本テーマの「実験間隔短縮」に直結）。(3) **公開データ・OSS 基盤**（Criteo Uplift Dataset, ZOZO Open Bandit Pipeline）— 手法検証のデファクト。特許側は **反実仮想ベースの広告インクリメンタリティ計測**（MediaMath, Zeta, Roku）が中心で、RTB 広告で「露出群 vs 非露出群」の増分を交絡補正して測る発明が多い。

---

## ビジネス事例

| # | タイトル | 企業/組織 | 年 | 種別 | 概要 |
|---|---------|-----------|-----|------|------|
| 1 | [Strategic Coupon Allocation for Increasing Providers' Sales Experiences in Two-sided Marketplaces](https://arxiv.org/abs/2407.14895) | Mercari | 2024 | 論文(KDD2024 TSMO WS) | 実データ(約200万プロバイダ)で双方向マーケットプレイスの販売成功体験を分散させるパーソナライズド・クーポン配布最適化 |
| 2 | [Strategic Coupon Allocation 研究の KDD2024 採択告知](https://ai.mercari.com/en/articles/ai/kdd2024/) | Mercari | 2024 | ブログ | 上記研究の採択と概要。2024年2月のデジタルクーポン実データを使用 |
| 3 | [Evaluating the Surrogate Index Using 200 A/B Tests at Netflix](https://arxiv.org/abs/2311.11922) | Netflix | 2023 | 論文 | 200件A/Bテスト(1098アーム)で14日サロゲート指数が63日効果と約95%一致。※retrieval C4 #25 と対応 |
| 4 | [Improve Your Next Experiment by Learning Better Proxy Metrics From Past Experiments](https://netflixtechblog.com/improve-your-next-experiment-by-learning-better-proxy-metrics-from-past-experiments-64c786c2a3ac) | Netflix | 2024 | ブログ(KDD2024) | 過去実験からプロキシ指標を学習(TC/JIVE/LIML)。測定誤差バイアスを補正。※retrieval C4 #28 と対応 |
| 5 | [Round 2: A Survey of Causal Inference Applications at Netflix](https://netflixtechblog.com/round-2-a-survey-of-causal-inference-applications-at-netflix-fd78328ee0bb) | Netflix | 2022 | ブログ | Netflix における因果推論応用（実験・観測データ手法）の横断サーベイ |
| 6 | [Criteo Uplift Prediction Dataset](https://ailab.criteo.com/criteo-uplift-prediction-dataset/) | Criteo | 2018(継続公開) | データセット | 複数のインクリメンタリティ試験から構築した約1,400万行の大規模アップリフト・ベンチマーク |
| 7 | [Open Bandit Pipeline (zr-obp)](https://github.com/st-tech/zr-obp) | ZOZO | 2020–2021 | OSS/データ(NeurIPS2021) | ZOZOTOWN 実運用ログ(Bernoulli TS と Random の A/B)を用いた OPE 用公開データ・Python ライブラリ |
| 8 | [Using Causal Inference to Improve the Uber User Experience](https://www.uber.com/blog/causal-inference-at-uber/) | Uber | 2019 | ブログ | アップリフトモデリングを含む因果推論手法群(CUPED/HTE 等)を UX 改善に適用 |
| 9 | [Heterogeneous Causal Learning for Effectiveness Optimization in User Marketing](https://arxiv.org/abs/2004.09702) | Uber | 2020 | 論文(本番) | ユーザーマーケの費用対効果最適化のための HTE 学習。本番世界展開で先行手法比24.6%改善 |
| 10 | [Adapted Switch-back Testing to Quantify Incrementality for App Marketplace Search Ads](https://careersatdoordash.com/blog/adapted-switch-back-testing-to-quantify-incrementality-for-app-marketplace-search-ads/) | DoorDash | 2022 | ブログ | 検索広告のインクリメンタリティ計測にスイッチバック試験を適用し広告投資配分を最適化 |
| 11 | [Smarter Promotions with Causal Machine Learning](https://careersatdoordash.com/blog/doordash-smarter-promotions-with-causal-machine-learning/) | DoorDash | 2025 | ブログ | Double ML で各顧客の割引感度を推定し固定予算下で増分注文を最大化する割引額最適化を本番構築 |
| 12 | [Uplift Modeling: From Causal Inference to Personalization](https://booking.ai/uplift-modeling-f9759e3fb51e) | Booking.com | 2021 | ブログ | アップリフトモデリング(two-model/X-learner 等)を A/B テストデータで動的プロモーションに適用 |
| 13 | [Building Scalable and Performant Marketing ML Systems at Wayfair](https://www.aboutwayfair.com/careers/tech-blog/building-scalable-and-performant-marketing-ml-systems-at-wayfair) | Wayfair | 2021 | ブログ | propensity/uplift モデルと RL 基盤 WayLift でマルチチャネル・マーケ意思決定と予算配分を最適化 |
| 14 | [アップリフトモデリングに基づく費用対効果の高いクーポン配布対象者の決定法](https://research.lycorp.co.jp/jp/publications/1960) | LINEヤフー | 2024 | 論文(JSAI2024) | ML で推定した費用対効果指標に基づきクーポン配布対象者を決定する手法を提案・シミュレーション評価 |

> 参考: [E3IR — End-to-End Cost-Effective Incentive Recommendation under Budget Constraint with Uplift Modeling](https://arxiv.org/abs/2408.11623)（Tencent FiT / RUC, RecSys2024）も予算制約下インセンティブ配分の本番指向手法として検証済み。

---

## 特許

| # | タイトル | 番号 | 出願人 | 出願年 | 特許庁 | 概要 |
|---|---------|------|--------|--------|--------|------|
| 1 | [Counterfactual-based incrementality measurement in digital ad-bidding platform](https://patents.google.com/patent/US10467659B2/en) | US10467659B2 | MediaMath | 2017 | USPTO | RTB 広告でプレビッド無作為化により反事実ベースの増分効果を計測し勝札バイアスを補正 |
| 2 | [Counterfactual-based incrementality measurement (継続)](https://patents.google.com/patent/US10977697B2/en) | US10977697B2 | MediaMath Acquisition Corp | 2019 | USPTO | 上記の継続特許。クロスデバイス等の課題に対応した反事実インクリメンタリティ計測 |
| 3 | [Counterfactual self-training](https://patents.google.com/patent/US20230045950A1/en) | US20230045950A1 | IBM | 2021 | USPTO | 観測データを疑似ラベル補完で RCT 模擬しバイアス低減する反事実自己学習（価格・マーケ・医療に適用） |
| 4 | [Predictive platform for determining incremental lift](https://patents.google.com/patent/US20210035163A1/en) | US20210035163A1 | Roku Dx Holdings | 2020 | USPTO | オンライン広告/プロモーションの増分リフトを ML/AI で交絡補正しつつ予測する基盤 |
| 5 | [System of determining advertising incremental lift](https://patents.google.com/patent/US20220067778A1/en) | US20220067778A1 | Zeta Global Corp | 2021 | USPTO | 露出群と非露出群(ビッドストリーム内)の行動を比較し広告の増分リフトを判定・予算配分を最適化 |
| 6 | [Automatic sales promotion selection system and method](https://patents.google.com/patent/US7155401B1/en) | US7155401B1 | Alibaba Group(旧IBM) | 1998 | USPTO | NN で顧客購買を分析し補完購入向け販促を自動選択（※出願1998年で範囲外・参考枠） |

> 除外（範囲外/関連度低、確認済み）: US20120158488A1「Offline counterfactual analysis」(Microsoft, 2010出願) — OPE 系広告特許の先行例として存在確認済みだが今回不採用。

---

## 次のステップ

- **retrieval で深掘り**: Mercari #1、Uber #9 などの論文事例を research-retrieval で詳細レポート化可能。
- **本テーマとの接続**: Netflix #4（過去実験からプロキシ学習）は C4 retrieval と、Mercari/DoorDash/LINEヤフーのクーポン最適化は C1/C2 と直接つながる実運用参照点。
