# Cluster 4 ★: 複数実験のデータプーリング / エビデンス統合

> **本テーマの中核クラスタ（その2）**。「疎・不定期な施策を横断してプールし、有効サンプルサイズと実効データ密度を上げ、実効的な実験間隔を短縮する」という要件に、**統計的な縮約・補完（empirical Bayes / hierarchical Bayes / matrix completion / surrogate index ベース）** で応える手法群。モデル共有で応える C3 と相補的。

**Overview**:
このクラスタは、少数・低密度の個別実験（散発的なマーケティングキャンペーンなど）を横断してデータをプールし、有効サンプルサイズと推定精度を高める手法群を扱う。中核は DPTR や empirical Bayes shrinkage・階層ベイズによる partial pooling で、各実験の生の効果推定を全体平均へ「借りた強度 (borrowing strength)」で縮約し、no-pooling と complete-pooling の中間で最小 MSE を実現する。さらに surrogate index は 63 日の長期効果を 14 日の代理指標で近似することで単一実験の観測期間そのものを短縮し、matrix completion は実験×ユニットの効果表の未観測セルを低ランク補完で埋めて疎な実験群を実質的に高密度化する。結果として、実験を単独で長く回す代わりに複数実験を統合・補完することで、実効的な実験間隔が短縮されデータ量・密度が底上げされ、より速く信頼できる treatment 選択とポリシー展開が可能になる。

**Keywords**:
`data pooling`, `treatment roll-out (DPTR)`, `evidence synthesis`, `partial pooling`, `complete pooling`, `hierarchical Bayes / multilevel model`, `empirical Bayes shrinkage`, `James–Stein estimator`, `borrowing strength`, `heterogeneous treatment effects (HTE)`, `meta-analysis of experiments`, `cross-experiment learning`, `surrogate index / surrogate outcomes`, `matrix completion`, `effective sample size`, `online controlled experiments (A/B testing)`

**Research Strategy**:
- 中核は #1 DPTR（複数実験をプールして分散低減しサブグループ別ロールアウト）— #2 の実装コードで再現から入る。
- 「グローバル一括プールは危険、近い実験だけ束ねる」局所化は #3（local empirical Bayes、ASOS 78実験で検証）が実務的示唆に富む。
- 実験プログラム全体の運用視点は survey #5（experimentation program の最適化）と #10（Kohavi et al. の institutional memory 章）。
- **実験間隔そのものの短縮**には #9（Netflix surrogate index: 14日で63日効果を95%再現）が最重要。単一施策の観測期間を縮められる。
- 疎な効果表の補完は #7/#8（matrix completion / panel）。実験×ユニットの未観測セルを低ランク補完。
- partial pooling / 階層ベイズの入門は日本語 #12、代理指標×階層ベイズの橋渡しは #13。
- 主要研究者/グループ: Philip Zhang 系（DPTR）、Netflix/ASOS/Microsoft 実験プラットフォーム勢、Art Owen（data enrichment）、Kohavi/Tang/Xu（OCE 教科書）。

**Representative Resources**:

| # | Title | Type | Year | Summary | Link |
|---|-------|------|------|---------|------|
| 1 | Synthesizing Evidence: Data-Pooling for Treatment Selection in Online Experiments | Paper | 2025 | **中核**。複数実験をまたぐ DPTR で推定分散を下げサブグループ別ロールアウトを導く | https://arxiv.org/abs/2508.10331 |
| 2 | Data-Pooling-Treatment-Roll-Outs（実装） | OSS | 2025 | 上記 DPTR の再現コード。実データ・シミュレーション実装 | https://github.com/shoucheng666/Data-Pooling-Treatment-Roll-Outs |
| 3 | Learning Across Experiments and Time: Tackling Heterogeneity in A/B Testing | Paper | 2025 | 類似度ベースの近傍から局所的に強度を借りる local empirical Bayes。ASOS 78実験で検証 | https://arxiv.org/abs/2511.21282 |
| 4 | Comparison of Methods that Combine Multiple RCTs to Estimate HTE [SURVEY] | Survey | 2024 | 複数 RCT 統合手法の比較。異質性を許容する手法が優位（C3 と重複） | https://arxiv.org/abs/2303.16299 |
| 5 | Optimizing Returns from Experimentation Programs [SURVEY] | Survey | 2024 | A/B ポートフォリオへの empirical Bayes を「最適化」視点で動的計画へ拡張 | https://arxiv.org/abs/2412.05508 |
| 6 | Efficient HTE Estimation With Multiple Experiments and Multiple Outcomes | Paper | 2022 | 複数実験×複数アウトカムで実験横断の共有構造を利用し推定効率化（C3 と重複） | https://arxiv.org/abs/2206.04907 |
| 7 | Improved Guarantees for HTE Estimation via Matrix Completion | Paper | 2026 | 実験×ユニットの効果を低ランク行列とみなし補完で未観測セルを埋める | https://arxiv.org/abs/2605.30319 |
| 8 | Heterogeneous Treatment Effects in Panel Data (PaCE) | Paper | 2024 | n×m パネルの非一様処置を行列補完問題として定式化し反実仮想を推定 | https://arxiv.org/abs/2406.05633 |
| 9 | Evaluating the Surrogate Index Using 200 A/B Tests at Netflix | Paper/Case | 2023 | 14日の代理指標で63日効果を約95%再現。**実験期間短縮の代表事例** | https://arxiv.org/abs/2311.11922 |
| 10 | Institutional Memory and Meta-Analysis (OCE 教科書 Ch.8) [SURVEY] | Book | 2020 | 数万件の A/B テストを横断メタアナリシスする「制度的記憶」の実務章 | https://www.cambridge.org/core/books/trustworthy-online-controlled-experiments/institutional-memory-and-metaanalysis/0FC1D83D9445E8AE10858DDF9360D3B0/core-reader |
| 11 | Data Enriched Linear Regression | Paper | 2013 | 小さな対象データを大きな関連データで豊富化。partial pooling の古典的基礎 | https://arxiv.org/abs/1304.1837 |
| 12 | ベイズメタアナリシス徹底解説 | Web(JP) | 2023 | 事前分布×尤度でランダム効果を推定。日本語での partial pooling 入門 | https://best-biostatistics.com/toukei-er/entry/integrating-evidence-with-bayesian-meta-analysis-a-complete-guide/ |
| 13 | Bayesian Hierarchical Meta-Regression for Surrogate Endpoints Across Heterogeneous Trials | Paper | 2024 | サブグループ別メタ回帰の partial-pooling が個別モデルより精度改善。代理指標×階層ベイズ | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10870489/ |

> 注: 項目6・7の著者名はアブストラクトで完全確認できず（retrieval 段階で照合推奨）。
