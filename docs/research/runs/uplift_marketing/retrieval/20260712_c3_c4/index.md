# マーケティング施策のアップリフト最適化：施策データ統合 — 詳細レポート（C3 + C4）

## Parameters

- **Resources analyzed**: 35 論文（C3 マルチタスク・転移 HTE = 18、C4 データプーリング・エビデンス統合 = 17。うち #35 は両クラスタ共有のレビュー）
- **Resource types**: Academic Paper（全件 arXiv 中心）
- **Generated on**: 2026-07-12
- **Input source**: `runs/uplift_marketing/clustering/20260712/`（cluster-03/04）+ `gather/20260712_all/resources-uplift-marketing-pooling.md`（C3/C4）
- **Detail level**: 詳細（各 225〜330 行、図表・数式・擬似コード・本テーマへの適用可能性込み）
- **本テーマ**: 疎で不定期な複数マーケ施策（クーポン/メール、対象・訴求が異なる）を **群化・プールして擬似的にデータ密度を上げ、実効的な実験間隔を短縮** し、uplift / off-policy 評価の精度を高める

## Big Picture

35本を通読すると、本テーマの解は **2つの補完的な軸** に集約される。

- **軸A（C3：モデル・表現の共有）** — 「似た施策/ユーザーを1つのモデルの中で共有表現・タスク埋め込みとして扱い、共通効果を借り、施策固有の異質性を分離する」。転移学習・メタ学習・マルチタスク・連合学習・最適輸送が該当。少量データのターゲット施策に、豊富なソース施策から情報を注入する。
- **軸B（C4：統計的なプーリング・補完・代理指標）** — 「個別に推定した効果を経験ベイズ/階層ベイズで縮約し、代理指標で観測期間を短縮し、行列補完で欠測セルを埋める」。実験プラットフォーム勢（Netflix/Google/Meta/ShareChat/Amazon）の実務直結手法が中心。

実務では **軸B（プーリング/代理指標）で有効データ密度と実験間隔を底上げ → 軸A（転移/共有表現）で個別施策の uplift 推定を強化** という順で組むのが自然。

---

