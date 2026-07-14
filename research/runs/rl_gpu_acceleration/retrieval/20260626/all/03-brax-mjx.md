# 03. Brax / MJX（Google DeepMind）— GPU/TPU 物理シミュレーション

## Brax

**一言で言うと**: JAX で書かれた高速・完全微分可能な剛体物理エンジン。GPU/TPU 上での大規模並列 RL/ロボティクスシミュレーション向け。

| 項目 | 値 | 出典 |
|------|-----|------|
| GitHub | https://github.com/google/brax | github.com/google/brax |
| Star（概算） | ~3.2k | https://github.com/google/brax |
| 最新版 | **v0.14.2**（2026-03-15 リリース、開発ステータス "4 - Beta"） | https://pypi.org/project/brax/ |

**リリース頻度（検証済み）**: 0.14.2（2026-03-15）← 0.14.1（2026-02-12）← 0.14.0（2025-12-16）← 0.13.0（2025-08-15）。2026 年央時点で活発にメンテナンスされている。出典: https://pypi.org/project/brax/

**物理バックエンド**: 4 種 — **generalized**（一般化座標）、**positional**（Position-Based Dynamics）、**spring**（インパルスベース）、**MJX**（MuJoCo XLA）。出典: https://github.com/google/brax

**組込み RL バックエンド**: PPO、SAC、ARS（Augmented Random Search）、進化戦略（ES）、解析的方策勾配（analytic policy gradients）。出典: https://github.com/google/brax

**性能主張（検証済み）**:

- 「Brax は **TPU 上で毎秒数百万の物理ステップ**で環境をシミュレートする」。出典: https://github.com/google/brax
- 原論文（NeurIPS 2021）: 「Brax は物理エンジンと RL オプティマイザを同一の GPU/TPU チップ上に置き、RL 訓練の速度/コストを **100–1000x** 改善する」。使用ハードウェア: **TPU v3**（4x2 および 8x8 トポロジ）、TPU v2（Colab）、CPU ベースライン（Intel Xeon 128-core @2.2GHz, 32-core）。wall-clock: Brax は性能の良い Ant 移動を ~10 秒で達成、標準 PPO の ~30 分に対して。出典: https://ar5iv.labs.arxiv.org/html/2106.13281 (arXiv:2106.13281)
- ⚠️ **著者自身のフラグ**: 「エンジン間の完全に apples-to-apples な比較は困難」 — 100–1000x はハードウェアを厳密にそろえた比較ではない。出典: 同 arXiv 論文

**MuJoCo との関係**: Brax の README は現在、ユーザーに **Brax ネイティブ環境より MuJoCo Playground / MJX / MuJoCo-Warp を優先するよう推奨**している。Brax は今や `mujoco-mjx` パッケージに*依存*しており、Brax の元の **generalized パイプラインはもうメンテナンスされていない**（MJX がその後継）。出典: https://github.com/google/brax , https://mujoco.readthedocs.io/en/stable/mjx.html

## MJX（MuJoCo XLA）

**一言で言うと**: MuJoCo 物理エンジンの JAX/XLA 再実装。アクセラレータ上で多数の同一並列シーンをバッチシミュレートし、高スループット RL を実現する。

| 項目 | 値 | 出典 |
|------|-----|------|
| GitHub | https://github.com/google-deepmind/mujoco（`mjx/` サブディレクトリ）; PyPI: `mujoco-mjx` | mujoco.readthedocs.io |
| Star | MuJoCo 本体リポジトリに内包（MJX 単独 star 数は非公表 → **個別には検証不能・要フラグ**） | — |
| 最新状態 2026 | MuJoCo プロジェクトの一部として活発にメンテナンス。**Brax の generalized パイプラインの後継**として文書化 | https://mujoco.readthedocs.io/en/stable/mjx.html |

