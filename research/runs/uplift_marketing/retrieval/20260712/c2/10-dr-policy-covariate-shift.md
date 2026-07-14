# Distributionally Robust Policy Evaluation under General Covariate Shift in Contextual Bandits

- **Link**: https://arxiv.org/abs/2401.11353
- **Authors**: Yihong Guo, Hao Liu, Yisong Yue, Anqi Liu
- **Year**: 2024（初版 2024年1月、改訂 2024年8月）
- **Venue**: arXiv (cs.LG) ※プレプリント
- **Type**: Method / Theory（分布ロバスト回帰による OPE、有限標本バイアス上界付き）

---

## Abstract (English)

> We introduce a distributionally robust approach that enhances the reliability of offline policy evaluation in contextual bandits under general covariate shifts. Our method aims to deliver robust policy evaluation results in the presence of discrepancies in both context and policy distribution between logging and target data. Central to our methodology is the application of robust regression, a distributionally robust technique tailored here to improve the estimation of conditional reward distribution from logging data. Utilizing the reward model obtained from robust regression, we develop a comprehensive suite of policy value estimators, by integrating our reward model into established evaluation frameworks, namely direct methods and doubly robust methods. Through theoretical analysis, we further establish that the proposed policy value estimators offer a finite sample upper bound for the bias, providing a clear advantage over traditional methods, especially when the shift is large. Finally, we designed an extensive range of policy evaluation scenarios, covering diverse magnitudes of shifts and a spectrum of logging and target policies. Our empirical results indicate that our approach significantly outperforms baseline methods, most notably in 90% of the cases under the policy shift-only settings and 72% of the scenarios under the general covariate shift settings.

---

## Abstract (日本語訳)

一般的な共変量シフトの下での文脈付きバンディットにおけるオフライン方策評価の信頼性を高める、分布ロバストなアプローチを提案する。本手法は、ログデータと目標データの間で **文脈分布と方策分布の両方** に差異がある状況で頑健な評価結果を出すことを目指す。中核は **robust regression（ロバスト回帰）** の適用であり、ログデータから条件付き報酬分布の推定を改善するために分布ロバスト技術を仕立て直したものである。ロバスト回帰で得た報酬モデルを、**direct method（直接法）** と **doubly robust（二重頑健法）** という確立された評価枠組みに統合し、包括的な方策価値推定量群を構築する。理論解析により、提案推定量が **バイアスの有限標本上界** を持つことを示し、特にシフトが大きいとき従来法に明確に優る。最後に、多様なシフトの大きさとログ／目標方策のスペクトルを網羅する広範な評価シナリオを設計。実験の結果、提案法はベースラインを大きく上回り、特に **方策シフトのみの設定で 90%**、**一般共変量シフトの設定で 72%** のケースで最良となった。

---

## Overview（概要）

OPE の分布シフトは通常「方策のシフト（$\beta\to\pi$）」として扱われるが、本論文は **文脈分布 $P(x)$ のシフトも同時に起きる一般共変量シフト** を対象とする。鍵は、報酬モデル推定を **分布ロバスト（distributionally robust）な最悪ケース最適化** として定式化する点。ログ側（source）で特徴モーメントを一致させる制約集合の中で、目標側（target）分布での損失を最悪化する敵対的報酬分布を考え、それに対して頑健な報酬モデル $\hat f$ を学習する。この $\hat f$ を DM / DR に組み込むことで、シフトが大きくても発散しない有限標本バイアス上界を持つ推定量群（DM-PS, DR-PS, DM-GCS, DR-GCS）を得る。

---

## Problem（解こうとしている課題）

- 通常の OPE は方策シフトのみを想定するが、実際には **文脈分布 $P(x)$ も target と source でずれる**（一般共変量シフト）。
- IS 系はシフトが大きいと重要度重みの分散が爆発、DM は報酬モデルのバイアスがシフト下で拡大。
- サポートの重なり $m$ が小さい（overlap が薄い）ほど従来法のバイアスが発散する。
- 目標: 文脈・方策の両シフト下で、**シフトが大きくても有界なバイアス**を保証する頑健な OPE を作ること。

---

## Proposed Method（提案手法）

### 中核アイデア

