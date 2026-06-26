# 02 Pluribus — 多人数ポーカーの超人AI

## メタ情報

- **論文**: "Superhuman AI for multiplayer poker"
- **著者**: Noam Brown, Tuomas Sandholm（CMU / Facebook AI Research / Strategic Machine / Strategy Robot）
- **掲載**: *Science* 2019, Vol. 365(6456), pp. 885–890（オンライン 2019-07-11）
- **DOI**: 10.1126/science.aay2400 ／ PMID: 31296650（https://pubmed.ncbi.nlm.nih.gov/31296650/）
- **著者サマリ**: https://noambrown.com/

## 概要

6人制ノーリミット・テキサスホールデムでトッププロを上回った初の AI。従来の超人 AI（DeepStack/Libratus）は2人零和限定だったが、多人数では均衡が複数あり得る・均衡をプレイしても勝てる保証がない・結託などの困難が生じる。Pluribus は理論的最適性の追求を捨て、**自己対戦で得たオフライン blueprint + 実時間の深さ制限探索** という実用路線で人間プロを統計的有意に撃破した。

## 手法の核心

1. **Blueprint をオフライン計算（MCCFR）**: ゲーム全体の粗い戦略を Monte Carlo CFR の自己対戦で事前計算。
2. **Abstraction**: action abstraction（連続ベット額を代表サイズに丸める）+ information/card abstraction（戦略的に類似の手札・盤面を bucketing）。blueprint は強い抽象化、実時間探索はより細かい抽象化。
3. **Depth-limited search + leaf 頑健化**: 探索末端で単一継続戦略を仮定すると過度に楽観的になるため、**leaf で各プレイヤーが複数の事前計算済み継続戦略から選べる**ようにする（無修正 blueprint + fold/call/raise 寄りにバイアスした変種、実質4種程度。⚠️ 正確な変種数は要確認）。十分な数があれば2人零和では証明可能にナッシュ収束。
4. **計算コスト（~$150）**: blueprint 学習は単一64コアサーバで8日・512GB未満RAM・GPU不使用（≈12,400 CPUコア時、スポット換算≈$144）。対局時探索は2基の Haswell E5-2695 v3・128GB未満、1手1〜33秒。

## 主要な結果

- **5プロ+1 Pluribus**: 13名のトッププロから日替わり5名、12日間で10,000ハンド。勝率 **48 mbb/game（SE 25, p=0.028）**。
- **1プロ+5 Pluribus**: Ferguson と Elias が各5,000ハンド。5体の Pluribus が人間を **平均 32 mbb/game（SE 15, p=0.014）** で撃破。
- 分散低減に **AIVAT**（SD 約85%削減）。

## Pokémon TCG AI Battle Challenge への示唆

- **「オフライン blueprint + 実時間探索」の二段構え**: 全ゲーム木を毎ターン解かず、粗い基本方策を事前学習し、対局中に局所的に深さ制限探索で補正。状態数が膨大な PTCG にそのまま移植でき、10分/プレイヤー予算内で探索深さ・反復数を調整すればよい。
- **低コスト学習の実証**: 超人性能に大規模GPUクラスタは必須でない。64コア8日・約$144。Kaggle の Google Cloud $3,000 でも blueprint+探索路線は現実的。
- **「想定外の相手行動を最近傍に丸めない」教訓（最重要）**: 探索末端で相手が単一固定戦略に従うと決めつけない。相手の予想外プレイ（自分の abstraction に無い行動）に対し、複数の継続戦略を相手に「選ばせる」形でロバストに評価すると未知行動への脆弱性が減る。

## 限界・注意

- ナッシュ収束の証明は2人零和でのみ成立。6人制での機能は経験的事実。PTCG は1v1零和なので前提は近いが、隠れ情報・確率構造はポーカーと異なる。
- action/card abstraction は人手のドメイン知識に依存。PTCG では抽象化をゼロから再設計が必要。
- ソースコード非公開。継続戦略の正確な個数・バケット数は推定（⚠️ 要確認）。
- 形式A（p=0.028）は形式Bほど有意水準が強くない。高分散ゆえ AIVAT 級の分散低減が実質必須。

## 出典

- *Science* 365(6456):885–890 (2019), DOI 10.1126/science.aay2400 — PubMed: https://pubmed.ncbi.nlm.nih.gov/31296650/
- 著者サイト: https://noambrown.com/
- ※ science.org 本体は 403 のため PubMed・著者サイト・二次資料（vitalab, Wikipedia "Pluribus (poker bot)", CMU 講義資料）で照合。
