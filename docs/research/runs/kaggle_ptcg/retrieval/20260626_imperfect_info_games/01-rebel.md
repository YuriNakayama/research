# 01 ReBeL — RL+探索を不完全情報へ統合

## メタ情報

| 項目 | 値 |
|------|----|
| 著者 | Noam Brown, Anton Bakhtin, Adam Lerer, Qucheng Gong（Facebook AI Research） |
| 発表年 | 2020（arXiv 初版 2020-07-27、改訂 2020-11-29） |
| Venue | NeurIPS 2020（⚠️ 一般引用ベース。ページ本文からは直接確認できず） |
| arXiv ID | 2007.13544 |
| URL | https://arxiv.org/abs/2007.13544 |

## 概要

ReBeL（Recursive Belief-based Learning）は、AlphaZero 型の「学習時・推論時の双方で深層強化学習と探索を組み合わせる」パラダイムを不完全情報ゲームへ初めて一般的な形で拡張したフレームワーク。**public belief state（PBS、公開信念状態）** を導入して不完全情報ゲームを連続状態の完全情報ゲームへ再定式化し、その上で value/policy を学習する。自己対戦と CFR ベースの探索を統合し、任意の2人零和ゲームでナッシュ均衡へ証明可能な形で収束する。完全情報ゲームでは AlphaZero 類似アルゴリズムへ縮退する。

## 手法の核心

- **Public Belief State (PBS)**: 各プレイヤーが取り得る infostate（私的情報状態）上の同時確率分布。表記 β = (ΔS₁(s_pub), …, ΔSₙ(s_pub))。私的カードを直接観測せず「各私的カードについて各行動を選ぶ確率分布」を公開する形で記述し、これが共有知識である限りゲームを完全情報として扱える。
- **PBS 上の value/policy 学習**: 連続状態の完全情報ゲームになるため、AlphaZero と同様に value ネット v̂(s_i | β) と policy ネットを学習。ポーカーでは GeLU+LayerNorm の MLP（隠れ6層×1536、入力≈2,654次元 = 各種スカラー + belief 2×1326）。value は pointwise Huber loss、policy は確率上の MSE。
- **自己対戦 + CFR-D 探索の統合（Algorithm 1）**: 各局面の PBS βᵣ を根に深さ制限サブゲームを構成し T 反復の CFR-D を実行。葉ノードは学習済み value ネットで評価。平均方策 π̄ᵀ がナッシュ均衡へ収束。学習データ収集ではランダムな反復 t∼unif{0,T−1} の葉 PBS を選び、探索の中間段階すべてで value が正確になるようにする。
- **収束保証（2人零和）**: (学習) 完全な関数近似下、サブゲームあたり T 反復で value 誤差が高々 C/√T。(テスト時の安全性) 誤差 δ≤ε の value ネットを使い探索時ランダムなしで走らせると、相手方策が未知でも (δC₁+δC₂/√T)-ナッシュ均衡。学習時は ε=0.25 でランダム行動、テスト時 ε=0。

## 主要な結果

- **HUNL**: vs Slumbot +45±5 mbb/g、vs BabyTartanian8 +9±4、vs Dong Kim（プロ, 7,500ハンド）ReBeL 勝ち、vs LBR +881±94。1ハンド平均2秒未満（最大5秒）。
- **Liar's Dice**: 深さ制限サブゲーム(depth=2, 1,024反復) で近似ナッシュ均衡へ収束（tabular CFR には僅かに及ばず）。
- **計算コスト**: データ生成に 90台の DGX-1（720 GPU 規模）。⚠️ 総 wall-clock 学習時間・リプレイバッファ規模は本文から未確定。

## Pokémon TCG AI Battle Challenge への示唆

本コンペ（2人零和・確率的・不完全情報・行動index出力・自己対戦 Gaussian/TrueSkill 系）は ReBeL の前提「2人零和不完全情報ゲーム」と理論枠組み上は正面一致。

- **PBS のマッピング**: 公開状態 = 盤面（場のポケモン・エネルギー・トラッシュ・サイド枚数・プレイ履歴/ゲームログ）、隠蔽 infostate = 相手手札内容と山札順。デッキ構成が概ね既知なら相手手札・山札順の分布を PBS として表現可能。ただし手札・山札の組合せ空間が桁違いに巨大で **PBS を陽に持つのは非現実的**（ポーカーの1,326次元のような綺麗な信念ベクトルは作れない）。
- **実装難度（率直に）**: ①CFR-D サブゲーム求解が PTCG では極めて重い（自然な深さ制限境界がなく状態列挙不能）。②value ネット入力（PBS）の設計が最難関で、信念を determinization 集合や埋め込みへ近似する必要があり、その時点で理論保証が崩れる。③10分/プレイヤー予算で毎ターン CFR は超過リスク。④cabt 上に完全 ReBeL を載せるのは非現実的。
- **現実的な転用**: ReBeL の「学習済み value で葉を評価する深さ制限探索」「自己対戦で価値を育てる」発想だけを borrow し、CFR の代わりに **determinization + ISMCTS（→04）** や **DouZero 型 Deep Monte Carlo（→cluster-05）** を据える。TrueSkill ラダーを自己対戦ループの代理に使う。

## 限界・注意

- 計算量（720 GPU 規模）。個人〜5名チーム（Google Cloud $3,000）では同等スケール困難。
- PBS の次元・列挙可能性が PTCG では破綻。信念近似で理論保証が消失。
- ナッシュ収束保証は2人零和に限定（PTCG は満たすが、保証は正確な PBS + 完全な関数近似が前提）。
- 「1ハンド2秒」はポーカー専用高速ソルバの成果で、PTCG の探索コストは段違い。

## 出典

- arXiv: https://arxiv.org/abs/2007.13544 ／ HTML: https://ar5iv.labs.arxiv.org/abs/2007.13544
- 対象コンペ仕様: `../../clustering/20260626/cluster-01-target-competition-spec.md`
