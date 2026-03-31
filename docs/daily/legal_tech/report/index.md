# 法律分野におけるLLM評価 — 詳細レポート

## Parameters

- **Resources analyzed**: 1
- **Resource types**: Academic Paper
- **Generated on**: 2026-03-31
- **Input source**: arXiv URL (user provided)

## Report List

### Academic Papers

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 1 | Legal Evaluations and Challenges of Large Language Models | 2024 | arXiv (cs.CL, cs.AI) | O1-previewを含む10種LLMの法律事例評価。人間評価でO1が最高スコア（3.96/5）、法律特化モデルは汎用モデルに劣後 | [Details](01-legal-llm-evaluation.md) |

## Cross-Resource Insights

本レポートは単一論文の分析であるため、クロスリソース分析は対象外。関連する研究として以下が注目に値する：

- **LexGLUEベンチマーク**: 法律NLPタスクの標準ベンチマーク（ChatGPTで49.0% micro-F1）
- **ChatLaw2-MOE**: 法律ベンチマークでGPT-4超えを主張するモデル（本論文の評価対象外）
- **DISC-LawLLM**: 法的三段論法推論を統合したアプローチ

## Further Investigation Candidates

本論文の調査過程で発見された、さらなる調査に値するリソース：

- **ChatLaw系列の論文**: 知識グラフと混合エキスパートを組み合わせた法律LLMアプローチ
- **DISC-LawLLM**: 法的三段論法に基づく推論の統合手法
- **KL3M**: エンタープライズ向け法律言語モデル
- **LexGLUE**: 法律NLPベンチマークの詳細分析
- **法律分野におけるRAG（検索拡張生成）**: ChatLawが採用するベクトル・キーワード混合検索アプローチ
