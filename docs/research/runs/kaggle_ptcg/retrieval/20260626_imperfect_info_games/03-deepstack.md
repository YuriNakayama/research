# 03 DeepStack — 継続的再求解と深層反事実価値ネット

## メタ情報

- **論文**: "DeepStack: Expert-Level Artificial Intelligence in Heads-Up No-Limit Poker"
- **著者**: Moravčík, Schmid, Burch, Lisý, Morrill, Bard, Davis, Waugh, Johanson, Bowling（U. Alberta / Charles Univ. ほか）
- **発表**: 2017（arXiv 2017-01-06）。査読版 *Science* 356(6337):508–513, DOI 10.1126/science.aam6960
- **arXiv ID**: 1701.01724（https://arxiv.org/abs/1701.01724）
- **対象**: heads-up（2人制）ノーリミット・テキサスホールデム

## 概要

heads-up ノーリミットでプロを統計的有意に撃破した初の AI。完全情報ゲームと違い、ポーカーは情報非対称ゆえ部分木を独立に解けない。DeepStack は (1) 再帰的推論、(2) 分解（計算を当面の意思決定に集中）、(3) 自己対戦+深層学習で獲得した「直観」を組み合わせる。全戦略を事前保持・抽象化するのでなく **毎ターンその場で部分ゲームを解き直す（continual re-solving）** ことで抽象化由来の搾取可能性を抑える。

## 手法の核心

1. **Continual re-solving**: 完全な戦略を保持しない。各意思決定点で必要なのは「自分の range（取り得る手札 1,326通り上の分布）」と「相手の counterfactual values（反事実価値ベクトル）」のみ。手番ごとに public state からゼロから部分木を解き直し、行動後はその戦略を破棄。range と相手価値を Bayes 則+直前の再求解結果で更新。
2. **Deep counterfactual value network（range 全体を採点）**: 探索を数手先で打ち切り、末端を深層ネットで評価。入力=pot サイズ + 両者 range（1,326手を1,000クラスタ化）、出力=**両者それぞれの全 range に対する counterfactual value ベクトル**（単一状態値でなく手札分布全体を一括採点）。7層全結合(各500)+parametric ReLU、出力外でゼロサム制約。教師値は CFR+ をスパース行動集合で解いて生成（turn 1,000万 / flop 100万局面）。
3. **Depth-limited sparse lookahead**: 行動を fold/call/{1/2,1,2}pot bet/all-in に制限し、10^160 → 約10^7 に圧縮、5秒未満で解ける。CFR 反復はラウンド別（pre/flop/turn 1,000、river 2,000）。
4. **計算時間**: 1手あたり pre 中央値0.04秒、flop ≈5.9秒、turn ≈5.4秒、river ≈2.1秒。単一 GTX 1080 + Torch7。人間の思考中央値9.6秒より概ね速い。

## 主要な結果

- 44,852ハンドの対人試験でプロを統計的有意に撃破。全体勝率 **492 mbb/g**（ゼロから4SD以上）。AIVAT 後 **486 mbb/g**（20SD以上）。
- 3,000ハンド完遂者では推定 **394 mbb/g**、11名中10名を有意に撃破。
- 抽象化ベース先行手法より搾取されにくい（exploitability が低い）戦略を生成。

## Pokémon TCG AI Battle Challenge への示唆

- **隠れ手 range を価値ネットで採点 → 毎ターン局所 re-solve**: PTCG では相手手札・山札残り・伏せたサイドが隠れ情報。DeepStack 流に「自分（と相手）の取り得る隠れ状態の分布（range）全体を一括採点する学習済み価値ネット」を用意し、それを末端とする深さ制限の局所 re-solve を毎ターン走らせる設計が直接の指針。固定の巨大戦略表でなく「その局面だけを解く」ので膨大な状態空間に対応できる。
- **cabt の10分/プレイヤー予算と整合**: DeepStack はターン中央値数秒（GTX 1080 単機）。10分予算は毎ターンの局所 re-solve に十分。1ゲームのターン数を見積り、1ターンあたり秒数の中で CFR 反復数・先読み深さ・range クラスタ数を調整。価値ネットが探索のボトルネックを肩代わりするため浅い深さで質を担保でき、限られた予算と相性が良い。
- **ゼロサム制約 + スパース行動抽象化**: 合法手が多い局面でも探索を現実的サイズに保つテクとして流用可能。

## 限界・注意

- 2人制専用（理論的健全性は2人零和前提）。PTCG は基本2人なので相性良いが確率・隠れ情報構造はポーカーと異なる。
- 価値ネットは大量生成局面に依存（turn だけで1,000万局面を CFR+ で生成）。PTCG では教師となる counterfactual value の生成手段を別途構築が必要。
- range 1,000クラスタ・行動の丸めは近似で、汎化誤差と相まって最適からずれ得る。評価に AIVAT 級の分散低減がほぼ必須。
- science.org は 403。数値は arXiv(ar5iv) 版に基づく。査読版との微差は⚠️要確認。

## 出典

- arXiv:1701.01724 — https://arxiv.org/abs/1701.01724 ／ ar5iv: https://ar5iv.labs.arxiv.org/html/1701.01724
- 査読版 *Science* 356(6337):508–513, DOI 10.1126/science.aam6960（403 のため未取得、二次資料で照合）
