# 07. Heterogeneous Expert-Guided RL with Runtime Shielding

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | Efficient and assured reinforcement learning-based building HVAC control with heterogeneous expert-guided training |
| 出版年 | 2025（3月） |
| 掲載誌 | Scientific Reports (Nature) |
| URL | https://www.nature.com/articles/s41598-025-91326-z |

## 研究の位置付け

DRL の **訓練効率と安全性** という、実用化の二大障壁を同時に解く論文。複数の異種専門家（rule-based, MPC, 別 RL など）からのガイダンスを統合し、ランタイム時の安全シールド（runtime shielding）で逸脱を防ぐ枠組みを提案。

## 手法

- **オンライン DRL 訓練** + **異種専門家ガイダンス**
- **Runtime Shielding**: 訓練・運用中の不安全行動をフィルタ
- 使用 RL アルゴリズム例: DQN, A3C, DDPG, PPO

## 主要な結果

- 訓練サンプル効率の改善
- 制約違反（快適範囲逸脱、ハードウェア限界超過など）の抑制
- 異種専門家の知見を組み合わせることで、単一専門家を超える性能

（数値の詳細は本文要確認）

## 意義

- 従来「RL は理論的に良いが、訓練中の暴走が怖くて実建物には載せられない」という障壁に対し、**安全シールド付きの実用的訓練フレームワーク**を提示。
- ハイブリッド学習（rule-based + RL、MPC + RL）の流れに沿う。

## 限界

- どの程度の専門家品質が必要か（poor expert でも有効か）の感度分析が要点。
- ランタイム シールドが過度に保守的になると探索が阻害されるトレードオフ。

## 関連事例

- [02](./02-rl-mpc-field-comparison.md): MPC と RL を独立に比較した実証
- [05](./05-hvac-dpt-transformer.md): in-context RL による別の効率化アプローチ
