# 1. Learning Action Embeddings for Off-Policy Evaluation

- **URL / arXiv**: https://arxiv.org/abs/2305.03954
- **著者 / 発表年 / venue**: Matej Cief, Jacek Golebiowski, Philipp Schmidt, Ziawasch Abedjan, Artur Bekasov / 2023（2024改訂）/ arXiv (cs.LG)、ECIR 2024 系の off-policy evaluation 研究

## 概要
本論文は、ログデータのみからポリシーの期待報酬を推定する off-policy evaluation（OPE）を、大規模行動空間の設定で扱う。行動数が多いと標準的な inverse-propensity scoring（IPS）は分散が爆発し、実用に耐えない。既存の marginalized IPS（MIPS）は行動の「埋め込み（embedding）」を用いて分散を抑えるが、埋め込みを実務者が手動で定義する必要があった。本論文はこの埋め込みを報酬モデルの出力から自動的に学習する手法を提案し、MIPS の実用性を高める。

## 手法・キーアイデア
- **MIPS の拡張**: 行動そのものではなく、行動を要約する低次元の埋め込みで傾向スコアを周辺化（marginalize）し、分散を低減する。
- **埋め込みの学習**: 事前定義された埋め込みに依存せず、学習済み報酬モデルの中間表現・出力からデータ駆動で埋め込みを導出する。
- **バイアス-分散のバランス**: direct method（DM）の低分散と IPS の低バイアスを、doubly robust（DR）の代替として組み合わせる位置づけ。追加の行動情報を柔軟に取り込める。

## ユーザー課題への適用
本手法の中核は「行動（＝施策）を、その効果・報酬構造の観点から近い/遠いを測る埋め込み空間に写す」点にあり、施策グルーピングの客観的正当化に直結する。施策 A/B/C を報酬モデル経由の埋め込みで表現すれば、「効果的に類似した施策」をユークリッド距離やクラスタリングで機械的に束ねられ、恣意的なカテゴリ分けを避けられる。またクリエイティブやオファーが多数ある marketing 配信で、新規施策を既存埋め込み近傍にマップして効果を借り受ける（cold-start 的 transport）応用も可能。ユーザー側に転用すれば、行動履歴を報酬駆動で埋め込み、反応の近いユーザー基盤を同定してオフライン評価する土台になる。

## 長所と限界
- **長所**: 手動の埋め込み設計が不要で実務適用が容易。大規模行動空間で分散を大幅に削減し、A/B テストなしで施策評価ができる。
- **限界**: 学習済み報酬モデルへのアクセスが前提で、その品質に性能が強く依存する。報酬モデルのバイアスが埋め込みに漏れると評価も歪む。ドメイン間の汎化は保証されない。

## 関連手法・次に読むべきもの
- Saito & Joachims, "Off-Policy Evaluation for Large Action Spaces via Embeddings"（MIPS 原論文）
- Dudík et al., Doubly Robust Policy Evaluation
- 本サーベイの因果クラスタリング（03）と接続すると、行動埋め込み × 効果クラスタリングの統合設計が見える。
