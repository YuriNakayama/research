# クラスタ1: モデル予測制御 (MPC)

## 概要

モデル予測制御（MPC）は、建物の熱力学モデルと将来の外乱予測（天候、在室者数等）を用いて最適な制御入力を計算する手法であり、HVAC制御の高度手法として最も成熟している。サーベイ論文によれば、高度制御手法に関する研究の約40%がMPCを対象としている。ホワイトボックス（物理ベース）、グレーボックス（ハイブリッド）、ブラックボックス（データ駆動）の3つのモデリングアプローチが存在し、近年はニューラルネットワークを代理モデルとして用いたMPCが注目されている。実環境での評価では、ルールベース制御と比較して17.6%のエネルギー削減、49.7%のピーク負荷削減が報告されている。

## キーワード

`Model Predictive Control (MPC)`, `モデル予測制御`, `White-box modeling`, `Grey-box modeling`, `Black-box modeling`, `Cost function optimization`, `Prediction horizon`, `Multi-zone MPC`, `Stochastic MPC`, `EnergyPlus co-simulation`, `Surrogate model`, `RBFNN (Radial Basis Function Neural Network)`

## 調査戦略

- **推奨検索クエリ**:
  - `"model predictive control" HVAC survey 2024 2025`
  - `"MPC" building energy optimization review`
  - `"data-driven MPC" HVAC control`
  - `"空調" "モデル予測制御" 最適化`
- **主要情報源**: ScienceDirect (Building and Environment, Energy and Buildings, Journal of Building Engineering), IEEE Xplore, MDPI Energies
- **注目研究グループ・企業**:
  - Johnson Controls（マルチレベルMPC特許: US20210034024A1）
  - Honeywell（スマートサーモスタットMPC特許: US10146237B2）
  - ETH Zurich（建物エネルギーシステムMPC研究）
- **推奨読解順序**:
  1. サーベイ論文: [Model predictive control of HVAC systems: A state-of-the-art review (2022)](https://www.sciencedirect.com/science/article/abs/pii/S2352710222010750)
  2. 手法比較: [State of the art review on MPC in HVAC field (2021)](https://www.sciencedirect.com/science/article/abs/pii/S0360132321003565)
  3. 最新動向: [Optimizing HVAC with MPC: ontology-based semantic models (2025)](https://www.frontiersin.org/journals/energy-research/articles/10.3389/fenrg.2025.1542107/full)
  4. ML統合: [ML-based MPC via Ensemble Learning - ACM BuildSys 2024](https://dl.acm.org/doi/10.1145/3671127.3698705)

## 主要特許

| 特許番号 | タイトル概要 | 出願者 |
|---------|------------|--------|
| US20210034024A1 | マルチレベルMPCによるビルHVACシステム | Johnson Controls |
| US11067955B2 | 分散低レベル空調最適化を用いたMPC | Johnson Controls |
| US10146237B2 | MPCを備えたスマートサーモスタット | Honeywell |
| US20180334012A1 | 予測制御による効率的HVAC運転 | — |

## 性能ベンチマーク

| 指標 | 値 | 比較対象 |
|------|-----|---------|
| ピーク負荷削減 | 49.7% | ルールベース制御 |
| エネルギー削減 | 17.6% | ルールベース制御 |
| エネルギー削減 (RBFNN+MPC) | ~15% | 従来制御 |
