# Cluster 6: 信頼性・安全性・Human-in-the-Loop

## 概要

データ分析エージェントの信頼性保証、安全性フレームワーク、人間監督メカニズムを扱うクラスタ。データ分析エージェントは自律的にコードを生成・実行するため、不正確な分析結果の出力、データ漏洩、意図しない操作（テーブル削除等）のリスクが内在する。Agent-SafetyBenchでは主要16LLMのいずれも安全スコア60%に達しておらず、TrustAgentはAgent Constitution（エージェント憲法）による3段階安全性フレームワークを提案している。企業導入ではHuman-in-the-Loop（HITL）が最も一般的な管理手法（38%）であり、完全自律への移行には信頼キャリブレーションと認知負荷の最適化が課題となっている。

## キーワード

`agent safety`, `trustworthiness`, `Agent Constitution`, `human-in-the-loop`, `HITL`, `TrustAgent`, `Agent-SafetyBench`, `TRiSM`, `trust calibration`, `cognitive load`

## 研究戦略

- **推奨検索クエリ**: `"LLM agent safety benchmark 2024 2025"`, `"TrustAgent agent constitution"`, `"human-in-the-loop AI agent survey"`, `"agentic AI trust risk security management"`
- **主要情報源**: arXiv (cs.AI, cs.CR), EMNLP/ACL Findings, MDPI Entropy, Gartner/Deloitte reports
- **注目研究グループ**: CMU (TrustAgent), Tsinghua (Agent-SafetyBench), Gartner (TRiSM framework)
- **推奨読書順序**:
  1. Agent-SafetyBench (2024) — 安全性の現状課題を定量的に把握
  2. TrustAgent (2024, EMNLP) — 3段階安全性フレームワーク
  3. TRiSM for Agentic AI (2025) — マルチエージェント向け信頼・リスク管理
  4. "Human-in-the-Loop AI: A Systematic Review" (2026) — HITL設計の体系的理解

## 代表的リソース

| タイトル | タイプ | 年 | 概要 |
|---------|--------|------|------|
| TrustAgent | 論文 (EMNLP) | 2024 | Agent Constitutionによる3段階安全性フレームワーク（事前計画・実行中・事後）。[ACL Anthology](https://aclanthology.org/2024.findings-emnlp.585/) |
| Agent-SafetyBench | ベンチマーク | 2024 | 2,000テストケース。主要16LLMのいずれも安全スコア60%未達。[arXiv:2412.14470](https://arxiv.org/abs/2412.14470) |
| TRiSM for Agentic AI | 論文 | 2025 | マルチエージェントの信頼・リスク・セキュリティ管理フレームワーク。[arXiv:2506.04133](https://arxiv.org/abs/2506.04133) |
| Human-in-the-Loop AI: A Systematic Review | サーベイ (Entropy) | 2026 | HITL研究の体系的レビュー。信頼キャリブレーションと認知負荷を分析。[MDPI](https://www.mdpi.com/1099-4300/28/4/377) |
| A Survey of Data Agents: Emerging Paradigm or Overstated Hype? | サーベイ | 2025 | 90%以上のシステムが明示的な信頼・安全性メカニズムを欠くことを指摘。[arXiv:2510.23587](https://arxiv.org/html/2510.23587) |
| Self-reflection enhances LLMs | 論文 (npj AI) | 2025 | 二重ループリフレクションによる自己検証手法。[Nature](https://www.nature.com/articles/s44387-025-00045-3) |
