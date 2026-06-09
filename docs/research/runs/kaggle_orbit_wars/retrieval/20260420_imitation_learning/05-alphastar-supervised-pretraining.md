# AlphaStar — Supervised Pretraining from Human Replays

## 基本情報

- **論文**: Vinyals et al., "Grandmaster level in StarCraft II using multi-agent reinforcement learning", Nature 2019
- **論文URL**: https://www.nature.com/articles/s41586-019-1724-z
- **公式解説**: https://deepmind.google/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning/
- **PDF**: https://storage.googleapis.com/deepmind-media/research/alphastar/AlphaStar_unformatted.pdf

## 概要

AlphaStar は StarCraft II で **人間グランドマスター超え**を達成した DeepMind の agent。訓練は **2 段階**：

1. **Supervised Learning (IL)** — Blizzard 提供の 971,000 リプレイ (MMR > 3500, 上位 22%) を用いて人間行動を模倣
2. **League-based Multi-Agent Reinforcement Learning** — SL agent を初期値とした population-based self-play

**SL 単体でも上位 16% 相当**（ELO 3699, 人間の 84%tile 超）の強さに達したのが重要ポイント。

## SL phase の設計詳細

### アーキテクチャ

- 総パラメータ 1.39 億（推論時は 5500 万）
- **Transformer core** + **LSTM** + **pointer networks**（ユニット選択のため）
- entity encoder（各ユニットを token として扱う）と spatial encoder を統合

### 学習対象

- **マクロ戦略**（生産順、拡張 timing）と **マイクロ**（ユニット制御）の両方を暗黙学習
- 意思決定 (action type) + 選択ユニット + 選択位置 + delay を hierarchical に予測

### データ前処理

- 負けゲーム含む（人間の悪手も学習）が、勝率で weighting
- ユニット情報は entity list として可変長 → Transformer 入力

## League Training（RL phase）

SL agent から 3 系統を増やす:
- **Main Agent**: 通常の勝利目標
- **Main Exploiter**: 他 agent を倒すことに特化
- **League Exploiter**: リーグ全体の穴をつく

この 3 系統間のマッチングと Population-Based Training (PBT) で多様性を維持。

## Orbit Wars への示唆

Orbit Wars は StarCraft よりはるかに小さいが、設計哲学は移植可能:

1. **SL 単体で既に強い基準を作ってから RL へ**というフェーズ分けは、Kaggle の限られた学習時間でも妥当
2. **Entity Transformer**（各惑星・各艦隊を token として扱う）は Orbit Wars の可変ユニット数問題をクリーンに解く
3. **League 訓練はフル規模は不要**だが、2–3 agent 間の non-transitivity を避けるため最低 2 系統は持つと安定
4. **pointer network**（「どの艦隊を動かすか」の選択）は多艦隊制御の標準手法

## 実装時の注意

- SL 単体での 16% tile 到達には 971k リプレイが必要。Orbit Wars では **Kaggle で同数を集めるのは非現実的** → 上位 50–100 bot × 数百エピソード程度 (数万サンプル) が現実線
- 代わりに **data augmentation（対称性、時系列 subsampling）** と **BC + self-play 自作データ**で補う

## 参考文献

- Vinyals et al., Nature 2019: https://www.nature.com/articles/s41586-019-1724-z
- Wang et al., "SCC: an Efficient Deep RL Agent for Mastering StarCraft II" (2020): https://arxiv.org/pdf/2012.13169
- kimbring2/AlphaStar_Implementation (再現実装): https://github.com/kimbring2/AlphaStar_Implementation
