# Resources: rl_methods

Orbit Wars 向けの **自己対戦深層強化学習** 手法・論文・実装。上位解法の最有力候補。

## 基盤論文 — Self-play / League

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **AlphaStar (Nature 2019)** | https://www.nature.com/articles/s41586-019-1724-z | 論文 | StarCraft II Grandmaster 達成、league training の原典 |
| 2 | AlphaStar DeepMind blog | https://deepmind.google/blog/alphastar-grandmaster-level-in-starcraft-ii-using-multi-agent-reinforcement-learning/ | Blog | league 構造・学習フロー解説 |
| 3 | Deciphering AlphaStar on StarCraft II | https://cyk1337.github.io/notes/2019/07/21/RL/DRL/Decipher-AlphaStar-on-StarCraft-II/ | Blog | ネットワーク・観測表現の詳細 |
| 4 | An Overdue Post on AlphaStar (Part 2) | https://www.alexirpan.com/2019/02/22/alphastar-part2.html | Blog | 実装洞察と限界論 |
| 5 | KDnuggets AlphaStar RL methods | https://www.kdnuggets.com/2019/11/reinforcement-learning-methods-alphastar-outcompete-human-players-starcraft.html | Article | 手法要点 |
| 6 | Robust and Opponent-Aware League Training (NeurIPS 2023) | https://proceedings.neurips.cc/paper_files/paper/2023/file/94796017d01c5a171bdac520c199d9ed-Paper-Conference.pdf | 論文 | league の改良手法 |
| 7 | SCC: Efficient Deep RL Agent for StarCraft II | https://arxiv.org/pdf/2012.13169 | 論文 | AlphaStar 再現・効率化 |

## AlphaZero / MuZero 系

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 8 | **Multiagent Gumbel MuZero (AAAI 2024)** | https://ojs.aaai.org/index.php/AAAI/article/view/29121 | 論文 | 組合せ行動空間での効率的プランニング、Orbit Wars の多艦派遣に直結 |
| 9 | Policy Improvement by Planning with Gumbel | https://davidstarsilver.wordpress.com/wp-content/uploads/2025/04/gumbel-alphazero.pdf | 論文 | Gumbel AlphaZero 原論文 |
| 10 | Gumbel MuZero for 2048 (IEEE 2023) | https://ieeexplore.ieee.org/document/10056566/ | 論文 | 実装検証 |
| 11 | Improving MuZero using Gumbel top-k | https://medium.com/correll-lab/planning-with-gumbel-036018b180bf | Blog | top-k sampling 解説 |
| 12 | Empirical Analysis of Gumbel MuZero | https://link.springer.com/chapter/10.1007/978-981-97-1711-8_25 | 論文 | 確率的ゲームでの評価 |
| 13 | **LightZero (NeurIPS 2023 Spotlight)** | https://github.com/opendilab/LightZero | GitHub | MCTS 系 RL の統一ベンチ/実装 |
| 14 | MiniZero | https://github.com/rlglab/minizero | GitHub | AlphaZero/MuZero 学習フレームワーク |
| 15 | enpasos/muzero | https://github.com/enpasos/muzero | GitHub | MuZero Java 実装 |

## PPO / Actor-Critic 系

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 16 | **The 37 Implementation Details of PPO** | https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/ | ICLR Blog | PPO 実装落とし穴の教科書、必読 |
| 17 | Hugging Face PPO guide | https://huggingface.co/blog/deep-rl-ppo | Blog | 入門 |
| 18 | IBM What is PPO | https://www.ibm.com/think/topics/proximal-policy-optimization | Article | 理論解説 |
| 19 | Lightning AI PPO tutorial | https://lightning.ai/pages/community/tutorial/how-to-train-reinforcement-learning-model-to-play-game-using-proximal-policy-optimization-ppo-algorithm/ | Tutorial | 実装チュートリアル |
| 20 | PPO self-play (Unity Tennis) | https://github.com/ImmanuelXIV/ppo-self-play | GitHub | 2P self-play の最小実装 |

## RTS 特化 RL

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 21 | **A Competition Winning DRL Agent in microRTS (2024)** | https://arxiv.org/html/2402.08112v2 | 論文 | DoubleCone NN + self-play + transfer learning、Kore/Orbit系に近い |
| 22 | MicroRTS-Py (Farama) | https://github.com/Farama-Foundation/MicroRTS-Py | GitHub | RL用 RTS 環境 |
| 23 | Deep RTS | https://arxiv.org/pdf/1808.05032 | 論文 | 軽量 RTS 環境 |
| 24 | cair/deep-rts | https://github.com/cair/deep-rts | GitHub | DRTS 実装 |

## 観測エンコーディング（Entity Transformer）

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 25 | Transformer in Video Games | https://tsmatz.wordpress.com/2021/11/11/reinforcement-learning-visual-attention-in-minecraft/ | Blog | visual attention を RL に応用 |
| 26 | Do We Need Transformers to Play FPS (2025) | https://arxiv.org/html/2504.17891 | 論文 | FPS での Transformer 必要性議論 |

## Orbit Dynamics 特化 RL

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 27 | **OrbitZoo: Multi-Agent RL Environment for Orbital Dynamics (arXiv:2504.04160)** | https://arxiv.org/html/2504.04160v1 | 論文 | 軌道力学 MARL 環境、Orbit Wars の軌道要素に直結 |

## 実装基盤・フレームワーク

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 28 | CleanRL | — | GitHub | PPO 単一ファイル実装 |
| 29 | Ray RLlib | — | GitHub | 分散 RL、league 対応 |
| 30 | Sample Factory | — | GitHub | 高速 on-policy RL |
| 31 | HandyRL (DeNA) | — | GitHub | Hungry Geese 等で実績、軽量 |

## 報酬設計 / Curriculum

- Kore / Halite で有効だった shape: 惑星数差分、艦数差分、production 差分、win-lose sparse + dense mix
- Curriculum: 1 vs random → self-play → league exploiter → 4P 切替
- Imitation warmup: 上位 public bot のエピソード収集 → BC → RL fine-tune

## 戦略的含意（メモ）

- **AlphaStar 型 league** が最強だが 4P 対応は未確立。main / exploiter / league exploiter の基本構成を 2P で確立後、4P に拡張
- **Gumbel MuZero 系** は組合せ行動空間（多艦派遣、角度）に特に有効
- **PPO + prioritized fictitious self-play** が Kore 2022 / Lux S2 上位の主流、計算コスト面で現実的な第一候補
- **Entity Transformer** で planets / fleets / comets を単一トークンとして扱えば、可変数 entity 対応
- **actTimeout 1秒** は PUCT / MCTS にはタイト。事前計算 + 軽量ネットワーク or value-only approximation が必須
