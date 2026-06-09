# Double/Debiased Machine Learning for Treatment and Causal Parameters

> CATE/因果効果推定の精度向上の観点で読む詳細レポート。
> Neyman 直交性と cross-fitting がいかにして正則化バイアス・過学習バイアスを除去し、√n 一致・漸近正規性を達成するかに焦点を当てる。

---

## メタ情報

| 項目 | 内容 |
|------|------|
| タイトル | Double/Debiased Machine Learning for Treatment and Causal Parameters |
| 著者 | Victor Chernozhukov, Denis Chetverikov, Mert Demirer, Esther Duflo, Christian Hansen, Whitney Newey, James Robins |
| 初出 | 2016 年 7 月 30 日 (arXiv:1608.00060) |
| 掲載誌 | The Econometrics Journal, Vol. 21, Issue 1 (2018), C1–C68 |
| 分類 | stat.ML / econ.EM |
| abstract URL | https://arxiv.org/abs/1608.00060 |
| HTML 版 | https://arxiv.org/html/1608.00060 |
| キーワード | Neyman orthogonality, cross-fitting, regularization bias, doubly robust, semiparametric efficiency |

---

## Abstract（英・要約）

> Machine learning methods provide flexible, high-quality estimates of high-dimensional nuisance functions, but plugging them naively into estimating equations for low-dimensional causal parameters induces a **regularization bias** that prevents √n-consistent estimation and valid inference. This paper develops **Double/Debiased Machine Learning (DML)**, which (i) builds estimating equations on **Neyman-orthogonal scores** that are first-order insensitive to perturbations of the nuisance functions, and (ii) employs **cross-fitting** (K-fold sample splitting) to remove the bias induced by overfitting/own-observation dependence. The resulting estimator is √n-consistent, asymptotically normal, and semiparametrically efficient, **even when each nuisance function is estimated only at rate n^(-1/4)**. The framework accommodates lasso, random forests, boosting, neural networks, and ensembles, and is illustrated on simulated data and the effect of 401(k) eligibility/participation on net financial assets.

---

## Abstract（日本語訳）

> 機械学習は高次元の局外関数（nuisance function）を柔軟かつ高精度に推定できるが、これを低次元の因果パラメータの推定方程式へ素朴に代入すると**正則化バイアス**が混入し、√n 一致性と妥当な推論が失われる。本論文は **Double/Debiased Machine Learning (DML)** を提案する。これは (i) 局外関数の摂動に対して一次の感度を持たない **Neyman 直交スコア**の上に推定方程式を構築し、(ii) **cross-fitting**（K-fold の標本分割）により過学習・自己観測依存に起因するバイアスを除去する。結果として得られる推定量は、各局外関数の収束率が n^(-1/4) という遅いレートに留まっても、√n 一致・漸近正規・準パラメトリック効率的となる。lasso、ランダムフォレスト、勾配ブースティング、ニューラルネット、アンサンブルなど幅広い学習器に適用でき、シミュレーションと「401(k) 加入資格・加入が純金融資産に与える効果」の実証で有効性が示される。

---

## Overview

DML は「予測のための ML」と「因果パラメータ推定のための統計理論」を橋渡しするメタ手法である。本質は次の 2 つの修正を組み合わせる点にある。

1. **直交化（orthogonalization）**: 興味あるパラメータ θ₀ を識別するモーメント条件を、局外関数 η₀ の推定誤差に対して**一次で鈍感**になるよう構成する（Neyman 直交性）。
2. **cross-fitting**: 局外関数 η̂ を推定する標本と、θ を推定する標本を分離し、過学習由来のバイアス項を消す。

この 2 段構えにより、ML 由来の遅い・偏った局外推定（n^(-1/4) 程度）であっても、メインの因果パラメータは古典的パラメトリック推定量と同じ √n レートで一致し、信頼区間が妥当になる。

---

## Problem（解くべき課題）

部分線形回帰（Partially Linear Regression, PLR）を例に問題を見る。

```
Y = D·θ₀ + g₀(X) + U,    E[U | X, D] = 0
D = m₀(X) + V,           E[V | X]    = 0
```

- `Y`: 結果変数、`D`: 処置（連続でも可）、`X`: 高次元交絡変数
- `θ₀`: 興味ある因果パラメータ（処置効果）
- `g₀, m₀`: 局外関数（ML で推定したい高次元 nuisance）

**素朴な代入の何が問題か**

θ を `ψ(W; θ, g) = (Y − θD − g(X))·D` のような**非直交**スコアで推定すると、

