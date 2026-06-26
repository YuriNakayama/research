# cluster-01: 対象コンペ公式仕様 — Pokémon TCG AI Battle Challenge

> 戦略の前提となる「対象コンペそのもの」の確定仕様。Kaggle ページは自動 fetch だとタイトルしか取れないため、
> 公式プレス (AICU note) + 二次ソースで裏取りし、矛盾点は ⚠️ で明示する。

## 1. アイデンティティ

| 項目 | 値 | 出典 |
|------|----|------|
| 正式名称 | Pokémon Trading Card Game AI Battle Challenge（#PokécaABC） | AICU, PokeBeach |
| 開始日 | **2026/6/16** | AICU, PokeBeach, Dexerto, TechRaptor |
| 主催 | The Pokémon Company | 全ソース |
| 共催 | 東大 松尾研 (Matsuo Institute) / HEROZ Inc. | AICU, PokeBeach, Dexerto, insider-gaming |
| 協賛 | Google, Google Cloud, NVIDIA（ホストは Kaggle） | Shane the Gamer, Dexerto |
| プラットフォーム | Kaggle（2 つの別コンペとして稼働） | Kaggle URLs |

- Simulation: `https://www.kaggle.com/competitions/pokemon-tcg-ai-battle`
- Strategy: `https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy`

## 2. 2 トラック構成と審査

**Simulation Category**
- 開発した **AI agent を提出** → 連続自動ラダー対戦。
- **1 日あたり最大 5 agent 提出**（insider-gaming）。
- ガウス分布レーティングで採点（勝ちで μ↑ / 負けで μ↓）。
- **直接の賞金は無し**だが、Strategy 参加の前提。

**Strategy Category**
- **技術レポートを提出**。公式 (AICU): 「デッキ構築の独創性やAI開発におけるアルゴリズムの工夫をまとめた技術レポートが審査対象」。
- Round 1 の賞金はこちら側。

> ⚠️ **Strategy 採点の詳細に齟齬**: Shane the Gamer は「model approach 70% / deck concept 20% / report quality 10%、レポート 2,000 語上限」と報じるが、これは単一ソースで AICU 公式 note には無い → **未確認**として扱う。Dexerto/insider-gaming は「agent の安定性・デッキ設計・simulation 成績」と定性的に記述。

## 3. cabt Engine（シミュレータ）

- 松尾研が Kaggle 環境向けに構築した独自 Pokémon TCG バトルシミュレータ。ドキュメントは `matsuoinstitute.github.io/cabt/` 参照と報道。
- **毎ターンの観測（agent が受け取るもの）**:
  - ゲームログ (game log)
  - 盤面状態 (board state)
  - **合法手リスト** (list of legal moves)
- **行動 = 適切な行動の index を返す**（index ベース出力）。
- **時間制限**: 1 プレイヤーあたり **最大 10 分**。使い切ると **即敗北**。
- **カードプール**: 主催承認カードのみ。**Standard 約 2,000 枚**（insider-gaming, Let's Data Science）。
- **ルール**: 公式 Pokémon TCG (Standard) に**トーナメント向け調整**を加えたもの。
- **開発ツール**: Kaggle 環境を模した **SDK** を配布。「ローカルデバッグと**強化学習**に適する」と案内。

## 4. 不完全情報 + 確率性

- **隠蔽情報**: 相手手札・山札順（AICU: 「山札の順序や相手の手札など、重要なデータが隠された」）。
- **確率要素**: AICU 明記「カードのドローやコイントスといった確率的なランダム要素」。

## 5. 評価 / レーティング

- AICU: 「独自のガウス分布を用いたレーティングシステムによって **24時間自動対戦**が行われます」。
- 「順位は **リーダーボード上でリアルタイムに変動**」。
- → TrueSkill 系（μ, σ）の連続マッチメイク。Kaggle Simulation 標準の **score = μ − 3σ** と整合（cluster-04 参照）。

## 6. タイムライン

| マイルストーン | 日付 | 備考 |
|---------------|------|------|
| 開始 | 2026/6/16 | 全ソース |
| Round 1 / Competition Stage | 2026/6–8（Strategy は 9 月まで） | AICU, TechRaptor |
| Simulation チームマージ締切 | 2026/8/9 | Shane the Gamer |
| **Simulation 最終提出締切** | **2026/8/16** | AICU, PokeBeach, Shane the Gamer（⚠️ Dexerto は 8/17） |
| Strategy エントリ締切 | 2026/9/6 | Shane the Gamer |
| **Strategy 最終提出締切** | **~2026/9/13–14** | ⚠️ AICU/Dexerto は 9/14、Shane は 9/13 + 審査 9/14–10/11 |
| Round 2 / Final Stage | 2026/9 日本（東京）、Pokémon 公式 YouTube 配信 | PokeBeach, Dexerto, insider-gaming |

