# Minimax Regret Estimation for Generalizing Heterogeneous Treatment Effects with Multisite Data

- **Link**: https://arxiv.org/abs/2412.11136
- **Authors**: Yi Zhang, Melody Huang, Kosuke Imai
- **Year**: 2024（2024年12月15日投稿、2026年4月30日改訂）
- **Venue**: arXiv:2412.11136 [stat.ME]（Statistics > Methodology）
- **Type**: 方法論論文（robust optimization × multisite CATE 一般化）

---

## Abstract (English)

> To test scientific theories and develop individualized treatment rules, researchers often wish to learn heterogeneous treatment effects that can be consistently found across diverse populations and contexts. We consider the problem of generalizing heterogeneous treatment effects (HTE) based on data from multiple sites. A key challenge is that a target population may differ from the source sites in unknown and unobservable ways. This means that the estimates from site-specific models lack external validity, and a simple pooled analysis risks bias. We develop a robust CATE (conditional average treatment effect) estimation methodology with multisite data from heterogeneous populations. We propose a minimax-regret framework that learns a generalizable CATE model by minimizing the worst-case regret over a class of target populations whose CATE can be represented as convex combinations of site-specific CATEs. Using robust optimization, the proposed methodology accounts for distribution shifts in both individual covariates and treatment effect heterogeneity across sites. We show that the resulting CATE model has an interpretable closed-form solution, expressed as a weighted average of site-specific CATE models. Thus, researchers can utilize a flexible CATE estimation method within each site and aggregate site-specific estimates to produce the final model. Through simulations and a real-world application, we show that the proposed methodology improves the robustness and generalizability of existing approaches.

## Abstract (日本語)

科学的仮説を検証し個別化処置ルールを構築するために、研究者は多様な母集団・文脈で一貫して見出される異質処置効果（HTE）を学習したいと望む。本論文は、**複数のサイト（multisite）**のデータに基づいて HTE を一般化する問題を扱う。鍵となる課題は、ターゲット母集団がソースサイトと**未知かつ観測不能な形で異なりうる**ことである。これはサイト固有モデルの推定値が外的妥当性を欠き、単純なプール分析がバイアスを招く危険を意味する。本論文は、異質な母集団からの multisite データに対する頑健な CATE 推定法を開発する。提案する **minimax-regret（ミニマックス後悔）** 枠組みは、「CATE がサイト固有 CATE の凸結合で表せる」ターゲット母集団クラスにわたる worst-case regret を最小化することで、一般化可能な CATE モデルを学習する。robust optimization を用いることで、個人共変量の分布シフトとサイト間の処置効果異質性の**両方**を考慮する。結果として得られる CATE モデルは、**サイト固有 CATE モデルの加重平均**として表される解釈可能な閉形式解を持つ。したがって研究者は各サイト内で柔軟な CATE 推定法を用い、サイト固有推定値を集約して最終モデルを作ることができる。シミュレーションと実データ応用により、提案法が既存アプローチの頑健性・一般化性を改善することを示す。

---

## Overview

本論文は、複数サイト（`s=1,…,S`）で観測された CATE `τ^(s)(·)` を、**未知のターゲット母集団**へ一般化する問題を robust optimization で解く。核心的仮定は「ターゲットの CATE がサイト固有 CATE の凸結合 `τ_Q(·)=Σ q_s τ^(s)(·)`（`q∈Δ_{S-1}`）で表せる」こと（不確実性集合 `C(Q_X)`）。この集合上で **worst-case regret（各ターゲットで達成しうる最良二乗誤差との差の最悪値）** を最小化する CATE モデルを求める。

主結果（Theorem 1）は、最適解が**サイト固有 CATE の加重平均という閉形式**を持つこと：`f*(·)=Σ q_s* τ^(s)(·)`。重み `q*` はサイト CATE 間のグラム行列 `Γ` を用いた二次計画で決まる。これにより、各サイトで任意の柔軟な ML 手法（causal forest 等）を使い、その出力を集約するだけで一般化モデルが得られる。**通信効率的・プライバシー保護的**な集約が可能で、サイト間の overlap は不要（ターゲット↔サイトの overlap のみ必要）。

---

## Problem（本論文が解く課題）

- ターゲット母集団はソースサイトと**未知・観測不能**に異なりうる → サイト固有モデルは外的妥当性を欠く。
- 単純なプール分析（全サイトを混ぜる）は、サイト間異質性のためバイアスを生む。
- 分布シフトが**共変量分布**と**処置効果異質性**の両方で起こる。
- ターゲットが一つに定まらない → 「起こりうるターゲットの中で最悪でも良い」保証が欲しい。
- サイト間でデータを共有できない（プライバシー）状況で集約したい。

