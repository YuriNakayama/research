# クラスタ2: モデル予測制御 (MPC) ・予測分析

## 概要

モデル予測制御（MPC）は、データセンターの冷却系統（チラー、CRAC/CRAH、冷却塔）を対象に、建物熱モデルや負荷予測に基づく最適制御入力を計算する手法である。DC冷却においては、IT負荷の変動予測、外気温度・湿度予測を組み合わせたマルチチラー協調最適化が主要な研究テーマとなっている。近年はLSTMなどの時系列予測モデルをMPCに統合するデータ駆動型アプローチ、AI駆動型予測制御フレームワーク（IoTセンサーデータ＋MLモデル＋RLエージェント）が注目されている。実環境での評価では冷却エネルギー15-25%削減が報告されており、RL手法と比較して成熟度が高く、産業展開も進んでいる。

## キーワード

`Model Predictive Control (MPC)`, `Data-driven MPC`, `LSTM forecasting`, `Multi-chiller optimization`, `CRAC/CRAH control`, `Cold aisle containment`, `Supply air temperature optimization`, `Neural network surrogate model`, `AI-driven predictive control`, `IoT sensor integration`

## 調査戦略

- **推奨検索クエリ**:
  - `"model predictive control" "data center" cooling optimization 2024`
  - `"data-driven MPC" data center HVAC energy efficiency`
  - `"predictive control" data center chiller CRAC review`
  - `"データセンター" "予測制御" 空調 最適化`
  - `"LSTM" data center cooling load prediction`
- **主要情報源**: ScienceDirect (Energy and Buildings, Applied Thermal Engineering), IEEE Xplore, Frontiers in Energy Research, HPT Magazine
- **注目研究グループ・企業**:
  - University of Toronto — データ駆動型MPC
  - HPT (Heat Pumping Technologies) — AI駆動型予測制御フレームワーク
- **推奨読解順序**:
  1. マルチチラー最適化: [MPC for Multi-Chiller System Considering Whole System Energy Conservation (Energy & Buildings, 2024)](https://www.sciencedirect.com/science/article/abs/pii/S0378778824010351)
  2. AI駆動予測制御: [AI-Driven Predictive Control for Data Center HVAC Systems (HPT, 2025)](https://heatpumpingtechnologies.org/articles/heat-pumping-technologies-magazine-vol-43-no-3-2025/ai-driven-predictive-control-for-data-center-hvac-systems/)
  3. オントロジーベースMPC: [Optimizing HVAC with MPC: Integrating Ontology-Based Semantic Models (Frontiers, 2025)](https://www.frontiersin.org/journals/energy-research/articles/10.3389/fenrg.2025.1542107/full)
  4. データ駆動MPC: [Data-based MPC for Enhancing Energy Efficiency in Air-Cooled Datacenter (IEEE, 2024)](https://ieeexplore.ieee.org/document/10916430/)

## MPCとRLの比較

| 観点 | MPC | RL |
|------|-----|-----|
| モデル要件 | 明示的モデル必要 | モデルフリー可能 |
| 安全性保証 | 制約として明示的に組込み | 報酬設計に依存 |
| 計算コスト | 最適化問題の繰返し求解 | 推論は高速（学習は高コスト） |
| 適応性 | モデル更新が必要 | 継続学習が可能 |
| 成熟度 | 高い（産業展開多数） | 中〜高（商用展開増加中） |
| 典型的省エネ効果 | 15-25% | 12-40% |

## 性能ベンチマーク

| 指標 | 値 | 出典 |
|------|-----|------|
| 冷却供給量削減 | 8.73% | IEEE (2024) |
| 供給ファンエネルギー削減 | 20% | HPT (2025) |
| 冷却エネルギー削減（一般） | 15-25% | 複数研究 |