> ⚠️ **最大の齟齬: 決勝の時期**。ユーザー提示と PokeBeach/insider-gaming は「2026/9 日本」だが、**公式 AICU note は「2026年末以降」**、PokeBeach 構成欄は "Post-2026"、Shane は "later in 2026"。**決勝の正確な時期は公式確定していない** — 後半 (late 2026) 寄りの可能性。

## 7. 賞金

| 賞 | 金額 | 出典 |
|----|------|------|
| 総賞金プール | **"$300,000+"**（PokeBeach, insider-gaming）／⚠️ Shane は "$290,000+" | 下記注 |
| Round 1 — 上位 8 チーム (Strategy) | 各 **$30,000**（計 $240,000）→ Round 2 進出 | 全ソース |
| Round 2 — 1st | **$50,000** | AICU, PokeBeach, Dexerto |
| Round 2 — 2nd | **$30,000** | AICU, PokeBeach, Dexerto |
| 参加者全員 | **Google Cloud クレジット $3,000** | AICU, PokeBeach, Shane, TechRaptor |

> ⚠️ **$290k vs $300k**: 直接現金は 8×$30,000 + $50,000 + $30,000 = **$320,000** で計算が合うため "$300,000+" は妥当。"$290k" は単一アウトレットの framing。Dexerto の「総額 $50,000」は Round 2 winner と総額を混同した誤り。

## 8. チーム・参加資格

- **チーム規模**: 個人〜最大 5 名（AICU: 「個人でも最大5名のチームでも無料で参加可能」）。
- **参加費**: 無料（Kaggle アカウントが必要）。
- **資格**: 世界中から参加可（PokeBeach 抽出）。国別/年齢制限の詳細は二次ソースに無く未確認。

## 9. 手法に関する公式見解

- **確認済み（ルールベースでは不十分）**: 「ルールベースのプログラミングだけでは高い順位は保証されない。Pokémon TCG で勝つには先読み・リアルタイム適応・不確実性下の最適意思決定が必要」（Let's Data Science / Shane the Gamer がほぼ逐語）。
- SDK は「ローカルデバッグと**強化学習**に適する」と案内 → **RL を想定手法として示唆**。ただし AICU 公式 note は具体手法名（RL/imitation 等）を明示していない → 手法推奨は **press の framing** として扱う。

## 10. 戦略上の含意

1. **行動 index I/F** は DouZero 型「各候補手をエンコードして (state, action) 採点」と相性が良い（cluster-05）。
2. **合法手リストが毎ターン与えられる** → 候補生成のコストを engine 側が肩代わり。探索/評価に集中できる。
3. **10 分/プレイヤー** の予算 → 試合全体での時間配分（重要局面に深い探索を割く anytime 設計）が必要。
4. **隠蔽情報 + 暗記不能なカードプール** → 探索 + determinization + 学習が効く側（cluster-04 §4 の事実修正参照）。
5. **Strategy track が賞金の本体** → agent 性能だけでなく **デッキ構築の独創性 + アルゴリズムの工夫を言語化**する準備を並行する。

## 出典

- [AICU 公式プレス (EN)](https://note.com/aicu/n/ne9cc5c7b4157?hl=en) — レーティング・不完全情報・チーム規模・無料参加の逐語を含む一次寄り
- [PokéBeach — "$300,000+ in Prizes"](https://www.pokebeach.com/2026/06/the-pokemon-company-launches-ai-competition-to-build-the-strongest-pokemon-tcg-player-featuring-300000-in-prizes)
- [Shane the Gamer — "$290,000 Prize Pool"](https://www.shanethegamer.com/esports-news/pokemon-tcg-ai-battle-challenge/) — 配点・締切・SDK/RL・ルールベース見解
- [Dexerto](https://www.dexerto.com/pokemon/pokemon-tcg-launches-ai-battle-challenge-with-50000-prize-pool-3376414/)
- [insider-gaming](https://insider-gaming.com/pokemon-ai-tcg-competition/) — 約 2,000 枚 Standard、5 提出/日
- [Let's Data Science](https://letsdatascience.com/news/pokemon-co-launches-tcg-ai-battle-challenge-5815ece4)
- [Kaggle Simulation](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle) / [Kaggle Strategy](https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy)（fetch ではタイトルのみ）