---

## Proposed Method

### 中核アイデア

ターゲット CATE を「サイト固有 CATE の凸結合」で表せる不確実性集合 `C(Q_X)` を定義し、その集合上での **regret（後悔＝そのターゲットで最良モデルが達成する誤差との差）の最悪値** を最小化する。robust optimization により、共変量シフトと効果異質性の双方を吸収。最適解が閉形式（サイト CATE の加重平均）になるため、二段階で実装できる。

### 手順（numbered steps）

1. **不確実性集合の定義（Definition 1）**: `C(Q_X) = { Q | τ_Q(·)=Σ q_s τ^(s)(·), q∈Δ_{S-1} }`。ターゲット CATE はサイト CATE の凸結合。
2. **minimax-regret 目的の定式化（式5）**: `C(Q_X)` 上の worst-case regret を最小化する `f∈F` を求める。
3. **閉形式解の導出（Theorem 1, 式9）**: 最適 `f*(·)=Σ q_s* τ^(s)(·)`。重み `q*` はグラム行列 `Γ`（サイト CATE 間の内積）を用いた二次計画の解。
4. **サイト固有 CATE の推定**: 各サイトで任意の柔軟な ML（causal forest, DR-learner 等）で `τ̂^(s)(·)` を推定。
5. **集約重みの計算**: ターゲット共変量データで `Γ̂`, `d̂` を推定し、二次計画 `q̂=argmin q^T Γ̂ q − q^T d̂` を解く。
6. **最終モデルの構成**: `f̂_regret(·)=Σ q̂_s τ̂^(s)(·)`。
7. **理論保証（Theorem 2）**: L2 収束率をサイト CATE 推定誤差 `δ_n`、`Γ` の最小固有値、ターゲット標本数 `n_Q` で評価。

### Key Formulas（LaTeX）

**minimax-regret 目的（式5）:**

$$f^{*}_{\mathrm{regret}}(\cdot) = \arg\min_{f\in\mathcal{F}}\ \max_{Q\in\mathcal{C}(Q_X)}\left\{ \mathbb{E}_Q\big[(Y(1)-Y(0)-f(X))^2\big] - \min_{f'\in\mathcal{F}} \mathbb{E}_Q\big[(Y(1)-Y(0)-f'(X))^2\big]\right\}$$

**不確実性集合（Definition 1）:**

$$\mathcal{C}(Q_X) = \left\{ Q \mid \tau_Q(\cdot) = \sum_{s=1}^{S} q_s\,\tau^{(s)}(\cdot),\ q\in\Delta_{S-1}\right\}$$

**閉形式解（Theorem 1, 式9）:**

$$f^{*}_{\mathrm{regret}}(\cdot) = \sum_{s=1}^{S} q_s^{*}\,\tau^{(s)}(\cdot), \qquad q^{*} = \arg\min_{q\in\Delta_{S-1}}\ q^{\top}\Gamma q - q^{\top} d$$

ただし
$$\Gamma_{k,l} = \mathbb{E}_{Q_X}\big[\tau^{(k)}(X)\,\tau^{(l)}(X)\big], \qquad d = (\Gamma_{1,1},\dots,\Gamma_{S,S})^{\top}$$

**推定版（二段階）:**

$$\hat{q} = \arg\min_{q\in\Delta_{S-1}}\ q^{\top}\widehat{\Gamma} q - q^{\top}\hat{d}, \qquad \hat{f}_{\mathrm{regret}}(\cdot) = \sum_{s=1}^{S}\hat{q}_s\,\hat{\tau}^{(s)}(\cdot)$$

**L2 収束率（Theorem 2）:** `‖f̂_regret − f*_regret‖_{Q,2}` はサイト CATE 推定誤差 `δ_n`、`λ_min(Γ)`、ターゲット標本数 `n_Q` に依存する項で上界化される。

---

## Algorithm（擬似コード）

```
入力: 各サイト s のデータ {(X,A,Y): site=s}, ターゲット共変量 {X: target}
出力: 一般化 CATE モデル f̂_regret

Step 1（サイトごと、並列・プライバシー保護）:
  for s = 1..S:
     τ̂^(s)(·) ← 任意の柔軟な CATE 推定法（causal forest / DR-learner 等）

Step 2（集約重みの計算、ターゲット共変量のみ使用）:
  各 (k,l) について Γ̂_{k,l} = Ê_{Q_X}[τ̂^(k)(X)·τ̂^(l)(X)]
  d̂ = (Γ̂_{1,1},...,Γ̂_{S,S})
  q̂ = argmin_{q∈Δ_{S-1}}  q^T Γ̂ q − q^T d̂     # 単体上の二次計画

Step 3（集約）:
  f̂_regret(·) = Σ_s q̂_s · τ̂^(s)(·)
  return f̂_regret
```

