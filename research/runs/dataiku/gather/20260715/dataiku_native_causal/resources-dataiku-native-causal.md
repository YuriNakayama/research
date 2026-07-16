# Resources: dataiku_native_causal

Dataiku ネイティブ Causal Prediction 機能のリソース。**リリースノート全文の網羅的 grep により、事前情報の2点の誤りを訂正した**（末尾参照）。

## 事実確認の訂正（重要）

| 事前情報 | 検証結果 |
|---------|---------|
| Treatment Analysis / IPW は 12.0.0 の機能 | ❌ **12.4.0（2023-12-06）の追加**。導入から約7ヶ月後 |
| 多値処置は 12.0.0 の機能 | ❌ **12.2.0（2023-09-01）の追加** |
| Partitioned Models と非互換 | ⚠️ **公式ドキュメント上は未記載**。非互換リストは5項目のみで Partitioned Models を含まない。サイドバーのナビ要素の誤読の可能性 |
| K-Fold 非対応 | ✅ 事実。ただし出典は Introduction の非互換リストではなく **Settings ページの独立した一文** |

**公式の非互換リスト（Introduction 原文ママ、これが全て）**:
> Causal prediction is incompatible with the following:
> - MLflow models
> - Models ensembling
> - Model export
> - Model Evaluation Stores
> - Model Document Generator

## 1. 公式ドキュメント

Causal Prediction のリファレンスは `machine-learning/causal-prediction/` 配下の **6ページで全構成**（ページ棚卸しで確認済み）。

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 1 | **Introduction — Causal Prediction** | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/introduction.html | 公式ドキュメント | **最重要**。CATE の定義、Python 3.8–3.13、「Visual Causal Machine Learning」プリセット、**非互換リスト5項目の原典**。binary / multi-valued treatment、分類は binary outcome のみ |
| 2 | **Causal Prediction Algorithms** | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/causal-prediction-algorithms.html | 公式ドキュメント | S/T/X-learner と Causal Forest。base learner は「任意の Python ベース ML アルゴリズム」。Causal Forest は honest framework、木数、特徴サンプリング（既定30%）、最大深度、並列度を設定可 |
| 3 | **Causal Prediction Settings** | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/settings.html | 公式ドキュメント | **最重要**。treatment / outcome / control value、既定10万行サンプリング、Treatment Analysis と IPW、指標選択。**「does not support K-Fold cross-test」の唯一の出典** |
| 4 | **Causal Prediction Results** | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/results.html | 公式ドキュメント | Uplift / Qini 曲線の数式、surrogate tree による feature importance（Gini 正規化）、Treatment Randomization Test（二項検定・p 閾値 0.05）、Positivity Analysis（積み上げヒストグラム＋較正曲線） |
| 5 | Scoring recipe | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/scoring.html | 公式ドキュメント | 保存済み causal モデルでの予測処置効果算出 |
| 6 | Evaluation recipe | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/evaluation.html | 公式ドキュメント | **「Model Evaluation Stores (MES) are not supported for causal prediction models.」を明記**（MES 非互換の第二の出典） |
| 7 | Causal Prediction（セクション index） | https://doc.dataiku.com/dss/latest/machine-learning/causal-prediction/index.html | 公式ドキュメント | セクション目次。6ページで全構成であることの確認に使用 |

## 2. Knowledge Base

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 8 | **Concept \| Causal prediction** | https://knowledge.dataiku.com/latest/ml-analytics/causal-prediction/concept-causal-prediction.html | 公式KB | **最重要**。ignorability / positivity / SUTVA の3仮定、uplift チャートの読み方、feature importance が「アウトカムへの影響」ではなく**「処置への反応の差」**を示す点、反実仮想が観測不能という根本的限界 |
| 9 | **Tutorial \| Causal prediction** | https://knowledge.dataiku.com/latest/ml-analytics/causal-prediction/tutorial-causal-prediction.html | 公式KB | **最重要**。単一／複数 treatment のハンズオン。更新割引のマーケ事例。DSS 12.0+ が必要。⚠️ 独立した制約列挙を持ち、**Introduction に無い `custom models` と `SQL/Spark scoring` 非対応**を挙げる |
| 10 | Causal Prediction（KB index） | https://knowledge.dataiku.com/latest/ml-analytics/causal-prediction/index.html | 公式KB | KB の causal コンテンツは concept + tutorial の2本のみ |

> 注: `knowledge.dataiku.com/latest/ml/causal-prediction/...` は旧パス。`ml-analytics` が現行。

