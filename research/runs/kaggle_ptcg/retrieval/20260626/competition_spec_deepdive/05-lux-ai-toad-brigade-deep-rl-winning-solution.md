# Lux AI 優勝解 Toad Brigade の深層強化学習: 巨大行動空間への RL アプローチ

## 概要

Kaggle Lux AI Season 1 の優勝チーム Toad Brigade(Isaiah Pressman ら)の解法は、巨大な行動空間・部分観測・対戦型 1v1 という、本コンペと構造的に類似した設定で深層強化学習 (RL) を成功させた代表事例である。FAIR の IMPALA 実装をベースに UPGO・TD(λ)・teacher network(KL 正則化)を組み合わせ、squeeze-excitation 付き全畳み込み ResNet を漸進的に拡大して学習した。本レポートはそのアーキテクチャ・学習プロトコル・推論最適化を整理し、PTCG への RL アプローチ設計に翻訳する。

## 手法の要点

**学習アルゴリズム**

- ベースは **IMPALA**(Espeholt et al. 2018, arXiv:1802.01561): actor が軌跡を生成し中央 learner が勾配計算、V-trace で off-policy 補正する分散 RL。これに **UPGO**(upgoing policy update)と **TD(λ)** の損失項を追加。
- **Teacher network**: 凍結した教師モデルが全状態で推論し、現方策との **KL ダイバージェンス罰則**を加えることで挙動を安定化し戦略の振動(strategic cycles)を防止。さらに小さいネットを大きいネットの教師にする漸進的監督を採用。

**ネットワーク**

- 全畳み込み **ResNet + squeeze-excitation**。各ブロックは 128ch・5×5 畳み込み、正規化なし。**ブロック数を 8 → 16 → 24 へ漸進的に増加**。総パラメータ約 2000 万。
- 出力は 3 つの actor head(worker/cart/city tile、各 32×32×行動数)+ critic(値 [-1,1])。
- 入力は 32×32 にゼロパディングし、情報漏洩防止のため masked convolution。離散特徴は 32 次元の学習可能埋め込み→1×1 畳み込みで 128×32×32 に射影、連続特徴は特徴ごと正規化。

**行動空間とマスキング**

- worker は 19 行動、cart は 17 行動、city tile は 4 行動。**非合法行動は logit を -∞ にマスク**。これにより巨大な単位×行動の組合せでも合法手のみから選択。

**学習・推論**

- 最初の 2000 万ステップは reward shaping(都市/ユニット建設・研究完了・燃料供給に加点)+ 疎な勝敗信号。ハードウェアは個人の dual-GPU・8 コア機。
- 推論は Kaggle サーバ上で 1 推論 2〜2.5 秒(バッチ 2)。テスト時に 180 度回転データ拡張で確率平均、行動は greedy(サンプリングせず)、最終ターンの cart 建設タイブレーク等のルール制約を併用。

## 主要な結果や知見

- 1 位解は 2 位を大きく引き離す強さで、**公開リプレイから模倣学習しても比較的容易に高性能が得られた**(他参加者の知見)。RL の強さが模倣の良質な教師データを生む好循環。
- **行動マスキング**が巨大行動空間 RL の鍵。非合法手を学習対象から外すことで探索が現実的になる。
- **漸進的ネット拡大 + teacher KL** が学習安定化に効く。いきなり大きいネットを学習させず段階的に。
- 個人の 2-GPU 環境でも優勝可能な計算効率(IMPALA の throughput と V-trace の off-policy 効率)。
- **推論レイテンシは無視できない**: 2〜2.5 秒/手は時間予算の厳しいコンペでは設計制約になる。

## 本コンペ(PTCG AI Battle)への応用

- **行動マスキングの直輸入**: cabt は毎ターン合法手 `option` リストだけを提示する。RL を組むなら option index 上に方策ヘッドを定義し、可変長の合法手集合に対し softmax を取る(=非合法を構造的に排除)設計が自然。Toad Brigade の -∞ マスキングと同型。
- **盤面の構造化エンコード**: PTCG の盤面(active/bench 最大6体・手札・サイド・トラッシュ・スタジアム)を、ポケモンの種類・HP・付与エネルギー・状態異常フラグからなるテンソルに符号化し、ResNet 風 or set/transformer エンコーダで処理。相手の隠れ手札は handCount のみなので、その不確実性を入力に含める。
- **teacher KL による安定化**: 自己対戦で戦略が振動しやすいカードゲームで、凍結教師との KL 正則化は有効。模倣学習(ラダー上位リプレイ or 自作 ISMCTS エージェントの対戦ログ)で teacher を作り、その上に RL を載せるハイブリッドが現実的。
- **10 分予算との整合**: 1 推論 2〜2.5 秒は致命的になりうる。PTCG は 1 試合で多数の選択点があるため、(a) モデルを軽量化(蒸留)、(b) 自明選択はルールベース即決、(c) GPU 不可なら小型 CNN/MLP に限定、が必須。Lux の greedy 推論(サンプリング回避)も決定的で速く、Gaussian ラダーの安定勝率にも寄与。
- **デッキ最適化との分離**: Lux はマップ固定だが PTCG は 60 枚デッキ選択が加わる。RL 方策は固定デッキで学習し、デッキ自体は別途進化計算/メタ分析で最適化する 2 段構成が、行動空間と探索を分離でき扱いやすい。

## 出典(URL)

- Toad Brigade Lux AI 解法 README (Isaiah Pressman): https://github.com/IsaiahPressman/Kaggle_Lux_AI_2021/blob/main/README.md
- Toad Brigade Approach (Kaggle writeup): https://www.kaggle.com/competitions/lux-ai-2021/writeups/toad-brigade-toad-brigade-s-approach-deep-reinforc
- IMPALA: Scalable Distributed Deep-RL (Espeholt et al. 2018): https://arxiv.org/abs/1802.01561
- Lux AI Challenge: https://www.lux-ai.org/