---

## Architecture / Process Flow

```mermaid
flowchart TD
    A1[Site 1: X,A,Y] --> B1[τ̂^(1) 柔軟ML]
    A2[Site 2: X,A,Y] --> B2[τ̂^(2) 柔軟ML]
    AS[Site S: X,A,Y] --> BS[τ̂^(S) 柔軟ML]
    B1 --> C[グラム行列 Γ̂_{k,l}=Ê_Q[τ̂^k·τ̂^l]]
    B2 --> C
    BS --> C
    T[ターゲット共変量 Q_X] --> C
    C --> D[二次計画: q̂ = argmin q^T Γ̂ q − q^T d̂, q∈単体]
    D --> E[集約: f̂_regret = Σ q̂_s τ̂^(s)]
    E --> F[一般化 CATE: worst-case regret 最小]
```

---

## Figures & Tables（MANDATORY）

### Table 1（再構成）: 手法比較（minimax-regret vs 代替目的）

| 目的関数 | 何を最小化 | ノイズ耐性 | 解の形 |
|------|------|------|------|
| Minimax **Risk** | worst-case 二乗誤差そのもの | サイト間ノイズ差に脆弱 | — |
| Minimax **Relative-Risk** | worst-case 相対リスク | — | — |
| **Minimax Regret（本論文）** | worst-case regret（最良との差） | ノイズ差に頑健 | **閉形式: サイト CATE の加重平均** |

> Section 4 のシミュレーションで、異質なターゲット分布にわたり minimax-regret を minimax-risk / minimax-relative-risk と比較。regret 目的はサイト間のノイズ水準の違いに頑健（risk 目的はノイズの大きいサイトに引きずられる）。個別の数値表は本調査では取得できず（→ 記載なし）。

### Table 2（再構成）: 閉形式解の構成要素

| 記号 | 定義 |
|------|------|
| `τ^(s)(·)` | サイト `s` の CATE モデル |
| `Γ_{k,l}` | `E_{Q_X}[τ^(k)(X)τ^(l)(X)]`（ターゲット共変量下のサイト CATE 内積） |
| `d` | `Γ` の対角 `(Γ_{1,1},…,Γ_{S,S})` |
| `q*` | 単体 `Δ_{S-1}` 上の二次計画の解（集約重み） |
| `f*_regret` | `Σ q_s* τ^(s)(·)`（最終一般化モデル） |

### Table 3（再構成）: 実データ応用（microcredit 実験）

| 項目 | 内容 |
|------|------|
| データ | マイクロクレジット（少額融資）実験群（複数サイト） |
| ターゲット生成 | 合成的に生成したターゲット母集団 |
| 評価 | leave-one-out クロスバリデーション（1サイトを抜いてターゲット扱い） |
| 目的 | 抜いたサイトへの一般化性能で各手法を比較 |

> Section 5 の実証。具体的な性能指標の数値は本調査では取得できず（→ 記載なし）。

### Table 4（再構成）: 手法の利点と要件

| 観点 | 本手法の性質 |
|------|------|
| 解の解釈性 | 閉形式（サイト CATE の加重平均） |
| サイト内推定法 | 任意の柔軟 ML を利用可（causal forest 等） |
| プライバシー/通信 | サイト固有推定値のみ集約 → 通信効率的・プライバシー保護的 |
| overlap 要件 | サイト間 overlap 不要、**ターゲット↔サイトの overlap のみ** 必要 |
| ノイズ耐性 | サイト間で異なるノイズ水準に頑健（vs minimax-risk） |

> 注: arXiv HTML 版から本文・数式は抽出できたが、図の `<img>` 直接 URL は取得できなかったため埋め込みなし。シミュレーション/実証の個別数値表も本調査では確定できなかった。

---

## Experiments & Evaluation

- **Setup（Section 4, シミュレーション）**: 異質なターゲット分布にわたり、minimax-regret を minimax-risk / minimax-relative-risk と比較。共変量分布とサイト間効果異質性の双方にシフトを入れる。
- **Setup（Section 5, 実証）**: microcredit 実験（複数サイト）を用い、合成生成したターゲット母集団と leave-one-out クロスバリデーションで一般化性能を評価。
- **Main Results（定性）**: 提案法は既存アプローチ（サイト固有モデル、単純プール、minimax-risk）に対し頑健性・一般化性を改善。特に regret 目的はサイト間のノイズ水準差に頑健で、ノイズの大きいサイトに解が引きずられない。閉形式解ゆえ計算・集約が軽量。
- **Ablation**: minimax-regret vs minimax-risk vs minimax-relative-risk の目的関数比較が主要 ablation。regret 目的の優位（ノイズ耐性）を示す。

