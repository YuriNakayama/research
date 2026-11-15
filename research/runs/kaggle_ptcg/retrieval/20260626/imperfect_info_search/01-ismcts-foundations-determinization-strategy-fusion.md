# ISMCTS の原典 — 情報集合木探索・決定化・strategy fusion の理論基盤 (Cowling et al. 2012)

## 概要

Cowling, Powley, Whitehouse の 2012 年 IEEE TCIAIG 論文は、不完全情報ゲームに MCTS を適用する **Information Set MCTS (ISMCTS)** の原典である。状態 (state) のミニマックス木ではなく**情報集合 (information set) の木**を直接探索することで、従来の決定化 (determinization / Perfect Information Monte Carlo, PIMC) が抱える 2 大欠陥 — (1) 計算予算が複数の決定化木に分散する非効率、(2) **strategy fusion** — を緩和する。3 つの変種 SO-ISMCTS / SO-ISMCTS+POM / MO-ISMCTS を提案し、Lord of the Rings: The Confrontation、Phantom (4,4,4)、Dou Di Zhu の 3 ドメインで決定化 UCT を上回ることを示した。PTCG AI Battle のような不完全情報・確率的・巨大行動空間のゲームに対する探索系アルゴリズムの設計図そのものである。

## 手法の要点

**決定化 (determinization)**: 現在の情報集合から隠れ情報の値を 1 つサンプリングし、完全情報ゲームのインスタンスに変換して探索する手法。Bridge (GIB) や Klondike Solitaire で成功したが、Russell & Norvig は「averaging over clairvoyance(千里眼の上での平均化)」と批判する。

**strategy fusion**: 同一情報集合内の異なる状態に対して、決定化ソルバーは(本来区別できないのに)異なる最適手を選べると誤って仮定してしまう問題。論文の例では、エージェントは「環境が X なら a4、Y なら a3 を選ぶ」という区別不能な仮定の下で a1 の価値を +1 と過大評価し、本来最適な a2(+0.5)を捨ててしまう。

**SO-ISMCTS (single-observer)**: ルートプレイヤー視点の情報集合をノードとする単一木を探索。各反復の開始時に決定化を 1 つサンプリングし、その決定化と整合する枝のみに探索を制限する。これにより各情報集合の統計が 1 本の木に集約され、計算予算が効率的に使われる。

**subset-armed bandit(部分集合腕バンディット)**: 相手ノードでは、決定化ごとに合法手の集合が異なる(相手の手札次第で打てる手が変わる)。そこで UCB の親訪問回数 n を、その手が**利用可能だった回数 (availability count)** に置き換える。これにより「稀にしか合法にならない手」が過剰探索されるのを防ぐ。これは ISMCTS の中核的な実装テクニックである。

**SO-ISMCTS+POM (partially observable moves)**: 相手の部分観測手 (partially observable move) をルートプレイヤー視点の「move」単位で 1 本の枝にまとめる。区別できない相手の手を別々に扱わないため strategy fusion をさらに低減するが、相手は区別不能な手を一様ランダムに選ぶと仮定するため相手モデルが弱くなる。

**MO-ISMCTS (multiple-observer)**: 各プレイヤーごとに別々の木を保持し、全木を同時に降下する。手番プレイヤーの木の統計で行動を選び、各木はその手を観測した結果の move に沿って降下する。相手モデルが最も richで、部分観測手のあるゲームで最良の挙動を示す。

**同時手 (simultaneous moves)**: 同時手ノードでは UCB の代わりに **EXP3** を使う。最適方策が混合戦略になることが多く、UCB は純粋戦略に収束する一方 EXP3 は明示的に混合戦略を探索する。**chance node** は環境プレイヤーを「報酬 0 の意思決定者」とみなし、UCB の探索項で各分岐をほぼ均等に訪問させる。

## 主要な結果や知見

- **ドメイン依存性**: 深い探索が必要な LOTR:C と、strategy fusion が致命的な Phantom (4,4,4) では ISMCTS が決定化 UCT を明確に上回る。一方 Dou Di Zhu ではどちらの効果も大きくなく、情報集合木の分岐数が決定化木より桁違いに大きいため両者は同等。
- UCB の探索定数 c は感度が低く、3 ゲームすべてで c=0.7 を採用(範囲 [0.4, 1.4] を外れると性能低下)。
- ISMCTS は明示的に混合方策を求める設計ではないが、Monte Carlo のランダム性により Rock-Paper-Scissors や Kuhn Poker で混合方策を見つける。ただし一般には Nash 方策には収束しない。Nash 近似には MCCFR の方が適すると論文自身が指摘。
- 多くのゲームで「相手の行動から隠れ情報を推論する状況」より「不確実性に対して頑健な手を選ぶ状況」の方が頻繁であり、本論文は信念分布 (belief distribution) を使わず情報集合上の一様分布を仮定している。

## 本コンペ(PTCG AI Battle)への応用

- **基本アーキテクチャ**: PTCG は不完全情報(相手の手札・サイド・山札順)・確率的(コインフリップ、ドロー、ダメージ計算)・巨大行動空間という ISMCTS の想定そのもの。`agent()` の探索エンジンとして SO-ISMCTS を第一候補に据えるべき。状態を直接展開せず、自分視点の情報集合をノードにすることで、相手手札の組合せ爆発(60 枚デッキの未公開部分)をノード数の爆発に変換せずに済む。
- **subset-armed bandit が必須**: 相手の打てる手は相手手札に依存して毎反復で変わるため、合法手 index を扱う本コンペでは「その index が利用可能だった回数」で UCB を正規化する availability count の実装が不可欠。これを怠ると稀な相手の手(特定のサポートや進化)を過剰探索する。
- **同時手は無いが情報非対称は強い**: PTCG はターン制で同時手は基本的に無いが、相手手番の不確実性は強い。SO-ISMCTS+POM 的に「相手のドロー/手札からの行動」を move 単位でまとめると strategy fusion を抑えられる。
- **chance node の集約**: PTCG はコインフリップ・ダメージ乱数・ドローが連続するため、Cowling の chance node 処理(環境プレイヤー化+均等訪問)をそのまま実装し、連続する乱数を 1 ノードに集約することで木の発散を抑える。
- **10 分制約との接続**: ISMCTS は anytime アルゴリズムなので、1 プレイヤー 10 分という制約下でも反復数を調整して動かせる。決定化を複数木に分けず単一木に集約する設計が、限られた時間予算を最も効率的に使う点で本コンペに直結する。
- **デッキ 60 枚同時最適化への示唆**: 本論文は探索アルゴリズムでありデッキ構築は扱わないが、subset-armed bandit と情報集合木の効率性は「自デッキの未ドロー部分」を情報集合として扱う際にも適用できる。

## 出典(URL)

- Cowling, P. I., Powley, E. J., Whitehouse, D. (2012). Information Set Monte Carlo Tree Search. IEEE TCIAIG 4(2):120-143. DOI: 10.1109/TCIAIG.2012.2200894
- PDF: https://eprints.whiterose.ac.uk/id/eprint/75048/1/CowlingPowleyWhitehouse2012.pdf
