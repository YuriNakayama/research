# C3 詳細レポート索引: 情報0施策のゼロショット効果予測（最重要）

- **Cluster**: C3 — Zero-shot / Cold-start Causal
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **上流**: `gather/20260714_c3/resources-zero-shot-cold-start.md`

## テーマ

**本リサーチの最重要クラスタ**。実施実績が全くない情報0の新規施策の効果を、施策自体を特徴量（クーポン額・訴求カテゴリ・チャネル等）で表現して予測する。

## レポート一覧

| # | ファイル | タイトル | 一言 |
|---|---------|---------|------|
| 1 | [01-caml-zero-shot.md](01-caml-zero-shot.md) | Zero-shot causal learning (CaML) | メタ学習で未観測介入のCATEをゼロショット予測。施策特徴→効果の写像を外挿する本命手法（NeurIPS 2023） |
| 2 | [02-coldnet.md](02-coldnet.md) | ColdNet | cold-start＋zero-inflated＋不均衡の同時発生を扱う実運用手法。新規顧客/施策の効果推定に直結（Amazon） |
| 3 | [03-intervention-generalization-ifm.md](03-intervention-generalization-ifm.md) | Intervention Generalization (IFM) | 因子グラフで施策要素を因子化し、未試行の組合せ施策の効果を識別・外挿する理論基盤（NeurIPS 2023） |
| 4 | [04-vcnet-continuous-treatment.md](04-vcnet-continuous-treatment.md) | VCNet + Functional Targeted Regularization | 割引額など連続処置の滑らかな用量反応曲線を二重頑健に推定（ICLR 2021） |
| 5 | [05-zero-shot-perturbation.md](05-zero-shot-perturbation.md) | Zero-Shot Molecular Perturbation Prediction | 薬剤条件付きアダプタ＋基盤モデル＋<1%学習で未観測介入をゼロショット予測。施策条件付けの実装指針として同型 |
| 6 | [06-causal-ml-survey.md](06-causal-ml-survey.md) | Causal ML for Predicting Treatment Outcomes | Feuerriegel サーベイ。CATE推定手法の体系・ワークフロー・バイアス回避の地図（Nature Medicine） |

## ユーザー課題への総括

**設計図はレポート1のCaML**: 過去の全施策を「施策特徴＋対象ユーザー特徴 → 効果」のタスク集合としてメタ学習しておけば、情報0の新施策も特徴量さえ与えれば効果をゼロショット推定できる → **施策の実施前スクリーニング・予算配分**に直結。

補完:
- クーポン**金額**のような連続処置の外挿はレポート4（VCNet）で dose-response 曲線として扱う。
- 施策要素の**組合せ**（金額×訴求×チャネル）が未試行の場合はレポート3（IFM）が identifiability を与える。
- 実データの極端な疎・不均衡（購買ゼロ多数・新規顧客）にはレポート2（ColdNet）。
- 施策属性を条件付け特徴として基盤モデルに注入する実装様式はレポート5が具体例。
- 全体の座標軸・バイアス回避はレポート6のサーベイ。

**実装上の鍵**: 施策の特徴量設計（金額=連続値、訴求=埋め込み、チャネル=カテゴリ）が予測性能を決める。C5のaction representationと不可分。
