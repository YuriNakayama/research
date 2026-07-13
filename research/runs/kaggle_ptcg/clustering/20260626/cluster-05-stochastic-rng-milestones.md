# cluster-05: RNG 重め大規模確率ゲームのマイルストーン

> **確率性 + 巨大・ターン可変の行動空間**が本コンペと同型。麻雀/闘地主の知見が特に直接効く。

## A. Suphx — 麻雀 (Microsoft Research, 2020)

- **構造**: 4P、重い隠蔽情報（手 + 山）+ 重いドロー RNG、遅延した試合単位スコア。
- **手法**: 人間ログで SL 事前学習 → 自己対戦 RL。3 つの特徴的工夫:
  1. **Global Reward Prediction** — 疎な試合終了時順位を、密な per-decision シグナルへ変換。
  2. **oracle guiding** — 完全情報 oracle を学習し、隠れ特徴を anneal して不完全情報 agent へ蒸留。
  3. **run-time policy adaptation (pMCPA)** — 実際に配られた手にオンライン fine-tune。
- 天鳳ランク人間の 99.99% を上回る。
- **転用教訓**: 真の目的が遅延した試合単位結果なら **明示的な global reward predictor** を学習し、配られた手/盤面へ **run-time 適応**する。
- 出典: [Suphx, arXiv:2003.13590](https://arxiv.org/abs/2003.13590)

## B. DouZero — 闘地主 (Kuaishou, ICML 2021)

- **構造**: 3P、協力/競争混在、**巨大でターン可変の行動空間 (~27,000 手種)**、隠れ手 + 配牌 RNG。
- **手法**: **Deep Monte Carlo (DMC)** — MC 価値推定を深層化。**各候補行動をカード行列としてエンコード**し、共有ネットで (state, action) を採点（固定行動ヘッドなし）。大規模並列自己対戦、人間データ/探索/抽象化なし。Botzone を数日で制覇。
- **転用教訓（本コンペに最重要）**: **大規模・ターン可変の合法手集合（まさに TCG）には、各候補手をエンコードして (state, action) を共有ネットで採点**せよ（固定出力ヘッドにしない）。頑健な MC リターン + 並列自己対戦と組合せる。本コンペの **行動 index I/F に直接マッピング可能**。
- 出典: [DouZero, arXiv:2106.06135](https://arxiv.org/abs/2106.06135)

## C. ブリッジ — NooK/NukkAI (2022) + 古典 bot

- **構造**: 4P、2 組、隠れ手、ビッディング = 協力的シグナリング。
- **手法**: NooK = neuro-symbolic ハイブリッド（カードプレイ局面で世界王者 8 人に 83% 勝利、ただしビッディング=通信は未解決）。古典 bot (GIB, Jack, Wbridge5) は **determinization / double-dummy シミュレーション** — 観測履歴に整合する配牌をサンプリングし各々を完全情報で解いて平均。
- **転用教訓**: **determinization（履歴整合の完全状態をサンプリング → 完全情報で解く → 集約）は不完全情報プレイの強く単純なベースライン**。行動が伝える情報は別個のモデリング問題。

## D. Maven — Scrabble (Sheppard, AI journal 2002)

- **構造**: 隠れた相手ラック + ランダムタイル引き。
- **手法**: 選択的 move 生成 → **シミュレーション**（未見タイルから相手ラックをサンプリングし roll forward、得点差分布を比較）で中盤評価。終盤は隠れ空間が縮むと **B\*** 探索。
- **転用教訓**: **サンプリングした隠れ状態上のシミュレーションは隠蔽情報 + RNG 下で手を評価する有効手段。ゲーム phase で評価 regime を切替**（序盤は統計シミュレーション、終盤は厳密探索）。

## E. AlphaStar (SC2) & OpenAI Five (Dota2), 2019

- **AlphaStar**: SL imitation 初期化 → **multi-agent league training**（main / main exploiter / league exploiter）を **Prioritized Fictitious Self-Play (PFSP)** でマッチング、人間 prior へ蒸留。Grandmaster。
- **OpenAI Five**: 純大規模自己対戦 PPO、>150M params LSTM、"Team Spirit" 報酬 shaping。
- **転用教訓**: **naive self-play は少数 archetype に過学習し exploitable な均衡に収束。集団/リーグ学習 + 明示的 exploiter (PFSP) で全戦略空間に頑健化** — 連続自己対戦でランク付けされる TCG metagame に極めて関連。
- 出典: [OpenAI Five, arXiv:1912.06680](https://arxiv.org/abs/1912.06680)

## F. CICERO — Diplomacy (Meta, 2022)

- **構造**: 7P、同時手、隠れ意図、NL 交渉。自己対戦だけでは解けない（人間と協力必須）。
- **手法**: **piKL** — 人間模倣方策にアンカーした KL 正則化 planning/均衡探索。相手予測も自分の方策も human-realistic に保つ。人間上位 10%。
- **転用教訓**: **探索/RL を人間模倣 prior にアンカー (piKL) し、相手モデルを現実の相手分布に保ち、方策が exploitable な非人間的極端へ崩れるのを防ぐ**。

## G. 本コンペへの転用まとめ

| 工夫 | 出典 | 本コンペでの使い所 |
|------|------|-------------------|
| **(state, action) を共有ネットで採点** | DouZero | 行動 index I/F に直結。最優先で試す |
| **determinization + シミュレーション** | ブリッジ/Maven | 隠れ手札・山札順のサンプリング評価 |
| **Global Reward Prediction** | Suphx | 勝敗（試合単位）を密な per-turn シグナルへ |
| **run-time 適応 (pMCPA)** | Suphx | 配られた初手/相手デッキ傾向への適応 |
| **oracle guiding** | Suphx | 完全情報 oracle から不完全情報 agent へ蒸留 |
| **phase で評価 regime 切替** | Maven | 終盤（山札残少）は厳密探索へ |
| **league + PFSP** | AlphaStar | metagame 過学習回避（cluster-04 と整合） |
| **piKL アンカー** | CICERO | 人間/上位 replay 分布へ方策を寄せる |
