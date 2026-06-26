# Sample Factory — Egocentric 3D Control from Pixels at 100000 FPS with Asynchronous Reinforcement Learning（毎秒10万フレームのピクセル入力一人称3D制御を実現する非同期強化学習）

## 基本情報

- **著者**: Aleksei Petrenko, Zhehui Huang, Tushar Kumar, Gaurav Sukhatme, Vladlen Koltun（USC / Intel）
- **年**: 2020
- **venue**: ICML 2020
- **arXiv ID**: 2006.11751
- **URL**: https://arxiv.org/abs/2006.11751

## 課題・背景（what problem）

IMPALA 等の高スループット RL は**大規模分散システムと高価なハードウェア**を前提とし、研究へのアクセスを狭めていた。Sample Factory は逆に「**分散に頼らず、単一マシンの効率と資源利用率を極限まで最適化する**」ことで、1 台の GPU マシンで 10 万 FPS 超を達成することを狙う。これは principles の「同期 RL の構造的非効率を、単一マシンの非同期パイプラインで解消する」事例。

## 提案手法・コア機構（key mechanism）

- **APPO（Asynchronous Proximal Policy Optimization）**: PPO を非同期化し、経験収集を積極的に並列化。
  - 原文: *"Sample Factory, built around an Asynchronous Proximal Policy Optimization (APPO) algorithm, is a reinforcement learning architecture that allows us to aggressively parallelize the experience collection and achieve throughput as high as 130000 FPS."*
- **3 種のコンポーネント**: rollout workers（環境ステップ）／ policy workers（GPU 推論）／ learner（GPU 学習）。各々が独立非同期に走る。
- **共有メモリ通信（シリアライズ回避）**: コンポーネント間は FIFO キュー + 共有メモリで通信し、データ本体ではなく**インデックスだけ**を渡す。
  - 原文: *"These components communicate with each other using a fast protocol based on FIFO queues and shared memory ... we use a mechanism based on PyTorch shared memory tensors ... we copy the data into the shared tensors, and send only the indices of these tensors through FIFO queues."*
  - → プロセス間の高コストなシリアライズ／コピーを排し、host-device 転送の stall を最小化。
- **double-buffered sampling（二重バッファ・サンプリング）**: rollout worker 上の k 環境を 2 グループに分け交互にステップ。一方を環境ステップ中に、他方の行動を policy worker が計算する。
  - 原文: *"Double-Buffered Sampling ... splits k environments on the rollout worker into two groups, alternating between them during sampling, which practically eliminates idle time on CPU workers."*
  - → **CPU 環境ステップと GPU 推論を重ね合わせ、待ち時間を実質ゼロに**する。これが GA3C の「GPU が遊ぶ 108ms」問題への直接的回答。

## 主要な定量結果（key numbers / verbatim quotes）

- abstract: *"throughput higher than $10^5$ environment frames/second on non-trivial control problems in 3D without sacrificing sample efficiency."*（**10 万 FPS 超**、サンプル効率を犠牲にせず）
- APPO で *"throughput as high as 130000 FPS"*。
- VizDoom のスループット表（Table 1, System #2）で **SampleFactory APPO = 146,551**（FPS）が報告されている。
  - → これが principles レポートで引用される **146,551 FPS** のピーク値。
- ベースライン比較: *"Sample Factory outperforms ... IMPALA implementations ... RLlib IMPALA ... SeedRL ... rlpyt PPO"* in throughput across Atari, VizDoom, DMLab。rlpyt と SeedRL が僅差で追随する構成もある。

> 注: 「100000 FPS」はタイトル・abstract の主張、「130000 FPS」は APPO の一般的到達値、「146,551 FPS」は VizDoom System #2 の表中ピーク値であり、いずれも本文/表で確認した別文脈の数値である。

## principles クラスタにおける意義（why this matters）

- 「**速さ = 必ずしも分散ではない**」という principles の重要論点を実証。単一マシンでも、(1) 環境ステップと推論のオーバーラップ（double-buffering）、(2) シリアライズ排除（共有メモリ）、(3) 非同期パイプライン化、で GPU を埋め切れば IMPALA 級のスループットが出る。
- double-buffered sampling は、principles の「**CPU 環境と GPU 推論の直列化こそがボトルネック**」（GA3C の 108ms 問題）への、最も直接的な工学的解決策。「遊ぶ GPU を埋める」原理を単一マシンで体現している。
- 共有メモリ + インデックス受け渡しは、principles の「**host-device 転送とコピー/シリアライズが隠れたコスト**」という主張の好例。

## 限界・注意点

- 環境ステップは依然 **CPU 上**であり、CPU が律速になるワークロード（重い物理シミュレーション）ではこのアーキテクチャの恩恵は頭打ちになる。これは「環境自体を GPU に乗せる」Isaac Gym / Brax / JAX 流とは異なるアプローチ。
- 非同期化に伴う policy-lag を off-policy 補正で吸収するが、ラグが大きいと安定性・サンプル効率に影響しうる。
- ピーク FPS は VizDoom など比較的軽量な環境での値で、観測が巨大／環境が重い場合は数値が大きく下がる。

## 出典（URL）

- https://arxiv.org/abs/2006.11751
- フルテキスト: https://ar5iv.labs.arxiv.org/html/2006.11751
