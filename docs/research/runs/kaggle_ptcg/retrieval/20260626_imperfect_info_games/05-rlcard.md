# 05 RLCard — カードゲーム RL ツールキット

## メタ情報

| 項目 | 内容 |
|------|------|
| タイトル | RLCard: A Toolkit for Reinforcement Learning in Card Games |
| 著者 | Daochen Zha, Kwei-Herng Lai, Yuanpu Cao, Songyi Huang, Ruzhe Wei, Junyu Guo, Xia Hu（Texas A&M / DATA Lab） |
| 公開 | arXiv:1910.04376（2019-10-10、改訂 2020-02-14）、AAAI-20 Workshop on RL in Games |
| arXiv | https://arxiv.org/abs/1910.04376 |
| GitHub | https://github.com/datamllab/rlcard |
| 公式 Doc | https://rlcard.org/ ／ ライセンス MIT |

## 概要

**不完全情報カードゲームと強化学習を橋渡しする** OSS ツールキット。カードゲーム固有の難しさ（複数エージェント・巨大な状態/行動空間・希薄な報酬）を研究プラットフォームとして扱えるよう、統一 API・実装済みアルゴリズム・評価ツールを提供。設計原則は Reproducibility / Accessibility / Scalability の3点。

## 手法の核心

### 対応ゲーム（論文時点 + リポジトリ拡張）

| Game | State space | Action space | Players |
|------|-------------|--------------|---------|
| Blackjack | 10³ | 10⁰ | 1 |
| Leduc Hold'em | 10² | 10⁰ | 2 |
| Limit Texas Hold'em | 10¹⁴ | 4 actions | 2 |
| No-Limit Texas Hold'em | 10¹⁶² | 10⁴ | 2 |
| Dou Dizhu | 10⁵³–10⁸³ | 生27,472手→抽象化309 | 3 |
| Mahjong | 10¹²¹ | 38 actions | 4 |
| UNO | 10¹⁶³ | 61 actions | 2 |
| Gin Rummy | 10⁵² | 110 actions | 2 |
| Bridge | – | 91 actions | 4 |

> ⚠️ 桁表記（10ⁿ）は論文/README の概算で、rlcard.org の action 数表記と粒度が異なる。両者併記。厳密 obs 次元はソース確認推奨。

### 実装アルゴリズム

- **DQN**（価値ベース、離散行動・単一エージェント向け）
- **NFSP**（不完全情報マルチエージェントで近似ナッシュ均衡）
- **CFR**（表形式、Leduc 等小規模向け）
- **DMC（Deep Monte-Carlo）**（DouZero 由来。Dou Dizhu のような巨大行動空間に有効。後にリポジトリ統合）
- Random / Rule-based / Pre-trained Models

### 統一 API（`Game` / `Env` の2層抽象）

```python
env = rlcard.make(env_id, config={})
state, player_id = env.reset()
next_state, next_player_id = env.step(action)
payoffs = env.get_payoffs()
```

### 不完全情報の表現

state は辞書: `state['obs']`（そのプレイヤー視点で観測可能な情報のみ、隠れ情報は含めない）、`state['legal_actions']`（合法手インデックス）、`raw_obs`/`raw_legal_actions`（人間/ルールベース向け生表現）。例（Dou Dizhu）: 6枚のカードプレーン（自分の手札・他2名の手札の和・直近3手・既出の和）、各組合せは 4×15 one-hot 行列。

## 主要な結果 / 提供物

- 統一 API + 複数の不完全情報・マルチエージェント環境、実装済みアルゴリズム + 事前学習モデル、トーナメント/対 random/対 rule-based 評価、人間プレイ UI、可視化 GUI（RLCard-Showdown）、PettingZoo 互換。
- 知見: DQN/NFSP は UNO・Mahjong・Dou Dizhu のような大規模空間では学習改善がわずかで、研究上の難問であることを示す。

## Pokémon TCG AI Battle Challenge への示唆

- **最短で環境ラッパ・ベースライン・評価を立ち上げる雛形**: `Game`/`Env` 2層、`reset/step/get_state/get_payoffs`、`obs`+`legal_actions` 辞書 state をそのまま設計テンプレに。cabt を `Game` 層に置き RLCard 風 `Env` を被せる。
- **PTCG を RLCard 風 env として定義**: obs は「自分視点で観測可能な情報のみ」（盤面・トラッシュ・自分の手札・既知プライズ等）、`legal_actions` に cabt の合法手を整数 index で詰める、報酬は勝敗（sparse、RLCard が明示する難所と同型）。DQN/NFSP/DMC をほぼ無改造で接続可能。
- **DMC が大規模行動空間に効く**: PTCG は1ターン内連鎖（ドロー・サーチ・進化・エネルギー付け・技選択）で行動空間が爆発しがち。Dou Dizhu（生27,472手）を DMC/DouZero が攻略した実績は、PTCG でも **DMC（行動を特徴量エンコードし Q を回帰）が第一候補** であることを示唆（→cluster-05）。
- **評価設計の流用**: 対 random/対 rule-based トーナメント、事前学習モデル動物園を PTCG ボットのリーグ評価に転用。

## 限界・注意

- **評価の落とし穴**: 著者自身が「対 random は傾向把握用で、アルゴリズム評価には不十分」と明言。対 random 勝率を最終指標にしない（exploitability/対強豪/自己対戦評価が必要）。
- **大規模空間での学習困難**: DQN/NFSP は UNO/Mahjong/Dou Dizhu で改善わずか。DMC や報酬整形・カリキュラム併用が前提。
- **PTCG は非対応**: env は自前実装必須。PTCG 固有ルール（進化・特性・トラッシュ・サイド・状態異常・コイントス）を `Game` 層へ正確に落とす工数が最大の障壁。
- **抽象化の代償**: 行動抽象化（27,472→309）は実用化の一方で表現力を損なう。

## 出典

- arXiv:1910.04376 — https://arxiv.org/abs/1910.04376 ／ ar5iv: https://ar5iv.labs.arxiv.org/html/1910.04376
- GitHub: https://github.com/datamllab/rlcard ／ Doc: https://rlcard.org/games.html
- 関連 DMC: DouZero — https://github.com/kwai/DouZero ／ arXiv:2106.06135
