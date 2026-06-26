# Craftax — オープンエンド RL のための超高速ベンチマーク

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem` / retrieval（個別 deep-dive）

## 基本情報

| 項目 | 内容 |
|------|------|
| タイトル | Craftax: A Lightning-Fast Benchmark for Open-Ended Reinforcement Learning |
| 著者 | Michael Matthews, Michael Beukman, Benjamin Ellis, Mikayel Samvelyan, Matthew Jackson, Samuel Coward, Jakob Foerster |
| 年 | 2024（投稿日: 2024-02-26、改訂 2024-06-03） |
| venue | ICML 2024 |
| arXiv ID | 2402.16801 |
| URL | https://arxiv.org/abs/2402.16801 |
| 所属 | University of Oxford (FLAIR) ほか |

## 課題・背景

オープンエンド学習研究用の既存ベンチマークは2極に分かれる。(1) Crafter・NetHack・Minecraft のように**意味ある研究には遅すぎ膨大な計算資源を要する**もの、(2) Minigrid・Procgen のように**十分な挑戦性を持たない**もの。両者の隙間を埋める、複雑かつ高速なオープンエンド環境が必要。

## 提案手法・コア機構

- **Craftax-Classic**: Crafter を JAX で**ゼロから書き直した（ground-up rewrite）**高速版。要旨 VERBATIM — *"we first present Craftax-Classic: a ground-up rewrite of Crafter in JAX that runs up to 250x faster than the Python-native original."*
- **Craftax（本体）**: Crafter のメカニクスを大幅拡張し NetHack 由来要素を加えたベンチマーク。深い探索・長期計画・記憶・新規状況への継続適応を要求。
- **JAX 機構の使われ方**: 環境を純関数として実装し `jit` で XLA コンパイル。多数環境を `vmap` で並列化、ロールアウトを `lax.scan` でアンロールして、単一 GPU 上で 10 億規模のインタラクションを高速処理する（PureJaxRL 系の標準パターン。要旨が掲げる「単一 GPU・1B インタラクションを1時間未満」がこれを裏付ける）。

## 主要な定量結果（VERBATIM・条件付き）

要旨 VERBATIM: *"Craftax-Classic: a ground-up rewrite of Crafter in JAX that runs up to 250x faster than the Python-native original. A run of PPO using 1 billion environment interactions finishes in under an hour using only a single GPU and averages 90% of the optimal reward."*

| 主張 | 値 | ベースライン/条件（**必ず併記**） |
|------|-----|-----------------------------------|
| 速度倍率 | **up to 250x faster** | 対象は **Craftax-Classic** のみ。ベースラインは **Python-native original（オリジナル Crafter の Python 実装）**。「up to」付き上限値。 |
| 学習時間 | **under an hour** | **PPO・1 billion environment interactions・単一 GPU（single GPU）**での所要時間。 |
| 性能 | **averages 90% of the optimal reward** | 上記 PPO ランで最適報酬の平均 90% に到達。 |

**注意**: 「250x」は **Craftax-Classic（軽量版）** が **Python-native Crafter** に対して持つ上限倍率。本体 Craftax（拡張版）の倍率ではない。引用時は「Craftax-Classic、Python オリジナル比、最大 250x」と条件付けすること。

## JAX エコシステムにおける位置づけ

- 本クラスタの **オープンエンド RL** 枠の代表。Crafter（Python）の JAX 移植により「軽量計算資源でオープンエンド研究」を可能にした。
- Oxford FLAIR（Matthews, Beukman, Ellis, Foerster ら）の JAX RL 群の一つで、後続の Kinetix（同じ Matthews/Beukman/Lu/Foerster）と直系。PureJaxRL 系の「単一 GPU で 1B インタラクションを1時間」という性能訴求の典型例。
- ベンチマークとしての価値: 既存手法（global/episodic exploration、unsupervised environment design）が本体 Craftax で**実質的な進展を出せない**ことを示し、未解決の難問を提供。

## 限界・注意点

- 「250x」は **Craftax-Classic** 限定の倍率で、フル Craftax の難易度・速度を表すものではない。
- 高速化は環境側であり、本体 Craftax の課題（深い探索・長期記憶）は依然未解決（要旨が既存手法の失敗を明示）。
- 「90% of optimal reward」は Craftax-Classic での値。本体 Craftax では既存手法は苦戦する。

## 出典

- arXiv abstract page: https://arxiv.org/abs/2402.16801 （WebFetch でタイトル・著者・要旨・定量主張を verbatim 照合、2026-06-26）
