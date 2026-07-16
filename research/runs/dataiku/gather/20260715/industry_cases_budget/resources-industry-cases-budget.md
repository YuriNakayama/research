# Resources: industry_cases_budget

マーケティングにおけるクーポン/インセンティブ最適化の**本番導入事例**、**予算制約付き配分の方法論**、**two-stage → end-to-end の潮流**、**OSS 保守状況**。

> **本調査では、巷間よく引用される帰属・会議名の誤りを7件検出した**。末尾の「⚠️ 誤帰属・誤引用の訂正」を引用前に必ず確認すること。

## 1. 本番導入事例 — 中国系プラットフォーム

クーポン/インセンティブ配分の公開事例は中国系スーパーアプリに強く偏在しており、定量結果の開示も最も積極的。

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **Data-Driven Real-time Coupon Allocation in the Online Platform** | https://arxiv.org/abs/2406.05987 | 論文 | **Meituan / 2024**。CVR 推定（isotonic 回帰）+ ラグランジュ双対。**1人あたり 50ms、年間 CNY 800万の追加利益**。1億超ユーザー・110都市超で稼働。**最も数値が揃った事例** |
| 2 | **Decision Focused Causal Learning (DFCL)** | https://arxiv.org/abs/2407.13664 | 論文 | **Meituan / KDD 2024（本会議）**。0-1 整数確率計画を DFL で end-to-end 化。ソルバ呼び出しコストを削減する代理損失 |
| 3 | Direct Heterogeneous Causal Learning (DHCL) | https://arxiv.org/abs/2211.15728 | 論文 | **Meituan / AAAI 2023**。⚠️ **Alibaba ではなく Meituan**。decision factor で ML と OR を架橋しソート/比較のみで解を得る |
| 4 | Entire Chain Uplift Modeling (ECUP) | https://arxiv.org/abs/2402.03379 | 論文+データセット | **Meituan / WWW 2024 Companion**。⚠️ **Alibaba 帰属は誤り**。⚠️ **arXiv v2 は 2026-01-23 に取り下げ済み**。複数処置+全チェーンラベルは業界初 |
| 5 | Hidden Representation Clustering with Multi-Task Representation Learning | https://arxiv.org/abs/2506.00959 | 論文 | **Meituan / 2025**。個人単位予測でなく隠れ表現を K 群にクラスタリング→整数確率計画。**A/B で OV +0.53%、GMV +0.65%** |
| 6 | Bi-Level Decision-Focused Causal Learning | https://arxiv.org/abs/2510.19517 | 論文 | **Meituan 系 / 2025**。観測データと実験データを橋渡しする二層 DFL。#2 の後続 |
| 7 | **End-to-End Cost-Effective Incentive Recommendation (E3IR)** | https://arxiv.org/abs/2408.11623 | 論文 | **Tencent (FiT) / RecSys 2024**。MCKP に単調・平滑な応答曲線制約 + **ILP を微分可能層として統合**。方法論セクションとの接続点 |
| 8 | Rankability-enhanced Revenue Uplift Modeling (RERUM) | https://xingt-tang.github.io/assets/pdf/rerum_kdd24.pdf | 論文 | **Tencent (FiT) / KDD 2024**。#7 と同一グループの実運用ライン |
| 9 | **Marketing Budget Allocation with Offline Constrained Deep RL** | https://arxiv.org/abs/2309.02669 | 論文 | **Ant Group / WSDM 2023（Best Paper Candidate）**。**数千万ユーザー・予算10億超**のキャンペーン全トラフィックに投入 |
| 10 | BCORLE(λ) | https://proceedings.neurips.cc/paper/2021/hash/ab452534c5ce28c4fbb0e102d4a4fb2e-Abstract.html | 論文 | **Ant Group / NeurIPS 2021**。Offline BCQ + 状態にラグランジュ乗数を追加。**λ-generalization により λ ごとの再学習が不要** |
| 11 | A Practical Distributed ADMM Solver for Billion-Scale Generalized Assignment Problems | https://arxiv.org/abs/2210.16986 | 論文 | **Ant Group / 2022**。Bregman ADMM で MapReduce 分散求解。**数十億の決定変数**規模 |
| 12 | **CanniUplift** | https://arxiv.org/abs/2607.05242 | 論文 | **Alibaba (Taobao & Tmall) / KDD 2026**。seller/incentive レベルのカニバリを分離。**本番 baseline 比で増分 GMV +4.08%**。最新の論点 |
| 13 | **A Unified Framework for Marketing Budget Allocation** | https://arxiv.org/abs/1902.01128 | 論文 | **Alibaba / KDD 2019**。semi-black-box モデル。コスト上限・利益下限・ROI 下限に対応し全社運用。**本領域の古典** |
| 14 | An End-to-End Framework for Marketing Effectiveness Optimization | https://arxiv.org/abs/2302.04477 | 論文 | **Kuaishou / 2023**。⚠️ **Alibaba 帰属は誤り**。2段階の目的不整合を回避。**数億ユーザーの短編動画プラットフォームに展開** |
| 15 | LBCF: A Large-Scale Budget-Constrained Causal Forest | https://arxiv.org/abs/2201.12585 | 論文 | **Kuaishou / WWW 2022**。⚠️ 正式名は "Large-Scale Budget-Constrained"（"Lagrangian" ではない）。予算制約を木の分割基準に直接組込み |
| 16 | Coarse-to-fine Dynamic Uplift Modeling | https://arxiv.org/abs/2410.16755 | 論文 | **Kuaishou / 2024**。数十億ユーザー規模で検証 |
| 17 | SACO: Sequence-Aware Constrained Optimization for Coupon Distribution | https://arxiv.org/abs/2508.09198 | 論文 | **Alibaba 系（推定・要確認）/ 2025**。逐次的相互作用を明示モデル化 |
| 18 | Robust Uplift Modeling with Large-Scale Contexts (UMLC) | https://arxiv.org/abs/2502.15697 | 論文 | **KDD 2025**。処置/対照群の分布シフト対策 |

