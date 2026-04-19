# Resources: planet_wars_prior_art

Orbit Wars の直接の源流となる **Planet Wars 系** 既存事例。2010 年 Google AI Challenge から最新 GECCO 2025 competition まで、15 年分のノウハウ。

## Google AI Challenge 2010 — Planet Wars（歴史的原点）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **Planet Wars Post-Mortem (winner bocsimacko)** | http://quotenil.com/Planet-Wars-Post-Mortem.html | Blog | **優勝者 Gábor Melis (Franz Inc.) による詳細解説**。必読 |
| 2 | melisgl/planet-wars (winning bot Lisp) | https://github.com/melisgl/planet-wars | GitHub | 1st place ソースコード（Common Lisp） |
| 3 | Planet Wars strategy | http://satirist.org/ai/planetwars/strategy.html | Blog | 歴代上位解の戦略概念カタログ |
| 4 | Playing styles of some Planet Wars bots | http://satirist.org/ai/planetwars/playing-styles.html | Blog | 上位 bot のプレイスタイル類型化 |
| 5 | Planet Wars 2010 and followup | https://satirist.org/ai/planetwars/ | Index | 総合リンク集 |
| 6 | Two bots for Planet Wars AI Challenge 2010 | http://zvold.blogspot.com/2010/12/two-bots-for-planet-wars-ai-challenge.html | Blog | 参加者 zvold による 2 bot 比較 |
| 7 | Benzedrine post-mortem | https://www.benzedrine.ch/planetwars.html | Blog | 別参加者の解法 |
| 8 | First AI Contest part 1 (iq-games) | http://iq-games.blogspot.com/2011/02/planet-wars-my-first-ai-contest.html | Blog | 入門者視点 |
| 9 | Lisp Bot Wins Google AI Challenge | https://www.dataversity.net/lisp-bot-wins-google-ai-challenge-will-lisp-win-in-the-semantic-web-too/ | Article | 当時のニュース |
| 10 | AI Challenge Forums (Fall 2010) | http://forums.aichallenge.org/viewforum.php?f=16 | Forum | 参加者議論ログ |
| 11 | Franck-Dernoncourt/planet-wars | https://github.com/Franck-Dernoncourt/planet-wars | GitHub | 参加者の starter + bot |
| 12 | Wallsays/planet-wars | https://github.com/Wallsays/planet-wars | GitHub | 同上 |
| 13 | Planet Wars Starter Package | https://xtevenx.github.io/planet-wars-starterpackage/ | Website | 公式 starter kit |
| 14 | Franz.com Planet Wars webinar | https://franz.com/services/conferences_seminars/webinar_1-20-11.gm.pdf | PDF | 優勝者 Melis による講演 |

## Simon Lucas Planet Wars RTS（Game AI 研究プラットフォーム）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 15 | **SimonLucas/planet-wars-rts** | https://github.com/SimonLucas/planet-wars-rts | GitHub | 研究用 Planet Wars エンジン、1M ticks/sec |
| 16 | Game AI Research with Fast Planet Wars Variants (arXiv:1806.08544) | https://arxiv.org/abs/1806.08544 | IEEE CIG 2018 | MCTS / Rolling Horizon Evolution 比較 |
| 17 | Planet Wars RTS — AI Competition | https://simonlucas.github.io/planet-wars-rts/ | Website | 公式競技サイト、fully/partially observable モード |
| 18 | **GECCO 2025 Planet Wars AI Challenge** | https://gecco-2025.sigevo.org/Competition?itemId=5108 | Competition | 最新の Planet Wars コンペ |
| 19 | Simon Lucas publications | https://researchpublications.qmul.ac.uk//publications/staff/41039.html | Index | QMUL 教授の論文リスト |
| 20 | Lucas 2018 PDF | https://arxiv.org/pdf/1806.08544 | PDF | 論文本文 |

## 学術論文 — Planet Wars AI

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 21 | Optimizing Planet Wars bot using an immune-based algorithm | https://www.researchgate.net/publication/331854022 | Paper | 進化計算による bot パラメータ最適化 |
| 22 | Naive Sampling for MCTS in RTS | — | Paper (参照) | 巨大分岐因子への対処。Planet Wars に直接適用可 |
| 23 | A Survey of Monte Carlo Tree Search Methods | http://www.incompleteideas.net/609%20dropbox/other%20readings%20and%20resources/MCTS-survey.pdf | Survey | MCTS の 2012 総説 |
| 24 | MCTS: a review of recent modifications | https://link.springer.com/article/10.1007/s10462-022-10228-y | Springer | 2022 最新レビュー |
| 25 | Monte-Carlo Tree Search (Winands) | https://dke.maastrichtuniversity.nl/m.winands/documents/Encyclopedia_MCTS.pdf | Encyclopedia | MCTS 百科事典項目 |

## Melis 優勝解法の要点メモ

1. **Multi-planet synchronized attacks** — step target を使って複数惑星からの同着攻撃を計画
2. **Sniping awareness** — 「中立を奪いに行く相手の後ろから取る」戦術に evaluation function で対処
3. **Ship redistribution** — 艦の惑星間再配分を明示的に最適化
4. **Risk-reduced trade-down** — 優勢時に「取引で互いに減らす」行動を加点、tactical miss の期待損失を減らす
5. **1-second hard cap / 200 turns** — 2010 版は 1 手 1 秒・200 turn（**Orbit Wars は 1 秒・500 turn で近い構造**）

## Orbit Wars への移植性

| 既存知見 | Orbit Wars での有効性 | 備考 |
|---------|---------------------|------|
| Multi-planet synchronized attacks | ◎ | tie → 全滅ルールと合わせて最重要 |
| Sniping awareness | ◎ | 中立 / コメットの取り合いは Orbit Wars でも発生 |
| Ship redistribution | ◯ | 連続 2D + 軌道で経路計画が複雑化、軌道予測必須 |
| 1手1秒 MCTS / evolutionary planning | ◯ | Lucas の 1806.08544 論文が直接参考 |
| 評価関数（production bias 等） | ◎ | production 1-5 の非線形性は同じ構造 |
