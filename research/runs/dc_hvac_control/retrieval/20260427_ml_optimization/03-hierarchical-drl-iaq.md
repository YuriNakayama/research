# 03. Hierarchical DRL for Year-Round HVAC + IAQ Optimization

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | Year-round operational optimization of HVAC systems using hierarchical deep reinforcement learning for enhancing indoor air quality and reducing energy consumption |
| 著者 | Liao, Chenxin; Miyata, Shohei; Qu, Ming; Akashi, Yasunori |
| 所属 | University of Tokyo（Miyata, Akashi）, Purdue University（Qu） |
| 出版年 | 2025 |
| 掲載誌 | Applied Energy, Volume 390 |
| URL | https://www.sciencedirect.com/science/article/abs/pii/S030626192500546X |

## 研究の位置付け

**通年運用** および **室内空気質 (IAQ) と省エネの同時最適化** を、階層型 DRL アーキテクチャで実現した研究。建物が 2050 年に世界エネルギー需要の 30% 超を占める見通しの中、換気量増 → IAQ 改善 ↔ 消費増のトレードオフを動的に解く設計。

## 手法

- **階層型エージェント構成**:
  - **Bottom Agent**: ファン・ポンプの周波数制御（短時間スケール）
  - **Top Agent**: 外気条件に基づく日次運転モード選択（長時間スケール）
- **シミュレーション**: Python ベースの HVAC モデル + 5R2C 熱モデル（分単位制御シミュレーション）
- **報酬設計**: エネルギー消費 + 温熱快適性 + IAQ（CO₂ 濃度等）の多目的

## 主要な結果

- 通年（春夏秋冬）運用で **省エネ + IAQ 改善を同時達成**
- フラットな単一エージェント DRL より **時間スケール分離による学習効率向上**
- 季節遷移時のモード切替が円滑

（具体的な数値は出版社ページのアクセス制限により本文未確認。論文題目および要旨レベルでの記述）

## 意義

- 換気量制御が省エネと逆方向に働く問題を、**階層構造で時間スケール分離**することで解決。
- ポストコロナ時代の IAQ 重視トレンドを反映した、運用に近い目的関数設計。
- 5R2C 熱モデルは比較的軽量で、実装移植性が高い。

## 限界

- シミュレーションのみで、実建物検証は未報告。
- 5R2C モデルの汎化性（建物タイプへの感度）は本文を要確認。
- 階層エージェント間の通信コスト・収束保証は本文要確認。

## 関連事例

- [04](./04-drl-vs-ashrae-g36.md): 同様に CO₂ 制御を扱う多ゾーン DRL
- [05](./05-hvac-dpt-transformer.md): in-context RL による軽量化アプローチ
