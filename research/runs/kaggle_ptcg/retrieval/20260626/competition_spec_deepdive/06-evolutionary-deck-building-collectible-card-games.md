# 進化計算によるデッキ構築最適化: 60枚同時最適化とメタゲーム評価

## 概要

PTCG AI Battle Challenge は、エージェントのプレイ方策に加えて **60 枚デッキの同時最適化**(約2000枚プールから選択)という巨大な離散最適化問題を内包する。Hearthstone を題材とした進化計算(EA)研究群 — García-Sánchez らの "Optimizing Hearthstone Agents using an Evolutionary Algorithm" やデッキ構築 EA — は、シミュレーション対戦を fitness としてデッキ/プレイ方策を進化させる手法を確立しており、本コンペのデッキ最適化に直接転用できる。本レポートはその表現・適応度評価・演算子・計算予算を整理する。

## 手法の要点

**García-Sánchez et al.(プレイ方策の EA 最適化)**

- ゲノムは **21 個の実数重み**(各 [0,1])で、手コーディングされた行動評価ヒューリスティクスをパラメータ化(英雄 HP 減少・ミニオン能力・カードアビリティ・マナ消費・シークレット等の係数)。
- **適応度は競争的共進化**: 各エージェントが集団内の他個体と、3 種の既製デッキ(Aggro Pirate Warrior / MidRange Jade Shaman / Reno Mage)の全組合せ(3×3)で対戦し、各組合せ 20 試合の総勝利数を fitness とする。
- 演算子は**自己適応ステップ幅の突然変異**(σ を進化させ wᵢ = wᵢ + N(0, σ'ᵢ))中心の進化戦略。交叉なし。μ=10, λ=10, 世代数 100, (μ+λ) エリート選択。
- 計算予算は約 36 万試合(100 世代 × 20 個体 × 20 試合 × 9 組合せ)、Core i7 8 コアで 1 ラン約 2 日。
- 結果: 進化エージェントは CIG2018 Hearthstone AI Competition で**準優勝(上位 6%、33 参加者中)**、MCTS 系を上回った。

**デッキ構築 EA(Evolutionary Deckbuilding)**

- デッキ(Hearthstone は 30 枚、レジェンドは 1 枚制限・他は最大 2 枚)を直接ゲノムとして表現し、ランダムデッキ集団を生成→有望個体を突然変異・交叉。
- 適応度は「ターゲットメタを定義する人間設計デッキ群に対し AI が対戦した総勝利数」。進化デッキは AI がプレイすると人間製デッキを上回る性能を示した。

## 主要な結果や知見

- **シミュレーション対戦を fitness とする EA は、デッキ・プレイ方策の両方を実用的に最適化できる**。MCTS 系プレイヤーを上回る結果も出ている。
- **メタゲーム指向の評価が重要**: 固定の代表デッキ群に対する勝率で評価することで、特定メタに強いデッキへ収束する。共進化を使うと相手も進化し過適合を防げる。
- 計算コストは「数 10 万試合 / ラン」規模で、シミュレータの 1 試合速度が律速。高速な対戦シミュレータが EA の実用性を決める。
- 重み付きヒューリスティクスは少パラメータ(21 次元)で表現力があり、深層モデルより学習・推論が軽量で時間予算に優しい。

## 本コンペ(PTCG AI Battle)への応用

- **デッキ 60 枚最適化への直接適用**: ゲノムを「約2000枚プールからの 60 枚マルチセット(同名カード枚数制約・基本エネルギー除く 4 枚上限などの PTCG 構築ルール)」として表現し、突然変異(カード入替)・交叉(デッキ半分交換)+ 修復演算子(制約違反を合法化)で進化させる。`all_card_data()` の数値特徴(HP・エネルギー・進化段階)をシード生成や類似カード変異に活用。
- **fitness = cabt 自己対戦勝率**: 候補デッキを `env = make("cabt", configuration={"decks":[d0,d1]})` で多数対戦させ勝率を fitness にする。ラダーが Gaussian レーティングなので、fitness も「平均勝率 - 分散ペナルティ」にすると安定デッキへ収束しやすい。
- **メタ共進化**: 集団内デッキ同士の総当たり(García-Sánchez 型の競争的共進化)で、特定の支配的アーキタイプに過適合せずラダーの多様な相手に強いデッキへ収束させる。代表的な強デッキ(コミュニティで判明したもの)を固定相手プールに加える。
- **方策とデッキの分離 + 軽量化**: García-Sánchez の 21 次元重みヒューリスティクスは、本コンペの 10 分予算下で推論が極めて軽く、`per-SelectContext scoring` のスコア関数の係数として進化させられる。重い RL/探索を全選択点で回せない局面では、この軽量ヒューリスティクスを fallback/高速パスに据える設計が時間切れ即敗北のリスクを下げる。
- **計算予算の現実解**: 数 10 万試合規模の EA は cabt のシミュレーション速度に依存する。ローカルで並列対戦を回し、デッキ最適化はオフラインで完了させ、提出物の `deck.csv`(60 枚)に焼き込む運用が、1 日 5 提出制約とも整合する。

## 出典(URL)

- García-Sánchez et al., "Optimizing Hearthstone Agents using an Evolutionary Algorithm" (arXiv): https://arxiv.org/abs/2410.19681 / 本文: https://arxiv.org/html/2410.19681v1
- Evolutionary Deckbuilding in HearthStone (IEEE): https://ieeexplore.ieee.org/document/7860426/
- Automated playtesting in collectible card games using EAs (Hearthstone, ScienceDirect): https://www.sciencedirect.com/science/article/abs/pii/S0950705118301953
- PTCG AI Battle Challenge Strategy track: https://www.kaggle.com/competitions/pokemon-tcg-ai-battle-challenge-strategy/overview
