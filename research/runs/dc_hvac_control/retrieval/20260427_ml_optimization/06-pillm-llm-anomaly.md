# 06. PILLM: Physics-Informed LLM for HVAC Anomaly Detection

## 書誌情報

| 項目 | 内容 |
|------|------|
| タイトル | Physics-Informed Large Language Models for HVAC Anomaly Detection with Autonomous Rule Generation |
| 著者 | Subin Lin (NUS), Chuanbo Hua (InnoCore PRISM-AI / KAIST) |
| 出版年 | 2025（arXiv） |
| arXiv | 2510.17146 |
| URL | https://arxiv.org/html/2510.17146v1 |

## 研究の位置付け

LLM の世界知識と進化的最適化を組み合わせ、**HVAC 異常検知ルールを自律生成**するフレームワーク。物理情報をプロンプトと演算子に埋め込むことで、検出精度と物理的妥当性のバランスを取る。「LLM × 制御工学」の融合事例として注目すべき。

## 手法

| コンポーネント | 役割 |
|--------------|------|
| **Physics-Informed Reflection (PIR)** | LLM がルールの性能を分析する際、特徴量の物理的意味（温度動力学、気流制御など）を考慮 |
| **Physics-Informed Crossover (PIC)** | ルール統合時に HVAC の因果関係を尊重（任意のコード結合ではなく） |
| **進化ループ** | 初期ルール集団 → reflection → crossover → エリートルールの mutation |

- 使用 LLM: Gemini 2.5 Flash
- データセット: LBNL Automated Fault Detection データセット（暖房コイル漏れ、ダンパ固着、センサドリフト等）

## 主要な結果

| 手法 | Precision | Recall | F1 |
|------|-----------|--------|-----|
| **PILLM** | **0.968** | 0.859 | **0.926** |
| ARGOS | 0.921 | **0.885** | 0.902 |
| LSTMAD | 0.861 | 0.781 | 0.818 |

**評価**: Event-F1 with Point Adjustment（異常イベント単位の評価）

## 意義

- LLM を **生成器（ルール作成）+ 評価器（reflection）** として両用する設計。
- 物理情報の埋め込みにより、ブラックボックス LLM 出力を**物理的に解釈可能なルール**に変換。
- 商業ビル運用において、保守エンジニアが理解できる診断ルールを自動生成する道筋を示す。

## 限界

- **単一データセット評価**: LBNL 公開データのみ。他建物への汎化未検証。
- **リアルタイム性**: 大規模スマートインフラでのリアルタイム検出はフューチャーワーク扱い。
- **LLM 依存性**: コスト・レイテンシは未開示。Gemini 2.5 Flash のバージョン依存。
- **進化的最適化のコスト**: ルール集団の進化に必要な LLM 呼び出し回数は要確認。

## 関連事例

- [05](./05-hvac-dpt-transformer.md): トランスフォーマーの HVAC 制御応用
- 既存 [03-fault-detection-diagnosis.md](../20260330_general/03-fault-detection-diagnosis.md): FDD 全般のレビュー