## 3. リリースノート（バージョン確定の一次情報）

release notes 全文を grep（causal / uplift / treatment / Qini / CATE / propensity）した結果、**下表が全件**。

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 11 | **DSS 12 Release notes** | https://doc.dataiku.com/dss/latest/release_notes/12.html | リリースノート | **最重要**。causal の実質的変化は全て 12.x に集中。12.0.0 導入、12.2.0 複数 treatment、12.4.0 Treatment Analysis / IPW |
| 12 | DSS 13 Release notes | https://doc.dataiku.com/dss/latest/release_notes/13.html | リリースノート | **新機能ゼロ**。causal 関連は全5件がバグ修正・高速化のみ |
| 13 | DSS 14 Release notes | https://doc.dataiku.com/dss/latest/release_notes/14.html | リリースノート | **causal 言及は1件のみ**。14.4.0「Fixed possible slowness when training causal models using Python 3.9+」 |
| 14 | Release notes（index） | https://doc.dataiku.com/dss/latest/release_notes/index.html | リリースノート | 全バージョンの入口 |

## 4. 公式ブログ

⚠️ **因果推論系の旧ブログ3本は2026年時点でリンク切れ**。`blog.dataiku.com/<slug>` は 301 で `www.dataiku.com/blog`（インデックス）へ静かにリダイレクトされ記事本文は到達不能。**HTTP 200 を返すため死活監視では検出できない**。

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 15 | **Enterprise Causal Inference: Beyond Churn Modeling** | アーカイブ: http://web.archive.org/web/20220521224923/https://blog.dataiku.com/enterprise-causal-inference-beyond-churn-modeling | 公式ブログ | **最重要**（2021-06-03）。uplift を「因果推論の最も成熟したビジネス応用」と位置づけ。Persuadables / Sure Things / Lost Causes / Sleeping Dogs の4象限。**ネイティブ機能（12.0）より2年早い記事** |
| 16 | **Motivation for Causal Inference** | アーカイブ: http://web.archive.org/web/20220521212637/https://blog.dataiku.com/motivation-for-causal-inference | 公式ブログ | 因果推論入門。**Qiita 日本語訳（#29）の原文** |
| 17 | Inside 2021 ML Trends: Causality | アーカイブ: http://web.archive.org/web/20240417154712/https://blog.dataiku.com/inside-2021-ml-trends-causality | 公式ブログ | 予測から「処方」への移行というトレンド論 |
| 18 | **Keep AI Under Control With Dataiku 12** | https://www.dataiku.com/blog/dataiku-12 | 公式ブログ | **現存する数少ない causal 言及ブログ**。12.0 のリリース紹介 |
| 19 | Where ML Research Meets Data Science Practice: Learning With Small Data | https://blog.dataiku.com/where-ml-research-meets-data-science-practice-learning-with-small-data | 公式ブログ | Dataiku Lab のシリーズ。周辺資料 |
| 20 | Machine Learning（製品ページ） | https://www.dataiku.com/product/key-capabilities/machine-learning/ | 公式ブログ | 旧 `pages.dataiku.com/causal-inference` の 301 先。方法論の開示なし |

## 5. マーケティング系 Dataiku Solutions

⚠️ **3ソリューションのうち Causal Prediction を実際に使うのは1つのみ**。

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 21 | **Solution \| Optimizing Omnichannel Marketing in Pharma** | https://knowledge.dataiku.com/latest/solutions/life-sciences/solution-optimizing-omnichannel-marketing-in-pharma.html | 公式KB | **要 13.2+**。3つの中で**唯一 uplift モデルを明示的に含む**。ただし Causal Prediction 機能を使うとの明記はない。**製薬専用**で汎用ではない |
| 22 | Solution \| Next Best Offer for Banking | https://knowledge.dataiku.com/latest/solutions/financial-services/solution-next-best-offer.html | 公式KB | **要 13.4+**。⚠️ **uplift / causal ではなく通常の classification model**（申込確率の予測）。**名称に反し因果推論は不使用** |
| 23 | Solution \| Marketing Mix Modeling | https://knowledge.dataiku.com/latest/solutions/retail/solution-marketing-mix-modeling.html | 公式KB | **要 14.1+**。Google **Meridian**（ベイズ統計）に全面依存。**Causal Prediction 機能は不使用**。集計レベルの手法で個人レベル CATE とは別系統 |
| 24 | Dataiku Solutions（index） | https://knowledge.dataiku.com/latest/solutions/index.html | 公式KB | ソリューション一覧 |

