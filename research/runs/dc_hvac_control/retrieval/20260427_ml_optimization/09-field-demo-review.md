# 09. Lessons Learned from Field Demonstrations of MPC and RL for HVAC

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | Lessons learned from field demonstrations of model predictive control and reinforcement learning for residential and commercial HVAC: A review |
| 著者 | Arash J. Khabbazi, Elias N. Pergantis, Levi D. Reyes Premer, Panagiotis Papageorgiou, Alex H. Lee, James E. Braun, Gregor P. Henze, Kevin J. Kircher |
| 所属 | Purdue University, University of Colorado Boulder, Carnegie Mellon University ほか |
| 出版年 | 2025（arXiv 投稿 3/6, 出版 12月） |
| 掲載誌 | Applied Energy, Volume 399 |
| arXiv | 2503.05022 |
| URL | https://arxiv.org/abs/2503.05022 |

## 研究の位置付け

**HVAC 分野で初の本格的フィールド実証メタ分析**。住宅 24件、商業 80件、合計 104件の MPC/RL フィールド実証論文を体系的にレビューし、**実験プロトコルの信頼性**という観点から既存研究を分類した点で画期的。

## 主要な結論

### 1. 信頼性の問題

> **「71% のフィールド実証論文が、性能評価の信頼性を損なう実験プロトコルを採用している」**

主な問題:
- ベースラインの設定が不適切（同期間に運用していない、異なる気象下）
- 観測期間が短すぎる
- 統計的有意性の検証不足
- 占有プロファイルやセットポイントの不一致

### 2. 信頼性の高い 29% の実証研究での重み付け平均省エネ率

| 建物種別 | 重み付け平均省エネ率（運用期間ベース） |
|---------|-----------------------------------|
| 住宅 | **16%** |
| 商業 | **13%** |

これは、論文が個別に主張する「20-50%」より大幅に低い。**publication bias** と **実験条件の最適化** が原因と推察される。

### 3. コスト報告の不足

> 104件中、**わずか 13件**しか展開・運用・保守コストを報告していない

ROI（投資回収）議論なしに技術採用判断は不可能 → 実務界にとって深刻な課題。

## 意義

- 学術界が長らく主張してきた「>30% の省エネ可能」という標語に **冷静な再評価**を促す。
- 8名共著チームは Kircher（CMU）、Henze（Boulder）、Braun（Purdue）など、HVAC ML 分野の主要研究者を結集。
- 本論文の[02](./02-rl-mpc-field-comparison.md)も同チームのプロジェクト → 自分達でも厳密実証を実施し、メタ分析と現場研究を両輪で進める姿勢。

## 業界への含意

1. **新規プロジェクト立案時**: 想定省エネ率は **15% 程度**を起点にし、それを超えるためには相応の投資・期間を見込むべき。
2. **論文評価時**: 比較ベースライン、観測期間、占有条件の妥当性を最初に確認すべき。
3. **商用化時**: ダイキンの 16-21%（[08](./08-daikin-dk-connect.md)）はこのレビューの示す現実的範囲と整合。

## 限界

- レビュー時点 (2025年初) までの論文に限定。
- 「信頼性」の判定基準自体が著者の主観を含む可能性。
- 分散エネルギー資源（DER）との統合は対象範囲外で、別途研究が必要。

## 推奨される実証プロトコル（本論文の示唆から）

- 同一期間・同一占有条件下での A/B テスト
- 最低 1 シーズン以上の観測
- 快適性正規化後の指標で報告
- 展開・運用コストの開示
- ベースラインの明確な定義（PID? G36? 既存スケジュール?）

## 関連事例

- [02](./02-rl-mpc-field-comparison.md): 同チームによる厳密な実証研究
- [08](./08-daikin-dk-connect.md): 商用ベンチマークとの整合性
