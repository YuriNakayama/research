# Halite IV — Imitation Learning by Semantic Segmentation

## 基本情報

- **コンペ**: [Kaggle Halite IV (Two Sigma)](https://www.kaggle.com/c/halite)
- **著者**: Kha Vo (voanhkha → khavo.ai へ移転)
- **オリジナル記事**: `https://voanhkha.github.io/2020/09/15/halite/` (2026-04 時点で 404, `khavo.ai/2020/09/15/halite/` にリダイレクト — 現在は接続不可)
- **アプローチ**: 盤面を画像として扱い、**semantic segmentation** 風に各セル行動を出力する BC

## アーキテクチャ要旨

（検索結果に基づく再構成）

- マップを 2D tensor とし、各セルに「自船/敵船/資源/空き/基地」等の feature channel を割当
- **U-Net / FCN 型**の segmentation ネットで、各セルに対し「該当ピクセルの船が取るべき行動クラス (北/南/東/西/停止/変換)」を per-pixel classification として出力
- 学習データは **トップチームの LB リプレイを継続的に収集** → 船ごとの状態/行動を画像化
- 1 試合 = 400 ターン ≒ 400 サンプルとなるため、数千試合で十分に generalize する

## 要所

1. **per-pixel 分類で全ユニットの行動を同時に出す**設計は、ユニット数可変・空間構造強い RTS に非常にマッチする。
2. 同時に全ユニットを処理できるため推論時間が一定で、Kaggle の厳しい秒数制限に強い。
3. 難点: segmentation では「誰が誰に向かうか」というグローバル協調を暗黙の空間 context に任せる。高レベルな艦隊展開には attention 系補助が必要なことが多い。

## 制限と改善の余地

- BC の本質的問題である **covariate shift**（自分の rollout が学習分布を外れた瞬間崩れる）はここでも発生
- 緩和策: DAgger, data aggregation, 予測 entropy に基づくフィルタリング
- ルール上 illegal なアクションのマスキングは推論時に手当て必要

## Orbit Wars への示唆（**最も強い推奨**）

Orbit Wars は
- 2D 連続空間（離散化しやすい）
- 惑星上に駐留艦隊という「空間上の状態」
- ユニット数可変（時間とともに艦隊が増減）

という特徴で **Halite IV の segmentation IL と相性が極めて良い**。

### 推奨ベースライン

```python
# 概念設計
input_tensor: [B, C, H, W]
  - C = {自軍艦隊量, 敵軍艦隊量, 惑星ID, 太陽引力場, 残り時間, …} ≈ 10–16
  - H x W = グリッド化した空間（例: 48x48）

model: U-Net or small ResUNet
output: [B, A, H, W]
  - A = {stay, send_to_N, send_to_E, …, explicit target embedding} ≈ 9–17
loss: masked cross-entropy (illegal action = -inf) + fleet-size 回帰 head
```

## 参考文献

- Kha Vo, "Imitation Learning by Semantic Segmentation for Multi-Agent Halite IV Competition" (2020): https://khavo.ai/2020/09/15/halite/ （接続不可のため Wayback 経由推奨）
- ttvand, Halite 1st place: https://github.com/ttvand/Halite
- 0Zeta, HaliteIV-Bot 4th place: https://github.com/0Zeta/HaliteIV-Bot
