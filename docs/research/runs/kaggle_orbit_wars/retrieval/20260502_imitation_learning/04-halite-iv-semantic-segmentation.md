# 04. Halite IV — Semantic Segmentation 方式の Imitation Learning

## ソース

- khavo の Imitation Learning by Semantic Segmentation: https://khavo.ai/2020/09/15/halite/
- ttvand の 1st place solution: https://github.com/ttvand/Halite
- Halite IV competition: https://www.kaggle.com/c/halite

## なぜ参考になるか

Halite IV は Orbit Wars と異なり **2D グリッドマップ上の RTS** だが、`per-cell action prediction` の発想は entity-pointer 方式の代替案として知られている。Orbit Wars は entity 中心のため直接適用は不向きだが、**比較対象として理解すべき**。

## Semantic Segmentation 方式 (khavo)

各 cell について「ship がここで何をするか」を分類する **per-pixel classification** タスクとして定式化:

```
input: H x W x C (board state, multi-channel)
output: H x W x A (per-cell action probabilities)
   A = {NORTH, SOUTH, EAST, WEST, STAY, CONVERT, ...}
```

CNN (U-Net 系) で encoder-decoder。**各 ship の位置 cell の action を予測**。

```python
# Architecture
encoder = ResNet50  # 入力 board feature
decoder = UNet      # 出力 H x W x action_dim
loss = sum over ship-cells: cross_entropy(pred[cell], gold[cell])
```

### メリット
- Spatial context を CNN が自動学習
- 全 ship の action を 1 forward で予測（並列性最高）
- 実装シンプル

### デメリット
- **連続値出力 (Halite の amount) は離散ビン化必須**
- Cell 単位なので「action 間の依存性 (例: 同じ target に複数 ship が向かう調整)」は捉えにくい
- グリッドベースゲーム特有

## ttvand の 1st place 手法（参考）

ttvand の 1位解は完全な BC ではなく、**rule-based + ML hybrid**。重要な決定（spawn / convert / attack base）は **ヒューリスティクスが ML をオーバーライド**する設計。

### 教訓: Critical Decisions are Hard-coded

khavo も note している:
> "fine-tuned heuristics on key policies such as base spawning, ship converting, and base protecting, which directly override the model outputs when needed"

**Orbit Wars 適用**: 
- 「最後の 1 planet を失わない」「援軍の到着時刻計算」「comet 接触の予測」のような **状態遷移が決定的に分かる場面** はヒューリスティクスで上書き
- ML は「平均的な好手」を学ぶ、ヒューリスティクスが「致命的なミスを防ぐ」

## Per-cell vs Per-entity の比較

| 観点 | Per-cell (Halite) | Per-entity (Orbit Wars 推奨) |
|-----|-----------------|----------------------------|
| 入力 | dense 2D grid | sparse entity list |
| 出力 | H × W × A | per-entity 3-head |
| 適合ゲーム | グリッドベース (Halite, Lux) | エンティティベース (StarCraft, Orbit Wars) |
| 並列性 | 1 forward で全 cell | per-entity decoder（バッチ化可） |
| 可変サイズ対応 | ◎ CNN は任意サイズ | ◎ Transformer + mask |
| 計算量 | O(H×W) | O(N) where N=entity 数 |

**Orbit Wars は per-entity が圧倒的に適合**:
- planet 数 5-40 個に対して 100×100 grid を CNN で処理するのは無駄
- 軌道運動で planet が動くのでグリッド固定化が困難

## ハイブリッド: Spatial Map + Entity Pointer

Kore 2022 1位 (khanhvu207) はこのハイブリッドを採用:
- **Spatial encoder (CNN) で大まかな分布を捉え**
- **Entity decoder で個別 entity の action を生成**

Orbit Wars 適用案:
1. **基本は entity-only**（前述の通り）
2. **必要なら "polar map" を追加**: 太陽中心の極座標で planet 分布を粗くマッピング → CNN で「全体的な力場」を encode
3. ただし最初は entity transformer のみで試し、性能不足を観測してから追加

## まとめ

| 教訓 | Orbit Wars への適用 |
|------|------------------|
| Per-cell 方式は spatial 強いが entity 数可変ゲームに非効率 | **採用しない** |
| Critical decision のルールベース上書きは効果的 | **採用**: 終盤・comet・援軍計算は heuristics で固定 |
| Multi-modal (spatial + entity) は強い | 必要に応じて polar map を追加検討 |
| 教師データの質 > 量 | top-N self-play から強い games だけ抽出 |
