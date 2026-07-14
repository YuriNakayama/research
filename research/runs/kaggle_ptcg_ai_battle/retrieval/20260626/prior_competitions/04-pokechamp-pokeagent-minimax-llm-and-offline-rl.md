# PokéChamp と PokeAgent Challenge — ポケモン対戦における minimax×LLM とオフラインRL勝者解法

## 概要

本レポートは、PTCG とゲーム性が最も近い**ポケモン対戦**の2大成果を扱う:(1) Karten et al. (2025) *PokéChamp* (arXiv:2503.04094, ICML2025 spotlight) — LLM で minimax 探索の3モジュールを置換した追加学習不要のエージェント、(2) Karten et al. (2026) *The PokeAgent Challenge* (arXiv:2603.15563, NeurIPS2025) — 100チーム超が参加した部分観測対戦コンペとその勝者解法。両者は **部分観測・確率的遷移・厳しい時間制約(150秒/試合, 15秒/ターン)・チーム構築(teambuilding)** という PTCG とほぼ同型の課題を扱い、「LLM+探索」と「オフラインRL+Transformer」という2系統の実証済みレシピを提供する。

## 手法の要点

**PokéChamp(LLM minimax)**:
- ポケモン対戦を **POMG**(部分観測マルコフゲーム, tree-structured, perfect recall)として定式化。1ターン目だけで状態空間は約 10^354。
- 古典 minimax 木探索の3モジュールを LLM で置換: **(1) 自分の行動サンプリング**(LLM が少数の有望手を提案 → 木を枝刈り)、**(2) 相手モデリング**(観測から隠れ状態を推論し相手手を予測)、**(3) 価値推定**(深さ k で打ち切り leaf を LLM が評価)。
- **追加学習不要**: LLM は black-box。ローカル Showdown シミュレータで1手先読みし、ダメージ計算式 `Damage=(((2/5·Level+2)·Power·A/D)/50+2)·修正` などの**admissible ヒューリスティック**(最小KOターン数等)を併用。確率遷移は期待値で近似。
- 時間制約: 150秒/プレイヤー + 15秒/ターン → 全木探索は不可能なので純粋戦略+浅い探索に限定。

**PokeAgent Challenge(コンペ)**:
- 2トラック: **競技対戦**(部分観測下のゲーム理論的推論)と **RPG スピードラン**(長ホライズン計画)。
- **2000万超の対戦軌跡**データ、ヒューリスティック/RL/LLM ベースライン(PokéChamp, **Metamon**)を提供。ターンタイマー60-90秒、LLM 用に Extended Timer も。
- **Metamon**: スケーラブルなオフライン RL + Transformer(コンパクトRNN〜2億パラメータまで30エージェント)を人間リプレイ + self-play で訓練(RLC2025 "Human-Level Competitive Pokémon")。

## 主要な結果や知見

- **PokéChamp の強さ**: Gen9 OU で GPT-4o 使用時、最強 LLM bot に **76%**、最強ルールベースに **84%** の勝率。オープンソース Llama 3.1 8B でも GPT-4o版 Pokéllmon に **64%** 勝利。Showdown ラダーで **Elo 1300-1500(人間上位10-30%)**。追加学習なしでこの水準。
- **コンペの核心知見**: **「専門特化 RL/探索 > 汎用 LLM」**。LLM はminimax 探索や構造化状態表現などのハーネス支援がないと実用水準に届かず、最強ベースラインでもエリート人間には未達。generalist(LLM) / specialist(RL) / 人間の間に明確なギャップ。
- **勝者解法 PA-Agent**: Metamon オフライン RL 基盤上に **反復オフライン RL + 動的データ重み付け**(人間リプレイから出発し6ラウンドの相互対戦データで精製、人間データ比率を 100%→10% に逓減して低質決定の干渉を回避)。**Battle Decision Module**(Transformer で直近イベントへの注意を強化)+ **Team Optimization Module**(トーナメント駆動のチーム選択)のモジュール構成。Gen1 OU 予選で **GXE 80.35%**。

## 本コンペ(PTCG AI Battle)への応用

1. **「LLM 単体は弱い、探索/ハーネスで武装せよ」**: PokeAgent の最大の教訓は LLM 汎用エージェントが専門 RL に負けたこと。PTCG で LLM を使うなら **PokéChamp 型の minimax ハーネス**(LLM = 行動候補生成・相手モデリング・価値推定)に組み込むべきで、生 LLM に手を選ばせるのは非効率。
2. **10分制約下の探索設計**: PokéChamp は150秒/15秒制約で**浅い minimax + LLM 枝刈り**を採用。PTCG の10分でも、合法手を LLM/ヒューリスティックで少数に絞り、1手先シミュレータ(確率遷移は期待値近似)で評価する設計が現実的。`最小KOターン数`のような admissible ヒューリスティックを評価関数に組み込むと安価で効く。
3. **オフライン RL + Transformer が勝者の本命レシピ**: PA-Agent/Metamon は「人間/強 bot のリプレイをオフライン RL で学習 → self-play で精製 → 人間データ比率を逓減」という明確な勝ち筋を示した。PTCG でも**(a) 強い対戦ログを集め、(b) Transformer で系列(部分観測の belief)を符号化し、(c) オフライン RL で学習、(d) 自己対戦で反復精製**という4段が有力。動的データ重み付け(低質データの段階的除外)は即採用価値あり。
4. **deck 60枚 = teambuilding の自動最適化**: PA-Agent の Team Optimization Module(トーナメント駆動のチーム選択)は PTCG の deck.csv 最適化に直結。**強デッキ候補を生成 → 自己対戦リーグで評価 → 勝ち残りを採用**するループを agent() と分離して回すべき。
5. **部分観測の扱い**: ポケモンは「自分のチームは完全観測・相手は段階開示」で PTCG と同型。直近ターンへの注意強化(PA-Agent)や履歴の系列符号化(Metamon Transformer)で belief を暗黙保持する設計が有効。

## 出典(URL)

- PokéChamp (arXiv:2503.04094): https://arxiv.org/abs/2503.04094
- PokéChamp 公式実装: https://github.com/sethkarten/pokechamp
- The PokeAgent Challenge (arXiv:2603.15563): https://arxiv.org/abs/2603.15563
- PokeAgent Challenge 公式サイト: https://pokeagent.github.io/
- Metamon(オフラインRL基盤・データセット): https://github.com/UT-Austin-RPL/metamon
