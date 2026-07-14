# Lux AI Season 3 — Imitation Learning 3rd Place Solution (adg4b)

## 基本情報

- **コンペ**: [Lux AI Season 3 (NeurIPS 2024)](https://www.kaggle.com/competitions/lux-ai-season-3)
- **順位**: 3rd place
- **著者**: adg4b
- **アプローチ**: Imitation Learning (Behavioral Cloning)
- **writeup**: https://www.kaggle.com/competitions/lux-ai-season-3/writeups/adg4b-imitation-learning-3rd-place-solution

## 要点

Lux AI Season 3 は multi-agent meta-learning 色が強い複雑な RTS だが、そこで **IL 単独で 3 位入賞**した事例。writeup 本文の直接スクレイプは reCAPTCHA により取得できていないため、Kaggle ログイン後の手動閲覧が必要（URL は上記）。

## 一般的な Lux AI IL の型（Season 1–3 共通観察）

Lux AI 系コンペで繰り返し観察されるパターン：

1. **上位 bot リプレイ収集**: Meta Kaggle Episodes API から LB 高評価 bot の対戦ログを数千〜数万件取得。
2. **観測 tensor 化**: マップを HxWxC の画像的 tensor に。典型的チャネルは「自軍ユニット」「敵ユニット」「資源」「視界」「残り時間」など。
3. **行動予測**: 各ユニットごとに "どのアクションか" を分類する multi-head CNN（U-Net 系列が多い）。
4. **学習損失**: 行動の cross-entropy（アクションマスク付き）と value head の MSE の weighted sum。
5. **推論時の工夫**: 非合法アクションをマスク、各ユニットを独立に推論して最大確率 action を採る or 相互調整する small planner。

## Orbit Wars への示唆

- Lux S3 は 24×24 のマップに対し複数ユニットを同時制御する点で Orbit Wars と類似。IL 単独で上位という事実は、**RL を走らせる前に IL baseline を作る価値**を強く示す。
- 実装コストは RL より明らかに低く、Kaggle の提出タイムアウトにも収まりやすい（1-shot forward pass で全ユニット推論）。

## TODO / Open questions

- [ ] adg4b の writeup 本文を Kaggle ログイン後に手動取得し、モデルアーキテクチャ・データ量・学習時間を確定
- [ ] 公開コードの有無を確認（GitHub リンクが writeup 内にあるか）

## 参考

- [Lux AI Season 3 overview — openreview](https://openreview.net/pdf?id=7t8kWYbOcj)
- [Lux-AI-Challenge/Lux-Design-S2 README (S2 の IL baseline 記述)](https://github.com/Lux-AI-Challenge/Lux-Design-S2)