```
√n(θ̂ − θ₀) ≈ a (正規項) + b·√n·(ĝ₀ − g₀ の推定誤差)
```

第 2 項は局外推定誤差に**一次で線形依存**する。ML 推定では正則化のため ĝ₀ の収束が n^(-1/2) より遅く、`√n·(ĝ₀−g₀) → ∞` となり、θ̂ は**正則化バイアス**で √n レートを失う。これが「ML をそのまま因果推定に使えない」中核的理由である。

加えて、同一データで ĝ₀ を学習し θ を推定すると、推定量が自分自身の観測に依存して**過学習バイアス**が生じる。

---

## Proposed Method

### (1) Neyman 直交スコアによる直交化

PLR では「partialling-out（部分回帰）」で直交スコアを構成する。処置 `D` から `m₀(X)` を引いた残差 `V = D − m₀(X)` を用い、

```
ψ(W; θ, η) = (Y − θ·D − g₀(X))·(D − m₀(X)),   η = (g₀, m₀)
```

このスコアは局外関数 `g₀` と `m₀` の**両方**を含み（"double"）、どちらか一方の摂動に対して一次感度がゼロになる。直感的には、結果側の交絡 `g₀` を引き、処置側の交絡 `m₀` を引いた残差同士を突き合わせることで、局外推定誤差の**一次項が相殺**される。

### (2) Neyman 直交性の定義

スコア ψ が θ₀ を識別し（`E[ψ(W;θ₀,η₀)]=0`）、かつ局外方向への Gateaux 微分が消える：

```
∂_η E_P[ ψ(W; θ₀, η₀) ][ η − η₀ ] = 0,   ∀ η ∈ 局外実現集合 𝒯_N
```

これにより、η̂ を η₀ に置き換えたときのバイアスが一次で消え、二次の項（`O(‖η̂−η₀‖²)`）だけが残る。

### (3) cross-fitting（K-fold 標本分割）

局外関数の学習データと θ 推定データを分離。各 fold で「他の fold で学習した η̂」を当てはめることで、過学習由来の自己観測依存を断ち切る。最終的に全 fold の推定を平均し、フルサンプル相当の効率を回復する。

---

## Key Formulas

**直交モーメント条件**

```
E_P[ ψ(W; θ₀, η₀) ] = 0
```

**Neyman 直交性（一次感度ゼロ）**

```
∂_η E_P[ ψ(W; θ₀, η₀) ][ η − η₀ ] = 0
```

**PLR 直交スコア（partialling-out）**

```
ψ(W; θ, η) = ( Y − θ·D − g(X) )·( D − m(X) ),   η = (g, m)
```

**ATE 用の AIPW / 二重頑健（doubly-robust）スコア（相互作用モデル）**
（標準的なエフィシェント影響関数。論文 Section 5。）

```
ψ(W; θ, η) = ( g(1,X) − g(0,X) )
           + D·( Y − g(1,X) ) / m(X)
           − (1−D)·( Y − g(0,X) ) / ( 1 − m(X) )
           − θ
```

ここで `g(d,X)=E[Y|D=d,X]`、`m(X)=P(D=1|X)`（傾向スコア）。このスコアは `g` か `m` のどちらかが正しければ一致する（二重頑健）うえ、Neyman 直交でもある。

**cross-fitting DML 推定量（K-fold 平均化）**

各 fold `k` の補集合で η̂_k を学習し、fold `I_k` 上で局所推定 θ̌_k を解く。PLR の場合：

```
            [  Σ_{i∈I_k}  V̂ᵢ · Dᵢ  ]⁻¹
θ̌_k =       ──────────────────────────  ·  Σ_{i∈I_k}  V̂ᵢ · ( Yᵢ − ĝ_k(Xᵢ) )
                                            ,   V̂ᵢ = Dᵢ − m̂_k(Xᵢ)

θ̌ = (1/K) Σ_{k=1}^{K} θ̌_k        ← DML2 では全 fold をスタックして 1 本のモーメントを解く
```

**漸近分布**

```
√n ( θ̌ − θ₀ )  →_d  N(0, Σ),   Σ = σ²_ψ / J₀²
```

**局外推定への要求レート（積レート条件）**

`m̂₀, ĝ₀` の収束率を `n^(-φ_m), n^(-φ_g)` とすると、妥当性に必要なのは

```
φ_m + φ_g > 1/2        ⇒  両者とも n^(-1/4) で十分（φ_m = φ_g = 1/4）
```

