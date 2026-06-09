# 01. RL for HVAC Control in Residential Buildings with BOPTEST + Real-Case Validation

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | Reinforcement learning for HVAC control and energy efficiency in residential buildings with BOPTEST simulations and real-case validation |
| 出版年 | 2025 |
| 掲載誌 | Discover Computing (Springer Nature) |
| DOI | 10.1007/s10791-025-09544-y |
| URL | https://link.springer.com/article/10.1007/s10791-025-09544-y |

## 研究の位置付け

住宅用 HVAC 制御における強化学習の **シミュレーション + 実建物検証** を組み合わせた研究。BOPTEST (Building Optimization Performance Test) フレームワーク上で訓練した RL エージェントを、モロッコ・メクネスの実住宅で検証し、省エネと快適性の両面で従来 PI 制御を上回ることを示した。

## 手法

- **シミュレーション環境**: BOPTEST（EnergyPlus + Modelica ベースの標準テストベッド）
- **ベースライン**: 従来の比例積分（PI）コントローラ
- **エージェント**: Deep Reinforcement Learning（具体的アルゴリズムは DDPG/PPO 系）
- **観測量**: 室温、外気温、占有状態、エネルギー消費
- **報酬**: エネルギー消費削減 + 温熱快適性逸脱ペナルティ
- **実証**: モロッコ・メクネス市の実住宅（地中海気候）での運用試験

## 主要な結果

| 指標 | 値 |
|------|---|
| シミュレーション省エネ率 | **最大 26.3%**（PI 制御比） |
| 実建物検証 | 適応性確認（具体的数値は実環境条件下） |
| 快適性 | 同等以上を維持 |

## 意義

- BOPTEST という **再現可能なベンチマーク**で訓練したエージェントが、**異なる気候条件の実住宅にデプロイ可能**であることを示した。
- 「sim で 26.3%」が実環境で完全には再現されない点は、その後のレビュー論文（[09](./09-field-demo-review.md)）で指摘される「sim-to-real ギャップ」の典型例として位置付けられる。

## 限界

- 単一の住宅のみで検証されており、建物多様性（Multi-building generalization）には言及されていない。
- 訓練に必要な計算コスト・時間は本文で詳述されていない可能性が高い。
- 実建物では HVAC ハードウェアの応答遅延や非線形性が sim と異なるため、長期運用での性能持続性は未検証。

## 関連事例

- [02](./02-rl-mpc-field-comparison.md): RL vs MPC の実建物比較
- [04](./04-drl-vs-ashrae-g36.md): 商業ビル多ゾーンでの ASHRAE 比較
- [09](./09-field-demo-review.md): フィールド実証レビュー