報酬モデルを **分布ロバスト最適化（minimax）** で学習する。source 分布上で「報酬の2次モーメントと特徴×報酬モーメント」を経験値に一致させる制約集合 $\Sigma_S$ の中で、target 分布上の損失を最悪化する敵対的報酬分布 $g$ を考え、その最悪ケースに対して最良の報酬モデル $\hat f$ を得る。密度比 $\mathcal{W}(x,a)=P_s(x,a)/P_t(x,a)$ を重みに使い、ガウス予測形で $\mu_\theta,\sigma^2_\theta$ を導出。得た $\hat f$ を DM / DR に統合する。

### 手順（番号付き）

1. **制約集合の構築**: source データ上で報酬の2次・特徴交差モーメントを許容誤差 $\eta$ で一致させる制約集合 $\Sigma_S$（Eq.4）。
2. **minimax 学習**: $\hat f=\arg\min_f\max_{g\in\Sigma_S}\mathbb{E}_{P_t,\,r\sim g}[\mathcal{L}(r,f)]$（Eq.3 の相対損失）。
3. **ガウス予測形の導出**: 密度比 $\mathcal{W}$ を用いて $\mu_\theta(x,a),\sigma^2_\theta(x,a)$ を閉形式で得る（Eq.5）。
4. **SGD 最適化**: ミニバッチ勾配（Eq.6–7）で $\theta_r,\theta_x$ を更新。
5. **推定量への統合**: ロバスト報酬モデルを DM-PS / DR-PS（方策シフト用）と DM-GCS / DR-GCS（一般共変量シフト用）に組み込む（Eq.8–11）。

### Key Formulas

分布ロバスト報酬学習（minimax）:

$$\hat f(x,a)=\arg\min_{\hat f}\ \max_{g\in\Sigma_S}\ \mathbb{E}_{x,a\sim P_t(x,a),\ r\sim g}[\mathcal{L}(r,\hat f(x,a))]$$

相対損失（Eq.3）:

$$\mathcal{L}(r,\hat f):=\mathbb{E}_{x,a\sim P_t,\ r\sim g}[-\log \hat f + \log f_0]$$

制約集合 $\Sigma_S$（特徴マッチング, Eq.4）:

$$\Big|\mathbb{E}_{P_s,\,r\sim g}[r^2]-\tfrac{1}{|S|}\textstyle\sum_i r_i^2\Big|\le\eta,\qquad \Big|\mathbb{E}_{P_s,\,r\sim g}[r\,\phi(x,a)]-\tfrac{1}{|S|}\textstyle\sum_i r_i\phi(x,a)\Big|\le\eta$$

ガウス予測形（Eq.5, 密度比 $\mathcal{W}(x,a)=P_s(x,a)/P_t(x,a)$）:

$$\sigma^2_\theta(x,a)=\big(2\mathcal{W}(x,a)\theta_r+\sigma_0^{-2}\big)^{-1},\qquad \mu_\theta(x,a)=\sigma^2_\theta(x,a)\big(-2\mathcal{W}(x,a)\theta_x\phi(x,a)+\mu_0\sigma_0^{-2}\big)$$

DR-GCS 推定量（Eq.11）:

$$\hat V_{DR\text{-}GCS}=\frac{1}{|S|}\sum_{(x,a,r)\in S}\Big[(r-\mu^{GCS}_\theta(x,a))\frac{P_t(x,a)}{P_s(x,a)}\Big]+\hat V_{DM\text{-}GCS}$$

バイアス上界（Corollary 1 / Theorem 2, 概略）:

$$\mathrm{Bias}\le \Big[mC\big[\sigma^2_{avg}+\eta_1+4M\hat{\mathcal{R}}(\mathcal{F})+3M^2\sqrt{\tfrac{\log(2/\delta)}{2n}}\big]+(1-m)H\Big]^{1/2}$$

ここで $m$ = 密度比が非ゼロな target データの割合（overlap）、$C$ = 密度比上界、$H$ = ベース分布の誤差上界。**overlap $m\to0$ でバイアスは発散せず $(1-m)H$ に収束する**のが従来法との差。

---

## Algorithm（擬似コード）