## 2. 本番導入事例 — 欧米プラットフォーム

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 19 | **Beyond Prediction: Solving the Multiple Knapsack Problem at Scale** | https://www.uber.com/us/en/blog/solving-multiple-knapsack/ | 技術ブログ | **Uber / 2026-05**。Tarot。**予算消化率 68% → 99.99%**。10万ユーザー問題で **HiGHS(LP) 24時間超 → CP-SAT で数分**。**本クラスタで最も具体的な運用数値**。**本ユースケース（バッチ配分）に最も近い** |
| 20 | Practical Marketplace Optimization at Uber | https://arxiv.org/abs/2407.19078 | 論文 | **Uber / KDD 2024 Workshop**。⚠️ **本会議ではなく Workshop**。Deep S-Learner + tensor B-Spline、ADMM。定量結果は非開示 |
| 21 | **Free Lunch! Retrospective Uplift Modeling** | https://arxiv.org/abs/2008.06293 | 論文 | **Booking.com / RecSys 2020**。⚠️ **CIKM ではなく RecSys'20**。Retrospective Estimation + Knapsack + オンライン動的較正 |
| 22 | **E-Commerce Promotions Personalization via Online MCKP** | https://arxiv.org/abs/2108.13298 | 論文 | **Booking.com / CIKM 2022**。**予算厳守のまま最適効果の 99.7% 超**。#21 が CIKM と誤引用される混同の実体はこちら |
| 23 | Personalizing Benefits Allocation Without Spending Money | https://dl.acm.org/doi/10.1145/3523227.3547381 | 発表 | **Booking.com / RecSys 2022**。CATE 推定でプロモの機会費用を最適化 |
| 24 | Incremental Profit per Conversion (IPC) | https://arxiv.org/abs/2306.13759 | 論文 | **Booking.com / 2023**。応答依存コスト向けの評価指標。**単一モデル・転換データのみ**でメタラーナー不要 |
| 25 | Challenges and Methods of Causal Promotions Recommendation | https://dl.acm.org/doi/10.1145/3769300 | 論文 | **Booking.com / ACM TORS**。#21-24 の系譜を総括。**Booking 系を一本で押さえるならここ** |
| 26 | **DISCO: An End-to-End Bandit Framework for Personalised Discount Allocation** | https://arxiv.org/abs/2406.06433 | 論文 | **ASOS / ECML-PKDD 2024 ADS Track**。Thompson Sampling を整数計画に組込み、**RBF で連続アクションを表現**。**A/B で平均バスケット額 >1% 改善** |
| 27 | **Smarter promotions with causal machine learning** | https://careersatdoordash.com/blog/doordash-smarter-promotions-with-causal-machine-learning/ | 技術ブログ | **DoorDash**。Double ML で「割引の有無」でなく**「いくら割引するか」**を最適化 |
| 28 | Leveraging Causal Modeling to Get More Value from Flat Experiment Results | https://careersatdoordash.com/blog/causal-modeling-to-get-more-value-from-flat-experiment-results/ | 技術ブログ | **DoorDash**。HTE で**プロモコストを 33% 削減**する部分集団を発見。**全体平均が flat な実験からも価値を抽出する論法** |
| 29 | Optimizing DoorDash's Marketing Spend with Machine Learning | https://careersatdoordash.com/blog/optimizing-marketing-spend-with-ml/ | 技術ブログ | **DoorDash**。1ドルあたり増分注文を最大化 |
| 30 | How DoorDash Ads keep consumers first with budget A/B experimentation | https://careersatdoordash.com/blog/doordash-ads-uses-budget-a-b-experimentation/ | 技術ブログ | **DoorDash**。LinkedIn 発祥の budget A/B。単一キャンペーン内に予算を分割した別宇宙を作り干渉を除去 |
| 31 | Lyft: Optimizing Driver Incentive Plans | https://www.gurobi.com/case_studies/lyft-optimizing-driver-incentive-plans-and-adapting-to-market-changes/ | 技術ブログ | **Lyft / Gurobi 事例**。⚠️ **「Lyft WSDM'22」論文は存在しない**。数百万変数 LP。**LP 1問あたり時間 -80%、E2E -92%** |
| 32 | Driver Positioning and Incentive Budgeting with an Escrow Mechanism | https://arxiv.org/abs/2104.14740 | 論文 | **Lyft / INFORMS J. Applied Analytics 2021**。**全320都市に展開** |
| 33 | **Personalized Treatment Selection using Causal Heterogeneity** | https://arxiv.org/abs/1901.10550 | 論文 | **LinkedIn / WWW 2021**。⚠️ **KDD'21 ではなく WWW 2021**。(i) HTE 推定 → (ii) 制約付き最適化の2段構成 |
| 34 | LORE: A Large-Scale Offer Recommendation Engine | https://dl.acm.org/doi/10.1145/3298689.3347027 | 論文 | **Amazon / RecSys 2019**。適格性 + 定員の同時制約を **Min-Cost Flow** に定式化 |
| 35 | Building Scalable and Performant Marketing ML Systems at Wayfair | https://www.aboutwayfair.com/careers/tech-blog/building-scalable-and-performant-marketing-ml-systems-at-wayfair | 技術ブログ | **Wayfair**。数百キャンペーン規模での uplift 運用。OSS **pylift** の出自 |
| 36 | Cost-Effective Incentive Allocation via Structured Counterfactual Inference | https://arxiv.org/abs/1902.02495 | 論文 | **Adobe 系 / AAAI 2020**。**本領域の初期古典** |
| 37 | Robust portfolio optimization model for electronic coupon allocation | https://arxiv.org/abs/2405.12865 | 論文 | **匿名小売パートナー / INFOR 2024**。**2,000万顧客へ A/B、売上 +4.5%**。2024-08 以降に既定アルゴリズムとして採用 |
| 38 | Grab Customer Data Platform "Scenarios" | https://engineering.grab.com/scenarios | 技術ブログ | **Grab**。**コンバージョン +3% 超の uplift** |

