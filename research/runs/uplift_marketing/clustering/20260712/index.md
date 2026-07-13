# マーケティング施策のアップリフト最適化：疎・不定期な施策データの統合による効果最大化

## Research Parameters

- **調査タイプ**: 学術論文サーベイ（arXiv 中心、一部 IEEE/ACM/統計系ジャーナル）
- **時間範囲**: 2022–2026（因果フォレスト・メタラーナー・転移可能性の基礎文献は例外的に古典も収録）
- **生成日**: 2026-07-12
- **詳細度**: 詳細（クラスタごとに代表論文リスト付き）
- **入力キーワード**: アップリフトモデリング / オフ方策評価 (OPE) / クーポン・訴求メール施策 / 複数施策のグルーピング / 擬似的なデータ間隔短縮・データ量増加 / ユーザー行動傾向

## Big Picture

本テーマは「**数ヶ月に一度しか回せない、対象ユーザーも訴求内容も異なる複数のマーケティング施策**を、いかに統合して uplift／off-policy 評価に足るデータ密度へ引き上げるか」という実務課題を、因果推論の複数領域の交点として整理したものである。単一施策のログだけでは検出力が不足するため、鍵となるのは **「似た施策・似たユーザー群をグルーピングして強さを借りる (borrowing strength)」** という発想であり、これは学術的には (a) uplift/CATE 推定、(b) オフ方策評価（過去ログからの反実仮想評価）、(c) 複数タスク・複数研究をまたいだ HTE 推定（表現・モデル共有）、(d) 複数実験のデータプーリング／エビデンス統合（統計的縮約・補完）、(e) 行動セグメンテーションと効果の転移可能性、という5つのサブ領域に分解できる。特に (c)(d) が本テーマの中核であり、「共通効果は共有し、施策固有の異質性は分離する」ことで疎で不定期な実験群から信頼できる意思決定を導く。近年は surrogate index による観測期間の短縮や matrix completion による効果表の補完など、「実効的な実験間隔そのものを縮める」直接的アプローチも登場している。

## Reference Survey/Review Papers

各クラスタのドメイン分割は、以下の survey/review 論文の分類軸を参照して構成した。

| Title | Year | Summary | Link |
|-------|------|---------|------|
| A Large-Scale Empirical Comparison of Meta-Learners and Causal Forests for HTE in Marketing Uplift Modeling | 2026 | Criteo Uplift v2.1（1398万件）で S/T/X-Learner・Causal Forest を大規模比較。uplift 手法選択の実証ガイド | https://arxiv.org/abs/2604.06123 |
| Counterfactual Learning and Evaluation for Recommender Systems (RecSys 2021 Tutorial) | 2021 | OPE/OPL の基礎（IPS/DR/DM）から実装・最新手法までを体系化。反実仮想機械学習の入口 | https://usait0.com/en/publication/proposals/recsys2021-2/ |
| Comparison of Methods that Combine Multiple Randomized Trials to Estimate HTE | 2024 | 複数 RCT を統合して HTE を推定する手法群の比較レビュー。試験間異質性を許容する手法が優位 | https://arxiv.org/abs/2303.16299 |
| Optimizing Returns from Experimentation Programs | 2024 | A/B テストのポートフォリオに対する empirical Bayes 分析をサーベイし「最適化」視点で拡張 | https://arxiv.org/abs/2412.05508 |
| A Review of Generalizability and Transportability | 2023 | 一般化可能性と転移可能性を横断整理した必読サーベイ。仮定・推定・診断法を体系化 | https://www.annualreviews.org/content/journals/10.1146/annurev-statistics-042522-103837 |

## Domain Map

