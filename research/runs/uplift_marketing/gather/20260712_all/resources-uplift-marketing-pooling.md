# マーケティング施策のアップリフト最適化：施策データ統合 — リソース収集結果

## 収集パラメータ

- **対象リソース**: 学術論文（arXiv 中心、一部 KDD/ICML/NeurIPS/WWW/AEA 等）
- **対象期間**: 2022–2026（基盤的な partial-pooling / transportability 論文は例外的に収録）
- **収集日**: 2026-07-12
- **入力元**: clustering 結果（`runs/uplift_marketing/clustering/20260712/`）の C1〜C5
- **収集件数方針**: 広範（各クラスタ 10〜20 件）、C3/C4 を重点
- **重要**: 本ファイルは clustering の代表論文リストとは **重複しない新規論文** のみを収録。clustering 側の代表論文と合わせて参照のこと。

## 収集サマリ

| 領域 | 論文（新規） | 備考 |
|------|------|------|
| C1 Uplift / CATE モデリング | 12 | 連続処置・多値処置・深層 uplift 中心 |
| C2 オフ方策評価 (OPE) | 15 | large action space・スレート・長期/非定常 OPE |
| **C3 マルチタスク・転移 HTE ★** | **18** | **多拠点・連合・転移・データ融合。本テーマ中核** |
| **C4 データプーリング・統合 ★** | **15** | **代理指標・経験ベイズ縮約・メタ分析。本テーマ中核** |
| C5 セグメント × 転移可能性 | 14 | transportability・サブグループ発見・顧客埋め込み |
| **合計** | **74** | 全件 WebFetch でタイトル照合済み |

## URL検証結果

| 項目 | 件数 |
|------|------|
| 収集 | 74 |
| 検証済み（WebFetch でタイトル一致確認） | 74 |
| 不一致で除外 | 0 |
| アクセス不可で除外 | 0 |
| アンチハルシネーションで除外（構築的/検証不能 ID） | 5（C5 で検出、下記注記） |

> 全 URL は各 gather エージェントが WebSearch 結果に verbatim 出現したもののみを採用し、arXiv ID の推測・構築は行っていない。各 arxiv.org/abs ページを WebFetch してタイトルを照合済み。

## 全体の傾向

本収集で、本テーマの中核（C3/C4）が学術的に急速に成熟していることが確認できた。特に **Netflix・Google・Meta・ShareChat・Amazon の実験プラットフォーム勢** が「過去実験群から代理指標を学習して実験を加速する（proxy/surrogate metrics）」「多数の弱い実験を経験ベイズで縮約して強さを借りる（EB shrinkage / borrowing strength）」という方向で多数の実務直結論文を出している（C4）。C3 側では **連合因果推論（federated causal inference）と最適輸送・転移学習による多拠点 CATE 統合** が2024–2026 で急増しており、「拠点＝キャンペーン群」と読み替えれば本テーマにそのまま適用できる。C2 の OPE は Yuta Saito らを中心に large action space・スレート・長期/非定常へ拡張が進み、クーポン/メールの出し分け評価に有効。C5 は transportability の統一枠組み化とサブグループ発見の深層化が進む。

---

## 学術論文