**用途/Brax との関係**: 「MuJoCo の各種実装に対する JAX API」で、「大規模な並列同一物理シーンのバッチシミュレーション」に特化、「大量データスループット」を要する RL 向け。「Google の Brax ライブラリの generalized 物理パイプラインの**後継**」。出典: https://mujoco.readthedocs.io/en/stable/mjx.html

**対応ハードウェア**: XLA がサポートするもの全て — Nvidia/AMD GPU、Apple Silicon、Google Cloud TPU。出典: https://mujoco.readthedocs.io/en/stable/mjx.html

**性能数値（検証済み・バッチ humanoid シミュレーション steps/秒）**:

| ハードウェア | steps/秒 |
|------------|----------|
| Apple M3 Max | 650K |
| AMD 3995WX | 1.8M |
| Nvidia A100 | 950K |
| Google v5 TPU | 2.7M |

- **単一シーン（非バッチ）**: MJX は **CPU MuJoCo より ~10x 遅い**ことがある — 速度優位はヘビーなバッチ化下でのみ顕在化する。
- 出典（上記すべて）: https://mujoco.readthedocs.io/en/stable/mjx.html
- ⚠️ 二次集約サイト（Emergent Mind）はより広い「10–50x スループット」「Gazebo/IsaacSim 比で 20–40x 高速な方策訓練」を挙げるが、これらは**公式 MuJoCo ドキュメント由来ではなく、一次ソースで独立検証できなかった** → 低信頼度フラグ。出典: https://www.emergentmind.com/topics/mujoco-xla-mjx

**JAX 特有のコスト（重要）**: MJX では**接触計算時間が「アクティブな接触数」ではなく「ありうる接触数」にスケールする** — これは JAX のコンパイル時静的 shape 要件の直接的帰結である（詳細はレポート 08 参照）。出典: https://arxiv.org/pdf/2502.08844

## Newton / MuJoCo-Warp（より新しい GPU 物理）

- **Newton**: NVIDIA Warp + OpenUSD ベースのオープンソース物理エンジン。**NVIDIA・Google DeepMind・Disney Research** の共同開発、Linux Foundation 管理、Apache 2.0。**GTC 2025（2025-03-18 発表）**。出典: https://developer.nvidia.com/blog/announcing-newton-an-open-source-physics-engine-for-robotics-simulation/
- **MuJoCo-Warp（MJX-Warp）**: DeepMind による GPU 最適化 MuJoCo 再実装（Warp 上）。「MJX-JAX で見られた幾つかの性能ボトルネック（接触/制約）を解消」するが、**自動微分は非対応**。NVIDIA 公称高速化: **humanoid シミュレーションで 70x、in-hand manipulation で 100x**。出典: https://developer.nvidia.com/blog/announcing-newton-... , https://mujoco.readthedocs.io/en/stable/mjx.html。⚠️ 70x/100x のベースライン（CPU MuJoCo か MJX-JAX か）は NVIDIA 投稿で明確には記されていない。

## 検証フラグ

1. **MJX 単独 star 数**: MuJoCo 本体に内包され分離不能。**検証不能**。
2. **MJX「10–50x」「20–40x」**: 二次集約サイトのみ。低信頼度。
3. **Brax 100–1000x**: 公表値だが並列数/ハードウェアは厳密にそろっておらず、著者自身が比較の留保を明記。
4. **MuJoCo-Warp 70x/100x**: ベースラインが NVIDIA 発表で明確でない。

## 出典

- https://github.com/google/brax
- https://pypi.org/project/brax/
- https://ar5iv.labs.arxiv.org/html/2106.13281 (Brax 論文, arXiv:2106.13281)
- https://mujoco.readthedocs.io/en/stable/mjx.html
- https://arxiv.org/pdf/2502.08844 (MuJoCo Playground)
- https://developer.nvidia.com/blog/announcing-newton-an-open-source-physics-engine-for-robotics-simulation/
- https://www.emergentmind.com/topics/mujoco-xla-mjx （二次・低信頼度）