直交性が一次バイアスを消すため、残る二次バイアスは `O_P(‖m̂−m₀‖·‖ĝ−g₀‖)` となり、これが `o_P(n^(-1/2))` であればよい。これが「**個々の局外推定が n^(-1/4) でも √n 推定が成立する**」根拠である。

---

## Algorithm（疑似コード: K-fold cross-fitting / DML）

```
入力: データ {W_i = (Y_i, D_i, X_i)}_{i=1..n}, fold 数 K, 直交スコア ψ
出力: θ̌, 標準誤差 σ̂

1. {1,...,n} をほぼ等サイズの K 個の fold {I_1,...,I_K} にランダム分割
2. for k = 1 .. K:
3.     I_k^c = I_k の補集合（学習用）
4.     I_k^c 上で ML により局外関数を学習:
            ĝ_k  ← E[Y | X (, D)]  の推定 (lasso / RF / boosting / NN / ensemble)
            m̂_k  ← E[D | X]        の推定（傾向スコア等）
5.     I_k 上で θ̌_k を解く:  Σ_{i∈I_k} ψ(W_i; θ̌_k, η̂_k) = 0
6. 集約:
       DML1:  θ̌ = (1/K) Σ_k θ̌_k                       （fold ごとに解いて平均）
       DML2:  Σ_k Σ_{i∈I_k} ψ(W_i; θ̌, η̂_k) = 0 を一括で解く（推奨・安定）
7. 分散推定:  σ̂² = Ĵ⁻² · (1/n) Σ_i ψ̂_i² ,  Ĵ = ∂_θ の標本平均
8. 95% CI:  θ̌ ± 1.96 · σ̂ / √n
```

ポイント: ステップ 4–5 で**学習標本と評価標本を分離**している点が cross-fitting の核。標本分割の不安定性を抑えるため、分割を複数回繰り返してメディアン集約することも推奨される。

---

## Architecture / Process Flow

```mermaid
flowchart TD
    A[全データ n 件] --> B[K-fold にランダム分割]
    B --> C{各 fold k}
    C -->|補集合 I_k^c で学習| D[ML で局外関数推定<br/>ĝ_k = E Y|X, m̂_k = E D|X]
    D -->|fold I_k に当てはめ| E[直交スコア ψ で θ̌_k を解く]
    E --> F[全 fold を集約 DML1/DML2]
    F --> G[θ̌, 標準誤差 σ̂, 95% CI]

    subgraph 精度向上の二本柱
      H[Neyman 直交性<br/>→ 一次バイアス除去]
      I[cross-fitting<br/>→ 過学習バイアス除去]
    end
    H -.-> E
    I -.-> D
```

ASCII での処理の流れ（バイアスの観点）：

```
   素朴プラグイン                       DML
  ┌────────────┐                ┌──────────────────────┐
  │ 同一データで │                │ fold 分割で η̂ と θ̌ を │
  │ η̂ と θ̂ 推定 │   ──直交化──▶  │ 分離 + 直交スコア      │
  └────────────┘                └──────────────────────┘
        │                                  │
  一次バイアス O(√n·‖η̂−η₀‖)          二次バイアス O(‖m̂−m₀‖·‖ĝ−g₀‖)
        │                                  │
   √n レート喪失                    √n 一致・漸近正規
```

---

## Figures & Tables

### Figure 1（再掲・概念図）: 素朴 ML vs DML の標本分布

| パネル | 推定方法 | 観察される挙動（論文記述） |
|--------|----------|--------------------------|
| 左 | ランダムフォレスト直交化なし（naive） | 分布が "badly biased"、真値 θ₀ より**右に大きくシフト** |
| 右 | cross-fitted 直交スコア（DML） | "approximately unbiased"、θ₀ 周辺に集中し、**正規近似が良好** |

### Figure 2（再掲・概念図）: 標本分割の有無と過学習バイアス

| 設定 | 推定量 | 結果 |
|------|--------|------|
| 標本分割なし | 収束率 n^(-1/2+ε) の良好な学習器でも | "substantial bias"（過学習由来のバイアスが残存） |
| cross-fitting あり | 同じ学習器 | "completely eliminates the bias induced by overfitting" |

### Table A: 2 種のバイアスと DML の対処

| バイアス源 | 発生原因 | DML の対処機構 | 残存オーダー |
|-----------|---------|---------------|-------------|
| 正則化バイアス | ML 局外推定の遅いレート（一次依存） | Neyman 直交スコア | 一次項が消え `O(‖η̂−η₀‖²)` |
| 過学習バイアス | 同一標本で η̂ と θ 推定 | cross-fitting | `o_P(n^(-1/2))` |

### Table B: 局外推定レートと √n 推定可否

