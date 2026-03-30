# クラスタ 2: NL2SQL / NL2Code（自然言語→コード変換）

[← index.md](index.md)

## 概要

自然言語の分析指示をSQL/Pythonコードに変換する技術に特化した研究領域。Text-to-SQLはSpiderベンチマークで実行精度88%超（2025年時点）に達しており、LLMのプロンプトエンジニアリング（ICL, CoT）とファインチューニングの両アプローチが活発。より広くはNL2Code（Pandas操作、統計分析コード生成等）もこのクラスタに含まれる。

## キーワード

`Text-to-SQL`, `NL2SQL`, `NL2Code`, `code generation`, `Spider benchmark`, `BIRD benchmark`, `schema linking`, `prompt engineering`, `few-shot learning`, `RAG for SQL`, `execution accuracy`, `semantic parsing`

## 研究戦略

- **推奨検索クエリ**:
  - `"text-to-SQL" LLM survey 2024 2025`
  - `"NL2Code" data analysis agent`
  - `"code generation" data science LLM`
- **主要情報源**: ACL Anthology, IEEE TKDE, VLDB, ACM SIGMOD
- **注目すべきベンチマーク**: Spider 1.0/2.0, BIRD, WikiSQL
- **推奨読み進め順**: サーベイ論文 [ACM Computing Surveys (2024)](https://dl.acm.org/doi/10.1145/3737873) および [arXiv:2408.05109](https://arxiv.org/abs/2408.05109) を起点に推奨
- **論文リスト**: [Awesome-LLM-based-Text2SQL (GitHub)](https://github.com/DEEP-PolyU/Awesome-LLM-based-Text2SQL) が最新論文リストを維持
