# オフ方策評価 (OPE) / 反実仮想学習 — 詳細レポート（C2）

## Parameters

- **Resources analyzed**: 14 論文（全て arXiv 中心）
- **Resource types**: Academic Paper
- **Generated on**: 2026-07-12
- **Input source**: `clustering/20260712/cluster-02` + `gather/20260712_all`（C2 セクション）
- **Detail level**: 詳細（各 200〜400 行、図表・数式・擬似コード・本テーマへの適用可能性込み）
- **本テーマ**: 過去の施策ログのみから、まだ配信していないクーポン/メールの出し分け方策を A/B なしにオフライン評価・最適化し、施策横断でデータを活用する

## Big Picture

C2 は「実際に配信した施策とその結果ログ」だけで新方策の性能を推定する反実仮想機械学習。14本は3系統に整理できる。**(1) 大規模行動空間の分散制御**（MIPS→OffCEM→MDR→POTEC→Policy Convolution→OPCB）— クーポン種別・訴求文面が多数あると IPS の分散が爆発するため、行動埋め込み・クラスタ分解で抑える系譜。**(2) 推定量設計の基礎**（OBP 基盤、DRos 縮小、最適 baseline correction、Cascade-DR）。**(3) 時間・探索の拡張**（長期 OPE、非定常 OPFV、クーポンの収益 vs 探索の両立）。実務では OBP で IPS→DR→DRos→MIPS を比較し、行動数が多ければ (1) を、長期 KPI や非定常なら (3) を足す。

## Report List

| # | Title | Year | Venue | Summary | Report |
|---|-------|------|-------|---------|--------|
| 1 | Open Bandit Dataset & Pipeline | 2021 | NeurIPS 2021 D&B | ZOZOTOWN 実運用ログ＋標準化 Python パイプライン。OPE 推定量の再現可能な比較基盤 | [詳細](01-open-bandit-pipeline.md) |
| 2 | MIPS (Marginalized IPS) | 2022 | ICML 2022 | 行動埋め込みの周辺化重要度重みで大行動空間の IPS 分散を抑制（行動数5000で MSE 約12倍改善） | [詳細](02-mips-large-action.md) |
| 3 | OffCEM (Conjunct Effect Model) | 2023 | ICML 2023 | 因果効果をクラスタ効果＋残差効果に分解しクラスタにのみ重み付け、local correctness で不偏 | [詳細](03-offcem-conjunct-effect.md) |
| 4 | DRos (DR with Shrinkage) | 2020 | ICML 2020 | 重要度重みを MSE 上界最小化で縮小する DR 設計フレームワーク（DRos/DRps） | [詳細](04-dr-shrinkage-dros.md) |
| 5 | MDR (Marginalized DR) | 2023 | arXiv | MIPS に DR 補正を加え、より弱い仮定で不偏かつ MIPS より低分散 | [詳細](05-mdr-marginalized-dr.md) |
| 6 | POTEC (Two-Stage Policy Decomposition) | 2024 | arXiv | 行動をクラスタ化し「クラスタ選択（方策）＋クラスタ内選択（回帰）」に分解、低分散な大規模 OPL | [詳細](06-potec-two-stage.md) |
| 7 | OPCB (Combinatorial Bandits OPE/OPL) | 2024 | RecSys 2024 | 部分集合選択を主効果(IS不偏)＋残差効果(回帰低分散)に因子化、指数的な部分集合数でも安定 | [詳細](07-combinatorial-bandits-ope.md) |
| 8 | Policy Convolution | 2024 | WWW 2024 | 行動埋め込み上でログ/目標方策を畳み込みバイアス分散を制御、MSE を最大5〜6桁改善 | [詳細](08-policy-convolution.md) |
| 9 | Coupon: Revenue vs Future OPE | 2024 | arXiv | 収益最大化方策とランダム探索方策を混合比 α で結合し多目的最適化（**本テーマ直結**） | [詳細](09-coupon-revenue-vs-ope.md) |
| 10 | DR Policy Eval under Covariate Shift | 2024 | arXiv | 分布ロバスト回帰で報酬モデルを学習、シフト大でも有界バイアス（方策シフト90%で最良） | [詳細](10-dr-policy-covariate-shift.md) |
| 11 | Cascade-DR (Ranking) | 2022 | WSDM 2022 | cascade 仮定の RIPS に報酬回帰を control variate として組込み、ランキング OPE のバイアス分散両立 | [詳細](11-cascade-dr-ranking.md) |
| 12 | Optimal Baseline Corrections | 2024 | RecSys 2024 | SNIPS/DR/BanditNet を baseline-corrected IPS に統一し、分散最小の最適 β を不偏なまま導出 | [詳細](12-optimal-baseline-corrections.md) |
| 13 | Long-term OPE (LOPE) | 2024 | WWW 2024 | 長期報酬を短期成果予測＋行動固有効果に分解、surrogacy 不要の緩和仮定で低分散評価 | [詳細](13-long-term-ope.md) |
| 14 | OPE for the Future under Non-Stationarity (OPFV) | 2025 | KDD 2025 | time feature を鍵にした importance weighting で将来時点の方策価値を非定常下で推定 | [詳細](14-ope-future-nonstationary.md) |

## Cross-Resource Insights

- **クーポン/メールは「大規模行動空間」問題**: 訴求文面×クーポン額×セグメントの組合せは行動数が膨大。#2/#3/#5/#6/#8 の埋め込み・クラスタ分解が実務上の要。
- **#9 が本テーマに最も直結**: 目先の収益最大化と、将来の OPE のためのデータ収集（探索）を混合比 α で両立。数ヶ月に一度の施策でも「次の評価に使えるログ」を意図的に残す設計。
- **長期 KPI と非定常**: マーケ効果は遅延しがち。#13（長期 OPE）と #14（非定常下の将来評価）は、施策間隔が長く環境が変わる本ケースに適合。
- **C4 との接続**: #13 の「短期→長期」分解は C4 の surrogate index（#25 Netflix）と同じ発想。OPE 側と実験プラットフォーム側が代理指標で合流する。

## Comparison Table（大規模行動空間 OPE 推定量）

| 手法 (#) | 分散抑制の機構 | 不偏性の条件 | 定量効果（出典値） |
|---------|--------------|------------|-----------------|
| MIPS (#2) | 行動埋め込みで重要度重みを周辺化 | no direct effect | 行動数5000で MSE 約12倍改善 |
| OffCEM (#3) | クラスタ効果＋残差効果に分解 | local correctness | 記載は本文参照 |
| MDR (#5) | MIPS に DR 補正 | no direct effect より弱い仮定 | MIPS より低分散 |
| POTEC (#6) | クラスタ選択(方策)＋クラスタ内(回帰) | 局所正確性 | 低分散な大規模 OPL |
| Policy Convolution (#8) | 埋め込み上で方策を畳み込み | 畳み込み量で制御 | MSE 最大5〜6桁改善 |
| DRos (#4) | 重要度重みを MSE 上界最小化で縮小 | DR 一致性 | — |

## Further Investigation Candidates

- Mercari のクーポン配布 OPE 実運用（cases #1）、DoorDash Double ML（cases #11）を retrieval で深掘り。
- gather C2 未収録：AIPS（2306.15098）、Slate abstraction（2402.02171）、新規行動 OPE（2605.18509, 2510.07635）。

## 次のステップ

- C1（uplift/CATE）retrieval で推定量の土台を補完し、C2 と接続。
- 実装検証：OBP 上で本ケースのクーポン方策を IPS→DR→DRos→MIPS で比較。