## 6. Community

Community はサイト内検索が Cloudflare で機械的アクセスをブロックしており外部検索経由で到達。**実ユーザーの技術的質問・トラブル報告スレッドは発見できず**、公式アナウンス系のみ。

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 25 | **Dataiku 12.2 Summer Special** | https://community.dataiku.com/discussion/37208/dataiku-12-2-summer-special-a-new-wave-of-product-features-and-enhancements | Community | **最重要**（公式アナウンス）。「Multiple Treatments for Causal ML」を解説。**12.2 での複数 treatment 対応の裏付け** |
| 26 | Dataiku 12: A Dozen Ways Work Just Got Better | https://community.dataiku.com/discussion/34600/dataiku-12-a-dozen-ways-work-just-got-better | Community | 12.0 の機能紹介 |
| 27 | Uplift Modeling in Dataiku DSS - Watch on Demand | https://community.dataiku.com/discussion/12361/uplift-modeling-in-dataiku-dss-watch-on-demand | Community | **ネイティブ機能導入前**の内容。S-learner 中心のカスタム実装時代の解説 |
| 28 | Solved: how to run propensity model in DSS | https://community.dataiku.com/t5/Using-Dataiku/how-to-run-propensity-model-in-DSS/m-p/16371 | Community | 傾向スコアモデルの実ユーザー Q&A |

## 7. 日本語リソース

> **率直な評価: 極めて手薄。日本語で Dataiku の Causal Prediction 機能そのものを解説した資料は、公式・非公式ともに発見できなかった。**

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 29 | **因果推論のモチベーション** | https://qiita.com/Dataiku/items/25b23182717a0cee6235 | Blog | Dataiku 公式 Qiita（2022-08）。**#16 の日本語訳**。**DSS のネイティブ機能には非言及**（機能導入前の記事） |
| 30 | CausalImpactによる施策効果推定 | https://qiita.com/iitachi_tdse/items/24119464b73992cd4abc | Blog | 第三者記事。Dataiku 非依存 |
| 31 | Causal Inference and Uplift Modeling: A review of the literature を読んで | https://qiita.com/TSYK11361/items/c178134eca79a811a41a | Blog | 第三者記事。文献レビュー解説 |
| 32 | 効果検証のための因果推論手法のチートシート | https://qiita.com/_jinta/items/98ac5bbe9ba5bfff1c8a | Blog | 第三者記事。手法選択の俯瞰 |

## 8. Academy / コード環境

| # | タイトル | URL | 種別 | 概要 |
|---|---------|-----|------|------|
| 33 | ML Practitioner（ラーニングパス） | https://academy.dataiku.com/path/ml-practitioner | 公式KB | Causal Prediction チュートリアルを収録。**causal 専用コースは存在しない** |
| 34 | Dataiku Academy（トップ） | https://academy.dataiku.com/ | 公式KB | Academy 入口 |
| 35 | Machine learning（親セクション） | https://doc.dataiku.com/dss/latest/machine-learning/index.html | 公式ドキュメント | Visual ML 全体 |
| 36 | Partitioned Models | https://doc.dataiku.com/dss/latest/machine-learning/partitioned.html | 公式ドキュメント | ⚠️ causal 非対応の明記は**無い**。Visual ML Python backend / prediction のみという記述からの推測に留まる |
| 37 | Code environments | https://doc.dataiku.com/dss/latest/code-envs/index.html | 公式ドキュメント | 「Visual Causal Machine Learning」プリセットの導入先 |

## バージョン別の変化

**結論: Causal Prediction は 12.x 系で完成し、13/14 では機能的に凍結している。**

### v12（2023）— 導入と急速な拡充

| バージョン | 日付 | 内容 | 種別 |
|-----------|------|------|------|
| **12.0.0** | 2023-05-26 | **Causal Prediction を major new feature として導入** | 新機能 |
| 12.0.1 | 2023-06-23 | treatment 列欠落時のスコアリング不具合を修正 | 修正 |
| **12.2.0** | 2023-09-01 | **複数 treatment に対応** | 新機能 |
| **12.4.0** | 2023-12-06 | **Treatment Analysis オプション（IPW）を追加**。不均衡 treatment を自動検出する ML Diagnostics も追加。Causal ML 用 public API を拡充 | 新機能 |
| 12.5.0 | 2024-01-23 | Python 3.11 対応を追加するも **Visual Deep Learning と Causal ML は対象外**と明記 | 制約 |