```
                  ┌─────────────────────────────────────────────┐
                  │  施策効果の最大化 (uplift × off-policy)       │
                  └─────────────────────────────────────────────┘
                                   │
        ┌──────────────────┬───────┴────────┬──────────────────┐
        ▼                  ▼                ▼                  ▼
 ┌────────────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
 │ C1         │    │ C2           │  │ C3 ★中核     │  │ C4 ★中核     │
 │ Uplift/CATE│    │ Off-Policy   │  │ Multi-task / │  │ Data Pooling │
 │ モデリング  │◄──►│ Evaluation   │  │ Transfer HTE │◄►│ / Evidence   │
 │ (複数処置)  │    │ (OPE/bandit) │  │ (跨施策共有) │  │ Synthesis    │
 └────────────┘    └──────────────┘  └──────┬───────┘  └──────┬───────┘
        ▲                                    │                 │
        │            ┌──────────────┐        │                 │
        └────────────┤ C5           │◄───────┴─────────────────┘
                     │ 行動セグメント │  「似たユーザー/施策を束ねて効果を転移」
                     │ × 転移可能性  │
                     └──────────────┘

  C1: 個人単位の増分効果を推定（土台）    C2: 過去ログから新方策をオフライン評価
  C3: 表現・モデルを跨施策で共有          C4: 複数実験を統計的にプール・補完
  C5: 束ねる単位（クラスタ）を作り効果転移の妥当性を担保
```

## Cluster Summary

| # | クラスタ名 | KW数 | 概要 |
|---|-----------|------|------|
| 1 | Uplift / CATE モデリング（複数処置対応） | 15 | 個人単位の増分効果推定。メタラーナー→深層→マルチトリートメントの系譜 |
| 2 | オフ方策評価 (OPE) / 反実仮想学習 | 14 | 過去ログのみで新しい配信方策を A/B なしにオフライン評価・最適化 |
| 3 | ★ マルチタスク・転移による跨施策 HTE 推定 | 16 | 複数施策・研究・処置をまたいで表現/モデルを共有し強さを借りる |
| 4 | ★ 複数実験のデータプーリング / エビデンス統合 | 16 | 疎な実験群を統計的に縮約・補完し実効データ密度と実験間隔を改善 |
| 5 | 行動セグメンテーション × 効果の転移可能性 | 16 | 似たユーザー/施策を束ねる単位を作り、効果転移の外的妥当性を担保 |

> ★ = 本テーマ（「施策をグルーピングして擬似的にデータ間隔を短縮・データ量を増やす」）の中核クラスタ。C3 は**モデル・表現の共有**（representation/meta-learning ベース）、C4 は**統計的なプーリング・補完**（empirical Bayes / hierarchical / matrix completion ベース）でアプローチが異なり、相補的に併用できる。

---

## Cluster Details

各クラスタの詳細は個別ファイルを参照：

- [`cluster-01-uplift-cate-modeling.md`](./cluster-01-uplift-cate-modeling.md)
- [`cluster-02-off-policy-evaluation.md`](./cluster-02-off-policy-evaluation.md)
- [`cluster-03-multitask-transfer-hte.md`](./cluster-03-multitask-transfer-hte.md) ★
- [`cluster-04-data-pooling-evidence-synthesis.md`](./cluster-04-data-pooling-evidence-synthesis.md) ★
- [`cluster-05-segmentation-transportability.md`](./cluster-05-segmentation-transportability.md)

## 推奨リサーチ順序

1. **C4 → C3**（中核）: まず「複数実験をプールして実効データ密度を上げる」統計基盤（DPTR / empirical Bayes / surrogate index）を押さえ、次に「モデル/表現を跨施策で共有する」機械学習手法（multi-study R-learner / task embedding）へ。この2つが本テーマの解の主軸。
2. **C1**: 各施策内で uplift を推定する土台（メタラーナー・深層・複数処置）を確認。C3/C4 の「借りる対象」となる推定量。
3. **C2**: 施策実行を「方策の出し分け」と捉え、過去ログから新方策をオフライン評価する枠組み（OBP で IPS→DR→DRos→MIPS を比較）。実運用の A/B コスト削減に直結。
4. **C5**: 「どの施策/ユーザーを束ねてよいか」の妥当性（転移可能性・共変量シフト）と、束ねる単位（行動クラスタ）の作り方。C3/C4 の前提条件を担保する。

## 次アクション候補

- **research-gather**: 各クラスタのリソースをさらに網羅的に収集（特に C3/C4）
- **research-retrieval**: 中核論文（DPTR 2508.10331 / multi-study R-learner 2306.01086 / meta-learning CATE 2305.11353 / surrogate index Netflix 2311.11922 等）の詳細レポート生成
- **クラスタ調整**: C3/C4 の統合、または C2 内の「クーポン実務事例」の切り出し等