```
Algorithm 1: ロバスト回帰の SGD 学習
入力: 学習データ {(x_i,a_i,r_i)}, ログ方策 β(a|x), 目標方策 π(a|x),
      source/target 分布 P_s(x), P_t(x), パラメータ θ,
      最適化器 Opt, 学習率 lr, エポック数 T
出力: 学習済みパラメータ θ

θ を乱数初期化;  epoch ← 0
while epoch < T:
    for 各ミニバッチ:
        Eq.5 で μ_θ(x,a), σ²_θ(x,a) を計算
        Eq.6–7 で勾配 ∇_{θ_r}, ∇_{θ_x} を計算
        Opt.step(lr)
    epoch += 1
return θ

── 得た報酬モデルを DM-PS/DR-PS/DM-GCS/DR-GCS (Eq.8–11) に統合して V̂ を算出 ──
```

---

## Architecture / Process Flow

```
   ログデータ (source)  P_s(x)β(a|x)
          │
          ▼
   密度比 W(x,a)=P_s/P_t を推定
          │
          ▼
   分布ロバスト回帰 (minimax, Eq.3–5)
     min_f max_{g∈Σ_S} E_{P_t}[ L(r, f) ]
          │  → ガウス予測形 μ_θ, σ²_θ
          ▼
   ロバスト報酬モデル f̂ (= μ_θ)
          │
     ┌────┴─────────────────────┐
     ▼                          ▼
   DM-PS / DM-GCS (直接法)   DR-PS / DR-GCS (二重頑健)
     └────────────┬─────────────┘
                  ▼
          方策価値推定 V̂(π)  （シフト大でも有界バイアス）
```

---

## Figures & Tables

### Figure 1: データ生成過程の因果図

$X\to A$, $X\to R$, $A\to R$ の因果構造。ログ分布 $P_s(x)\beta(a|x)$（実線）と目標分布 $P_t(x)\pi(a|x)$（破線）を対比。

### Figure 2: 手法フロー図

- (a) ロバスト回帰手法のフローチャート — 画像パス: `extracted/5782704/fig/Method6.png`
- (b) OPE と提案アプローチの比較 — 画像パス: `extracted/5782704/fig/GCS04.png`

### Table 1: 使用データセット（UCI 9種を文脈付きバンディット化）

| データセット | インスタンス数 | 特徴数 | 行動数 |
|--------------|----------------|--------|--------|
| Glass | 214 | 9 | 6 |
| Ecoli | 336 | 7 | 8 |
| Vehicle | 846 | 18 | 4 |
| Yeast | 1,484 | 103 | 10 |
| PageBlock | 5,473 | 10 | 5 |
| OptDigits | 5,620 | 64 | 10 |
| SatImage | 6,435 | 36 | 6 |
| PenDigits | 10,992 | 16 | 10 |
| Letter | 20,000 | 16 | 26 |

### Table B: 手法比較（ベースライン）

| 手法群 | 内容 |
|--------|------|
| 従来 | DM, IPS, DR, SnIPS, SnDR, MRDR, DRPE, SWITCH, DRoS |
| アブレーション | DM(R)（密度比 $\mathcal{W}=1$ に固定, Eq.23） |
| **提案** | DM-PS, DR-PS（方策シフト用）／ DM-GCS, DR-GCS（一般共変量シフト用）＋ 自己正規化版 SnDR-PS/SnDR-GCS |

### Figure 3: 主結果（相対 MSE の CDF 曲線）

| 設定 | 条件数 | 提案手法の勝率 |
|------|--------|----------------|
| 方策シフトのみ | 360 条件 | **DM-PS 系が 90% 超**で最良（ログ方策既知・未知とも, Fig.3a–d, Table4） |
| 一般共変量シフト（密度比既知） | 1,260 条件 | **DM-GCS 系が 72% 超**で SnIPS-GCS を上回る（Fig.3e） |
| 一般共変量シフト（密度比未知） | — | DM-PS 系がリード（Fig.3f） |

画像パス: `x1.png`, `x2.png`。全実験条件は合計 **1,620 条件**。

### Figure 4: シフト量を変化させた性能

シフトが大きくなるほど提案法のロバスト優位が拡大（overlap 減少時に従来法が発散するのに対し提案法は有界）。

### Table C: 理論上界のまとめ

| 定理 | 内容 |
|------|------|
| Theorem 1 | 期待二乗誤差の有限標本上界（overlap $m$ 依存） |
| Corollary 1 | DM 系のバイアス上界 $\le\varepsilon$ |
| Theorem 2 | DR 系のバイアス上界（$\mathcal{W}=1$ でないと発散しにくい） |