## 3. 本番導入事例 — 日本 🇯🇵

日本企業は **「CATE 推定 → ナップサック型割当」の2段パイプライン**が事実上の標準構成。**失敗事例が公開されている点（#44, #46）は、成功事例に偏りがちな本領域で特に価値が高い**。

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 39 | 🇯🇵 **Strategic Coupon Allocation in Two-sided Marketplaces** | https://arxiv.org/abs/2407.14895 | 論文 | **メルカリ / KDD 2024 TSMO Workshop**。uplift + **整数非線形計画**。**約200万出品者・数百万クーポン**で検証 |
| 40 | 🇯🇵 **「Sell体験の向上はメルカリの要」アイテムクーポンPJの半年を振り返る** | https://ai.mercari.com/articles/ai/item-coupon/ | 技術ブログ | **メルカリ / 2024-01**。uplift で予算制約下に週2回自動配布。**売れた出品者が購買活動も増やすスピルオーバー効果**を観測（数値非開示） |
| 41 | 🇯🇵 OPE with General Logging Policies: Implementation at Mercari（RIETI DP 22-E-097） | https://www.rieti.go.jp/jp/publications/dp/22e097.pdf | 論文 | **メルカリ + RIETI/Yale / 2022-10**。⚠️ **主題は OPE 手法でクーポンは応用事例**。査読版は AAAI 2023 |
| 42 | 🇯🇵 クーポンマーケティングにおける Uplift Modeling 適用の問題点と新しい評価指標 | https://www.jstage.jst.go.jp/article/pjsai/JSAI2020/0/JSAI2020_1H4OS12b02/_article/-char/ja/ | 論文 | **メルカリ / JSAI2020**。**評価指標の議論の出発点** |
| 43 | 🇯🇵 **アップリフトモデリングに基づく費用対効果の高いクーポン配布対象者の決定法** | https://research.lycorp.co.jp/jp/publications/1960 | 論文 | **LINEヤフー / JSAI2024**。購入とコストそれぞれの CATE から **ACPA（追加1単位購入に必要なコスト）**を算出。**日本語で最も本テーマに直球** |
| 44 | 🇯🇵 **多腕バンディット問題としての広告配信の最適化** | https://developers.cyberagent.co.jp/blog/archives/25099/ | 技術ブログ | **サイバーエージェント / 2020-02**。**失敗事例（貴重）**。**CTS が有意勝ちした設定はゼロ**。クラスタ分割によるデータ希薄化で探索不足 |
| 45 | 🇯🇵 **AI×経済学でクーポン原資の無駄を削減する「価格エージェント」提供開始** | https://www.cyberagent.co.jp/news/detail/id=32319 | 発表 | **サイバーエージェント / 2025-08**。**売上を維持したままクーポン原資を最大 70% 削減**。**商用ソリューション化の到達点** |
| 46 | 🇯🇵 **「ユーザーごとに異なる施策効果」の推定手法の実用性を調べてみた話** | https://techblog.zozo.com/entry/hte_analysis | 技術ブログ | **ZOZO / 2025-05**。**否定的定量結果（貴重）**。**5万サンプル・効果50%でも RMSE/ATE ≈ 0.7**。精緻な個別効果推定は困難と結論 |
| 47 | 🇯🇵 **クーポン推薦モデルとシステム改善の取り組み** | https://techblog.zozo.com/entry/improve-coupon-recommendation | 技術ブログ | **ZOZO / 2024-01**。⚠️ **uplift ではなく Two-Stage Recommender**。A/B で**売上 124.69%（配信対象者選定）**、注文数 120.08% |
| 48 | 🇯🇵 バンディットアルゴリズムを用いた推薦システムの構成について | https://techblog.zozo.com/entry/zozoresearch-bandit-overviews | 技術ブログ | **ZOZO研究所 / 2020-11**。ZOZOTOWN トップに Random / Bernoulli TS を Istio ルーティングで並行配信 |
| 49 | 🇯🇵 **3000万以上のユーザーに未経験サービスを促すギフト券配信の割当問題** | https://atmarkit.itmedia.co.jp/ait/articles/2207/29/news011.html | 技術ブログ | **リクルート / 2022-07**。**3,000万超ユーザー**への割当を予算制約付き 0/1 割当問題として定式化。**汎用ソルバーでは非現実的なため専用の近似アルゴリズムを開発** |
| 50 | 🇯🇵 リクルートにおける bandit アルゴリズム実装前までのプロセス | https://speakerdeck.com/rtechkouhou/rikurutoniokerubanditarugorizumushi-zhuang-qian-madefalsepurosesu | 発表 | **リクルートテクノロジーズ / PyData.Tokyo 2017**。**本番導入の実務知見**。API 連携でなくファイル連携、**緊急停止ボタン**の実装など運用設計の生々しい記録 |
| 51 | 🇯🇵 最適クリエイティブ数を予測する: UpLift Modeling | https://cyberagent.ai/blog/research/economics/12482/ | 技術ブログ | **サイバーエージェント / 2020-03**。**一般化傾向スコア(GPS)** で IPW 適用。**3本は AUUC 負** |
| 52 | 🇯🇵 Pococha におけるバンディットアルゴリズムの検証 | https://engineering.dena.com/blog/2021/11/pococha-bandit/ | 技術ブログ | **DeNA / 2021-12**。**10万サンプルではセグメント+contextless UCB が LinUCB を上回る**。新規リスナーはランダムとほぼ差なし |
| 53 | 🇯🇵 Personalized Promotion Decision Making Based on Direct and Enduring Effect Predictions | https://arxiv.org/abs/2207.14798 | 論文 | **メルカリ / 2022**。即時効果と持続効果を分離予測 |
| 54 | 🇯🇵 Balancing Immediate Revenue and Future OPE in Coupon Allocation | https://link.springer.com/chapter/10.1007/978-981-96-0125-7_35 | 論文 | **メルカリ / PRICAI 2024**。**即時収益と将来の OPE 精度のトレードオフ**。ランダム化探索の価値を定量化 |
| 55 | 🇯🇵 ABテストと、アップリフトモデリングによる施策の精緻化 | https://note.com/m3dag/n/n0dee43556302 | 技術ブログ | **エムスリー / 2024-04**。t-learner によるターゲティング精緻化 |
| 56 | 🇯🇵 **Open Bandit Dataset and Pipeline** | https://arxiv.org/abs/2008.07146 | データセット | **ZOZO研究所 / NeurIPS 2021 D&B Track**。**複数方策の A/B により収集された2,600万件超**のログ。**実運用の方策実装まで同梱した世界初の公開データ** |
| 57 | **Criteo Uplift Prediction Dataset** | https://ailab.criteo.com/criteo-uplift-prediction-dataset/ | データセット | **Criteo / AdKDD 2018**。**25M 行**。uplift 手法比較のデファクト標準 |
| 58 | 🇯🇵 A/Bテストよりすごい？はじめてのインターリービング | https://data.gunosy.io/entry/2018/10/15/080000 | 技術ブログ | **Gunosy / 2018-10**。**A/B テスト比で 10〜100 倍の効率** |

