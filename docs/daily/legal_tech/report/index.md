# Legal Tech — Detailed Reports

## Parameters

- **Resources analyzed**: 1
- **Resource types**: Academic Paper
- **Generated on**: 2026-03-29
- **Input source**: User URL (arXiv)

## Report List

### Academic Papers

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 1 | Legal Evalutions and Challenges of Large Language Models | 2024 | arXiv (cs.CL, cs.AI) | O1-previewを含む10モデルの法律分野における包括的評価。二重評価（自動指標+人間評価）で法律特化モデルより汎用大規模モデルの優位性を確認 | [Details](01-legal-evaluations-llm.md) |

## Cross-Resource Insights

本レポートは単一リソースの分析であるため、クロスリソース分析は該当なし。

## Key Findings Summary

- **O1-preview**が法的推論品質で総合最高スコア（3.96/5.0）を達成
- 自動指標（ROUGE/BLEU）と人間評価の間に**負の相関傾向**が確認され、法律分野ではテキスト類似度ベースの評価が不適切である可能性を示唆
- **法律特化モデル**（LawGPT, Lawyer-LLaMA）は汎用大規模モデルに**劣後**する結果
- **Qwen2-7B**が7Bパラメータでクローズドソースモデルに匹敵する人間評価（3.85）を達成し、高効率性を実証
