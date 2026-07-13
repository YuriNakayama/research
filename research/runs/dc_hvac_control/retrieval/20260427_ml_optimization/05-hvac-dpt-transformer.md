# 05. HVAC-DPT: Decision Pretrained Transformer for HVAC Control

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | HVAC-DPT: A Decision Pretrained Transformer for HVAC Control |
| 著者 | Anaïs Berkes |
| 所属 | Department of Computer Science & Technology, University of Cambridge |
| 出版年 | 2024（arXiv） |
| arXiv | 2411.19746 |
| URL | https://arxiv.org/html/2411.19746v1 |

## 研究の位置付け

**HVAC 制御に Decision Pretrained Transformer (DPT) を適用した最初期の研究**。In-context Reinforcement Learning により、デプロイ時にパラメータ更新なしで未知の建物に適応可能なエージェントを実現した。トランスフォーマーアーキテクチャが HVAC ドメインに有効であることを示した先駆的事例。

## 手法

- **モデル**: GPT-2 ベース、3層、8 attention heads、128 次元埋め込み
- **訓練データ**: 多様な PPO エージェントの相互作用履歴（複数建物で訓練済み）
- **訓練規模**: 100 trajectories × 118 epochs
- **アプローチ**: 系列予測タスクの教師あり事前学習 → in-context での policy 微調整（パラメータ更新なし）
- **シミュレーション**: EnergyPlus（小規模オフィスプロトタイプで訓練、中規模オフィスプロトタイプで評価）

## 主要な結果

| 指標 | 値 |
|------|---|
| **未知建物での省エネ率（ベースライン比）** | **45%** |
| 専門家設計コントローラとの差 | -5%（HVAC-DPT がやや劣後） |
| MARL/SARL ベースラインとの差 | **+70-74%（HVAC-DPT が優位）** |
| 評価建物 | 中規模オフィスプロトタイプ（15 ゾーン、~5,000 m²） |
| 訓練建物 | 小規模オフィスプロトタイプ（5 ゾーン、~511 m²） |

## 意義

- **転移学習の革新**: 従来の DRL は新建物ごとに数百〜数千エピソードの再訓練が必要だが、DPT はゼロショット/フューショット適応が可能。
- **アーキテクチャの転用可能性**: GPT-2 規模の小さなモデルでも HVAC タスクに有効。
- **MARL/SARL を 70%以上上回る** 結果は、サンプル効率の劇的な改善を示す。

## 限界

- **シミュレーションのみ**: EnergyPlus での評価のみで、実建物検証なし。
- **単一気候**: コロラド州デンバーのみ。気候多様性への汎化未検証。
- **建築多様性**: 訓練・評価とも「オフィスプロトタイプ」のみ。住宅、病院、工場などへの転用は未検証。
- **データ依存**: 多様な PPO エージェントの履歴が必要 → 初期訓練コストは高い。

## 意義の再評価

DPT のアプローチが成功すれば、**HVAC 制御の "foundation model" 構想**が現実味を帯びる。各建物オーナーが個別に RL を訓練するのではなく、共通基盤モデルを in-context で適応させるエコシステムが想定できる。

## 関連事例

- [06](./06-pillm-llm-anomaly.md): LLM の HVAC 異常検知応用
- [07](./07-expert-guided-rl-shielding.md): 訓練効率改善の別アプローチ（専門家ガイダンス）