## 4. 予算制約付き配分の方法論

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 59 | **The Best of Many Worlds: Dual Mirror Descent for Online Allocation** | https://arxiv.org/abs/2011.10124 | 論文 | Balseiro/Lu/Mirrokni、Operations Research 2023。⚠️ **arXiv:2002.10421 は取り下げ済み、本 ID を使うこと** |
| 60 | Regularized Online Allocation Problems: Fairness and Beyond | https://arxiv.org/abs/2007.00514 | 論文 | Balseiro et al. / ICML 2021。公平性等の正則化項付き拡張 |
| 61 | **CP-SAT Solver \| OR-Tools** | https://developers.google.com/optimization/cp/cp_solver | OSS | **#19 の Uber Tarot が「HiGHS で24時間超 → CP-SAT で数分」を実現した当のソルバー** |

> 補足: 「多次元ナップサック(MKP)の純粋なマーケティング定式化」は独立した canonical 論文としては見つからなかった。実務上は **MCKP 定式化（#7, #22）が支配的**で、MKP は #11 の generalized assignment に吸収されている構図。

## 5. two-stage → end-to-end の潮流

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 62 | **Smart "Predict, then Optimize" (SPO)** | https://arxiv.org/abs/1710.08005 | 論文 | Elmachtoub & Grigas / Management Science 2022。**この分野の起点**。SPO 損失と凸代理損失 **SPO+** |
| 63 | **Decision-Focused Learning: Foundations, State of the Art, Benchmark** | https://arxiv.org/abs/2307.13565 | 論文 | Mandi et al. / JAIR 2024。**DFL の決定版サーベイ**。7問題 × 11手法の大規模実証比較。**この分野の入口として最適** |
| 64 | Melding the Data-Decisions Pipeline | https://arxiv.org/abs/1809.05504 | 論文 | Wilder et al. / AAAI 2019。組合せ最適化への DFL の一般枠組み |
| 65 | OptNet: Differentiable Optimization as a Layer in Neural Networks | https://arxiv.org/abs/1703.00443 | 論文 | Amos & Kolter / ICML 2017。QP を NN の層として埋め込み |
| 66 | **Differentiable Convex Optimization Layers** | https://arxiv.org/abs/1910.12430 | 論文 | Agrawal et al. / NeurIPS 2019。凸最適化層を汎用的に微分可能化 |
| 67 | cvxpylayers | https://github.com/cvxpy/cvxpylayers | OSS | #66 の実装。CVXPY で書いた凸問題をそのまま微分可能層として利用可能 |
| 68 | Learning with Differentiable Perturbed Optimizers | https://arxiv.org/abs/2002.08676 | 論文 | Berthet et al. / NeurIPS 2020。確率的摂動で任意のソルバーを微分可能化 |
| 69 | Generalization Bounds in the Predict-then-Optimize Framework | https://arxiv.org/abs/1905.11488 | 論文 | SPO 損失の汎化誤差限界 |

