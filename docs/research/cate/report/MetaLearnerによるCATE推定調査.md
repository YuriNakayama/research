# **機械学習モデルを選ばないCATE推定：MetaLearnerの進化と最前線に関する調査報告書**

因果推論の領域において、個別の単位や共変量の条件に基づく処置効果の異質性を解明することは、意思決定の最適化において極めて重要な役割を果たす。本報告書では、条件付き平均処置効果（Conditional Average Treatment Effect: CATE）を推定するための強力な枠組みである「MetaLearner（メタ学習器）」について、その基礎から最新の学術的動向までを網羅的に調査した結果を詳述する。MetaLearnerは、任意の機械学習アルゴリズムを「ベース学習器」として利用できるモデル非依存型（Model-agnostic）の性質を持ち、現代のデータサイエンスにおける因果推論の実践において標準的な選択肢となっている 1。

## **CATE推定とMetaLearnerの役割**

CATEは、共変量 $X=x$ が与えられたとき、処置 $T=1$ と制御 $T=0$ の間での期待される潜在的アウトカムの差として定義される。数学的には、$\\tau(x) \= E$ と表現される 4。しかし、個々の観測単位について $Y(1)$ と $Y(0)$ を同時に観測することは不可能であるため（因果推論の根本問題）、既存の機械学習モデルを直接適用して処置効果を学習することはできない 3。

MetaLearnerは、この「教師データの欠如」という課題を、回帰や分類といった標準的な教師あり学習のタスクへと分解・変換することで解決する 7。特定の機械学習モデル（ニューラルネットワークやランダムフォレストなど）に依存せず、不快関数（Nuisance functions）の推定とCATEの推定を分離する二段階以上の手続きを踏むことがその特徴である 1。

## **基礎的なMetaLearnerの体系的理解**

MetaLearnerの基本手法には、S-Learner、T-Learner、X-Learner、R-Learner、DR-Learnerといった、データの利用方法や損失関数の設計が異なる複数のアプローチが存在する。

### **S-LearnerおよびT-Learnerの限界**

S-Learner（Single-Learner）は、処置変数 $T$ を共変量 $X$ と並列な一つの特徴量として扱い、全データを用いて単一のモデル $\\mu(x, t) \= E$ を学習する 7。CATEの推定は、学習済みモデルを用いて処置の有無を切り替えた予測値の差分 $\\hat{\\tau}\_S(x) \= \\hat{\\mu}(x, 1\) \- \\hat{\\mu}(x, 0)$ として得られる。S-Learnerは全データを使用できるためデータ効率が良い反面、正則化によって処置変数の寄与が無視されやすく、処置効果がゼロに偏るバイアス（Zero-bias）が生じやすい 7。

これに対し、T-Learner（Two-Learner）は処置群と制御群それぞれに独立したモデル $\\hat{\\mu}\_1(x)$ および $\\hat{\\mu}\_0(x)$ を構築する 4。

$$\\hat{\\tau}\_T(x) \= \\hat{\\mu}\_1(x) \- \\hat{\\mu}\_0(x)$$

T-Learnerは応答関数の形状が処置によって大きく異なる場合に有効であるが、各群のサンプルサイズが小さい場合や、群間でのデータ分布の重なり（Overlap）が不十分な場合に、推定誤差が大きく増幅される欠点がある 11。

### **X-Learner：サンプル不均衡への適応**

X-Learnerは、T-Learnerの弱点を補完するために提案された手法であり、特に処置群と制御群のサンプルサイズが著しく異なる場合に優れた性能を発揮する 11。X-Learnerは、各群で得られたモデルを用いて他方の群の反実仮想的な処置効果を補完（Impute）し、それを直接学習のターゲットとする。

1. **第一段階**: T-Learnerと同様に、処置群と制御群それぞれの応答関数を学習する。  
2. **第二段階**: 観測されたアウトカムと第一段階の予測値を用いて、各個人の「代用処置効果（Imputed Treatment Effect）」を算出する。  
   * 処置群: $D\_{1,i} \= Y\_{1,i} \- \\hat{\\mu}\_0(X\_{1,i})$  
   * 制御群: $D\_{0,i} \= \\hat{\\mu}\_1(X\_{0,i}) \- Y\_{0,i}$  
     これらをターゲットとして、新たな回帰モデル $\\hat{\\tau}\_1(x)$ および $\\hat{\\tau}\_0(x)$ を学習する。  
