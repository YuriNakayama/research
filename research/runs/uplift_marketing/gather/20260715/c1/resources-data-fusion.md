# C1: Data Fusion / 多環境・多試験統合 — リソース一覧

[← clustering index](../../../clustering/20260715/index.md)

## スコープ

本リストは「**複数のキャンペーン／試験／環境をまたいで情報を統合・移送する**」ことを主題とする資料のみを収録する。対象読者は、数ヶ月に一度の低頻度マーケティング施策（クーポン・販促メール）を運用し、施策ごとに対象ユーザー・訴求内容・クーポン額が異なるために 1 施策あたりのデータが薄いという課題を抱えるデータサイエンティストである。

収録の判断軸は次の通り。

- **収録する**: 多施設 RCT／多環境／複数試験の統合、transportability・external validity の識別条件、階層ベイズによる partial pooling / borrowing strength、複数データ源からの部分識別、サイト間 transfer。
- **除外する**: uplift / OPE の手法内部の比較検討に閉じるもの（S/T/X-learner の優劣、IPS/DR の分散削減テクニック等）。これらは単一施策内の推定効率の話であり、本クラスタの「施策をまたぐ」という主題に接続しない。
- 医療統計の語彙は `site` → `campaign`、`patient` → `user`、`treatment arm` → `クーポン額水準` と読み替えて評価している。

clustering 段階で既出のリソース（Data Fusion for Partial Identification / Meta-Learners for Partially-Identified Treatment Effects / Causal aggregation / Clustering and Pruning in Causal Data Fusion 等）は再掲せず、**新規に発見したもの**を中心に構成した。ただし議論の土台として不可欠な 1 本（#01）のみ、既出との接続を明示した上で再掲している。

## リソース総覧