## 6. OSS 保守状況（実測値）

**すべて PyPI JSON API と GitHub API で 2026-07-15 に実測**（記憶ベースではない）。最終コミット日は `/commits` エンドポイントで取得しており、**タグ操作で水増しされる `pushed_at` とは明確に乖離している**（例: zr-obp は pushed_at 2024-06 だが最終コミットは 2022-11）。

| ライブラリ | 版 | 最終リリース | 最終コミット | ★ | 状態 |
|-----------|-----|------------|------------|---|------|
| **causalml** (uber/causalml) | 0.17.0 | 2026-07-04 | **2026-07-13** | 5,922 | ✅ **活発**。本領域で最も健全 |
| **econml** (py-why/EconML) | 0.16.0 | 2025-07-10 | **2026-06-11** | 4,711 | ✅ **活発**（リリースは1年空くがコミットは継続） |
| causallift (Minyus/causallift) | 1.1.0 | 2026-04-12 | 2026-04-15 | 356 | ✅ 活発（小規模・個人メンテ） |
| d3rlpy (takuseno/d3rlpy) | 2.8.1 | 2025-03-02 | 2025-09-10 | 1,671 | ⚠️ 低活動（最終コミットから約10ヶ月） |
| scikit-uplift (maks-sh/scikit-uplift) | 0.5.1 | 2022-08-11 | **2022-08-11** | 808 | ❌ **事実上停止**（約4年、未 archive） |
| **obp / zr-obp** (st-tech/zr-obp) | 0.5.7 | 2023-04-14 | **2022-11-05** | 705 | ❌ **事実上停止**（約3.7年）。⚠️ pushed_at 2024-06 は誤誘導 |
| scope-rl (hakuhodo-technologies/scope-rl) 🇯🇵 | 0.2.1 | 2023-07-30 | **2023-12-01** | 143 | ❌ **事実上停止**（約2.6年） |
| upliftml (bookingcom/upliftml) | 0.0.2 | 2022-11-22 | **2022-12-20** | 335 | ❌ **事実上停止**（版は 0.0.2 のまま） |
| pylift (**wayfair/pylift**) | 0.1.5 | 2019-12-23 | 2022-10-28 | 377 | 🚫 **アーカイブ済み（read-only）** |

