# 4. A Review of Generalizability and Transportability

- **URL / arXiv**: https://arxiv.org/abs/2102.11904
- **著者 / 発表年 / venue**: Irina Degtiar, Sherri Rose / 2021（arXiv）・2023（Annual Review of Statistics and Its Application 掲載）/ レビュー論文

## 概要
本レビューは、ある研究で推定した因果効果を、より広い/異なる対象集団へ拡張する方法論を体系的に整理する。中心的主張は、集団レベルで偏りのない効果推定には内的妥当性（研究内のバイアス低減）と外的妥当性（対象集団への適用可能性）の両方が不可欠だという点である。generalizability（研究標本が対象集団の一部）と transportability（研究集団と対象集団が異なる）を統一的な枠組みで扱い、それぞれが要求する仮定と検定手続きを提示する。

## 手法・キーアイデア
- **外的妥当性バイアスの枠組み**: 標本と対象集団の分布差が効果推定を歪めるメカニズムを定式化。
- **generalizability と transportability の統合**: 両者を連続体として扱い、必要な識別仮定（効果修飾子の分布、交換可能性、正値性など）を明示。
- **推定手法**: 重み付け（IPW 的）、アウトカム回帰、二重頑健（doubly robust）推定を effect transport に応用。
- **検定**: 処置効果の異質性の検定、および標本と対象集団の差異を評価する手続きを整理。

## ユーザー課題への適用
本レビューは「効果を別ユーザー基盤へ transport する」という本サーベイの第二の柱に直接対応する中核文献である。ある顧客セグメントや地域で測った施策効果（uplift）を、別の顧客基盤・新規市場へ持ち込む際、単純な外挿がなぜ危険か（効果修飾子の分布シフト、正値性違反）を診断する言語と、重み付け・二重頑健による補正手法を与える。実務では、既存基盤で得た CATE を、効果修飾子の分布で再重み付けして新基盤の平均効果を推定する、という transport 手続きの理論的裏付けになる。また効果異質性の検定は、「そもそも transport してよいほど効果が安定か」を事前判断する根拠を与え、グルーピングの外的妥当性チェックにも使える。

## 長所と限界
- **長所**: generalizability/transportability を統一的に俯瞰し、仮定・識別・推定・検定を網羅。二重頑健など実装可能な手法まで橋渡し。査読済み Annual Review 掲載で信頼性が高い。
- **限界**: レビューゆえ新規手法は提示しない。RCT は内的妥当性が高いが代表性が低く、観察データは代表性が高いが未観測交絡の危険という本質的トレードオフは残る。効果修飾子の完全観測という強い仮定に依存。

## 関連手法・次に読むべきもの
- Pearl & Bareinboim, Transportability of Causal Effects（do-calculus / selection diagram）
- Stuart et al., generalizing RCT results to target populations
- Dahabreh et al., transporting inferences from randomized trials
