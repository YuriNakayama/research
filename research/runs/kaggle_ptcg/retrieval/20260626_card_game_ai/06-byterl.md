# 06 ByteRL — LOCM を制した end-to-end ポリシー + optimistic smooth fictitious play

## メタ情報

- **タイトル**: *Mastering Strategy Card Game (Legends of Code and Magic) via End-to-End Policy and Optimistic Smooth Fictitious Play*
- **著者**: Wei Xi, Yongxin Zhang, Changnan Xiao, Xuefeng Huang, Shihong Deng, Haowei Liang, Jie Chen, Peng Sun
- **arXiv ID**: 2303.04096（cs.LG / cs.AI / cs.GT）、投稿 2023-03-07
- **対象**: Legends of Code and Magic (LOCM) — 小規模 CCG
- **関連**: 姉妹論文 Hearthstone 版 arXiv:2303.05197（COG 2023）。中国公式リーグ top-10 のプロ配信者を Best-of-5 で全勝撃破と主張。
- **命名注意**: 「ByteRL」はこの論文 abstract には明記されておらず、後続の Haluska & Schmid 2024（→08）が本手法のエージェントをそう呼称。

## 概要

Deep RL + Fictitious Play は多くのベンチマークで好成績だが、その大半は single-stage（観測・行動空間が一貫した単一段階）。現実の意思決定は **multiple stages** からなり、ステージごとに観測空間・行動空間が完全に異なり得る、と本論文は問題提起する。LOCM はまさにこの multi-stage 構造を持ち、本研究は単一の end-to-end ポリシーと、2人零和向けの optimistic smooth fictitious play で攻略。COG 2022 で double championships を達成したと主張。

## 手法の核心

> ⚠️ abstract は方針レベル中心。ネットワーク構成・損失・観測エンコーディングの詳細は本文 PDF を要する。以下、abstract で確認できる事項と推測を区別。

- **multi-stage の単一 end-to-end ポリシー化（abstract で明示）**: デッキ構築（draft/deck building）フェーズと対戦（battle）フェーズという、観測・行動空間が「完全に異なり得る」複数段階を、別モジュールに分割せず1つの end-to-end ポリシーで扱う。
- **フェーズで変わる観測/行動空間の扱い（詳細は不確実）**: 具体方式（フェーズ識別の埋め込み、フェーズ別ヘッド、行動マスキング、行動 index 化による統一空間への写像）は abstract に記述なし。「異なる行動空間を単一ポリシーで出力」以上、何らかの統一行動表現+マスクが用いられている蓋然性は高い（推測・未確認）。
- **optimistic smooth fictitious play による Nash 収束（abstract で明示）**: 2人零和の Nash 探索アルゴリズム。Fictitious Play（相手の経験平均戦略への best response 反復）に、(1) smoothing（確率的・正則化された応答で振動抑制）、(2) optimistic 更新（直近の勾配/応答を先取りして収束加速）を組合せた変種と読める。収束保証・収束率の理論主張の有無は abstract からは不明。
- **ネットワーク構成（不確実）**: アーキテクチャ・分散学習基盤・value/policy ヘッド構成は abstract に記載なし。

## 主要な結果

- **COG 2022 で double championships**（abstract で明示）。「double」の内訳は abstract から特定できず⚠️不確実。総説（→07）も 2022 年版優勝者として ByteRL を挙げ整合。
- **人間トップ撃破の主張は LOCM 版 abstract には無い**。それは姉妹論文の Hearthstone 版（2303.05197）の成果で、中国 top-10 プロ配信者を Best-of-5 で全勝とする。**LOCM 版と混同しないこと**。

## Pokémon TCG AI Battle Challenge への示唆

- **本コンペの二段構造に最も近い前例**: PTCG は Simulation（盤面処理・合法手列挙）と Strategy（デッキ構築・意思決定）の二段構造。LOCM の draft/deck building → battle、観測・行動空間がフェーズで切り替わる性質は、これに最も直接対応する公開研究。
- **デッキ構築と対戦を一体学習する価値**: デッキ選択（戦略レベル）と局面行動（戦術レベル）を分離せず単一 end-to-end ポリシーで一貫学習すると、両者の相互依存（どの構築を選んだかが最適プレイを規定）を捉えられる。
- **行動 index I/F との対応（注意付き）**: 本コンペが行動を index で受け渡すなら、LOCM が異なる行動空間を単一ポリシーで出力するために用いたであろう「統一行動表現 + 合法手マスク」が応用候補。ただし具体実装は abstract 未確認のため設計指針の参照に留める。
- **均衡指向学習の動機**: optimistic smooth fictitious play は2人零和の Nash 近似を狙う。自己対戦ラダーで「特定相手に最適化しすぎない」頑健な戦略を作る動機付けになる。

## 限界・注意

- **必ず 08（搾取可能性）と接続して読む**: Haluska & Schmid 2024 は本手法（ByteRL）の LOCM での play が **highly exploitable** であることを示した。「COG 優勝 = 均衡に近い/頑健」ではない。本論文の Nash 収束主張と実際の頑健性の乖離が後続研究で露見。
- abstract は方針中心で、再現に必要な実装詳細（ネットワーク・学習スケール・収束保証）が不足。技術判断には PDF 本文確認が必須。
- 「double championships」「人間撃破」の解釈は前述の通り混同注意。

## 出典

- Xi et al. *Mastering Strategy Card Game (LOCM) via End-to-End Policy and Optimistic Smooth Fictitious Play.* arXiv:2303.04096, 2023. https://arxiv.org/abs/2303.04096
- (関連) Xiao et al. *Mastering Strategy Card Game (Hearthstone) with Improved Techniques.* arXiv:2303.05197, COG 2023. https://arxiv.org/abs/2303.05197