### v13（2024–2025）— 新機能ゼロ、保守のみ

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 13.1.3 | 2024-09-16 | 較正済み propensity model での IPW 使用時の学習失敗を修正 |
| 13.2.4 | 2024-11-27 | 目的変数が単一値に偏る場合の causal 回帰の学習失敗を修正 |
| 13.3.2 | 2025-01-15 | Lab 設定での diagnostics 表示を修正 |
| 13.4.0 | 2025-02-09 | 変数重要度の計算を高速化 |

### v14（2025–2026）— 言及1件のみ

| バージョン | 日付 | 内容 |
|-----------|------|------|
| 14.4.0 | 2026-02-09 | Python 3.9+ での causal モデル学習の低速化を修正 |

### 解釈

- **制約解除は一切ない**。非互換5項目 + K-Fold は 12.0.0 から 14.x まで一貫。導入から約3年、制約は1つも緩和されていない。
- **アルゴリズムの追加もない**。S/T/X-learner + Causal Forest は 12.0 以降変化なし（DR-learner / R-learner の追加なし）。
- **13/14 の causal 関連コミットは全6件すべてがバグ修正・高速化**。13.2.4 / 13.1.3 の修正内容は、**基本的なユースケースでの学習失敗が導入から1年以上経って初めて修正された**ことを示し、実運用の踏破が薄い領域であることを示唆する。
- **事実上の推奨最低バージョンは 12.4.0 以上**。非ランダム／不均衡な treatment はマーケの観測データでは常態であり、IPW なしの causal 指標は誤誘導的になりうる。較正済み propensity + IPW を使うなら**実質 13.1.3 以上が安全圏**。
- **機能は成熟か停滞か**。3年間新機能ゼロは「完成して安定」とも「投資が GenAI へ移り優先度が落ちた」とも読める。14.x のリリースノートが Agentic AI / RAG / LLM Mesh で占められ causal は保守1件のみ、因果推論系ブログが軒並みリンク切れという事実は、**後者を強く示唆する**。

## マーケティング表現の注意

### 1. ソリューション名と実装の乖離（最重要）

- **「Next Best Offer for Banking」は因果推論を使っていない**。実体は申込確率を予測する**通常の分類モデル**。uplift / CATE / treatment の記述は皆無。**「次に何をオファーすべきか」は本質的に因果的な問いだが、相関的な予測モデルで代替されている**。高確率の顧客＝オファーで動く顧客ではない（Sure Things を掘り当てるだけになりうる）という uplift の中心的論点が、命名によって覆い隠されている。
- **「Marketing Mix Modeling」も Causal Prediction とは無関係**。Google Meridian への依存であり、かつ MMM は**集計レベルの予算配分手法**で個人レベル CATE とは別問題を解く。
- Causal Prediction を明示的に使ったマーケ用ソリューションは**実質的に存在しない**。

### 2. 効果の定量的主張は「存在しない」

blog / KB / Community を通じ、**「uplift により CVR が X% 改善」といった定量的主張は一件も確認できなかった**。表現はすべて「improving results」等の非定量的記述。**誇張された ROI 数値を掲げない点はむしろ誠実**とも読めるが、**導入判断の根拠となるベンチマークや事例数値が公式に一切ない**ことも意味する。

### 3. 仮定の扱いが「製品資料」と「技術資料」で非対称

技術ドキュメント（#1, #8）は誠実で、ignorability / positivity / SUTVA を明示し、**仮定違反を検出するツール（Treatment Randomization Test / Positivity Analysis）まで提供**する。「反実仮想は観測不能」という限界も明記する。

問題は非対称性。**製品ブログ・ソリューション側にはこれらの仮定への言及がほぼない**。Dataiku の Causal Prediction は**ランダム化された treatment を前提に最も素直に動く**が、マーケの現場データはたいてい非ランダム。IPW は緩和するが解消しない（未観測交絡には無力）。**ツールが仮定違反を検出できることと、検出された違反が解決されることは別問題**。

### 4. ドキュメントの生存性 — 因果コンテンツの静かな後退

因果推論系の公式ブログ3本がすべてリンク切れであり、しかも **HTTP 200 を返しながら中身はブログインデックス**という挙動を示す。これは引用の実務上 Wayback 経由でしか参照できないことに加え、**因果推論の教育的コンテンツが Dataiku のサイトから静かに退場している**ことを意味し、リリースノート上の3年間の機能停滞と整合する。