3. 第三段階: 傾向スコア $e(x)$ を用いてこれらを統合し、最終的な推定値を得る。

   $$\\hat{\\tau}\_X(x) \= g(x)\\hat{\\tau}\_0(x) \+ (1-g(x))\\hat{\\tau}\_1(x)$$

   （通常、$g(x)$ には推定された傾向スコア $\\hat{e}(x)$ が用いられる）

X-Learnerは情報の相互利用（Cross-learning）により、一方の群が非常に小さい状況でも安定した推定を可能にし、MSE（平均二乗誤差）を12%〜30%低減させた事例も報告されている 11。

### **R-LearnerとDR-Learner：ネイマン直交性と二重の頑健性**

現代のMetaLearner研究において中心的な役割を果たしているのが、ネイマン直交性（Neyman Orthogonality）を備えた学習器である。これは、第一段階の推定誤差が最終的なCATE推定に与える影響を最小化する性質を指す 1。

DR-Learner（Doubly Robust Learner）は、二重に頑健なスコアを疑似アウトカムとして使用する 4。

$$Y\_{DR} \= \\hat{\\mu}\_1(X) \- \\hat{\\mu}\_0(X) \+ \\frac{T(Y \- \\hat{\\mu}\_1(X))}{\\hat{e}(X)} \- \\frac{(1-T)(Y \- \\hat{\\mu}\_0(X))}{1 \- \\hat{e}(X)}$$

この $Y\_{DR}$ を任意のMLモデルで共変量 $X$ に対して回帰することで、効率的影響関数（EIF）に基づく、統計的に最適な推定を実現する 4。  
R-Learner（Residual-Learner）は、Robinsonの変換をベースとし、アウトカムの残差と処置の残差の積の関係から処置効果を抽出する 12。R-lossと呼ばれる損失関数を最小化することで、強交絡（High Confounding）環境下でも極めて安定した推定を行うことができる 11。

以下の表は、これら主要なMetaLearnerの設計思想と特性を比較したものである。

| メタ学習器 | 学習ターゲットの構成 | 主なメリット | 主なデメリット |
| :---- | :---- | :---- | :---- |
| **S-Learner** | 直接観測されたアウトカム $Y$ | 全データの活用、データ効率が高い | 処置効果の消失バイアス |
| **T-Learner** | 群ごとのアウトカム $Y\_1, Y\_0$ | 実装の平易さ、構造的分離 | サンプル不均衡への弱さ |
| **X-Learner** | 補完された処置効果 $D\_1, D\_0$ | 不均衡データへの強さ、構造適応 | 複数段階の学習による計算負荷 |
| **DR-Learner** | 二重に頑健な疑似アウトカム $Y\_{DR}$ | 直交性、一方の不快関数が正しければ一致 | 傾向スコア極値による不安定性 |
| **R-Learner** | アウトカムと処置の残差 | 強交絡下での安定性、理論的頑健性 | 損失関数の最適化の複雑さ |

8

## **2023年〜2025年における最新手法の潮流**

近年のCATE推定に関する研究は、従来の基本的なMetaLearnerを、プライバシー保護、欠損データ、生存時間分析、経時的データといった実世界の複雑な制約に適応させる方向へと進化している。

### **EP-Learner：DRとTの融合による安定化**

2024年に提案された EP-Learner（Efficient Plug-in Learner） は、DR-Learnerの持つ「統計的効率性」と、T-Learnerの持つ「数値的安定性」を兼ね備えた画期的な手法である 21。  
従来のDR-Learnerは、傾向スコア $e(x)$ が0または1に近い領域で疑似アウトカムが爆発し、推定値が物理的な境界（例えばバイナリアウトカムにおける $\[-1, 1\]$ の範囲）を逸脱する問題があった 22。EP-Learnerは、リスク関数自体を効率的なプラグイン形式で推定することにより、直交性を維持しながらも、モデルの安定性を飛躍的に向上させている 21。

### **プライバシー保護下のCATE推定：DP-CATE**

機密性の高い個人情報を扱う医療や金融などの分野では、処置効果の推定においても差分プライバシー（Differential Privacy: DP）の保証が不可欠となっている。2025年に発表された DP-CATE は、ネイマン直交なMetaLearnerの枠組みに出力攪乱（Output Perturbation）を組み込んだ初の汎用フレームワークである 1。  
この手法は、第二段階の学習において影響関数を用いてノイズを最適に較正することで、個人のプライバシーを厳格に保護しつつも、非プライベートな学習器に近い推定精度を維持することを可能にしている 25。

