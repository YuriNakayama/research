# Planet Wars 系既存事例の知見集

## このディレクトリの目的

Orbit Wars は **Planet Wars (Google AI Challenge 2010)** の直接の系譜。15 年前の優勝ノウハウが今も有効で、**Simon Lucas の研究用 RTS** や GECCO 2025 compete まで脈々と継承されている。ここでは古典と最新論文の両方を Orbit Wars 向けに整理する。

## Planet Wars 系譜図

```
2010 Google AI Challenge Planet Wars (4400 bot)
  ↓ 優勝者 Gábor Melis (Lisp)
  ↓ 解法ノウハウが研究コミュニティへ
  
2018 Simon Lucas planet-wars-rts (arXiv:1806.08544)
  ↓ MCTS vs RHEA の比較
  ↓ 1M ticks/sec の高速エンジン
  
2025 GECCO Planet Wars AI Challenge
  ↓ partial observability, fully observable の 2 mode
  
2026 Kaggle Orbit Wars ← NOW
  ↓ 連続 2D + 軌道力学 + コメット + 4P対戦
```

## 中核となる戦略的知見（4 大定理）

### 定理 1: Multi-planet Synchronized Attack（Melis 2010 の核心）

複数の自惑星から **同じ敵惑星に同時着弾** させる戦術。tie→全滅を回避しつつ、相手の garrison を最大化破壊。

### 定理 2: Sniping Awareness

「相手が中立惑星に艦を送った直後に、自分が相手を上回る艦を送る」戦術。相手の攻撃コストを無駄にできる。

### 定理 3: Ship Redistribution

戦況に応じて艦を後方から前線へ移動。Melis は明示的な線形計画で実装。

### 定理 4: Risk-Reduced Trade-Down

優勢時には「相手と艦を交換する」行動を好む。互いに 100 艦ずつ消えても、相対順位は維持。

## 収録ファイル

1. [01-melis-2010-winning-bot.md](01-melis-2010-winning-bot.md) — Melis 優勝 bot の詳細解説
2. [02-simon-lucas-rts-platform.md](02-simon-lucas-rts-platform.md) — planet-wars-rts + 1806.08544 論文
3. [03-gecco-2025-competition.md](03-gecco-2025-competition.md) — GECCO 2025 コンペ要約
4. [04-satirist-strategy-catalogue.md](04-satirist-strategy-catalogue.md) — satirist.org の戦略概念カタログ
5. [05-orbit-wars-transfer-map.md](05-orbit-wars-transfer-map.md) — Orbit Wars 向け総合転用マップ

## 優先度

**まず 01 Melis 優勝解 → 05 転用マップ** の順で読めば、Orbit Wars のルールベース実装の 80% が完成する。
