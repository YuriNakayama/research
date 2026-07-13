# Cluster 04: Planet Wars 既存事例 (planet_wars_prior_art)

## スコープ

Orbit Wars の源流と考えられる **Planet Wars / Galcon 系 RTS AI** の既存研究・コンペ事例を調査するクラスタ。ゲームメカニクス（惑星・艦隊・派遣）がほぼ同一であり、20年分の戦略知見が蓄積されている。

## 主要トピック

| トピック | 調査内容 |
|---------|---------|
| Google AI Challenge 2010 (Planet Wars) | 世界規模の AI bot 大会。上位解法の公開 post-mortem |
| SimonLucas/planet-wars-rts | GitHub の AI エージェント評価用 Planet Wars RTS 環境 |
| Galcon / Auralux 系商用ゲーム | UI や戦略ヒューリスティックの参考 |
| 学術研究 | Planet Wars を題材にした MCTS / Evolutionary / RL 論文 |
| 典型戦略 | expand-first, attack-rush, defensive hold, forward base, tempo play |
| 評価指標 | tempo, production rate, board control, unit efficiency |

## キーワード

- Planet Wars bot strategy
- Google AI Challenge 2010 Planet Wars winner
- Galcon AI
- SimonLucas planet-wars-rts
- MCTS Planet Wars
- RTS tempo strategy

## 想定リソース種別

- Google AI Challenge 2010 post-mortem blog 群（上位選手の解説）
- GitHub: 歴代 Planet Wars bot OSS 実装
- 学術論文（IEEE CIG / AAAI-AIIDE で Planet Wars を対象にしたもの）
- Wiki: Galcon / Auralux 攻略記事

## 他クラスタとの関係

- **→ heuristic_search**: Planet Wars で強かったヒューリスティック（特に 2010 年代のルールベース bot）は cluster 06 の具体策となる
- **→ game_mechanics**: 従来の Planet Wars と Orbit Wars（連続 2D + 軌道力学）の差分を明確化
- **→ rl_methods**: OrbitZoo 等の軌道力学 RL 研究と接続

## 優先度

**中**。Orbit Wars が「軌道付き Planet Wars」なら、ここでの既存知見は強力なベースライン設計のヒントになる。ただし軌道力学が加わることで古典戦略の転用可能性は要検証。
