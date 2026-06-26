# GPUDrive: データ駆動・マルチエージェント運転シミュレーション（100万 FPS）

> 原題: *GPUDrive: Data-driven, multi-agent driving simulation at 1 million FPS*

## 基本情報

| 項目 | 内容 |
|------|------|
| 著者 | Saman Kazemkhani, Aarav Pandya, Daphne Cornelisse, Brennan Shacklett, Eugene Vinitsky |
| arXiv | [2408.01584](https://arxiv.org/abs/2408.01584) |
| 査読発表 | ICLR 2025（comments: "ICLR 2025 camera-ready version"） |
| 公式 | https://github.com/Emerge-Lab/gpudrive |
| 基盤 | Madrona Game Engine（本クラスタ 05）上に構築 |

## 課題・背景

マルチエージェント学習はゲームでは超人的成果を上げたが、実運用のマルチエージェントプランナ設計への影響は限定的。abstract いわく「they require billions of steps of experience（数十億ステップの経験を要する）」のがボトルネック。GPUDrive は**大規模なマルチエージェント計画研究を可能にする**ための高速運転シミュレータ。

## 提案手法・コア機構

abstract VERBATIM:
> "GPUDrive is a GPU-accelerated, multi-agent simulator built on top of the Madrona Game Engine capable of generating over a million simulation steps per second."

- **Madrona 上の GPU 常駐シミュレータ**: 観測・報酬・ダイナミクス関数を「written directly in C++」で書き、「lowered to high-performance CUDA（高性能 CUDA に lower される）」。異種・複雑なエージェント挙動を低レベル最適化しつつ GPU 上で実行。
- **Python から完全アクセス可能**: 「fully accessible through Python, offering a seamless and efficient workflow for multi-agent, closed-loop simulation」。低レベル最適化を保ったまま Python ワークフローを提供。
- **実データ駆動**: Waymo Open Motion Dataset でエージェントを学習（「train reinforcement learning agents on the Waymo Open Motion Dataset」）。
- closed-loop マルチエージェント運転シナリオに特化。

## 主要な定量結果（VERBATIM 引用 + 条件明記）

abstract VERBATIM:
> "capable of generating over a million simulation steps per second"（タイトルでは "1 million FPS"）

> "achieving efficient goal-reaching in minutes and scaling to thousands of scenarios in hours"（数分で目標到達、数時間で数千シナリオにスケール）

| 主張 | 数値（VERBATIM） | 条件 |
|------|-----------------|------|
| シミュレーションスループット | "over a million simulation steps per second" / "1 million FPS" | GPU 上（abstract に具体 GPU 機種の明記なし） |
| 学習効率 | goal-reaching を "in minutes"、数千シナリオを "in hours" | Waymo Open Motion Dataset |

> 注: 本文・付随資料ではピーク約 2.3M ASPS（agent steps per second）、RTX 4080 / A100 等の値が示されるが、**これらは abstract VERBATIM ではない**ため出典区分を明示。「1M FPS」がタイトル・abstract の保証値。

## pytorch_native クラスタにおける位置づけ

**②物理 GPU 常駐化系統**の応用例（ドメイン特化）。Madrona engine（05）の上に運転ドメインを実装し、観測・報酬・ダイナミクスを C++→CUDA で GPU 常駐化。CPU 転送を排除しつつ Python から使えるため、PyTorch トレーナと直結して 100万 FPS 級のマルチエージェント RL を回せる。Madrona が「汎用エンジン」、GPUDrive が「その上の実用ドメイン」という関係。

## 限界・注意点

- 「1M FPS」は GPU 上の値だが abstract に GPU 機種の明示がない（本文の 2.3M ASPS は RTX 4080/A100 条件）。
- 運転（Waymo）ドメインに特化。観測/報酬/ダイナミクスを C++ で記述する必要があり、任意環境への一般化は Madrona 同様にコストがかかる。
- マルチエージェント数や観測次元によってスループットは変動する。

## 出典

- arXiv abstract: https://arxiv.org/abs/2408.01584（ICLR 2025 camera-ready）
- リポジトリ: https://github.com/Emerge-Lab/gpudrive
