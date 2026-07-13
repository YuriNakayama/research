# Pokémon TCG AI Battle Challenge — 類似コンペ調査と戦略マッピング

**作成日**: 2026-06-26
**対象コンペ**: [Pokémon TCG AI Battle Challenge](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle) (#PokécaABC)
**phase**: clustering（過去類似コンペの整理 + 戦略仮説の提示）

> このドキュメントは「過去の類似コンペを調査して戦略を立てる」ための **landscape マップ**です。
> 各クラスタの詳細は `cluster-NN-*.md` を参照してください。次フェーズ (gather / retrieval) で
> 個別解法のコード・論文を深掘りする想定です。

---

## 0. なぜこの調査が効くのか — 本コンペの構造的位置づけ

本コンペは **2 人対戦・ゼロ和・確率的・不完全情報の逐次ゲーム** を、**連続自己対戦 + ガウス分布レーティング (TrueSkill 系)** でランク付けする形式です。この組み合わせは、過去に明確な勝者解法が存在する 3 つの研究系譜の **交差点**にあります。

| 構造的特徴 | 最も参考になる系譜 |
|------------|-------------------|
| 不完全情報（相手手札・山札順が隠蔽） | ポーカー AI (CFR), Hanabi, Stratego/DeepNash |
| 確率要素（ドロー・コイントス） | 麻雀 Suphx, 闘地主 DouZero, Scrabble Maven |
| カードゲーム + デッキ構築 | Legends of Code and Magic, Hearthstone AI |
| Kaggle 提出 I/F + TrueSkill ランキング | Lux AI, Halite, Kore, Hungry Geese |
| 巨大・ターン可変の合法手集合 | DouZero, Kore (flight-plan), AlphaStar |

**最重要メッセージ（全調査の収束点）**:
> 「**探索 + determinization + 良い評価関数**」が最も再現性の高い王道であり、
> 「**自己対戦 RL を均衡 (CFR/NFSP/fictitious play 系) へ収束させる**」のは、環境が暗記を許さなくなったときに最終的に勝つ手法。
> そして **naive な self-play は脆い** — リーグ/集団学習で metagame に対する頑健性を確保する必要がある。

---

## 1. 対象コンペの確定仕様（要点）

詳細・出典・矛盾点は **[cluster-01-target-competition-spec.md](cluster-01-target-competition-spec.md)** を参照。

- **主催**: The Pokémon Company / 東大 松尾研 (Matsuo Institute) / HEROZ。協賛 Google・Google Cloud・NVIDIA。プラットフォームは Kaggle。
- **2 トラック構成**:
  - **Simulation Category** (`pokemon-tcg-ai-battle`): AI agent を提出し 24h 自動対戦。賞金は直接付かないが Strategy の前提。
  - **Strategy Category** (`...-challenge-strategy`): デッキ構築の独創性 + アルゴリズムの工夫をまとめた技術レポートを審査。**ここに Round 1 の賞金**。
- **cabt Engine**（松尾研製シミュレータ）: 毎ターン **観測 = {ゲームログ, 盤面状態, 合法手リスト}** を agent に渡し、agent は **行動の index** を返す。**1 プレイヤーあたり最大 10 分**（超過で即敗北）。承認済みカードのみ（Standard 約 2,000 枚）。
- **不完全情報**: 相手手札・山札順は隠蔽。**確率要素**: カードドロー・コイントス。
- **評価**: ガウス分布ベースのレーティングで 24h 自動対戦、リアルタイム leaderboard。
- **タイムライン**: Round 1 は 2026/6/16 開始。Simulation 締切 ~8/16、Strategy 締切 ~9/13–14。上位 8 チームが各 $30,000 を得て Round 2 (日本での決勝, Pokémon 公式 YouTube 配信) へ。Round 2: 1st $50,000 / 2nd $30,000。参加者全員に Google Cloud クレジット $3,000。
- **チーム**: 個人〜最大 5 名。参加無料。
- **公式見解**: 「**ルールベースのプログラミングだけでは上位は難しい**」と明言。SDK は「ローカルデバッグと強化学習に適する」と案内。

> ⚠️ 主な要確認点: 総賞金 "$300k+" vs "$290k"、決勝の時期（"2026/9 日本" vs 公式 note の "2026年末以降"）、Strategy 採点配点（70/20/10 説は単一ソースのみ）。詳細は cluster-01 に集約。

---

## 2. 類似コンペ・クラスタ一覧（優先度順）

| # | クラスタ | 何を学ぶか | 本コンペへの近さ | 詳細 |
|---|---------|-----------|-----------------|------|
| 02 | **不完全情報ゲーム AI の系譜** | CFR 系で「情報集合 + 反実仮想後悔最小化」、re-solving、belief modeling | ★★★★★ 情報構造が最も同型 | [cluster-02](cluster-02-imperfect-info-games.md) |
| 03 | **カードゲーム / TCG AI コンペ** | デッキ構築 + 対戦、dynamic lookahead、暗記封じ後に RL が勝つ転換点 | ★★★★★ ゲーム種が同一 | [cluster-03](cluster-03-card-game-ai.md) |
| 04 | **Kaggle Simulation 系勝者解法** | 提出 I/F・TrueSkill 運用・imitation→RL・league self-play の実務 | ★★★★☆ 評価基盤が同一 | [cluster-04](cluster-04-kaggle-simulation.md) |
| 05 | **RNG 重め大規模確率ゲーム** | 麻雀/闘地主の (state,action) エンコード、global reward、run-time 適応 | ★★★★☆ 確率+巨大行動空間が同型 | [cluster-05](cluster-05-stochastic-rng-milestones.md) |

---

## 3. 横断的な「効く戦略」仮説（Top 10）

各調査の収束点を、本コンペ向けに優先度付けした実行仮説として提示します。番号が小さいほど高 ROI と判断。

1. **情報集合 (information set) として状態をモデル化する** — 意思決定の単位は「盤面」ではなく「自分が知っていること」。CFR 系自己対戦 (MCCFR/CFR+/Deep CFR) が、本コンペと同型の 2 人ゼロ和・確率的・不完全情報ゲームで exploitable でない方策を作る実証済みエンジン。[cluster-02]

2. **determinization / シミュレーションを最初のベースラインに** — 相手手札・山札順を「もっともらしくサンプリング → 完全情報として評価 → 集約」。Hearthstone・ブリッジ・Scrabble を制した最も低コストかつ実戦的な手法。ISMCTS が card-game-native な発展形。[cluster-02, 03, 05]

3. **探索の深さより「良い評価関数 + 枝刈り + リーサル検知」** — LOCM・Hearthstone を長年制したのはこれ。まず高速で強い状態評価関数を作る。[cluster-03]

4. **巨大・ターン可変の合法手は「各候補手をエンコードして (state, action) を共有 NN で採点」** — 固定出力ヘッドにしない。DouZero の Deep Monte Carlo が直接適用可能（本コンペの行動 index I/F と相性良）。[cluster-05]

5. **オフライン blueprint + リアルタイム re-solving / 深さ制限探索 + 学習価値関数** — DeepStack/Libratus/Pluribus。想定外の相手手を最近傍バケットに丸めず、その局面を再解決する。[cluster-02]

6. **leaderboard の上位 replay を imitation learning で複製** — Halite・Kore・Hungry Geese で「学習系が効いた唯一の入口」。連続 TrueSkill ラダーは高品質な対戦 replay を吐き続けるので、まず安価に clone してベースライン化。[cluster-04]

7. **TrueSkill ラダーでは naive self-play を信用しない** — リーグ/集団学習 + 明示的 exploiter (PFSP) でデッキ archetype 過学習と非推移的サイクルを防ぐ。AlphaStar/GRF/Lux S1 の教訓。[cluster-04, 05]

8. **遅延した試合単位報酬を密なシグナルへ + run-time 適応** — Suphx の Global Reward Prediction、配られた手への pMCPA 適応。[cluster-05]

9. **人間模倣 prior へ方策/探索をアンカー (piKL) + 自己対戦の対称性破壊 (Other-Play)** — 相手分布を現実的に保ち、脆い「秘密の握手」収束を避ける。[cluster-02, 05]

10. **理論上、リッチ TCG に厳密解は存在しない**（MtG/遊戯王は決定不能）→ 近似（有界 lookahead + ヒューリスティック + 学習方策）が必須。そして **シミュレーション throughput（高速 vectorized rules engine）がボトルネック**になりがち。[cluster-03]

---

## 4. 「過去コンペで RL は勝ったのか？」— 重要な事実修正

調査で繰り返し確認された、直感に反する事実（戦略を誤らせやすいので明記）:

- **Halite IV (2020) の優勝はルールベース**（RL 専門家 Tom Van de Wiele の優勝 bot は rule-based 版）。
- **Lux AI Season 2 の優勝はルールベース + forward-sim 探索**（RL が勝ったのは **Season 1** のみ。S1 優勝 Toad Brigade は IMPALA + teacher KL 蒸留）。
- **Kore 2022 は完全情報** で、優勝はルールベース + flight-plan 探索。
- カードゲーム系 **LOCM** では、組織が「毎試合カードセットを生成して暗記を封じる」まで hardcode draft が支配的。封じた **2022 にようやく RL (ByteRL, fictitious play) が優勝**。

**含意**: 「不完全情報 + 確率 + 暗記不能（カードプール 2,000 枚・隠蔽情報）」という本コンペの設計は、まさに **学習・均衡探索が効く側**に倒れている。公式の「ルールベースだけでは上位困難」という見解と整合する。ただし **最初の一歩は探索 + determinization + imitation** が依然として最も費用対効果が高い。

---

## 5. 推奨ロードマップ（仮説）

```
Phase A: ベースライン構築（探索 + ヒューリスティック）
  └ cabt Engine の高速ラッパー → determinized lookahead + 強い評価関数 + リーサル検知
Phase B: 模倣学習（leaderboard 複製）
  └ 上位 replay を収集 → (観測, 行動index) を共有 NN で BC → ベースライン超え
Phase C: 探索 × 学習のハイブリッド
  └ 学習した方策/価値で ISMCTS (determinized) をガイド
Phase D: リーグ自己対戦で仕上げ
  └ 過去上位 agent の frozen pool + KL-to-teacher + 密報酬→勝敗報酬 anneal
横断: 安定性最優先（クラッシュ/タイムアウト/非合法手 = 敗北）。早期提出で σ を下げる。
Strategy track: デッキ構築の独創性 + アルゴリズムの工夫を技術レポート化。
```

---

## 6. 次フェーズへの引き継ぎ

- **gather**: 各クラスタの個別解法（writeup / GitHub / 論文）を `runs/kaggle_ptcg/gather/<date>_<cluster>/` に URL リスト化。
- **retrieval**: 最優先は cluster-02 (CFR/ISMCTS) と cluster-03 (LOCM/Hearthstone dynamic lookahead)、cluster-05 (DouZero/Suphx) のコード・論文の詳細レポート化。
- **既存ドメイン `kaggle_orbit_wars`** に `similar_competitions` / `imitation_learning` クラスタの蓄積があり、Kaggle Simulation 系の実装知見は再利用可能（読み取りのみ）。
