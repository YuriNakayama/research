# Cluster 3 ★: マルチタスク・転移による跨施策 HTE 推定

> **本テーマの中核クラスタ（その1）**。「似た施策・似たユーザー群をグルーピングして実効的にデータ密度を上げ、実験間隔を短縮する」という要件に、**モデル・表現の共有（representation / meta-learning ベース）** で応える手法群。統計的プーリングで応える C4 と相補的。

**Overview**:
本クラスタは、単一の実験だけでは統計的検出力が不足する状況で、複数のキャンペーン・研究・サイト・処置種別をまたいで「強さを借りる (borrow strength)」ことで CATE を安定推定する手法群を扱う。中核は (1) 各研究に membership probability や study-specific 項を割り当てて共通部分だけをプールする multi-study R-learner / causal forest 系、(2) タスク共通表現とタスク固有パラメータを分離する meta-learning / multi-task 表現学習系、(3) 観測データと RCT を融合しつつ交絡バイアスに頑健化する data-fusion 系、(4) プライバシー制約下でサイト集約統計のみを共有する federated causal inference 系である。「転移可能な共通効果は共有し、キャンペーン固有の異質性は分離」することで、疎で不定期な marketing 実験からでも信頼できる uplift 推定を可能にする。特に task embedding + balanced representation は「複数のクーポン額・メッセージ（複数処置）」を1つのモデルで扱う設計として実務適合性が高い。

**Keywords**:
`multi-study R-learner`, `borrowing strength across studies`, `membership probability`, `heterogeneous treatment effect (HTE)`, `CATE`, `multi-task learning for causal inference`, `meta-learning CATE (task-shared / task-specific)`, `task embedding`, `balanced representation learning`, `multi-treatment uplift modeling`, `transfer learning for treatment effects`, `combining observational and randomized data (data fusion)`, `federated causal inference`, `transportability / external validity`, `covariate shift / multi-accuracy`, `shared (sufficient) representation potential outcomes`

**Research Strategy**:
- 中核3論文を優先: #1 multi-study R-learner（研究横断で nuisance を学習し強さを借りる）、#4 task embedding + balanced representation（複数処置の同時推定）、#5 MTMT（marketing 実務にそのまま適用可）。
- 少数データ・不定期実験には #3（meta-learning CATE、few-shot 対応）が直結。
- 「豊富なログ（観測）＋少量の RCT」の融合設計は #7、共変量シフトへの頑健化は #8（Multi-CATE、C5 とも重複）。
- プライバシー制約下（複数事業部・複数ブランド横断）なら #10/#11 の federated 系。
- 主要研究者/グループ: Parmigiani/Patil（multi-study）、Mihaela van der Schaar 系（transfer/data fusion）、Tomoharu Iwata（NTT, meta-learning）、Kosuke Imai 系（multisite 汎化）。
- **C4 との使い分け**: C3 は「1つのモデルに共有表現を持たせて end-to-end 学習」、C4 は「個別に推定した効果を統計的に縮約・補完」。データ量が中規模で特徴が豊富なら C3、実験数が多く各実験の推定が既にある場合は C4 が入りやすい。

**Representative Resources**:

| # | Title | Type | Year | Summary | Link |
|---|-------|------|------|---------|------|
| 1 | Multi-Study R-Learner for HTE Across Studies | Paper | 2023 | R-learner を多研究に拡張。membership probability で異質性を許容しつつ横断学習。**中核** | https://arxiv.org/abs/2306.01086 |
| 2 | Multi-Study Causal Forest (MCF) | Paper | 2025 | 効果異質性の程度が研究ごとに異なる状況で causal forest によるデータ借用を行う | https://arxiv.org/abs/2502.02110 |
| 3 | Meta-learning for HTE with closed-form solvers | Paper | 2023 | 複数タスクから CATE 推定法自体を meta-learn。閉形式でタスク固有部を解き few-shot 対応 | https://arxiv.org/abs/2305.11353 |
| 4 | Multiple Treatments Causal Effects with Task Embeddings & Balanced Representation | Paper | 2025 | task embedding で処置パターン間を共有、balancing penalty で選択バイアス低減。**複数処置に最適** | https://arxiv.org/abs/2511.09814 |
| 5 | Multi-Treatment Multi-Task Uplift Modeling (MTMT) | Paper | 2024 | MMoE で複数タスクの uplift を同時推定、treatment-user 交互作用で処置横断表現を学習 | https://arxiv.org/abs/2408.12803 |
| 6 | Transfer Learning on Heterogeneous Feature Spaces for Treatment Effects | Paper | 2022 | 特徴空間が異なるソースから target の CATE を改善。shared/private レイヤの multi-task | https://arxiv.org/abs/2210.06183 |
| 7 | Combining Observational and Randomized Data for HTE | Paper | 2022 | 大量の観測データで shared representation、小量 RCT で data-specific 構造を学習 | https://arxiv.org/abs/2202.12891 |
| 8 | Multi-CATE: Multi-Accurate CATE Robust to Unknown Covariate Shifts | Paper | 2024 | 未知の別母集団への展開時の共変量シフトに multi-accuracy で頑健化（C5 と重複） | https://arxiv.org/abs/2405.18206 |
| 9 | Comparison of Methods that Combine Multiple RCTs to Estimate HTE [SURVEY] | Survey | 2024 | 複数 RCT 統合の手法比較。試験間異質性を許容する手法が優位（C4 と重複） | https://arxiv.org/abs/2303.16299 |
| 10 | Federated Learning for Estimating HTE | Paper | 2024 | 個票を共有せずクライアント間で HTE モデルを協調学習 | https://arxiv.org/abs/2402.17705 |
| 11 | Federated Causal Inference in Heterogeneous Observational Data | Paper | 2023 | 局所計算した要約統計のみ集約して ATE を推定。サイト間異質性を想定 | https://arxiv.org/abs/2107.11732 |
| 12 | Efficient HTE Estimation With Multiple Experiments and Multiple Outcomes | Paper | 2022 | 複数実験×複数アウトカムで共有構造を利用し推定分散を削減（C4 と重複） | https://arxiv.org/abs/2206.04907 |
| 13 | Estimating CATE via Sufficient Representation Learning | Paper | 2024 | 2つの潜在アウトカムの条件付き分布差にペナルティを課し十分表現を学習 | https://arxiv.org/abs/2408.17053 |