---

## Experiments & Evaluation

### Setup

- **データ**: UCI 9データセット（Table 1）を supervised-to-bandit 変換。
- **共変量シフト**: Gaussian（第1主成分ベース）と Tweak-1（クラス別重み $\omega$）。
- **ログ方策**: Softened / Tweak-1 / Dirichlet の3カテゴリ計10方策。**目標方策**: Softened / Softened perfect / Softened diverse perfect の3種。
- **ベースライン**: DM, IPS, DR, SnIPS, SnDR, MRDR, DRPE, SWITCH, DRoS, DM(R)。
- **指標**: MSE $\mathbb{E}[(\hat V-V(\pi))^2]$（25% テスト集合）。総 **1,620 条件**。

### Main Results

- **方策シフトのみ（360 条件）**: DM-PS 系が **90% 超**で最良（ログ方策既知・未知とも）。
- **一般共変量シフト（1,260 条件, 密度比既知）**: DM-GCS 系が **72% 超**で SnIPS-GCS を上回る。密度比未知時は DM-PS 系がリード。
- シフトが大きいほど優位が拡大（Fig.4）。overlap $m\to0$ でバイアスが $(1-m)H$ に収束し発散しない。

### Ablation

- **DM(R)**（密度比 $\mathcal{W}=1$ 固定, Eq.23）: 密度比重み付けの重要性を示すアブレーション。
- 自己正規化版 SnDR-PS/SnDR-GCS: 性能維持しつつ分散低減。

---

## 本テーマへの適用可能性

本テーマ（低頻度のクーポン/メール配信を過去ログからオフライン評価したいデータサイエンティスト）にとって、本論文は **「過去ログと将来施策で顧客層そのものが変わる」場合の OPE** に効く。

- **顧客分布シフト下でのクーポン評価**: 過去にクーポンを送った顧客層（source）と、新方策で狙いたい顧客層（target）が異なるのは実務で頻繁に起きる（例: 過去は既存優良顧客中心に配布 → 新方策は新規/休眠層に配布）。これは方策シフトだけでなく **文脈分布 $P(x)$ のシフト** を伴う一般共変量シフトであり、本手法の DM-GCS / DR-GCS がまさに対象とする状況。素朴 IPS が発散する overlap の薄い設定でも、バイアスが有界（$(1-m)H$ に収束）に保たれる。
- **A/B なしのロバスト評価**: 過去の配布ログと密度比推定（source/target の顧客特徴分布比）があれば、A/B を回さず、シフトが大きくても信頼できる価値推定を得られる。低頻度施策で「過去と異なる層を狙う」新方策を評価したいときに特に有効。
- **キャンペーン横断のプーリング**: 異なるキャンペーンは配布対象顧客層が異なるため、単純にログを混ぜると共変量シフトが生じる。本手法の密度比重み付き分布ロバスト回帰は、**キャンペーン間の顧客分布差を密度比で補正しながら報酬モデルを共有学習**する枠組みになり、プーリング時のバイアスを抑えられる。
- **DR との組合せ**: DR-GCS はロバスト報酬モデルと IS 補正の二重頑健構造なので、報酬モデルか密度比のどちらかが多少誤っても頑健。低頻度・少サンプルでモデルが不完全になりがちなクーポン評価に適合する。
- **注意点**: 実証は UCI 由来の中規模行動空間（最大26行動）。券種が極端に多い場合は #06/#07/#08 の大規模行動空間手法と組合せる必要がある。密度比 $\mathcal{W}=P_s/P_t$ の推定精度が結果を左右する（DM(R) アブレーションが示す通り）。

---

## Notes

- 本手法の理論的核心は「overlap $m\to0$ でバイアスが発散せず $(1-m)H$ に収束する」有限標本バイアス上界（Theorem 1, Corollary 1, Theorem 2）。シフト大の領域で従来法に明確に優る根拠。
- 報酬モデルを minimax（分布ロバスト）で学習し DM/DR に載せる、というモジュール構造なので既存 OPE パイプラインへの組込みが容易。
- 方策シフト用（PS）と一般共変量シフト用（GCS）の2系統があり、密度比が既知か未知かで使い分ける。
- 図の一部は個別 URL（`Method6.png`, `GCS04.png`, `x1.png`, `x2.png`）を確認。実験は総 1,620 条件で大規模。
