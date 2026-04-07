# クラスタ5: 液冷技術・浸漬冷却

## 概要

AIワークロードの高密度化（GPU 1000W/チップ、ラック20-100kW超）により、従来の空冷では対応困難な熱密度が常態化し、液冷技術への移行が急速に進んでいる。特許出願分析によれば、DC冷却特許における液冷の構成比は2000年代の24%から2023年には84%に達している。主要技術は直接液冷（DLC: コールドプレート方式）、単相浸漬冷却、二相浸漬冷却の3カテゴリに分類される。二相浸漬冷却ではPUE 1.08以下が達成可能であり、空冷比で設置面積を1/3に削減できる。日本ではNTTデータが冷却エネルギー最大97%削減の実証を報告し、NTTファシリティーズが液冷検証施設を構築している。エッジDCでは20-30kW/ラック以上で液冷が必須となる。

## キーワード

`Direct Liquid Cooling (DLC)`, `直接液冷`, `Single-phase immersion cooling`, `Two-phase immersion cooling`, `二相浸漬冷却`, `Coolant Distribution Unit (CDU)`, `Rear-door heat exchanger`, `Direct-to-silicon cooling`, `Dielectric fluid`, `Hybrid air/liquid cooling`, `Edge data center cooling`, `Manifold microjet impingement`, `Cold plate`

## 調査戦略

- **推奨検索クエリ**:
  - `"liquid cooling" "data center" review challenges 2024 2025`
  - `"immersion cooling" data center two-phase technology`
  - `"direct liquid cooling" data center cold plate patent`
  - `"液冷" "データセンター" 浸漬冷却 技術 2024`
  - `"edge data center" cooling thermal management liquid`
  - `"direct-to-silicon" cooling TSMC data center`
- **主要情報源**: ScienceDirect (Applied Thermal Engineering), Tsinghua Open, California Energy Commission, MDPI Energies
- **注目企業・組織**:
  - **TSMC** — Direct-to-silicon冷却技術
  - **Microsoft** — ゼロウォーター冷却DC
  - **Liquid Cooling Coalition** (Intel, Shell, Vertiv, Supermicro)
  - **Delta Electronics** — 二相浸漬冷却（ホットスワップ対応特許）
  - **Accelsius** — NeuCool（1500W/チップ対応二相DLC）
  - **LiquidStack** — 二相浸漬冷却（エッジ/5G対応）
  - **Submer** — 浸漬冷却ソリューション
  - **NTTデータ** — 液浸冷却実証（97%省エネ）
  - **NTTファシリティーズ** — 液冷検証施設（Products Engineering Hub）
  - **Valeo** — エッジDC向け浸漬冷却
- **推奨読解順序**:
  1. 必要性と課題: [Liquid Cooling of Data Centers: A Necessity Facing Challenges (Applied Thermal Engineering, 2024)](https://www.sciencedirect.com/science/article/abs/pii/S1359431124007804)
  2. 採用加速: [Accelerating Liquid Cooling Adoption: Necessity, Challenges and Solutions (Tsinghua, 2025)](https://www.sciopen.com/article/10.26599/TRCN.2025.9550014)
  3. 特許分析: [Analysis of Cooling Technologies Based on Patent Applications (MDPI Energies, 2024)](https://www.mdpi.com/1996-1073/17/15/3615)
  4. 低コスト実証: [Demonstration of Low-Cost Data Center Liquid Cooling (California Energy Commission, 2024)](https://www.energy.ca.gov/sites/default/files/2024-06/CEC-500-2024-061.pdf)

## 液冷方式の比較

| 方式 | 熱除去能力 | PUE | 設置面積 | 成熟度 | コスト |
|------|-----------|-----|---------|--------|-------|
| 空冷（従来） | 低（~15kW/ラック） | 1.3-1.6 | 大 | 高 | 低 |
| 直接液冷 (DLC) | 中〜高 | 1.1-1.2 | 中 | 中〜高 | 中 |
| 単相浸漬 | 高 | 1.02-1.1 | 小（1/3） | 中 | 高 |
| 二相浸漬 | 最高 | <1.08 | 小（1/3） | 中（成長中） | 高 |
| Direct-to-silicon | 最高 | — | — | 低（研究段階） | — |

## 市場規模

| セグメント | 2024年 | 予測 | CAGR |
|-----------|--------|------|------|
| DC冷却市場全体 | USD 18.4B | USD 49.9B (2034) | 10.2% |
| 浸漬冷却市場 | USD 293.77M | USD 1.49B (2031) | 22.5% |
| 二相浸漬冷却 | — | USD 1.61B (2034) | 15.9% |
| 液冷の特許構成比 | 84% | — | — |

## 主要特許

| 特許番号 | 概要 | 出願者 |
|---------|------|--------|
| US12534657B2 | 二相浸漬冷却システム | — |
| US20250024638 (2025出願) | 二相浸漬冷却システム | — |
| US8,806,749 (2014) | 受動的脱イオン二相水ベース浸漬冷却 | — |
| (Delta特許) | 密閉二相浸漬環境でのホットスワップ機構 | Delta Electronics |
| (Accelsius特許) | NeuCool 二相DLC（1500W/チップ超） | Accelsius |
| (NVIDIA特許, 2024) | エネルギー効率液冷システム | NVIDIA |