> 具体的な数値（MSE/regret の点推定値、CV スコア）は本調査時点の抽出では取得できなかったため「記載なし」とし、定性的知見のみ記載。厳密値は原論文（arXiv:2412.11136）で要確認。

---

## 本テーマへの適用可能性

本論文は、**「複数の過去キャンペーン（サイト）で学習した uplift を、未知の新ターゲットへ、最悪でも良い保証付きで集約・移送する」** という本テーマの中核に最も直接的に対応する。

- **キャンペーン＝サイト**: 各過去マーケティングキャンペーンを一つの「サイト」とみなせば、キャンペーン固有の uplift `τ^(s)(X)` を causal forest 等で推定し、それらを集約して新しいターゲットセグメントへの uplift を得る、という構図がそのまま成立する。infrequent キャンペーンが少数個あるだけでも、各々をサイトとして扱える。
- **未知ターゲットへの worst-case 保証**: 新セグメントの分布が事前に分からなくても、「その uplift が過去キャンペーンの uplift の凸結合で表せる」という穏当な仮定のもとで、**起こりうるターゲットの中で最悪でも regret を最小化**する集約モデルが得られる。「どの新セグメントに展開しても大外ししない」保証が欲しいマーケティングに合致。
- **閉形式・軽量集約**: 最終モデルは `f̂ = Σ q̂_s τ̂^(s)` というキャンペーン別 uplift の加重平均。重み `q̂` はターゲットセグメントの**共変量データだけ**で解ける二次計画。新セグメントのアウトカムが未観測でも、共変量分布さえあれば集約重みを決められる。
- **各キャンペーンで自由な uplift モデルを使える**: サイト内は任意の ML（T-learner, DR-learner, causal forest, さらには本ドメインの他手法）でよいため、既存の uplift モデル資産をそのまま「サイト固有推定」として再利用できる。
- **クラスタ横断の効果移送に直結**: ユーザー/キャンペーンを行動でクラスタリングした後、各クラスタを「サイト」とみなして CATE を推定し、新クラスタへ集約重みで移送する — 本テーマの「グループ化 ＋ 類似クラスタへの効果移送」を一つの最適化で実現する。集約重み `q̂` は「新ターゲットが既存のどのクラスタに近いか」を定量化した解釈可能な指標にもなる。
- **プライバシー/データサイロ対応**: キャンペーンデータが部署やパートナーごとにサイロ化していても、各サイトの uplift 推定値だけを集約すればよいため、生データを共有せずに横断的な uplift モデルを構築できる。
- **プール分析の危険を回避**: 「全キャンペーンを混ぜて一つの uplift モデルを作る」単純プールはキャンペーン間異質性でバイアスを生む。本手法はサイト異質性を明示的に扱い、regret 最小化でこれを回避する。
- **本ドメイン内の位置づけ**: 04（Multi-CATE）が「単一モデルを分布クラスに頑健化」するのに対し、05 は「複数キャンペーンモデルを凸結合で集約」する。過去キャンペーンが複数あり、それらの加重平均で新ターゲットを説明できるなら 05 が最適。単一の学習済みモデルしかないなら 04、明確な単一ターゲットへ重み付け移送なら 03。

---

## Notes

- 著者は Kosuke Imai（Harvard、政治学/統計の因果推論で著名）、Melody Huang、Yi Zhang。robust optimization を multisite CATE 一般化へ応用した点が新規性。
- 主結果は Theorem 1（閉形式解）と Theorem 2（L2 収束率）。regret 目的が minimax-risk よりノイズ差に頑健であることが理論・実験の主張。
- 「サイト間 overlap 不要、ターゲット↔サイト overlap のみ必要」「通信効率的・プライバシー保護的」という運用上の利点が明示されている。
- 実証は microcredit 実験＋合成ターゲット＋leave-one-out CV。具体的な数値指標は本調査の抽出では確定できず「記載なし」とした（厳密値は原論文要確認）。
- arXiv HTML 版から本文・数式（式5, 9, Definition 1, Theorem 1/2）は抽出できたが、図の `<img>` 直接 URL は取得できなかったため埋め込みなし。2026年4月30日に改訂版（v2 以降）あり。