## Report List — C3: マルチタスク・転移による跨施策 HTE 推定

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 1 | Multi-Study R-Learner | 2023 | Biostatistics | 共変量依存の所属確率 p(k\|x) を Robinson 変換に組込み、研究間異質性を許容しつつ疎な複数研究から借用 | [詳細](01-multi-study-r-learner.md) |
| 2 | Transfer Learning for ITE (CITA) | 2022 | UAI 2023 | Fisher情報ベースの因果タスク親和性 CITA で近傍ソースを選び TARNet を転移、必要データ最大95%削減 | [詳細](02-transfer-learning-ite.md) |
| 3 | MetaITE (複数不均衡処置) | 2022 | arXiv | 処置群をメタ学習タスクとみなし MMD で潜在分布整合、複数不均衡処置の ITE を推定 | [詳細](03-meta-learning-imbalanced-treatments.md) |
| 4 | Collaborative Heterogeneous Causal (Clb-IPW/AIPW) | 2024 | ICML 2024 | 傾向スコア関数を先に協調集約し、カバレッジ不足の異質サイトを相補的に救済、Meta-IPW より低分散 | [詳細](04-collaborative-heterogeneous-causal.md) |
| 5 | Meta-Learners across Environments (部分識別) | 2024 | ICML 2024 | 環境を操作変数とみなし複数環境から CATE の区間を二重頑健メタラーナーで推定 | [詳細](05-metalearners-partial-identification-environments.md) |
| 6 | Meta-Learning CATE with Closed-Form Solvers | 2024 | Machine Learning | prototypical net + ridge の閉形式でサブ問題を解き、少数データの未知タスクで高速高精度 CATE | [詳細](06-meta-learning-cate-closed-form.md) |
| 7 | Transfer on Heterogeneous Feature Spaces (HTCE) | 2022 | NeurIPS 2022 | 特徴空間が異なるソースから shared/private 層＋直交正則化で CATE を転移 | [詳細](07-transfer-heterogeneous-feature-spaces.md) |
| 8 | CorNet (観察+RCT 統合) | 2022 | arXiv | 大量観察で共有表現、少量 RCT でバイアス関数のみ補正する二段階融合 | [詳細](08-combining-observational-randomized.md) |
| 9 | Causal-ICM (マルチタスク GP 融合) | 2024 | CLeaR 2026 | 借用パラメータ ρ を持つ multi-task GP で RCT×観察を融合、不確実性定量化付き CATE | [詳細](09-causal-icm-multitask-gp.md) |
| 10 | SBRL-HAP (OOD 安定 HTE) | 2024 | ICDE 2024 | balancing(IPM)+independence(HSIC) を階層アテンションで調停し OOD 母集団へ汎化 | [詳細](10-stable-hte-ood-populations.md) |
| 11 | COKE (KRR による CATE 転移) | 2025 | arXiv | 二重分布シフト・弱オーバーラップ下で pseudo-outcome RA learner により CATE 転移 | [詳細](11-transfer-cate-kernel-ridge.md) |
| 12 | R-OSCAR (Double Calibration) | 2023 | arXiv | 交絡した観察研究を二重較正で安全に借用、HTE 検出に必要な RCT サンプルを最大75%削減 | [詳細](12-rct-cate-double-calibration.md) |
| 13 | Task Embeddings + Balanced Representation (CISI-Net) | 2025 | arXiv | 複数処置の単一効果と交互作用を task embedding 共有＋IPM で同時推定、疎な処置組合せで安定 | [詳細](13-task-embeddings-balanced-representation.md) |
| 14 | MTMT (複数処置・複数タスク uplift) | 2024 | arXiv | 効果を base+incremental に階層分解し MMOE で複数施策・複数KPIの uplift を同時推定（本番運用） | [詳細](14-mtmt-multi-treatment-multi-task.md) |
| 15 | OTSynth (最適輸送 site 間) | 2025 | arXiv | 両 site の対照群を最適輸送で整列し、処置群のないターゲット site の処置分布を合成 | [詳細](15-distributional-optimal-transport-sites.md) |
| 16 | Fed-IPW/AIPW (傾向スコア集約) | 2025 | arXiv | site 所属確率で局所傾向スコアを連合加重平均、個人データ非共有でグローバル overlap 改善 | [詳細](16-federated-propensity-aggregation.md) |
| 17 | PFWS (transportability 連合) | 2025 | arXiv | transportability を破るソースを適応除外し互換 site から借用、半パラ効率境界を達成 | [詳細](17-heterogeneity-federated-transportability.md) |
| 18 | Combining Experimental + Historical (方策評価) | 2024 | ICML 2024 | 不偏の実験推定量とシフトある履歴推定量を MSE 最小化重みで凸結合、悲観主義で頑健化 | [詳細](18-combining-experimental-historical-policy.md) |