**pylift の注記**: PyPI の `Homepage` は `github.com/pylift/pylift` を指すが**このリポジトリは存在しない（API が 404）**。実体は **wayfair/pylift**（★377、archived）。#35 の Wayfair 技術ブログが出自。

**保守状況の含意**: 実運用で採用可能なのは**実質 causalml と econml の2本のみ**。uplift 専用ライブラリ（scikit-uplift / upliftml / pylift）は**軒並み停止またはアーカイブ済み**で、バンディット/OPE 系（obp, scope-rl）も日本発の重要資産でありながら停止している。#56 の Open Bandit Dataset はデータセットとしての価値は不変だが、**パイプライン実装の保守は期待できない**。

## ⚠️ 誤帰属・誤引用の訂正

| # | よくある誤り | 正しい情報 |
|---|------------|----------|
| 1 | **ECUP を Alibaba とする** | **Meituan（美団）**。WWW'24 Companion。さらに **arXiv v2 は 2026-01-23 に取り下げ済み**で PDF 入手不可 |
| 2 | **DHCL (2211.15728) を Alibaba とする** | **Meituan**。著者 Zhou/Li/Jiang は DFCL と同一グループ |
| 3 | **arXiv:2302.04477 を Alibaba とする** | **Kuaishou（快手）**。著者 Guorui Zhou / Peng Jiang は Kuaishou の中核研究者 |
| 4 | **Booking「Free Lunch!」を CIKM とする** | **RecSys 2020** が正。ただし **CIKM'22 の Booking 論文（#22）が別途実在**するため混同の温床 |
| 5 | **「Lyft WSDM'22 のインセンティブ論文」** | **存在しない**。実体は Gurobi 事例（#31）+ INFORMS J. Applied Analytics 2021（#32） |
| 6 | **Tu et al. を KDD'21 とする** | **WWW 2021**（The Web Conference） |
| 7 | **Uber KDD'24 (2407.19078) を本会議とする** | **KDD 2024 Workshop**（CIML in Practice 2nd）。本会議採択ではない |

