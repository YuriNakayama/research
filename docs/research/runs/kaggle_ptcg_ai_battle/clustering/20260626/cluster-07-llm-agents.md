# Cluster 7: LLM エージェントと実時間意思決定

**Overview**:
LLM をゲームエージェントとして用いる新潮流の領域。ツール使用（思考ツール・行動ツール）、chain-of-thought による戦略推論、自己対戦による推論強化（SPIRAL）などを含む。LLM 単体は一貫性・ゲーム力学の深い理解に欠けるため、本コンペの10分・即敗北という実時間制約では主力にしにくいが、**Strategy 部門のレポート差別化**（戦略の言語化・デッキ思想の説明）や、補助的な高次意思決定・相手デッキ推定の説明生成として有望。最小提出を LLM/Codex で素早く作る実践（タナカナウ記事）も含む。

**Keywords**:
`LLM game agent`, `tool-use agent`, `chain-of-thought strategy`, `STRIDE framework`, `DSGBench`, `SPIRAL self-play reasoning`, `LLM Pokemon battle agent`, `strategic reasoning`, `real-time decision making`, `latency-aware inference`, `minimal submission via Codex`, `report generation`

**Research Strategy**:
- 「A Survey on LLM-Based Game Agents」（ACM CSUR / GitHub）で全体像を把握し、turn-based・不完全情報への適用例を抽出。
- 「LLMs as Pokémon Battle Agents」でポケモン題材の LLM 適用の限界と工夫を確認（RL との比較）。
- STRIDE / DSGBench で「ツール支援 LLM の戦略的意思決定」の評価軸を把握し、Strategy 部門レポートの観点に転用。
- 10分制約との整合のため、LLM はオフライン（デッキ思想・戦略方針の生成）に限定し、対戦中はキャッシュ/蒸留した軽量方策を使う設計を検討。
- タナカナウの「最小提出 Codex プロンプト」記事で、ベースライン提出を高速に立ち上げる実務手順を参照。

**Seed Resources**:
| タイトル | 年 | 概要 | リンク |
|---------|----|------|--------|
| A Survey on Large Language Model-Based Game Agents (ACM CSUR) | 2024+ | LLM ゲームエージェントの包括サーベイ | https://github.com/git-disl/awesome-LLM-game-agent-papers |
| Large Language Models as Pokémon Battle Agents | 2025 | LLM のポケモン対戦適用（戦略＋生成） | https://arxiv.org/pdf/2512.17308 |
| STRIDE: Tool-Assisted LLM Agent for Strategic Decision-Making | 2024 | ツール支援 LLM の戦略的意思決定 | https://arxiv.org/pdf/2405.16376 |
| DSGBench: Diverse Strategic Game Benchmark for LLM Agents | 2025 | LLM エージェントの戦略ゲーム評価 | https://arxiv.org/pdf/2503.06047 |
| 最小提出 Codex プロンプト（タナカナウ） | 2026 | LLM/Codex によるベースライン高速提出 | https://note.com/tanaka_now/n/n707a493e0d8a |