## Report List — C4: 複数実験のデータプーリング / エビデンス統合

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 19 | DPTR (Data-Pooling Treatment Roll-Out) | 2025 | arXiv | decision-aware shrinkage で実験横断に縮約、データ希少下でも roll-out 判断を安定化 | [詳細](19-data-pooling-treatment-rollout.md) |
| 20 | Learning Across Experiments and Time (CF-SHN) | 2025 | arXiv | DTW プロセス近傍＋cross-fitted アウトカム近傍で似た実験のみ借用、ASOS で MSE 27.2%削減 | [詳細](20-learning-across-experiments-time.md) |
| 21 | Empirical Bayes Selection for Value Maximization | 2022 | ACM (KDD系) | 上位選択に限れば EB posterior mean のランク付けで速い regret 収束、4000超実験で実証 | [詳細](21-empirical-bayes-value-maximization.md) |
| 22 | Meta-Analysis with Heavy-Tailed Responses | 2021 | arXiv | 不偏 DM をノイジー正解として 699 RCT を横断集約、重裾では Winsorize が MSE 改善 | [詳細](22-meta-analysis-heavy-tailed.md) |
| 23 | Shrinkage Regressions with Many Related Treatments | 2025 | arXiv | focal 集約成分は無penalty、サブ処置成分のみ ridge で希少施策を集約側へ縮約（Wayfair） | [詳細](23-shrinkage-many-related-treatments.md) |
| 24 | Prior Studies for Experiment Design (EB) | 2026 | arXiv | 過去研究から EB で情報的事前を学習し層別処置確率を最適化、研究数増でオラクル最適 | [詳細](24-prior-studies-experiment-design-eb.md) |
| 25 | Surrogate Index at Netflix (200 A/B) | 2023 | arXiv | 14日 auto-surrogate で63日効果を予測、意思決定約95%一致（launch precision79%/recall65%） | [詳細](25-surrogate-index-netflix.md) |
| 26 | Choosing a Proxy Metric | 2023 | KDD 2024 | proxy 構築をポートフォリオ最適化に帰着し階層ベイズで denoise、最適 proxy はサンプル数依存 | [詳細](26-choosing-proxy-metric.md) |
| 27 | Pareto Optimal Proxy Metrics | 2023 | arXiv | 感度と長期方向一致の多目的最適化で Pareto 前線探索、north star の8.5倍感度・recall72% | [詳細](27-pareto-optimal-proxy-metrics.md) |
| 28 | Covariance of TE Across Weak Experiments | 2024 | KDD 2024 | 弱効果で共分散がバイアスする問題を弱操作変数技法（LIML/JIVE）で補正、不偏 proxy 構築 | [詳細](28-covariance-treatment-effects-weak-experiments.md) |
| 29 | Power-Maximising Metrics | 2024 | KDD 2024 | 平均z最大化の過学習を指摘し log p 値最小化を提案、サンプル12%で同検出力（北極星併用+210%） | [詳細](29-power-maximising-metrics.md) |
| 30 | Blending Proxy with a North Star | 2026 | ECML PKDD 2026 | 検出力と proxy 品質に応じ両者を閉形式で最適配合、良い proxy ほど小規模高頻度実験を推奨 | [詳細](30-blending-proxy-north-star.md) |
| 31 | Optimizing Experimentation Programs | 2024 | ACM EC 2025 | 過去実験プールから EB＋動的計画でトラフィック配分・p値閾値・本数を同時最適化（Netflix） | [詳細](31-optimizing-experimentation-programs.md) |
| 32 | Matrix Completion for HTE | 2026 | arXiv | 非一様処置割当のパネルを matrix completion 化、傾向スコア未知で行方向誤差保証 | [詳細](32-matrix-completion-hte.md) |
| 33 | PaCE (パネルデータ HTE) | 2024 | arXiv | 回帰木でクラスタリングし low-rank de-biased 凸推定でクラスタ別 ATE、最大40葉で解釈可能 | [詳細](33-panel-data-treatment-effects-pace.md) |
| 34 | CIO (不完全観察+RCT 融合) | 2024 | CIKM 2024 | OS が片群しか無くても交絡バイアス関数 c(X) を推定して補正、RCT と融合し低分散 HTE | [詳細](34-combining-incomplete-observational-rct.md) |
| 35 | Combining Multiple RCTs [SURVEY] | 2024 | Statistics in Medicine | complete pooling / trial indicator / ensemble / IPD meta / no pooling の taxonomy を体系化 | [詳細](35-combining-multiple-rcts-review.md) |

---

## Cross-Resource Insights（横断的な示唆）

### 1. 「借りる／プールする」には必ず "似ている度合い" の制御が要る

素朴な complete pooling は異質性で破綻する、というのが全 35 本に通底する教訓。制御の仕方が手法を分ける：

- **所属確率・membership weights**（#1, #16）— 各研究/site への帰属を共変量の関数として推定し重み付け
- **タスク親和性・近傍選択**（#2 CITA, #20 DTW+cross-fit 近傍, #17 互換 site 選択）— 似た施策のみを選択的に借用
- **shrinkage 強度の適応**（#19 DPTR, #21 EB, #23 ridge, #35 trial indicator）— 全体平均への縮約量をデータで決定
- **task embedding / 共有表現**（#13, #14, #7, #8）— 潜在空間で共通部分を共有し固有部分を分離

→ 実務では「施策メタデータ（対象セグメント・訴求・クーポン額）＋ユーザー行動」で施策間類似度を定義し、C5 の行動セグメンテーションと接続するのが自然。

### 2. 「実験間隔の短縮」は主に代理指標（surrogate/proxy）が担う

