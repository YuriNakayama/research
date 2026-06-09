# Cluster 02: ゲームメカニクス (game_mechanics)

## スコープ

Orbit Wars 固有の **ゲーム物理・ルール・状態空間** を理解するクラスタ。エージェントが「何を観測し、何を決定し、何によって勝つのか」を明文化する。

## 主要トピック

| トピック | 調査内容 |
|---------|---------|
| 空間モデル | 連続 2D 空間、座標系、境界条件（無限 or 有限） |
| 軌道力学 | 太陽 1 個の周りを惑星が公転、軌道が固定か動的か、重力モデル |
| ユニット | 艦隊/船/兵力の表現、生産レート、惑星ごとの収容量 |
| アクション | 移動・攻撃・防衛・艦隊分割、行動の連続 or 離散、同時手番か交互か |
| 観測 | 視界の制限有無 (fog of war)、観測ベクトルの次元 |
| 勝利条件 | 全惑星占領、タイムリミット、スコア差、撤退条件 |
| プレイヤー数 | 2P / 4P 切替、4P 時のチーム制の有無、手番処理 |
| タイムステップ | tick 長、1 ゲームの総 tick 数、リアルタイム性 |

## キーワード

- Orbit Wars mechanics / physics / simulator
- Planet Wars continuous space
- Orbital dynamics RTS
- Fleet dispatch game
- Real-time strategy 2D

## 想定リソース種別

- コンペ公式ルール PDF / Markdown
- 公式シミュレータのソースコード（Python / Kaggle environments）
- 主催者ブログでのゲームデモ動画
- 類似ゲーム（Galcon, Auralux, planet-wars-rts）のメカニクス解説

## 他クラスタとの関係

- **← competition_spec**: 仕様書からメカニクスを抽出
- **→ rl_methods / heuristic_search**: 観測/行動空間の形が手法選択（離散/連続アクション、stateless/stateful）を決める
- **→ planet_wars_prior_art**: 連続空間化・軌道化により従来 Planet Wars からどう違うかを比較

## 優先度

**高**。cluster 01 と並行で深掘りし、手法設計（cluster 05/06）の前提を固める。