### C1: Uplift / CATE モデリング（複数処置対応）

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 1 | [Rankability-enhanced Revenue Uplift Modeling Framework for Online Marketing](https://arxiv.org/abs/2405.15301) | Bowei He et al. | 2024 | KDD 2024 | 収益 uplift の連続ロングテール分布に zero-inflated lognormal 損失で対処し、ランキング特化の誤差上界で高反応顧客を特定 |
| 2 | [M³TN: MoE based Multi-valued Treatment Network for Uplift Modeling](https://arxiv.org/abs/2401.14426) | Zexu Sun et al. | 2024 | ICASSP 2024 | MoE ゲーティングで多値処置の個別処置効果を効率的に予測する深層 uplift ネットワーク |
| 3 | [Metalearners for Ranking Treatment Effects](https://arxiv.org/abs/2405.02183) | Toon Vanderschueren et al. | 2024 | arXiv | 予算制約下で増分利益に基づき処置割当を直接最適化する learning-to-rank 型メタラーナー |
| 4 | [Uplift modeling with continuous treatments: A predict-then-optimize approach](https://arxiv.org/abs/2412.09232) | Simon De Vos et al. | 2024 | arXiv | 連続処置（用量）の dose response を推定し整数計画で予算制約下の用量割当を解く |
| 5 | [Explicit Feature Interaction-aware Uplift Network (EFIN)](https://arxiv.org/abs/2306.00315) | Dugang Liu et al. | 2023 | KDD 2023 | 処置×非処置特徴の交互作用を明示化し attention と介入制約で非ランダム介入下でロバスト化 |
| 6 | [DESCN: Deep Entire Space Cross Networks for ITE Estimation](https://arxiv.org/abs/2207.09920) | Kailiang Zhong et al. | 2022 | KDD 2022 | 処置バイアスとサンプル不均衡に対処し全空間で処置/応答関数を交差学習する ITE 推定（ベンチマーク常連） |
| 7 | [GCF: Generalized Causal Forest for HTE in Online Marketplace](https://arxiv.org/abs/2203.10975) | Shu Wan et al. | 2022 | arXiv | causal forest を連続処置へ拡張し二重頑健推定で価格設定に実運用 |
| 8 | [TSCAN: Context-Aware Uplift via Two-Stage Training](https://arxiv.org/abs/2504.18881) | Hangtao Zhang et al. | 2025 | arXiv | 2段階学習（正則化 uplift + isotonic 精緻化）にコンテキスト attention を組合せた加盟店診断向け uplift |
| 9 | [Heteroscedasticity-aware stratified sampling to improve uplift modeling](https://arxiv.org/abs/2401.14294) | Björn Bokelmann et al. | 2024 | arXiv | ノイズが大きい個体に多く観測を割当てる層化サンプリングで RCT 上の推定精度を改善 |
| 10 | [Incremental Profit per Conversion: Response Transformation for Uplift in E-Commerce](https://arxiv.org/abs/2306.13759) | Hugo M. Proença et al. | 2023 | arXiv | 単一モデルで促進効率を測る IPC 応答変換を提案し EC のゼロ膨張問題に対処 |
| 11 | [Comparison of meta-learners for multi-valued treatment heterogeneous effects](https://arxiv.org/abs/2205.14714) | Naoufal Acharki et al. | 2022 | ICML 2023 | 多値処置での S/T/X 拡張の限界を分析し処置水準数にスケールする改良推定を提案 |
| 12 | [Entire Chain Uplift Modeling with Context-Enhanced Learning (ECUP)](https://arxiv.org/abs/2402.03379) | Yinqiu Huang et al. | 2024 | arXiv | インプレッション→クリック→CV の行動チェーン全体で ITE を推定（※著者取り下げ済み、参考） |

### C2: オフ方策評価 (OPE) / 反実仮想学習

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 13 | [POTEC: Off-Policy Learning for Large Action Spaces via Two-Stage Policy Decomposition](https://arxiv.org/abs/2402.06151) | Saito, Yao, Joachims | 2024 | arXiv | 大規模行動空間のオフ方策学習をクラスタ選択（方策）＋クラスタ内選択（回帰）に分解し低分散化 |
| 14 | [Effective OPE and Learning in Contextual Combinatorial Bandits](https://arxiv.org/abs/2408.11202) | Shimizu, ..., Saito | 2024 | RecSys 2024 | 文脈組合せバンディット（部分集合選択）の OPE/L。行動間相互作用を活かし分散抑制 |
| 15 | [OPE for Large Action Spaces via Policy Convolution](https://arxiv.org/abs/2310.15433) | Sachdeva et al. | 2023 | arXiv | 行動埋め込みの潜在構造で logging/target 方策を畳み込む Policy Convolution 推定量群 |
| 16 | [Balancing Immediate Revenue and Future OPE in Coupon Allocation](https://arxiv.org/abs/2407.11039) | Nishimura, Kobayashi, Nakata | 2024 | arXiv | クーポン配布で即時収益最大化と将来 OPE のための探索をバランスさせる配布方策 |
| 17 | [OPE of Slate Bandit Policies via Optimizing Abstraction](https://arxiv.org/abs/2402.02171) | Kiyohara, Nomura, Saito | 2024 | WWW 2024 | 高次元スレート方策の OPE で最適なスレート抽象化を学習し分散を抑える |
| 18 | [OPE of Ranking Policies under Diverse User Behavior](https://arxiv.org/abs/2306.15098) | Kiyohara et al. | 2023 | KDD 2023 | 多様なユーザ閲覧行動を仮定したランキング方策 OPE（AIPS の完全版） |
| 19 | [Long-term Off-Policy Evaluation and Learning](https://arxiv.org/abs/2404.15691) | Saito et al. | 2024 | WWW 2024 | 短期代理指標を介した長期報酬の OPE/L。長期エンゲージメント最適化に適用 |
| 20 | [Hyperparameter Optimization Can Even be Harmful in Off-Policy Learning](https://arxiv.org/abs/2404.15084) | Saito, Nomura | 2024 | IJCAI 2024 | 不偏推定量を HPO の代理目的に素朴に使うと性能を損なうことを示し補正を提案 |
| 21 | [OPE and Learning for the Future under Non-Stationarity](https://arxiv.org/abs/2506.20417) | Shimizu et al. | 2025 | arXiv | 非定常環境下で「将来」の方策性能を推定・学習。時間的分布シフトを扱う |
| 22 | [Context-Action Embedding Learning for OPE in Contextual Bandits](https://arxiv.org/abs/2509.00648) | Chandak, Liu, Lee | 2025 | arXiv | 文脈×行動の結合埋め込みを学習して OPE の分散を削減（MIPS 系の発展） |
| 23 | [Unified PAC-Bayesian Study of Pessimism for Offline Policy Learning](https://arxiv.org/abs/2406.03434) | Aouali et al. | 2024 | UAI 2024 | 正則化重要度サンプリングによるオフライン方策学習の悲観主義を PAC-Bayes で統一解析 |
| 24 | [Offline Contextual Bandits in the Presence of New Actions](https://arxiv.org/abs/2605.18509) | Kishimoto et al. | 2026 | arXiv | logging 時に無かった新規行動を含むオフライン学習。support 不足下の外挿に対処 |
| 25 | [Safely Exploring Novel Actions via Deployment-Efficient Policy Learning](https://arxiv.org/abs/2510.07635) | Kiyohara et al. | 2025 | arXiv | 推薦で新規行動を安全に探索するデプロイ効率の高い方策学習 |
| 26 | [Distributionally Robust Policy Evaluation under General Covariate Shift](https://arxiv.org/abs/2401.11353) | Guo, Liu, Yue, Liu | 2024 | arXiv | 一般の共変量シフト下の文脈バンディット方策評価を分布ロバスト最適化で扱う（C5 と関連） |
| 27 | [Practical Bandits: An Industry Perspective](https://arxiv.org/abs/2302.01223) | van den Akker et al. | 2023 | WWW 2023 | 産業界視点のバンディット/OPE 実践チュートリアル |

### C3 ★: マルチタスク・転移による跨施策 HTE 推定

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 28 | [Transfer Learning for Individual Treatment Effect Estimation](https://arxiv.org/abs/2210.00380) | Aloui, Dong, Le, Tarokh | 2022 | UAI 2023 | **Causal Inference Task Affinity（タスク類似度）** を導入し ITE を転移。類似キャンペーンのグルーピングに直結、必要データ最大95%削減 |
| 29 | [Learning to Infer Counterfactuals: Meta-Learning for Multiple Imbalanced Treatment Effects](https://arxiv.org/abs/2208.06748) | Zhou et al. | 2022 | arXiv | 処置群を「タスク」とみなすメタ学習で処置間不均衡下の反実仮想推論を改善。複数処置＝複数施策に直結 |
| 30 | [Collaborative Heterogeneous Causal Inference Beyond Meta-analysis](https://arxiv.org/abs/2404.15746) | Guo, Karimireddy, Jordan | 2024 | arXiv (ICML) | 複数拠点の異質データを協調的傾向スコア重み付けで統合。メタ分析より高精度、連合で privacy 保護。拠点＝キャンペーン群で強さを借用 |
| 31 | [Causal-ICM: Data Fusion for HTE with Multi-Task Gaussian Processes](https://arxiv.org/abs/2405.20957) | Dimitriou et al. | 2024 | CLeaR 2026 | マルチタスク GP で RCT と観察データを融合し内部/外部妥当性をバランスして CATE 推定、不確実性較正 |
| 32 | [Stable HTE Estimation across Out-of-Distribution Populations](https://arxiv.org/abs/2407.03082) | Zhang et al. | 2024 | ICDE 2024 | 分布シフトを跨いで安定な HTE 推定（SBRL-HAP）。バランス正則化＋独立正則化で OOD 汎化 |
| 33 | [Transfer Learning for Causal Effect Estimation](https://arxiv.org/abs/2305.09126) | Wei et al. | 2023 | arXiv | ℓ1 正則化転移学習（ℓ1-TCL）を nuisance モデルに適用し少数データでの因果効果推定を改善 |
| 34 | [Meta-Learners for Partially-Identified Treatment Effects Across Multiple Environments](https://arxiv.org/abs/2406.02464) | Schweisthal et al. | 2024 | NeurIPS 2024 | 複数環境の観察データから overlap/unconfoundedness を緩和して CATE の区間を推定するメタ学習器 |
| 35 | [Transfer Learning of CATE with Kernel Ridge Regression](https://arxiv.org/abs/2502.11331) | Kim et al. | 2025 | arXiv | 共変量シフト・弱い overlap 下で重み付きカーネルリッジ＋擬似ラベリングで CATE を転移 |
| 36 | [Improving Precision of RCT-Based CATE using Data Borrowing with Double Calibration](https://arxiv.org/abs/2306.17478) | Asiaee et al. | 2023 | arXiv | RCT の CATE 推定に観察データを二重較正で借用（R-OSCAR）。不偏性を保ちつつ精度向上 |
| 37 | [Distributional Treatment Effect Estimation across Heterogeneous Sites via Optimal Transport](https://arxiv.org/abs/2511.09759) | Bateni et al. | 2025 | arXiv | 最適輸送で source site の処置効果を target site へ転送し拠点間異質性を考慮 |
| 38 | [Federated Causal Inference from Multi-Site Data via Propensity Score Aggregation](https://arxiv.org/abs/2505.17961) | Khellaf, Bellet, Josse | 2025 | arXiv | 個票を集約せず局所傾向スコアの連合加重平均で多拠点から ATE 推定 |
| 39 | [Heterogeneity-Aware Federated Causal Inference via Effect-Measure Transportability](https://arxiv.org/abs/2510.16317) | Cao, Yang | 2025 | arXiv | 効果尺度の transportability を活用した半パラ効率的な連合因果推定。違反サイトを扱う選択機構 |
| 40 | [Hybrid Meta-learners for Estimating HTE](https://arxiv.org/abs/2506.13680) | Liang, van der Laan, Alaa | 2026 | arXiv | 直接的/間接的正則化を適応的にバランスする H-learner。複数ベンチマークで優位 |
| 41 | [Combining Experimental and Historical Data for Policy Evaluation](https://arxiv.org/abs/2406.00317) | Li et al. | 2024 | ICML 2024 | 実験データと過去データの方策価値推定量を MSE 最小化重みで統合、誤差限界も確立 |
| 42 | [A New Targeted-Federated Learning Framework for HTE](https://arxiv.org/abs/2510.19243) | Zhao et al. | 2025 | arXiv | 多源データを結合しつつ信頼性の低いソースを除外して HTE を推定するロバスト連合学習 |
| 43 | [Representation Transfer Learning for Semiparametric Regression](https://arxiv.org/abs/2406.13197) | He et al. | 2024 | arXiv | セミパラ回帰でデータ表現を転移し大規模 source を活用しつつ target の統計的推論を可能に |
| 44 | [Estimating Treatment Effects in Networks using Domain Adversarial Training](https://arxiv.org/abs/2510.21457) | Caljon et al. | 2025 | arXiv | GNN×ドメイン敵対的学習（HINet）で干渉とネットワーク共変量シフトに対処 |
| 45 | [A Survey on Federated Causal Discovery and Inference](https://arxiv.org/abs/2606.23741) | Guo et al. | 2026 | arXiv | 連合因果探索・推定手法を方法論/トポロジ/構造スコープで整理したサーベイ |

### C4 ★: 複数実験のデータプーリング / エビデンス統合

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 46 | [Empirical Bayes Estimation of Treatment Effects with Many A/B Tests: An Overview](https://www.aeaweb.org/articles?id=10.1257/pandp.20191003) | Azevedo, Deng, Montiel Olea, Weyl | 2019 | AEA P&P | 多数実験の推定を用いて各実験の推定を改善する経験ベイズ手法の基礎的総説（「実力」と「運」の分離） |
| 47 | [Empirical Bayes Selection for Value Maximization](https://arxiv.org/abs/2210.03905) | Coey, Hung (Meta) | 2022 | KDD 2025 | ノイズある多数実験から真の価値最大化のため上位 m 件を選ぶ経験ベイズ選択則。4000超の社内実験で実証 |
| 48 | [Meta-Analysis of Randomized Experiments with Heavy-Tailed Response Data](https://arxiv.org/abs/2112.07602) | Tripuraneni et al. | 2021 | arXiv | 多数 RCT 横断で強さを借りて推定器を評価する交差検証法。Amazon 699 RCT で重裾に頑健化 |
| 49 | [Choosing a Proxy Metric from Past Experiments](https://arxiv.org/abs/2309.07893) | Tripuraneni et al. (Google) | 2023 | KDD 2024 | 過去実験コーパスで長期/代理指標の潜在効果をデノイズしポートフォリオ最適化として代理指標を構成 |
| 50 | [Pareto Optimal Proxy Metrics](https://arxiv.org/abs/2307.01000) | Zito et al. (Google) | 2023 | arXiv | 長期予測精度と短期感度を同時最適化するパレート最適な代理指標。North Star より8倍高感度 |
| 51 | [Learning the Covariance of Treatment Effects Across Many Weak Experiments](https://arxiv.org/abs/2402.17637) | Bibaut et al. (Netflix) | 2024 | arXiv | 多数の弱い実験横断で処置効果共分散推定のバイアスを IV 分析で補正、不偏な代理指標構成を可能に |
| 52 | [Learning Metrics that Maximise Power for Accelerated A/B-Tests](https://arxiv.org/abs/2402.03915) | Jeunen, Ustimenko (ShareChat) | 2024 | KDD 2024 | 過去実験ログ上で p 値を最小化し North Star のパワーを最大化する指標を学習。必要サンプル最大88%削減 |
| 53 | [Ranking by Lifts: A Cost-Benefit Approach to Large-Scale A/B Tests](https://arxiv.org/abs/2407.01036) | Basu, Berman | 2024 | arXiv | コスト加重 FDR 制約下で期待利益を最大化。局所 fdr で期待リフト/コスト比により実験をランク付け |
| 54 | [Shrinkage-Based Regressions with Many Related Treatments](https://arxiv.org/abs/2507.01202) | Dilber, Gray | 2025 | arXiv | 多数の関連処置（マーケのタッチポイント等）にリッジで異質/均質モデル間を補間し MSE 削減 |
| 55 | [Combining Incomplete Observational and Randomized Data for HTE](https://arxiv.org/abs/2410.21343) | Yao, Tang, Cui, Li | 2024 | arXiv | 不完全な観察データと RCT を結合し交絡補正して HTE 推定（CIO 法） |
| 56 | [Blending Proxy Metrics with a North Star](https://arxiv.org/abs/2606.21745) | Chou (Netflix) | 2026 | arXiv | 代理指標と North Star を最適ブレンドし、実験パワーと代理品質に応じて滑らかに重みを調整 |
| 57 | [The Proximal Surrogate Index: Long-Term Effects under Unobserved Confounding](https://arxiv.org/abs/2601.17712) | Hung, Chen | 2026 | arXiv | 未観測交絡下で実験標本と観察標本を結合しプロキシ変数で長期処置効果を識別 |
| 58 | [A Sensitivity Analysis of the Surrogate Index Approach](https://arxiv.org/abs/2603.00580) | Fan et al. | 2026 | arXiv | サロゲート指数法のサロガシー仮定に対する感度分析（Weighted Surrogate Indices） |
| 59 | [Adaptive Experimental Design Using Shrinkage Estimators](https://arxiv.org/abs/2602.07404) | Rosenman, Hunter | 2026 | arXiv | K アーム逐次試験で Stein 型縮小によりアーム間で情報を借用、逐次 Neyman 割当を上回る |
| 60 | [Using Prior Studies to Design Experiments: An Empirical Bayes Approach](https://arxiv.org/abs/2602.20581) | Zhiheng You | 2026 | arXiv | 先行研究群の予測分布を最適実験デザインに埋め込み経験ベイズで borrowing strength |

### C5: 行動セグメンテーション × 効果の転移可能性

**(b) 転移可能性・外的妥当性・サブグループ発見**

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 61 | [A Unified Framework for the Transportability of Population-Level Causal Measures](https://arxiv.org/abs/2505.13104) | Boughdiri et al. | 2025 | NeurIPS 2025 | リスク差だけでなくオッズ比等も共変量シフト下の目標集団へ移送する統一枠組み（one-step 推定） |
| 62 | [Transportability of Principal Causal Effects](https://arxiv.org/abs/2405.04419) | Clark et al. | 2024 | arXiv | 服薬非遵守を伴う試験で主要層別化を用いてコンプライアンス条件付き効果を目標集団へ移送 |
| 63 | [One-Step Weighting to Generalize and Transport Treatment Effect Estimates](https://arxiv.org/abs/2203.08701) | Chattopadhyay et al. | 2022 | arXiv | 選択×処置の2段階を1段階の重み付けに統合。最小分散重みで半パラ効率的（基礎的手法） |
| 64 | [Estimating Interpretable HTE with Causal Subgroup Discovery in Survival Outcomes](https://arxiv.org/abs/2409.19241) | Bo, Ding | 2024 | arXiv | 生存アウトカムで CATE 推定と予測的サブグループ同定を同時に行う解釈可能 HTE 枠組み |
| 65 | [Distilling HTE: Stable Subgroup Estimation in Causal Inference](https://arxiv.org/abs/2502.07275) | Huang, Tang, Kenney | 2025 | arXiv | 任意 ML で HTE 推定後、causal distillation trees で解釈可能・安定なサブグループへ蒸留 |
| 66 | [Causal Clustering for CATE Estimation and Subgroup Discovery](https://arxiv.org/abs/2509.05775) | Wang, Ayer, Yang | 2025 | IEEE BHI 2025 | Robinson 分解で debiased CATE を推定しカーネルクラスタリングで処置感受性の異なる群を発見 |

**(a) 行動セグメンテーション / サブグループ / 顧客埋め込み**

| # | タイトル | 著者 | 年 | Venue | 概要 |
|---|---------|------|-----|-------|------|
| 67 | [Aggregation Trees](https://arxiv.org/abs/2410.11408) | Di Francesco | 2024 | Econometric Reviews | 異質サブグループを解釈可能性と粒度のトレードオフで探索するネスト系列。honesty+debiased ML で各群 ATE に妥当な推論 |
| 68 | [SubgroupTE: Advancing Treatment Effect Estimation with Subgroup Identification](https://arxiv.org/abs/2401.12369) | Lee et al. | 2024 | ACM TIST | Transformer + EM で処置効果推定とサブグループ同定を統合 |
| 69 | [HTE Estimation with Subpopulation Identification for Personalized Medicine (OUD)](https://arxiv.org/abs/2401.17027) | Lee et al. | 2024 | IEEE ICDM 2023 | SubgroupTE の ICDM 版。サブグループ間の処置アウトカム変動を捉える |
| 70 | [Deep Learning of Continuous and Structured Policies for Aggregated HTE](https://arxiv.org/abs/2507.05511) | Zhang, Du, Zou | 2025 | arXiv | 二値を超え連続・構造化ポリシー変数へ HTE を拡張。集約 HTE で被験者をランク付け |
| 71 | [An Exploration of Clustering Algorithms for Customer Segmentation (UK Retail)](https://arxiv.org/abs/2402.04103) | John, Shobayo, Ogunleye | 2024 | Analytics (MDPI) | 54万件超の UK 小売で RFM ×複数クラスタリング比較。GMM が Silhouette 0.80 で最良 |
| 72 | [CASPR: Customer Activity Sequence-based Prediction and Representation](https://arxiv.org/abs/2211.09174) | Chen et al. | 2022 | NeurIPS 2022 WS | 顧客取引系列を Transformer で汎用埋め込み化（customer2vec 系）。複数業務タスクへ転用可 |
| 73 | [Intelligent Vector-based Customer Segmentation (Customer2Vec)](https://arxiv.org/abs/2012.11876) | Mousaeirad | 2020 | arXiv | 教師あり分類＋教師なしクラスタリングで顧客ベクトルを埋め込む（基礎的埋め込み手法） |
| 74 | [How Do Consumers Really Choose: Hidden Preferences with Mixture of Experts](https://arxiv.org/abs/2503.05800) | Vallarino | 2025 | arXiv | 確率的ゲーティング×専門家 NW で消費者セグメントを動的に同定する MoE 枠組み |

> C5 補助サーベイ: [An Introductory Survey to Autoencoder-based Deep Clustering](https://arxiv.org/abs/2504.02087)（Leiber et al., 2025）— DEC 系顧客セグメンテーションの方法論的背景（marketing 特化ではない汎用サーベイ）。

---

## アンチハルシネーション注記（C5）

C5 の検索過程で、検索スニペット上のみに現れ arXiv ID が構築的・検証不能な以下の論文候補は **採用しなかった**: "Nested Sensitivity Envelopes" (2605.09264), "Sharp Bounds under Outcome Distribution Shift" (2602.09595), "Transporting treatment effects by calibrating..." (2605.07285), "SE experiments transportability" (2604.08200), "Omitted-Variable Sensitivity" (2603.27788)。将来 retrieval 段階で実在確認できれば再検討可。

---

## 次のステップ

- **論文の詳細調査（research-retrieval）**: 本テーマ中核の以下を優先候補として詳細レポート化：
  - C3: #28 Transfer Learning for ITE（タスク類似度）, #30 Collaborative Heterogeneous Causal Inference, #34 Meta-Learners across Environments
  - C4: #49 Choosing a Proxy Metric, #51 Covariance Across Weak Experiments (Netflix), #52 Power-Maximising Metrics (ShareChat), #47 EB Selection for Value Maximization (Meta)
  - clustering 側代表論文（DPTR 2508.10331, multi-study R-learner 2306.01086, surrogate index 2311.11922）と合わせて詳細化
- **追加収集（research-gather）**: 特許・ビジネス事例の種別を追加する場合
- **領域マッピング調整（research-clustering）**: C3/C4 の再クラスタリング
