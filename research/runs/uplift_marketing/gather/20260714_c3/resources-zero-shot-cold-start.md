# C3 リソース一覧: 情報0施策のゼロショット効果予測（最重要）

- **Cluster**: C3 — Zero-shot / Cold-start Causal
- **Domain**: `uplift_marketing`
- **Generated**: 2026-07-14
- **対象**: 実施実績が全くない（情報0の）新規施策の効果を、施策そのものを特徴量で表現して予測。ユーザー最重要要望。

## 概要

一度も実施していない施策の効果を、施策自体を特徴量（クーポン額・訴求カテゴリ・チャネル等）で表現して予測する中核問題。介入横断の causal meta-learning（CaML）、産業cold-start（ColdNet）、構造化/グラフ/高次元treatment表現による未知arm一般化、CATEのcross-domain転移を横断。アンカーは CaML・ColdNet・Feuerriegel survey。

## リソース

| # | Title | Year | Venue | URL | Relevance |
|---|-------|------|-------|-----|-----------|
| 1 | Zero-shot causal learning (CaML) | 2023 | NeurIPS / arXiv:2301.12292 | https://arxiv.org/abs/2301.12292 | **最重要seed**。数千の介入タスクで単一causalメタモデルを学習。介入属性+個人特徴で学習時に存在しない新介入のCATEを予測。「情報0の新施策」問題の直系。 |
| 2 | ColdNet: TE Estimation with Cold-start, Imbalance, Zero-inflated Outcomes | 2025 | ACM / Amazon Science | https://www.amazon.science/publications/coldnet-treatment-effect-estimation-with-cold-start-imbalance-and-zero-inflated-outcomes | **seed**。profile 99.2%不完全の産業cold-start uplift。cluster-based cold-start enhancementで類似sampleから効果予測を転移。Amazon本番（週40億+予測）。 |
| 3 | Causal ML for Predicting Treatment Outcomes (Feuerriegel et al.) | 2024 | Nature Medicine / arXiv:2410.08770 | https://arxiv.org/abs/2410.08770 | **seed survey**。個別TE予測の因果MLを俯瞰。zero-shot/新介入を位置づける参照分類体系。 |
| 4 | Intervention Generalization: A View from Factor Graph Models (IFM) | 2023 | NeurIPS / arXiv:2306.04027 | https://arxiv.org/abs/2306.04027 | 既知の相互作用構造を合成し、一度も実施していない新介入の結果を予測する identifiability 条件。未知treatmentへの外挿の原理的基盤。 |
| 5 | GraphITE: Individual Effects of Graph-structured Treatments | 2021 | CIKM / arXiv:2009.14061 | https://arxiv.org/abs/2009.14061 | treatmentのGNN表現で巨大treatment空間へ効果を一般化。「介入を特徴量で表現」の機構。 |
| 6 | Contrastive Representations of High-dimensional, Structured Treatments | 2024 | npj AI / arXiv:2411.19245 | https://arxiv.org/abs/2411.19245 | 因果的に重要な因子を保つtreatment表現をcontrastive学習。test時に未知treatmentへ一般化。 |
| 7 | Transfer Learning on Heterogeneous Feature Spaces (HTCE) | 2022 | NeurIPS / arXiv:2210.06183 | https://arxiv.org/abs/2210.06183 | 異なる共変量・少データのtargetへCATE転移。新施策がほぼ自前データ無しのcold-start regime（C2と共有）。 |
| 8 | MetaITE: Meta-Learning for Multiple Imbalanced Treatment Effects | 2022 | arXiv:2208.06748 | https://arxiv.org/abs/2208.06748 | 深刻な不均衡/少データの複数treatment横断メタ学習。観測履歴がほぼ無い新arm対応。 |
| 9 | Metalearners for Estimating HTE (Künzel et al.) | 2019 | PNAS / arXiv:1706.03461 | https://arxiv.org/abs/1706.03461 | S/T/X-learnerの基礎。arm sampleが少/0のときCaML・cold-start modelが依拠する分解。 |
| 10 | Zero-Shot Molecular Perturbation Prediction (single-cell FM) | 2024 | ICLR / arXiv:2412.13478 | https://arxiv.org/abs/2412.13478 | drug-conditional adapterで未知perturbationの効果をzero-shot予測。「介入属性を条件付け特徴に」の具体レシピ、マーケ転用可。 |
| 11 | VCNet + Functional Targeted Regularization (continuous treatment) | 2021 | ICLR / arXiv:2103.07861 | https://arxiv.org/abs/2103.07861 | 連続dose-response曲線で未観測のtreatment強度/値へ外挿。介入空間上の特徴ベース外挿（クーポン額の外挿に直結）。 |
| 12 | GraphTEE: TE Estimation for Graph-Structured Targets | 2024 | PAKDD / arXiv:2412.20436 | https://arxiv.org/abs/2412.20436 | 構造化treatment効果推定をgraph targetへ拡張。特徴記述された大介入空間の表現ベース一般化を補強。 |
| 13 | Causal Inference with Complex Treatments: A Survey | 2024 | ACM CSUR / arXiv:2407.14022 | https://arxiv.org/abs/2407.14022 | 構造化/連続/bundled treatment手法のsurvey。「介入を特徴量で表現し未知treatmentへ一般化」のランドスケープ地図。 |
| 14 | Enhancing Uplift Modeling in Multi-Treatment Campaigns: Score Ranking & Calibration | 2024 | arXiv:2408.13628 | https://arxiv.org/abs/2408.13628 | 複数施策を比較するマーケupliftの接地。上記因果ML手法から「新施策効果予測」応用への橋渡し。 |

## retrieval への優先度（このクラスタは厚めに）

- **最優先**: #1 CaML（設計図）, #2 ColdNet（産業実装）, #11 VCNet（クーポン額外挿）
- **高**: #4 IFM（未実施介入のidentifiability）, #10 Zero-shot perturbation（条件付け特徴レシピ）, #6 Contrastive treatment表現
- **接地/基礎**: #3 survey, #14 marketing uplift, #9 metalearner基礎