### **生存時間分析と欠損データへの対応**

アウトカムが生存時間（Time-to-event）である場合や、アウトカム自体がランダムに欠損（Missing At Random: MAR）している状況下でのMetaLearner拡張も進んでいる。

* **Orthogonal Survival Learners (2025)**: 生存時間分析特有の「打ち切り（Censoring）」を考慮した直交学習器のツールボックスである。打ち切り確率や生存確率の「重なりの欠如（Low Overlap）」に対処するためのカスタム重み付け関数を導入している 28。  
* **mDR-learner / mEP-learner (2025)**: 逆欠損確率重み付け（IPCW）をDRおよびEPフレームワークに統合し、追跡不能などでアウトカムが欠損している集団におけるバイアスを補正する 19。

### **経時的（Longitudinal）データへの拡張**

動的な環境下で時間の経過とともに処置が変化する場合のCATE推定も、近年注力されている。

* **IVW-DR-learner (2025)**: 経時的な交絡を調整しつつ、逆分散重み付け（IVW）を用いて、時間の経過とともに増大するDRスコアの分散を安定化させる 9。  
* **TERRA (2025)**: トランスフォーマーなどの高度な構造をベース学習器に据えつつ、R-Learnerのロジックを再帰的な残差学習へと拡張し、長期的な履歴に依存する処置効果を推定する 20。

## **近年の英語論文リスト（2023-2025）**

MetaLearnerに関する最新の研究成果を以下にリスト化する。これらの論文は、従来の枠組みを特定のデータ課題に対して拡張したものである。

### **基本フレームワークの高度化と安定化**

