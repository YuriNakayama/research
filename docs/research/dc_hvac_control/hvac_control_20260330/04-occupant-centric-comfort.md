# クラスタ4: 快適性中心制御・在室者適応

## 概要

従来のHVAC制御が設定温度の維持やエネルギー効率を主目的としていたのに対し、快適性中心制御（Occupant-Centric Control）は在室者の熱的快適性を最優先の制御目標とする。ASHRAE 55のPMV-PPDモデルに基づく従来型手法に加え、個人差を考慮したパーソナル快適性モデルや、IoTセンサー・クラウドセンシングによるリアルタイムフィードバック手法が発展している。40年にわたる研究は「全員を快適にするには、在室者自身が環境をコントロールできる必要がある」という結論に集約されつつあり、AIによる個人適応型制御が新たなフロンティアとなっている。

## キーワード

`Occupant-Centric Control`, `快適性制御`, `PMV-PPD model`, `ASHRAE 55`, `Personal comfort model`, `Thermal comfort`, `Occupancy detection`, `Crowdsensing`, `Indoor Air Quality (IAQ)`, `Adaptive comfort model`

## 調査戦略

- **推奨検索クエリ**:
  - `"occupant-centric" HVAC control thermal comfort survey`
  - `"personal comfort model" machine learning building`
  - `"occupancy detection" HVAC energy savings review`
  - `"室内環境" "快適性" "AI" "空調制御"`
  - `"thermal comfort" "deep learning" prediction 2024 2025`
- **主要情報源**: ScienceDirect (Applied Energy, Building and Environment), Frontiers in Built Environment, MDPI Applied Sciences, PMC/Sensors
- **注目研究グループ・機関**:
  - UC Berkeley Center for the Built Environment (CBE) — 快適性研究の中核
  - IBPSA (International Building Performance Simulation Association)
- **推奨読解順序**:
  1. エネルギーと快適性の両立: [HVAC energy savings, thermal comfort and air quality for occupant-centric control (2022)](https://www.sciencedirect.com/science/article/pii/S0306261921012903)
  2. IoT統合: [Enhancing Occupant Comfort in IoT-Based Spaces (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10934038/)
  3. サーベイ: [Comprehensive Survey about Thermal Comfort under IoT Paradigm (2020)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7472355/)
  4. 転移学習: [Developing Thermal Comfort Models with Transfer Learning (IBPSA ASim 2024)](https://publications.ibpsa.org/conference/paper/?id=asim2024_1329)
  5. 包括レビュー: [Intelligent HVAC Control: Advanced Techniques and AI Applications (2025)](https://www.mdpi.com/2076-3417/16/4/2006)

## 制御パラダイムの比較

| アプローチ | 制御対象 | 個人差対応 | データ要件 |
|-----------|---------|-----------|-----------|
| PMV-PPDベース | 環境パラメータ (温度、湿度等) | 低い（平均的人体モデル） | 低い |
| 適応型快適性モデル | 環境 + 行動 | 中程度（地域・季節適応） | 中程度 |
| パーソナル快適性モデル | 個人の生理・嗜好 | 高い | 高い（個人データ必要） |
| クラウドセンシング | リアルタイムフィードバック | 高い | 継続的データ収集 |

## 主要知見

| 知見 | 出典 |
|------|------|
| 在室者ベース制御で80%以上の満足度を維持可能 | Applied Energy (2022) |
| 全員を快適にするには在室者自身の環境コントロールが必要 | 40年間の文献総括 |
| DRLでエネルギー・快適性・IAQの同時最適化が可能 | Applied Energy (2024) |