| #  | タイトル | 種別 | 年 | リンク | 本課題との関連度 |
|----|---------|------|----|--------|-----------------|
| 01 | Comparison of Methods that Combine Multiple Randomized Trials to Estimate Heterogeneous Treatment Effects | Paper | 2023 | [arXiv:2303.16299](https://arxiv.org/abs/2303.16299) | ◎ |
| 02 | Transfer Estimates for Causal Effects across Heterogeneous Sites | Paper | 2023 | [arXiv:2305.01435](https://arxiv.org/abs/2305.01435) | ◎ |
| 03 | A Review of Generalizability and Transportability | Paper | 2021 | [arXiv:2102.11904](https://arxiv.org/abs/2102.11904) | ◎ |
| 04 | Efficient Heterogeneous Treatment Effect Estimation With Multiple Experiments and Multiple Outcomes | Paper | 2022 | [arXiv:2206.04907](https://arxiv.org/abs/2206.04907) | ◎ |
| 05 | Doubly Robust Identification of Treatment Effects from Multiple Environments | Paper | 2025 | [arXiv:2503.14459](https://arxiv.org/abs/2503.14459) | ◎ |
| 06 | Bayesian Hierarchical Models with Calibrated Mixtures of g-Priors for Assessing Treatment Effect Moderation in Meta-Analysis | Paper | 2024 | [arXiv:2410.24194](https://arxiv.org/abs/2410.24194) | ◎ |
| 07 | Transfer Learning for Causal Effect Estimation | Paper | 2023 | [arXiv:2305.09126](https://arxiv.org/abs/2305.09126) | ○ |
| 08 | Methods for Integrating Trials and Non-Experimental Data to Examine Treatment Effect Heterogeneity | Paper | 2023 | [arXiv:2302.13428](https://arxiv.org/abs/2302.13428) | ○ |
| 09 | Regression-based Estimation of Heterogeneous Treatment Effects When Extending Inferences from a Randomized Trial to a Target Population | Paper | 2021 | [arXiv:2110.00107](https://arxiv.org/abs/2110.00107) | ○ |
| 10 | On Quantification of Borrowing of Information in Hierarchical Bayesian Models | Paper | 2025 | [arXiv:2509.17301](https://arxiv.org/html/2509.17301) | ○ |
| 11 | Identifying Treatment Effect Heterogeneity with Bayesian Hierarchical Adjustable Random Partition (BHARP) | Paper | 2025 | [arXiv:2508.16523](https://arxiv.org/abs/2508.16523) | ○ |
| 12 | Heterogeneity-Aware Federated Causal Inference Leveraging Effect-Measure Transportability | Paper | 2025 | [arXiv:2510.16317](https://arxiv.org/abs/2510.16317) | ○ |
| 13 | Sensitivity Analysis for Transportability in Multi-Study, Multi-Outcome Settings | Paper | 2023 | [arXiv:2301.02904](https://arxiv.org/abs/2301.02904) | ○ |
| 14 | Transporting Experimental Results with Entropy Balancing | Paper | 2020 | [arXiv:2002.07899](https://arxiv.org/abs/2002.07899) | ○ |
| 15 | Testing Generalizability in Causal Inference | Paper | 2024 | [arXiv:2411.03021](https://arxiv.org/abs/2411.03021) | ○ |
| 16 | Advantages and Limitations in the Use of Transfer Learning for Individual Treatment Effects in Causal Machine Learning | Paper | 2025 | [arXiv:2512.16489](https://arxiv.org/html/2512.16489) | △ |
| 17 | これが実務で効く階層ベイズ：上場企業 DS チームの研修資料 | Article | — | [Qiita](https://qiita.com/Gotoubun_taiwan/items/6549859adba3fe879d2a) | △ |

## 各リソース詳細

### 01. Comparison of Methods that Combine Multiple Randomized Trials to Estimate Heterogeneous Treatment Effects

**リンク**: [arXiv:2303.16299](https://arxiv.org/abs/2303.16299)（Brantner, Nguyen, Tang, Zhao, Hong, Stuart / 2023、Statistics in Medicine 2024 として出版）

**概要**: 複数の RCT を統合して異質処置効果（HTE）を推定する既存手法を横断的に比較したレビュー兼シミュレーション研究である。単一試験向けに設計された HTE 推定手法群を複数試験のシナリオへ拡張し、それぞれの挙動をシミュレーションで検証している。中心的な知見は、**試験間の処置効果のばらつきを明示的にモデル化する手法が、それを無視して単純にプールする手法を一貫して上回る**という点である。同時に、どの手法が最良かは効果の関数形に依存するため万能解は存在しないことも示される。実証として、うつ病治療を扱った 4 本の試験のデータへ適用している。

**本課題への示唆**:
- 「試験＝キャンペーン」と読み替えれば、本課題そのものの設定である。**全施策を単純に一つのデータセットへ結合する（完全プール）が明確に劣る**という実証的裏付けが得られ、階層構造を入れる investment を正当化できる。
- 統合対象が 4 本という**少数試験でも手法比較が成立している**点は、施策数が一桁に留まる低頻度マーケティングにとって現実的な参照点となる。
- 手法選択が効果の関数形依存であるため、自社データでの小規模なシミュレーション比較を先に回すという実務手順を示唆する。

**キーとなる用語**: multiple randomized trials, treatment effect variation across trials, HTE, cross-trial heterogeneity

### 02. Transfer Estimates for Causal Effects across Heterogeneous Sites

**リンク**: [arXiv:2305.01435](https://arxiv.org/abs/2305.01435)（Konrad Menzel / 2023、v7 2025 改訂）

**概要**: 複数の実験サイトの横断データと、移送先ロケーションのベースライン調査情報のみを用いて、処置効果を別の文脈へ外挿する手法を提案する。特徴的な着想は、**ベースラインデータを「関数的情報」として扱う**点にある。未観測のサイト固有交絡は、アウトカムの平均水準にのみ現れるのではなく、観測属性との相関構造にも現れるという洞察に基づき、その相関構造から移送の補正を組み立てる。ノンパラメトリックかつデザインベースの枠組みで、予測子の最適な基底の構成法と、推定された条件付き処置効果の収束レートを与える。条件付き現金給付プログラムの 5 本の RCT データへ適用し、移送先へ適応させることによる利得を定量化している。

**本課題への示唆**:
- 新規施策について**実績データがなくても、対象ユーザー層のベースライン属性分布さえ手元にあれば**過去施策の効果を移送できるという設計は、配信前のターゲットリストしかない状況に直接対応する。
- 「サイト固有交絡が属性との相関構造に現れる」という視点は、施策ごとに配信チャネルや季節性が異なる場合の系統誤差の捉え方を与える。
- 5 サイトという少数からの移送で利得を実証しており、施策数が少ない段階での期待値の目安になる。

**キーとなる用語**: transfer estimates, heterogeneous sites, site-specific confounders, design-based, functional baseline information

### 03. A Review of Generalizability and Transportability

**リンク**: [arXiv:2102.11904](https://arxiv.org/abs/2102.11904)（2021）

**概要**: 外的妥当性バイアスに対処するための枠組みを整理したレビューである。generalizability（研究対象集団からより広い集団への一般化）と transportability（まったく別の対象集団への移送）を明確に区別し、それぞれが要求する仮定を体系的に提示する。加えて、処置効果の異質性の検定、および研究集団と対象集団の差異の検定についても扱う。識別条件を「何を仮定すれば過去のデータを別集団に使ってよいか」という形で言語化しており、本クラスタの共通語彙を提供する位置づけの文献である。

**本課題への示唆**:
- **generalizability と transportability の区別**は、「同じユーザー基盤の別セグメントへの展開」と「まったく新しい対象層への展開」を実務上分けて論じる語彙を与える。前者の方が要求仮定は弱い。
- 効果修飾因子の分布差の検定手順は、「この過去施策は今回の施策のプール対象として妥当か」を感覚でなくデータで判定する道具になる。
- 仮定の明示化により、実績ゼロ施策の予測（C3）の正当性を議論する際の前提整理に使える。

**キーとなる用語**: generalizability, transportability, external validity bias, effect modifier, exchangeability

### 04. Efficient Heterogeneous Treatment Effect Estimation With Multiple Experiments and Multiple Outcomes

**リンク**: [arXiv:2206.04907](https://arxiv.org/abs/2206.04907)（2022）

**概要**: 複数の実験と複数のアウトカムが同時に存在する状況での HTE 推定の効率化を扱う。個々の実験・個々のアウトカムを独立に推定するのではなく、実験間・アウトカム間の構造を共有することで推定効率を高める枠組みを提示する。複数実験からの情報統合と、多アウトカム構造の活用という二つの軸を同時に扱う点が特徴で、単一実験・単一アウトカムの設定からの自然な拡張として定式化されている。統計的効率性の観点から、統合によってどれだけの利得が得られるかを理論的に議論している。

**本課題への示唆**:
- マーケティング施策では**購買額・購買率・再訪率など複数の KPI を同時に観測する**のが常であり、多アウトカム構造を効率化に使えるという主張は実務適合性が高い。
- 「実験 × アウトカム」の二次元で情報を借りるため、施策数が少なくてもアウトカム側の本数で補える可能性がある。データ密度を増やす方向が一つ増える。
- C5（surrogate）と接続すると、短期 KPI を追加アウトカムとして統合効率に貢献させる設計が考えられる。

**キーとなる用語**: multiple experiments, multiple outcomes, efficiency, HTE, joint estimation

### 05. Doubly Robust Identification of Treatment Effects from Multiple Environments

**リンク**: [arXiv:2503.14459](https://arxiv.org/abs/2503.14459)（2025）

**概要**: 複数環境からのデータを用いた処置効果の識別に、二重頑健性（doubly robust）の考え方を持ち込む研究である。invariant causal prediction の系譜に連なり、環境をまたいで不変な因果メカニズムの存在を仮定しつつ、その仮定が部分的に破れた場合にも頑健な識別を目指す。複数環境という設定は、環境ごとに共変量分布は異なるが因果メカニズムは共有されるという構造を前提とし、この不変性を識別の梃子として使う。近年の多環境因果推論の中では比較的新しい理論的貢献にあたる。

**本課題への示唆**:
- 「環境＝キャンペーン」と読み替えると、**施策ごとに対象ユーザー分布は違うが反応メカニズムは共通**という、本課題で暗黙に置きたい仮定そのものを形式化している。
- 二重頑健性により、不変性の仮定が完全には成り立たない現実の施策群でも推定が壊れにくい設計になっている点が実務的に重要。
- 不変性が成り立つ部分と成り立たない部分を切り分ける発想は、C2 の施策埋め込み（何を共有し何を施策固有とするか）の設計指針に直結する。

**キーとなる用語**: multiple environments, doubly robust, invariant causal prediction, identification, environment shift

### 06. Bayesian Hierarchical Models with Calibrated Mixtures of g-Priors for Assessing Treatment Effect Moderation in Meta-Analysis

**リンク**: [arXiv:2410.24194](https://arxiv.org/abs/2410.24194)（2024）

**概要**: 個票データメタ分析（IPD-MA）における処置効果の moderation（効果修飾）評価を扱う。IPD-MA は複数試験の個人レベルデータを活用できる強力な枠組みだが、**試験間のばらつきが大きいと性能が劣化する**という実務的課題を持つ。本論文はこれに対し、calibrated mixtures of g-priors を用いた事前分布設計を提案する。具体的には、試験レベルのサンプルサイズに応じたチューニング関数と、moderator レベルの縮小パラメータを事前分布に組み込むことで、moderation 効果の推定における効率とリスクを改善する。

**本課題への示唆**:
- **施策ごとのサンプルサイズが不揃い**という本課題の構造に対し、サンプルサイズ依存のチューニング関数という明示的な対処を与える。小さい施策ほど強く全体へ縮小される挙動は望ましい。
- moderator レベルの縮小は、「どのユーザー属性が施策効果を修飾するか」を施策をまたいで学習する設計であり、C2 への橋渡しになる。
- IPD-MA は自社データなら個票が全て手元にあるため、医療分野より前提条件が良い。集約統計量しか使えない古典的メタ分析より強力な選択肢である。

**キーとなる用語**: IPD meta-analysis, treatment effect moderation, g-prior, between-trial variability, shrinkage

### 07. Transfer Learning for Causal Effect Estimation

**リンク**: [arXiv:2305.09126](https://arxiv.org/abs/2305.09126)（2023）

**概要**: ソース領域とターゲット領域が同一の共変量空間を共有する状況での Transfer Causal Learning（TCL）フレームワークを提示する。中心的なアイデアは、傾向スコアモデル等の **nuisance model に対して ℓ1 正則化つき転移学習を適用**し、その転移学習推定量を下流の平均処置効果推定量へプラグインするという二段構えである（ℓ1-TCL）。データが限られた状況での因果効果推定の精度改善を目的としており、理論保証も与えられている。既存の因果推定量の枠組みを大きく変えずに転移を差し込める点が設計上の利点である。

**本課題への示唆**:
- **既存の推定パイプラインを保ったまま転移だけ追加できる**構成のため、導入コストが低い。まず nuisance model 側だけ過去施策から転移するという段階的な適用が可能。
- 共変量空間が共通という前提は、同一のユーザー基盤に対する施策群であれば自然に満たされる。
- 一方でソース・ターゲットの二領域設定が基本であり、多数施策の同時プールには #01 や #06 の方が直接的である。

**キーとなる用語**: transfer causal learning, nuisance model, ℓ1 regularization, source/target domain

### 08. Methods for Integrating Trials and Non-Experimental Data to Examine Treatment Effect Heterogeneity

**リンク**: [arXiv:2302.13428](https://arxiv.org/abs/2302.13428)（2023）

**概要**: 試験データと非実験データ（観察データ）を統合して処置効果の異質性を検討する手法群を整理した論文である。RCT は内的妥当性に優れるがサンプルが小さく対象が限定的、観察データは大規模だが交絡を含むという相補的な性質を踏まえ、両者を組み合わせる複数のアプローチを比較・体系化する。異質性の検討という目的に絞って手法を整理している点が特徴で、平均効果の統合とは要求が異なることを明確にしている。

**本課題への示唆**:
- マーケティングでは**ランダム化した施策（ホールドアウト付き）と、ランダム化なしの通常配信ログ**が併存するのが普通であり、この非対称な二種のデータをどう混ぜるかは実務上の頻出課題である。
- 観察データ側の規模で異質性の解像度を上げつつ、RCT 側でバイアスを補正するという役割分担の考え方が得られる。
- 過去のランダム化なし施策のログを「捨てずに使う」正当な道筋を与える。

**キーとなる用語**: trials, non-experimental data, integration, treatment effect heterogeneity, confounding

### 09. Regression-based Estimation of Heterogeneous Treatment Effects When Extending Inferences from a Randomized Trial to a Target Population

**リンク**: [arXiv:2110.00107](https://arxiv.org/abs/2110.00107)（2021）

**概要**: RCT から対象集団へ推論を拡張する際の、サブグループ別処置効果の推定手法を扱う。交換可能性（exchangeability）が成り立つように共変量で条件付けるという基本方針のもと、g-formula、重み付け、および augmented weighting 推定量を用いたサブグループ別効果の推定法を提示する。回帰ベースのアプローチであり、実装が比較的直截である点が特徴。移送の理論を具体的な推定手順まで落とし込んでおり、#03 のレビューで整理される概念の実装版にあたる。

**本課題への示唆**:
- **サブグループ別**に移送するという定式化は、「過去施策の効果を今回のターゲットセグメント別に読み替える」という実務操作に対応する。
- g-formula / 重み付け / augmented の三系統が示されるため、手元のデータ量と共変量の質に応じて選べる。
- 実装が直截なため、階層ベイズの前段として最初に試す baseline として適する。

**キーとなる用語**: g-formula, weighting, augmented weighting, subgroup effects, target population

### 10. On Quantification of Borrowing of Information in Hierarchical Bayesian Models

**リンク**: [arXiv:2509.17301](https://arxiv.org/html/2509.17301)（2025）

**概要**: 階層ベイズモデルにおける「情報の借用（borrowing of information）」を定量化する方法を論じる。多施設試験やメタ分析のように母集団が相関を持つ状況では、どの程度の情報が群間で共有されているかを測る指標が求められる。本論文はその定量化の枠組みを与え、**より豊かな階層構造を指定するほど、また階層が深いほど、群間の情報共有が効果的に働く**ことを示す。partial pooling が実際にどれだけ効いているかをブラックボックスにせず、診断可能な量として扱う点に価値がある。

**本課題への示唆**:
- 「階層ベイズを入れたが、本当に施策間で情報が借りられているのか」を**検証する指標**を与える。導入の効果測定に直接使える。
- 階層を深くするほど共有が効くという知見は、「施策 → 施策カテゴリ（クーポン額帯・訴求タイプ）→ 全体」という多段階の階層設計を後押しする。
- 過度な借用（over-shrinkage）の検知にも使え、#11 の問題意識と対になる。

**キーとなる用語**: borrowing of information, hierarchical Bayesian, partial pooling, multi-center trials, exchangeability

### 11. Identifying Treatment Effect Heterogeneity with Bayesian Hierarchical Adjustable Random Partition (BHARP)

**リンク**: [arXiv:2508.16523](https://arxiv.org/abs/2508.16523)（2025）

**概要**: 階層ベイズモデルは全サブグループ間で情報を借用するため、反応が似ている場合には検出力を大きく改善する。しかし**処置効果に異質性がある場合、完全交換可能性の仮定はサブグループ固有の推定値を過度に縮小してしまう**という問題がある。BHARP はこれに対し、有限混合モデルで分割空間（どのサブグループ同士をまとめるか）を探索し、クラスタ内の凝集度に応じて借用の強さを自動調整する。手動でのキャリブレーションを要さずに、サブグループ固有効果の推定と借用強度の調整を同時に行う点が中心的な貢献である。

**本課題への示唆**:
- 「**どの施策同士をプールしてよいか**」をデータから自動的に決める仕組みであり、本課題の中核的な問い（似た施策のグルーピング）に正面から答える設計である。
- 完全交換可能性による over-shrinkage の指摘は重要。訴求内容やクーポン額が大きく異なる施策を無理に全部借用させると、個別施策の推定が歪む。
- 手動キャリブレーション不要という性質は、施策数が増えるたびに再チューニングする運用負荷を避けられる。

**キーとなる用語**: random partition, finite mixture, borrowing strength, over-shrinkage, adaptive borrowing, exchangeability

### 12. Heterogeneity-Aware Federated Causal Inference Leveraging Effect-Measure Transportability

**リンク**: [arXiv:2510.16317](https://arxiv.org/abs/2510.16317)（2025）

**概要**: 複数の研究サイトのデータを活用して因果推定量の推定効率を高めつつ、プライバシーを保護する federated な枠組みを扱う。中心となるのは **effect-measure transportability** という考え方で、二種類の transportability 仮定のもとで準パラメトリック効率的な推定量を導出・比較する。サイト間の異質性を明示的に意識した設計になっており、単純な集約では失われる効率を回復することを目指す。federated 設定であるため個票データを集約せずに済む。

**本課題への示唆**:
- 「効果指標そのものが移送可能」という仮定は、絶対的な購買額よりも**リフト率のような相対指標の方が施策間で移送しやすい**という実務的直観に理論的な裏付けを与える。効果指標の選択が統合可否を左右する。
- 二つの transportability 仮定の比較は、自社の施策群でどちらが妥当かを検討する枠組みになる。
- federated 側面は、事業部やブランドをまたいでデータを集約できない組織制約がある場合に直接効く。

**キーとなる用語**: federated causal inference, effect-measure transportability, semiparametric efficiency, site heterogeneity

### 13. Sensitivity Analysis for Transportability in Multi-Study, Multi-Outcome Settings

**リンク**: [arXiv:2301.02904](https://arxiv.org/abs/2301.02904)（2023）

**概要**: 複数研究・複数アウトカムの設定における因果効果の移送と一般化を扱い、特に**主要アウトカムが研究レベルで系統的に欠測している**状況に焦点を当てる。ある試験では測っているが別の試験では測っていないアウトカムが存在する、という現実的な不完全性のもとで移送を行うための感度分析の枠組みを提供する。仮定が破れた場合に結論がどれだけ動くかを定量化するアプローチであり、点推定の提示より頑健性の評価に重心を置く。

**本課題への示唆**:
- **施策ごとに測っている KPI が違う**（ある施策は購買額のみ、別の施策は再訪率も追跡）という実務的にありふれた不揃いを、欠測構造として正面から扱える。
- 感度分析の枠組みは、統合の仮定が疑わしい場合に「統合しない」か「区間で示す」かの判断材料になる。低頻度施策で無理に点推定を出すより安全という本クラスタの方針と整合する。
- study-level の系統的欠測という定式化は、過去施策の計測設計が年々変わっている状況に適合する。

**キーとなる用語**: sensitivity analysis, transportability, multi-study, systematically missing outcomes

### 14. Transporting Experimental Results with Entropy Balancing

**リンク**: [arXiv:2002.07899](https://arxiv.org/abs/2002.07899)（2020）

**概要**: 実験結果を別の対象集団へ移送する際に entropy balancing を用いる手法を扱う。処置効果に異質性がある場合、**効果修飾因子の分布が試験集団と対象集団で異なると、観測される平均処置効果がずれる**という問題が生じる。entropy balancing は共変量のモーメントを対象集団に一致させる重みを直接構成することでこれに対処する。傾向スコアの推定を経ずに balancing weight を得るため、モデル誤特定に対して比較的頑健であり、実装も確立されている。

**本課題への示唆**:
- **実装が軽く、既存の集計フローに重み付けとして差し込める**ため、階層ベイズのような大掛かりな枠組みに進む前の第一歩として現実的。
- 「施策 A のユーザー層で得た効果を、施策 B のターゲット層の属性分布に合わせて重み付けし直す」という操作が直接実行できる。
- モーメントマッチングであるため、共変量の重なりが乏しい施策間では重みが極端化する。重なりの診断が前提となる。

**キーとなる用語**: entropy balancing, balancing weights, effect modifier distribution, transporting

### 15. Testing Generalizability in Causal Inference

**リンク**: [arXiv:2411.03021](https://arxiv.org/abs/2411.03021)（2024）

**概要**: 因果推論における一般化可能性を**検定**の問題として扱う研究である。ある研究から得られた結果が別の集団へ一般化できるか否かを、仮定として置くのではなく統計的に評価する手続きを与える。移送の理論が「どういう仮定を置けば移送できるか」を論じるのに対し、本論文は「その仮定が手元のデータと整合するか」を問う立場にあり、実務での適用可否判断に直結する。

**本課題への示唆**:
- 「**この過去施策群は今回の施策にプールしてよいのか**」をデータ駆動で判定する検定手続きを与える。#11 の自動分割とは別方向からの、明示的な事前チェックにあたる。
- 統合の可否を事前に検定してから統合手法を選ぶ、という二段階の実務フローが組める。
- 検定が棄却された施策を除外する運用は、プール対象の品質管理として機能する。

**キーとなる用語**: generalizability testing, hypothesis test, external validity, causal inference

### 16. Advantages and Limitations in the Use of Transfer Learning for Individual Treatment Effects in Causal Machine Learning

**リンク**: [arXiv:2512.16489](https://arxiv.org/html/2512.16489)（2025）

**概要**: 因果機械学習における個別処置効果の推定に転移学習を用いる際の利点と限界を検討する。ソースデータとターゲットデータが同一の母集団に由来する**小サンプル設定**において、転移学習が予測性能を実際に改善するのはどのような条件下かを整理する。転移が常に有効とは限らないという批判的な視点を含み、negative transfer の可能性にも触れる。手法の提案というより、適用条件の見極めに関する実証的な検討という位置づけである。

**本課題への示唆**:
- 転移・プーリングを**無条件に善とせず、効かない条件を明示**する点で、導入判断のバランスを取るために有用。過度な期待の抑制になる。
- 小サンプル設定を明示的に扱うため、施策あたりのデータが薄い本課題の前提と一致する。
- ただし同一母集団由来という前提が置かれており、対象ユーザー層が施策ごとに異なる本課題より条件が良い。結論をそのまま適用する際は割り引きが必要。

**キーとなる用語**: transfer learning, individual treatment effects, small sample, negative transfer, causal machine learning

### 17. これが実務で効く階層ベイズ：上場企業 DS チームの研修資料

**リンク**: [Qiita](https://qiita.com/Gotoubun_taiwan/items/6549859adba3fe879d2a)

**概要**: 事業会社のデータサイエンスチーム向け研修資料を公開した日本語記事である。階層ベイズを部分プーリングの観点から解説し、グループごとの平均を持たせつつ全体平均からのズレとしてモデル化することで、情報を共有しながらグループ間の差も許容するという構造を説明する。特に**サンプルサイズのばらつきが大きい現実のデータ**において実用的である点を強調しており、完全プールと完全独立の中間という本クラスタの中心概念を平易に扱う。学術論文ではなく実務者向けの入門資料である。

**本課題への示唆**:
- 日本語で partial pooling の直観を共有できるため、**チーム内やステークホルダーへの説明資料**として機能する。手法導入の合意形成コストを下げる。
- サンプルサイズ不揃いへの実用性という論点は、施策規模がばらつく本課題と直接対応する。
- 内容は入門的であり、実装の詳細や識別条件は #06 / #10 / #11 等の論文側で補う必要がある。

**キーとなる用語**: 階層ベイズ, 部分プーリング, partial pooling, 縮小推定

## 調査から見えた論点

- **完全プールが劣ることには実証的な合意がある。** #01 のシミュレーション比較は、試験間の効果ばらつきを明示的にモデル化する手法が単純プールを一貫して上回ることを示す。本課題で「過去の全施策を単に一つのテーブルに結合する」という素朴な密度向上策は、統計的に支持されない。中間解（partial pooling）へ進む根拠が既に揃っている。

- **本当の難所は「どの施策をプールするか」の決定である。** 手法群は統合の仕方を与えるが、統合対象の選定は別問題として残る。この問いには三つの異なるアプローチが見つかった。(a) データ駆動で分割を自動探索する（#11 BHARP）、(b) 一般化可能性を事前に検定して選別する（#15）、(c) 効果修飾因子の分布差を重みで補正して全て使う（#14）。三者は排他的でなく、組み合わせる余地がある。

- **over-shrinkage は現実的なリスクである。** #11 が指摘する通り、完全交換可能性を課すと異質性のあるサブグループの推定が過度に縮小される。訴求内容もクーポン額も異なる施策群を無条件に交換可能と見なすのは危うい。#10 の借用量の定量化指標は、この過不足を診断する道具として対になる。

- **効果指標の選択が移送可能性を左右する。** #12 の effect-measure transportability は、どの尺度で効果を測るかによって移送の成否が変わることを示す。絶対的な購買額増分より相対的なリフト率の方が施策間で安定する、という実務的直観に理論的根拠を与えており、統合の前段としてまず指標設計を見直す価値がある。

- **多アウトカムはデータ密度を増やす第二の軸になる。** 施策数を増やせない以上、#04 のように複数 KPI を同時に扱って効率を稼ぐ方向は現実的である。C5（surrogate）と組み合わせれば、短期指標を追加アウトカムとして統合効率に寄与させられる可能性がある。

- **計測設計の不揃いは織り込み済みの課題である。** #13 が扱う study-level の系統的欠測は、施策ごとに追跡している KPI が異なるという実務状況にそのまま対応する。過去施策の計測が年々変わっていても、感度分析の枠組みで扱える。

- **実装コストの階段が見える。** 軽い順に、#14 entropy balancing（重み付けのみ）→ #09 回帰ベース移送 → #07 nuisance model への転移差し込み → #06 / #11 階層ベイズ、という段階的な導入経路が構成できる。いきなり階層ベイズに行かず、重み付けで感触を掴む選択肢がある。

- **医療統計側の資産は前提条件がむしろ厳しい。** IPD-MA（#06）は個票データが揃うことを理想とするが、医療では入手困難な一方、自社マーケティングデータでは個票が全て手元にある。医療分野で発達した手法を、より良い前提条件で適用できる立場にある。

## retrieval 推奨

優先的に精読すべきものを以下に挙げる。

1. **#01 Comparison of Methods that Combine Multiple Randomized Trials to Estimate HTE**（[arXiv:2303.16299](https://arxiv.org/abs/2303.16299)）
   本課題と設定が最も近い。「複数試験 × HTE 推定」という構図はそのままキャンペーンに置き換わり、4 試験という少数での比較は施策数が一桁の現実に適合する。手法選択の見取り図が得られるため、他を読む前の地図として最初に置くべきである。

2. **#11 BHARP: Bayesian Hierarchical Adjustable Random Partition**（[arXiv:2508.16523](https://arxiv.org/abs/2508.16523)）
   「似た施策をどうグルーピングするか」という本課題の中核の問いに、データ駆動の自動分割で直接答える。over-shrinkage という失敗モードを明示している点も実務判断に効く。#01 で全体像を掴んだ後の本命候補。

3. **#02 Transfer Estimates for Causal Effects across Heterogeneous Sites**（[arXiv:2305.01435](https://arxiv.org/abs/2305.01435)）
   実績データのない新規施策に対し、ターゲット層のベースライン属性のみで効果を移送する設計を与える。C3（実績ゼロ施策の予測）への接続経路として、本クラスタから最も遠くまで届くリソースである。5 サイトからの移送という実証規模も現実的。

4. **#06 Bayesian Hierarchical Models with Calibrated Mixtures of g-Priors for IPD-MA**（[arXiv:2410.24194](https://arxiv.org/abs/2410.24194)）
   施策ごとのサンプルサイズ不揃いに対するチューニング関数、および moderator レベルの縮小という二つの仕掛けが本課題の構造に噛み合う。自社データは個票が揃うため IPD-MA の前提を満たしやすい。C2 への橋渡しとしても読める。

5. **#12 Heterogeneity-Aware Federated Causal Inference Leveraging Effect-Measure Transportability**（[arXiv:2510.16317](https://arxiv.org/abs/2510.16317)）
   効果指標の選び方が移送可能性を決めるという論点は、統合手法の選定より前段の設計判断に関わる。上位 4 本が「どう統合するか」を扱うのに対し、本論文は「何を統合の対象量とするか」を問う点で補完的である。
