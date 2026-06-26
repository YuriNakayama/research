# Discovered Policy Optimisation（PureJaxRL 系譜）

ドメイン `rl_gpu_acceleration` / クラスタ `jax_ecosystem` / retrieval（個別 deep-dive）

## 基本情報

| 項目 | 内容 |
|------|------|
| タイトル | Discovered Policy Optimisation |
| 著者 | Chris Lu, Jakub Grudzien Kuba, Alistair Letcher, Luke Metz, Christian Schroeder de Witt, Jakob Foerster |
| 年 | 2022（投稿日: 2022-10-11、改訂 2022-10-13） |
| venue | NeurIPS 2022 |
| arXiv ID | 2210.05639 |
| URL | https://arxiv.org/abs/2210.05639 |
| 所属 | University of Oxford (FLAIR) ほか |

## 課題・背景

RL アルゴリズムは数学的導出・直感・実験の組合せで人手設計されてきたが、人間の理解と工夫に限界がある。一方、最小限の事前構造で RL アルゴリズムを発見する black-box メタ学習はこれまで人手設計アルゴリズムを上回れなかった。本論文は中間策として **Mirror Learning**（PPO を含む RL アルゴリズム群を包含し、各手法が理論保証を持つが差異化要素は設計余地がある枠組み）に着目し、その設計余地である「drift 関数」をメタ学習する。

## 提案手法・コア機構

- **LPO（Learnt Policy Optimisation）**: Mirror Learning 空間の drift 関数をニューラルネットでメタ学習した結果。要旨 VERBATIM: *"we explore the Mirror Learning space by meta-learning a 'drift' function. We refer to the immediate result as Learnt Policy Optimisation (LPO)."*
- **DPO（Discovered Policy Optimisation）**: LPO を解析して得た洞察から導出した**閉形式（closed-form）の新規 RL アルゴリズム**。要旨 VERBATIM: *"By analysing LPO we gain original insights into policy optimisation which we use to formulate a novel, closed-form RL algorithm, Discovered Policy Optimisation (DPO)."*
- **PureJaxRL 高速化基盤の活用（本クラスタでの位置づけの核）**: メタ学習による drift 関数の最適化は、内ループ（RL 学習）を膨大回数回す必要があり計算量が大きい。本研究系（Lu ら / PureJaxRL）は **JAX の `jit`+`vmap`+`lax.scan` による end-to-end コンパイル**で、単一 GPU 上に多数の環境・複数シードを並列展開し内ループを高速回転させる手法（PureJaxRL）を確立した。これにより Brax 環境上でのメタ学習が現実的計算資源で可能になっている。
  - 環境ロールアウトは `lax.scan` でアンロール、複数環境/シードは `vmap` で並列化、全体を `jit` で 1 つの XLA プログラムに融合。
  - （注: これらの JAX 機構の詳細は要旨本文ではなく、PureJaxRL ライブラリ/ブログおよび後続研究の共通設計に基づく文脈説明であり、本論文要旨は手法の理論面を中心に記述している。）

## 主要な定量結果

要旨に具体的な speedup 倍率・FPS・数値メトリクスは**含まれない**。性能は質的主張のみ。

- VERBATIM: *"Our experiments in Brax environments confirm state-of-the-art performance of LPO and DPO, as well as their transfer to unseen settings."*
  - 条件: ベンチマークは **Brax 環境**。LPO・DPO が SOTA 性能を達成し、未見設定（unseen settings）への転移も確認、という質的記述。具体的スコア・倍率は要旨に非掲載。

注意: 本論文の貢献は「速度」ではなく「メタ学習で発見した新アルゴリズム（DPO）が PPO 等の人手設計手法に匹敵/凌駕する」点。JAX 高速化は**実験を可能にした手段**であって、本論文が speedup 倍率を主張しているわけではない。横断比較で速度数値を引用してはならない。

## JAX エコシステムにおける位置づけ

- **PureJaxRL 系譜の代表的成果**。PureJaxRL（Chris Lu）が示した「単一 GPU 上で RL を数千倍速く回す」基盤の上で初めて現実的になった「メタ学習で RL アルゴリズム自体を発見する」研究。Anakin 流（全部アクセラレータ上）の応用例。
- Foerster 研（Oxford FLAIR）の一連の JAX RL 研究（JaxMARL, Craftax, Kinetix）と同じ系譜・共著者ネットワークに属し、JAX 高速化が「新しい研究問題（メタ RL/アルゴリズム発見）を開く」ことを実証した点で本クラスタの思想的中核。

## 限界・注意点

- メタ学習で発見した drift 関数の解釈性は限定的（LPO はブラックボックス、そこから閉形式 DPO を抽出するのが工夫）。
- SOTA 主張は Brax 環境上の評価に基づく。離散制御・大規模環境への一般化は要旨範囲外。
- 速度の数値主張は本論文にないため、本クラスタの speedup 一覧には「該当なし（質的に SOTA）」として扱う。

## 出典

- arXiv abstract page: https://arxiv.org/abs/2210.05639 （WebFetch でタイトル・著者・要旨・venue を照合、2026-06-26）