加えて: **LBCF の正式名は "Large-Scale Budget-Constrained Causal Forest"**（"Lagrangian" ではない）、**Dual Mirror Descent は arXiv:2002.10421 が取り下げ済みで 2011.10124 が正**、**メルカリ RIETI DP 22-E-097 は OPE 手法論文でクーポンは応用事例**。

## 定量的成果が公開されている事例

ビジネス上の投資判断に直接使える、**ハードな数値が公開されている事例のみ**。

| 事例 | 企業 | 年 | 公開されている定量成果 |
|------|------|-----|---------------------|
| **Tarot / Multiple Knapsack** | **Uber** | 2026 | **予算消化率 68% → 99.99%**。10万ユーザー問題で **HiGHS 24時間超 → CP-SAT 数分** |
| **価格エージェント** 🇯🇵 | **サイバーエージェント** | 2025 | **クーポン原資を最大 70% 削減（売上は維持）** |
| **LDM** | **Meituan** | 2024 | **1人あたり 50ms、年間 CNY 800万の追加利益**。1億超ユーザー・110都市超 |
| **クーポン推薦モデル改善** 🇯🇵 | **ZOZO** | 2024 | **売上 124.69%**（配信対象者選定）、注文数 120.08%、配信CTR +0.12pt |
| **Flat Experiment / HTE** | **DoorDash** | — | **プロモコスト 33% 削減**となる部分集団を特定 |
| **Driver Incentive LP** | **Lyft** | — | **LP 1問あたり時間 -80%、E2E -92%** |
| **CanniUplift** | **Alibaba** | 2026 | **増分 GMV +4.08%**（本番 baseline 比） |
| **Robust Portfolio Optimization** | 匿名小売 | 2024 | **売上 +4.5%**（2,000万顧客 A/B） |
| **Online MCKP** | **Booking.com** | 2022 | **予算厳守のまま最適効果の 99.7% 超** |
| **Hidden Representation Clustering** | **Meituan** | 2025 | **OV +0.53%、GMV +0.65%**（数千万ユーザー規模） |
| **DISCO** | **ASOS** | 2024 | **平均バスケット額 >1% 改善** |
| **Scenarios (CDP)** | **Grab** | — | **コンバージョン +3% 超の uplift** |
| **Offline Constrained Deep RL** | **Ant Group** | 2023 | **数千万ユーザー・予算10億超**の全トラフィックに投入（改善率は非開示） |
| **Interleaving** 🇯🇵 | **Gunosy** | 2018 | **A/B テスト比で 10〜100 倍の評価効率** |

