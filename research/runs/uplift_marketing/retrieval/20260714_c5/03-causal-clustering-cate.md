# 3. Causal Clustering for Conditional Average Treatment Effects Estimation and Subgroup Discovery

- **URL / arXiv**: https://arxiv.org/abs/2509.05775
- **著者 / 発表年 / venue**: Zilong Wang, Turgay Ayer, Shihao Yang / 2025 / IEEE EMBS BHI 2025（camera-ready pre-print）

## 概要
本論文は、介入に対して異なる反応を示す部分集団（subpopulation）の同定を、クラスタリングと因果推論の統合として定式化する。個別化医療や政策評価で問題となる「治療反応の潜在的異質性」を、条件付き平均処置効果（CATE）に基づくクラスタリングで顕在化させる。二段階のフレームワークにより、treatment 反応の類似度でサンプルを束ね、クラスタ単位の平均 CATE を算出して解釈可能なサブグループを発見する。

## 手法・キーアイデア
- **段階1: CATE 推定**: Robinson 分解に基づく直交化学習器（orthogonalized learner）でデバイアスした CATE を推定。ここから「treatment 反応の類似度」をエンコードするカーネル行列を生成する。
- **段階2: カーネル化クラスタリング**: そのカーネル行列にクラスタリングを適用し、部分集団を分離、クラスタごとの平均 CATE を求める。これは residual-on-residual 回帰における正則化として定式化される。
- **causal forest との統合**: 因果フォレストと学習カーネルを組み合わせ、効果空間上の類似性でグループ化する点が新規。

## ユーザー課題への適用
本手法は「反応（効果）の近さ」を明示的にカーネル行列として与えるため、施策/ユーザーのグルーピングを客観的な効果類似度で正当化する目的にきわめて適合する。属性の近さではなく、CATE（＝介入したときの反応）の近さで距離を定義するので、「同じキャンペーンに同様に反応する層」を機械的に抽出でき、施策設計の根拠を効果ベースで説明できる。直交化学習器による debias が入っているため、交絡下でも反応類似度の推定が安定する。marketing なら、uplift の効く/効かないユーザーをカーネル距離でクラスタリングし、クラスタ平均 CATE で予算配分を正当化できる。カーネルは transport の足がかりにもなり、別基盤で同じ効果クラスタへの帰属を推定する拡張が考えられる。

## 長所と限界
- **長所**: 効果類似度をカーネルとして陽に定義し解釈性が高い。直交化でデバイアス。subgroup discovery とクラスタ CATE を同時に得られる。ablation あり。
- **限界**: pre-print で限界の明示は乏しい。クラスタ数選択、カーネル・クラスタリング手法選択の感度、高次元・小標本での安定性は要検証。effect の別集団 transport は主題外。

## 関連手法・次に読むべきもの
- Nie & Wager, R-learner（Robinson 分解による直交化学習）
- Athey & Wager, Generalized Random Forests / Causal Forests
- 本サーベイの Iterative Causal Segmentation（02）——効果ベースセグメンテーションの marketing 実装として対比
