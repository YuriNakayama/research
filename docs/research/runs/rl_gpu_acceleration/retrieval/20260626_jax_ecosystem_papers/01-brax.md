# Brax — 大規模剛体シミュレーション向け微分可能物理エンジン

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem` / retrieval（個別 deep-dive）

## 基本情報

| 項目 | 内容 |
|------|------|
| タイトル | Brax -- A Differentiable Physics Engine for Large Scale Rigid Body Simulation |
| 著者 | C. Daniel Freeman, Erik Frey, Anton Raichuk, Sertan Girgin, Igor Mordatch, Olivier Bachem |
| 年 | 2021（投稿日: 2021-06-24） |
| venue | NeurIPS 2021 Datasets and Benchmarks Track（"In submission" 表記） |
| arXiv ID | 2106.13281 |
| URL | https://arxiv.org/abs/2106.13281 |
| 所属 | Google Research / Google Brain |

## 課題・背景

従来の RL 物理シミュレーション（MuJoCo 等）は CPU 上で逐次的に実行され、環境ステップが学習ループのボトルネックになっていた。GPU/TPU 上の学習器と CPU 上の環境の間で恒常的にデータ転送が発生し、アクセラレータの並列性を活かしきれない。Brax は「物理エンジンそのものをアクセラレータ上で動かし、学習アルゴリズムと同一デバイスでコンパイルする」ことでこの host-device 間ボトルネックを排除することを狙う。

## 提案手法・コア機構

- **JAX で全面実装された剛体物理エンジン**: 剛体シミュレーションを JAX の純関数として記述し、XLA でコンパイルしてアクセラレータ上で実行する。これにより物理計算が微分可能（differentiable）となり、勾配ベースの直接ポリシー最適化（direct policy optimization）が可能。
- **環境と学習アルゴリズムの同一デバイス・コンパイル**: 要旨より verbatim 引用 — *"we provide reimplementations of PPO, SAC, ES, and direct policy optimization in JAX that compile alongside our environments, allowing the learning algorithm and the environment processing to occur on the same device, and to scale seamlessly on accelerators."* 学習と環境を一体コンパイルすることで host-device 転送を排し、`jit` による end-to-end 最適化が効く。
- **`vmap` による大規模並列環境**: 多数の環境インスタンスを `jax.vmap` でバッチ化し、単一アクセラレータ上で数千の環境を同時に進める（accelerator 上の parallelism を要旨が前面に掲げる: *"a focus on performance and parallelism on accelerators, written in JAX"*）。
- **`lax.scan` によるロールアウト**: 軌跡の時間方向アンロールを Python ループではなく `lax.scan` で表現し、XLA がループ全体を融合コンパイルできるようにする（JAX RL の標準パターン。Brax 環境 + PPO の実装で採用される）。
- **アルゴリズム再実装**: PPO・SAC・ES・direct policy optimization を JAX で再実装し、環境と同時コンパイル。

## 主要な定量結果

要旨に含まれる定量主張は1点のみで、speedup 倍率や FPS の明示はない。

- VERBATIM: *"we include notebooks that facilitate training of performant policies on common OpenAI Gym MuJoCo-like tasks in minutes."*
  - 条件: 「common OpenAI Gym MuJoCo-like tasks」の学習が「minutes（数分）」で完了、という時間表現のみ。ベースライン（CPU 実装比何倍か）や具体的 FPS は要旨では提示されていない。

注意: Brax の「数分で学習」は、後続の PureJaxRL 系論文が引用する「単一 GPU での桁違い高速化」の文脈で語られることが多いが、本論文の**要旨自体は倍率を明記していない**。倍率付き主張を引用する場合は本文・後続研究の数値であることを明示すること。

## JAX エコシステムにおける位置づけ

- JAX による「環境をアクセラレータ上に載せる」設計の代表的・初期の実例。Podracer（2104.06272）が分散アーキテクチャ側の原典なら、Brax は**物理環境を JAX 化した原典**にあたる。
- 後続の PureJaxRL / Discovered Policy Optimisation（2210.05639）は Brax 環境を主要ベンチマークとして用い、`jit`+`vmap`+`lax.scan` による単一 GPU 高速化を実証した。本クラスタ内で Brax は「環境レイヤ」の基盤。
- MJX（MuJoCo XLA）が後に登場し、Brax は物理バックエンドとして MJX を統合する方向へ発展（要旨範囲外）。
- `pytorch_native` クラスタの Isaac Gym / Isaac Lab（GPU 上物理）と直接の比較対象になる JAX 側の代表格。

## 限界・注意点

- 要旨では speedup 倍率・絶対 FPS を提示しないため、「Brax は N 倍速い」という記述は本論文単独では裏付けられない。横断比較表では「数分で学習」という質的主張に留める。
- 剛体物理の近似（接触・摩擦のモデル化）に伴う sim-to-real ギャップは JAX 化とは独立の課題。
- 微分可能性は direct policy optimization で活きるが、勾配の分散・不連続接触の扱いなど微分可能物理特有の難しさが残る（本論文の主眼は基盤提供）。

## 出典

- arXiv abstract page: https://arxiv.org/abs/2106.13281 （WebFetch でタイトル・著者・要旨・venue を照合、2026-06-26）
