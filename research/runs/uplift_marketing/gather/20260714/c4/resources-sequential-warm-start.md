# C4 リソース一覧: 逐次実験・warm-start による施策連結

- **Cluster**: C4 — Sequential / Warm-start Decision-making
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **対象**: 疎な施策列を逐次意思決定として繋ぐ。過去施策ログでbandit/RLをwarm-start、長期効果はsurrogate indexで短期proxyから補間。

## 概要

3スレッドを接続: (1) 過去施策ログからのbandit warm-start/初期化、(2) 疎なマーケ/市場参入を逐次実験として枠組み化、(3) surrogate index / proxy-metric blendingで短期proxyから長期効果推定。手法そのものより**施策間のlinking/transfer/warm-start文脈**を重視。

## リソース

| # | Title | Year | Venue | URL | Relevance |
|---|-------|------|-------|-----|-----------|
| 1 | Cutting to the Chase with Warm-Start Contextual Bandits | 2023 | KAIS (Springer) | https://link.springer.com/article/10.1007/s10115-023-01861-2 | **seed**。先行タスク/専門家事前/ルールベースからcontextual banditをwarm-start。新施策が旧施策を継承する形を直接モデル化。 |
| 2 | Warm-starting Contextual Bandits: Robustly Combining Supervised and Bandit Feedback | 2019 | arXiv:1901.00301 | https://arxiv.org/abs/1901.00301 | logged/supervised+bandit feedbackの混合から初期化するno-regret法。source-新施策の報酬分布ズレに頑健。 |
| 3 | Artificial Replay: Harnessing Historical Data in Bandits | 2022 | NeurIPS / arXiv:2210.00025 | https://arxiv.org/abs/2210.00025 | 任意base banditへ履歴logを注入するmeta-algorithm。spurious/不均衡coverageを回避。旧施策logからのwarm-startの汎用レシピ。 |
| 4 | Jump Starting Bandits with LLM-Generated Prior Knowledge | 2024 | arXiv:2406.19317 | https://arxiv.org/abs/2406.19317 | LLM模擬の選好事前でcold-start regretを削減。旧施策データが薄い場合の代替warm-start源。 |
| 5 | Sequential Learning in Designing Marketing Campaigns for Market Entry | 2020 | Management Science 66(9) | https://pubsonline.informs.org/doi/10.1287/mnsc.2019.3384 | **seed**。データ希少の市場参入施策設計を逐次ベイズ学習として枠組み化。疎施策linkingのマーケ正典。 |
| 6 | Deep RL for Sequential Targeting | 2023 | Management Science | https://pubsonline.informs.org/doi/10.1287/mnsc.2022.4621 | 「earn-while-learning」トレードオフで逐次targeting。反復マーケ決定が1つの逐次過程を成す様を提示。 |
| 7 | Budget-Constrained Causal Bandits: Bridging Uplift and Sequential Decision-Making | 2026 | arXiv:2604.26169 | https://arxiv.org/abs/2604.26169 | **seed**。uplift/HTE推定・探索・予算pacingを1オンライン過程に統合。新施策/市場/セグメントのcold-start動機。 |
| 8 | Confounded Budgeted Causal Bandits | 2024 | arXiv:2401.07578 | https://arxiv.org/abs/2401.07578 | 非一様介入コスト・交絡下の予算制約付き良介入学習。現実的施策制約へ拡張。 |
| 9 | Causal Bandits: Learning Good Interventions via Causal Inference | 2016 | NeurIPS / arXiv:1606.03203 | https://arxiv.org/abs/1606.03203 | 因果構造が良介入学習を加速する基礎論文（Lattimore et al.）。施策actionを因果介入として扱う概念的根。 |
| 10 | The Surrogate Index (Athey, Chetty, Imbens, Kang) | 2019 | NBER WP 26463 | https://www.nber.org/papers/w26463 | **seed**。複数短期proxyを合成しその効果が長期効果に一致。疎施策の遅い効果を短期proxyで早期推定する中核手法。 |
| 11 | Semiparametric Estimation of Long-Term Treatment Effects | 2021 | J. Econometrics / arXiv:2107.14405 | https://arxiv.org/abs/2107.14405 | surrogateからの長期効果の効率的semiparametric推定量（Chen & Ritzwoller）。surrogate indexの推定理論的裏付け。 |
| 12 | Blending Proxy Metrics with a North Star | 2026 | arXiv:2606.21745 | https://arxiv.org/abs/2606.21745 | **seed**。Netflix法。敏感proxyとnorth-starを最適blend、過去実験でblend重み・実験規模を設定。program横断のproxy linking。 |
| 13 | Choosing a Proxy Metric from Past Experiments | 2023/2024 | KDD / arXiv:2309.07893 | https://arxiv.org/abs/2309.07893 | 過去実験corpusのportfolio最適化で最適proxyを構築。旧施策programから将来施策のproxyを構築。 |

## retrieval への優先度

- **最優先**: #10 Surrogate Index（長期効果の早期推定）, #1 Warm-Start Contextual Bandits, #7 Budget-Constrained Causal Bandits
- **次点**: #3 Artificial Replay（履歴log注入）, #5 Sequential Learning Market Entry, #12 Blending Proxy Metrics
- **理論**: #11 Semiparametric Long-Term
