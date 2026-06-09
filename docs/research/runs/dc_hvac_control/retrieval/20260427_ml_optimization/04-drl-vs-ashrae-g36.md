# 04. DRL for Low-Level HVAC Control vs ASHRAE G36 (Politecnico Torino)

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | Deploying deep reinforcement learning for low-level HVAC control in multi-zone buildings: A comparative study with ASHRAE G36 sequences |
| 著者 | Sabrina Savino, Giuseppe Razzano, Michele Pagone, Carlo Novara, Alfonso Capozzoli |
| 所属 | Polytechnic University of Turin (Politecnico di Torino), DENERG |
| 出版年 | 2025 |
| 掲載誌 | Energy and Buildings (ScienceDirect) |
| SSRN | https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5339160 |
| URL | https://www.sciencedirect.com/science/article/pii/S0378778825011867 |

## 研究の位置付け

**ASHRAE Guideline 36 という業界標準シーケンス**を厳密なベースラインに据え、DRL を **AHU の低レベル制御**（空気・水ループの全コンポーネント）に適用した実用志向の研究。多ゾーン相互作用を含む現実的設定で、業界標準を上回ることを示した点が新規。

## 実験設定

- **建物**: Politecnico di Torino キャンパス内教育棟
- **ゾーン構成**: 5ゾーン（教室4 + 中央廊下1）
- **シミュレーション**: Modelica（建物 + HVAC 両方）
- **季節**: 冬季・夏季の両方
- **占有プロファイル**: 変動条件
- **ベースライン**: ASHRAE Guideline 36 シーケンス（業界標準）

## 手法

| 戦略 | 概要 |
|------|------|
| **Zone-Aware DRL** | 各ゾーンの状態を区別して制御 |
| **Zone-Integrated DRL** | ゾーン情報を統合表現で扱う |

両者とも AHU の空気ループと水ループの **すべての低レベルコンポーネント** を制御対象とする。

## 主要な結果

| 指標 | DRL の改善幅 |
|------|------------|
| エネルギー消費 | **最大 17% 削減**（ASHRAE G36 比） |
| 室内温度逸脱 | 改善 |
| CO₂ 濃度 | 改善 |

## 意義

- DRL の比較対象として **業界標準 (ASHRAE G36)** を採用したことで、研究と実務の橋渡しに貢献。
- 同チームの関連研究では **DRL コントローラからのルール抽出** も発表されており、ブラックボックス問題への取り組みを併行している（[Capozzoli ら別論文](https://www.sciencedirect.com/science/article/pii/S0306261924024309)）。
- Modelica ベースのため、再現性・移植性が高い。

## 限界

- シミュレーションのみで、実教室への展開は本論文では未報告。
- 5ゾーン規模に限定。大規模商業ビルへのスケーラビリティは別研究が必要。
- DRL のサンプル効率（訓練に必要な episode 数）は要確認。

## 関連事例

- [03](./03-hierarchical-drl-iaq.md): 階層型 DRL での IAQ 統合
- [09](./09-field-demo-review.md): フィールド実証レビュー
- 同チームの [ルール抽出論文](https://www.sciencedirect.com/science/article/pii/S0306261924024309)