### 逆向きの定量的知見（過度な期待への歯止め）

> 成功事例のみを並べると判断を誤るため、**否定的・失敗側の定量結果**も併記する。

| 事例 | 企業 | 年 | 定量的知見 |
|------|------|-----|----------|
| **HTE 推定手法の実用性検証** 🇯🇵 | **ZOZO** | 2025 | **5万サンプル・効果50%でも RMSE/ATE ≈ 0.7**。MSE/ATE 比は S-Learner=100% に対し Linear DML 7.3%、Causal Forest DML 12.7% |
| **Clustered Thompson Sampling** 🇯🇵 | **サイバーエージェント** | 2020 | **CTS が通常 TS に有意勝ちした設定はゼロ**、逆に TS が有意勝ちした設定は複数 |
| **GPS 付き複数処置 uplift** 🇯🇵 | **サイバーエージェント** | 2020 | クリエイティブ **3本では AUUC が負**。効果ピークは1本で上位10%、2本で上位22.5% |
| **Pococha バンディット** 🇯🇵 | **DeNA** | 2021 | 新規リスナーは **1人100推薦では報酬信号不足でランダムとほぼ差なし** |

## 全体観

- **手法の系譜**: 2020-22 は「uplift → knapsack」の2段階（Booking, Ant, リクルート）。2023-25 は **decision-focused / end-to-end**（DFCL, DHCL, E3IR, Kuaishou）が主流化。2026 は**カニバリゼーション補正**（CanniUplift）と**大規模ソルバ工学**（Uber CP-SAT）へ。日本も同じ経路を辿り、2025年に商用ソリューション化（価格エージェント）へ到達した。
- **事例の偏在**: 公開事例は**中国系スーパーアプリと配車・旅行に集中**。Amazon（#34 除く）/ eBay / Netflix / Spotify / Airbnb / Instacart / Zalando / Expedia / Shopee / Coupang / Naver / JD.com には該当領域の公開事例が見つからなかった。日本側でも楽天・PayPay 等は同様に該当なし。
- **OSS の空洞化**: 手法が end-to-end へ進む一方、**uplift 専用 OSS は軒並み保守停止**しており、実運用は **causalml / econml + 自前の最適化層**という構成に収斂せざるを得ない。これは #61 の CP-SAT や #67 の cvxpylayers を直接組み合わせる実装方針を後押しする材料でもある。