| φ_m | φ_g | φ_m + φ_g | √n 推定の妥当性 |
|-----|-----|-----------|----------------|
| 1/2 | 1/2 | 1 | 成立（古典的）|
| 1/4 | 1/4 | 1/2（境界）| **成立**（DML の主張）|
| 1/4 | 1/8 | 3/8 | 不成立（条件 > 1/2 を満たさない）|

> 注: Figure 1/2 の数値（バイアス量・被覆率の具体値）は論文本文に図として掲載されており、本レポートでは取得したテキストに含まれる**定性的記述のみ**を引用した。具体数値は原論文 Section 4・図を参照のこと。

---

## Experiments & Evaluation

### シミュレーション

- PLR 設定で、(a) 直交化なしランダムフォレスト、(b) DML（直交スコア + cross-fitting）を比較。
- (a) は真値の右へ大きく偏り正規近似が崩れる一方、(b) は近似的に不偏で正規近似が妥当（Figure 1）。
- 標本分割の効果を切り分ける実験（Figure 2）では、収束の速い学習器でも標本分割を欠くと有意なバイアスが残り、cross-fitting がこれを完全に除去することを示す。

> 具体的なバイアス値・被覆率・RMSE などの数値は、本タスクで取得した HTML テキストには定量値として含まれていなかった。**数値は原論文 Section 4 の図表を参照**（数値の捏造は行わない）。

### 実証応用: 401(k) 加入資格・加入が純金融資産に与える効果（Section 6.2）

- DML を用い、401(k) 加入資格（eligibility）と加入（participation）の純金融資産への効果を推定。
- 局外関数（傾向スコア・結果回帰）を lasso / 回帰木 / ブースティング / ニューラルネット / ランダムフォレスト / アンサンブルで推定し、学習器横断で結果の頑健性を確認する構成。

> 推定された処置効果の点推定値・標準誤差の具体数値は、取得テキストに含まれていなかったため**原論文 Section 6.2 の表を参照**（数値の捏造は行わない）。

---

## Notes（CATE 精度向上の観点）

**なぜ直交性 + cross-fitting で √n 一致・正則化バイアス除去が可能か。**

1. **直交性が一次バイアスを消す。** 推定量のバイアスをテイラー展開すると、局外推定誤差 `η̂−η₀` に対して
   `E[ψ(W;θ₀,η̂)] ≈ (一次項) + (二次項)`
   と分解できる。Neyman 直交性は定義上この**一次項（`∂_η E[ψ]`）をゼロ**にする。残るのは二次項 `O(‖m̂−m₀‖·‖ĝ−g₀‖)` のみ。ML の遅いレートでもこの積が `o_P(n^(-1/2))` に収まるため、`√n × バイアス → 0` となり √n 一致が回復する。これが「正則化バイアス除去」の数理的核心。

2. **積レート条件が n^(-1/4) を許す。** 二次バイアスが積構造になるおかげで、各局外関数は `n^(-1/4)` という ML で現実的なレートで足りる（`1/4 + 1/4 = 1/2 > 1/2` の境界を満たす）。"double"（局外関数を 2 つ partial out する）構造がこの積を生む。

3. **cross-fitting が過学習バイアスを断つ。** 直交化だけでは「同一標本で η̂ を学習し θ を評価する」ことによる自己観測依存（実効的な複雑度バイアス）が残る。標本分割で η̂ の学習データと θ 評価データを分離すると、確率的等度連続性の議論が成立し、`empirical process` 項が消える。これにより Donsker 条件などの**学習器クラスへの制約が不要**になり、任意の現代的 ML（RF, boosting, NN, ensemble）を black-box として使える。

4. **CATE への含意。** 本論文は主に低次元因果パラメータ（ATE/LATE/PLR 係数）を対象とするが、その思想は CATE 推定の土台でもある。AIPW/二重頑健スコアは Neyman 直交かつ準パラメトリック効率的で、これを共変量上に射影・局所化することで（後続の DR-learner、causal forest、R-learner 等の）CATE 推定器が構成される。すなわち DML の直交モーメント + cross-fitting は、**CATE のメタ学習器がプラグイン ML の正則化・過学習バイアスを継承しないための一般原理**を与える。

5. **実務上の注意。** (i) DML2（全 fold をスタックして一括で解く）が DML1 より安定。(ii) 標本分割の乱数依存を抑えるため複数回分割しメディアン集約。(iii) 傾向スコアが 0/1 に近い領域では AIPW スコアの分散が爆発するためトリミング/重なり（overlap）の確認が必須。
