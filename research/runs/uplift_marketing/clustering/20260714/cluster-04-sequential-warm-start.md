# Cluster 4: 逐次実験・warm-start による施策連結（Sequential / Warm-start Decision-making）

## Overview

「数ヶ月に1度」という疎な施策列を、独立イベントではなく**逐次的な意思決定過程**として繋ぐ領域。過去施策のログで bandit / RL を warm-start し cold-start を緩和する。効果が長期（購買LTV等）で観測が遅い問題には surrogate index で短期指標から長期効果を補間し、疎な施策でも早期に学習を回せるようにする。手法（RL/OPE）そのものではなく、**「過去施策の情報で次施策を初期化・接続する」運用文脈**に絞る。

## Keywords

`warm-start contextual bandit`, `sequential experimentation`, `market entry sequential learning`, `causal bandits`, `budget-constrained causal bandits`, `surrogate index`, `long-term effect from short-term proxies`, `proxy / north-star metric blending`, `logged data warm-start`, `prior campaign initialization`, `non-stationary policy`, `transfer across bandit tasks`, `experimentation program optimization`

## Research Strategy

- **warm-start**: Cutting to the chase with warm-start contextual bandits（Springer 2023）— 教師あり/先行bandit/専門家事前分布など任意の先行学習で bandit を初期化。過去施策ログの活用形。
- **長期効果の補間**: Surrogate Index（Athey-Chetty-Imbens, NBER w26463）— 短期proxyを合成し長期効果を素早く高精度に推定。施策間隔が長くても短期指標で早期学習が可能に。関連: Blending Proxy Metrics with a North Star（arXiv:2606.21745）。
- **市場参入の逐次学習**: Sequential Learning in Designing Marketing Campaigns for Market Entry（Management Science）— 新製品/新母集団でデータが乏しい状況の逐次設計。ユーザーの「対象が毎回変わる」に対応。
- **因果bandit**: Budget-Constrained Causal Bandits（uplift と逐次意思決定の橋渡し）。

### 推奨クエリ

```
"warm-start contextual bandit logged data"
"sequential learning marketing campaign market entry"
"surrogate index long-term treatment effect"
"causal bandit budget constrained uplift"
"blending proxy metric north star experimentation"
```

## Seed Resources

| Title | Year | Type | Link |
|-------|------|------|------|
| Cutting to the chase with warm-start contextual bandits | 2023 | Paper | https://link.springer.com/article/10.1007/s10115-023-01861-2 |
| The Surrogate Index (Athey, Chetty, Imbens) | 2019 | Paper | https://www.nber.org/papers/w26463 |
| Sequential Learning in Designing Marketing Campaigns for Market Entry | 2020 | Paper | https://dl.acm.org/doi/abs/10.1287/mnsc.2019.3384 |
| Budget-Constrained Causal Bandits | 2026 | Paper | https://arxiv.org/pdf/2604.26169 |

## ユーザー課題への適用

各施策を「前の施策で学んだ事前分布を引き継ぐ逐次ステップ」として設計すれば、施策間隔の長さそのものを緩和できる。さらに surrogate index で長期購買効果を短期反応から推定すれば、次施策まで数ヶ月待たずに学習を更新できる。**施策運用プログラム全体の最適化**という上位視点を与える。
