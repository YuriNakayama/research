# クラスタ3: 故障検知・診断 (FDD)

## 概要

HVAC システムの運用上の故障はエネルギー損失の15〜30%を占めるとされ、故障検知・診断（FDD: Fault Detection and Diagnosis）は運用効率改善の重要な研究領域である。従来のルールベース手法からデータ駆動型のML/DLベース手法への移行が進んでおり、特にCNN、オートエンコーダ、GANを用いた深層学習FDDは2018年頃から急速に発展している。標準ベンチマークデータセットでは98.45〜100%の精度/F1スコアが達成されているが、ラベル付き故障データの不足が依然として最大のボトルネックであり、少数ショット学習やGANによるデータ拡張が活発に研究されている。再現性に関する懸念も最近の重要なトピックである。

## キーワード

`Fault Detection and Diagnosis (FDD)`, `故障検知`, `異常検知`, `Deep Learning FDD`, `1D-CNN`, `Autoencoder`, `GAN data augmentation`, `Few-shot learning`, `SVM`, `Random Forest`, `Imbalanced data`, `Predictive maintenance`

## 調査戦略

- **推奨検索クエリ**:
  - `"fault detection and diagnosis" HVAC "machine learning" review 2024`
  - `"deep learning" HVAC FDD systematic review`
  - `"few-shot learning" HVAC fault diagnosis`
  - `"空調" "異常検知" "機械学習" 故障診断`
- **主要情報源**: ScienceDirect (Energy and AI, Applied Energy, Energy Informatics), MDPI Sensors/Energies, arXiv, DOE/OSTI
- **注目研究テーマ**:
  - 少数ショット学習によるデータセンターFDD
  - 不均衡データ処理（SMOTETomek、マルチスケールCNN）
  - ML-FDDの再現性問題
  - BMS（ビル管理システム）データからの特徴抽出
- **推奨読解順序**:
  1. サーベイ: [Deep learning in FDD of building HVAC: systematic review (2023)](https://www.sciencedirect.com/science/article/pii/S2666546823000071)
  2. 体系的レビュー: [AI in HVAC FDD: systematic review (2024)](https://www.sciencedirect.com/science/article/pii/S277297022400004X)
  3. 再現性: [Reproducibility of ML-Based FDD for HVAC (2025)](https://arxiv.org/html/2508.00880)
  4. 少数ショット: [Few-shot learning for HVAC FDD in data centers (2025)](https://www.sciencedirect.com/science/article/pii/S0306261925017866)

## 主要手法の比較

| 手法カテゴリ | 代表的手法 | 長所 | 短所 |
|------------|-----------|------|------|
| 教師あり学習 | SVM, Decision Tree, RF | 解釈性が高い、少量データで動作 | ラベル付きデータ必要 |
| 深層学習 | 1D-CNN, AE, LSTM | 高精度、自動特徴抽出 | 大量データ必要、ブラックボックス |
| 生成モデル | GAN | データ拡張で希少故障に対応 | 学習不安定、モード崩壊リスク |
| 少数ショット学習 | Siamese Network, Prototypical | 少量ラベルで動作 | 精度は教師あり学習に劣る場合あり |

## 主要課題

| 課題 | 説明 |
|------|------|
| ラベル付き故障データの不足 | 実運用環境での故障データ収集は困難かつ高コスト |
| 再現性 | 異なる研究・データセット間での結果の再現性に懸念 |
| 汎化性能 | ある建物で学習したモデルが他の建物で適用困難 |
| リアルタイム性 | BMSとの統合と低遅延推論の両立 |
