# Deep Sets と Set Transformer: 順序不変な盤面・集合エンコーディング

## 概要

カードゲームの盤面・手札・サイドは本質的に**順序を持たない集合**であり、入力順を変えても評価は不変であるべきである。**Deep Sets**(Zaheer ら, NeurIPS 2017, arXiv:1703.06114)と **Set Transformer**(Lee ら, ICML 2019, arXiv:1810.00825)は、この**順序不変性(permutation invariance)**を構造的に保証するニューラルネット枠組みを提供する。Deep Sets は任意の順序不変関数の理論的特徴づけを与え、Set Transformer は注意機構で集合要素間の相互作用をモデル化しつつ順序不変な集合埋め込みを生成する。PTCG の `obs_dict`(logs/current/select)の盤面・手札・トラッシュなど可変サイズ集合の符号化に直接効く基盤技術である。

## 手法の要点

### Deep Sets (arXiv:1703.06114)
- **核心定理**: 集合 {x_i} 上の任意の順序不変関数は **f({x_i}) = ρ(Σ_i φ(x_i))** の形に分解できる(可算集合に対し必要十分)。φ は各要素を埋め込む共有ネット、ρ は集約後を処理するネット、和 Σ が順序不変性を保証する。
- **順序同変性(equivariance)**: 層レベルで順序同変となる重み共有の条件も導出。集合内の各要素を相互作用させつつ順序に依存しない処理が可能。
- **可変サイズ対応**: 和による集約のため、要素数が変わっても同じネットで処理できる。
- **応用**: 母集団統計推定、点群分類、集合拡張、外れ値検出など。

### Set Transformer (arXiv:1810.00825)
- **MAB / SAB**: Multihead Attention Block を基に Set Attention Block で集合要素間の相互作用を注意機構でモデル化(単純和より高表現力)。
- **ISAB(Induced Set Attention Block)**: 学習可能な **inducing points**(r≪n)を介すことで自己注意の O(n^2) を **O(nr)** に削減。大きな集合でも計算可能。
- **PMA(Pooling by Multihead Attention)**: 固定集約子の代わりに、**学習可能な k 個の seed ベクトル** を query として注意プーリングし、順序不変な集合埋め込みを生成。k=1 で単一ベクトル、k>1 で複数の集約表現が得られる。

## 主要な結果や知見

- Deep Sets は十分表現力のある φ, ρ の下で **任意の順序不変関数の普遍近似器** であることが示された(理論的保証)。
- Set Transformer は要素間相互作用を明示的にモデル化するため、要素の関係性が重要なタスク(例: 集合内の最大値・クラスタ構造)で Deep Sets の単純和より高精度。
- ISAB により大規模集合でも線形計算量で自己注意が可能となり、実用上のスケーラビリティを確保。
- RL への応用(Karch ら「Deep Sets for Generalization in RL」, arXiv:2003.09443)では、オブジェクト中心の順序不変ポリシー/クリティックにより、**テスト時に物体数が変わっても汎化**し、関係推論を要する目標にも拡張できることが示された。

## 本コンペ(PTCG AI Battle)への応用

- **obs_dict の集合構造を順序不変に符号化**: PTCG の盤面(ベンチのポケモン)、手札、トラッシュ、サイドなどは順序を持たない可変サイズ集合。各カード/ポケモンを φ で埋め込み Σ で集約(Deep Sets)、または PMA で集約(Set Transformer)すれば、入力順に依存しない頑健な状態表現が得られる。手札の並び順が変わっても同じ評価を返せるため、学習効率と汎化が向上する。
- **可変枚数への対応**: 試合進行で手札・ベンチの枚数は刻々と変わる。和/注意プーリングは要素数非依存なので、固定長ベクトルへの無理なパディングを避けられる。
- **評価関数の入力層として**: 後述の盤面評価関数(value network)の入力に Deep Sets / Set Transformer を採用すれば、盤面状態を順序不変ベクトルに圧縮してから価値推定できる。これは合法手 index を選ぶ際の局面評価の質を高める。
- **logs(対戦履歴)の集約**: `obs_dict.logs` のイベント列も、順不同で扱える部分は集合符号化、時系列性が重要な部分は系列モデルと使い分けられる。
- **計算時間**: ISAB の O(nr) スケーリングは、ベンチや手札が多い局面でも 10 分制約内に状態符号化を収める上で有利。
- **デッキ(60枚)の集合表現**: デッキ自体も順序不変集合なので、Deep Sets/Set Transformer でデッキ埋め込みを作り、デッキ選択フェーズの評価に使える。

## 出典(URL)

- Deep Sets(arXiv): https://arxiv.org/abs/1703.06114
- Deep Sets(NeurIPS): https://proceedings.neurips.cc/paper/2017/hash/f22e4747da1aa27e363d86d40ff442fe-Abstract.html
- Set Transformer(arXiv): https://arxiv.org/abs/1810.00825
- Set Transformer(PMLR): https://proceedings.mlr.press/v97/lee19d
- Deep Sets for Generalization in RL: https://arxiv.org/abs/2003.09443