#25/#26/#27/#29/#30 は「短期信号から長期効果を予測して実験を早く打ち切る」系で、Netflix/Google/ShareChat が **サンプル最大88%削減・実験期間 63→14 日** といった実務効果を報告。数ヶ月に一度の施策でも、代理指標を過去施策群から学習しておけば次施策の判断を早められる。#28 は「多数の弱い実験」から代理指標を作る際の共分散バイアスを補正する土台。

### 3. モデル共有系（C3）と統計プーリング系（C4）は排他でなく積層できる

例：**#31（EB で実験プログラム全体を最適化）＋ #14（MTMT で個別施策の uplift 推定）＋ #25（surrogate で観測短縮）** を組めば、「プールで密度↑・代理で間隔↓・共有表現で個別精度↑」が同時に効く。

---

## Comparison Table（主要手法の性質比較）

| 手法 (#) | アプローチ軸 | 借用/プールの単位 | 類似度制御 | 定量効果（出典値） | 実務適合 |
|---------|------------|-----------------|-----------|-----------------|---------|
| Multi-Study R-Learner (#1) | C3 表現共有 | 研究(study) | 所属確率 p(k\|x) | 記載の数値は本文参照 | 中〜高 |
| Transfer ITE / CITA (#2) | C3 転移 | タスク(施策) | Fisher 親和性で近傍選択 | 必要データ最大 -95% | 高 |
| MetaITE (#3) | C3 メタ学習 | 処置群 | MMD 分布整合 | — | 中 |
| Task Embeddings (#13) | C3 マルチタスク | 処置(複数) | IPM balancing | 疎な処置組合せで安定化 | 高 |
| MTMT (#14) | C3 マルチタスク | 処置×KPI | treatment-user interaction | 本番運用 | 高 |
| R-OSCAR (#12) | C3 データ融合 | RCT+観察 | 二重較正 | 必要 RCT 最大 -75% | 高 |
| DPTR (#19) | C4 プーリング | 実験 | decision-aware shrinkage | DiM/OLS/ITR 上回る | 高 |
| Learning Across Exp (#20) | C4 局所EB | 実験 | DTW+cross-fit 近傍 | MSE -27.2%（ASOS） | 高 |
| EB Value Maximization (#21) | C4 EB選択 | 実験 | posterior mean rank | 4000超実験で実証 | 高 |
| Surrogate Index (#25) | C4 代理指標 | 時間軸 | auto-surrogate | 63→14日, 意思決定95%一致 | 高 |
| Power-Maximising (#29) | C4 代理指標 | 指標 | log p 最小化 | サンプル12%で同検出力 | 高 |
| Optimizing Programs (#31) | C4 EB+DP | 実験プログラム | 階層事前 | 最適p値≈0.50（Netflix） | 高 |
| Matrix Completion (#32) | C4 補完 | 実験×ユニット | low-rank | 行方向誤差保証 | 中 |

> 「アプローチ軸」列：C3=モデル/表現の共有、C4=統計的プーリング/補完/代理指標。「実務適合」は本テーマ（疎・不定期なマーケ施策の群化）への近さの主観評価。

## Further Investigation Candidates（追加調査候補）

- **C2 OPE との接続**: プール/代理指標で作った密なデータを、クーポン/メールの出し分け方策の off-policy 評価（Open Bandit Pipeline）に流す実装検証。
- **C5 行動セグメンテーション**: 「施策間類似度」の定義に customer2vec / RFM クラスタ（gather C5 #72/#73）を用い、#2 CITA や #20 近傍選択の入力にする。
- **特許・ビジネス事例**: 本 retrieval は arXiv 論文のみ。Mercari/Netflix/Criteo の実運用事例を business case として research-gather で追加する余地。
- **未収録の関連**: gather C3 の #40 Hybrid Meta-learners (2506.13680)、#43 Representation Transfer for Semiparametric Regression (2406.13197)、C4 #57 Proximal Surrogate Index (2601.17712)、#58/#59 感度分析・適応デザイン系は今回の35本から外したが、深掘り候補。

## 次のステップ

- **統合サマリ/実装設計**: 35本の知見を「疎・不定期施策の群化パイプライン」設計書に落とす（軸B→軸A の積層アーキテクチャ）。
- **C2/C5 の retrieval**: OPE・セグメンテーション側の詳細レポート化で全体像を完成。
- **特許・事例の追加収集**: research-gather を business case / patent 種別で再実行。
