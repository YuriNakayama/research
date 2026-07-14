# 4. VCNet + Functional Targeted Regularization（連続処置の因果効果学習）

- **URL / arXiv**: https://arxiv.org/abs/2103.07861
- **著者 / 発表年 / venue**: Lizhen Nie, Mao Ye, Qiang Liu, Dan Nicolae / 2021（ICLR 2021）/ University of Chicago, UT Austin

## 概要
観測データから連続処置（continuous treatment）の平均用量反応関数（ADRF: Average Dose-Response Function）を推定する問題を扱う。従来のニューラル手法は連続処置をブロックに分割し各ブロックに別々のヘッドを割り当てていたため、実際には不連続な ADRF を生じるという欠点があった。本論文は VCNet（Varying Coefficient Network）でこの不連続性を解消しつつ表現力を高め、さらに Functional Targeted Regularization で ADRF 全体にわたる二重頑健（doubly robust）推定量を実現する。クーポン額のような連続量の施策効果を滑らかに推定する基盤技術である。

## 手法・キーアイデア
- **VCNet（Varying Coefficient Network）**: 処置 t を係数を変化させる変数として扱い、ネットワークの重みを t の滑らかな関数（スプライン基底等）としてパラメタ化する。これにより処置に関して連続な ADRF を保証しつつ、ブロック分割よりも高い表現力を得る。
- **共変量表現の保持**: 処置と独立に共変量表現 z(x) を学習し、傾向スコア（一般化傾向スコア）推定と成果予測を共有する。
- **Functional Targeted Regularization**: 従来の（点推定向け）targeted regularization を関数（曲線）全体へ拡張し、ADRF 全域で二重頑健性と有限標本性能を向上させる。

## ユーザー課題への適用
クーポン施策の設計変数のうち「割引額」「割引率」「付与ポイント額」などは本質的に連続量であり、これを二値処置に離散化すると情報を失う。VCNet を使えば、割引額を連続処置 t、顧客属性を共変量 x として、割引額に応じた購買増分（用量反応曲線）を滑らかに推定できる。これにより「いくら割り引けば効果が最大化するか」「限界的な割引増分の効果」を顧客セグメント別に予測でき、未実施の割引額水準（例：これまで試していない中間的な割引率）の効果も曲線上の内挿・外挿として得られる。情報0の新規施策でも、連続的な施策強度軸に沿った効果予測を提供する点で有用。

## 長所と限界
- **長所**: 連続な ADRF を保証し不連続性を解消。二重頑健推定で交絡調整に頑健。一般化傾向スコアと成果モデルを統合。
- **限界**: 単一の連続処置次元を主眼とし、複数施策特徴（カテゴリ×額×チャネル等）の高次元・混合型介入空間には直接対応しない。用量反応の識別には positivity（全処置水準に十分なサポート）が必要で、未試行の割引額への外挿は保証されない。

## 関連手法・次に読むべきもの
- DRNet / Dose-Response Networks（ブロック分割型ベースライン）。
- Targeted Maximum Likelihood Estimation（TMLE）— 二重頑健推定の基礎。
- CaML（arXiv:2301.12292）— 施策特徴を離散属性として扱う相補的アプローチ。
- IFM（arXiv:2306.04027）— 複数施策要素の組合せ汎化。
