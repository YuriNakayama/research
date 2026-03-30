# クラスタ4: 故障検知・予知保全

## 概要

データセンター冷却系統の故障は、サーバーの過熱によるダウンタイムや機器損傷に直結するため、故障検知・予知保全（Predictive Maintenance）は運用信頼性の観点から極めて重要である。従来のしきい値ベースのアラートから、ML/DLベースの多段予測フレームワークへの移行が進んでおり、IoTセンサーフュージョン（温度、振動、電力消費、ファン回転数）を活用した包括的な異常検知が研究されている。クラウドプロバイダーの事例では、AI予知保全によりダウンタイム35%削減、年間USD 1.2Mの保守コスト削減が報告されている。2025年にはVertivがAI予知保全サービスを発表するなど、産業化も進展している。

## キーワード

`Fault Detection and Diagnosis (FDD)`, `Predictive maintenance`, `予知保全`, `Anomaly detection`, `IoT sensor fusion`, `Thermal imaging`, `Fan motor degradation`, `Coolant leak detection`, `Multi-stage predictive framework`, `Real-time alerting`

## 調査戦略

- **推奨検索クエリ**:
  - `"fault detection" "data center" cooling predictive maintenance 2024`
  - `"anomaly detection" data center thermal system machine learning`
  - `"predictive maintenance" data center HVAC cooling review`
  - `"データセンター" "予知保全" 冷却 異常検知`
  - `"data center" cooling failure prediction deep learning`
- **主要情報源**: Springer (International Journal of Advanced Manufacturing Technology), IEEE, ScienceDirect, IAEME (IJCET)
- **注目企業・組織**:
  - **Vertiv** — AI予知保全サービス（2025年発表）
  - **EkkoSense** — 自動冷却異常検知プラットフォーム
  - **RackBank** — DC運用管理ソリューション
- **推奨読解順序**:
  1. 多段予測: [Multi-stage Predictive Framework for Early Anomaly Detection in Data Center Thermal Systems (Springer, 2025)](https://link.springer.com/article/10.1007/s00170-025-17273-1)
  2. AI予知保全: [AI-Driven Predictive Maintenance in Data Centers (IJCET, 2024)](https://iaeme.com/MasterAdmin/Journal_uploads/IJCET/VOLUME_15_ISSUE_5/IJCET_15_05_002.pdf)
  3. 少数ショットFDD: [Few-shot learning framework for HVAC FDD in data centers (Applied Energy, 2025)](https://www.sciencedirect.com/science/article/pii/S0306261925017866)

## 検知対象と手法

| 検知対象 | 主要手法 | センサー |
|---------|---------|---------|
| 冷却装置の性能劣化 | 教師あり学習、時系列異常検知 | 電力消費、温度、冷媒圧力 |
| ファンモーター故障予兆 | 振動解析、ML分類 | 振動センサー、回転数 |
| 冷却水漏洩 | IoTセンサー、閾値+ML | 漏水センサー、流量計、圧力 |
| ホットスポット発生 | サーマルイメージング、CNN | 赤外線カメラ、温度センサー |
| CRAC/CRAH異常 | 統計的プロセス管理+ML | 供給/戻り温度、気流速度 |

## 性能ベンチマーク

| 指標 | 値 | 出典 |
|------|-----|------|
| ダウンタイム削減 | 35% | クラウドプロバイダー事例 |
| 年間保守コスト削減 | USD 1.2M | クラウドプロバイダー事例 |
| 早期検知の時間的余裕 | 数時間〜数日前に予兆検知 | 多段予測フレームワーク |