1. **Combining T-learning and DR-learning: a framework for oracle-efficient estimation of causal contrasts** (2024)  
   * 概要: EP-Learnerを提案。DR-Learnerの効率性とT-Learnerの安定性を組み合わせ、損失関数の非凸性や極端な重みの問題を解決し、CATEや条件付き相対リスク（CRR）において既存手法を凌駕する性能を示した。  
   * リンク: [arXiv:2402.01972](https://arxiv.org/abs/2402.01972) 21  
2. **i-learner: Orthogonal prediction of counterfactual outcomes for binary outcomes** (2024)  
   * 概要: バイナリアウトカムに対して、予測値が $$ の範囲内に収まることを保証するインピュテーション・ベースの直交学習器。従来のDR-learnerがバイナリ設定で不安定になる問題を解決した。  
   * リンク: [PMC12658738](https://pmc.ncbi.nlm.nih.gov/articles/PMC12658738/) 24

### **プライバシーと倫理**

3. **Differentially private learners for heterogeneous treatment effects** (2025)  
   * 概要: DP-CATEフレームワークを提案。差分プライバシーを保証しながら、影響関数を用いたノイズ較正により、ネイマン直交性を維持したままCATEを推定する初の汎用手法。  
   * リンク: [arXiv:2503.03486](https://arxiv.org/abs/2503.03486) 1  
4. **Causal Fairness under Unobserved Confounding: A Neural Framework** (2024)  
   * 概要: メタ学習の考え方を因果的公平性の評価に応用。観測されない交絡が存在する場合でも、処置効果の異質性を考慮した公平な予測境界を導出する。  
   * リンク:(https://www.semanticscholar.org/paper/Causal-Fairness-under-Unobserved-Confounding%3A-A-Schr%C3%B6der-Frauen/b6dede83b924007d2541c3b77fed8b15e8c7aee7) 32

### **生存時間および欠損データ**

5. **Orthogonal Survival Learners for Estimating Heterogeneous Treatment Effects from Time-to-Event Data** (2025)  
   * 概要: 打ち切りのある生存時間データに対して、直交性を保証しつつ、重なりの低い領域でも安定した推定を可能にする重み付け関数を導入したツールボックスの提案。  
   * リンク: [arXiv:2505.13072](https://arxiv.org/abs/2505.13072) 28  
6. **mDR-learner and mEP-learner for CATE estimation with missing outcome data** (2025)  
   * 概要: アウトカムがランダムに欠損している状況において、逆欠損確率重みをDRおよびEP学習器に統合し、バイアスのない個別処置効果の推定を可能にした研究。  
   * リンク:([https://academic.oup.com/biometrics/article/81/3/ujaf098/8220015](https://academic.oup.com/biometrics/article/81/3/ujaf098/8220015)) 19

### **経時的・動的データ**

7. **Model-agnostic meta-learners for estimating heterogeneous treatment effects over time** (2025)  
   * 概要: ICLR 2025発表。経時的交絡が存在する縦断データにおけるCATE推定のために、逆分散重み付けを導入したIVW-DR-learnerなどの複数のメタ学習手法を提案。  
   * リンク:(https://proceedings.iclr.cc/paper\_files/paper/2025/file/d51ab0fc62fe2d777c7569952f518f56-Paper-Conference.pdf) 9  
8. **TERRA: Transformer-Enabled Recursive R-leArner for longitudinal HTE** (2025)  
   * 概要: 柔軟な時系列モデリングを可能にするトランスフォーマー構造と、R-Learnerの再帰的な残差学習を組み合わせ、経時的に変化する処置効果の異質性を捉える。  
   * リンク: [arXiv:2510.22407](https://arxiv.org/html/2510.22407v1) 20  
9. **DR-WCLS: Doubly Robust Weighted Centered Least Squares for MRTs** (2024)  
   * 概要: マイクロランダム化試験（MRT）における「因果周遊効果」を推定するためのメタ学習器。欠損観測や不確かなランダム化確率に対しても、二重の頑健性を提供。  
   * リンク: [arXiv:2306.16297](https://arxiv.org/abs/2306.16297) 33

### **特殊な応用・設定**

10. **M-Learner for predicting treatment efficacy from germline genetic variations** (2025)  
    * 概要: 多重ポリジェニックスコア（PRS）を入力とし、因果転移学習（Causal Transfer Learning）を用いて個別の処置応答を予測するM-Learnerの提案。  
    * リンク:([https://jiachengmiao.com/](https://jiachengmiao.com/)) 35  
11. **M-learner: A Flexible And Powerful Framework To Study Heterogeneous Treatment Effect In Mediation Model** (2024)  
    * 概要: 媒介分析（Mediation Analysis）において、間接効果と総効果の異質性を捉えるためのMetaLearner。サブグループ同定のためのクラスタリング手法も統合。  
    * リンク:(https://www.researchgate.net/publication/392085268) 37  
12. **Integrative LLM Routing through Causal Meta-learners** (2024)  
    * 概要: R-LearnerとDR-Learnerを用いて、LLMのルーティング決定における優先バイアスを補正し、複数のモデル間での最適なタスク割り振りを実現する応用研究。  
    * リンク: [arXiv:2509.25535](https://arxiv.org/html/2509.25535v1) 39

## **手法の方向性による分類とメタ分析**

上述した多岐にわたるMetaLearnerの手法を、その解決すべき課題とアプローチの方向性に基づいて以下の表に分類する。

| 分類軸 | ターゲットとする課題 | 代表的な手法・拡張 | 技術的アプローチ |
| :---- | :---- | :---- | :---- |
| **推定安定化・制約遵守** | 推定値の爆発、物理的境界の逸脱 | EP-Learner, i-learner | プラグイン形式の再考、境界制約の明示化 |
| **データ不完全性対応** | アウトカムの欠損、打ち切り、重なり不足 | mDR, mEP, Survival Learners, WO-learner | 逆確率重み付け(IPCW/IPTW)の再定義と統合 |
| **動的・経時的推定** | 時間とともに変化する交絡、処置履歴の影響 | IVW-DR, TERRA, DR-WCLS | 逆分散重み付け(IVW), 再帰的残差学習 |
| **信頼性・プライバシー** | 個人情報の漏洩リスク、モデルの頑健性 | DP-CATE, DRM (Metric) | 影響関数によるノイズ較正、分布的に頑健な指標 |
| **複雑な因果経路** | サンプル不均衡、媒介変数、複数環境 | X-Learner, Mediation M-learner, CB-DR-learner | クロス学習、媒介経路の分解、部分識別 |

1

## **MetaLearnerの進化が示唆する因果推論の未来**

本調査を通じて、MetaLearnerが単なる「精度の追求」から、「実用的な信頼性と安全性の担保」へとその軸足を移していることが確認された。特に以下の三つの潮流は、今後のCATE推定のデファクトスタンダードを形作るものと考えられる。

第一に、**「ネイマン直交性」の普遍化**である。かつては専門的な統計手法であった直交学習が、今やモデル非依存型のMetaLearnerのコア・エンジンとして定着している。これにより、データサイエンティストは第一段階の予測モデルの細かなチューニングに翻弄されることなく、強力なブラックボックスモデルの恩恵を因果推論に直接取り込むことが可能となった 1。

第二に、\*\*「理論と実用のギャップの解消」\*\*である。EP-Learnerやi-learnerの提案は、理論上の最適性が実データでの不安定性（境界逸脱や過剰分散）に直結するという従来のDR/R学習器の弱点を、アルゴリズムの再構築によって克服しようとする試みである。これにより、バイナリアウトカムや小サンプル環境といった、理論が破綻しやすい過酷な現場での適用が現実味を帯びてきている 22。

第三に、\*\*「機械学習の他分野との統合」\*\*である。差分プライバシーとの融合（DP-CATE）や、LLMルーティングへの応用（39）に見られるように、MetaLearnerはもはや単独の推定手法ではなく、システムの最適化やデータのプライバシー保護といった大きな枠組みの一部として機能し始めている。特に、複雑な不快関数の推定において深層学習やトランスフォーマーといったモデル非依存の強みを活かしつつ、最終的な出力には因果的な正当性を与えるという「モジュール化された因果推論」の形が明確になりつつある 1。

総じて、MetaLearnerは因果推論を「統計の専門家」の道具から、「あらゆるMLモデルに因果的知性を与える」汎用的なプラットフォームへと変貌させている。今後、より多様なデータ構造（グラフ、非定型データなど）に対するモデル非依存型アプローチが開発されることで、個別化された意思決定の精度と信頼性はさらなる高みへと到達するであろう。

#### **引用文献**

1. arXiv:2503.03486v1 \[cs.LG\] 5 Mar 2025, 1月 2, 2026にアクセス、 [https://arxiv.org/pdf/2503.03486](https://arxiv.org/pdf/2503.03486)  
2. Orthogonal Representation Learning for Estimating Causal Quantities \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2502.04274v2](https://arxiv.org/html/2502.04274v2)  
3. Comparison of meta-learners for estimating multi-valued treatment heterogeneous effects \- Proceedings of Machine Learning Research, 1月 2, 2026にアクセス、 [https://proceedings.mlr.press/v202/acharki23a/acharki23a.pdf](https://proceedings.mlr.press/v202/acharki23a/acharki23a.pdf)  
4. Causal machine learning for heterogeneous treatment effects in the presence of missing outcome data \- Oxford Academic, 1月 2, 2026にアクセス、 [https://academic.oup.com/biometrics/article-pdf/81/3/ujaf098/63901282/ujaf098.pdf](https://academic.oup.com/biometrics/article-pdf/81/3/ujaf098/63901282/ujaf098.pdf)  
5. Unveiling the Potential of Robustness in Selecting Conditional Average Treatment Effect Estimators \- NIPS papers, 1月 2, 2026にアクセス、 [https://proceedings.neurips.cc/paper\_files/paper/2024/file/f3da4165893c2465fd7e8df453c41ffa-Paper-Conference.pdf](https://proceedings.neurips.cc/paper_files/paper/2024/file/f3da4165893c2465fd7e8df453c41ffa-Paper-Conference.pdf)  
6. Beyond Correlation: The Power of Causal Inference \- Craft AI, 1月 2, 2026にアクセス、 [https://www.craft.ai/post/beyond-correlation-the-power-of-causal-inference-in-modern-data-science](https://www.craft.ai/post/beyond-correlation-the-power-of-causal-inference-in-modern-data-science)  
7. Estimating Conditional Average Treatment Effects via Sufficient Representation Learning \- IJCAI, 1月 2, 2026にアクセス、 [https://www.ijcai.org/proceedings/2024/0541.pdf](https://www.ijcai.org/proceedings/2024/0541.pdf)  
8. Meta Learners: Measuring Treatment Effects with Causal Machine Learning \- Towards AI, 1月 2, 2026にアクセス、 [https://pub.towardsai.net/meta-learners-measuring-treatment-effects-with-causal-machine-learning-53047aed2cfb](https://pub.towardsai.net/meta-learners-measuring-treatment-effects-with-causal-machine-learning-53047aed2cfb)  
9. MODEL-AGNOSTIC META-LEARNERS FOR ESTIMATING ..., 1月 2, 2026にアクセス、 [https://proceedings.iclr.cc/paper\_files/paper/2025/file/d51ab0fc62fe2d777c7569952f518f56-Paper-Conference.pdf](https://proceedings.iclr.cc/paper_files/paper/2025/file/d51ab0fc62fe2d777c7569952f518f56-Paper-Conference.pdf)  
10. Meta-Learners for Partially-Identified Treatment Effects Across Multiple Environments \- GitHub, 1月 2, 2026にアクセス、 [https://raw.githubusercontent.com/mlresearch/v235/main/assets/schweisthal24a/schweisthal24a.pdf](https://raw.githubusercontent.com/mlresearch/v235/main/assets/schweisthal24a/schweisthal24a.pdf)  
11. Uplift Modeling with Multi-Intervention Variables based on T-Learner \- ResearchGate, 1月 2, 2026にアクセス、 [https://www.researchgate.net/publication/399114525\_Uplift\_Modeling\_with\_Multi-Intervention\_Variables\_based\_on\_T-Learner](https://www.researchgate.net/publication/399114525_Uplift_Modeling_with_Multi-Intervention_Variables_based_on_T-Learner)  
12. Comparing Meta-Learners for Estimating Heterogeneous Treatment Effects and Conducting Sensitivity Analyses \- MDPI, 1月 2, 2026にアクセス、 [https://www.mdpi.com/2297-8747/30/6/139](https://www.mdpi.com/2297-8747/30/6/139)  
13. arXiv:2411.01498v1 \[stat.ME\] 3 Nov 2024, 1月 2, 2026にアクセス、 [https://arxiv.org/pdf/2411.01498](https://arxiv.org/pdf/2411.01498)  
14. Metalearners for estimating heterogeneous treatment effects using machine learning \- PNAS, 1月 2, 2026にアクセス、 [https://www.pnas.org/doi/10.1073/pnas.1804597116](https://www.pnas.org/doi/10.1073/pnas.1804597116)  
15. A Meta-Learner Framework to Estimate Individualized Treatment Effects for Survival Outcomes \- Journal of Data Science, 1月 2, 2026にアクセス、 [https://jds-online.org/journal/JDS/article/1354/file/pdf](https://jds-online.org/journal/JDS/article/1354/file/pdf)  
16. Model-agnostic meta-learners for estimating heterogeneous treatment effects over time, 1月 2, 2026にアクセス、 [https://openreview.net/forum?id=QGGNvKaoIU](https://openreview.net/forum?id=QGGNvKaoIU)  
17. Using Individualized Treatment Effects to Assess Treatment Effect Heterogeneity \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2502.00713v1](https://arxiv.org/html/2502.00713v1)  
18. Methodology \- causalml documentation \- Read the Docs, 1月 2, 2026にアクセス、 [https://causalml.readthedocs.io/en/latest/methodology.html](https://causalml.readthedocs.io/en/latest/methodology.html)  
19. Causal machine learning for heterogeneous treatment effects in the ..., 1月 2, 2026にアクセス、 [https://academic.oup.com/biometrics/article/81/3/ujaf098/8220015](https://academic.oup.com/biometrics/article/81/3/ujaf098/8220015)  
20. TERRA: A Transformer-Enabled Recursive R-learner for Longitudinal Heterogeneous Treatment Effect Estimation \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2510.22407v1](https://arxiv.org/html/2510.22407v1)  
21. Lars van der laan, 1月 2, 2026にアクセス、 [https://cdn.prod.website-files.com/66003bdc38088944d6e5afcb/6700979f8320a06d98d57eee\_58725715158.pdf](https://cdn.prod.website-files.com/66003bdc38088944d6e5afcb/6700979f8320a06d98d57eee_58725715158.pdf)  
22. a framework for oracle-efficient estimation of causal contrasts \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/pdf/2402.01972](https://arxiv.org/pdf/2402.01972)  
23. \[2402.01972\] Combining T-learning and DR-learning: a framework for oracle-efficient estimation of causal contrasts \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/abs/2402.01972](https://arxiv.org/abs/2402.01972)  
24. Orthogonal prediction of counterfactual outcomes \- PMC, 1月 2, 2026にアクセス、 [https://pmc.ncbi.nlm.nih.gov/articles/PMC12658738/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12658738/)  
25. Differentially private learners for heterogeneous treatment effects \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2503.03486v1](https://arxiv.org/html/2503.03486v1)  
26. \[Quick Review\] Differentially Private Learners for Heterogeneous Treatment Effects \- Liner, 1月 2, 2026にアクセス、 [https://liner.com/review/differentially-private-learners-for-heterogeneous-treatment-effects](https://liner.com/review/differentially-private-learners-for-heterogeneous-treatment-effects)  
27. Differentially Private Learners for Heterogeneous Treatment Effects \- ChatPaper, 1月 2, 2026にアクセス、 [https://chatpaper.com/paper/117884](https://chatpaper.com/paper/117884)  
28. Orthogonal Survival Learners for Estimating Heterogeneous ..., 1月 2, 2026にアクセス、 [https://openreview.net/forum?id=EdP45Yxdc3](https://openreview.net/forum?id=EdP45Yxdc3)  
29. Orthogonal Survival Learners for Estimating Heterogeneous Treatment Effects from Time-to-Event Data \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2505.13072v1](https://arxiv.org/html/2505.13072v1)  
30. Orthogonal Survival Learners for Estimating Heterogeneous Treatment Effects from Time-to-Event Data \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/pdf/2505.13072](https://arxiv.org/pdf/2505.13072)  
31. Causal machine learning for heterogeneous treatment effects in the presence of missing outcome data \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2412.19711v2](https://arxiv.org/html/2412.19711v2)  
32. Causal Fairness under Unobserved Confounding: A Neural Sensitivity Framework, 1月 2, 2026にアクセス、 [https://www.semanticscholar.org/paper/Causal-Fairness-under-Unobserved-Confounding%3A-A-Schr%C3%B6der-Frauen/b6dede83b924007d2541c3b77fed8b15e8c7aee7](https://www.semanticscholar.org/paper/Causal-Fairness-under-Unobserved-Confounding%3A-A-Schr%C3%B6der-Frauen/b6dede83b924007d2541c3b77fed8b15e8c7aee7)  
33. A Meta-Learning Method for Estimation of Causal Excursion Effects to Assess Time-Varying Moderation \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2306.16297v3](https://arxiv.org/html/2306.16297v3)  
34. A Meta-Learning Method for Estimation of Causal Excursion Effects to Assess Time-Varying Moderation \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/pdf/2306.16297](https://arxiv.org/pdf/2306.16297)  
35. Polygenic prediction of treatment efficacy with causal transfer learning | medRxiv, 1月 2, 2026にアクセス、 [https://www.medrxiv.org/content/10.1101/2025.10.15.25338051v2.full](https://www.medrxiv.org/content/10.1101/2025.10.15.25338051v2.full)  
36. Jiacheng's website, 1月 2, 2026にアクセス、 [https://jiachengmiao.com/](https://jiachengmiao.com/)  
37. (PDF) M-learner:A Flexible And Powerful Framework To Study Heterogeneous Treatment Effect In Mediation Model \- ResearchGate, 1月 2, 2026にアクセス、 [https://www.researchgate.net/publication/392085268\_M-learnerA\_Flexible\_And\_Powerful\_Framework\_To\_Study\_Heterogeneous\_Treatment\_Effect\_In\_Mediation\_Model](https://www.researchgate.net/publication/392085268_M-learnerA_Flexible_And_Powerful_Framework_To_Study_Heterogeneous_Treatment_Effect_In_Mediation_Model)  
38. M-learner:A Flexible And Powerful Framework To Study Heterogeneous Treatment Effect In Mediation Model \- ChatPaper, 1月 2, 2026にアクセス、 [https://chatpaper.com/paper/140876](https://chatpaper.com/paper/140876)  
39. Meta-Router: Bridging Gold-standard and Preference-based Evaluations in Large Language Model Routing \- arXiv, 1月 2, 2026にアクセス、 [https://arxiv.org/html/2509.25535v1](https://arxiv.org/html/2509.25535v1)  
40. Meta-Learners for Partially-Identified Treatment Effects Across Multiple Environments \- Liner, 1月 2, 2026にアクセス、 [https://liner.com/review/metalearners-for-partiallyidentified-treatment-effects-across-multiple-environments](https://liner.com/review/metalearners-for-partiallyidentified-treatment-effects-across-multiple-environments)